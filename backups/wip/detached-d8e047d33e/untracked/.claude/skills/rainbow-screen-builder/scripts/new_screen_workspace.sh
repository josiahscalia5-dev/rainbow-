#!/usr/bin/env bash
# Rainbow Screen Builder — set up the isolated workspace for ONE playable screen (thin wrapper: git worktree + the screen's own
# setup tool + analyze_reference.py; it never copies another screen's level).
#
#   bash new_screen_workspace.sh NN --round R [--roles "visual swim camera qa"] [--base REV] [--wt-root /home/user/wt]
#        [--ws /tmp/rainbow_rR/sNN] [--from <code tree>] [--user-ok <file with the user's verbatim OK>] [--no-worktrees] [--no-game]
#        [--dry-run]
#
# 1. GATES (screens.json): 01 / 02 / 03 / 11 are the user's Google Flow videos -> refused. A screen whose gate is not "open" is refused
#    unless --user-ok names an existing file that records the user's approval to start it (never start the next screen or batch
#    before the user approves the previous one).
# 2. WORKTREES (one per role, LOCAL branches claude/rainbow-sNN-<role>-c<R>): `git worktree add --no-checkout`, cone sparse checkout
#    of the screen's dirs, then the files are read in with GIT_LFS_SKIP_SMUDGE=1 (LFS binaries such as benny31.glb stay pointers in
#    the worktrees; the game folders link them from the asset repo = the main checkout). Existing worktrees are left untouched.
# 3. WORKSPACE <ws>: analysis/ (analyze_reference.py json + overlay to CHECK BY EYE), runs/, compare/, and — when the screen has a
#    setup tool in screens.json — <ws>/kit + <ws>/game built from --from (default: the repo this skill lives in).
# 4. RENDER LOCK: every headless-Chromium render goes through tools/kit05/render_slot.sh (2 slots for the whole machine).
# Env: RAINBOW_REPO (repo to add worktrees to; default = the repo containing this skill), RAINBOW_ASSET_REPO (LFS binaries;
# default = the repo's main worktree).
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd); SKILL=$(dirname "$HERE")
REPO=${RAINBOW_REPO:-$(cd "$SKILL/../../.." && pwd)}
ASSET_REPO=${RAINBOW_ASSET_REPO:-$(git -C "$REPO" worktree list --porcelain | sed -n '1s/^worktree //p')}
NN=${1:?usage: new_screen_workspace.sh NN --round R [...]}; shift
ROUND=""; ROLES="visual swim camera qa"; BASE=HEAD; WTROOT=/home/user/wt; WS=""; FROM=""; USEROK=""; DO_WT=1; DO_GAME=1; DRY=0
while [ $# -gt 0 ]; do case "$1" in
  --round) ROUND=$2; shift 2;; --roles) ROLES=$2; shift 2;; --base) BASE=$2; shift 2;; --wt-root) WTROOT=$2; shift 2;;
  --ws) WS=$2; shift 2;; --from) FROM=$2; shift 2;; --user-ok) USEROK=$2; shift 2;; --no-worktrees) DO_WT=0; shift;;
  --no-game) DO_GAME=0; shift;; --dry-run) DRY=1; shift;; *) echo "unknown option $1"; exit 2;; esac; done
[ -n "$ROUND" ] || { echo "--round R is required (branch names end in -c<R>)"; exit 2; }
WS=${WS:-/tmp/rainbow_r$ROUND/s$NN}; FROM=${FROM:-$(cd "$SKILL/../../.." && pwd)}
run() { echo "+ $*"; [ "$DRY" = 1 ] || "$@"; }

# ---- screen settings + gates
eval "$(python3 -I - "$SKILL/screens.json" "$NN" <<'PY'
import json, sys, shlex
c = json.load(open(sys.argv[1])); s = c['screens'].get(sys.argv[2])
if s is None: print('KIND=unknown'); raise SystemExit
w = s.get('workspace', {}); bt = [b for b in c.get('batches_after_05', []) if sys.argv[2] in b]
for k, v in {'KIND': s['kind'], 'GATE': s['gate'], 'REF': s['reference'], 'TITLE': s['title'], 'SETUP': w.get('setup', ''),
             'SPARSE': ' '.join(w.get('sparse_dirs', ['.claude', 'scripts', 'tools', 'references', 'docs/briefs'])),
             'BATCH': ' + '.join(bt[0]) if bt else '', 'NOTE': s.get('note', '')}.items():
    print(f'{k}={shlex.quote(v)}')
PY
)"
case "$KIND" in
  unknown) echo "REFUSED: no screen '$NN' in screens.json (playable screens: 04-10)"; exit 3;;
  video) echo "REFUSED: Screen $NN = $NOTE. Screens 01, 02, 03, 11 are the user's Google Flow videos — never 3D levels."; exit 3;;
esac
if [ "$GATE" != "open" ]; then
  if [ -z "$USEROK" ] || [ ! -f "$USEROK" ]; then
    echo "REFUSED: Screen $NN ($TITLE) is gated ('$GATE'). The user must approve Screen 05 (and the previous batch) first."
    echo "         After the user's OK, re-run with --user-ok <file recording the user's verbatim approval> and set its gate in screens.json."
    exit 4
  fi
  echo "gate: Screen $NN started on the user's approval recorded in $USEROK"
fi
echo "Screen $NN — $TITLE  (reference $REF)${BATCH:+  batch: $BATCH}"
[ -f "$REPO/$REF" ] || [ -f "$FROM/$REF" ] || { echo "reference $REF missing"; exit 5; }
REFP=$FROM/$REF; [ -f "$REFP" ] || REFP=$REPO/$REF

# ---- worktrees (isolated, sparse, LFS smudge skipped)
if [ "$DO_WT" = 1 ]; then
  for role in $ROLES; do
    P=$WTROOT/s$NN-$role; BR=claude/rainbow-s$NN-$role-c$ROUND
    if [ -e "$P" ]; then echo "worktree $P exists — left untouched"; continue; fi
    run git -C "$REPO" worktree add --no-checkout -b "$BR" "$P" "$BASE"
    run git -C "$P" sparse-checkout set --cone $SPARSE
    run env GIT_LFS_SKIP_SMUDGE=1 git -C "$P" read-tree -mu HEAD
    echo "  $role: $P  (branch $BR, LOCAL — the specialist never commits or pushes; the five-minute autosave snapshots it)"
  done
fi

# ---- workspace: analysis (estimates to confirm by eye) + the game folder
run mkdir -p "$WS/analysis" "$WS/runs" "$WS/compare" /tmp/rainbow_r34/locks
run python3 -I "$HERE/analyze_reference.py" "$REFP" "$WS/analysis/analysis.json" --overlay "$WS/analysis/overlay.jpg"
if [ "$DO_GAME" = 1 ]; then
  if [ -n "$SETUP" ]; then
    [ -f "$FROM/$SETUP" ] || { echo "setup tool $FROM/$SETUP missing (sparse checkout without tools/?)"; exit 5; }
    run bash "$FROM/$SETUP" "$WS" "$ASSET_REPO"
  else
    echo "NO LEVEL TOOLS for Screen $NN yet: step 4 of SKILL.md — parametrise the proven tools for this screen (its own fitted"
    echo "geometry + its own pixels), never copy Screen 05's tunnel. Nothing built."
  fi
fi
cat <<EOF
--- workspace ready: $WS
  analysis : $WS/analysis/analysis.json  +  overlay.jpg (CHECK the HUD band, vanishing point, rings, Benny box, coins by eye)
  game     : $WS/game  (code from $FROM; LFS binaries from $ASSET_REPO)
  renders  : bash $FROM/tools/kit05/render_slot.sh <cmd>   (RENDER_SLOT=2 for whole-level runs)
  start    : bash $HERE/acceptance.sh $WS/game $WS/runs/start --start --screen $NN
  short    : bash $HERE/acceptance.sh $WS/game $WS/runs/short1 --short 3 --screen $NN
  compare  : python3 -I $HERE/compare_to_approved.py screen:$NN $WS/runs/start/f_0000.jpg --out $WS/compare/start
EOF

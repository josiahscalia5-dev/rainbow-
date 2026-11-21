#!/usr/bin/env bash
# setup_worker.sh <slug e.g. s04-ringtex> <worktree path>
# Round 20 (new session 2026-11-19 ~23:25 UTC): newest -c20 tip (= preview v3 09459079, no commits) -> new -c21 branch + sparse worktree,
# restore the r19b WIP snapshot (backups/wip/<slug>-c20/, saved 21:52 UTC; the r19b workers stopped ~20:56 at the 5-hour usage limit), push.
set -euo pipefail
X="$1"; WT="$2"
R=/home/user/rainbow-
L=0bd0ab5b7e02475afa73d59bd60388759cd31477   # r19 lead ccr-d00ac5ec-gabdsh save 21:52 UTC (holds backups/wip/*-c20; the 23:17 save only refreshed INFO timestamps)
BOLD="claude/rainbow-$X-c20"; BNEW="claude/rainbow-$X-c21"; SLUG="claude__rainbow-$X-c20"
cd "$R"
git fetch --depth=50 origin "+$BOLD:refs/remotes/origin/$BOLD" >/dev/null 2>&1
TIP=$(git rev-parse "refs/remotes/origin/$BOLD")
WIPHEAD=$(git show "$L:backups/wip/$SLUG/INFO.json" | python3 -c "import json,sys;print(json.load(sys.stdin)['head'])")
[ "$TIP" = "$WIPHEAD" ] || { echo "$X: tip $TIP != WIP head $WIPHEAD - STOP"; exit 3; }
exec 9>"$R/backups/.autosave.lock"; flock 9
git worktree add --no-checkout -b "$BNEW" "$WT" "$TIP" >/dev/null 2>&1
printf '/*\n!/qa/pilot05/\n!/qa/worldlabs/\n!/qa/imageblaster/\n!/builds/\n!/backups/\n' | git -C "$WT" sparse-checkout set --no-cone --stdin
git -C "$WT" read-tree -mu HEAD
ln -sfn "$R/node_modules" "$WT/node_modules"
if git cat-file -e "$L:backups/wip/$SLUG/tracked.patch" 2>/dev/null; then
  git show "$L:backups/wip/$SLUG/tracked.patch" > "$WT/.wip_tracked.patch"
  if [ -s "$WT/.wip_tracked.patch" ]; then git -C "$WT" apply --binary .wip_tracked.patch; fi
  rm -f "$WT/.wip_tracked.patch"
fi
n=0
while IFS= read -r f; do
  rel="${f#backups/wip/$SLUG/untracked/}"
  mkdir -p "$WT/$(dirname "$rel")"
  git show "$L:$f" > "$WT/$rel"; n=$((n+1))
done < <(git ls-tree -r --name-only "$L" "backups/wip/$SLUG/untracked/")
flock -u 9; exec 9>&-
echo "$X: worktree $WT on $BNEW (sparse), WIP restored: $(git -C "$WT" status --short | grep -c '^ M' || true) modified, $n untracked files"
git -C "$WT" push -u origin "$BNEW" >/dev/null 2>&1 && echo "$X: pushed $BNEW = ${TIP:0:8} ($(git ls-remote origin refs/heads/$BNEW | cut -c1-8))"
du -sh "$WT" | cut -f1 | sed "s/^/$X: size /"
echo "$X: READY"

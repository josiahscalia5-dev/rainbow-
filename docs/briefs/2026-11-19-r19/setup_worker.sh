#!/usr/bin/env bash
# setup_worker.sh <slug e.g. s04-ringtex> <worktree path>
# Round 19 (new account 2026-11-19 ~19:10 UTC): newest -c18 tip -> new -c19 branch + sparse worktree,
# restore the last r18 WIP snapshot (backups/wip/<slug>-c18/, saved 18:56/19:05 UTC; the r18 workers stopped 18:54-18:55 at the usage limit), push.
set -euo pipefail
X="$1"; WT="$2"
R=/home/user/rainbow-
L=74839a0b4f877d68db28720f73fea5b969f7cf27   # r18 lead ccr-ae71d3a5-80naq2 save 18:56 UTC (holds backups/wip/*-c18; the 19:04 save only refreshed INFO timestamps)
BOLD="claude/rainbow-$X-c18"; BNEW="claude/rainbow-$X-c19"; SLUG="claude__rainbow-$X-c18"
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

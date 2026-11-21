#!/usr/bin/env bash
# setup_worker.sh <slug e.g. s04-ringtex> <worktree path>
# Round 17 (account 17): newest -c16 tip -> new -c17 branch + sparse worktree, restore the account-16 20:14 UTC WIP snapshot, push.
set -euo pipefail
X="$1"; WT="$2"
R=/home/user/rainbow-
L=origin/ccr-e42bb3c0-jpif8d
BOLD="claude/rainbow-$X-c16"; BNEW="claude/rainbow-$X-c17"; SLUG="claude__rainbow-$X-c16"
cd "$R"
t0=$(date +%s)
if ! git rev-parse -q --verify "refs/remotes/origin/$BOLD" >/dev/null; then
  git fetch --depth=1 origin "+$BOLD:refs/remotes/origin/$BOLD" >/dev/null 2>&1
fi
TIP=$(git rev-parse "refs/remotes/origin/$BOLD")
WIPHEAD=$(git show "$L:backups/wip/$SLUG/INFO.json" | python3 -c "import json,sys;print(json.load(sys.stdin)['head'])")
[ "$TIP" = "$WIPHEAD" ] || { echo "$X: tip $TIP != WIP head $WIPHEAD - STOP"; exit 3; }
echo "$X: fetched tip ${TIP:0:8} in $(( $(date +%s)-t0 ))s"
# Hold the autosave lock while the worktree is half-built: on 2026-11-18 19:15 the daemon snapshotted an empty new worktree
# and wrote a 4.25 GB "all files deleted" tracked.patch into backups/wip/ (removed by hand). The daemon skips while we hold it.
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
echo "$X: worktree $WT on $BNEW (sparse), WIP restored: $(git -C "$WT" status --short | grep -c '^ M') modified, $n untracked files"
git -C "$WT" push -u origin "$BNEW" >/dev/null 2>&1 && echo "$X: pushed $BNEW = ${TIP:0:8} ($(git ls-remote origin refs/heads/$BNEW | cut -c1-8))"
du -sh "$WT" | cut -f1 | sed "s/^/$X: size /"
echo "$X: READY"

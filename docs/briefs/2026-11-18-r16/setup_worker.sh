#!/usr/bin/env bash
# setup_worker.sh <slug e.g. s04-ringtex> <worktree path>
# Fetch the newest -c15 tip (shallow), create the -c16 branch + sparse worktree, restore the 19:00 WIP snapshot, push the branch.
set -euo pipefail
X="$1"; WT="$2"
R=/home/user/rainbow-
L=origin/ccr-47b10cec-03c7co
B15="claude/rainbow-$X-c15"; B16="claude/rainbow-$X-c16"; SLUG="claude__rainbow-$X-c15"
cd "$R"
t0=$(date +%s)
if ! git rev-parse -q --verify "refs/remotes/origin/$B15" >/dev/null; then
  git fetch --depth=1 origin "+$B15:refs/remotes/origin/$B15" >/dev/null 2>&1
fi
TIP=$(git rev-parse "refs/remotes/origin/$B15")
WIPHEAD=$(git show "$L:backups/wip/$SLUG/INFO.json" | python3 -c "import json,sys;print(json.load(sys.stdin)['head'])")
[ "$TIP" = "$WIPHEAD" ] || { echo "$X: tip $TIP != WIP head $WIPHEAD - STOP"; exit 3; }
echo "$X: fetched tip ${TIP:0:8} in $(( $(date +%s)-t0 ))s"
git worktree add --no-checkout -b "$B16" "$WT" "$TIP" >/dev/null 2>&1
printf '/*\n!/qa/pilot05/\n!/qa/worldlabs/\n!/qa/imageblaster/\n!/builds/\n!/backups/\n' | git -C "$WT" sparse-checkout set --no-cone --stdin
git -C "$WT" read-tree -mu HEAD
ln -sfn "$R/node_modules" "$WT/node_modules"
git show "$L:backups/wip/$SLUG/tracked.patch" > "$WT/.wip_tracked.patch"
if [ -s "$WT/.wip_tracked.patch" ]; then git -C "$WT" apply --binary .wip_tracked.patch; fi
rm -f "$WT/.wip_tracked.patch"
n=0
while IFS= read -r f; do
  rel="${f#backups/wip/$SLUG/untracked/}"
  mkdir -p "$WT/$(dirname "$rel")"
  git show "$L:$f" > "$WT/$rel"; n=$((n+1))
done < <(git ls-tree -r --name-only "$L" "backups/wip/$SLUG/untracked/")
echo "$X: worktree $WT on $B16 (sparse), WIP restored: $(git -C "$WT" status --short | grep -c '^ M') modified, $n untracked files"
git -C "$WT" push -u origin "$B16" >/dev/null 2>&1 && echo "$X: pushed $B16 = ${TIP:0:8} ($(git ls-remote origin refs/heads/$B16 | cut -c1-8))"
du -sh "$WT" | cut -f1 | sed "s/^/$X: size /"
echo "$X: READY"

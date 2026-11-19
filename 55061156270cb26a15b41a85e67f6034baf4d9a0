#!/usr/bin/env bash
# setup_worker.sh <slug e.g. s04-ringtex> <worktree path>
# Round 18: newest -c17 tip -> new -c18 branch + sparse worktree, restore the account-17 21:11 UTC WIP snapshot, push.
set -euo pipefail
X="$1"; WT="$2"
R=/home/user/rainbow-
L=d22ec46b72146d69703d4271cd54c1c852164dff   # last save of the r17 lead ccr-bbe2b27e-oxfh1w (holds backups/wip/*-c17)
BOLD="claude/rainbow-$X-c17"; BNEW="claude/rainbow-$X-c18"; SLUG="claude__rainbow-$X-c17"
cd "$R"
if ! git rev-parse -q --verify "refs/remotes/origin/$BOLD" >/dev/null; then
  git fetch --depth=1 origin "+$BOLD:refs/remotes/origin/$BOLD" >/dev/null 2>&1
fi
TIP=$(git rev-parse "refs/remotes/origin/$BOLD")
WIPHEAD=$(git show "$L:backups/wip/$SLUG/INFO.json" | python3 -c "import json,sys;print(json.load(sys.stdin)['head'])")
[ "$TIP" = "$WIPHEAD" ] || { echo "$X: tip $TIP != WIP head $WIPHEAD - STOP"; exit 3; }
# Hold the autosave lock while the worktree is half-built (an empty new worktree once produced a 4 GB "all deleted" patch).
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

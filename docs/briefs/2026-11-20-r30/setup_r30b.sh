#!/usr/bin/env bash
# setup_r30b.sh — round 30b (session ccr-e490fceb-u85291, 2026-11-20 ~22:25 UTC): recreate the Screen 06 candidate worktree and the
# four r30 specialist worktrees from the NEWEST snapshots in backups/wip/*-c31/ (saved 22:14 UTC by the previous session) on NEW
# LOCAL branches -c32. Nothing is merged or pushed; the five-minute autosave snapshots each worktree into backups/wip/<branch>/.
# usage (from the lead checkout): bash docs/briefs/2026-11-20-r30/setup_r30b.sh [s06 benny06 water06 foam06 scen06]
# next account: copy, bump -c32 -> -c33 and SRC wip names -c31 -> -c32.
set -euo pipefail
R=$(git rev-parse --show-toplevel); cd "$R"
BASE=e162aec2bfdc631913c41daa435f9d449439af4f
git cat-file -e "$BASE^{commit}" 2>/dev/null || git fetch --depth=50 origin claude/rainbow-s06-match-c23
for x in ${*:-s06 benny06 water06 foam06 scen06}; do
  if [ "$x" = s06 ]; then SRC=backups/wip/claude__rainbow-s06-match-c31; BR=claude/rainbow-s06-match-c32
  else SRC=backups/wip/claude__rainbow-s06-$x-c31; BR=claude/rainbow-s06-$x-c32; fi
  WT=/home/user/wt/$x
  [ -e "$WT" ] && { echo "$x: exists, skipped"; continue; }
  mkdir -p /home/user/wt
  git worktree add --no-checkout -b "$BR" "$WT" "$BASE" >/dev/null
  printf '/*\n!/qa/pilot05/\n!/qa/worldlabs/\n!/qa/imageblaster/\n!/builds/\n!/backups/\n' | git -C "$WT" sparse-checkout set --no-cone --stdin
  git -C "$WT" read-tree -mu HEAD; ln -sfn "$R/node_modules" "$WT/node_modules"
  [ -s "$SRC/tracked.patch" ] && git -C "$WT" apply --binary "$R/$SRC/tracked.patch"
  [ -d "$SRC/untracked" ] && cp -r "$R/$SRC/untracked/." "$WT/"
  echo "$x: $WT on $BR — dirty $(git -C "$WT" status --porcelain | wc -l)"
done

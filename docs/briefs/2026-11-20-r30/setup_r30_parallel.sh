#!/usr/bin/env bash
# setup_r30_parallel.sh — round 30 (user ~22:20 UTC: "do multiple agents do different tasks at the same time"): four Screen 06 specialist
# worktrees, each = the s06 base commit + the NEWEST s06 snapshot (backups/wip/claude__rainbow-s06-match-c31/) on its own LOCAL branch.
# Nothing is merged; each worker adds its own URL switch. Snapshots of each worktree are saved by the five-minute autosave.
# usage (from the lead checkout): bash docs/briefs/2026-11-20-r30/setup_r30_parallel.sh [benny06 water06 foam06 scen06]
set -euo pipefail
R=$(git rev-parse --show-toplevel); cd "$R"
BASE=e162aec2bfdc631913c41daa435f9d449439af4f; W=backups/wip/claude__rainbow-s06-match-c31
git cat-file -e "$BASE^{commit}" 2>/dev/null || git fetch --depth=50 origin claude/rainbow-s06-match-c23
for x in ${*:-benny06 water06 foam06 scen06}; do
  WT=/home/user/wt/$x; BR=claude/rainbow-s06-$x-c31
  [ -e "$WT" ] && { echo "$x: exists, skipped"; continue; }
  git worktree add --no-checkout -b "$BR" "$WT" "$BASE" >/dev/null
  printf '/*\n!/qa/pilot05/\n!/qa/worldlabs/\n!/qa/imageblaster/\n!/builds/\n!/backups/\n' | git -C "$WT" sparse-checkout set --no-cone --stdin
  git -C "$WT" read-tree -mu HEAD; ln -sfn "$R/node_modules" "$WT/node_modules"
  [ -s "$W/tracked.patch" ] && git -C "$WT" apply --binary "$R/$W/tracked.patch"
  [ -d "$W/untracked" ] && cp -r "$R/$W/untracked/." "$WT/"
  echo "$x: $WT on $BR — dirty $(git -C "$WT" status --porcelain | wc -l)"
done

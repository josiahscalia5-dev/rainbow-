#!/usr/bin/env bash
# setup_worker_r23.sh — next account after round 22: recreate every worker worktree on NEW -c24 branches.
#   s04 / s07: their r22 code exists only as uncommitted edits (never pushed) -> base commit + the newest autosave snapshot
#              backups/wip/claude__rainbow-s0N-match-c23/{tracked.patch,untracked/} (read INFO.json first: head + time).
#   s06 / benny: cloud sessions pushed their own branches claude/rainbow-s06-match-c23 / claude/rainbow-benny-c23 -> continue
#              from those tips (fetch them; they may have moved after this file was written).
#   s08 / s05: their last tips (queued polish). Sparse worktrees (disk), node_modules symlinked. Run from the lead checkout.
# usage: bash docs/briefs/2026-11-20-r22/setup_worker_r23.sh [s04 s07 s06 benny s08 s05]
set -euo pipefail
R=$(git rev-parse --show-toplevel); cd "$R"
mk() {  # mk <slug> <worktree> <new branch> <base ref/commit> [wip dir]
  local X=$1 WT=$2 BR=$3 BASE=$4 W=${5:-}
  [ -e "$WT" ] && { echo "$X: $WT exists, skipped"; return; }
  git worktree add --no-checkout -b "$BR" "$WT" "$BASE" >/dev/null
  printf '/*\n!/qa/pilot05/\n!/qa/worldlabs/\n!/qa/imageblaster/\n!/builds/\n!/backups/\n' | git -C "$WT" sparse-checkout set --no-cone --stdin
  git -C "$WT" read-tree -mu HEAD; ln -sfn "$R/node_modules" "$WT/node_modules"
  if [ -n "$W" ]; then
    git -C "$WT" apply --binary "$R/$W/tracked.patch"
    [ -d "$R/$W/untracked" ] && cp -r "$R/$W/untracked/." "$WT/"
  fi
  echo "$X: $WT on $BR from $(git -C "$WT" rev-parse --short HEAD) $( [ -n "$W" ] && echo "+ $W")"
}
f() { git fetch --depth=50 origin "+$1:refs/remotes/origin/$1" >/dev/null 2>&1 || git fetch --depth=50 origin "$1"; }
W=${*:-s04 s07 s06 benny s08 s05}
for x in $W; do case $x in
  s04)   git cat-file -e 34cb494137e1030c4410d871125e6e9eef6aa4ea 2>/dev/null || f claude/rainbow-s04-match-c21
         mk s04 /home/user/wt/s04 claude/rainbow-s04-match-c24 34cb494137e1030c4410d871125e6e9eef6aa4ea backups/wip/claude__rainbow-s04-match-c23 ;;
  s07)   git cat-file -e 8accdad0a07ec4e3c4189701aea9df101932c7f5 2>/dev/null || f claude/rainbow-s07-match-c18
         mk s07 /home/user/wt/s07 claude/rainbow-s07-match-c24 8accdad0a07ec4e3c4189701aea9df101932c7f5 backups/wip/claude__rainbow-s07-match-c23 ;;
  s06)   f claude/rainbow-s06-match-c23; mk s06 /home/user/wt/s06 claude/rainbow-s06-match-c24 refs/remotes/origin/claude/rainbow-s06-match-c23 ;;
  benny) f claude/rainbow-benny-c23; mk benny /home/user/wt/benny claude/rainbow-benny-c24 refs/remotes/origin/claude/rainbow-benny-c23 ;;
  s08)   f claude/rainbow-s08-scenery-c17; mk s08 /home/user/wt/s08 claude/rainbow-s08-scenery-c24 refs/remotes/origin/claude/rainbow-s08-scenery-c17 ;;
  s05)   f claude/rainbow-s05-match-c19; mk s05 /home/user/wt/s05 claude/rainbow-s05-match-c24 refs/remotes/origin/claude/rainbow-s05-match-c19 ;;
esac; done
# Verify after s04: `cmp` src/world/match04m4.ts against 34cb4941 + qa/match/04/r22/s2_bbd/code.patch (K22-2) — identical at 03:58 UTC.

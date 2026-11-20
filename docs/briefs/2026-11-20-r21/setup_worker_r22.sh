#!/usr/bin/env bash
# setup_worker_r22.sh — next account after round 21: recreate every worker worktree on NEW -c23 branches.
#   s04 / s07: their r21 code existed only as uncommitted edits (this session could push only its lead branch) -> base commit +
#              the saved full patch (qa/match/0N/r21/code_at_stop_full.patch) + untracked tools.
#   s06 / benny: pushed by their own cloud sessions -> newest claude/rainbow-*-c22 tip.
#   s08 / s05: their last tips. Sparse worktrees (disk), node_modules symlinked. Run from the lead checkout.
# usage: bash docs/briefs/2026-11-20-r21/setup_worker_r22.sh [s04 s07 s06 benny s08 s05]
set -euo pipefail
R=$(git rev-parse --show-toplevel); cd "$R"
mk() {  # mk <slug> <worktree> <new branch> <base ref/commit> [patch] [untracked dir]
  local X=$1 WT=$2 BR=$3 BASE=$4 P=${5:-} U=${6:-}
  [ -e "$WT" ] && { echo "$X: $WT exists, skipped"; return; }
  git worktree add --no-checkout -b "$BR" "$WT" "$BASE" >/dev/null
  printf '/*\n!/qa/pilot05/\n!/qa/worldlabs/\n!/qa/imageblaster/\n!/builds/\n!/backups/\n' | git -C "$WT" sparse-checkout set --no-cone --stdin
  git -C "$WT" read-tree -mu HEAD; ln -sfn "$R/node_modules" "$WT/node_modules"
  if [ -n "$P" ]; then git -C "$WT" apply --binary "$R/$P"; fi
  if [ -n "$U" ] && [ -d "$R/$U" ]; then cp -r "$R/$U/." "$WT/"; fi
  echo "$X: $WT on $BR from $(git -C "$WT" rev-parse --short HEAD) $( [ -n "$P" ] && echo "+ $P")"
}
f() { git fetch --depth=50 origin "+$1:refs/remotes/origin/$1" >/dev/null 2>&1 || git fetch --depth=50 origin "$1"; }
W=${*:-s04 s07 s06 benny s08 s05}
for x in $W; do case $x in
  s04)   git cat-file -e 34cb494137e1030c4410d871125e6e9eef6aa4ea 2>/dev/null || f claude/rainbow-s04-match-c21
         mk s04 /home/user/wt/s04 claude/rainbow-s04-match-c23 34cb494137e1030c4410d871125e6e9eef6aa4ea qa/match/04/r21/code_at_stop_full.patch qa/match/04/r21/untracked_tools ;;
  s07)   git cat-file -e 8accdad0 2>/dev/null || f claude/rainbow-s07-match-c18
         mk s07 /home/user/wt/s07 claude/rainbow-s07-match-c23 8accdad0 qa/match/07/r21/code_at_stop_full.patch qa/match/07/r21/untracked_tools ;;
  s06)   f claude/rainbow-s06-match-c22; mk s06 /home/user/wt/s06 claude/rainbow-s06-match-c23 refs/remotes/origin/claude/rainbow-s06-match-c22 ;;
  benny) f claude/rainbow-benny-c22; mk benny /home/user/wt/benny claude/rainbow-benny-c23 refs/remotes/origin/claude/rainbow-benny-c22 ;;
  s08)   f claude/rainbow-s08-scenery-c17; mk s08 /home/user/wt/s08 claude/rainbow-s08-scenery-c23 refs/remotes/origin/claude/rainbow-s08-scenery-c17 ;;
  s05)   f claude/rainbow-s05-match-c19; mk s05 /home/user/wt/s05 claude/rainbow-s05-match-c23 refs/remotes/origin/claude/rainbow-s05-match-c19 ;;
esac; done
# the lead's own Screen 04 preview V4 (optional): base 34cb4941 + rings 70e5595 + qa/match/04/r21_rings/r21_rings_vs_70e5595.patch

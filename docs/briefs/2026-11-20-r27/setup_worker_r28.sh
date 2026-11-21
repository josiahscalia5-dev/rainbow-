#!/usr/bin/env bash
# setup_worker_r28.sh — the NEXT account after round 27: recreate every worker worktree on
# NEW LOCAL -c29 branches = the worker base commit + its NEWEST autosave snapshot backups/wip/<branch-c28>/ (the round-27 lead autosave refreshes it every 5 min; read INFO.json "time").
# The -c28 branches were LOCAL only in the r27 container (never pushed); their unfinished edits live only in those snapshots.
# Sparse worktrees (disk), node_modules symlinked. Run from the lead checkout.
# usage: bash docs/briefs/2026-11-20-r27/setup_worker_r28.sh [s04 s07 s06 benny s08 s05 lead07 lead06 trial07]
set -euo pipefail
R=$(git rev-parse --show-toplevel); cd "$R"
mk() {  # mk <slug> <worktree> <new branch> <base commit> [wip dir]
  local X=$1 WT=$2 BR=$3 BASE=$4 W=${5:-}
  [ -e "$WT" ] && { echo "$X: $WT exists, skipped"; return; }
  if [ "$BR" = "--detach" ]; then git worktree add --no-checkout --detach "$WT" "$BASE" >/dev/null
  else git worktree add --no-checkout -b "$BR" "$WT" "$BASE" >/dev/null; fi
  printf '/*\n!/qa/pilot05/\n!/qa/worldlabs/\n!/qa/imageblaster/\n!/builds/\n!/backups/\n' | git -C "$WT" sparse-checkout set --no-cone --stdin
  git -C "$WT" read-tree -mu HEAD; ln -sfn "$R/node_modules" "$WT/node_modules"
  if [ -n "$W" ]; then
    [ -s "$R/$W/tracked.patch" ] && git -C "$WT" apply --binary "$R/$W/tracked.patch"
    [ -d "$R/$W/untracked" ] && cp -r "$R/$W/untracked/." "$WT/"
  fi
  echo "$X: $WT on $BR from $(git -C "$WT" rev-parse --short HEAD) $( [ -n "$W" ] && echo "+ $W") — dirty $(git -C "$WT" status --porcelain | wc -l)"
}
need() {  # need <commit> <branch that contains it>
  git cat-file -e "$1^{commit}" 2>/dev/null && return
  git fetch --depth=50 origin "+$2:refs/remotes/origin/$2" >/dev/null 2>&1 || git fetch --depth=50 origin "$2" >/dev/null
  git cat-file -e "$1^{commit}" || { echo "commit $1 not found on $2"; exit 1; }
}
S04=34cb494137e1030c4410d871125e6e9eef6aa4ea; S07=8accdad0a07ec4e3c4189701aea9df101932c7f5; S06=e162aec2bfdc631913c41daa435f9d449439af4f
BEN=734efb6bc407c691c3d7d99e29b710544c82a9c5; S08=3c0fa97090afb2c0fca41898774db7247e23e522; S05=eb7233e3646640397f14e360f601aeff088d7536
W=${*:-s04 s07 s06 benny s08 s05 lead07 lead06 trial07}
for x in $W; do case $x in
  s04)    need $S04 claude/rainbow-s04-match-c21;   mk s04 /home/user/wt/s04 claude/rainbow-s04-match-c29 $S04 backups/wip/claude__rainbow-s04-match-c28 ;;
  s07)    need $S07 claude/rainbow-s07-match-c18;   mk s07 /home/user/wt/s07 claude/rainbow-s07-match-c29 $S07 backups/wip/claude__rainbow-s07-match-c28 ;;
  s06)    need $S06 claude/rainbow-s06-match-c23;   mk s06 /home/user/wt/s06 claude/rainbow-s06-match-c29 $S06 backups/wip/claude__rainbow-s06-match-c28 ;;
  benny)  need $BEN claude/rainbow-benny-c23;       mk benny /home/user/wt/benny claude/rainbow-benny-c29 $BEN backups/wip/claude__rainbow-benny-c28 ;;
  s08)    need $S08 claude/rainbow-s08-scenery-c17; mk s08 /home/user/wt/s08 claude/rainbow-s08-scenery-c29 $S08 backups/wip/claude__rainbow-s08-scenery-c28 ;;
  s05)    need $S05 claude/rainbow-s05-match-c19;   mk s05 /home/user/wt/s05 claude/rainbow-s05-match-c29 $S05 backups/wip/claude__rainbow-s05-match-c28 ;;
  lead07) need $S07 claude/rainbow-s07-match-c18;   mk lead07 /home/user/wt/lead07 --detach $S07 backups/wip/detached-8accdad0a0 ;;
  lead06) need $S06 claude/rainbow-s06-match-c23;   mk lead06 /home/user/wt/lead06 --detach $S06 backups/wip/detached-e162aec2bf ;;
  trial07) need $S07 claude/rainbow-s07-match-c18;  mk trial07 /home/user/wt/trial07 lead/trial07-c29 $S07 backups/wip/lead__trial07-c28 ;;
esac; done

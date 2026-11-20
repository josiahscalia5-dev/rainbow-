#!/usr/bin/env bash
# r23 s04 (QA only): render one variant = K23-1 (or $BASE file) with overrides replaced IN PLACE, pinned clock.
# usage: variant.sh <outdir> <port> "<overrides a=1&b=2>"   (env SHOTS = audit shot list JSON)
set -u
O=$1; P=$2; X=$3; BF=${BASE:-/home/user/rainbow-/qa/match/04/r23/QUERY_K23-1.txt}
Q=$(node /home/user/rainbow-/tools/lead23/setq.mjs "$(cat $BF)" "$X")
mkdir -p "$O"; echo "$Q" > "$O/QUERY.txt"; echo "$X" > "$O/OVERRIDES.txt"
cd /home/user/wt/s04
AUDIT_PORT=$P AUDIT_SHOTS="${SHOTS:-[[\"b_early\",0.12,null],[\"c_middle\",0.35,null],[\"d_late\",0.6,null],[\"e_end\",0.85,null]]}" \
  timeout 1200 node /home/user/rainbow-/qa/match/04/r23/s04_tools/audit_pinned_slow.mjs "$O" 04 "$Q" > "$O/audit.log" 2>&1
echo "done $O $(ls $O/*.png | wc -l) png"

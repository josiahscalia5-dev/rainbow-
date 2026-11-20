#!/usr/bin/env bash
# usage: sweep.sh <outdir> <port> <overrides> [base query file]
set -u
O=$1; P=$2; X=$3; BF=${4:-/home/user/rainbow-/qa/match/04/r23/lead_t1/QUERY_NEW.txt}
Q=$(node /tmp/claude-0/-home-user-rainbow-/1dee9937-64f8-543d-ae44-7cf9955b39b3/scratchpad/setq.mjs "$(cat $BF)" "$X")
mkdir -p "$O"; echo "$Q" > "$O/QUERY.txt"
cd /home/user/wt/s04
AUDIT_PORT=$P AUDIT_SHOTS="${SHOTS:-[[\"b_early\",0.12,null],[\"c_middle\",0.35,null],[\"d_late\",0.6,null],[\"g_hard_right\",0.35,1]]}" \
  timeout 900 node /home/user/rainbow-/qa/match/04/r22/tools/audit_pinned.mjs "$O" 04 "$Q" > "$O/audit.log" 2>&1

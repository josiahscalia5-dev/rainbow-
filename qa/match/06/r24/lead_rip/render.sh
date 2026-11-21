#!/usr/bin/env bash
# r24 lead: Screen 06 opening ripple test — same opening moments (3 / 7 / 12 % of 06) for each variant, clock pinned.
O=/home/user/rainbow-/qa/match/06/r24/lead_rip; cd /home/user/wt/s06
for V in ${*:-NORIP RIP V1 V2}; do
  AUDIT_PORT=5292 AUDIT_PIN=1000 AUDIT_SHOTS='[["o1_003",0.03,null],["o2_007",0.07,null],["o3_012",0.12,null]]' \
    timeout 1500 node /home/user/rainbow-/tools/lead23/audit06_slow.mjs "$O/$V" 06 "$(cat $O/QUERY_$V.txt)" > "$O/$V.log" 2>&1
  echo "$V exit $? $(ls $O/$V/*.png 2>/dev/null | wc -l) png"
done

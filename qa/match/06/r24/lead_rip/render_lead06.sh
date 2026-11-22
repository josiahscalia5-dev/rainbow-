#!/usr/bin/env bash
# r24 lead: same opening moments, rendered from the lead worktree /home/user/wt/lead06 (= s06 code + the m06ripz test).
O=/home/user/rainbow-/qa/match/06/r24/lead_rip; cd /home/user/wt/lead06
for V in ${*:-RIPZ}; do
  AUDIT_PORT=5293 AUDIT_PIN=1000 AUDIT_SHOTS="${SHOTS:-[[\"o1_003\",0.03,null],[\"o2_007\",0.07,null],[\"o3_012\",0.12,null]]}" \
    timeout 1500 node /home/user/rainbow-/tools/lead23/audit06_slow.mjs "$O/$V" 06 "$(cat $O/QUERY_$V.txt)" > "$O/$V.log" 2>&1
  echo "$V exit $? $(ls $O/$V/*.png 2>/dev/null | wc -l) png"
done

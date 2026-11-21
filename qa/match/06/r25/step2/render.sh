#!/usr/bin/env bash
# r26 s06 step 2: later views (22..85 % + hard left / right at 35 %) for each variant, water clock pinned (AUDIT_PIN=1000).
#   bash render.sh BEFORE NEW      (QUERY_<V>.txt; each run waits for a machine render slot)
O=/home/user/rainbow-/qa/match/06/r25/step2; cd /home/user/wt/s06
for V in ${*:-BEFORE NEW}; do
  AUDIT_PORT=${PORT:-5282} AUDIT_PIN=1000 AUDIT_SHOTS="${SHOTS:-[[\"b2_early\",0.22,null],[\"c_middle\",0.35,null],[\"c2_middle\",0.47,null],[\"d_late\",0.6,null],[\"e_end\",0.85,null],[\"f_hard_left\",0.35,-1],[\"g_hard_right\",0.35,1]]}" \
    bash /home/user/rainbow-/tools/lead25/render_slot.sh timeout 2400 node /home/user/rainbow-/tools/lead23/audit06_slow.mjs "$O/$V" 06 "$(cat $O/QUERY_$V.txt)" > "$O/$V.log" 2>&1
  echo "$V exit $? $(ls $O/$V/*.png 2>/dev/null | wc -l) png"
done

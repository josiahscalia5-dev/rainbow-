#!/usr/bin/env bash
# r25 s06 step 1: start + the opening moments (3 / 7 / 12 % into 06) for each variant, water clock pinned (AUDIT_PIN=1000),
# same tool + shots as the lead's r24 test (qa/match/06/r24/lead_rip/render.sh), rendered from /home/user/wt/s06.
#   bash render.sh CURRENT NEW [WDBG_NEW]       (each heavy run waits for a machine render slot)
O=/home/user/rainbow-/qa/match/06/r25/step1_hole; cd /home/user/wt/s06
for V in ${*:-CURRENT NEW}; do
  AUDIT_PORT=${PORT:-5282} AUDIT_PIN=1000 AUDIT_SHOTS="${SHOTS:-[[\"a_start\",0,null],[\"o1_003\",0.03,null],[\"o2_007\",0.07,null],[\"o3_012\",0.12,null]]}" \
    bash /home/user/rainbow-/tools/lead25/render_slot.sh timeout 2400 node /home/user/rainbow-/tools/lead23/audit06_slow.mjs "$O/$V" 06 "$(cat $O/QUERY_$V.txt)" > "$O/$V.log" 2>&1
  echo "$V exit $? $(ls $O/$V/*.png 2>/dev/null | wc -l) png"
done

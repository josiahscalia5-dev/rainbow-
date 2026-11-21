#!/usr/bin/env bash
# r29 lead: quick 432x768 BEFORE / NEW diagnostic for the Screen 06 route candidate (same shots, pinned clocks)
set -u
cd /home/user/wt/s06
Q0=$(cat /home/user/rainbow-/qa/match/06/r25/step2/QUERY_NEW2.txt)
export AUDIT_SHOTS='[["a_start",0,null],["b_open03",0.03,null],["c_early12",0.12,null],["d_crest20",0.2,null],["e_entry30",0.3,null],["f_mid50",0.5,null],["g_late70",0.7,null],["h_end85",0.85,null],["i_exit97",0.97,null],["j_07a",1.05,null],["k_07b",1.18,null],["l_hardL35",0.35,-1],["m_hardR35",0.35,1],["n_hardL70",0.7,-1],["o_hardR70",0.7,1]]'
export AUDIT_PIN=12345
run() { # run <name> <port> <query>
  AUDIT_PORT=$2 bash /home/user/rainbow-/tools/lead25/render_slot.sh node tools/match06/r28_quick.mjs /home/user/scratch/s06/$1 06 "$3" > /home/user/scratch/s06/$1.log 2>&1
  echo "$1 exit $?" >> /home/user/scratch/s06/$1.log
}
run q_before 5291 "$Q0" &
run q_new 5292 "$Q0&m06route=1" &
wait

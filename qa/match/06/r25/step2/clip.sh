#!/usr/bin/env bash
# r27 s06 step 2: uninterrupted REAL-GAMEPLAY clip of the WHOLE of Screen 06 (entrance straight < 30 %, steering LEFT 30-50 %,
# RIGHT 50-70 %, straight to the end, then 0.6 s into 07), real game speed (24 frames per game second, water clock = clip clock),
# every frame labelled with the playback speed (tools/lead23/label_clip.py): <V>_whole06_1x.mp4 + <V>_whole06_0.5x.mp4.
#   bash clip.sh BEFORE NEW2      (QUERY_<V>.txt; each run waits for a machine render slot)
O=/home/user/rainbow-/qa/match/06/r25/step2; cd /home/user/wt/s06
declare -A TITLE=([BEFORE]="SCREEN 06 - BEFORE (step-1 candidate)" [NEW]="SCREEN 06 - NEW (m06fcn=3)" [NEW2]="SCREEN 06 - NEW (foam m06fcn=3 m06fcg)")
for V in ${*:-BEFORE NEW2}; do
  D=/home/user/scratch/s06/clip2_$V; rm -rf "$D"
  AUDIT_PORT=${PORT:-5283} bash /home/user/rainbow-/tools/lead25/render_slot.sh timeout 4800 \
    node tools/match06/r25_open_clip.mjs 06 "$D" "$(cat $O/QUERY_$V.txt)" 0.6 > "$O/clip_$V.log" 2>&1
  python3 -I /home/user/rainbow-/tools/lead23/label_clip.py "$D" "${TITLE[$V]}" "$O/${V}_whole06" >> "$O/clip_$V.log" 2>&1
  echo "$V clip exit $? $(ls $D/f 2>/dev/null | wc -l) frames"
done

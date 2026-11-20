#!/usr/bin/env bash
# r25 s06 step 1: uninterrupted REAL-GAMEPLAY clip of the Screen 06 opening (checkpoint -> 32 % of 06, straight), real game speed
# (one frame per 1/24 s of game time, water clock follows the clip clock), labelled on every frame with the playback speed
# (tools/lead23/label_clip.py): <V>_opening_1x.mp4 + <V>_opening_0.5x.mp4.   bash clip.sh NEW CURRENT
O=/home/user/rainbow-/qa/match/06/r25/step1_hole; cd /home/user/wt/s06
declare -A TITLE=([NEW]="SCREEN 06 OPENING - NEW (m06hole)" [CURRENT]="SCREEN 06 OPENING - CURRENT (what you saw)")
for V in ${*:-NEW CURRENT}; do
  D=/home/user/scratch/s06/clip_$V; rm -rf "$D"
  CLIP_END=${CLIP_END:-0.32} AUDIT_PORT=${PORT:-5283} bash /home/user/rainbow-/tools/lead25/render_slot.sh timeout 3000 \
    node tools/match06/r25_open_clip.mjs 06 "$D" "$(cat $O/QUERY_$V.txt)" > "$O/clip_$V.log" 2>&1
  python3 -I /home/user/rainbow-/tools/lead23/label_clip.py "$D" "${TITLE[$V]}" "$O/${V}_opening" >> "$O/clip_$V.log" 2>&1
  echo "$V clip exit $? $(ls $D/f 2>/dev/null | wc -l) frames"
done

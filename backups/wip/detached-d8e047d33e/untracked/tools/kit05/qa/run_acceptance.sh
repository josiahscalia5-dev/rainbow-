#!/usr/bin/env bash
# S4 (round 34) — ONE acceptance command for Screen 05 (the lead's acceptance gate; reusable for other screens: REF / MASK / PERIOD).
#   bash tools/kit05/qa/run_acceptance.sh <game folder (play3.html + kit.json)> <outdir>
# Steps (every Chromium run goes through tools/kit05/render_slot.sh):
#   1. STRESS  qa_play.cjs PLAN=stress SHOTS=none — the whole level played with real CDP touch swipes on a 412x915 Android-portrait
#              emulation: rapid left->right reversals, repeated same-direction swipes (incl. into the river edge), lane changes during a
#              leap and during a dive, leaps, dives, lane shifts, steering at the river's sharpest bends. No screenshots (~25 s).
#   2. COINS   qa_play.cjs PLAN=coins — the coin-trail player (same plan logic as final_acceptance.cjs): lane changes before coin runs,
#              a leap under each coin arc, extra leaps / dives; renders frames (SHOTS) + WebGL load (draw calls, triangles, textures).
#   3. LIVE    qa_live.cjs — the real-time phone mode (?live=1): tap to start, real swipes on the display clock, one step per frame,
#              game clock, frames from swipe to move (software WebGL here: fps is NOT a phone's).
#   4. VISUAL  qa_visual.py — likeness vs the approved picture (scenery mask: HUD + Benny excluded) + defect detectors (dark patches that
#              are not dark in the approved picture, gaps, tears, blur, stretch, flicker, freeze, jumps) with a detector self-test.
#   5. VERDICT qa_verdict.py — the user's 10 test items PASS / FAIL with evidence, failures grouped by S1 / S2 / S3 -> REPORT.md.
# Modes / env:
#   QUICK=1          smoke test for the specialists: coins run renders frames 0..89 (first 3 s) + 6 stills, no live check (~6-8 min)
#   FRAMES_FROM=dir  reuse an existing frame-stepped run (f_NNNN.jpg + run_log.json, e.g. final_acceptance.cjs output) for the visual
#                    part instead of rendering every frame (coins run then renders 6 stills only for the GPU-load numbers)
#   SHOTS=all|quick|stills|none   override what the coins run renders (default: all = every frame, ~690 frames, ~15-30 min, slot 2)
#   LIVE=0|1         skip / force the real-time check (default 1, QUICK default 0)
#   REF=<png> MASK=<png, white = scenery> HUD=<rows> PERIOD=<frames per scenery repeat>   (other screens: their own approved picture)
set -u
HERE=$(cd "$(dirname "$0")" && pwd); TOOLS=$(cd "$HERE/.." && pwd); ROOT=$(cd "$HERE/../../.." && pwd)
GAME=$(cd "${1:?game folder}" && pwd); OUT=${2:?outdir}; mkdir -p "$OUT"; OUT=$(cd "$OUT" && pwd)
REF=${REF:-$ROOT/references/05_flow_into_the_current.png}; [ -s "$REF" ] || REF=/home/user/rainbow-/references/05_flow_into_the_current.png
export NODE_PATH=${NODE_PATH:-$(npm root -g)}
QUICK=${QUICK:-}; FRAMES_FROM=${FRAMES_FROM:-}
if [ -n "$QUICK" ]; then SHOTS=${SHOTS:-quick}; LIVE=${LIVE:-0}; elif [ -n "$FRAMES_FROM" ]; then SHOTS=${SHOTS:-stills}; LIVE=${LIVE:-1}; else SHOTS=${SHOTS:-all}; LIVE=${LIVE:-1}; fi
SLOT_COINS=1; [ "$SHOTS" = all ] && SLOT_COINS=2          # whole-level renders only ever take slot 2 (short tests keep slot 1)
PERIOD=${PERIOD:-$(python3 -I -c "import json,sys; K=json.load(open(sys.argv[1])); print(round(K['S']/1.4*30, 3))" "$GAME/kit.json" 2>/dev/null || echo 0)}
T0=$(date +%s); tm() { echo "\"$1\": $(( $(date +%s) - $2 ))"; }; TIMES=()
echo "== S4 acceptance: game $GAME -> $OUT (SHOTS=$SHOTS LIVE=$LIVE FRAMES_FROM=${FRAMES_FROM:-none} PERIOD=$PERIOD)"
t=$(date +%s); RENDER_SLOT=1 PLAN=stress SHOTS=none bash "$TOOLS/render_slot.sh" node "$HERE/qa_play.cjs" "$GAME" "$OUT/stress" > "$OUT/stress.log" 2>&1; echo "stress run exit $? ($(tail -1 "$OUT/stress.log"))"; TIMES+=("$(tm stress $t)")
t=$(date +%s); RENDER_SLOT=$SLOT_COINS PLAN=coins SHOTS=$SHOTS bash "$TOOLS/render_slot.sh" node "$HERE/qa_play.cjs" "$GAME" "$OUT/coins" > "$OUT/coins.log" 2>&1; echo "coins run exit $? ($(tail -1 "$OUT/coins.log"))"; TIMES+=("$(tm coins $t)")
if [ "$LIVE" = 1 ]; then t=$(date +%s); RENDER_SLOT=1 bash "$TOOLS/render_slot.sh" node "$HERE/qa_live.cjs" "$GAME" "$OUT/live.json" > "$OUT/live.log" 2>&1; echo "live check exit $? ($(tail -1 "$OUT/live.log" | cut -c1-200))"; TIMES+=("$(tm live $t)"); fi
FR=${FRAMES_FROM:-$OUT/coins}; LOG=$FR/run_log.json
t=$(date +%s); python3 -I "$HERE/qa_visual.py" --frames "$FR" --log "$LOG" --ref "$REF" --out "$OUT/visual" --hud "${HUD:-125}" --period "$PERIOD" --evidence "$OUT/evidence" ${MASK:+--mask "$MASK"} > "$OUT/visual.log" 2>&1; echo "visual check exit $?"; TIMES+=("$(tm visual $t)")
TIMES+=("$(tm total $T0)"); (IFS=,; echo "{${TIMES[*]}, \"shots\": \"$SHOTS\", \"frames_from\": \"${FRAMES_FROM}\", \"quick\": \"${QUICK}\"}") > "$OUT/timing.json"
python3 -I "$HERE/qa_verdict.py" "$OUT" "$GAME"; rc=$?
echo "== verdict exit $rc  ->  $OUT/REPORT.md  $OUT/VERDICT.json  (timing $(cat "$OUT/timing.json"))"
exit $rc

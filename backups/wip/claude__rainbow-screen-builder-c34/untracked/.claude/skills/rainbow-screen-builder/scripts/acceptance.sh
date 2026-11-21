#!/usr/bin/env bash
# Rainbow Screen Builder — run the PROVEN test harness on a game folder, always through the shared render lock (thin wrapper around
# tools/marble05/viewer/final_acceptance.cjs, visual_check.py, acceptance_verdict.py, tools/kit05/live_check.cjs and
# compare_to_approved.py; it adds no test logic of its own and never loosens a threshold).
#
#   bash acceptance.sh <game folder with play3.html> <outdir> [--start | --short SECS | --full | --live SECS]
#        [--screen NN] [--speed 1.4] [--before <earlier run dir>]
#
#   --start      the START frame only (frame 0 = the approved camera), ~1-2 min: pixel comparison with the approved picture
#   --short S    first S seconds (S <= 3) with the fixed swipe plan, real CDP touch swipes, 412x915 Android portrait: gameplay
#                numbers + visual checks + comparison of frames 0 / middle / last. WHILE ITERATING.
#   --full       WHOLE level (the page's coin trail + level end; ~30 min), RENDER_SLOT=2, then the fixed-threshold verdict
#                (VERDICT.md; exit 0 only when every criterion passes). MILESTONES ONLY (QA specialist / lead).
#   --live S     real-time phone mode (play3.html?live=1, rAF loop, tap to start, real swipes on the wall clock); fps here is
#                software WebGL, NOT a phone measurement
# The page must expose the harness contract (window.ready, step(t, dt, steer, speed), state(), renderNow(n), camInfo(), and for
# --full coinLayout(), levelEnd(), endK(), bennyInfo(), coinScreen()) — kitgame.html does.
# Env: RAINBOW_TOOLS = tree whose tools/ are used (default: the repo containing this skill).
set -euo pipefail
HERE=$(cd "$(dirname "$0")" && pwd); SKILL=$(dirname "$HERE")
TOOLS=${RAINBOW_TOOLS:-$(cd "$SKILL/../../.." && pwd)}
GAME=${1:?usage: acceptance.sh <game> <outdir> [--start|--short S|--full|--live S]}; OUT=${2:?outdir}; shift 2
MODE=start; SECS=""; NN=05; SPEED=1.4; BEFORE=""
while [ $# -gt 0 ]; do case "$1" in
  --start) MODE=start; shift;; --short) MODE=short; SECS=${2:-3}; shift 2;; --full) MODE=full; shift;; --live) MODE=live; SECS=${2:-8}; shift 2;;
  --screen) NN=$2; shift 2;; --speed) SPEED=$2; shift 2;; --before) BEFORE=$2; shift 2;; *) echo "unknown option $1"; exit 2;; esac; done
GAME=$(cd "$GAME" && pwd); mkdir -p "$OUT"; OUT=$(cd "$OUT" && pwd)
V=$TOOLS/tools/marble05/viewer; SLOT=$TOOLS/tools/kit05/render_slot.sh
REF=$TOOLS/$(python3 -I -c "import json,sys; print(json.load(open(sys.argv[1]))['screens'][sys.argv[2]]['reference'])" "$SKILL/screens.json" "$NN")
[ -f "$GAME/play3.html" ] || { echo "no play3.html in $GAME"; exit 2; }
if [ -e "$GAME/benny31.glb" ] && head -c 200 "$GAME/benny31.glb" | grep -q git-lfs; then echo "benny31.glb is a Git-LFS POINTER (run git lfs pull in the asset repo)"; exit 2; fi
export NODE_PATH=${NODE_PATH:-$(npm root -g)}
CMP=(python3 -I "$HERE/compare_to_approved.py" "screen:$NN")
case "$MODE" in
  start)
    PLAN=fixed FRAMES=0:1 NO_MP4=1 bash "$SLOT" node "$V/final_acceptance.cjs" "$GAME" "$OUT" 0.1 "$SPEED" > "$OUT/harness.log" 2>&1 || { tail -20 "$OUT/harness.log"; exit 1; }
    "${CMP[@]}" "$OUT/f_0000.jpg" ${BEFORE:+--before "$BEFORE/f_0000.jpg"} --out "$OUT/compare" > /dev/null
    python3 -I - "$OUT/compare/compare.json" <<'PY'
import json, sys
d = json.load(open(sys.argv[1]))['frames']['0']
for k, r in d.items():
    print(f"{k.upper():6s} start frame: scenery {100 * r['share_within_20_levels']:.1f} % within 20 levels | mean diff {r['mean_abs_diff_levels']} | SSIM {r['ssim_scenery']} | colour {r['colour_look_corr']} | sharpness {r['sharpness_vs_approved']}")
    print('       biggest differences:', '; '.join(r['route_first']))
PY
    ;;
  short)
    awk "BEGIN{exit !($SECS <= 3)}" || { echo "--short is for <= 3 s while iterating; whole-level runs = --full (milestones only)"; exit 2; }
    PLAN=fixed NO_MP4=1 bash "$SLOT" node "$V/final_acceptance.cjs" "$GAME" "$OUT" "$SECS" "$SPEED" > "$OUT/harness.log" 2>&1 || { tail -20 "$OUT/harness.log"; exit 1; }
    python3 -I "$V/visual_check.py" "$OUT" "$REF" > /dev/null
    N=$(ls "$OUT"/f_*.jpg | wc -l); FR="0,$(( N / 2 )),$(( N - 1 ))"
    "${CMP[@]}" "$OUT" --frames "$FR" ${BEFORE:+--before "$BEFORE"} --out "$OUT/compare" > /dev/null
    python3 -I - "$OUT" <<'PY'
import json, sys, os
d = sys.argv[1]; T = json.load(open(os.path.join(d, 'test_results.json'))); V = json.load(open(os.path.join(d, 'visual_check.json')))['summary']
C = json.load(open(os.path.join(d, 'compare', 'compare.json')))['frames']
print(f"frames {T['frames']} | errors {len(T['errors'])} | swipes ok {T.get('swipes_ok')}/{T['swipes_sent']} {T.get('swipe_directions')}")
print(f"lateral max step {T['lateral']['max_step_per_frame']:.3f} (teleports {T['lateral']['teleports_over_0_06']}), lanes {T['lateral']['lanes_seen']}, |lat| max {T['lateral']['max_abs_lat']:.3f}")
print(f"vertical {T['vertical']} | camera {T.get('camera')} | Benny pose {T.get('benny_pose')}")
print(f"visual: dark patches in {V['dark_patches']['frames_with_patches']} frames, sharpness min {V['sharpness_vs_start']['min']}, colour look min {V['colour_look_vs_approved']['min']}, pops {V['flicker'].get('pop_spikes')}")
for i, row in C.items():
    r = row['new']; extra = f" scenery {100 * r['share_within_20_levels']:.1f} % within 20, SSIM {r['ssim_scenery']}" if 'share_within_20_levels' in r else ''
    print(f"frame {i}: colour look {r['colour_look_corr']} sharpness {r['sharpness_vs_approved']}{extra}")
print('(short run: no verdict — the fixed-threshold verdict needs the whole level: --full at milestones)')
PY
    ;;
  full)
    RENDER_SLOT=2 bash "$SLOT" node "$V/final_acceptance.cjs" "$GAME" "$OUT" 7.6 "$SPEED" > "$OUT/harness.log" 2>&1 || { tail -20 "$OUT/harness.log"; exit 1; }
    python3 -I "$V/visual_check.py" "$OUT" "$REF" > /dev/null
    N=$(ls "$OUT"/f_*.jpg | wc -l); FR=$(python3 -I -c "import sys; n=int(sys.argv[1]); print(','.join(str(i) for i in sorted(set(list(range(0, n, 90)) + [n - 1]))))" "$N")
    "${CMP[@]}" "$OUT" --frames "$FR" ${BEFORE:+--before "$BEFORE"} --out "$OUT/compare" > /dev/null
    python3 -I "$V/acceptance_verdict.py" "$OUT"
    ;;
  live)
    bash "$SLOT" node "$TOOLS/tools/kit05/live_check.cjs" "$GAME" "$OUT/live.json" "$SECS" > "$OUT/harness.log" 2>&1 || { tail -20 "$OUT/harness.log"; exit 1; }
    python3 -I -c "import json,sys; d=json.load(open(sys.argv[1])); s=d['stats']; print('live:', 'tap start', d.get('started_by_tap'), '| swipes', d.get('swipes_sent'), '| swipe->move ms', s.get('swipeToMoveMs'), '| errors', len(d.get('errors', [])), '|', d.get('note'))" "$OUT/live.json"
    ;;
esac
echo "results: $OUT"

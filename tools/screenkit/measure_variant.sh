#!/usr/bin/env bash
# Rainbow screen kit (r44): stills of a game folder (picture camera + positions while swimming) + the measured likeness at the picture camera.
#   bash tools/screenkit/measure_variant.sh <NN> <workspace> <out> [s list, default 1.2] [extra query]
set -e
NN=$1; WS=$2; OUT=$3; SL=${4:-1.2}; Q=${5:-sentinel=1}; SRC=$(cd "$(dirname "$0")/../.." && pwd)
NODE_PATH=$(npm root -g) node "$SRC/tools/reflock/section_run.cjs" "$WS/game" "$OUT" stills "$SL" 0 "$Q" > "$OUT.log" 2>&1
F0=$(ls "$OUT"/s*_l0.png | sort -t s -k2 -g | head -1); python3 -I "$SRC/tools/screenkit/compare_screen.py" "$NN" "$F0" "$WS/seg/mask.png" "$OUT/cmp" > /dev/null 2>&1
python3 -c "import json,sys;d=json.load(open('$OUT/cmp/new_summary.json'))['new'];print('$(basename $WS)', 'scenery within 20: %.1f %%  SSIM %.3f  colour %.3f  sharpness %.2f' % (100*d['share_within_20_levels'], d['ssim_scenery'], d['colour_look_corr'], d['sharpness_vs_approved']))"

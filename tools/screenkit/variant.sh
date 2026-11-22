#!/usr/bin/env bash
# Rainbow screen kit (r44): controlled one-factor test of a screen. Re-runs the fit with layout overrides and Blender into a variant game folder
# that shares everything else with an existing workspace (masks, plate, Benny, page).
#   bash tools/screenkit/variant.sh <NN> <base workspace> <variant workspace> [--set key=json ...]
set -e
NN=$1; B=$(cd "$2" && pwd); V=$3; shift 3; SRC=$(cd "$(dirname "$0")/../.." && pwd)
rm -rf "$V"; mkdir -p "$V/fit"; V=$(cd "$V" && pwd); cp -a "$B/game" "$V/game"; cp -a "$B/seg" "$V/seg"
(cd "$SRC" && python3 -I "tools/screenkit/screens/$NN/fit$NN.py" "$V/fit" "$@" > "$V/fit/fit.log")
blender -b --python "$SRC/tools/screenkit/blender_kit.py" -- "$V/fit/layout.json" "$V/game/scene.glb" > "$V/fit/blender.log" 2>&1 || { tail -20 "$V/fit/blender.log"; exit 1; }
python3 - "$V/fit/layout.json" "$V/game/layout.json" <<'PY'
import json, sys
L = json.load(open(sys.argv[1]))
for i, c in enumerate(L['cams']): c['plate'] = f'plate_{i}.png'; c['mask'] = f'mask_{i}.png'
json.dump(L, open(sys.argv[2], 'w'))
PY
cp -f "$SRC/tools/screenkit/screen.html" "$V/game/play3.html"; echo "variant ready: $V/game ($*)"

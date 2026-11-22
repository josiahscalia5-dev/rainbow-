#!/usr/bin/env bash
# Rainbow screen kit: one command from a screen's approved picture to a runnable, measured 3D level folder (round 43).
#   bash tools/screenkit/setup_screen.sh <NN> <workspace> [asset_repo=/home/user/rainbow-]
# 1. fit      : tools/screenkit/screens/NN/fitNN.py -> layout.json + overlays (optional Depth Anything cross-check if its depth file exists)
# 2. masks    : tools/screenkit/segment.py (SAM 2.1 traced Benny / coins, clean plate) from screens/NN/segmentNN.json
# 3. geometry : Blender 5.3 headless, tools/screenkit/blender_kit.py (Geometry Nodes components) -> scene.glb
# 4. game     : tools/screenkit/screen.html + the shared game code (controls.js, swimfx.js, Benny 31, three.js 0.180)
# Free: no generation service, no credits. The approved picture is only READ (copied into the game folder for the bake).
set -e
NN=${1:?screen number}; SRC=$(cd "$(dirname "$0")/../.." && pwd); WS=${2:?workspace}; AR=${3:-/home/user/rainbow-}
mkdir -p "$WS/fit" "$WS/seg" "$WS/game"; WS=$(cd "$WS" && pwd); G="$WS/game"; SD="$SRC/tools/screenkit/screens/$NN"
REF=$(python3 -c "import json,sys;print(json.load(open('$SRC/.claude/skills/rainbow-screen-builder/screens.json'))['screens']['$NN']['reference'])")
DA2=""; M=${RAINBOW_MODELS:-$HOME/.cache/rainbow-models}
if [ -f "$M/depth/model.onnx" ] && [ ! -f "$WS/fit/da2.npy" ]; then
  (cd "$SRC" && python3 -I - "$REF" "$WS/fit/da2.npy" "$M" <<'EOF' >/dev/null 2>&1 || true
import sys, os, numpy as np
from PIL import Image
sys.path.insert(0, os.path.join(os.getcwd(), 'tools', 'screenkit', 'eval'))
from eval_extract import Depth
d = Depth(os.path.join(sys.argv[3], 'depth')); np.save(sys.argv[2], d(np.asarray(Image.open(sys.argv[1]).convert('RGB'))).astype(np.float16))
EOF
  )
fi
[ -f "$WS/fit/da2.npy" ] && DA2="--da2 $WS/fit/da2.npy"
(cd "$SRC" && python3 -I "$SD/fit$NN.py" "$WS/fit" $DA2 > "$WS/fit/fit.log")
(cd "$SRC" && python3 -I tools/screenkit/segment.py "$REF" "$SD/segment$NN.json" "$WS/seg" > "$WS/seg/segment.log")
blender -b --python "$SRC/tools/screenkit/blender_kit.py" -- "$WS/fit/layout.json" "$G/scene.glb" > "$WS/fit/blender.log" 2>&1 || { tail -20 "$WS/fit/blender.log"; exit 1; }
python3 - "$WS/fit/layout.json" "$G/layout.json" <<'EOF'
import json, sys
L = json.load(open(sys.argv[1]))
for i, c in enumerate(L['cams']): c['plate'] = f'plate_{i}.png'; c['mask'] = f'mask_{i}.png'
json.dump(L, open(sys.argv[2], 'w'))
EOF
cp -f "$WS/seg/plate.png" "$G/plate_0.png"; cp -f "$WS/seg/mask.png" "$G/mask_0.png"; cp -f "$SRC/$REF" "$G/ref_0.png"
cp -f "$SRC/tools/screenkit/screen.html" "$G/play3.html"; cp -f "$SRC/tools/kit05/controls.js" "$SRC/tools/kit05/swimfx.js" "$G/"
cp -fL "$AR/assets/models/benny31.glb" "$G/benny31.glb"; cp -fL "$AR/assets/textures/benny31/bake.png" "$G/bake.png"; cp -fL "$AR/assets/textures/paint/05_coin.png" "$G/coin.png"
for f in splash.png bubble.png glint.png; do cp -fL "$AR/tools/marble05/viewer/$f" "$G/$f"; done
if [ ! -d /tmp/rainbow_r34/node_modules/three ]; then (mkdir -p /tmp/rainbow_r34 && cd /tmp/rainbow_r34 && npm init -y >/dev/null && npm install three@0.180.0 >/dev/null 2>&1); fi
ln -sfn /tmp/rainbow_r34/node_modules "$G/node_modules"
head -c 200 "$G/benny31.glb" | grep -q "git-lfs" && { echo "SETUP FAILED: benny31.glb is an LFS pointer"; exit 1; }
head -2 "$WS/fit/fit.log"; cat "$WS/seg/segment.log"; tail -1 "$WS/fit/blender.log" | head -1; echo "screen $NN ready: $G/play3.html"

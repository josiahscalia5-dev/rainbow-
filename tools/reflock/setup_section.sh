#!/usr/bin/env bash
# Round 40: one-command runnable folder for the reference-locked Bubble Dash -> Sock Rescue section.
#   bash tools/reflock/setup_section.sh <workspace> [asset_repo=/home/user/rainbow-]
# 1. fit   : tools/bonus/fit_sock.py (round-39 ring fit) + tools/reflock/fit_section.py -> section.json, masks, fit overlays
# 2. build : Blender 5.3 headless, tools/reflock/blender_section.py -> section.glb (connected meshes, clean UVs)
# 3. game  : section.html + the shared game code (controls.js, swimfx.js, Benny, three.js 0.180) + the two approved pictures (read-only copies)
# Free: no generation service, no credits.
set -e
SRC=$(cd "$(dirname "$0")/../.." && pwd); WS=${1:?workspace}; AR=${2:-/home/user/rainbow-}
mkdir -p "$WS/fit" "$WS/section"; WS=$(cd "$WS" && pwd); G="$WS/section"
(cd "$SRC" && python3 -I tools/bonus/fit_sock.py "$WS/fit" >/dev/null && python3 -I tools/reflock/fit_section.py "$WS/fit" > "$WS/fit/fit.log")
blender -b --python "$SRC/tools/reflock/blender_section.py" -- "$WS/fit/section.json" "$G/section.glb" > "$WS/fit/blender.log" 2>&1 || { tail -20 "$WS/fit/blender.log"; exit 1; }
cp -f "$WS/fit/section.json" "$G/"; cp -f "$WS/fit/mask_bubble.png" "$G/mask_bubble.png"; cp -f "$SRC/qa/bonus/r39/generated/sock_plate_mask.png" "$G/mask_sock.png"
python3 -I "$SRC/tools/reflock/plate.py" "$SRC/references/candidates/bonus_bubble_dash_chamber.webp" "$G/mask_bubble.png" "$G/plate_bubble.png" >/dev/null
python3 -I "$SRC/tools/reflock/plate.py" "$SRC/references/candidates/bonus_sock_rescue_laundry_tunnel.webp" "$G/mask_sock.png" "$G/plate_sock.png" >/dev/null
cp -f "$SRC/references/candidates/bonus_bubble_dash_chamber.webp" "$G/bubble.webp"; cp -f "$SRC/references/candidates/bonus_sock_rescue_laundry_tunnel.webp" "$G/sock.webp"
cp -f "$SRC/tools/reflock/section.html" "$G/play3.html"; cp -f "$SRC/tools/kit05/controls.js" "$SRC/tools/kit05/swimfx.js" "$G/"
cp -fL "$AR/assets/models/benny31.glb" "$G/benny31.glb"; cp -fL "$AR/assets/textures/benny31/bake.png" "$G/bake.png"; cp -fL "$AR/assets/textures/paint/05_coin.png" "$G/coin.png"
for f in splash.png bubble.png glint.png; do cp -fL "$AR/tools/marble05/viewer/$f" "$G/$f"; done
if [ ! -d /tmp/rainbow_r34/node_modules/three ]; then (mkdir -p /tmp/rainbow_r34 && cd /tmp/rainbow_r34 && npm init -y >/dev/null && npm install three@0.180.0 >/dev/null 2>&1); fi
ln -sfn /tmp/rainbow_r34/node_modules "$G/node_modules"
head -c 200 "$G/benny31.glb" | grep -q "git-lfs" && { echo "SETUP FAILED: benny31.glb is an LFS pointer"; exit 1; }
cat "$WS/fit/fit.log" | head -4; echo "section ready: $G/play3.html"

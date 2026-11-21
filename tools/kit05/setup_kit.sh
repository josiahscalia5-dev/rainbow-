#!/usr/bin/env bash
# Round 34 (2026-11-21): build a runnable Screen 05 kit-game folder from THIS source tree (main checkout or a specialist worktree).
#   bash tools/kit05/setup_kit.sh <workspace> [asset_repo=/home/user/rainbow-]
# Creates <ws>/kit   = textures baked from the APPROVED picture (bake_kit.py + bake_foam.py, ~15 s, free)
#         <ws>/game  = play3.html (= this tree's tools/kit05/kitgame.html) + controls.js (this tree's tools/kit05/controls.js)
#                      + links to the kit textures, Benny (LFS, from the asset repo), sprites and three.js 0.180
# Code comes from the tree this script lives in; Git-LFS binaries (benny31.glb) come from the asset repo, so specialist worktrees
# created with GIT_LFS_SKIP_SMUDGE=1 work. Re-run after editing bake_kit.py / kit_model.py; after editing only kitgame.html or
# controls.js, run it with SKIP_BAKE=1 (copies the page + controls again, ~1 s).
# Test:  NODE_PATH=$(npm root -g) bash tools/kit05/render_slot.sh node tools/marble05/viewer/final_acceptance.cjs <ws>/game <out> 7.6 1.4
set -e
SRC=$(cd "$(dirname "$0")/../.." && pwd); WS=${1:?workspace}; AR=${2:-/home/user/rainbow-}
mkdir -p "$WS/kit" "$WS/game"; WS=$(cd "$WS" && pwd)
if [ -z "$SKIP_BAKE" ] || [ ! -f "$WS/kit/kit.json" ]; then
  python3 -I "$SRC/tools/kit05/bake_kit.py" "$WS/kit" >"$WS/kit/bake.log" 2>&1 || { tail -20 "$WS/kit/bake.log"; exit 1; }
  python3 -I "$SRC/tools/kit05/bake_foam.py" "$WS/kit" >>"$WS/kit/bake.log" 2>&1
  python3 -I "$SRC/tools/kit05/bake_river35.py" "$WS/kit" >>"$WS/kit/bake.log" 2>&1 || { tail -20 "$WS/kit/bake.log"; exit 1; }
fi
cd "$WS/game"
for f in "$WS"/kit/*.png "$WS/kit/kit.json"; do ln -sf "$f" "$(basename "$f")"; done
cp -f "$SRC/tools/kit05/kitgame.html" play3.html
cp -f "$SRC/tools/kit05/controls.js" controls.js
[ -f "$SRC/tools/kit05/live.js" ] && cp -f "$SRC/tools/kit05/live.js" live.js
[ -f "$SRC/tools/kit05/swimfx.js" ] && cp -f "$SRC/tools/kit05/swimfx.js" swimfx.js
ln -sf "$AR/assets/models/benny31.glb" benny31.glb
ln -sf "$AR/assets/textures/benny31/bake.png" bake.png
ln -sf "$AR/assets/textures/paint/05_coin.png" coin.png
for f in splash.png bubble.png glint.png; do ln -sf "$AR/tools/marble05/viewer/$f" "$f"; done
if [ ! -d /tmp/rainbow_r34/node_modules/three ]; then (mkdir -p /tmp/rainbow_r34 && cd /tmp/rainbow_r34 && npm init -y >/dev/null && npm install three@0.180.0 >/dev/null 2>&1); fi
ln -sfn /tmp/rainbow_r34/node_modules node_modules
head -c 200 benny31.glb | grep -q "git-lfs" && { echo "SETUP FAILED: benny31.glb is an LFS pointer (git -C $AR lfs pull)"; exit 1; }
echo "kit game ready: $WS/game  (code from $SRC)"

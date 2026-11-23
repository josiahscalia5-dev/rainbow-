#!/usr/bin/env bash
# Round 47 (2026-11-23): runnable folder for the MODULAR Screen 05 section (tools/mod05).
#   bash tools/mod05/setup_mod05.sh <workspace> [asset_repo=/home/user/rainbow-]
# <ws>/tiles = the repeating textures (make_tiles.py, ~30 s, cached: re-made only when make_tiles.py changes)
# <ws>/game  = play3.html (= mod05.html) + mod05.json + the shared game code (tools/kit05/controls.js, swimfx.js) + Benny 31, coin, splash,
#              bubble sprites + three.js (the repo's node_modules). Same QA contract as the screen kit: tools/reflock/section_run.cjs works on it.
# Play in a browser: (cd <ws>/game && python3 -m http.server 8047) -> http://127.0.0.1:8047/play3.html?play=1
set -e
SRC=$(cd "$(dirname "$0")/../.." && pwd); WS=${1:?workspace}; AR=${2:-/home/user/rainbow-}
mkdir -p "$WS/tiles" "$WS/game"; WS=$(cd "$WS" && pwd)
H=$(sha256sum "$SRC/tools/mod05/make_tiles.py" | cut -c1-16)
if [ ! -f "$WS/tiles/.hash" ] || [ "$(cat "$WS/tiles/.hash")" != "$H" ]; then
  python3 -I "$SRC/tools/mod05/make_tiles.py" "$WS/tiles" && echo "$H" > "$WS/tiles/.hash"
fi
cd "$WS/game"
cp -f "$SRC/tools/mod05/mod05.html" play3.html
cp -f "$SRC/tools/mod05/mod05.json" mod05.json
cp -f "$SRC/tools/kit05/controls.js" controls.js
cp -f "$SRC/tools/kit05/swimfx.js" swimfx.js
for f in wall_tile.png ring_tile.png; do ln -sf "$WS/tiles/$f" "$f"; done
if [ ! -f "$WS/tiles/splash_pic.png" ]; then python3 -I "$SRC/tools/screenkit/splash_cut.py" "$SRC/references/05_flow_into_the_current.png" "$SRC/tools/screenkit/screens/05/segment05.json" "$WS/tiles" >/dev/null; fi
ln -sf "$WS/tiles/splash_pic.png" splash_pic.png
ln -sf "$AR/assets/models/benny31.glb" benny31.glb
ln -sf "$AR/assets/textures/benny31/bake.png" bake.png
ln -sf "$AR/assets/textures/paint/05_coin.png" coin.png
for f in splash.png bubble.png glint.png; do ln -sf "$AR/tools/marble05/viewer/$f" "$f"; done
ln -sfn "$AR/node_modules" node_modules
head -c 200 benny31.glb | grep -q "git-lfs" && { echo "SETUP FAILED: benny31.glb is an LFS pointer (git -C $AR lfs pull)"; exit 1; }
echo "modular Screen 05 ready: $WS/game  (code from $SRC)"

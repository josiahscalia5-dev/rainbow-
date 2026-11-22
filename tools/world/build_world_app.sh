#!/usr/bin/env bash
# Rainbow ONE connected world -> the Rainbow app build (public/world/ -> dist -> the Android APK). Round 45.
#   bash tools/world/build_world_app.sh <workspace made by tools/world/build_world.py>
# Self-contained static scene (three.js 0.180 vendored, no CDN), every area pre-baked (no approved picture and no mask is shipped). The game
# hands over to it only in a test build: VITE_RAINBOW_WORLD=1 (or ?world=1): opening videos -> world 04 -> A -> B -> 05 -> 06 -> 07 -> back in
# the game at the Screen 08 checkpoint. The world page opens with three buttons: Start 04 / Start 05 / Start 06 (all in the same one scene).
set -e
SRC=$(cd "$(dirname "$0")/../.." && pwd); WS=$(cd "${1:?workspace}" && pwd); G="$WS/game"; P="$SRC/public/world"
[ -f "$G/play3.html" ] || { echo "no world game folder in $WS (run tools/world/build_world.py first)"; exit 1; }
rm -rf "$P"; mkdir -p "$P/vendor/three/build" "$P/vendor/three/examples/jsm/loaders" "$P/vendor/three/examples/jsm/utils"
T=/tmp/rainbow_r34/node_modules/three
cp "$T/build/three.module.js" "$T/build/three.core.js" "$P/vendor/three/build/"; cp "$T/examples/jsm/loaders/GLTFLoader.js" "$P/vendor/three/examples/jsm/loaders/"
cp "$T/examples/jsm/utils/BufferGeometryUtils.js" "$P/vendor/three/examples/jsm/utils/"
for f in world.json connectors.glb bake.js qa.js controls.js swimfx.js benny31.glb bake.png coin.png splash.png bubble.png glint.png; do cp -L "$G/$f" "$P/$f"; done
for d in "$G"/a*/; do n=$(basename "$d"); mkdir -p "$P/$n"; for f in "$d"*; do b=$(basename "$f"); [ "$b" = mask_0.png ] && continue; cp -rL "$f" "$P/$n/"; done; done
python3 - "$G/play3.html" "$P/index.html" <<'PY'
import sys
s = open(sys.argv[1]).read()
a = '"three":"./node_modules/three/build/three.module.js","three/addons/":"./node_modules/three/examples/jsm/"'
assert a in s, 'import map'; s = s.replace(a, '"three":"./vendor/three/build/three.module.js","three/addons/":"./vendor/three/examples/jsm/"')
a = "const q = new URLSearchParams(location.search);"; assert a in s
s = s.replace(a, a + "\nif (!q.has('w') && !q.has('play')) q.set('play', '1');   // app: real-time play", 1)
open(sys.argv[2], 'w').write(s)
PY
du -sh "$P" | cut -f1 | xargs echo "world in the app build:" "$P"

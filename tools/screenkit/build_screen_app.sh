#!/usr/bin/env bash
# Rainbow screen kit: put a kit-built screen INTO the Rainbow app build (public/screenNN/ -> dist -> the Android APK).
#   bash tools/screenkit/build_screen_app.sh <NN> <workspace made by setup_screen.sh>
# Self-contained static scene (three.js 0.180 vendored, no CDN), textures pre-baked once (screen_export.cjs); the approved picture itself is
# NOT shipped (only the baked textures). The game hands over to it only in a test build (Screen 06: VITE_RAINBOW_KIT06=1 or ?kit06=1).
set -e
NN=${1:?screen}; SRC=$(cd "$(dirname "$0")/../.." && pwd); WS=$(cd "${2:?workspace}" && pwd); G="$WS/game"; P="$SRC/public/screen$NN"
rm -rf "$WS/app"; NODE_PATH=$(npm root -g) node "$SRC/tools/screenkit/screen_export.cjs" "$G" "$WS/app"
rm -rf "$P"; mkdir -p "$P/vendor/three/build" "$P/vendor/three/examples/jsm/loaders" "$P/vendor/three/examples/jsm/utils" "$P/baked"
T=/tmp/rainbow_r34/node_modules/three
cp "$T/build/three.module.js" "$T/build/three.core.js" "$P/vendor/three/build/"; cp "$T/examples/jsm/loaders/GLTFLoader.js" "$P/vendor/three/examples/jsm/loaders/"; cp "$T/examples/jsm/utils/BufferGeometryUtils.js" "$P/vendor/three/examples/jsm/utils/"
cp "$WS/app/baked/"* "$P/baked/"
for f in scene.glb layout.json controls.js swimfx.js benny31.glb bake.png coin.png splash.png bubble.png glint.png; do cp -L "$G/$f" "$P/$f"; done
python3 - "$SRC/tools/screenkit/screen.html" "$P/index.html" <<'PY'
import sys
s = open(sys.argv[1]).read()
a = '"three":"./node_modules/three/build/three.module.js","three/addons/":"./node_modules/three/examples/jsm/"'
assert a in s; s = s.replace(a, '"three":"./vendor/three/build/three.module.js","three/addons/":"./vendor/three/examples/jsm/"')
a = "const q = new URLSearchParams(location.search);"; assert a in s
s = s.replace(a, a + "\nif (!q.has('w') && !q.has('play')) q.set('play', '1');   // app: real-time play\nif (!q.has('prebaked')) q.set('prebaked', '1');   // app: textures baked offline")
open(sys.argv[2], 'w').write(s)
PY
du -sh "$P" | cut -f1 | xargs echo "screen $NN in the app build:" "$P"

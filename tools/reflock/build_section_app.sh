#!/usr/bin/env bash
# Round 40: put the reference-locked section INTO the Rainbow app build (public/section/ -> dist/section/ -> the Android APK).
#   bash tools/reflock/build_section_app.sh <workspace made by setup_section.sh>
# Self-contained static scene (three.js 0.180 vendored, no CDN), textures pre-baked once (section_export.cjs), no approved pictures shipped.
# The main game hands over to it between Screen 04 and Screen 05 only when built with VITE_RAINBOW_BONUS=1 (or opened with ?bonus=1):
# the default game is unchanged.
set -e
SRC=$(cd "$(dirname "$0")/../.." && pwd); WS=$(cd "${1:?workspace}" && pwd); G="$WS/section"; P="$SRC/public/section"
NODE_PATH=$(npm root -g) node "$SRC/tools/reflock/section_export.cjs" "$G" "$WS/app"
rm -rf "$P"; mkdir -p "$P/vendor/three/build" "$P/vendor/three/examples/jsm/loaders" "$P/vendor/three/examples/jsm/utils" "$P/baked"
T=/tmp/rainbow_r34/node_modules/three
cp "$T/build/three.module.js" "$T/build/three.core.js" "$P/vendor/three/build/"; cp "$T/examples/jsm/loaders/GLTFLoader.js" "$P/vendor/three/examples/jsm/loaders/"; cp "$T/examples/jsm/utils/BufferGeometryUtils.js" "$P/vendor/three/examples/jsm/utils/"
cp "$WS/app/baked/"* "$P/baked/"
for f in section.glb section.json controls.js swimfx.js benny31.glb bake.png coin.png splash.png bubble.png glint.png; do cp -L "$G/$f" "$P/$f"; done
python3 - "$SRC/tools/reflock/section.html" "$P/index.html" <<'PY'
import sys
s = open(sys.argv[1]).read()
a = '"three":"./node_modules/three/build/three.module.js","three/addons/":"./node_modules/three/examples/jsm/"'
assert a in s; s = s.replace(a, '"three":"./vendor/three/build/three.module.js","three/addons/":"./vendor/three/examples/jsm/"')
a = "const q = new URLSearchParams(location.search);"; assert a in s
s = s.replace(a, a + "\nif (!q.has('w') && !q.has('play')) q.set('play', '1');   // app: real-time play")
open(sys.argv[2], 'w').write(s)
PY
du -sh "$P" | cut -f1 | xargs echo "section in the app build:" "$P"

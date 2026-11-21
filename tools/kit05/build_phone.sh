#!/usr/bin/env bash
# Round 35 (lead): a self-contained PHONE build of the Screen 05 kit game (for a link the user opens on a phone, or any static host).
#   bash tools/kit05/build_phone.sh <kit game folder made by setup_kit.sh> <out folder>
# Copies only the files the page loads (symlinks resolved), loads three.js 0.180.0 from jsDelivr instead of node_modules, and starts in
# the REAL-TIME phone mode (live.js: "Tap to swim", real swipes, fps + swipe-response meter) without any URL switch. Game code unchanged.
set -e
GAME=$(cd "${1:?kit game folder}" && pwd); OUT=${2:?out folder}; mkdir -p "$OUT"; OUT=$(cd "$OUT" && pwd)
FILES="controls.js live.js swimfx.js kit.json wall.png ring.png river.png wall_own.png ring_own.png river35.png river35_detail.png puffs.png
       foam.png bubble.png bake.png splash.png coin.png glint.png"
for f in $FILES; do [ -e "$GAME/$f" ] || { echo "missing $GAME/$f"; exit 1; }; cp -L "$GAME/$f" "$OUT/$f"; done
# Benny's model as base64 text (static hosts such as claude.ai artifacts do not serve .glb); the page decodes it and parses the same GLB
base64 -w 0 "$GAME/benny31.glb" > "$OUT/benny31.glb.txt"
python3 - "$GAME/play3.html" "$OUT/index.html" <<'EOF'
import sys
s = open(sys.argv[1]).read()
s = s.replace('"three":"./node_modules/three/build/three.module.js","three/addons/":"./node_modules/three/examples/jsm/"',
              '"three":"https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/"')
assert 'cdn.jsdelivr.net/npm/three@0.180.0' in s, 'importmap not found'
s = s.replace('<title>Screen 05 tunnel kit game test</title>', '<title>Rainbow Screen 05</title>')
old_g = "const gltf = await new GLTFLoader().loadAsync('benny31.glb');"
assert old_g in s
s = s.replace(old_g, "const gltf = await (async () => { const b = atob((await (await fetch('benny31.glb.txt')).text()).trim()), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new GLTFLoader().parseAsync(u.buffer, ''); })();   // phone build: the GLB as base64 text")
old = "const q = new URLSearchParams(location.search);"
assert old in s
s = s.replace(old, old + "\nif (!q.has('play') && !q.has('w')) q.set('play', '1');   // phone build: real-time play by default")
open(sys.argv[2], 'w').write(s)
EOF
du -sh "$OUT" | cut -f1 | xargs echo "phone build ready:" "$OUT" "size"

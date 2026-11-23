#!/usr/bin/env bash
# Round 47 (2026-11-23): self-contained PHONE build of the MODULAR Screen 05 section (for a private link the user opens on a phone).
#   bash tools/mod05/build_phone.sh <game folder made by setup_mod05.sh> <out folder>
# Copies only the files the page loads (symlinks resolved), loads three.js 0.170.0 (the version the page is tested with) from jsDelivr,
# ships Benny's GLB as base64 text (static hosts do not serve .glb) and starts in real-time play ("Tap to swim", real swipes). Game code unchanged.
set -e
GAME=$(cd "${1:?game folder}" && pwd); OUT=${2:?out folder}; mkdir -p "$OUT"; OUT=$(cd "$OUT" && pwd)
for f in mod05.json controls.js swimfx.js wall_tile.png ring_tile.png splash_pic.png splash.png bubble.png coin.png glint.png bake.png; do
  [ -e "$GAME/$f" ] || { echo "missing $GAME/$f"; exit 1; }; cp -L "$GAME/$f" "$OUT/$f"; done
base64 -w 0 "$GAME/benny31.glb" > "$OUT/benny31.glb.txt"
python3 - "$GAME/play3.html" "$OUT/index.html" <<'EOF'
import sys
s = open(sys.argv[1]).read()
old = '"three":"./node_modules/three/build/three.module.js","three/addons/":"./node_modules/three/examples/jsm/"'
assert old in s, 'importmap not found'
s = s.replace(old, '"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"')
old_g = "const bgl = await new GLTFLoader().loadAsync('benny31.glb');"
assert old_g in s, 'GLB loader line not found'
s = s.replace(old_g, "const bgl = await (async () => { const b = atob((await (await fetch('benny31.glb.txt')).text()).trim()), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new GLTFLoader().parseAsync(u.buffer, ''); })();   /* phone build: the GLB as base64 text */")
old_q = "const q = new URLSearchParams(location.search);"
assert old_q in s
s = s.replace(old_q, old_q + "\nif (!q.has('play')) q.set('play', '1');   /* phone build: real-time play by default */", 1)
open(sys.argv[2], 'w').write(s)
EOF
du -sh "$OUT"; echo "phone build ready: $OUT/index.html"

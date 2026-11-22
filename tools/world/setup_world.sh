#!/usr/bin/env bash
# Rainbow ONE connected world (round 44): build the playable world folder 04 -> A Bubble Dash -> B Sock Rescue (more areas join as they are
# rebuilt with the screen kit). Free tools only (Blender 5.3, three.js, the kit); no credits.
#   bash tools/world/setup_world.sh <workspace>      -> <workspace>/game/play3.html (= tools/world/world.html), QA as any kit page
# Steps: 04 with the kit (tunnel ending in the doorway: --tube-len 22 --open-end) -> its bake once offline (screen_export.cjs) ->
# the section's pre-baked folder (public/section, unchanged) -> world_layout.py (placements, ONE route, camera keys, connectors) ->
# Blender connector pieces (blender_connectors.py) -> game folder.
set -e
SRC=$(cd "$(dirname "$0")/../.." && pwd); WS=${1:?workspace}; mkdir -p "$WS"; WS=$(cd "$WS" && pwd); G="$WS/game"
bash "$SRC/tools/screenkit/setup_screen.sh" 04 "$WS/s04" > "$WS/s04.log" 2>&1
bash "$SRC/tools/screenkit/variant.sh" 04 "$WS/s04" "$WS/w04" --tube-len 22 --open-end > /dev/null
NODE_PATH=$(npm root -g) node "$SRC/tools/screenkit/screen_export.cjs" "$WS/w04/game" "$WS/w04/app" > "$WS/w04_export.log" 2>&1
rm -rf "$G"; mkdir -p "$G/a04/baked" "$G/aAB"
cp "$WS/w04/game/layout.json" "$WS/w04/game/scene.glb" "$G/a04/"; cp "$WS/w04/app/baked/"* "$G/a04/baked/"
cp -r "$SRC/public/section/baked" "$G/aAB/"; cp "$SRC/public/section/section.json" "$SRC/public/section/section.glb" "$G/aAB/"
# v2: Screen 05 (kit) after Sock Rescue
bash "$SRC/tools/screenkit/setup_screen.sh" 05 "$WS/s05" > "$WS/s05.log" 2>&1
bash "$SRC/tools/screenkit/variant.sh" 05 "$WS/s05" "$WS/w05" --tube-len 20 --open-end > /dev/null      # v3: 05's tube runs on into the 06 drum
NODE_PATH=$(npm root -g) node "$SRC/tools/screenkit/screen_export.cjs" "$WS/w05/game" "$WS/w05/app" > "$WS/w05_export.log" 2>&1
mkdir -p "$G/a05/baked"; cp "$WS/w05/game/layout.json" "$WS/w05/game/scene.glb" "$G/a05/"; cp "$WS/w05/app/baked/"* "$G/a05/baked/"
# v3: Screen 06 (kit, round 43b) scaled to the world's ONE Benny size (0.468 u), rebuilt in Blender at that scale, baked once
bash "$SRC/tools/screenkit/setup_screen.sh" 06 "$WS/s06" > "$WS/s06.log" 2>&1
rm -rf "$WS/w06"; cp -a "$WS/s06" "$WS/w06"; python3 -I "$SRC/tools/screenkit/scale_layout.py" "$WS/s06/fit/layout.json" "$WS/w06/fit/layout.json" --benny-h 0.468
blender -b --python "$SRC/tools/screenkit/blender_kit.py" -- "$WS/w06/fit/layout.json" "$WS/w06/game/scene.glb" > "$WS/w06/fit/blender.log" 2>&1
python3 - "$WS/w06/fit/layout.json" "$WS/w06/game/layout.json" <<'PY'
import json, sys
L = json.load(open(sys.argv[1]))
for i, c in enumerate(L['cams']): c['plate'] = f'plate_{i}.png'; c['mask'] = f'mask_{i}.png'
json.dump(L, open(sys.argv[2], 'w'))
PY
NODE_PATH=$(npm root -g) node "$SRC/tools/screenkit/screen_export.cjs" "$WS/w06/game" "$WS/w06/app" > "$WS/w06_export.log" 2>&1
mkdir -p "$G/a06/baked"; cp "$WS/w06/game/layout.json" "$WS/w06/game/scene.glb" "$G/a06/"; cp "$WS/w06/app/baked/"* "$G/a06/baked/"
python3 -I "$SRC/tools/world/world_layout.py" "$G/a04/layout.json" "$G/aAB/section.json" "$G" "$G/a05/layout.json" "$G/a06/layout.json" | tee "$WS/world_layout.log"
blender -b --python "$SRC/tools/world/blender_connectors.py" -- "$G/connectors_spec.json" "$G/connectors.glb" > "$WS/connectors.log" 2>&1 || { tail -20 "$WS/connectors.log"; exit 1; }
cp "$SRC/tools/world/world.html" "$G/play3.html"; cp "$SRC/tools/kit05/controls.js" "$SRC/tools/kit05/swimfx.js" "$G/"
for f in benny31.glb bake.png coin.png splash.png bubble.png glint.png; do cp -L "$WS/w04/game/$f" "$G/$f"; done
ln -sfn /tmp/rainbow_r34/node_modules "$G/node_modules"
echo "world ready: $G/play3.html"

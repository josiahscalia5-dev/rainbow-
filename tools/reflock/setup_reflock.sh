#!/usr/bin/env bash
# Reference-Locked 3D Scene Builder: one-command runnable workspace for a screen.
#   bash tools/reflock/setup_reflock.sh <screen NN> <workspace> [asset_repo=/home/user/rainbow-]
# = the kit workspace (Benny, controls, swim fx, three.js, kit.json camera / river line; tools/kit05/setup_kit.sh, unchanged)
# + the PHYSICAL bake of the screen's approved picture (bake_phys.py) + the physical page (make_page.py -> reflock.html)
# -> <ws>/game/play3.html is the physical scene (the kit page in <ws>/kit_game is left as it was for BEFORE comparisons).
# SKIP_BAKE=1: only rebuild the page (after editing make_page.py).
set -e
NN=${1:?screen}; WS=${2:?workspace}; AR=${3:-/home/user/rainbow-}
SRC=$(cd "$(dirname "$0")/../.." && pwd); CFG="$SRC/tools/reflock/screens/$NN.json"
[ -f "$CFG" ] || { echo "no screen config $CFG"; exit 2; }
mkdir -p "$WS"; WS=$(cd "$WS" && pwd)
if [ -z "$SKIP_BAKE" ] || [ ! -f "$WS/phys/phys.json" ]; then
  [ -f "$WS/kit/kit.json" ] || bash "$SRC/tools/kit05/setup_kit.sh" "$WS" "$AR" >/dev/null
  python3 -I "$SRC/tools/reflock/bake_phys.py" "$CFG" "$WS/phys" > "$WS/phys/bake.log" 2>&1 || { mkdir -p "$WS/phys"; python3 -I "$SRC/tools/reflock/bake_phys.py" "$CFG" "$WS/phys"; exit 1; }
fi
python3 -I "$SRC/tools/reflock/make_page.py" >/dev/null
rm -rf "$WS/kit_game"; cp -a "$WS/game" "$WS/kit_game" 2>/dev/null || true   # BEFORE = the kit page as it is today
cp -f "$SRC/tools/kit05/kitgame.html" "$WS/kit_game/play3.html"
for f in "$WS"/kit/*.png "$WS/kit/kit.json"; do ln -sf "$f" "$WS/kit_game/$(basename "$f")"; done
cd "$WS/game"
for f in "$WS"/phys/*.png "$WS/phys/phys.json"; do ln -sf "$f" "$(basename "$f")"; done
cp -f "$CFG" screen.json
cp -f "$SRC/tools/reflock/reflock.html" play3.html
cp -f "$SRC/tools/kit05/controls.js" controls.js; cp -f "$SRC/tools/kit05/swimfx.js" swimfx.js; cp -f "$SRC/tools/kit05/live.js" live.js
echo "reference-locked scene ready: $WS/game (physical)   BEFORE: $WS/kit_game (kit page)"

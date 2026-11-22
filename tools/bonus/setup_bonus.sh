#!/usr/bin/env bash
# Round 38: runnable folder for the BONUS test page (isolated from the game and from Screen 05's kit page).
#   bash tools/bonus/setup_bonus.sh <workspace>     -> <ws>/bonus/play3.html (= tools/bonus/bonus.html) + the shared kit files
# Reuses tools/kit05/setup_kit.sh for kit.json, Benny, sprites, controls.js, swimfx.js, live.js and three.js (SKIP_BAKE when already baked).
set -e
SRC=$(cd "$(dirname "$0")/../.." && pwd); WS=${1:?workspace}; mkdir -p "$WS"; WS=$(cd "$WS" && pwd)
[ -f "$WS/kit/kit.json" ] && export SKIP_BAKE=1
bash "$SRC/tools/kit05/setup_kit.sh" "$WS" >/dev/null
mkdir -p "$WS/bonus"; cd "$WS/bonus"
for f in "$WS"/game/*; do b=$(basename "$f"); [ "$b" = play3.html ] && continue; ln -sfn "$(readlink -f "$f")" "$b"; done
ln -sfn "$(readlink -f "$WS/game/node_modules")" node_modules
cp -f "$SRC/tools/bonus/bonus.html" play3.html
# round 39: Sock Rescue fitted to its picture (camera + tunnel) and the picture's clean plate (free fill)
(cd "$SRC" && python3 -I tools/bonus/fit_sock.py "$WS/bonus" "$WS/kit/kit.json" >/dev/null && python3 -I tools/bonus/plate_sock.py "$WS/bonus" >/dev/null)
echo "bonus test ready: $WS/bonus  (?area=sock)"

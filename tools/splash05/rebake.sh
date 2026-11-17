#!/usr/bin/env bash
# Screen 05 wake card + approved bubbles: re-solve against the CURRENT game (run after any change behind them: env05 walls /
# rings, the water05 texture, Benny). ~30 s, one render slot. Writes assets/textures/splash05/* and assets/textures/bub05/*.
#   bash tools/splash05/rebake.sh [extra bake.py args, e.g. --only=bub]
# 1. probe the locked frame with the master switch but WITHOUT the splash / bubble parts (and the old splash + spray hidden)
# 2. solve the layers against that background (tools/splash05/bake.py)
set -euo pipefail
cd "$(dirname "$0")/../.."
W=tools/splash05/work
mkdir -p "$W"
node tools/splash05/probe.mjs --q='match05=1&splash05m=0&bub05=0' --out="$W/probe.json" --bg="$W/bg.png"
python3 -I tools/splash05/bake.py --bg="$W/bg.png" --probe="$W/probe.json" "$@"

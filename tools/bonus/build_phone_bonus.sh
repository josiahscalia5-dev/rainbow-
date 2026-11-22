#!/usr/bin/env bash
# Round 39: phone build of a bonus test area = tools/kit05/build_phone.sh + the bonus-only files (fitted camera, picture plate).
#   AREA=sock bash tools/bonus/build_phone_bonus.sh <ws>/bonus <out>
set -e; SRC=$(cd "$(dirname "$0")/../.." && pwd)
PRESET="area=${AREA:-sock}" bash "$SRC/tools/kit05/build_phone.sh" "$1" "$2"
for f in sockfit.json sock_plate.png; do [ -e "$1/$f" ] && cp -L "$1/$f" "$2/$f"; done; echo "bonus extras copied"

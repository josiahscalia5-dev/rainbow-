#!/usr/bin/env bash
# Installs headless Blender for Rainbow environment/character work (idempotent).
# Needs network access to download.blender.org (+ apt mirrors for libegl1).
#   bash scripts/setup-blender.sh          -> /opt/blender/blender, symlinked to /usr/local/bin/blender
set -euo pipefail
VER="${BLENDER_VERSION:-5.3.0}"
SERIES="${VER%.*}"
DEST=/opt/blender
if [ ! -x "$DEST/blender" ] || ! "$DEST/blender" --version 2>/dev/null | grep -q "Blender $VER"; then
  tmp="$(mktemp -d)"
  curl -sSL -o "$tmp/blender.tar.xz" "https://download.blender.org/release/Blender${SERIES}/blender-${VER}-linux-x64.tar.xz"
  rm -rf "$DEST" && mkdir -p "$DEST"
  tar -xJf "$tmp/blender.tar.xz" -C "$DEST" --strip-components=1
  rm -rf "$tmp"
fi
if ! ldconfig -p | grep -q libEGL.so.1; then
  (apt-get update -qq && apt-get install -y -qq libegl1 libsm6 libxi6 libxkbcommon0) > /dev/null 2>&1 || true
fi
ln -sf "$DEST/blender" /usr/local/bin/blender
blender --version | head -1

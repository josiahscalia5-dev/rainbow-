#!/usr/bin/env bash
# Rainbow (josiahscalia5-dev/rainbow-) container setup: real LFS assets, Android SDK, Blender 5.3,
# World Labs Claude Code plugin. Every step is non-fatal so a session always starts.
# Saved as the setup script of the claude.ai cloud environment "rainbow-" (approved 2026-11-15).
# It runs from the folder that holds the checkout, before Claude starts. Re-paste it there if lost.
if [ -d rainbow- ]; then
  (cd rainbow- && git lfs pull) || echo "rainbow: git lfs pull failed"
fi
SDK=/opt/android-sdk
if [ ! -x "$SDK/cmdline-tools/latest/bin/sdkmanager" ]; then
  mkdir -p "$SDK" && cd "$SDK" \
    && curl -sSL -o clt.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip \
    && unzip -q -o clt.zip -d tmp && mkdir -p cmdline-tools && rm -rf cmdline-tools/latest \
    && mv tmp/cmdline-tools cmdline-tools/latest && rm -rf tmp clt.zip; cd - > /dev/null
fi
if [ -x "$SDK/cmdline-tools/latest/bin/sdkmanager" ]; then
  yes | "$SDK/cmdline-tools/latest/bin/sdkmanager" --licenses > /dev/null 2>&1
  "$SDK/cmdline-tools/latest/bin/sdkmanager" "platform-tools" "platforms;android-34" "build-tools;34.0.0" > /dev/null 2>&1 \
    || echo "rainbow: sdkmanager failed"
fi
if [ ! -x /opt/blender/blender ]; then
  t="$(mktemp -d)"
  curl -sSL -o "$t/b.tar.xz" https://download.blender.org/release/Blender5.3/blender-5.3.0-linux-x64.tar.xz \
    && mkdir -p /opt/blender && tar -xJf "$t/b.tar.xz" -C /opt/blender --strip-components=1 || echo "rainbow: blender failed"
  rm -rf "$t"
fi
[ -x /opt/blender/blender ] && ln -sf /opt/blender/blender /usr/local/bin/blender
ldconfig -p | grep -q libEGL.so.1 || (apt-get update -qq && apt-get install -y -qq libegl1) > /dev/null 2>&1
C="$(command -v claude || echo /opt/node22/bin/claude)"
if [ -x "$C" ]; then
  "$C" plugin marketplace add worldlabsai/skills > /dev/null 2>&1
  "$C" plugin install worldlabs@worldlabs > /dev/null 2>&1 || echo "rainbow: worldlabs plugin install failed"
fi
exit 0

#!/usr/bin/env bash
# Rainbow (josiahscalia5-dev/rainbow-): real Git LFS assets, Blender 5.3.0, Android SDK 34, World Labs plugin.
# Every step is non-fatal so a session always starts. Copy: scripts/cloud-env-setup.sh
if [ -d rainbow- ]; then
  (cd rainbow- && git lfs pull) || echo "rainbow: git lfs pull failed"
  (cd rainbow- && bash scripts/setup-blender.sh) || echo "rainbow: blender setup failed"
  (cd rainbow- && bash scripts/setup-android-sdk.sh) || echo "rainbow: android sdk setup failed"
fi
C="$(command -v claude || echo /opt/node22/bin/claude)"
if [ -x "$C" ]; then
  "$C" plugin marketplace add worldlabsai/skills > /dev/null 2>&1
  "$C" plugin install worldlabs@worldlabs > /dev/null 2>&1 || echo "rainbow: worldlabs plugin failed"
fi
exit 0

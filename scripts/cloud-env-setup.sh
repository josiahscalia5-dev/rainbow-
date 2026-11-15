#!/usr/bin/env bash
# Rainbow (josiahscalia5-dev/rainbow-): real Git LFS assets, Blender 5.3.0, Android SDK 34, World Labs plugin.
# Every step is non-fatal so a session always starts. Copy: scripts/cloud-env-setup.sh
if [ -d rainbow- ]; then
  (cd rainbow- && git lfs pull) || echo "rainbow: git lfs pull failed"
  (cd rainbow- && bash scripts/setup-blender.sh) || echo "rainbow: blender setup failed"
  (cd rainbow- && bash scripts/setup-android-sdk.sh) || echo "rainbow: android sdk setup failed"
  (cd rainbow- && bash scripts/setup-worldlabs-plugin.sh) || echo "rainbow: worldlabs plugin setup failed"
fi
exit 0

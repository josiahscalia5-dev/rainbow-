#!/usr/bin/env bash
# Rainbow (josiahscalia5-dev/rainbow-): real Git LFS assets, Blender 5.3.0, Android SDK 34, World Labs plugin.
# Every step is non-fatal so a session always starts. Copy: scripts/cloud-env-setup.sh
if [ -d rainbow- ]; then
  # A pull that failed once leaves "access = basic" in .git/config and every later pull then asks for a
  # username (fails in a container). Clear it first; the session git proxy supplies the GitHub login.
  (cd rainbow- && git config --unset-all "lfs.https://github.com/josiahscalia5-dev/rainbow-.git/info/lfs.access"; true)
  (cd rainbow- && git lfs pull) || echo "rainbow: git lfs pull failed (the SessionStart hook retries)"
  (cd rainbow- && npm ci --no-audit --no-fund > /dev/null 2>&1) || echo "rainbow: npm ci failed"
  (cd rainbow- && bash scripts/setup-blender.sh) || echo "rainbow: blender setup failed"
  (cd rainbow- && bash scripts/setup-android-sdk.sh) || echo "rainbow: android sdk setup failed"
  (cd rainbow- && bash scripts/setup-worldlabs-plugin.sh) || echo "rainbow: worldlabs plugin setup failed"
fi
exit 0

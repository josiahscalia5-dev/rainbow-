#!/usr/bin/env bash
# Rainbow (josiahscalia5-dev/rainbow-) cloud-environment setup script: paste it into claude.ai ->
# Claude Code -> environment settings -> Setup script. It runs as root before Claude starts, from the folder
# that holds the repository checkout, and installs TOOLS only (npm packages, Python QA libraries, Blender 5.3.0,
# Android SDK 34, World Labs plugin), skipping anything already installed. It never touches git: the
# repository's SessionStart hook (scripts/claude-bootstrap.sh --hook) merges newer work, restores Git LFS and
# re-arms the five-minute autosave. Every step is non-fatal so a session always starts.
if [ -f rainbow-/scripts/claude-bootstrap.sh ]; then
  bash rainbow-/scripts/claude-bootstrap.sh --env-setup || echo "rainbow: env-setup reported problems"
elif [ -d rainbow- ]; then   # old checkout (e.g. the old default branch) without the bootstrap
  (cd rainbow- && npm ci --no-audit --no-fund > /dev/null 2>&1) || echo "rainbow: npm ci failed"
  (cd rainbow- && bash scripts/setup-blender.sh) || echo "rainbow: blender setup failed"
  (cd rainbow- && bash scripts/setup-android-sdk.sh) || echo "rainbow: android sdk setup failed"
fi
exit 0

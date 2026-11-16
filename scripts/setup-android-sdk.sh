#!/usr/bin/env bash
# Installs the Android SDK pieces the Rainbow Capacitor build needs (idempotent: skips everything that is
# already installed, so a second run makes no network calls).
# Needs network access to dl.google.com. Java 17+ and Gradle come from the container image.
#   bash scripts/setup-android-sdk.sh            -> /opt/android-sdk
set -euo pipefail
SDK="${ANDROID_HOME:-/opt/android-sdk}"
PLATFORM="${ANDROID_PLATFORM:-android-34}"
BUILD_TOOLS="${ANDROID_BUILD_TOOLS:-34.0.0}"
CLT="${ANDROID_CMDLINE_TOOLS:-11076708}"
if [ -d "$SDK/platforms/$PLATFORM" ] && [ -x "$SDK/build-tools/$BUILD_TOOLS/aapt2" ] && [ -x "$SDK/platform-tools/adb" ]; then
  echo "SDK_DONE $SDK (already installed: $PLATFORM, build-tools $BUILD_TOOLS, platform-tools)"
  exit 0
fi
mkdir -p "$SDK" && cd "$SDK"
if [ ! -x cmdline-tools/latest/bin/sdkmanager ]; then
  curl -sSL -o clt.zip "https://dl.google.com/android/repository/commandlinetools-linux-${CLT}_latest.zip"
  unzip -q -o clt.zip -d tmp && mkdir -p cmdline-tools && rm -rf cmdline-tools/latest \
    && mv tmp/cmdline-tools cmdline-tools/latest && rm -rf tmp clt.zip
fi
export ANDROID_HOME="$SDK" ANDROID_SDK_ROOT="$SDK"
yes | cmdline-tools/latest/bin/sdkmanager --licenses > /dev/null 2>&1 || true
cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;$PLATFORM" "build-tools;$BUILD_TOOLS" > sdk-install.log 2>&1
echo "SDK_DONE $SDK"

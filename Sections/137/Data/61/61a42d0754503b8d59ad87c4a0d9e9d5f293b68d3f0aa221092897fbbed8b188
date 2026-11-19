#!/usr/bin/env bash
# Installs the Android SDK pieces the Rainbow Capacitor build needs (idempotent).
# Needs network access to dl.google.com. Java 17+ and Gradle come from the container image.
#   bash scripts/setup-android-sdk.sh            -> /opt/android-sdk
set -euo pipefail
SDK="${ANDROID_HOME:-/opt/android-sdk}"
mkdir -p "$SDK" && cd "$SDK"
if [ ! -x cmdline-tools/latest/bin/sdkmanager ]; then
  curl -sSL -o clt.zip https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -q -o clt.zip -d tmp && mkdir -p cmdline-tools && rm -rf cmdline-tools/latest \
    && mv tmp/cmdline-tools cmdline-tools/latest && rm -rf tmp clt.zip
fi
export ANDROID_HOME="$SDK" ANDROID_SDK_ROOT="$SDK"
yes | cmdline-tools/latest/bin/sdkmanager --licenses > /dev/null 2>&1 || true
cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" > sdk-install.log 2>&1
echo "SDK_DONE $SDK"

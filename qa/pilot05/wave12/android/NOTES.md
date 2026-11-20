# Android builds for wave 12 (2026-11-16 ~14:35 UTC, session `013VHsJB`, branch `ccr-451ea8c7-3nqlis`)

| APK (Git LFS) | built with | SHA-256 | Screen 05 shows |
|---|---|---|---|
| `builds/rainbow-debug-w12-water.apk` (7.39 MB) | `VITE_RAINBOW_Q05='silk05=1&puff05=1&glow05=1&flowcam05=1' npm run android:debug` | `fdbf9c69…a3abe808211` | the W12 water experiment (switches baked in: Android has no URL query) |
| `builds/rainbow-debug-T2-default.apk` (7.66 MB) | `npm run android:debug` | `7f89d6ba…13d2969` | the current default T2 build |
| `builds/rainbow-debug.apk` (unchanged) | 2026-11-15 | `dca8d754…` | the old build from before the Screen 05 waves — kept, not overwritten |

Both: BUILD SUCCESSFUL (Gradle 8.2.1 wrapper, Android SDK 34, build-tools 34.0.0, Java 21; ≈1.5 min each; logs
`build_w12_log.txt`, `build_default_log.txt`). `apksigner verify`: Android debug certificate. `aapt`: package
`com.rainbow.washergame`, versionName 1.0, minSdk 22, targetSdk 34, launchable `MainActivity` "Rainbow".
The size difference is zip compression only: the packed files differ by 1 byte (the baked switch string) and hashed
file names.

## Validated without a phone (`scripts/apk-web-check.mjs`)
The web bundle packed inside each APK (`assets/public`) was served as-is and run in headless Chromium + WebGL2, with NO
URL query, at the Screen 05 checkpoint:
* experiment APK → pixel-identical to the dev-server capture `?silk05=1&puff05=1&glow05=1&flowcam05=1`
  (`apk_w12_web_05.png`, max diff 0) — the new water really is inside the APK; errors [].
* default APK → pixel-identical to `qa/pilot05/current_default_05.png` (T2) (`apk_default_web_05.png`, max diff 0);
  the baked string is absent from its bundle.
`apk_pixel_checks.json`, `apk_*_web_05.json`.

## NOT verified
* **Real device frame rate.** No Android phone or emulator is available in this cloud container (no KVM / GPU), so
  device fps, thermal behaviour and touch input on a phone are UNVERIFIED. The only cost figures are relative ones from
  headless SwiftShader (CPU): W12 full +2.9 % frame time (high quality), +5.2 % (low quality), same 86 draw calls and
  triangles, +2 small textures (`../tests/perf_*_864x1536.json`). The bloom pass already existed in every build, so
  glow05 changes its parameters, not its cost.
* To measure on a phone: install `builds/rainbow-debug-w12-water.apk` and `builds/rainbow-debug-T2-default.apk`
  (`adb install -r …`), ride to Screen 05, compare with Chrome remote debugging (`chrome://inspect`, Performance panel).

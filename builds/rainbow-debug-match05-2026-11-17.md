# rainbow-debug-match05-2026-11-17.apk — EXPERIMENT build (not the default game)

* Built 2026-11-17 ~02:43 UTC, session 01VCMXob, from commit `aefa92b` (snapshot of the 156 build-input files, all verified
  identical to that commit). It holds no half-finished specialist work.
* Command: `VITE_RAINBOW_Q05="match05=1" npm run android:debug`, so Screen 05 shows the `?match05=1` look (checkpoint cp3:
  83.6 % of pixels within 20 levels of `references/05_flow_into_the_current.png`). All 11 screens are in it.
* Verified: Screen 05 captured from the packaged web bundle with NO URL switches == the `?match05=1` capture (0 px);
  the APK's 70 web files are byte-identical to that bundle.
* Package `com.rainbow.washergame` 1.0 (versionCode 1), minSdk 22, targetSdk 34, debug-signed (Android Debug certificate).
  SHA-256 `ca139ac35dfd40321916138dd6e6b59e1ef5408da6d42acf41b0975c07bb8b1b`, 25,034,941 bytes.
* The Google Flow videos are not in the repository (`public/video/` holds only a placeholder), so the opening and the
  ending play the real-time 3D cinematic fallback (`docs/FLOW_VIDEO.md`).
* Not tested on a phone or emulator (none here); no on-device performance numbers yet.

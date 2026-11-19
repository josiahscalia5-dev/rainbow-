# Restore the Screen 06 experiment

## Open on a phone

The `playable/` folder holds a debug APK with its own application ID, `com.rainbow.washergame.review.s06.recessedcrest`. Select **Swim from the stage entrance** for the full stage. Select **Swim from the artwork viewpoint** to begin at the reference camera. Use the game's touch controls. The desktop browser version and all editable game sources are in the same folder.

## Rebuild the candidate

Extract `playable/Rainbow_Screen06_Editable_Game.zip` and work in its `rainbow/` directory. For the entire branch history, clone the private Rainbow repository on `codex/s06-recessed-rinse-shoulder` with Git LFS. The private Git parent is `codex/s06-open-crest-camera-fit` at `35d1de74f3e9a6c6e114b49fd9764db0df5f5e90`. The retained Screen 06 specialist is `claude/rainbow-s06-match-c18` at `c649fcbc35780e11cefce83eb54684f1d55752a5`. The earlier local QA report is stored separately under `checkpoint/`. Use a fresh directory for any restoration or captures.

```sh
npm ci
npm run verify:refs
npm run typecheck
npm run test:continuity
npm run build
npx vite preview --host 127.0.0.1 --port 7906 --strictPort
```

The capture queries identify Claudia's retained setup and the opt-in candidate. Compiling the source does not enable the candidate on any protected branch. The supplied review launcher selects the proper flags. See `playable/reproduce/README_BUILD.md` for Android SDK 34, Gradle 8.2.1, the standalone Web launcher and the separate debug identity.

## Capture matching gameplay

Copy the contents of `reproduce/` into a fresh directory with Playwright 1.62.1 and a working local Chromium. Keep its `fixture/06/gameplay-test.mjs` alongside the capture script so the project’s eight assertions run from the same checkout. This run used Chromium with SwiftShader on the Cloud host. FFmpeg encoded the uninterrupted inlet-to-exit ride. Each frame advances the actual playable simulation by five fixed 1/60-second steps. At 12 output frames per second, the saved clip follows game time. Camera and steering logs live alongside each clip.

```sh
export RAINBOW_BASE_URL=http://127.0.0.1:7906
export RAINBOW_CHROMIUM=/usr/bin/chromium
node capture.cjs stills 06:BEFORE 06:NEW
node capture.cjs ride 06:BEFORE 06:NEW
node capture.cjs full-safe 06:BEFORE 06:NEW
node capture.cjs repeat 06:BEFORE 06:NEW
```

The captures use a native 864 × 1,536 viewport at the saved reference camera and matched forward, steering and exit poses. The movie is 648 × 1,152 H.264. The exact full-steer stills can exercise the normal wall-contact behavior. The continuous comparison uses the stored steering sequence and preserves five hearts. The independent full-game route verifies the final score and progression.

## Check the evidence

`checks/visibility.json` identifies physical surfaces in the previously specified +3 rectangle. A separate flat-color pass used the real game camera at 270 × 480. The lit full-size frames remain the visual evidence. The scripts and opaque-surface captures under `diagnostics/` reproduce the measurement. The source ZIP and outer archive have SHA-256 inventories. The included Blender scene and verification are under `editable/`. The documented launcher verifies that the resources in the Android APK and browser ZIP match the motion-capture build. Physical Android performance still requires hardware testing.

The source kit carries unchanged Google Flow placement instructions; the external Flow masters were not needed for this Screen 06 experiment.

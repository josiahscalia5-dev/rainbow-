# Restore the playable Screen 06 review

## Android phone

Open the debug APK in `playable/`. The review app has its own ID, `com.rainbow.washergame.review.s06.roundedcrest`. Choose **Swim from the stage entrance** to steer from inlet to exit, or **Swim from the artwork viewpoint** to start at the registered composition. Hold either side of the screen or drag to steer. The developer’s signature and hardware measurements for a production release are separate.

## Source and build

Extract `playable/Rainbow_Screen06_Editable_Game.zip` and enter its `rainbow/` folder. Use the dependency lockfile. The complete isolated experiment, evidence and history are on `codex/s06-rounded-crest-and-washer-bend` in the private Rainbow repository. The working copy was based on `codex/s06-recessed-rinse-shoulder` at `d350d02eb14c20010f1b3dcfae4ff9fdb2154150`. The separate retained specialist is `claude/rainbow-s06-match-c18` at `c649fcbc35780e11cefce83eb54684f1d55752a5`. The earlier local QA report is beside the checkpoint record. Use an isolated checkout to inspect either version.

```sh
npm ci
npm run verify:refs
npm run typecheck
npm run test:continuity
npm run build
npx vite preview --host 127.0.0.1 --port 7906 --strictPort
```

The ready-to-play Web ZIP has its own README. Its launcher sets the exact query flags. The Android launcher and browser instructions in `playable/reproduce/` use Java 21, Gradle 8.2.1 and Android SDK 34. The evidence uses portrait framing at 864 × 1,536. The unchanged Google Flow workflow manages the original video masters separately.

## Edit the scenery in Blender

`editable/Screen06_Rounded_Crest_Authoring.blend` contains the rounded water mesh, fittings, supplemental foam, original cameras and parent survey geometry. `editable/Screen06_Rounded_Crest_Runtime.blend` contains the nine assembled scenery meshes extracted from the revised running game, the packed original image and the opening, +3 and +6 cameras. Blender's materials support editing and inspection. Use the actual playable renderer for the final animated water, lamps, HUD, wake and reflections.

The production game loads `assets/rounded-crest06/rounded-spillway.glb` only with the rounded-crest query flag active. The Blender authoring script uses the previous editable scene and existing ring station measurements. To reproduce the geometry in a clean output directory, supply ordinary paths in the following order.

```sh
blender -b editable/INPUT_Previous_Crest.blend --python-exit-code 1 -P rainbow/tools/blender/rounded-crest06/build_rounded_crest.py -- rainbow/tools/blender/rounded-crest06/washer-seats.json output/authoring.blend output/rounded-spillway.glb
```

This pass used Blender 5.3.0 and the official Blender Lab MCP bridge at `2cea8d566dde07fbac28a61d698909d69724e853`. The Blender Python command implements the same modeling operation locally. Three.js reads the exported normals and metric UVs and assigns the game materials. The recovered runtime file was checked against the actual positions, topology, UV coordinates and three registered cameras.

## Reproduce the swimming comparison

Use `reproduce/` in a fresh directory with Playwright 1.62.1, Chromium, FFmpeg, Pillow, pngjs and Pixelmatch 7.1.0. The capture script reads `queries.json` for the previous game and adds `flags.json` for the revised game. Its fixture is the project's saved eight-assertion gameplay suite. Use the local URL for the running production build. For a system Chromium path other than `/usr/bin/chromium`, set `RAINBOW_CHROMIUM`.

```sh
export RAINBOW_BASE_URL=http://127.0.0.1:7906
node capture.cjs stills 06:BEFORE 06:NEW
node capture.cjs ride 06:BEFORE 06:NEW
node capture.cjs full-safe 06:BEFORE 06:NEW
node capture.cjs repeat 06:BEFORE 06:NEW
node opaque-surfaces.cjs BEFORE parent
node opaque-surfaces.cjs NEW revised
python compare-opening.py ../APPROVED/SCREEN06_APPROVED.jpg proof/06/BEFORE/opening.png --candidate proof/06/NEW/opening.png --repeat proof/06/BEFORE/opening-repeat.png
```

The movie starts at the Screen 06 inlet. The original approved camera is farther along the same course. Each recorded gameplay frame advances five consecutive 1/60-second game steps. Both rides use the same steering and clock, retain five hearts and cross into Screen 07. Hard-left and hard-right stills exercise the steering limits separately. One screenshot supplies one measured viewpoint. Further views are proposed continuations for owner review.

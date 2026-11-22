# RAINBOW — mobile game: what has been built so far (summary for a second reviewer)

Written 2026-11-22 by Claude Code (round 45). Repository: GitHub `josiahscalia5-dev/rainbow-`, working branch `ccr-c1b272d2-3ru7yx`.

## 1. The game
A portrait mobile game (Android, built with Capacitor + three.js / WebGL). Hero: **Benny**, a small pink fluffy creature with a purple-and-white
knitted hat and a yellow star, hidden in a towel that a cartoon girl puts in a washing machine. Benny rides the water through the washer and gets
back into the towel at the end. 11 screens, each defined by an APPROVED picture made by the owner (the visual target):

| # | screen | type |
|---|---|---|
| 01 | Inside washer: girl and towel | Google Flow video (made by the owner) |
| 02 | Mascot tumbles in whirlpool | Flow video |
| 03 | Whirlpool twirl | Flow video |
| 04 | Through the five arrows | real 3D gameplay |
| (A, B) | Bubble Dash chamber, Sock Rescue tunnel (bonus areas between 04 and 05) | real 3D gameplay |
| 05 | Flow into the current (winding pink/cyan S-river in a purple drum with gold rings) | real 3D gameplay |
| 06 | Crest the rinse arch (rising rainbow crest) | real 3D gameplay |
| 07 | Dive the washer tube | real 3D gameplay |
| 08 | Final spin chamber | real 3D gameplay (not rebuilt yet in the new world) |
| 09 | Ride the final wave | real 3D gameplay (not rebuilt yet) |
| 10 | Slide into hiding | real 3D gameplay (not rebuilt yet) |
| 11 | Safely home (final victory) | Flow video |
Gameplay: Benny swims forward automatically; the player swipes left / right to change lanes (swipe up = leap), collects coins; a chase camera
follows him. The owner's goal: each playable screen should look ~90 % like its approved picture, ALSO while Benny is swimming (not only one
start frame), with no messy / smeared areas, and all areas connected in ONE continuous 3D world (no page loads between them).

## 2. How the playable screens are built ("screen kit" pipeline, all free tools)
1. **Fit** (`tools/screenkit/screens/NN/fitNN.py`): measures the approved picture (vanishing point, ring circles, water line, Benny, coins,
   copper trays) and computes a 3D layout: camera, drum (tunnel) radius / axis, the river route through the painted coins, rings, trays.
2. **Masks** (`segment.py`, SAM 2.1 tiny + OpenCV): what the game draws itself (Benny, coins, HUD, bubbles) is masked out of the picture and
   filled in (Telea for Benny; small holes clone-filled from the same painting, `plate_clone.py`).
3. **Geometry** (Blender 5.3 headless, `blender_kit.py` + the Geometry Nodes asset library `gn_assets.py`: perforated drum, gold ring, water
   channel, channel body, foam bank, wall tray, machinery row) -> one GLB.
4. **Bake** (`bake.js`, run once offline in headless Chromium by `screen_export.cjs`): the approved picture is projected from its fitted camera
   onto the real 3D meshes (depth-tested) -> per-mesh textures. Plus ARTWORK-SAMPLED MATERIALS for everything the picture never saw: ring / tray
   templates fused from all visible rings / trays, a drum-wall "period" template phase-locked to the rings, water swatches and a flattened floor.
5. **Game page** (`screen.html` per screen; `tools/world/world.html` = the ONE connected world): three.js, Benny model, swipe controls
   (`tools/kit05/controls.js`), swim effects, coins, chase camera, HUD.
6. **Incremental cached builder** (`tools/screenkit/build.py`, `tools/world/build_world.py`): every step is cached by the hash of its inputs, so
   a shader change rebuilds nothing, a look change skips Blender and the bake (0.9 s instead of 30-45 s).
7. **Automated checks before recordings** (`preview.cjs` + `preview_sheet.py` + `qa.js`): stills at the picture view, beginning, quarter, middle,
   curves, end x left / centre / right lanes, a plain-gray geometry pass (holes show as green), Benny in frame, camera clearance, water contact,
   likeness at the picture camera, "repeated picture camera" further down the level, per-surface style match while swimming.
8. **Recordings** (`tools/reflock/section_run.cjs`): uninterrupted gameplay with real touch swipes, every frame checked (holes, camera jumps,
   Benny on screen, water gap, immersion).

## 3. Round 45 work (this session) on Screens 05 and 06
* 05: the camera keeps the approved view straight down the tunnel while swimming (`cam_axis`); new clean **ribbon water**
  (`tools/screenkit/water_ribbon.js`: S-shaped cyan / hot-pink bands measured from the painting + painted detail tiles cut from the picture,
  `water_detail.py`), warm bright core at the end of the tunnel, bubbly foam, foam banks + bubbles along the river, the painted splash cut from
  the approved picture (`splash_cut.py`), maximum-quality bake from the owner's 1080 x 1920 copy of the picture.
* 06: Benny stays upright on the steep banked crest (follows a third of the bank), level camera.
* The 05 -> 06 join is one continuous swim in the same scene (recorded: 1380 frames, 28/28 real swipes, Benny never off screen, camera
  max 1.2 deg per frame, no scenery moving with the camera, no holes inside 05 / 06; small holes only after 06 in the 06 -> 07 connector).
* Android test APK with the connected world (`VITE_RAINBOW_WORLD=1`): opening videos -> world 04 -> A -> B -> 05 -> 06 -> 07 -> game at 08;
  start buttons 04 / 05 / 06. Not yet tested on a real phone.

## 4. Measured now (scenery pixels within 20 colour levels of the approved picture, Benny / coins / HUD masked out)
| | at the approved camera | while swimming (style match of each surface vs the same surface in the picture) |
|---|---|---|
| 05 | **83.1 %** (80.4 % at the start of the round) | walls 86, rings 64, water 61, foam 36 |
| 06 | **84.8 %** | walls 88, rings 58, water 56, foam 30 |
| Bubble Dash (bonus A) | 90.7 % on its own page (87.4 % in the world) | - |
Owner's verdict so far: still not close enough while swimming; anything messy must be rebuilt.

## 5. Known remaining problems (honest list)
* 05: water cleaner but still plainer than the painting close up; in the right lane a foam bank near the camera reads as big white blocks and
  an unexplained pink patch appears beside it; top-of-frame wall / ring detail softer than the painting (most of the remaining gap at the camera).
* 06: beyond the painted stretch the rainbow crest edges become plain cyan water (a first rainbow-ribbon attempt looked worse and is off).
* 06 -> 07 connector has small holes; 08, 09, 10 not yet rebuilt with the kit; the APK has not been tested on a device.

## 6. What is in this zip
`images/approved/` the owner's approved pictures; `images/latest/` the newest comparison sheets (approved | game at the same camera | game while
swimming; before / now; water test; automated check sheets); `video/` the 05 -> 06 recordings and the join clip; `code/` the game source (`src/`)
and all pipeline / world / QA tools; `docs/` the round-45 notes. The APK is not included (247 MB): it is in the repository at
`qa/kit45/Rainbow_r45b_world_05_06_debug.apk`.

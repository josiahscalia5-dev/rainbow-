# Round 46 — Screens 05 + 06 finished fixes (2026-11-22)

Everything here is a real-time 3D render of the game (three.js, 412 x 915 phone portrait, software WebGL in the cloud), the same connected world
04 -> Bubble Dash -> Sock Rescue -> 05 -> 06 -> 07 as round 45. No picture is shown as a background; the approved pictures are only baked onto the
real 3D surfaces where the picture camera sees them. Free tools only; no paid credits.

BEFORE = the exact round-45b world, rebuilt from commit `94d5fc7` with the same builder; NEW = round 46. Both measured by the SAME automated checker
(`tools/screenkit/preview.cjs`, same positions, same masks, same thresholds).

## Files
| file | what |
|---|---|
| `screen05/05_1_APPROVED_vs_NEW_picture_view.jpg`, `screen06/06_1_...` | your approved picture beside the new game render at the picture camera |
| `screen05/05_2_BEFORE_vs_NEW_picture_view.jpg`, `screen06/06_2_...` | round 45b beside round 46 at the picture camera |
| `screen05/05_03..23_BEFORE_vs_NEW_<place>_<lane>.jpg`, `screen06/...` | begin, strongest bends, quarter, middle, three-quarter, end - each in the left, centre and right lane |
| `screen05/05_numbers.json`, `screen06/06_numbers.json` | the before / after numbers below |
| `run/GAMEPLAY_05_06_07_TEXTURED_real_touch.mp4` (+ `_checks.json`) | one uninterrupted textured run 05 -> 06 -> into 07, real CDP touch gestures, every frame checked |
| `run/GAMEPLAY_05_06_07_GRAY_geometry_real_touch.mp4` (+ `_checks.json`) | the same run with plain gray 3D materials (geometry test, green background = any hole) |
| `run/coins_check.json` | every coin passed, whether Benny collected it, his lane / height there |
| `evidence/` | the old faults side by side with the same frame now (frames 409-415 clipping + foam block, 60 seam, 1370 green hole) |
| `Rainbow_r46_world_05_06_debug.apk` | Android debug APK (see "APK" below) |

## Measured: before -> after (scenery pixels within 20 levels of the approved picture; style = 70 % colour histogram + 30 % detail vs the same surface in the approved picture)
| | 05 BEFORE | 05 NEW | 06 BEFORE | 06 NEW |
|---|---|---|---|---|
| picture camera: scenery within 20 levels | 83.4 % | **83.6 %** | 85.0 % | **84.9 %** |
| picture camera repeated 1..12 ring spacings down the level (mean) | 19.7 % | 18.6 % | 14.0 % | **20.2 %** |
| while swimming — walls | 86.1 | 83.3 | 87.4 | 86.9 |
| — gold rings | 63.8 | 64.1 | 57.6 | 57.7 |
| — water | 55.4 | **57.5** | 41.8 | **60.3** |
| — foam | 35.9 | 30.0 | 29.8 | 25.5 |
| — copper trays | 75.3 | 74.2 | 90.7 | 91.8 |
| colour look of the whole frame (mean) | 0.443 | 0.443 | 0.390 | **0.434** |
| hole pixels in the preview stills | 4 | **0** | 0 | 0 |
Your package listed 05 water ~61 / foam ~36, 06 water ~56 / foam ~30; the same r45b build re-measured here gives 55.4 / 35.9 and 41.8 / 29.8 (the
numbers above are all from one machine and one checker, so they compare like with like).

What the numbers say honestly:
* 06 water +18.5 (the plain cyan is gone), 06 repeated views +6.2, 06 colour look +0.044; 05 water +2.1; picture views unchanged (they must not move).
* walls -2.8 on 05: the repeated wall pattern no longer contains the orange tray smears / pale bubble shards (they were visible artefacts, but they
  added orange the painting has near its rings). Reported, not hidden.
* foam -5.9 / -4.3: the old foam's straight crystal facet lines counted as "detail" (detail part 0.90 -> 0.76); the colour part compares with a thin
  strip of the picture that is mostly river (0.13 before, 0.11 now) - this number does not represent the painted foam; look at the pictures.
* 90-95 % is NOT reached: the picture camera stays at 83.6 % / 84.9 %; the gap is fine wall / ring detail at the top of the frame, the painted
  stretch seen from just before the picture camera, and the hazy area hidden behind the painted Benny (see "still different").

## Whole-run checks (same 28-touch plan as round 45b, `qa/kit45/run/swipe_plan_05_06.json`, start s 88, 48 s = 1,440 frames > r45b 1,380)
WHOLE_RUN_TABLE

## Still different from the approved pictures (not hidden)
* The picture camera match stays ~84-85 % (goal 90-95 %): fine wall / ring detail at the top of the frame and the far tunnel differ most.
* Swimming toward the picture position (05 ~s 95, 06 ~s 148) the painted stretch ahead is visible as a patch with an edge: the painted pixels are only
  exact from the picture camera; beside / behind them the generated ribbon water starts.
* 06 picture camera: the area hidden behind the painted Benny in your picture has no painted pixels (the bake fills it with a guess) - a hazy patch
  around Benny, the same in round 45b.
* The repeated wall pattern still has some flat pink patches (where tray pixels were removed) and 06's far wall segments near the 06 -> 07 connector
  carry a few pale painted fragments (baked from far away, magnified when close).
* Two thin straight pink lines run along 06's river after the crest (the channel body edges), as in round 45b.
* Screen 07 (not reworked this round, as asked): its own wall template still has orange smears; just past the connector (s ~194.8) its pool lies
  7 cm above Benny's route for a moment.

## APK
`Rainbow_r46_world_05_06_debug.apk` (VITE_RAINBOW_WORLD=1): built here with Gradle 8.2.1 / SDK 34, signature verified (Android debug key),
package `com.rainbow.washergame`, minSdk 22 / targetSdk 34, same file list as the r45b APK except the world content; its world page is
byte-identical to the page in the recordings (apart from the app import map + play flag). **It was NOT run on a phone or emulator** - none is
available in this cloud container. On the world's first screen: Start 04 / Start 05 / Start 06.

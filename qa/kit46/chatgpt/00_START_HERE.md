# RAINBOW — round 46 package (Screens 05 + 06), start here

**Rainbow** is a mobile portrait 3D game (three.js in a Capacitor Android app, 412 x 915 phone frame). A pink plush mascot, **Benny** (dusty-rose fur,
knitted purple / white hat with a pompom and a yellow felt star), hides in a towel that a cartoon girl puts in a washing machine, then swims
through the machine. Screens 01-03 and 11 are the owner's own Google Flow videos; **Screens 04-10 are real playable 3D levels**, each built to
look like the owner's approved painting of that screen (`images/1_approved/`). This round finished Screens **05 "Flow into the current"** and
**06 "Crest the rinse arch"**. Everything you see in this package is a real 3D render of the game - never a picture used as a background.

## How to look at it (in this order)
1. `images/1_approved/` - the owner's approved paintings (the target).
2. `images/2_app_screens_now/` - the game right now, Screen 05 and Screen 06 (six phone frames each).
3. `images/3_phone_frames_final_run/` - 16 single phone frames from the final real-touch run, from the start of 05 to the entry of 07.
4. `images/4_before_vs_new/` - the previous round (45b) beside this round at the same places and lanes; `evidence/` = the exact bug frames.
5. `images/5_benny_swimming/` - consecutive frames: lane changes, a jump, the strongest bend, the steep 06 crest, the 06 -> 07 connector.
6. `video/` - the full 48 s run (textured, and the same run in plain gray geometry) + six short clips.
7. `measurements/` - the numbers; `code/` - the source (full files + `ROUND46_changes_vs_round45b.diff`); `docs/` - results README, notes, lessons.

## How Benny swims through the level
* **One connected world** (`code/tools/world/world.html`): Screen 04 -> Bubble Dash -> Sock Rescue -> **05** (route s 87.3-141.8) -> **06** (141.8-187.6)
  -> 07 (187.6-246.4) -> hand-over to the game at Screen 08. No loading between screens; connector tubes join the areas.
* **Automatic forward swimming** along the river's centre line (the "route"), 2.2 world units per second (Benny is 0.47 u tall, so about 4.7 of
  his own heights per second).
* **Steering by touch** (`code/tools/kit05/controls.js`): swipe left / right = one lane (three lanes: -0.3 / 0 / +0.3 u from the river centre).
  A lane change is a critically damped spring (95 % done in 0.26 s), never faster than 1.65 u/s, so double swipes and reversals never jump.
  **Swipe up = leap** (0.74 s, 60 % of his height, splash out and a buoyant dip on landing); **swipe down = dive** (under, hold, pop back up).
* **Body animation** (vertex shader in `world.html` + `controls.js`): the paws paddle alternately (power stroke down and back, ~1.2 strokes / s,
  1.9x faster while changing lanes), the lower back flutter-kicks, the body bobs a little on each stroke, the pompom swings with inertia, he banks
  up to 15 deg into a lane change and turns slightly toward it.
* **Real water contact**: the route lies on the 3D water surface (gap 1.2 cm, measured every frame: max 0.020 u in the final run); about 12 % of
  his body is under the surface (the painted look). On 06's banked crest (up to 72 deg) he follows a third of the bank so he stays upright like the
  painted Benny, still in the water (lean max 42 deg, changes smoothly).
* **Splash / wake**: each screen's own painted splash (cut from its approved picture) at his water line, plus a wake, paddle ripples, kick foam,
  droplets and bubbles on leaps and dives (`code/tools/kit05/swimfx.js`).
* **Camera**: at each approved picture position the camera is EXACTLY that picture's fitted camera; between them it is blended. In 05 the camera
  keeps the painting's view straight down the drum and slides with Benny (90 % of the river's swing, 65 % of his lane changes), stays in the
  drum's middle band (never against the wall), turns a little toward him near an edge (damped), and a final lens shift keeps his whole body
  (incl. paddling arms, hat, pompom) inside the screen. It follows 35 % of a jump's height.
* **Coins**: picked up when they touch his body (3D radius 0.13 u around his body segment).

## What was fixed this round (see `docs/RESULTS_README.md` for everything)
| problem reported | real cause found | fix |
|---|---|---|
| 05: Benny cut off at the right edge (frames 409-420) | the river was fitted through far painted coins and swung 0.84 u off the drum axis -> he swam at the drum floor's edge; the camera slid to 0.3 u from the wall; the edge guard ran before the wall clamp; the check ignored the paddling arms (really ~21 px off) | river swing soft-capped (0.43 u), camera middle band + damped turn, final lens-shift guard, check uses his real animated silhouette -> **0 frames off-screen** |
| 05: polygonal foam block + pink patch | the drum-edge foam bank lay in his lane; foam shader drew straight crystal facets; the pink patch = a blurry far wall 0.3 u from the lens | banks keep clear of the river, rounder heaps, round-bubble shading; camera away from the wall |
| 05: plain / streaky water, seams at both ends | connector water strips wore a plain swatch | ribbon water (cyan + hot-pink ribbons, sparkles, glossy arcs, glowing ribbon cores) on every water surface incl. connectors |
| 06: plain cyan beyond the painted stretch | no ribbon water in 06; the old rainbow test failed (pastel; GLSL `pow()` of a negative number blanked the pool) | 05's ribbon water + a rainbow band with colours measured on the painted crest |
| 06 -> 07: green hole | the open far end of the 07 tube | glowing end cap |
| (found during testing) Benny sank in the 06 -> 07 connector | the connector water used its own height curve | it now follows his route |
| (found) pale shards / orange smears on the walls | the repeated wall pattern sampled water, bubbles and trays from the painting | colour gate: only purple / magenta wall pixels |

## Numbers (same checker for before and after)
| | 05 before | 05 now | 06 before | 06 now |
|---|---|---|---|---|
| approved camera: scenery pixels within 20 levels of the painting | 83.4 % | 83.6 % | 85.0 % | 84.9 % |
| water style while swimming | 55.4 | 57.5 | 41.8 | 60.3 |
| repeated approved camera further down the level | 19.7 % | 18.6 % | 14.0 % | 20.2 % |
| whole run (1,440 frames, 28 real touch swipes): Benny off-screen / hole frames | 12 / 19 (r45b, 1,380 frames) | **0 / 0** | | |
Goal 90-95 % is NOT reached yet; the remaining differences are listed in `docs/RESULTS_README.md` ("Still different").

## Not included
The Android debug APK (247 MB) is in the owner's GitHub repository: `qa/kit46/Rainbow_r46_world_05_06_debug.apk`
(branch `claude/rainbow-screens-05-06-10w5xd`); it was built and its signature verified, but not run on a phone or emulator.

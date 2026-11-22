# Rainbow screen kit (round 43) — one reusable process from a screen's OWN approved picture to a playable, measured 3D level

Generalises the proven Bubble Dash / Sock Rescue method (`tools/reflock`, 90.7 %, left untouched) so every playable screen (04–10) is built
the same way from its own approved artwork: real connected 3D geometry fitted to the picture, the picture's pixels baked onto that
geometry once (never projected live, no picture planes, no painted characters), the shared Benny + swipe controls + camera follow.
Free tools only (Blender 5.3 Geometry Nodes, three.js 0.180, OpenCV, onnxruntime); no credits.

## One command
```
bash tools/screenkit/get_models.sh                      # once per machine: free SAM 2.1 tiny + Depth Anything V2 small (Apache-2.0, ~255 MB)
bash tools/screenkit/setup_screen.sh 06 /tmp/ws06       # fit -> SAM 2 masks + clean plate -> Blender -> game folder (~10 s)
NODE_PATH=$(npm root -g) node tools/reflock/section_run.cjs /tmp/ws06/game /tmp/st06 stills 1.2 0 'sentinel=1'      # still at the picture camera
python3 -I tools/screenkit/compare_screen.py 06 /tmp/st06/s1.20_l0.png /tmp/ws06/seg/mask.png /tmp/cmp06 [--before F]   # measured likeness
TOUCH=1 NODE_PATH=$(npm root -g) node tools/reflock/section_run.cjs /tmp/ws06/game /tmp/run06 run end '<plan>' 'sentinel=1'   # whole level, real touch
python3 -I tools/reflock/encode_run.py /tmp/run06 <out> <name>                                                          # video + hole count
bash tools/screenkit/build_screen_app.sh 06 /tmp/ws06   # prebaked copy for the app -> public/screen06 (test route ?kit06=1 / VITE_RAINBOW_KIT06=1)
```

## Files
| file | what | screen-specific? |
|---|---|---|
| `fitlib.py` | camera from a vanishing point, ring-drift camera offset, ray / cylinder, centripetal Catmull-Rom through painted points | no |
| `screens/NN/fitNN.py` | the screen's OWN measurements -> `layout.json` (camera, drum, route, coins, paddles, bubbles, per-screen look values) | **yes (the only code per screen)** |
| `screens/NN/segmentNN.json` | SAM 2 prompts: HUD rows, title box, Benny box + points, swirl, coins, bubbles | **yes (data)** |
| `segment.py` | SAM 2.1 masks of what the game draws itself + OpenCV clean plate (`tools/reflock/plate.py`) | no |
| `blender_kit.py` | Geometry Nodes library: `RB_Sweep_Tube` (drums / tubes), `RB_Sweep_Ribbon` + `RB_Sweep_Flume` (banked river channel + its body), `RB_Sweep_Band` (gold rings), `RB_FoamBank` (scattered lumpy foam), plus pools and copper wall paddles; builds whatever `layout.json` lists, exports one GLB with clean UVs | no |
| `screen.html` | the game page: bake from N fitted cameras (depth-tested, masked, sharpness guard), code materials in the painting's style where no painted pixel is sharp enough, UV-flow water, Benny 31, `tools/kit05/controls.js` swipes, chase camera = the fitted picture camera kept in the route frame (exact at the picture position, smoothed in motion), QA API (`step`, `renderNow`, `camInfo`, `bennyBox`, `bennyVisBox`, `setBenny`, `routeCheck`, `sceneAudit`, `bakeStats`) | no |
| `setup_screen.sh`, `screen_export.cjs`, `build_screen_app.sh`, `compare_screen.py` | runnable folder, offline bake, app copy, measurement | no |
| `eval/` | the SAM 2 / Depth Anything controlled evaluation (`qa/reflock/r43/EXTRACTION_EVAL.md`) | no |

## Lessons paid for in round 43 (Blender 5.3 / three.js)
* Blender 5: Capture Attribute has a **Selection** socket at index 1 — link items BY NAME (`inputs['v']`), or the UVs become 0/1 booleans
  (every face spanned the whole texture; the bake then wrote one world point everywhere).
* Curve to Mesh: profile X -> the curve's right side, profile **Y -> down** (Z_UP twist): negate y when the profile is written as (across, up).
* A cyclic circle profile makes one face wrap backwards across the whole UV range: use an OPEN full arc (`GeometryNodeCurveArc`, 2π).
* Curve tilt +t lowers the right edge; the game's bank +b raises it (`tilt = -bank`).
* Blender 5: modifier inputs cannot be set as ID properties — set the node group's input defaults, then apply.
* Smoothing the route pulls it off the painted points (Benny drifted 50 px; the coins became uncollectable): Catmull-Rom THROUGH them.
* A painted crest above eye height can only show its TOP surface if it is banked toward the viewer (water-slide turn): the fit banks it.

## Screen 06 results (round 43) — `qa/reflock/r43/06/`
At the picture camera (412 × 915, compare_to_approved.py, scenery = picture minus HUD / Benny / swirl / coins / bubbles):
**89.5 % of scenery pixels within 20 levels**, SSIM 0.865, colour look 0.997 (previous game Screen 06: 3.6 %, SSIM 0.16).

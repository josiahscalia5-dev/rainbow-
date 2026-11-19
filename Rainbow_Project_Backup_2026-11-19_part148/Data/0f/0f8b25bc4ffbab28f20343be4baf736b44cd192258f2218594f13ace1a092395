# Screen 05 — `?proj05=1`: the APPROVED water projected onto the real playable river

Session `012NR93Q…`, 2026-11-16 ~17:30–18:45 UTC, branch `ccr-e546a360-cxmton` (experiment branch; the user's
working version `ccr-451ea8c7-3nqlis` and the default build are untouched). No Marble credits, no Marble API call.
The main session did Specialist 1's assignment (projection / bake) and the first part of Specialist 2's
(flow animation); instructions for the specialists to continue: `BRIEF_NEXT.md`.

## What it is
The user's approved Screen 05 water, baked into the GAME river's own coordinates (u across −1..1, s = arc length)
from the locked 05 camera, using the live game's per-pixel river coordinates (`scripts/proj05-probe.mjs`). The
texture is anchored to the river, not to the camera — a real textured 3D river, nothing pasted over the screen.
Marble was not used (its reconstructed surface is distorted: `qa/pilot05/marble_feas/NOTES.md`).

* Source pixels (`tools/proj05/make_target.py` → `target/`): the APPROVED picture wherever its water is visible; under
  Benny + splash, the coins and the bottom gold ring, the user's ORIGINAL isolated artwork
  (`references/water/05_water_isolated_original.png`), registered onto the approved water with dense optical flow,
  colour-shifted and blended with a soft edge. No invented texture. (The isolated artwork alone is NOT pixel-identical
  to the approved water — mean difference 46–53/255 after registration — so baking it alone would cap the match.)
* Layers (`tools/proj05/bake.py` → `assets/textures/water05/`, 2.9 MB):
  * **E exact** 1024×1460, ≈ screen resolution at the locked eye (rows follow the locked view's density, columns the
    visible u-range per row, `proj05_lut.json`);
  * **N near** 512×960, full width, s 126–166, weighted by the locked view's density;
  * **T tile** 512×336, the crisp near river (s 134–148, hidden bank mirrored), periodic every 14 u for the rest of 05;
  * **D detail** 512×512, luminance high-pass of the artwork's streaks / glints, repeating;
  * **F far** 512×512 for the far river block (`far05.ts`) in its own (uv.x, log depth) coordinates.
* Shader (`src/vfx/waterRibbon.ts`, all behind `#ifdef PROJ05` / `if (PROJ05)`): E where it is not magnified
  (smallest singular value of the texel-per-pixel Jacobian), else N / T + D — so moving closer never stretches E.
  The post chain is undone per pixel (grade → sRGB → Neutral tone map → exposure, vignette, fog); the bloom pass is
  measured and fed back (`tools/proj05/residual.py`, 2 iterations, `target/correction.npz`).
* Flow: two-phase advection toward the camera (1.6 u per cycle, 0.55 cycles/s), layout anchored to the world; the
  frozen QA clock (t = 12) shows the static bake.
* Foam: the approved picture's own fluffy foam is in the texture, so the three Screen-05-only foam parts (rim puffs,
  flank sheet + puffs) step aside and the course-wide lather sheet fades out on 05 only (dithered over 3 u at the
  joins). `?projfoam05=1` keeps the 3D foam.

## Switches (default build: none of this runs)
`?proj05=1` on · `&projfoam05=1` keep the 3D foam · `&projflow05=0` no flow · `&projflowd05=` flow distance ·
`&projrate05=` flow rate · `&projdetail05=` detail gain (0.9) · `&projdbg05=1` layer map (green exact, blue near,
red tile). Experiment APK: `VITE_RAINBOW_Q05="proj05=1" npm run android:debug` (not built in this session).

## Results — locked 05 camera (`compare/`, full size, separate pictures)
`1_APPROVED.png` · `2_BEFORE_current_default_T2.png` · `3_NEW_proj05.png` (real game capture, Playwright, 864×1536).

| region (`tools/proj05/frame_metrics.py`) | BEFORE (T2) | NEW proj05 |
|---|---:|---:|
| approved water area, Benny + coins excluded: mean abs ΔRGB (0–255) | 49.7 | **23.2** |
| — pixels within 10 levels | 8 % | **65 %** |
| — pixels within 20 levels | 23 % | **72 %** |
| — SSIM (luminance) | 0.32 | **0.77** |
| whole frame below the HUD: SSIM | 0.24 | 0.46 |

Water SURFACE accuracy (river visible, approved pixels, `compare/metrics_water_surface.json`): mean abs **3.6/255**,
96 % within 10 levels, 99.2 % within 20.

So the water itself reproduces the approved picture almost exactly; what keeps the water AREA at 72 % / SSIM 0.77 is
not the water texture but what the user asked to keep unchanged or what is geometry: Benny's splash, the game's
bubbles (other positions than the approved ones), the coins (other far positions), the bottom gold ring (T2 front ring
vs the approved ring), and ≈ 102 k approved-water pixels where the game's river does not reach (banks at the far
bends, the bottom). **No 95 % claim**: on this measure the locked match is 72 % (within 20 levels) / SSIM 0.77.
Next levers, one at a time, each as its own switch: hide or reposition the 05 bubbles; a visual-only bank widening
(`?projgeo05`, course.ts untouched) where the approved water reaches further; the bottom ring.

## Moving camera (`move/`, `clips/`)
* `scripts/proj05-move.mjs` rides forward with the REAL simulation from the locked checkpoint (Benny, camera rig,
  course, coins unchanged). Frames 0, 2, 5, 10, 20, 35, 50 u ahead: `move/contact_sheet_BEFORE_top_NEW_bottom.png`,
  full-size NEW frames `move/NEW_proj05_forward_{05,10,20,35}.png`, layer map `move/layer_map_with_before.png`
  (rows: BEFORE, NEW, layer map).
* Result: the approved design (hot-pink S-ribbons, cyan core, glossy highlights) is on the river at every distance;
  E hands over to N then T as the camera approaches; no tears, no stretched streaks, no missing water
  (fixed on the way: a hard N→T seam, blocky tile fill, a Jacobian test fooled by shear, a bubble in the detail tile).
* Clips (24 fps, half size): `clips/proj05_locked_flow_3s.mp4` (camera locked, clock running: water flows toward the
  camera — phase correlation: 100 % of frame pairs move down the screen mid-river, 61 % near Benny where his splash
  animates), `clips/proj05_ride_4s.mp4` (riding forward with the flow running).
* Remaining visible limits: the artwork fill under Benny has faint seams when he steers sideways; the detail tile
  repeats every 0.36 u × 2.8 u (arcs); E→N hand-over is a soft cross-fade of the same picture (slight softening).

## Safety checks
* Default build pixel-identical to `qa/pilot05/current_default_05.png` (0 differing pixels) after every change.
* `?proj05=1` on screens 06 and 07: pixel-identical to the default; 04: only its distant view down into the 05
  tunnel changes (the 05 river seen from afar, plus its bloom halo) — the 04 river, foam and Benny are unchanged.
* Gameplay test with `?proj05=1`: 8 / 8 (`tests/gameplay_proj05.json`); continuity: all stage joins gap 0;
  relative frame cost 0.98× default (`tests/perf05.json`, SwiftShader — device fps not measured).
* References 13 / 13 unchanged (`sha256sum -c scripts/reference.sha256`).

## Reproduce
```
node scripts/proj05-probe.mjs --out=DIR --raw=DIR                    # live river coordinates at the locked eye
python3 -I tools/proj05/make_target.py qa/pilot05/proj/target        # approved + artwork fill
python3 -I tools/proj05/bake.py DIR qa/pilot05/proj/target assets/textures/water05
node scripts/capture.mjs 05 --q=proj05=1 --out=CAP                   # then colour feedback:
python3 -I tools/proj05/residual.py CAP/05.png DIR qa/pilot05/proj/target && python3 -I tools/proj05/bake.py …
python3 -I tools/proj05/frame_metrics.py references/05_flow_into_the_current.png CAP/05.png
node scripts/proj05-move.mjs --q=proj05=1 --out=OUT --d=0,5,10,20,35 [--still=3] [--clip=4 --fps=24]
```

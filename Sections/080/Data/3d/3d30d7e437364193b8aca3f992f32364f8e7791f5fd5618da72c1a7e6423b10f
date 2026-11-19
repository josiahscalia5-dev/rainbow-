# env05 — washer-environment-modeler (Screen 05 tunnel: rings, walls, fittings, far tunnel)

Status: run #3 (session 01Q46SCH, 2026-11-17) DONE for the brief's focus (walls, rings, warped-wall bake, six paddles, far
tunnel, + near frame) — current state = capture `work/f1/05.png` = `new.png` (= r4 + frame sigma_u 0.4); see §2b, §3–§7. Switch `env05` (`on05('env05')`, also on with
`?match05=1`). STACK = `proj05=1&projwall05=1&projring05=1&projframe05=1&projlid05=1&projflow05=2&projnear05=1&projfar05=1`.

## 1. Measured (step A, done)
* BEFORE = STACK capture `recovery_s018/stack/05.png` (= `stack_2340/05_match05.png`, byte-identical). Region numbers
  (`python3 -I tools/match05/metrics.py`, `env/work/before_*.json`): whole frame mean 34.1 / ≤20 51.6 %; purple walls
  53.8 / 21.1 %; gold rings + frame 37.7 / 50.0 %; side fittings 26.9 / 59.7 %; distant tunnel 29.8 / 45.1 %.
* Probe of STACK (`node scripts/proj05-tunnel-probe.mjs --q='<STACK>' --out=env/work/probe --raw=<scratch>`): game rings
  real r@12u (instance 1), A (s = sCam05 + 20), B (sCam05 + 40); far rings at virtual depth 59/97/161/222/322.
* Where the tunnel error comes from (`tools/env05/err_by_surface.py`, probe id buffer): purple-wall region: game WALL
  153,207 px mean 56.6 (52 % of the region's error = perforation rows / bays misregistered), game RING A on approved wall
  44,545 px mean 75.7 (20 %), ring B on approved wall 29,290 px 64.5 (11 %), far wall 45,540 px 33.9. Gold region: game
  wall where approved shows gold 23,399 px mean 85.6 (42 %).
* Ring table (`tools/env05/ring_table.py`, `env/work/rings_before.json`; approved = `qa/pilot05/proj/tunnel/model/ring_model.json`,
  circle fits of band mid-lines over the rays where both are visible):
  | ring | approved centre, r_mid, band | game centre, r_mid, band |
  |---|---|---|
  | B | (468, 461), 250, 40 | (505, 451), 236, 38.5 |
  | C | (486, 457), 149, 20 | (498, 465), 162, 17.5 |
  | D | (491, 466), 91, 12 | (499, 471), 98, 10 |
  | E/F/G | (497, 466–468) 57 / 40 / 28 (circle guesses) | (499, 475–477) 59.5 / 43 / 30 |
  (ring A: only 36 rays comparable in that table; see the fit below.)
* 3D fit (`tools/env05/ring_fit.py`, `env/work/ring_fit.json`; projector `tools/env05/ringproj.py` validated against
  the id buffer to 0.3–1.5 px): what each ring needs, relative to the game's straight axis through ring B:
  | ring | game | fit | mean edge error px game → fit |
  |---|---|---|---|
  | A | depth 20, dx 0, dy −1.79, h 0.13 | depth 20.0, dx −0.715, dy −1.37, h 0.09 | 52.2 → 1.7 |
  | B | depth 39.9, dx 0, h 0.13 | depth 38.4, dx −1.006, dy −0.11, h 0.12 | 26.0 → 4.1 |
  | C | Dv 59 | Dv 64.0, ox −0.62, oy +0.50, h 0.107 | 12.5 → 1.5 |
  | D | Dv 97 | Dv 104.7, ox −0.60, oy +0.51, h 0.106 | 5.5 → 0.9 |
  | E F G | Dv 161 / 222 / 322 | 165.5 / 235.2 / 332.1 | 4.4–5.7 → 0.3–0.4 |
  WITHOUT sideways offsets (depth + height only) the fit barely improves: A 46 → 24, B 26 → 24, C 12.5 → 10.9 px.
  => the dominant ring error is SIDEWAYS: the approved rings sit 0.6–1.0 u further LEFT of the camera than the game's.

## 2. Changed (all behind `env05`; default and STACK-without-env05 unchanged by construction; `npx tsc --noEmit` clean)
* `src/world/tube.ts`: `type TubeWarp`; optional `TubeGeoOptions.warp` in buildTubeGeometry (positions only); optional
  `warp` arg of `ForcedTunnel.geometry`; new `buildWarpedBandRing` (one-instance InstancedMesh). Unused by default.
* `src/vfx/proj05Tunnel.ts`: `ENV05` flag; `PT_ROW` + N1, N2 (N_ROWS = 9 only under env05, else 7); `E5_RING_ROW`
  (A 0, B 1, C..G 2..6, N 7); `withEnv05Ring(mat, row0, perInstance, halfW, key)` (ring atlas: u = object angle
  atan(y, x), v = axial (z + w) / 2w; final colour via pjInverse; uPtDbg → writes (uv, 8, 78) for the coords probe);
  under env05 the wall atlas is `assets/textures/env05/wall05e.png` + `env05.json`, ring atlas `ring05e.png`.
* `src/world/environment.ts`: `E05` block (current values: dB 38.35; hA 0.09, hB 0.12, hFar 0.11; farDv 64.0 / 104.7 /
  165.5 / 235.2 / 332.1; side knots (depth from sCam05 → u) [3,0] [17,−0.715] [23,−0.715] [35,−0.95] [42,−0.95]
  [54,−0.6]; up knots [6,0] [17,0.3] [23,0.3] [32,−0.23] [42,−0.23] [54,0]; sideFar −0.6), `knotsAt05`, `e05Weight`
  (smoothstep(sin th, −0.28, 0.05): 0 at/below the river banks), `warp05` (real 05 walls, real rings; fades to 0 between
  sF05 and sGlow05), real rings as warped single meshes + `withEnv05Ring`, far rings placed by `uRing(n)` =
  ft.uOfZ(farDv − D0) (knots / far river unchanged), far ring geometry displaced by sideFar·weight, far wall
  `ft.geometry(64, 80, 0.004, warpFar)`, env05 wall segs (near bays N1/N2; far segs from uRing). Duplicate far-segs
  block merged.
* `scripts/proj05-tunnel-probe.mjs`: when several real 05 ring meshes exist (env05), id tag = 20 + mesh index (scene
  order: s 124, 138, A, B), ringInstances = all meshes. One ring mesh (default / STACK) → behaviour unchanged.
* `assets/textures/env05/` (new): `wall05e.png` (2048 × 992, rows AB BC CD DE EF FG GX N1 N2), `ring05e.png`
  (2048 × 384, 8 rows × 48), `env05.json` — currently ONLY the BASE (previous bake re-laid out; no projection yet).
* New tools: `tools/env05/err_by_surface.py`, `ringproj.py`, `ring_table.py`, `ring_validate.py`, `ring_fit.py`,
  `warp_fit.py` (fit side/up of a warped real ring), `proj_bake.py` (base atlases; `--coords=` camera-projection splat;
  `--capture= --coords_all=` colour feedback into `assets/textures/env05/feedback.npz`).

### Measured after the first env05 geometry (probe e1, before the knot refinement; id buffer, mean band-edge error px)
| ring | STACK | env05 e1 |
|---|---|---|
| A | 53.6 | 6.6 |
| B | 27.4 | 14.4 |
| C | 10.6 | 7.6 |
| D | 5.9 | 4.7 |
| E / F / G | 4.6 / 4.9 / 5.2 | 5.2 / 5.1 / 5.3 (circle guesses; far VP still ≈9 px low) |
`warp_fit.py` on e1: B needs side −0.95, up −0.23, axial −0.16 (→ ≈9.9 px; the weight leaves B's lower sides near the
banks unshifted — limit of "nothing moves at the banks"); A side −0.70, up +0.30. These values are now in `E05`
(not yet probed). No env05 CAPTURE exists yet (no region numbers after the change yet).

## 2b. RUN #3 (2026-11-17 ~01:25 UTC, session 01Q46SCH) — done so far, all behind `env05`, `npx tsc --noEmit` clean
* **Weight (ring B left-arc bulge):** `tools/env05/weight_study.py` (new; analytic replica of the warped real rings A, B and
  the far rings C..G through the probe camera, band edges vs `ring_model.json`, draws outlines on the approved picture)
  showed the S-kink came from `e05Weight` = 0 at the river bank on BOTH sides. Now asymmetric (`environment.ts`): RIGHT
  half unchanged smoothstep(sin th, −0.28, 0.05) (the displacement points INTO the tunnel there: must not cover river /
  foam / apron); LEFT half smoothstep(sin th, −0.95, −0.5) (points OUT of the tunnel: the whole left side wall moves with
  its rings down below the waterline). Ring A up 0.3 → 0.42 (fit), far rings + far wall `upFar` 0.45 (approved far rings
  ≈9 px higher), seam knot up[54] = upFar, and the up displacement now fades to 0 toward the 05 → 06 junction like `side`.
  Analytic edge error (px, mean, visible rays): A 13.7 → 7.8, B left arc 18.0 → 7.3, C 9.1 → 4.3, D 4.9 → 1.7.
  Probe e3 (id buffer, `ring_table.py`, mean |edge| px, STACK → e2 → **e3**): A 59.1 → 10.0 → **2.9**, B 28.6 → 13.6 →
  **8.8**, C 10.6 → 7.6 → **3.2**, D 5.9 → 4.7 → **2.2**, E 4.6 → 5.2 → **4.1**, F 4.9 → 5.1 → **4.3**, G 5.2 → 5.3 → **4.6**.
  Silhouette agreement (`idviz.py`, approved walls+gold+distant shown as the same kind of game surface): STACK 0.516 →
  **e3 0.646** (walls 0.636 → 0.755, gold 0.198 → 0.359).
* **Paddles (step d):** `scripts/proj05-lid-raycast.mjs` takes `--q`; raycast with `<STACK>&env05=1` → `env/lid/raycast.json`
  (6 paddles, 0 missed rays, 223 vertices on the far wall), Blender `lid_blender.py` → **`assets/models/lids05e.glb`**
  (+ `env/lid/lids05.blend`); `proj05Tunnel.ts` loads `lids05e.glb` when ENV05, `lids05.glb` otherwise.
* **Camera-projection bake (step a/c):** `tools/env05/proj_bake.py` with the e3 coords probe. Source masks widened (run #3):
  inside the approved ring bands (`ring_model.json` edges ±2 px) rings take every tunnel-class approved pixel (the
  white-pink marquee highlights are "purple walls" in the colour-class masks and were being FILLED), walls take the gold
  slivers there; `--regionmask` = old behaviour. Colour feedback pass 1 (damp 0.8) kept (closer).
* **Captures (real game, `capture.mjs 05`, metrics.py), STACK → env05:**
  | region | STACK | e3 (bake) | e4 (+feedback) | e5 (env masks) | **e6 (env masks + feedback)** |
  |---|---|---|---|---|---|
  | whole frame mean / ≤20 | 34.10 / 51.6 % | 21.73 / 69.7 % | 21.63 / 69.9 % | 20.44 / 71.8 % | **20.34 / 72.0 %** |
  | purple walls | 53.82 / 21.1 % | 11.73 / 83.7 % | 11.41 / 84.1 % | 7.33 / 91.1 % | **7.04 / 91.4 %** |
  | gold rings + front frame | 37.74 / 50.0 % | 18.11 / 77.5 % | 18.05 / 77.8 % | 16.78 / 79.0 % | **16.75 / 79.2 %** |
  | side fittings | 26.85 / 59.7 % | 11.56 / 80.6 % | 11.56 / 80.7 % | 4.15 / 93.6 % | **4.11 / 93.7 %** |
  | distant tunnel + glow | 29.79 / 45.1 % | 2.62 / 97.3 % | 2.41 / 97.3 % | 2.64 / 97.3 % | **2.43 / 97.3 %** |
  | water | 9.40 / 88.3 % | 9.22 | 9.22 | 9.21 | **9.21 / 88.5 %** |
  | foam banks | 8.43 / 92.7 % | 5.85 | 5.85 | 5.72 | **5.72 / 94.9 %** |
  | bubbles | 29.98 / 61.8 % | 26.84 | 26.81 | — | (see e6/REGION_METRICS.json) |
  Gold region remaining error (e4): 71 % is the camera-held near FRAME at the bottom (y > 1100, 75k px, mean 21.4).
* Ride frames `env/move/move_{00,08,17,35}.png` (STACK + env05) vs the same without env05: walls / rings stay solid, no
  flat cards; stretched texels at the near screen edges when riding (texels seen at grazing angles from the checkpoint).
* Checks (e6 state): default `capture.mjs 05` == `qa/pilot05/current_default_05.png` **0 px**; 06 and 07 STACK vs
  STACK+env05 **0 px**; 04 STACK vs STACK+env05 **1,158 px** (max 134, mean 15.9 on the changed px), all inside 04's
  window onto the 05 tunnel (x 313–863, y 213–964: the same 3D 05 rings / walls seen from 04; like `projgap05`'s 832 px).
  `gameplay-test.mjs --q='<STACK>&env05=1'` → `env/gameplay.json` pass (8/8 checks); `npm run -s test:continuity` OK.
* Deliverables so far: `env/before.png` (= recovery_s018/stack/05.png) + `before_*METRICS.json`, `env/new.png` (= e6) +
  `new_*METRICS.json`.
* **Near gold FRAME (gold region: 71 % of its remaining error was the camera-held bottom frame):** `tools/env05/frame_fit.py`
  (new) fits the three frame pieces (annulus sectors in reference px, tube.ts `nearFrameGeometry`) to the approved frame
  outline (approved frame px missed 13,796 → 3,786, approved water px covered 29,057 → 19,218 — part of that "water" is
  blue-white highlights ON the approved frame). `nearFrameGeometry(pieces?)` (default call unchanged); environment.ts passes
  the fitted pieces under ENV05; `tools/proj05/frame_bake.py --pieces= --corr=` bakes `assets/textures/env05/frame05.png`
  (+ .json, sigma_u 1.0 instead of 3, own feedback file `env/frame/frame_correction.npy`, 1 feedback pass);
  `proj05Tunnel.ts` loads it under ENV05. Corner width 240 (to cover the two screen corners) measured worse (9.74 vs 9.45) →
  kept 190 (a ≈20 × 25 px sliver at the bottom-right screen corner stays uncovered).
  e7 (frame) gold 16.75 → 9.45, water 9.21 → 7.44 (the frame no longer covers approved water); e9 (+ frame feedback) 9.39.
* **Ring B lower-RIGHT arc (kinked outward at the bank, the right wall must not move there):** tried the wall's right ramp
  lower (`?e05r0=-0.7&e05r1=0`, QA knobs kept): walls 7.04 → 6.64 but foam 5.72 → 9.50 (the wall covers the right foam
  bank) → REJECTED. Instead the RINGS get their own right-half weight (`e05RingWeight`: smoothstep(sin th, −0.9, −0.1),
  QA knobs `e05rr0` / `e05rr1`): the band follows its circle down to the bank while the wall stays; the band's skirt
  vertices follow the wall (`buildWarpedBandRing(…, skirtWarp)`) and are DISCARDED in the env05 ring shader
  (`tube.ts markBandSkirt` → attribute `aE5Skirt`), so no stretched skirt strip shows (r2 had one); the wall shows through
  the small gap. Ring B edge error 8.8 → 7.3 px.
* Captures r2 (ring weight), r3 (+ skirt discard), r4 (+ ring/wall colour feedback pass 2) — **r4 is the current state**:
  | region | STACK | e9 | **r4** |
  |---|---|---|---|
  | whole frame mean / ≤20 | 34.10 / 51.6 % | 19.00 / 73.7 % | **18.84 / 73.9 %** |
  | purple walls | 53.82 / 21.1 % | 7.04 / 91.4 % | **6.46 / 92.2 %** |
  | gold rings + front frame | 37.74 / 50.0 % | 9.39 / 87.7 % | **9.45 / 87.7 %** |
  | side fittings | 26.85 / 59.7 % | 4.11 / 93.7 % | **3.54 / 94.8 %** |
  | distant tunnel + glow | 29.79 / 45.1 % | 2.43 / 97.3 % | **2.43 / 97.1 %** |
  | water | 9.40 / 88.3 % | 7.43 / 91.0 % | **7.42 / 91.0 %** |
  | foam banks | 8.43 / 92.7 % | 5.72 / 94.9 % | **5.86 / 94.8 %** (ring B's lower end now in front of 76 more foam px) |
  | bubbles | 29.98 / 61.8 % | 26.22 / 64.5 % | **25.64 / 64.7 %** |
  Remaining wall-region error (r4): game wall px mean 4.0 (38 % of the region's error: edges / sharpness of the bake),
  game ring over approved wall 38,565 px mean 15.3 (29 %), other surfaces (paddle / foam / bubbles) 27,275 px mean 16.4 (22 %).

## 3. Final verification of the r4 state (2026-11-17, run #3, all really run)
* default `capture.mjs 05` == `qa/pilot05/current_default_05.png`: **0 px**; protected BEFORE `?ringa=26&nearfloor05=0` ==
  `qa/pilot05/wave9/baseline/05.png`: **0 px**; STACK (no env05) == `recovery_s018/stack/05.png`: **0 px**.
* 06 / 07, STACK vs STACK + env05: **0 px**. 04: **712 px** differ (max 129), all inside 04's window onto the 05 tunnel
  (the same 3D 05 rings / walls seen from 04; was 1,158 px at e6).
* `gameplay-test.mjs --q='<STACK>&env05=1'` → `env/gameplay.json`: pass, 8/8 checks, no errors. `npm run -s test:continuity`: ok.
* Ride frames `env/move/move_{00,08,17,35}.png`: rings / walls / paddles solid and continuous, no flat cards.
* `?match05=1` integration capture (everybody's parts): `env/match05_integration.png` (+ metrics): whole frame **11.89 / 83.6 %**
  ≤20, no console errors; my regions there: walls 6.95, gold 9.43, fittings 3.54, distant 2.43.
* Final files: `env/before.png`, `env/new.png` (= `work/f1/05.png`: r4 + frame bake sigma_u 1.0 → 0.4, gold 9.45 → 9.39,
  whole frame 18.84 → 18.83), `before_*` / `new_*METRICS.json`.

## 4. Per mismatch (approved | game before | difference | cause | change | measured, STACK → r4)
| mismatch | cause | change (all behind env05) | result |
|---|---|---|---|
| rings sit 0.6–1.0 u too far right; ring A draws a band where the approved shows wall | mesh placement | warped upper tunnel (`E05` knots) + asymmetric weight + ring weight + far `upFar` | ring edge error A 59.1 → 2.9, B 28.6 → 7.3, C 10.6 → 2.7, D 5.9 → 1.9 px |
| ring B left arc S-kink / bulge at the bank (recovery capture) | weight 0 at the bank on both sides | left half: whole side wall moves (weight −0.95 … −0.5) | B left edge 18.0 → 7.3 px (analytic), smooth arc |
| ring B lower-right arc kinked outward | the right wall must not move at the bank (river / foam) | ring-only right weight, skirt discarded | B 8.8 → 7.3 px; foam 5.72 → 5.86 (ring end in front of 76 foam px) |
| perforation rows / bays misregistered, torn texture on both walls | texture (old bake on new geometry) | camera-projection bake `proj_bake.py` (+ ring-envelope source masks, 2 feedback passes) | walls 53.82 → **6.46** mean, 21 → **92 %** ≤20 |
| rings blue-biased / peach | texture | same bake (ring atlas rows A … G) | gold region signed RGB −12.7/−6.7/+9.1 (e3) → −3.4/−1.0/+2.9 |
| right paddles sunk, left float (side fittings WORSE at recovery 44.87) | paddles built for the old wall | `lids05e.glb` raycast onto the env05 wall | side fittings 26.85 → **3.54**, 60 → **95 %** |
| distant tunnel + glow WORSE at recovery (34.53) | far rings with the plain ring-B atlas, no glow | far rings/wall baked from the approved picture, far rings `upFar` 0.45 | 29.79 → **2.43**, 45 → **97 %** |
| bottom gold frame pieces the wrong shape / cut | camera-held frame outline | `frame_fit.py` pieces + `frame05.png` (env05) | gold region 37.74 → **9.45**, 50 → **88 %** |

## 5. Still different (honest list)
* Purple walls (r4 6.46): bake sharpness at slot / ring edges (game wall px mean 4.0 = 38 % of the region error); game
  rings over approved wall 38,565 px (mean 15.3, ring edges not exactly where the painting has them: the painted rings are
  not a physically consistent ring set — ring A's right side and the ring bands' widths); approved bubbles / foam in front
  of the wall where the game has none (the wall behind them is filled, slightly blurry).
* Ring B lower right: round now, but a narrow smeared strip remains between the band and paddle R1 (the band's far side
  seen at a grazing angle, ring atlas v is axial so two layers share texels).
* Bottom-right screen corner: ≈20 × 25 px sliver not covered by the frame (wider corner pieces measured worse).
* While riding, wall texels that the checkpoint saw at grazing angles (screen edges) stretch (also in STACK).
* 04 changes 712 px (its window onto the 05 tunnel).
* Not mine and still the largest whole-frame errors: HUD + text, Benny, coins, wake / splash (other specialists).

## 6. REQUESTS (coordinator)
* Far river geometry is NOT changed (knots kept, far rings placed by tunnel coordinate) → no far-water re-bake needed.
* A black dotted seam runs along the top of the left foam bank (e.g. x 180–330, y 545–560) in STACK as well (98 dark px
  there in STACK, 32 with env05): it comes from the apron / river edge (`proj05Apron.ts`), not from env05.
* QA knobs added under env05 only (URL, default values = the r4 state): `e05r0`, `e05r1` (wall right ramp), `e05rr0`, `e05rr1`
  (ring right ramp). Nothing to do unless someone wants to re-test the rejected wall variant (`e05r0=-0.7&e05r1=0`).

## 7. How to redo / continue (the next account relaunches from here)
* Cycle (tag T): `node scripts/proj05-tunnel-probe.mjs --q='<STACK>&env05=1' --out=env/work/T --raw=<scratch>/raw_T`;
  `python3 -I tools/env05/idviz.py <raw>/tunnel_id.f32 env/work/T/idviz.png 0.35`; `python3 -I tools/env05/ring_table.py env/work/T/tunnel.json <raw>/tunnel_id.f32 env/work/rings_T.json`;
  same probe with `--coords`; `python3 -I tools/env05/proj_bake.py assets/textures/env05 --coords=<raw>/tunnel_coords.f32`;
  capture `node scripts/capture.mjs 05 --q='<STACK>&env05=1' --out=env/work/T` (back up / restore `qa/capture_log.json`
  with cp — no git); `python3 -I tools/match05/metrics.py env/work/T/05.png env/work/T/`. Feedback: probe `--coords --all`
  then `proj_bake.py … --capture=env/work/T/05.png --coords_all=<raw>/tunnel_coords_all.f32` (accumulates
  `assets/textures/env05/feedback.npz`; delete it before a fresh bake of a different geometry).
* Frame: `python3 -I tools/env05/frame_fit.py env/frame/frame_fit.json` (then copy `pieces_after` into environment.ts
  `frame05e`), `python3 -I tools/proj05/frame_bake.py assets/textures/env05 0.4 --pieces=env/frame/frame_fit.json --corr=env/frame/frame_correction.npy [--capture=<05.png>]`.
* Paddles after any wall change: `node scripts/proj05-lid-raycast.mjs --q='<STACK>&env05=1' --dir=qa/pilot05/full_reference_match/env/lid`,
  `blender -b --factory-startup -P tools/proj05/lid_blender.py -- qa/pilot05/full_reference_match/env/lid assets/textures/tunnel05/lid05.png 58,311,864,532 assets/models/lids05e.glb 0.35`.
* Geometry without renders: `python3 -I tools/env05/weight_study.py <tunnel.json> <out_dir> cur "asym:l0,l1,r0,r1" …` (WS_FIT=1 fits side/up).

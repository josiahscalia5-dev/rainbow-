# env05 — washer-environment-modeler (Screen 05 tunnel: rings, walls, fittings, far tunnel)

Status: IN PROGRESS (checkpoint 2026-11-17 ~00:45 UTC, session 018Sg3AU). Switch `env05` (`on05('env05')`, also on with
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

## 2. Changed (all behind `env05`; default and STACK-without-env05 unchanged by construction; tsc clean)
* `src/world/tube.ts`: optional `TubeGeoOptions.warp` (type `TubeWarp`) in buildTubeGeometry; optional `warp` arg of
  `ForcedTunnel.geometry`; new `buildWarpedBandRing`. All optional / unused by default → identical geometry.
* `src/vfx/proj05Tunnel.ts`: `ENV05` flag; `PT_ROW` + N1, N2 (N_ROWS = 9 only under env05, else 7); `E5_RING_ROW`;
  `withEnv05Ring` (ring atlas row per ring, u = angle, v = axial; debug coords like the other probes); texture loading of
  `assets/textures/env05/wall05e.png`, `ring05e.png`, `env05.json` ONLY under env05.
* `src/world/environment.ts`: `E05` layout block (ring B at sCam05 + 38.5, band heights, far ring virtual depths,
  sideways `side` knots −0.715 @A, −1.006 @B, −0.6 far; `up` +0.42 around ring A), `warp05` (upper tunnel only: weight
  smoothstep(sin th, −0.28, 0.05) → 0 at/below the banks: river, foam, apron, floor untouched), real rings as warped
  single meshes with `withEnv05Ring`, far rings by tunnel coordinate (knots and far river unchanged), far wall warp, env05
  wall segs (near bays N1/N2). NOTE: the far-wall segs block is written twice (`E05 && !PROJWALL05` and
  `PROJWALL05 && E05`) — harmless duplicate, to be merged.
* New tools: `tools/env05/err_by_surface.py`, `ringproj.py`, `ring_table.py`, `ring_validate.py`, `ring_fit.py`.

## 3. In progress
* `assets/textures/env05/` does NOT exist yet → a capture with `env05=1` will fail to load textures until step 4a runs.

## 4. Remaining, step by step
a. Initial env05 textures: `wall05e.png` = old `tunnel05/wall05.png` atlas + rows N1, N2 (copy of AB) with `env05.json`
   (wall rows incl. N1/N2, ring {w, h, rowH}); `ring05e.png` = 8 rows (A,B,C..G,N) from `tunnel05/ring05.png`.
b. Probe env05 (`--q='<STACK>&env05=1'`): ring table again (id buffer; real rings are now separate meshes → probe needs
   per-mesh tags), refine knots if needed.
c. Camera-projection bake `tools/env05/proj_bake.py`: `--coords` probe → scatter approved pixels (purple_walls /
   distant tunnel masks for walls, gold mask for rings) into the atlases; holes filled from the old bake, offset-blended.
d. Lids: re-run the paddle pipeline onto the warped wall (scripts/proj05-lid-raycast.mjs needs `--q`) → `assets/models/lids05e.glb`,
   loaded under env05 (right-side paddles would otherwise sink into the shifted wall).
e. Capture NEW (`node scripts/capture.mjs 05 --q='<STACK>&env05=1' --out=env/new`), metrics, colour feedback pass.
f. Default pixel identity (`node scripts/capture.mjs 05 --out=<scratch>` vs `qa/pilot05/current_default_05.png`,
   then `git checkout -q qa/capture_log.json`); 04/06/07 with env05 vs without; proj05-move frames d=0,8,17,35;
   gameplay-test; `npm run -s test:continuity`.

## 5. REQUESTS
* none yet (far river geometry is NOT changed: knots kept, rings placed by tunnel coordinate).

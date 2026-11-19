# env05 — washer-environment-modeler (Screen 05 tunnel: rings, walls, fittings, far tunnel)

Status: IN PROGRESS — stopped for the account transfer (2026-11-17 ~00:30 UTC by the file clock, session 018Sg3AU). Switch `env05` (`on05('env05')`, also on with
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

## 3. In progress (stopped for the account transfer)
* The cycle `probe (id) → probe (--coords) → proj_bake --coords → capture → metrics` for the refined knots was stopped
  while still waiting for a render slot; it wrote nothing. The helper is in the (lost) scratchpad; its content:
  `node scripts/proj05-tunnel-probe.mjs --q='<STACK>&env05=1' --out=env/work/<tag> --raw=<scratch>/raw_<tag>`, the
  same with `--coords`, `python3 -I tools/env05/proj_bake.py assets/textures/env05 --coords=<raw>/tunnel_coords.f32`,
  `node scripts/capture.mjs 05 --q='<STACK>&env05=1' --out=env/work/<tag>` + `git checkout -q qa/capture_log.json`,
  `python3 -I tools/match05/metrics.py env/work/<tag>/05.png env/work/<tag>/`.

## 4. Remaining, step by step
a. Run that cycle (tag e2). Check the ring table (`tools/env05/ring_table.py env/work/e2/tunnel.json <raw>/tunnel_id.f32 …`)
   and the capture by eye (walls must not show gold ghosts; water / foam / bubbles regions must not get worse than
   STACK: water 9.40, foam 8.43).
b. If water/foam are unchanged, optionally lower the weight's start (e.g. sin th −0.45) to fix ring B's lower sides;
   re-measure. Far VP (C/D 9 px low) only via a vertical upper-wall shift (+0.45) — skip unless clearly closer.
c. Colour feedback: `node scripts/proj05-tunnel-probe.mjs --coords --all --q='<STACK>&env05=1' --raw=<raw>` then
   `python3 -I tools/env05/proj_bake.py assets/textures/env05 --coords=<raw>/tunnel_coords.f32 --capture=env/work/e2/05.png --coords_all=<raw>/tunnel_coords_all.f32`,
   capture again; keep only if closer (1–2 passes).
d. Paddles: add `--q` to `scripts/proj05-lid-raycast.mjs` (it loads `?qa=1&dpr=1` only), raycast with
   `--q='<STACK>&env05=1' --dir=env/lid` (copy `mesh2d.json` there), Blender
   `blender -b --factory-startup -P tools/proj05/lid_blender.py -- env/lid assets/textures/tunnel05/lid05.png 58,311,864,532 assets/models/lids05e.glb 0.35`,
   load `lids05e.glb` instead of `lids05.glb` when ENV05 (proj05Tunnel.ts). Needed because the right-side paddles
   (R1/R2) sit on the upper wall that env05 moves left (they would sink into it).
e. Deliverables in `env/`: `before.png` (= `recovery_s018/stack/05.png`), `new.png` (STACK + env05), region numbers
   before → after, ride frames `node scripts/proj05-move.mjs --q='<STACK>&env05=1' --out=env/move --d=0,8,17,35`,
   `node scripts/gameplay-test.mjs --q='<STACK>&env05=1' --out=qa/pilot05/full_reference_match/env/gameplay.json`,
   `npm run -s test:continuity`; default pixel identity (`node scripts/capture.mjs 05 --out=<scratch>` vs
   `qa/pilot05/current_default_05.png`, then `git checkout -q qa/capture_log.json`); 04 / 06 / 07 with vs without env05.

## 5. REQUESTS
* none yet (far river geometry is NOT changed: knots kept, rings placed by tunnel coordinate).

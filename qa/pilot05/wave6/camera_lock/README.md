# Screen 05 CAMERA LOCK (wave 6, coordinator, 2026-11-15)

**Status: LOCKED and verified.** Every specialist works against this camera. Do not change
`STAGE_CAM['05']` or the `05_crest` checkpoint.

## The lock
| | Value |
|---|---|
| Camera (Three.js world) | position (1.920, −37.943, −68.281), target (0.691, −44.312, −91.803), vFOV 62°, aspect 0.5625 (864×1536) — exact world matrix in `camera05.json` |
| Checkpoint | `05_crest`, s 132.438 (Benny on the stream's left crest) |
| Blender | `screen05_camera_lock.blend` (Blender 5.3): `Cam05` = the exact game matrix (axes converted), sensor fit VERTICAL, 864×1536, the approved reference as Cam05's background image (50 %), markers `RefCoin05_*` (reference coins back-projected) and `GameCoin05_*` (game coin anchors) |
| Overlay | `camera_lock_overlay.png` — reference 50 % + Blender layout render from Cam05 + VP crosses (white = ref, cyan = game) + coin residual lines |

## Measured alignment (reference vs live game, pixels at 864×1536)
| Landmark | Reference | Game | Δ |
|---|---|---|---|
| Vanishing point | (498.6, 479.4) | (499.8, 480.2) tunnel axis projected | 1.4 px |
| Coin 1 centre / Ø | (474, 726) / 96 | (488, 739) / 93 | +14, +13 / −3 |
| Coin 2 | (548, 661) / 70 | (555, 662) / 67 | +7, +1 / −3 |
| Coin 3 | (482, 612) / 56 | (478, 609) / 49 | −4, −3 / −7 |
| Coin 4 | (431, 574) / 43 | (432, 578) / 37 | +1, +4 / −6 |
| Coin 5 | (466, 546) / 28 | (443, 560) / 29 | −23, +14 / +1 (far section, path-camera) |
| Coin 6 | (495, 533) / 20 | (467, 550) / 25 | −28, +17 / +5 (far section, path-camera) |
| Benny box | x 230–612, y 767–1185 | unchanged since wave 5 (bbox x 231–612, y 766–1196) | — |

Before the wave-6 S-curve fix the coin x residuals were +13 / +30 / **+101** / +31 / −36 / +37 px.

## The S-curve fix (course.ts `meander05`)
The reference coin trail was back-projected through this camera onto the river (coin height 1.2 u) and
converted to offsets from the tunnel line (u = distance along the line):
u 21.6 −0.31 · 26.3 +0.60 · 32.2 −0.37 · 43.0 −1.85 · 55.5 −1.28 · 67.0 −0.26 (coin offsets; the course
offset is ≈ coin / 1.62). The old sine (λ 32) swung right too late and too wide (+1.45 at u≈32).
* u ≤ 22 (the 04→05 join, Benny's crest, the checkpoint search window, hence this camera): unchanged.
* u 22–67: C¹ Hermite through the measured knots (u 26.3 … 55.5); u ≥ 67 to the 06 join: the ORIGINAL curve
  verbatim (the 06 up-vector smoothing looks ±12 samples back into 05, so the junction must be identical).
* 05 exit bend u 56–67 (sin², C¹, amplitude 1.3537, solved on Course.length): the route keeps exactly its
  old length 435.192, because the water wave/flow phase, Benny's float bob, foam and bubbles are keyed on
  absolute s. Without it (first attempt) 06 shifted: a gold ring band in front of Benny.
* STAGE ANCHORS (environment.ts): the 06/07 rings, hood lids and slot rows are laid out from the 06 stage
  start (phases 5.5644 / 0.96618 reproduce the original layout), not from the 05 start — a safety net so a
  future 05 change cannot slide them again.
Verified (final): tsc OK; continuity ok (drop 61.19, all gaps 0); gameplay pass, 2139 steps, 91 coins,
plunge 61.41 (identical to the wave-5 baseline). Against the session-start commit 7ae64c3 (worktree capture),
pixels changed below the HUD: 04 0.00 %, 07 0.01 %, 08 0.00 %, 06: same content, ≈2 px uniform camera
shift (tunnel-axis smoothing window reaches into 05), 05: intended. Side-by-sides: qa/pilot05/wave6/regress0408/.

## Rebuild
```
python3 -I scripts/landmarks05.py references/05_flow_into_the_current.png qa/pilot05/wave6/camera_lock/landmarks_ref_px.json
node scripts/camera-lock-05.mjs                      # camera05.json + landmarks.json (live game)
npx vite-node scripts/export-river-05.ts -- --cam=… --look=… --fov=62   # then copy river05_layout.json here
blender -b --python tools/blender/build_05_river_scene.py -- --layout qa/pilot05/wave6/camera_lock/river05_layout.json --out-dir qa/pilot05/wave6/camera_lock
blender -b qa/pilot05/wave6/camera_lock/screen05_layout.blend --python tools/blender/camera_lock_05.py -- --camera qa/pilot05/wave6/camera_lock/camera05.json --landmarks qa/pilot05/wave6/camera_lock/landmarks.json --reference references/05_flow_into_the_current.png --out-dir qa/pilot05/wave6/camera_lock
python3 -I scripts/camera-lock-overlay.py
```
A World Labs (Marble) export is imported with `tools/blender/import_world_asset.py` and appended into
`screen05_camera_lock.blend`, so it is judged from exactly this camera.

# Screen 05 — Marble feasibility test: can the existing Marble worlds reproduce the approved river's S-curve geometry and perspective?

Session `012NR93Q…` (2026-11-16, ~16:55–17:35 UTC), branch `ccr-e546a360-cxmton` (separate experiment branch; the
user's working version `ccr-451ea8c7-3nqlis` and every other protected branch untouched).
**No Marble API call, no credits spent, no new world.** Only the two worlds already in the repo were used
(`qa/worldlabs/05/pilot/full` = `c0c9dc57…` marble-1.1, `qa/worldlabs/05/pilot/draft` = `5fd3d7a7…` marble-1.0-draft).
The playable Three.js game is unchanged (`git diff` on `src/` = 0 lines; nothing here is wired into the game).

Roles, as the user asked: Marble = 3D reconstruction only. Colours, pink ribbons, glossy cyan, white highlights =
the user's original artwork `references/water/05_water_isolated_original.png` (registered to the approved frame:
`qa/pilot05/proj/align/artwork_aligned_864x1536.png`), put onto the geometry by Blender camera projection.

## Answer (short)
* **Perspective — yes, from the one camera Marble was given.** Marble placed the input at focal 700 px (63.3° horizontal
  FOV), pitched 6° up, yaw 0 — the same for the panorama and the splats of BOTH worlds (pano NCC 0.60/0.61, splats
  0.63/0.69). Rendered from that camera, extended to the full 864×1536 approved frame, the Marble world lines up with
  the approved composition (rings, fittings, coins, river course) in the rows Marble saw.
* **Exact S-curve geometry — no.** Three measured failures (numbers below):
  1. the far third of the tunnel and of the river collapses onto a backdrop at ~15 units (full) / ~17 (draft): the last
     visible rings are 1.2–3.1× too shallow;
  2. the river surface is not a flat floor: the far S-bends rise (median depth 0.71× the ideal, 93 % of those pixels
     >10 % too shallow); only a middle band is within 10 %;
  3. Marble never saw rows 767–1536 (Benny's half of the screen; the input was rows 197–767 only). There it invented a
     different river (a giant coin, other ribbons) whose surface is 1.3× too deep (99.7 % of those pixels).
* **Projection onto Marble's surface:** from the locked camera the original artwork lands exactly (99.5 % of the water
  footprint covered, mean |ΔRGB| 1.5/255 vs the artwork) — but that is guaranteed by construction (projection and view
  from the same camera). One tunnel radius further along the ride the Marble surface tears where its coins/bubbles
  were and the far bends stay at the collapsed depth; the ideal flat floor stays clean.
* **Recommendation:** do NOT spend credits on a new Marble world for the river geometry. A single-image world cannot
  give metric depth for the far tunnel (both existing worlds show the same collapse), and the game's own spline river
  already matches the approved water footprint from the locked camera (IoU 0.947, `qa/pilot05/proj/feasibility/`)
  and is contiguous and playable. Next step without credits: the same Blender projection (with the lens-shift fix
  below) onto the GAME's river mesh behind `?proj05=1` (Specialist 1's assignment).

## The full-size camera-locked comparison (separate pictures, same camera and scale, 864×1536)
| File | What it is |
|---|---|
| `compare/1_APPROVED.png` | the approved Screen 05 (unchanged copy) |
| `compare/2_MARBLE_RAW_locked.png` | the full Marble world (1.92 M splats, World Labs Spark renderer) from the locked camera — Marble's own reconstruction and colours |
| `compare/3_NEW_marble_geometry_plus_projected_artwork_locked.png` | Marble's reconstructed river surface + the original artwork projected in Blender, over the Marble tunnel |
| `compare/4_GEOMETRY_marble_depth_vs_ideal_floor_locked.png` | where Marble's river depth matches (green) / is too shallow (red) / too deep (blue) vs the flat river floor implied by the approved image |
| `moved/A…`, `moved/B…`, `moved/C…` | camera moved 1 tunnel radius forward along the approved axis: Marble world + projected river; river on Marble geometry; river on the ideal flat floor |

## Measurements
Camera: `pano_fit_{full,draft}.json`, `splat_fit_{full,draft}.json`; input-view checks `geometry/camera_fit_input_vs_*.png`.
Locked camera for the full frame: f = 700 px, principal point (432, 482.5) (Marble's input started at row 197).

Ring depth (gold bands straight above the approved vanishing point (500, 481)); a straight tunnel needs depth × offset = const:

| ring row | offset px | full: Marble depth | straight-tunnel depth | ratio | draft ratio |
|---:|---:|---:|---:|---:|---:|
| 212 | 269 | 3.50 | 3.55 | 0.98 | 0.99 |
| 309 | 172 | 5.42 | 5.56 | 0.98 | 0.93 |
| 415 | 66 | 12.60 | 14.49 | 0.87 | 0.90 |
| 433 | 48 | 14.85 | 19.92 | 0.75 | 0.81 |
| 447 | 34 | 15.65 | 28.12 | 0.56 | 0.61 |
| 461 | 20 | 15.23 | 47.81 | 0.32 | 0.35 |

River depth vs the ideal flat floor (`compare/4_…json`, draft: `geometry/draft_depth_vs_ideal_floor_locked.json`):

| region | full: within ±10 % | too shallow | too deep | median ratio | draft median |
|---|---:|---:|---:|---:|---:|
| far river, rows < 600 | 7 % | 93 % | 0 % | 0.71 | 0.72 |
| all rows Marble saw (197–767) | 41 % | 37 % | 23 % | 0.98 | 0.98 |
| rows Marble never saw (767–1536) | 0.3 % | 0 % | 99.7 % | 1.30 | 1.28 |

Marble's own colours vs approved inside the water footprint: mean |ΔRGB| 48/255 (rows it saw), 85/255 (rows it did not).
Ideal floor = plane parallel to the axis through the approved vanishing point, height taken from Marble's own near
river (rows 560–767) — so the green band is partly by construction; red/blue are what Marble gets wrong relative to it.

## Method and files
* `tools/marble05/splatlib.py` (PLY loader, Gaussian sampling, front-to-back alpha compositing → median depth),
  `pano_fit.py`, `splat_fit.py`, `river_geometry.py`, `depth_ratio_map.py`, `build_meshes.py`, `compose.py`.
* `tools/marble05/spark/render.{html,mjs}` — Gaussian-splat render with World Labs' Spark 0.1.10 + three 0.178 in
  headless Chromium (SwiftShader, ~8 s/frame). Installed in an isolated scratch folder, NOT in the game's
  `package.json`: `npm install @sparkjsdev/spark@0.1.10 three@0.178.0` in an empty dir, copy `render.html` there,
  link the `.spz`, then `node tools/marble05/spark/render.mjs <dir> <file.spz> <out.png> [px py pz]`.
* `tools/blender/marble05_projection.py` (Blender 5.3): camera `Cam05_MarbleLocked` (lens 16.406 mm, vertical sensor
  36 mm, shift_y −0.18587, rotation X 96°), camera projection → UV map `ProjUV`, unlit artwork material (Standard view
  transform), Cycles renders → `blender/river_*.png`, scene `blender/marble05_projection.blend` (meshes + packed artwork).
  **Found:** Blender's UV Project modifier ignores lens shift (188 px error, `blender_projection_report.json`); the
  projection therefore uses the camera's own projection matrix, checked against `world_to_camera_view` (< 0.03 px).
  Use the same fix for the game-mesh projection.
* Meshes (`marble_river.obj`, `flat_river.obj`, ~200 k quads, 20 MB each) and GLBs are not committed: rebuild with
  `python3 -I tools/marble05/build_meshes.py full <dir>` then the Blender script (`--scene-dir <dir>`).
* Reproduce: `pano_fit.py` → `splat_fit.py` → `river_geometry.py full|draft qa/pilot05/marble_feas/geometry` →
  `depth_ratio_map.py` → `build_meshes.py` → Blender script → Spark renders → `compose.py`.

## Limits of this test (disclosed)
* Depth comes from the 500 k-splat export (alpha-composited median depth of sampled Gaussians), not from the
  1.92 M full-resolution splats; the Spark pictures use the full-resolution file for the locked view, 500 k for the moved view.
* Coins and bubbles were removed from the Marble river surface with a robust image-space median; their holes show in
  the moved view.
* Single-camera projection stretches the near texture when the camera moves forward — on any geometry (also the flat
  floor). A playable river needs the design baked along the river's own UVs (u across, s along) — Specialist 1/2's plan.
* No fidelity score is claimed beyond the measured numbers above.

## If the user still wants a new Marble world (needs the user's OK — paid)
Only variant with a chance to help: input = the FULL approved portrait frame (Benny, HUD and coins removed) so the near
half is reconstructed instead of invented. It would not fix the far collapse. Ledger prices: draft ≈ 230 credits,
marble-1.1 ≈ 1,580 credits (remaining approved budget 4,440 of the 6,250 cap). The World Labs API host is currently
not reachable from this session's environment (network policy refuses `api.worldlabs.ai`, and the environment holds
no saved World Labs key) — that must be fixed before any paid job; it did not affect this test.

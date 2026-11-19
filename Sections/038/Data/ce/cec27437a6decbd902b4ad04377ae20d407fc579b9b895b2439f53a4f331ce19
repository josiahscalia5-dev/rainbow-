# Screen 05 tunnel bake — walls, rings, near frame (status 2026-11-16 ~20:50 UTC)

Same method as the approved-water projection `?proj05=1`: the user's APPROVED Screen 05
(`references/05_flow_into_the_current.png`) unwrapped into each object's OWN coordinates and baked into textures, shown
through the post-chain inverse (`pjInverse`, `src/vfx/waterRibbon.ts`). Default build and the protected BEFORE are
untouched (verified pixel-identical, below). Nothing here is promoted: the user approves visually first.

| Switch | Object | Texture | Bake |
|---|---|---|---|
| `?projwall05=1` | purple perforated walls, one atlas row per bay AB…GX | `assets/textures/tunnel05/wall05.png` | `tools/proj05/tunnel_rings.py` → `tunnel_bake.py` |
| `?projring05=1` | gold rings (approved ring B band on every 05 ring) | `assets/textures/tunnel05/ring05.png` | `tunnel_bake.py` |
| `?projframe05=1` | near gold frame: bottom corners + bottom lip (`tube05_near_frame`) | `assets/textures/tunnel05/frame05.png` | `tools/proj05/frame_bake.py` |
| `?projlid05=1` | the 6 wall paddles L1 L2 L3 / R1 R2 R3 as Blender-built trays (default pucks + far pucks off) | `assets/models/lids05.glb` (texture `lid05.png` inside) | `lid_mesh2d.py` → `scripts/proj05-lid-raycast.mjs` → Blender `lid_blender.py` |

Full test URL: `?proj05=1&projwall05=1&projring05=1&projframe05=1&projlid05=1`. Shader wrappers: `src/vfx/proj05Tunnel.ts`.

## Colour feedback (bloom spill the shader cannot undo)
* Walls / rings: `tools/proj05/tunnel_residual.py <capture> <tunnel_coords_all.f32> assets/textures/tunnel05 qa/pilot05/proj/tunnel/model/correction.npz`
  then re-run `tunnel_bake.py … correction.npz`. Coordinates: `node scripts/proj05-tunnel-probe.mjs --coords --all --q='projwall05=1&projring05=1' --raw=<scratch>`.
  The HUD bar + title (rows < 204) are excluded from this game-vs-texture measurement (they are drawn over the canvas).
  Result at the interruption (previous account, 20:24 UTC, saved in e27c6fa): walls mean |capture − texture| 2.0 levels
  (99.8 % within 10), rings 4.4–4.5 (94–95 %). A second correction pass did not reduce it further.
* Near frame: `python3 -I tools/proj05/frame_bake.py assets/textures/tunnel05 3 --capture=<05.png with projframe05> [--reset=1]`
  (accumulates `qa/pilot05/proj/tunnel/model/frame_correction.npy`; low-frequency only, never adds picture detail).

## Game vs APPROVED (the measurement that was still missing): `tools/proj05/screen_regions.py`
Regions are defined on the approved picture; the HUD is its own region and is excluded from every tunnel region; the
whole screen is reported both below the HUD (FRAME) and with it (FULL). Results: `frame/REGION_METRICS.json`.

| mean abs diff (levels), share within 20 | default T2 | `proj05` | recovered (wall+ring) | + `projframe05` |
|---|---|---|---|---|
| NEARFRAME (bottom gold frame) | 66.7, 10.8 % | 61.5, 13.8 % | 61.5, 13.8 % | **18.1, 77.1 %** |
| WALL | 67.5, 6.9 % | 65.8, 7.5 % | 56.9, 17.9 % | 56.9, 17.9 % |
| RING | 58.6, 10.7 % | 58.4, 10.9 % | 54.0, 15.5 % | 54.0, 15.5 % |
| LID (paddles) | 62.8 | 62.8 | 62.6 | 62.6 |
| TUNNEL (all of the above) | 65.2, 8.5 % | 63.2, 9.6 % | 57.6, 16.0 % | **48.7, 29.0 %** |
| FRAME (everything below the HUD) | 54.2, 19.4 % | 37.7, 47.7 % | 35.7, 50.0 % | **32.2, 55.0 %** |
| FULL screen incl. HUD | 55.4, 18.5 % | 40.9, 43.2 % | 38.9, 45.3 % | **35.9, 49.7 %** |

Walls / rings stay far from the approved pixels although they match their own texture to 2–4 levels: the game's rings
and perforation slots do not sit on the same screen pixels as the painting (tunnel geometry and camera are locked by
user rule), so per-pixel error there is mostly position, not colour.

## `?projframe05=1` (this session)
1. The near frame (camera-held 3D band, wave 7) used a hand-picked palette that rendered pale cream; neither tunnel
   switch reached it (raycast: `tube05_near_frame`, key `near-frame-05-v1`). Now it samples the approved gold band in
   its own (along-arc, across-band) coordinates; foam / bubbles / magenta water in front of the gold are filled along
   the band; smoothed along the arc (sigma 3 texels of 256).
2. Outline: the frame stands 40 reference px (+ bulge) toward the viewer, so perspective pushed it 15–35 px outward
   from its measured reference edges, leaving a gap where the projected water showed a washed gold strip with white
   blocks. Under the switch the vertex shader pre-shrinks x, y by the depth factor → it projects onto its designed
   outline. Default geometry unchanged.
3. One bloom-feedback pass (`--capture`).

## Verified
* default T2 capture before/after the change: 0 differing pixels; protected BEFORE `?ringa=26&nearfloor05=0` vs
  `qa/pilot05/wave9/baseline/05.png`: 0 differing pixels; recovered experiment without the new switch: 0 differing pixels.
* `node scripts/gameplay-test.mjs --q='proj05=1&projwall05=1&projring05=1&projframe05=1'` → all 8 checks pass
  (`frame/tests/gameplay_projframe05.json`); `npm run test:continuity` OK; `tsc` OK.

## `?projlid05=1` — the paddles, built in Blender (2026-11-16 ~21:45 UTC)
User: "they're facing the wrong way … they're down, not up … different texture". At 4× zoom the approved paddle is a
D-shaped gold TRAY seen from below: thick polished rim on top, lavender underside, straight lip low. The default 'slab'
pucks sit at eye level so the camera sees their tops. Blind fitting of a lathe lid (`scripts/proj05-lid-fit.mjs`,
`lid/fit.json`) could not reproduce the painted shape (the painting draws them longer than real perspective allows), so
the Blender camera-projection method was used instead:
1. `python3 -I tools/proj05/lid_mesh2d.py` — each approved outline (tunnel_common.LIDS) as a 2D triangle mesh (4 px).
2. `node scripts/proj05-lid-raycast.mjs` — every vertex lifted onto the REAL 05 wall through the REAL locked 05 camera
   (L2 / R2 deep ends and L3 / R3 on the forced-perspective far wall).
3. `blender -b --factory-startup -P tools/proj05/lid_blender.py -- qa/pilot05/proj/tunnel/lid assets/textures/tunnel05/lid05.png 58,311,864,532 assets/models/lids05.glb 0.35`
   — trays: back 0.02 u off the wall, front 0.35 u (radially) closer to the axis along the same camera rays, sides along
   the rays → from the checkpoint the outline is exactly the approved one, riding on they show real depth; UVs = the
   approved pixels (camera projection). Saves `lid/lids05.blend` (game camera + approved picture as its background).
4. The game loads the GLB under the switch (`src/vfx/proj05Tunnel.ts` lids05Group) and shows the texels through pjInverse.

| vs approved | before (`projframe05`) | `projlid05` |
|---|---|---|
| LID region mean abs / within 10 / SSIM | 62.6 / 2.2 % / 0.195 | **19.3 / 74.3 % / 0.731** |
| TUNNEL within 20 | 29.0 % | 33.8 % |
| FRAME (below HUD) mean abs / within 20 | 32.2 / 55.0 % | 31.1 / 56.8 % |
| FULL screen mean abs / within 20 | 35.9 / 49.7 % | 34.8 / 51.2 % |

Motion: `node scripts/proj05-move.mjs --q=… --at=0,6,14` → `lid/move/` (paddles stay solid trays on the walls).
Checks: default 0 px changed, protected BEFORE 0 px, `projframe05` result 0 px; gameplay 8/8 (`lid/tests/`); continuity OK.
Known: the game's ring A band covers the left end of L1 (ring position differs from the painting; rings not moved);
the trays are static on the far wall, so L3 / R3 do not follow the far section's "open" morph near the end of 05.

## Next
1. Water in motion: the approved swirl smears as Benny rides on (motion frames `lid/move/move_14.png`) → Specialist 2's
   `?projflow05=1` (flow the SAME approved design down the S-curves).
2. Ring A position vs L1; river-bank apron edges; Benny (fur, hat); splash.

## Remaining before the paddles (kept for the record)
1. LID / side fittings: still flat salmon-orange, approved is polished copper-gold (62.6 levels) → `?projlid05=1`.
2. River-bank apron of `?proj05=1` (`src/vfx/proj05Apron.ts`, `proj05_A.png`): hard jagged polygon edge with stray
   speckles on the wall above both banks; now clashes with the projected wall perforations.
3. Rings: blue bias (+43 B) where the painting shows gold and the game shows wall → ring position / thickness, not colour.
4. Benny (fur spikier, hat flatter), splash (white feathers vs spray), coins, HUD: not touched in this pass.

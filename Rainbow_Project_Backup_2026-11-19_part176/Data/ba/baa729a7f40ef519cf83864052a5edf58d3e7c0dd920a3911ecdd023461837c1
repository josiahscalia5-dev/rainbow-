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

Full test URL: `?proj05=1&projwall05=1&projring05=1&projframe05=1`. Shader wrappers: `src/vfx/proj05Tunnel.ts`.

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

## Remaining (next, one factor at a time)
1. LID / side fittings: still flat salmon-orange, approved is polished copper-gold (62.6 levels) → `?projlid05=1`.
2. River-bank apron of `?proj05=1` (`src/vfx/proj05Apron.ts`, `proj05_A.png`): hard jagged polygon edge with stray
   speckles on the wall above both banks; now clashes with the projected wall perforations.
3. Rings: blue bias (+43 B) where the painting shows gold and the game shows wall → ring position / thickness, not colour.
4. Benny (fur spikier, hat flatter), splash (white feathers vs spray), coins, HUD: not touched in this pass.

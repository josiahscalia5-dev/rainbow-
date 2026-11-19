# Screen 07 — approved scenery on real 3D geometry (`?match07=1`, milestone 1, 2026-11-17)

Method = Screen 08's (`qa/match/08/NOTES.md`); Screen 04's `match04.ts` used as the second worked example (adapted
copies in `tools/match07/`, nothing merged). Default build unchanged (0 px, verified).

## Pictures (separate, full size)
* APPROVED `qa/match/07/07_APPROVED.png` (= `references/07_dive_the_washer_tube.png`, unchanged)
* BEFORE `qa/match/07/07_BEFORE_current_game.png` (default build, 07 checkpoint)
* NEW `qa/match/07/07_NEW_match07.png` (`?match07=1`)
* Moving: `qa/match/07/motion/f03_forward3u.png`, `f06_…`, `f10_…`, `f20_forward20u.png`, `s_left_steer.png`, `s_right_steer.png`
* Start of the 07→08 drop WITH the switch: `motion/d0_before_drop_8u.png`, `d1_drop_start.png`, `d2_drop_4u.png`, `d3_drop_mid.png`;
  WITHOUT: the same names + `_WITHOUT_match07.png`.

## Numbers (`tools/match07/metrics07.py` → `metrics_BEFORE_NEW.json`; share of pixels within 20 levels, SSIM)
| region | BEFORE | NEW |
|---|---|---|
| whole frame | 6.7 % (SSIM 0.19) | **80.1 %** (SSIM 0.79) |
| below HUD | 5.8 % | **86.7 %** (SSIM 0.85) |
| SCENERY (no HUD strip, no Benny) | 6.0 % | **95.5 %** (SSIM 0.95) |
| upper: tunnel, gold rings, paddles (y 200–560) | 3.8 % | **100.0 %** (SSIM 0.998) |
| middle: river start, coins, far rings (y 560–900) | 6.1 % | **90.3 %** (SSIM 0.90) |
| lower: water, foam (y 900–1536, no Benny) | 7.5 % | **95.6 %** (SSIM 0.95) |
| Benny area | 4.3 % | 16.6 % (game Benny, not in this brief) |
`tools/qa/screen_match.py`: FULL ≤20 80.1 %, BELOWHUD 86.7 %, LAYOUT 87.8 %.

## What `?match07=1` does
1. **Camera** solved offline at FOV 62 (`tools/match07/solve_cam07.py`): Benny's box on the painted Benny (208,780–640,1210)
   and the game tube axis' vanishing point on the painted ring centre (612,548). Camera = Benny's water point + off07,
   looking along dir07, level (MATCH_CAM line + cameraRig block). Projector then locked to the LIVE checkpoint camera
   (`tools/match07/lock_projector07.py`) because bending the river moves the checkpoint point ~0.1 u.
2. **Geometry** (`tools/match07/fit_proxies07.py` → `assets/textures/match07/proj07.json`): cylinder along the game's 07
   tube axis (radius 5.84, axis 3.1 above the water, fitted to painted rings R2–R5 at 19.8 / 35.6 / 60 / 103 u; R1 at 11.2 u),
   water plane at Benny's level, five paddle blocks standing 1.2 u out of the wall at the painted spots.
3. **Texture**: original pixels (77.9 %) + PROVISIONAL local fill for HUD/title/Benny/coins (22.1 %); shader inverts the
   post chain (PROJ05_INVERSE), no fog, bloom 0 on the stretch. Projector depth test + stretch/magnification guard.
4. **Unseen / magnified surfaces = ring-structured tiles** unwrapped from the artwork through the locked camera
   (`tile_wall.png`: painted wall bay R2→R3, repeated every 8.55 u = painted R1→R2 spacing so tile rings line up with the
   painted rings; `tile_river.png`: painted river, seamless repeat along the tube). No smearing deep in the tube at 10–20 u.
5. **River path** follows the painted S-river (Benny + painted coins cast on the water plane → `river07.json`, 5
   correction rounds against the course smoothing, residual ≤ 0.35 u); 07 river level (no banking) under the switch so
   Benny never sinks under the painted water when steering.
6. **Coins**: the picture's 8 coins at the painted spots as real pickups (the 4 far ones lie beyond the plunge top in the
   painting's exaggerated perspective → slid along their own view rays to 27/29/31/33 u ahead, same pixel, scaled).
   24 coins on 07 as before; full run **91 coins / 2,240**.
7. Shown from 07 start +14 u to plunge top −8 u; outside it the game's own tube, river and drop are shown unchanged.

## Tests
* Default 06/07/08 0 px, `?match08=1` 08 0 px, `?ringa=26&nearfloor05=0` vs wave9 baseline 0 px (`m1/proofs_0px.json`).
* Gameplay 8/8 with (`m1/gameplay_match07.json`, 91 coins, 2,240) and without (`m1/gameplay_default.json`, byte-identical to `qa/gameplay_test.json`).
* Continuity: default unchanged (all joins gap 0, drop 61.19). With the switch: all joins gap 0, `ok: true`, drop 61.02,
  plunge top 2 u later in s (longer S-river), max tangent step 7.96° vs 6.24° (`m1/continuity_*.json`).
* `npx tsc --noEmit -p .` clean.

## Open problems (visual)
1. Provisional fill under the painted Benny shows as a mirrored patch on the water when moving 3–6 u forward → fal clean
   plate (`FAL_PLATE_REQUEST.md`, prepared, not run).
2. Hand-over at plunge top −8 u: the painted tube switches to the game's tube (different look: wider radius 7.2, game
   rings/lids/foam walls) — a visible change before the drop. Fix idea: carry the projected tube + tiles down the plunge,
   or tile the game tube with the 07 tiles near the top.
3. Entry at 07 start +14 u: same kind of switch from the game's tube (only seen before the 07 view settles).
4. Benny is the game's Benny (look owned by the Benny specialist); his box is a little narrower/taller than painted.
5. Water is static (no flow animation yet); painted bubbles stay on the surfaces.

## Reproduce
```
node tools/match07/probe07.mjs '' > p.json; python3 -I tools/match07/solve_cam07.py p.json cam07.json
python3 -I tools/match07/fit_proxies07.py cam07.json assets/textures/match07/proj07.json
python3 -I tools/match07/river_coins07.py assets/textures/match07/proj07.json assets/textures/match07
# rounds: node tools/match07/probe07.mjs match07=1 > pm.json; python3 -I tools/match07/river_iter07.py pm.json assets/textures/match07/river07.json
python3 -I tools/match07/lock_projector07.py pm.json assets/textures/match07/proj07.json
python3 -I tools/match07/make_plate07.py references/07_dive_the_washer_tube.png assets/textures/match07/proj07.json assets/textures/match07/coins07.json assets/textures/match07
node scripts/capture.mjs 07 --q=match07=1 --out=<dir>; node tools/match07/motion07.mjs <dir>
```

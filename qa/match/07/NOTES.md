# Screen 07 · DIVE THE WASHER TUBE — `?match07=1` (Screen 08 method)

Approved picture: `references/07_dive_the_washer_tube.png` (864×1536, unchanged). Switch: `?match07=1` (also `?matchall=1`).
Without the switch the game is unchanged (0 px proofs below). Approval status: **in development / under review** — only
the user approves.

## Pictures for the user (separate, full size)
| | file |
|---|---|
| APPROVED | `qa/match/07/07_APPROVED.png` (copy of the reference) |
| BEFORE (current game, no switch) | `qa/match/07/07_BEFORE_current_game.png` |
| NEW (`?match07=1`) | `qa/match/07/07_NEW_match07.png` (round-3 re-capture: `qa/match/07/m3/07_NEW_match07_r3.png`) |
| moving, NEW | `qa/match/07/m1/motion/` — forward 3 / 6 / 10 / 20 u, steering left / right, before the drop, drop start, drop +4 u, drop middle |
| moving, BEFORE | `qa/match/07/m1/motion_default/` — the same frames without the switch |

## Numbers (`tools/match07/metrics07.py`, same measures as `tools/qa/screen_match.py`; share of pixels within 20 levels / mean abs / SSIM)
| region | BEFORE | NEW |
|---|---|---|
| whole frame | 6.7 % / 74.3 / 0.19 | **80.1 %** / 15.0 / 0.79 |
| below the HUD | 5.8 % / 75.9 / 0.19 | 86.7 % / 10.4 / 0.85 |
| scenery (no HUD/title, no Benny) | 6.0 % / 74.5 / 0.20 | **95.5 %** / 3.8 / 0.95 |
| upper: tube, rings, paddles (y 200–560) | 3.8 % | 99.96 % |
| middle: river, coins, far rings (y 560–900) | 6.1 % | 90.4 % |
| lower: water + foam, no Benny (y 900–1536) | 7.5 % | 95.6 % |
| Benny's area | 4.3 % | 16.6 % (Benny is the game's own model — not changed here; owner: Screen 08 Benny specialist) |

The whole-frame number is held down mainly by Benny (game model vs painted Benny: size, hat stripes, pose) and the
HUD/title (game-drawn, same design). These are pixel statistics, not a "fidelity score".

## How it is built (`src/world/match07.ts`, tools in `tools/match07/`)
1. **Camera solve** (`solve_cam07.py` → `assets/textures/match07/cam07_locked.json`, `qa/match/07/m1/cam07.json`): at the
   game FOV 62°, so Benny's box lands on the painted Benny (221,768–626,1223 vs 208,780–640,1210) and the tube axis'
   vanishing point on the painted ring centre (612,548). In the game: `MATCH_CAM['07']` = camera at Benny's water point
   + `off07`, looking along `dir07` (level), blended in after the 07 start and out before the plunge top.
2. **3D proxy geometry fitted to the picture** (`fit_proxies07.py` → `proj07.json`): the purple tube = a cylinder along
   the game's 07 tube axis (r 5.84 u), painted gold rings at 11.2 / 19.8 / 35.6 / 60.0 / 102.6 u, the water plane at
   Benny's water level, the five paddles upper-left as blocks at the painted spots.
3. **The user's ORIGINAL pixels camera-projected** from that locked camera, with the game's post chain undone
   (`PROJ05_INVERSE`, no fog). HUD, title, Benny and the 8 coins are removed by a PROVISIONAL local fill
   (`make_plate07.py` → `plate07_hybrid.png`, mask `plate07_fillmask.png`, 22.1 % of the frame). A fal clean plate is
   PREPARED, NOT run: `qa/match/07/FAL_PLATE_REQUEST.md`.
4. **Unseen surfaces** (stretch guard + projector depth test): RING-STRUCTURED tiles unwrapped from the artwork —
   `tile_wall.png` = one painted ring bay (R2..R3), repeated every 8.55 u so rings stay rings deep in the tube;
   `tile_river.png` = the painted river, cross-faded for a seamless repeat along the water.
5. **River path along the painted S-river** (`river_coins07.py`, `river_iter07.py` → `river07.json`; `course.ts` `x07()`),
   level (bank 0 on 07), eased in/out so the 06 join, the plunge and 08 keep their shape.
6. **The picture's 8 coins at the painted spots** as real pickups (`coins07.json`, `coins.ts`); they replace the first 8
   trail coins, so the run total stays exactly **91 coins / 2,240**.
7. The projected scenery is shown from 07 start +14 u to 8 u before the plunge top; **the huge 07→08 downward drop keeps
   the game's own tube and camera** (frames `d0..d3` in `m1/motion*/`).

## Proofs
* Default build 0 px different from the pre-change commit `3c7fca9` on 06 / 07 / 08, `?match08=1` on 08 0 px, protected
  05 BEFORE (`?ringa=26&nearfloor05=0` vs `qa/pilot05/wave9/baseline/05.png`) 0 px — round 2: `m1/proofs_0px.json`;
  round 3 re-run: `m3/proofs_0px_r3.json`.
* Continuity (`scripts/continuity-test.ts`): all joins gap 0; plunge vertical drop 61.19 u default / 61.02 u with
  `match07=1`, min pitch −70° (`m3/continuity_default.json`, `m3/continuity_match07.json`, identical to round 2).
* Gameplay `scripts/gameplay-test.mjs` 8/8 with and without `match07=1`, coins end at 2,240 both (`m1/gameplay_*.json`).
* `npx tsc --noEmit -p .` clean.

## Known problems (honest)
* Benny is the game's model (not the painted Benny) → the Benny area stays far apart (16.6 %). Not this workstream's file.
* Provisional fill: where a coin is collected or Benny steers aside, a soft patch of filled river/wall is visible.
* Moving: at 20 u forward a faint doubled ring layer shows upper-left (the projected picture and the ring tile overlap
  where the stretch guard cross-fades); at 3 u the near water shows a mirrored diamond from the river tile. MILESTONE 2.
* The projected look is strongest near the locked view; farther along, the tube relies on the ring tiles (less detail
  than the painting, but no smears).
* No phone test (no device in the cloud).

## MILESTONE 2 (round 4, 2026-11-17) — moving-view fixes
Kept set: `?match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1` (details + verdicts: `STATUS.md`).
* `m07wall` → `assets/textures/match07/tile_wall_clean.png`: the painted paddle rows of the ring-bay tile replaced by the
  perforated wall from just below (feathered) + a small inpaint at its tip.
* `m07river` → `tile_river_clean.png`: orange/gold hues of the river tile recoloured to the pink bank hue (brightness kept).
* `m07fill` → `plate07_fillmask_soft.png`: the fill mask eroded + blurred, clipped to the original mask (fades only inside).
* `m07gold`: paddles take the picture only within ~14° of the approved view direction, else solid polished gold.
* `m07coins` (`src/gameplay/coins.ts`): two far trail coins at lateral 0.42 / 1.82, scale 0.45 (`m2/coins/probe_m07coins.json`).
* `m07ang`: tested in round 3, no visible effect → not kept (code stays, off).
Pictures: `m2r4/pictures/1_APPROVED_07.png`, `2_BEFORE_M1_07.png`, `3_NEW_M2_07.png`; moving: `m2r4/motion_k5/`.

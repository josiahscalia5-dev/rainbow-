# Screen 05 coins (`coins05`): animation-and-gameplay-engineer, CHECKPOINT NOTES (work in progress)

Status at checkpoint (2026-11-17 ~00:50 UTC): layout and look are written in `src/gameplay/coins.ts` and typecheck
(`npx tsc --noEmit` clean). They have NOT been verified in a real game capture yet. Everything is behind
`on05('coins05')` (true for `?coins05=1` or `?match05=1`); with the switch off the code path is the same as before.

## Files changed / created
| file | what | gated? |
|---|---|---|
| `src/gameplay/coins.ts` | `COINS05 = on05('coins05')`. LAYOUT (run #3 = v3): table `C05M`, 18 measured coins [ds from `05_crest`, lat, scale, h?] replace the 05 coins after the checkpoint (pre-checkpoint trail and all other screens' coins unchanged; every coin keeps its old bob / wobble phase via `CoinDef.phase`). Coins 7–18 are pulled in front of the far relief (own `h`). Far coins carry `far: [checkpoint scale, checkpoint distance]` and grow to `C05M_NEAR(k)` (≤ 0.9, capped by 0.85 × the 3-D gap to a neighbour) once Benny is 15 u closer. Measured coins face the straight 05 tube axis upright (`CoinDef.axis`), lean back 0.9 rad, wobble 0.06 rad. LOOK (`C05LOOK`): unlit `MeshBasicMaterial` + `PROJ05_INVERSE`, face map `coin05_face.png` (turned half a turn: v1 was upside down), edge = canvas texture from the approved band rows (zero-mean ridges, brighter sides), thickness 0.18, far tint toward (250, 235, 70) from 50 → 55 u camera distance. The face texture is pushed to `proj05Pending` (game waits before `ready`). | yes |
| `qa/pilot05/full_reference_match/coins/measure_coins.py` | approved / game coin silhouettes (box centre, width, face / edge split) | tool |
| `qa/pilot05/full_reference_match/coins/targets_v2.json` | solve targets v2 (18 coins, `occl` = pull hidden coins in front of the relief) | data |
| `qa/pilot05/full_reference_match/hud/probe05.mjs` | `--solve` extended: occlusion-aware placement along the camera ray, returns h, round-trip check | tool |
| `assets/textures/coins05/coin05_face.png` | approved nearest coin (face ellipse centre (474.0, 723.25), semi-axes 48.5 × 36.25) un-foreshortened to a 256² disc | only loaded when COINS05 |
| `qa/pilot05/full_reference_match/coins/coin_bake.py` | makes the face texture | tool |

Collection, points and the live counter are untouched (`update()` distance test, `COIN_VALUE`, Game.ts `hud.setCoins`).
Course, steering, collisions untouched.

## Measured approved coins (centre x, y, face width w, px) and the solve onto the course
Solver: `node qa/pilot05/full_reference_match/hud/probe05.mjs --out=DIR --solve=targets.json stack='<STACK>'`
(targets used: `/tmp/claude-0/hc05/targets_v1.json`; values are copied into `C05M` in coins.ts). Every target was hit
exactly (projected centre = approved centre).
| # | approved x, y, w | solved ds, lat | scale | game today (STACK, coinScreen x, y, Ø) |
|---|---|---|---|---|
| 1 | 473.5, 725, 96 | 6.356, −0.311 | 0.976 | 488, 739, 93 |
| 2 | 548.5, 658.5, 70 | 10.95, 0.161 | 0.95 | 555, 662, 67 |
| 3 | 481.5, 612, 56 | 16.614, −0.144 | 1.001 | 478, 609, 49 |
| 4 | 431, 575, 43 | 26.225, −0.665 | 1.085 | 432, 578, 37 |
| 5 | 465.5, 545, 28 | 43.262, −1.754 | 1.085 | 441, 560, 29 |
| 6 | 495.5, 532.5, 20 | 48.928, −1.967 | 0.832 | 470, 550, 24 |
| 7 | 518, 524, 17 | 55.075, 0.919 | 0.788 | 555, 541, 21 (not in the approved frame) |
| 8 | 532, 516.5, 12.5 | 56.475, 1.629 | 0.591 | none |
| 9–15 | (537,509,10) (534,502,8) (526,497,7) (516,492,6) (507.5,489,5) (498,487,5) (490.5,485.5,4) | ds 57.5–59.7 | 0.48 → 0.20 | none (game has no far line) |
The game's straight 05 tube ends at ds 56.5 (stage 05 s1); the approved far line needs ds 56–60 where the course starts
to climb, so the far coins use scales < 1 at the checkpoint (grow when Benny approaches; see above). Whether coins 9–15 are
hidden by the far block / end rings in the game is NOT verified yet.

Look, measured: approved coin 1 face ≈ (250, 200, 2) yellow-gold, raised parts (255, 245, 100), dark accents (210, 70, 0),
edge band (231,164,29) → (147,96,53) over ~10 px; game coin 1 face (255, 222–230, 107–154) pale peach, edge (255,208,67) ~15 px.

Region numbers BEFORE (STACK): coins 27,437 px, mean |ΔRGB| 54.0, within 20 levels 18 %.

## In progress right now
UPDATE ~01:05 UTC (run stopped for the account transfer): no coin change since the checkpoint; the first real capture with
`coins05=1` has still NOT been taken. `src/gameplay/coins.ts` typechecks (`npx tsc --noEmit` clean). Step 1 below is next.
(The autosave at 00:28 already contains coins.ts, coin05_face.png and the hud05 sprites.)

## RUN #3 (session 01Q46SCH, 2026-11-17 ~01:20 UTC) — progress
1. DONE — first real probe with `STACK&hud05=1&coins05=1 --vis` (/tmp/claude-0/hc05/r3/p1): coins 1–6 drawn at the
   approved centres; coins 7–15 NOT visible. Cause (raycast through each coin centre): the far end of the 05 tube is a
   forced-perspective relief (`environment.ts` `tube05_far_river` / `tube05_far_wall` / `tube05_end_glow`, virtual depth
   59 → 430 squeezed into ~1 u) at 58.4–59.2 u from the camera; coins 7–15 were solved on the river at 60.4–64.2 u = behind it.
2. DONE — look measured on silhouettes (new tool `coins/measure_coins.py`: face + edge band, box centre = projected
   cylinder centre). approved | game v1: coin 1 box 426–522 × 686–771 | 425–521 × 683–768 (3 px high); face / edge on
   the centre column 74 / 12 px | 79 / 7 px; coins 2–4 faces 6–9 px too tall, edges 2–4 px too thin; coins 5 / 6 drawn
   27 / 19 px wide vs approved 30 / 21. The face art was UPSIDE DOWN (the "$" stubs and the bevel light at the bottom).
3. DONE — fixes in `src/gameplay/coins.ts` (all under `coins05`): face texture rotated by π; `C05LOOK` thick 0.13 → 0.18,
   measured coins lean back 0.9 rad (was C05.tilt 0.8); new targets `coins/targets_v2.json` (silhouette centres, 3 more
   tiny far coins 16–18 found left of coin 15 at the vanishing point); solver extended (`hud/probe05.mjs`: a coin hidden
   behind the relief is pulled forward along its own camera ray to just in front of the first non-coin surface over its
   footprint, scale re-solved, depth order kept, round trip 0 px); `C05M` now 18 rows [ds, lat, scale, h?]: coins 1–6 on
   the river (h 1.2, ds 6.2–45.6), coins 7–18 at ds 51.1–54.0, h 1.73–3.38 (an arc rising into the light in front of the
   relief), near size capped by the 3-D gap. `npx tsc --noEmit` clean.
4. DONE — v2 real probe (/tmp/claude-0/hc05/r3/p2, `STACK&hud05=1&coins05=1`): all 18 coins drawn (first ray hit = coin);
   silhouettes within ~1 px of approved (coin 1 426–521 × 687–770 vs 426–522 × 686–771; coin 2 514–583 × 632–689 both;
   coin 8 525–539 × 509–523 both). Coins region 53.96 → 30.46 (≤20 17.6 → 45.5 %). Remaining: coins 5–7 YAWED (each coin
   faced the local meander tangent + a ±0.18 rad wobble; approved coins face the camera squarely), edge band 5–17 levels
   too green / blue (ridges not zero-mean), far coins too orange (approved core G 207 → 227 from coin 6 on, B up to 130).
5. DONE — v3 (`coins.ts`, coins05 only): measured coins face the straight 05 tube axis with world-up (`CoinDef.axis`),
   wobble 0.06 rad; edge texture from the approved band rows with zero-mean ridges and the measured side brightening
   (×(1 + 0.55 |sin θ|^1.3)/1.15); far tint toward (250, 235, 70) by camera distance (0 at 50 u → 0.6 at 55 u, unlit
   shader varying). Probe /tmp/claude-0/hc05/r3/p3: coins 30.46 → 28.30 (≤20 45.5 → 50.5 %); per coin (mean |ΔRGB| in the
   approved silhouette box, v2 → v3): 1 24.7 → 21.6, 2 23.2 → 21.5, 3 25.2 → 23.9, 4 29.1 → 26.2, 5 47.0 → 30.5,
   6 35.1 → 30.1, 7 50.1 → 38.2, 8 48.0 → 36.5, far line 42.0 → 40.7; coin-1 face 13.7 → 10.5, edge 30.7 → 22.9.
   Rest of the coin-mask error = water round the coins (approved warmer by R +13–25) and the approved 1-px light rim:
   not coin geometry (water = coordinator). Official captures + gameplay: in progress.

## RESULT (real game captures, 2026-11-17 ~01:44 UTC, `scripts/capture.mjs 05`, locked frame)
* `coins/before.png` = STACK (fresh, = `stack_2340/05_match05.png`, 0 px), `coins/new.png` = STACK + `coins05=1`,
  `coins/new_hud05_coins05.png` = STACK + both switches; metrics `coins/*_REGION_METRICS.json` / `*_FULL_FRAME_METRICS.json`.
| | before (STACK) | new (STACK + coins05) |
|---|---|---|
| coins region, mean abs dRGB / within 20 / SSIM | 53.96 / 17.6 % / 0.266 | **28.30 / 50.5 % / 0.537** |
| whole frame, mean / within 20 | 34.10 / 51.6 % | 33.50 / 52.3 % |
| with hud05 too | | whole frame 29.26 / 57.9 % |
| (for reference: `?match05=1` at recovery, coins05 v1) | | coins 42.58 / 30.3 % |
* Coin silhouettes (face + milled edge; `coins/measure_coins.py`), approved | new: 1 426–522 × 686–771 | 426–521 × 687–770;
  2 514–583 × 632–689 | 514–582 × 632–689; 3 454–509 × 591–634 | 454–508 × 590–635; 4 410–453 × 558–592 | 410–452 × 558–592;
  5 451–480 × 535–557 | 450–480 × 534–558; 6 485–505 × 524–540 | 484–505 × 523–540; 7 510–527 × 515–531 | 510–527 × 515–529;
  8 525–539 × 509–523 | 525–539 × 509–523; coins 9–18 (4–10 px) at their measured centres (`coinScreen`, ±1 px), all drawn.
  Face / edge on coin 1's centre column: approved 74 / 12 px, new 73 / 11 px (v1: 79 / 7).
* Per part, mean abs dRGB in the approved coin boxes: coin 1 21.6, 2 21.5, 3 23.9, 4 26.2, 5 30.5, 6 30.1, 7 38.2, 8 36.5,
  far line (9–18) 40.7; approved-coin-coloured pixels 18.8 (STACK 54.2); the rest of the mask (water round the coins) 39.9.
* Default build: 05 == `qa/pilot05/current_default_05.png` (0 px, `scripts/capture.mjs 04 05 06`, no switches).
  Re-checked with the FINAL code (after the last hud.ts edit, ~01:50 UTC): 0 px differ; `npx tsc --noEmit` clean.
* Other screens with `hud05=1&coins05=1` vs default: 04 and 06 change only in the coins themselves (> 8 levels: 04 x 344–432
  / y 466–753, 06 x 166–307 / y 952–1131) + 1–2-level bloom spill; placement on 04 / 06 unchanged (same positions), the
  coin LOOK (approved face, 0.18 thickness, milled edge, far tint) is global under the switch.
* Gameplay `coins/gameplay.json` (STACK + hud05 + coins05): 8/8 pass; real pickups 1,330 → 2,330 (100 coins; default run
  and v1 `match05`: 91), counter live. Ride frames `coins/move/move_{00,08,17,30,45}.png`: counter 1,420 → 1,430 → 1,450 →
  1,460 while riding at lat 0; at d 30–45 (relief opened) the far coins read as a winding arc of small coins at the tube end.
  `npm run -s test:continuity`: ok (outputs unchanged).

## What still differs (and why)
* Water round the coins (39.9 in the coin mask): the approved water there is warmer (R +13–25) and the approved coins have
  a 1-px light rim / glints; the water is the coordinator's projected river, not coin geometry.
* Far line 9–18 (40.7): 4–10-px coins inside the bright glow; the approved ones blend into the light (B up to 130).
* Far coins 7–18 are not on the river surface: the end of the 05 tube is a forced-perspective relief ~1 u deep, so a real
  coin can only be in front of it. They sit at ds 51.1–54.0, 0.5–2.2 u higher than the river coins (an arc rising into
  the light, as in the approved picture), small (scale 0.16–0.76, growing only up to the 3-D gap to their neighbours).
  A coin solved on the river beyond ds 55 would be invisible at the checkpoint. If the relief is ever replaced by real
  geometry, re-solve with `probe05.mjs --solve=coins/targets_v2.json` (without `occl`) to put them back on the river.
* Edge band: approved has irregular light streaks (wood-grain look); the game uses 64 regular ridges.

## Remaining, step by step
1. Nothing open for coins05 at the locked frame. Optional: approved coin glints (white sparkles above coins 1–3) as an
   additive sprite, only if measured closer. Promotion to the default is the user's decision (not done).

## REQUESTS
None.

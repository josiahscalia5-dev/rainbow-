# Screen 05 coins (`coins05`): animation-and-gameplay-engineer, CHECKPOINT NOTES (work in progress)

Status at checkpoint (2026-11-17 ~00:50 UTC): layout and look are written in `src/gameplay/coins.ts` and typecheck
(`npx tsc --noEmit` clean). They have NOT been verified in a real game capture yet. Everything is behind
`on05('coins05')` (true for `?coins05=1` or `?match05=1`); with the switch off the code path is the same as before.

## Files changed / created
| file | what | gated? |
|---|---|---|
| `src/gameplay/coins.ts` | `COINS05 = on05('coins05')`. LAYOUT: table `C05M` (15 measured coins [ds from `05_crest`, lat, scale]) replaces the 05 coins after the checkpoint (pre-checkpoint trail and all other screens' coins unchanged; every coin keeps its old bob/wobble phase via `CoinDef.phase`, so 06+ coins move exactly as before). Far coins carry `far: [checkpoint scale, checkpoint distance]` and grow to `C05M_NEAR(k)` (≤ C05.scale 0.9, capped by 0.85 × gap to the neighbour) once Benny is 15 u closer. LOOK: unlit `MeshBasicMaterial` + `PROJ05_INVERSE` (display colour in, post chain restores it), face map = `assets/textures/coins05/coin05_face.png`, edge = canvas texture with the approved edge-band colours and 64 milled ridges, coin thickness 0.13 (was 0.2). The face texture is pushed to `proj05Pending`, so the game waits for it before `ready`. | yes |
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

## Remaining, step by step
1. Probe/capture: `node qa/pilot05/full_reference_match/hud/probe05.mjs --out=DIR new='<STACK>&coins05=1'` → check
   `coinScreen` vs the table, the face orientation ($ upright), coin aspect / edge thickness vs approved (face 96 × 72.5,
   edge ≈ 10 px for coin 1); adjust `C05.tilt` (05 only, under the switch) / `C05LOOK.thick` if needed; check the colours.
2. Metrics before/after (`python3 -I tools/match05/metrics.py`), keep only what is closer; `coins/before.png`, `coins/new.png`.
3. `node scripts/gameplay-test.mjs --q='<STACK>&hud05=1&coins05=1' --out=qa/pilot05/full_reference_match/coins/gameplay.json`
   (all checks pass, counter counts up), `npm run -s test:continuity`,
   `node scripts/proj05-move.mjs --q='<STACK>&hud05=1&coins05=1' --out=qa/pilot05/full_reference_match/coins/move --d=0,8,17`.
4. Default identity: `node scripts/capture.mjs 05 --out=<scratch>` = `qa/pilot05/current_default_05.png`, then
   `git checkout -q qa/capture_log.json`. Check 04 and 06 with `coins05=1` (the coin LOOK is global under the switch;
   placement elsewhere unchanged).

## REQUESTS
None so far.

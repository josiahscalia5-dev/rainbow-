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

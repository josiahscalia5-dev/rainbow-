# Screen 05 wave 5: foam-bubbles-particles (foam banks too wide)

Started 2026-11-15 ~22:10 UTC on top of the wave-4 tree (spray fan FAN.rootMin, flank banks BANK_PX,
impostor bank bubbles, 19 large + 12 small bubbles). Nothing from wave 4 is reverted.

## Plan
1. Define a reproducible bank-width / bank-height metric (script below), measure ref + baseline.
2. foam.ts `createFoam` → 05 flank bank (`updateRafts`, `BANK_PX`, `bankLump`, `KIND`, `bankProf`):
   cut the continuous frame-edge strip (reads as a white WALL x 0–90 / 740–864, y 700–1300) into a LOW
   lumpy rim of separate clumps with water gaps, narrower inner edge, fewer stacked/heaped puffs.
3. foam.ts berm puffs near the VP (heaps y 600–700): fewer/lower heaps in 05 so the purple wall shows.
4. Keep riderSplash.ts (soft fan) and bubbles.ts (≈19 large / ≈12 small, coin-path exclusion) unchanged
   unless a capture shows a regression.
5. ≤ 5 captures (it01…), tsc, one regression capture of 03/04/06/07 at the end.

## Measurement (scripts in qa/pilot05/wave5/foam/tools/, run: `python3 -I qa/pilot05/wave5/foam/tools/bankcc.py qa/pilot05/wave5/foam/tools IMG...`)
* foam mask = pixels with R>=140, G>=140, B>=200 (white / lavender / blue-lavender soap; cyan water has
  R<80, pink bands + walls G<110, gold rings B<200), 11x11 morphological opening, HUD + Benny bbox
  (x230-612, y760-1200) removed; keep 4-connected blobs >= 1200 px whose mean colour is not cyan.
* NEAR = near-camera bank width: rows y 950-1400, per row per half (L x<432 / R x>=432) the width
  innermost - outermost foam pixel; mean over rows that have foam (+ max). COVER = % of those rows with foam.
* ROWS = wall test: % of rows y 700-1400 whose outer 40 px at the frame edge are >= 50 % foam.
* AREA = big-blob foam pixels of that half below y 540, % of the full image area there.
* EXT = innermost foam x from the frame edge over rows y 700-1536 (bbox view).
* The 49 % / 44 % figures came from the user's review; the method is not in my wave-4 transcript and this
  mask does not reproduce them (baseline per-row width is 65-130 px). What clearly separates baseline
  from ref is ROWS (74/100 % vs 14/10 %) and AREA (7.9/10.8 % vs 3.5/2.7 %), i.e. a continuous strip up
  the frame edge, not row width. I steer by ROWS + AREA + COVER and keep NEAR near the ref.

| image | L NEAR mean / max | R NEAR mean / max | L/R COVER | L/R ROWS (wall) | L/R AREA |
|---|---|---|---|---|---|
| ref 05 | 83 px 9.6 % / 231 px | 85 px 9.8 % / 222 px | 58 / 36 % | 14 / 10 % | 3.5 / 2.7 % |
| baseline (wave-4 it04 tree) | 65 px 7.5 % / 101 px | 85 px 9.8 % / 130 px | 63 / 100 % | 74 / 100 % | 7.9 / 10.8 % |

## it01 (22:35 UTC) foam.ts
* `BANK_PX` [60,155] -> [170,180] = widest inner edge of a CLUMP; new `BANK_ENV` + `bankEnv()` in
  `createFoam`: world-anchored clump envelope per side (seeds fitted so the QA frame has the ref's clump
  layout; clumps cover ~40 % of 05's length); `updateRafts` row loop: inner edge = BANK_PX x env; puffs
  scaled by the interpolated envelope.
* berm puffs in 05 (`low05`): crest x0.85, heaps x0.6, no stacking (rand() sequence unchanged).
* QA: `qaRafts().clumps` now carries screen y / env / s per row (probe).
* Result: L ROWS 44 %, R 59 %, AREA 5.8 / 7.4 %, COVER 59 / 43 %, NEAR 86 / 129 px. Clumps now separate,
  water + pink bands visible between them. Left lower clump (ref y 1200-1330) missing: the coin-path
  clearance (1.45 u from the cyan core, which swings left behind Benny) pushed it off-screen. Left rim
  toward the VP still a tall flat white ridge (berm sheet crest up to ~0.9 u).

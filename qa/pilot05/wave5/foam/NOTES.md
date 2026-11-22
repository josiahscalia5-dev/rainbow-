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

Metric note (22:55): the live water (water-fx, parallel) now has lavender-white reflection streaks near
the bottom that merge with foam clumps under a 7x7 opening; an 11x11 opening separates them but
under-detects the ref's finely textured blue-shaded foam. Both are reported (FOAM_OPEN=3 -> 7x7, 5 -> 11x11).
ROWS (wall test) is stable under both.

## it02 (22:45) foam.ts
* `updateRafts`: Benny/coin-path clearances relaxed behind Benny (ds < -0.6, x0.78 / x0.65: no coins
  there); lather sheet sinks under the water where the envelope is low.
* `bermScale05` + `squashBerm` (new): 05 berm crest above the stream-edge water level x0.5 (mesh + puffs).
* Result: lower-left clump appears but merges with the upper one into a 270-px strip (ROWS L 65 %).

## it03 (22:58) foam.ts
* `BANK_ENV` refit with the true rider s (132.62, probe) and threshold 0.5: L [478.345, 0.85],
  R [15.743, 0.45]; 05 berm outer side laterally compressed (x0.55).
* Result (7x7 / 11x11): L ROWS 37 / 36 %, R 61 / 61 %; AREA L 5.4 / 4.8 %, R 8.4 / 7.2 %; clumps at
  L y 980-1060 and 1180-1300 with water between (ref 1016-1108 / 1202-1330), R bank y 760-960 (ref
  800-950). Left VP rim lower. Still wrong: flank lather sheet reads as flat white paper with straight cut
  edges; right lower clump ~200 px tall (ref ~85); all clumps glued to the frame edge.
* Draw calls in this capture 144 (were 121): not from foam (no meshes added); parallel env/water work.

## it04 (23:08) foam.ts
* `FLANK_SHEET = false`: flank lather sheet hidden (it read as flat paper with straight cut edges); the
  impostor bubbles carry the clumps: `P` 6 -> 8 per cell (2 more body puffs in `KIND`, low tier 4 -> 5).
* `CLUMP_PX = 135`: a clump wider than this floats off the frame edge; `BANK_PX` -> [180, 200].
* `bermScale05`: 05 berm crest x0.4, outer side x0.46.
* Result 11x11 (7x7): L ROWS 32 % (34), R 21 % (24); AREA L 4.8 % (5.4), R 6.3 % (7.5); NEAR L mean 88 px
  max 147, R mean 92 px max 178; COVER L 51 %, R 53 %. Clumps are bubble piles, low; purple wall visible
  above the VP rim. Right lower clump still ~190 px tall (ref ~85).

## it05 (23:15) foam.ts
* `BANK_ENV` right -> [127.503, 0.45, threshold 0.54] (small right lower clump ds -1.25..-0.7, open
  water to ds 2.75, bank ds 3..8.5); per-side threshold in `bankEnv`.
* Result (it05, 11x11 opening; 7x7 in brackets) vs baseline -> it05 (ref):
  | metric | baseline | it05 | ref |
  |---|---|---|---|
  | ROWS (frame-edge wall) L / R | 73.7 / 100 % | 32.3 / 7.7 % (33.9 / 7.7) | 14.1 / 9.7 % |
  | AREA below y540 L / R | 7.8 / 10.6 % | 4.8 / 4.1 % (5.4 / 4.8) | 2.5 / 1.3 % (3.3 / 2.5) |
  | NEAR width L mean / max | 64 / 99 px | 88 / 147 px (10.2 / 17.0 %) | 45 / 110 px (83 / 231 at 7x7) |
  | NEAR width R mean / max | 83 / 129 px | 40 / 86 px (4.7 / 10.0 %) | 53 / 98 px (85 / 222 at 7x7) |
  | COVER L / R | 63 / 100 % | 51 / 14 % | 53 / 20 % |
  Vertical foam runs in the outer 220-px strips (y >= 700, 7x7): baseline L one run 532 px, R 836 px
  (walls). it05 L (975, 93 px) + (1173, 163 px) vs ref (1016, 92) + (1188, 160); R bank (770, 176 px)
  vs ref (834, 113); R lower clump missing (ref 1223, 131 px).
  7x7 NEAR/EXT on live frames are inflated by the water's reflection streaks merging with clumps.
* Bubbles (probe QA, bubbles.ts untouched): 19 large r 23-58 px, 12 small r 4-15 px; none over Benny's
  bbox or within 10 px of the 6 visible coins. Spray fan (riderSplash.ts) untouched.
* Cost: flank sheet hidden (-1 draw call); bank impostors 1236 -> 1648 instances x 2 triangles. Whole-frame
  calls 143 / tris 634k in this capture come from parallel env/water work (were 121 / 608k at baseline).
* tsc --noEmit passes.

## Regression 03/04/06/07 (qa/pilot05/wave5/foam/regress vs screenshots/NN.png, 23:25)
* 03 unchanged apart from Benny's face texture (Benny owner). 06/07 walls changed (environment owner).
* 04 (left) and 07 (right): the stream-edge berm now shows as a broad white sheet where screenshots/
  04/07 showed pink water + loose puffs. NOT from foam.ts: outside s in [05.s0-6, 05.s1+4] (05.s0 ~116,
  05.s1 = 188.9; 04 capture s 77.4, 07 s 273) `bermScale05` = 1, `squashBerm` returns h unchanged,
  eS = e, `low05` false and the rand() sequence is identical, so the berm mesh/puffs there are the same as
  at baseline. Something that used to cover the berm's under-water part (e -0.6..0) changed: waterRibbon
  FRAG (all its wave-5 hunks are in the fragment shader) or tube.ts/environment.ts. Not isolated (capture
  budget used); request filed in REQUESTS.md.

## Left / next
1. Right lower clump (ref x 610-790, y 1217-1300): it is ~0.55 u long, shorter than the flank row
   spacing near the camera (~0.7 u), so the interpolated envelope never reaches full width. Fix: sample
   `bankEnv` per puff cell (at sC) instead of interpolating `rowEnv`, or a denser row set near ds -2..0.
2. Right bank (770-946) starts ~60 px higher than the ref's (834-947).
3. VP rim: berm puffs are white spheres; the ref rim is lavender/blue-shaded small bubbles.
4. Attribution capture for the 04/07 berm exposure (`--q=waterhide=foamBerm` and a capture with the
   1764258 water shader) by the coordinator.

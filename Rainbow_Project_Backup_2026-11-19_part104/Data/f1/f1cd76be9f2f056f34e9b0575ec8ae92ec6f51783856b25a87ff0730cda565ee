# Screen 05 wave 9: foam-bubbles-particles

Started 2026-11-16 (recovery session `01Kbt6BV`). Continues wave 8b (log `qa/pilot05/wave8/foam/NOTES.md`, through it05;
no wave-8 captures are missing from that log). Baseline `qa/pilot05/wave9/baseline/05.png` (86 calls, 567,415 tris).
Files: src/vfx/foam.ts, bubbles.ts, riderSplash.ts, spray.ts, index.ts only (Edit tool, 05-gated). Tools (copied from
wave 8 + new): `tools/{clumpcol,splashext,crops,clumptone}.py` (clumptone = luminance p10/p50/p90 + median RGB of the
dark / mid / bright thirds of the clump-box foam px).

## Read at start (crops ref vs baseline, `pre/`, 4x crops)
* Near clumps: ref = soft merged mounds of 25-45 px lumps, near-white tops, violet-lavender bodies (R > G), tiny blue
  holes only on the lower half / waterline; they form a V-shaped WAKE trailing from the splash roots back-outward along
  the pink bands (left (300,1160) -> (56,1300), right (620,1190) -> (795,1311)), ending at the corner rings, not touching
  the frame edge. Live = loose separate grey-blue spheres with gaps, round blobs fitted to the frame edges (LL x 0-240,
  LR x 600-864). clumptone: ref mid third E8D7FF / dark B3ABFA / top FDFBFF; live DCE2F7 / B4BEFC / EEEAF6 (G > R = grey-
  blue, tops not white; ref p10/p90 181/252, live 187/240 = too little contrast).
* Splash: ref = torn lacy white strands with blue holes, rooted at the fur's lower outline, steep (55-70 deg below
  horizontal), clear water between and under Benny (splashext L/R 13.6/12.8 %, inner x <= 387 / >= 485); live = two
  feathered white wings with a bright leading edge (19.8/21.4 %, reaching x 431/432).
* Soap bubbles: placement/sizes roughly match (live has none over the lower corners where the ref has two ~60 px);
  low priority.

## Plan
1. Near banks = V wake: rows behind Benny (ds < 0) get their laterals from |lat - rider| = 0.6 + 0.5(-ds) (width
   0.36-0.5 u), fading in under the splash roots (ds -0.3) and out at ds -1.6 (x >= ~60 px), instead of the frame-edge
   fit; the Lclump beside Benny (ds 0.5-2) and the right rim ahead keep the wave-8 fit.
2. Bank bubble shading (BANK_BUB_FRAG): own violet-lavender ramp (R > G), brighter white caps, softer (less rim
   darkening on the upper half), smaller / bluer holes only on the lower half; denser near packing (lumps overlap).
3. Splash05: fewer, lacier strands (cell holes), lower alpha, steeper / more backward, roots at the fur's lower outline,
   no continuous bright leading edge (froth pads lacier, fewer); spray droplets finer.
4. <= 6 captures, report + clumpcol / clumptone / splashext each; revert what is not closer; tsc; regress 03 04 06 07
   08; gameplay-test.

## Log

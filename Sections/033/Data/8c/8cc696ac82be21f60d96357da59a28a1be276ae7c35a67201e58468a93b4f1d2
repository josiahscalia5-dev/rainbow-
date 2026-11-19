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
* it01 (86 calls, 566,775 tris): foam.ts updateRafts: rows behind Benny (vK = 1 - sm(-0.45, 0.05, ds)) take V-wake
  laterals (inner 0.3 + 0.7 b, outer 0.9 + 0.47 b from Benny, outer clamped V_EDGE_PX = 64 px in from the frame edge,
  envelope ds -0.3 .. V_DS_END -1.45); BANK_BUB_FRAG own ramp bank05 (violet-lavender, white cap 1.3), softer upper rim,
  holes smaller (rad 0.14 + 0.15 h) and only low; riderSplash.ts 05 ropes steeper (thR 1.3 -> 0.45, phi 0.46 -> 0),
  torn-lace holes cut the alpha (x0.8 overall), 30 ropes / 10 froth pads (froth alpha 0.6, holed). Seen: the near
  banks now run diagonally back-outward from the splash like the ref V (left (240,1180) -> (60,1290), right (610,1130)
  -> (760,1270)), continuous; but cotton-white lumps without the blue holes / lower halves, and a bridge up to y 1120
  on both sides (band blended into the frame-fit rows at ds -0.45..0.05). Splash lighter and steeper but a brush of
  thin hairs. Numbers: mad 50.6 -> 51.1, hue_corr 0.875 -> 0.883, edge 0.195 -> 0.193, Benny+near 46.5 -> 48.1 (gain.py:
  LL +2.5, LR +5.9, Lclump +6.5 worse, splash -0.4 better). clumpcol W54/32/32/26 S28/34/32/33 (ref W25/28/28/22
  S56/38/44/41: too white, too little blue); clumptone mid F0E6F8 (ref E8D7FF), p50 231-244 (ref 221-224). splashext
  L/R 20.0/22.8 % (box now includes the V bands, like the ref's).

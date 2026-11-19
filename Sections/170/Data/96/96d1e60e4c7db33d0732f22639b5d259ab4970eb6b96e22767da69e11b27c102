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
* it02 (86 calls, 566,455 tris): t -0.09; holes dense on the lower VISIBLE part (q.y < 0.45); wake band starts left ds
  -0.15 / right -0.6 (vK 1 - sm(-0.05, 0.35)): no bridge; splash ropes 20 / side, wider (0.056 -> 0.012) lacy tendrils.
  NOTE: the river changed a lot between it01 and it02 (water-fx's concurrent waterRibbon.ts edit), so screen_report vs
  the wave-9 baseline is confounded from here on (mad 52.3, hue_corr 0.836, Benny+near 50.9 are mostly the river). A
  control capture (copy of the tree with my two files at 2a4d3b4) failed: waterRibbon.ts was mid-edit (K5* consts) at
  copy time and fonts 403 outside the vite root; not repeated. Judged on crops + clump/splash metrics instead. Seen:
  lumps now lavender bodies with white caps (closer), band layout like the ref V (left touches the splash root, runs
  to (60,1290)); right band a 1-lump string of pearls; holes barely visible (t-subtract greyed them). Splash = wider lacy
  tendrils with water between them, a bit faint. clumpcol W39/21/15/21 S38/40/33/40 B22/25/21/19 (ref W25/28/28/22
  S56/38/44/41 B35/23/26/22); clumptone LL L171/226/247 (ref 180/223/252), Lrim 179/220/251 (ref 177/214/250), Lclump
  173/230/251 (ref 181/221/251). splashext 17.3/17.9 % (ref 13.6/12.8; incl. the V bands).
* it03 (89 calls, 567,799 tris; calls/tris moved by others' concurrent edits): wake-band lumps x1.18 (wakeK); holes = a
  fixed saturated blue mix (0.8) instead of a t-subtraction, radius 0.16 + 0.17 h; splash rope alpha x0.95, froth 0.72.
  Environment walls changed under me (hue_corr 0.69 vs baseline is the environment specialist's tunnel, not foam).
  gain vs it02 (same-region |d| vs ref): LL -1.2, LR -1.1, splash -3.1, Lrim -3.7 better; Lclump +0.6, Rrim +0.7.
  Seen: splash = white lacy tendrils with blue holes rooted at the fur's lower corners, water between them (closest so
  far); bands = smooth pink-lavender marshmallow string, few holes. clumptone fixed (tools/clumptone.py now drops px
  with |R-G| >= 45 = pink-band px that biased the ref "mid third" to #E8D7FF): ref dark #ADB8FA / mid #ECE2FF-#E3E3FF /
  top #FEFCFF; it03 dark #C0AEFF (violet, wrong way), mid #F3DFFF (pink); baseline dark #B3C0FB was right, mid/top grey.
  clumpcol W38/26/18/17 S40/37/32/33; splashext 18.8/17.8 %.
* it04 (89 calls, 567,799 tris): bank05 ramp re-solved from the pink-free ref px (periwinkle dark G >= R, near-neutral
  mid, white cap); holes over the lower 2/3; cell-dome relief everywhere; crown chains 6 beads. Seen (stacked lower-frame
  view): bands now cool white-lavender cloud strings with visible blue dots, same diagonal V as the ref (closest so far);
  splash = only 4-6 short thick tendrils per side (ref: a broad fringe of many fine lacy strands wrapping the fur's
  lower half); crown beads drew dotted arcs. clumptone LL L191/231/250 (ref 179/233/253), LR 187/231/250 (ref
  184/231/253), Lrim 178/231/253 (ref 176/221/251), Lclump 183/238/253 (ref 181/219/252: still too bright); dark thirds
  #B4C1FF-#BDC8FF (ref #A5B8FA-#ADB8FA). clumpcol W49/32/30/21 S39/36/41/35. gain vs it03: Lclump -2.7, splash -0.7,
  others +-0.3. splashext 20.3/18.9 %.
* it05 (89 calls, 568,247 tris): splash 34 thinner ropes (0.042 -> 0.01), root arc 1.45 -> 0.35 rad, crown beads: ~half
  dropped at random; bubbles.ts: initial 05 bubbles in the lower third placed near the water (to get the ref's lower-
  corner bubbles). Seen: splash barely changed (still ~5 visible strands per side: the left V band's top lumps at
  (200-300, 1110-1190) cover the outer strands; the inner ones hide under the ribbon swell); no lower-corner bubble
  appeared -> bubbles.ts change REVERTED (file identical to baseline again). gain vs it04: LL -0.4, LR -0.7, Lclump -1.1,
  splash -0.7. clumpcol W48/31/31/21 S39/37/39/35; splashext 20.2/18.6 %.
* it06 (89 calls, 568,247 tris) KEPT: wake band inner edge 0.62 + 0.4 b (was 0.3 + 0.7 b), left top ds -0.3; splash
  ropes 0.05 above the local plane. Seen: the bands now run OUTSIDE the splash strands like the ref (left (60-260,
  1150-1320), right (630-770, 1190-1320)), and the splash shows a fuller fringe of lacy strands on both sides (left
  x 250-360, right 460-600, down to y ~1250; ref 200-345 / 480-640 down to ~1300). gain vs it05: LR -1.3, splash +0.9,
  Lclump +0.6, LL/rims ~0. Tight fan boxes (L 230-400 / R 460-640, y 1110-1300, whitish px incl. the ribbon's white flow
  lines): ref 15.4/14.9 %, baseline 27.4/30.9, it04 23.3/22.0, it05 23.2/21.6, it06 21.3/25.5. clumpcol W49/31/33/21
  S39/38/38/35 B23/20/23/19 (ref W25/28/28/22 S56/38/44/41 B35/23/26/22; baseline W32/12/14/17 S50/47/49/46);
  clumptone (pink-free) LL L191/231/249 (ref 179/233/253, baseline 187/228/238), LR 186/232/250 (ref 184/231/253,
  baseline 186/226/239), Lrim 178/231/253 (ref 176/221/251), Lclump 184/238/253 (ref 181/219/252: too bright, open).
  splashext (wide box incl. bands) 19.9/21.9 % (ref 13.6/12.8, baseline 19.8/21.4).

# Screen 05 wave 8b: foam-bubbles-particles

Started 2026-11-16 ~02:00 UTC (transfer session `94cf04e3`, branch `ccr-937c7fbb-htsrgt`). Wave-7 pass kept.
Baseline `qa/pilot05/wave8/baseline/05.png` (87 calls, 634,961 tris; budget <= 130 / <= 650k). Files: src/vfx/foam.ts,
bubbles.ts, riderSplash.ts, spray.ts, index.ts only (Edit tool). Tools: `qa/pilot05/wave6/foam/tools/{foamcol,rowprof}.py`.

## Plan (5 lines)
1. Foam banks = fine-bubble FOAM, not sphere heaps: 05-only near/mid bank bubbles become many SMALL bubbles (size spread,
   power-law: many 4-12 px, few 20-35 px) packed into LOW mounds, each a glossy soap bubble (thin dark-blue rim, lavender
   body, white speck); fewer big caps. Same instanced draw (pool resized), 05 s-range only.
2. Rims toward the VP: low continuous band hugging both river edges (berm 05 squash lower + small-bubble crest), wall visible.
3. Splash: rebuild the 05 fan as a natural spray: denser fine droplet streaks + translucent sheet streaks fanning out/back
   from both sides with a small frothy crown at the roots and more fine spray droplets (05-gated strength/shape uniforms).
4. Soap bubbles: keep; only adjust sizes/placement if the crops show a mismatch.
5. <= 6 captures, revert what does not look closer; tsc; regress 03 04 06 07 08; gameplay-test.

## Log
* pre (`pre/03.png`, `pre/05.png`): 05 pixel-identical to baseline (0 px > 8). Isolation (scratch, waterhide=foamRafts /
  foam): rafts = near clumps + right rim ahead of Benny (y 720-950); berm + sphere puffs = both far rims toward the VP.
* it01 (86 calls, 577,191 tris; baseline 87 / 634,961): foam.ts MICRO_GLSL (microFoam: Voronoi open bubbles with lit
  lip, cell domes, specks) + BANK_BUB_VERT/FRAG rewrite (true per-pixel sphere depth via gl_FragDepth so lumps sink into
  the water and merge with curved creases; scalloped lower outline on lumps > 16 px; holes dense on the lower half;
  glossy tiny-bubble look < 14 px); KIND table 8 -> 13 kinds (lace 3-10 px at the waterline, sunk body lumps, small
  bubbles on the lumps); 05 berm puffs (s0+2..s1-2) moved from 80-tri spheres to the impostor mesh `foam_rim05`
  (build() keeps the shared rand() sequence; hash size spread x0.5-1.45, sunk 0.4 r) + 7 extra small rim bubbles per
  step/side from rng(9091). Seen: near clumps = low sunk mounds with open bubbles, far rims finer; but flat grey-
  lavender. mad 51.2 -> 51.1. foamcol Lfar W 34.2 / S 42.1, Rfar 50.5 / 26.7, Lnear 28.8 / 23.0, Rnear 19.8 / 23.9
  (ref 22.6/48.1, 22.8/44.2, 29.9/47.7, 33.5/48.1; baseline 24.5/48.6, 39.5/35.0, 21.1/31.0, 17.5/28.1): too grey/white.
* it02 (86 calls, 565,719 tris; tris also moved by concurrent edits of others): BANK_BUB_FRAG steeper key light (t =
  0.5 + 0.55 dot(N, upper-left)); riderSplash.ts createRiderSplash05 (new 05-only instanced mesh: 64 surface whitewater
  ropes + 36 crown droplet jets + 22 root-froth pads per side) cross-faded in index.ts by w05 (smooth s0+2..s0+5,
  s1-5..s1-2; shared fan gets strength*(1-w05), i.e. unchanged outside 05); index.ts spray droplets in 05: rate x2.4,
  cap 26, size 0.012-0.04, along the 05 rope directions (same rand() calls elsewhere). Isolation (scratch,
  waterhide=splash05,spray): my ropes = two smooth white feather wings too sideways (15-25 deg below horizontal; ref
  35-70), froth collar hidden under the fur, crown droplets barely visible; the many white flow lines across the near
  water are the ribbon's (water-fx, concurrent). foamcol Lfar W 13.1 / S 50.0, Rfar 29.5 / 33.8, Lnear 10.5 / 36.3,
  Rnear 7.3 / 43.7 (shade now near ref, white tops too few); heapR max run 111 px (ref 65). mad 50.9 (others' edits too).
* it03 (86 calls, 565,719 tris): BANK_BUB_FRAG top caps brighter (0.52 + 0.62 tl); right rim (rafts, rimK) lumps x0.7
  and still sunk; splash05 ropes rooted outside the fur silhouette (1.3-1.5 uR), directions 0.62 -> 0.06 rad from back,
  lumpy beaded rope fragment; crown jets rooted 1.4 uR, higher; froth pads at 1.25-1.4 uR. Seen: the splash now fans
  DOWN-outward like the ref, but as two heavy opaque white wings (splashext L/R 31.2 / 30.8 % whitish px vs ref 13.6 /
  12.8, baseline 10.0 / 17.4); clumps at 3x = matte grey-lavender balls with craters (ref: white-lavender, blue
  crevices, glossy). foamcol (near now includes splash) Lfar W 22.6 / S 37.2, Rfar 51.8 / 35.7, Lnear 27.7 / 38.1,
  Rnear 30.3 / 31.9; heapR max run 95 px (baseline 129, ref 65). mad 51.2.
* it04 (86 calls, 567,415 tris): BANK_BUB_FRAG tone S-curve (0.12 + 0.95 smoothstep(0.2, 0.9, t)) + white-lavender
  lift of the upper mid-tones + soft gloss (pow 6), finer / denser open bubbles (px/8); splash05 ropes thinner (0.034 ->
  0.008), white only in the core with translucent cyan edges, 44 ropes / 40 jets / 16 froth pads per side, froth pads
  lacy (no fill). Seen: splash = separate lumpy strands fanning down-outward with water between them (closest so far;
  splashext L/R 20.9 / 23.2 % incl. 4-8 % water lines, ref 13.6 / 12.8); crown beads = white flakes; foam now too white
  (Lfar W 50.2 / S 29.6, Rfar 68.6 / 21.0, Lnear 52.3 / 13.0, Rnear 42.1 / 14.1). heapR max run 108. mad 50.7.
  (A capture attempt between it03 and it04 failed: path-camera's far05.ts was mid-edit; retried once tsc passed.)
* it05 (86 calls, 567,415 tris): tone curve smoothstep(0.3, 1.0), white lift only t > 0.75; crown jets = small
  translucent cyan beads. Seen: splash strands with water between them, beads no longer flakes; foam still whiter than
  the ref. New clean metric `tools/clumpcol.py` (clump / rim boxes only, no splash; W = white, S = B-R >= 30, B = B-R
  >= 60): ref Lclump W25 S56 B35, LLclump W28 S38 B23, LRclump W28 S44 B26, Lrim W22 S41 B22; baseline W35/13/18/19
  S36/30/31/45; it03 W37/16/21/18 S47/49/43/44 (closest numbers); it04 W69/37/42/33 S23/27/23/34; it05 W59/31/35/27
  S32/33/32/38. splashext L/R 20.1 / 22.4 %. mad 50.7.

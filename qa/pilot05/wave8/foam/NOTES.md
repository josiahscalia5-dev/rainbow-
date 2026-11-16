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

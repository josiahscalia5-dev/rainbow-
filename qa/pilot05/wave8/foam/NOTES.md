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

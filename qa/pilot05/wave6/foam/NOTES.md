# Screen 05 wave 6b: foam-bubbles-particles (foam banks read like the ref)

Restarted 2026-11-15 ~23:55 UTC (wave 6b) on the camera-LOCKED tree with the refitted 05 river S-curve
(course.ts, coordinator). Baseline = `qa/pilot05/wave6/regress0408/now/05.png`. Files: src/vfx/foam.ts,
bubbles.ts, riderSplash.ts, spray.ts, index.ts only. 05-only changes gated (flank rafts are 05-only by
construction; berm/puff changes gated by the 05 s-range).
The wave-6a partial (`partial_soap05_unwired.patch`, `uSt05` declared but never set) is NOT re-applied as
is: its ramp stops came from the foam-MASK percentiles, which exclude the ref's deep blue crevices
(R < 140). New ramp below, wired with a set uniform / gated constant.

## Plan (wave 6b)
1. Bank-bubble impostor shader (rafts, 05-only): soap ramp lavender-white top -> periwinkle -> blue ->
   blue-violet crevice (ref percentiles below), darker blue silhouette ring, white only on top caps;
   lower AO for the inner/lower bubbles of a pile.
2. Right heap (x 680-864, y 770-950): fewer stacked layers, lower lift, smaller bubbles -> band 40-110 px.
3. VP rims (berm mesh + berm puffs, 05-gated): same soap ramp, smaller/lower puffs so the purple wall shows.
4. Near clumps L y 980-1100 / 1200-1330, small right lower clump x 610-790 y 1217-1300.
5. Keep spray fan + 19/12 bubbles; <= 8 captures (itNN), side-by-side each time; tsc; regression 03/04/06/07/08.

## Ref foam shading (right rim crop x680-864 y820-960, foam-ish px incl. crevices, by luminance pct)
5 % (107,101,234) · 10 % (114,106,242) · 20 % (117,143,247) · 35 % (141,168,249) · 50 % (171,184,250) ·
70 % (216,212,251) · 90 % (250,243,254). Inverted through pipe.py (tone map -> sRGB -> grade):
linear (0.24,0.22,0.68) (0.28,0.36,0.78) (0.40,0.50,1.11) (0.51,0.56,0.87) (0.75,0.73,0.94) (1.03,0.99,1.05).
Half the ref foam pixels are periwinkle/blue shaded; only ~25-30 % are white.

## Measurement (tools in qa/pilot05/wave6/foam/tools/; mask = wave-5 foammask, 7x7 opening, big blobs)
* `foamcol.py IMG...`: per region (L/R far y520-1000, L/R near y1000-1400) foam px, mean RGB, WHITE%
  (min ch >= 235), SHADE% (B-R >= 30), right-heap test (x640-864 y700-1000: foam %, max vertical run).
* `rowprof.py IMG...`: per 20-px row band, foam x-extent + px/row per side.

| image | Lfar px / WHITE / SHADE | Rfar px / WHITE / SHADE | Lnear px / WHITE / SHADE | Rnear px / SHADE | heapR foam % / max run |
|---|---|---|---|---|---|
| ref | 15.5k / 22.6 % / 48.1 % | 14.0k / 22.8 % / 44.2 % | 14.1k / 29.9 / 47.7 % | 7.9k / 48.1 % | 14.0 % / 65 px |
| baseline (regress0408/now) | 21.4k / 70.7 % / 11.2 % | 34.9k / 56.3 % / 9.9 % | 21.1k / 21.8 / 22.2 % | 4.1k / 62.8 % | 35.1 % / 160 px |

Baseline rows (rowprof): right foam x 663-863 at y 800-920 (~130-180 px/row = the heap); ref right rim
x 706-863, 20-66 px/row. Left VP rim y 520-800 present in both; left near clumps present; right lower
clump (ref y 1180-1340) missing in the baseline (its foam rows there are spray/streaks).

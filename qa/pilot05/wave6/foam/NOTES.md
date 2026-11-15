# Screen 05 wave 6: foam-bubbles-particles (foam banks read like the ref)

Started 2026-11-15 ~23:10 UTC on the wave-6 tree (all wave-5 foam work kept). Files: src/vfx/foam.ts,
bubbles.ts, riderSplash.ts, spray.ts, index.ts only. Camera locked; 05-only changes gated by s range.

## Plan
1. Measure baseline (wave6/current/05.png) + ref with the wave-5 tools (ROWS/AREA/COVER + per-band colour stats of foam pixels: mean RGB, % pure white).
2. Foam shading (bank impostors + berm puffs, 05-gated): lavender-white tops, blue-violet shaded undersides, slight translucency; no flat pure-white areas.
3. Right bank: kill the tall white heap (x 680-864, y 770-950) -> low band 40-110 px tall from the VP (y 520) to y 950, x 560-864; add the small right lower clump (x 610-790, y 1217-1300) via per-cell bankEnv sampling.
4. Left bank: VP rim as low small-bubble rim (y 520-800, not a tall white ridge), keep clumps y 980-1100 / 1200-1330.
5. Keep spray fan + 19/12 bubbles; <= 8 captures (itNN), side-by-side each time, tsc, one regression capture 03/04/06/07.

## Measurement (tools in qa/pilot05/wave6/foam/tools/, reuse wave-5 mask; 7x7 opening)
* `foamcol.py IMG...`: per region (L/R far y520-1000, L/R near y1000-1400) foam px, mean RGB, WHITE% (min ch >= 235),
  SHADE% (B-R >= 30), and the right-heap test (x640-864 y700-1000: foam %, max vertical run).
* `rowprof.py IMG...`: per 20-px row band, foam x-extent + mean px/row per side. `pipe.py`: forward model of the
  display pipeline (Neutral tone map x0.86 -> sRGB -> grade sat 1.36 / con 1.15) to invert ref colours to shader values.
* `probe.mjs 05`: dumps window.__waterQA() (raft rows: ds, lat, screen y, env).
* Ref foam colour percentiles (left rim, lum 10/25/50/75/90): (155,156,240) (179,173,245) (217,195,249) (243,226,252)
  (251,246,253) -> linear (0.42,0.42,0.78) (0.53,0.50,0.83) (0.735,0.63,0.90) (0.99,0.89,1.12) (1.04,1.01,1.05).

| image | Lfar px / WHITE / SHADE | Rfar px / WHITE / SHADE | Lnear px / WHITE | Rnear px | heapR foam % / max run |
|---|---|---|---|---|---|
| ref | 15.5k / 22.6 % / 48.1 % | 14.0k / 22.8 % / 44.2 % | 14.1k / 29.9 % | 7.9k | 14.0 % / 65 px |
| baseline (wave6/current) | 24.1k / 70.9 % / 10.9 % | 32.3k / 58.5 % / 8.1 % | 21.1k / 21.8 % | 4.1k | 32.6 % / 169 px |
bankcc (11x11): ref L ROWS 14.1 % AREA 2.5 %, R ROWS 9.7 % AREA 1.3 %; baseline L 32.3 % / 4.8 %, R 7.7 % / 4.1 %.

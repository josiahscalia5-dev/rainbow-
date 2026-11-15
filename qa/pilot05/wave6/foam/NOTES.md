# Screen 05 wave 6: foam-bubbles-particles (foam banks read like the ref)

Started 2026-11-15 ~23:10 UTC on the wave-6 tree (all wave-5 foam work kept). Files: src/vfx/foam.ts,
bubbles.ts, riderSplash.ts, spray.ts, index.ts only. Camera locked; 05-only changes gated by s range.

## Plan
1. Measure baseline (wave6/current/05.png) + ref with the wave-5 tools (ROWS/AREA/COVER + per-band colour stats of foam pixels: mean RGB, % pure white).
2. Foam shading (bank impostors + berm puffs, 05-gated): lavender-white tops, blue-violet shaded undersides, slight translucency; no flat pure-white areas.
3. Right bank: kill the tall white heap (x 680-864, y 770-950) -> low band 40-110 px tall from the VP (y 520) to y 950, x 560-864; add the small right lower clump (x 610-790, y 1217-1300) via per-cell bankEnv sampling.
4. Left bank: VP rim as low small-bubble rim (y 520-800, not a tall white ridge), keep clumps y 980-1100 / 1200-1330.
5. Keep spray fan + 19/12 bubbles; <= 8 captures (itNN), side-by-side each time, tsc, one regression capture 03/04/06/07.

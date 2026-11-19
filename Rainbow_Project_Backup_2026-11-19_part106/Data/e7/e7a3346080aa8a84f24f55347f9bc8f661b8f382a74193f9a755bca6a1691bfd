# water-fx-specialist, wave 8b (Screen 05) — thick glossy cyan-and-pink S-river

Owns only `src/vfx/waterRibbon.ts`, `src/vfx/glsl.ts`, `docs/vfx/*` (Edit tool only). Camera, course, Benny, gameplay,
05→06 and 07→08 protected. Far river beyond the forced-tunnel seam = path-camera's `farRiverMaterial` (seam look agreed
via `wave8` lines in `qa/pilot05/REQUESTS.md`). Baseline/PREV = `qa/pilot05/wave8/baseline/05.png`. All changes gated to
the 05 river block (sw = 1 only on 05) so 03/04/06/07/08 do not change.

## Plan (5 lines, biggest visual change first)
1. Pink AND cyan get one anisotropic "speed-streak" texture along the flow (dense fine bright dashes 4–8 px apart in the
   mid field, long fanning streaks in the near field, octaves faded by pixel size) instead of flat pink + marble silk lines.
2. Pink bands: soft BRUSHED edges (pink/cyan streaks interleave over ≈20 % of the width, light rim instead of violet),
   strong cross-band gradient (deep magenta-violet outer edge → hot pink → pink-white streaks on the core side).
3. Near field: the straight flat pink wedges become curved, soft, streaky satin sweeps fanning from Benny's sides; near
   cyan body deeper (#0198F0-ish lows, ref p5 120) with big bright glowing flares (ref p95 246) and fanning speed streaks.
4. More/bigger 4-point glints in mid (ref 618 vs 527 by m05 peak count) and near (ref 347 vs 197); Benny contact stays
   clean glossy cyan (no white band, no pink right behind him).
5. ≤6 captures `itNN`, screen_report + scratch m05.py each time, revert what is not closer; then tsc, regression
   03 04 06 07 08, ride check through 05, gameplay test.

## Log
(updated after every capture)

### Facts before editing (scratch m05.py, peak-count glints = near-white local maxima ≥25 above their 15×15 mean)
| metric (864×1536) | ref | baseline (wave-8 start) |
|---|---|---|
| near water lum p5 / p50 / p95 / std (x170–690, y1260–1470) | 120.3 / 145.3 / 246.3 / 36.6 | 135.7 / 150.3 / 223.7 / 27.6 |
| mid water lum p5 / p50 / p95 / std (y620–1000) | 129.7 / 160.7 / 249.7 / 33.7 | 124.7 / 167.3 / 243.3 / 34.4 |
| glint peaks near y1200–1536 / mid y700–1200 | 347 / 618 | 197 / 527 |
| pink share near y1000–1536 / mid y620–1000 | 12.6 % / 25.9 % | 14.6 % / 23.0 % |
| pink behind Benny (x245–600, y1200–1360) | 1.28 % | 4.45 % |
| pink median (mid) / pink lum p10–p90 | #F23FEA / 150–201 | #F754ED / 170–213 (flatter, lighter) |
| cyan median mid / near y1300 / y1400 | #06A5F9 / #02A3F7 / #0198F0 | #16A4FF / #15B0FF / #07A3FF |
Pink band runs (x) — ref vs baseline: y700 308–388 | 241–419; y760 182–270 | 118–268; y820 41–169, 574–687 | 23–158,
583–700; y940 634–796 | 680–743; y1000 704–863 | 754–863; y1280 153–235, 589–669 | 157–252, 594–660; y1320 95–190,
631–735 | 101–208, 644–660. Positions are already close (wave 7); the LOOK differs: ref bands are motion-blurred
streaky satin with soft brushed edges, live bands are flat fills with hard edges; near wedges are flat planks.

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

### it00 — pre-edit capture of 03 + 05 (`it00/`): 05 pixel-identical to the baseline (no concurrent edits yet).

### it01 — 0 console errors, 86 calls, 572,007 tris (tri drop = other specialists)
Changes (`waterRibbon.ts`): new `speedStreaks()` (anisotropic value noise along the flow, 5 octaves, pixel-faded,
early break); new streak coordinate X (follows the band midline, fans behind Benny) computed after the band layout;
05 pink masks = soft BRUSHED edges (feather ±22 % w, streak noise interleaves pink/cyan); near sweeps pW soft-brushed;
05 colour block rewritten (lanes + dashes on cyan and pink, pink graded deep-violet outer edge → light core side,
white seam instead of violet); old swell/silk/ridge/lane code deleted; flares moved onto X; mid lens rungs removed.
Measured: report mad 51.2 → 52.7 (mid 47.2 → 49.5, near 46.7 → 50.3) = WORSE. m05: near lum p5/p50/p95 142.7/180.7/226.7
(ref 120/145/246), cyan mid #2BB2FF (ref #06A5F9), glints near 177 / mid 378 (ref 347/618), pink mid 20.2 %.
Seen: direction right (streaky satin, soft sweeps) but PASTEL and COARSE: coarse octaves drew 15 px light streaks,
near lanes fan out like sun rays, brushed edges too wide (torn candy stripes in the far-mid field).

### it02 — 0 console errors, 86 calls, 572,311 tris
Changes: dashes only from octaves with 4–14 px cells (thin), lane contrast ×0.95 (near ×0.55), cyan mix deeper, near
body darkened, brushed edge feather ±13 % w. Measured: report mad 51.0 (baseline 51.2), hue_corr 0.856 → 0.883, mid 48.4
(baseline 47.2), near 46.7 (= baseline). m05: near lum p5/p50/p95 121/133.7/215 (ref 120/145/246), mid p5/p50/p95
137.7/165/240.7 (ref 129.7/160.7/249.7), glints near 201 / mid 589 (ref 347/618), cyan mid #1DACFF, near y1300 #0797EF
(ref #02A3F7), pink mid 23.3 %, pink median #F541EB (ref #F23FEA). Seen: near body now deep glossy blue with fanning
streaks (closer), but the mid bands still read flat: thresholded noise peaks too sparse to give the ref's combed satin.

### it03 — 0 console errors, 86 calls, 565,719 tris
Changes: dashes = pixel-width ISO-LINES (n = 0.5) of each octave with cells ≤ 30 px (dense combing at every depth),
broken by the next coarser octave; near lane contrast ×0.35; near flares denser/bigger (flB 0.9/38 px, flC 0.75).
Measured: report mad 51.8 (mid 50.6, near 47.5) = worse; m05 near p5/p50/p95 127.7/147.3/210, mid p50 174.7, cyan mid
#32B8FF (pastel), glints near 197 / mid 509, pink mid 18.1 %. Seen: dense lines but they CURL like marble wood-grain
(cause: the 0.618 lattice shear skews every cell ≈37° across the flow; screen anisotropy only ≈4:1) and are pastel
(light-cyan streak colour over a large area); near field reads as a fan of light rays.

### it04 — 0 console errors, 86 calls, 565,719 tris
Changes: streak cells 25× (fine ≈45×) longer along the flow, lattice shear removed; lines saturated light cyan / pink
(white only on the strongest), near lines ×0.6; `glsl.ts` flowGlint: soft glow along the long arm (05-only function).
Measured: report mad 51.2 (= baseline), hue_corr 0.878, edge 0.182 (baseline 0.177), mid 48.6, near 47.5. m05 near
p5/p50/p95 126/142/209, glints near 155 / mid 412, pink mid 24.2 %, pink median #FF5BF7, cyan mid #3DBDFF.
cyanstat (scratch): cyan lum p50 y620–800 / y800–1000 / near = 176/166/145 (ref 157/148/141, baseline 161/143/151);
pink lum p50 195/199 (ref 173/176). Seen: pink bands now satin ribbons with long light lines following the S-curves
(closer); cyan still too light/pastel, pink too light.

### it05 — 0 console errors, 86 calls, 567,415 tris (path-camera's winding far river now in the frame)
Changes: iso-lines thinner (0.3–1.1 px) and sparser (seg 0.5–0.78); line mix 0.65 cyan / 0.6 pink, pink line colour
mix(P5, P5Light, 0.65); pink base deeper (0.42 + 0.6·H5), light satin 0.28; near lens flares 0.85/90 px/T6 + 2nd set.
Measured: report mad 50.7 / hue 0.880 / edge 0.189 (baseline 51.2 / 0.856 / 0.177) — best so far; mid 48.0 (baseline
47.2), near 46.6 (46.7). m05: near p5/p50/p95 126.7/142/203.3, mid p50 169.7, glints near 183 / mid 504, pink mid 25.7 %
(ref 25.9), pink median #F447EA (ref #F23FEA), cyan mid #25B4FF, near y1300/1400 #079EF8/#0396EE (ref #02A3F7/#0198F0).
cyanstat: cyan lum p50 169/155/144 (ref 157/148/141), pink 181/181 (ref 173/176). Seen: hot-pink satin S-ribbons
with light lines along the bends, deep glossy near body; still short of the ref's big near flares and mid glitter.

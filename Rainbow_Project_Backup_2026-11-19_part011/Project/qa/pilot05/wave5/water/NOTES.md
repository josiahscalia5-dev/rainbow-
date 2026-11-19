# water-fx-specialist, wave 5 (Screen 05)

Owns only `src/vfx/waterRibbon.ts`, `src/vfx/glsl.ts`, `docs/vfx/*`. Camera locked. `coreLateral` export kept.
Start tree = wave-4 tree incl. my last wave-4 edits (trail taper, silk dashes, flowGlint, H5 +0.2·near5).

## Plan (priority order)
1. Pink "fins" behind Benny (x 100–750, y 1200–1360) = the 05 wake `trail` term in FRAG (curved sweep,
   tc 0.5→1.5 u). Remove it; instead let the two main S-bands continue PAST Benny at the image sides
   (near rows: lat ≈ ±1.4–2 u ⇒ x 0–150 / 700–864), feathered, so the water under/behind him is cyan.
2. Near field y 1200–1536 (flat blue road): cross-flow ripple crests + troughs with real contrast, fresnel/
   reflection streaks, bump normals on near5, many small 4-point star glints (flB denser, smaller).
3. S-bands: larger lateral swing (sbend amplitude + a 2nd harmonic), keep continuous (no split / clamp
   breaks), wider glossy ribbons with silk streaks.
Max 5 captures `qa/pilot05/wave5/water/itNN`; then one regression capture 03 04 06 07.

## Log
(updated after every capture)

### Facts measured before editing (probe of the locked 05 view, scratch probe.mjs)
* Benny s 132.44, lat 0, screen (419, 1052). Near rows y 1200–1536 = s 131.9 → 129.8 (0.5–2.6 u BEHIND him);
  visible lateral at y 1300 = −1.79 … +1.99 (≈222 px/u), y 1000 ≈143 px/u, y 800 ≈91, y 700 ≈58, y 600 ≈33.
* Baseline fins = `trail` term (FRAG, 05 wake sweep tc 0.5→1.5 u): pink runs y 1200 x 208–244 / 573–611,
  y 1300 x 97–128 / 705–732 (≈30 px hard bars converging on Benny).
* Ref near pink (y 1240–1370) = broad brushed sweeps x ≈ 90–265 / 550–770 (runs at y 1300: 124–206, 613–698),
  cyan between. Ref fins box (x100–750, y1200–1360) pink = 14.1 %, baseline 9.7 %.
* Baseline near field (x150–700, y1250–1536): lumStd 17.4 (ref 40.0), p95 164 (ref 247), small white glint
  blobs y 1200–1536: 53 (ref 157), y 700–1200: 163 (ref 409).
* Band centre x (baseline): L y700 380, y800 200, y900 165, y1000 108; R 769, 713, 739, 760 (R nearly straight).
  Ref: L 350, 120, 27, off; R 780, 670, 650, 790 (≈±110 px S-swing). Phase of my `sbend` already matches
  the ref (left at s≈139.5 / y 800, right at s≈149.7 / y 680); amplitude 0.45 u is just too small.

### it01 (qa/pilot05/wave5/water/it01/05.png) — tsc ok, 0 console errors, 121 calls, 608,313 tris
Changes (all `src/vfx/waterRibbon.ts` FRAG): `sbend` 0.45 → 1.05·sin + 0.18·sin(2nd harmonic); band clamp now
thins the bank-side band (≥0.6×) instead of collapsing the core; 05 `trail` block DELETED; new near-band steering
(main bands glide to Benny ±1.45 u, half width 0.34 u, from 3 u ahead) so each band is one continuous ribbon;
brushed band edges; near field = bowed "∩" swell crests (λ 0.55 u) + troughs + flare/star field flC/flD.
Measured (baseline → it01): fins = gone (no pink runs between x 245–640 at y 1200–1300; y1200 runs 46–171 /
644–761, y1300 0–110 / 679–769, y1500 0–22 / 737–863 = bands at the image sides). Near field lumStd 17.4 → 35.6
(ref 40.0), p95 164 → 203 (ref 247), p5 105 → 92, glints near 53 → 91 (ref 157), mid 163 → 230 (ref 409).
Band centres: L y800 200 → ≈130, y900 165 → ≈110; R y800 713 → ≈660, y900 739 → ≈680 (R now swings).
Problems seen: near field blocky (vertical strN streak bands × trough bands), brushed edges look torn in the
mid field, near pink sweeps flat (no streaks), crest arcs soft.

### it02 — tsc ok, 0 errors, 121 calls, 608,313 tris
Changes: brush only where strands ≥ ≈10 px (near field); near `strN` = thin wavy speed dashes (silk) instead of
broad vnoise bands (removed the blocky look); silk lines kept on the near PINK sweeps (brushed satin); big near
flares weighted onto swell crests; crest pow 24 → 40.
Measured: pink behind Benny (x245–600, y1200–1360) 0.0 % (baseline 0.2 %, ref 1.1 %); near lumStd 34.4,
p95 198, p5 89; glints near 86 / mid 228. Mid-field band edges smooth again; S-bends unchanged from it01.
Left: crests still soft/dim, too few glints, p5 slightly darker than ref (89 vs 106).

### it03 — tsc ok, 0 errors, 121 calls, 608,313 tris
Changes: crest core ×1.7, troughs (1−c)³, flC density 0.7, flD 0.5, near H5 +0.18.
Measured: near lumStd 34.6, p95 213, p5 99, cyan median y1300 #1F9DFE (ref #02A2F7), y1400 #0B8EF0 (ref #0199F0);
glints near 113 / mid 245. Right band centre x: y700 792, y780 678, y820 ≈650, y860 ≈660, y900 ≈675, y940 733,
y980 767 → ±70 px S (baseline ±25 px; ref 780/670/650/790). Left band y740 297 → y780–980 ≈100–150.
Seen: a hard corner in the right band at ≈(620, 813) = the bank clamp min() → next: smooth min.

### it04 — tsc ok, 0 errors
Changes: `smin()` (new GLSL helper) for the bank clamp (corner now a rounded elbow); crest pow 30, ×2.1.
Measured: near lumStd 35.7, p95 218, p5 101, glints near 124 / mid 243.

### it05 (final 05) — tsc ok, 0 console errors; LOW_Q build compiles (water-lab 05 --q=low, no errors)
Changes: near sweeps `side` 1.45+0.05·back → 1.42+0.02·back (bottom-left pink stays in frame); small stars
flC density 0.8, weighted 0.4+0.9·c³ so they cluster on the swell crests.
Frame totals now 125 calls / 634,089 tris: the +4 calls / +26k tris come from other specialists' files
(environment/foam changed between it04 and it05); the ribbon is still one mesh / one draw, same vertex count.

| metric (864×1536) | baseline | it05 | ref |
|---|---|---|---|
| pink behind Benny x245–600 y1200–1360 | 0.2 % (+ fin tips) | 0.0 % | 1.1 % |
| pink runs y1200 | 208–244, 573–611 (fins) | 93–177, 652–755 (side sweeps) | — |
| pink runs y1300 | 97–128, 705–732 | 112–138, 665–751 | 124–206, 613–698 |
| pink runs y1500 | none | 0–24, 718–863 | (gold ring) |
| near field lumStd / p5 / p95 | 17.4 / 105 / 164 | 35.8 / 100 / 217 | 40.0 / 106 / 247 |
| cyan median y1300 / y1400 | #06A5FF / #0095F0 | #22A0FF / #1194F5 | #02A2F7 / #0199F0 |
| small white glints y1200–1536 / y700–1200 | 53 / 163 | 129 / 246 | 157 / 409 |
| right band centre x at y 700/780/820/860/900/940/980 | 769/~700/705/717/739/750/756 | 792/676/~650/~660/~675/734/767 | 780/(—)/670/(—)/650/—/790 |

Open (not fixed this wave): (1) the far river at y≈480–550 is stage-06 water (s>185, BAND_STYLE '06', the
04/06/07 strand path) and became visible when the VP glow shrank; it reads as diagonal candy stripes with white
cross lines instead of the 05 S-bands winding to the VP. Fix idea: while Benny is in 05, blend the 05 river
look (sw) into water beyond s 185 by distance (uniform keyed on uBenny.x, so the 06 screen is unaffected).
(2) near crests p95 217 vs ref 247; mid-field glints 246 vs 409.

### Regression 03 04 06 07 (qa/pilot05/wave5/water/regress) — 0 console errors
Code: every wave-5 change is gated to 05 (`sbend`/`brush` × sw; clamp, near steering, brush inside
`freeK < 0.5`; near field/stars inside `sw > 0.001`); the 04/06/07 strand path is byte-identical in effect.
Whole-frame diffs vs screenshots/NN.png (21:41) are large (04 30 %, 06 69 %, 07 67 % px > 40) because walls,
rings, Benny GLB, foam and post changed in other specialists' files; screenshots/ is also much softer.
Water boxes (old → new): 04 violet 2.5 → 0.2 %, cyan #0091EC → #00B0FF, pink #FF0BA3 → #FF5BFF;
06 violet 4.6 → 0.4 %, cyan #3593DB → #51ABFF; 07 violet 9.2 → 2.6 %, cyan #3A93DF → #3AADFF, pink #F645A9 →
#FF61EA. Visually: crisp glossy cyan + hot-pink bands, no water regression seen. 03 mean abs diff 6.7.
Docs: docs/vfx/water.md new section "05 river"; docs/vfx/water_05_low.png + water_stats_low.json['05'] refreshed.

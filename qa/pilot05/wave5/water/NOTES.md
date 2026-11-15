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

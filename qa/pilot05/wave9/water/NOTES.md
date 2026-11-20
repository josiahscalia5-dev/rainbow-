# water-fx-specialist, wave 9 (Screen 05) — continues wave-8 it06

Owns only `src/vfx/waterRibbon.ts`, `src/vfx/glsl.ts`, `docs/vfx/*` (Edit tool only). Camera, course, Benny, gameplay,
05→06 and 07→08 protected; far river beyond the seam = path-camera (`farRiverMaterial`). All changes gated to the 05
river block (sw = 1 only on 05). PREV = `qa/pilot05/wave9/baseline/05.png` (= wave-8 it06 water + other owners' edits).
Metrics: screen_report + scratch `m05.py` (re-created: near box x170–690 y1260–1470, lum = RGB mean as in wave 8;
NEW glint metric = blobs of near-white px ≥ 30 above their 15×15 mean, Benny box excluded) + `tones.py` (colour at
lum p5/p25/p50/p75/p95 of the cyan / pink masks) + `chain.py` (shader-linear → exposure → Neutral → sRGB → grade model,
used to solve shader colours for ref tones).

## Facts at start (ref vs baseline)
| metric | ref | baseline |
|---|---|---|
| report mad / hue / edge / mid / Benny+near | — | 50.6 / 0.875 / 0.195 / 47.6 / 46.5 |
| near lum p5 / p50 / p95 / std | 120.0 / 145.3 / 246.0 / 36.6 | 128.0 / 148.0 / 213.0 / 28.0 |
| mid water lum p5 / p50 / p95 | 125.3 / 158.3 / 208.7 | 140.0 / 169.7 / 211.0 |
| glint blobs near / mid (glint px) | 271 / 290 (9631 / 7190) | 203 / 367 (5734 / 4045) |
| cyan mid tone ladder p5→p95 | #0185E5 #019EF7 #05B3FB #1BD0FB #83C7FD | #02A7FF #13ADFF #34B9FF #5AC5FF #84D3FF |
| pink mid tone ladder | #BE20AF #E52ACD #F838E5 #F953F9 #F990FD | #BB028D #E934DD #F643EB #FF60FB #FF9AFF |
| cyan near tone ladder | #0087E2 #0094ED #01A5FA #03C0FC #61CCF9 | #0194EB #0398F0 #10A0F9 #29B4FF #6ECDFF |
| pink share near / mid; behind Benny | 14.9 / 28.2 %; 1.38 % | 15.6 / 28.2 %; 4.04 % |
Band positions per row already match (wave 7 fit; pink share in the centre x260–600 y560–770 is 21.1 % ref vs 22.9 %
live). What differs is the LOOK: ref cyan is electric (R≈0, G rises with brightness) with deep-blue lanes between
dense glowing streaks; live cyan is pastel sky blue (white mixed in) with thin marble lines. Ref pink bands are
motion-blurred satin (dense glowing light-pink streaks, deep magenta lanes); live pink is a flat fill. Ref near body =
deep glossy blue + ≈8–12 big jagged white "lightning" flares with cyan halos and no small stars; live near = sky blue,
fanning thin rays, small stars, flat white lens pills, straight hard-edged pink planks.

## Plan (biggest visual change first)
1. Mid/far: replace the 1-px iso-line dashes with SOFT glowing satin streaks (each octave's iso-line drawn with a
   σ ≈ 10 %-of-cell glow, 0.7–2.6 px, + hot core, broken into dashes by its own along-flow noise, finer octaves weigh
   more) and colour cyan/pink through TONE LADDERS solved from the ref percentiles (chain.py): lanes → deep→p50,
   streak glow → electric bright, cores → white / pink-white. Remove the pastel lavender seam, less Fresnel whitening.
2. Near: no fanning rays / few small stars; deep glossy body from broad cross-flow swells (ref near ladder); big
   jagged "lightning" flares with cyan halos (new `boltFlare` in glsl.ts, 05 only) instead of the white lens pills.
3. Near pink sweeps: curved (lateral grows ∝ back + back²), a little wider, soft brushed streaky satin, start further
   behind Benny (cleaner contact), fade toward the bottom ring.
4. ≤6 captures, report + m05 + tones each time, revert per region (mid / near) what is not closer.
5. End: tsc, regression 03 04 06 07 08 vs wave9 baseline, ride check through 05.

## Log
(updated after every capture)

NOTE: other owners edit in parallel (it01 already shows new pink wall panels → hue_corr 0.875 → 0.687, tunnel/HUD
bands moved). Whole-frame numbers are confounded; my judge = m05 "WATER mad" (|ΔRGB| over pixels the REF marks as
river water, Benny box excluded, 1/2 scale; baseline mid 45.9 / near 35.9) + tone ladders + crops.

### it01 — 0 console errors, 89 calls, 567,799 tris (lab check high+low compiled first)
Changes: `speedStreaks` → `satinStreaks` (iso-line of each octave drawn as a soft Gaussian glow σ 0.7–2.6 px + core,
own dash noise, finer octaves weigh more); cyan/pink coloured through ref-solved tone ladders (K5* consts) + glow →
electric cyan #1DD8FF / pink #F990FD + near-white cores; lavender seam removed; near: streaks ×0.15, body from broad
cross-flow swells (near ladder), `boltFlare` (glsl.ts) replaces the lens pills, small stars ×0.3; sweeps curved
(+0.09·back²), wider, start at back 0.85–1.6, fade toward the ring.
Measured: WATER mad mid 45.9 → 48.2, near 35.9 → 39.0 (WORSE); report mad 51.6 / hue 0.687 (walls) / edge 0.202,
mid 47.7, near 48.4. Near lum p5/p50/p95/std 131.7/141/196.3/20.9 (flatter); cyan mid ladder #1BBAFD…#8CE6FF (lighter
than baseline); pink p50 lum 195 (ref 175); pink behind Benny 4.04 → 0.55 % (ref 1.38). Seen: no visible streaks — the
value-noise iso-lines have wide flat plateaus near 0.5, so the "glow" became a uniform light wash; bolts are flat white
"bat" shapes with weak halos. Kept: sweep geometry (curved, soft, clean contact). Next: exact-width slot streaks.

### it02 — 0 console errors, 89 calls, 567,799 tris
Changes: streaks = 3 exact-width slot layers (`satinLayer`: K 3/7/16 per X unit ≈ 33/14/6 px apart at y800, Gaussian
glow ≤ 12 % of the spacing + 1-px core, per-slot dash noise), value-noise only for the base lanes; near ladder one
step deeper, swell gain 2.4; Fresnel 0.04; bolts thinner (T 2.6) with sharp Z-kinks and wider halos.
Measured: WATER mad mid 47.3 / near 39.6 (baseline 45.9 / 35.9); report mad 51.8 / hue 0.831 / edge 0.200, mid 47.4
(baseline 47.6), near 48.7. Near p5/p50/p95/std 122/135/194/23.1 (p5 now ≈ ref 120). Mid cyan ladder #17B0FB #23BBFD
#2FC4FF #46CAFF (still light). Diagnostic render with `bloom=0` (scratch, not an iteration): bloom lifts cyan ≈ +8 lum /
R +15; without it mid cyan p5 #08ADF9 → the base sits at mid-ladder (lane variance in the far-mid is small) and the
streak glow + 1-px white cores lift the rest. Seen: thin white "marble" lines, little satin glow; near body deeper but
the bolt halos are clipped at their cell borders (boxy light patches).

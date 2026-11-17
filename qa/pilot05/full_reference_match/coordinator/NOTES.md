# Coordinator — far river / riding water (session 018Sg3AU, 2026-11-17 ~00:00–00:20 UTC, branch `ccr-694bda6a-x58ntq`)

Continues the previous coordinator's unfinished step ("removing a flat blank patch that appears mid-river when Benny
rides forward", `tools/proj05/bake.py`, 23:41 UTC, never baked). Both new parts are water-only, Screen 05 only, behind
their own switches and ON with `?match05=1`. The STACK URL of COORDINATION.md is unchanged (specialists' A/B unaffected).

## Finding 1 — the "unseen texel" bake step does nothing (measured, not assumed)
* Fresh probe (`node scripts/proj05-probe.mjs --q='proj05=1' --raw=<scratch>`) → plain re-bake reproduces all six committed
  water textures with **0** differing texels (the probe is exact) and `bake.py … far` reproduces `far1/` exactly.
* The 23:41 "release unseen texels" block reports `E_unseen_texels: 0`: E only interpolates **coin holes** and this scene
  has none, so E contains no interpolated runs to release. The torn / blank look while riding has other causes (below).

## Finding 2 — what the rider actually sees (debug map `&projdbg05=1`: green = exact layer E, red = tile)
| mismatch while riding | approved look | game (STACK) | cause | change | measured result |
|---|---|---|---|---|---|
| milky, smeared band mid-river (10–20 u ahead) | crisp pink / cyan streaks, local contrast 17.7 (approved water, locked) | contrast drops in the E ↔ tile cross-fade: 11.5 (10 u), 13.6 (20 u) | linear mix of two unrelated pictures halves their contrast | `projvp05`: variance-preserving blend (shader `pjMixVP`, `src/vfx/waterRibbon.ts`), engaged only while riding (`pjNearK`), mean colour = midpoint of E and T2 means; E texels with alpha < 0.5 (darkened edge) excluded | band contrast **11.5 → 13.4** (10 u), **13.6 → 17.0** (20 u); band saturation 0.672 → 0.735 / 0.543 → 0.586 (approved 0.698); locked frame **0 px** changed |
| dark torn stripes across the river near the coins | continuous water | 3,063 px (10 u) / 1,205 px (20 u) of coarse old tile showing through inside the E zone | rows the locked eye never saw (wave back slopes; gaps 3–48 rows typical, 28.5 rows / unit s) are EMPTY in E | `projgap05`: `bake.py … far gapfill` mirror-fills every gap ≤ 100 rows with the approved texture reflected from both gap edges (variance-preserving middle) → `assets/textures/water05/far2/proj05_E.png`; 72,607 texels filled, **0** texels that held approved data changed colour; F + LUT byte-identical to far1 | tile-stripe px **3,063 → 62** (10 u), **1,205 → 36** (20 u). Local contrast in that zone 11.8 → 11.1 / 13.2 → 11.3 (the removed stripes were themselves high-contrast tears; the fill is lightly softened across u) |

## Locked checkpoint (864 × 1536, `tools/match05/metrics.py`)
`STACK` → `STACK&projvp05=1&projgap05=1`: 10,036 px change (soft gap edges now solid), all in the water; on those px
mean |ΔRGB| to approved **35.05 → 27.20**, within 20 levels 26.3 % → 47.8 %. Whole frame: mean |ΔRGB| 34.10 → **34.04**,
within 20 levels 51.57 % → **51.70 %**, SSIM 0.509 → 0.511. Water region within 20: 88.3 % → 88.6 %. (Whole-frame gain
is small because the locked picture already showed the approved water there; the main gain is while riding.)

## Safety
* Default build: capture = `qa/pilot05/current_default_05.png`, **0 px** differ. Protected BEFORE untouched (code path not used).
* Screen 06: 0 px differ. Screen 04: 832 px differ (0.06 %), all from its far window onto the Screen 05 river (boundary
  view; only 59 px by > 10 levels, the rest is 1–10-level bloom spill) — `joins/`.
* Gameplay test 8/8 pass (`gameplay_vp_gap.json`, 91 coins collected, plunge drop 61.41), continuity OK, tsc OK.

## Files
`src/vfx/waterRibbon.ts` (PROJGAP05, uPjVP, pjMixVP), `tools/proj05/bake.py` (gapfill mode + measured note),
`assets/textures/water05/far2/` (E + README). Evidence: `vp05/`, `gap05/` (locked, ride, ride_dbg, ride_metrics.json), `joins/`.

## Still different (water, while riding)
* Zone contrast stays below the approved 17.7 (10.9–13.4 in most bands): E is magnified when the camera comes closer
  than the locked eye, and T2 (the crisp tile) is a repeating crop. Not solved here.
* Gaps > 100 rows (10 gaps, 1,787 texels) still show the tile.

## 2026-11-17 ~02:10 UTC — `projedge05` (session 01Q46SCH): dotted black line on top of the left foam bank
* Cause (diagnosed with the new `tools/match05/pixel_probe.mjs`: raycast through pixels + hide-by-name renders): the foam
  strip `proj05_apron` (`src/vfx/proj05Apron.ts`) samples `assets/textures/water05/proj05_A.png`, whose transparent texels are
  BLACK (163,933 texels rgb 0.1) and whose 1,182 low-alpha texels are near black (rgb 3.5); opaque edge texels average 49 vs 183
  inside. Bilinear filtering + the strip's stochastic alpha dither keep some dark fragments → dotted black line (x 180–330,
  y 545–560), also in STACK.
* Fix (switch `projedge05`, on with `match05`; STACK unchanged): `tools/proj05/pad_alpha.py` → `proj05_A_pad.png` (RGB of every
  non-opaque texel = nearest opaque texel, alpha unchanged); the apron loads it under the switch.
* Measured STACK → STACK + projedge05: 962 px changed; max-channel error on them 56.5 → 39.2 (460 closer, 383 further, by eye:
  black dots → foam-coloured dots); foam banks 8.43 → 8.32; walls 53.82 → 53.80; whole frame 34.10 → 34.09. Zoom:
  `coordinator/edge05/zoom_approved_stack_projedge05.png` (approved | STACK | STACK + projedge05).
* Sent to washer-environment-modeler (resumed): the flat wall chunk at x 165–200 y 553–592 (env05 wall under the apron) and the
  far-wall chunk + far-river cyan wedge at x 325–400 y 528–590.

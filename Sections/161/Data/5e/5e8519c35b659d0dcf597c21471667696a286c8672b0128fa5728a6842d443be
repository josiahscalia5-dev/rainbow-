# Benny (benny05) — Screen 05 full reference match · benny-character-artist

STATUS: IN PROGRESS (checkpoint written 2026-11-17 on coordinator request). Switch: `benny05` (`?benny05=1` or `?match05=1`).
All source files touched are syntactically valid (`npx tsc --noEmit -p .` → rc 0 after every edit).

## 1. Measured (BEFORE = STACK capture `benny/before.png` = `stack_2340/05_match05.png`, byte-identical)
Region `benny_and_hat` (93,061 px, approved mask): mean |ΔRGB| **49.71**, ≤20 levels **23.5 %**, SSIM 0.087, signed (−0.7, −14.6, +8.5).
Whole frame: mean 34.1, ≤20 51.57 %, SSIM 0.509.

Per approved part (tool `benny/work/parts.py <capture> [<mask capture>]`):
| part | px | mean abs | ≤20 | share of region error | approved median | game median |
|---|---:|---:|---:|---:|---|---|
| body fur (incl. arms) | 44,566 | 40.9 | 25 % | 39 % | 242,79,181 (mean 225,85,181) | 255,70,177 (mean 254,68,177) |
| crown (stripes) | 18,362 | 65.2 | 24 % | 26 % | white 251,228,245 / purple 118,19,232 | white 255,211,233 / purple 104,14,255 |
| pom-pom | 12,764 | 56.8 | 15 % | 16 % | 124,20,233 (mean 130,44,213) | 141,0,255 |
| ribbed cuff | 14,689 | 47.3 | 26 % | 15 % | 112,16,235 (mean 120,34,224) | 89,0,247 |
| gold star | 2,683 | 69.8 | 10 % | 4 % | 252,217,32 | 255,191,63 (too orange) |

Centre column (x≈424) bands, approved | BEFORE game: pom 777–898 | 772–880 · top purple ring hidden | 881–891 ·
white 899–921 (23) | 892–910 (19) · purple 922–955 (34) | 911–943 (33) · white 956–980 (25) | 944–968 (25) ·
cuff 981–1030 (50) | 969–1024 (56) · fur from 1031 | 1025.

Bounding boxes (approved: colour components inside the approved mask; game: flat-ID / UV pass):
| part | APPROVED x0–x1, y0–y1 (w×h) centre | BEFORE game | iteration r2 (benny05, current) |
|---|---|---|---|
| all | 234–608, 775–1188 (375×414) c(423.4,1003.3) | 229–614, 764–1192 (386×429) c(417.7,1003.2) | 230–613, 776–1198 (384×423) c(422.4,1007.6) |
| pom | 355–499, 778–899 (145×122) c(428.1,843.0) | 333–480, 764–892 (148×129) c(406.0,829.7) | 355–501, 776–895 (147×120) c(428.3,840.1) |
| cuff | 277–573, 936–1031 (297×96) c(420.5,995.0) | 270–560, 930–1026 (291×97) c(409.3,991.5) | 278–568, 949–1031 (291×83) c(418.9,1000.5) |
| star | 481–553, 916–984 (73×69) c(518.7,952.1) | 470–545, 909–984 (76×76) c(507.9,949.5) | 480–555, 916–992 (76×77) c(517.6,957.0) |
| body | 234–608 (arms), ≈775*–1188 | 229–614, 988–1192 c(423.4,1087.0) | 230–613, 999–1198 c(421.0,1090.2) |
(*approved body bbox top is mask fringe.) Part IoU at r2 (UV pass, unoccluded): pom 0.876, crown 0.785, cuff 0.767,
star 0.709, body 0.86, all 0.915 (r1: 0.834 / 0.73 / 0.72 / 0.615 / 0.853 / 0.893).

Causes found: (a) swim clip body roll −0.049 rad at the frozen locked phase tipped the beanie left (pom 13 px left of the
body centre); (b) cuff 6 px too thick and the whole beanie 5–12 px too high; (c) crown shoulders too tapered (approved dome
fuller near the top); (d) colours: fur hot/saturated with clipped R, flat; stripes cream-pink not white; star orange;
(e) texture: game fur = straight hash strands, approved = soft overlapping tufts; game knit = small zigzag, approved =
vertical stockinette columns + deep ribbed cuff.

## 2. Changed files (all behind `on05('benny05')`; default build: no code path runs, shaders compile identically)
* `src/characters/benny/benny05.ts` (NEW): `BENNY05` flag, `FUR05` fur overrides, `HAT05` beanie geometry (drop 0.028,
  shiftX −0.028, cuffH 0.226, crownTaper 0, pomDX −0.057, starDY 0.047, tilt 0), `ROLL05` 0.3 (swim body roll damping via
  a cloned clip), `MAPS05` baked-map table (assets/textures/benny05/*.png — NOT YET BAKED, missing files are tolerated:
  console warning, GLB look kept), `STAR05` colour, QA hooks `uvPass()` (float target: uv, part id, shell layer) and
  `calib(k)` (constant albedo for the two calibration renders).
* `src/characters/benny/runtime.ts`: imports benny05; `loadBenny` awaits `loadBenny05Maps()` only when BENNY05;
  fur overrides + `applyBenny05` + `dampedClips` only when BENNY05; `window.__bennyQA.b05` exposed (null when off).
* `src/characters/benny/fur.ts`: `#ifdef BENNY05` paths (uv varying, multiply baked map instead of root/tip colours,
  `uClump` uniform) and `BENNY_UV` QA output; program cache key unchanged when the defines are absent.
* `assets/models/benny.glb`: untouched. No other files touched.

## 3. In progress
* Probe harness `benny/work/bennyprobe.mjs` (loads the game once, goto 05, runs step files in `work/probe/`, takes
  screenshots; ~20–30 s; uses a render slot). `work/r1` = first benny05 probe incl. UV pass + calibration renders
  (calA k=0.2, calB k=0.6); `work/r2` = geometry iteration 2 (current numbers above). Tools: `work/measure.py`,
  `work/parts.py`, `work/bands.py`, `work/geom.py <uv.f32>`, `work/outline.py <uv.f32> <out.png>`.

## 4. Remaining, step by step
1. Geometry iteration 3: star scale (≈0.96, 0.89) + up ≈4 px; try crown a bit taller (crownH 0.58 with pomDY −0.05) and
   hat tilt ≈ −0.05 for the cuff corner rows; keep only what raises part IoU (geom.py).
2. Bake (`work/bake.py`, to write): from UV pass + calA/calB + approved: per pixel L=inverse post chain (port of
   PROJ05_INVERSE: vignette 0.18, contrast 1.15, saturation 1.36, sRGB, Neutral, exposure 0.86; bloom is off on 05 with
   proj05), E=(L_B−L_A)/0.4, S=L_A−0.2E, albedo=(L_approved−S)/E, strict part correspondence (approved part mask = game
   part id), splat into each part's UV texture (body 1024×512, crown 1024×256, brim 1024×128, pom 512×256, arms 256×128),
   fill unseen texels from seen knit / fur, normal maps for crown / brim from approved luminance detail → write
   `assets/textures/benny05/*.png` (new files), set MAPS05 scales + STAR05 colour.
3. Re-run probe (UV pass + calib again with final normal maps), re-bake once.
4. Real captures: `node scripts/capture.mjs 05 --q='<STACK>&benny05=1' --out=benny/cap/new` → `benny/new.png`;
   metrics `python3 -I tools/match05/metrics.py`; default capture must equal `qa/pilot05/current_default_05.png`
   (then `git checkout -q qa/capture_log.json`).
5. 04 and 06 with benny05 on (identity check), steering frames (`scripts/proj05-move.mjs … --d=0,8,17 --steer=-1,1`),
   gameplay test → `benny/gameplay.json`; finish this file (per-mismatch table, before → after).

## 5. REQUESTS
* none yet.

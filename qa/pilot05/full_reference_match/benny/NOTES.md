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
* `src/characters/benny/benny05.ts` (NEW): `BENNY05` flag, `FUR05` fur overrides (not tuned yet), `CLUMP05`, `HAT05`
  beanie geometry, CURRENT values after iterations r1–r7: drop 0.028, shiftX −0.028, tilt 0, crownTaper 0, cuffH 0.226,
  crownH 0.58, brimW 1.0 (plus a fuller rolled cuff top edge in the profile), pomDX −0.057, pomDY −0.016, pomDZ −0.16,
  pomScale 0.97, starDY 0.069, starDX 0, starScale (0.96, 0.89). `ROLL05` 0.3 (swim body roll damping via a cloned clip),
  `MAPS05` baked-map table (assets/textures/benny05/*.png — NOT YET BAKED, missing files are tolerated: console warning,
  GLB colours kept), `STAR05` colour (placeholder, not solved yet), QA hooks `uvPass()` (float target: uv, part id,
  shell layer) and `calib(k)` (constant albedo for the two calibration renders).
* Geometry iterations (UV-pass part IoU vs approved: pom / crown / cuff / star / body / all):
  r1 (drop+cuffH+roll) 0.834/0.73/0.72/0.615/0.853/0.893 · r2 (+shiftX, taper 0, pomDX) 0.876/0.785/0.767/0.709/0.86/0.915 ·
  r3 (+tilt −0.05, crownH 0.58) cuff 0.62 → tilt REJECTED · r4 (tilt 0, crownH 0.58, star scale, starDY 0.069)
  0.823/0.784/0.776/0.801/0.86/0.919 · r5 (pom lower + back) 0.861/0.81/… · r6 (pomDY −0.016, pomDZ −0.16, pomScale 0.97)
  **0.883/0.817/0.776/0.801/0.86/0.921 (= current geometry)** · r7 (brimW 1.02) no gain on cuff, body −0.003 → brimW
  back to 1.0 (the fuller cuff top edge of r7 is kept; its effect alone is not measured separately).
  r6 boxes: pom 355–500 × 775–907 c(426.1,840.5) vs approved 355–499 × 778–899 c(428.1,843.0); cuff 278–568 × 948–1031
  vs 277–573 × 936–1031; star 481–553 × 916–983 (73×68) vs 481–553 × 916–984 (73×69); centre column game pom 781–896,
  crown 897–983, cuff 984–1031, fur from 1032 (approved 785–899 / 900–980 / 981–1030 / 1031).
* `src/characters/benny/runtime.ts`: imports benny05; `loadBenny` awaits `loadBenny05Maps()` only when BENNY05;
  fur overrides + `applyBenny05` + `dampedClips` only when BENNY05; `window.__bennyQA.b05` exposed (null when off).
* `src/characters/benny/fur.ts`: `#ifdef BENNY05` paths (uv varying, multiply baked map instead of root/tip colours,
  `uClump` uniform) and `BENNY_UV` QA output; program cache key unchanged when the defines are absent.
* `assets/models/benny.glb`: untouched. No other files touched.

## 3. In progress (stopped for the account transfer, nothing half-written)
* Probe harness `benny/work/bennyprobe.mjs` (loads the game once, goto 05, runs step files in `work/probe/`, takes
  screenshots; ~20–30 s; uses a render slot; re-renders ONLY via `Q.composer.render()`. Never call goto twice in one
  session, because the mixer phase and lift ease advance). Step files: `shot0.shot.js`, `info.js`, `uv.js` (saves `uv.f32` =
  Float32 RGBA of rect x200 y740 w440 h480), `calA.shot.js` (k=0.2), `calB.shot.js` (k=0.6), `restore.shot.js`.
  Runs: `work/r1` (first probe incl. calA/calB, OLD geometry, do not bake from it), `work/r2`…`work/r7` geometry
  iterations (shot0 + uv.f32 + outline.png).
* `work/bake.py` is WRITTEN (python syntax checked) but NOT RUN yet: inverse post chain, E/S calibration, strict part
  correspondence + approved colour filters, bilinear splat, push-pull fill, mirror tiling of the central strip for unseen
  texels, `--normals` writes crown_n / brim_n from approved luminance high-pass, `bake_report.json` (scales, star albedo).
  The bake session `work/b1` was started and then STOPPED while it was still waiting for a render slot (no output, b1 is empty).
* Tools: `work/measure.py`, `work/parts.py` (approved part masks + per-part error), `work/bands.py`, `work/geom.py <uv.f32>`,
  `work/outline.py <uv.f32> <out.png>`.

## 3b. RESUMED RUN #3 (session 01Q46SCH, 2026-11-17 ~01:20 UTC) — progress log
* b1 (01:00 run) = CURRENT geometry (geom.py on b1/uv.f32: pom 355–500 × 775–907, IoU pom/crown/cuff/star/body/all
  0.883/0.817/0.781/0.802/0.86/0.921). b2 = shot0 + calD (k 0.05) + calE (k 0.1): shot0 byte-identical to b1/shot0
  (probe is deterministic → b1 + b2 = one calibration set).
* FOUND: the old 2-point fit (k 0.2 / 0.6) was wrong: at k 0.6 (and partly 0.4) crown / cuff / star clip at display 255,
  so E was underestimated and S overestimated (crown S 0.38 → really 0.05; crown E really 2.75). Held-out prediction
  of the k 0.4 render: 6–16 % error → **0.35–0.66 %** with the new per-pixel least-squares fit over all unclipped renders
  (`bake.py fit_es`, display 3..246 in every channel). Bloom is faded out on 05, so radiance is linear in albedo.
* FOUND: the approved stripes curve much more than the dome's rings at this camera (purple band top 906 / 923 / 915 px at
  x 360 / 440 / 480; game ring v=0.5 at 930 / 931 / 927) and rise to the image-left (illustration bulge + tilt). No rigid
  hat move gives that. Bake keeps the approved stripe course where the camera sees it and `rings` fill: stripes rectified
  by the measured per-column shift h(u) (normalised cross-correlation, robust quadratic), mirror-tiled straight, h re-applied,
  then continued as level rings round the unseen arc (no 4× zig-zag when the beanie turns). Mirror tiling for body / pom / cuff.
* Bake clean-ups: pixels lit < 45 % of the part median (behind translucent water) skipped; texels outside the part's colour
  family (approved foam over the fur, star outline on the crown) treated as unseen (body 5,069, pom 1,057, crown 695 texels);
  crown / cuff normal maps from RELATIVE luminance (stripe colour steps no longer become ridges).
* Maps installed (NEW files): `assets/textures/benny05/{body,crown,crown_n,brim,brim_n,pom,armL,armR}.png` (1.3 MB) from
  `work/b2/tex` (bake_report.json there). `STAR05` = solved (0.317, 0.39, 0.048) linear. All scales 1.0 (p99.7 ≤ 1).
* b3 (maps from b2 installed, probe frame): Benny + hat 49.71 → 25.01 mean, 23.5 → 62.5 % ≤20. Seen there: the approved cuff
  is ROLLED vs ours (bottom edge rises 2.65° to the image-left, top 3–6 px higher) → crown showed where approved has cuff.
* Geometry r8 / r9 / r9c (new HAT05 fields): `roll` 0.046 (hat about its own forward axis, his left up), cuffH 0.226 → 0.25,
  crownH 0.58 → 0.556 (crown top + pom stay), shiftX −0.028 → −0.013, pomDX −0.057 → −0.034, starDY 0.069 / starDX 0.012,
  star counter-rotated by +roll (its local +Z faces the camera; −roll measured star IoU 0.728 = wrong sign).
  Part IoU b3 → r9c: pom 0.883 → 0.888, crown 0.817 → 0.861, cuff 0.781 → 0.867, star 0.802 → 0.803, body 0.860 → 0.863,
  all 0.921 → 0.923; cuff edge slope residual 2.65° → 0.36°. Star box 481–553 × 916–983 vs approved 481–553 × 916–984.
* Normal maps change per-pixel E by ±15 % (crown) / ±36 % (cuff) → bake r9 with `--normals`, install, re-calibrate (r9c, final
  normals) and bake r9c WITHOUT `--normals` → installed. STAR05 = (0.319, 0.39, 0.048).
* REAL capture `cap/new/05.png` (STACK + benny05): Benny + hat 49.71 → 22.80, ≤20 23.5 → 66.7 %, SSIM 0.087 → 0.574;
  whole frame 34.10 → 32.04, 51.57 → 54.73 %. Approved-detail correlation (high-pass, interior) ≈0 → 0.49–0.72.
* `work/refine.py` (iterative back-projection: rendered vs needed albedo per pixel of a REAL capture, splatted into the
  bake's seen texels only, λ 0.8): step 1 (`work/f1`, capture `cap/new_f1`) 22.80 → 21.28 / 69.7 %; step 2 (`work/f2`,
  capture `cap/new_f2`) → **20.37 / 71.2 % / SSIM 0.631**, whole frame **31.87 / 55.04 %**. INSTALLED = f2 albedo + r9 normals.
  Pre-refine maps: `work/f1/in/`. Stopped at 2 steps (diminishing, avoid over-fitting the locked frame).
* Next: star map (planar UVs on a benny05 copy of the star geometry, bake from approved incl. orange rim), then fur / pom
  look check, steering frames, 04/06, default identity, gameplay.

## 4. Remaining, step by step
1. (Geometry is done for now at r6 values, see section 2.) Run the bake session from the CURRENT geometry:
   `node qa/pilot05/full_reference_match/benny/work/bennyprobe.mjs --q='<STACK>&benny05=1' --out=qa/pilot05/full_reference_match/benny/work/b1 work/probe/uv.js work/probe/calA.shot.js work/probe/calB.shot.js work/probe/restore.shot.js`
   (step paths with the full `qa/pilot05/full_reference_match/benny/` prefix), then
   `python3 qa/pilot05/full_reference_match/benny/work/bake.py qa/pilot05/full_reference_match/benny/work/b1 qa/pilot05/full_reference_match/benny/work/b1/tex --normals`.
   Inspect the textures (`*_seen.png`, the tiling seams, white/purple stripe fidelity) and `bake_report.json`.
2. Copy the maps to NEW files `assets/textures/benny05/{body,crown,crown_n,brim,brim_n,pom,armL,armR}.png`; put each
   `scale` from bake_report into `MAPS05`, and `star_albedo_linear` into `STAR05` (clamp to ≤1, or lower the star emissive
   and re-calibrate). Optional: give the feet a map with the body's mean albedo (identity on front views).
3. Re-run the bake session (the calibration now sees the final normal maps) and re-bake once, then copy again.
4. Fur look: tune `FUR05` / `CLUMP05` (finer, denser, softer silhouette) with one or two probe shots. Check low tier too.
5. Real captures: `node scripts/capture.mjs 05 --q='<STACK>&benny05=1' --out=qa/pilot05/full_reference_match/benny/cap/new`
   → copy to `benny/new.png`; `python3 -I tools/match05/metrics.py benny/new.png benny/cap/new/`; `work/parts.py` per part;
   default capture (`node scripts/capture.mjs 05 --out=<scratch>`) must equal `qa/pilot05/current_default_05.png`
   (0 px), then `git checkout -q qa/capture_log.json`. Keep only changes that lower the region error / raise whole frame.
6. 04 and 06 with benny05 on (identity check), steering frames (`scripts/proj05-move.mjs … --d=0,8,17 --steer=-1,1`),
   gameplay test → `benny/gameplay.json`; finish this file (per-mismatch table, before → after).

## 5. REQUESTS
* none yet.

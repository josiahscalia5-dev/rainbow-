# Screen 05 — wave 12 (W12): smooth silky water, bubbly foam banks, highlight glow, flow toward the camera

Session `013VHsJBUBZaHLYkVpBPkFed`, branch `ccr-451ea8c7-3nqlis`, 2026-11-16 ~13:45–15:00 UTC. Coordinator work in the
main session (no specialist launched). Built on W11 (`qa/pilot05/wave11/NOTES.md`). Default build = **T2**, unchanged.

## Why
* User, 13:32 (end of the previous account): the W11 flow-map water (`?river05=1`) was **too grainy**; wanted long,
  smooth, flow-aligned ripples, rich cyan, magenta ribbons, selective white highlights.
* User, ~14:40 (this session): "The water texture looks dull and flat compared to the source image" — check texture
  colour space, unlit material, tone mapping (or lower exposure), **UnrealBloom with a high threshold so only the
  bright highlights glow ("number 4 is the big one")**, and scroll the texture so the water flows toward the camera.

## The switches (each one factor; all off = the default T2 build, pixel-identical)
| switch | factor | where |
|---|---|---|
| `?silk05=1` | WATER MATERIAL (turns river05 on): one broad ripple octave on a longer tile (3.3 u × 90 u instead of 2.4 × 62), brushed noise only tints, crisp cores / ripple crests / 2nd flare set / 2nd bolt set mostly removed; **long streaks along the current** = lines of constant streamline coordinate X, one per lane, ≈2 px white core + soft same-hue glow, lit in long lens-shaped segments (never across the current); highlights, glints and panorama reflections keep the water's hue; red-free aqua / blue tones (the W10 aqua `#20E8FA` and blue `#3FA3F9` carried red → pastel) | `src/vfx/waterRibbon.ts` (`#ifdef SILK05`, `silk05Streak`), far river `src/world/materials.ts` |
| `?puff05=1` | FOAM BANKS (turns river05 on): where the W11 shelf puffs get too small, 2.4× larger mounds take over, and the shelves get bubble cells (white centres, lavender-blue rims) instead of a smooth snow-drift sheet / flat lavender wedge | same files (`#ifdef PUFF05`) |
| `?glow05=1` | HIGHLIGHT GLOW: the existing UnrealBloomPass (was strength 0.2, radius 0.35, threshold 0.94) → **1.0 / 0.4 / 2.6 on Screen 05 only** (blended in over the last 6 u of 04 and out over the first 6 u of 06). Tuning without a rebuild: `&bloomS= &bloomR= &bloomT=` | `src/game/Game.ts` |
| `?flowcam05=1` | FLOW DIRECTION: texture advection 0.5 × ride speed instead of 1.3 × — relative to the riding camera the streaks now stream TOWARD the camera at half the ride speed (before: drifted slowly away toward the light) | `FLOW05` in `waterRibbon.ts`, far river speed in `src/world/environment.ts` |
| `?tone05=none` / `?tone05=0.75` | TONE MAPPING test: NoToneMapping / Neutral at another exposure (global by nature: the OutputPass tone-maps the whole frame) | `src/game/Game.ts` |
**NEW (recommended candidate) = `?silk05=1&puff05=1&glow05=1&flowcam05=1`.**
Android has no URL: `VITE_RAINBOW_Q05='silk05=1&puff05=1&glow05=1&flowcam05=1' npm run android:debug` bakes the same
switches into a separate experiment APK (unset = default build).

## The user's five suggestions — what applied (checked in the code, 2026-11-16)
1. Texture `colorSpace = SRGBColorSpace`: the river has NO colour texture (procedural shader, linear colour constants);
   its flow map and ripple normal map are data and must stay `NoColorSpace` (sRGB would bend the normals); the Marble
   panorama is already `SRGBColorSpace`. Nothing to change.
2. `MeshBasicMaterial`: the ribbon is a `ShaderMaterial` without `lights: true` (scene lights never darken it); the far
   river is already a `MeshBasicMaterial`. Already the case.
3. Tone mapping: the game uses `NeutralToneMapping` (not ACES) at exposure 0.86, applied to the whole frame by the
   OutputPass, then the grade pass (saturation 1.36, contrast 1.15). Tested `?tone05=none` on top of W12: cyan S mid
   0.92 → 0.79, thin-white 5.0 → 8.8 % (more clipped hair lines) → **not kept** (`glow/C_*.png`, `D_*.png`).
4. Bloom: tested 8 settings (`glow/`, `glow/WATER_INDICATORS_glow_tone.md`). Threshold 1.0–1.3 washes the whole river
   toward white (cyan S mid 0.43–0.56), because the scene's linear HDR body colours pass it. Threshold 2.6 keeps only
   streak cores, flares and lamps: cyan S mid 0.92 → **0.97**, near 0.96 → **0.99** (approved 0.99 / 0.99) — the glow is
   saturated, so the water gets MORE vivid, not milky. Stronger (S 1.6, T 2.4) makes the far river milky (mid S 0.74)
   → chosen preset S 1.0 / R 0.4 / T 2.6. Screen-05-only so 04 / 06 / 07 keep their look.
5. Flow toward the camera: the water already animated (flow-map advection at 1.3 × ride speed = away from the camera);
   `?flowcam05=1` reverses the relative motion. A still picture cannot show the direction; a motion clip needs a
   render-on-demand QA hook that does not exist yet (`__rainbow.step` simulates without rendering).

## Measurements (`tools/qa/water05_grain.py` → `WATER_INDICATORS.md`; `tools/qa/diff05.py` → `DIFF05_bands.md`)
Water pixels only, 864 × 1536. Indicators, NOT a fidelity percentage.
| version | cyan S mid / near | grain ratio mid / near | thin white % far / mid | mid cyan area % (diff05) |
|---|---|---|---|---|
| APPROVED | 0.99 / 0.99 | 0.43 / 0.36 | 6.8 / 4.8 | 23.3 |
| T2 (current default) | 0.87 / 0.92 | 0.44 / 0.44 | 12.1 / 3.6 | 38.7 |
| W11 `?river05=1` | 0.75 / 0.79 | 0.42 / 0.46 | 14.7 / 5.7 | 28.3 |
| silk05 + puff05 | 0.92 / 0.96 | 0.42 / 0.43 | 14.8 / 5.0 | 29.9 |
| silk05 + puff05 + glow05 | 0.97 / 0.99 | 0.45 / 0.44 | 14.1 / 5.0 | — |
| **NEW = + flowcam05** | **0.98 / 1.00** | 0.39 / 0.45 | 13.6 / 5.7 | — |
(flowcam05 changes the texture phase in a still, so its numbers move a little; the direction is the change.)
The diff05 "S-swing" indicator drops for the silk variants (mid 316 → 275, near 412 → 178) although silk05 changes no
geometry (same `channel05`, course and far block as river05): the indicator finds the river centre from colour classes,
so the new cyan / streak colours move it. It is a measurement artefact, not a path change.

## Tests (folder `tests/`)
* `pixel_checks_final.json`: default T2 == `qa/pilot05/current_default_05.png` (0 px); BEFORE `?ringa=26&nearfloor05=0`
  == `qa/pilot05/wave9/baseline/05.png` (0 px — one capture differed in 155 HUD-bar pixels only, rows 21–104, kept as
  `before_after/05_flaky_HUD_frame.png`, two re-captures identical); `pixel_checks_05.json`: river05 == the W11 picture;
  with the NEW switches screen 07 identical, 06 differs in 27 px (max 6 levels, invisible), 04 changes where the 05
  river shows through the 04 exit (as with W11).
* `gameplay_w12full.json`: pass 8 / 8 (pause, continuous travel, no camera cut, no teleport, plunge 61.41, real coin
  pickups, victory, hearts lost on wall bump), errors []. `gameplay_w12.json` (silk + puff): pass, same numbers.
  `continuity_stdout.txt`: ok, all joins gap 0, 07→08 drop 61.19.
* `perf_high_864x1536.json` / `perf_low_864x1536.json` (headless SwiftShader, RELATIVE only — not device fps):
  NEW +2.9 % frame time high quality, +5.2 % low; same 86 draw calls, 567,415 / 425,525 triangles, +2 small textures.
* Android: `android/` — see `android/NOTES.md` in this folder.

## Pictures
`compare/1_APPROVED_05.png`, `compare/2_CURRENT_T2_05.png`, `compare/3_NEW_W12_water_05.png` (separate, full size,
864 × 1536). Factors: `factors/silk05`, `puff05`, `silk05_puff05`, `silk05_puff05_glow05`, `glow05_only`, `W12_full`.

## Left undone (next single-factor tests, in the user's priority order)
* Magenta ribbons: the approved ribbons are more vivid hot pink with glossy white-pink streaks and run beside Benny;
  ours are lighter / flatter there.
* Near field: the approved has bigger haloed white flares below Benny; splash: more droplet beads and a white froth
  collar (owner foam-bubbles-particles).
* Far river under the golden light stays pastel (cyan S 0.73 vs 0.92) — fog / glow lighting, its own test.
* Some flat foam remains at the right of the seam.
* Walls (W2 `?wall05=1`) and ring gold (G1b `?gold05=1`) still wait for the user's yes/no.

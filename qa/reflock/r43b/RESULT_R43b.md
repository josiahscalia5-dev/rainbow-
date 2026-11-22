# Round 43b (2026-11-22) — Screen 06: Benny physically in the water, plain-gray geometry test, textured acceptance run

User's orders (this round): finish Screen 06 first; build + test the tunnel, crest, rings and scenery as complete 3D geometry; test it in plain
gray to reveal missing surfaces / intersections / camera problems; restore the approved textures and compare; Benny must physically ride the
curved water (posture follows slope + bank, lower body partly immersed, whole fluffy body visible, splash / swim effects follow him) — "do not fix
his appearance merely by moving a picture or floating his model above the water"; preserve water, controls, Bubble Dash. No new tools unless they
solve a specific problem; no SAM / depth re-runs.

## 1. Benny rides the real water (fixed)
* Round 43 had matched his painted silhouette with a 0.12 u lift: measured **−4 % immersion = floating above the water**. Removed.
* Now solved WITH physics: 12 % of his body under the actual water surface, size 1.19, and he swims 0.15 u ahead of the painted contact point
  (that point is his FRONT waterline, not his centre); the camera stays exactly the fitted picture camera. Visible silhouette (77,430)–(340,715)
  vs the painted SAM 2 silhouette (67,432)–(331,711) phone px.
* Per frame over the whole level (both runs): Benny's water point on the real water mesh (largest gap **0.001 u**, never without water under
  him), his up axis vs the surface normal ≤ 14.5° (incl. his lean into lane changes; route frame vs mesh ≤ 9°), immersion 11–18 % (median
  12.5 %) except during the leap (21 frames after the "up" swipe = out of the water, by design). Splash / wake / ripples are placed from his
  real water point and the real surface frame every step.

## 2. Plain-gray geometry test (`?gray=1&sentinel=1`: every surface gray + 0.5 u world grid, back faces orange, holes pure green)
Found and fixed: the pool faced DOWN; the pool and the channel were coplanar where the crest lands (z-fighting blotches) → pool faces up, 2 cm
under the channel (the channel rests IN the pool); the copper trays stood 2 cm off the drum wall (floating) → their straight edge is now 3 cm
INTO the wall. Then the whole level, real CDP touch (`GAMEPLAY_screen06_GRAY_geometry_real_touch.mp4`, `..._GRAY_contact_sheet.jpg`):
| check (585 frames) | result |
|---|---|
| hole pixels (green background) | **0** in all frames |
| Benny's whole body in the frame | 585 / 585 |
| real finger swipes detected | 14 / 14 (incl. a leap) |
| camera clearance from any scenery surface | ≥ 0.514 u (never inside / grazing a wall) |
| camera step / turn per frame | ≤ 0.094 u (forward travel 0.117) / ≤ 1.69° |
| scenery meshes that moved | 0 of 127 |
| channel bank followed | 0° → 71.6° on the crest → 0° |
Same-camera picture: `SCREEN06_4_GRAY_geometry_same_camera.jpg`.

## 3. Approved textures restored — same run, same swipes (`GAMEPLAY_screen06_TEXTURED_real_touch.mp4`, `..._TEXTURED_contact_sheet.jpg`)
Identical physical results (0 hole pixels in 585 frames, 585/585 on screen, 14/14 swipes, camera ≤ 1.69°/frame, water gap ≤ 0.001 u).
At the picture's camera position (compare_to_approved.py, unchanged 20-level threshold, scenery = picture minus HUD / Benny / swirl / coins / bubbles):
| | scenery px within 20 levels | SSIM | colour look |
|---|---|---|---|
| PREVIOUS game Screen 06 (`SCREEN06_2_PREVIOUS_old_game.jpg`) | 3.6 % | 0.16 | 0.10 |
| round 43 (Benny floating 4 % above the water) | 89.5 % | 0.865 | 0.997 |
| **NOW (Benny physically in the water)** (`SCREEN06_3_NEW_textured.jpg`) | **88.5 %** | 0.856 | 0.996 |
Tested and NOT kept (one factor at a time): 3D foam heaps placed by rays through the painted foam pixels (85.7 %: −2.8 points at the picture view
for a small gain in motion; available as `foam_from_picture`), coins at their exact painted 3D spots (88.5 %, no gain and not collectable on the
71° bank), texture LOD bias −0.4 / −1.2 (88.1 / 88.7 %; −0.8 kept for calm motion).
**In motion:** walls now in the measured painted magenta-pink (median 186/59/176) instead of lilac — moving-frame colour look 0.31–0.38
(round 43: 0.27–0.36); sharpness 0.91–1.11 of the painting except on the crest (0.54). Still below the start view: the close-up water is the
animated shader (cyan / pink bands, not the painted swirls), foam is far less than painted (1–5 % vs 9 %), and gold appears more later (rings).

## 4. Three.js DevTools MCP
Installed (plugin `parallax-threejs`) but its bridge only connects through its own dev-server proxy (port 9222 → 3000) in a browser tab; the
in-page QA hooks (`kitFrameQA`, `routeCheck`, ray probes, gray mode) answered every geometry / camera question this round, so it was not needed.

## 5. Not done
* 06 is not yet "the approved look while swimming" (colour look in motion ~0.3 vs 0.996 at the start) — next: the close-up water from the
  painted water, foam banks along the painted foam edges that do not cost the start view, the crest's 71° bank + camera roll for the user to judge.
* The app copy `public/screen06` is updated to this version; the APK in `qa/reflock/r43/` is still the round-43 build (rebuild at acceptance).

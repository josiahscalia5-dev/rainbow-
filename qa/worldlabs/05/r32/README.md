# Screen 05 — real 3D test with Marble (round 32, 2026-11-21, branch `claude/screen-05-3d-geometry-9yu7pu`)

**User (verbatim excerpts):** "I want to use my existing 5,420 World Labs Marble credits. I am NOT agreeing to pay $5 cash or purchase additional
credits … Do not purchase anything, charge my card, or start a paid Atlas job." → then "U can use 1580 for full quality from my credits".

## Credits (existing Marble API credits only — ledger `qa/worldlabs/05/pilot/LEDGER.md`)
* Atlas is a separate World Labs product with its own account and credits: NOT usable with these credits, nothing started or bought there.
* Draft world `marble-1.0-draft` (230) → world `f3226155-5633-4e41-bbd5-f58a3f584c26`.
* Full world `marble-1.1` (1,580, user-approved) → world `8bb4cf11-9615-4879-8f2f-8a1cb6002ff7`.
* Balance 5,420 → **3,610**. Every job far below the balance, so no overage / card charge was possible.

## What was done
* Input: the approved Screen 05 as a clean full frame (`input_05_clean.png` = the `?paint=1` plate: painted Benny, coins and HUD removed).
  (The November test used a cropped strip that still had Benny / coins / HUD in it; that is why its lower half was invented.)
* The picture's camera was found inside the world by matching features (`tools/marble05/align.py`): from that camera the 3D world lines up with
  the approved picture (`proof/ALIGN_approved_vs_world_from_picture_camera.jpg`).
* The painted S-path (the coin trail of the approved picture) was projected onto the world's measured water surface (fitted plane, 7–9° from the
  picture's up) → Benny's 3D path. Benny = the improved 3D Benny (`benny31.glb`, its bake, the game's paddling / pom-pom shader, the game's colour
  chain). Follow camera = at the start EXACTLY the picture's camera, then it keeps that relation to Benny along the path (steering followed by half).
* Test viewer (standalone, three.js 0.180 + Spark 2.4.0 splat renderer; the game itself is NOT changed): `tools/marble05/viewer/`
  (`npm i three@0.180.0 @sparkjsdev/spark@2.4.0` in that folder, link the SPZ / GLB / textures as in `play_shots.cjs`, serve, open `play.html`).

## Results (`proof/`)
* `MARBLE05_gameplay_followcam.mp4` — 2.4 s, 30 fps, normal speed, uninterrupted: Benny paddles and steers along the S-path, the bottom gold
  frame passes behind him, the gold rings and purple machinery surround him, coins 1,420 → 1,520.
* `PROOF_APPROVED_vs_3D_GAMEPLAY.jpg` — approved picture | five frames of that run.
* `INSPECT_3D_sheet.jpg` (+ single PNGs) — cameras the player never uses: from in front of Benny, high side, behind wide, OUTSIDE the tunnel
  (a real 3D tube with rings and the coin line inside).
* `TRAVEL_camera_0_to_5_units.jpg` — camera moved forward 0, 0.5, 1, 1.5, 2, 3, 4, 5 units: good to ~2–3 units, then the river smears.
* `BEYOND_good_stretch.png` — what the world looks like past its end (it breaks up).

## Honest verdict
* **Better than every earlier approach for motion:** the first version where Benny really swims forward with a following camera through a 3D world
  that still looks like the approved Screen 05.
* **Too short on its own:** one Marble world holds up for ~3 units of travel ≈ 2.4 s at normal speed (the world is built around one viewpoint;
  most of its detail is within a few tunnel widths). A whole screen would need several overlapping worlds, each 1,580 credits, made from views
  rendered at the end of the previous one — likely drifting further from the approved art each time.
* Remaining differences: softer than the painting, less glow and fewer bubbles; the water is frozen (splats are static — needs an animated water
  layer); Benny's front / sides are plainer than his back; painted coin sprites show a faint square halo up close.
* Android: 500k splats is inside Spark's published Android budget (1–2 million), but a tunnel seen from inside is the heavy case (screen full of
  overlapping splats). Not measured on a phone. Putting it in the game needs three.js 0.170 → ≥ 0.180 (Spark's requirement).

# Round 43 (2026-11-22) — reusable screen kit + Screen 06 rebuilt from its own approved picture

User's orders verbatim: `docs/briefs/2026-11-22-r43/USER_R43.md`. No credits spent. Default game unchanged (new 06 = opt-in test route).

## 1. The reusable system (`tools/screenkit/`, README there)
One command per screen: `bash tools/screenkit/setup_screen.sh NN <ws>` = fit (the screen's own measurements) → SAM 2 masks + clean plate →
Blender 5.3 **Geometry Nodes** components (`RB_Sweep_Tube` drums, `RB_Sweep_Ribbon` + `RB_Sweep_Flume` banked river channels, `RB_Sweep_Band`
gold rings, `RB_FoamBank`, pools, copper paddles) → one GLB → the generic game page `screen.html` (bake from N fitted cameras, the shared Benny,
`tools/kit05/controls.js` swipes, chase camera = the fitted picture camera kept in the route frame). ~10 s per rebuild; only
`screens/NN/fitNN.py` + `segmentNN.json` are screen-specific. Bubble Dash / Sock Rescue (`tools/reflock`) untouched except its title text.

## 2. Artwork extraction — `EXTRACTION_EVAL.md`
SAM 2.1 tiny **adopted** (Benny silhouette IoU 0.968 vs 0.623 hand ellipses / 0.389 rectangles; coins 0.892 vs 0.710, scored against exact
game-rendered ground truth). Depth Anything V2 small = cross-check only (median depth error 13.9 %, too coarse for geometry). Both free,
Apache-2.0, run on the already-installed onnxruntime; no install, no service, no credits.

## 3. Screen 06 "Crest the Rinse Arch" — measured (412 × 915 Android portrait, compare_to_approved.py, unchanged 20-level threshold)
Scenery = the approved picture minus what the game draws itself (HUD, Benny, his swirl, coins, bubbles: the SAM 2 bake mask).
| at the picture's camera position | scenery px within 20 levels | SSIM | colour look | sharpness |
|---|---|---|---|---|
| APPROVED (`06/SCREEN06_1_APPROVED.jpg`) | — | — | — | — |
| PREVIOUS: the current game's Screen 06 start view (`SCREEN06_2_PREVIOUS_old_game.jpg`) | 3.6 % | 0.16 | 0.10 | 0.67 |
| **NEW: screen kit (`SCREEN06_3_NEW_screen_kit.jpg`)** | **89.5 %** | **0.865** | **0.997** | 0.74 |
| NEW, prebaked app copy (`public/screen06`, JPEG bakes) | 87.2 % | 0.848 | — | — |
Steps that got there (identical camera, one factor at a time): first bake 18.2 % (UV bug) → camera exactly on the fitted camera 82.6 % →
Benny matched to the SAM 2 silhouette 83.5 % → splash at the painted swirl size 87.0 % → sharper sampling (lod bias −0.8) 88.0 % → full painted
weight on low-density texels 88.6 % → route through the painted coins (Catmull-Rom) 89.5 %. Difference map: `SCREEN06_4_DIFF_new_vs_approved.jpg`.

**In motion (honest):** the scenery is the same connected 3D world all the way (crest → drum → rings), but away from the start view the painted
pixels get magnified and the painting-STYLE materials take over: colour-look correlation of moving frames 0.27–0.36 (start 0.997), more wall
purple, much less foam than painted (1–5 % vs 9 %), thinner pink edges later; sharpness 0.94–1.16 of the painting. NOT yet "the approved look
while swimming" — next work: wall material colour from the painted wall, foam banks along the pool / crest where painted, water tile from the
painted water, the crest camera roll judged by the user.

## 4. Continuous gameplay (whole Screen 06 level, real CDP touch, 412 × 915, final code)
`06/GAMEPLAY_screen06_kit_real_touch.mp4` (615 frames, 20.5 s, 30 fps), checks `06/GAMEPLAY_screen06_kit_real_touch_checks.json`:
| check | result |
|---|---|
| real finger swipes detected by the game | 14 / 14 (`src: touch`, incl. a leap) |
| Benny's whole body inside the frame | 615 / 615 frames |
| hole pixels (pure-green background = missing geometry) | 0 in all 615 frames |
| scenery meshes that moved (static world) | 0 of 127 |
| camera step / turn per frame | ≤ 0.0997 u (forward travel 0.117) / ≤ 1.69° (an earlier run jumped 6° on route bends: fixed by a smoothed camera frame) |
| page errors | 0 |
| coins | 7 picked (the swipe plan zig-zags between lanes; the painted trail is on the centre lane) |

## 5. Titles / order
The Bubble Dash section's title band showed "05 · FLOW INTO THE CURRENT" (painted into its picture) and the numbered Screen 05 followed with
the same title. Now the section shows "BUBBLE DASH CHAMBER" (badge with the same name hidden); nothing renumbered. Order 04 → A → B → 05 →
06 → 07 … unchanged. The user may want different wording — one line in `tools/reflock/section.html` / `public/section/index.html`.

## 6. Android
`Rainbow_r43_kit06_debug.apk` (`VITE_RAINBOW_BONUS=1 VITE_RAINBOW_KIT06=1 npm run android:debug`): 04 → Bubble Dash / Sock Rescue → 05 →
**new Screen 06** → 07 … (both hand-overs are still page loads, not one scene). No phone / emulator in this container: **unverified on a device.**

## 7. Gates (`.claude/skills/rainbow-screen-builder/screens.json` → `gate_reconciliation_r43`)
06 opened on the user's explicit order (round 42 + 43, recorded verbatim); 04, 07–10 = "prepare" (analysed: `REUSE_MATRIX_04_10.md`), building
waits for the user's verdict on 06; 05 still not approved by the user; Bubble Dash / Sock Rescue recorded as built + protected.

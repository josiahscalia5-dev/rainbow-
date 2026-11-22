# Round 43 — resume here (2026-11-22 ~14:00 UTC, session branch `ccr-80cdb162-4sqz1a`, built on round 42 `ccr-50ff6f57-q5me82`)

Start a new session on **`ccr-80cdb162-4sqz1a`** (it contains all of round 42 + round 43). Never merge branches / PR #32 without the user's OK.

## 1. User's newest orders
`USER_R43.md` (verbatim): generalise the screen builder into a reusable process for EACH screen's own approved picture (Blender Geometry Nodes
components, per-screen measured geometry / colours / camera), evaluate SAM 2 and Depth Anything V2 (free, controlled comparison, adopt only if
better), bake the approved artwork onto real world-space geometry (sharp while moving), reuse Benny / swipes / camera / water, short tests while
iterating, full recordings + Android only at acceptance, APPROVED / PREVIOUS / NEW at identical camera positions, analyse 04–10, reconcile the
gates without silently overriding, finish Screen 06 first, no duplicate titles / repeated levels, autosave preserved.

## 2. Done (evidence `qa/reflock/r43/RESULT_R43.md`)
* `tools/screenkit/` — the reusable kit (README): fit lib, SAM 2 masks, Geometry Nodes Blender library, generic game page, app packaging, compare.
* SAM 2 adopted for masks, Depth Anything cross-check only (`qa/reflock/r43/EXTRACTION_EVAL.md`).
* Screen 06 rebuilt with the kit: **89.5 %** scenery px within 20 levels at the picture camera (previous game 06: 3.6 %); whole-level real-touch
  run 14/14 swipes, Benny on screen 615/615, 0 holes, static world, camera ≤ 1.7°/frame; video `qa/reflock/r43/06/GAMEPLAY_screen06_kit_real_touch.mp4`.
* Opt-in test route in the main game: `VITE_RAINBOW_KIT06=1` / `?kit06=1` (end of 05 → `public/screen06` → back at the 07 checkpoint).
* Bubble Dash title "05 · FLOW INTO THE CURRENT" → "BUBBLE DASH CHAMBER" (no duplicate 05 title, nothing renumbered).
* Gates reconciled in `screens.json` (`gate_reconciliation_r43`); reuse matrix `qa/reflock/r43/REUSE_MATRIX_04_10.md`.
* Round-42 Screen 06 real-touch test of the OLD game re-run first: 11/11 swipes, Benny on screen 300/300, no gold bars on the descent; the floating
  07 paddles found (switch `?lid0607=1` = 05-style trays, default unchanged — the 07 rebuild with the kit replaces them).

## 3. NOT done / next (in this order unless the user says otherwise)
1. **06 in motion** (user rule R19: the approved look WHILE swimming): moving-frame colour look 0.27–0.36 vs 0.997 at the start. Next factors, one
   at a time, measured on fixed moving stills (s = 4, 8, 12, 20, 30): wall material from the PAINTED wall (best-seen bay tile) instead of the drawn
   one; foam banks where the picture paints foam (pool edges, crest outer edge); painted water tile for the close-up water; the crest camera roll
   (ROLL 0.5) to be judged by the user. Then re-record and show the user.
2. The user's verdict on 06 (and on the title wording); only then the next screen (04 or 07, own fits — `REUSE_MATRIX_04_10.md`).
3. Seamless single-scene hand-overs (04 → A → B → 05 → 06 → 07 are separate pages today).
4. Sock Rescue toward 90 % without lowering Bubble Dash (still open from round 42).
5. Real-device test of `Rainbow_r43_kit06_debug.apk` (no emulator here).

## 4. How to rebuild / test 06
```
bash tools/screenkit/get_models.sh                    # free models (once)
bash tools/screenkit/setup_screen.sh 06 /tmp/ws06     # ~10 s
NODE_PATH=$(npm root -g) node tools/reflock/section_run.cjs /tmp/ws06/game /tmp/st06 stills 1.2 0 'sentinel=1'
python3 -I tools/screenkit/compare_screen.py 06 /tmp/st06/s1.20_l0.png /tmp/ws06/seg/mask.png /tmp/cmp06 --before qa/reflock/r43/06/SCREEN06_2_PREVIOUS_old_game.jpg
TOUCH=1 NODE_PATH=$(npm root -g) node tools/reflock/section_run.cjs /tmp/ws06/game /tmp/run06 run end '<plan>' 'sentinel=1'   # ~20 min
bash tools/screenkit/build_screen_app.sh 06 /tmp/ws06 && VITE_RAINBOW_BONUS=1 VITE_RAINBOW_KIT06=1 npm run android:debug
```

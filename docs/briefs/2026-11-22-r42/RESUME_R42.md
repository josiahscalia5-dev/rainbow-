# Round 42 — resume here (written 2026-11-22 ~12:25 UTC, branch `ccr-50ff6f57-q5me82`)

The user is moving to another Claude account (credits). Everything below is saved on GitHub, branch **`ccr-50ff6f57-q5me82`**
(draft PR #32, NOT merged — never merge without the user's OK). Start the new cloud session ON THIS BRANCH, not the default branch.

## 1. The user's newest orders (round 42, 2026-11-22, condensed; their words in quotes)
* "Save everything to my GitHub repository … every 5 minutes" (five-minute autosave: `python3 -I scripts/autosave-status.py` → `AUTOSAVE OK … (match)`).
* Also save the recent chat history to GitHub, so the user can continue on another Claude account.
* **Official list of 13 images**: 11 approved screens (01 Inside Washer Girl and Towel … 11 Safely Home) + 2 new designs
  (A Bubble Dash Chamber, B Sock Rescue Tunnel). **Gameplay order: 04 → Bubble Dash Chamber → Sock Rescue Tunnel → 05 → 06 → 07 → 08 → 09 → 10.**
  Screens 01, 02, 03, 11 = the user's Google Flow videos (do not rebuild). "Do not change the original approved images or renumber my original
  stages without asking." "Do not overwrite an approved reference." "My approved artwork is the authority — not Claudia's previous experimental designs."
* The user mentioned a ZIP with all 13 images — **it never arrived in the session** (not in uploads, not on GitHub). If the user attaches it, compare
  its 11 approved images byte/pixel-wise with `references/*.png` and REPORT differences before replacing anything (nothing replaced so far).
* "Protect the successful Bubble Dash reconstruction." (Bubble Dash view 90.7 %, peak 91.9 %.)
* **"Finish the current Screen 06 gameplay, steering, camera and ring-obstruction fixes before moving on to another unfinished section."**
* For each completed playable screen: original-vs-game comparison + an uninterrupted gameplay recording. No paid AI credits without approval.

## 2. Done in round 42
* Reference check: all 11 repo references are byte-identical to the original 2026-11-15 kit ZIP (`backups/source-package/…`), `sha256sum -c
  scripts/reference.sha256` OK; the two new designs are identical to the pictures the user attached. Inventory + storyboard of all 13 in gameplay order:
  `docs/briefs/2026-11-22-r42/REFERENCE_INVENTORY.md`, `STORYBOARD_13_in_gameplay_order.jpg` (commit a1f795f).
* ChatGPT's branch `chatgpt/rainbow-touch-steering-test-20261122` inspected (opt-in swipe lanes, pointer log) — information only, NOT merged.
* Screen 06 (main game, `src/`):
  - `src/world/environment.ts`: ring camera-occlusion now also keeps the sight lines camera → river 8 u and 16 u ahead clear (`setOcclusion(..., ahead)`,
    `occSeg()` in the shader); `Game.ts` passes the two route points.
  - `src/game/Game.ts`: `keepBennyInFrame()` = on-screen guard for the chase camera (same rule as the section): his posed body (every visible mesh's
    own box, projected) stays inside the frame; the camera slides sideways / up just enough, then eases back. Real-touch test 06→07 (11 swipes):
    Benny off-screen frames 39 → **0 of 300**, 11/11 swipes detected and moved the right way.
  - `bennyBoxPx()` now measures per-mesh oriented boxes (old world-axis box of the tilted group over-reported "off screen"); `aabb` kept for comparison.
  - **ROOT CAUSE of the gold bars across the 06 descent found and fixed**: `buildRingsAt` (`src/world/tube.ts`) built collar rings with a
    left-handed basis (right, up, tan) → `setFromRotationMatrix` gave a wrong rotation, the hoops were tilted and sliced across the river.
    New `RingOpts.trueFrame` uses the right-handed (−right, up, tan) basis like the 05 band rings; ONLY the 06/07 rings use it (04 keeps its approved
    look). A still at s≈232 (where the bars were) now shows upright rings on the tunnel wall and a clear river.
  - A second, camera-based ring filter (`viewClear`) was added (rings covering the river ahead from the game's own RideCamera are not placed); with
    the corrected orientation it removes nothing extra (11 placed / 11 removed by the older passage filter, `globalThis.__rings0607`).

## 3. NOT yet verified (do this first on the new account)
The full real-touch Screen 06 → 07 recording AFTER the ring-orientation fix was interrupted (user stopped the run to save). Re-run:
```
VITE_RAINBOW_BONUS=1 npm run build
RECORD=1 NODE_PATH=$(npm root -g) node tools/reflock/touch_main.cjs dist <out> 06 10 \
  '[[0.6,"left"],[1.8,"right"],[1.95,"right"],[3.2,"left"],[3.35,"left"],[4.6,"right"],[5.8,"left"],[5.95,"right"],[7.2,"right"],[8.4,"left"],[8.55,"left"]]'
```
Expect `ok 11/11`, `box_off_screen_frames 0`; look at frames ~60–120 (the descent) for gold bars (should be gone) and at 07 for the floating
copper "nozzle lids" (orange leaf shapes that look like they float in the 07 tube — next thing to check). Then:
* encode the clip (`tools/reflock/encode_run.py` or ffmpeg), save to `qa/reflock/r42/GAMEPLAY_screen06_real_touch.mp4` + swipes json;
* original-vs-game for 06: `references/06_crest_the_rinse_arch.png` vs the 06 checkpoint view (skill `rainbow-screen-builder` → `compare_to_approved.py`),
  full-size APPROVED | GAME pictures; report the measured number honestly (06 still uses the old tunnel; the true 90 % fix = fitted rebuild of 06
  with the tools/reflock process, like the Bubble Dash / Sock Rescue section).
* `python3 scripts/rainbow-autosave.py --reason manual:r42-06` and verify `AUTOSAVE OK … (match)`.

## 4. After Screen 06 (the user's order)
Sock Rescue toward 90–95 % (now 81.4 %) without lowering Bubble Dash (90.7 %); seamless single-scene hand-over 04 → A → B → 05 (today it is a page
load); ask the user about the duplicated "05" title (Bubble Dash picture carries the 05 caption) — do not renumber without asking; fitted rebuilds of
04, 05, 06, 07, 08, 09, 10; real-device APK test (no emulator in the cloud container — say "unverified on device").

## 5. Where things are
* Section game: `tools/reflock/` (README), app copy `public/section/`, hand-over `src/game/bonusRoute.ts` (`VITE_RAINBOW_BONUS=1` or `?bonus=1`).
* Evidence rounds 40/41: `qa/reflock/r40/RESULT_R40.md` (+ videos, comparisons, APK `Rainbow_r40_bubble_sock_section_debug.apk`).
* User orders: `docs/briefs/2026-11-22-r40/USER_R40.md`, this file.
* Chat history: `backups/claude-sessions/66fa0664-24cd-5101-b8d0-4255365ce070/` (sanitized: no hidden reasoning, e-mails / keys redacted).
  NOTE: the GitHub repository is PUBLIC; the autosave deliberately skips transcripts on a public repo — this one was exported on the user's explicit
  request (2026-11-22 ~12:25 UTC).

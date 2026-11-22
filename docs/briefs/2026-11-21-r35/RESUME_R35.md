# RESUME — round 35 (2026-11-21, session branch `claude/character-swimming-mechanics-jo0h6s`), Screen 05 ONLY

User's order: `USER_R35.md` (look exactly like the approved Screen 05 WHILE Benny swims naturally, like a real game; say plainly what
cannot be done). Binding background: `docs/briefs/2026-11-21-r34/USER_R34.md`, `COORDINATION_R34.md`.

## What this round did (all in `tools/kit05/`, the kit test page; the default game build is untouched)
1. **Integrated the five round-34 specialists' unfinished work** from `backups/wip/*-c34` (19:17 UTC snapshots; worktrees were gone):
   S1 winding river + river_center, S3 river path / camera / coins, S2 swimming + controls + `swimfx.js`, S4 QA suite
   (`tools/kit05/qa/`), S5 skill (`.claude/skills/rainbow-screen-builder/`). All patches applied cleanly (commit `fd3aceb`).
2. **River = the user's OWN painted river** (`bake_river35.py` -> `river35.png`): the isolated water art cast onto the kit water in
   its world place (colour-matched to the approved picture's NEAR water), prefix t 0.6-2.4 + one period of 3 ring sections
   (3 S = 6.28 u; the painted river measurably repeats every 6.0-6.45 u), drift-closed seam, off-picture texels continued along the
   flow, transparent area beyond the painted foam = foam. Benny's lane centre line = the painted river core (eases from his painted
   start over 1.8 u, held 0.27 u from the axis at the sharpest bends). `?r35=0` = round-34 ribbon.
3. **Live painted streak detail** (`river35_detail.png`): the sharp near painted streaks, straightened along the core, streaming with
   the current near the camera where the painted rows are soft; highlights go toward white (hue kept).
4. **Foam banks = painted foam domes** (`bake_puffs.py` -> `puffs.png`): the isolated art's own foam bank cut, levelled, drawn as
   camera-facing billboards along both wall bases (two rows on bend insides) + world-anchored iridescent bubbles. `?puffs=0` = old strip.
   Both fade in exactly where the walls hand over from their own painted pixels: the start view is unchanged.
5. **Gameplay fixes** (S4 suite failures): camera keeps Benny's whole body on screen in bends (guard uses his path vs the smoother
   camera path), gentler bend lean (0.06 rad), bank rate 1.0 rad/s, camera yaw up to 7 deg with the river, lane follow omega 8;
   stress test sends 4 rapid reversal pairs.
6. **Phone build** `build_phone.sh` -> self-contained folder (three.js 0.180.0 from jsDelivr, tap-to-swim real-time mode by default,
   Benny's GLB as base64 text because static artifact hosts do not serve .glb). Published privately for the user:
   **https://claude.ai/artifact/Jpq74VraeFhXnU2hXLQeHD** (republish: same scratchpad path is gone in a new session -> rebuild with
   `SKIP_BAKE=1 bash tools/kit05/setup_kit.sh /tmp/x && bash tools/kit05/build_phone.sh /tmp/x/game <dir in scratchpad>`, strip the
   doctype/html/head/body tags, publish with the artifact `url`).
7. Tried and NOT kept (not clearly closer by the numbers): baked detail transfer (blurred the painted foam), pink bank bands
   (`?pinkband=1,0.44,0.56`, colour look mixed: s9 0.93 -> 0.81-0.89).

## Numbers (412 x 915 phone frame, scenery = below the HUD minus Benny's box; `tools/kit05/s1_compare.py`)
| position | colour look BEFORE (round 34) | NEW | sharpness BEFORE | NEW |
|---|---|---|---|---|
| start (s 0) | 0.993 (80.0 % px within 20 levels, SSIM 0.76) | 0.993 (80.1 %, SSIM 0.76) | 0.77 | 0.77 |
| s 4 | 0.874 | 0.937 | 0.53 | 0.46 |
| s 9 | 0.932 | 0.930 | 0.78 | 0.68 |
| s 15 | 0.921 | 0.924 | 0.82 | 0.71 |
| s 25 | 0.902 | 0.946 | 0.76 | 0.67 |
Pictures: `qa/kit05/r35/compare/` (APPROVED_phone_frame, BEFORE_round34_s*, NEW_round35_s*).
Gameplay (S4 suite, real CDP touch, whole level, `/tmp/rainbow_r35/acc6`): items 1-7 + 10 PASS, phone live mode PASS; 8a camera
smoothness 0.00511 vs 0.005 before the last camera tweak (re-measured in the full run, see REPORT).

## Honest limits (tell the user)
* The start frame is the approved picture (80 % of scenery pixels within 20 levels); in motion the look is the painting's own river,
  rings, walls, foam and colours (colour look 0.92-0.95), but not pixel-identical: the river repeats every 3 rings, near water is
  softer than the painting (sharpness 0.46-0.71 of the approved), fewer pink bands right next to Benny than in the picture.
* Frame rate on a real phone cannot be measured here (no GPU / emulator): the phone build shows fps + swipe response on screen.

## Next
* Full-level run with every frame (`SHOTS=all bash tools/kit05/qa/run_acceptance.sh`), video, REPORT -> user.
* If the user wants it closer while swimming: sharper near walls (own-pixel -> shared crossfade region), the painting's pink bands next
  to Benny without hurting the colour numbers, bigger near bubbles.

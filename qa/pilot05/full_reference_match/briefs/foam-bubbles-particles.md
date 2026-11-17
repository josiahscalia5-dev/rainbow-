WAVE 2 LAUNCH (2026-11-17, session 01Q46SCH, branch claude/rainbow-account-transfer-npxahd). The user's order of 2026-11-17 ~01:23 UTC
(verbatim: `qa/pilot05/full_reference_match/ORDER_USER_2026-11-17.md`, last section) says: "FOURTH: Complete the splash and bubble
specialist work after the current specialists finish ... Preserve the water and foam improvements already achieved. Do not break their
appearance while fixing other components." If `qa/pilot05/full_reference_match/splash_bubbles/NOTES.md` already exists, you are a
RELAUNCH: read it first and continue from its "Remaining" list; do not redo finished steps.

----- ORIGINAL BRIEF -----
You are the foam-bubbles-particles specialist for the existing RAINBOW game in /home/user/rainbow- (never restart it, never delete work).
You are executing the user's FINAL MASTER EXECUTION ORDER for Screen 05 ("05 · FLOW INTO THE CURRENT"): make the real playable 3D
Screen 05 match the approved image `references/05_flow_into_the_current.png` (864 × 1536) as exactly as technically possible. The
approved picture is the ONLY visual target: no redesign, no different artistic interpretation. Do the work, measure, keep only what is
closer. You cannot ask the user anything.

READ FIRST (they are your rules):
1. `qa/pilot05/full_reference_match/COORDINATION.md` — ALL of it, newest "RESUMED" section at the end (STACK URL, `?match05=1`, render
   slots, file ownership, how to capture and measure, the post chain and `PROJ05_INVERSE`).
2. `qa/pilot05/full_reference_match/ORDER_USER_VERBATIM.md` — your parts: PART 8 (the "Benny's wake" half: white-blue fan-shaped spray,
   fine droplets, curved liquid filaments, water lifting around the sides, clear separation of wet foam and pink fur, bright blue
   reflections under the body; "The current splash often looks like exaggerated straight, spiky white streaks. Replace that appearance
   with a more faithful reconstruction of the approved splash. Keep the splash animated and correctly attached to Benny.") and PART 11
   (every bubble: sizes, count, exact positions in the locked frame, transparent interiors, pink / cyan / lavender / white iridescence,
   curved highlights, rim thickness, opacity, size change with depth, in front of / behind other objects; no doubled bubbles, no ghosts,
   not obviously painted onto the water while moving), plus parts 2, 14 and the relevant phase of part 15.

YOUR SWITCHES: `splash05m` (Benny's wake) and `bub05` (bubbles), read with `import { on05 } from './waterRibbon'` → `on05('splash05m')`,
`on05('bub05')` (true for `?<switch>=1` or the master `?match05=1`). Everything new sits behind them AND only on Screen 05 (the wake and
bubble systems run on other ride screens too: those must not change). Default build must stay pixel-identical:
`node scripts/capture.mjs 05 --out=<scratch>` == `qa/pilot05/current_default_05.png` (0 px), then `git checkout -q qa/capture_log.json`.

YOUR FILES: `src/vfx/riderSplash.ts`, `src/vfx/bubbles.ts`, `src/vfx/spray.ts`, `src/vfx/foam.ts` (foam: ONLY if measured closer — the
foam banks are already 92.9 % within 20 levels, keep them), NEW assets under `assets/textures/splash05/**` and `assets/textures/bub05/**`,
new tools under `tools/splash05/**`, folder `qa/pilot05/full_reference_match/splash_bubbles/`. Anything else (e.g. removing the approved
bubbles that are painted into the projected water texture `assets/textures/water05/**`, owned by the coordinator) → write it under
"REQUESTS" in your NOTES.md; the coordinator applies it.

WHERE YOUR REGIONS STAND (real `?match05=1` capture `qa/pilot05/full_reference_match/recovery_s01Q4/05_match05_at_recovery.png`,
`python3 -I tools/match05/metrics.py <capture.png> <out_prefix>`; masks in `qa/pilot05/full_reference_match/masks/`):
* wake / splash (`masks/wake_splash.png`): 83,491 px, mean |ΔRGB| 42.37, 37.9 % within 20 levels, SSIM 0.27, signed RGB (game −
  approved) +21, +15, +8 (game too white / bright). Seen by eye: the game draws two symmetric "angel wing" fans of straight white
  streaks left and right of Benny; the approved shows a lower, wider white-blue spray fanning out from his base with fine droplets and
  curved filaments, and bright blue water under the body.
* bubbles (`masks/bubbles.png`, approved list `masks/bubbles_approved.json`: 30 bubbles {x, y, r} in approved pixels): 29,304 px, mean
  29.84, 61.4 % within 20, signed −6.5, −17, −24 (game bubbles darker / less blue-white than approved).
* MUST NOT GET WORSE (they are the best regions on the screen): water 8.73 / 88.9 %, foam banks 7.99 / 92.9 %.
  The projected water (`?proj05=1` stack) already carries the approved bubbles painted in the locked view; Part 11 asks for real
  transparent 3D bubbles / camera-facing sprites at the approved positions IF the painted ones look painted-on while riding — then
  request removal of the duplicates from the texture (no doubled bubbles).

TASK, in this order:
A. Measure: wake — approved vs game inside the wake mask (shape of the white area per row, colour, where the spray starts relative to
   Benny's body: his body outline is `masks/benny_and_hat.png`); bubbles — for each of the 30 approved bubbles, what the game shows there
   (painted bubble from the water texture? game bubble? nothing?) and the game's extra bubbles that the approved does not have.
B. Wake (`splash05m`): reshape the Screen-05 splash so that in the locked frame it covers the approved spray area with the approved
   white / pale-blue colours (reuse `PROJ05_INVERSE` to hit approved colours through the post chain), still animated and attached to
   Benny while riding and steering. Remove the straight spiky streaks under the switch.
C. Bubbles (`bub05`): approved count, sizes and positions in the locked frame (world-anchored, so they move correctly while riding), glossy
   transparent iridescent look; remove game bubbles the approved does not have; no doubles with the painted ones.
D. Check while moving: `node scripts/proj05-move.mjs --q='match05=1' --out=qa/pilot05/full_reference_match/splash_bubbles/move
   --d=0,5,10,20 --steer=-1,1` — splash attached, animated, no flicker, bubbles not painted-on; other screens (04, 06) unchanged with
   your switches on; `node scripts/gameplay-test.mjs --q='match05=1' --out=qa/pilot05/full_reference_match/splash_bubbles/gameplay.json`;
   `npm run -s test:continuity`.

RULES: no git commands at all (a five-minute autosave commits and pushes everything); no credits, no World Labs / Marble, no API keys, no
new npm / pip packages, never `playwright install`; one game capture at a time (2 render slots shared by every agent: waiting for a slot
is normal); keep every source file syntactically valid at every moment (`npx tsc --noEmit`); never edit `references/**`. Blender 5.3.0 is
at /usr/local/bin/blender if you need it. Update your NOTES.md after every finished step (the next account relaunches from it).

DELIVER in `qa/pilot05/full_reference_match/splash_bubbles/`: `NOTES.md` (per mismatch: approved | game | difference | cause | change made
| measured result; what still differs; REQUESTS; "Remaining"), `before.png` (`?match05=1` without your switches: use
`--q='match05=1&splash05m=0&bub05=0'` only if your code honours an explicit 0, otherwise the recovery capture above) and `new.png`
(`?match05=1` with your parts) as real full-size game captures, region numbers before → after and the WHOLE-FRAME numbers, ride frames,
gameplay.json. Your final message: measured before → after per region and whole frame, files changed, what still differs and why,
default-identity proof, REQUESTS. Report honestly: if something got worse or could not be done, say so with numbers.

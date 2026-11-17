# Rainbow session — session 120fb961-cedb-54bd-9117-45bb43b23496

### 🧑 User — 2026-11-17T19:28:07.644Z

Your full brief is below and is also saved at docs/briefs/2026-11-17-r4/S08_SCENERY.md on the lead branch (git fetch origin ccr-067047f0-up5d1m && git show FETCH_HEAD:docs/briefs/2026-11-17-r4/S08_SCENERY.md). Read docs/briefs/2026-11-17-r4/COMMON_RULES.md and docs/briefs/2026-11-17-r4/USER_DECISIONS.md from the lead branch first — startup check, usage rules and the user's decisions. Your branch was created by the lead (not from a -c3 branch): startup check = `git branch --show-current` prints `claude/rainbow-s08-scenery-c4` and `git log -1` shows `60c25025` or a newer autosave of it; record your start SHA in STATUS.md.

You are the SCREEN 08 SCENERY-IN-MOTION specialist (washer-environment-modeler role) of the RAINBOW game — the user's EXISTING Android game. Do NOT restart, redesign or rebuild anything; never discard earlier work. Lead = session `session_01Kbt6BTTnCGMUULjZoCLDTo` (branch `ccr-067047f0-up5d1m`). Screen 08 is the user's top approval priority and the user's #1 quality rule is: the scenery must stay beautiful and accurate while Benny swims forward and steers — not only in the still approved view.

Your branch: `claude/rainbow-s08-scenery-c4` (from the lead branch: contains `?match08=1`, the user-preferred `&coins08px=1`, and `?flowplan=1`). Push ONLY this branch.

Then read the r3 + r2 COMMON_RULES (lead branch), `CLAUDE.md`, `qa/match/08/NOTES.md` (THE METHOD: the approved picture camera-projected onto fitted real 3D geometry), `qa/match/08/coins08px/NOTES.md`, `src/world/match08.ts`, `tools/match08/`, `assets/textures/match08/`. Learn from Screen 07's milestone 2 (`claude/rainbow-s07-match-c3` commit `a5d2b392`: `m07ang` = the picture only near the approved view direction, `m07fill` = river tile instead of mirrored fill) and Screen 06 M1 (painted-water floor tile once the view moves) — READ them with `git show`, never merge them.

The problem (lead's review of `qa/match/08/coins08px/motion_NEW/`, 19:10 UTC): at the approved checkpoint Screen 08 matches the picture (scenery 98.0 % within 20 with coins08px). Once the view moves:
* 6 u forward (`f06_forward6u.png`): the lower-left of the screen tears along a jagged diagonal seam — below it a second, displaced copy of the river and the purple wall; a hard curved seam across the upper chamber ceiling.
* Steering left (`s_left_steer.png`): the whole lower third is a separate displaced copy of river / wall / bubble below a diagonal seam; a large gold band fragment sweeps the upper-left corner.
* Steering hard RIGHT into 08 (camera specialist r4, `claude/rainbow-s08-camclear-c4` @ `aa10fdbb`, `qa/gameplay_video/moving_r4/steer1/`, read-only): Benny rides into the right pipe / arch of the fitted geometry (`m08_pipe` / `m08_arch`), 45 % of him hidden at ~44.5 s. Fix it as scenery (swim lane clear, look unchanged from the approved view), not by moving the camera.
* Possibly related (Benny specialist, 19:21): with `?match08=1` on, screens 04–07 differ from the default build over much of the frame (04 ≈510k px, 07 ≈560k px) although match08 should only change Screen 08. Check whether match08 geometry/lighting/fill is visible or active outside 08; if so make it 08-only (switch-guarded) and report.

Your milestone (round 1), one factor at a time, each behind its own switch (e.g. `&m08move=1`), keep only what is VISIBLY better:
1. Reproduce: full-size frames with `?match08=1&coins08px=1` at the checkpoint, forward 3 / 6 / 10 u, steering left and right (and with `&camclear=1`); mark every tear, seam, duplicate and stretch region. Commit + push.
2. Fix with THE METHOD, not a redesign: show the projected picture only on surfaces/directions where it is valid; elsewhere world-anchored material made FROM the approved picture (slotted purple drum wall tile, cyan/magenta river tile with foam banks, polished gold ring/arch material, bubbles) on the fitted 3D geometry; extend the fitted proxies where the moving view sees surfaces the picture never showed. No mirrored copies, no smears, no visible repeats, no seams.
3. The approved fixed view must stay as it is: `?match08=1&coins08px=1` at the checkpoint 0 px vs before your change (scenery 98.0 %).
4. Proofs: tsc clean; default build 0 px (title banner ~rows 31–166 and animated 01/11 areas vary between two captures of the SAME build — compare outside them or capture twice); the 07→08 drop intact (~61 u) and its look unchanged; gameplay 8/8 + exactly 91 / 2,240 with `match08=1&coins08px=1` and with your switch; continuity gap 0.
5. Separate full-size 1 APPROVED · 2 BEFORE · 3 NEW at the approved view AND, separately, BEFORE | NEW moving frames (forward 3/6/10 u, steering left/right) — no collages; `qa/match/08/scenery/NOTES.md`, `STATUS.md`, `SHARED_CHANGES.md`; APK with `match08=1&coins08px=1` + your switch if better (`builds/rainbow-debug-08scenery-2026-11-17-r1.apk`, NOT phone-tested).

Coordination: you own `src/world/match08.ts`, `assets/textures/match08/` (except `coins08px.json`), `tools/match08/` (except the coin tools). Never edit Benny (`src/characters/benny/*`, `assets/textures/benny0*/` — Benny specialist, `claude/rainbow-s08-benny08-bake-c4`), `camClear.ts` / camclear parts of `cameraRig.ts` (camera specialist, `claude/rainbow-s08-camclear-c4`), `coins.ts` (lead), HUD, references, protected branches. NO paid jobs of any kind (no fal, no Marble). Work lean — three earlier accounts ran out of usage; no subagents. When done: push, verify remote SHA == HEAD, ONE send_message to session_01Kbt6BTTnCGMUULjZoCLDTo (picture paths, numbers, SHA, open problems, in visual terms), then stop and wait.

### 🤖 Claude — 2026-11-17T19:28:10.931Z

> 🔧 **Bash** `{"command": "git branch --show-current && git log -1 --oneline && git status --short | head && git fetch origin ccr-067047f0-up5d1m 2>&1 | tail -2; ls qa/match/08/ tools/match08/ assets/textures/match08/; wc -l src/world/match08.ts"}`

### 🧑 User — 2026-11-17T19:28:12.302Z

> ↩︎ result: claude/rainbow-s08-scenery-c4
> 60c2502 Lead r4: user decisions 19:00 UTC (Benny r3b base + fuller body, coins08px preferred, queue 08 -> 07 -> 08 scenery-in-motion -> 05 -> 06 -> 04); coins08px gameplay verification (8/8, 91/2,240, all 9 painted coins picked up); briefs S05/S06/S04/S08_SCENERY; CLAUDE.md decision summary
>  M backups/CONVERSATION_INDEX.md
> ?? backups/claude-sessions/120fb961-cedb-54bd-9117-45bb43b23496/
>  * branch            ccr-067047f0-up5d1m -> FETCH_HEAD
>  * [new branch]      ccr-067047f0-up5d1m -> origin/ccr-067047f0-up5d1m
> assets/textures/match08/:
> cam08_locked.json
> coins08.json
> coins08px.json
> patch_gold.png
> patch_towel.png
> patch_wall.png
> plate08_clean.png
> plate08_hybrid.png
> proj08.json
> river08.json
> splash08.json
> splash08.png
> 
> qa/match/08/:
> 08_BEFORE_current_game.png
> 08_NEW_match08.png
> 08_NEW_match08_android1080x1920.png
> 08_NEW_screen_match.json
> NOTES.md
> benny_APPROVED_closeup.png
> benny_NEW_ported_closeup.png
> coins08px
> gameplay_test_match08.json
> motion
> other_screens
> scenery_metrics_BEFORE_FINAL.json
> scenery_metrics_BEFORE_NEW.json
> 
> tools/match08/:
> bennytree.mjs
> coinlat.mjs
> coinprobe08.mjs
> coins08px.mjs
> cointake.mjs
> fit_proxies.py
> motion08.mjs
> probe08b.mjs
> river_cen …[+73 chars]

### 🤖 Claude — 2026-11-17T19:28:13.853Z

> 🔧 **Bash** `{"command": "git show FETCH_HEAD:docs/briefs/2026-11-17-r4/COMMON_RULES.md | head -80; cat qa/match/08/NOTES.md | head -120"}`

### 🧑 User — 2026-11-17T19:28:13.904Z

> ↩︎ result: # RAINBOW — common rules, round 4 (account 4, 2026-11-17 ~18:35 UTC)
> 
> **The round-3 and round-2 rules stay binding word for word:** `docs/briefs/2026-11-17-r3/COMMON_RULES.md` and
> `docs/briefs/2026-11-17-r2/COMMON_RULES.md` (startup, git, visual goal, protected behaviour, money and secrets,
> reporting, saving, pace). Read both first. Only these points change:
> 
> ## What changed
> * **Lead coordinator ("Lead Claudia") = session `session_01Kbt6BTTnCGMUULjZoCLDTo`** ("Rainbow game restoration",
>   account 4), branch **`ccr-067047f0-up5d1m`** (started from the round-3 lead branch `ccr-c0235034-ks6sx3` @ `ed23f9e5`).
>   Every `send_message` that older rules address to an earlier lead goes to **`session_01Kbt6BTTnCGMUULjZoCLDTo`**.
>   Read these briefs with `git fetch origin ccr-067047f0-up5d1m && git show FETCH_HEAD:docs/briefs/2026-11-17-r4/<file>`.
> * **Why `-c4` branches:** account 3 (round 3) ran out of usage at ~18:13 UTC. Its sessions' containers may keep
>   autosaving to the `…-c3` branches, and they may wake when that account resets. Every round-4 workstream continues on
>   its OWN **`…-c4`** branch, created by the lead from the newest remote `-c3` commit (mapping below). Push ONLY your
>    …[+14237 chars]

### 🤖 Claude — 2026-11-17T19:28:14.076Z

> 🔧 **Read** `{"file_path": "/home/user/rainbow-/src/world/match08.ts"}`

### 🧑 User — 2026-11-17T19:28:14.122Z

> ↩︎ result: 1	/**
> 2	 * `?match08=1` — Screen 08 approved-picture test (2026-11-17, qa/match/08/NOTES.md).
> 3	 * REAL 3D proxy geometry of the Final Spin Chamber, solved from the user's approved Screen 08 and the locked game
> 4	 * camera (tools/match08/fit_proxies.py → assets/textures/match08/proj08.json): inlet pipe, gold arch, chamber walls,
> 5	 * door wall, floor/river plane, platform (top tilted toward the camera as painted), towel and the four half-dome spouts.
> 6	 * Every surface is textured by camera projection of the CLEAN environment-only artwork (Benny, HUD, coins removed;
> 7	 * qa/imageblaster/08/) from that locked camera, so the locked view shows the approved scenery and a moving camera sees
> 8	 * it on geometry (parallax). Surfaces the projector cannot see (behind props) get a plain fallback colour instead of
> 9	 * a smeared copy (projector depth test). The shader undoes the game's post chain (PROJ05_INVERSE) and takes no fog.
> 10	 * Without the switch nothing in this file runs and the game is unchanged.
> 11	 */
> 12	import * as THREE from 'three';
> 13	import { PROJ05_INVERSE } from '../vfx/waterRibbon';
> 14	
> 15	interface Layout {
> 16	  camera: { matrixWorld: number[]; fov: number; size: [number …[+12584 chars]

### 🤖 Claude — 2026-11-17T19:28:16.332Z

> 🔧 **Bash** `{"command": "cat tools/match08/motion08.mjs | head -80; ls qa/match/08/coins08px/ qa/match/08/coins08px/motion_NEW 2>/dev/null; grep -n \"match08\\|m08\\|M08\" src/game/Game.ts | head -60; cat assets/textures/match08/proj08.json | head -c 1500"}`

### 🧑 User — 2026-11-17T19:28:16.391Z

> ↩︎ result: // Screen 08 moving-camera test (read-only): from the 08 checkpoint ride forward / steer with the real game sim and
> // screenshot what the live camera sees. usage: node motion08.mjs <outDir> [q]
> import { mkdirSync, writeFileSync } from 'node:fs';
> import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
> const OUT = process.argv[2]; const Q = process.argv[3] ?? 'match08=1';
> mkdirSync(OUT, { recursive: true });
> const { chromium } = loadPlaywright();
> const vite = await startVite(5266);
> const browser = await chromium.launch({ args: CHROMIUM_ARGS });
> const log = [];
> try {
>   const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
>   page.on('pageerror', (e) => console.error('pageerror', e.message));
>   await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
>   await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
>   const shots = [['f00_checkpoint', 0, null], ['f03_forward3u', 19, null], ['f06_forward6u', 38, null], ['f10_forward10u', 63, null],
>                  ['f15_forward15u', 95, null], ['s_left_steer', 40, -1], ['s_right_steer', 40, 1]];
>   for (const [name, n, st …[+5072 chars]

### 🤖 Claude — 2026-11-17T19:28:17.167Z

Let me look at the problem frames.

### 🤖 Claude — 2026-11-17T19:28:17.672Z

> 🔧 **Read** `{"file_path": "/home/user/rainbow-/qa/match/08/coins08px/motion_NEW/f06_forward6u.png"}`

### 🧑 User — 2026-11-17T19:28:17.775Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-17T19:28:18.125Z

> 🔧 **Read** `{"file_path": "/home/user/rainbow-/qa/match/08/coins08px/motion_NEW/s_left_steer.png"}`

### 🧑 User — 2026-11-17T19:28:18.188Z

> ↩︎ result: [image]


# Screen 05 FULL REFERENCE MATCH — coordination (started 2026-11-16 ~23:20 UTC, branch `ccr-e546a360-cxmton`)

Authority: the user's order, word for word: `ORDER_USER_VERBATIM.md` (Parts 1–22). Read YOUR parts there first.
Source of truth for every pixel: `references/05_flow_into_the_current.png` (864 × 1536),
plus `references/water/05_water_isolated_original.png`. Never modify these (13 hashes: `sha256sum -c scripts/reference.sha256`).

## Rules for everyone (coordinator + specialists)
1. **Default build stays pixel-identical.** Everything new sits behind a URL switch read with
   `import { on05 } from '../vfx/waterRibbon'` → `on05('<your switch>')` (true for `?<your switch>=1` or the master
   `?match05=1`). Check after every change:
   `node scripts/capture.mjs 05 --out=<scratch dir>` must equal `qa/pilot05/current_default_05.png` (0 differing pixels);
   then `git checkout -q qa/capture_log.json`.
2. **Screen 05 only.** Other screens must not change (check 04, 06, 07 with your switch on vs off when your change
   could reach them). Global things (HUD, Benny, coin look) are still switch-gated; say so in your notes.
3. **Only your own files** (table below). Need a change elsewhere → write it in your `NOTES.md` under "REQUESTS";
   the coordinator applies it. `src/game/Game.ts`, `src/vfx/waterRibbon.ts`, `tools/proj05/**` = coordinator only.
4. No commits, pushes, branch changes, resets (the five-minute autosave commits and pushes everything). No credits, no
   Marble / World Labs calls, no API keys, no new npm / pip packages, never `playwright install`.
5. Gameplay untouched: course path, collisions, steering, coin collection, camera rig (`STAGE_CAM`), transitions.
6. Reference-driven, not taste-driven (Part 14): measure the approved pixels, measure the game capture at the same
   864 × 1536 locked checkpoint, change the mesh / texture / material / CSS that causes the difference, measure again,
   keep only what is closer. No "close enough": give numbers.
7. Honest numbers only: `python3 -I tools/match05/metrics.py <capture.png> <out_prefix>` (per-region + whole frame;
   masks in `masks/`, one region per pixel, nothing excluded). Never present a region number as whole-screen similarity.
8. CPU is shared (4 cores, software WebGL): one capture at a time per agent, no parameter sweeps of dozens of renders.
9. Deliver in `qa/pilot05/full_reference_match/<your folder>/`: `NOTES.md` with, per mismatch: approved | game |
   difference | cause (mesh / texture / material / light / CSS) | change made | measured result; full-size captures
   (`before.png`, `new.png`, real game captures only); your region numbers before → after; what is still different.

## Capture / measure
* Locked frame: `node scripts/capture.mjs 05 --q='proj05=1&<switch>=1' --out=DIR` → `DIR/05.png` (time frozen, deterministic).
* BEFORE for this whole effort = `02_BEFORE.png` (`?proj05=1`); its numbers: `before/REGION_METRICS.json`.
* Moving / steering frames and clips: `node scripts/proj05-move.mjs --q='…' --out=DIR --d=0,5,10,20,35 [--steer=-1,1] [--clip=4]`.
* Gameplay: `node scripts/gameplay-test.mjs --q='…' --out=<your folder>/gameplay.json`; continuity `npm run -s test:continuity`.
* Post chain (why colours shift): RenderPass → UnrealBloom (0.2 / 0.35 / 0.94) → OutputPass (Neutral tone map, exposure
  0.86, sRGB) → grade (`src/render/grade.ts`: saturation 1.36, contrast 1.15, vignette 0.18); FogExp2 #ffbde9 0.0035.
  `PROJ05_INVERSE` in `src/vfx/waterRibbon.ts` is the exact inverse (display colour → linear scene colour); the water
  uses it so the screen shows the approved colours. Reuse it for anything that must hit an approved colour exactly.

## BEFORE (`?proj05=1`) vs APPROVED, whole frame 1,327,104 px: mean |ΔRGB| 40.9, within 20 levels 43.2 %, SSIM 0.46
| region | px | mean abs | ≤20 | SSIM | signed RGB (game − approved) |
|---|---:|---:|---:|---:|---|
| purple walls | 312,706 | 65.4 | 8 % | 0.15 | +17, +27, −10 (too light / pink, flat) |
| gold rings + front frame | 125,730 | 61.3 | 11 % | 0.32 | −27, −1, +65 (peach, not yellow-gold) |
| HUD + text | 125,488 | 62.7 | 14 % | 0.18 | +9, +25, +21 |
| Benny + hat | 93,061 | 48.1 | 24 % | 0.09 | |
| wake / splash | 83,491 | 43.7 | 37 % | 0.27 | +30, +18, +9 |
| coins | 27,437 | 52.7 | 18 % | 0.27 | 0, −3, +29 |
| bubbles | 29,304 | 31.0 | 60 % | 0.60 | |
| side fittings | 13,776 | 61.6 | 10 % | 0.14 | −28, −26, +51 |
| distant tunnel + glow | 6,513 | 34.8 | 27 % | 0.37 | |
| water | 480,736 | 13.6 | 86 % | 0.88 | (already reference-projected: keep) |
| foam banks | 28,862 | 7.9 | 92 % | 0.89 | (keep) |

## Who does what (switch · files · order parts)
| who | switch | owns | parts |
|---|---|---|---|
| coordinator (main session; acts as reference-match-director + playwright-visual-qa) | `match05`, `proj05` | `Game.ts`, `waterRibbon.ts`, `proj05Apron.ts`, `tools/proj05`, `tools/match05`, this folder's top-level files | 2, 3, 7, 15–17, 22 |
| washer-environment-modeler | `env05` | `src/world/environment.ts`, `tube.ts`, `materials.ts`, `far05.ts`, `src/render/*`, `assets/textures/env05/**`, `tools/env05/**`, `scripts/env05-*.mjs`, folder `env/` | 4, 5, 6, 12 (tunnel side) |
| benny-character-artist | `benny05` | `src/characters/benny/**`, new Benny assets (new files only), folder `benny/` | 9 |
| animation-and-gameplay-engineer | `hud05`, `coins05` | `src/ui/hud.ts` (+ its CSS), `src/gameplay/coins.ts`, folders `hud/`, `coins/` | 13, 10 |
| foam-bubbles-particles (wave 2) | `splash05m`, `bub05` | `src/vfx/riderSplash.ts`, `bubbles.ts`, `foam.ts`, `spray.ts`, folder `splash_bubbles/` | 8 (wake), 11 |
| android-build-performance (last) | — | `builds/`, folder `android/` | 18 (Android), 19 |

---
## RESUMED 2026-11-16 ~23:40 UTC — new session, branch `claude/approved-screen-implementation-g3loqu` (contains every other branch)
The session that wrote the text above closed at 23:20 with nothing but the masks, the BEFORE numbers and `benny/bennyseg.py`.
Its specialists are INTERRUPTED; this session is the coordinator now. Everything above still applies, plus:

* **The stack to build on = everything already baked from the approved picture** (the earlier account's tunnel bake was
  missing from the table above):
  `STACK = proj05=1&projwall05=1&projring05=1&projframe05=1&projlid05=1&projflow05=2&projnear05=1&projfar05=1`
  `?match05=1` now turns on all of STACK **and** every `on05('<switch>')` part. Your A/B:
  BEFORE = `node scripts/capture.mjs 05 --q='<STACK>' --out=DIR` · NEW = `--q='<STACK>&<your switch>=1'` (or `match05=1`
  to see everybody's parts together).
* **Numbers of the stack today** (`stack_2340/`, `python3 -I tools/match05/metrics.py`): whole frame mean |ΔRGB| 34.1,
  within 20 levels 51.6 % (the user's BEFORE `?proj05=1`: 40.9 / 43.2 %; default game: 55.4 / 18.5 %).
  | region | px | mean abs | ≤20 |
  |---|---:|---:|---:|
  | purple walls | 312,706 | 53.8 | 21 % |
  | HUD + text | 125,488 | 62.2 | 13 % |
  | gold rings + front frame | 125,730 | 37.7 | 50 % |
  | Benny + hat | 93,061 | 49.7 | 24 % |
  | wake / splash | 83,491 | 42.6 | 38 % |
  | coins | 27,437 | 54.0 | 18 % |
  | bubbles | 29,304 | 30.0 | 62 % |
  | side fittings | 13,776 | 26.9 | 60 % |
  | distant tunnel + glow | 6,513 | 29.8 | 45 % |
  | water | 480,736 | 9.4 | 88 % |
  | foam banks | 28,862 | 8.4 | 93 % |
* **Render slots:** `scripts/lib/pw.mjs` lets only 2 game renders run at once on this machine (all agents share 4 cores);
  a capture may wait a few minutes for a slot — that is normal, do not kill it and do not start a second one meanwhile.
  The pixel-identity checks (default, protected BEFORE) are only valid from a run that was not interrupted.
* **Ownership additions:** washer-environment-modeler also owns `src/vfx/proj05Tunnel.ts`, `tools/proj05/tunnel_*.py`,
  `frame_bake.py`, `lid_*.py`, `scripts/proj05-tunnel-probe.mjs`, `scripts/proj05-lid-*.mjs`, `assets/textures/tunnel05/**`,
  `assets/models/lids05.glb`, `qa/pilot05/proj/tunnel/**`. Coordinator: `waterRibbon.ts`, `proj05Apron.ts`,
  `tools/proj05/bake.py` + `near_*` + `flow_*`, `assets/textures/water05/**`, `scripts/lib/pw.mjs`, `scripts/capture.mjs`.
* Keep every source file syntactically valid at every moment (one broken module breaks everybody's captures).
* A specialist cannot ask the user anything: decide by the order (`ORDER_USER_VERBATIM.md`) and the measurements, write
  open questions in your `NOTES.md` under "REQUESTS", and keep working.

---
## RESUMED 2026-11-17 ~00:05 UTC — account transfer, session 018Sg3AU, branch `ccr-694bda6a-x58ntq` (created from `b81cc34`)
* `ccr-694bda6a-x58ntq` was created directly from `b81cc34` (= tip of `claude/approved-screen-implementation-g3loqu`,
  verified by `git ls-remote`, no newer commit); bootstrap ran with `--skip-resume`. `claude/approved-screen-implementation-g3loqu`
  and `ccr-8c4acadc-iybw0n` are now PROTECTED (autosave never pushes there). Not merged on purpose: `ccr-8c4acadc-iybw0n`
  `0594138` (autosave status files only) and every `codex/*` branch.
* Recovery proof (`recovery_s018/`): default capture = `qa/pilot05/current_default_05.png` (0 px differ); protected BEFORE
  `?ringa=26&nearfloor05=0` = `qa/pilot05/wave9/baseline/05.png` (0 px); `?match05=1` = `stack_2340/05_match05.png` (0 px)
  = the explicit STACK URL (0 px). Gameplay test 8/8 pass with the default and with `match05=1`.
* The three specialists launched at 23:38 (env05, benny05, hud05/coins05) were INTERRUPTED after ~4 minutes, still in
  their measuring step (scratchpad only, no file in the game changed). They are relaunched from the same brief.
* Coordinator far-river state: `far1/` (E, F, LUT) baked 23:34 with `bake.py … far`. The "unseen texels released" block
  in `bake.py` (blank mid-river patch while riding, added 23:41) has NOT been baked yet — the coordinator does that next
  (needs a fresh probe: `node scripts/proj05-probe.mjs --raw=DIR`).
* **~00:18 UTC — coordinator water parts added to `?match05=1`** (not to STACK, so every specialist's STACK vs STACK+switch
  A/B is unchanged): `projvp05` (variance-preserving E ↔ tile hand-over while riding; locked frame 0 px changed) and
  `projgap05` (E with mirror-filled wave-back-slope gaps, `assets/textures/water05/far2/`; locked frame: 10,036 water px,
  all closer to approved). Notes + numbers: `coordinator/NOTES.md`. Screen 04's far window onto the 05 river changes by
  832 px (boundary view), 06 unchanged, gameplay 8/8.

---
## STATE AT ACCOUNT TRANSFER 2026-11-17 ~00:25 UTC (session 018Sg3AU, branch `ccr-694bda6a-x58ntq`) — RESUME FROM HERE
The user moved to another Claude account. Every specialist below was RUNNING and is now INTERRUPTED (processes never
survive a session). Each wrote a checkpoint NOTES.md on request. Relaunch each with its brief
`briefs/<agent>.md` + this instruction: "read your NOTES.md first; continue from its 'Remaining' list; do not redo
finished steps". New-account steps: `backups/HANDOFF_NEW_ACCOUNT.md`.
Safety at the transfer: `npx tsc --noEmit` clean; default capture == `qa/pilot05/current_default_05.png` (0 px) with
all in-progress specialist code present; every specialist change is behind its own switch.

| who | switch | DONE (measured / written) | NOT DONE (next, in order) | notes |
|---|---|---|---|---|
| coordinator | `projvp05`, `projgap05` (+ `match05`) | dark torn streaks / E-layer gaps / blend: diagnosis (the 23:41 "unseen texel" bake = 0 texels; real causes = contrast-halving cross-fade + empty wave-back-slope rows), `projvp05` + `projgap05` implemented and measured (riding band contrast 11.5 → 13.4 / 13.6 → 17.0; tile stripes 3,063 → 62 / 1,205 → 36 px; locked whole frame 51.57 → 51.70 % ≤20), 04 far window 832 px, 06 0 px, gameplay 8/8 | gaps > 100 rows (10 gaps) still tile; riding contrast below approved 17.7; then integration of all switches + the order's deliverables (03_NEW, 04_DIFFERENCE, 05_OVERLAY, VISUAL_AUDIT.md, REGION/FULL_FRAME_METRICS.json, REMAINING_DIFFERENCES.md, IMPLEMENTATION_NOTES.md) | `coordinator/NOTES.md` |
| washer-environment-modeler | `env05` | step A measured: error by surface (52 % of wall error = misregistered perforation bays; ring A on approved wall 20 %), ring table, 3D ring fit: approved rings sit 0.6–1.0 u further LEFT (edge error A 52.2 → 1.7 px in the fit); code: `tube.ts` warp hook, `proj05Tunnel.ts` env05 rows / ring atlas, `environment.ts` `E05` layout + `warp05` (upper tunnel only) | a. create `assets/textures/env05/` (wall05e.png, ring05e.png, env05.json) — **files appeared ~00:24 UTC with `tools/env05/proj_bake.py` (step c started), not yet verified in a capture: check a `?env05=1` capture loads before relying on `?match05=1`**; b. probe env05; c. camera-projection bake `tools/env05/proj_bake.py`; d. paddles onto the warped wall → `lids05e.glb`; e. capture + metrics; f. default identity, 04/06/07, ride frames, gameplay, continuity. Also merge the duplicated far-wall block in environment.ts | `env/NOTES.md` |
| benny-character-artist | `benny05` | parts measured (body fur 39 % of region error, crown 26 %, pom 16 %, cuff 15 %, star 4 %); bounding boxes approved vs game; geometry iteration r2 (part IoU all 0.893 → 0.915; pom centre now 428.3 vs approved 428.1); code: new `benny05.ts` (HAT05 geometry, ROLL05 swim-roll damping, MAPS05 table, STAR05), `runtime.ts`, `fur.ts` `#ifdef BENNY05`; `benny.glb` untouched | 1. geometry iteration 3 (star scale/height, crown height, hat tilt); 2. write `work/bake.py` + bake `assets/textures/benny05/*.png` (NOT baked yet — missing maps are tolerated, GLB look kept); 3. re-probe + re-bake; 4. real captures + metrics; 5. 04/06 identity, steering frames, gameplay | `benny/NOTES.md` |
| animation-and-gameplay-engineer | `hud05`, `coins05` | HUD: every element measured approved vs game (bar 4–8 px low + translucent = main error; coin icon 50 px right; numbers 13 px low; banner text 10 % narrow), new hud05 markup/CSS + approved icon sprites `assets/textures/hud05/`, harness; coins: 15 approved coins measured and solved onto the course (`C05M`, every target hit exactly), approved coin face texture `assets/textures/coins05/coin05_face.png`; counter stays live | HUD: tune numbers/banner in the harness, then real captures + metrics, default identity, 04/06; coins: first real capture with `coins05=1`, tilt/thickness/colour check, metrics, gameplay (counter counts up), continuity, ride frames, 04/06 | `hud/NOTES.md`, `coins/NOTES.md` |
| foam-bubbles-particles | `splash05m`, `bub05` | — (wave 2, never launched) | Benny's wake (order part 8) + approved bubbles as real 3D / sprites (part 11) | brief: COORDINATION table above |
| android-build-performance | — | — (last) | experiment APK + performance (parts 18, 19) | |
| reference-match-director / playwright-visual-qa | — | coordinator acts as both | full-frame audit + proof images after integration | |

### Final stop before the transfer (~00:50 UTC) — all three specialists STOPPED cleanly (tsc clean, all behind switches)
* env05: first env05 layout measured in a probe render (mean ring-edge error px STACK → env05): A 53.6 → 6.6, B 27.4 →
  14.4, C 10.6 → 7.6, D 5.9 → 4.7; settings refined afterwards (not yet measured). `assets/textures/env05/` = re-laid-out
  copy of the old atlases only (camera-projection bake NOT run). No env05 game capture yet → no region numbers yet.
  Next: probe → `tools/env05/proj_bake.py` → capture; paddles onto the moved wall (`lids05e.glb`); see `env/NOTES.md` §4.
* hud05: harness only (real hud.ts over the no-HUD capture of the same frame; reproduces the real capture's 62.23 with
  the default HUD): HUD + text 62.2 → 24.76 mean |ΔRGB|, ≈ 13 % → 66 % within 20; whole frame ≈ 34.10 → 30.6. NOT yet
  a real capture. coins05: 15 coins solved onto the course, approved face texture — NOT yet captured. See `hud/`, `coins/` NOTES.
* benny05: geometry iteration (part IoU all 0.893 → 0.921, star bbox now 481–553 × 916–983 vs approved 481–553 × 916–984);
  `benny/work/bake.py` written, NOT run → no baked maps, no look change yet. See `benny/NOTES.md` §4.

---
## RESUMED 2026-11-17 ~01:00 UTC — NEW ACCOUNT, session 01AvQv6S, branch `claude/rainbow-restore-env-setup-bxn85h` — CURRENT
Started from `ccr-694bda6a-x58ntq` @ `4e140fa` (now PROTECTED; the autosave pushes only to the new branch). Everything
above still applies. This session's main session is the coordinator.
* **Environment re-verified, all really run** (`backups/BOOTSTRAP_REPORT.md`, `qa/tools_check/blender_restore_s01Av/`):
  Blender 5.3.0 at `/usr/local/bin/blender` (bpy, Workbench / EEVEE / Cycles renders, 7/7 `.blend`, 3 GLBs, GLB round trip;
  `tools/proj05/lid_blender.py` rebuilt `lids05.glb` byte-identical), Playwright Chromium + WebGL2 (SwiftShader), Node 22,
  Python numpy / Pillow / OpenCV / SciPy, ffmpeg, Android SDK 34 + Java 21. Blender MCP: not possible headless → CLI.
* **Game state at recovery (fresh captures, 2026-11-17 00:45 UTC):** default == `qa/pilot05/current_default_05.png` (0 px);
  protected BEFORE `?ringa=26&nearfloor05=0` == `qa/pilot05/wave9/baseline/05.png` (0 px); STACK == `stack_2340/05_match05.png`
  (0 px). **First real `?match05=1` capture with every specialist part on** = `recovery_s01Av/05_match05_at_recovery.png`
  (it loads; env05 textures load). `tools/match05/metrics.py`, STACK → match05:
  | region | STACK mean / ≤20 | match05 at recovery mean / ≤20 | owner |
  |---|---|---|---|
  | whole frame | 34.10 / 51.6 % | **29.14 / 57.0 %** | |
  | HUD + text | 62.23 / 13.4 % | **24.13 / 65.8 %** (first REAL capture of hud05) | hud05 |
  | coins | 53.96 / 17.6 % | 42.58 / 30.3 % | coins05 |
  | Benny + hat | 49.71 / 23.5 % | 44.31 / 26.0 % (geometry only, maps not baked) | benny05 |
  | gold rings + front frame | 37.74 / 50.0 % | 32.98 / 50.7 % | env05 |
  | purple walls | 53.82 / 21.1 % | 52.85 / 21.1 % | env05 |
  | **side fittings** | 26.85 / 59.7 % | **44.87 / 39.4 % (WORSE: paddles not yet on the moved wall)** | env05 |
  | **distant tunnel + glow** | 29.79 / 45.1 % | **34.53 / 34.2 % (WORSE)** | env05 |
  | water | 9.40 / 88.3 % | 8.73 / 88.9 % | coordinator |
  | foam banks | 8.43 / 92.7 % | 7.99 / 92.9 % | coordinator |
  | wake / splash | 42.61 / 37.9 % | 42.37 / 37.9 % | wave 2 |
  | bubbles | 29.98 / 61.8 % | 29.84 / 61.4 % | wave 2 |
  Seen by eye in that capture: env05 walls show ragged / torn texture edges on the left wall (x 0–260, y 300–720) and the
  right wall (x 690–864, y 150–650); ring B's left arc bulges (not a clean circle); right-side paddles are gone (sunk into
  the moved wall), left paddles float; Benny's beanie has flat stripes (no knit yet), the pom is darker / spikier and the
  body fur hotter pink than approved; only 6 coins read clearly (approved shows the trail on to the vanishing point).
* **Relaunched ~01:00 UTC from brief + NOTES.md (continue from "Remaining", nothing redone):** washer-environment-modeler
  (`env05`), benny-character-artist (`benny05`), animation-and-gameplay-engineer (`hud05`, `coins05`). File ownership as in
  the tables above. Render slots: still 2 game renders at once for everybody (`scripts/lib/pw.mjs`).
* Coordinator next: integration capture of all finished parts in `?match05=1`, the order's deliverables (03_NEW,
  04_DIFFERENCE, 05_OVERLAY, VISUAL_AUDIT.md, metrics JSON, REMAINING_DIFFERENCES.md), then wave 2 (foam-bubbles-particles:
  `splash05m`, `bub05`), last android-build-performance. Nothing is promoted to the default without the user's approval.

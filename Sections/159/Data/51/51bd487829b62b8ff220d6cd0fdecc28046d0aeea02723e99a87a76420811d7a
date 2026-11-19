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

# Rainbow specialists — roster, responsibilities and status

## ▶ Status at the account-8 hand-off (2026-11-16 ~01:15 UTC, branch `ccr-4f6c3e0e-5kxgr0`)
All 10 definitions present and unchanged in `.claude/agents/` (backed up every 5 min). Screen 05 wave 7 =
`qa/pilot05/COORDINATION_WAVE7.md` (strict file ownership, baseline `qa/pilot05/wave7/baseline/05.png`).
| Specialist | Wave-7 assignment | State | Evidence / what is left |
|---|---|---|---|
| water-fx-specialist | 05 near/mid water (`src/vfx/waterRibbon.ts`, `glsl.ts`) | **DONE** (6 iterations, kept it06) | `qa/pilot05/wave7/water/NOTES.md`, `it06/05_side_by_side.png`; whole-frame mad 59.0→55.4; 06/07 pixel-identical. Left: near highlight p95 225 vs ref 247, glints 88 vs 166, sweep starts ~20 px too far inside |
| foam-bubbles-particles | 05 foam rims (`src/vfx/foam.ts`, `bubbles.ts`) | **DONE** (6 iterations, kept it06) | `qa/pilot05/wave7/foam/NOTES.md`; right heap coverage 35.1→21.3 % (ref 14.0 %); 06/07/08 pixel-identical. Left: near clumps less blue (36 vs 48 %), lower-left clump touches frame edge, no rims in the far forced-tunnel strip (path-camera) |
| washer-environment-modeler | 05 rings, walls, lids, VP, near gold frame corners | **DONE** (6 iterations, kept it06) | `qa/pilot05/wave7/environment/NOTES.md`, `it06/05_side_by_side.png`: band-shaded rose-gold rings with spot lights, de-swirled slot walls (10 rows/bay), copper pucks, continuous warm VP throat, NEW 3D near gold frame (05 only). 06/07/08 pixel-identical; 04 changes only inside its far window onto 05 (0.82 % of pixels at ΔRGB>24, `qa/pilot05/wave7/handoff/04_diff_vs_wave6.png`). Left: walls too violet (70–80 % vs ref 29–46 %) → pinker metal; VP core slightly small/orange; ring 2 at y198 vs ref 170 + extra far ring (path-camera block, `qa/pilot05/REQUESTS.md`); lids a bit flat. Marble spacing cue (≈0.9 × R) NOT adopted: approved image wins (ring 1 already matches) |
| path-camera-transition-engineer | far river at the VP (y 470–560 still 06-style straight stripes), far foam rims | **NOT STARTED** (camera + course LOCKED by coordinator) | next wave |
| reference-match-director / playwright-visual-qa | whole-frame review + before/after report | **NOT STARTED** this account | run after the environment wave lands |
| benny-character-artist | Benny preserved as is (wave-5 GLB) | idle | — |
| cartoon-girl-character-artist, animation-and-gameplay-engineer, android-build-performance | not needed for 05 | idle | Android build last verified on account 6 |

Definitions live in `.claude/agents/<name>.md` (copied unmodified from the user's kit, then backed up
every 5 minutes). These are **custom Claude Code project subagents**, not third-party plugins.
Status is updated by Claude as work lands; "outputs" lists real files only.

| # | Agent file | Responsibility | Outputs so far | Remaining |
|---|---|---|---|---|
| 1 | `reference-match-director.md` | Locked-reference audit, per-scene landmarks, ranked fix lists | `docs/reference_inventory.md` (planned) | Inventory + per-scene comparison triage |
| 2 | `benny-character-artist.md` | ONE Benny rig: pink fur, violet eyes, purple/white knit beanie, pom-pom, gold star, paw pads | — | `assets/models/benny.glb`, turntables |
| 3 | `cartoon-girl-character-artist.md` | ONE official cartoon girl rig (curly ponytail, purple star bow, hoops, striped hoodie, star jeans, star sneakers) for 01/10/11 | — | `assets/models/rainbow_girl.glb`, turntables, intro/outro poses |
| 4 | `washer-environment-modeler.md` | Perforated magenta drums/tunnels, gold rings, nozzles, chrome door, platform, laundry room | — | environment modules + GLB export |
| 5 | `water-fx-specialist.md` | Real-time cyan/hot-pink spline water shader, crests, 07 plunge, final wave, towel entry | — | `src/vfx/water*` |
| 6 | `foam-bubbles-particles.md` | Iridescent bubbles, foam banks, splashes (instanced, mobile budgets) | — | `src/vfx/bubbles*`, `src/vfx/foam*` |
| 7 | `path-camera-transition-engineer.md` | Master spline with absolute altitudes; 07 deep plunge → 08 inlet; camera | — | `src/world/course*`, continuity proof |
| 8 | `animation-and-gameplay-engineer.md` | Swim/tumble, girl walk/towel, steering, coins, hearts, pause, HUD | — | `src/gameplay/*`, `src/ui/*` |
| 9 | `playwright-visual-qa.md` | Real WebGL captures 01–11, side-by-sides, overlays, control tests | — | `screenshots/`, `qa/` |
| 10 | `android-build-performance.md` | Capacitor Android build, GLB/texture/shader budgets, measured perf | — | `android/`, `docs/BUILD_ANDROID.md`, `qa/performance.md` |

Dependency order (from the master prompt): character identity lock → geometry/path + water →
lighting/polish → screenshots and device QA.

No additional Rainbow agents or project skills exist yet.

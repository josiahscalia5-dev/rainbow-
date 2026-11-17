# Rainbow specialists — roster, responsibilities and status

## ▶ ACCOUNT TRANSFER 2026-11-17 ~00:25 UTC (session 018Sg3AU, branch `ccr-694bda6a-x58ntq`)
Screen 05 full reference match. INTERRUPTED (were running): washer-environment-modeler (`env05`, `env/NOTES.md`), benny-character-artist (`benny05`, `benny/NOTES.md`), animation-and-gameplay-engineer (`hud05` + `coins05`, `hud/NOTES.md`, `coins/NOTES.md`) — all under `qa/pilot05/full_reference_match/`. Done / not done per specialist: COORDINATION.md section "STATE AT ACCOUNT TRANSFER 2026-11-17". Relaunch each from `qa/pilot05/full_reference_match/briefs/<agent>.md` + its NOTES.md. 10/10 definitions present, SHA-256 unchanged.


**Machine-readable roster: `backups/AGENTS_STATUS.json`** (name, file, SHA-256, state, unfinished work, next
assignment) — `scripts/claude-bootstrap.sh` checks it at every session start. Update the JSON whenever a specialist's
state changes. Check 2026-11-16 ~11:05 UTC (session `01Kbt6BT`, branch `ccr-251ed97c-ty2xvp`): 10/10 definitions
present, SHA-256 unchanged, none running; assignments unchanged from wave 9b below.

## ▶ NOW: wave 9b (2026-11-16 from ~09:50 UTC, session `012NR93N`, branch `ccr-44f84024-ii5iih`) — read `qa/pilot05/COORDINATION_WAVE9B.md`
**User decisions 2026-11-16 ~10:20 UTC:** (1) Google Flow videos cover the opening and ending — do not rebuild 01 / 02 / 11
as detailed 3D; (2) specialists work on PLAYABLE screens 03–09: Screen 05 first, then 03, 04, 06, 07, 08, 09;
(3) Screen 05: the BEFORE picture (`qa/pilot05/wave9/baseline/05.png`) is the preferred baseline — the oval / big
tunnel is REJECTED; controlled tests only, one geometric factor at a time, always shown approved | BEFORE | NEW.
* `src/` was restored to BEFORE (aa35c8a; fresh 05 capture pixel-identical to the baseline). Wave 9 below is therefore
  NOT in the working game: its unfinished edits are in `qa/pilot05/wave9b/not_merged/*.patch` and in git history.
* No specialist is running. All ten definitions are present and unchanged.
* Each specialist's unfinished wave-9 code is a labelled patch in `qa/pilot05/wave9b/not_merged/` (README: what is
  finished, what may be reused, how to apply one piece as a test). Restart a specialist from its own
  `qa/pilot05/wave9/<name>/NOTES.md` + its patch — never redo foam it06 or the far coin trail from scratch.
* Next for Screen 05: the user's answer on test T1 (front ring), then T2 / T3 (COORDINATION_WAVE9B.md). When a
  specialist is launched for 05 it gets ONE test at a time under those rules (URL switch, default build unchanged).
* After 05: one specialist per screen for 03, 04, 06, 07, 08, 09 (reference-match-director first for a ranked
  difference list per screen), never several screens at once without the user's go-ahead (credits).
| Specialist | State | Wave-9 work (not merged) that may return as its own test |
|---|---|---|
| washer-environment-modeler | idle | oval K 1.7 + bank floor + shift — rejected by the user; do not reuse |
| path-camera-transition-engineer | idle | it01 far coin trail into the light (kept by the specialist) — candidate test, WITHOUT the oval far section |
| water-fx-specialist | idle | it01/it02 measured worse than baseline on its own metric — do not reuse as is |
| foam-bubbles-particles | idle | it06 (wake bands, lacy splash; A/B neutral) — candidate test |
| reference-match-director, playwright-visual-qa | idle | — |
| benny-character-artist, cartoon-girl-character-artist, animation-and-gameplay-engineer, android-build-performance | idle | — |

## (superseded) Wave 9 — stopped mid-iteration ~02:45 UTC, NOT in the working game since wave 9b
### Wave 9 as launched (started 2026-11-16 ~02:35 UTC, recovery session `01Kbt6BV`, branch `claude/rainbow-3d-account-recovery-xex5hc`)
Wave 8 (below) STOPPED mid-iteration when that Claude account ran out of credits (last save aa35c8a 02:08 UTC): water it05/it06,
foam it05, environment it02, path-camera it02 (empty log). Their edits are in the code; recovered code passes tsc,
continuity and the gameplay test. Wave 9 = each of the four CONTINUES its own wave-8 work. Brief:
`qa/pilot05/COORDINATION_WAVE9.md`; baseline `qa/pilot05/wave9/baseline/{03..08}.png` (recovered 05: mad 50.6,
hue 0.875, edge 0.195 vs approved).
| Specialist | Wave-9 assignment | If this session ends before it reports |
|---|---|---|
| washer-environment-modeler | lids → rounded gold pucks (biggest mismatch), pinker magenta walls + Marble wall textures, yellow-gold rings, VP glow | read `qa/pilot05/wave9/environment/NOTES.md` + newest `itNN/`, relaunch with the same brief |
| path-camera-transition-engineer | far river S-bends into the VP, far coins (≈8–10), far ring depths, far foam rims | `qa/pilot05/wave9/path-camera/NOTES.md`; run tsc + continuity + gameplay test |
| water-fx-specialist | broad pink S-ribbons through the mid river, deeper glossy cyan, near flares + glints | `qa/pilot05/wave9/water/NOTES.md` |
| foam-bubbles-particles | sphere heaps → fine bubble banks, natural splash, soap bubbles | `qa/pilot05/wave9/foam/NOTES.md` |
Next after wave 9: reference-match-director + playwright-visual-qa review (approved | recovered | after); android-build-performance APK rebuild.

## ▶ Wave 8 STOPPED (credits ran out ~02:08 UTC; started 2026-11-16 ~01:47 UTC, session `94cf04e3`, branch `ccr-937c7fbb-htsrgt`)
Brief: `qa/pilot05/COORDINATION_WAVE8.md`; baseline `qa/pilot05/wave8/baseline/{04..08}.png`.
| Specialist | Assignment | If this session ends before it reports |
|---|---|---|
| path-camera-transition-engineer | far river S-bends into the VP, far coins, far ring depths, far foam | read `qa/pilot05/wave8/path-camera/NOTES.md` + newest `itNN/`, run tsc + gameplay test, relaunch with the same brief from where it stopped |
| washer-environment-modeler | rings (bright gold read), walls (less violet), lid shape, VP core, near-frame gold share; Marble pano as PMREM reflections **on 05 materials only**; Marble wall textures | read `qa/pilot05/wave8/environment/NOTES.md` + newest `itNN/`, relaunch likewise |
| water-fx-specialist (wave 8b, ~01:51) | thick glossy cyan-and-pink S-shaped near/mid river, wide pink S-bands, highlights + glints | `qa/pilot05/wave8/water/NOTES.md` |
| foam-bubbles-particles (wave 8b, ~01:51) | fine low small-bubble foam banks (not sphere heaps), natural splash fan from Benny, soap bubbles | `qa/pilot05/wave8/foam/NOTES.md` |
Next after wave 8: foam-bubbles-particles (white sphere heaps → fine bubble rims), water polish, then
reference-match-director + playwright-visual-qa review; coordinator: bloom strength (Game.ts) review.

## ▶ Transfer-session check (2026-11-16 ~01:30 UTC, session `94cf04e3`, branch `ccr-937c7fbb-htsrgt`)
All 10 definitions present, SHA-256 unchanged (list in `backups/CLAUDE_ACCOUNT_TRANSFER.md` §3).
washer-environment-modeler: **wave 7 DONE** (log written 01:23 UTC, merged from `7cc4869`): `it06` kept
(whole-frame mad 59.0 → 51.2; Benny+near water 63.8 → 46.7); regression 06/07/08 pixel-identical; handoff capture
`qa/pilot05/wave7/handoff/`; next-wave list = "Left undone" in `qa/pilot05/wave7/environment/NOTES.md`.
Code passes tsc, continuity and the browser gameplay test (re-run 01:28 UTC). Next to launch:
path-camera-transition-engineer (far river/VP + far-ring request in `qa/pilot05/REQUESTS.md`), then
reference-match-director + playwright-visual-qa; android-build-performance last (APK predates waves 4–7).
Relaunch list + reasons: transfer guide §3.

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

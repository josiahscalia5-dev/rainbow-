# Rainbow specialists — roster, responsibilities and status

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

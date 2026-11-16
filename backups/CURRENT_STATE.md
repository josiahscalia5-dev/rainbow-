# Rainbow — CURRENT STATE (handoff)

> **Newest (2026-11-16 ~11:15 UTC, session `01Kbt6BT`, branch `ccr-251ed97c-ty2xvp`):** permanent recovery + backup
> system — `scripts/claude-bootstrap.sh` runs at every session start. Current state, tests and next tasks:
> `backups/CLAUDE_ACCOUNT_TRANSFER.md` (top section) and `backups/BOOTSTRAP_REPORT.md`. The sections below are history.

## ▶ Account-transfer backup (2026-11-16 ~01:30 UTC, session `94cf04e3`) — read this first
| | |
|---|---|
| **Working branch** | `ccr-937c7fbb-htsrgt` — contains all 9 earlier branches incl. `ccr-93add0fa-q17ey6` 08fb461 and `ccr-4f6c3e0e-5kxgr0` 8d7464b (merged). Account 8 was still saving to `ccr-4f6c3e0e-5kxgr0` in parallel: merge any newer tip with `scripts/resume-newest-work.sh` |
| Verified | fresh-clone LFS download 24/24 SHA OK; refs 12/12; 10 agents; tsc OK; continuity ok (gaps 0, drop 61.19); gameplay test pass (plunge 61.41, errors []) |
| Handoff docs | `backups/CLAUDE_ACCOUNT_TRANSFER.md` (§0 first), `backups/START_NEW_CLAUDE_ACCOUNT.md` |
| World Labs | nothing spent; World API key not in this session's environment; Atlas `list_projects` OK |

## ▶ Account 8 update (2026-11-16, session `7c0df0fc…`) — read this first
| | |
|---|---|
| **Working branch** | `ccr-4f6c3e0e-5kxgr0`; contains account 7's newest commit `6cf0b4f` (`ccr-93add0fa-q17ey6`, 00:34 UTC autosave) — verified ancestor, nothing lost |
| Protected (autosave never pushes) | as before, plus `ccr-93add0fa-q17ey6` and `claude/rainbow-3d-account-transfer-syorak` |
| Cloud environment (account 8) | personal "rainbow-", **unrestricted** network, setup script saved, **no network secrets** (the exposed account-7 Marble key is not here) |
| Verified here | LFS 9/9 (fsck OK) after clearing a stale `lfs.<url>.access=basic` (fixed in `scripts/autosave-hook.sh`); refs 12/12; `npm ci` + `tsc` OK; gameplay test pass (victory, heart loss, plunge 61.41, errors []); continuity gaps 0; Blender 5.3.0; 10 agents present |
| World Labs | Atlas connector connected (`list_projects` OK, nothing run). Marble: see `qa/worldlabs/05/MARBLE_ACCESS_2026-11-16.md` — web-app world not reachable without a new World API key + world ID, and API support for web-made worlds is unconfirmed. User's Marble screenshot stored in `qa/worldlabs/05/marble_user_world/` |
| Screen 05 | wave 7 = execution of the wave-6b plans: `qa/pilot05/COORDINATION_WAVE7.md`, baseline `qa/pilot05/wave7/baseline/05.png`. Environment, water and foam DONE (whole-frame mad 59.0 → 51.2) (`backups/AGENTS_STATUS.md`) |
| Marble pilot (user-approved, max US$5) | website world 404 via API; generated draft + full world from the approved 05 image; 1,810 credits spent, balance 5,190; all assets in `qa/worldlabs/05/pilot/` (LFS) |
| **Hand-off** | **`backups/CLAUDE_ACCOUNT_TRANSFER.md`** + paste prompt `backups/START_NEW_CLAUDE_ACCOUNT.md` |

## ▶ Account 6 update (2026-11-15, session `025fdfec…`) — read this first
| | |
|---|---|
| **Working branch** | `claude/rainbow-3d-account-transfer-syorak`, first commit on `3c0fe33` = the newest commit of account 5's `ccr-e033f912-8b40f5` (21:18 UTC autosave, 3 autosaves after `d6ab3a2`). Verified after `git fetch --unshallow`: contains `81e639e`, `b83b7e0`, `8a36270`, `648f531`, `3c0fe33`. Nothing pushed was lost |
| Gap | account 5's work after 21:18:54 UTC never reached GitHub (no autosave between 21:18 and the end of that session). Lost: the four wave-4 specialists' last minutes, incl. the foam specialist's final report (49 %/44 % bank width) and any NOTES.md |
| Protected (autosave never pushes) | `ccr-6f431adf-7h0m8y`, `claude/rainbow-3d-recovery-m4v347`, `ccr-d4bb0ad3-8ycajb`, `ccr-8b6fc834-7kd55l`, and since account 6 `ccr-e033f912-8b40f5` |
| Cloud environment (account 6) | personal **"rainbow-"**: limited network + package registries + `download.blender.org`, `dl.google.com`, `api.atlas.worldlabs.ai`. Setup script = `scripts/cloud-env-setup.sh` (LFS pull, Blender, Android SDK, World Labs plugin); saved, unproven until a fresh container starts |
| Verified here | LFS 6/6 SHA == oid; refs 12/12 SHA OK; manifest 419/419 present; `tsc` OK; continuity ok (drop 61.19, gaps ≈ 0); gameplay test pass (2139 steps, 91 coins, plunge 61.41, pause/resume, heart loss, victory 11); `assembleDebug` BUILD SUCCESSFUL (APK 7.29 MB, both GLBs; not run on a device); Blender 5.3.0 opens `screen05_layout.blend`; `tools/blender/import_world_asset.py` dry run OK |
| World Labs | claude.ai connector **World Labs Atlas** connected (11 tools); `list_projects` OK since ~22:20 UTC (after the user re-signed in): project "My project" (Personal workspace), credits available, 6 task tools (atlasChisel, atlasGenerate, atlasTextToImage, images2PosedRGBD, posedImages2Splats, splats2Mesh); nothing run. Plugin 0.2.2 installed for its skills; its duplicate MCP copy disabled (`scripts/setup-worldlabs-plugin.sh`, in the env setup script). `.ply`/`.spz` now LFS-tracked for Marble exports. Nothing spent. Meshy / Rodin: not connected |
| Flow video | integration intact (`src/ui/cinematicVideo.ts`, muted, cover/fill, no bars); **no real Flow MP4 in the repo yet** |
| Screen 05 | wave 5 — `qa/pilot05/COORDINATION_WAVE5.md` (measured baseline, owners, rules). Found: the game loads a stale `benny.glb` (19:39) so Benny's later build.ts edits were invisible |
| QA tool | `scripts/screen_report.py NN OUT LABEL=capture …` → side-by-side, 50 % overlays, red difference-highlight overlays, raw metrics per frame band |

---

## ▶ Account 5 update (2026-11-15, session `d8784a51…`) — read this first
| | |
|---|---|
| **Working branch** | `ccr-e033f912-8b40f5`, created from `648f531` (newest commit of account 4's `ccr-d4bb0ad3-8ycajb`). Verified after `git fetch --unshallow`: it contains the original `81e639e`, recovery `b83b7e0`, `ccr-8b6fc834-7kd55l` `8a36270` and `ccr-d4bb0ad3-8ycajb` `648f531`. Nothing lost |
| Protected (autosave never pushes) | `ccr-6f431adf-7h0m8y` (original), `claude/rainbow-3d-recovery-m4v347` (recovery), and since account 5 also `ccr-d4bb0ad3-8ycajb`, `ccr-8b6fc834-7kd55l` |
| Cloud environment (account 5) | New personal environment **"rainbow-"** on this account (the old one belonged to the previous account). Network: limited + package registries + `download.blender.org`, `dl.google.com`, `api.atlas.worldlabs.ai`. Setup script = `scripts/cloud-env-setup.sh` (saved; unproven until a fresh container starts) |
| LFS | Fresh clones get pointer stubs; `git lfs pull` restored all 6 binaries (SHA == LFS oid). The SessionStart hook now pulls LFS before its first backup, and the manifest records LFS oids for stubs (a pre-pull backup had written stub hashes into `MANIFEST.json`; fixed) |
| Tools verified here | Blender 5.3.0 headless (opened `qa/worldlabs/05/blender/screen05_layout.blend`: River05 8 625 verts, CyanCore05 curve, 13 ring markers 6 u apart, Tunnel05, Benny05_marker; no camera). Android SDK 34 + build-tools 34.0.0. Playwright/Chromium (SwiftShader). World Labs plugin 0.2.2 installed |
| World Labs Atlas | Endpoint reachable but `401 Authentication required`; no World Labs connector on this account, so `list_projects` could not run. Nothing spent |
| Meshy / Rodin | Not connected on this account. Nothing spent |
| Screen 05 | Wave 4 (see `qa/pilot05/COORDINATION_WAVE4.md`): camera LOCKED; coordinator rebuilt the 05 coins; four specialists (environment, water, foam, Benny) running with strict file ownership |

---
_Below: earlier state, last updated by Claude: 2026-11-15 ~18:50 UTC, recovery session `e0f002d9…` (second Claude account)._

## Where the project lives
| | |
|---|---|
| Repository | https://github.com/josiahscalia5-dev/rainbow- (private) |
| **Working branch** | `claude/rainbow-3d-recovery-m4v347` — started from `81e639e`; all new work and the 5-minute autosave go here |
| Original branch | `ccr-6f431adf-7h0m8y` @ `81e639e` — frozen copy of everything from the first account; never pushed to (autosave `protected_branches`) |
| Cloud environment | claude.ai environment **"rainbow-"** (personal). Setup script approved 2026-11-15 (copy: `scripts/cloud-env-setup.sh`): `git lfs pull`, Android SDK platform 34 + build-tools 34.0.0, Blender 5.3.0, World Labs plugin. Not yet proven on a fresh container. Network: unrestricted (set by the user) |

## What Rainbow is
A brand-new, isolated, portrait **real-time 3D mobile game** (Three.js r170 + TypeScript + Vite, Capacitor
Android). Benny — pink fluffy mascot in a purple/white knit star beanie — is hidden in a purple towel,
dropped into a washer by the official cartoon girl, rides one continuous water route through the machine
and hides back under the towel, which the girl lifts out without seeing him.

## Locked, approved constraints (unchanged)
* Exactly 11 screens: 01 Inside the Washing Machine · 02 Whirlpool Tumble · 03 Whirlpool Twirl · 04 Through
  the Five Arrows · 05 Flow Into the Current · 06 Crest the Rinse Arch · 07 Dive the Washer Tube · 08 Final
  Spin Chamber · 09 Ride the Final Wave · 10 Slide Into Hiding · 11 Safely Home (`FINAL SPIN COMPLETE`).
* 01–02 cinematic, 03–10 interactive ride, 11 victory. References in `references/` and
  `character_references/` are immutable (12/12 SHA-256 OK, re-verified 2026-11-15).
* Official cartoon girl (one model) in 01, 10, 11; Benny never changes; 07 → 08 is a real continuous
  plunge (61.18 units, no cut).
* Paid generators (World Labs, Meshy, Rodin) only after the user approves a shown cost.
* NEW (user, 2026-11-15): the opening is being made by the user in **Google Flow**; the app plays it as a
  silent video and hands over to real-time 3D (done — see below). An ending Flow video is optional.

## Verified state (2026-11-15, this session)
| Area | Status | Evidence |
|---|---|---|
| Recovery | everything up to `81e639e` recovered; nothing was lost (the old session's last edit is in that commit) | git history, transcript |
| Autosave | working on the recovery branch: daemon pushes at 18:15, 18:20, 18:25 … verified remote == local | `backups/BACKUP_LOG.md` |
| LFS assets | `benny.glb` 1.18 MB, `rainbow_girl.glb` 3.55 MB, kit ZIP, APK restored; SHA-256 == LFS oid | `git lfs fsck` OK |
| Game | both GLBs load in the live game (no console errors); `tsc` OK; `vite build` OK | Playwright capture log |
| Continuity | `npm run test:continuity` → ok, verticalDrop 61.18, all stage gaps ≈ 0 | `qa/continuity_report.json` |
| Android | `assembleDebug` BUILD SUCCESSFUL (SDK 34), APK 7.34 MB with both GLBs; not run on a device | `scripts/setup-android-sdk.sh` |
| Flow videos | `public/video/intro.mp4` / `ending.mp4` supported, cross-fade into live 3D; `npm run test:cinematic` pass (WebM in headless Chromium; MP4 needs a device check) | `docs/FLOW_VIDEO.md`, `qa/cinematic_test.json` |
| Specialists | all 10 in `.claude/agents/`, byte-identical to the original kit, load as project agents | `backups/AGENTS_STATUS.md` |

## Tools
| Tool | Status |
|---|---|
| GitHub | working (push verified) |
| Playwright / Chromium (SwiftShader WebGL2) | working; Playwright MCP connected |
| Blender 5.3.0 | installed, headless (`blender -b --python …`) verified. Blender MCP not used (needs Blender's GUI add-on) |
| Android SDK | platform 34, build-tools 34.0.0, Gradle 8.2.1 wrapper — build OK |
| World Labs Atlas | claude.ai connector attached, 10 tools load; **account not active yet** ("no active Atlas account"); plugin `worldlabs@worldlabs` 0.2.2 installed. Nothing spent. Pilot plan: `qa/worldlabs/05/PILOT_PLAN.md` |
| Meshy / Hyper3D Rodin | not connected (needs accounts, keys and cost approval) |

## Work in progress (2026-11-15)
* **Screen 05 pilot (manual build B)** — specialists working in parallel on the same tree:
  path-camera (straight tunnel + camera), washer-environment-modeler (magenta perforated walls, evenly spaced
  gold rings, lids), water-fx-specialist (wide cyan/pink current, foam, splash), benny-character-artist
  (body vs beanie proportions). Evidence goes to `qa/pilot05/<specialist>/`.
* **World Labs pilot (A)** — waiting for the user's Atlas account; inputs ready in `qa/worldlabs/05/`.
* Missing docs: `docs/reference_inventory.md`, `qa/scene_comparisons.md` (reference-match-director, in
  progress); `qa/report.md` (playwright-visual-qa), `docs/BUILD_ANDROID.md`, `qa/performance.md`
  (android-build-performance) — second wave after the Screen 05 work.

## Known issues / priorities
1. All 11 live screens still differ clearly from the references (crude metrics in `qa/compare_summary.md`;
   edge correlation ≈ 0 everywhere). Priority order: 05 pilot → apply the method to 04/06/07 → 08–11.
2. Characters are animated by node transforms, not skinned skeletons (0 skins in both GLBs).
3. No Blender source files exist yet (models are procedural code → GLB).
4. MP4 Flow-video playback and FPS must be verified on a real Android device.

## Resume instructions
Open the repo on `claude/rainbow-3d-recovery-m4v347`, read this file, `backups/AGENTS_STATUS.md`,
`qa/worldlabs/05/PILOT_PLAN.md` and the newest `backups/claude-sessions/*/transcript.md`, then continue
with the first open item above.

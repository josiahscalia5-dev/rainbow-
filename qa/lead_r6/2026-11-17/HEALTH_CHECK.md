# Rainbow system health check — 2026-11-17 ~22:15–22:22 UTC (lead `session_01VCMXoaUqBCxDq8BntT19BU`, account 6)

Read-only checks only (free API reads, no paid job, no merge). Current lead branch: **`ccr-4bd35b15-7z45t0`** (from the
r5 lead `ccr-f983b317-2vt0zh` @ `cbc57135`, which has had no new commits since 21:41).

| Component | Installed | Connected | Tested working | Running / paused | Action needed |
|---|---|---|---|---|---|
| World Labs Marble API | key = env network secret (`api.worldlabs.ai`, `WLT-Api-Key`) | yes | yes: `/credits` 200 → **5,420** credits = ORIGINAL Screen 08 account; world `32b5b2f4…` "rainbow-08-final-spin-chamber" 200; 05 pilot worlds `5fd3d7a7` / `c0c9dc57` 404 (they belong to the OTHER account, last known 5,190) | — | none; the 5,190 account's key is not on this environment (only needed to re-read the 05 pilot worlds online; their files are in Git LFS) |
| Marble asset download host `cdn.marble.worldlabs.ai` | — | **no** (proxy CONNECT 403: not in the environment allow-list) | no | — | optional: add the host only if a re-download is needed; 08 world splats/mesh + 05 pilot splats/PLY/colliders are already in Git LFS |
| World Labs plugin `worldlabs@worldlabs` | yes (4 skills loaded) | n/a | skills load; `worldlabs` CLI not on PATH | — | none (CLI only needed for Atlas jobs) |
| World Labs Atlas connector | claude.ai connector | yes | `list_projects` → 1 project, credits available | — | optional, not needed (separate sign-in; never use for paid jobs without OK) |
| fal.ai | key = env network secret (`queue.fal.run`, `Authorization`) | yes | request `01a1ea70` status 200 COMPLETED + result 200 (same paid account); output host `v3b.fal.media` 200; bogus id → 404 (auth ok) | — | balance: API hosts `rest.alpha.fal.ai` / `api.fal.ai` blocked → check the fal dashboard |
| Specialist sessions → keys | same environment `env_01LN2RLuvitKKXx9z4iJoMN5` | yes | both secrets are environment-wide | — | none |
| GitHub | git proxy + GitHub MCP | yes | push to own branches OK; MCP list/create PR OK (draft #20) | — | none |
| Playwright MCP (`plugin:playwright`) | yes | yes | live WebGL2 test OK (Chromium 153, SwiftShader) | — | none |
| parallax-threejs MCPs (playwright / chrome-devtools / threejs-devtools) | yes | yes | listed, not exercised | — | optional |
| context7 MCP / spector MCP | yes | **no** (ERR_PROXY_TUNNEL / connection closed) | no | — | optional, not needed |
| Playwright library (game QA) | Chromium 157 preinstalled | n/a | yes: all round-6 captures, WebGL2 SwiftShader | — | none |
| Node / npm / Vite / TypeScript / Three.js / Capacitor | Node 22.23.5, npm 10.9.9, Vite 5.4.21, TS 5.9.3, Capacitor 6.2.3 | n/a | `tsc --noEmit` clean | — | none |
| Blender | 5.3.0 | n/a | headless `bpy` OK | — | none |
| Python QA libs, ffmpeg, ImageMagick | numpy 2.5.3, Pillow 12.3, cv2 5.1, scipy 1.18, ffmpeg 6.1.1, IM 6.9.12 | n/a | used this round | — | none |
| Android SDK 34 / build-tools 34 / Java 21 / Gradle 8.2.1 | yes | n/a | **APK build FAILS**: Maven Central answers intermittently 404 through this network (same file 200, 200, 404 within seconds; repo1 mirror too) | — | infrastructure; retry later / different network. Not a game defect |
| Image-Blaster | setup script + local patch in repo | n/a | checkout absent (installed on demand) | — | none now |
| Git / Git LFS | git 2.43, git-lfs 3.4.1 | yes | 75 distinct objects, 920 MB, 0 missing, `fsck` OK on 13 tips | — | none |
| Autosave hooks | SessionStart / PreCompact / Stop / SessionEnd | n/a | lead `AUTOSAVE OK (match)`; S06 + S08 branches autosaving every ~5 min | active on 3 sessions | none |
| 13 approved references | yes | n/a | `sha256sum -c` 13/13 OK | — | none |
| 10 agent definitions | yes (`.claude/agents/`) | n/a | frontmatter valid, SHA-256 = record, all offered as agent types | no in-process subagent running; 2 cloud sessions use the washer-environment-modeler / water-fx roles | none |

## Seven workstreams
| Workstream | Branch | Newest commit | Session | Received brief | Activity | Next milestone | Autosave |
|---|---|---|---|---|---|---|---|
| 06 Rinse Arch | `claude/rainbow-s06-match-c6` | autosave `8d398006` 22:15 (code in progress: `tools/match06/fit_water06.py` …) | `session_01VCMXobyXNaU99Bgt9q6WBM` RUNNING | yes | "river geometry + texture in; running moving audit" | M2-r6 (r6 `S06.md`) | yes (3 since start) |
| 08 scenery in motion | `claude/rainbow-s08-scenery-c6` | `fb6e35ac` 22:12 (m08arch) + autosave 22:19 | `session_01VCMXobk8x9PXbYb8rpUaPP` RUNNING | yes | "tuning arch push, checking view drift"; restored m08fill lost on -c5 | round 2 (r6 `S08_SCENERY.md`) | yes (5 since start) |
| 08 Benny | `claude/rainbow-s08-benny08-bake-c5` @ `ae7abe5b` | real `c6892676` 20:41 | none | — | paused | user's visual verdict on r6, then pale streaks / outline / pom tips | n/a (no session) |
| 08 camera | `claude/rainbow-s08-camclear-c5` @ `18687513` | real `aa10fdbb` 19:13 | none | — | paused | phone verdict on r4 | n/a |
| 07 Washer Tube | `claude/rainbow-s07-match-c5` @ `835a72db` | real `fd703ee1` 19:36 | none | — | paused | M3 + whole tube + plunge + x07 fix | n/a |
| 05 Flow (line B) | `claude/rainbow-s05-match-c5` @ `ebaf6cac` | real `a96bfdf4` 17:58 | none | — | paused | M3 (matched beyond ~20 u) | n/a |
| 04 Five Arrows | `claude/rainbow-s04-match-c5` @ `d1e422fa` | real `a4644789` 17:54 | none | — | paused | M4 (world-anchored walls / water beyond ~6 u) | n/a |
Preview: `claude/rainbow-preview-all-c5` @ `965e4ef9` (unchanged) and `claude/rainbow-preview-all-c6` @ `41ea6618` (08 fix) —
test only, not merged. No `-c5` branch has had a commit since 21:41 → no old-account writers.
Usage: the account reports `seven_day / allowed_warning` (resets ≈ 2026-11-23) → keep two sessions maximum.

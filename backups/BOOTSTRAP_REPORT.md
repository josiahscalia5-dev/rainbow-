# Rainbow bootstrap report — BOOTSTRAP OK

Generated 2026-11-16 15:56 UTC by `scripts/claude-bootstrap.sh` (mode `check`) on branch `claude/rainbow-05-water-projection`.
The commit that contains this file is the backup itself, so its SHA is not written here; use `git log -1 -- backups/BOOTSTRAP_REPORT.md`.

| Step | Result | Details | s |
|---|---|---|---|
| Repository + branch | OK | josiahscalia5-dev/rainbow- on claude/rainbow-05-water-projection @ 7b9b2cf (session started from claude/rainbow-3d-account-recovery-hfb8p0) | 0 |
| Resume newest work | OK | 15/15 remote ccr-*/claude/* branches contained in HEAD 7b9b2cf | 1 |
| Backup gap since last session | OK | previous save on GitHub: 088dd3f 2026-11-16 13:37 UTC (daemon) on ccr-451ea8c7-3nqlis, claude/rainbow-05-water-projection, claude/rainbow-3d-account-recovery-hfb8p0; previous session ended WITHOUT an end-of-session backup (its environment closed after an automatic save); 9 gap(s) > 10 min in the last 72 h of the autosave log, longest 11-16 03:22-09:28 UTC (6.1 h) | 0 |
| Git LFS binaries (local) | OK | 26/26 real files (models, APK, kit ZIP, Marble splats/PLY/colliders/.blend), git lfs fsck OK | 1 |
| Git LFS on GitHub | OK | 26/26 LFS objects (199 MB, 17 Marble/World Labs) confirmed on GitHub LFS | 0 |
| Approved references | OK | 13/13 byte-identical (scripts/reference.sha256, incl. the official cartoon-girl reference) | 0 |
| Game: 11 screens + code | OK | 11 approved screen references 01-11, source tree src/ (41 files), Android project android/, characters assets/models/*.glb | 0 |
| Specialist agents | OK | 10/10 specialist definitions present; all SHA-256 unchanged; running: washer-environment-modeler (SPECIALIST 1: Screen 05 camera-matched water texture projection, branch claude/rainbow-05-water-projection; if this session ended it is INTERRUPTED: relaunch with qa/pilot05/proj/BRIEF_SPECIALIST1_VERBATIM.md) | 0 |
| Marble World Labs assets | OK | both worlds complete: 49 files checked, 15 real LFS binaries (splats/PLY/colliders/.blend), 71 files tracked under qa/worldlabs; credits spent 1810 of cap 6250 | 1 |
| World Labs integration | OK | Marble API key authenticated (free read: 5190 credits); worlds draft 200, full 200; no paid job started; plugin worldlabs@worldlabs installed; Atlas connector = claude.ai connector (check in Claude: ToolSearch World_Labs_Atlas); no paid job started | 1 |
| Node.js | OK | v22.23.4, npm 10.9.9 | 0 |
| npm dependencies | OK | node_modules up to date with package-lock.json (npm ci skipped) | 0 |
| Python QA libraries | OK | Python 3.13.18; required numpy+Pillow OK; optional cv2+scipy OK | 0 |
| Playwright + Chromium | OK | headless Chromium 153.0.8010.12 with WebGL2 (SwiftShader); preinstalled, never reinstall | 0 |
| ffmpeg / ImageMagick | OK | ffmpeg 6.1.1-3ubuntu5, ImageMagick 6.9.12-98 (Flow video + image checks) | 0 |
| Blender | OK | Blender 5.3.0 (present) at /usr/local/bin/blender; headless bpy test OK | 26 |
| Android build tools | OK | Android SDK platform 34 + build-tools 34.0.0 + platform-tools (present, /opt/android-sdk), Java 21, Gradle wrapper gradle-8.2.1; APK: npm run android:debug | 0 |
| Claude hooks / plugins / MCP | OK | hooks: SessionStart PreCompact Stop SessionEnd; Playwright MCP connected; plugins: claude-code-setup code-review context7 design feature-dev frontend-design hubcap playwright pyright-lsp superpowers typescript-lsp worldlabs ; MCP template .mcp.json.template (no secrets) | 4 |
| Build + game tests | OK | tsc OK; continuity OK (all stage joins gap 0, 07->08 drop 61.19) | 5 |
| Five-minute GitHub autosave | OK | AUTOSAVE OK / branch claude/rainbow-05-water-projection / scheduler daemon / last verified backup 2026-11-16T15:55:49+00:00 (0.8 min ago) / local 7b9b2cf remote 7b9b2cf (match) / uncommitted 0 | 0 |

Not transferable through GitHub (re-connect on a new Claude account): Claude login, GitHub connection + Claude GitHub App, World Labs Atlas connector sign-in, the Marble World API key (secure credential form only), cloud-environment settings, running processes. See `backups/TOOL_MANIFEST.json`.

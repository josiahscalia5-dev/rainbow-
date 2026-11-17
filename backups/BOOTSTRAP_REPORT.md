# Rainbow bootstrap report — BOOTSTRAP PROBLEMS

Generated 2026-11-16 23:57 UTC by `scripts/claude-bootstrap.sh` (mode `full`) on branch `ccr-694bda6a-x58ntq`.
The commit that contains this file is the backup itself, so its SHA is not written here; use `git log -1 -- backups/BOOTSTRAP_REPORT.md`.

| Step | Result | Details | s |
|---|---|---|---|
| Repository + branch | OK | josiahscalia5-dev/rainbow- on ccr-694bda6a-x58ntq @ b81cc34 (session started from unknown) | 0 |
| Resume newest work | WARN | 20/21 remote ccr-*/claude/* branches contained in HEAD b81cc34; not merged (check mode): run bash scripts/claude-bootstrap.sh | 1 |
| Backup gap since last session | OK | previous save on GitHub: b81cc34 2026-11-16 23:44 UTC (daemon) on claude/approved-screen-implementation-g3loqu; previous session ended WITHOUT an end-of-session backup (its environment closed after an automatic save); 13 gap(s) > 10 min in the last 72 h of the autosave log, longest 11-16 03:22-09:28 UTC (6.1 h) | 0 |
| Git LFS binaries (local) | OK | 34/34 real files (models, APK, kit ZIP, Marble splats/PLY/colliders/.blend), git lfs fsck OK | 4 |
| Git LFS on GitHub | OK | 34/34 LFS objects (231 MB, 17 Marble/World Labs) confirmed on GitHub LFS | 1 |
| Approved references | OK | 13/13 byte-identical (scripts/reference.sha256, incl. the official cartoon-girl reference) | 0 |
| Game: 11 screens + code | OK | 11 approved screen references 01-11, source tree src/ (43 files), Android project android/, characters assets/models/*.glb | 0 |
| Specialist agents | FAIL | check crashed: TypeError: sequence item 0: expected str instance, dict found | 0 |
| Marble World Labs assets | OK | both worlds complete: 49 files checked, 15 real LFS binaries (splats/PLY/colliders/.blend), 71 files tracked under qa/worldlabs; credits spent 1810 of cap 6250 | 1 |
| World Labs integration | WARN | Marble API authentication FAILED (HTTP 401): reconnect with the secure credential form (request_credential host api.worldlabs.ai, header WLT-Api-Key) - never chat or git; plugin worldlabs@worldlabs installed now; Atlas connector = claude.ai connector (check in Claude: ToolSearch World_Labs_Atlas); no paid job started | 5 |
| Node.js | OK | v22.23.4, npm 10.9.9 | 0 |
| npm dependencies | OK | npm ci done (99 packages; cache ~/.npm reused) | 4 |
| Python QA libraries | OK | installed: opencv-python-headless scipy; Python 3.13.18; required numpy+Pillow OK; optional cv2+scipy OK | 10 |
| Playwright + Chromium | OK | headless Chromium 153.0.8010.12 with WebGL2 (SwiftShader); preinstalled, never reinstall | 2 |
| ffmpeg / ImageMagick | OK | ffmpeg 6.1.1-3ubuntu5, ImageMagick 6.9.12-98 (Flow video + image checks) | 0 |
| Blender | OK | Blender 5.3.0 (installed now) at /usr/local/bin/blender; headless bpy test OK | 110 |
| Android build tools | OK | Android SDK platform 34 + build-tools 34.0.0 + platform-tools (installed now, /opt/android-sdk), Java 21, Gradle wrapper gradle-8.2.1; APK: npm run android:debug | 0 |
| Claude hooks / plugins / MCP | OK | hooks: SessionStart PreCompact Stop SessionEnd; Playwright MCP connected; plugins: claude-bridge claude-code-setup claude-md-management code-review code-simplifier commit-commands context7 feature-dev frontend-design playwright security-guidance superpowers typemux-cc typescript-native-lsp worldlabs ; MCP template .mcp.json.template (no secrets) | 4 |
| Build + game tests | OK | tsc OK; continuity OK (all stage joins gap 0, 07->08 drop 61.19) | 4 |
| Five-minute GitHub autosave | OK | AUTOSAVE OK / branch ccr-694bda6a-x58ntq / scheduler daemon / last verified backup 2026-11-16T23:57:30+00:00 (0.1 min ago) / local d942c4c remote d942c4c (match) / uncommitted 0 | 8 |

Not transferable through GitHub (re-connect on a new Claude account): Claude login, GitHub connection + Claude GitHub App, World Labs Atlas connector sign-in, the Marble World API key (secure credential form only), cloud-environment settings, running processes. See `backups/TOOL_MANIFEST.json`.

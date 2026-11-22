# Rainbow bootstrap report — BOOTSTRAP PROBLEMS

Generated 2026-11-22 17:54 UTC by `scripts/claude-bootstrap.sh` (mode `background`) on branch `ccr-c1b272d2-3ru7yx`.
The commit that contains this file is the backup itself, so its SHA is not written here; use `git log -1 -- backups/BOOTSTRAP_REPORT.md`.

| Step | Result | Details | s |
|---|---|---|---|
| Repository + branch | OK | josiahscalia5-dev/rainbow- on ccr-c1b272d2-3ru7yx @ f44adeb (session started from ccr-0bbd5b9d-js1cpg) | 0 |
| Resume newest work | FAIL | git fetch from GitHub failed (network / GitHub connection?) | 240 |
| Backup gap since last session | WARN | GAP: no backup ran from 2026-11-22 17:24 to 2026-11-22 17:48 UTC (0.4 h) - no Claude cloud environment with the autosave was active. Nothing can be saved while an environment is closed; the newest saved state is f44adeb.; previous session ended WITHOUT an end-of-session backup (its environment closed after an automatic save); 32 gap(s) > 10 min in the last 72 h of the autosave log, longest 11-22 04:39-09:55 UTC (5.3 h) | 0 |
| Git LFS binaries (local) | OK | 620/620 real files (models, APK, kit ZIP, Marble splats/PLY/colliders/.blend), git lfs fsck OK | 4 |
| Git LFS on GitHub | OK | 620/620 LFS objects (2477 MB, 28 Marble/World Labs) confirmed on GitHub LFS | 5 |
| Approved references | OK | 13/13 byte-identical (scripts/reference.sha256, incl. the official cartoon-girl reference) | 0 |
| Game: 11 screens + code | OK | 11 approved screen references 01-11, source tree src/ (52 files), Android project android/, characters assets/models/*.glb | 0 |
| Specialist agents | OK | 10/10 specialist definitions present; all SHA-256 unchanged; running: _note | 0 |
| Marble World Labs assets | OK | both worlds complete: 49 files checked, 15 real LFS binaries (splats/PLY/colliders/.blend), 107 files tracked under qa/worldlabs; credits spent 1810 of cap 6250 | 1 |
| World Labs integration | WARN | Marble API authentication FAILED (HTTP 401): reconnect with the secure credential form (request_credential host api.worldlabs.ai, header WLT-Api-Key) - never chat or git; plugin worldlabs@worldlabs installed now; Atlas connector = claude.ai connector (check in Claude: ToolSearch World_Labs_Atlas); no paid job started | 6 |
| Node.js | OK | v22.23.5, npm 10.9.9 | 0 |
| npm dependencies | OK | npm ci done (99 packages; cache ~/.npm reused) | 4 |
| Language servers | OK | typescript-language-server 4.4.0; pyright-langserver yes | 1 |
| Spector.js MCP | OK | spectorjs registered (BabylonJS/Spector.js @ 755e6a7, Playwright 1.63.0 = the preinstalled browser); tools load at session start | 14 |
| Python QA libraries | OK | installed: opencv-python-headless scipy; Python 3.13.18; required numpy+Pillow OK; optional cv2+scipy OK | 8 |
| Playwright + Chromium | OK | headless Chromium 157.0.8103.78 with WebGL2 (SwiftShader); preinstalled, never reinstall | 0 |
| ffmpeg / ImageMagick | OK | ffmpeg 6.1.1-3ubuntu5, ImageMagick 6.9.12-98 (Flow video + image checks) | 1 |
| Blender | OK | Blender 5.3.0 (installed now) at /usr/local/bin/blender; headless bpy test OK | 14 |
| Android build tools | OK | Android SDK platform 34 + build-tools 34.0.0 + platform-tools (installed now, /opt/android-sdk), Java 21, Gradle wrapper gradle-8.2.1; APK: npm run android:debug | 0 |
| Claude hooks / plugins / MCP | OK | hooks: SessionStart PreCompact Stop SessionEnd; Playwright MCP connected; plugins: claude-code-setup design parallax-threejs playwright serena skill-creator typescript-native-lsp worldlabs ; MCP template .mcp.json.template (no secrets) | 8 |
| Build + game tests | OK | tsc OK; continuity OK (all stage joins gap 0, 07->08 drop 61.19) | 5 |
| Five-minute GitHub autosave | OK | AUTOSAVE OK / branch ccr-c1b272d2-3ru7yx / scheduler daemon / last verified backup 2026-11-22T17:54:28+00:00 (0.5 min ago) / local 606c443 remote 606c443 (match) / uncommitted 0 | 27 |

Not transferable through GitHub (re-connect on a new Claude account): Claude login, GitHub connection + Claude GitHub App, World Labs Atlas connector sign-in, the Marble World API key (secure credential form only), cloud-environment settings, running processes. See `backups/TOOL_MANIFEST.json`.

# Rainbow bootstrap report — BOOTSTRAP PROBLEMS

Generated 2026-11-22 12:41 UTC by `scripts/claude-bootstrap.sh` (mode `background`) on branch `ccr-80cdb162-4sqz1a`.
The commit that contains this file is the backup itself, so its SHA is not written here; use `git log -1 -- backups/BOOTSTRAP_REPORT.md`.

| Step | Result | Details | s |
|---|---|---|---|
| Repository + branch | OK | josiahscalia5-dev/rainbow- on ccr-80cdb162-4sqz1a @ 0c005aa (session started from ccr-50ff6f57-q5me82) | 0 |
| Resume newest work | FAIL | git fetch from GitHub failed (network / GitHub connection?) | 240 |
| Backup gap since last session | OK | previous save on GitHub: 0c005aa 2026-11-22 12:27 UTC (hook:Stop) on ccr-50ff6f57-q5me82, ccr-80cdb162-4sqz1a; previous session ended WITHOUT an end-of-session backup (its environment closed after an automatic save); 30 gap(s) > 10 min in the last 72 h of the autosave log, longest 11-22 04:39-09:55 UTC (5.3 h) | 1 |
| Git LFS binaries (local) | OK | 609/609 real files (models, APK, kit ZIP, Marble splats/PLY/colliders/.blend), git lfs fsck OK | 3 |
| Git LFS on GitHub | OK | 609/609 LFS objects (2253 MB, 28 Marble/World Labs) confirmed on GitHub LFS | 4 |
| Approved references | OK | 13/13 byte-identical (scripts/reference.sha256, incl. the official cartoon-girl reference) | 0 |
| Game: 11 screens + code | OK | 11 approved screen references 01-11, source tree src/ (52 files), Android project android/, characters assets/models/*.glb | 0 |
| Specialist agents | OK | 10/10 specialist definitions present; all SHA-256 unchanged; running: _note, s1_visual, s2_swim, s3_camera, s4_qa, s5_builder | 0 |
| Marble World Labs assets | OK | both worlds complete: 49 files checked, 15 real LFS binaries (splats/PLY/colliders/.blend), 107 files tracked under qa/worldlabs; credits spent 1810 of cap 6250 | 0 |
| World Labs integration | WARN | Marble API authentication FAILED (HTTP 401): reconnect with the secure credential form (request_credential host api.worldlabs.ai, header WLT-Api-Key) - never chat or git; plugin worldlabs@worldlabs installed now; Atlas connector = claude.ai connector (check in Claude: ToolSearch World_Labs_Atlas); no paid job started | 4 |
| Node.js | OK | v22.23.5, npm 10.9.9 | 0 |
| npm dependencies | OK | npm ci done (99 packages; cache ~/.npm reused) | 2 |
| Python QA libraries | OK | installed: opencv-python-headless scipy; Python 3.13.18; required numpy+Pillow OK; optional cv2+scipy OK | 8 |
| Playwright + Chromium | OK | headless Chromium 157.0.8103.78 with WebGL2 (SwiftShader); preinstalled, never reinstall | 0 |
| ffmpeg / ImageMagick | OK | ffmpeg 6.1.1-3ubuntu5, ImageMagick 6.9.12-98 (Flow video + image checks) | 0 |
| Blender | OK | Blender 5.3.0 (installed now) at /usr/local/bin/blender; headless bpy test OK | 41 |
| Android build tools | OK | Android SDK platform 34 + build-tools 34.0.0 + platform-tools (installed now, /opt/android-sdk), Java 21, Gradle wrapper gradle-8.2.1; APK: npm run android:debug | 0 |
| Claude hooks / plugins / MCP | OK | hooks: SessionStart PreCompact Stop SessionEnd; Playwright MCP connected; plugins: claude-code-setup design parallax-threejs playwright serena skill-creator typescript-native-lsp worldlabs ; MCP template .mcp.json.template (no secrets) | 7 |
| Build + game tests | OK | tsc OK; continuity OK (all stage joins gap 0, 07->08 drop 61.19) | 3 |
| Five-minute GitHub autosave | OK | AUTOSAVE OK / branch ccr-80cdb162-4sqz1a / scheduler daemon / last verified backup 2026-11-22T12:41:39+00:00 (0.2 min ago) / local bf6cb2f remote bf6cb2f (match) / uncommitted 0 | 14 |

Not transferable through GitHub (re-connect on a new Claude account): Claude login, GitHub connection + Claude GitHub App, World Labs Atlas connector sign-in, the Marble World API key (secure credential form only), cloud-environment settings, running processes. See `backups/TOOL_MANIFEST.json`.

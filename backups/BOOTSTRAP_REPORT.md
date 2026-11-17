# Rainbow bootstrap report — BOOTSTRAP OK (with warnings)

Generated 2026-11-17 21:49 UTC by `scripts/claude-bootstrap.sh` (mode `background`) on branch `ccr-4bd35b15-7z45t0`.
The commit that contains this file is the backup itself, so its SHA is not written here; use `git log -1 -- backups/BOOTSTRAP_REPORT.md`.

| Step | Result | Details | s |
|---|---|---|---|
| Repository + branch | OK | josiahscalia5-dev/rainbow- on ccr-4bd35b15-7z45t0 @ cbc5713 (session started from ccr-f983b317-2vt0zh) | 0 |
| Resume newest work | WARN | 20/65 remote ccr-*/claude/* branches contained in HEAD cbc57135; not merged (automatic merge disabled (use --resume only with the user's OK)): run bash scripts/claude-bootstrap.sh | 139 |
| Backup gap since last session | OK | previous save on GitHub: cbc5713 2026-11-17 21:41 UTC (hook:Stop) on ccr-4bd35b15-7z45t0, ccr-f983b317-2vt0zh; previous session ended WITHOUT an end-of-session backup (its environment closed after an automatic save); 21 gap(s) > 10 min in the last 72 h of the autosave log, longest 11-16 03:22-09:28 UTC (6.1 h) | 0 |
| Git LFS binaries (local) | OK | 59/59 real files (models, APK, kit ZIP, Marble splats/PLY/colliders/.blend), git lfs fsck OK | 2 |
| Git LFS on GitHub | OK | 59/59 LFS objects (507 MB, 17 Marble/World Labs) confirmed on GitHub LFS | 1 |
| Approved references | OK | 13/13 byte-identical (scripts/reference.sha256, incl. the official cartoon-girl reference) | 0 |
| Game: 11 screens + code | OK | 11 approved screen references 01-11, source tree src/ (46 files), Android project android/, characters assets/models/*.glb | 0 |
| Specialist agents | OK | 10/10 specialist definitions present; all SHA-256 unchanged; running: none (relaunch from notes when needed) | 0 |
| Marble World Labs assets | OK | both worlds complete: 49 files checked, 15 real LFS binaries (splats/PLY/colliders/.blend), 71 files tracked under qa/worldlabs; credits spent 1810 of cap 6250 | 1 |
| World Labs integration | WARN | Marble API key authenticated (free read: 5420 credits); worlds draft 404, full 404; no paid job started; plugin worldlabs@worldlabs installed; Atlas connector = claude.ai connector (check in Claude: ToolSearch World_Labs_Atlas); no paid job started | 1 |
| Node.js | OK | v22.23.5, npm 10.9.9 | 0 |
| npm dependencies | OK | node_modules up to date with package-lock.json (npm ci skipped) | 0 |
| Python QA libraries | OK | Python 3.13.18; required numpy+Pillow OK; optional cv2+scipy OK | 0 |
| Playwright + Chromium | OK | headless Chromium 157.0.8103.78 with WebGL2 (SwiftShader); preinstalled, never reinstall | 0 |
| ffmpeg / ImageMagick | OK | ffmpeg 6.1.1-3ubuntu5, ImageMagick 6.9.12-98 (Flow video + image checks) | 0 |
| Blender | OK | Blender 5.3.0 (present) at /usr/local/bin/blender; headless bpy test OK | 1 |
| Android build tools | OK | Android SDK platform 34 + build-tools 34.0.0 + platform-tools (present, /opt/android-sdk), Java 21, Gradle wrapper gradle-8.2.1; APK: npm run android:debug | 0 |
| Claude hooks / plugins / MCP | OK | hooks: SessionStart PreCompact Stop SessionEnd; Playwright MCP connected; plugins: claude-code-setup code-review context7 feature-dev frontend-design parallax-threejs playwright superpowers typescript-lsp worldlabs ; MCP template .mcp.json.template (no secrets) | 5 |
| Build + game tests | OK | tsc OK; continuity OK (all stage joins gap 0, 07->08 drop 61.19) | 4 |
| Five-minute GitHub autosave | OK | AUTOSAVE OK / branch ccr-4bd35b15-7z45t0 / scheduler daemon / last verified backup 2026-11-17T21:49:45+00:00 (0.1 min ago) / local d610e06 remote d610e06 (match) / uncommitted 0 | 8 |

Not transferable through GitHub (re-connect on a new Claude account): Claude login, GitHub connection + Claude GitHub App, World Labs Atlas connector sign-in, the Marble World API key (secure credential form only), cloud-environment settings, running processes. See `backups/TOOL_MANIFEST.json`.

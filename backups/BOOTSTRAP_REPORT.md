# Rainbow bootstrap report — BOOTSTRAP PROBLEMS

Generated 2026-11-17 20:26 UTC by `scripts/claude-bootstrap.sh` (mode `background`) on branch `ccr-32bfea9a-ea6he9`.
The commit that contains this file is the backup itself, so its SHA is not written here; use `git log -1 -- backups/BOOTSTRAP_REPORT.md`.

| Step | Result | Details | s |
|---|---|---|---|
| Repository + branch | OK | josiahscalia5-dev/rainbow- on ccr-32bfea9a-ea6he9 @ 9d92c89 (session started from ccr-f983b317-2vt0zh) | 0 |
| Resume newest work | FAIL | git fetch from GitHub failed (network / GitHub connection?) | 240 |
| Backup gap since last session | OK | previous save on GitHub: 9d92c89 2026-11-17 20:19 UTC (daemon) on ccr-32bfea9a-ea6he9, ccr-f983b317-2vt0zh; previous session ended WITHOUT an end-of-session backup (its environment closed after an automatic save); 21 gap(s) > 10 min in the last 72 h of the autosave log, longest 11-16 03:22-09:28 UTC (6.1 h) | 0 |
| Git LFS binaries (local) | OK | 47/47 real files (models, APK, kit ZIP, Marble splats/PLY/colliders/.blend), git lfs fsck OK | 1 |
| Git LFS on GitHub | OK | 47/47 LFS objects (398 MB, 17 Marble/World Labs) confirmed on GitHub LFS | 1 |
| Approved references | OK | 13/13 byte-identical (scripts/reference.sha256, incl. the official cartoon-girl reference) | 0 |
| Game: 11 screens + code | OK | 11 approved screen references 01-11, source tree src/ (46 files), Android project android/, characters assets/models/*.glb | 0 |
| Specialist agents | OK | 10/10 specialist definitions present; all SHA-256 unchanged; running: washer-environment-modeler (Screen 08 scenery in motion) (claude/rainbow-s08-scenery-c4) | 0 |
| Marble World Labs assets | OK | both worlds complete: 49 files checked, 15 real LFS binaries (splats/PLY/colliders/.blend), 71 files tracked under qa/worldlabs; credits spent 1810 of cap 6250 | 1 |
| World Labs integration | OK | Marble API key authenticated (free read: 5190 credits); worlds draft 200, full 200; no paid job started; plugin worldlabs@worldlabs installed now; Atlas connector = claude.ai connector (check in Claude: ToolSearch World_Labs_Atlas); no paid job started | 6 |
| Node.js | OK | v22.23.5, npm 10.9.9 | 0 |
| npm dependencies | OK | npm ci done (99 packages; cache ~/.npm reused) | 4 |
| Python QA libraries | OK | installed: opencv-python-headless scipy; Python 3.13.18; required numpy+Pillow OK; optional cv2+scipy OK | 10 |
| Playwright + Chromium | OK | headless Chromium 157.0.8103.78 with WebGL2 (SwiftShader); preinstalled, never reinstall | 1 |
| ffmpeg / ImageMagick | OK | ffmpeg 6.1.1-3ubuntu5, ImageMagick 6.9.12-98 (Flow video + image checks) | 0 |
| Blender | OK | Blender 5.3.0 (installed now) at /usr/local/bin/blender; headless bpy test OK | 14 |
| Android build tools | OK | Android SDK platform 34 + build-tools 34.0.0 + platform-tools (installed now, /opt/android-sdk), Java 21, Gradle wrapper gradle-8.2.1; APK: npm run android:debug | 0 |
| Claude hooks / plugins / MCP | OK | hooks: SessionStart PreCompact Stop SessionEnd; Playwright MCP connected; plugins: claude-code-setup code-review context7 design feature-dev frontend-design hubcap playwright pyright-lsp superpowers typescript-lsp worldlabs ; MCP template .mcp.json.template (no secrets) | 3 |
| Build + game tests | OK | tsc OK; continuity OK (all stage joins gap 0, 07->08 drop 61.19) | 3 |
| Five-minute GitHub autosave | OK | AUTOSAVE OK / branch ccr-32bfea9a-ea6he9 / scheduler daemon / last verified backup 2026-11-17T20:26:08+00:00 (0.1 min ago) / local 4b326bf remote 4b326bf (match) / uncommitted 0 | 8 |

Not transferable through GitHub (re-connect on a new Claude account): Claude login, GitHub connection + Claude GitHub App, World Labs Atlas connector sign-in, the Marble World API key (secure credential form only), cloud-environment settings, running processes. See `backups/TOOL_MANIFEST.json`.

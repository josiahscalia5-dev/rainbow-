# Rainbow bootstrap report — BOOTSTRAP OK (with warnings)

Generated 2026-11-17 02:25 UTC by `scripts/claude-bootstrap.sh` (mode `background`) on branch `ccr-b0757dec-dj6l1o`.
The commit that contains this file is the backup itself, so its SHA is not written here; use `git log -1 -- backups/BOOTSTRAP_REPORT.md`.

| Step | Result | Details | s |
|---|---|---|---|
| Repository + branch | OK | josiahscalia5-dev/rainbow- on ccr-b0757dec-dj6l1o @ c20d879 (session started from claude/rainbow-account-transfer-npxahd) | 0 |
| Newer saved work (no auto-merge) | WARN | 22/24 remote ccr-*/claude/* branches contained in HEAD c20d879; NOT merged (automatic merging is OFF, user's order 2026-11-17): claude/rainbow-account-transfer-npxahd@89eacf0 (1 commit(s), 0 file(s) outside backups/, 11-17 02:23 UTC); ccr-61131b9d-uj0oqb@99690f1 (5 commit(s), 0 file(s) outside backups/, 11-17 01:42 UTC); THIS CHECKOUT IS BEHIND claude/rainbow-account-transfer-npxahd (same line of work): the session probably started from an old branch - follow backups/HANDOFF_NEW_ACCOUNT.md, tell the user | 23 |
| Backup gap since last session | OK | previous save on GitHub: 89eacf0 2026-11-17 02:23 UTC (daemon) on claude/rainbow-account-transfer-npxahd; previous session ended WITHOUT an end-of-session backup (its environment closed after an automatic save); 15 gap(s) > 10 min in the last 72 h of the autosave log, longest 11-16 03:22-09:28 UTC (6.1 h) | 0 |
| Git LFS binaries (local) | OK | 36/36 real files (models, APK, kit ZIP, Marble splats/PLY/colliders/.blend), git lfs fsck OK | 4 |
| Git LFS on GitHub | OK | 36/36 LFS objects (232 MB, 17 Marble/World Labs) confirmed on GitHub LFS | 1 |
| Approved references | OK | 13/13 byte-identical (scripts/reference.sha256, incl. the official cartoon-girl reference) | 0 |
| Game: 11 screens + code | OK | 11 approved screen references 01-11, source tree src/ (44 files), Android project android/, characters assets/models/*.glb | 0 |
| Specialist agents | OK | 10/10 specialist definitions present; all SHA-256 unchanged; running: washer-environment-modeler (recorded running = INTERRUPTED unless relaunched this session), foam-bubbles-particles (recorded running = INTERRUPTED unless relaunched this session) | 0 |
| Marble World Labs assets | OK | both worlds complete: 49 files checked, 15 real LFS binaries (splats/PLY/colliders/.blend), 71 files tracked under qa/worldlabs; credits spent 1810 of cap 6250 | 0 |
| World Labs integration | OK | Marble API key authenticated (free read: 5190 credits); worlds draft 200, full 200; no paid job started; plugin worldlabs@worldlabs installed now; Atlas connector = claude.ai connector (check in Claude: ToolSearch World_Labs_Atlas); no paid job started | 6 |
| Node.js | OK | v22.23.4, npm 10.9.9 | 1 |
| npm dependencies | OK | npm ci done (99 packages; cache ~/.npm reused) | 5 |
| Python QA libraries | OK | installed: opencv-python-headless scipy; Python 3.13.18; required numpy+Pillow OK; optional cv2+scipy OK | 20 |
| Playwright + Chromium | OK | headless Chromium 153.0.8010.12 with WebGL2 (SwiftShader); preinstalled, never reinstall | 1 |
| ffmpeg / ImageMagick | OK | ffmpeg 6.1.1-3ubuntu5, ImageMagick 6.9.12-98 (Flow video + image checks) | 1 |
| Blender | OK | Blender 5.3.0 (installed now) at /usr/local/bin/blender; headless bpy test OK | 1 |
| Blender render + GLB check | OK | Blender 5.3.0 bpy OK; real renders: Workbench 5.2 s, EEVEE 14.1 s, Cycles 0.4 s; .blend files 8/8 open; GLB import: benny.glb 27 meshes, rainbow_girl.glb 165 meshes, lids05.glb 6 meshes (6 paddles OK); GLB export -> import: 6/6 paddles geometry-identical, identical to the game lids05.glb | 23 |
| Android build tools | OK | Android SDK platform 34 + build-tools 34.0.0 + platform-tools (installed now, /opt/android-sdk), Java 21, Gradle wrapper gradle-8.2.1; APK: npm run android:debug | 0 |
| Claude hooks / plugins / MCP | OK | hooks: SessionStart PreCompact Stop SessionEnd; Playwright MCP connected; all servers: plugin:parallax-threejs:chrome-devtools-mcp connected; plugin:parallax-threejs:threejs-devtools-mcp connected; plugin:parallax-threejs:playwright-mcp connected; plugin:parallax-threejs:spector NOT connected (Failed to connect — CONNECTION_CLOSED: Connection closed); plugin:playwright:playwright connected; plugin:context7:context7 NOT connected (Needs authentication); plugin:worldlabs:worldlabs NOT connected (Disabled for this project (re-enable via /mcp)); Blender MCP NOT connected and not possible here (headless container: no display, so no desktop Blender add-on socket) - Blender command line + Python is the working integration (row 'Blender render + GLB check'); GitHub git connection OK (GitHub MCP is a session connector: test in Claude with mcp__github__list_branches); plugins: claude-code-setup code-review context7 feature-dev frontend-design parallax-threejs playwright superpowers typescript-lsp worldlabs ; MCP template .mcp.json.template (no secrets) | 6 |
| Logins / authorizations for the user | OK |  context7 not signed in (optional, unused); | 6 |
| Build + game tests | OK | tsc OK; continuity OK (all stage joins gap 0, 07->08 drop 61.19) | 3 |
| Five-minute GitHub autosave | OK | AUTOSAVE OK / branch ccr-b0757dec-dj6l1o / scheduler daemon / last verified backup 2026-11-17T02:25:10+00:00 (0.1 min ago) / local fe531e6 remote fe531e6 (match) / uncommitted 0 | 7 |

Not transferable through GitHub (re-connect on a new Claude account): Claude login, GitHub connection + Claude GitHub App, World Labs Atlas connector sign-in, the Marble World API key (secure credential form only), cloud-environment settings, running processes. See `backups/TOOL_MANIFEST.json`.

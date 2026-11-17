# Rainbow bootstrap report — BOOTSTRAP OK (with warnings)

Generated 2026-11-17 01:13 UTC by `scripts/claude-bootstrap.sh` (mode `full`) on branch `claude/rainbow-account-transfer-npxahd`.
The commit that contains this file is the backup itself, so its SHA is not written here; use `git log -1 -- backups/BOOTSTRAP_REPORT.md`.

| Step | Result | Details | s |
|---|---|---|---|
| Repository + branch | OK | josiahscalia5-dev/rainbow- on claude/rainbow-account-transfer-npxahd @ 19ddfb4 (session started from claude/rainbow-restore-env-setup-bxn85h) | 0 |
| Newer saved work (no auto-merge) | OK | 22/23 remote ccr-*/claude/* branches contained in HEAD 19ddfb4; NOT merged (automatic merging is OFF, user's order 2026-11-17): ccr-61131b9d-uj0oqb@4a2a325 (1 commit(s), 0 file(s) outside backups/, 11-17 01:09 UTC); only autosave bookkeeping under backups/, no game work: nothing to do | 0 |
| Backup gap since last session | OK | previous save on GitHub: 9c50d67 2026-11-17 01:09 UTC (daemon) on claude/rainbow-account-transfer-npxahd, claude/rainbow-restore-env-setup-bxn85h; previous session ended WITHOUT an end-of-session backup (its environment closed after an automatic save); 15 gap(s) > 10 min in the last 72 h of the autosave log, longest 11-16 03:22-09:28 UTC (6.1 h) | 0 |
| Git LFS binaries (local) | OK | 34/34 real files (models, APK, kit ZIP, Marble splats/PLY/colliders/.blend), git lfs fsck OK | 1 |
| Git LFS on GitHub | OK | 34/34 LFS objects (231 MB, 17 Marble/World Labs) confirmed on GitHub LFS | 0 |
| Approved references | OK | 13/13 byte-identical (scripts/reference.sha256, incl. the official cartoon-girl reference) | 0 |
| Game: 11 screens + code | OK | 11 approved screen references 01-11, source tree src/ (44 files), Android project android/, characters assets/models/*.glb | 0 |
| Specialist agents | OK | 10/10 specialist definitions present; all SHA-256 unchanged; running: washer-environment-modeler (recorded running = INTERRUPTED unless relaunched this session), benny-character-artist (recorded running = INTERRUPTED unless relaunched this session), animation-and-gameplay-engineer (recorded running = INTERRUPTED unless relaunched this session) | 0 |
| Marble World Labs assets | OK | both worlds complete: 49 files checked, 15 real LFS binaries (splats/PLY/colliders/.blend), 71 files tracked under qa/worldlabs; credits spent 1810 of cap 6250 | 1 |
| World Labs integration | WARN | Marble API not reachable (HTTP <urlopen error Tunnel connection failed: 403 Forbidden>): network/API problem, NOT a key problem - do not ask the user for a new key; retry later; plugin worldlabs@worldlabs installed; Atlas connector = claude.ai connector (check in Claude: ToolSearch World_Labs_Atlas); no paid job started | 1 |
| Node.js | OK | v22.23.4, npm 10.9.9 | 0 |
| npm dependencies | OK | node_modules up to date with package-lock.json (npm ci skipped) | 0 |
| Python QA libraries | OK | Python 3.13.18; required numpy+Pillow OK; optional cv2+scipy OK | 0 |
| Playwright + Chromium | OK | headless Chromium 153.0.8010.12 with WebGL2 (SwiftShader); preinstalled, never reinstall | 0 |
| ffmpeg / ImageMagick | OK | ffmpeg 6.1.1-3ubuntu5, ImageMagick 6.9.12-98 (Flow video + image checks) | 0 |
| Blender | OK | Blender 5.3.0 (present) at /usr/local/bin/blender; headless bpy test OK | 2 |
| Blender render + GLB check | OK | Blender 5.3.0 bpy OK; real renders: Workbench 2.2 s, EEVEE 13.3 s, Cycles 0.4 s; .blend files 7/7 open; GLB import: benny.glb 27 meshes, rainbow_girl.glb 165 meshes, lids05.glb 6 meshes (6 paddles OK); GLB export -> import: 6/6 paddles geometry-identical, identical to the game lids05.glb | 18 |
| Android build tools | OK | Android SDK platform 34 + build-tools 34.0.0 + platform-tools (present, /opt/android-sdk), Java 21, Gradle wrapper gradle-8.2.1; APK: npm run android:debug | 0 |
| Claude hooks / plugins / MCP | OK | hooks: SessionStart PreCompact Stop SessionEnd; Playwright MCP connected; all servers: plugin:playwright:playwright connected; plugin:context7:context7 NOT connected (Failed to connect — ERR_PROXY_TUNNEL: Error dialing https://mcp.context7.com/mcp?[redacted); plugin:worldlabs:worldlabs NOT connected (Disabled for this project (re-enable via /mcp)); Blender MCP NOT connected and not possible here (headless container: no display, so no desktop Blender add-on socket) - Blender command line + Python is the working integration (row 'Blender render + GLB check'); GitHub git connection OK (GitHub MCP is a session connector: test in Claude with mcp__github__list_branches); plugins: claude-code-setup code-review context7 feature-dev frontend-design playwright rv-tools superpowers typescript-lsp unity video-to-code-skill worldlabs ; MCP template .mcp.json.template (no secrets) | 3 |
| Logins / authorizations for the user | OK |  context7 not signed in (optional, unused); | 3 |
| Build + game tests | OK | tsc OK; continuity OK (all stage joins gap 0, 07->08 drop 61.19) | 3 |
| Five-minute GitHub autosave | OK | AUTOSAVE OK / branch claude/rainbow-account-transfer-npxahd / scheduler daemon / last verified backup 2026-11-17T01:13:09+00:00 (0.1 min ago) / local 60ed5ff remote 60ed5ff (match) / uncommitted 0 | 6 |

Not transferable through GitHub (re-connect on a new Claude account): Claude login, GitHub connection + Claude GitHub App, World Labs Atlas connector sign-in, the Marble World API key (secure credential form only), cloud-environment settings, running processes. See `backups/TOOL_MANIFEST.json`.

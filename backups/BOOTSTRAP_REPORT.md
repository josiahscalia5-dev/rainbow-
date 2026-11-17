# Rainbow bootstrap report — BOOTSTRAP PROBLEMS

Generated 2026-11-17 01:11 UTC by `scripts/claude-bootstrap.sh` (mode `background`) on branch `claude/rainbow-account-transfer-npxahd`.
The commit that contains this file is the backup itself, so its SHA is not written here; use `git log -1 -- backups/BOOTSTRAP_REPORT.md`.

| Step | Result | Details | s |
|---|---|---|---|
| Repository + branch | OK | josiahscalia5-dev/rainbow- on claude/rainbow-account-transfer-npxahd @ 82f2f5b (session started from claude/rainbow-restore-env-setup-bxn85h) | 0 |
| Newer saved work (no auto-merge) | WARN | 21/23 remote ccr-*/claude/* branches contained in HEAD 82f2f5b; NOT merged (automatic merging is OFF, user's order 2026-11-17): claude/rainbow-restore-env-setup-bxn85h@9c50d67 (1 commit(s), 0 file(s) outside backups/, 11-17 01:09 UTC); ccr-61131b9d-uj0oqb@4a2a325 (1 commit(s), 0 file(s) outside backups/, 11-17 01:09 UTC); THIS CHECKOUT IS BEHIND claude/rainbow-restore-env-setup-bxn85h (same line of work): the session probably started from an old branch - follow backups/HANDOFF_NEW_ACCOUNT.md, tell the user | 18 |
| Backup gap since last session | OK | previous save on GitHub: 9c50d67 2026-11-17 01:09 UTC (daemon) on claude/rainbow-restore-env-setup-bxn85h; previous session ended WITHOUT an end-of-session backup (its environment closed after an automatic save); 14 gap(s) > 10 min in the last 72 h of the autosave log, longest 11-16 03:22-09:28 UTC (6.1 h) | 1 |
| Git LFS binaries (local) | OK | 34/34 real files (models, APK, kit ZIP, Marble splats/PLY/colliders/.blend), git lfs fsck OK | 0 |
| Git LFS on GitHub | OK | 34/34 LFS objects (231 MB, 17 Marble/World Labs) confirmed on GitHub LFS | 1 |
| Approved references | OK | 13/13 byte-identical (scripts/reference.sha256, incl. the official cartoon-girl reference) | 0 |
| Game: 11 screens + code | OK | 11 approved screen references 01-11, source tree src/ (44 files), Android project android/, characters assets/models/*.glb | 0 |
| Specialist agents | OK | 10/10 specialist definitions present; all SHA-256 unchanged; running: washer-environment-modeler (recorded running = INTERRUPTED unless relaunched this session), benny-character-artist (recorded running = INTERRUPTED unless relaunched this session), animation-and-gameplay-engineer (recorded running = INTERRUPTED unless relaunched this session) | 0 |
| Marble World Labs assets | OK | both worlds complete: 49 files checked, 15 real LFS binaries (splats/PLY/colliders/.blend), 71 files tracked under qa/worldlabs; credits spent 1810 of cap 6250 | 0 |
| World Labs integration | WARN | Marble API not reachable (HTTP <urlopen error Tunnel connection failed: 403 Forbidden>): network/API problem, NOT a key problem - do not ask the user for a new key; retry later; plugin worldlabs@worldlabs installed now; Atlas connector = claude.ai connector (check in Claude: ToolSearch World_Labs_Atlas); no paid job started | 3 |
| Node.js | OK | v22.23.4, npm 10.9.9 | 0 |
| npm dependencies | OK | npm ci done (99 packages; cache ~/.npm reused) | 2 |
| Python QA libraries | OK | installed: opencv-python-headless scipy; Python 3.13.18; required numpy+Pillow OK; optional cv2+scipy OK | 7 |
| Playwright + Chromium | OK | headless Chromium 153.0.8010.12 with WebGL2 (SwiftShader); preinstalled, never reinstall | 2 |
| ffmpeg / ImageMagick | OK | ffmpeg 6.1.1-3ubuntu5, ImageMagick 6.9.12-98 (Flow video + image checks) | 0 |
| Blender | FAIL | install failed - backups/.live/blender-setup.log. Usual cause on a NEW Claude account: the cloud environment's network does not allow download.blender.org. Fix: propose an environment with hosts download.blender.org + dl.google.com and setup script scripts/cloud-env-setup.sh (create_environment / update_environment; the user approves a card), then rerun bash scripts/claude-bootstrap.sh | 0 |
| Blender render + GLB check | skip | Blender is not installed (see the Blender row) | 0 |
| Android build tools | FAIL | Android SDK install failed (needs dl.google.com) - backups/.live/android-setup.log | 0 |
| Claude hooks / plugins / MCP | OK | hooks: SessionStart PreCompact Stop SessionEnd; Playwright MCP connected; all servers: plugin:playwright:playwright connected; plugin:context7:context7 NOT connected (Failed to connect — ERR_PROXY_TUNNEL: Error dialing https://mcp.context7.com/mcp?[redacted); plugin:worldlabs:worldlabs NOT connected (Disabled for this project (re-enable via /mcp)); Blender MCP NOT connected and not possible here (headless container: no display, so no desktop Blender add-on socket) - Blender command line + Python is the working integration (row 'Blender render + GLB check'); GitHub git connection OK (GitHub MCP is a session connector: test in Claude with mcp__github__list_branches); plugins: claude-code-setup code-review context7 feature-dev frontend-design playwright rv-tools superpowers typescript-lsp unity video-to-code-skill worldlabs ; MCP template .mcp.json.template (no secrets) | 3 |
| Logins / authorizations for the user | OK |  context7 not signed in (optional, unused); | 3 |
| Build + game tests | OK | tsc OK; continuity OK (all stage joins gap 0, 07->08 drop 61.19) | 3 |
| Five-minute GitHub autosave | OK | AUTOSAVE OK / branch claude/rainbow-account-transfer-npxahd / scheduler daemon / last verified backup 2026-11-17T01:10:57+00:00 (0.1 min ago) / local dab17bf remote dab17bf (match) / uncommitted 0 | 6 |

Not transferable through GitHub (re-connect on a new Claude account): Claude login, GitHub connection + Claude GitHub App, World Labs Atlas connector sign-in, the Marble World API key (secure credential form only), cloud-environment settings, running processes. See `backups/TOOL_MANIFEST.json`.

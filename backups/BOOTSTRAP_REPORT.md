# Rainbow bootstrap report — BOOTSTRAP OK (with warnings)

Generated 2026-11-17 17:34 UTC by `scripts/claude-bootstrap.sh` (mode `background`) on branch `claude/rainbow-s08-camclear-c3`.
The commit that contains this file is the backup itself, so its SHA is not written here; use `git log -1 -- backups/BOOTSTRAP_REPORT.md`.

| Step | Result | Details | s |
|---|---|---|---|
| Repository + branch | OK | josiahscalia5-dev/rainbow- on claude/rainbow-s08-camclear-c3 @ 57b6eb8 (session started from claude/rainbow-s08-camclear-c2) | 0 |
| Resume newest work | WARN | 21/45 remote ccr-*/claude/* branches contained in HEAD 57b6eb8a; not merged (automatic merge disabled (use --resume only with the user's OK)): run bash scripts/claude-bootstrap.sh | 61 |
| Backup gap since last session | OK | previous save on GitHub: 7ad0a9e 2026-11-17 17:25 UTC (daemon) on ccr-c0235034-ks6sx3; previous session ended WITHOUT an end-of-session backup (its environment closed after an automatic save); 19 gap(s) > 10 min in the last 72 h of the autosave log, longest 11-16 03:22-09:28 UTC (6.1 h) | 1 |
| Git LFS binaries (local) | OK | 44/44 real files (models, APK, kit ZIP, Marble splats/PLY/colliders/.blend), git lfs fsck OK | 1 |
| Git LFS on GitHub | OK | 44/44 LFS objects (351 MB, 17 Marble/World Labs) confirmed on GitHub LFS | 2 |
| Approved references | OK | 13/13 byte-identical (scripts/reference.sha256, incl. the official cartoon-girl reference) | 33 |
| Game: 11 screens + code | OK | 11 approved screen references 01-11, source tree src/ (47 files), Android project android/, characters assets/models/*.glb | 0 |
| Specialist agents | OK | 10/10 specialist definitions present; all SHA-256 unchanged; running: none (relaunch from notes when needed) | 0 |
| Marble World Labs assets | OK | both worlds complete: 49 files checked, 15 real LFS binaries (splats/PLY/colliders/.blend), 71 files tracked under qa/worldlabs; credits spent 1810 of cap 6250 | 3 |
| World Labs integration | WARN | Marble API key authenticated (free read: 5420 credits); worlds draft 404, full 404; no paid job started; plugin worldlabs@worldlabs installed; Atlas connector = claude.ai connector (check in Claude: ToolSearch World_Labs_Atlas); no paid job started | 4 |
| Node.js | OK | v22.23.4, npm 10.9.9 | 4 |
| npm dependencies | OK | node_modules up to date with package-lock.json (npm ci skipped) | 1 |
| Python QA libraries | OK | Python 3.13.18; required numpy+Pillow OK; optional cv2+scipy OK | 0 |
| Playwright + Chromium | OK | headless Chromium 153.0.8010.12 with WebGL2 (SwiftShader); preinstalled, never reinstall | 15 |
| ffmpeg / ImageMagick | OK | ffmpeg 6.1.1-3ubuntu5, ImageMagick 6.9.12-98 (Flow video + image checks) | 5 |
| Blender | OK | Blender 5.3.0 (present) at /usr/local/bin/blender; headless bpy test OK | 18 |
| Android build tools | OK | Android SDK platform 34 + build-tools 34.0.0 + platform-tools (present, /opt/android-sdk), Java 21, Gradle wrapper gradle-8.2.1; APK: npm run android:debug | 3 |
| Claude hooks / plugins / MCP | WARN | hooks: SessionStart PreCompact Stop SessionEnd; Playwright MCP NOT connected (enable the 'playwright' plugin in claude.ai settings); plugins: worldlabs ; MCP template .mcp.json.template (no secrets) | 2 |
| Build + game tests | OK | tsc OK; continuity OK (all stage joins gap 0, 07->08 drop 61.19) | 6 |
| Five-minute GitHub autosave | OK | AUTOSAVE OK / branch claude/rainbow-s08-camclear-c3 / scheduler daemon / last verified backup 2026-11-17T17:34:42+00:00 (0.1 min ago) / local 0d553ca remote 0d553ca (match) / uncommitted 0 | 8 |

Not transferable through GitHub (re-connect on a new Claude account): Claude login, GitHub connection + Claude GitHub App, World Labs Atlas connector sign-in, the Marble World API key (secure credential form only), cloud-environment settings, running processes. See `backups/TOOL_MANIFEST.json`.

# Rainbow bootstrap report — BOOTSTRAP PROBLEMS

Generated 2026-11-22 02:17 UTC by `scripts/claude-bootstrap.sh` (mode `background`) on branch `ccr-50ff6f57-q5me82`.
The commit that contains this file is the backup itself, so its SHA is not written here; use `git log -1 -- backups/BOOTSTRAP_REPORT.md`.

| Step | Result | Details | s |
|---|---|---|---|
| Repository + branch | OK | josiahscalia5-dev/rainbow- on ccr-50ff6f57-q5me82 @ 27838b9 (session started from ccr-1a97503a-p221vc) | 0 |
| Resume newest work | FAIL | git fetch from GitHub failed (network / GitHub connection?) | 240 |
| Backup gap since last session | WARN | GAP: no backup ran from 2026-11-22 01:58 to 2026-11-22 02:11 UTC (0.2 h) - no Claude cloud environment with the autosave was active. Nothing can be saved while an environment is closed; the newest saved state is 27838b9.; previous session ended WITHOUT an end-of-session backup (its environment closed after an automatic save); 27 gap(s) > 10 min in the last 72 h of the autosave log, longest 11-19 02:57-18:04 UTC (15.1 h) | 0 |
| Git LFS binaries (local) | OK | 327/327 real files (models, APK, kit ZIP, Marble splats/PLY/colliders/.blend), git lfs fsck OK | 3 |
| Git LFS on GitHub | OK | 327/327 LFS objects (2104 MB, 28 Marble/World Labs) confirmed on GitHub LFS | 3 |
| Approved references | OK | 13/13 byte-identical (scripts/reference.sha256, incl. the official cartoon-girl reference) | 0 |
| Game: 11 screens + code | OK | 11 approved screen references 01-11, source tree src/ (51 files), Android project android/, characters assets/models/*.glb | 0 |
| Specialist agents | OK | 10/10 specialist definitions present; all SHA-256 unchanged; running: _note, s1_visual, s2_swim, s3_camera, s4_qa, s5_builder | 0 |
| Marble World Labs assets | OK | both worlds complete: 49 files checked, 15 real LFS binaries (splats/PLY/colliders/.blend), 107 files tracked under qa/worldlabs; credits spent 1810 of cap 6250 | 1 |
| World Labs integration | WARN | Marble API key authenticated (free read: 2030 credits); worlds draft 404, full 404; no paid job started; plugin worldlabs@worldlabs installed now; Atlas connector = claude.ai connector (check in Claude: ToolSearch World_Labs_Atlas); no paid job started | 6 |
| Node.js | OK | v22.23.5, npm 10.9.9 | 2 |
| npm dependencies | OK | npm ci done (99 packages; cache ~/.npm reused) | 6 |
| Python QA libraries | OK | installed: opencv-python-headless scipy; Python 3.13.18; required numpy+Pillow OK; optional cv2+scipy OK | 12 |
| Playwright + Chromium | OK | headless Chromium 157.0.8103.78 with WebGL2 (SwiftShader); preinstalled, never reinstall | 4 |
| ffmpeg / ImageMagick | OK | ffmpeg 6.1.1-3ubuntu5, ImageMagick 6.9.12-98 (Flow video + image checks) | 4 |
| Blender | OK | Blender 5.3.0 (installed now) at /usr/local/bin/blender; headless bpy test OK | 10 |
| Android build tools | OK | Android SDK platform 34 + build-tools 34.0.0 + platform-tools (installed now, /opt/android-sdk), Java 21, Gradle wrapper gradle-8.2.1; APK: npm run android:debug | 0 |
| Claude hooks / plugins / MCP | WARN | hooks: SessionStart PreCompact Stop SessionEnd; Playwright MCP NOT connected (enable the 'playwright' plugin in claude.ai settings); plugins: code-review context7 design feature-dev frontend-design spaitial-ai superpowers worldlabs ; MCP template .mcp.json.template (no secrets) | 6 |
| Build + game tests | OK | tsc OK; continuity OK (all stage joins gap 0, 07->08 drop 61.19) | 6 |
| Five-minute GitHub autosave | FAIL | AUTOSAVE PROBLEM / branch ccr-50ff6f57-q5me82 / scheduler daemon / last verified backup 2026-11-22T01:57:17+00:00 (19.9 min ago) / local 27838b9 remote none (DIFFERENT) / uncommitted 0   - GAP: last verified backup was 19.9 min ago (2026-11-22T01:57:17+00:00); the environment may have been closed or the scheduler stopped  | 0 |

Not transferable through GitHub (re-connect on a new Claude account): Claude login, GitHub connection + Claude GitHub App, World Labs Atlas connector sign-in, the Marble World API key (secure credential form only), cloud-environment settings, running processes. See `backups/TOOL_MANIFEST.json`.

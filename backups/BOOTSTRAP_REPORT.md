# Rainbow bootstrap report — BOOTSTRAP PROBLEMS

Generated 2026-11-21 14:29 UTC by `scripts/claude-bootstrap.sh` (mode `full`) on branch `ccr-81d66c17-i0ooo8`.
The commit that contains this file is the backup itself, so its SHA is not written here; use `git log -1 -- backups/BOOTSTRAP_REPORT.md`.

| Step | Result | Details | s |
|---|---|---|---|
| Repository + branch | OK | josiahscalia5-dev/rainbow- on ccr-81d66c17-i0ooo8 @ 47dedbc (session started from ccr-c0679182-krbfci) | 0 |
| Resume newest work | FAIL | git fetch from GitHub failed (network / GitHub connection?) | 480 |
| Backup gap since last session | OK | previous save on GitHub: 47dedbc 2026-11-21 14:02 UTC (daemon) on ccr-81d66c17-i0ooo8, ccr-c0679182-krbfci; previous session ended WITHOUT an end-of-session backup (its environment closed after an automatic save); 24 gap(s) > 10 min in the last 72 h of the autosave log, longest 11-19 02:57-18:04 UTC (15.1 h) | 0 |
| Git LFS binaries (local) | OK | 312/312 real files (models, APK, kit ZIP, Marble splats/PLY/colliders/.blend), git lfs fsck OK | 32 |
| Git LFS on GitHub | OK | 312/312 LFS objects (2015 MB, 28 Marble/World Labs) confirmed on GitHub LFS | 2 |
| Approved references | OK | 13/13 byte-identical (scripts/reference.sha256, incl. the official cartoon-girl reference) | 0 |
| Game: 11 screens + code | OK | 11 approved screen references 01-11, source tree src/ (51 files), Android project android/, characters assets/models/*.glb | 0 |
| Specialist agents | OK | 10/10 specialist definitions present; all SHA-256 unchanged; running: _note, s07, s04, s05, benny, s06, s09_s10 | 0 |
| Marble World Labs assets | OK | both worlds complete: 49 files checked, 15 real LFS binaries (splats/PLY/colliders/.blend), 107 files tracked under qa/worldlabs; credits spent 1810 of cap 6250 | 1 |
| World Labs integration | WARN | Marble API key authenticated (free read: 2030 credits); worlds draft 404, full 404; no paid job started; plugin worldlabs@worldlabs installed now; Atlas connector = claude.ai connector (check in Claude: ToolSearch World_Labs_Atlas); no paid job started | 4 |
| Node.js | OK | v22.23.5, npm 10.9.9 | 0 |
| npm dependencies | OK | npm ci done (99 packages; cache ~/.npm reused) | 3 |
| Python QA libraries | OK | installed: opencv-python-headless scipy; Python 3.13.18; required numpy+Pillow OK; optional cv2+scipy OK | 17 |
| Playwright + Chromium | OK | headless Chromium 157.0.8103.78 with WebGL2 (SwiftShader); preinstalled, never reinstall | 1 |
| ffmpeg / ImageMagick | OK | ffmpeg 6.1.1-3ubuntu5, ImageMagick 6.9.12-98 (Flow video + image checks) | 0 |
| Blender | OK | Blender 5.3.0 (installed now) at /usr/local/bin/blender; headless bpy test OK | 2 |
| Android build tools | OK | Android SDK platform 34 + build-tools 34.0.0 + platform-tools (installed now, /opt/android-sdk), Java 21, Gradle wrapper gradle-8.2.1; APK: npm run android:debug | 0 |
| Claude hooks / plugins / MCP | WARN | hooks: SessionStart PreCompact Stop SessionEnd; Playwright MCP NOT connected (enable the 'playwright' plugin in claude.ai settings); plugins: code-review context7 design feature-dev frontend-design spaitial-ai superpowers worldlabs ; MCP template .mcp.json.template (no secrets) | 3 |
| Build + game tests | OK | tsc OK; continuity OK (all stage joins gap 0, 07->08 drop 61.19) | 4 |
| Five-minute GitHub autosave | OK | AUTOSAVE OK / branch ccr-81d66c17-i0ooo8 / scheduler daemon / last verified backup 2026-11-21T14:29:39+00:00 (0.3 min ago) / local af7589c remote af7589c (match) / uncommitted 0 | 17 |

Not transferable through GitHub (re-connect on a new Claude account): Claude login, GitHub connection + Claude GitHub App, World Labs Atlas connector sign-in, the Marble World API key (secure credential form only), cloud-environment settings, running processes. See `backups/TOOL_MANIFEST.json`.

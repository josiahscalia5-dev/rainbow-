# Blender restoration check — account-transfer session 018Sg3AU (2026-11-16 ~23:58 UTC)

Branch `ccr-694bda6a-x58ntq` (created from `b81cc34` = tip of `claude/approved-screen-implementation-g3loqu`).
Blender was NOT in this fresh container; `bash scripts/claude-bootstrap.sh --skip-resume` installed it through
`scripts/setup-blender.sh` (download.blender.org). Script: `verify_blender.py` (same folder), raw results `results.json`.

    blender -b --factory-startup --python qa/tools_check/blender_transfer_s018/verify_blender.py -- qa/tools_check/blender_transfer_s018

| # | Check | Result (this container, actually run) |
|---|---|---|
| 1 | `blender --version` | `Blender 5.3.0`, build date 2026-11-10, `/usr/local/bin/blender` → `/opt/blender/blender` |
| 2 | Runs from the command line | `blender -b --factory-startup --python …` runs headless (≈ 8 s for the whole check) |
| 3 | Python `bpy` | loads (`bpy.app.version_string` = 5.3.0, background mode) |
| 4 | Headless rendering | 3 PNG renders written from `lids05.blend`'s game camera `Cam05_game` at 432 × 768 (50 % of 864 × 1536) |
| 5 | Engines | **Workbench** 1.9 s (`paddles_BLENDER_WORKBENCH.png`), **EEVEE** 3.2 s (`paddles_BLENDER_EEVEE.png`, software GL — harmless `EGL_BAD_MATCH` warnings, no GPU in the container), **Cycles** CPU 16 spp 0.6 s (`paddles_CYCLES.png`; Cycles add-on enabled, image differs from EEVEE, max Δ 73 levels). All three show the six textured paddles. Note: Python's `RenderSettings.engine` enum lists only EEVEE (it is filled dynamically) — engines must be probed by selecting them |
| 6 | All tracked `.blend` files open | **7 / 7**: `marble05_projection.blend` (400,788 faces), `lids05.blend` (6 meshes), `screen05_camera_lock.blend`, `qa/pilot05/wave6/camera_lock/screen05_layout.blend`, `qa/worldlabs/05/blender/screen05_layout.blend`, `draft05.blend`, `full05.blend` |
| 7 | `benny.glb` import | 27 meshes (`fur_body`, `fur_pom`, eyes, blush …), 18 materials, 12 images, 4 actions |
| 8 | `rainbow_girl.glb` import | 165 meshes, 26 materials, 6 images, 9 actions |
| 9 | `lids05.glb` import | 6 meshes `lid05_L1–L3`, `lid05_R1–R3` (the six Blender-built gold paddles), 1 material, 1 texture |
| 10 | GLB export → import keeps the paddle geometry | `lids05.blend` → GLB (992,168 bytes) → re-import: same 6 names; per paddle, triangle count and the SHA-256 of the rounded (0.1 mm) world-space vertex position set are **identical** to the `.blend` AND to the game's `assets/models/lids05.glb` |

**Blender MCP (`mcp-for-blender`)**: not used. It needs Blender's desktop UI to start the add-on's socket server; this
cloud container is headless (no display, no GPU). `claude mcp list` shows no Blender server. All project Blender work
runs through the command line + Python above (modelling, baking, rendering, import/export), which is what the
project's tools use (`tools/proj05/lid_blender.py`, `tools/blender/*`).

**Future sessions:** the SessionStart hook (`.claude/settings.json` → `scripts/autosave-hook.sh` →
`scripts/claude-bootstrap.sh --hook`) starts the background bootstrap, which reinstalls Blender 5.3.0 when missing and
repeats the headless bpy test (row "Blender" in `backups/BOOTSTRAP_REPORT.md`). Re-run this full check with the command above.

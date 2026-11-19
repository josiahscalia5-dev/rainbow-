# Blender check — new Claude account, session 01KS3bZt (2026-11-16 ~22:40 UTC)

User: "Make sure Blender is working and enabled in the session too for my mobile app screen project."

| Check | Result |
|---|---|
| Install | Blender **5.3.0** (build 2026-11-10) at `/opt/blender/blender`, on PATH as `/usr/local/bin/blender` (installed by `scripts/claude-bootstrap.sh` → `scripts/setup-blender.sh`) |
| Headless Python | `blender -b --factory-startup --python …` runs; `bpy` OK |
| Every saved `.blend` opens (`blend_check.py`) | 7 / 7: `marble05_projection.blend`, `lids05.blend` (6 paddle meshes), `screen05_camera_lock.blend`, two `screen05_layout.blend`, `draft05.blend`, `full05.blend` |
| GLB import (`blend_check.py`) | `assets/models/lids05.glb` 6 meshes (`lid05_L1–L3`, `lid05_R1–R3`), `benny.glb` 27 meshes, `rainbow_girl.glb` 165 meshes |
| Render — Cycles CPU (`render_test.py`) | `screen05_camera_lock.blend` from its camera `Cam05`, 432×768, 16 samples, 12.8 s → `screen05_camera_lock_CYCLES.png` (a layout/alignment file: emissive river centre-line + marker spheres, no world light, so it is dark by design) |
| Render — EEVEE (`render_test.py`) | same scene, 23.1 s → `screen05_camera_lock_BLENDER_EEVEE.png`. Works through software GL; the container has no GPU, Blender prints harmless `EGL_BAD_MATCH` warnings |
| Paddles (`paddles.py`) | `lids05.blend` from its game camera `Cam05_game`, 432×768: Workbench texture view `paddles_workbench_texture.png`, Cycles lit `paddles_cycles_lit.png`; texture `assets/textures/tunnel05/lid05.png` and the approved reference are found |
| GLB export round-trip | `lids05.blend` → GLB (992 KB) → re-import: 6 meshes, same names |

A first paddle render came out black: it was this test's mistake (rendered 640×360 landscape through a camera set up for
864×1536 portrait, so the wall paddles were outside the frame; the file also has no lights because the game shows the
paddle texture unlit). Re-rendered correctly above.

**Every future session:** the SessionStart hook (`.claude/settings.json` → `scripts/autosave-hook.sh` →
`scripts/claude-bootstrap.sh --hook`) reinstalls Blender 5.3.0 in the background when the container does not have it
(≈1 min, needs `download.blender.org`) and repeats the headless bpy test (`backups/BOOTSTRAP_REPORT.md`, row "Blender").
There is no Blender MCP connector in this session; Blender is used through its command line + Python, as all the
project's Blender tools do (`tools/proj05/lid_blender.py`, `tools/blender/*`).

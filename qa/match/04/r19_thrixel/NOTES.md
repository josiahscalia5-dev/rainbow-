# Screen 04 — Thrixel single foam-cluster test (round 19, 2026-11-19 19:40–20:15 UTC)

User goal: find out whether Thrixel is useful before spending credits on more assets. One rounded foam cluster that follows the
approved Screen 04 foam (shape + soft look), inspected before any extra detail, imported into a SEPARATE candidate with the
existing camera and lighting; Benny, route, water, controls and all completed work untouched.

## Connection + free allowance (Thrixel MCP connector `https://api.thrixel.com/mcp`, the user's sign-in)
`thrixel_account_status` before: plan **free**, **250 cubes**, runs left this month sculptor 4/4, detailer 4/4, texture 4/4,
rig 4/4 (reset 2026-12-01), concurrency 0/2. Thrixel project **"Rainbow"** (`2bd60336-8ef0-4860-a158-f43aeaeeb9db`) created (free).

## Generation (free allocation only)
* Input: the painted right-bank heap beside Benny, approved frame x 600–864 y 980–1200, cut out onto transparency
  (`../r19_falfoam/input_foamR_rgba.png`; sent as a 384 px WebP data URI, `../r19_falfoam/input_foamR_384.webp`).
* `thrixel_sculpt_model` (organic single-piece subject, own image → no prompt-image charge), prompt "A soft rounded cluster of
  pearly lilac-white soap foam bubbles, glossy cartoon style.", decimation 20,000, texture 1024 →
  submission **`c55e6a88-10db-432c-abaf-3f56e345fee5`**, 5,992 triangles, 1 mesh part, 1.8 MB GLB
  (`foam_cluster_thrixel.glb`; download https://api.thrixel.com/api/v1/c55e6a88-10db-432c-abaf-3f56e345fee5/download?format=glb).
* **Cost: 8 cubes (250 → 242) and 1 of 4 free sculpt runs (4 → 3).** Nothing else spent (no detail / retexture pass).
  (A world-labs upload was used only as a would-be file link — free, no Marble job; it never left "UPLOADING".)

## Inspection (before any extra detail) — `view_front/side/top/three_quarter/back.png` (Blender 5.3 renders)
Front: pearly lilac-white rounded bubbles with a glossy sheen — the right colours. Side: a THIN curved shell
(0.52 × 1.00 × 0.22): the sculptor stood the diagonal painted band upright and made a bubble relief on a sheet, not a rounded
heap. Pink / purple / orange fringe (the water and gold glow behind the painted foam) and a small hole near the top.
A detail pass (14 cubes) would add surface detail, not fix the shape → not spent.

## Integration (separate candidate, URL switch only)
Branch `claude/rainbow-s04-thrixel-c19` from the user-approved preview v2 (`c338978b`), switch **`&m04tfoam=1`** in
`src/world/match04m4.ts` (+ tunables `m04tfx/y` anchor pixel, `m04tfs` size, `m04tft` tilt, `m04tfw` yaw, `m04tfl` lift,
`m04tfo/z` shifts; `m04tfshow=1` forces it visible for the same-camera check). Model `assets/models/thrixel/foam_cluster_s04.glb`
(Git LFS). Placed by casting the approved camera's ray through the painted heap onto the water plane; lit by the game's own
lights + environment map; same visibility rule as the other 3D foam (hidden in the approved view where the painting carries the
heap, fading in as the camera leaves it). Default build and the preview query without the switch: unchanged. tsc clean.
QA tools (read-only): `tools/match04/tfoam_shots04.mjs`, `tfoam_clip04.mjs` (wait until the model has loaded),
`tfoam_probe04.mjs`.

## Result — verdict NOT AN IMPROVEMENT (Thrixel not useful for this asset as made)
* Same camera (approved view), model forced visible — `SAME_CAMERA_NEW/a00_same_camera.png` (tilt 70°), `tune/t40s30.png`,
  `tune/t15s32.png`; crops `approved_crop.png` / `*_crop.png`: the model reads as a standing cut-out card with sharp straight
  edges and pink-purple flaps; its bubbles are small and even, the painted heap is a low wide pile of big glossy separate
  spheres. In the normal game the approved view shows the painting itself (exact), so the model can only add a difference there.
* While swimming (`BEFORE/` = preview v2 query, `NEW/` = + `&m04tfoam=1&m04tft=40&m04tfs=3.0`; f01, f02, f03, f05, steering
  right at 3 u): BEFORE the right bank has the existing 3D foam (puffy white clouds of round bubbles, close to the painted
  heaps); NEW adds a flat, sticker-like lilac sheet with torn jagged edges and a pink-purple stripe on top of them — clearly
  worse, straight and while steering into it. Clip: `NEW_swim_clip_half.mp4` (BEFORE clip = `../r18/preview_v2/swim_clip_half.mp4`).
* Not kept; nothing merged. The switch stays off by default on its own branch.

## If Thrixel is tried again (only with the user's OK; each sculpt = 8 cubes + 1 of the 3 remaining free sculpt runs)
The weak point is the INPUT, not the tool: a diagonal band cut from a painting, with water and glow at its edges, gives a
flat relief. A better test input is ONE clean, isolated, three-quarter view of a single round foam heap on a plain background
(e.g. generated first with `thrixel_sculpt_model` from the prompt alone, ≈ 11 cubes, or a clean painted-style heap image), then
judged the same way. Or use the free `thrixel_transform_model` / local Blender only for placement; the shape problem remains.

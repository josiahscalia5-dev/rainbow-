# Round 44 — ONE connected world, v1: 04 → A Bubble Dash → B Sock Rescue in ONE scene (no page load)

Build: `bash tools/world/setup_world.sh <ws>` → `<ws>/game/play3.html` (= `tools/world/world.html`). Pieces: Screen 04 rebuilt with the kit
(`tools/screenkit/screens/04/`, tunnel ending in the doorway: `--tube-len 22 --open-end`), the Bubble Dash / Sock Rescue section unchanged
(`public/section`, pre-baked), `tools/world/world_layout.py` (placements, ONE route, camera keys = each approved picture's fitted camera, connectors),
`tools/world/blender_connectors.py` (Blender: the chamber's near wall with 04's round doorway, a gold collar, a water strip).

Join 04 → A (user's guide: "glowing chute widens into A; keep forward motion and scale"): 04's gold ring tube (radius 1.18 u) ends in a real doorway
in the Bubble Dash chamber's near wall (the chamber is open behind its picture camera; its walls / ceiling / floor run to z = +2 there), both
waters at y = 0, the route straight on (x continuous), the camera blends from 04's fitted view to Bubble Dash's. Benny: 0.473 u (04) / 0.468 u
(section) — one physical Benny, his float rule blended over ±1.5 u at the join. Route 81.15 u: 04 0–25.15, A + B 25.15–81.15.

## Picture views inside the world vs each area's own page (same pre-baked textures, exact fitted camera, unchanged 20-level threshold)
| view | own page (pre-baked app version) | inside the world |
|---|---|---|
| 04 Five Arrows | 83.7 % (live bake 87.0 %) | 83.8 % |
| A Bubble Dash | 87.8 % (live bake 91.4 %) | 87.4 % |
| B Sock Rescue | 78.6 % (live bake 81.4 %) | 81.3 % |
Joining costs nothing at the picture views. Separately, the app's pre-baked textures cost 3–4 points vs the live bake (to fix in the export).

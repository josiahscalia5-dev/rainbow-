# User's visual correction guides for Screen 05 (2026-11-24, binding visual direction)

Three guides the user made by comparing the ORIGINAL approved Screen 05 (`references/05_flow_into_the_current.png`) with a Unity Game View.
Every Claude account, specialist and Blender / Unity job should use them to understand the wanted geometry, proportions, positions,
materials, lighting and scenery. They are for looking and measuring only: never part of the game.

- `01_full_scene_correction_map.png` - numbered overview (1-8).
- `02_tunnel_geometry_and_materials.png` - rings, paddles, walls, foreground frame (Blender form first, then the Unity metal).
- `03_water_character_and_hud.png` - river + coins, foam + bubbles, Benny + water contact, HUD.

Note: the Unity side shows the still `coord_objs3` (08:07 local), taken while the tunnel specialist's shaders were mid-edit. Its WHITE walls, white near
frame and plum ring edges were never a finished state; the instructions below are what counts. Only the approved image is the measuring target.

| # | Area | What the user wants | Where it is solved |
|---|---|---|---|
| 1 | Gold rings + tunnel alignment | Keep the measured ring centres / placement. Match band width, bevel profile and depth spacing; restore BROAD polished COPPER faces with defined bevels, not glowing tubes. | Blender / Unity geometry + Unity materials |
| 2 | Gold half-moon paddles | WIDE, SHALLOW half-moon trays: a shallow, wide curved block with a rounded rim and a flat visible underside; fit each paddle separately (angle + underside to the wall); avoid pointed or hanging wedge shapes. | Blender / Unity mesh + Claude placement |
| 3 | Perforated purple drum walls | Reflective, saturated MAGENTA-VIOLET metal, elongated DARK recessed slots, narrow bright reflections / streaks and depth. No white striped walls, no uniformly flat colour. | Unity shader / reflections / lighting |
| 4 | S-shaped current + coin trail | Keep the traced S-curve; coins along the playable route. Add BROAD cyan and pink flowing highlights and depth (smooth, directional); SHRINK the large white star sprites into subtle moving glints. | Unity water shader / spline / collectibles |
| 5 | Foam + iridescent bubbles | A narrow, irregular rim of soft clustered foam with mixed puff sizes. Clear, transparent blue-pink iridescent bubbles of varied size floating ABOVE it, not opaque beads across the water. | Unity particles / foam / transparent shaders |
| 6 | Benny + water contact / wake | Keep the approved mascot and beanie. Body aligned with the animated surface, natural waterline, a small bubbly wake with fine droplets / spray; remove any artificial dark (floating) gap. | Unity animation / waterline / wake |
| 7 | Glossy purple HUD | Keep the live counters and buttons. Deep glossy violet glass, thin bright rim, RAISED heart and gold coin, rounded lettering; do not flatten the icons. | Unity UI / sprites / text |
| 8 | Foreground copper-gold frame | Rich copper-gold band with visible edges and directional reflections; correct any white clipping BEFORE adding bloom. | Unity materials / exposure |

General (user, same message): premium lighting; preserve everything already improved; no duplicated work, no restart of the running round; reduce trial
and error; conserve paid credits; keep building the real playable 3D game in Unity, Blender where appropriate; target 90/100 visual similarity;
do not proceed to Screen 06 without the user's approval.

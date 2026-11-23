# Round 48 — SIMPLE candidate of Screen 05 (branch `claude/rainbow-05-simple-candidate-r48`)

A cleaner, simpler version of the same world, built as a **switch** in the existing game: add `look=simple` to the game URL
(`play3.html?look=simple`). Without it the game is exactly as before, so the two versions can be compared side by side. First pass = one
short section of Screen 05 (s 92.5 → 113.3: the approach, the approved camera position at s 97.8, the bend beyond it).
Same route, same controls, same coins, same camera; no geometry changed in this round (the single water surface of round 47 is kept).

## What the candidate is made of (all real 3D surfaces, one consistent material family, no painted pixels)
| part | how it is drawn now |
|---|---|
| washer tunnel | lavender / purple drum metal: staggered rounded oval slots with soft pink-lit rims, gentle lit streaks, a sheen from the surface's own 3D normals; the same material continues into the connector tubes |
| gold rings | the existing rounded Blender rings (`RB_GoldRing`) in polished gold (soft key light + a mirrored warm drum + highlight), with a row of warm lamp studs on the inner face |
| machinery | the existing copper trays / paddles in clean copper, lit the same way |
| water | ONE continuous body of water (same mapping everywhere, also into the connectors): bright cyan river, deep blue toward the banks, broad hot-pink ribbons winding across it in S-curves, soft wide light bands drifting with the flow, a few big soft glints |
| foam | soft white rounded foam banks along the river edges (lavender shading underneath), from the river's edge to the drum wall |
| bubbles | iridescent bubbles along both banks from the start of the section |
| Benny | the existing model; softer light from above + a warm pink rim (rounder look); a soft contact shade on the water under him (fades while he jumps); a white foam collar hugging his waist at the water line; his kick foam now stays at his body instead of floating away in front of the camera (the detached white "paw" puffs of earlier recordings) |

## What was simplified (allowed by the brief)
Painted wall / ring / water textures, tiny water streaks and sparkles, complicated reflections, individual foam bubbles, fine surface texture,
the painted splash detail (the painted spray sprite is kept), and fur detail (not touched).

## Still to improve
* Water near the camera is softer and more pastel than the painting's saturated cyan / pink; the ribbons far away compress into zig-zags.
* The wall pattern is a regular slot grid; the painting's walls are brighter magenta with stronger light.
* Rings are thinner than the painted broad gold bands; the lamps are simple dots.
* Foam banks are uniform white mounds (no bubble clusters).
* Benny: material and contact improved, fur unchanged; splash is the existing painted spray.

## Files
`APPROVED_vs_CANDIDATE.jpg` (your picture beside the candidate at the approved camera), `stills/` (before / at / after the approved camera,
and run frames with both steering extremes and the jump), `run/SECTION_05_SIMPLE_candidate_real_touch.mp4` + `_checks.json`.

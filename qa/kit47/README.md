# Round 47 — Screen 05 focused correction (branch `claude/rainbow-05-continuous-water-r47`) — NOT visually approved

One short playable section of Screen 05: the approach to the old painted-patch boundary (s 92.5), the approved camera position (s 97.8) and the
bend beyond it (to s 113.3), real CDP touch swipes, normal speed (2.2 u/s, 30 fps), both steering extremes (lanes -0.3 / +0.3) and one jump.
Round 46 (`claude/rainbow-screens-05-06-10w5xd`) is untouched and remains the working build.

## What was wrong (inspected in the geometry and the materials, not only in pictures)
The boundary at ~00:03 of the r46 recording was a real construction fault: Screen 05's water was TWO surfaces - the drum-floor pool and a
raised route ribbon (2 cm higher) that began with a straight cut ~1.5 u ahead of Benny - each carrying its own camera-projected bake that only
lines up from the picture camera and that switched to generated "ribbon" water wherever it was magnified (`tools/world/world.html` bakeMix).

## What was replaced
| part | before (r46) | now (r47) |
|---|---|---|
| water geometry | pool + raised route ribbon (two surfaces, a straight cut) | ONE floor water surface at the connectors' height |
| water material | per-mesh picture bake + generated ribbon water, switching by magnification | ONE flow-space river texture for every water texel incl. the connectors (`tools/screenkit/water_strip.py`, `water_ribbon.js` STRIP_GLSL): the approved clean plate re-mapped along the river with the shader's own inverse mapping, continued beyond the painted stretch by image quilting of its sharp part, plus thin broken white streaks and twinkling glints |
| foam | drum-edge foam banks (could lie in Benny's lane) | painted foam taken out of the water texture; instanced 3D foam heaps along the measured inner edges of the painted foam banks, thick out to the wall |
| rings / paddles | painted pixels baked on the ring meshes (blurred close up), wall bake carried painted ring / tray / bubble fragments | physical metal shading from their own normals (reflection, highlight, edge sheen), clean gold; ring spacing refitted to the painted ring depths (2.1 u); the wall bake drops painted ring / tray / bubble / water pixels |

## Functional checks (separate from the look)
| check | section run (285 frames = 9.5 s) |
|---|---|
| touch gestures sent / detected / applied | 9 / 9 / 9 (8 lane changes incl. 2 double swipes, 1 jump) |
| Benny's whole animated body outside the screen | 0 frames |
| hole pixels (green background) | 0 frames (textured); gray geometry run: see `run/SECTION_05_GRAY_geometry_real_touch_checks.json` |
| scenery moving with the camera | none |
| camera step / turn per frame | 0.110 u (limit 0.117) / 0.51 deg |
| water under Benny: frames without / max gap | 0 / 0.012 u (one water surface now) |
| Benny's lean while steering | max 13.2 deg, max change 2.7 deg per frame; camera roll max 0.8 deg |
| coins | 1,330 -> 1,370 (4 coins in this stretch) |

## Visual result - plainly
* FIXED: the painted-patch boundary. Approaching, at and after the approved camera the river is one continuous surface with one material; no
  line, no switch from painted to generated water, in both lanes.
* NOT ACHIEVED: the approved look. At the approved camera the section now looks clearly LESS like the painting than round 46 (the single
  picture-camera pixel score fell from 83.6 % to 20.0 % - not used as proof of anything, but it confirms what the stills show). Visible
  differences, in order of size:
  1. Gold rings: thin orange tubes instead of the painting's broad, glowing gold bands with rows of lamps; the big gold frame at the bottom of
     the picture and the copper trays are barely visible.
  2. Water: softer and smeared - the crisp S-shaped hot-pink ribbons, dense white sparkles and broken reflections of the painting are only
     partly there; close to the camera thin straight white streaks read as speed lines.
  3. Foam: continuous white banks out to the wall; the painting has bubbly clusters with iridescent bubbles beside the river.
  4. Bubbles: almost none (the painting has many iridescent bubbles along both banks).
  5. Splash: present at his water line, but smaller and fainter than the painted spray.

## Why the current pipeline cannot reach the approved look by itself, and what must be replaced before continuing
1. WATER TEXTURE SOURCE. The painting holds enough pixels for a close view only within ~4 u ahead of Benny (measured: >= 1 picture pixel per
   texel to d ~4, 0.2 at d 10). Everything else must be synthesised, and quilting from 2.3 u of painted river cannot invent the crisp ribbons.
   Needed: a dedicated, high-resolution river texture set made to the painting's design (ribbon layout, colours, streak / sparkle style) at
   >= 4 px per cm of river, seamless along the flow - e.g. built from the owner's isolated water artwork `references/water/05_water_isolated_original.png`
   (941 x 1672, not yet used for this) or hand-authored.
2. RING GEOMETRY. The ring asset (`gn_assets.py` RB_GoldRing: a rounded band 0.32 u) reads as a tube. Needed: a new ring profile - a broad flat
   front face with an inner lip and lamp studs - and its own material (gold with lamps), so it looks like the painted rings from every distance.
3. FOAM AND BUBBLES. Needed: foam made of clustered bubble domes of varied size (not uniform heaps) and a set of iridescent bubbles placed along
   both banks through the whole section.
4. The approved-camera exactness and the continuous look are now in tension: r46 matched the picture camera by projecting the painting, which
   created the boundary; r47 removes the projection on water and rings. With 1-3 done, the painted pixels should be used only as the colour /
   layout reference for those new assets, not projected.

## Files
`run/SECTION_05_TEXTURED_normal_speed_real_touch.mp4` (+ `_checks.json`), `run/SECTION_05_GRAY_geometry_real_touch.mp4` (+ `_checks.json`),
`run/section_plan.json`; `stills/APPROVED_vs_BEFORE_AT_AFTER_approved_camera.jpg`, `stills/SECTION_05_run_stills_sheet.jpg`, single frames.

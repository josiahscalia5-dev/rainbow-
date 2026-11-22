# Round 46 — resume here (2026-11-22, session branch `claude/rainbow-screens-05-06-10w5xd`, continues round 45 `ccr-c1b272d2-3ru7yx` @ 94d5fc7)

## User order this round (binding, verbatim essentials)
"CLAUDIA — FINISH MY ORIGINAL APPROVED SCREENS 05 AND 06": fix Benny cut off at the right edge (r45b frames 409-420), richer water
(cyan current, hot-pink ribbons, white highlights, swirl) along the whole watercourse, the polygonal foam bank + pink patch, sharp washer tunnel;
06: natural swimming on the bank, rainbow water throughout (not the failed ribbon06 unchanged), machinery kept, the 06 -> 07 connector holes;
05 -> 06 continuity; measured before / after (picture camera, while swimming: walls / rings / water / foam separately); gray + textured full
recordings with the r45b input plan, zero clipping, no holes, APK. 07-10 not before the user has reviewed 05 + 06. The user also supplied a
code review + candidate patch (`Rainbow_Screen05_Source_Fix.patch`: post-clamp lens-shift guard, qaPickScenery, qaEdgeGuard) — applied, extended.

## What was wrong (found with tools/world/probe_frames.cjs = the same touch plan replayed + qaPickScenery on the exact frames)
| symptom | real cause |
|---|---|
| Benny past the right edge, frames 409-420 (reported ~8 px) | really ~21 px: bennyBox used the rest pose (arms paddle on the GPU); the route swung 0.84 u off the drum axis (fitted through the far painted coins) so with the right lane Benny swam at the floor edge; the cam_axis camera followed 60 % and slid to 0.3 u from the wall; the sideways guard ran BEFORE the wall clamp |
| "large polygonal foam block" in the right lane | `foam_poolR` (straight drum-edge bank, heaps reaching 0.4-0.6 u inward) in Benny's lane at that swing; icosphere level 1 + a 2-D Voronoi shader with straight cell borders |
| "pink patch beside it" | the low-resolution far wall (`tunnelfar_00`) 0.3 u from the lens |
| seams + plain cyan at the start / end of 05 | connector water strips `cwater_B05` / `cwater_056` wore a plain swatch |
| plain cyan in 06 beyond the painted stretch | 06 had no ribbon water (r45 'ribbon06' was off: pastel sheet + pool not drawing — GLSL pow(x<0, 2.0) = NaN) |
| pale shards on the 06 walls, orange smears on the 05 walls | the artwork-sampled wall period fused water / bubble / tray pixels |
| green hole growing to 400 px, frames 1362-1379 | the open far end of the 07 tube (last world area, hands over to 08) seen from the 06 -> 07 connector |

## Fixes (all in the existing tools; free; no credits)
`tools/world/world.html` (deformed bennyBox, post-clamp lens shift with soft knee, cam_axis middle band + damped turn toward Benny on the rest-pose box,
follow_route / follow_lane, round-bubble foam shader (+ fast far path), ribbon connector water `waterMatConn`, bake fade-in at an area start,
`bake_keep_mag`, far-end cap on the last area, qaPickScenery / qaEdgeGuard, lean / roll QA) · `tools/screenkit/water_ribbon.js` (water_rich layers,
06 rainbow band, `rbSq`, connector lateral mode, `ribbonCopy`) · `tools/screenkit/blender_kit.py` (`foam_pool_clear`) · `tools/screenkit/bake.js`
(`tpl_wall_gate`) · `fit05.py` (route soft cap 0.42 u, foam detail 2, cam follow, water_rich, strict wall gate) · `fit06.py` (rich ribbon + rainbow,
strict wall gate, bake_keep_mag 2.2) · `qa.js` (repeat views clear the lens shift) · `section_run.cjs` (EDGEQA, lean / roll smoothness) ·
`tools/world/probe_frames.cjs`, `tools/world/r46_pairs.py` (new).

## Rebuild / check
`python3 -I tools/world/build_world.py <ws>` (cold ~4 min, cached seconds) · previews `node tools/screenkit/preview.cjs <ws>/game <out> --screen 05 --area 05` ·
the true r45b BEFORE build = `git archive 94d5fc7 tools` into a folder whose other entries link to the repo, same builder (see this round's notes) ·
full recordings `TOUCH=1 FRAMEQA=1 EDGEQA=1 node tools/reflock/section_run.cjs <ws>/game <out> run 48 "$(cat qa/kit45/run/swipe_plan_05_06.json)" 's0=88&sentinel=1'` (+ `&gray=1`).
Results + pictures + recordings: `qa/kit46/` (README there).

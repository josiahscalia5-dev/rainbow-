# Round 45 — Screens 05 + 06 with the upgraded automated screen pipeline (2026-11-22)

Everything here is a real-time 3D render of the game (three.js, 412 x 915 phone portrait, software WebGL), never a picture shown as a background.
The approved pictures are painted ONCE onto the real 3D tunnel / rings / water / foam (pre-baked), and the same painting is sampled into
reusable materials so the scenery keeps the approved look where the picture never saw it. Free tools only; no paid credits spent.

## Files
| file | what |
|---|---|
| `STATUS_05_06_approved_vs_game.jpg` | approved 05 / 06 · the game at the approved camera · the game while swimming |
| `BEFORE_NOW_05.jpg`, `BEFORE_NOW_06.jpg` | approved · BEFORE (round 44) · NOW (round 45, inside the connected world): picture view, quarter, middle (left lane), later (right lane) |
| `REPEAT_05_*.jpg`, `REPEAT_06_*.jpg` | the approved camera moved 1, 2, 3 … ring spacings further down the level, each scored against the approved picture |
| `run/` | the uninterrupted 05 -> 06 recordings (real CDP touch swipes incl. hard double swipes, textured + plain gray geometry) and their per-frame checks |
| `timing/` | build reports: old method vs the cached pipeline (cold, no change, look-only change, bake-code change) |
| `Rainbow_r45_world_05_06_debug.apk` | Android debug APK: opening videos -> ONE connected world 04 -> Bubble Dash -> Sock Rescue -> 05 -> 06 -> 07 -> game at 08; on the world's first screen: Start 04 / Start 05 / Start 06 |
| `APP_world_start_screen.png` | the world page loaded from the app build (dist), with the start buttons |

## Measurements (same checker for BEFORE and NOW; scenery = approved picture minus HUD / Benny / coins / bubbles; 20-level threshold unchanged)
| | 05 BEFORE | 05 NOW | 06 BEFORE | 06 NOW |
|---|---|---|---|---|
| approved camera: scenery pixels within 20 levels | 81.0 % (own page) | 80.7 % (in the world) | 86.1 % (own page, unscaled) / 82.0 % (r44 world) | 85.0 % (in the world) |
| approved camera repeated 1..12 rings further (mean) | 12.7 % | 23.1 % | 13.4 % | 16.4 % |
| surfaces while swimming (style match: 70 % colour histogram + 30 % detail vs the same surface in the approved picture) | | | | |
| — walls | 53.2 | **84.7** | 66.8 | **87.5** |
| — gold rings | 38.9 | **63.3** | 55.5 | 55.3 |
| — copper trays | 82.4 | **93.5** | 93.3 | 94.2 |
| — water | 58.4 | 53.3 | 59.9 | 55.3 |
| — foam | 13.2 | 19.3 | — | 19.9 |
| hole pixels (green) in all stills | 0 | 5 (one still) | 0 | 0 |
Water: detail improved (0.28 -> 0.32) but colour fell (0.71 -> 0.63): the river swatch is sampled just ahead of Benny, a stretch with less pink
than the whole painted river -> next: choose the swatch window by colour likeness to the whole painted river; sparkle detail close up.

## Build time (old method re-ran everything on every change)
| case | old method | cached pipeline |
|---|---|---|
| rebuild 05, nothing changed | 29.9 s | 0.75 s |
| rebuild 05, a look value changed (e.g. splash size) | 29.9 s | 0.9 s (no Blender, no bake) |
| a material / water shader change in the page | 29.9 s per screen | 0 s rebuild (page copied) |
| bake / template code changed | 29.9 s (05), 44.4 s (06) | bake only: 05 52.8 s, 06 55.0 s (Blender, masks, fit reused) |
| whole world 04 + 05 + 06 + 07 + checks, after a bake-code change | ~3-4 min (old setup_world.sh, no checks) | 347 s incl. two full preview checks (05: 39 stills + 13 repeats, 06: 37 + 12) |
| geometry (Blender 5.3 + GN asset library) | | 1.1-1.4 s per screen |

## Round 45b — "keep going until it looks like my approved screen" (user, 2026-11-22 ~20:10 UTC)
What looked messy / unlike the approved picture, and what was rebuilt (all inside the ONE connected world, measured with the same checker):
| issue (compared with the approved picture) | fix |
|---|---|
| water: stretched copy of the painting = smeared blotches | **ribbon water** (`tools/screenkit/water_ribbon.js`): clean S-shaped cyan / hot-pink bands measured from the painting, fine streaks, star glints, + the painting's own detail inside each band (`water_detail.py`: seamless cyan / pink tiles cut from the flattened picture) |
| while swimming the camera turned with every bend: tunnel slid sideways, walls filled the screen | **cam_axis**: the camera keeps the approved view straight down the drum and slides with Benny (rings concentric, river winding below) |
| no bright core at the end of the tunnel | camera-relative warm **far glow** under the painted pixels |
| foam: flat white lumps, far from the river | bubble-pattern foam shading; foam banks framing the S-river beyond the painted stretch |
| ghost circles: oversized bubbles at the lens, ripple rings | bubbles fade out near the lens; small ripples |
| Benny tipped over on the banked 06 crest, view tilted | 06: Benny follows a third of the bank (upright, still in the water); level camera |
| 3D extras covering painted scenery at the picture view | repeated trays, foam, extra bubbles only beyond the painted stretch |
| picture sharpness | maximum-quality bake export; the user's 1080 x 1920 copy of the same picture as paint source (`references/hires/`); crisper LOD |
| bugs found on the way | three code comments that swallowed the rest of their line (export wait, world water uniforms, world canvas) - fixed and scanned for |

Numbers now (world): **05 picture view 83.1 %** (80.4 % before this round), **06 picture view 84.8 %**. While swimming (style match vs the same surface in
the approved picture): 05 walls 86.2 / rings 63.8 / water 60.9 / foam 35.9; 06 walls 87.6 / rings 57.6 / water 55.9 / foam 29.8. Water test sheet:
`WATER_TEST_05_approved_current_ribbon.jpg`. Not yet 90 %: remaining gap = fine wall / ring detail at the top of the frame, the far tunnel, 06's
rainbow crest edges beyond the painted stretch (plain cyan there), water still simpler than the painting close up.

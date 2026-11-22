# Reference-Locked 3D Scene Builder (round 40)

Real, connected 3D scenery built to match the user's approved pictures, played with the shared Benny + swipe controls, measured against the
pictures and tested IN MOTION. No forced perspective, no camera-relative depth curve, no live projection, no camera-facing scenery planes,
no screen overlays. Free tools only (Blender 5.3, three.js 0.180, OpenCV); no generation credits.

## Section 1: Bubble Dash Chamber -> golden arch -> Sock Rescue tunnel -> exit (`section.html`)
Pictures (read-only): `references/candidates/bonus_bubble_dash_chamber.webp`, `references/candidates/bonus_sock_rescue_laundry_tunnel.webp`.

| step | file | what it does |
|---|---|---|
| fit | `tools/bonus/fit_sock.py` + `fit_section.py` | camera of EACH picture fitted into ONE world (vanishing point, arch circle, water line, Benny; round-39 ring fit), scaled so the painted Benny has the same height in both; route = the painted river / coin trails; masks of what the game draws itself |
| geometry | `blender_section.py` (Blender headless) | 97 connected meshes with clean UVs -> `section.glb`: tunnel (arch sleeve, funnel, 2.5 u segments), gold rings, arch, bulkhead, side walls, back wall, ceiling, gold outlets + throats, waterfalls, pipes + collars, shirt tank + foam, lifter pods, towel rails + towels, socks |
| bake | `section.html` (at load, or offline for the app) | each picture is projected ONCE from its fitted camera into each mesh's own texture (depth-tested: only surfaces that camera really saw; masked HUD / Benny / coins; clean plates `plate.py` inside the masks at reduced weight); repeated furniture uses the best-seen instance as template |
| sharpness guard | `section.html` shaders | every baked texel stores how many picture pixels per metre it got; where it would be magnified on screen (> 1.3 phone px per picture px) the same-style code material takes over smoothly -> no blur close up, the painted look at the picture's distance |
| play | `section.html` + `tools/kit05/controls.js` + `swimfx.js` | Benny 31 (paddling / kick shader), swipes (lanes 0.3 u), leap / dive, 3D coins, socks mission, 3D foam domes + iridescent bubbles, flowing river shader, chase camera = the two fitted picture cameras relative to Benny, blended smoothly, following his lane |
| QA | `section_run.cjs`, `compare_section.py`, `app_route_check.cjs` | stills at the picture positions + skill `compare_to_approved.py`; full run with a swipe plan and per-frame checks (green-background hole count, Benny box on screen, camera step / turn per frame, static-world audit); in-app route check |
| app | `build_section_app.sh` + `src/game/bonusRoute.ts` | pre-baked section in `public/section/` (-> dist -> APK); the game hands over at the end of 04 and resumes at 05 (only with `VITE_RAINBOW_BONUS=1` / `?bonus=1`; default game unchanged) |

Rebuild: `bash tools/reflock/setup_section.sh <ws>` (fit + Blender + game folder, ~1 min) -> stills
`node tools/reflock/section_run.cjs <ws>/section <out> stills 0,20.204` -> measure
`MASK_BUBBLE=<ws>/section/mask_bubble.png python3 -I tools/reflock/compare_section.py <out>/s0.00_l0.png <out>/s20.20_l0.png <cmp>` ->
full run `node tools/reflock/section_run.cjs <ws>/section <run> run end '<plan json>' 'sentinel=1'` -> app `bash tools/reflock/build_section_app.sh <ws>`,
`VITE_RAINBOW_BONUS=1 npm run android:debug`.

## Reusing it for Screens 04 / 06 / 07 / 08 (after the user approves this section)
Generic and reused as is: the bake (any meshes, any number of fitted picture cameras), the sharpness guard, the masks / plates, Benny +
controls + camera blend, the QA harness and the app packaging. Per screen: a fit (its own measured features -> camera + layout JSON) and a
Blender layout script for its geometry family (ring tube: reuse `blender_section.py`'s tunnel / ring / pod builders; 06 crest, 08 chamber,
09 wave, 10 towel: new builders on the same `grid()` helper).

The earlier Screen-05 physical-tunnel test (`reflock.html`, `bake_phys.py`, `make_page.py`, `setup_reflock.sh`) used the locked Screen-05 picture;
the user then chose these two pictures instead.

# Round 40 — Bubble Dash Chamber → golden arch → Sock Rescue tunnel: a real, connected 3D section of the Rainbow game

User's orders (verbatim): `docs/briefs/2026-11-22-r40/USER_R40.md`. Blueprints = the user's two pictures (unchanged, read-only):
`references/candidates/bonus_bubble_dash_chamber.webp`, `references/candidates/bonus_sock_rescue_laundry_tunnel.webp`. No AI credits spent.

## What was built (all real 3D, tested in motion)
* **One world fitted to both pictures** (`tools/reflock/fit_section.py`): the Bubble Dash camera in the pink chamber, the Sock Rescue camera inside
  the tunnel 20.6 u further on; scaled so the painted Benny has the same height in both (scale 0.987 — the two pictures agree).
* **Blender 5.3 geometry** (`tools/reflock/blender_section.py` → `section.glb`, 3.9 MB, 102 connected meshes): chamber floor, pink side walls,
  bulkhead, back wall, ceiling, the golden arch (thick rounded ring + deep sleeve), a funnel from the arch (radius 2.04) into the Sock Rescue tube
  (radius 0.99) built from 2.5 u segments, 14 gold rings, gold outlet pipes with throats, two waterfalls, five purple pipes with gold collars, the
  shirt tank with gold rims and heaped foam, silver lifter pods, gold towel rails with draped towels, socks, an exit room. Flowing water surfaces
  along the whole route; 3D foam domes and iridescent 3D bubbles.
* **The pictures as textures ON the geometry** (`section.html`): each picture is baked once from its fitted camera into each mesh's own texture
  (depth-tested, HUD / Benny / coins / socks masked, clean plates `plate.py` inside the masks). A sharpness guard replaces painted pixels by the
  same-style code material wherever they would be magnified on screen (no blur close up). Nothing follows the camera.
* **Gameplay**: Benny 31 (paddling / kick shader, painted size), the game's swipe controls (`tools/kit05/controls.js`: lanes ±0.3 u, leap, dive),
  3D coins, the sock mission, chase camera = the two fitted picture cameras relative to Benny (smooth blend), following 80 % of his lane, an
  on-screen guard (his whole body stays in frame) and a tunnel-wall clamp (the camera never leaves the tunnel).
* **In the Rainbow app**: `public/section/` (pre-baked, 25 MB) + `src/game/bonusRoute.ts`: the game hands over at the end of Screen 04 and
  continues at Screen 05 with the coins collected — only in a build with `VITE_RAINBOW_BONUS=1` (or `?bonus=1`); the default game is unchanged.

## Measured (412 × 915 Android portrait, SwiftShader; skill `compare_to_approved.py`, scenery = picture minus what the game draws itself)
| view | scenery px within 20 levels | SSIM | mean diff | colour look |
|---|---|---|---|---|
| Bubble Dash picture position | 91.9 % | 0.88 | 7.4 | 0.99 |
| Sock Rescue picture position | 84.2 % | 0.78 | 11.9 | 0.99 |
Target 90-95 %: reached at the Bubble Dash view (91.9 %), not yet at the Sock Rescue view (84.2 %); what is left is listed below.
Round 40b (after the user's "Continue"): finer bake of the water strip in front of Benny, the painted water streams from the exact picture
position (two-phase flow phase fix), 3D foam domes coloured by the painted foam under them, far tunnel sections keep their own painted pixels
(the sharpness guard still removes them when seen stretched), cyan lattice exit light, foam banks in clumps, towel rails at the painted towel tops.
Pictures: `BUBBLE_DASH_approved_vs_game.jpg`, `SOCK_RESCUE_approved_vs_game.jpg` (+ separate `*_APPROVED.jpg` / `*_GAME.jpg`).

## Continuous gameplay (the whole section, 30 fps, real swipe requests, final code)
`GAMEPLAY_full_section_24s_steering.mp4` (730 frames, 24.3 s, the whole section: chamber -> arch -> funnel rings -> Sock Rescue tunnel -> exit) and
`GAMEPLAY_tunnel_arch_and_gold_rings.mp4` (410 frames: approaching the arch, entering, through the funnel rings and the Sock Rescue rings), both
rendered from the final code with 26 swipe requests (`GAMEPLAY_swipe_plan.json`: hard left / hard right lane changes all the way), a pure-green
background so any hole in the world would show. Automatic checks over EVERY frame (`GAMEPLAY_full_section_24s_steering_checks.json`):
| check | result |
|---|---|
| hole pixels (missing geometry, green background visible) | 0 in all 730 frames |
| Benny's whole posed body inside the frame | 730 / 730 frames |
| scenery meshes that moved while Benny swam (static world audit) | 0 of 123 |
| camera step per frame / turn per frame | <= 0.099 u (= forward travel) / <= 0.57 deg |
| lanes reached | -0.30 ... +0.30 u (both hard sides), 12 coins, 3 socks, 0 page errors |
Fixed during this round because the checks caught them: Benny's arm leaving the frame on hard swipes (camera follow 35 % -> 80 % + on-screen
guard), the camera leaving the tunnel (river line bent by painting-perspective coins; wall clamp), stretched painted pixels on grazing walls
(worst-direction resolution + per-texel best picture).

## Android
`Rainbow_r40_bubble_sock_section_debug.apk` (debug, 88 MB, `VITE_RAINBOW_BONUS=1 npm run android:debug`, Gradle BUILD SUCCESSFUL; the APK carries
the section: 188 files under `assets/public/section/`). In-app route checked on the SAME built files (`app_route_check.json`, `APP_ROUTE_*.jpg`):
end of 04 → section (pre-baked textures) → back at the 05 checkpoint, coins carried, 0 errors. NOT run on a phone or emulator here (no emulator
image / KVM in this container): please install the APK to judge the real-device frame rate and feel.

## What still differs from the approved pictures (honest)
* Water: near Benny and wherever the painted water would be soft, the live river shader draws the water (cyan / magenta bands, streaks,
  sparkles); its band layout is the shader's, not the painted swirls.
* Foam: the painted foam banks are 3D domes placed from the pictures' foam pixels; rounder and simpler than the painted heaps.
* Splash: a painted splash sprite under Benny, smaller than the big white spray in the pictures.
* Tunnel depth: inside the arch and at the far end the real tunnel shows fewer, more regularly spaced rings than the painted (non-perspective) rings,
  and a brighter white exit light instead of the painted cyan grid.
* Towels / socks / pods: simple Blender shapes (the two painted towels carry their painted pixels; later towels repeat them).
* HUD differs (the game's own HUD, no gems / plus buttons / Bubble Blast / Turbo Spin).
* Hand-over 04 → section → 05 is a page load (a short "Building the washer…" screen), not yet one scene graph with the main course.
* Exit: Benny swims out into a plain bright room (white / cyan light, wide water); the pictures do not show what lies beyond the tunnel.

# Round 41 (2026-11-22) — controls, Benny, continuous scenery, HUD (user's prioritised list)
**Priority 1 — one swipe-lane control in the whole game (real touch tested).** The main game (`src/gameplay/input.ts`, `Game.ts`) used
hold-to-steer: the target reset to 0 when the finger lifted, so a quick swipe moved Benny ~0.4 u while the finger was down (measured with real
touch on Screen 06: `SCREEN06_touch_BEFORE_hold_steering.json`). Now the main game uses persistent swipe lanes like the section
(`tools/kit05/controls.js`): a swipe = one lane (1.6 u in the main course), releasing keeps it, a swipe the other way reverses at once,
critically damped glide (~0.3 s, no snap), lean / paddle from his real sideways speed; the QA override (`setSteer`) keeps the old behaviour for
the capture scripts. Real CDP touch gestures (touchStart -> 4 moves -> touchEnd, interleaved with game frames, 412x915):
* original Screen 06: 10/10 swipes detected by the game's input in the right direction, Benny moved the right way 10/10 incl. immediate
  reversals (`GAMEPLAY_screen06_real_touch_swipes.json`, video `GAMEPLAY_screen06_real_touch_9s.mp4`).
* the section: 22/22 gestures detected by its controls (`src: touch`), incl. reversals and a leap (`GAMEPLAY_full_section_real_touch_24s_checks.json`).
**Screen 06 view** (`src/game/cameraRig.ts`, `src/world/environment.ts`): the camera sat low and looked UP into the arch (Benny huge, cut off,
river ahead hidden) -> higher, looking down over the crest; lane follow 0.6/0.7 -> 0.82/0.85 (04 / 06 / 07; approved checkpoint views
unchanged). Gold rings whose hoop crossed the swim passage of Benny + the camera (river under the hoop found along the route) are no longer
placed (11 removed between 06 and 08), and rings near the camera / between camera and Benny fade out with a dither (camera-occlusion rule).
Integration bug fixed: the 04 -> section hand-over fired whenever Benny was past the start of 05 (e.g. a checkpoint at 06); now only on the
frame he crosses into 05.
**Priority 2 — Benny's body.** Diagnostic renders (`BENNY_DIAG_BEFORE_fix_nowater_nosplash_full.jpg`): with the splash hidden his whole round
body and arms show; with the splash on, the splash sprite (drawn with depth-test OFF) covered his lower body -> the cause. Now the splash is
depth-tested behind him at the waterline (`BENNY_DIAG_AFTER_fix_nowater_nosplash_full.jpg`: full body in all three).
**Priority 3 — scenery.** The plain exit room is gone: the Sock Rescue tube continues with the same rings / pods / towels / walls / foam
(6 more ring sections), the level hands over INSIDE the tube, the light is far down the tube. Foam domes are lumpy (noise-displaced), bubbles
brighter, socks rebuilt (leg, heel, sideways foot, closed toe; pink cuff / heel / toe / heart), shorter curved water highlights.
**HUD / abilities.** Each part shows its own picture's HUD: hearts / coins / gems with + badges, pause (working); chamber: title + badge;
tunnel: sock mission + Bubble Blast (magnet for the coins in his lane, 3.5 s, cooldown 9 s) and Turbo Spin (1.6x speed + spin, 2.5 s,
cooldown 11 s). Real finger taps on both buttons: blast +30 coins while active, turbo 7.1 u vs 5.9 u normal; taps never count as swipes.
**Measured now** (reference views): Bubble Dash 90.7 %, Sock Rescue 81.4 %. Sock Rescue was 84.2 % while the splash sprite covered Benny's
body; with his body visible (Priority 2) that view measures 81.4 %.
**Continuous run** (final code, real touch, whole section): 730 frames, 0 hole pixels, Benny on screen 730/730, 0 of 184 scenery meshes
moved, camera turn <= 0.57 deg/frame, 22/22 swipes detected.
**Not done / still different:** Screen 06's tunnel itself (radius 15, the camera rides near its floor: distant rings still read as bars on the
descent) needs the same fitted rebuild as the section; the section -> game hand-over is still a page load (not one scene); the arrangement shows
the "05 · FLOW INTO THE CURRENT" title twice (the Bubble Dash picture carries the 05 caption, then the game's Screen 05): the user decides
whether the section replaces 05's place or keeps a BONUS title; real-device frame rate unverified (no emulator / device here).

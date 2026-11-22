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
| Bubble Dash picture position | 86.8 % | 0.77 | 10.4 | 0.99 |
| Sock Rescue picture position | 84.4 % | 0.79 | 11.9 | 0.99 |
Target 90-95 %: NOT reached yet (measured 84-87 %); what is left is listed below.
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

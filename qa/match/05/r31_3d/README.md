# Screen 05 — REAL 3D forward swimming with the approved look (round 31, 2026-11-21, branch `ccr-4fcad20e-a6pp8w`)

User (2026-11-21, verbatim excerpts): "I AM BUILDING A PLAYABLE 3D ANDROID GAME, NOT AN IMAGE APP OR SLIDESHOW … Benny must actually swim forward …
the gold bands must approach, pass around and behind him … Use my improved 3D Benny … Preserve the existing beautiful painted version as a separate
candidate" / "DO NOT STRAIGHTEN MY APPROVED SCREEN 05 … keep the beautiful winding S-curves … Fix the old pink hall appearing ahead".

## How to see it
`/?match05=1&projflow05=2&benny31=1&tun05=1` (default build unchanged — verified pixel-identical 05/06/07; the painted candidate `?paint=1` and
`?paint06=1` unchanged).
* `benny31=1` (src/characters/benny/benny31.ts, runtime.ts): the improved 3D Benny (qa/benny/r31/) inside the game's own Benny runtime — same swim
  clip bob, ride lift / pitch, steering lean + yaw, placement on the river, wake and splashes; plus a paddle stroke of both arms, pom-pom spring and
  squash in his vertex shader.
* `tun05=1` (environment.ts, course.ts, coins.ts, foam/bubbles/flow05/index/waterRibbon via `look05()`, cameraRig.ts, Game.ts): the approved 05 tunnel is
  REAL all the way — gold rings every 14 u (approved ring band texture), approved purple wall texture bay after bay, a paddle pair per bay, through 05
  and on through 06 into the start of 07 (no checkpoint-only forced-perspective far block, no 06 hall). The river keeps the approved 05 S-curves (05
  route unchanged); 06 continues as the same current with its own S-swing and a long gentle right-hand curve into 07 (no arch hill), same 07 start.
  Approved 05 water (projected), real foam banks and bubbles, the 05 tunnel camera continue through 06; thinner warm-violet haze (the pale pink haze
  washed the real far tunnel out). 06 coins on the river every 6.5 u.

## Proof (`proof/`)
* `NEW3D_SCREEN05_gameplay.mp4` — one uninterrupted normal-speed run (720×1280, 30 fps, 8.6 s): end of 04 → all of 05 → into 06; Benny swims forward,
  paddles, steers (two weaves), collects coins (1,330 → 1,440), rings pass him; continuous (max step 0.46 u), 5/5 hearts, the 3D Benny in every frame.
* `NEW3D_SCREEN05_sideview.mp4` — development camera 15 u to the side (cut-away: the near wall is one-sided): Benny on the river INSIDE the tunnel,
  the gold rings passing around him (edge-on loops), paddles on the far wall.
* `CMP_*.jpg` — APPROVED | BEFORE (game today) | NEW real 3D | painted candidate, same moments. Numbers (below the HUD; pixel / look / colours):
  | moment | BEFORE | NEW real 3D | painted |
  |---|---|---|---|
  | start of 05 | 8.7 / 9.5 / 56.0 | 37.8 / 39.0 / 79.9 | 95.0 / 95.7 / 96.4 |
  | swimming 1.6 s | 5.7 / 6.3 / 55.3 | 11.1 / 11.9 / 74.6 | 93.7 / 93.8 / 96.0 |
  | swimming 3.5 s | 5.6 / 5.6 / 55.6 | 5.0 / 5.1 / 77.5 | 93.8 / 93.8 / 96.0 |
  | end of 05 | 4.2 / 4.2 / 51.7 | 5.6 / 5.9 / 76.3 | 93.9 / 94.0 / 95.4 |
  ("colours" = hue/saturation histogram overlap with the approved picture. In real forward motion the rings and curves are in a different place on screen
  every frame, so pixel / look numbers against ONE still cannot be high while moving — the honest measure here is the colours and the side-by-side.)

## What still differs from the approved picture, and how to restore it (geometry / materials / textures)
1. River design: the approved S-curve pink bands + cyan core exist as texture only around the locked view (s 126–166); elsewhere a 14 u approved tile
   repeats, so the far river reads as patchy cyan. Fix: one long river texture in river coordinates (u across, s along) for all of 05–06, made by
   extending the approved near layer down the river with the same image model used for the painted plates, so its bands follow the route's S-curves.
2. River ahead: the approved view sees the river wind all the way to a tiny vanishing point; in real 3D the tunnel curves away after ~70 u, and the
   river surface sits higher in the frame. Fix: longer straight run of the 05 tunnel (course geometry), and the camera's pitch per position.
3. Far end: a pale warm disk instead of the small bright orange throat with converging rings. Fix: the far glow colour / falloff and a real throat mesh.
4. Walls a little too pink-magenta vs the approved violet; paddles plainer. Fix: the wall bake's colour solve for moving views; the Blender paddle trays
   on every bay.
5. Benny: back = approved; sides plain (the approved picture shows only his back); left arm visibly paddles, the right arm is mostly hidden by the wake.

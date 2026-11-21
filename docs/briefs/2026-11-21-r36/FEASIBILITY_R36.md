# Round 36 (2026-11-21) — can the approved Screen 05 look survive real 3D swimming? Camera-matched projection test

User's order (verbatim excerpts): "TEST THE CAMERA-MATCHED PLAYABLE 3D APPROACH BEFORE ANY MORE MAJOR REBUILDS … Use my original
references/05_flow_into_the_current.png as the visual source of truth … Do not repeat an approach we've already tested unsuccessfully …
Show me one short, genuinely playable proof … Tell me whether this is technically feasible … what we've already attempted, and exactly what
is preventing us … If a fully 3D approach cannot maintain the required likeness, explain whether a hybrid 2.5D/3D approach could … Do not
substitute it without my approval."

## Already attempted (project records)
| round | approach | result |
|---|---|---|
| 31 | `?paint=1` approved picture as a still plate, painted Benny steers, water flows | 82 % px / 93 % look while "swimming", but the scenery never moves forward |
| 32 | `paintswim` 3D Benny swims INTO the still picture | user: he shrinks and disappears |
| 32 | `paintfly` Benny fixed, picture zooms past (2D self-similar ring loop) | straight flight only; double S-river during each cross-fade |
| 31/32c | moving 3D camera over projections / Marble splat world | start 12.7 %, drifted away from the look |
| 33-35 | tunnel kit: the approved pixels projected onto a fitted 3D tunnel + water, depth curve for the painting's 1.52 ring ratio; near the camera they hand over to sharper repeating sections | start 80 % px; in motion colour look 0.92-0.95 but layout drifts |

## This round's test: PURE camera-matched projection (`?proj=1`, kitgame.html)
Every scenery texel stays the approved picture's own pixel at its world place on the fitted geometry (no hand-over to repeating sections,
no added foam domes / bubbles); the camera NEVER rotates (no yaw / roll: the painted vanishing point stays where the painting has it), it
only translates with Benny's river path and lanes. Sharp painted near-water streaks are added live where the projected row is soft
(colours / layout unchanged). Benny, swipes, lanes, leap / dive, coins (the painted coin trail), splashes: the existing gameplay, unchanged.

### Measurement: motion-compensated likeness (`tools/kit05/zoom_likeness.py`)
Moving forward down the painted tunnel reads as the approved picture zooming in about its core; each frame is compared with the best-fitting
zoom of the approved picture (scenery only: below the HUD, Benny's box excluded). Start frame = 80.1 % px within 20 levels, 93.8 % layout.
5-second run, identical real CDP touch swipes (L 0.8 s, R 1.7, R 2.4, L 3.3, leap 3.9, L 4.6 s), every 10th frame:
| span | BEST (round-35 default) px / layout | PROOF `proj=1` px / layout |
|---|---|---|
| 0.03-2 s | 31.8 % / 36.7 % | 33.8 % / 39.6 % |
| 2-5 s | 19.3 % / 21.3 % | 30.8 % / 33.6 % |
Responsiveness identical (every swipe answered in the next frame, lane reached in 0.27 s, no overshoot).
Stills (lane 0): s 2 u: BEST 21.6 % / PROOF 41.1 % px; s 4.5 u: 26.0 / 38.5 %; s 6 u: 17.5 / 29.3 %. Plain colour histogram vs the unzoomed
picture is LOWER for the proof (0.55-0.81 vs 0.92-0.94): a zoomed-in view naturally has a different colour balance than the whole picture.

### What prevents the approved look during real forward movement (measured, `magnif` in this round's notes)
The painting is ONE viewpoint. Water it shows far away has only a few pixels; once the camera swims forward those places are close and must be
stretched. Share of the water on screen stretched beyond the painting's own detail (camera moved s units forward):
| s | <= 2x | 2-4x | > 4x |
|---|---|---|---|
| 0 | 100 % | 0 | 0 |
| 1 | 40 % | 60 % | 0 |
| 2 (1.4 s) | 11 % | 49 % | 40 % |
| 3 | 7 % | 24 % | 69 % |
| 4.5 | 0 | 17 % | 83 % |
| 6 | 0 | 9 % | 91 % |
Plus: (1) the painted river covers ~10 units, the level ~32 -> the rest must repeat or be invented; (2) the painting is not true perspective
(each ring 1.52x deeper) -> the depth curve keeps the rings right but projected own pixels of near rings / paddles ghost once the camera is
well past them (doubled far rings ~4 s in); (3) a camera that turns with the river moves the painted vanishing point off its place
(round 35 added up to 7 deg of turn to pass a test; the proof keeps it at 0).

## Verdict
* Feasible as a SHORT section: the projection proof keeps the painted layout, colours and composition better than the current version for
  the first ~5 seconds, with identical gameplay. It cannot keep the approved look over the whole ~23 s level: by 4.5 units 83 % of the water
  on screen is stretched more than 4x; no amount of camera tuning recovers detail the picture does not contain.
* A full-level 3D version at approved likeness would need NEW painted detail for every place the camera comes close to (an artist or a
  multi-view generated world, i.e. new artwork) — the user has ruled out generated scenery, so this is the hard limit.
* Hybrid 2.5D/3D (NOT substituted — needs the user's approval): keep the camera at (or within ~1 unit of) the painted viewpoint so every
  scenery pixel is shown at its painted resolution; forward motion from the water streaming along the painted river, the rings / paddles
  sliding toward the camera in a seamless self-similar loop (the painting's 1.52 ring ratio makes the tunnel repeat exactly), and coins,
  splashes, bubbles and Benny as real 3D objects on real lanes that follow the painted river near him, with real collisions. Expected
  likeness ~90 %+ on every frame (round 31's plate measured 82 % px / 93 % look with a painted Benny). Limit: the river's painted S-shape
  stays where it is painted; the bends do not travel under Benny.

## Files
`tools/kit05/kitgame.html` (`?proj=1`, `?projdet=`), `tools/kit05/zoom_likeness.py`, `tools/kit05/build_phone.sh` (`PRESET=`),
proof pictures / clips `qa/kit05/r36/`. Playable proof (private): https://claude.ai/artifact/QuYqNSZBhfnZdBEh9DBY2s
Default game and the round-35 version unchanged (`?proj=1` is off by default).

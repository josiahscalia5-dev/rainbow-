# Round 38 (2026-11-21 ~23:55 UTC) — PLAN ONLY: two bonus areas (Bubble Dash Chamber, Sock Rescue) — WAITING FOR THE USER'S APPROVAL

User's order (verbatim excerpts): "I have two new Rainbow gameplay artwork ideas … Bubble Dash: Foam Tunnel Adventure and Laundry Tunnel: Sock
Rescue … additional design candidates. Do not replace, redesign, or overwrite any of my original approved Screens 01–11 without my explicit
approval … USE MY ORIGINAL PINK BENNY IN BOTH SCREENS … please first propose where these two environments could fit as optional bonus
gameplay areas without disrupting the existing 11-screen progression. Then identify which existing Three.js assets, character models, water
shaders, and gameplay systems can be reused … Test a short playable section before reconstructing both environments fully. Do not start
building or spending generation credits until I approve the integration plan."

Candidate artwork (NOT approved screens; the 13 protected references are untouched, `sha256sum -c scripts/reference.sha256` OK):
* `references/candidates/bonus_sock_rescue_laundry_tunnel.webp` (941 x 1672)
* `references/candidates/bonus_bubble_dash_chamber.webp` (941 x 1672)
Both pictures already show the pink Benny (pink fur, striped purple / white hat, pom-pom, yellow star); no yellow character is in these two files.

## Placement (proposal)
| area | where | why it fits |
|---|---|---|
| Bubble Dash Chamber | between 04 and 05 | 04's approved picture already has the pink laundry machinery (shirt-icon machine) around a golden tunnel; the new picture's golden arch opens into a purple perforated tube = 05's tunnel (the picture is even captioned "05 · FLOW INTO THE CURRENT"). Benny lands from 04's arrow slide in the pink chamber, swims past the waterfalls and foam, and enters 05 through the arch. Indoor machine room only, no outdoor world. |
| Sock Rescue | between 06 and 07 | purple perforated tube with gold rings and drum lifters = the washer tube family of 05 / 07; it reads as the first stretch of the washer tube where lost socks drift, before 07's tube and its plunge into 08. |
How "optional": phase 2 inserts them behind a switch (`?bonus=1`), default route unchanged. A true in-play choice (a side gate at a fork that
rejoins the main river) is phase 3 and needs a second path + fork logic; only if the user wants it.

## HUD (consistency)
Keep the existing HUD (hearts 5/5 +, coins, pause, title pill). Leave out the pictures' gem counters (28 vs 36: inconsistent, not in the game),
the "+" on coins and the Bubble Blast / Turbo Spin buttons unless the user asks for them game-wide. Title pill: "BONUS · BUBBLE DASH CHAMBER"
(not "05 ·"). The sock banner ("Rescue 5 lost socks" + 5 sock slots) only while Sock Rescue is active, in place of the title pill.

## Reuse (existing, verified in the repo)
* Benny: `assets/models/benny31.glb` + `assets/textures/benny31/bake.png`, paddling / kick / bob vertex shader (`tools/kit05/kitgame.html`).
* Controls: `tools/kit05/controls.js` (lanes, leap, dive, coin hits; round 37: next-frame swipe response, lane in 0.27 s); main game
  `src/gameplay/input.ts`, `coins.ts`.
* Swim effects: `tools/kit05/swimfx.js` (foam collar, bubble trails, ripples), splash / bubble / glint sprites; main game `src/vfx/`.
* Water: round-37 live river material (`w37` in `kitgame.html`): drawn in river space, sharp at every distance, follows any path, colours
  measured from the user's water art -> the same water in both areas and in 04-10.
* Tunnel: kit tunnel geometry (ring sections + walls) + round-37 option-C code materials (canvas walls, gold rings, 3D paddles) -> Sock
  Rescue tube with round holes and silver lifters, the Bubble Dash arch.
* Course: `src/world/course.ts` (one Catmull-Rom route, stage ranges, `validateContinuity()`), HUD `src/ui/hud.ts`, phone mode
  `tools/kit05/live.js` + `build_phone.sh`, QA `swim_check.cjs`, `s1_stills.cjs`, `tools/kit05/qa/`.

## New pieces (all free: code + local Blender 5.3; no generation credits)
Bubble Dash: pink perforated chamber walls (canvas, round holes), gold / purple pipes (tube geometry), two gold pipe mouths with animated
waterfalls + splash, foam-topped tank with a shirt label, gold light arch into the tube, extra big bubbles.
Sock Rescue: lavender-purple perforated tube with round holes, gold rings with light panels, silver drum lifters, purple and pink towels on gold
rails (Blender draped cloth or code), 5 floating socks (white with pink heel / toe, heart) as pickups + mission counter, chevron boost strip.
Paid models (Thrixel / Meshy) only if the user asks, with the cost named first.

## Honest limits
Each picture is one viewpoint; as with Screen 05 the areas are built as real 3D scenery styled after the pictures (not the pictures projected):
close in look, not pixel-identical. Real Android frame rate not measurable here (no GPU). Screen 05's A / B / C choice is still open; the bonus
areas would use the B-style live water unless the user decides otherwise.

## Test after approval
One short playable section per area (~8-10 s, real swipes, coins / socks), on the kit test page, default game untouched: APPROVED-CANDIDATE |
NEW stills (start + in motion), clips, private phone link. Suggested order: Sock Rescue first (most reuse), then Bubble Dash (chamber -> tunnel
hand-over). Full build and main-course integration only after the user approves the tests.

## BUILT (2026-11-22 ~00:40 UTC, after the user's approval) — isolated test page, the game and the approved screens untouched
* `tools/bonus/bonus.html` (forked from the kit page) + `tools/bonus/setup_bonus.sh <ws>` -> `<ws>/bonus/play3.html`. `?area=sock` (default) /
  `?area=bubble`. Shared: Benny + paddling / kick shader, controls.js (lanes, leap, dive, coins), swimfx, camera + reference-video movement,
  round-37 live river water. Everything else drawn by code (free): lavender tunnel with round holes, gold rings with glowing panels, silver
  drum lifters, gold towel rails + terry towels (purple bubbles / pink crown), 5 floating socks (rescue = swim into one; mission bar fills;
  "All 5 socks rescued!"), boost chevrons travelling with Benny, pause button (stops the game clock). Bubble Dash: pink perforated chamber,
  purple pipes with gold collars, two gold pipe mouths with animated waterfalls, foam-topped shirt tank, golden arch into the tunnel, heaped
  3D foam, big bubbles; HUD title "BONUS · BUBBLE DASH CHAMBER" (no gems, no new currency; Bubble Blast / Turbo Spin do not exist in the game).
* Water tuned by measurement (`tools/bonus/water_stats.py`, same change in the round-37 kit water): blue (67,163,243) vs approved (48,163,239);
  Bubble Dash water (57-68,152-154,242) vs its picture (71,140,245), saturation 0.74-0.78 vs 0.78; fine streaks still ~2/3 of the pictures'.
* Evidence `qa/bonus/r38/`: COMPARE_sock_rescue.jpg, COMPARE_bubble_dash.jpg, stills, SOCK_9s_real_swipes.mp4 (5/5 socks, 6 coins, every swipe
  answered next frame, 0 errors), BUBBLE clip when rendered. Phone tests (private): Sock https://claude.ai/artifact/FXY6sg3BMqBdb3yiNieaUN ·
  Bubble https://claude.ai/artifact/4uc39tWfZ3UykRLXoBE1hu
* Honest gaps vs the pictures: towels flatter (hang like banners), lifters simpler, water = clean silky streaks rather than the painted glitter,
  chamber has fewer pipes / less machinery; real phone frame rate not measured. Marble (paid) not used; possible later for the chamber backdrop only.

## ROUND 39 (2026-11-22 ~01:30 UTC): Sock Rescue fixes 1 + 2 (user-approved, free fill)
* Fix 1 `tools/bonus/fit_sock.py`: camera + straight tunnel fitted to the picture's 5 gold-ring openings (yaw 9.1 deg, pitch 9.2 deg,
  camera 0.43 right of / 0.10 above the axis; fitted ring centres within ~10-25 px); evenly spaced rings (S 2.4) + the kit depth curve
  (Z2 4.0) reproduce the painted spacing; water 0.64 below the axis; Benny's path follows the painted coin trail, then the 05 S-bends.
* Fix 2 `tools/bonus/plate_sock.py` + `bonus.html` (FIT39, `?fit=0` = round 38): the picture's own pixels (clean plate: HUD, Benny, splash,
  coins, socks, arrows, buttons, big bubble removed; small holes patched from neighbouring painted water, big holes transparent -> live
  3D water) projected from the picture's camera onto the fitted walls, rings, water, towels, paddles, rails, with a depth test (only
  surfaces that camera saw) and a hand-over to the sharp 3D materials as the camera comes closer (ratio 0.42-0.68). Painted coins, both
  painted socks (painted size) and the big bubble are real objects at their painted places.
* Measured at the picture's view (412x915, scenery = below the HUD minus Benny's box): within 20 levels 9.8 % -> 68.3 %, colour look
  0.554 -> 0.950; Benny's box 8.9 % -> 27.9 % (Benny himself not changed yet).
* Honest limits: in motion the projected walls stretch until the hand-over (visible smear 1-2 s in), then the round-38 code-drawn tunnel
  shows (different towel / wall look); the area around Benny is live water, not the painted water. Next proposed: upscaled matching
  close-up artwork (free) for walls / water, Benny back-projection.
* Evidence `qa/bonus/r39/` (SOCK_APPROVED_BEFORE_NEW.jpg, stills, diff map, clip). Phone test updated in place:
  https://claude.ai/artifact/FXY6sg3BMqBdb3yiNieaUN

## ROUND 39b/c (2026-11-22 ~01:40 UTC)
* 39b: the picture BAKED onto each object once (own UVs, premultiplied; wall panel 1 / ring 1 / the two painted towels / the near paddles are
  the templates for every later one) so the painted look stays while Benny swims; faster hand-over from the live projection (0.75-0.97).
  Measured colour look in motion vs the picture: 3.3 s 0.45 -> 0.70, 2 s 0.32 -> 0.49 (sharpness lower: the picture has few pixels close up).
* 39c (user: "the movements like the video"): frame 0 = the picture's camera; by ~1.3 s the camera glides to the tunnel centre behind Benny
  (full rings all round), the depth curve turns off (normal perspective: rings stream past), projection off (baked look stays), coins visible
  to 24-30 u, swim speed 1.9 (`?camin=`, `?speed=` to tune). Frames `qa/bonus/r39/SOCK_MOVEMENT_like_reference_frames.jpg`.
* Generated inputs kept in `qa/bonus/r39/generated/` (sockfit.json, sock_plate.png, mask) — rebuilt by setup_bonus.sh anyway.

# Screen 04 — round 9 progress (small steps; continues `qa/match/04/r8/PROGRESS.md`)

Kept query at the start of round 9 (r8 steps 1–3): `?match04=1&m04ring=1&m04river=1&m04foam=1&m04bub=1`.
BEFORE pictures of that query at the 12 audit positions: `/home/user/wt/s04/qa/match/04/r9/BEFORE/` (`metrics.txt`).
Every NEW set: `node tools/match04/audit04.mjs <dir> "<query>" <shots>` (same positions and names as BEFORE).
Approved-view check: deterministic `node scripts/capture.mjs 04 --q=<query>` + `tools/match04/metrics04.py`.

## Step 1 — `&m04mouth=1` — the approved gold washer opening with its glowing bulbs (kept)
* **What looks better while swimming:** the washer opening Benny swims toward is no longer a flat, matte orange
  "marquee" arch with a row of evenly spaced orange dots. It is now the painted opening itself: a thick POLISHED gold
  band with a thin bright outer lip and a bright inner lip, bright yellow-white glow at the top, warm vertical light
  glows across the band, the dark groove inside it, and its glowing bulbs sitting on the lips exactly where the
  approved picture paints its hot lights (warm white cores with soft amber halos, crisp at every distance). The ring
  keeps this look from the approved view all the way in (3 u, 6 u, steering left / right).
* **How:** `tools/match04/mouth04.py` unwraps the approved pixels of the mouth ring through the locked projector on the
  fitted mouth plane, straightens the painted (not perfectly round) band by aligning every angle to the centre's
  profile (continuous path, no jumps), removes the foam overlapping its outer lip, mirrors it past the painted arc
  (under the water line) → `assets/textures/match04/tile_mouth.png`; the 14 painted hot spots on the two lips →
  `mouth04.json` (+ mirrored ones). The modeled opening (new lathe profile, front face 0.15 u proud of the wall,
  rounded lips, inner lip curving into the tunnel) samples it through the projector (homothety onto the painted plane,
  so the approach continues the approved view); the bulbs are camera-facing glow sprites at the painted positions.
* **Approved view unchanged:** deterministic capture → whole frame 81.4 % within 20 levels (SSIM 0.815), scenery
  98.2 % (SSIM 0.974) — same as the kept query (≤ 3 levels on the ring itself; 180 px differ at the ring's water ends).
* **Measured** (`motion_metrics.py`, PALETTE BEFORE → NEW): f03 73.4 → 77.9 %, f06 69.0 → 74.1 %, s_left_steer
  70.3 → 75.8 %, s_right_steer 69.8 → 75.4 % (LAYOUT20 unchanged, 2.8–3.5 %).
* **Still wrong:** the tunnel interior behind the opening (thin, dense, streaky rings; a grey-violet patch and a seam
  on the first ring at the top; the far end is a big orange disc instead of a small bright glow); the laundry room
  above the opening smears when the camera gets close; rings too red-orange; arrows; water under the camera.
* BEFORE: `/home/user/wt/s04/qa/match/04/r9/BEFORE/f03_forward3u.png`, `.../BEFORE/f06_forward6u.png`,
  `.../BEFORE/s_left_steer.png`, `.../BEFORE/s_right_steer.png`
* NEW: `/home/user/wt/s04/qa/match/04/r9/step1_m04mouth/f03_forward3u.png`, `.../step1_m04mouth/f06_forward6u.png`,
  `.../step1_m04mouth/s_left_steer.png`, `.../step1_m04mouth/s_right_steer.png`

## Step 2 — `&m04room=1` — the laundry room stays in view while approaching (kept, modest)
* **What looks better while swimming:** at 3 u the laundry room above the opening now reads like the approved top
  area: the round porthole with its window cross, clouds and bubbles is fully visible below the title (before, it was
  mostly hidden behind the title), the folded pink / blue towels on the wooden shelf and the console with the glowing
  T-shirt display and its two buttons are larger and clearer. The room is now a real space BEHIND the washer opening
  (its own plane 1.8× as far from the approved camera, same approved picture in the approved view), so it recedes
  slowly instead of rushing up out of the frame; the pink basin around the opening stays where it was and passes in
  front of the room as Benny gets closer.
* **Approved view:** unchanged (≤ 6 levels on 11,000 px of the room; whole frame 81.4 %, scenery 98.2 %).
* **Measured** PALETTE step 1 → step 2: f03 77.9 → 77.2 %, s_left_steer 75.8 → 75.7 %, s_right_steer 75.4 → 75.0 %
  (colours unchanged; the gain is the room's layout at 3 u). Tried 2.6× (`&m04roomk=2.6`): the basin covers the room
  sooner — not kept.
* **Still wrong:** beyond ~5 u the basin edge hides the room (geometry: the camera descends the slide); the basin's top
  edge is a hard cut line where it passes in front of the room (visible as a thin diagonal edge under the title when
  steering left).
* BEFORE (= step 1): `/home/user/wt/s04/qa/match/04/r9/step1_m04mouth/f03_forward3u.png`, `.../step1_m04mouth/s_left_steer.png`,
  `.../step1_m04mouth/s_right_steer.png`
* NEW: `/home/user/wt/s04/qa/match/04/r9/step2_m04room/f03_forward3u.png`, `.../step2_m04room/s_left_steer.png`,
  `.../step2_m04room/s_right_steer.png`

## Lead order (2026-11-18): STOP polishing → BLUEPRINT → FOUNDATION
* WIP candidates `&m04foam3` / `&m04pink` / `&m04arr5` (lower foam, pink swirl bands, fat five chevrons) committed
  switch-guarded and UNTESTED/not kept (`b4bd3da4`).
* BLUEPRINT: `/home/user/wt/s04/qa/match/04/r9/BLUEPRINT.md`, overlay `/home/user/wt/s04/qa/match/04/r9/blueprint_overlay.png`,
  numbers `qa/match/04/r9/blueprint04.json` (`tools/match04/blueprint04.py`).

## Foundation `&m04lay=1` — NOT KEPT (cannot work on the fixed course as specified)
* **Static forced perspective (world-fixed, k = 3, `&m04lay=1`, test only):** the opening is still ahead at f10 / f20
  (room, basin, gold opening visible), but the painted pool is 6.8 u below Benny's water, so Benny's path and the
  coins run through the middle of the opening — coins float in mid-tunnel (f10: three coins hanging in the tunnel
  centre), the water under Benny slides at a third of his speed, the pink basin becomes a big smear overhead (f20),
  and inside it is still the corridor (scaled). Not the approved place. Pictures:
  `/home/user/wt/s04/qa/match/04/r9/lay_test/k3scale_f10_forward10u.png`, `.../k3scale_f20_forward20u.png`,
  `.../k3scale_t66_through_screen.png`.
* **Front moving with the camera (approach at 1/4 speed, tried before the user's newest rule):** keeps the approved
  composition ahead until s ≈ 106, but it is exactly the camera-relative illusion the user forbade → rejected, code
  removed; evidence only: `/home/user/wt/s04/qa/match/04/r9/lay_test/moving_front_REJECTED/` (BEFORE of the step-2
  query at the same positions: `/home/user/wt/s04/qa/match/04/r9/lay_test/BEFORE_step2/`).
* **Why (measured):** the composition needs camera height / opening distance = 0.26; the course fixes the height at
  3.39 u, so the composition exists only 13.1 u before the opening (the stage start). Any world-fixed front that is
  bigger/farther breaks the water level (Benny above the painted pool), any front that recedes is camera-relative.
* **Proposal (needs the lead / user):** keep the painted opening at its painted size and place (steps 1–2), and make
  the ≈ 30 u inside the tunnel the PAINTED interior: the painted nested ring bands (broad polished copper-gold bands,
  pink/violet/blue reflections, thin bright lips, dark grooves — unwrapped like the mouth band) as modeled rings with
  the painted spacing look, the painted swirl water (pink bands both sides of a narrow cyan lane), five fat arrows
  ahead of Benny, low foam, bubbles — all world-fixed. The only way to see the OUTSIDE composition for longer is a
  course / checkpoint change (moving the 04 start view later on the slide), which needs the user's permission.

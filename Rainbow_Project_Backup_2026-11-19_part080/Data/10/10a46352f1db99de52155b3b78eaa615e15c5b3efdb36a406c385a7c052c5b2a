# Screen 04 — round 8 progress (small steps, `?match04=1` + sub-switches; default build untouched)

BEFORE pictures (12 audit positions, `?match04=1`): `/home/user/wt/s04/qa/match/04/r8/BEFORE/` (`metrics.txt`).
Every NEW set below is rendered with `node tools/match04/audit04.mjs <dir> "<query>" <shots>` (= the lead's
`tools/lead_r6/motion_audit.mjs`, same positions and names, subset of shots).

## Step 1 — `?match04=1&m04ring=1` — the gold-ring tunnel as real modeled polished rings (kept)
* **What looks better while swimming:** the tunnel ahead is no longer a giant blurred orange glow with smeared rings.
  It is now a long tunnel of crisp, nested polished gold rings — each ring a broad glossy band that brightens toward a
  bright rounded lip with small amber light spots, thin dark grooves between rings — carrying the painted pink, violet
  and yellow reflections of the approved rings (colour taken from the approved picture's own ring, `tile_ring.png`),
  and it narrows to a small bright warm glow far ahead like the painted vanishing point (the tunnel now runs 90 u, so
  the far end is no longer a big flat orange disc). The rings stay sharp at every distance (3 → 35 u), and the gold
  washer opening is a modeled thick gold ring with its row of amber bulbs as Benny approaches it.
* **Approved view unchanged:** deterministic capture `node scripts/capture.mjs 04 --q=match04=1&m04ring=1` →
  whole frame 81.4 % within 20 levels (SSIM 0.814), scenery 98.2 % — identical to `?match04=1`.
* **Measured (moving, vs the approved picture, `motion_metrics.py`)**: PALETTE BEFORE → NEW: f06 73.7 → 67.0 %,
  t33 62.2 → 64.6 %, t66 63.3 → 68.1 %, t95 61.8 → 63.8 %. LAYOUT20 (blurred composition) falls 9.2/7.2/4.6/2.8 →
  3.5/3.3/2.4/2.3 % (the blurred BEFORE haze happens to match broad orange areas of the picture; crisp rings do not).
* **Still wrong:** the water inside the tunnel is still a flat ramp with hard straight edges against the walls (no
  foam banks / bubbles yet); the arrows near the camera are still the magnified soft painted arrow; the rings are a
  little denser and more evenly striped than the painted ones; the washer opening's procedural gold is less detailed
  than the painted one when seen up close at 3–6 u.
* BEFORE: `/home/user/wt/s04/qa/match/04/r8/BEFORE/f06_forward6u.png`, `.../BEFORE/t33_through_screen.png`,
  `.../BEFORE/t66_through_screen.png`, `.../BEFORE/t95_through_screen.png`
* NEW: `/home/user/wt/s04/qa/match/04/r8/step1_m04ring/f06_forward6u.png`, `.../step1_m04ring/t33_through_screen.png`,
  `.../step1_m04ring/t66_through_screen.png`, `.../step1_m04ring/t95_through_screen.png`

## Step 2 — `?match04=1&m04ring=1&m04river=1&m04foam=1&m04bub=1` — wide swirling river, foam clouds, bubbles, crisp arrows (kept)
* **What looks better while swimming:** the tunnel floor is no longer a narrow flat blue ramp with hard straight edges
  against the walls. It is now a WIDE swirling river (the approved water design: pink/magenta swirl bands, cyan
  streams, a deeper electric-cyan centre lane) whose sides curve up to meet the gold walls, flowing down the slide,
  world-anchored, with no visible regular repeat (two offset samples + slow warps). Puffy white foam clouds (lilac
  shading, bright highlights) are piled along both sides where the river meets the wall, iridescent soap bubbles hover
  above the foam and in the tunnel air (fading out before they reach the camera, so no giant discs), and the glowing
  white-cyan chevron arrows are drawn crisp on the centre lane all the way down the tunnel.
* **Approved view unchanged:** deterministic capture with the full step-2 query → whole frame 81.4 % (SSIM 0.815),
  scenery 98.2 % (SSIM 0.973), bands 100.0 / 96.9 / 97.7 % — same as `?match04=1`.
* **Measured** (`motion_metrics.py`, BEFORE → step 1 → step 2): PALETTE f06 73.7 → 67.0 → 67.8 %, t33 62.2 → 64.6 →
  65.2 %, t66 63.3 → 68.1 → 66.4 %, s_right_hard 55.5 → – → 58.7 %. LAYOUT20 stays low (2.6–3.2 %; moving views).
* **Still wrong:** the gold rings read too red-orange / copper with strong magenta streaks (approved: yellow-gold with
  yellow-white highlights and a soft golden far glow); the foam banks are a little too regular (rows of similar
  balls); the arrows are thinner and more numerous than the painted five; the water right under the camera is soft
  (the painted water tile magnified).
* BEFORE: `/home/user/wt/s04/qa/match/04/r8/BEFORE/f06_forward6u.png`, `.../BEFORE/t33_through_screen.png`,
  `.../BEFORE/t66_through_screen.png`, `.../BEFORE/s_right_hard.png`
* NEW: `/home/user/wt/s04/qa/match/04/r8/step2_m04river/f06_forward6u.png`, `.../step2_m04river/t33_through_screen.png`,
  `.../step2_m04river/t66_through_screen.png`, `.../step2_m04river/s_right_hard.png`

## Step 3 — same query as step 2; the foam is now irregular heaped clumps (`&m04foam2=0` = step-2 rows) (kept)
* **What looks better while swimming:** the foam along the river no longer reads as stiff, evenly spaced rows of
  identical white balls (a "cotton-ball fence"). It is now soft, irregular piled clusters: big and small puffs mixed,
  heaped higher in places and low in others, with gaps between clumps, some heaped up the lower wall and some spilling
  into the river, shaded white on top with lavender-blue and pink in the shadows — like the painted foam banks.
* **Approved view:** unchanged (the foam only appears once the camera has left the approved view).
* **Measured** PALETTE step 2 → step 3: f06 67.8 → 68.9 %, t33 65.2 → 66.4 %, t66 66.4 → 67.2 %; s_left_hard 58.3
  (BEFORE) → 65.4 %.
* **Tried and NOT kept (candidate only): `&m04gold=1`** — yellow-gold ring ramp with yellow-white highlights and fewer
  magenta tints. It reads more "polished gold", but it moves the tunnel away from the approved picture's measured ring
  colours (the painted bands average about (190, 87, 46), deep orange-gold) and PALETTE fell 7–11 points (f06 60.9,
  t33 56.3, t66 54.7 %); a middle setting (yellow-white lips/highlights + yellow mouth ring, orange bands kept) is next.
* **Still wrong:** rings still carry strong magenta streaks; arrows thinner/more numerous than the painted five; water
  right under the camera soft; heaps sometimes a little too lilac.
* BEFORE: `/home/user/wt/s04/qa/match/04/r8/BEFORE/f06_forward6u.png`, `.../BEFORE/t33_through_screen.png`,
  `.../BEFORE/t66_through_screen.png`, `.../BEFORE/s_left_hard.png`
* NEW: `/home/user/wt/s04/qa/match/04/r8/step3_m04foam2/f06_forward6u.png`, `.../step3_m04foam2/t33_through_screen.png`,
  `.../step3_m04foam2/t66_through_screen.png`, `.../step3_m04foam2/s_left_hard.png`

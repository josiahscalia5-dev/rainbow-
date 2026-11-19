# Screen 08 · Final Spin Chamber — round 12 progress (branch `claude/rainbow-s08-scenery-c12`)

Authority: `references/08_final_spin_chamber.png`. Start = round-11 tip `35b5fc5a` + its unfinished `&m08cup=1` edit.
Kept set at start `K11 = K10&m08ceil=1&m08near=1` with
`K10 = match08=1&coins08px=1&m08bw=1&m08fill=1&m08arch=1&m08swim=1&m08seam=1&m08sill=1&m08towel=1&m08far=1&m08coinv=1`.
Every step is one URL switch on top of the previous kept set; the default build is untouched. Single-position test
renders: `tools/match08/shots08.mjs` (same positions / simulation path as `tools/lead_r6/motion_audit.mjs`). Approved
view check: deterministic `node scripts/capture.mjs 08 --q=<set>` with / without the new switch.
Note: `s_left_hard` frames are not repeatable (Benny touches the left side when steering hard; the hit flash puts a white
haze over some renders and not others) — not used as proof for scenery steps.

## Step 1 — `&m08cup=1` (defect B: spout cup parts the approved view could not see) — KEPT
Kept query: `K11&m08cup=1`
* Cause: the upper-left cup's top-left shoulder and the upper-right cup's top lie behind the gold arch's inner edge in the
  approved view, so while swimming they showed a fallback gold patch / the arch's own gold with a curved seam on the cup.
* What changed (`src/world/match08.ts`, spout materials only): the cups are round, so a cup point the approved view
  missed takes the painted pixels of its mirror point across the vertical plane through the cup axis (and the projector).
  Off the approved viewpoint only: approved view 0 px differ (deterministic capture with / without the switch).
* What looks closer: the big upper-left cup now keeps its pink perforated cap and gold band all the way round its top
  (forward 6 u, forward 10 u, two-thirds through) like the painted cup, instead of a gold wedge with a hard curved seam
  cutting into the cap. The upper-right cup loses the dark kaleidoscope diamond on its top.
* Still wrong: the upper-right cup's very top (hidden on both sides of its axis) still shows a small plain gold wedge with
  a straight edge; both upper cups' undersides are painted on the door wall behind them (the fitted flat discs are seen
  almost edge-on, the painted undersides much more from below — coverage check `tools/match08/cupmask08.py`: the proxies
  cover only ~half of each painted cup) → a cup proxy rebuild (tilted underside) would be the real fix (defect A).
  Tried turning hidden points about the cup axis (±45° / ±90°) for the remaining wedge → purple wall pixels on the cup
  top (the proxy dome is taller than the painted cup), NOT kept.
* Images (separate, full size): `/home/user/wt/s08/qa/match/08/r12/step1_m08cup/1_APPROVED.png`,
  `2_BEFORE_<shot>.png`, `3_NEW_<shot>.png` for `f06_forward6u`, `f10_forward10u`, `t66_through_screen`
  (BEFORE = `K11`, NEW = `K11&m08cup=1`, rendered fresh, same positions).

## Step 2 — `&m08rw=1` (defect B: sideways-smeared near water + straight-edged magenta step, first ≈ 3 u) — KEPT
Kept query: `K11&m08cup=1&m08rw=1`
* Cause: the swim-lane remap (`m08swim`) spreads the painted river's banks to Benny's lane (±2.95 u) using the painted
  river width from `river08.json`. Near the camera that trace followed Benny's splash crest and the arch's gold feet, not
  the banks: it said 0.8–2.5 u while the painted water is ≈ 3–4.5 u bank to bank. So the near water was stretched sideways
  up to ≈ 13× (the long sideways smears) and the stretch jumped where the trace starts (the straight edge in the magenta
  water at the lower left).
* What changed (render remap only — the gameplay path `river08.json` / `src/world/course.ts` is untouched):
  `tools/match08/rivnear08.py` → `assets/textures/match08/river08_near.json` = the bank-to-bank width read by eye on the
  approved picture (rows 1000–1536; rows 1150–1200 skipped, the arch feet hide the banks there), projected on the floor;
  merged with river08 beyond z −285.5. Near the camera the painted gold legs hug the banks, so there the banks are spread to
  ±4.0 u (the frame bottom shows ±3.5 u) — otherwise leg pixels appeared as a gold blob in the bottom-right corner and the
  floor beside the bank as a purple notch at the left edge (both seen in a first try, fixed before keeping).
  Approved view 0 px differ (deterministic capture with / without the switch).
* What looks closer: forward 3 u and one-third through, the water below and beside Benny is now one continuous glossy
  S-river with diagonal streaks and white glints (magenta band on the left, cyan in the middle), like the bottom of the
  approved picture — BEFORE it was a broad magenta smear with sideways streaks and a straight-edged step at the lower left.
  Steering left at 6 u: the stretched bubble at the lower left is gone. Forward 6 / 10 u and steering right: unchanged.
* Still wrong: the streaks are still somewhat wider than painted (the lane is wider than the painted river; centre kept
  1:1, banks spread ≈ 2.5×); the glints of the m08near tile further on are still ≈ 2× painted size; the gold arch legs /
  near walls of the approved picture are not in this view (arch pushed far by m08far — user decision pending from r11).
* Images (separate, full size): `/home/user/wt/s08/qa/match/08/r12/step2_m08rw/1_APPROVED.png`,
  `2_BEFORE_<shot>.png`, `3_NEW_<shot>.png` for `f03_forward3u`, `t33_through_screen`, `s_left_steer`
  (BEFORE = `K11&m08cup=1`, NEW = `+&m08rw=1`, rendered fresh, same positions).

## Step 3 — `&m08drum=1` (defect B: seam at the drum's top corners next to the door) — KEPT
Kept query: `K11&m08cup=1&m08rw=1&m08drum=1`
* Cause: the chamber drum's upper corners beside the door lie behind the gold arch ring in the approved view, so while
  swimming they showed the generic wall fill tile (finer, diagonal slot field) that met the painted rings of the door wall
  (m08ceil) along a soft curved edge above the upper-left cup.
* What changed (`src/world/match08.ts`, drum material only; needs `m08ceil`): a drum point the approved view could not see
  follows the projector ray to the door plane and takes the same painted ring pixels the door wall uses there (m08ceil's
  window of the user's painted wall, by radius around the door) — identical at the drum / door-wall junction, so the rings
  run on from the door wall into the drum instead of meeting a different tile; fades out 8–16 u from the door. Projection
  still wins wherever the approved view saw the drum. Approved view: scenery unchanged (594 px differ, max 12 levels, all
  inside the HUD title text rows 114–161 = font noise; deterministic capture with / without the switch).
* What looks closer: forward 10 u and at the stage end, the wall left of and above the upper-left spout cup is one set of
  curved slot rows continuing the rings around the door, as in the approved picture — BEFORE a patch of finer diagonal
  slots was cut off from the painted rows by a curved line there.
* Still wrong: faint mirror chevrons remain in the slot rows at the top right (m08ceil's mirrored window repeat on the
  door wall itself); the floor / drum junction on the left side shows a hard edge (both BEFORE and NEW).
* Images (separate, full size): `/home/user/wt/s08/qa/match/08/r12/step3_m08drum/1_APPROVED.png`,
  `2_BEFORE_<shot>.png`, `3_NEW_<shot>.png` for `f10_forward10u`, `t66_through_screen`, `t95_through_screen`
  (BEFORE = `K11&m08cup=1&m08rw=1`, NEW = `+&m08drum=1`, rendered fresh, same positions).

## Step 4 — `&m08ring=1` (defect B: mirror chevrons / diamonds in the slot rows, top right) — KEPT
Kept query: `K11&m08cup=1&m08rw=1&m08drum=1&m08ring=1`
* Cause: m08ceil (and now m08drum) continue the painted end wall from one clean window of the user's wall beside the door,
  MIRRORED in angle (12× around) and in radius. The painted slot rows are slightly slanted against the door centre, so every
  mirror line drew a V: kaleidoscope chevrons and diamonds in the slot rows above / right of the door while swimming.
* What changed: `tools/match08/ring08.py` unrolls the SAME window (user's own pixels, angle × radius) into
  `assets/textures/match08/ring08.png/.json` and makes it periodic instead of mirrored (last 20 % of each direction
  cross-faded into the start; 24° period = exactly 15 repeats around, so no seam at the angle wrap). The shader uses it for
  the slot band and beyond (radius ≥ 7.25 u, soft 0.15 u hand-over; chrome rim and gold bulb ring unchanged), with explicit
  mip gradients. Approved view: 0 px differ against the previous kept set (deterministic capture).
* What looks closer: at the stage end, forward 10 u and two-thirds through, the wall above and right of the door shows
  regular concentric slot rows curving round the door like the approved picture — BEFORE kaleidoscope diamonds / X shapes
  and radial mirror lines cut through the rows.
* Still wrong: the continued rows are a little softer than the painted rows next to the door (the source window is small in
  the picture); the upper-right spout cup's top wedge (step 1) is still visible next to it.
* Images (separate, full size): `/home/user/wt/s08/qa/match/08/r12/step4_m08ring/1_APPROVED.png`,
  `2_BEFORE_<shot>.png`, `3_NEW_<shot>.png` for `t95_through_screen`, `f10_forward10u`, `t66_through_screen`
  (BEFORE = `...&m08drum=1`, NEW = `+&m08ring=1`, rendered fresh, same positions).

## Tried — `&m08glint=1` (near-water glints at painted size) — NOT KEPT (NOT AN IMPROVEMENT)
* Tried: the m08near tile at the painted scale in the lane's middle and along the river (banks take up the rest of the lane,
  piecewise like the swim remap). Result at forward 10 u: glints smaller, but the near water then shows visible repeats of
  the same small glints and the magenta / cyan banks are stretched sideways ≈ 3.4× into flat smears; the BEFORE (bold
  glossy strokes ≈ 2× painted size) reads closer to the approved picture's bold near water. Code saved as
  `/home/user/wt/s08/qa/match/08/r12/wip_m08glint_not_kept.patch`, reverted (one honest try; method stopped).

## Tried — `&m08drot=1` (drum wall in the lower spout cups' shadow) — NOT KEPT (NOT AN IMPROVEMENT)
* Defect (B): behind the lower-left spout cup (forward 10 u, two-thirds through) the drum wall the approved view could not
  see shows the generic fill tile (fine diagonal slots) with hard straight edges against the painted wall.
* Tried: a hidden drum point takes the user's pixels from the nearest visible point of the same ring (same depth, turned
  6–42° about the chamber axis). Result: the nearest visible ring points near the floor junction carry painted river foam
  and bubbles (the painted floor / wall boundary does not follow the fitted drum exactly), so foam clusters and bubble
  pieces appeared on the wall; the hard edges stayed. Saved as
  `/home/user/wt/s08/qa/match/08/r12/wip_m08drot_not_kept.patch`, reverted (one honest try; method stopped).

## Tried — `&m08floor=1` (floor parts the approved view missed → the painted floor's own hole grid) — NOT KEPT (NOT AN IMPROVEMENT)
* Tried: `tools/match08/floor08.py` (a hole-grid cell averaged from the cleanest piece of the painted floor, world-anchored
  repeat) as the floor's fallback, with the walls' soft 5 × 5-tap hand-over. Result: the multi-tap visibility test fails on
  the grazing floor (neighbouring taps see nearer floor), so the tile washed over the painted RIVER near Benny (faded grid
  over the water when steering hard right / at the stage end) — clearly worse. The hard-edged wedge behind the lower-left cup
  that this was aimed at turned out to be the DRUM's fill tile (still there). Patch:
  `/home/user/wt/s08/qa/match/08/r12/wip_m08floor_not_kept.patch` (+ tile in `qa/match/08/r12/wip_m08floor/`), reverted.

## Tried — `&m08twin=1` (upper-right cup's doubly hidden top from the upper-left cup) — NOT KEPT
* Filled part of the gold wedge on the upper-right cup's top with the twin cup's pink cap, but a gold wedge and the X-shaped
  seams stayed (the real cause is the proxy shape, step 5) — no clear visible gain. Patch:
  `/home/user/wt/s08/qa/match/08/r12/wip_m08twin_not_kept.patch`, reverted.

## Step 5 — `&m08cupg=1` (defect A: the upper spout cups fell apart into two pieces while swimming) — KEPT
Kept query: `K11&m08cup=1&m08rw=1&m08drum=1&m08ring=1&m08cupg=1`
* Cause (geometry): the approved view sees the two upper cups from BELOW; the painted cups hang well below the fitted rim
  (gold band, then the perforated underside dish, whose far edge is the lowest painted point). The fitted half-domes ended
  at the rim, so the lower half of each painted cup was projected onto the door wall 10 u behind: while swimming it slid
  away from the dome — the cup showed as a dome with a separate floating underside and wall slots in between.
* What changed (`src/world/match08.ts`, upper cups only): each upper cup gets a band (open cylinder, same radius) down to
  the painted underside, and the underside disc moves to the band's bottom. Band height read on the picture: the projected
  far bottom edge = the painted lowest point (UL row 427 → 1.5 u, UR row 464 → 1.55 u). Lower cups (seen from above) are
  unchanged. Approved view: 63 isolated single pixels along the cups' lower outline differ (depth-edge sparkle pixels move;
  the kept set has the same kind elsewhere along the cup outlines), 4,880 px differ by 1–2 levels; no visible change at 1×
  (4× zoom checked).
* What looks closer: forward 10 u, two-thirds through and at the stage end both upper cups are one solid cup — perforated
  cap, gold band and perforated underside dish joined, the stream coming out of the underside — like the painted cups;
  BEFORE the underside floated below the dome with a strip of wall between them.
* Still wrong: the upper-right cup's top still shows the X-shaped gold seams / wedge (hidden behind the arch in the picture);
  the dome is a little taller than the painted shallow cap.
* Images (separate, full size): `/home/user/wt/s08/qa/match/08/r12/step5_m08cupg/1_APPROVED.png`,
  `2_BEFORE_<shot>.png`, `3_NEW_<shot>.png` for `f10_forward10u`, `t95_through_screen`, `t66_through_screen`
  (BEFORE = kept set before this step (`/home/user/wt/s08/qa/match/08/r12/NEW_before_step5/`, 12-shot audit), NEW = `+&m08cupg=1`, same positions).

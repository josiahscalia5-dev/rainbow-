# Screen 08 · Final Spin Chamber — round 11 progress (branch `claude/rainbow-s08-scenery-c11`)

Authority: `references/08_final_spin_chamber.png`. Start = round-10 tip `e1c7d0b7` (+ account-10 debug-only edit, `eed55540`).
Kept set at start `K10 = match08=1&coins08px=1&m08bw=1&m08fill=1&m08arch=1&m08swim=1&m08seam=1&m08sill=1&m08towel=1&m08far=1&m08coinv=1`.
BEFORE = fresh 12-shot `tools/lead_r6/motion_audit.mjs` of K10: `/home/user/wt/s08/qa/match/08/r11/BEFORE/`.
Every step is one URL switch on top of the previous kept set; the default build is untouched. Test renders of single
positions use `tools/match08/shots08.mjs` (same shot positions and simulation path as the lead's audit tool).

## Step 1 — `&m08ceil=1` (defect B: the curved seam / tear in the ceiling above the door) — KEPT
Kept query: `K10&m08ceil=1`
* Cause (debug view `&m08dbg=1`): the arch ring hides the top of the far door wall from the approved viewpoint, so while
  swimming that part (above the door, up to the ceiling) showed a generic tile, cut off from the painted door rings by a
  curved line. The painted end wall is concentric around the door (polar unroll, `tools/match08/ceil08.py` analysis:
  chrome rim, dark band, gold bulb ring, then slot rows).
* What changed: those unseen door-wall parts now take the user's own painted pixels from the SAME distance from the door
  centre, out of a clean window of the painted wall beside the door (left of the door, between the spout cup and its
  stream: 187°–217°), repeated by angle (mirrored, exactly 6 times around); past the slot band the slot rows repeat
  outward. Fades in only away from the approved viewpoint; approved view: scenery unchanged (594 px differ, all inside
  the HUD title text, ≤ 12 levels = font-loading noise).
* What looks closer: the door keeps its complete gold bulb ring and chrome rim over the top while Benny swims, with
  rings of perforated wall around it, as in the approved picture — BEFORE the ring and rim were sliced off by a curved
  line above the door with a flat patch of round holes beyond it (forward 10 u, two-thirds through, stage end).
* Still wrong: the drum's top corners (left and right above the spout cups) still show the old tile with a softer curved
  edge where they meet the door wall; faint mirror chevrons in the slot rows at the top right; the upper-left spout
  cup's top is still cut by a line (its dome lies partly in the arch's shadow).
* Images (separate, full size): `/home/user/wt/s08/qa/match/08/r11/step1_m08ceil/1_APPROVED.png`,
  `2_BEFORE_<shot>.png`, `3_NEW_<shot>.png` for `f10_forward10u`, `t66_through_screen`, `t95_through_screen`.

## Task 2 — lower arch legs while swimming (defect A/E) — TRIED (geometry check), NOT KEPT, no code
* Where the painted lower legs are: rows 800–1180 of the approved picture reach the water only ≈ 6–8 u ahead of the
  approved camera, ≈ 1.2–2 u from the river centre — i.e. at Benny's own depth and INSIDE his steering lane (±2.22 u +
  body ≈ ±2.95 u). The painting shows the moment Benny passes between the legs. Today those pixels lie on the floor
  plane (the fitted ring is a circle whose lower part is under the water), so they pass under the camera by forward 3 u.
* Static options checked with the fitted camera: at the m08far ring depth (≈ 27 u) the water line is at picture row
  ≈ 737, so a leg there is either hidden behind the big near cups (visible only ≈ 0.7 u between the cup underside and
  the water while swimming) or stands in front of painted river / cup pixels (an upright slab carrying river pixels —
  the ghost-slab defect). A leg near its painted depth (6–8 u) is passed within the first 1–3 u and would cut through
  Benny when he steers. The frame-filling legs while swimming would need an arch that travels forward WITH Benny
  (forced perspective, the reviewer's suggestion); because the painted legs stand inside the steering lane, Benny would
  pass through them when steering hard, and it is the "picture following Benny" the user rejected → user's decision,
  not built. m08far (top band + upper legs) stays the best fixed-world framing.

## Step 2 — `&m08near=1` (defect B: smeared, stretched near water while swimming and steering) — KEPT
Kept query: `K10&m08ceil=1&m08near=1`
* Cause: once Benny has swum a few units, the water right in front of the camera shows plate pixels that the approved
  view saw far away and small (the projection is magnified 2–12× there, most at the stage end and when steering), so the
  painted streaks became long blurred smears filling the bottom of the frame.
* What changed (`tools/match08/near08.py` → `assets/textures/match08/near08.png/.json`, floor shader in
  `src/world/match08.ts`): the approved picture's OWN crisp near river band (rows ≈ 1250–1500 below Benny: magenta at
  the left, cyan centre, white glossy streaks and glints) is unrolled into river coordinates (across the river × along
  it), the three bubbles there are filled along the flow (the streaks continue through), the band is made to repeat along
  the river without a mirror seam, and it is laid world-anchored along the painted river (follows the S: centre and
  width from `river08.json`; its foam banks on the swim lane's banks; painted proportions kept, no stretch). It takes
  over only where the moving camera sees the projection magnified (measured per pixel on the plain projection), and
  only away from the approved viewpoint: approved view = 594 px differ, max 12 levels, all in the HUD title font
  (deterministic `scripts/capture.mjs 08 --q=` with / without the switch), i.e. scenery unchanged.
* What looks closer: the water in front of and beside Benny is now the painted water — crisp cyan with white glossy
  glints and a magenta band on the left, like the bottom of the approved picture — instead of vertical blurred smears
  (forward 6 / 10 u, two-thirds through, stage end) and instead of a stretched magenta smear when steering hard left
  or right. The S-river further ahead, the banks, foam, cups and walls are unchanged.
* Still wrong: the painted glints are shown about 2× larger than painted (the swim lane is about twice the painted near
  river's width, and the design is scaled evenly rather than stretched); in the first ≈ 3 u (forward 3 u, one-third
  through) the projection is only mildly magnified and keeps its softer streaks plus one straight-edged step in the
  magenta water at the lower left (the swim-lane widening; it was there before); tried an earlier hand-over
  (`m08nearm0=1.25&m08nearm1=2.1`) → double-image ghosting at forward 3 u, NOT kept; tried longer streaks along the
  flow (`m08nearv=1.6`) → glints visibly stretched, NOT kept.
* Benny: sits in the water with his splash at every checked position (forward 6 / 10 u, two-thirds, stage end, hard
  left / right); not sunk, not floating, not hidden.
* Images (separate, full size): `/home/user/wt/s08/qa/match/08/r11/step2_m08near/1_APPROVED.png`,
  `2_BEFORE_<shot>.png`, `3_NEW_<shot>.png` for `f06_forward6u`, `f10_forward10u`, `t66_through_screen`,
  `t95_through_screen`, `s_left_hard`, `s_right_hard` (BEFORE = `K10&m08ceil=1`, rendered fresh, same positions).

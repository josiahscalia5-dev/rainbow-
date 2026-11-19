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

# Screen 08 · Final Spin Chamber — round 13 progress (branch `claude/rainbow-s08-scenery-c13`)

Authority: `references/08_final_spin_chamber.png`. Start = round-12 tip `05ed1bee` (+ account-12 WIP = screenshot moves only,
committed as-is with the first commit).
Kept set at start `K12 = K11&m08cup=1&m08rw=1&m08drum=1&m08ring=1&m08cupg=1` with `K11 = K10&m08ceil=1&m08near=1` and
`K10 = match08=1&coins08px=1&m08bw=1&m08fill=1&m08arch=1&m08swim=1&m08seam=1&m08sill=1&m08towel=1&m08far=1&m08coinv=1`.

* 2026-11-18 round 13 started (washer-environment-modeler, worktree `/home/user/wt/s08`). First task: remaining wrong wedges
  (upper-right cup top, hard diagonal edge at the far top-left corner while swimming).

BEFORE set for round 13 (fresh, kept set K12, 12 shots, `tools/match08/shots08.mjs`): `/home/user/wt/s08/qa/match/08/r13/BEFORE_K12/`.

## Step 1 — `&m08bore=1` + `&m08flange=1` (hard diagonal edges at the top-left of the gold ring while swimming) — KEPT
Kept query: `K12&m08bore=1&m08flange=1`
* Cause 1 (defect A, `m08bore`): the fitted arch is a straight ring; its bore (inner side, 0.9 u deep, x4.2 pushed) is a
  ~40 px band at the top of the approved view, and the painted gold lip ends INSIDE that band — its inner part carried the
  purple chamber wall seen just past the painted ring. While swimming the camera sees the bore much more face-on, so that
  strip became a wide band of wall slots (plus a stray copy of the upper-left cup's cap) inside the gold ring, ending in a
  hard straight diagonal edge (the bore's back edge) at the top-left (forward 6 / 10 u, stage end).
  Cause 2 (defect B, `m08flange`): the inlet pipe (r 2.92) ends at the arch's front face whose outer edge is 0.04 u smaller;
  through that slit the camera saw the entrance wall 3.8 u behind: a thin dark sparkle line along the ring's outer edge in
  the approved view and, while swimming (forward 3 / 6 u), a diagonal sliver of purple slots between the pink pipe wall
  and the gold ring.
* What changed (`src/world/match08.ts`, arch geometry only): `tools/match08/bore08.py` measures per degree where the
  painted gold -> purple boundary lies at the arch's back plane (`assets/textures/match08/bore08.json`; cup sectors,
  frame edges and water not measured -> interpolated / eased back to the fitted radius); the bore becomes a cone from the
  fitted front edge to that boundary, so from the approved view it carries exactly the painted gold lip. A flange in the
  arch's front plane closes the pipe / arch slit.
* Approved view (deterministic `scripts/capture.mjs 08`, with / without): 376 px differ by > 12 levels, all along the
  ring's two edges: the dark sparkle dots along the ring's outer edge are gone (closer to the approved picture), depth-edge
  sparkle pixels along the inner edge moved; no visible change otherwise (3x zoom checked).
* What looks closer: forward 6 u, forward 10 u and at the stage end the gold ring's top-left is one smooth gold ring with
  its inner lip, ending in a curved edge against the purple wall like the painted ring — BEFORE a band of purple slots and
  a ghost cup piece inside the ring cut off by a hard straight diagonal line. Forward 3 / 6 u: the purple sliver between
  the pink outer wall and the gold ring is gone. Stage end: the ring's right-hand outline is a smooth curve instead of a
  jagged polygon edge.
* Still wrong: the upper-right cup's top still shows the gold wedge with X seams; the lower cups show hard straight cuts
  (lower-left band at forward 6 u, lower-right top at forward 10 u); near water glints are still ~2x painted size.
  `s_right_hard` NEW shows the white hit-flash haze (gameplay effect, frames not repeatable — not caused by scenery).
* Verdict: GOOD IMPROVEMENT.
* Images (separate, full size): `/home/user/wt/s08/qa/match/08/r13/step1_m08bore/1_APPROVED.png`, `2_BEFORE_<shot>.png`,
  `3_NEW_<shot>.png` for all 12 audit shots (best: `f06_forward6u`, `f10_forward10u`, `t95_through_screen`,
  `f03_forward3u`) + `2_BEFORE/3_NEW_capture_approved_view.png` (deterministic approved view).

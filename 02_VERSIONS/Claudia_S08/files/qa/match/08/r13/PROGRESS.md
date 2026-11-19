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

## Tried — `&m08urcup=1` (upper-right cup rebuilt as the fitted TILTED twin of the upper-left cup + unrolled painted texture) — NOT KEPT (NOT AN IMPROVEMENT)
* Finding (kept for later): the painted upper-right cup is a twin of the upper-left one drawn TILTED (leaning ~10 deg toward
  the chamber centre, its underside dish seen strongly from below: dish ellipse centre ~(741, 437), half-width ~72 px) and
  mostly hidden behind the arch; the fitted proxy is an upright, narrower half-dome (axis x 713 vs painted ~745). Mirroring
  the tilted painted band about the upright axis is what draws the X; the doubly hidden top is the gold wedge.
* Tried: least-squares fit of a tilted cup (rx = the upper-left twin's 3.0 u, dome 2.0 u, band 0.85 u, roll 9.8 deg,
  pitch -10.9 deg, rms 2.35 px against the traced dish outline / cap-band line / cap outline) with an unrolled texture of
  its painted pixels (mirror + continuation + a cap tile cut from the painted cap). Result: the cup's FRONT CENTRE (what the
  swimming camera mostly sees) was never painted (behind the arch) -> forward 6 u / two-thirds through the cup front became
  a repeated cap tile, the underside a radial starburst, the gold band vanished. Clearly less like the painted cup than the
  upright mirror version. Patch: `/home/user/wt/s08/qa/match/08/r13/wip_m08urcup_not_kept.patch` (+ tool, texture and two
  NEW frames in `/home/user/wt/s08/qa/match/08/r13/wip_m08urcup/`), reverted.

## Step 2 — `&m08cupw=1` (gold wedge + X seams on the upper-right cup's top) — KEPT
Kept query: `K12&m08bore=1&m08flange=1&m08cupw=1`
* Cause (defect B): on the upper-right cup the shader decided "painted" by the projector depth test; along the arch's
  inner edge (which crosses the cup diagonally in the approved view) that test passes a few px of the arch's anti-aliased
  gold edge -> hard bright lines, mirrored into an X; where a cup point AND its mirror point are behind the arch (the top
  next to the axis) only the gold patch was left -> the gold wedge.
* What changed (`src/world/match08.ts`, upper-right cup material only, off the approved viewpoint only): `tools/match08/
  cupw08.py` -> `assets/textures/match08/cupw08_mask.png` = the traced painted cup outline (cupmask08 polygons) eroded 2 px.
  A cup point takes its own plate pixel only inside that outline, else its mirror point's (as m08cup), else the painted cap
  copied across the arch edge from just inside it (12 / 24 / 36 px perpendicular to the edge), else the previous colour.
  Tried and dropped inside the step: gold patch as last resort (drew a gold outline round the cup); the copy before the
  mirror on the cap (stepped band copies — the painted band is tilted).
* Approved view: 0 px differ (deterministic `scripts/capture.mjs 08` with / without the switch).
* What looks closer: forward 6 u, forward 10 u, two-thirds through and at the stage end the upper-right cup's top is one
  pink perforated cap like the painted cup — BEFORE a plain gold triangle sat on top, cut by hard bright X lines.
* Still wrong: a soft V remains in the cup's gold band and a faint seam at the cap's centre (mirror of the tilted painted
  band about the upright proxy axis; the real fix would be the tilted proxy, but its front was never painted — see above).
* Verdict: GOOD IMPROVEMENT (small, local).
* Images (separate, full size): `/home/user/wt/s08/qa/match/08/r13/step2_m08cupw/1_APPROVED.png`, `2_BEFORE_<shot>.png`
  (= step-1 kept set), `3_NEW_<shot>.png` for all 12 audit shots (best: `f06_forward6u`, `f10_forward10u`,
  `t66_through_screen`, `t95_through_screen`).

## Round 13 resumed — 2026-11-18 (after the ~15:08 UTC interruption)
* Resumed at `bed281f` (kept set `K12&m08bore=1&m08flange=1&m08cupw=1`). Worktree clean, nothing lost.
* Now on task (a): the S-river and the near water ahead of / around Benny (no sideways stretching / smearing at forward
  6 / 10 / 20 u and hard left / right; one continuous glossy S-river with the painted pink bands, diagonal streaks and white
  glints). Then (b) wall seams, (c) river-edge foam + coin-line shape, (d) soft V in the upper-right cup's gold band.

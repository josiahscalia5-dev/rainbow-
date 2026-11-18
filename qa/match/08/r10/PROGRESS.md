# Screen 08 · Final Spin Chamber — round 10 progress (branch `claude/rainbow-s08-scenery-c10`)

Authority: `references/08_final_spin_chamber.png`. Start = `c0d8c97b`, kept set
`B7 = match08=1&coins08px=1&m08bw=1&m08fill=1&m08arch=1&m08swim=1&m08seam=1&m08sill=1&m08towel=1`.
BEFORE frames = the lead's fresh 12-shot audit of B7 (`scratchpad/audit_c10/08/`), copied next to each NEW frame.
Every step is one URL switch on top of the previous kept set; the default build is untouched.

## Step 1 — `&m08far=1` (defect A/E: the foreground gold arch leaves the frame) — KEPT
Kept query: `B7&m08far=1`
* What changed: the real 3D gold ring (with its inlet pipe and entrance wall) is pushed further along the approved
  camera's own rays (×4.2 instead of ×2.6). From the approved viewpoint it is the same painted arch; while Benny swims it
  is further away, so it grows more slowly and stays in the frame much longer. It now also sits behind the two big near
  spout cups, which is how the picture paints it (the cups overlap the arch's legs). A collar wall behind the ring closes
  a gap where the bigger opening was wider than the drum (otherwise a flat magenta void showed at the left edge).
* What looks closer: at forward 6 u, one-third and two-thirds through the stage the gold arch still frames the chamber
  across the top and down the upper left and right sides, as in the approved picture. BEFORE only small gold corner
  fragments were left at those positions.
* Still wrong: it is static geometry, so by the stage end (t95) only the top corners of the arch remain, and the arch's
  lower legs (below the near cups) are never visible while moving. A static ring cannot frame the whole 12.5 u ride:
  it would have to be ~70 u away (beyond the door) to grow less than 1.2× — see STATUS.md for the numbers.
* Approved view (frozen `scripts/capture.mjs 08`): 54,799 px differ by a few levels (re-sampling of the arch at its new
  depth), 240 px by more than 20 levels; mean error to the approved picture on the changed pixels 5.88 → 5.87 (same).
* Images (separate, full size): `step1_m08far/1_APPROVED.png`, `2_BEFORE_<shot>.png`, `3_NEW_<shot>.png` for
  `f06_forward6u`, `t33_through_screen`, `t66_through_screen`.

## Rejected (not kept): ceiling-seam continuation (defect B) — `m08mirror`, `m08seamc` (code removed)
* Mirror of the painted chamber about the arch's opening edge: ghost copies of the door rim, window and handle above the
  door, sharp diagonal tears. Worse.
* Fill tinted with the painted wall's colour at the opening edge (multiplicative, then additive): rainbow speckles, then
  gold / grey-green cast; the curved line stays visible. Not closer. The seam stays as in BEFORE.

## Step 2 — `&m08coinv=1` (defect C: coin look; positions, count 91, pickup rule and score unchanged) — KEPT
Kept query: `B7&m08far=1&m08coinv=1`
* What changed (only how the nine picture coins are drawn): (1) never larger on screen than the painted nearest coin
  (≈ 5.6 % of the frame height); (2) the pickup "pop" no longer grows ×1.8 and rises over Benny — it shrinks away and
  fades where it overlaps him; (3) a coin Benny has already passed (no longer collectable) fades out instead of sweeping
  past the camera as a frame-filling disc; (4) coins nearer than Benny fade where they overlap him (finished r8 code).
* What looks closer: at forward 10 u there is no longer a big coin over Benny's body; at two-thirds through there is no
  coin on his hat and no huge coin at the frame bottom; at the stage end the coin beside his hat is painted size and the
  huge cut-off coin at the bottom is gone. The river ahead keeps its tidy line of small coins, as painted.
* Still wrong: the coins ahead are 3D gold coins (slightly brighter, flatter than the painted ones); the first coin
  beside Benny is still a little larger than its painted neighbour at some positions.
* Images: `step2_m08coinv/1_APPROVED.png`, `2_BEFORE_<shot>.png`, `3_NEW_<shot>.png` for `f10_forward10u`,
  `t66_through_screen`, `t95_through_screen`.

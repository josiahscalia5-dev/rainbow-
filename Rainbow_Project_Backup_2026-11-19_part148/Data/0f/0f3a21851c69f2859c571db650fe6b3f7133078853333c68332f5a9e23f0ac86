# Screen 05 — round 13 progress (small steps, newest last)

Branch `claude/rainbow-s05-match-c13`, started at `24877989` (= round-12 tip of `claude/rainbow-s05-match-c12`) plus the
account-12 unfinished edit (`src/vfx/proj05Tunnel.ts` wall-slot re-measure, `src/vfx/waterRibbon.ts`; applied, not committed,
not yet verified). Approved picture (the authority): `/home/user/wt/s05/references/05_flow_into_the_current.png`.
Kept set at start (round 12 end):
`?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1&m05flat=1&m05cloud=1&m05wtile=1&m05end=1&m05fmag=1&m05fpaint=1&m05fcloud=1&m05fcoin=1`

* 2026-11-18 round 13 started (water-fx-specialist, worktree `/home/user/wt/s05`). Task 1 first: verify the account-12
  wall-slot edit by eye (start view + swimming) — keep behind its own switch only if clearly closer, else revert.

## Step 1 — `&m05slot=1` (account-12 unfinished wall-slot edit, class B) — NOT AN IMPROVEMENT, reverted
* Tested on the round-12 kept set with `tools/match05/r8_shots.mjs` at a00, f03, f06, f10, f20, s_left_hard, s_right_hard, t33.
* What the edit does: where the wall picture is magnified while swimming, it lifts the blurred painted slot blobs out of the
  metal (local max) and draws crisp slim capsule slots on a measured grid (46.5 round the tube, rows every 1.9 u).
* By eye: start view unchanged (as designed). At t33 / f20 the far bays' messy double pattern of big blurred blobs becomes
  regular rows of slim dark slots — closer there. BUT close to the wall (s_left_hard, f10, s_right_hard) the painted blobs are
  only partly lifted out and stay as a pale ghost grid that is OFFSET from the new slot grid, so the wall shows two slot
  patterns at once (doubled slots), and the new slots look like flat dark stickers without the painted pink rim / glossy edge.
  The brief's condition was "no oversized or doubled slots" → not clearly closer → reverted (`git checkout` of both files).
* Patch kept for reference only (not applied): `qa/match/05/r13/step1_m05slot/m05slot_rejected.patch`.
* APPROVED: `/home/user/wt/s05/qa/match/05/r13/step1_m05slot/1_APPROVED.png`
* BEFORE (kept r12 set): `/home/user/wt/s05/qa/match/05/r13/step1_m05slot/2_BEFORE_s_left_hard.png`, `…/2_BEFORE_f10_forward10u.png`,
  `…/2_BEFORE_s_right_hard.png`, `…/2_BEFORE_t33_through_screen.png`, `…/2_BEFORE_f20_forward20u.png`, `…/2_BEFORE_a00_approved_view.png`
* NEW (+`&m05slot=1`): `/home/user/wt/s05/qa/match/05/r13/step1_m05slot/3_NEW_s_left_hard.png`, `…/3_NEW_f10_forward10u.png`,
  `…/3_NEW_s_right_hard.png`, `…/3_NEW_t33_through_screen.png`, `…/3_NEW_f20_forward20u.png`, `…/3_NEW_a00_approved_view.png`
* Still wrong (walls, kept set): far bays at t33 / f20 show a blurred double blob pattern; near-wall slots are larger and
  softer than the painted slim capsules. A future try must keep the slots at the painted positions (sharpen the painted
  blobs in place) rather than draw a second grid.

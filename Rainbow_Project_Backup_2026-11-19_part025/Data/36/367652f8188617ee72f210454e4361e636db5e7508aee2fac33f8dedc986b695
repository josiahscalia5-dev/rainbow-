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

BEFORE set for round 13 (fresh, exactly the round-12 kept set, `tools/match05/r8_shots.mjs`):
`/home/user/wt/s05/qa/match/05/r13/BEFORE/` (a00, f03…f20, s_left/right_hard, t33, t66, t75, k81 (+left/right), t85, t90,
t95 (+left/right), t98; positions in `shots.json`).

## Step 2 — `&m05join=1` (class B: one continuous river at the seam) — KEPT
* Kept query: `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1&m05flat=1&m05cloud=1&m05wtile=1&m05end=1&m05fmag=1&m05fpaint=1&m05fcloud=1&m05fcoin=1&m05join=1`
* Cause (diagnosed by hiding one layer at a time at t66 / t75: far river, bank foam, apron strip, far clouds): the straight
  line across the river is the far river's first row; the pale strip / slab right below it is on the near ribbon. Where the
  baked far picture F would be magnified, m05fmag still faded the ribbon into F over its last 1.5 u and the far river kept F
  over its first 2.5 u — a narrow band of magnified F (pale smear) between two different pictures of the water.
* Fix (mapping only, no geometry change, no new design): where F would be magnified, no F on either side of the seam. The
  far river wears its painted continuation (the approved near water T2 laid on the far layout, m05fpaint) from its first
  row; over m05blend's band before the seam the ribbon fades (variance-preserving) into exactly that same water (same tile,
  same far layout read from a small float table filled once by match05far.ts, same virtual arc length, same flow phase).
* WHAT LOOKS CLOSER: at t66, t75 and k81 the straight line across the river and the pale slab under it are gone — the
  hot-pink bands and the cyan core run on without a break from in front of Benny into the far river and the throat, as one
  painted S-river. At t85 / t90 the pale smeared slab on the lower left becomes the pink band and cyan water.
* Locked approved view: 0 px (`node scripts/capture.mjs 05 --q=<kept set>` vs `+m05join=1`).
* Still wrong: near foam clusters on the left bank are cut by a straight edge at the seam (t75, k81: the foam clip plane);
  the far left bank is still a flat pale-lilac foam rim (task 3); on the far pink bands T2 is laid narrow, so some short
  streaks there run across the flow (t66 / t85 left) instead of along it.
* APPROVED: `/home/user/wt/s05/qa/match/05/r13/step2_m05join/1_APPROVED.png`
* BEFORE: `/home/user/wt/s05/qa/match/05/r13/step2_m05join/2_BEFORE_t75_through.png`, `…/2_BEFORE_t66_through_screen.png`,
  `…/2_BEFORE_k81_kink.png`, `…/2_BEFORE_t85_through.png`, `…/2_BEFORE_t90_through.png`
* NEW: `/home/user/wt/s05/qa/match/05/r13/step2_m05join/3_NEW_t75_through.png`, `…/3_NEW_t66_through_screen.png`,
  `…/3_NEW_k81_kink.png`, `…/3_NEW_t85_through.png`, `…/3_NEW_t90_through.png`
* Files: `src/vfx/waterRibbon.ts` (M05JOIN, m05join uniforms, jnRow / jnU, fade in the M05BLEND block),
  `src/world/materials.ts` (FMAG_PRE / FPAINT_APPLY without the 2.5-u F ramp under the switch), `src/world/match05far.ts`
  (far layout table), `tools/match05/r13_dbg_shots.mjs` (r8_shots + PRE_JS for layer diagnosis).

## Step 3 — `&m05frim=1` (class A/E: the far banks are foam clouds with the purple wall behind, not a flat pale floor) — KEPT
* Kept query: `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1&m05flat=1&m05cloud=1&m05wtile=1&m05end=1&m05fmag=1&m05fpaint=1&m05fcloud=1&m05fcoin=1&m05join=1&m05frim=1`
* Cause (diagnosed by hiding the far river, then the lather berm, at t95 hard left): the big pale floor behind the foam line
  and the flat pale-lilac wedge of the left far bank are the far river's own foam rim — beyond its water edge it drew a flat
  foam band 1.3 … 9 u wide, out to the tube wall. With the far river hidden, the far tunnel's purple slotted wall comes down
  to the foam line there.
* Fix (no new design): where the far block is live and its baked picture magnified (same weight as m05fmag / m05fcloud), the
  rim shrinks to a narrow scalloped foam strip under the far foam clouds (m05fcloud), and beyond it the far tunnel's own
  purple wall shows, coming down to the foam — foam clouds on the bank, wall behind them, as painted.
* WHAT LOOKS CLOSER: steering hard left at t95 the large pale floor between the foam line and the wall is gone — the purple
  slotted wall now comes down to the line of foam clouds along the left bank. At k81 (left), t85 and t75 the flat pale-lilac
  wedge / band along the left far bank is gone; the foam clouds sit against the wall. t66: small change (thinner pale edge).
* Locked approved view: 0 px (`node scripts/capture.mjs 05 --q=<step-2 set>` vs `+m05frim=1`).
* Still wrong: just behind the foam on the left the far wall's lowest part is a soft pink-violet smear without slots (k81
  left, t95 left); the near lather bank (berm) still ends in a straight cut / square corner at the seam (t75, k81 left) and
  near foam lumps behind the seam are cut by the far block's first row.
* APPROVED: `/home/user/wt/s05/qa/match/05/r13/step3_m05frim/1_APPROVED.png`
* BEFORE (= step 2 set): `/home/user/wt/s05/qa/match/05/r13/step3_m05frim/2_BEFORE_t95_left.png`, `…/2_BEFORE_k81_kink_left.png`,
  `…/2_BEFORE_t85_through.png`, `…/2_BEFORE_t75_through.png`, `…/2_BEFORE_t66_through_screen.png`
* NEW: `/home/user/wt/s05/qa/match/05/r13/step3_m05frim/3_NEW_t95_left.png`, `…/3_NEW_k81_kink_left.png`,
  `…/3_NEW_t85_through.png`, `…/3_NEW_t75_through.png`, `…/3_NEW_t66_through_screen.png`
* Files: `src/vfx/waterRibbon.ts` (M05FRIM), `src/world/materials.ts` (farRiverMaterial: bankW under the switch).

## Item — `&m05lump=1` (scalloped end of the near lather bank at the seam + near lumps shrinking away) — NOT AN IMPROVEMENT
* Tried once on the step-3 set at t66 / t75 / k81 / k81 left / t85 / t95 left: the lather bank (berm) ended 0.5 … 1.9 u
  before the seam in a noise-scalloped edge instead of the flat seam plane, and near bank lumps shrank away whole by the same
  edge. By eye: the pale panel at the seam (t75, k81 left) only gets a little lower with a slightly wavy top — it is still a
  flat pale lilac panel with mostly straight sides — and the shrinking lumps leave a small gap in the foam line. Not clearly
  closer → reverted. Patch + the two comparison pairs kept: `/home/user/wt/s05/qa/match/05/r13/item_m05lump/`.
* What the panel is: the berm's steep outer part where it rises toward the wall, drawn as flat lather; a real fix has to give
  that part the painted foam-cloud look (or keep it out of view), not just move its end.

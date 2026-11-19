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

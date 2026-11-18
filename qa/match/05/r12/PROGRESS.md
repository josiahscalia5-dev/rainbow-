# Screen 05 — round 12 progress (small steps, newest last)

Branch `claude/rainbow-s05-match-c12`, started at `2d9fe975` (= round-11 tip of `claude/rainbow-s05-match-c11`).
Approved picture (the authority): `/home/user/wt/s05/references/05_flow_into_the_current.png`.
Kept set at start (round 11 end):
`?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1&m05flat=1&m05cloud=1&m05wtile=1&m05end=1`

BEFORE set (fresh, exactly that query, `tools/match05/r8_shots.mjs` = the lead's motion_audit positions / stepping):
`/home/user/wt/s05/qa/match/05/r12/BEFORE/` — the 12 audit shots plus the probe positions k81_kink(_left/_right),
t75_through, t85_through, t90_through, t95_left, t95_right, t98_end (positions in `shots.json` there).

## Step 1 — `&m05fmag=1` (round-11 unfinished work, class B: the far river right behind the sliding seam) — KEPT
* Kept query: `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1&m05flat=1&m05cloud=1&m05wtile=1&m05end=1&m05fmag=1`
* Cause: the far block wears the approved picture's far water (baked for the locked eye). Swimming close to the seam
  magnified it 2–4× into a pale, smeared sheet with dark speckle dashes and an angular pale slab on the left.
* Fix (mapping only, geometry untouched): where that baked far water would be magnified and the block is live, the far
  river shows its own continuation of the painted formation (cyan core between the two hot-pink bands, flow lines,
  pale foam rims); the near ribbon keeps its own painted design up to the seam instead of fading into the magnified sheet.
* WHAT LOOKS CLOSER (by eye, APPROVED vs BEFORE vs NEW): at t75, t85, inside the kink (k81) and at t95 the river ahead of
  Benny now reads as the painted S-river — a cyan core between hot-pink bands winding on toward the glowing throat —
  instead of a big pale lilac smear with dark dashes. At t95 the far river is a clean cyan channel with pink banks
  running into the tunnel, like the painting's far river. At t66 the change is smaller (the right half of the far river
  is cyan/pink instead of pale).
* Locked approved view: 0 px (`node scripts/capture.mjs 05 --q=<kept set>` vs `+m05fmag=1`).
* Still wrong: the far continuation is flatter than the painting (fewer crisp white streaks, no foam clouds on its banks,
  the pale foam rims are plain bands); a visible straight line where the near painted ribbon meets the far river at
  t66 / t75 / k81; the angular pale slab on the left at t66 is still there.
* APPROVED: `/home/user/wt/s05/qa/match/05/r12/step1_m05fmag/1_APPROVED.png`
* BEFORE: `/home/user/wt/s05/qa/match/05/r12/step1_m05fmag/2_BEFORE_t75_through.png`, `…/2_BEFORE_t85_through.png`,
  `…/2_BEFORE_k81_kink.png`, `…/2_BEFORE_t95_through_screen.png`, `…/2_BEFORE_t66_through_screen.png`
* NEW: `/home/user/wt/s05/qa/match/05/r12/step1_m05fmag/3_NEW_t75_through.png`, `…/3_NEW_t85_through.png`,
  `…/3_NEW_k81_kink.png`, `…/3_NEW_t95_through_screen.png`, `…/3_NEW_t66_through_screen.png`
* Files: `src/vfx/waterRibbon.ts` (M05FMAG, uFmD0 in the ribbon's F hand-over), `src/world/materials.ts`
  (farRiverMaterial: F weight `fmK`).

## Step 2 — `&m05fpaint=1` (class E/B: the far river's continuation wears the approved painted water) — KEPT
* Kept query: `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1&m05flat=1&m05cloud=1&m05wtile=1&m05end=1&m05fmag=1&m05fpaint=1`
* Cause: after step 1 the far river behind the seam showed its own continuation in flat procedural colours (smooth cyan,
  flat pink, no glints) — the right formation, but not the painted water, and it met the glossy near river with a line.
* Fix (mapping only, no geometry change, no new design): where step 1 drops the magnified far picture, the far water now
  wears the approved near water tile T2 (the painting's own cyan core with white glints and glossy streaks between the
  hot-pink satin bands), laid band by band onto the far layout (T2's left band / cyan core / right band onto the far
  river's own left band / core / right band, so the S keeps winding as before) and along the far river's arc length,
  flowing toward the camera with the near river's own two-phase flow. The foam rims stay.
* WHAT LOOKS CLOSER: from t66 to t95 the river ahead of Benny is now the same glossy painted water as the near river and
  the approved picture — electric cyan with white star glints and long light streaks between hot-pink satin bands —
  all the way into the tunnel, instead of a flat plastic-looking channel. The line where the near river met the far
  river (t75, t85, k81, t90) is much softer because both sides now show the same painted water. At t95 the whole river
  in front of Benny reads as one continuous painted S-river running into the glowing throat.
* Locked approved view: scene 0 px (`node scripts/capture.mjs 05 --q=<step-1 set>` vs `+m05fpaint=1`: 257 px differ, all
  inside the HUD strip y 25–174 = the known HUD outline jitter between runs; nothing below the HUD).
* Still wrong: the left far bank is still a flat pale lilac wedge (t66, t75, k81, t85, t90) where the painting has white
  foam clouds; a faint lighter row remains at the near/far line at t75 / k81; far coins and walls unchanged.
* APPROVED: `/home/user/wt/s05/qa/match/05/r12/step2_m05fpaint/1_APPROVED.png`
* BEFORE (= step 1): `/home/user/wt/s05/qa/match/05/r12/step2_m05fpaint/2_BEFORE_t95_through_screen.png`, `…/2_BEFORE_t85_through.png`,
  `…/2_BEFORE_k81_kink.png`, `…/2_BEFORE_t90_through.png`, `…/2_BEFORE_t75_through.png`, `…/2_BEFORE_t66_through_screen.png`
* NEW: `/home/user/wt/s05/qa/match/05/r12/step2_m05fpaint/3_NEW_t95_through_screen.png`, `…/3_NEW_t85_through.png`,
  `…/3_NEW_k81_kink.png`, `…/3_NEW_t90_through.png`, `…/3_NEW_t75_through.png`, `…/3_NEW_t66_through_screen.png`
* Files: `src/vfx/waterRibbon.ts` (M05FPAINT, shared `m05fpaint` uniforms filled in attachProj05), `src/world/materials.ts`
  (farRiverMaterial: FPAINT_PARS / FPAINT_APPLY before the throat glow).

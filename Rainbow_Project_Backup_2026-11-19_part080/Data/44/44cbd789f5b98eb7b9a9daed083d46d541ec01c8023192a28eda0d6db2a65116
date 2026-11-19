round 14 (account 14) resumed from 9735443d

# Screen 05 — round 14 progress (small steps, newest last)

Branch `claude/rainbow-s05-match-c14` (created from `claude/rainbow-s05-match-c13` @ `ebc9676c`; `-c13` and older are
protected). Approved picture (the authority): `/home/user/wt/s05/references/05_flow_into_the_current.png`.
History of round 13 (kept m05join + m05frim; rejected m05slot + m05lump — never repeat): `qa/match/05/r13/PROGRESS.md`.

Kept set at start (round 13 end, = step-3 set):
`?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1&m05flat=1&m05cloud=1&m05wtile=1&m05end=1&m05fmag=1&m05fpaint=1&m05fcloud=1&m05fcoin=1&m05join=1&m05frim=1`

* 2026-11-18 round 14 started (water-fx-specialist, account 14, worktree `/home/user/wt/s05`). Task 1: judge the restored
  unfinished `&m05vee=1` edit (`src/vfx/waterRibbon.ts`, committed in 9735443d, NOT judged) by eye at start (0 px), f03 / f06 /
  f10 / f20, end, hard left / right against the step-3 set. Then: near water round Benny (task 2), near lather bank straight
  cut at the seam with a method different from m05lump (task 3), 05 -> 06 transition (task 4).
* 2026-11-18 restarted ~16:45 UTC after interrupt (water-fx-specialist, new instance). The previous instance had begun
  capturing `qa/match/05/r14/step1_m05vee/` (untracked, possibly incomplete) — checking each file, re-capturing what is
  missing, then judging `&m05vee=1` (task 1).

## Step 1 — `&m05vee=1` (account-13 unfinished edit: T2's lateral lookup bent onto the painted V behind Benny) — NOT AN IMPROVEMENT, reverted
* Tested on the kept step-3 set with `tools/match05/r8_shots.mjs` (port 5275) at a00, f03, f06, f10, f20, s_left_hard,
  s_right_hard, t33, t66, t98. Locked approved view: 0 px (`node scripts/capture.mjs 05 --q=<kept>` vs `+m05vee=1`).
* By eye: in straight swimming (f03, f06, f10, f20, t33, t66) a hot-pink satin band now runs from Benny's left side down to
  the lower-left frame corner, as painted — closer than the plain cyan sheet before. BUT the right half of the V is missing
  at f03 / f06 / f10 (only at f20 / t66 does a right band show), so the V is lopsided, and at f06 / f10 the left band is a
  very wide, flat magenta mass. Steering hard right a NEW flat pale-violet slab with straight edges appears below Benny
  (beyond the band the lookup is clamped to one fixed tile column). Hard left: the pale smear becomes cyan (better).
  A new flat slab is exactly what the user forbids → not clearly closer → reverted.
* Cause found (for the next try): behind Benny the tile rows 0 … ~420 are read (incl. the ±0.8 u flow), and there T2's right
  pink band lies at u ≈ +0.31 … +0.50 (drifting with the row), not at the assumed +0.06 … +0.25; the clamp beyond each band
  reads a single column (slab). The V is also centred on the river centre, not on Benny when he steers.
* Patch kept (not applied): `/home/user/wt/s05/qa/match/05/r14/step1_m05vee/m05vee_rejected.patch`
* APPROVED: `/home/user/wt/s05/qa/match/05/r14/step1_m05vee/1_APPROVED.png`
* BEFORE (kept step-3 set): `/home/user/wt/s05/qa/match/05/r14/step1_m05vee/before/` (a00_approved_view, f03_forward3u,
  f06_forward6u, f10_forward10u, f20_forward20u, s_left_hard, s_right_hard, t33_through_screen, t66_through_screen, t98_end)
* NEW (+`&m05vee=1`): `/home/user/wt/s05/qa/match/05/r14/step1_m05vee/new/` (same names)

## Step 2 — `&m05vee2=1` (task 2: the near water behind / round Benny while swimming = the painted V) — GOOD IMPROVEMENT, kept
* Kept query: `<step-3 set>&m05vee2=1` =
  `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1&m05flat=1&m05cloud=1&m05wtile=1&m05end=1&m05fmag=1&m05fpaint=1&m05fcloud=1&m05fcoin=1&m05join=1&m05frim=1&m05vee2=1`
* Method (different from the rejected m05vee): only the lateral coordinate at which the crisp near tile T2 is read behind
  Benny changes — no new picture, no colour change. (1) T2's own left / right pink band columns are taken from the tile row
  actually read (measured on `assets/textures/water05/proj05_T2.png`: the bands drift with the row; quadratic fit, max
  error 0.03 u). (2) The V is centred on Benny's lateral position, so it stays under him when he steers. (3) Beyond each
  band T2's cyan core continues at the tile's own scale, folded inside the core — never one stretched column (the slab of
  m05vee). (4) Over the hand-over 0.3 … 1.2 u behind Benny the straight and bent readings are cross-faded (variance
  preserving) instead of sweeping the coordinate (a first try swept it: sideways streaks below Benny at hard left / right
  — fixed before judging; try-1 frames not kept). (5) The flow direction goes through the same mapping, so the streaks keep
  sliding along themselves.
* WHAT LOOKS CLOSER: in every forward view (f03, f06, f10, f20, t33, t66) the bottom third behind Benny, which was a plain
  cyan sheet, now carries the painted V: two hot-pink satin bands run from Benny's sides out to the lower frame corners,
  cyan with long white glints between them, as in the approved picture. At f10 (Benny right of centre) the V follows him.
  Steering hard right the big magenta smear with a pale lilac patch below Benny becomes cyan water with one pink band
  running down along the flow; hard left the pale grey smear next to the foam becomes cyan water. No slab, no straight
  edges, no sideways streaks. t98 (end): only the strip below Benny changes.
* Locked approved view: 0 px (`node scripts/capture.mjs 05 --q=<step-3 set>` vs `+m05vee2=1`); the default build does not
  compile this code (inside `#ifdef PROJ05`). Coins / score unchanged (same coin counts in every shot log).
* Still wrong: the bands are a little wider and softer at their outer ends than painted, and the cyan core has fewer of
  the painted crisp four-point white glints (long streaks instead).
* APPROVED: `/home/user/wt/s05/qa/match/05/r14/step2_m05vee2/1_APPROVED.png`
* BEFORE (= the kept step-3 set, same tool / port): `/home/user/wt/s05/qa/match/05/r14/step1_m05vee/before/`
  (a00_approved_view, f03_forward3u, f06_forward6u, f10_forward10u, f20_forward20u, s_left_hard, s_right_hard,
  t33_through_screen, t66_through_screen, t98_end)
* NEW (+`&m05vee2=1`): `/home/user/wt/s05/qa/match/05/r14/step2_m05vee2/new/` (same names)
* Files: `src/vfx/waterRibbon.ts` (M05VEE2, pjT2U, the T2 lookups in pjTarget / pjFlowDir).
* Swimming clips (real gameplay, shader clock running, 3.6 s at 10 fps: straight → left → right → straight;
  `tools/lead_r13/swim_clip.mjs` run on port 5275): BEFORE `/home/user/wt/s05/qa/match/05/r14/step2_m05vee2/2_BEFORE_swim_clip.mp4`,
  NEW `/home/user/wt/s05/qa/match/05/r14/step2_m05vee2/3_NEW_swim_clip.mp4`. In the NEW clip the two pink bands stay put
  behind Benny frame to frame (no flicker, no jumping) while the streaks inside them flow, and the V follows him when he
  steers.

## Step 3 — `&m05bank=1` (task 3: the near lather bank's flat pale panel / straight cut at the seam) — GOOD IMPROVEMENT (partial), kept
* Kept query: `<step-2 set>&m05bank=1` =
  `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1&m05flat=1&m05cloud=1&m05wtile=1&m05end=1&m05fmag=1&m05fpaint=1&m05fcloud=1&m05fcoin=1&m05join=1&m05frim=1&m05vee2=1&m05bank=1`
* Diagnosis (raycast `__rainbow.probe` at the panel, t75 / k81 left): the pale panel is the lather bank (foam_berm) — its
  steep inner slope drawn as smooth pale lather, seen face-on where the bank turns at the kink — with small impostor
  bubbles (foam_rim05) in front; the straight cut is the far-seam clip plane cutting through it.
* Method (different from the rejected m05lump, which only moved the bank's end 0.5 … 1.9 u before the seam with a noise
  edge): the slope itself gets the painted foam look — a world-anchored, still pile of round foam bubbles (0.3-u cells
  with small bubbles on them, dome normals, the bank lumps' soap ramp: white lit tops, periwinkle bodies, blue-violet
  creases); toward its outer edge only the bubble tops remain (the crest follows the bubbles); at the seam whole bubbles
  are kept or dropped by where their centre lies (local gradient of the seam distance), not cut by the plane. 05 only
  (fades over the stage's last unit; the 06 bank keeps its look). A first render also changed the first 4 u of 06 and
  left loose flecks low on the slope — both fixed before judging (try-1 frames not kept).
* WHAT LOOKS CLOSER: at t75, k81 (straight) and k81 hard left the flat pale-lilac panel with straight sides is gone — the
  same place is now a pile of round foam bubbles with a bubbly outline, like the painted foam clouds. At t66 the pale
  slab on the left bank and the smooth lather strip under the puffs become piled bubbles. Hard right / hard left: the
  near banks' smooth lather between the puffs becomes small piled bubbles. t95 left, f03 … f20, t33, t98: no visible change.
* Locked approved view: 0 px (`node scripts/capture.mjs 05 --q=<step-2 set>&m05bank=1` is pixel-identical to the step-2-set
  capture; one later step-2-set run differed only in the HUD text at the top, y 25 … 174 — font timing, not the scene).
* Still wrong: where the bank turns at the kink (k81 left) the bubble pile still stands as a tall narrow column with a
  fairly level top — taller and more upright than the painted foam clouds; a few small loose bubbles at its foot.
* APPROVED: `/home/user/wt/s05/qa/match/05/r14/step3_m05bank/1_APPROVED.png`
* BEFORE (= step-2 set): `/home/user/wt/s05/qa/match/05/r14/step3_m05bank/before/` (t66_through_screen, t75_through,
  k81_kink, k81_kink_left, t85_through, t95_left) + for the standard views `/home/user/wt/s05/qa/match/05/r14/step2_m05vee2/new/`
* NEW (+`&m05bank=1`): `/home/user/wt/s05/qa/match/05/r14/step3_m05bank/new/` (the six above + a00, f03, f06, f10, f20,
  s_left_hard, s_right_hard, t33, t98)
* Files: `src/vfx/foam.ts` (BERM_FRAG: bankCell, M05BANK / M05BANKCUT), `src/vfx/clip05.ts` (withClip05 margin, default 0),
  `src/vfx/waterRibbon.ts` (M05BANK flag).

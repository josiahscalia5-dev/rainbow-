# Screen 05 — round 8 progress (small steps, newest last)

Base set (BEFORE): `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1` — BEFORE pictures = `qa/match/05/r7/NEW/`
(12 audit positions, same names). Approved picture: `/home/user/wt/s05/references/05_flow_into_the_current.png`.
Each step = one sub-switch on top of the base set (default build untouched). Branch `claude/rainbow-s05-match-c8`.

## Step 1 — `&m05coin=1` (coin look only)
* Kept query: `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1`
* WHAT LOOKS BETTER: the giant gold coin (≈ 320 px wide at f10, ≈ 230 px at t33) that sat in front of Benny and hid
  his body / the river below him is gone. Benny's pink body, splash ring and the water in front of him are visible
  again, as in the approved picture. The coins still ahead of Benny keep their painted look and size (90–102 px vs
  ≈ 96 px for the nearest painted coin). Count 91, score and pickups unchanged (look only: a coin is never drawn wider
  than ≈ 100 px, and a coin Benny has already passed shrinks away before it can sit between him and the camera).
* Still wrong: the water while swimming is a marbled, stretched sheet instead of the painted S-shaped pink/cyan
  streams; the far-river slab edge and pale bank shelves; blurry near walls.
* BEFORE: `/home/user/wt/s05/qa/match/05/r7/NEW/f10_forward10u.png`, `/home/user/wt/s05/qa/match/05/r7/NEW/t33_through_screen.png`
* NEW: `/home/user/wt/s05/qa/match/05/r8/step1_m05coin/f10_forward10u.png`, `/home/user/wt/s05/qa/match/05/r8/step1_m05coin/t33_through_screen.png`

## Step 2 — `&m05ride=1` (the approved water design laid out from Benny while swimming)
* Kept query: `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1`
* WHAT LOOKS BETTER: while Benny swims, the river around and ahead of him now shows the painted design of the
  approved picture instead of the marbled swirl sheet: thick magenta streams hugging both banks and curving in an S,
  the bright cyan middle lane where the coins run, the long white glossy streaks and star glints, the painted splash
  ring and soap bubbles around Benny, foam piles along the banks — at the painted size and sharpness (each point ahead
  of Benny shows the approved water from the same distance ahead of Benny in the approved picture; the streaks still
  flow toward the camera). Most visible at f10 and t33 (marbled sheet → S-banks + cyan lane) and t66 (the flat
  marbled pool around Benny → the painted pink bend and cyan lane). The locked approved view is unchanged (0 px).
* Numbers (LAYOUT20 / PALETTE vs approved, BEFORE → NEW): f03 24.4/87.9 → 27.5/88.4 · f10 13.7/83.7 → 17.9/84.8 ·
  t33 15.4/84.1 → 17.5/85.1 · t66 9.0/81.4 → 9.6/80.2.
* Still wrong: a faint outline where the painted patch meets the plain near-water tile at its sides (soft, strongest at
  f03 / f10 left of Benny); some painted foam bubbles float mid-water on the left when the camera is wider than the
  approved one; the far river at t66 still shows the raised slab edge and the orange piece on the left bank; pale bank
  shelves; blurry near walls.
* BEFORE: `/home/user/wt/s05/qa/match/05/r7/NEW/f03_forward3u.png`, `/home/user/wt/s05/qa/match/05/r7/NEW/f10_forward10u.png`,
  `/home/user/wt/s05/qa/match/05/r7/NEW/t33_through_screen.png`, `/home/user/wt/s05/qa/match/05/r7/NEW/t66_through_screen.png`
* NEW: `/home/user/wt/s05/qa/match/05/r8/step2_m05ride/f03_forward3u.png`, `/home/user/wt/s05/qa/match/05/r8/step2_m05ride/f10_forward10u.png`,
  `/home/user/wt/s05/qa/match/05/r8/step2_m05ride/t33_through_screen.png`, `/home/user/wt/s05/qa/match/05/r8/step2_m05ride/t66_through_screen.png`
* Rejected on the way: the previous instance's `&m05wd=1` (approved design kept as the world-fixed layout, row-smoothed):
  t33 more ordered but soft, t66 a flat blurry sheet with horizontal stretch lines in front of Benny — worse; not kept.

## Step 3 — `&m05edge=1` (disconnected far-river edges)
* Kept query: `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1`
* WHAT LOOKS BETTER: the river ahead now winds as ONE continuous S-shaped stream from Benny into the bright gold
  throat, with the coin trail along it, as in the approved picture. Gone: (1) the raised "slab" of water with a hard
  pale edge that stood across the far river (it was the start of Screen 06's climbing river showing through Screen 05's
  far tunnel), and (2) the flat orange tray lying on the left bank (it was the first Screen 06 gold ring showing through
  at the same place). Visible at f10, f20, t33 and t66. Both are hidden only beyond the far-tunnel seam and only while
  Screen 05's far tunnel is shown; Screen 06 itself, the locked approved view (0 px) and the 06 hand-over are unchanged.
* Numbers (LAYOUT20 / PALETTE, BEFORE → step 2 → step 3): f10 13.7/83.7 → 17.9/84.8 → 18.0/84.7 · f20 12.9/81.4 → — →
  17.1/85.5 · t33 15.4/84.1 → 17.5/85.1 → 17.7/84.9 · t66 9.0/81.4 → 9.6/80.2 → 9.8/79.2 · t95 5.5/57.7 → 6.9/58.4.
* Still wrong: a faint step line where the near river meets the far river (mid-distance, lighter pink band); pale foam
  shelves along the far banks; near walls / far rings blurrier than painted; t66 pink right bank wider than painted.
* BEFORE: `/home/user/wt/s05/qa/match/05/r7/NEW/f20_forward20u.png`, `/home/user/wt/s05/qa/match/05/r7/NEW/t33_through_screen.png`,
  `/home/user/wt/s05/qa/match/05/r7/NEW/t66_through_screen.png`, `/home/user/wt/s05/qa/match/05/r7/NEW/f10_forward10u.png`
* NEW: `/home/user/wt/s05/qa/match/05/r8/step3_m05edge/f20_forward20u.png`, `/home/user/wt/s05/qa/match/05/r8/step3_m05edge/t33_through_screen.png`,
  `/home/user/wt/s05/qa/match/05/r8/step3_m05edge/t66_through_screen.png`, `/home/user/wt/s05/qa/match/05/r8/step3_m05edge/f10_forward10u.png`

## Step 4 — `&m05seam=1` (near river → far river joint; small step)
* Kept query: `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1`
* WHAT LOOKS BETTER (modest): in the middle distance the cyan coin lane no longer shows the angular folded "creases",
  and the pink banks run on into the far river toward the throat instead of breaking at a step line — the river reads
  more like one smooth painted S-stream (f20, t33). t66 about equal. Locked approved view unchanged (0 px).
* Numbers (LAYOUT20 / PALETTE, step 3 → step 4): f20 17.2/85.6 → 17.2/85.5 · t33 17.5/84.9 → 17.9/84.9 · f10 18.1/84.6 →
  18.0/84.7 · t66 9.8/79.1 → 9.4/78.9 (flat within noise: a look-only gain, not a number gain).
* Still wrong: a faint horizontal line where the far river starts (t66 strongest, flatter paler far water there);
  some soft folds remain in the lane (filled coin holes of the bake); pale bank strip under Benny on hard steering.
* BEFORE (step 3): `/home/user/wt/s05/qa/match/05/r8/step3_m05edge/f20_forward20u.png`, `/home/user/wt/s05/qa/match/05/r8/step3_m05edge/t33_through_screen.png`
  (round-7 BEFORE: `/home/user/wt/s05/qa/match/05/r7/NEW/f20_forward20u.png`, `/home/user/wt/s05/qa/match/05/r7/NEW/t33_through_screen.png`)
* NEW: `/home/user/wt/s05/qa/match/05/r8/step4_m05seam/f20_forward20u.png`, `/home/user/wt/s05/qa/match/05/r8/step4_m05seam/t33_through_screen.png`

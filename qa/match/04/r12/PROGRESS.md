# Screen 04 — round 12 (account 12 lead): verdict on the round-11 decisive test `&m04mv=1`

Test (account 11, `d3ea4200`): the user's PROVISIONAL views V04-1 (forward 10 u) / V04-2 (forward 20 u) camera-projected from
their own game cameras onto every mesh of the `match04_projection` group, blended by distance to each view camera
(full within 3 u, gone at 8 u). Query = K + `&m04mv=1`, K = `match04=1&m04ring=1&m04river=1&m04foam=1&m04bub=1&m04mouth=1&m04room=1`.
BEFORE = `qa/match/04/r11/BEFORE/` (+ `BEFORE_extra/` for f15/f25), NEW = `qa/match/04/r12/NEW_m04mv/` (14 shots, fresh render
2026-11-18 ~12:50 UTC, `tools/lead_r6/motion_audit.mjs`, EXTRA_SHOTS f15/f25).

## Verdict: NOT AN IMPROVEMENT (switch not kept)
* By eye at the two view cameras themselves (f10, f20): NEW looks like BEFORE — same white cotton-ball foam rows, same
  thin river with the big white V near the camera, same arrows far away. None of the painted content of V04-1 / V04-2
  (low foam clouds, thick swirling cyan/pink water, five glowing chevrons ahead of Benny) appears. Only V04-1's two
  top bubbles show on the upper tunnel wall.
* NEW adds a defect: a torn column of blocky gold patches at the top centre (f10, f20, f25) — the hole in the overlay where
  the painted coin trail was masked out.
* t66 / t95 / steering shots: no visible change (camera > 8 u from both view cameras).
* Why (measured with the probe's object list at cam10): the river, foam clouds, bubbles and water surfaces that fill the
  middle and bottom of the frame are drawn by objects outside / in front of the overlay (water_system foam banks, the
  animated river surface), so the projected view reaches only the upper tunnel wall, whose rings already looked like the view.
* Method assessment: a projection like this can only hold within a few units of each view camera; covering the ~120 u stage
  would need many more generated views (paid, each needing the user's approval) and still tears between them (f25 top).
  Recommendation: keep V04-1 / V04-2 as by-eye DESIGN REFERENCES for rebuilding the real 3D interior (round-10 finding:
  water channel filling the round floor up to low foam clouds, the five glowing chevrons, glossy gold), not as projected images.
* User-facing pictures: `/home/user/rainbow-/qa/review_c12/04_1_APPROVED.png`, `04_2_BEFORE_forward10u.png`,
  `04_3_NEW_m04mv_forward10u.png`, `04_2_BEFORE_forward20u.png`, `04_3_NEW_m04mv_forward20u.png`, `04_0_PROVISIONAL_V04-1_view.jpg`.

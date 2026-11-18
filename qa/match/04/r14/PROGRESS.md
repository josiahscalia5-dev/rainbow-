# Screen 04 — round 14 (account 14, lead) — resumed from 9ef21200 + account-13 WIP &m04a3lum (c69b7f33)

## Step 6 — luminous arrows (user order: arrows not bright enough) — G5 = GOOD IMPROVEMENT (small) — shown to the user
Query (G5): `match04=1&m04ring=1&m04river=1&m04bub=1&m04mouth=1&m04room=1&m04ry=0.8&m04rk=0.82&m04arr3d=1&m04a3k=66&m04a3w2=1&m04a3g=1.6&m04a3o=0.38&m04a3b=1&m04a3b0=3.0&m04a3b1=4.4&m04a3f0=25&m04a3f1=31&m04a3p=4.0&m04a3w=1.15&m04a3t=0.32&m04a3d=0.55&m04a3f=4&m04a3y=0.1&m04ringp=4.6&m04ringgw=1.2&m04tb=0.2&m04ts=0.22&m04paint=0.9&m04pink=1&m04pkl=2.15&m04pkw=0.9&m04a3hb=1&m04xf=2.6&m04lane=1&m04lanew=2.3&m04lanes=0.85&m04a3co=1.0&m04lane2=0.55&m04lgl=1.3&m04lsp=0.9&m04copper=1.3&m04edge=1&m04rf0=1.25&m04rf1=0.8&m04lbr=0.14&m04a3tex=1&m04bulge=0.18&m04lcd=1.0&m04lcw=1.7&m04a3fa=1.0&m04a3gb=0.16&m04a3tm=0.45&m04a3lum=1.1&m04a3rw=0.03`
* Code (account-13 WIP, finished here): `&m04a3lum=x` adds a second, additive copy of the painted arrow image drawn ON TOP of the
  arrow (r13 G1/G2 drew it underneath, so the opaque arrow hid it → no visible change).
* G3 = lum 0.6 (barely visible) · G4 = lum 1.1 + wider glow `m04a3gb=0.16` + full deep-blue arrow line `m04lcd=1.0` ·
  G5 = G4 + full fill `m04a3fa=1.0` + thicker white rim `m04a3rw=0.03`. G2/G3/G4/G5 also carry the r13 G2 pink edge
  (`m04pkl=2.15 m04pkw=0.9`: a little more magenta along the water sides).
* Start view: 0 px differ (`node scripts/capture.mjs 04 --q=…` F4 vs G4 and F4 vs G5). NOTE: motion_audit's a00 frame is NOT
  deterministic (bubbles / shader clock: F3 vs F4 already differ in 170k px) — use capture.mjs for the start-view check.
* WHAT LOOKS CLOSER: the arrows are clearly whiter and brighter with bold bright edges (F4: pale glassy blue), easy to read down
  the lane in the middle, farther inside and while steering hard left / right.
* STILL WRONG: the painted arrows sit on DEEPER electric-blue water with a cyan glow spilling round them (they pop by contrast);
  ours sit on light turquoise water; no glow on the water. Next: deeper blue lane under the arrows + soft cyan bloom on the water.
* Pictures: lead branch `qa/review_r14/04_step6_glow_arrows/` (APPROVED, BEFORE = F4, NEW = G5; start, entering, middle,
  farther inside, end, hard left, hard right).

## Step 7 — deeper blue water under the arrows — NOT AN IMPROVEMENT (all variants), code kept behind its switch
* H1 (wider arrow glow `m04a3gb=0.28 m04a3tm=0.7`) and H2 (+ `m04lcd=1.5 m04lcw=2.0`): no visible change vs G5.
* I1/I2 (`m04lcd` 2.4 / 3.0 + new `m04lcn=7,10` = only ahead of the camera): water round the arrows really reaches the painted azure
  (beside arrows 55,164,252 vs painted ≈ 2-15,140-190,220-250; G5 85,217,252) — BUT at hard left a flat dark royal-blue patch
  without swirls / glints appears beside Benny (plain multiply flattens the detail). Rejected.
* I3/I4/I5 (`m04lcn=-a,b`: deep azure keyed on the water's own brightness, keeps glints): natural, no patch, but too subtle to
  look clearly closer by eye. Rejected (switch left in the code, default off).
* Frames: `qa/match/04/r14/s9_lane/{H1,H2,I1..I5}/`.

## Step 8 — pink / magenta side swirls — NOT AN IMPROVEMENT (all variants)
* J1 (`m04pkw=0.35`, weaker pink re-colour) and J2 (no `m04pink`): the painted tile's own sides are mostly cyan / white at these
  lateral positions → sides turn pale lilac / cyan, much LESS pink than the painting. Rejected.
* K1/K2 (new `m04pkh`: pink only where the painted tile is pink, cyan streaks kept): same washed lilac / cyan look. Rejected.
* Conclusion: the painted satin-band structure is not in the tile at the lateral positions the side banks sample; a real fix
  needs the sides to sample the painted band region of the approved picture (or an approved continuation) — not a re-colour.
* Frames: `qa/match/04/r14/s10_pink/{J1,J2,K1,K2}/`.

## Step 9 — foam clouds round the ENTRANCE RIM only — L4 = GOOD IMPROVEMENT (small) — shown to the user
Query (L4): `match04=1&m04ring=1&m04river=1&m04bub=1&m04mouth=1&m04room=1&m04ry=0.8&m04rk=0.82&m04arr3d=1&m04a3k=66&m04a3w2=1&m04a3g=1.6&m04a3o=0.38&m04a3b=1&m04a3b0=3.0&m04a3b1=4.4&m04a3f0=25&m04a3f1=31&m04a3p=4.0&m04a3w=1.15&m04a3t=0.32&m04a3d=0.55&m04a3f=4&m04a3y=0.1&m04ringp=4.6&m04ringgw=1.2&m04tb=0.2&m04ts=0.22&m04paint=0.9&m04pink=1&m04pkl=2.15&m04pkw=0.9&m04a3hb=1&m04xf=2.6&m04lane=1&m04lanew=2.3&m04lanes=0.85&m04a3co=1.0&m04lane2=0.55&m04lgl=1.3&m04lsp=0.9&m04copper=1.3&m04edge=1&m04rf0=1.25&m04rf1=0.8&m04lbr=0.14&m04a3tex=1&m04bulge=0.18&m04lcd=1.0&m04lcw=1.7&m04a3fa=1.0&m04a3gb=0.16&m04a3tm=0.45&m04a3lum=1.1&m04a3rw=0.03&m04foam=1&m04foamr=2.5&m04foamn0=4.5&m04foamn1=6.5`
* New `m04foamr=L` (edge foam banks stop L u inside the opening; the banks before the opening stay) + `m04foamn0/n1` (puffs fade
  out 4.5 → 6.5 u from the camera). With the existing `m04foam` (full-height heaped clumps).
* L1 (`m04foam3` low banks, 1.2 u): barely visible. L2 (2.5 u): entrance clouds OK but big plain lilac balls in the face at hard
  left / right. L3 (near fade 2.2 → 4.0): still balls at the bottom corners. L4: fade 4.5 → 6.5.
* Start view: scenery unchanged — 146 px differ, ALL in the HUD bar (y 37–114: animated hearts / coin counter), none in the scene.
* WHAT LOOKS CLOSER: entering (f03) and just inside (f06) white foam clouds flank the entrance on both sides like the painted foam
  round the rim (BEFORE: none). Farther inside (f20, t33, t66) and at the end (t95): unchanged, no foam inside the tunnel.
* STILL WRONG: the puffs read as smooth white balls, not the painted bubbly cloud clusters; at hard left one pale semi-transparent
  puff still passes the bottom-left corner.

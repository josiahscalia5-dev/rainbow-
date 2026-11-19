# Screen 05 — round 9 progress (small steps, newest last)

Continues `qa/match/05/r8/PROGRESS.md` (steps 1–4 of round 8). Branch `claude/rainbow-s05-match-c9`, started at
`c676a7c5`. Approved picture: `/home/user/wt/s05/references/05_flow_into_the_current.png`.
Base set (BEFORE, round-8 kept query): `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1`
— BEFORE pictures (all 12 audit positions, rendered at the start of round 9 with exactly that query, no source change):
`/home/user/wt/s05/qa/match/05/r9/BEFORE/` (+ `metrics.txt`). Each step = one sub-switch on top (default build untouched).
Pictures are rendered with `node tools/match05/r8_shots.mjs <dir> "<query>" <names>` (same positions as the lead's audit).

## Step 1 — `&m05blend=1` (the seam line where the near river meets the far river)
* Kept query: `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1`
* WHAT LOOKS BETTER: the bright pink horizontal line that cut straight across the river two-thirds of the way through
  the stage (t66, ≈ 140 px in front of the second coin) is gone. The near river now flows on into the far river as one
  stream — Benny → coin trail → gold throat — with no step or ledge where the two pieces of water meet. Cause (measured
  with `tools/match05/r9_seam_probe.mjs`): two different pictures of the water met at a hard straight edge, and the far
  piece stood up to 0.36 u higher on the left and lay 0.31 u lower on the right (the real river banks there, the far
  river is level). Now the near water fades into exactly the far water's own picture over a short band before the
  joint, and the far water's first rows lie on the near water's surface (including its moving waves).
  At f20 / t33 the joint is small and far away: the right bank right at the joint now shows the painted pale foam
  instead of a raised pink shelf; otherwise unchanged.
* Locked approved view: 0 px changed (`scripts/capture.mjs 05`, kept set vs + `m05blend=1`).
* Numbers (LAYOUT20 / PALETTE vs approved, BEFORE → NEW): f20 17.3/85.6 → 17.1/85.7 · t33 17.7/85.0 → 17.7/84.9 ·
  t66 9.4/78.9 → 9.3/79.4 (a look gain — a removed line — not a number gain).
* Still wrong: the far water just past the joint is soft / slightly pixelated when Benny is close (t66: the approved far
  water magnified ≈ 3×); on the left bank a lilac foam band and a flat wall slab still show a short edge (x 160–380,
  y 640–720 at t66); pale foam shelves along the far banks; blurry purple walls; soft far rings.
* BEFORE: `/home/user/wt/s05/qa/match/05/r9/BEFORE/t66_through_screen.png`, `/home/user/wt/s05/qa/match/05/r9/BEFORE/t33_through_screen.png`,
  `/home/user/wt/s05/qa/match/05/r9/BEFORE/f20_forward20u.png`
* NEW: `/home/user/wt/s05/qa/match/05/r9/step1_m05blend/t66_through_screen.png`, `/home/user/wt/s05/qa/match/05/r9/step1_m05blend/t33_through_screen.png`,
  `/home/user/wt/s05/qa/match/05/r9/step1_m05blend/f20_forward20u.png`
* Files: `src/vfx/waterRibbon.ts` (M05BLEND, shader band), `src/world/match05far.ts` (uniforms + first far rows on the
  ribbon surface), `src/world/environment.ts` (passes `course` to the live far block; used only under the switch).

## WIP (not kept, not reported as steps) — saved on the lead's order to stop polish work
* `&m05near=1` — tried, not kept: E's near rows (painted pink banks / foam between the bottom frame pieces) kept in use
  while swimming, frame / wall-corner pieces masked (`tools/match05/near_mask.py`). Result: only a small trapezoid patch
  behind Benny with a hard outline (the approved picture holds the near water only in a narrow strip between the frame
  pieces); the rest of the near water stays the tile. Code left switch-guarded for reference.
* `&m05wall=1` — unfinished (paused by the lead's order): crisp slotted purple metal where the projected wall atlas is
  magnified while swimming (`src/vfx/proj05Tunnel.ts` M05WALL_GLSL). First render: walls crisp but slots too thin and the
  metal too pale; slot shape corrected to the atlas measurement (≈ 0.6 × 0.6 u), not yet judged.

## BLUEPRINT (lead order) — `qa/match/05/r9/BLUEPRINT.md`
Measured river width / centre / magenta-cyan shares / foam per screen row in the approved picture and in the kept-query
frames (a00, f10, f20, t33, t66), the painted river edges back-projected onto the game river, ring and throat sizes.
Annotated overlays in `qa/match/05/r9/blueprint/`. Main structural finding: the water surface is the full course width
everywhere while the painted S-channel's banks swing ±2–3 u across it (right bank only 2.3–3.7 u right of the centre
at s 137–143, inside Benny's steering reach of ±5.06 u) — see BLUEPRINT §3–4.

## `&m05geo=1` — tried, not kept
Raised the river surface beyond the painted channel edge (0.3-u foam shelf, then a steep wall-like rise), laid out
Benny-relative like the design (m05ride). Result: f10 / t66 barely change (the raised part shows the same smeared
paint, now on a slope); on hard right steering a large smooth stretched slab rises right in front of Benny (the painted
right bank lies inside the steering reach). Worse → not kept; code stays switch-guarded for reference.
Pictures: `/home/user/wt/s05/qa/match/05/r9/tried_m05geo/s_right_hard.png` (vs BEFORE
`/home/user/wt/s05/qa/match/05/r9/blueprint/kept/s_right_hard.png`), `.../tried_m05geo/f10_forward10u.png`, `.../t66_through_screen.png`.

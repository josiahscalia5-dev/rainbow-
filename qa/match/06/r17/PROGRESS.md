# Screen 06 — round 17 (account 17) — visuals only

Branch `claude/rainbow-s06-match-c17` (from `-c16` tip `4b6c637c` + the r16 worker's unfinished `m06fclu` edit, restored).
History: `qa/match/06/r15/PROGRESS.md` (ranked audit), `qa/match/06/r16/PROGRESS.md` (step 1 `m06gold`, ranking update).
Authority: `references/06_crest_the_rinse_arch.png`.
Kept set: `match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1&m06gold=1`.
Not touched: camera, framing, Benny (size decision pending with the user), coins, physics, input, HUD, other screens.
Default build unchanged (everything under `match06=1`).
Shots: `R16_DET=1 node tools/match06/r16_shots.mjs <out> "<query>" <list>` — new deterministic mode (frozen page clock, fixed
simulation steps, one draw), so BEFORE and NEW land on exactly the same spot. Start check: `tools/match06/r16_start.mjs`.

## Step 2 — `&m06fclu=1`: foam as bubbly soap clusters (r16 rank 2; the r16 edit finished, not discarded)
* What: the same foam layout as `m06foam` (same places on both banks and beside the crest), but every smooth pink-white ball
  becomes a low heap of round foam lobes and small soap bubbles (camera-facing sprites, world-anchored): white tops, pale
  lilac, cool lilac-blue undersides, fine bubble pores along the shaded lower edges, a faint pink / cyan film rim, small shiny
  bubbles with a window highlight round the foot. Colours picked from the approved picture's own foam heaps. Heaps shrink
  away in the last 1.4 u in front of the camera. Tunables (defaults used): `&m06fcs=1.25` heap size, `&m06fck=1` bubble
  count, `&m06fcn=1.4` near distance. Idea from Screen 04's `m04fclu` (read-only), 06's own colours.
* Pictures `qa/match/06/r17/step2_m06fclu/`: `1_APPROVED.png`; `BEFORE/` (kept set) and `NEW/` (kept set + `&m06fclu=1`),
  same spots: f03_forward3u, f10_forward10u, t33 / t66_through_screen, s_left_hard, s_right_hard. Clip (half size)
  `NEW/m06fclu_swim.mp4` (3.6 s: straight, left, right, straight).
* Start view: `START/` BEFORE vs NEW at the checkpoint and at +1.1 u: **0 px differ** (pixeldiff 0.1, rows 180–1536).
  Coins: same score in every BEFORE / NEW shot (1,690 / 1,720 / 1,680 / 1,800); no coin, Benny or physics code touched.
* Verdict: **GOOD IMPROVEMENT.** The foam no longer reads as smooth pink plastic balls: along both banks and at the crest it
  is now white, bubbly soap foam with many small bubbles and cool lilac-blue shadows, like the painted foam heaps in the
  lower corners; at hard left the lower-left corner is a soft bubbly heap like the painting's.
* Still different: at hard right (and hard left) Benny steers into the foam bank and the heaps cover his lower body — the
  same as BEFORE (layout unchanged), but the painting never puts foam over him. Painted foam is also a little more lilac
  in the shadows and the heaps are lower and wider in the lower corners.

## Next (ranking unchanged)
3. Start-view flash at +1.1 u: (a) see-through ring arcs, (b) striped ring strip above the crest, (c) pale ghost of the
   painted Benny on the water → 4. ripple rings round Benny → 5. purple slotted walls → 6. gold paddle lids.

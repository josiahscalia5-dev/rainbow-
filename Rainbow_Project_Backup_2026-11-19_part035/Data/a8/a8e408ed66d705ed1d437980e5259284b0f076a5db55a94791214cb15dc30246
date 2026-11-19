# Screen 08 · Final Spin Chamber — round 12 progress (branch `claude/rainbow-s08-scenery-c12`)

Authority: `references/08_final_spin_chamber.png`. Start = round-11 tip `35b5fc5a` + its unfinished `&m08cup=1` edit.
Kept set at start `K11 = K10&m08ceil=1&m08near=1` with
`K10 = match08=1&coins08px=1&m08bw=1&m08fill=1&m08arch=1&m08swim=1&m08seam=1&m08sill=1&m08towel=1&m08far=1&m08coinv=1`.
Every step is one URL switch on top of the previous kept set; the default build is untouched. Single-position test
renders: `tools/match08/shots08.mjs` (same positions / simulation path as `tools/lead_r6/motion_audit.mjs`). Approved
view check: deterministic `node scripts/capture.mjs 08 --q=<set>` with / without the new switch.
Note: `s_left_hard` frames are not repeatable (Benny touches the left side when steering hard; the hit flash puts a white
haze over some renders and not others) — not used as proof for scenery steps.

## Step 1 — `&m08cup=1` (defect B: spout cup parts the approved view could not see) — KEPT
Kept query: `K11&m08cup=1`
* Cause: the upper-left cup's top-left shoulder and the upper-right cup's top lie behind the gold arch's inner edge in the
  approved view, so while swimming they showed a fallback gold patch / the arch's own gold with a curved seam on the cup.
* What changed (`src/world/match08.ts`, spout materials only): the cups are round, so a cup point the approved view
  missed takes the painted pixels of its mirror point across the vertical plane through the cup axis (and the projector).
  Off the approved viewpoint only: approved view 0 px differ (deterministic capture with / without the switch).
* What looks closer: the big upper-left cup now keeps its pink perforated cap and gold band all the way round its top
  (forward 6 u, forward 10 u, two-thirds through) like the painted cup, instead of a gold wedge with a hard curved seam
  cutting into the cap. The upper-right cup loses the dark kaleidoscope diamond on its top.
* Still wrong: the upper-right cup's very top (hidden on both sides of its axis) still shows a small plain gold wedge with
  a straight edge; both upper cups' undersides are painted on the door wall behind them (the fitted flat discs are seen
  almost edge-on, the painted undersides much more from below — coverage check `tools/match08/cupmask08.py`: the proxies
  cover only ~half of each painted cup) → a cup proxy rebuild (tilted underside) would be the real fix (defect A).
  Tried turning hidden points about the cup axis (±45° / ±90°) for the remaining wedge → purple wall pixels on the cup
  top (the proxy dome is taller than the painted cup), NOT kept.
* Images (separate, full size): `/home/user/wt/s08/qa/match/08/r12/step1_m08cup/1_APPROVED.png`,
  `2_BEFORE_<shot>.png`, `3_NEW_<shot>.png` for `f06_forward6u`, `f10_forward10u`, `t66_through_screen`
  (BEFORE = `K11`, NEW = `K11&m08cup=1`, rendered fresh, same positions).

## Step 2 — `&m08rw=1` (defect B: sideways-smeared near water + straight-edged magenta step, first ≈ 3 u) — KEPT
Kept query: `K11&m08cup=1&m08rw=1`
* Cause: the swim-lane remap (`m08swim`) spreads the painted river's banks to Benny's lane (±2.95 u) using the painted
  river width from `river08.json`. Near the camera that trace followed Benny's splash crest and the arch's gold feet, not
  the banks: it said 0.8–2.5 u while the painted water is ≈ 3–4.5 u bank to bank. So the near water was stretched sideways
  up to ≈ 13× (the long sideways smears) and the stretch jumped where the trace starts (the straight edge in the magenta
  water at the lower left).
* What changed (render remap only — the gameplay path `river08.json` / `src/world/course.ts` is untouched):
  `tools/match08/rivnear08.py` → `assets/textures/match08/river08_near.json` = the bank-to-bank width read by eye on the
  approved picture (rows 1000–1536; rows 1150–1200 skipped, the arch feet hide the banks there), projected on the floor;
  merged with river08 beyond z −285.5. Near the camera the painted gold legs hug the banks, so there the banks are spread to
  ±4.0 u (the frame bottom shows ±3.5 u) — otherwise leg pixels appeared as a gold blob in the bottom-right corner and the
  floor beside the bank as a purple notch at the left edge (both seen in a first try, fixed before keeping).
  Approved view 0 px differ (deterministic capture with / without the switch).
* What looks closer: forward 3 u and one-third through, the water below and beside Benny is now one continuous glossy
  S-river with diagonal streaks and white glints (magenta band on the left, cyan in the middle), like the bottom of the
  approved picture — BEFORE it was a broad magenta smear with sideways streaks and a straight-edged step at the lower left.
  Steering left at 6 u: the stretched bubble at the lower left is gone. Forward 6 / 10 u and steering right: unchanged.
* Still wrong: the streaks are still somewhat wider than painted (the lane is wider than the painted river; centre kept
  1:1, banks spread ≈ 2.5×); the glints of the m08near tile further on are still ≈ 2× painted size; the gold arch legs /
  near walls of the approved picture are not in this view (arch pushed far by m08far — user decision pending from r11).
* Images (separate, full size): `/home/user/wt/s08/qa/match/08/r12/step2_m08rw/1_APPROVED.png`,
  `2_BEFORE_<shot>.png`, `3_NEW_<shot>.png` for `f03_forward3u`, `t33_through_screen`, `s_left_steer`
  (BEFORE = `K11&m08cup=1`, NEW = `+&m08rw=1`, rendered fresh, same positions).

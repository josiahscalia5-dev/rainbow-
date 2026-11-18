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

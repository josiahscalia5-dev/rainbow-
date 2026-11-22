# Screen 06 route candidate `&m06route=1` — quick diagnostic (round 29 lead, 2026-11-20 ~18:45 UTC)

Individual playable candidate (Chromium, 432×768, deterministic stills: fixed sim steps, frozen clock, pinned water clock), NOT a combined
build, NOT Android. BEFORE = `qa/match/06/r25/step2/QUERY_NEW2.txt` (the version the user last saw); NEW = BEFORE + `&m06route=1`.
Worktree `/home/user/wt/s06` (LOCAL `claude/rainbow-s06-match-c30`), tool `tools/match06/r28_quick.mjs`, runner `quick.sh` (this folder).
Sheets: `SHEET1_swim_start_to_middle.jpg`, `SHEET2_swim_late_exit_07.jpg`, `SHEET3_steering.jpg` (ORIGINAL APPROVED | BEFORE row | NEW row).

## What the switch changes (code read, r29)
Only the FAR half of the 06 tunnel: between axial 12 and 46 u the tunnel axis is shifted sideways (rings keep their facing) so the 07 start
sits 3 u right / 6.5 u below the axis instead of 12 u off it; and the painted coins grow from their approved size to one common size as the
camera leaves the approved view. UNCHANGED: the river course (path, width, every s), Benny's route, coin positions, camera rig, steering,
collisions, the 06->07 join. The deeper river (`m06rk`, stretched along the approved camera's rays) was tried in r28 and DROPPED: with the
07 start only ~44 u ahead it folds the river back on itself.

## Measured
Start 163 px (>20 levels) differ — inside the painted tunnel opening, where the moved far tunnel shows through the painting's edges.
3 %: 6 %; 12–97 %: 38–57 % of the frame differs; Screen 07 frames: 0 px (07 untouched).

## Verdict: NOT AN IMPROVEMENT (full-size proof + clips NOT produced, per the user's rule "only if convincing")
* Same as BEFORE: the crest is lost after ~3 %; from 50 % the river still sweeps up the right-hand side with the ring "target" above-left —
  Benny never travels down the middle of the rings; the 06->07 hand-over is the same abrupt change from 06's gold/purple tunnel to 07's pink tube.
* New problems: 12–35 % a flat purple wall slab with a straight edge appears on the left behind Benny (the moved tunnel section);
  50 % the grown painted coins line up as a row of big coins beside Benny on the left. Existing in both: hard right 70 % a ring cuts
  diagonally across the bottom of the frame.

## Cause (probe `tools/match06/r28_probe.mjs`, approved camera 864×1536)
* The game river from Benny (px 412,1269) goes straight UP the middle to the crest top (s 206–208, px ~505,533, only ~9 u ahead), follows
  the painted coin trail toward the rings only between s ~208 and ~220 (px 516,533 -> 696,720), then turns down-RIGHT to the 07 start
  (s 242.87, px ~969,927), which lies only 43 u ahead along the painted tunnel axis and 12 u off it (8.4 right, 8.5 down), heading
  16.5° further right than the painted tunnel and downward into the 07 tube.
* The painting instead: the river climbs up-LEFT over the crest (coin trail px 265,715 -> 180,620 -> 320,520), curls, then runs straight down
  the tunnel's centre toward its vanishing point (px ~660,632); the painted rings start at axial ~37 u (= where 06 now ENDS) and recede to
  ~100 u (ring spacing 12.9 u).
* So with 07's entrance where it is, the 06 river MUST leave the painted tunnel's centre line and swerve right — whatever the tunnel does.
  Shearing it (this candidate) keeps the swerve and opens a wall seam; bending it (`m06bend`, r11) creased the walls and turned the rings
  edge-on (rejected twice).

## The real next correction (needs the user's go: it moves where 07–10 sit in the world, not how they look)
"Give 06 the painting's depth": reshape the 06 river to the painted route (up-left over the crest, curl, then straight down the painted
tunnel's centre past 3–5 rings head-on) and put Screen 07's entrance ON that centre line ~30–60 u deeper, then ease into 07's own heading.
Everything from 07 on (07 tube, plunge, 08 chamber, 09, 10 + `WORLD.chamber/plunge`, match08 proj/river/coins/splash JSON) moves by ONE rigid
offset, so each keeps its look (start views must re-verify pixel-identical); the 06 tunnel's last ring bridges into the 07 tube instead of
the hard swap. Cost: 06 ~3–5 s longer; the paused 07 / 08 candidates must take the same offset when combined; continuity + gameplay 8/8 + 91
re-verified. Separate URL switch; BEFORE stays.

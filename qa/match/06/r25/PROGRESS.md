# Screen 06 — round 25 progress (worktree `/home/user/wt/s06`, LOCAL branch `claude/rainbow-s06-match-c26`, ports 5276 / 5282 / 5283)

## (r29) WHERE I STOPPED / NEXT
* ~18:30 UTC — relaunched (round 29, new account), worktree `/home/user/wt/s06` LOCAL branch `claude/rainbow-s06-match-c30`, port 5276,
  scratch `/home/user/scratch/s06/`. Edits restored byte-identical (m06route coded, tsc 0 per r28). Quick-shot tool = the surviving
  `tools/match06/r28_quick.mjs` (432x768, AUDIT_PORT=5276, AUDIT_SHOTS env). NOW: quick BEFORE vs NEW (+`&m06route=1`) shots into
  `/home/user/scratch/s06/q1/{BEFORE,NEW}/` (start / 3 / 12 / 20 / 30 / 40 / 50 / 70 / 85 / 99 % / 07 +3 / +10 % / hard L / R at 35 %).

## (r28) WHERE I STOPPED / NEXT
* ~17:10 UTC — relaunched (new account), worktree `/home/user/wt/s06` LOCAL branch `claude/rainbow-s06-match-c29`, scratch
  `/home/user/scratch/s06/`. TASK = the user-authorized route test `docs/briefs/2026-11-20-r28/S06_ROUTE_R28.md` (+ clarification
  `USER_CLARIFICATIONS_R28.md`: keep the HIGH curling crest + the approach to the off-centre tunnel; coins / rings grow and pass).
  BEFORE = `step2/QUERY_NEW2.txt`. Proof folder (to come) `qa/match/06/r28/route/`.
* (A) HOW THE 06 ROUTE IS BUILT (probe `tools/match06/r28_probe.mjs`, frames via `r25_frames.mjs`):
  - ONE Catmull-Rom course (`src/world/course.ts`): 06 = `seg(34)` from mark '06' (s 188.91) to '07' (s 242.87), + the match06 path06
    correction (fitted to the painted river). Benny's approved checkpoint = s0+10 = 198.91 (locked camera `cam06_locked.json`,
    C = (1.72,-35.37,-132.64), looking 11 deg left / 11 deg down). 07 starts at (11.41,-48.51,-176.25), tangent (0.26,-0.10,-0.96).
  - Everything else follows the course automatically: m06 river floor + foam banks (match06.ts, course frames), Benny / steering
    (course.widthAt), 06 coins = `coins06.json` (s, lat, h, scale; 15 painted coins s 201.3-219.1 + 3 on the entry), camera
    (cameraRig: m06cam chord 25 u + m06view = approved direction held to sB+20, eased into the chord view by sB+38).
  - Tunnel `m06tun`: ONE straight cylinder R 14, axis parallel to the projector ray through the painted vanishing point (660,632),
    through the 06 river's centroid + 3 u: O (3.62,-36.35,-132.6), ax (-0.02,-0.083,-0.996); 260 u long; rings `m06ring/m06gold`
    every dA from the painted ring tops. m06 group visible ONLY during stage 06 (the 07 tubes hidden meanwhile).
  - WHERE THE PAINTED OPENING LIES vs THE ROUTE: from the locked camera the route s 199->207 = the painted climb to the crest top
    (px 506,530; +2.5 u above Benny's water, 8 u ahead); s 207-219 the route is INSIDE the ring interior, 1.5-4 u off the tunnel
    axis (px 551,570 -> 678,704 = the painted coin trail into the rings); from s 221 it LEAVES the picture to the lower right
    (px 714,736 -> 972,922) and ends at the 07 start = 12.1 u off the tunnel axis (8.7 right, 8.5 down) only ~44 u ahead of the
    camera -> that is the "river turning right up the right wall". Painted coin SIZES put the painted river much deeper (crest
    ~18 u, far coins 50-100 u, converging on the vanishing point) - impossible with the 07 start 44 u ahead.
  - LENGTH BUDGET: s 202.6 (end of the painted-Benny hole zone) -> 06 end: arc 40.25 vs chord 38.34 = only 1.9 u of slack; a
    1 u extra left sweep costs +0.73 u, a deeper (x1.2) painted curl +2.2 u. Any real reshaping makes 06 longer -> every 07+ s
    value shifts (07 geometry / point / tangent still exact).
* (B) PLAN: `&m06route=1` = (1) TUNNEL follows the river beyond the crest: the far tunnel axis is SHIFTED (sheared) toward the
  river - rings keep their facing (round, never turned like m06bend) - so the river stays inside the ring interior into 07;
  near rings / approved view untouched; (2) route: the painted curl stretched deeper along the approved camera's own rays
  (start view unchanged) - only if it reads better, `&m06rk=`; (3) coins slid along their approved-camera rays onto the river
  (same pixels at the start); (4) camera hold / hand-over tuned to the new route. Quick low-res checks first.
* ~17:35 (B) progress: `&m06route=1` CODED (match06.ts: far tunnel axis shifted between axial 12..46 u so the 07 start sits
  3 / -6.5 u from it; tunables `&m06rsh=a,b`, `&m06rtg=x,y`; rings keep their facing) + painted coins GROW from the approved
  size to one common size (0.632) as the camera leaves the approved view (coins.ts `grow`, Game.ts setGrow(away)); tsc 0.
  Route stretch along the camera rays (`m06rk`) TRIED in the probe and DROPPED (code removed): with the 07 start only 44 u
  ahead it folds the river (k 1.3: the river runs BACKWARD at s 226-229; k 1.15: 45 deg right/down swerve at s 223) and makes
  06 1-4 u longer. The course is UNCHANGED (07 start, tangent and every s exact). Ring spacing found: dA 12.87 u, rings at
  axial 11.2 / 24.1 / 36.9 (= the first PAINTED ring, Benny reaches it at ~85 %) / 49.8 ... -> Benny passes 3 rings in 06.
  NOW: quick 432x768 BEFORE / NEW shots (`/home/user/scratch/s06/q1.sh`, waiting for a render slot).

## (r27) WHERE I STOPPED / NEXT
* ~15:20 UTC — relaunched (new account), worktree `/home/user/wt/s06` LOCAL branch `claude/rainbow-s06-match-c28`. Found SURVIVED (not lost
  as LAUNCH_R27 feared): `step1_hole/gameplay_NEW3.json` (query = NEW3, 8/8 pass, 91 coins) and `step2/{BEFORE,NEW}/` (7 shots each,
  NEW = NEW3 + `&m06fcn=3`). Re-used, nothing re-rendered.
* **STEP 1 DONE — verdict `&m06hole=2&m06fade=1&m06spl=1` (NEW3): GOOD IMPROVEMENT.** Comparison owed to the user assembled:
  `step1_hole/COMPARE/{a_start,o1_003,o2_007,o3_012}/{1_ORIGINAL_APPROVED,2_WHAT_YOU_SAW,3_NEW}.png` + `COMPARE/clips/`
  (`2_WHAT_YOU_SAW_opening_{1.0x,0.5x}.mp4`, `3_NEW_opening_{1.0x,0.5x}.mp4`) + `COMPARE/README.txt`.
  - Closer: the bright hard-edged blue cone under Benny is gone in motion (3 %): the painted water runs on continuously from under him
    to the bottom of the frame, no cut-out edge, no brighter patch, no left-behind lacy ring; at 7 / 12 % one coherent river below him
    (cyan centre, pink sides), no bounded patches or direction breaks; his contact is a low lace collar + shallow rings instead of the
    long white V spray streaks. Start view unchanged (0 px, files byte-identical).
  - Still differs: the fill reads as fairly straight fanning streaks where the approved water swirls; only one faint shallow ring at
    his contact vs the approved concentric rings; from ~7 % the camera/route turns into the centred ring tunnel, so the approved
    composition (crest + winding river + coin trail to the upper left) is no longer in view.
  - New problems: none seen; gameplay 8/8, 91 coins. Clip title of NEW is cut at the right edge (cosmetic; frames were lost).
* Step 2 (foam height) judged from the existing shots: `&m06fcn=3` changes ONLY 47 % / 60 % / hard-right (all other views 0 px);
  lower-third white foam px BEFORE→NEW 90.8k→74.0k, 110.4k→61.4k, 115.9k→56.6k: the big near foam clouds over the bottom of the
  frame shrink away, more river visible. NEW PROBLEM: half-shrunk heaps break into trails of tiny loose white beads (60 % bottom
  left, hard-right centre) — each sprite shrank by its OWN depth with lobe positions fixed. Fix behind `&m06fcg=1` (whole heap
  shrinks as one unit into its foot on the water, timed by the heap's distance; FOAMC_VERT `#define GROUP` + attribute `aC`;
  tsc 0). `step2/NEW2/` DONE (query `QUERY_NEW2.txt` = NEW + `&m06fcg=1`, only the 3 changed views; lower-third white 74.0k /
  60.3k / 54.2k): the shrinking near heaps stay compact small cumulus heaps — the loose bead trails are gone; same foam reduction.
  Gameplay NEW2 8/8, 91 coins (`step2/gameplay_NEW2.json`). Whole-06 clips (93 frames, 3.88 s; entrance, LEFT 30-50 %, RIGHT
  50-70 %, end, 0.6 s into 07): `step2/{BEFORE,NEW2}_whole06_{1x,0.5x}.mp4` (+ `frames_*.json`); frames differ ONLY 49-66.
* **STEP 2 DONE — verdict `&m06fcn=3&m06fcg=1`: GOOD IMPROVEMENT (moderate).** Proof `step2/COMPARE/{c2_middle,d_late,g_hard_right}/`
  `{1_ORIGINAL_APPROVED,2_BEFORE,3_NEW}.png` + `COMPARE/clips/` + `COMPARE/README.txt`.
  - Closer: the big near foam clouds no longer cover the bottom of the frame at 47 % / 60 % / steering right (clip frame 52: the big
    round foam ball at the bottom centre → water + pink edge; frame 58: the lower-left cloud clearly smaller); the heaps that shrink
    stay compact small cumulus heaps, no bead trails; everything else byte-identical (start, opening, 22 / 35 / 85 %, hard left).
  - Still differs: at the end (clip frames 61-66, ~77-83 %) a large white foam bank still fills the lower left (heaps > 3 u away);
    the approved keeps its foam heaps in the lower corners.
  - New problems: none seen.
* STEP 3 NOT STARTED — needs a USER decision: the biggest visible difference from ~10 % to the end is the composition (centred
  gold-ring "target", plain straight river climbing the crest with Benny hiding where it goes, then the river turning RIGHT up the
  right wall) vs the painting (off-centre tunnel, river curving up LEFT, coin trail along it). Levers already exhausted / banned:
  re-aiming the painted tunnel snaps the start view, `m06bend` rejected twice (never repeat), moving the river changes the route
  and 07; only the camera test `m06view=1&m06vs=0` (the user's, unapproved). Coins already sit at the painted positions
  (`coins06.json`). Possible next visual-only items: end-section foam bank (try `m06fcn` 4-5 on the end only), river detail
  (stronger pink / rainbow arch band at 10-50 %).
* STOPPED ~16:10 UTC after 2 finished steps + report to the lead. Candidate query = `step2/QUERY_NEW2.txt`. Code live diff
  `step2/code_live_at_step2.patch` (match06.ts + Game.ts, tsc 0); references 13/13 OK.

## (r26) WHERE I STOPPED / NEXT
* ~13:15 UTC — relaunched (new account), worktree `/home/user/wt/s06` LOCAL branch `claude/rainbow-s06-match-c27` (r25 edits incl. m06hole).
* Step 1 judgement of the r25 shots (`step1_hole/{CURRENT,NEW,WDBG_NEW}`): the bright hard-edged cone body is GONE in NEW; start view
  0 px (byte-identical, so only the MOVING pairs o1/o2/o3 + the clip show the repair). NOT clean: (a) at 3 % the painted lacy ring
  left at the checkpoint still half visible (circular boundary); (b) the fill = smooth combed stripes; (c) at 12 % the pinned painted
  floor vs the river's own water still makes bounded patches / direction breaks below Benny (where the game river leaves the painted
  river, mask06 G hands over); (d) long white V splash streaks at his contact (ref-05 crown) instead of a shallow rounded ripple
  (lead relayed the same points from the user's independent review, 13:09).
* `&m06hole=2` (tile_hole06b.png = fill + mirrored painted sparkle, make_hole06.py HOLE_DSIG=0.03; ring zone + carried rings hand
  over at dAp 0.02..0.3): shots `step1_hole/NEW2/` — left-behind ring gone at 3 %, a bit more sparkle; (c) unchanged.
* NEW3 = NEW2 + `&m06fade=1` (the pinned painted floor dissolves as a whole into the river's own water between dAp 0.85..2.2: no
  bounded patches) + `&m06spl=1` (06 only: crown jets 1.25->0.42 u long, 0.34->0.09 u high = low lace collar; spray dots hidden).
  tsc 0. NEW3 shots DONE (`step1_hole/NEW3/`): o1 = NEW2 (cone gone, painted water continuous, shallow rings); o2/o3: one coherent
  river below Benny (cyan centre, pink sides), no bounded patch / ghost foam / direction break, low lace collar + rings at his
  contact instead of the white V streaks; start 0 px. `COMPARE/<shot>/3_NEW.png` = NEW3. NOW: NEW3 opening clip + gameplay
  (`/home/user/scratch/s06/chain_new3.sh`, waits for a slot). CURRENT clip DONE (`CURRENT_opening_{1x,0.5x}.mp4`, 1.08 s).
  NEXT: verdict step 1.
* Step 2 (started ~13:50): later views of the step-1 candidate (`step2/BEFORE/`, query = NEW3; 22/35/47/60/85 % + hard L/R at 35 %):
  rings centred and dominating, river beyond the crest a narrow strip on the right (route/camera = user decision), and BIG near
  foam clouds over the water at the bottom at 47-85 % (user: keep the foam at an appropriate height so the water stays visible).
  Test NEW = BEFORE + `&m06fcn=3` (foam lobes nearer than 3 u shrink away, default 1.4) rendering (`step2/render.sh NEW`).

## (r25) WHERE I STOPPED / NEXT
* ~12:05 UTC — started. Read CLAUDE.md, `docs/briefs/2026-11-20-r25/LAUNCH_R25.md` (s06), the lead's diagnosis
  `qa/match/06/r24/lead_rip/NOTES.md` (cone = the cut-out hole where the painted Benny was removed from the projected painting,
  filled with the river's own brighter water, hard Benny-shaped edge; `m06ripz` removed the left-behind ring only).
* Step 1 `&m06hole=1` (the user's opening effect — the cut-out hole + the pinned painted ring filled with the approved
  picture's own painted water continued from the water around it; keep only the carried shallow rings; start view 0 px):
  ~12:36 BUILT. Hole measured in the river's own coordinates (`tools/match06/r25_frames.mjs` = game course frames,
  `tools/match06/r25_unwrap06.py`: the painted Benny's cut-out spans ds -0.6..+3.6 u, up to 3.5 u wide). Fill tool
  `tools/match06/make_hole06.py` method `flow` (painted streaks carried across the hole along their own direction + Poisson blend,
  sources = painted water only; foam heaps and big painted bubbles kept; first try = patch fill REJECTED on sight: blocky mosaic,
  copied foam). Output `assets/textures/match06/tile_hole06.png`, `tile_hole06w.png`, `hole06.json`; shader + loader in
  `src/world/match06.ts` (`m06hole`; QA dump `m06holedump`); `tsc` clean. Floor-space before/after:
  `qa/match/06/r25/step1_hole/floorspace_*.png`. NOW: proof shots NEW / CURRENT / WDBG_NEW rendering (`step1_hole/render.sh`,
  waits for a render slot). NEXT: compare, clip 1.0x + 0.5x, gameplay 8/8 + 91, verdict.
* Note (user, ~12:20, via lead): judge by the MOVING views — clean continuous painted water round Benny in motion, no hard
  edges, no brighter patch, no left-behind rings.

CURRENT (what the user saw) = `qa/match/06/r24/lead_rip/QUERY_RIP.txt`:
`match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1&m06gold=1&m06fclu=1&m06st=1&m06fcl=1&m06view=1&m06vs=0&m06rip=1`

---
## (r23, copied from `qa/match/06/r23/PROGRESS.md`) WHERE I STOPPED / NEXT — STOPPED after 3 finished steps (final report sent to the lead, ~09:55 UTC)
* Step 1 `&m06fcl=1` (big white foam walls → low separate puffy heaps): **GOOD IMPROVEMENT** (moderate). Candidate for K6.
* Step 2 `&m06view=1&m06vs=0` (ring tunnel held off-centre right through the first second): **GOOD IMPROVEMENT** as a
  camera-framing TEST — the USER decides (show the clip); never in the kept set without the user's OK. No code change.
* Step 3 `&m06rip=1` (the painted ripple rings round Benny carried with him): **GOOD IMPROVEMENT (small)** — visible round
  Benny in the first ~0.7 s and up close; subtle later. Candidate for K6 (lead / user decide).
* Nothing committed / pushed from the worktree (lead autosave snapshots it). Uncommitted code: `src/world/match06.ts`
  (step 3), `src/game/Game.ts` (1 line, step 3); QA tools `tools/match06/r23_*.mjs`. Container restart ~09:40 UTC: worktree,
  proofs and all 5 clips intact (re-verified 09:49: `tsc` clean, step 3 `code.patch` == live diff, references 13/13 OK).
* Best combined query so far (each part still needs the lead's / user's OK):
  `match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1&m06gold=1&m06fclu=1&m06st=1&m06fcl=1&m06view=1&m06vs=0&m06rip=1`
* NEXT (most visible remaining differences, by eye): (1) after the crest top (~47 % on) the rings still drift back into a
  target near the top centre — the game river turns ~18° right / 12° down off the straight painted tunnel; framing cannot hold
  it, bend is banned, so only a route or approved-artwork decision by the user could; (2) at the crest top the river beyond is
  hidden for a moment with `m06vs=0`; (3) big near foam clouds in the lower right mid-stage and when steering hard right
  (they partly cover Benny); (4) hard steering early still cuts Benny at the screen edge (as K6); (5) coins along the crest.
* Lead note (all workers): worktrees whose `node_modules` is a symlink to `/home/user/rainbow-/node_modules` get the HUD fonts
  refused by Vite (fallback font in every shot). `tools/match06/r23_vite.mjs` (fs.allow incl. the real node_modules) fixes it;
  the river shader's wall clock also makes per-run water differ — pin `performance.now` around the draw for BEFORE / NEW.

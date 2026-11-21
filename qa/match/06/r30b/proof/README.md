# Screen 06 — r30b storyboard candidate: proof (lead, session `ccr-e490fceb-u85291`, 2026-11-20 ~23:30 UTC)

**Individual playable candidate, NOT approved.** Default build and every earlier query unchanged (verified, see "Baseline preserved").
User's binding brief: `docs/briefs/2026-11-20-r30/USER_R30.md` §6 (the FOUR storyboard panels = mandatory approved targets).

## Exact candidate
* Query: `../QUERY_SB_NEW.txt` = r30 v2 (`qa/match/06/r30/QUERY_NEW_v2.txt`) + `&m06sb=1&w30=1&f30=1&f30bs=0.7&f30bg=0.3&f30bc=0.16&b30=1&m06sbk=0.88&m06sbby=0.1&m06sbqh=1.5&m06sbq=0.08,0.24`
* Code: commit `cf1a66036b9cfeae6ca64ecd54918110909ef448` (tree `b12c04e6df76a054ed5cc619e932f004b96ab440`) = base `e162aec` + the r30 Screen 06
  work + r30b, LOCAL branch `claude/rainbow-s06-r30b-candidate` in worktree `/home/user/wt/s06` (branch `claude/rainbow-s06-match-c32`, uncommitted =
  identical files). Recoverable from GitHub: `r30b_candidate_from_e162aec.patch` here (verified: applied onto `e162aec` it rebuilds tree `b12c04e`
  exactly) and the five-minute snapshot `backups/wip/claude__rainbow-s06-match-c32/`.
  Restore: `git fetch origin claude/rainbow-s06-match-c23 && git worktree add <dir> e162aec && cd <dir> && git apply --binary <this patch>`.

## What changed (all behind switches; src/world/m06sb.ts, route06c.ts, match06.ts, game/cameraRig.ts, game/Game.ts)
* **Pale peach circle — cause found** (`../diag/`, `../diag07/`): Screen 07's tube, seen through the end of the 06 tunnel 90–200 u away, fades into
  its warm far glow (`environment.ts` tubeGlow `#ffd08a`, 48–105 u). At the third/fourth moment 10 / 34 of 55 probe rays hit 07's tube.
  `m06sbjoin`: while Benny is in 06, 07's tube far glow / mid tint = violet, its walls tinted violet, its strip lights dimmed 60 %; all ease back to
  07's own look over the first 40 u of 07. Plus the new route hides 07 behind its bends for longer.
* **Crowded gold target — cause** (r30 diagnosis): rings every 12.87 u down one straight tube seen within 11° of its axis. `m06sbroute`
  (`tools/match06/r30b_design_sb.py` → `route06sb.json`): crest unchanged, then curl right 32° + down 8°, hold, sweeping LEFT bend to −20°, a LATE
  right turn onto 07's heading (07 entrance tangent error 0.00°); tunnel narrows from 14 to 10.5 past the crest (bands arch across the frame like the
  panels), widens onto 07's 15 u mouth over the last 24 u. `m06sbband`: broad flat polished copper-gold bands (6 u wide, 1.1 u proud, raised lips,
  bright reflection bars) every 18 u, perpendicular to the curved axis = world-anchored; Benny passes under them.
* **Blurry / stretched wall slots, texture bands** — cause: the magnified painted wall tile. `m06sbwall`: procedural purple-magenta drum metal
  (colours measured from the storyboard walls), small rounded slots in rows round the drum, anti-aliased by pixel footprint (no blur, no moiré,
  no tile repeat), long pink-white light streaks. `m06sbhaze`: far tunnel fades to the storyboard's lilac-violet.
* **Framing** `m06sbcam`: Benny held at his APPROVED place in the frame (all four panels show him exactly there: panel 1 registered onto the approved
  picture, `../align/panel1_vs_approved_window.png`), view aimed so the slide ahead sits in the panels' vanishing area, telephoto 50° (the panels
  read telephoto: panel 1 = approved view with the background ~1.15× larger), camera lag predicted, Benny's world tilt kept as at the approved
  crest (the descent no longer tips his beanie away). Eased in after the start view, out over the last 14..3 u before 07.
* Specialists (round 30b, relaunched from their saved work): water `w30` (scratch streaks → cyan centre, sparkly veins, rainbow edges, flowing;
  `qa/match/06/r30/water06/`), foam `f30` (bead rows / foam walls → soft bubble clusters, big iridescent bubbles, splash ring;
  `qa/match/06/r30/foam06/`; heap size tuned down here), Benny `b30` (painted proportions, knit beanie, dusty-pink plush; `qa/match/06/r30/benny06/`).

## Proof
1. **Four numbered comparisons** `sheets/1_..4_PANEL*_APPROVED_BASELINE_NEW.jpg` — storyboard panel (concept artwork) | BASELINE (r30 v2 = the
   user's bottom row, river s 238 / 266 / 310 / 387) | NEW (s 198.91 = the start of 06 / 250 / 300 / 336), all three in the SAME window (the panel's own area of the
   game frame, 28,250–811,1251 of 864×1536), full frames beside them (`*b_BASELINE_full*`, `*c_NEW_full*`). NEW moments chosen in storyboard order. `sheets/1b_PANEL1_in_motion_s214.86.jpg`: panel 1 again 1.3 s later (BASELINE and NEW both at s 214.86):
   the start-view hold still trails Benny (smaller) in both; NEW's walls already show the crisp drum metal (BASELINE: blurry stretched slots).
2. **Continuous clip** `SCREEN06_r30b_into_07_1x.mp4` (normal speed) / `_0.5x.mp4`: one uninterrupted real-gameplay run from the 06 checkpoint
   through crest, band, winding slide, and 30 u INTO Screen 07 (HUD title switches to 07); `HANDOFF_06_to_07.jpg` = the frames around the entrance.
3. **Steering / coins**: `gameplay_NEW.json` — 8/8 (continuous travel, no camera cut — max step 0.728 = baseline, no teleport, 07 plunge, 91
   real coin pickups → 2,240, steering into the foam wall costs a heart, pause, victory). `STEER_zigzag_06.mp4`: Benny steering left/right
   across 06 collecting coins. Continuity: all stage joins gap 0, 06→07 tangent 0.002°.
4. **Start view**: outside Benny 99.96 % of pixels within 20 levels of BASELINE; vs the approved picture whole frame 76.4 % → 78.2 %, Benny area
   49.4 % → 56.8 % (pixels within 20 colour levels; only these are measured — no overall likeness figure is claimed).
5. **Baseline preserved**: the same v2 frame rendered from the untouched r30 code and from the candidate code (new switches off), clock pinned:
   HUD, tunnel, rings and river pixel-identical; only Benny's fur strands and floating bubbles differ (they animate on their own real-time clock).

## What still differs (honest)
* Panel 1: NEW = the start of Screen 06 (the approved picture's scenery projected + the 3D Benny); the storyboard repaints the background ~1.15× larger.
  1.3 s later (sheet 1b) the start-view hold trails Benny smaller (as in the baseline) before the storyboard framing takes over at ~s 219–237.
* The far end from ~s 300: Screen 07's own tube (its paddles, denser rings) is visible ahead through the last bend — violet now, not peach, but
  not the 06 storyboard's continuing bands. Screen 07 itself is unchanged (its own candidate work lives on another branch; not merged).
* At the 07 entrance the look changes to Screen 07's current tube (neon magenta-violet with big slots, pink/cyan streak river, white foam walls)
  and its camera; 07's approved picture is purple-and-gold — that is Screen 07's open work, not changed here.
* Gold bands: broad and world-anchored, but less brilliant than the painted ones (fewer white highlight bars).
* Walls: colour / slots close; the painting's walls carry more luminous sheen.
* The slide ahead is partly hidden behind Benny at some moments (the panels show more of its sweep); panels 2 and 4 bend the slide more strongly
  near Benny than the playable route does.
* Benny: proportions much closer; fur is fine strands rather than shaggy plush; he floats a little higher than the painted Benny sunk in foam.

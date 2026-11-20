# Screen 06 — deep route candidate `&m06deep=1` (round 29 lead, 2026-11-20 ~19:00–19:45 UTC)

Individual playable candidate (worktree `/home/user/wt/s06`, LOCAL branch `claude/rainbow-s06-match-c30`; its edits are saved every five
minutes in `backups/wip/claude__rainbow-s06-match-c30/`). NOT a combined build, NOT Android. NOT approved — waiting for the user.

* BEFORE = `qa/match/06/r25/step2/QUERY_NEW2.txt` (the version the user last saw)
* NEW = BEFORE + `&m06deep=1&m06leg=1&m06vw=34,56` (`QUERY_NEW_FINAL.txt`)

## What the switch does (user's words: "Benny swims down the colourful water slide, following the gold coins, directly into and through the purple-and-gold tunnel")
* The 06 river follows the user's painted coin trail rebuilt in 3D (every painted coin the same real size, so its painted size gives its
  distance): up and to the left over the crest, then down the MIDDLE of the gold-ring tunnel, about 100 units deep, passing ~9 rings,
  into Screen 07. The painted coins sit on that river at their painted positions (coins 5–14 exactly on its centre line).
* Before, the river swerved toward the tunnel's lower-right wall within 44 units ("the river travelling beside the tunnel") because Screen
  07 started there. Now Screens 07–10 are moved further away as ONE rigid block (same shapes, rings, chamber, towel; only further along),
  so Screen 06 is 124 units long instead of 54 (~11 s of swimming instead of ~5 s).
* The SAME purple-and-gold ring tunnel continues until the doorway: Screen 07's tube (with a gold collar ring at its mouth) appears only in
  the last ~12 units (~1 s), straight ahead of Benny, and he swims into it. (An earlier version showed it from halfway — the "brighter
  pink-and-yellow tunnel" the user saw — fixed.)
* `&m06leg=1`: the falling right band of the painted rinse arch as real 3D water (the river's own material), so the crest's curl and its
  window onto the purple wall exist in 3D (seen mainly at the very start of the climb).
* `&m06vw=34,56`: your approved viewing direction is held longer over the crest, so the tunnel stays at the upper right and the river with
  its coin trail visibly sweeps right into it, as painted, before the view settles down the tunnel.
* Unchanged: the approved start view (visually identical; only sub-pixel fur speckle and three coin outlines differ), Screens 01–05,
  the painted tunnel's position, the stage joins (continuity test passes), Screens 07–10's geometry (rings / lids / slots re-anchored).

## Evidence
* `quick/LOOK_1_start_to_middle.jpg`, `quick/LOOK_2_late_to_07.jpg` — ORIGINAL APPROVED | BEFORE | NEW at the same moments (quick 432×768).
* `quick/GEOMETRY_above_side.png` — the real game geometry from above and from the side: BEFORE river vs NEW river, tunnel walls, rings, coins,
  07 entrance.
* `clips/SCREEN06_BEFORE_{1x,0.5x}.mp4`, `clips/SCREEN06_NEW_{1x,0.5x}.mp4` — continuous real gameplay from the approved view through the
  whole of 06 and 1.5 s into 07; same steering for both (straight, hard LEFT 30–50 %, hard RIGHT 50–70 %, straight). 864×1536 renders,
  labelled, 540×960 video.
* `stills/` — full-size ORIGINAL APPROVED / BEFORE / NEW pictures taken from those two clips at the same share of the screen (start, crest,
  tunnel entry, steering LEFT, steering RIGHT, late, exit, first 07 frames) + two overview sheets.
* Checks: `npx tsc --noEmit` OK; `npm run test:continuity` OK (default build); continuity with the switch OK (all joins gap 0, 06→07 0.08°).

## Honest verdict
* CLOSER: the route. Benny now travels down the middle of the gold-ring tunnel with the coin trail on the water ahead of him; rings
  approach, pass around him and fall behind; the river continues inside the tunnel; he swims into Screen 07's tube.
* STILL DIFFERENT from the approved artwork while moving (BEFORE and NEW alike): the high curling rainbow crest and its loop exist only in
  the opening view; the water becomes plain flowing streaks instead of the painted sparkly swirls; the foam banks are rows of small puffs;
  the far view is Screen 07's pink tube instead of the painting's golden glow; a pink outer side of the 07 tube shows on the left near
  the end. Benny looks larger than the painted Benny (existing).
* WHY: the approved picture shows the world from one viewpoint; everything it does not show is drawn by the game's own 3D materials.
  The next step that could carry the painted look into motion = painted extra views of the NEW route (fal, ~8 views ≈ $1), wrapped onto
  the 3D scenery as Benny passes — needs the user's OK (credits). No unmeasured likeness percentage is claimed.

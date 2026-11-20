# Screen 07 · round 24 (water-fx-specialist) — progress log

## (r27) WHERE I STOPPED / NEXT
* r27 relaunch (new account, ~15:20 UTC). Worktree `/home/user/wt/s07`, LOCAL branch `claude/rainbow-s07-match-c28` (r26 edits restored
  byte-identical by the lead). Ports 5277 / 5280 / 5281. Temp `/home/user/scratch/s07/`.
* Found on relaunch: `qa/match/07/r26/final/gameplay_NEW_full.json` DID finish before the r26 stop — query = step-1 candidate & K23-3 &
  m07look & m07join (the full candidate), **8 / 8 checks pass, 91 coins collected** (1330 -> 2240), plunge 61.02 u, 0 respawns.
  Full NEW clip `r26/final/SCREEN07_NEW_full_K23-3_{1x,0.5x}.mp4` also complete.
* 15:25 DONE: s08 snapshot re-copied read-only from `/home/user/wt/s08`: **30 / 30 files match `combo/s08snap_SHA256SUMS_r25.txt`**; combo
  build `/home/user/scratch/s07/combo` rebuilt (`combo/mkcombo.py`), tsc 0.
* 15:30 DONE — **STEP 1 (r27) final check of the full candidate:** gameplay 8/8 + 91 coins (above); landmark stills BEFORE (r23 candidate
  & K23-3) vs NEW (full candidate & K23-3) at matched route landmarks, taken from the two existing 1.0x clips (same steering schedule;
  BEFORE frames picked at the same share of the lip->inlet drop, since the S makes NEW's drop ~2.5 u longer):
  `qa/match/07/r26/final/landmarks/` (`1_ORIGINAL_APPROVED`, `2_BEFORE_*`, `3_NEW_*`: a_lip t 2.71, b..e bend apexes t 3.75 / 4.96 /
  6.12 / 7.29 (BEFORE 3.75 / 4.88 / 6.00 / 7.17), f_inlet last 07 frame t 8.25 (BEFORE 8.08)).
  Verdict unchanged: GOOD IMPROVEMENT (not approved) — at every apex the cyan body, both pink edges, both foam banks and the coin trail
  bend together; the inlet shows the painted river with pink edges running into 08 (BEFORE: rainbow-striped sheet + white lather slab).
  Still differs (= step 2's job): the foam is BULKY — big uniformly packed white masses (bend1 t 3.75 lower-left foreground cloud,
  bend2 t 4.96 cloud over Benny's lower left, bend4 t 7.29 both banks thick walls of white), and the coins stack in a column down the drop.
* NEXT: step 2 = foam refinement behind a new switch (user's r27 foam note) + inside-bend foam over Benny at the right limit (t 5.0 s);
  step 3 (if time) = stacked coin column down the drop.

## (r26) WHERE I STOPPED / NEXT
* r26 relaunch (new account, ~13:10 UTC). Worktree `/home/user/wt/s07`, LOCAL branch `claude/rainbow-s07-match-c27` (r25 edits incl.
  m07swing / m07look / m07join restored by the lead). Ports 5277 / 5280 / 5281. Temp `/home/user/scratch/s07/`.
* 13:14 DONE: s08 snapshot re-copied read-only from `/home/user/wt/s08` (HEAD 3c0fa97): **30 / 30 files match
  `combo/s08snap_SHA256SUMS_r25.txt`**; combined build `/home/user/scratch/s07/combo` rebuilt with `combo/mkcombo.py`, tsc 0.
* 13:20 DONE — **STEP 1 verdict `&m07sbend=1&m07swing=1`: GOOD IMPROVEMENT (moderate), not approved.** Judged from the two existing
  labelled clips (same steering schedule, 1.0x) + the approved picture; full-size stills `qa/match/07/r26/s1_verdict/`
  (`1_ORIGINAL_APPROVED`, `2_BEFORE_*`, `3_NEW_*` at t 2.9 / 5.0 / 6.4 / 7.4 s).
  - Closer: from the middle on (t ≈ 4.5–6.6 s) the WHOLE river now winds — cyan body, both pink edges, both foam banks and the coin
    trail bend together left-right in broad S-bends, like the approved picture's river; BEFORE was a straight slide with the coins
    in a straight column. Start view identical.
  - Still differs: the far part of the drop (t 7.0–8.2 s) still reads as a straight chute with vertical pink / cyan stripes and a
    straight coin column; the steering-left section t 2.5–3.7 s is still dominated by the purple wall (step 2's job); the 08 inlet
    still shows the speckled band (step 3's job).
  - New small problem: at the right-hand steering limit inside a bend (t 5.0 s, lat +2.25) the bigger "inside of the bend" foam
    clouds overlap Benny's lower right (BEFORE: he sits on the pink edge beside the foam). Next fix candidate: keep the inside
    mounds from reaching over the band edge (`mound()` size / inset with `swB`).
  - Lead 13:2x: independent review of the same saved evidence (user's ChatGPT review, docs only) agrees on the gain (ending curves
    laterally, cyan + magenta + foam + coins move together, opening kept) and lists what is still wrong: middle / strong-steering
    views dominated by the near purple wall + gold rings, river ahead lost over the lip (step 2); wall slots stretched / blurred
    with thin DOTTED MAGENTA ARCS crossing the rings; water narrows to a cyan strip between ANGULAR pink panels with repeated
    MIRRORED highlights; foam often faceted; the NEW ending's near-right bank VERY LARGE (= my new small problem above); speckled
    band + abrupt switch to plain straight water before 08 (step 3); ending coins crowd together.
  - Comparison caveat (stated plainly): the clips are scheduled by the SHARE of the stage travelled and the S makes 07 ≈ 2.5 u
    longer, so they are timed, not matched-position: left input 2.458 s BEFORE vs 2.500 s NEW, right 4.083 vs 4.167, entry into
    08 8.125 vs 8.292. Up to the lip the s values are the same physical points; on the drop the same t is up to ~2 u apart (at
    t 5.0: s 344.6 BEFORE vs 345.8 NEW, both lat +2.25 — the foam overlap is not explained by that 1.2 u). The final sequence
    adds stills at corresponding route landmarks (lip, bend apexes, inlet).
* 13:36 DONE — **STEP 2 verdict `&m07look=1` (new defaults back 5 / up 6.2, code-only change in cameraRig.ts, tsc 0): GOOD
  IMPROVEMENT, not approved.** Proof `qa/match/07/r26/s2_look/` (1_ORIGINAL_APPROVED, 2_BEFORE_t*, 3_NEW_t* at t 2.5 / 3.0 / 3.25
  / 3.5; start view `BEFORE|NEW/a_start.png` **0 px**; side-by-side clip `clip/SCREEN07_S2_look_BEFORE_vs_NEW_{1.0x,0.5x}.mp4`,
  t 2.0–4.6 s, same steering schedule, 432 px wide segment renders).
  - Closer: across the lip (t 2.25–3.25 s, steering left) the river + Benny fill the lower 55–65 % of the frame (BEFORE: the
    purple wall ~70 %, the river a strip, Benny cut off at the bottom); the river runs visibly up to the brow with the coins on
    it, and the drop river ahead shows from t 3.25 s (BEFORE 3.75 s). Benny keeps his normal size.
  - Still differs: just before the lip (t 2.5–3.0) the river BEYOND the brow is still hidden (physically below the line of sight);
    the pink side bands read as flat angular panels with straight streaks; thin dotted magenta arcs on the rings (pre-existing).
  - New problem: none seen; a thin copper line across the river at t 2.5 s is in BEFORE too (pre-existing, note for later).
  - Tried and rejected: the r25 defaults (2.5 back / 5.5 up — Benny oversized, hat blocks the centre); variant c (4 / 7.2,
    ahead 12) — similar river share but more top-down.
* 13:50 DONE — **STEP 3 verdict `&m07join=1` (+ r26 one-line addition: the 09 final-wave mesh hidden while 07 shows; Game.ts,
  tsc 0): GOOD IMPROVEMENT, not approved.** Proof `qa/match/07/r26/s3_join/` (1_ORIGINAL_APPROVED, 2_BEFORE_t*, 3_NEW_t* at t
  7.5 / 7.83 / 8.17 / first 08 frame 8.33; side-by-side clip `clip/SCREEN07_S3_join_BEFORE_vs_NEW_{1.0x,0.5x}.mp4`, t 6.6–8.9 s).
  - Closer: from the end of the drop the painted cyan river with its pink edges and round foam clouds runs on unbroken into the
    08 chamber up to the ledge; GONE: the speckled (dithered) band across the river, the switch to the rainbow-striped plain sheet,
    the tall white lather slab, and the big white translucent arch (default 09 final wave) that vanished at the cut.
  - Still differs: the camera cut from the 07 ride view to the 08 approved view at t 8.33 is still a cut (camera, not water);
    coins crowd in a stacked column down the drop (pre-existing, review item); K23-3's first 08 frame shows a purple perforated
    strip along the bottom edge (in BEFORE identically — 08 frames BEFORE vs NEW 0 px; s08's domain, for the lead).
  - New problem: none seen. 08 itself unchanged (0 px at t 8.33 and 8.5).
* NOW (13:50): final sequence running (`/home/user/scratch/s07/final.sh`): full NEW clip (Q = step-1 candidate & m07look &
  m07join & K23-3, `/home/user/scratch/s07/Q_FULL.txt`) → `qa/match/07/r26/final/SCREEN07_NEW_full_K23-3_{1x,0.5x}.mp4`;
  gameplay → `qa/match/07/r26/final/gameplay_NEW_full.json`. BEFORE = existing `r24/clips/SCREEN07_BEFORE_r23cand_K23-3_*`.
  Then landmark stills (lip, bend apexes, inlet) BEFORE vs NEW.
* (superseded) step 2 `&m07look=1` proof (segment t 2.0–4.6 s, BEFORE = full step-1 candidate, NEW = + m07look; start view 0 px — DONE
  `qa/match/07/r26/s2_look/{BEFORE,NEW}/a_start.png` 0 px). First look (default tunables 2.5 back / 5.5 up): route ahead shows
  ~0.5 s earlier (t 3.25 vs 3.75) and the river fills more of the lower frame, BUT Benny becomes oversized (camera ≈6.0 u from
  him vs 7.6 normal) and his hat blocks the centre at t 2.5–3.0 → tuned variants b (`m07lkB=5&m07lkU=6.2`) and c
  (`m07lkB=4&m07lkU=7.2&m07lkA=12`) rendering. Step 3 `m07join` segment t 6.6–8.9 s rendering in parallel.

## (r25) WHERE I STOPPED / NEXT
* r25 relaunch (new account, ~12:00 UTC). Worktree `/home/user/wt/s07`, LOCAL branch `claude/rainbow-s07-match-c26` (= `8accdad0` + my
  r24 11:43 edits, applied by the lead). Ports 5277 / 5280 / 5281. Heavy renders via `tools/lead25/render_slot.sh`. Temp
  `/home/user/scratch/s07/`.
* 12:10 DONE: s08 snapshot rebuilt read-only from `/home/user/wt/s08` (K23-3, hashes `combo/s08snap_SHA256SUMS_r25.txt`); combined build
  `/home/user/scratch/s07/combo` (tsc 0). Check `combo/check08_r25/`: 08 approved view **0 px** vs the s08 worker's own K23-3 render
  (`qa/match/08/r23/step3_m08towelm/3_NEW_a00_approved_view.png`); forward 10 u: scenery identical, only Benny's fur shading differs.
* r24 step-1 shots `s1_swing/BEFORE|NEW` (combo, K23-3) are complete (9 + 9). Start view a_start: 27 px (one far coin down the drop
  moved ~2 px with the S); the other shots are at stage fractions and the S makes 07 2.5 u longer, so they are not at the same s.
* 12:23 DONE: BEFORE clip (r23 candidate & K23-3, combo build) rendered, 209 frames / 8.71 s, same schedule as the lead's r23 clip
  (`clips/BEFORE_frames.json`; labelled mp4s `clips/SCREEN07_BEFORE_r23cand_K23-3_{1x,0.5x}.mp4` when the label job is done).
  Seen in it: t 2.5–3.75 the purple tube wall fills ~70 % of the frame, the river is a thin strip at the bottom (step 2); t 7.0–8.1
  the 08 floor ahead shows the game's default streaky sheet with white lather walls, the painted drop river ends in a dithered
  (speckled) band at the 08 inlet, then the cut to the 08 view at t 8.13 (step 3).
* Step 1: tsc 0; continuity with `match07=1&m07sbend=1&m07swing=1` ok (all joins gap 0, 07→08 drop 61.02 u;
  `s1_swing/continuity_NEW.txt`, `path_graph_NEW.md`). NEW clip rendering (`clips/SCREEN07_S1_swing_NEW_K23-3_*`).
* Step 3 code written (`&m07join=1`, Game.ts + match07.ts, tsc 0): the painted river + its round foam clouds run on along the 08
  floor to the end of 08 + 3 u while 07 shows, the default sheet / lather walls stay away to there (no dithered band in view),
  rows eased from the drop's square frame into the 08 frame over 3 u. Test segment queued (combo2).
* NEXT: step 1 verdict from the clip; step 2 `m07look` segment (queued); step 3 segment; gameplay; then the labelled sequence.

## (r24) WHERE I STOPPED / NEXT
* ~11:10 UTC: working on step 1 `&m07swing=1` (code in the worktree, diag renders good: the river sweeps across the tube floor in
  broad S-bends through the middle AND the end, foam banks + coins follow). Step 2 `&m07look=1` (lip camera) code written, first
  segment render running. BEFORE clip (r23 candidate & latest 08, combined render build) rendering on port 5281.
* NEXT: finish step 1 proof (APPROVED / BEFORE / NEW shots, clip, gameplay 8/8 + 91 coins, continuity, tsc), then step 2, then
  step 3 (07→08 water + foam join with the latest 08), then the labelled NEW / BEFORE sequence (1.0x + 0.5x).

Worktree `/home/user/wt/s07`, LOCAL branch `claude/rainbow-s07-match-c25` (= `8accdad0` + my r23 10:25 edits). No commits, no pushes.
Ports 5277 / 5280 / 5281. VISUALS ONLY. Nothing is approved until the user says so.

## Latest Screen 08 for the 07→08 checks — a RENDER-ONLY combined build (important for the lead)
No tree holds both lines: my 07 line (`8accdad0`) has only the r3-era 08 code (none of K16 / m08gl exists there — the lead's r23 clip
could not have shown the latest 08 even with the 08 switches), and the s08 line (`3c0fa97` + WIP) has no Screen 07 match code at all.
For every 07→08 check and both labelled clips I render from a throw-away directory built by
`qa/match/07/r24/combo/mkcombo.py` = my worktree + a READ-ONLY snapshot of the s08 worktree's 08 files (taken 10:50 UTC, s08 HEAD
`3c0fa970`, sha256 list `combo/s08snap_SHA256SUMS.txt`): `match08.ts` + `assets/textures/match08/*` whole, `coins.ts` = s08 file +
my 07 parts spliced in (the 08 coin look limited to non-07 coins), `course.ts` = mine + the 08 line's frame-spacing rule. Nothing is
merged into any branch or committed.
* Check (`combo/check08/`): the combined build with `K16&m08gl=1` reproduces the s08 worker's own r23 render of the 08 approved
  view **0 px** (`qa/match/08/r23/step1_m08gl/3_NEW_a00_approved_view.png`); forward 10 u / 95 % differ only on Benny's fur shading
  (scenery identical; the s08 log notes the same fur-shading variance between its own sessions).
* Queries: latest 08 = `QUERY_08_latest_K16_m08gl.txt`; fair BEFORE = `QUERY_BEFORE_r23cand_latest08.txt` (= lead clip query &
  latest 08; 41 distinct keys, no 07 / 08 key collides).

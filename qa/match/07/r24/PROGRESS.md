# Screen 07 · round 24 (water-fx-specialist) — progress log

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

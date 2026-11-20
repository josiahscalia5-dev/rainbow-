# Screen 07 · round 21 (water-fx-specialist) — progress log

Worktree `/home/user/wt/s07`, local branch `claude/rainbow-s07-match-c22` (from `8accdad0` = r18 step 4). Code = UNCOMMITTED edits in the
worktree (lead autosave snapshots them); each kept step also has `code.patch` (full `git diff` at that step). Brief:
`docs/briefs/2026-11-20-r21/S07_R21.md`. VISUALS ONLY. Nothing is approved until the user says so.

* APPROVED: `/home/user/rainbow-/qa/match/07/r21/APPROVED_07.png` (= `references/07_dive_the_washer_tube.png`, sha256 75782e38…)
* Kept set at the start of the round, K7 (`K7.txt`): `match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1&m07tube=1&m07ring=1&m07foam=1&m07coinsz=1&m07nearw=1&m07foamb=1&m07band=1`
* BEFORE (K7), 9 deterministic shots (`tools/lead21/audit_screen.mjs` + `AUDIT_SHOTS` with two extra end shots e1 = 0.75, e2 = 0.92):
  `/home/user/rainbow-/qa/match/07/r21/BEFORE_K7/` — a_start, b_early, c_middle, d_late, e1_075, e_end, e2_092, f_hard_left, g_hard_right.
  (s: 273.1 / 287.3 / 314.1 / 343.5 / 361.1 / 372.7 / 380.9 / 314.1 L / 314.1 R; plunge top 312.4, 08 starts at 390.2)
* Diagnostics (read-only QA tools, uncommitted in the worktree): `tools/match07/diag_r21.mjs` (shots + hide named meshes + ray probes
  with arc length), `tools/match07/swim_clip_r21.mjs` (half-size real-gameplay clip starting part-way through the stage).

## Step 1 — `&m07end=1`: the END of 07 keeps the approved river (finished 02:30 UTC) — GOOD IMPROVEMENT

What was wrong (diagnosed with mesh hiding + probes, BEFORE e1 / e_end / e2): down the drop (from 5 u past the plunge top) the
game's own water sheet was switched back on over the matched plunge river — that is the pale streaky "waterfall" with sparkles, and
its wide translucent sheet washed out the tube walls; the matched plunge river under it was the old repeating river tile (seen at
the lip as a smeared magenta sheet, hard left / right); it faded out 14 → 3 u before the plunge bottom, leaving a pale smear of the
tube floor; the tall white columns were the lather bank growing back over the last 5 u of 07 (s 385 → 390) plus Screen 08's own
bank beyond.

Change (all behind `&m07end=1`, needs m07tube + m07nearw + m07band + m07foam; default build and K7 unchanged):
* `src/world/match07.ts`: the plunge river is painted with the SAME painted near-river design as the level stretch (glossy cyan
  core, thick magenta satin bands in the world-anchored S-sweep, bubbly trim, painted foam beyond) instead of the repeating tile; its
  cyan core widens from ±1.1 u to ±1.5 u over the first 10 u of the drop (painted far river ≈ half cyan, a quarter magenta each
  side); it now runs to the 08 inlet (fades out over the last 2.2 u). `nearWater()` takes its coordinates as parameters (pure
  refactor: the level stretch computes exactly the same values — start view 0 px).
* `src/game/Game.ts`: while Benny is in 07 only, the game's water sheet is hidden over its whole width from the plunge hand-over to
  the 08 start (dithered back in over the last 3 u; uses the existing `uHide07r` uniform) and the lather bank stays away to the 08
  start (rises, dithered, over 08 start ± 1.5 u; existing `uHide07` uniform). Both uniforms are restored as soon as 07 is not
  shown, so 08's own views are unchanged.

Query NEW: `K7&m07end=1` · BEFORE: K7

Pictures (separate, full size, real game, deterministic):
* APPROVED `/home/user/rainbow-/qa/match/07/r21/APPROVED_07.png`
* BEFORE `/home/user/rainbow-/qa/match/07/r21/BEFORE_K7/*.png`
* NEW `/home/user/rainbow-/qa/match/07/r21/step1_end/NEW/*.png` (same 9 names)
* clips (real gameplay, half size, from 0.55 of the stage through the drop into 08, straight / left / right / straight):
  `/home/user/rainbow-/qa/match/07/r21/step1_end/swim_end_NEW.mp4`, `.../swim_end_BEFORE.mp4`

Checks:
* Start view a_start and b_early: **0 px** (`diff_a_start.png`). Deterministic `scripts/capture.mjs` K7 vs K7&m07end: 07 start
  **0 px**, 08 start **0 px**, 07d entering 08 **0 px** (`proof_0px.json`). Default build: no code runs without the switches.
* Gameplay `node scripts/gameplay-test.mjs --q="K7&m07end=1"`: **8/8 pass, 91 coins, 1,330 → 2,240**, plunge drop 61.14 u
  (`gameplay_new.json`). `npm run test:continuity`: ok, all joins gap 0, 07→08 drop 61.19 u (`continuity.txt`). `tsc` clean.

**Verdict: GOOD IMPROVEMENT** (large on the second half of the stage: d_late, e1, e_end, e2; also middle and hard left / right).
* d_late / e1 / e_end: instead of a pale streaky waterfall, a glossy cyan river with thick magenta banks winds down the drop
  through the purple slotted tube with its gold rings (d_late now reads like the painting's deep ring tube); the tube walls are no
  longer washed out; the tall white columns are gone from the drop — only Screen 08's own bank shows at the very top near the end.
* c_middle / hard left / hard right: the smeared, mirrored magenta sheet at the lip is now crisp glossy cyan beside a thick magenta band.
* Start / early: unchanged (0 px).
* Still wrong (most visible first): (1) the foam beyond the magenta bands is a wide FLAT pale sheet along both walls (painted:
  separate puffy foam clouds) — clearly visible in the drop and at hard left; (2) middle: the view faces the close bend wall (task 3);
  (3) the last ~10 % of 07: Screen 08's own tall white bank and magenta chamber at the top of the frame (08 is paused / not this
  workstream); (4) a faint repeat ripple across the magenta bands (the painted band tile repeats every 2.4 u along).

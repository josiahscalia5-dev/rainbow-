# Screen 04 — round 22 water / foam / chevrons (foam-bubbles-particles)

## (r22) WHERE I STOPPED / NEXT
* STOPPED on the lead's order (2026-11-20: user approved the generated 04 continuation views; a projection specialist now works
  in `/home/user/wt/s04`). Worktree edits left in place, uncommitted.
* DONE: Step 0 (restore proven) and Step 2 = r21 task 2 (foam heaps beside Benny inside the tunnel) — GOOD IMPROVEMENT.
* NOT STARTED as a step (code only, never rendered, OFF by default): r21 task 3 chevron screen clearance `&m04a3sc=1`
  (`s3_unfinished/m04a3sc_unfinished.patch`). Next for whoever resumes: calibrate `m04a3sy` (Benny's top above his root) with
  `&m04a3dbg=1` (red marker), then judge c_middle / d_late / clip; afterwards `m04farsm` / `m04endfit`.
* Candidate query **K22-2** = `s2_bbd/QUERY_K22-2.txt` = K21-1 + `s2_bbd/SWITCH.txt`.

Worktree `/home/user/wt/s04` (local branch `claude/rainbow-s04-match-c23`, uncommitted edits only, dev port 5273).
K21-1 = `$(cat qa/review_r21/audit/QUERY_04.txt)&m04wgl=1` (saved in `QUERY_K21-1.txt`). APPROVED = `1_APPROVED.png`.
Tools (QA only, run from the worktree): `tools/audit_pinned.mjs` (lead audit + pinned river clock), `tools/swim_clip_pinned.mjs`
(port 5273 + pinned clock), `tools/gameplay_test_5273.mjs` (scripts/gameplay-test.mjs on port 5273, same checks).

## Step 0 — prove the restore — RESTORE REPRODUCES THE SAVED STEP-1 RESULT (code identical; water phase is wall-clock)
* Code: `git -C /home/user/wt/s04 diff` == `qa/match/04/r21/code_at_stop_full.patch` (744 lines, identical apart from `index`
  lines); untracked `tools/match04/rings21.mjs` == `r21/untracked_tools/` copy. (`s0_verify/worktree_now.patch`)
* Pictures (`tools/lead21/audit_screen.mjs`, K21-1) `s0_verify/*.png` vs `r21/s1_wgl/NEW/*.png`, full frame:
  a_start 0 px; b_early 209,084; c_middle 281,647; d_late 313,345; e_end 272,975; hard left 129,403; hard right 207,113.
  Every differing pixel is on the river water surface (first differing row 654–764, 0 px above row 640; rings, Benny,
  chevrons, coins, bubbles, HUD identical — `s0_verify/diff/`). Cause: `src/world/match04m4.ts` `out.update` sets the river
  shader time from `performance.now()` (wall clock, pre-existing since base 34cb494), NOT the audit's frozen game clock, so the
  water swirls sit at a different phase in every run (the r21 BEFORE / NEW pairs were also at different water phases).
* Fix for proofs (QA tool only, no game code change): `tools/audit_pinned.mjs` = the lead's audit with `performance.now()`
  pinned to 10 000 ms while each shot is stepped and drawn. Two runs of K21-1 → 0 px in all 7 shots (second run's PNGs deleted
  after the check); pinned start view == saved r21 start view (0 px). `BEFORE_K21/` = BEFORE for r22.

## Step 2 — big glossy foam heaps beside Benny inside the tunnel — `m04bbd` + `&m04bbdf=9` window — GOOD IMPROVEMENT
Switch (`s2_bbd/SWITCH.txt`): `&m04bbd=1&m04bbd0=0.85&m04bbd1=0.85&m04bbdk=0.15&m04bbdx=0&m04bbdg=0.6&m04bbdf=9&m04bbdf1=12&m04bbdn=2&m04bbdn1=3.5&m04bbx=1`
* Painting (zoomed, `scratch/crops/`): big pearly lilac-white bubble heaps lie at the OUTER water edges beside Benny and in the
  bottom corners; further down the tunnel only a few loose pearly bubbles along the edge — no row of clumps lining the lane.
* BEFORE (K21-1): once inside the tunnel there is no foam at all (c_middle, d_late, e_end, hard left / right).
* Code (`src/world/match04m4.ts`, bank heaps only; `s2_bbd/step2_only.patch` = the 22 changed lines on top of the r21 code):
  the r21 unfinished `m04bbd` heaps (Blender bubble heaps along both water edges past the rim banks) get a per-instance
  `aDeep` flag and, with `&m04bbdf=f0` (`m04bbdf1` = f1), are full size only in a window ahead of the camera (shrink into their
  own bubbles' centres from 9 to 12 u ahead; Benny swims ≈ 6.4 u ahead) and have their own near window (`m04bbdn` 2 ->
  `m04bbdn1` 3.5 u) so they stay whole at the bottom corners instead of sinking into the water as flat "caps". Rim heaps,
  every other layout and the default shader are untouched (the hook is only compiled in when `m04bbdf` > 0). `m04bbx`
  (white sparkle + never in front of Benny's silhouette) folded in: its sparkle changes almost nothing (b_early 125 px), its
  Benny clearance keeps heaps off him when he steers into a bank.
* WHAT LOOKS CLOSER (NEW `s2_bbd/NEW/` vs `BEFORE_K21/`, clip): the river edges inside the tunnel now carry the painted big
  glossy pearly foam heaps — beside Benny and in the lower corners (d_late: left x 0–110 / right x 650–860 at Benny's depth,
  almost where the painted left / right foam sits), a few loose bubbles where a heap is forming further ahead, nothing lining
  the lane far ahead, never over Benny (hard left / right, clip frames 24 / 36: the heap stays beside him with the splash
  between). Water, rings, chevrons, coins, Benny identical.
* STILL WRONG: coverage is random per moment (c_middle has a heap only on the right at Benny's depth; the painting shows both
  sides); heaps very close to the camera at hard right are bigger than the painted foreground bubbles; a bubble touching the
  climbing water shows a small notch. The chevrons still sit at hat height (d_late) — task 3, not done.
* Rejected tries (`scratch/`): `bbd_try1` = r21 `m04bbd` as-is (small white "popcorn" clumps floating in the pink side water —
  NOT closer); `bbd_try3` = full-size heaps all down the tunnel (a white foam border lining the lane + flat "mushroom caps" near
  the camera — NOT closer); `bbd_try4` = window 9–12 with near 1.5–3 (right idea, near heaps too big); try5 gaps 0.8 (one side
  often empty) -> 0.6 kept.
* Proof: start view 0 px vs BEFORE (rows 180–1536, `s2_bbd/start_pixeldiff.png`); gameplay
  `tools/gameplay_test_5273.mjs --q=<K22-2>` 8/8 pass, 91 coins, 1,330 -> 2,240 (`s2_bbd/gameplay.json`); HUD coins in every
  shot identical to BEFORE (1,330; hard left 1,360). Kept set unchanged by the new code: K21-1 rendered with the current code
  == BEFORE_K21, 0 px in all 7 shots (`s2_bbd/K21-1_with_new_code/shots.json`). `npx tsc --noEmit` OK.
* Pictures: APPROVED `s2_bbd/1_APPROVED.png`, BEFORE `BEFORE_K21/`, NEW `s2_bbd/NEW/` (7 shots); clips (half size, 2.4 s =
  Screen 04 only, straight / left / right / straight, same pinned water clock) `s2_bbd/BEFORE_swim_clip_half.mp4`,
  `s2_bbd/NEW_swim_clip_half.mp4`, frames `s2_bbd/clip_frames/` (BEFORE_ / NEW_ 0012, 0024, 0036, 0048); full worktree diff
  `s2_bbd/code.patch` (includes the r21 code and the unfinished, inert `m04a3sc` hunks).

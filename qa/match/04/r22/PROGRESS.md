# Screen 04 — round 22 water / foam / chevrons (foam-bubbles-particles)

## (r22) WHERE I STOPPED / NEXT
* DONE: Step 0 — restore proven (code byte-identical to the saved r21 patch; start view 0 px; other shots differ ONLY in the
  river-water phase, see below).
* NOW: Step 2 (r21 task 2) — foam banks deeper into the tunnel (`m04bbd`, unfinished r21 code) + `m04bbx`.
* NEXT: Step 3 (r21 task 3) — chevrons always ahead of Benny / Benny through them neatly; then `m04farsm` / `m04endfit`.

Worktree `/home/user/wt/s04` (local branch `claude/rainbow-s04-match-c23`, uncommitted edits only, dev port 5273).
K21-1 = `$(cat qa/review_r21/audit/QUERY_04.txt)&m04wgl=1` (saved in `QUERY_K21-1.txt`). APPROVED = `1_APPROVED.png`.

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
  pinned to 10 000 ms while each shot is stepped and drawn. Two runs of K21-1 → 0 px in all 7 shots
  (`BEFORE_K21/` vs `s0_verify/pinned_run2/`); pinned start view == saved r21 start view (0 px). `BEFORE_K21/` = BEFORE for r22.

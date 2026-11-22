# Round 22 launch — Screen 04 water / foam / arrows (in-process `foam-bubbles-particles`)

Your full brief is `docs/briefs/2026-11-20-r21/S04_R21.md` (rules, tasks, proof, reporting). THIS file overrides only what changed:

* Worktree `/home/user/wt/s04`, LOCAL branch **`claude/rainbow-s04-match-c23`** (base `34cb4941` + `qa/match/04/r21/code_at_stop_full.patch`
  applied once by the lead; tsc OK). Do NOT commit, do NOT push, never run git in `/home/user/rainbow-`. The lead's five-minute
  autosave snapshots your edits to `backups/wip/claude__rainbow-s04-match-c23/`. Port 5273.
* Proof / logs go to `/home/user/rainbow-/qa/match/04/r22/<step>/` and `/home/user/rainbow-/qa/match/04/r22/PROGRESS.md`
  (start that file with a short "(r22) WHERE I STOPPED / NEXT" block and keep it current after every step).
* Your round-21 log (step 1 `m04wgl` GOOD IMPROVEMENT): `qa/match/04/r21/PROGRESS.md`; its pictures `qa/match/04/r21/s1_wgl/`.
* Current candidate set (not user-approved) **K21-1** = `$(cat /home/user/rainbow-/qa/review_r21/audit/QUERY_04.txt)&m04wgl=1`.
* Pixel tool rebuilt at `/home/user/tools-pixelmatch/pixeldiff.mjs`.

## Step 0 (first, short): prove the restore
Render K21-1 with `audit_screen.mjs` into `qa/match/04/r22/s0_verify/` and compare each shot with the saved
`qa/match/04/r21/s1_wgl/NEW/<shot>.png` (pixeldiff, full frame). Report "restore reproduces the saved step-1 result" (or exactly
which shots differ and why). Then continue with r21 task 2 (foam banks deeper into the tunnel + `m04bbx`), task 3 (chevrons /
Benny through them neatly; then `m04farsm` / `m04endfit`). Up to 3 finished steps, then stop and report to the lead.

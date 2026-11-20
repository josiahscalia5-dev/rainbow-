# Round 22 launch — Screen 07 (in-process `water-fx-specialist`)

Your full brief is `docs/briefs/2026-11-20-r21/S07_R21.md` (rules, tasks, proof, reporting). THIS file overrides only what changed:

* Worktree `/home/user/wt/s07`, LOCAL branch **`claude/rainbow-s07-match-c23`** (base `8accdad0` + `qa/match/07/r21/code_at_stop_full.patch`
  applied once by the lead; tsc OK). Do NOT commit, do NOT push, never run git in `/home/user/rainbow-`. The lead's five-minute
  autosave snapshots your edits to `backups/wip/claude__rainbow-s07-match-c23/`. Port 5277.
* Proof / logs go to `/home/user/rainbow-/qa/match/07/r22/<step>/` and `/home/user/rainbow-/qa/match/07/r22/PROGRESS.md`
  (start it with a short "(r22) WHERE I STOPPED / NEXT" block and keep it current after every step).
* Your round-21 log (step 1 `m07end` GOOD IMPROVEMENT): `qa/match/07/r21/PROGRESS.md`; pictures `qa/match/07/r21/step1_end/`.
* Current candidate set (not user-approved) **K7e** = `$(cat /home/user/rainbow-/qa/match/07/r21/K7.txt)&m07end=1`.
* **USER-APPROVED framing TEST for 07** (2026-11-20 ~02:20): "test the camera framing changes that could preserve the approved
  composition better during swimming. The result must still support real forward movement, steering, depth, and visibility of the
  route. Show me the actual gameplay before keeping a candidate." → you MAY build `&m07view=1` (own switch; start view 0 px; never in
  the kept set until the user approves; uninterrupted swim clip through the whole of 07 incl. the 07→08 drop; continuity test OK).
* Pixel tool rebuilt at `/home/user/tools-pixelmatch/pixeldiff.mjs`.

## Step 0 (first, short): prove the restore
Render K7e (incl. `AUDIT_SHOTS` e1 0.75 / e2 0.92) into `qa/match/07/r22/s0_verify/` and compare with the saved
`qa/match/07/r21/step1_end/NEW/<shot>.png` (pixeldiff, full frame). Report "restore reproduces the saved step-1 result" (or exactly
which shots differ and why). Then: r21 task 2 (flat pale foam sheets → puffy clouds; hard left / right magenta sheets), then the
middle (r21 task 3) — scenery first, `&m07view=1` framing test if scenery alone cannot get there. Up to 3 finished steps, then stop.

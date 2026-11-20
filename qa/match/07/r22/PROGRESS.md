# Screen 07 · round 22 (water-fx-specialist) — progress log

## (r22) WHERE I STOPPED / NEXT
* DONE: Step 0 — restore reproduces the saved r21 step-1 result (details below).
* NOW: r21 task 2 (flat pale foam sheets -> puffy clouds; hard left / right magenta sheets) — diagnosing.
* NEXT: task 3 (the middle).

Worktree `/home/user/wt/s07`, LOCAL branch `claude/rainbow-s07-match-c23` (base `8accdad0` + r21 code incl. `m07end`). No commits,
no pushes; the lead autosave snapshots the worktree edits. Port 5277. Brief: `docs/briefs/2026-11-20-r22/LAUNCH_S07.md` +
`docs/briefs/2026-11-20-r21/S07_R21.md`. VISUALS ONLY. Nothing is approved until the user says so.

* APPROVED: `/home/user/rainbow-/qa/match/07/r21/APPROVED_07.png` (= `references/07_dive_the_washer_tube.png`)
* Candidate set at the start of r22, K7e = `K7&m07end=1` (K7 = `qa/match/07/r21/K7.txt`).

## Step 0 — restore check (03:20 UTC): restore reproduces the saved step-1 result
K7e rendered with `tools/lead21/audit_screen.mjs` (+ `AUDIT_SHOTS` e1 0.75 / e2 0.92) into
`/home/user/rainbow-/qa/match/07/r22/s0_verify/` and compared FULL FRAME (rows 0–1536, pixeldiff threshold 0.1) with
`qa/match/07/r21/step1_end/NEW/`: all 9 shots **0 px** (`s0_verify/pixeldiff_fullframe.txt`). 8 of 9 PNGs are byte-identical;
c_middle differs in 2 pixels by 1 colour level (software-GPU rounding, invisible).

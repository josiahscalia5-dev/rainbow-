# Round 23 — Screen 07 (in-process `water-fx-specialist`)

Full brief: `docs/briefs/2026-11-20-r21/S07_R21.md` + `docs/briefs/2026-11-20-r22/LAUNCH_S07.md` (rules, tasks, proof). This file overrides:
* Worktree `/home/user/wt/s07`, LOCAL branch **`claude/rainbow-s07-match-c24`** = `8accdad0` + the r22 WIP snapshot (applied ONCE by the
  lead at ~04:10: r21 code + step 1 `m07cloud` + the unfinished, untested `m07satin`). Do NOT re-apply `s1_cloud/code.patch` or the WIP
  patch. Do NOT commit / push; never run git in `/home/user/rainbow-`; port 5277 (5280–5281 free for parallel renders).
* Your r22 log: `qa/match/07/r22/PROGRESS.md` (step 0 restore OK, step 1 `&m07cloud=1` worker GOOD). Write r23 proof to
  `/home/user/rainbow-/qa/match/07/r23/<step>/` and `qa/match/07/r23/PROGRESS.md` (start with "(r23) WHERE I STOPPED / NEXT").
* Candidate (not user-approved): **K7c** = `$(cat /home/user/rainbow-/qa/match/07/r21/K7.txt)&m07end=1&m07cloud=1`.
* **Lead review of step 1 (~04:40):** flat streaky sheets → puffier cloud banks = small GOOD IMPROVEMENT (texture). But along the drop
  they still read as TALL WHITE FOAM WALLS lining both sides of the river (d_late, e_end); the painting shows the deep purple slotted
  tube with gold rings / gold paddles coming down close to the water and only LOW soft foam clouds (biggest at the bottom corners).
* The user's newest rule from Screen 04 applies in spirit: clean, not messy; follow the painting's proportions (07 does have thick
  magenta banks — keep those as painted, crisp, not smeared).
* TRAP: the game reads the FIRST occurrence of a URL switch — replace values in place with
  `node /home/user/rainbow-/tools/lead23/setq.mjs "<query>" "a=1&b=2"`.
* Pixel tool `/home/user/tools-pixelmatch/pixeldiff.mjs`.

## Steps
1. Finish + test the started `&m07satin=1` (crisp lens-shaped satin streaks on the magenta bands; fixes the smeared magenta sheet in the
   foreground at hard left / right). Keep only if it reads closer by eye.
2. Lower the foam walls along the drop into low soft clouds so the purple slotted tube + gold rings show down to the water (own switch).
3. The middle (the view faces a close purple wall) — scenery first; the user-approved framing TEST `&m07view=1` only if scenery cannot
   get there (start view 0 px, uninterrupted clip through all of 07 incl. the 07→08 drop, continuity OK, never in the kept set until the
   user approves).
Proof per step as in the r21 brief (APPROVED / BEFORE / NEW separate full-size shots incl. e1 0.75 / e2 0.92, clip, gameplay 8/8 +
91 coins, `npx tsc --noEmit`, `code.patch`). Up to 3 finished steps, then stop and report (steps, switches, verdicts, folders, clips,
candidate query, most visible remaining difference). No paid jobs (ask the lead).

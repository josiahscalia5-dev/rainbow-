# Round 23 — Screen 08 polish (in-process `washer-environment-modeler`) — user RESUMED Screen 08 (r21, restated r23)

Full brief: `/home/user/rainbow-/docs/briefs/2026-11-18-r15/S08_LAUNCH.md` (method, rules, proof) + binding
`/home/user/rainbow-/docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md` (VISUALS ONLY) + `/home/user/rainbow-/docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md`.
This file overrides:
* Worktree `/home/user/wt/s08`, LOCAL branch **`claude/rainbow-s08-scenery-c24`** = `claude/rainbow-s08-scenery-c17` @ `3c0fa970` (the
  saved successful version, K16). Do NOT commit / push (the lead's autosave snapshots the worktree); never run git in
  `/home/user/rainbow-`; never touch other worktrees. Port 5278 (5286–5287 free for parallel renders; at most 2 renders at a time —
  the machine is shared by four workers).
* Your history: `/home/user/wt/s08/qa/match/08/r17/PROGRESS.md` (step 1 `m08vh` KEPT → K16; step 2 `m08gl` near-water glints
  UNFINISHED, NOT YET PROVEN). Check first whether the `m08gl` code is in the worktree (`grep -n m08gl src/world/match08.ts`); if it is
  not, look for it in `/home/user/rainbow-/backups/wip/claude__rainbow-s08-scenery-c17/` and apply it ONCE.
* K16 = `cat /home/user/rainbow-/qa/review_r21/audit/QUERY_08.txt` (`coins08px=1` = the user's preferred coin version — keep it).
* Write r23 proof to `/home/user/rainbow-/qa/match/08/r23/<step>/` + `/home/user/rainbow-/qa/match/08/r23/PROGRESS.md` (start with
  "(r23) WHERE I STOPPED / NEXT").
* TRAP: the game reads the FIRST occurrence of a URL switch — replace values in place with
  `node /home/user/rainbow-/tools/lead23/setq.mjs "<query>" "a=1&b=2"`. Pixel tool `/home/user/tools-pixelmatch/pixeldiff.mjs`.
  HUD font tip from the 06 worker: worktree `node_modules` is a symlink, so the dev server may refuse the HUD fonts; see
  `/home/user/wt/s06/tools/match06/r23_vite.mjs` for the fix (QA tool only).
* The user's newest general wish (Screen 04, applies in spirit): clean, not messy; judge everything WHILE Benny swims.

## Steps (r21 queue)
1. Finish `m08gl` (the torn white "lightning" glints in the near water below Benny → the painted soft glow) — verdict.
2. Coin sizing: coins look LARGER than painted while swimming (keep `coins08px=1` look, positions and count; 91 coins in gameplay).
3. Towel double exposure (`m08towelm`: the hard-edged rectangle of window pixels round the towel at hard left / right).
Proof per step: APPROVED `references/08_final_spin_chamber.png` / BEFORE (K16) / NEW separate full-size shots (start, forward 3 / 6 /
10 / 20 u, end, hard left / right), uninterrupted swim clip through all of 08 at real game speed (+ half speed; state the speed),
gameplay 8/8 + 91 coins, start view 0 px, `npx tsc --noEmit`, `code.patch`, 3–5 line verdict in plain visual words (GOOD
IMPROVEMENT / NOT AN IMPROVEMENT / NOT YET PROVEN). Up to 3 finished steps, then stop and report. No paid jobs (ask the lead).

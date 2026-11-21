# Round 23 — Screen 06 (in-process `path-camera-transition-engineer`, also acting as reference-match director)

Full brief: `/home/user/rainbow-/docs/briefs/2026-11-20-r21/S06_R21.md` + `/home/user/rainbow-/docs/briefs/2026-11-20-r22/LAUNCH_S06.md`.
This file overrides:
* The r22 06 cloud session ran on the OLD account and is treated as STOPPED (last push 04:09). You continue its work in worktree
  `/home/user/wt/s06`, LOCAL branch **`claude/rainbow-s06-match-c24`** = `claude/rainbow-s06-match-c23` @ `e162aec` (its last autosave).
  NEVER write `-c23`. Do NOT commit / push from the worktree (the lead's autosave snapshots it); never run git in `/home/user/rainbow-`.
  Port 5276 (5282–5283 free for parallel renders).
* Where it stopped (`qa/match/06/r22/PROGRESS.md` in the worktree): step 1 `&m06view=1` NOT YET PROVEN (shown to the user; the user has
  not decided); step 2 `&m06st=1` start-view flash fix = small GOOD IMPROVEMENT (lead review pending); **step 3 `m06fcl` (big white foam
  walls → low puffy foam clouds in the lower corners) was BUILT (code in `src/world/match06.ts`) with BEFORE / NEW pictures, a
  `rejected_wide_band_fclw1.0/` try, `swim_06_NEW.mp4`, `with_m06view/` and `gameplay.txt` in `qa/match/06/r22/step3_m06fcl/` — but no
  verdict was written.** K6 = the line in that PROGRESS.md.
* Write r23 proof to `/home/user/rainbow-/qa/match/06/r23/<step>/` + `/home/user/rainbow-/qa/match/06/r23/PROGRESS.md` (start with
  "(r23) WHERE I STOPPED / NEXT"; copy the r22 WHERE-I-STOPPED block in so the history stays in one place).
* TRAP: the game reads the FIRST occurrence of a URL switch — replace values in place with
  `node /home/user/rainbow-/tools/lead23/setq.mjs "<query>" "a=1&b=2"`. Pixel tool `/home/user/tools-pixelmatch/pixeldiff.mjs`.
* The user's newest rule from Screen 04 applies in spirit: clean water, not messy; no giant foam walls.

## Steps
1. Finish step 3: check the `m06fcl` code compiles (`npx tsc --noEmit`), re-render BEFORE (K6 + `m06st=1`) / NEW (+ `m06fcl…`) with and
   without `m06view`, BEFORE clip if missing, gameplay 8/8 + 91 coins, continuity OK, verdict.
2. The off-centre tunnel / leftward crest (the most visible remaining difference after r22: rings turn into a centred bullseye within
   the first second) — scenery first; the user-approved framing TEST `m06view` may be tuned further (own switches, start view 0 px).
3. Next most visible difference (ripple rings round Benny, gold paddle lids upper left, coins along the crest — pick by eye).
Proof per step: APPROVED `references/06_crest_the_rinse_arch.png` / BEFORE / NEW separate full-size shots (start, early, middle, late,
end, hard left / right), uninterrupted swim clip through all of 06 into 07, gameplay 8/8 + 91 coins, `code.patch`, 3–5 line verdict in
plain visual words. Up to 3 finished steps, then stop and report. No paid jobs (ask the lead).

# Round 15 (account 15) — Screen 08 specialist launch prompt (washer-environment-modeler)

You are the Rainbow project's `washer-environment-modeler`, working ONLY on playable Screen 08 "Final Spin Chamber", VISUALS ONLY.
(Account 14 ran out of usage at ~17:46 UTC; you continue its work on a NEW branch. Nothing of account 14 was lost.)

## Where you work
* Git worktree `/home/user/wt/s08` on branch `claude/rainbow-s08-scenery-c15` (created from `claude/rainbow-s08-scenery-c14` @
  `df4a3bb7`, the newest account-14 tip; no unfinished edits were left). `node_modules` is a symlink to the lead checkout.
* Commit and `git push -u origin claude/rainbow-s08-scenery-c15` after every step (kept or rejected). Push ONLY that branch. Never
  force-push, rebase, reset, merge, or write any other branch (every `-c14` / `-c13` / older branch is protected).
* Use dev-server port 5278 (as round 14; the lead uses 5273/5274, Screen 05 uses 5275). The lead's five-minute autosave snapshots
  your unfinished edits into `backups/wip/` — do not touch it. Never commit or print secrets. No paid jobs. Do not reinstall tools.

## Binding rules — read FIRST
`docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md` (BINDING, user-approved), `docs/briefs/2026-11-18-r11/USER_ORDER_R11_STRICT.md`,
`docs/briefs/2026-11-18-r10/RULES_R10.md`, `docs/briefs/2026-11-18-r8/COMMON_RULES.md` (read older round numbers as r15 / -c15).
In short: `references/08_final_spin_chamber.png` is the BLUEPRINT: wide drum chamber framed by a huge gold ring; the silver washer door
with porthole at the far end over a gold-rimmed perforated platform with a folded purple towel; four gold-banded spout cups with pink
perforated caps pouring from their undersides; S-river with coins through purple perforated walls and floor. No redesign, no generic
substitutes, no invented parts (the rejected `m08urcup` invented a cup front — never repeat). It must still look like the approved world
WHILE BENNY SWIMS (start, forward ≈3/6/10/20 u, middle, end, hard left / right): no stretching, tearing, double exposure, duplicate
rings, clipping, flat slabs. Biggest visible difference first. Keep ONLY changes that clearly look closer by eye; reject the rest.
Never change Benny, coins logic (`coins08px` = the user's preferred coin version, 91 coins / score continuity), physics, input, HUD,
camera framing at the approved view, or other screens. Every change is a URL switch (`&m08xxx=1`); the default build stays unchanged;
the approved view stays pixel-identical in the scenery.

## Resume, do not repeat
Read `qa/match/08/r14/PROGRESS.md` (account 14: step 1 `m08nq` near water at the painted scale KEPT, GOOD IMPROVEMENT, not yet shown to
the user), `qa/match/08/r13/PROGRESS.md`, `git log -15`. Log everything in `qa/match/08/r15/PROGRESS.md`.
Kept set now: `K14 = K13&m08nq=1` with `K13 = K12&m08bore=1&m08flange=1&m08cupw=1`,
`K12 = K11&m08cup=1&m08rw=1&m08drum=1&m08ring=1&m08cupg=1`, `K11 = K10&m08ceil=1&m08near=1`,
`K10 = match08=1&coins08px=1&m08bw=1&m08fill=1&m08arch=1&m08swim=1&m08seam=1&m08sill=1&m08towel=1&m08far=1&m08coinv=1`.

## Your next tasks (in order; biggest visible difference first)
1. Leftovers of step 1 (only if a clean fix exists): the hard straight edge across the water near the frame bottom at forward 3 u
   (before the near tile becomes active); the near streaks run straight along the river whereas the painted ones sweep in curves.
2. Task (b) of round 14: wall seams — purple perforated walls must read as one continuous wall while swimming (no visible seams,
   no stretched perforations).
3. Task (c): river-edge foam and the coin-line shape along the painted S.
4. Spout cups: shapes, gold bands, pink perforated caps and the water pouring from their undersides; remove excessive highlights.
5. Task (d): the soft V in the upper-right cup's gold band (only if a clean fix exists).
Then the next biggest visible difference you find by comparing the approved picture with the live game at all views.

## Proof for every finished step (the user only accepts pictures from the REAL playable game)
Separate full-size portrait renders (no collages) under `qa/match/08/r15/<step>/`: `1_APPROVED.png`, `2_BEFORE_<shot>.png` (kept set
without this step), `3_NEW_<shot>.png` — all 12 audit shots of `tools/match08/shots08.mjs` (start, forward 3/6/10/20 u, middle, end,
hard left / right). A short real-gameplay swimming clip (`tools/lead_r13/swim_clip.mjs`) when the change is visible in motion. Write a
3–5 line verdict in plain visual words (what is closer, what is still wrong) with GOOD IMPROVEMENT / NOT AN IMPROVEMENT / NOT YET
PROVEN. No colour-percentage claims as proof.

## Reporting
After each finished step: commit + push, then SendMessage to "main" with: step name + URL switch, commit SHA, verdict, the folder of
the NEW pictures, and the single most visible remaining difference. Keep it short. Then continue with the next task without waiting.
If blocked (tool missing, paid job needed, design decision the approved picture does not answer), tell "main" and continue with the
next task. Keep working through the task list until you run out of tasks or are stopped.

# Round 15 (account 15) — Screen 05 specialist launch prompt (water-fx-specialist)

You are the Rainbow project's `water-fx-specialist`, working ONLY on playable Screen 05 "Flow Into the Current", VISUALS ONLY.
(Account 14 ran out of usage at ~17:46 UTC; you continue its work on a NEW branch. Nothing of account 14 was lost.)

## Where you work
* Git worktree `/home/user/wt/s05` on branch `claude/rainbow-s05-match-c15` (created from `claude/rainbow-s05-match-c14` @ `34aadd11`,
  the newest account-14 tip). `node_modules` is a symlink to the lead checkout. Untracked BEFORE shots of the unfinished step 4
  (`qa/match/05/r14/step4_trans/before/`, partial: x99 x100 x101 x103 x105 t102_06 + shots.json; t95/t98/x93/x96/x97 were too big
  for the WIP snapshot — re-capture what you need).
* Commit and `git push -u origin claude/rainbow-s05-match-c15` after every step (kept or rejected). Push ONLY that branch. Never
  force-push, rebase, reset, merge, or write any other branch (every `-c14` / `-c13` / older branch is protected).
* Use dev-server port 5275 (the lead uses 5273/5274, Screen 08 uses 5278). The lead's five-minute autosave snapshots your
  unfinished edits into `backups/wip/` — do not touch it. Never commit or print secrets. No paid jobs. Do not reinstall tools.

## Binding rules — read FIRST
`docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md` (BINDING, user-approved), `docs/briefs/2026-11-18-r11/USER_ORDER_R11_STRICT.md`,
`docs/briefs/2026-11-18-r10/RULES_R10.md`, `docs/briefs/2026-11-18-r8/COMMON_RULES.md` (read older round numbers as r15 / -c15).
In short: `references/05_flow_into_the_current.png` is the BLUEPRINT. Reproduce ITS purple slotted tunnel, glossy gold ring bands and
gold paddle lids, bright far throat, wide glossy cyan river with hot-pink satin bands in S-curves, puffy white foam clouds on both
banks, centre coin line, Benny's white splash wake — no redesign, no generic substitutes. It must still look like the approved world
WHILE BENNY SWIMS (start, forward ≈3/6/10/20 u, middle, end, hard left / right): no stretching, tearing, double exposure, duplicate
rings, clipping, flat slabs. Biggest visible difference first. Keep ONLY changes that clearly look closer by eye; reject the rest.
Never change Benny, coins logic (91 coins / score continuity), physics, input, HUD, camera framing at the approved view, or other
screens. Every change is a URL switch (`&m05xxx=1`); the default build stays unchanged; the locked approved view stays 0 px.

## Resume, do not repeat
Read `qa/match/05/r14/PROGRESS.md` (account 14: step 1 m05vee REJECTED, step 2 m05vee2 painted pink V KEPT + shown to the user as
GOOD IMPROVEMENT, step 3 m05bank piled foam bubbles KEPT, not yet shown), `qa/match/05/r13/PROGRESS.md` (rejected m05slot, m05lump —
never repeat), `git log -15`. Log everything in `qa/match/05/r15/PROGRESS.md`.
Kept set now (= r14 step-3 set):
`?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1&m05flat=1&m05cloud=1&m05wtile=1&m05end=1&m05fmag=1&m05fpaint=1&m05fcloud=1&m05fcoin=1&m05join=1&m05frim=1&m05vee2=1&m05bank=1`

## Your next tasks (in order; biggest visible difference first)
1. Task 4 of round 14 (unfinished): the 05 → 06 transition / end of 05 (t95 … t105 and the first metres of 06 seen from 05) must
   continue the SAME approved 05 world — no flat panels, seams, sudden colour changes or generic tunnel. Do not change 06 itself.
2. The m05bank leftover: where the bank turns at the kink (k81 left) the bubble pile stands as a tall narrow column with a level top —
   make it the low, rounded, bubbly foam clouds of the painting; remove the loose bubbles at its foot.
3. The painted V leftover: bands slightly narrower / crisper at their outer ends; more of the painted crisp four-point white glints in
   the cyan core (instead of long streaks) — only if it clearly looks closer.
4. Then the next biggest visible difference you find by comparing the approved picture with the live game at all views (walls,
   gold bands, paddle lids, far throat, foam banks, coins placement).

## Proof for every finished step (the user only accepts pictures from the REAL playable game)
Separate full-size portrait renders (no collages) under `qa/match/05/r15/<step>/`: APPROVED (`references/05_flow_into_the_current.png`),
BEFORE (the kept set without this step), NEW (with it) — at the approved start view, forward ≈3/6/10/20 u, t33/t66 (middle), end and
hard left + hard right, using `tools/match05/r8_shots.mjs` as round 14 did. A short real-gameplay swimming clip
(`tools/lead_r13/swim_clip.mjs`) when the change is visible in motion. Write a 3–5 line verdict in plain visual words (what is
closer, what is still wrong) with GOOD IMPROVEMENT / NOT AN IMPROVEMENT / NOT YET PROVEN. No colour-percentage claims as proof.

## Reporting
After each finished step: commit + push, then SendMessage to "main" with: step name + URL switch, commit SHA, verdict, the folder of
the NEW pictures, and the single most visible remaining difference. Keep it short. Then continue with the next task without waiting.
If blocked (tool missing, paid job needed, design decision the approved picture does not answer), tell "main" and continue with the
next task. Keep working through the task list until you run out of tasks or are stopped.

# Screen 08 · Final Spin Chamber — round 16 progress (branch `claude/rainbow-s08-scenery-c16`)

Authority: `references/08_final_spin_chamber.png`. Brief: `docs/briefs/2026-11-18-r15/S08_LAUNCH.md` + round-16 changes
(`docs/briefs/2026-11-18-r16/RESUME_R16.md` section s08) + binding user order `docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md`
(VISUALS ONLY). History: `qa/match/08/r15/PROGRESS.md` (account 15, cut off mid step 1), `qa/match/08/r14/PROGRESS.md`.
Start = `df4a3bb7` + account-15 unfinished edits (`src/world/match08.ts` `m08sr` + QA `m08dbguv`, `tools/match08/shots08.mjs`
`M08_DET=1`), restored uncommitted in `/home/user/wt/s08`.
Kept set at start: `K14 = K13&m08nq=1` (full chain in the r15 log). Rejected, never repeat: `m08urcup`.

* 2026-11-18 ~19:15 UTC round 16 started (washer-environment-modeler, account 16).

## Step 1 — `&m08sr=1` (smooth river course + rounded swim-remap corners; floor only, with m08swim) — KEPT (GOOD IMPROVEMENT, small)
Kept query: `K15 = K14&m08sr=1`
* Why the account-15 BEFORE and NEW files were identical: the only shot it had rendered was `f20_forward20u`, which lands at
  s 411.5 = already Screen 09 ("09 · RIDE THE FINAL WAVE"); the 08 floor is not in that view. Re-rendered all 11 in-stage shots
  for BEFORE (K14) and NEW (K14&m08sr=1) with `M08_DET=1` (exactly the same positions); f20 kept from account 15 (identical,
  stage 09).
* What changed (`src/world/match08.ts` floor shader, only with `&m08sr=1`): the river course table is read through a smooth
  curve instead of straight pieces, and the three zones of the swim remap (1:1 middle, compressed bank band, floor easing back)
  blend with rounded corners instead of hard bends (also at the edge of the m08nq 1:1 middle).
* Approved start view: scenery pixel-identical (0 px differ in rows 180-1536). Coins unchanged (same positions / counts in every
  shot; only water pixels differ).
* What looks closer: forward 3 u — the straight fold line across the water below Benny (streaks bent sharply on it, a second
  crease climbing to the right) is gone; the cyan / pink streaks now sweep in smooth curves like the painted S. Forward 6 u — the
  zig-zag chevron kinks in the pink streaks left of Benny are gone. Hard left — the stepped kink in the pink water under Benny is
  gone. Forward 10 u / hard right: practically unchanged.
* Still wrong: near the frame bottom at forward 3 u the water still turns blurry / flat (the painted-scale near tile is not active
  yet there); the near streaks below Benny still run mostly straight down the lane (painted: curved sweeps); glints read as
  torn "lightning" shapes.
* Verdict: GOOD IMPROVEMENT (small).
* Pictures (separate, full size): `/home/user/wt/s08/qa/match/08/r16/step1_m08sr/1_APPROVED.png`, `2_BEFORE_<shot>.png` (K14),
  `3_NEW_<shot>.png` (K15), all 12 shots (best: `f03_forward3u`, `f06_forward6u`, `s_left_hard`). No swimming clip (CPU budget;
  the change is a smoothing of fold lines, shown by the deterministic stills).

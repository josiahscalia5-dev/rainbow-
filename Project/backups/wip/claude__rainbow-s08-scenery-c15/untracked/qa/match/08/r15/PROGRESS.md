# Screen 08 · Final Spin Chamber — round 15 progress (branch `claude/rainbow-s08-scenery-c15`)

Authority: `references/08_final_spin_chamber.png`. Start = `claude/rainbow-s08-scenery-c14` @ `df4a3bb7` (account 14 tip, worktree
clean). Brief: `docs/briefs/2026-11-18-r15/S08_LAUNCH.md` (lead checkout).
Kept set at start: `K14 = K13&m08nq=1`, `K13 = K12&m08bore=1&m08flange=1&m08cupw=1`,
`K12 = K11&m08cup=1&m08rw=1&m08drum=1&m08ring=1&m08cupg=1`, `K11 = K10&m08ceil=1&m08near=1`,
`K10 = match08=1&coins08px=1&m08bw=1&m08fill=1&m08arch=1&m08swim=1&m08seam=1&m08sill=1&m08towel=1&m08far=1&m08coinv=1`.
Rejected, never repeat: `m08urcup` (invented upper-right cup front).

* 2026-11-18 ~18:20 UTC round 15 started (washer-environment-modeler, account 15, worktree `/home/user/wt/s08`).
  Task 1: leftovers of r14 step 1 (hard straight edge across the water at forward 3 u; straight near streaks).

## Tooling notes (r15)
* `tools/match08/shots08.mjs` got an opt-in `M08_DET=1`: the screenshot shows exactly the stepped position (no two real-time
  frames before it). Without it the audit positions drift by up to ~0.4 u between runs (seen: forward 3 u landed at
  s 395.01 / 395.15 / 395.23 / 395.37 in four runs), so BEFORE and NEW were never at quite the same spot. Round-15 BEFORE / NEW
  sets are rendered with `M08_DET=1` (same 12 shot names and targets; default behaviour of the tool unchanged).
* QA-only switch `&m08dbguv=1` (floor): writes the plate u / v the floor samples (after the swim remap) and the near-tile
  weight as colour — used to trace which painted pixels each frame pixel shows.

BEFORE set for round 15 (kept set K14, 12 shots, deterministic): `/home/user/wt/s08/qa/match/08/r15/BEFORE_K14/`.

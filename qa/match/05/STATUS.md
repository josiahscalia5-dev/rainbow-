# Screen 05 — STATUS (round 8)

* **Running-session status: RUNNING (round 8, account 8, branch claude/rainbow-s05-match-c8)** — started 2026-11-18 from `a34fb925` (= `-c7` tip). Task: user list 2026-11-18 (water design while swimming, soft bank edges, disconnected scenery edges, oversized near coin over Benny). BEFORE = `qa/match/05/r7/NEW/` (rendered with exactly the base set `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1`; no source change since).

## Round 7 record (below, unchanged)

* **Assigned screen:** 05 · FLOW INTO THE CURRENT (line B, `?match05=1` set)
* **Assigned specialist:** Screen 05 workstream (washer-environment-modeler role), round 7 / account 7; no subagent used
* **Working branch:** `claude/rainbow-s05-match-c7`, created by the lead from `claude/rainbow-s05-match-c5` @ `ebaf6cac71812ad5c00a9088ba48b6febdb42b2b`; never merged with line A
* **Round-7 session status:** milestone M3 step 2 finished; STOPPED
* **Latest verified commit:** the last commit on `claude/rainbow-s05-match-c7` (remote == HEAD verified at the final push)
* **Completed this round:** `?m05far=1` (needs `match05=1`): the far forced-perspective tunnel follows the live camera instead of folding away, so Screen 05's own purple ring tunnel, gold rings, warm throat and winding S-river continue to ~90 % of the stage (fold into 06 only in the last ~3 u). Files: `src/world/match05far.ts` (new), `src/vfx/clip05.ts` (new), hooks in `src/world/environment.ts` and `src/vfx/foam.ts` (switch-only). Details: NOTES.md "Round 7".
* **Current set for the user:** `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1`
* **Numbers (moving, LAYOUT20 / PALETTE vs approved):** t66 5.8 / 71.0 % → **9.0 / 81.4 %**; t33 15.2 / 83.9 → 15.4 / 84.1; early frames ±1 pt; t95 unchanged (06 hand-over). Locked view 0 px vs BEFORE.
* **Honest moving rating (subjective):** approved view ~8.5; early swim ~6.5; two-thirds through **~4 → ~6**; last 5 % ~4 (06).
* **Unfinished problems:** blurry near walls / far rings up close; faint texture edge + paler water where the far river begins at the seam; pale far bank shelves; near coin while riding ≈190–230 px vs ≤ ≈96 px approved (lead-owned).
* **Test results:** tsc clean; default 0 px and protected `?ringa=26&nearfloor05=0` 0 px vs the start commit; locked NEW set 0 px vs BEFORE set; gameplay 8/8 default + NEW, 91 coins 1,330 → 2,240 each; continuity ok. Stored 2026-11-16 baselines differ ~128 k px already at the start commit (renderer drift, predates this round).
* **Pictures:** `qa/match/05/r7/APPROVED_05_flow_into_the_current.png`, `r7/BEFORE/` and `r7/NEW/` (12 audit positions each, separate full-size files).
* **Next task:** M3 step 3 materials — crisp rectified purple wall tile (`?m05wall=1`), modeled far gold rings at real scale (`?m05ring=1`), seam blend of the far water (see NOTES).
* **Approval status:** under review (NOT approved — only the user approves)

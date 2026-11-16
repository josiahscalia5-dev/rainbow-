# Screen 05: wave 7 (account 8, session branch `ccr-4f6c3e0e-5kxgr0`)

Started 2026-11-16 ~00:45 UTC. Branch `ccr-4f6c3e0e-5kxgr0` contains the newest commit of account 7's
`ccr-93add0fa-q17ey6` (`6cf0b4f`) + autosaves. Nothing lost. Wave 6b was planned (NOTES.md in
`qa/pilot05/wave6/{environment,water,foam}/`) but stopped by account 7's usage limit before any capture:
**wave 7 executes those wave-6b plans.** All rules, owners and targets of `COORDINATION_WAVE6.md` still apply.

## Verified at start (this session)
* LFS 9/9 restored, `git lfs fsck` OK. References 12/12 SHA OK. `tsc` OK.
* Gameplay test pass (victory, heart loss on wall bump, plunge 61.41, errors []). Continuity gaps 0.
* Baseline capture: `qa/pilot05/wave7/baseline/05.png` (86 calls, 633,521 tris) — identical tree to wave 6's
  `regress0408/now/05.png` (camera LOCKED, S-curve refit kept).

## Owners (unchanged from wave 6 — edit only your own files/sections, Edit tool only)
| Specialist | Owns | Wave-7 targets (COORDINATION_WAVE6 table rows) |
|---|---|---|
| washer-environment-modeler | as in wave 6 | 1 rings, 2 walls, 6 lids, 8 VP, then 9 near gold frame corners |
| water-fx-specialist | as in wave 6 | 5 near field (diagonal pink sweeps, no pool arcs), mid-field band centres |
| foam-bubbles-particles | as in wave 6 | 7 foam rims (soap ramp, smaller/lower heaps, purple wall visible above) |
| coordinator (main session) | as in wave 6 | camera LOCKED, course LOCKED, tests, reports |

## Rules
* Evidence to `qa/pilot05/wave7/<you>/itNN`; NOTES in `qa/pilot05/wave7/<you>/NOTES.md` (plan first, log after
  every capture). Report against `PREV=qa/pilot05/wave7/baseline/05.png`.
* At most 6 iterations each. Whole-frame judgement; revert anything that does not look closer.
* 04/07/08 must stay pixel-identical below the HUD to `qa/pilot05/wave6/regress0408/now/NN.png` unless your
  change is meant to affect them; 06 must keep its stage anchors.
* No commits (autosave pushes every 5 min), no paid generation, no secrets, no invented fidelity %.

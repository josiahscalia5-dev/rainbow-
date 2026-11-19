# Screen 06 — round 11 (account 11, lead controlled test)

Branch `claude/rainbow-s06-match-c11` (from `-c9` tip `efaf78b7`). Approved picture (authority):
`references/06_crest_the_rinse_arch.png`. Rules: `docs/briefs/2026-11-18-r11/USER_ORDER_R11_STRICT.md`.
Kept set (unchanged): `match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1`.
BEFORE = that set, 12 audit shots `qa/match/06/r11/BEFORE/` (`tools/lead_r6/motion_audit.mjs`).

## Diagnosis (measured)
* `docs/briefs/2026-11-18-r9/BLUEPRINT_06.md`: from forward 6 u on, the painted composition (off-centre tunnel mouth upper
  right, inner ring centres drifting down-right toward the glow, purple drum wall upper left, crest S-loop) is replaced by a
  CENTRED BULLSEYE of 15+ packed rings over a straight ribbon river.
* Depth Anything 3 (`docs/briefs/2026-11-18-r11/DA3_TEST.md`) on the approved picture: the far tunnel end is at (689, 648),
  i.e. the painted glow (700, 690), about 10x deeper than the water under Benny.
* `tools/match06/r11_mouth_probe.mjs`: at the approved camera the game river crests 8 u ahead (s 206.9), passes the painted
  glow pixel only 23–25 u away (s 217–219) and then turns right out of the frame — the course turns, the `m06tun` cylinder
  stays straight along the vanishing-point ray. While swimming, the camera (`m06cam`) looks along the turning river into a
  straight tube → bullseye.
* `&m06dbg=1` at the approved view: the river floor proxy carries the painted deep mouth pixels; the existing floor masks
  already swap them for the painted-water tile once the camera moves, so that is NOT the moving-view defect.

## Test 1 — `&m06bend=1` (A: the tube bends with the river's right turn after the crest top) — NOT AN IMPROVEMENT (not kept)
* Code (switch-guarded, default + kept set unchanged): `src/world/match06.ts` — axis straight to the crest top, then yawed
  about world Y by the river's own heading change (box-smoothed ±4 u), frame rotated with it (no twist); rings perpendicular
  to the bent axis, bulb angle per vertex (`uBendAng`).
* By eye vs the approved picture: the overall arrangement IS closer — the bullseye is gone, the tunnel sweeps off to the right
  and the purple drum wall shows on the left at f10, f20, t33, t66 and hard steering. BUT it adds wrong geometry: a flat,
  creased purple slab with a hard edge on the left, rings seen edge-on as thin hoops standing in the middle of the tunnel, a
  kaleidoscope pattern at the far end. Under the strict rule (no wrong geometry, no seams) → not kept.
* Frames: BEFORE `qa/match/06/r11/BEFORE/`, NEW `qa/match/06/r11/NEW_m06bend/` (same 12 names).
* Approved view: identical by eye (the audit tool's animated water/bubbles differ per run; deterministic proof pending).

## Test 2 — `&m06bend=1&m06bendk=0.5&m06bendw=14` (half the river's turn, smoothed ±14 u) — rendering

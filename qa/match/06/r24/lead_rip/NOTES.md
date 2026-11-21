# Screen 06 — the "raised blue cone" under Benny at the opening (lead, round 24) — IN PROGRESS, nothing kept

User (~10:10, verbatim): "at the opening, the new ripple effect looks like a raised blue cone underneath Benny. My approved picture
shows a shallow ripple immediately around his contact with the water. Please make that opening effect sit naturally on the water
surface and blend into his wake. Preserve the successful surrounding work."

All shots: real game, deterministic (fixed steps, water clock pinned `AUDIT_PIN=1000`), 3 / 7 / 12 % into Screen 06
(`o1_003`, `o2_007`, `o3_012`), base query = s06 r23 best (`QUERY_RIP.txt`). Rendered from `/home/user/wt/s06` (RIP, NORIP, V1, V2)
and the lead worktree `/home/user/wt/lead06` (= s06 code + the lead test below) with `render.sh` / `render_lead06.sh`.

## Findings
1. **The cone is NOT made by the ripple effect.** With `m06rip=0` (`NORIP/`) the cone is there; with the default camera
   (`m06view=0`, `NOVIEW/`) too. V1 / V2 (shorter / weaker ripple) barely change it.
2. Plate-weight debug (`&m06wdbg=1`, lead QA switch; red = the user's projected painting, blue = the river's own water material):
   the cone is **exactly the blue hole where the painted Benny was cut out of the projected painting** (`WDBG0/o1_003.png`). The
   hole is filled with the river's own material (brighter cyan, long straight streaks) and has a hard Benny-shaped edge, so from
   the moving camera it reads as a bright cone rising to Benny. At its bottom sits the painting's lacy ripple ring, still pinned to
   the checkpoint (Benny has swum on), which completes the cone look; the carried ripple decal adds a second ring halfway up.

## Test `&m06ripz=1` (needs `m06rip=1`; lead worktree only) — partial
The painted ripple zone round the approved Benny (same extent as the decal: ±1.45 u, 2.4 u behind, 1.3 u ahead) hands over to the
river's own water exactly as the carried decal fades in. Result (`RIPZ/`): the left-behind lacy ring at the bottom is gone (o1 6.4 %
of the frame changed, o2 1.7 %, o3 0 %), but the hard-edged hole (the cone body) remains → NOT enough.

## Next
Blend the hole into the surrounding painted water: a wider, soft-edged hand-over zone that covers the whole hole (ahead of the
approved Benny too), or match the fill's colour / streaks to the surrounding painted water; keep only the shallow rings travelling
with Benny at his contact. Start view must stay 0 px; then clip + gameplay.

# Screen 04 — brief for the next specialist slot (round 12, written by the account-12 lead ~13:05 UTC)

Start from `claude/rainbow-s04-match-c12` (newest tip). Rules: `docs/briefs/2026-11-18-r8/COMMON_RULES.md`,
`docs/briefs/2026-11-18-r10/RULES_R10.md`, `docs/briefs/2026-11-18-r11/USER_ORDER_R11_STRICT.md`. Log `qa/match/04/r12/PROGRESS.md`.
Authority: `references/04_through_the_five_arrows.png`. The user's PROVISIONAL views V04-1 / V04-2
(`qa/review_c10/2026-11-18/04_proposed_views/`) are by-eye DESIGN REFERENCES for the unseen interior only (round-10 finding:
the faithful continuation is a converging gold-ring tunnel with the swirling water filling its floor) — never projected as
images (`&m04mv=1` = NOT AN IMPROVEMENT, this round), never pasted over the screen.

## What the lead established (do not repeat)
* Approved start view (a00) is already close; the look collapses from forward 3 u on: narrow straight channel walled by tall
  white cotton-ball foam rows (`m04foam`), plain orange rings, no painted water formation, no five arrows.
* Round-10 test C (`K&m04foam3=1&m04arr5=1&m04a5n0=2&m04a5n1=3.5&m04a5w=1.6&m04ry=2.2`, frames `qa/match/04/r10/testC/`,
  fresh A/B `qa/match/04/r12/ab1/C/`) is the best starting point: tall foam walls gone, water climbs the tunnel sides (closer).
  Remaining: (1) the five glowing chevrons are invisible while swimming; (2) a hard straight top edge where the water sides meet
  the wall (f20); (3) no low fluffy foam clusters along the banks; (4) rings duller / more orange than the painted glossy gold.
* WHY the arrows vanish (A/B `qa/match/04/r12/ab1/C` vs `C2` = thicker bars `m04a5t=2.6&m04a5p=4.4`: no visible difference):
  in the painting the river lane RISES toward the tunnel's far glow, so the chevrons stack up the middle of the frame and read
  large; in the game the swim camera is low over almost level water, the river is squeezed into a thin band near the horizon
  and flat chevrons foreshorten to slivers, and Benny's body covers the lane right ahead. Making the bars thicker does not help.
  This is a class-A difference (water surface shape / level inside the tunnel relative to the eye), not a texture problem.
  Options to evaluate BY EYE (one honest try each): the river surface inside the tunnel rising/curving like the painted lane
  (a deeper, fuller channel whose centre climbs toward the far glow) so the chevrons face the camera more; arrows world-anchored
  on that surface. Do NOT change the swim camera without the user's OK (user: no camera redesign); do not move coins.
* Order: (1) water channel shape + arrows (biggest), (2) top edge of the water sides, (3) low foam clusters (soft irregular
  clouds hugging the banks, as painted / in V04-1), (4) glossy yellow-gold rings (V04-1 ring colours via the existing uRingTile path).
* Fast A/B tool: `tools/match04/ab04.mjs <outDir> '<shots JSON>' label='<query>' ...` (same shot positions / stepping as the
  lead's motion audit; several variants in one browser session).

## Update ~13:15 UTC (after the user's 2026-11-18 order "fix Screen 04 properly")
Read `qa/match/04/r12/PROGRESS.md` first. Settled, do NOT repeat: the multi-view projection (`m04mv`, corrected `m04mv2`) and the
unrolled view tile (`vtile04.py`) are STOPPED — the two AI views disagree with each other and are 1.7×-Benny-scale repaints, so
they ghost between views / leave 69 % holes. Use them only as BY-EYE targets. Measured fact to use: the painted waterline on the
gold wall is ≈ 2 u above Benny's water (`waterline04.json`) → river sides `m04ry≈2.2`. Exact-position A/B renders:
`EXACT=1 node tools/match04/ab04.mjs …` (shots may use "sX" = absolute course position); exact per-pixel attribution of any frame:
`tools/match04/diag04.mjs`. Build order: (1) water channel at the measured height + low foam clusters (no foam-ball walls), fix the
straight top edge of the water sides; (2) the five glowing chevrons readable from the swim camera (real geometry on the lane — the
camera itself is NOT changed without the user's OK); (3) glossy yellow-gold ring material; (4) bubbles. Benny untouched.

# Screen 07 · DIVE THE WASHER TUBE — status (round 4, 2026-11-17 ~20:30 UTC)

Branch `claude/rainbow-s07-match-c4`, **started from `72fb6129`** (= `claude/rainbow-s07-match-c3` head, line A; the
autosave `0a46dd70` on top held only backup files). Nothing is approved until the user says so.

## MILESTONE 1 — done (rounds 2/3)
`?match07=1`: whole frame 6.7 → 80.1 %, scenery 6.0 → 95.5 % within 20 levels, 07→08 drop intact, 8/8, 91 / 2,240.

## MILESTONE 2 — done (round 4), moving-view fixes, all URL switches on top of `match07=1`
Kept set (all visibly closer while moving, still view unchanged):
**`?match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1`**

| switch | what it fixes while Benny swims / steers | verdict |
|---|---|---|
| `m07fill` | near water at 3 u: the mirrored "diamond" (provisional fill under the painted Benny) → the river tile, feathered edge (round 4) so no hard-edged patch | KEPT |
| `m07gold` | the five paddles upper-left: solid, rounded, polished gold blocks; seen from beside/below while passing they are pure gold instead of a flat picture of the wall smeared over them (round 4) | KEPT |
| `m07wall` (new) | the doubled orange band upper-left at 10–20 u: the wall tile carried one painted paddle that repeated in every ring bay deep in the tube → tile without it | KEPT |
| `m07river` (new) | steering right: big orange/yellow smear on the near water → the river tile without its slice of painted gold ring (pink bank instead) | KEPT |
| `m07coins` (new) | the far coins: two big trail coins piled on the painted far coins → two small coins continuing the painted line (position + painted size only) | KEPT |
| `m07ang` | meant to remove the doubled layer by view direction; no visible change at 3 u or 20 u (the doubling came from the wall tile, fixed by `m07wall`) | NOT kept |

Numbers, still approved view (`m2r4/metrics_k5.json`, M1 → M2): whole 80.06 → 80.06 %, scenery 95.54 → 95.55 %,
river/coins band 90.35 → 90.40 %, upper tube 99.96 → 99.97 %, lower water 95.64 → 95.63 %, Benny 16.6 → 16.4 % (game model).

Pictures (separate, full size): `m2r4/pictures/1_APPROVED_07.png`, `2_BEFORE_M1_07.png`, `3_NEW_M2_07.png`.
Moving NEW: `m2r4/motion_k5/` (forward 0/3/6/10/20 u, steering left/right, before the drop, drop start, drop +4 u, drop
middle); moving BEFORE (M1): `m1/motion/`; intermediate (without `m07river`): `m2r4/motion_k4/`.

Proofs (round 4): default 06/07/08, `?match08=1` 08 and `?match07=1` 07 = start commit pixel-for-pixel outside the
title banner rows 33–204 (the banner differs between any two captures) — `m2r4/proofs_0px_r4.json`. Protected 05
BEFORE (`?ringa=26&nearfloor05=0`): current = start commit (0 px outside the banner; two current captures 0 px), but
BOTH differ from `qa/pilot05/wave9/baseline/05.png` by 32,280 px (max 72 levels) outside the banner in this container —
pre-existing, not from this work (round 3 measured 0). Gameplay 8/8 default, `match07=1` and the kept set; 91 coins,
1,330 → 2,240 in all three (`m2r4/gameplay_*.json`); 07→08 drop 61.4 / 61.1 / 61.1 u. Continuity all joins gap 0,
drop 61.19 u (`m2r4/continuity_default.json`; `course.ts` untouched this round). `tsc` clean.

APK: `builds/rainbow-debug-07-2026-11-17-r4.apk` (debug, `VITE_RAINBOW_Q05` = the kept set, sha256 5a918a8c45f0d634…)
— NOT phone-tested. fal clean plate: PREPARED, NOT run (`FAL_PLATE_REQUEST.md`). No paid jobs.

## Open (honest)
* Benny is the game's model (not this workstream). The far coins now run in a tidy row but flatter than the painted
  line, which climbs a little toward the light.
* While steering hard, the near water is the repeating river tile (pink/blue streaks, no smears) — less detail than the
  painting; the far end still has a few purple perforated patches from the tile.
* At 10 u thin slivers of the side faces of the far paddles carry picture pixels; at 20 u the passing paddle's lower
  face still shows some purple.
* The gold rings deep in the tube come from the ring-bay tile (rings stay rings, not bands); round 4 did not change ring
  geometry. The bands across the upper screen at 14–45 u are these rings passing overhead (camera specialist's r4 note).

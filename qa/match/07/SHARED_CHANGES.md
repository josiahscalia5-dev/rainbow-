# Screen 07 — edits in SHARED files (all run ONLY under `?match07=1` / `?matchall=1`)

Base for the diff: line A `752d6d8` (`git diff 752d6d8..HEAD -- src`). Without the switch every line below is inert:
default captures of 06 / 07 / 08 are 0 px different from the pre-change commit `3c7fca9` (`qa/match/07/m1/proofs_0px.json`,
re-verified in round 3: `qa/match/07/m3/proofs_0px_r3.json`). The lead integrates only after a conflict check and the
user's approval.

| File | What | Guard |
|---|---|---|
| `src/game/match.ts` | the ONE `MATCH_CAM['07']` line: `{ fov: 62, roll: 0, off07, dir07 }` (camera solved offline, `tools/match07/solve_cam07.py`). Replaces the earlier 07 line `{ back: 9, up: 5.4, ahead: 22, lookUp: -1.8, fov: 62 }` | `MATCH_CAM` is read only when `MATCH['07']` is on |
| `src/game/cameraRig.ts` | two optional fields `off07` / `dir07` in `CamParams` + one block: camera = Benny's water point + `off07`, looking along `dir07`, blended in over 07 start +2..+12 u and out 14..3 u before the plunge top (the 07→08 drop keeps its own camera) | runs only when `off07`/`dir07` exist (only in `MATCH_CAM['07']`) |
| `src/game/Game.ts` | import + build `buildMatch07()`; on the visible 07 stretch (07 start +14 u … plunge top −8 u) show the projected scenery, hide the game's 07 river ribbon / foam / bubbles and the `tubes` zone, bloom 0 there; restored outside | `MATCH['07'] ? … : null` — nothing is built without the switch |
| `src/world/course.ts` | `x07()`: the visible 07 stream follows the painted S-river (`assets/textures/match07/river07.json`), eased in/out so the 06 join, the plunge and 08 keep their shape; `bank: 0` on 07 (level painted river) | `flag05('match07') \|\| flag05('matchall')` |
| `src/gameplay/coins.ts` (round 4, M2) | `?m07coins=1` (only together with `match07`): the two trail coins right behind the painted far coins get lateral 0.42 / 1.82 and the painted coins' size for that distance (0.45) so they continue the painted coin line instead of piling up as two big coins on it — position/size only, same s, total unchanged 91 / 2,240 (`qa/match/07/m2r4/gameplay_k5.json`) | `m07 && flag05('m07coins')` |
| `src/gameplay/coins.ts` | the picture's 8 coins at the painted spots (`assets/textures/match07/coins07.json`) replace the first 8 trail coins from 07 start +14 u (run total unchanged: 91 coins / 2,240); coins re-sorted in river order | same flag |

Round 4: `src/world/match07.ts` (own file) gained the switches `m07wall`, `m07river`, the feathered `m07fill` mask and solid gold paddles off the approved direction under `m07gold`. Round-4 proofs vs the start commit `72fb6129`: `qa/match/07/m2r4/proofs_0px_r4.json` (0 px outside the title banner).

New files (Screen 07 only): `src/world/match07.ts`, `assets/textures/match07/*`, `tools/match07/*`, `qa/match/07/*`.
Not touched: Benny (`src/characters/benny/*`), HUD (`src/ui/*`), gameplay rules, Screen 05 / 08 files, references.
Overlap to check at integration: `Game.ts` / `cameraRig.ts` / `coins.ts` / `course.ts` are also edited by the Screen 08
work (`match08`) and the Screen 08 camera specialist (`?camclear=1`, owns the 07 view obstructions + 07→08 transition view).

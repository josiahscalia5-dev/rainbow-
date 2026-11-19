# Screen 06 — edits in SHARED files (all run ONLY under `?match06=1` / `matchall`; off = no change)

Diff: `git diff 752d6d8..HEAD -- src/game src/world/course.ts src/gameplay` (line A base `752d6d8`). Round 3 changed no
shared file (only `src/world/match06.ts` + `assets/textures/match06/`, `tools/match06/`, `qa/match/06/`).

| file | what | guard |
|---|---|---|
| `src/game/match.ts` | ONE `MATCH_CAM['06']` line: `fov 62, roll 0, off06, dir06` (locked approved camera) | only read when `MATCH['06']` |
| `src/game/cameraRig.ts` | optional `off06` / `dir06` fields + a block that, over the 06 stage, puts the camera at Benny + off06 in the river's level frame looking along dir06 (blended in round the 06 start, out before 07) | `STAGE_CAM['06'].off06` exists only under the switch |
| `src/world/course.ts` | 06 river correction `d06(path06.dx/dy, t)` added to the 06 segment (value + slope 0 at both ends) | `m06 ? … : 0` |
| `src/game/Game.ts` | build `match06` scenery; show it on 06 and hide the default 06 tube zone there; hide the default water parts on 06 (same list as match08); bloom 0 on 06 + `m06.sync` | `m06` is `null` without the switch |
| `src/gameplay/coins.ts` | 06 row replaced by the picture's 15 coins (`coins06.json`) + 3 of the row on the 06 entry; river-order sort; picture coins face the approved camera | `m06` flag |

Not touched: Benny (`src/characters/benny/*`), HUD (`src/ui/*`), gameplay rules, Screen 05 / 08 files, references,
protected branches. Possible conflict to check at integration: the Screen 08 camera specialist's `?camclear=1` 06 fix
(`claude/rainbow-s08-camclear-c3`) also touches the 06 camera in `cameraRig.ts`; both switches together are untested.

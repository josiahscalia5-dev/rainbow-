# Screen 07 (`?match07=1`) — edits to shared files

Every edit is additive and only takes effect when `match07` (or `matchall`) is on. Without the switch the game is
byte-for-byte unchanged: 0 differing pixels on default 06 / 07 / 08, on `?match08=1` 08, and on
`?ringa=26&nearfloor05=0` 05 vs `qa/pilot05/wave9/baseline/05.png` (`qa/match/07/m1/proofs_0px.json`); default gameplay
output byte-identical to `qa/gameplay_test.json`.

| File | Change |
|---|---|
| `src/game/match.ts` | ONE line: `MATCH_CAM['07']` replaced (old `back/up/ahead/lookUp` framing from the audit) by the solved camera `{ fov 62, roll 0, off07, dir07 }` + a 2-line comment. |
| `src/game/cameraRig.ts` | `CamParams.off07?` / `dir07?` (optional fields) + one block in `desired()`: when `off07`/`dir07` exist, camera = Benny's water point + off07 looking along dir07, level; blended in over 07 start +2…+12 u, out over plunge top −14…−3 u (the drop keeps the game camera). The pre-existing `yaw07/side07` block is untouched. |
| `src/world/course.ts` | import `river07.json`; 07 winding segment: `x07(z, xDefault)` bends the path toward the painted river centre, eased in 12…2 u before the checkpoint and out over 4 u ending ~0 u before the plunge top (returns `xDefault` without the switch); `bank: 0` for stage 07 under the switch (the painted river is level; frames only, no gameplay use). |
| `src/gameplay/coins.ts` | import `coins07.json`; under the switch the first 8 trail coins of 07 from 07 start +14 u are replaced by the picture's 8 coins (still 24 on 07; run total 91 / 2,240); coins sorted in river order when 07 or 08 switch is on. |
| `src/game/Game.ts` | import `buildMatch07`; build + depth bake only under the switch; per sim step: projection group visible on 07 from start +14 u to plunge top −8 u, there the game's tube zone and the river ribbon / foam / bubbles are hidden (restored outside); bloom 0 while it is shown; `sync` of post values. Benny, HUD, splash untouched. |

Own files: `src/world/match07.ts`, `assets/textures/match07/*`, `tools/match07/*`, `qa/match/07/*`.

Known interactions: `?matchall=1` also turns 07 on. The 08 camera specialist's `?camclear=1` was not touched; the
fitted 07 geometry never stands between the camera and Benny in the tested frames (checkpoint, +3/6/10/20 u, steering ±).

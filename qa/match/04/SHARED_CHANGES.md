# Screen 04 (`?match04=1`) — edits to SHARED files, for the lead's approval

Every edit is additive and runs ONLY when `match04` (or `matchall`) is on. Without the switch: default 04 and 05
captures 0 px different, `?match08=1` 08 capture 0 px different, default gameplay-test output byte-identical
(verified 2026-11-17, see NOTES.md).

| File | Edit | Runs when |
|---|---|---|
| `src/game/match.ts` | `MATCH_CAM['04'] = { fov: 62, roll: 0, off04, dir04 }` (one line + comment) | `MATCH['04']` (applyMatchCam merges only when the switch is on) |
| `src/game/cameraRig.ts` | `CamParams.off04?` / `dir04?` (optional fields); one block in `desired()` after the 03 block: camera = Benny's water point + `off04`, looking along `dir04`, level; blended in over s0−3…s0+1.5 of 04, out over s1−10…s1−1 | only if `STAGE_CAM['04'].off04` exists = switch on |
| `src/game/Game.ts` | import `buildMatch04`; build + depth bake when `MATCH['04']`; `updateZones`: on stage 04 show the projection group, hide `basin` + `tubes` zones; on 04 hide the water parts `ribbon, foam, bubbles, splashCrown, spray` (restored when leaving 04; skipped while 08's own switch is active); bloom 0 on 04 + `m04.sync(renderer, w, h, camera)` in `render()` (milestone 2 added the `camera` argument) | all inside `if (m04)`, `m04 = null` without the switch |
| `src/game/Game.ts` (milestone 3) | `scene.add(m04.splash)` after the 04 depth bake; per frame, if `m04?.splash`: visible on 04, placed at Benny's root + `splashOffset`, facing the camera (same as the 08 splash) | `m04` non-null (switch on) and `&splash04` not `0` |
| `src/gameplay/coins.ts` | import `coins04.json`; with the switch the 04 row of 8 coins is replaced by the picture's 5 coins (world positions → course s / lateral / height) + 3 coins on the slide entry before the 04 view (total unchanged: 91 coins / 2,240); picture coins face the approved camera (`faceTo`, same code path as 08) | `flag05('match04') \|\| flag05('matchall')` |

Not touched: Benny (`src/characters/benny/*`, `assets/textures/benny0*`), HUD (`src/ui/*`), gameplay rules, match08 files,
references, protected branches.

Interaction note for integration: under `?matchall=1` both 04 and 08 hooks are active; they act on different stages
(04 vs 08) and the water-part hide logic of 04 yields to 08 while 08 is on.

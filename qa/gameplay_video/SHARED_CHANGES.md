# Shared-code changes of the camera specialist (`?camclear=1`) — for the lead's integration check

Base before camclear: commit `5965a01`. Everything below runs ONLY when `camclear=1` (or `matchall=1`) is in the URL /
`VITE_RAINBOW_Q05`; without it nothing is created or changed (default build 0 px, `match08=1` 0 px).

| File | Change | Guard |
|---|---|---|
| `src/game/camClear.ts` (new, owned) | see-through dither for rings / lids / gold lips / 03 funnel / foam banks only between the view and Benny or right at the lens | `CAMCLEAR` |
| `src/game/Game.ts` | import; `createCamClear(...)` when on; `camClear?.update(...)` per frame; `camSnap = true` on respawn when on; QA hook `camClear()` | `CAMCLEAR` / `camClear` null |
| `src/game/cameraRig.ts` `desired()` | 08: the view holds at the approved 08 spot while Benny rides into the picture, leaves only in the last 3 u | `if (CAMCLEAR)` |
| `src/game/cameraRig.ts` `clear06()` | 06: view kept inside the tube, turned toward the tunnel's far end while Benny stays in frame | `if (CAMCLEAR && this.axis)` |
| `src/game/cameraRig.ts` `clear0304()` (**round 3, new**) | 03→04 drain drop: over ~18 u of ride the view rides on the stream 3 u behind Benny, 1.6 u above, aimed at him | `if (CAMCLEAR)` in `update()` |

No change to Benny files, HUD, coins, course, gameplay rules, or any match04–08 scenery/texture file.


## Round 4
* `src/game/cameraRig.ts`: camclear-guarded `clear0304` tuning + `steadyUp0304` (03→04 lip only; off = unchanged, 0 px).
* `src/game/camClear.ts` + `Game.ts` (createCamClear gets `coins`): camclear-only coin fade between lens and Benny. Coin pickup logic untouched.

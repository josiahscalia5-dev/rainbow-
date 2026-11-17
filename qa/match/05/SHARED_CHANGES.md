# Screen 05 agent — edits outside my own folders (for the lead)

| file | change | guard | default build |
|---|---|---|---|
| `src/vfx/waterRibbon.ts` | new `export const TGTVIS05 = PROJGAP05 && q05('tgtvis05')` + its doc comment; in `attachProj05` the E texture url picks `assets/textures/match05/tgtvis05/proj05_E.png` when TGTVIS05 | explicit `?tgtvis05=1` (needs proj05 + projfar05 + projgap05, e.g. `?match05=1`) | 0 px (verified) |

| `src/gameplay/coins.ts` | `coins05tot` (milestone 2): constants `C05TOT_*`; optional `CoinDef.pickLat`; in `coinLayout` (after the existing coins05 block) pickLat for C05M rows 17+18 and 11 hidden coins removed; pickup test uses `d.pickLat ?? d.lat` | only under `?coins05=1` / `?match05=1` (explicit `coins05tot=0` = off); `pickLat` is never set otherwise | 0 px, gameplay 91 / 2,240 (verified) |

None of `match.ts`, `cameraRig.ts`, `course.ts`, `Game.ts` touched. No Benny / HUD / references touched.

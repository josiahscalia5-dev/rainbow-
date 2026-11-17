# Screen 05 agent — edits outside my own folders (for the lead)

| file | change | guard | default build |
|---|---|---|---|
| `src/vfx/waterRibbon.ts` | new `export const TGTVIS05 = PROJGAP05 && q05('tgtvis05')` + its doc comment; in `attachProj05` the E texture url picks `assets/textures/match05/tgtvis05/proj05_E.png` when TGTVIS05 | explicit `?tgtvis05=1` (needs proj05 + projfar05 + projgap05, e.g. `?match05=1`) | 0 px (verified) |

| `src/gameplay/coins.ts` | `coins05tot` (milestone 2): constants `C05TOT_*`; optional `CoinDef.pickLat`; in `coinLayout` (after the existing coins05 block) pickLat for C05M rows 17+18 and 11 hidden coins removed; pickup test uses `d.pickLat ?? d.lat` | only under `?coins05=1` / `?match05=1` (explicit `coins05tot=0` = off); `pickLat` is never set otherwise | 0 px, gameplay 91 / 2,240 (verified) |

None of `match.ts`, `cameraRig.ts`, `course.ts`, `Game.ts` touched. No Benny / HUD / references touched.

## Round 3 (branch `claude/rainbow-s05-match-c3`)
| file | change | guard | default build |
|---|---|---|---|
| `src/vfx/waterRibbon.ts` | `qv05` value reader; `TGTFILL05 = TGTVIS05 && tgtfill05=3`; `TGTWALL05 = TGTFILL05 && tgtwall05=1`; E / F / LUT urls pick `assets/textures/match05/tgtfill05_3/` and `…/tgtwall05/` | explicit `?tgtfill05=3` / `?tgtwall05=1` (need match05 + tgtvis05) | 0 px (verified) |
| `tools/proj05/bake.py` | opt-in env `BAKE05_EXTRA_REGIONS` (E also bakes approved pixels where the near ribbon covers the named regions) | env unset = byte-identical output (verified) | — |

### Proposal for the lead: coin look on Screen 05 (`src/gameplay/coins.ts`, NOT changed)
Measured on the locked view (pixels gold in both pictures, 14,524 px): face colour approved RGB 240 / 194 / 52 vs game
241 / 191 / 48, luma median 161 vs 159 → **the face colour needs no change.** The coin-region gap (≤20: 48.5 %) comes from
(a) the target's hole-fill ring around each coin (my side: `make_target_vis.py`, coin hole dilation 10 px) and (b) the
coin EDGE: the approved side band is lighter cream-gold with fine ridges and a soft white glow; the game's side material
(`color '#6a4a00'`, edge texture) renders darker orange. If the lead wants it: a `?coins05=1`-only side material
(lighter edge colour, e.g. base ≈ `#8a6a20`, + a faint additive glow sprite), never in the default game or other screens;
I would measure it against the approved coins first, one factor at a time.

# Shared-code changes by the Screen 08 Benny specialist (all switch-guarded; default build 0 px)

| File | Change | Runs only under | Off switch |
|---|---|---|---|
| `src/characters/benny/benny05.ts` (owned) | `bake08`: 08 maps from `assets/textures/benny08/` | benny05 look on (`match08`/`matchall`/`benny08`, or `benny05=1&bake08=1`) | `bake08=0` |
| `src/characters/benny/benny05.ts` (owned) | round 3: `B08R3` → `body_r3.png`; fur uniforms on `mesh.userData.furU` (no render effect) | same | `b08r3=0` |
| `src/characters/benny/fur.ts` (owned) | uniforms `uSoft`, `uSoftEdge` (GLSL only inside `#ifdef BENNY05`; 0 = unchanged) | benny05 look on | `b08soft=0` |
| `src/characters/benny/benny05.ts` (owned) | round 3b: soft fur 0.6 / edge 1.0, `brim_r3.png` | 08 maps on | `b08soft=0`, `b08crisp=0`, `b08r3=0` |
| `src/characters/benny/fur.ts` (owned) | round 4 uniforms `uClumpScale` (0.2 = unchanged), `uClumpVar`, `uHi` (BENNY05 GLSL only) | benny05 look on | — |
| `src/characters/benny/benny05.ts` (owned) | round 4: body `uHi` 0.7, pom colour 1.12/1.0/1.06 | 08 maps on | `b08hi=0`, `b08pom=0` |
| `src/game/Game.ts` | round 3b: splash card alpha^0.2×2.5 | `match08=1` | `b08r3=0` |
| `src/game/Game.ts` | `M08_BENNY` round-2 tweaks: beanie 0.95× + offset + roll −0.08, pom offset, star 1.2× + offset, splash card alpha^0.3×2 | `match08=1` on Screen 08 (restored when leaving 08) | `b08r2=0` |
| `src/game/Game.ts` | round 5 (d) body shape: second position buffer on the `fur_body` geometry (tapered: ×1.12 at the top under the brim → ×0.92 at the bottom), swapped in only while Screen 08 is shown; arm joints +0.04 up, ×1.1 (QA tuning params `b08tt/tb/bw/bh/ly/ay/ax/ak`) | `match08=1` on Screen 08 (restored when leaving 08; 04–07 0 px vs round 4) | `b08shape=0` (also off with `b08r3=0`) |
| `assets/textures/benny08/*` (owned) | baked maps + `body_r3.png` | as above | — |

Not touched: `src/world/match08.ts`, `assets/textures/match08/*`, `cameraRig.ts`, `match.ts`, `camClear.ts`, HUD, coins, course.

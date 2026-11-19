# Screen 05 pilot: specialist coordination (wave 2, account 3)

Started 2026-11-15 ~19:20 UTC on branch `ccr-8b6fc834-7kd55l` (from `f2a86ab`). The coordinator is the main Claude session.
Wave 1 (account 2, 18:36–18:58 UTC) was cut off by the usage limit. Its edits were saved by autosave and are **kept**:
the straight 05 tube axis, the wider stream, the new rider splash, the foam berm and Benny's proportions/lift.

## Evidence
* `05_before_81e639e.png`: live game before any specialist work (original account)
* `05_partial_f2a86ab.png`: live game with wave-1 partial work (this wave's starting point)
* `05_ref_before_partial.png`: reference | before | partial side by side
* Targets with pixel measurements: `qa/scene_comparisons.md` §05 (5.1–5.11) and `docs/reference_inventory.md`

## File ownership (strict: edit ONLY your own files; read anything)
| Specialist | Owns |
|---|---|
| washer-environment-modeler (also lighting/shader for the tube) | `src/world/materials.ts`, `src/world/tube.ts`, `src/world/environment.ts`, `src/render/env.ts`, `src/render/grade.ts` |
| water-fx-specialist | `src/vfx/waterRibbon.ts`, `src/vfx/glsl.ts` |
| foam-bubbles-particles | `src/vfx/foam.ts`, `src/vfx/bubbles.ts`, `src/vfx/riderSplash.ts`, `src/vfx/spray.ts`, `src/vfx/index.ts`, and ONLY the VFX-feeding lines (wake/splash/foam anchors) in `src/game/Game.ts` |
| path-camera-transition-engineer | `src/world/course.ts`, `src/game/cameraRig.ts`, `src/gameplay/coins.ts`, and ONLY the `STAGE_CAM` / checkpoint table lines in `src/game/Game.ts` |
| benny-character-artist | `src/characters/benny/*`, `assets/models/benny.glb`, `docs/characters/benny*` |

Need a change in someone else's file? Append a line to `qa/pilot05/REQUESTS.md` (`from → to: request`). The coordinator applies it.

## Rules
* Other screens (01–04, 06–11) must not regress. Re-capture any screen your change can affect.
* `npm run typecheck` must pass before you finish. `npm run test:continuity` must stay `ok` with verticalDrop ≈ 61.2 and gaps ≈ 0.
* Capture: `node scripts/capture.mjs 05 --out=qa/pilot05/<you>`. Vite picks a free port, so parallel captures are safe.
  If a capture fails because another specialist's file is mid-edit, wait ~30 s and retry. Do NOT touch their file.
* Do not commit or push. The 5-minute autosave does that. Never touch `references/` or `character_references/`.
* Finish with `qa/pilot05/<you>/NOTES.md`: what changed (file:function), the before/after numbers you measured, and what is left.

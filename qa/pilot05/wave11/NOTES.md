# Screen 05 — wave 11 (W11): narrow far-river channel + flow-map water (session `915f17cf`, 2026-11-16 12:47–13:32 UTC)

Branch `claude/rainbow-3d-account-recovery-hfb8p0` (last save `088dd3f`, 13:37 UTC). The previous account ran out of
credits at 13:32 before writing this file; it was written by the next session (`ccr-451ea8c7-3nqlis`, 2026-11-16 ~14:30
UTC) from the code, the saved evidence in this folder and the backed-up transcript
(`backups/claude-sessions/915f17cf-eec0-5ae4-8e79-48acc1826719/transcript.md`). Every number below is from those files.

## The three switches (default build = T2, unchanged)
| switch | factor | code |
|---|---|---|
| `?farw05=1` | GEOMETRY: the distant river is a narrower channel winding in S-curves between puffy foam shelves (point bars on the inside of each bend) into the golden light. Visual only: `course.ts`, `widthAt()`, steering, coins and collisions untouched | `channel05()` in `src/vfx/waterRibbon.ts` (last stretch of the real ribbon before the seam), far block `src/world/far05.ts` + `farRiverMaterial()` in `src/world/materials.ts` |
| `?flow05=1` | MATERIAL: a flow map generated from the river's own curves drives two-phase advection of a tileable ripple normal / height map (three.js Water2 technique, without its render passes); the Marble full-world panorama is used as the reflection source | `src/vfx/flow05.ts` (`flowField05`, `rippleData05`, `FLOW05_GLSL`), `#ifdef FLOWMAP05` blocks in `waterRibbon.ts` / `materials.ts`; QA dump `scripts/flow05-dump.ts` → `flowmap/` |
| `?river05=1` | both of the above (each on top of the W10 palette `?water05=1`) | `RIVER05` in `waterRibbon.ts` |

Flow map (32 × 256 RGBA8 over the river's (u, s) domain): R = lateral flow per unit downstream (streamlines keep their
fraction between core line and bank, so the flow bends with every S-curve), G = speed (fast core, slow banks, faster
outside of a bend, almost still on a foam shelf), B = turbulence (bank shear + bends), A = phase noise (no visible pulse).
Pictures: `flowmap/flowmap05.png`, `flowmap05_view.png`, `ripple05.png`, `ripple05_height.png`.

## Evidence (this folder)
* `compare/1_APPROVED_05.png`, `2_CURRENT_T2_05.png`, `3_NEW_river05_05.png` — full-size portrait, 864 × 1536;
  `far_river_zoom_APPROVED_CURRENT_NEW.png`.
* `factors/0_baseline_water05_it04.png` (W10), `1_geometry_only_farw05.png`, `2_flowmap_only_flow05.png`,
  `3_river05_low_quality.png`, `4_river05_0.6s_later.png` (animation proof).
* `tests/pixel_checks.json`: default == `qa/pilot05/current_default_05.png` (max diff 0); BEFORE
  (`?ringa=26&nearfloor05=0`) == `qa/pilot05/wave9/baseline/05.png` (max diff 0); `?water05=1` == W10 picture (0);
  with `?river05=1` screens 06 and 07 pixel-identical, 04 changes 70,552 px (the 05 river seen through the 04 exit).
* `tests/gameplay_river05.json`: pass 8 / 8 (pause, continuous travel, no camera cut, no teleport, plunge 61.41,
  real coin pickups, victory, hearts lost on wall bump), errors []. `tests/continuity_stdout.txt`: all joins gap 0,
  07→08 drop 61.19.
* `tests/perf_high_864x1536.json`, `perf_low_864x1536.json`: headless SwiftShader (CPU) — RELATIVE cost only:
  river05 +7 % frame time high quality, +3.5 % low quality, same 86 draw calls and 567,415 / 425,525 triangles,
  +2 textures. Not device fps.

## The user's verdict (2026-11-16 13:32, in the emergency-backup message)
"The current flow-map test is being adjusted because its first result was too grainy." The user wants long, smooth,
flow-aligned ripples, rich cyan water, magenta ribbons and selective white highlights. → continued as wave 12
(`qa/pilot05/wave12/NOTES.md`, `?silk05=1` + `?puff05=1`).

## Not done in wave 11 (handed to wave 12)
Android APK for the experiment, device performance, this write-up, the three full-size pictures sent to the user.

# Screen 05: wave 6 (account 7, session branch `ccr-93add0fa-q17ey6`)

Started 2026-11-15 ~23:05 UTC. Branch `ccr-93add0fa-q17ey6` = `claude/rainbow-3d-account-transfer-syorak`
(`7ae64c3`, now PROTECTED) + autosaves. Every wave-5 edit is in the tree and is **kept**.
`COORDINATION_WAVE3/4/5.md` still hold the older targets and measured numbers; this file adds wave 6.

## The new method (user, 2026-11-15): whole-frame progress, not endless micro-tweaks
* The **camera stays LOCKED** (`STAGE_CAM['05']`, checkpoint `05_crest`, s 132.44). The coordinator
  formalises the lock in Blender 5.3 (`qa/pilot05/wave6/camera_lock/`): the game camera exported into the
  existing `screen05_layout.blend`, the reference as the camera background, a 50 % overlay render, and
  `landmarks.json` = reference landmarks (VP, ring tops, coins, pink-band centre lines, foam edges, Benny
  box) with their **back-projected world positions** on the river surface (s, lateral). Use it when it
  appears (≈30 min after the start); until then the numbers below are enough.
* Every iteration must make a **visible whole-frame difference** toward the reference. Judge it on the
  full side-by-side (`scripts/screen_report.py`), not only on your own metric. If an iteration does not
  look closer to the reference than the previous one, revert it and **change approach** (do not keep
  nudging the same constant).
* Do not regress other specialists' areas. Do not redesign: same tube, route, Benny, coins, HUD.

## Baseline (fresh capture of this tree, 22:59 UTC)
* Approved: `references/05_flow_into_the_current.png` (864×1536, immutable).
* Live: `qa/pilot05/wave6/current/05.png` — 86 steady draw calls, 633,521 tris (budget: ≤ 130 calls / 650k).
* Gameplay baseline must not regress: `qa/pilot05/wave5/baseline/gameplay_test.json` (pass, 91 coins,
  plunge 61.41, pause/resume, heart loss, victory 11). Continuity: drop ≈ 61.2, gaps ≈ 0.

## What differs most (coordinator, whole frame, ranked by area × visibility)
| # | Element | Live now | Reference | Owner |
|---|---|---|---|---|
| 1 | Gold rings (largest gold area) | flat matte ORANGE tori, no highlight, read as plastic hoops | polished YELLOW-gold bands with a bright white-yellow highlight line along each band, darker amber lip contours either side, copper only in deep shadow; bands sit flush with the wall | environment |
| 2 | Walls | busy "marbled/liquid" swirl reflections + pink-outlined slots | clean deep violet→magenta metal, regular rows of dark capsule slots, bright white-pink specular streaks running lengthwise toward the VP; darker purple shadows away from the streaks | environment |
| 3 | Far river (y ≈ 470–560) | straight candy-striped strip (reads as 06) | the cyan core with hot-pink bands keeps winding in S-bends right into the VP, coins on it; **no straight 06 stripes** | path-camera |
| 4 | Coins to the VP | 6 visible | ≈ 10 coins on the winding core, shrinking into the VP (nearest ≈ (473, 728) d≈95 → (440, 575) → (480, 610) … → ≈ (530, 505)) | path-camera (far proxies), coordinator (near) |
| 5 | Near field y 1000–1536 | two wide flat pink vertical sheets x 0–200 / 650–864 down to the frame bottom; blue ripple "∩" arcs like a pool | pink bands sweep diagonally out from Benny's sides toward the bottom corners (runs at y 1300 ≈ x 124–206 / 613–698), glossy thick cyan between with white speed streaks and 4-point star glints; the frame bottom is cyan + a gold ring arc | water |
| 6 | Lids | flat orange slabs | copper-gold half-domes/pucks seen at an angle, glossy highlight on top, one per bay each side | environment |
| 7 | Foam | big white heap right x 680–864 y 770–950; white spheres | low lavender/blue-shaded small-bubble rims hugging both river edges from the VP to the near field; purple wall visible above them | foam |
| 8 | VP | bright disc inside a "target" of many thin rings | small warm light; the rings recede into it evenly | environment |
| 9 | Near gold frame ring | missing | thick gold ring segments in both bottom corners + bottom arc | environment (only if items 1, 2, 6 are done) |

## Owners (STRICT — edit only your own files/sections; use the Edit tool, never rewrite a shared file with Write)
| Specialist | Owns |
|---|---|
| washer-environment-modeler | `src/world/materials.ts` (all EXCEPT `farRiverMaterial`), `src/world/tube.ts` (all EXCEPT `class ForcedTunnel`), `src/world/environment.ts` (all EXCEPT the block that starts at `// ---- 05 far tunnel` and builds farWall/farRiver/farRings/farLids/glow), `src/render/env.ts`, `src/render/grade.ts`, `tools/blender/*` except `tools/blender/camera_lock_05.py` |
| path-camera-transition-engineer | `class ForcedTunnel` in `tube.ts`, the `// ---- 05 far tunnel` block in `environment.ts`, `farRiverMaterial` in `materials.ts`, new files `src/world/far05*.ts` |
| water-fx-specialist | `src/vfx/waterRibbon.ts`, `src/vfx/glsl.ts`, `docs/vfx/*` |
| foam-bubbles-particles | `src/vfx/foam.ts`, `src/vfx/bubbles.ts`, `src/vfx/riderSplash.ts`, `src/vfx/spray.ts`, `src/vfx/index.ts` |
| coordinator (main session) | camera (LOCKED), `src/game/*`, `src/world/course.ts`, `src/gameplay/*`, `scripts/*`, `tools/blender/camera_lock_05.py`, tests, reports |
| benny-character-artist | not running this wave: Benny is preserved as is (wave-5 GLB) |

## Rules for wave 6
* Write `qa/pilot05/wave6/<you>/NOTES.md` FIRST (5-line plan), then update it after every capture
  (what changed in which function, what you saw, measured numbers). Autosave pushes it every 5 minutes.
* Capture: `timeout 600 node scripts/capture.mjs 05 --out=qa/pilot05/wave6/<you>/itNN` (≈ 15 s now).
  At most **8** iterations. Report: `python3 -I scripts/screen_report.py 05 qa/pilot05/wave6/<you>/itNN PREV=qa/pilot05/wave6/current/05.png NOW=qa/pilot05/wave6/<you>/itNN/05.png`
  — LOOK at the side-by-side and the overlay image every time (Read the PNG).
* `npx tsc --noEmit` must pass when you finish. If your file is shared with 03/04/06/07, do ONE regression
  capture of those at the end (`--out=qa/pilot05/wave6/<you>/regress`) and look at them.
* Ride check if you touch anything that moves with the camera: the 05→06 ride must not show warps or
  pops (`window.__rainbow.step` / capture several s values).
* Requests to another owner: one line in `qa/pilot05/REQUESTS.md` prefixed `wave6`.
* Do not commit or push (autosave does). Never touch `references/` or `character_references/`.
* No paid generation (World Labs, Meshy, Rodin), no secrets. Measured numbers only; no invented
  fidelity percentages. Mobile budget: ≤ 130 draw calls, ≤ 650k tris for the whole 05 frame.

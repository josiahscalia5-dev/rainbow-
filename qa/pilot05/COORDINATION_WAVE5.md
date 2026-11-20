# Screen 05: wave 5 (account 6, session branch `claude/rainbow-3d-account-transfer-syorak`)

Started 2026-11-15 ~22:00 UTC. Wave 4 (account 5) was cut off at 21:18 UTC: every edit pushed by the
21:18 autosave (`3c0fe33`) is in the tree and is **kept**. Nothing after 21:18 reached GitHub (no
specialist NOTES.md from wave 4). `COORDINATION_WAVE3.md` still holds targets 1–10, file ownership and
rules; `COORDINATION_WAVE4.md` still holds the CAMERA LOCK. This file only adds wave-5 facts.

## Baseline for wave 5 (recovered tree, `1764258`)
* Approved target: `references/05_flow_into_the_current.png` (immutable, 864×1536).
* Live game now: `qa/pilot05/wave5/baseline/05.png` (stage 05, s 132.44, 121 calls, 608k tris).
* Previous version (wave-4 start): `qa/pilot05/wave4/baseline/05.png`.
* Gameplay baseline (must not regress): `qa/pilot05/wave5/baseline/gameplay_test.json` — pass, 2139
  steps, 91 coins, plunge 61.41, pause/resume, heart loss, victory 11. Continuity: drop 61.19, gaps ≈ 0.
* Your own wave-4 transcript (read the END of it, it shows exactly where you stopped):
  `backups/claude-sessions/d8784a51-ef7d-54bd-9459-c5d061a0acfa/subagents/agent-<id>.md`
  environment `ab0084779f3629691` · water `a7470b0cd52aaf0a9` · foam `a552755212d7f7c16` · Benny `a2a473b347c5f9236`.

## What the coordinator measured on the baseline (ref vs live, 864×1536 px)
| Element | Live now | Ref target | Owner |
|---|---|---|---|
| VP glow | huge warm disc ≈ x 350–650, y 340–640 with a white core; the tunnel looks short | small bright warm point at the VP (≈498, 500): core ≲ 40 px, halo ≲ 120 px; ≥ 8 gold rings visibly recede INTO it | environment |
| Walls | pastel pink, stripy | deep metallic violet #992FC2 / magenta #CD32AA, black oval slots, white-pink specular streaks | environment |
| Rings | flat orange bands | polished yellow-gold (#FCE082 highlights, #F4B70F…#F9A640 mids, copper only in shadow), visible depth/lip | environment |
| Wall lids | orange striped "fan/scallop" shapes | copper/gold half-dome or flat round lids seen at an angle, one per bay, symmetric | environment |
| Near frame ring | missing | thick gold ring segments in both bottom corners (x 0–120 and 744–864, y 1280–1536) and bottom arc | environment |
| Foam banks | tall white WALLS: left x 0–≈90 y 700–1300, right x ≈740–864 y 700–1536, covering the purple wall | LOW foam rims hugging the river edge, purple wall visible above them; near-camera bank width ≈18 % (L) / ≈15 % (R) of image width (wave-4 foam measured 49 % / 44 %) | foam |
| Spray under Benny | soft fan (wave-4 fix) | keep it; ref V fan 180–680 × 1080–1260 | foam |
| Water near field y 1200–1536 | flat uniform blue "road", few glints | glossy cyan with flow streaks, blue-white reflections, many white 4-point star glints, depth (darker troughs / bright crests) | water |
| Pink "fins" | two hard pink wedges behind Benny (≈ x 100–750, y 1200–1360) | none; near the bottom the pink bands run at the image sides (≈ x 0–150 and 700–864) | water |
| Pink S-bands | weak, mostly straight diagonals | two continuous hot-pink (#F739E5) S-bands either side of the meandering cyan core, ≈2 S-bends to the VP | water |
| Benny arms | wide horizontal fur "wings" ≈ x 235–610 | small round fur nubs at the cuff sides | Benny |
| Benny GLB | **stale**: game loads `assets/models/benny.glb` exported 19:39; later `build.ts` edits (nubs, star, pom seat) never exported | re-export with `node scripts/export-models.mjs benny`, then verify in the game | Benny |
| Coins | on the cyan core, sizes match (coordinator, wave 4) | — keep | coordinator |

## Owners (unchanged from wave 3/4; strict: edit ONLY your own files)
| Specialist | Owns |
|---|---|
| washer-environment-modeler | `src/world/materials.ts`, `src/world/tube.ts`, `src/world/environment.ts`, `src/render/env.ts`, `src/render/grade.ts`, `tools/blender/*` |
| water-fx-specialist | `src/vfx/waterRibbon.ts`, `src/vfx/glsl.ts`, `docs/vfx/*` |
| foam-bubbles-particles | `src/vfx/foam.ts`, `src/vfx/bubbles.ts`, `src/vfx/riderSplash.ts`, `src/vfx/spray.ts`, `src/vfx/index.ts`, VFX-feeding lines in `src/game/Game.ts` |
| benny-character-artist | `src/characters/benny/*`, `assets/models/benny.glb`, `docs/characters/benny*`, Benny part of `scripts/export-models.mjs` |
| coordinator (main session) | camera (LOCKED), `src/world/course.ts`, `src/gameplay/coins.ts`, `CHECKPOINTS`/bloom lines in `Game.ts`, all tests |

## Rules for wave 5 (learned from four cut-off waves)
* **Write `qa/pilot05/wave5/<you>/NOTES.md` FIRST** (a 5-line plan), then UPDATE it after every capture
  iteration (what changed in which function, measured numbers). The 5-minute autosave pushes it, so your
  progress survives if the session is cut off again.
* At most **5 capture iterations**: `timeout 600 node scripts/capture.mjs 05 --out=qa/pilot05/wave5/<you>/itNN`.
  4 CPUs are shared by four specialists: capture only when you need to look.
* Side-by-side: `python3 scripts/triptych.py OUT.png 1100 REF=references/05_flow_into_the_current.png PREV=qa/pilot05/wave5/baseline/05.png NOW=<capture>`
* `npx tsc --noEmit` must pass when you finish. If your file is shared with 03/04/06/07 (materials,
  water shader, Benny GLB), do ONE regression capture of those at the end and compare with `screenshots/NN.png`.
* Requests to another owner: one line in `qa/pilot05/REQUESTS.md` prefixed `wave5`.
* Do not commit or push (autosave does). Never touch `references/` or `character_references/`.
* No paid generation (World Labs, Meshy, Rodin), no secrets. Report measured numbers only; no invented
  fidelity percentages. Do not redesign: same washer tube, route, elements; only bring them closer to the ref.

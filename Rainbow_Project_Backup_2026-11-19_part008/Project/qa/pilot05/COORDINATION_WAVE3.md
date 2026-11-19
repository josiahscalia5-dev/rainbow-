# Screen 05: wave 3 specialist coordination (account 4, session branch `ccr-d4bb0ad3-8ycajb`)

Started 2026-11-15 ~20:00 UTC. Wave 1 (account 2) and wave 2 (account 3) were both cut off by usage limits.
All of their edits are in the tree and are **kept**. Wave 3 starts from commit `e9a2292` and finishes the job.
The main Claude session is the coordinator. **Do not redesign the scenery.** Match the approved image.

## The four images (look at all of them before you edit)
| Role | File |
|---|---|
| Approved target | `references/05_flow_into_the_current.png` (864×1536, immutable) |
| Original game (before any specialist) | `qa/pilot05/05_before_81e639e.png` |
| Previous specialist version (wave 2 end, `e9a2292`) | `qa/screen05_final/previous_specialist/05.png` |
| Other screens before wave 3 (regression baseline) | `qa/pilot05/wave3_baseline/NN.png` |

Pixel targets for every element: `qa/scene_comparisons.md` §05 (5.1–5.11). Your own earlier notes and
iterations: `qa/pilot05/<your folder>/` and the transcripts in `backups/claude-sessions/*/`.

## The user's ten Screen 05 corrections and who owns each
| # | Correction | Owner |
|---|---|---|
| 1 | Washer walls deep metallic **magenta and violet** (ref medians: violet #992FC2, magenta #CD32AA; left wall #B830AE, right #D234AB, ceiling #B131A9), dark high-contrast capsule slots, lengthwise white-pink specular streaks. The current walls are washed-out pale pink/white: remove the overexposure | washer-environment-modeler |
| 2 | Rings **polished reflective yellow-gold**, not orange: bright pale-yellow highlights (#FCE082), golden mid-tones (#F4B70F … #F9A640), warm copper only in the shadowed side; flat band with double lip and marquee highlight spots | washer-environment-modeler |
| 3 | Tunnel proportions and **evenly spaced rings**: ≈10 concentric rings to one VP at (498±25, 479±25); smooth perspective spacing (ring tops on the VP column ≈105 → 60 → 25 → 20 → ≤15 px); near frame ring visible at both bottom corners and as the bottom arc; copper half-dome nozzle lids, one per bay, symmetric on both side walls (§5.5); bright warm glow at the VP (the ref shows light at the tunnel end, not the 06 arch rising) | washer-environment-modeler (geometry/materials/glow) + path-camera-transition-engineer (straightness, what is visible at the VP) |
| 4 | **Wide winding** electric-cyan (#029AF3) and hot-pink (#F739E5) river: fills the tube floor (≈49% of width at y=600, full width from y≈800); cyan core meanders ≈2 S-bends to the VP, two hot-pink S-bands on both sides follow it; rows y=1200/1400 cyan-dominant | water-fx-specialist (shader/bands) + path-camera-transition-engineer (meander curve `S05`/`meander05` in course.ts) |
| 5 | Flowing water, reflections, white 4-point **star glints**, glossy flow streaks; **white cloud-like foam banks** on both edges; ≈15–20 large **iridescent** bubbles at the sides, none over Benny or the centre path | water-fx-specialist (water surface) + foam-bubbles-particles (foam, bubbles) |
| 6 | Benny's **size** and **hat-to-body proportions**: bbox x 230–612 / y 768–1190 (±25 px); hat incl. pom ≈62% of visible height, fur body below the cuff ≈38%, round full body, both arm nubs visible; white/purple knit stripes (3 purple) with visible stitches, purple ribbed cuff, big purple pom (≈140 px), **yellow star on the front-right of the cuff facing the camera** | benny-character-artist (model proportions/hat/star) + path-camera-transition-engineer (on-screen size via camera) |
| 7 | Eliminate the **white jagged splash artifact beneath Benny** (white serrated rim/edge around his base); replace with the ref's V-shaped spray fan of white/cyan droplet streaks (180–680 × 1080–1260) | foam-bubbles-particles (lead) + water-fx-specialist if the source is a wake term in `waterRibbon.ts` |
| 8 | Camera position and perspective: VP (498, 479); low elevation (≈10–20° over Benny); full back of Benny visible | path-camera-transition-engineer |
| 9 | Gold **$ tokens**: ≈9–10 centred on the cyan core ahead of Benny, winding with it; nearest ≈95 px at ≈(473, 728), ≈40 px above the pom; tilted to face the camera with visible rim; legible embossed "$"; colour #F4B70F; **none overlapping Benny** | path-camera-transition-engineer |
| 10 | Stay genuinely playable real-time 3D (steering, coins collect, stage flow 03→11 intact). Budget at 05 (SwiftShader capture): ≤ 650k triangles and ≤ 130 draw calls (now 582,879 / 114) | everyone |

## File ownership (strict: edit ONLY your own files; read anything)
| Specialist | Owns |
|---|---|
| washer-environment-modeler | `src/world/materials.ts`, `src/world/tube.ts`, `src/world/environment.ts`, `src/render/env.ts`, `src/render/grade.ts`, `tools/blender/*` |
| water-fx-specialist | `src/vfx/waterRibbon.ts`, `src/vfx/glsl.ts`, `docs/vfx/*` |
| foam-bubbles-particles | `src/vfx/foam.ts`, `src/vfx/bubbles.ts`, `src/vfx/riderSplash.ts`, `src/vfx/spray.ts`, `src/vfx/index.ts`, and ONLY the VFX-feeding lines (wake/splash/foam anchors) in `src/game/Game.ts` |
| path-camera-transition-engineer | `src/world/course.ts`, `src/game/cameraRig.ts`, `src/gameplay/coins.ts`, and ONLY the `CHECKPOINTS` table lines in `src/game/Game.ts` |
| benny-character-artist | `src/characters/benny/*`, `assets/models/benny.glb`, `docs/characters/benny*`, `scripts/export-models.mjs` (Benny part only) |
| reference-match-director, playwright-visual-qa | read-only on `src/`; they write `qa/` reports (after the build wave) |

Need a change in someone else's file? Append one line to `qa/pilot05/REQUESTS.md` (`from → to: request`).
The owner reads that file before each iteration and applies it. The coordinator settles disputes.

## Rules
* Do not redesign: same washer tube, same route, same elements, same order. Only bring them closer to the reference.
* Other screens must not regress. If your change can reach 03, 04, 06 or 07 (shared materials, shared water
  shader, shared camera code), re-capture those and compare with `qa/pilot05/wave3_baseline/`.
* `npx tsc --noEmit` must pass before you finish. path-camera: `npm run test:continuity` must stay `ok`
  (verticalDrop ≈ 61.2, stage gaps ≈ 0) and **s6 (the 06 start) must not move**.
* Capture: `timeout 600 node scripts/capture.mjs 05 --out=qa/pilot05/wave3/<you>/itNN`. Vite picks a free port.
  The machine has 4 CPUs shared by five specialists: capture only what you need (≈30–60 s each).
  Isolation renders: add `--q=waterhide=ribbon,foam,...` (see `src/vfx/index.ts`). If a capture fails because
  another specialist's file is mid-edit, wait ~30 s and retry. Never touch their file.
* Side-by-side: `python3 scripts/triptych.py OUT.png 1100 REF=references/05_flow_into_the_current.png PREV=qa/screen05_final/previous_specialist/05.png NOW=<your capture>`
* Do not commit or push: the 5-minute autosave does that. Never touch `references/` or `character_references/`.
* No paid generation (World Labs, Meshy, Rodin) and no secrets.
* Report measured numbers only. Do not invent fidelity percentages.
* Finish with `qa/pilot05/wave3/<you>/NOTES.md`: what changed (file:function), before/after numbers you
  measured on your own capture, and what is left.

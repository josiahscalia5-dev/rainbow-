# Screen 05: wave 9 (recovery session `01Kbt6BV`, branch `claude/rainbow-3d-account-recovery-xex5hc`)

Started 2026-11-16 ~02:30 UTC on a NEW Claude account. Wave 8 (session `94cf04e3`, branch `ccr-937c7fbb-htsrgt`) stopped
mid-iteration when that account ran out of credits: water had reached it05/it06, foam it05, environment it02 (log only
up to it01), path-camera it02 (log EMPTY). All their edits are in the code as it is now. Wave 9 = each specialist
CONTINUES its own wave-8 work from where it stopped. Do not redo finished work. All owners/rules of
`COORDINATION_WAVE6.md` / `COORDINATION_WAVE8.md` still apply (strict file ownership, Edit tool only, NOTES first,
no commits — the coordinator's 5-minute autosave pushes everything, no paid generation / World Labs calls, no
invented percentages).

## Verified at start (coordinator)
* `scripts/resume-newest-work.sh` → RESUME CHECK OK: every `ccr-*`/`claude/*` branch contained, LFS 24/24 real files,
  refs 12/12, 10 agents, `tsc` OK, continuity ok (gaps 0, 07→08 drop 61.19).
* `node scripts/gameplay-test.mjs` on the recovered code → **pass** (8/8 checks, plunge 61.41, errors []).
* Baseline for wave 9 = the recovered code: `qa/pilot05/wave9/baseline/{03,04,05,06,07,08}.png`
  (05: 86 calls, 567,415 tris). Report of recovered vs wave-8 baseline (`qa/pilot05/wave9/recovered/`):
  mad 51.2 → 50.6, hue_corr 0.856 → 0.875, edge_corr 0.177 → 0.195, tunnel+VP 61.0 → 58.6, river mid 47.2 → 47.6,
  Benny+near water 46.7 → 46.5.
* Tools: Blender 5.3.0 (`/usr/local/bin/blender`), Android SDK 34, worldlabs plugin. Marble assets all present
  (`qa/worldlabs/05/pilot/{draft,full}/`, both .blend imports open in Blender 5.3).

## Coordinator's whole-frame read (approved vs recovered, ranked by visual impact)
| # | Element | Live now | Approved | Owner |
|---|---|---|---|---|
| 1 | Lids / fittings | blocky copper PLANKS jutting from the walls at odd angles (upper-left, upper-right) — most obvious mismatch | glossy rounded gold-copper half-dome PUCKS flush on the wall, seen at an angle, at the ring joints | environment |
| 2 | Walls | violet metal, large dark slot holes, radial slat look near the VP | luminous magenta-pink metal, fine dense perforations, strong white-pink lengthwise light streaks | environment |
| 3 | Rings | thick copper-salmon bands | thinner, bright glossy YELLOW-gold with orange edges, dense bright bulbs, many rings receding evenly | environment (+ far ring depths: path-camera) |
| 4 | Vanishing point | small orange dot | large warm white-gold glow, rings and river recede into it | environment (glow) + path-camera (far block) |
| 5 | Far river + coins | winding has started (far05.ts) but trail of coins stops early; far river reads small | cyan core with pink bands winding in S-bends right into the light; ≈8–10 coins shrinking along it | path-camera |
| 6 | Mid/near river | pink mostly hugs the edges; near pink = straight diagonal planks | broad pink S-ribbons sweeping through the middle; thick glossy cyan with bright flares/glints | water |
| 7 | Foam | near clumps still sphere heaps; rims OK | fine lavender/blue small-bubble banks hugging the edges, white-lavender tops | foam |
| 8 | Splash | two white wings | natural white spray fanning down-outward from both sides of Benny, water visible between strands | foam |

Priorities from the user (2026-11-16): substantial visual improvements first, not endless tiny tweaks. Approved image
ALWAYS wins over the Marble world. Use the EXISTING Marble assets where they genuinely improve the REAL 3D scene
(pano reflections on 05 materials — already in; wall textures `qa/worldlabs/05/pilot/full/analysis/{bay,wall}_unrolled.png`;
measurements `*/analysis/*.json`, `import/*_measure.json`; Blender scenes `import/*.blend`). Blender 5.3 may be used to
model/optimise geometry (e.g. lid pucks) exported as small GLB (Android budget). No static image / splat substitute
for the playable scene. Protected: Benny (unchanged), locked STAGE_CAM['05'], course/S05 geometry unless a tested
change is required (path-camera only), gameplay, HUD, 05→06 join, 07→08 descent.

## Wave-9 assignments (parallel, file ownership unchanged from wave 8)
* **path-camera-transition-engineer** — owns `src/world/far05.ts`, the `// ---- 05 far tunnel` block / `class ForcedTunnel`
  in `src/world/tube.ts` + its far-block section of `environment.ts`, `src/world/course*`, `src/gameplay/coins.ts` (05 coins only).
  Rows 4 (far part), 5, far ring depths of row 3, far foam rims.
* **washer-environment-modeler** — owns `src/world/materials.ts`, its own sections of `environment.ts` and `tube.ts`
  (lids `lid05`, rings, walls, VP glow), `src/render/env.ts`, `assets/textures/*`, any new `assets/models/env05_*.glb`.
  Rows 1, 2, 3, 4 (glow).
* **water-fx-specialist** — owns `src/vfx/waterRibbon.ts`, `src/vfx/glsl.ts`, `docs/vfx/*`. Row 6.
* **foam-bubbles-particles** — owns `src/vfx/foam.ts`, `bubbles.ts`, `riderSplash.ts`, `spray.ts`, `src/vfx/index.ts`. Rows 7, 8.
* Coordinator-owned (do not edit): `src/Game.ts` (bloom), `scripts/*`, HUD, Benny, camera.
* Cross-owner needs → one line in `qa/pilot05/REQUESTS.md` prefixed `wave9`; read it between iterations.

## Rules (wave 9)
* FIRST: read your own `qa/pilot05/wave8/<you>/NOTES.md` and look at your newest wave-8 `itNN/05_side_by_side.png`. If
  your wave-8 log is missing entries for captures that exist (path-camera it01–it02, environment it02), add a short
  "recovered" entry from the evidence before you change anything.
* NOTES in `qa/pilot05/wave9/<you>/NOTES.md` (plan first, log after every capture); evidence `qa/pilot05/wave9/<you>/itNN`.
* Capture: `timeout 600 node scripts/capture.mjs 05 --out=qa/pilot05/wave9/<you>/itNN`; report:
  `python3 -I scripts/screen_report.py 05 qa/pilot05/wave9/<you>/itNN PREV=qa/pilot05/wave9/baseline/05.png NOW=qa/pilot05/wave9/<you>/itNN/05.png`.
  LOOK at the side-by-side every time. At most 6 iterations. Revert what does not look closer to the approved image.
* Other specialists edit in parallel: keep every edit compilable (finish an edit before capturing); if a capture fails
  because ANOTHER owner's file does not compile, wait ~1 min and retry; never touch their files.
* Budgets: ≤130 draw calls / ≤650k tris on 05.
* End: `npx tsc --noEmit`; regression `timeout 900 node scripts/capture.mjs 03 04 06 07 08 --out=qa/pilot05/wave9/<you>/regress`
  vs `qa/pilot05/wave9/baseline/NN.png`: unchanged below the HUD unless intended (say so); 06 keeps its stage anchors.
* path-camera (and anyone touching course/coins): ride check 04 → 06 and `node scripts/gameplay-test.mjs` must pass.
* Final report (≤25 lines): what changed (files), kept iteration, measured before/after numbers, what is left.

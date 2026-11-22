# Benny round 31 — improving the 3D Benny toward the APPROVED Screen 06 Benny (2026-11-21, branch `ccr-4fcad20e-a6pp8w`)

**User (verbatim, 2026-11-21):** "DO NOT remove or redesign my original approved pink Benny … Keep the approved-looking Benny in my current visual
candidate. Do not replace him with the older 3D model … use my original approved Benny as the strict visual reference to improve the existing 3D model
… Show APPROVED / CURRENT 3D / IMPROVED 3D comparisons at the same rear angle and size. Keep the approved-looking version available until the improved
3D character is visibly close enough for me to approve. Do not silently switch characters."

**State:** nothing in the game changed. `?paint06=1` keeps the user's painted Benny on Screen 06; the game's default 3D Benny is unchanged. The improved
3D Benny exists only as files + a QA lab page; it is NOT wired into the game (waiting for the user's verdict).

## Improved 3D Benny (candidate)
* Mesh: Hunyuan3D 2 (fal `fal-ai/hunyuan3d/v2`) from the approved Benny cut-out (`input/`), 40 k triangles, one texture — chosen from six
  generators by outline match to the approved Benny (Hunyuan3D 2 0.955 · Thrixel 0.929 · Tripo 2.5 0.919 · Hunyuan3D 3.1 0.912 · Rodin 0.864 ·
  Trellis 0.743, which also grew a face on his back). `gen/hunyuan2.glb` (+ the other generators' models in `gen/`).
* Colours: `gen/hunyuan2_bake.png` = the approved Benny's own pixels (SeedVR ×2) projected onto the mesh from the fitted rear view and run backwards
  through the game's colour chain (Neutral tone mapping 0.86, sRGB, grade 1.36 / 1.15), so an UNLIT material (texture × 4) shows the approved colours
  in the game's own pipeline. Outline band (~3 px) takes colours from just inside (the painted light fur tips read as a white line on the mesh edge).
  Sides / front (not in the approved picture): the generator's own colours, colour-matched; no leaking across UV islands. Tools: `tools/benny31/`.
* Lab: `/src/characters/benny/benny31-lab.html?model=/qa/benny/r31/gen/hunyuan2.glb&bake=/qa/benny/r31/gen/hunyuan2_bake.png&K=4`
  (`?model=current` = the game's Benny) — the game's lights, tone mapping and grade.

## Same rear angle and size (`proof/APPROVED_CURRENT3D_IMPROVED3D.jpg`, `.json`)
Each model at its best-fitting rear view, scaled to the approved Benny's width and pom-pom top, in the approved Screen 06 scene (Benny erased),
cut at the approved waterline; the approved splash ring laid over all alike. Inside the approved Benny's box:
| | outline (IoU) | structure (SSIM) | pixels within 20 levels |
|---|---|---|---|
| CURRENT 3D (game today) | 0.902 | 0.490 | 44.4 % |
| IMPROVED 3D | 0.956 | 0.805 | 66.3 % |
(The per-pixel figure is strict: fur strands a pixel apart count as different.)

## Honest differences / next steps
* Sides and front (`proof/TURNAROUND_CURRENT3D_vs_IMPROVED3D.jpg`): smooth plain pink and plain stripes — the approved picture shows only his back.
  Next: generated side / three-quarter views of the approved Benny (fur + knit, no new design) projected the same way; his face (the existing violet
  eyes) only with the user's OK.
* Outline: smooth mesh edge vs the painting's fuzzy fur tips → shell fur along body / arms / pom-pom (existing `fur.ts`).
* Right cuff end bulges slightly past the painted cuff (mesh shape).
* One mesh, no separate arms: body motion (bob, lean, steer tilt) works; paddling arms need the arms split off (Blender) — not done.
* Paid jobs: fal (ledger `qa/match/06/paint06/LEDGER.md`, rows `benny31_*`) + one Thrixel sculpt (8 cubes).

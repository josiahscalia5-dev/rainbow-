# Screen 04 — Blender bank-foam heap test (round 19, 2026-11-19 ~20:05–20:20 UTC) — free, no credits

User (after the Thrixel model was not an improvement): "maybe use Blender ... [Thrixel] doesn't work for that certain thing".
Same single-heap test as `../r19_thrixel/NOTES.md`, same placement method and visibility rule, separate switch `&m04bfoam=1`.

## Model (Blender 5.3, deterministic) — `tools/blender/foam_cluster04.py` → `assets/models/match04/foam_heap_blender04.glb`
The painted right-bank heap as it reads in the approved picture: a LOW, WIDE pile of BIG separate round bubbles — 46 spheres,
biggest on the ridge, small ones at the waterline and both ends, packed with overlap; 21,984 triangles, one mesh, vertex colours
(pearly lilac-white, pinker at one end, bluish undersides); 0.67 MB. Built lying flat (length along +X). Inspection renders:
`view_three_quarter.png`, `view_low_side.png` (grey = the preview renderer's default material).

## Game finish (src/world/match04m4.ts, `bankModel('m04bf', …)`)
Physical material on the Blender vertex colours: clearcoat, soft iridescence, low roughness, slight cool self-light so the shadow
side stays pale blue-lilac under the game's pink / purple lights. Tuned at the approved camera with `m04bfshow=1` (free):
`tune/b1…b5` (b1 pink cotton balls → b5 lilac-white with blue-lilac shading). Candidate = b5:
`CANDIDATE_QUERY_ADD.txt` = `m04bfoam=1&m04bfe=0.2&m04bfec=1&m04bfi=0.15&m04bfsh=0&m04bfr=0.08&m04bfc=3&m04bfs=2.6&m04bfz=-0.6&m04bfo=0.3`
added to the preview v2 query.

## Result — verdict: PROMISING, small improvement at that spot (much better than the Thrixel model); NOT promoted
* Same camera (`tune/b5.png`, crop `tune/b5_crop.png` vs `../r19_thrixel/approved_crop.png`): a heap of big glossy lilac-white
  bubbles on the painted heap's spot, about the same size; cleaner and more even than the painting (the painted heap also has
  many tiny bubbles at the waterline and sharp white highlight dots). In the normal game this view shows the painting itself.
* While swimming (`NEW/` vs `../r19_thrixel/BEFORE/`, f01–f05 + steering right): the heap reads as a solid pile of big glossy
  pearly bubbles like the painting's, where BEFORE shows the cloud-style foam (white puffs of many tiny bubbles). But it sits
  next to that cloud-style foam, so the right bank now mixes two looks.
* Clip `NEW_swim_clip_half.mp4`: fades in as the camera leaves the start view, solid, no flicker / popping, gone by ≈0.4 s.
* Start view in the normal game unchanged (hidden there, same rule as all 3D foam); coins unchanged (1,330 at every shot).

## Next step if the user wants it (free): give the WHOLE bank foam this Blender bubble-heap look
Instance the same glossy-bubble heaps (a few seeds of `foam_cluster04.py`) along both banks in place of the cloud-style puffs,
behind a new switch, so the banks are one consistent look — s04 worker task (foam is its area), proven with APPROVED / BEFORE /
NEW + clip as usual.

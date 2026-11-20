# Brief — SPECIALIST 1 (agent `washer-environment-modeler`, role: Blender texture-projection and UV-mapping artist)

Launched 2026-11-16 ~15:47 UTC on branch `claude/rainbow-05-water-projection` (session `013VHsJB`). Saved here so a new
session can relaunch the same assignment (`backups/AGENTS_STATUS.json` → `running_now`).

## The user's request (2026-11-16 ~15:40 UTC, summarised faithfully)
* STOP recreating the approved water with new procedural patterns, random shader adjustments and more bloom; reproduce
  the ACTUAL ORIGINAL DESIGN, not another interpretation.
* Specialist 1: use the approved Screen 05 and the original isolated blue-and-pink water artwork (exact files); trace the
  water contours, cyan areas, magenta S-ribbons, white glossy highlights and foam edges; with Blender 5.3 investigate
  camera-matched UV projection / texture baking onto the ACTUAL existing 3D river mesh so that a paused screenshot from
  the real Three.js game matches the approved water as closely as technically possible. Not an image pasted over the
  screen: a real textured, continuous 3D river that can be viewed and animated in gameplay. If the geometry prevents an
  accurate match, explain why and build a reversible corrected-geometry candidate.
* Specialist 2 (water-fx-specialist, later): animate the SAME design — flowing down the S-curves toward the camera, thick
  cyan, sweeping glossy magenta ribbons, organic white reflections, flowing foam; layout anchored to the world; no new
  procedural water shader.
* Order: (1) closest static match from the locked camera, (2) animated water in the real playable game. Preserve Benny,
  camera, coins, steering, gameplay, transitions. Test with Playwright screenshots, water-only image comparisons,
  continuity, Android performance where possible. Separate reversible branch; save everything to GitHub; five-minute
  autosave on. No 100 % claims without evidence. Show full-size APPROVED vs NEW (same camera and scale), then a short clip
  proving the water flows in the correct direction. "Begin with the texture-projection feasibility test."

## Files
* TARGET `references/05_flow_into_the_current.png`; SOURCE `references/water/05_water_isolated_original.png` (see its README).
* Locked camera + Blender scenes: `qa/pilot05/wave6/camera_lock/` (camera05.json, screen05_camera_lock.blend,
  screen05_layout.*), `scripts/camera-lock-05.mjs`, `tools/blender/camera_lock_05.py`, `scripts/export-river-05.ts`.
* River: `src/vfx/waterRibbon.ts` (`createRibbon`, `aUV` = (u, s)), far block `src/world/far05.ts` +
  `farRiverMaterial()` (`src/world/materials.ts`), built in `src/world/environment.ts`; gameplay path `src/world/course.ts`
  (must not change).
* Post chain: RenderPass → UnrealBloom (0.2 / 0.35 / 0.94) → OutputPass (Neutral, exposure 0.86, sRGB) → grade
  (`src/render/grade.ts`: sat 1.36, con 1.15, vignette 0.18); FogExp2 #ffbde9 0.0035. Pre-compensate the texture.
* Capture `node scripts/capture.mjs 05 --q=... --out=DIR`; protect default (== `qa/pilot05/current_default_05.png`) and
  BEFORE `?ringa=26&nearfloor05=0` (== `qa/pilot05/wave9/baseline/05.png`).
* QA: `tools/qa/water05_grain.py`, `tools/qa/diff05.py`, `scripts/gameplay-test.mjs`, `npm run test:continuity`,
  `scripts/perf05.mjs`, `scripts/apk-web-check.mjs`.

## Steps
1. Feasibility: projection camera residuals; project ribbon + far block into the artwork's pixel space; footprint match
   (IoU, per-row bank offsets, S-swing, far channel); verdict + overlay; texel density near vs far.
2. Blender camera-projection → bake to a UV texture along the river (≤ 4096, preferably 2048), .blend + script in
   `tools/blender/`, textures in `assets/textures/water05/`; Three.js material behind `?proj05=1` (default untouched),
   colour pre-compensated, highlights/foam from the artwork; smooth hand-over at the 04→05 / 05→06 joins.
3. If needed: corrected visual-only geometry `?projgeo05=1` from the artwork's bank lines (course.ts untouched).
4. Evidence in `qa/pilot05/proj/`: compare/1_APPROVED, 2_CURRENT_T2, 3_NEW_proj05 (+3b); water-only comparison; pixel
   checks; gameplay 8/8, continuity, relative perf; `NOTES.md` with handoff for Specialist 2.

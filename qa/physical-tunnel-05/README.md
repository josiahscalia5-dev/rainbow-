# Screen 05: physical-tunnel motion comparison (experimental)

This branch is an isolated A/B diagnostic. It is **not** a visual approval, tested APK, or proof of a fixed game. No default scene behavior changes. Source: `src/world/environment.ts`, `src/game/cameraRig.ts`. Baseline: `chatgpt/rainbow-s06-continuity-20261120`.

## Four comparisons

Run the existing Vite game with the same screen size, course position, Benny steering input, and game-speed settings. For every run use the existing `window.__rainbow` QA API: `goto('05')`, `setSteer(-1/0/1)`, `step(n,dt)`, `bennyScreen()`, `camera()`, `state()`, `probe(x,y)`, and `qa3d()`. Start from the same checkpoint or recorded `s`/time.

- **Original**: no extra query flags.
- **Camera alone**: `?follow05=1`. Blend toward the curved-course chase camera in 05, using the original artwork/geometry.
- **Geometry alone**: `?physical05=1&noframe05=1`. Disable the forced-perspective far block and camera-space near gold frame; retain normal 05 camera. The already-present real tunnel and water ribbon are used. The far gold-ring layout may be less impressive: this is expected for a diagnostic.
- **Combined**: `?realride05=1`. Enable physical tunnel, no frame, curved-course chase camera.

The combined mode **does not rebuild missing geometry**, replace artwork, or guarantee better visuals. It deliberately shows any genuinely missing section.

## Required testing before any promotion

1. `npm run typecheck` and `npm run build`. This branch was edited remotely and has **not** yet been compiled or rendered by ChatGPT.
2. Record original and combined runs on the *same* Android portrait aspect with continuous traversal from the last third of Screen 04, through Screen 05, into early Screen 06; include hard steering left and right.
3. Log Benny's projected NDC center and 3D bounds each frame. `bennyScreen()` reports only the origin; a head/hat bounding-box check must be added separately for reliable clipping detection. Flag any loss of visibility, wild camera jumps, or sudden FOV changes.
4. Inspect the wall/water seam around `sF05`, ring placement, tunnel ends, and any gaps that remain when compressed fake depth is disabled. Use world-space mesh inspection or probe rays as well as video.
5. Fix the *specific* continuity defect found using correctly connected course-space geometry, retaining approved materials, river shapes, gold rings, and washer style. Any new real rings should be tested at real spacing rather than copying virtual eye-space radii.
6. Save before/after code diff, fixed-seed videos and Android test result. Keep all changes behind test flags until acceptance.

## Acceptance

Zero character/hat clipping in the recorded run; no visible hole, hard texture end, tunnel ring pop, impossible depth shift, or foreground edge following the camera. Smooth chase, steady forward motion and natural steering; reference look retained as closely as physical geometry permits. The normal build remains unchanged. If an A/B mode looks worse, report it rather than silently promoting.

**No fal or Marble credits needed for these tests.**

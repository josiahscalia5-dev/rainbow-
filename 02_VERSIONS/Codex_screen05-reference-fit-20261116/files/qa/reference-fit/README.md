# Screen 05 reference-fit experiment

This is an isolated playable-water experiment on `codex/screen05-reference-fit-20261116`.
The requested exact/very close visual match is not yet established. Nothing is merged into a Claude branch.
The tested application source is commit `60bfd8cf7f51a8e174768f52492c210e0331e0fa`; later commits add review evidence.
Its ancestry starts from the requested `claude/rainbow-3d-account-recovery-hfb8p0` source at
`088dd3fc77c0cf18f1e853ffb27a0945e27b1f0b`, through the preceding isolated Codex experiments.
The separately inspected `ccr-451ea8c7-3nqlis` work was never a push or merge target.

## Full-size images

- [APPROVED](APPROVED.png): unchanged 864×1536 master reference.
- [CURRENT](CURRENT.png): the original source-branch game capture, copied from the preserved first baseline.
- [NEW paused frame](NEW.png): real Three.js rendering, `?fit05=1`, checkpoint 05, time 12, 864×1536.
- [Previous rejected study](coordinates/baseline.png): `?reference05=1`, used as the numerical fitting baseline.

The first two attempts are retained under `iteration01` and `iteration02`. They expose the flat-color and
reflection-lookup problems corrected in `iteration03`. `iteration04` increases optical-field resolution
and texture anisotropy. The final frame is a fresh render of the animated application at the same pose.
None is represented as user-approved artwork.

## What changed

The new flag implies the existing reference-study geometry/foam variant. All earlier flags and the default
remain available. No camera, character, coin, control, course, transition, or Marble asset source was edited.

1. Measured magenta ribbon boundaries from the approved frame are mapped through the actual rendered water's
   `(s, lateral)` coordinates, then represented by compact curve controls. The near and far surfaces have
   separate lateral coordinate systems.
2. Thirty-eight selected white reflection traces and ten sheen traces become curved 3D surface strips.
   These use the water's wave displacement and upright-frame blend, depth testing, and a small normal offset.
3. A 1024×2048 single-channel grayscale optical field preserves the approved water's illumination pattern. It is
   mapped in river coordinates. Actors, coins, bubbles, foam and white glints were excluded before fitting;
   missing regions were smoothly inferred. It contains no reference RGB picture or video.
4. Cyan/magenta shading values are calibrated through the existing exposure, Neutral tone mapper, sRGB
   conversion and color-grade settings. White glints remain separate geometry.
5. Two overlapping five-second advection phases move the optical field and instanced reflection strips
   toward decreasing course distance at 0.12 world units per second. Resets occur at zero phase weight.
   Time 12 retains the authored pose. `?fit05=1&fitstill05=1` disables this new advection for inspection.

## Current evidence and limitations

Capture reports record actual WebGL rendering, complete source hashes, fixed camera and game state.
The unchanged pre-existing browser favicon 404 is reported separately. TypeScript compilation passes.

`measure-final.json` compares the same 17 supported ribbon samples against the previous rejected study:
mean absolute center error changes from 24.74 to 9.71 pixels; median changes from 22.5 to 2.0 pixels.
Occluded, clipped and ambiguous samples are excluded explicitly. These are boundary measurements, not a
percentage aesthetic-fidelity score. Some individual errors still exceed 30 pixels.

The distant water/foam connection remains visibly unlike the reference. Some fine illumination is still
soft, the magenta shading differs in places, and clipped/inferred boundaries do not match every reference
edge. Numerical fitting is not an aesthetic approval.

The final animated t=12 render differs from the preceding still by at most one 8-bit channel level in
2,317 pixels, with no channel differences greater than one. Strict pixel identity therefore **fails**;
the separately reported one-level bound passes. The original geometry/index data and the active phase's
zero displacement are numerically preserved. The cause of the tiny color differences is not proven.

`tests/route.json` passes all ten route-boundary checks and retains the 61.19-unit numerical 07→08 plunge.
`tests/glint-motion-numeric.json` records finite geometry/derivatives, preserved original attributes, and
phase-weight continuity. Browser gameplay, temporal and host timing evidence is stored under `tests/`.

`tests/final/report.json` passes all ten browser checks: the default screenshot has **zero changed pixels**;
16 sampled gameplay states and segment extrema through 05→06 match the default; real keyboard/pointer
steering and pause/resume work; the fitted water/glints issue actual draw calls; low-quality rendering works;
and no browser/game errors or source changes occur. At the recorded high-quality pose, the candidate uses
87 draws, 585,111 triangles and 48 textures versus the default's 86 draws, 567,415 triangles and 43 textures.

The midpoint capture (`motion-midcycle`, t=13.25) checks both flow layers at half weight. Visual review of
that frame and three moving 05→06 frames found no new severe hole, tear, or detached glint. A faint material
transition at s184 remains; comparison with the preceding experiment shows it was already present.
Temporal pixel deltas are descriptive: particles remain in the sampled region, and the independently loaded
moving/still pages do not have guaranteed identical particle histories. See `temporal-method-notes.json`.

The serial 360×640 SwiftShader timing samples recorded medians of 2,046.55 ms (default) and 1,637.85 ms
(candidate) for the harness's instrumented simulation/render/readback operation. Each run contains only
eight measured samples; the candidate has two distinct timing groups. **No reliable speedup or Android
frame rate is established.** Raw samples and methods are retained in `tests/timing-default` and
`tests/timing-fit`; `validation-summary.json` collects the evidence and its limits.

`android-build.json` and `android-build.txt` record a successful separate debug APK build with `fit05=1`,
verified signatures and all 59 source/asset fingerprints unchanged. Original tracked Android files and
builds were restored and verified. The APK is 8,027,820 bytes, SHA256
`2a878e5cfebe73287e9c992372b71da51c74c61971ff73d05c1ae11ca7204571`.
Physical Android runtime and device frame rate remain untested.

## Reproduce

```sh
npm run typecheck
node scripts/fit05-review.mjs --out=qa/reference-fit/new-capture --q=fit05=1 --size=864x1536
python3 scripts/fit05-measure.py --image new=qa/reference-fit/new-capture/05.png --out qa/reference-fit/new-measurement.json
```

`scripts/fit05-coordinates.mjs`, `fit05-reference.py`, `fit05-map.py`, `fit05-palette.py` and `fit05-sheen.py`
record the extraction/mapping process. Reference overlays and field diagrams are labeled QA annotations;
they are not screenshots of the game. The supplied water-only picture remains the visual style target;
its original bytes were not available as a local file, so numeric extraction uses the repository's approved
Screen 05 master.

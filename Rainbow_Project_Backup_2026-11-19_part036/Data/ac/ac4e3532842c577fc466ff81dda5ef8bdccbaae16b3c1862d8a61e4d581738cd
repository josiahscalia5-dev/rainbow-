# Screen 05 reference-fit experiment

This is an unfinished, isolated visual study on `codex/screen05-reference-fit-20261116`.
The requested exact/very close visual match is not yet established. Nothing is merged into a Claude branch.

## Full-size images

- [APPROVED](APPROVED.png): unchanged 864×1536 master reference.
- [CURRENT](CURRENT.png): the original source-branch game capture, copied from the preserved first baseline.
- [NEW paused frame](NEW.png): real Three.js rendering, `?fit05=1`, checkpoint 05, time 12, 864×1536.
- [Previous rejected study](coordinates/baseline.png): `?reference05=1`, used as the numerical fitting baseline.

The first two attempts are retained under `iteration01` and `iteration02`. They expose the flat-color and
reflection-lookup problems corrected in `iteration03`. None is represented as user-approved artwork.

## What changed

The new flag implies the existing reference-study geometry/foam variant. All earlier flags and the default
remain available. No camera, character, coin, control, course, transition, or Marble asset source was edited.

1. Measured magenta ribbon boundaries from the approved frame are mapped through the actual rendered water's
   `(s, lateral)` coordinates, then represented by compact curve controls. The near and far surfaces have
   separate lateral coordinate systems.
2. Thirty-eight selected white reflection traces and ten sheen traces become curved 3D surface strips.
   These use the water's wave displacement and upright-frame blend, depth testing, and a small normal offset.
3. A single-channel grayscale optical field preserves the approved water's illumination pattern. It is
   mapped in river coordinates. Actors, coins, bubbles, foam and white glints were excluded before fitting;
   missing regions were smoothly inferred. It contains no reference RGB picture or video.
4. Cyan/magenta shading values are calibrated through the existing exposure, Neutral tone mapper, sRGB
   conversion and color-grade settings. White glints remain separate geometry.

## Current evidence and limitations

`iteration03/capture.json` records a successful real WebGL capture, the complete source hashes, fixed camera
and game state, no game/shader errors, 87 draw calls and 575,879 triangles. The unchanged pre-existing browser
favicon 404 is reported separately. TypeScript compilation passes. This is not an Android FPS measurement.

`measure-iteration03.json` compares the same 17 supported ribbon samples against the previous rejected study:
mean absolute center error changes from 24.74 to 9.76 pixels; median changes from 22.5 to 2.0 pixels.
Occluded, clipped and ambiguous samples are excluded explicitly. These are boundary measurements, not a
percentage aesthetic-fidelity score. Some individual errors still exceed 30 pixels.

The distant water/foam connection remains visibly unlike the reference. The scalar field is blurred in
places, and the magenta reflections need further work. This checkpoint fits a paused pose; complete natural
downstream advection, gameplay/continuity revalidation, and new Android/performance validation are pending.
Do not infer those from validation of earlier experiments.

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

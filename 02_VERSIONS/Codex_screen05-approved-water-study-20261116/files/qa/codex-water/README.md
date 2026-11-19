# Screen 05 — isolated live-water experiment

This is a review candidate, not a promotion of the approved art or the default game.
The playable Three.js water now has smoother layered cyan/blue reflections, richer magenta
bands, finite white glints, a narrower distant S-river, and softer shaded foam. It remains
live geometry and GLSL animation, with the recovered flow map and Marble environment reflection.

## Provenance and isolation

- Requested source: `claude/rainbow-3d-account-recovery-hfb8p0`, commit
  `088dd3fc77c0cf18f1e853ffb27a0945e27b1f0b`.
- Experiment: `codex/screen05-water-hfb8p0-20261116`.
- Also inspected the newer Claude branch `ccr-451ea8c7-3nqlis` at
  `d493cc360cf631d5bfa5adbbba3e08e91e67e1df`. Its later W12 (`silk05`/`puff05`)
  code and captures remain on that branch. The user repeated the earlier source explicitly,
  so this experiment uses that exact source and retains its W10/W11 switches.
  A later read-only check found Claude's own 14:37 autosave at
  `30d830a9ae0a80c87188e9d4971663aee0d3f8aa`; it was not fetched into or merged with this experiment.
- The initial inspection branch `codex/screen05-water-experiment-20261116` is only a
  snapshot of `d493cc3`; the actual experiment is the `hfb8p0` branch above.
- No merge, force push, bootstrap auto-merge, or write to either Claude branch was performed.
  Existing approved references, experiment evidence, models, Marble files, gameplay, camera,
  controls, coin logic, level definitions and Android project files are unchanged.
- The referenced `qa/pilot05/wave12/NOTES.md` is absent from the newer pinned commit.
  Its other W12 code, captures and metric files were inspected; missing notes were not invented.

## Try and reverse

```sh
npm ci
npm run dev
```

Open `/?liquid05=1&roundfoam05=1` for the combined candidate. Removing those switches restores
the default. `liquid05=1` is the water/river factor; `roundfoam05=1` independently changes foam
shading. Existing `water05`, `flow05`, `farw05`, `river05`, and tunnel switches remain available.

For the deterministic Screen 05 view, use `/?qa=1&dpr=1&liquid05=1&roundfoam05=1`, then
`window.__rainbow.goto('05')` in the console. Normal play uses the existing controls and transitions.

The same opt-in switches can be baked into a separate Android build:

```sh
VITE_RAINBOW_Q05='liquid05=1&roundfoam05=1' npm run android:debug
```

An unset `VITE_RAINBOW_Q05` keeps the default build. A debug APK was compiled and validated
outside the existing tracked APK: `/workspace/artifacts/rainbow-screen05-water-experiment.apk`.
It retains application ID `com.rainbow.washergame`; it was not installed on a device and is not
a side-by-side application package. See `tests/android-build.txt` and `tests/android-source-sha256.json`.

## Full-size comparison

All three files are separate **864 × 1536** PNGs. APPROVED is a byte-for-byte copy of the
repository's protected reference. CURRENT and IMPROVED are actual WebGL captures with the
same locked checkpoint (`s=132.438`), time (`12.0`), camera, viewport, DPR (`1`) and high quality.
The user's additional water-only image in the conversation guided the continuous ribbons,
large reflections and foam silhouettes; it is not a runtime water texture.

[APPROVED — original reference](APPROVED.png)

![APPROVED](APPROVED.png)

[CURRENT — source default](CURRENT.png)

![CURRENT](CURRENT.png)

[IMPROVED — opt-in review candidate](IMPROVED.png)

![IMPROVED](IMPROVED.png)

## Exact changes and remaining differences

| Area | Current source | Experiment | Remaining gap to APPROVED |
|---|---|---|---|
| Liquid body | Dense comb lines and small star grids; lighter, busy cyan | Smooth analytic reflection layers over deeper electric blue/cyan; quieter recovered ripple layer | Reflections are still more regular and graphic than the illustration |
| Magenta | Bright, comparatively flat ribbons with many fine streaks | Richer magenta/violet body with broad flowing sheen and a shared cyan/pink reflection field | Near wake ribbons remain straighter than the illustrated curls |
| White glints | Many tiny stars and streaks | Finite tapered highlights; distinct curved foreground crest glints | Highlight shapes and placement are not an exact art match |
| Motion | Several dense scrolling patterns | Three smooth downstream layers; two-phase flow ripple; slow rider-relative wake swells | Temporal tests cover sampled frames, not every possible view/device |
| Distant river | Wide floor-like strip and visible join | Reuses the recovered W11 narrow S-channel; bridges actual near height, arc distance, normals and wave motion; narrows the far foam support rim | Forced perspective remains stylized; near-only ripple/Marble lighting and band wobble can still cause a subtle shading difference |
| Foam | Dense blue pores and small bright specks | Same existing sphere impostors, depth intersections and instance pools, with clean white caps and broad cool undersides; coarser shaded far mounds | Distant foam is surface-shaded, and near clusters remain more regular than the reference |
| Preserved scene | Existing Benny, coins, HUD, tunnel, controls, camera and gameplay | Unchanged code/assets for these systems | Their existing differences from the illustration remain visible |

The first simplified material was rejected as too flat; the second still had blurry foreground
highlights. Subsequent revisions restored layered foreground swells, corrected the oblique seam
and removed a broad far foam support strip. Review also caught and fixed signed-base GLSL `pow`
(undefined on some GPUs) and overly fast near-wave advection that could alias on mobile.
Intermediate captures are retained in `iteration01`, `iteration02`, `iteration03` and `final-rim`.

`visual-indicators.md` contains the existing repository tool's crude colour-class indicators for
all three images. They are not a fidelity score. For example, mid-band cyan-class pixels change
from 38.7% to 24.0% (reference 23.3%), while the far-band colour/swing indicators still differ
substantially. Colour classification mixes hue, lighting and area; it does not measure geometry alone.

## Validation

- Default Screen 05: **0 changed pixels**, maximum channel difference **0** against CURRENT.
  Evidence: `tests/default-preservation.json`.
- Default far geometry: all original/current attribute, index and morph buffers have identical
  SHA-256 hashes. Evidence: `tests/default-geometry.json`.
- Nine final renders: high/low Screen 05 and adjacent-stage comparisons, no shader or game-asset
  failures. Evidence: `tests/render-review.json`. Screen 04 sees the changed Screen 05 water through
  its exit and associated bloom; its foreground below y=425 differs by at most one 8-bit level.
  Screens 06 and 07 each differ by two pixels at one level. See `tests/scope-regression.json`.
- Real keyboard, pointer press/drag, HUD/keyboard pause/resume, replay, bank alignment, bridge
  positions, bounded foam supports, layout continuity and Screen 05→06 travel: **13 checks pass**.
  `tests/final/report.json` preserves the original run, including its initially unclassified
  `/favicon.ico` 404. This is the pre-existing missing favicon, not a game asset or shader failure.
- The final wake-speed correction changed only `waterRibbon.ts`. The targeted final motion rerun
  passes, with seven real renders and no game errors: `tests/final-motion/report.json`.
  The known favicon 404 is explicitly retained as a non-game warning.
- Analytic seam position error ≤0.000008 world units. Against the actual differently tessellated
  near mesh, sampled residual is ≤0.025 high / ≤0.048 low, not mathematically zero. The surface
  bridge adds **no vertices or triangles** and keeps the opening morph. The numerical check
  covers 17 body vertices at five animation times (85 samples per quality) and 55 exterior
  support samples; all pass. Evidence: `tests/seam-numeric.json`.
- Route continuity suite passes all stage boundaries and the large 07→08 descent; evidence in
  `tests/continuity_report.json` and `tests/continuity_stdout.txt`.
- Full gameplay route, both default and experiment: **8/8 checks pass, no page errors**.
  All checks and all **71 simulation samples are identical** across the two runs. Both collect
  **91 coins**, complete victory, lose hearts on a wall collision, and descend **61.41 units in
  6.58 seconds** from the 07 plunge top to the 08 inlet. Evidence: `tests/gameplay-equivalence.json`
  and the two `tests/gameplay-*.json` reports.
- Protected references: **12/12 hashes pass**. Marble: **49 files checked, 15 real binary assets,
  both worlds complete**. Existing LFS integrity passes. No new Marble generation or credits used.
- Android: opt-in production build, Capacitor sync, Gradle `assembleDebug`, bundled switch check,
  and debug APK signature verification pass. Existing Android sources and APK are unchanged.
  **Physical Android gameplay, GPU frame rate, temperature and battery use remain untested.**

### Measured rendering cost

The synchronized WebGL benchmark used Chromium/SwiftShader (CPU rendering), 864 × 1536,
two runs of 14 measured frames per variant. These are **milliseconds per frame on this software
renderer, not Android FPS**. Each cell below is a run's median; both runs are shown because
the benchmark's summary selects the faster run and would hide the variation.

| Quality | Current, run 1 / run 2 | Improved, run 1 / run 2 | Draw calls | Triangles |
|---|---:|---:|---:|---:|
| High | 4735.0 / 4592.3 ms | 4398.6 / 5392.4 ms | 86 → 86 | 567,415 → 567,415 |
| Low | 3636.1 / 3837.3 ms | 3666.9 / 3587.5 ms | 86 → 86 | 425,525 → 425,525 |

High-quality relative time ranged from **7.1% lower to 17.4% higher**; low quality ranged
from **6.5% lower to 0.8% higher**. These measurements do not establish a consistent speed
improvement or Android performance parity. Texture count increases **43 → 45** for the
recovered flow textures; geometry counts remain 102 high / 101 low. The bridge adds roughly
98 KiB of vertex attributes, with no extra render pass. The initial current run counted one
console error without preserving its message; the runner overwrote that detail on the second
run, so its cause cannot be confirmed from this benchmark. The repeat and all improved runs
recorded no errors; the separate render and motion reports preserve their error details. Raw results:
`tests/performance.json` and `tests/performance-stdout.txt`.

## Reproduce the checks

Use the project's installed Playwright. The optional preload selects
`CHROMIUM_EXECUTABLE_PATH` or `/usr/bin/chromium` instead of downloading a browser.

```sh
npm run build
npm run verify:refs
npx vite-node scripts/liquid05-seam.ts
node --import ./scripts/use-installed-chromium.mjs scripts/liquid05-review.mjs
node scripts/liquid05-check.mjs --q='liquid05=1&roundfoam05=1' --label=review
node --import ./scripts/use-installed-chromium.mjs scripts/gameplay-test.mjs \
  --q='liquid05=1&roundfoam05=1' --out=qa/codex-water/tests/gameplay-improved.json
node --import ./scripts/use-installed-chromium.mjs scripts/perf05.mjs \
  qa/codex-water/tests/performance.json --size=864x1536 \
  current= improved='liquid05=1&roundfoam05=1' \
  current_low=quality=low improved_low='liquid05=1&roundfoam05=1&quality=low'
```

New review tools write only under `qa/codex-water`. Existing capture/continuity scripts also write
historical report paths; this session saved their new evidence here and restored those historical files.
Renderer timing must come from the synchronized performance test, not the QA API's displayed FPS counter.

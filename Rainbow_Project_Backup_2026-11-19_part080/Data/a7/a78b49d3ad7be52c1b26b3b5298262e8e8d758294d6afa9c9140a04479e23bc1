# Screen 05 — approved-water reference study

This is a separate opt-in study of the approved water, built on the earlier isolated experiment
at `4abf5483949de3893ee4d96d0c1f6e0ff9e86a89`. The original source remains
`claude/rainbow-3d-account-recovery-hfb8p0` at `088dd3fc77c0cf18f1e853ffb27a0945e27b1f0b`.
Work is saved on `codex/screen05-approved-water-study-20261116`; neither Claude branch is a push
or merge target. The preceding `liquid05` experiment remains available unchanged.

The user's approved **water-only** image guides the cyan/magenta palette, S-ribbons, silky
reflections, white glints and rounded foam boundaries. The approved full Screen 05 establishes
their placement inside the existing tunnel. The current playable image is the before reference.
The water-only attachment was inspected in the conversation; it is not installed as a game
texture. All new water is live Three.js mesh/shader rendering.

Capture receipts record the base Git commit plus source hashes, including uncommitted changes
at capture time. Use those hashes to identify the tested source revision. The final receipts
all match the final source; see `tests/final-source-provenance.json`.

## Review the paused frame

The full-size comparison uses the protected reference and a real WebGL capture at the same
864 × 1536 viewport. The new frame uses the existing camera, checkpoint `s=132.438`, animation
time 12 and DPR 1, with the simulation frozen. No compositing, image-generation replacement,
video texture or reference-image projection is used.

[APPROVED — protected original](APPROVED.png)

![APPROVED](APPROVED.png)

[NEW — paused playable 3D capture](NEW.png)

![NEW](NEW.png)

## Try and reverse

```sh
npm ci
npm run dev
```

Open `/?reference05=1`. Remove the switch to restore the default. The previous experiment
remains available with `/?liquid05=1&roundfoam05=1`.

For the review pose, open `/?qa=1&dpr=1&reference05=1` and call
`window.__rainbow.goto('05', 12)`. Normal play keeps the existing steering, pause, replay,
coin collection and level transitions. Water reflection features advect toward decreasing
course distance, toward the ride camera; band outlines remain anchored to the river.

For an opt-in Android debug build:

```sh
VITE_RAINBOW_Q05=reference05=1 npm run android:debug
```

The validated debug APK is saved separately at
`/workspace/artifacts/rainbow-approved-water-study.apk` (7,627,278 bytes), SHA-256
`e350d7c0018c014ba5c26264f78e9175421e8013dae3f7917d187a5632d5ebf0`.
It keeps the existing application ID `com.rainbow.washergame`, so it is not a side-by-side
package. It was compiled and signature-checked, not installed on a physical device.

## What changed

- Continuous cyan/blue reflection sheets and richer magenta shading replace the dense fine
  streak patterns. Reflection spacing varies smoothly along the flow.
- White reflections have finite tapered tips and soft shoulders. Foreground glints are short,
  broken and asymmetrically placed rather than one long bar on each transverse crest.
- Curved, tapered magenta wake ribbons carry their own flow-aligned reflections. Fewer,
  shorter curved splash trails replace the dense white wire fan.
- Foam sphere impostors retain their depth intersections, with white upper caps, lavender
  undersides and restrained surface detail. Banks follow the corrected distant surface.
- The far channel has a smooth entry with matched tangents and a narrower neck. Numerical
  inspection also exposed the existing wide near ribbon overlapping itself in the distance;
  a reference-only upright target frame removes those overlapping layers in the sampled views.
  It eases in 10–22 units ahead of Benny and across course distance 148–195, restoring the exact
  existing surface around and behind him. The far mesh and foam use the same correction.

The paused image was reviewed before the motion/route validation. Iteration 01 was too flat
and had long white bars; iteration 02 made some highlights too solid. Their captures and the
subsequent softer version are retained in separate folders. Iteration 01 records a source change
during capture and is exploratory evidence, not the final validated render.

## Validation and remaining differences

The new frame is a review candidate, **not an exact reproduction of the approved illustration**.
Its reflection pattern remains more regular, the foreground wake has less fine liquid detail,
and the distant foam shelf and reflection scale still make the far section distinguishable.
The existing character, coins, tunnel and camera retain their existing differences from the
illustration. `tests/visual-indicators.md` reports crude colour classes, not an image-similarity
score or evidence of an exact match.

- Full-size final capture: `final/capture.json`, no shader or game resource failures; the existing
  missing favicon is recorded separately. Source fingerprints and the fixed camera are included.
- Default and preceding `liquid05=1&roundfoam05=1` experiment: **zero changed pixels** in both
  full-size comparisons. Evidence: `tests/preservation.json`, `default-preserved/capture.json`
  and `previous-preserved/capture.json`.
- Complete gameplay: **8/8 checks pass** for default and reference modes, with all **71 simulation
  samples identical**. Both collect **91 coins**, complete victory, preserve pause and wall
  collisions, and descend **61.41 units in 6.58 seconds** through the 07→08 plunge.
  Evidence: `tests/gameplay-equivalence.json` and both `tests/gameplay-*.json` reports.
- Seam geometry: **340 animated samples** across four rider positions and five times have
  analytic error below **0.000006 world units**. Against the actual differently tessellated
  near mesh, the maximum residual is **0.010575 high / 0.023712 low**. This does not imply
  mathematically zero rasterized or shading error. Evidence: `tests/seam-numeric.json`.
- Rider contact: **15,162 full-width samples** show **zero visual correction** through 10 units
  ahead of the rider and everywhere behind. Four rays through the previously folded section
  go from three water layers to one. These are sampled checks, not a proof for every viewpoint.
- Real keyboard/pointer steering, HUD/keyboard pause, replay, animated water, 05→06 travel and
  low-quality rendering pass. The first inspection run exposed a test-hook issue and an invalid
  equality between route position and the projected body position; its original report is kept
  in `tests/final/report.json`. The first focused retry also mistook a foam target attribute for
  a water attribute; that diagnostic is preserved in `tests/geometry-final/report.json`.
  The corrected live inspection passes **9/9 checks** in `tests/geometry-final2/report.json`:
  both actual water meshes share the correct focus uniform, body-projection error is zero,
  and all **6,342 local vertices** have zero correction weight. No production change was needed
  for these inspection-harness fixes.
  Water-coloured pixels change by a mean **25.43/255** over 0.6 seconds; the two sampled
  1/60-second changes are **4.20** and **2.93/255**. This establishes animation and bounded
  sampled changes, not motion direction by itself. The time-stamped captures and shader's
  shared positive phase advection support the toward-camera direction review.
- Protected references: **12/12 hashes pass**. Marble integrity: **49 files and 15 real LFS
  binaries checked**, both existing worlds complete. LFS integrity passes; no new Marble job ran.
- The opt-in Android APK compiles, packages and passes debug-signature verification. Existing
  tracked Android files and APK are preserved. **Physical Android gameplay, GPU frame rate,
  temperature and battery use remain untested.**

### Rendering cost

The synchronized Chromium/SwiftShader benchmark used a **360 × 640** viewport, two warm-up
frames and eight measured frames per run. The second round reversed variant order. These are
CPU-renderer timings, not Android FPS or a device-performance guarantee.

| Run median | Default | Reference study | Difference |
|---|---:|---:|---:|
| Round 1 | 1328.20 ms | 1457.40 ms | +9.7% |
| Round 2 | 1462.55 ms | 1393.85 ms | −4.7% |

Both rounds and all raw samples are retained; no fastest-run selection is used. The variation
does not establish a consistent speed improvement or regression on this host. Both variants
use **86 draw calls**. The study reduces the high-quality triangle count from **567,415 to
566,647**, adds the two recovered flow textures (**43 → 45**) and one foam target geometry
(**102 → 103**), plus the vertex attributes for the reference surface. There is no new render
pass. Near/far attribute usage stays within WebGL2's guaranteed 16 slots. All four runs rendered
without game errors or source changes; the known missing favicon is preserved as a warning.
Evidence: `tests/performance/performance.json` and `tests/performance-stdout.txt`.

## Reproduce

The dedicated tools write only under `qa/approved-water-study` and require fresh output labels.

```sh
npm run build
npm run verify:refs
npx vite-node scripts/reference05-seam.ts
node scripts/reference05-review.mjs --out=qa/approved-water-study/review \
  --q=reference05=1 --size=864x1536 --stage=05 --time=12
node scripts/reference05-check.mjs --q=reference05=1 --label=review
node scripts/reference05-perf.mjs --q=reference05=1 --label=review-performance
```

Performance evidence uses synchronized WebGL work, not the QA overlay's FPS counter. The
software-renderer measurements are not Android frame-rate measurements.

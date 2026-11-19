# Reproduce the Screen 06 proof

Use a separate full checkout of **codex/s06-world-space-rinse-arch**, with Git LFS hydrated. Start at game source commit **a1c1f0c7e35239c9f7065a56f19b79264313994c** or the evidence commit containing this document. Claudia’s Screen 06 base is **c649fcbc35780e11cefce83eb54684f1d55752a5**.

## Open the existing playable game

Run these commands at the checkout root using the versions recorded in the project lockfile.

```sh
npm ci
npm run verify:refs
npm run typecheck
npm run test:continuity
npm run build
npm run dev -- --host 127.0.0.1 --port 8397
```

Keep the server running. The capture fixture uses the saved Screen 06 render settings in **queries.json**, and adds **cx06RinseWorld=1** for the experimental variant. The fixture supplies the deterministic game clock and the real game’s simulation controls. Its Chromium executable defaults to **/usr/bin/chromium**. Set **RAINBOW_CHROMIUM** if installed elsewhere.

In a second shell change directory to **experiments/codex/s06-world-space-rinse-arch/reproduce**. The **playwright** Node package must be resolvable for capture, and **pixelmatch** for image measurement. Use the preserved motion toolchain pins. FFmpeg and FFprobe with H.264 support, Python, Pillow and NumPy are used to encode and decode the comparison. Point **NODE_PATH** to the local tested Node packages when needed. Run in a disposable copy to keep generated capture files apart from the saved evidence.

```sh
export RAINBOW_BASE_URL=http://127.0.0.1:8397
node capture.cjs stills 06:BEFORE 06:NEW
node capture.cjs ride 06:BEFORE 06:NEW
node capture.cjs repeat 06:BEFORE
node capture.cjs full-safe 06:NEW
python validate-structure-captures.py ../APPROVED.jpg proof/06/BEFORE proof/06/NEW proof/06/BEFORE/opening-repeat.png compare-opening.py ../checks/baseline.json motion-regenerated.json
python compare-swims.py proof/06/BEFORE/ride.mp4 proof/06/NEW/ride.mp4 proof/06/NEW/route.json film-regenerated.json
```

The opening hash and a repeated retained run guard against comparing different input scenes. A structural experiment can legitimately change pixels. A changed opening and the full moving-view judgment must be evaluated against the artwork before recommending anything to the owner.

## Recover the modeled world and fitting study

**editable/Screen06_Rinse_Arch.blend** contains the complete experimental geometry, authoring guides, packed source swatches, a calibrated camera and editor preview lights. Three.js renders the shipped GLB at **assets/reconstruction06/rinse_arch.glb**. The score and motion captures come from Three.js.

**editable/Crest_Fit_Study.blend** is a second, partial geometry study. Its 140 pictured cross-sections, retained centreline and steering guides can be inspected together. Nothing in this file is imported by the live game. Original camera projection, saved coin depths and clipped edges are described in **editable/visible-crest-fit.json**.

From the checkout root, use a private scratch directory for modeling outputs. These commands use the project’s existing inputs, SciPy, NumPy, Pillow and the pinned Blender 5.3.0 executable.

```sh
study=experiments/codex/s06-world-space-rinse-arch
assets=assets/textures/match06
scratch_dir=$(mktemp -d)
node tools/reconstruction06/sample-course.mjs "$scratch_dir/course.json"
python tools/reconstruction06/fit-water.py "$scratch_dir/course.json" "$assets" "$scratch_dir/fit.json"
python tools/reconstruction06/make-layout.py "$scratch_dir/course.json" "$scratch_dir/fit.json" "$assets/proj06.json" "$scratch_dir/layout.json"
blender -b -noaudio --factory-startup --disable-autoexec --python-exit-code 1 -P tools/reconstruction06/build-arch.py -- "$PWD" "$scratch_dir/layout.json" "$scratch_dir/geometry.blend" "$scratch_dir/rinse_arch.glb"
blender -b -noaudio --factory-startup --disable-autoexec --python-exit-code 1 -P tools/reconstruction06/material-preview.py -- "$PWD" "$scratch_dir/geometry.blend" "$scratch_dir/Screen06_Rinse_Arch.blend"
python tools/reconstruction06/check-landmarks.py "$scratch_dir/course.json" "$assets" "$study/APPROVED.jpg" "$study/CLAUDIA_BEFORE/opening.png" "$study/CODEX_NEW/opening.png" "$study/editable/saved-depth-06.npz" "$scratch_dir/calibration.json" "$scratch_dir/overlay.png"
python tools/reconstruction06/trace-crest-study.py "$assets/cam06_locked.json" "$scratch_dir/calibration.json" "$assets/mask06.png" "$scratch_dir/course.json" "$scratch_dir/visible-crest.json"
blender -b -noaudio --factory-startup --disable-autoexec --python-exit-code 1 -P tools/reconstruction06/build-crest-study.py -- "$scratch_dir/visible-crest.json" "$PWD/$study/APPROVED.jpg" "$scratch_dir/Crest_Fit_Study.blend"
python tools/reconstruction06/visible-water-clearance.py "$scratch_dir/course.json" "$assets/cam06_locked.json" "$assets/mask06.png" "$scratch_dir/visible-water-clearance.json"
```

The main mesh uses the retained full course. The partial study uses the visible crest only. File formats and mesh names can be checked by running **verify-models.py** in Blender with the editable world, partial study, runtime GLB, exact original artwork, landmark report and a new output report path as arguments after **--**. Blender can rewrite file metadata on save. Use the included SHA-256 inventory to verify the exact archived binaries.

## Gameplay and hardware

The recovered **fixture/06/gameplay-test.mjs** contains the unmodified project assertions. **full-safe** exercises a real complete run with pickups and collision feedback enabled. This proof used Playwright 1.57.0, Chromium 156.0.8078.79, Pixelmatch 7.1.0 and FFmpeg 7.1.5. See **checks/course-continuity.txt** for stage boundaries. The isolated debug APK uses **com.rainbow.washergame.crestproof**, target SDK 34. It opens the retained and reconstructed worlds from independent launcher choices. App signing and web assets were verified at build time. The current record contains zero connected Android devices.

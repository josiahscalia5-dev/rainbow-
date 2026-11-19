# Run the isolated Screen 06 experiment

The experiment is a branch of the existing private Rainbow game. Its parent is the arched-passage experiment at `94c36531af3cce486a252e56f75b81595536ad96`. Claudia’s retained version is `claude/rainbow-s06-match-c18` at `c649fcbc35780e11cefce83eb54684f1d55752a5`.

## Open the project on a workstation

Sign in to your GitHub account with access to the private project. Use Git LFS so the editable Blender model, exported models and gameplay recordings download as actual binaries. Clone to a fresh directory. The regular game reads its established configuration. The candidate is enabled only with its experimental query parameters.

```sh
git lfs install
git clone --single-branch --branch codex/s06-open-crest-channel https://github.com/josiahscalia5-dev/rainbow-.git rainbow-screen06-review
cd rainbow-screen06-review
git lfs pull
npm ci
npm run verify:refs
npm run typecheck
npm run test:continuity
npm run build
npx vite preview --host 127.0.0.1 --port 7906 --strictPort
```

The capture script selects the stored reference camera, steers Benny through the level and records the game renderer. The complete per-view state is in the `poses.json` files. The MP4s use a deterministic fixed-step run. They show scenery continuity. Android device frame pacing needs a separate hardware measurement.

## Reproduce the captures

Work in a second terminal from the project root. The ZIP includes the exact capture script, feature flags and camera queries under `reproduce/`. The branch stores these in `experiments/codex/s06-open-crest-channel/reproduce/`. This run used Node 24.22.1, Playwright 1.62.1, Debian Chromium 156.0.8078.79 with SwiftShader, and FFmpeg 7.1.5 for H.264. Set `RAINBOW_CHROMIUM` if your Chromium binary is elsewhere.

```sh
capture_dir=$(mktemp -d)
cp experiments/codex/s06-open-crest-channel/reproduce/{capture.cjs,queries.json,flags.json} "$capture_dir/"
cd "$capture_dir"
npm install --no-save playwright@1.62.1
export RAINBOW_BASE_URL=http://127.0.0.1:7906
export RAINBOW_CHROMIUM=/usr/bin/chromium
node capture.cjs stills 06:BEFORE 06:NEW
node capture.cjs ride 06:BEFORE 06:NEW
node capture.cjs full-safe 06:BEFORE 06:NEW
```

Use a fresh capture directory to keep the published evidence intact. The results appear in `proof/06/BEFORE` and `proof/06/NEW`. The flag list and screen queries are recorded in the capture folder. The screenshot and movie fixture uses the retained stage with the experimental flags disabled for BEFORE. NEW enables the arched-passage parent and the isolated crest experiment.

For the optional opaque-surface diagnostic, copy `reproduce/flat-final.cjs` beside `capture.cjs`, install `playwright@1.62.1 pngjs@7.0.0 three@0.170.0` in the scratch directory, then run `node flat-final.cjs NEW surface-check`. It writes color-coded views to `analysis/surface-check/NEW/` for inspecting which meshes cover the water opening. The packaged helper resolves local paths on your workstation. Its numerics, poses and rendering logic are identical to `diagnostics/frozen-assay-source.cjs`.

## Verify the Android download

On your phone, open the private GitHub ZIP page while signed in and tap **Download raw file**. Extract the ZIP, read `README_FIRST.md`, then open the individual full-resolution images or H.264 rides. `APPROVED/SCREEN06_APPROVED.jpg` contains the exact original bytes from the repository’s `references/06_crest_the_rinse_arch.png`. The source file encodes a JPEG despite its suffix. On a workstation, compare the extracted file hashes and sizes with `SHA256.json`.

The ZIP contains the review evidence and the experiment’s source overlay. The branch preserves the complete inherited game tree and is the simplest way to run the experiment. Other levels and the Google Flow workflow continue from their existing project branches.

# Reproduce the playable Screen 06 candidate

Check out the commit recorded in **checks/source.json** in a disposable directory and fetch its Git LFS files. Install the dependencies from the existing package lock with `npm ci`. The runtime asset is **assets/arched-passage06/passage.glb**. All painted inputs and the completed editable Blender file ship with this branch. Use the retained query in **queries.json**. Add only **cx06ArchedPassage=1** to select the trial.

To regenerate the edit, use Blender 5.3.0. Retrieve the earlier editable donor **experiments/codex/s06-world-space-rinse-arch/editable/Screen06_Rinse_Arch.blend** from commit **d51ea1e8d3d676c1c7d6d4f9fa16096fd5413714** in a separate checkout. The retained project provides the shared Three.js-to-Blender axes helper. The layout and editable result are in this evidence folder.

```sh
proof=experiments/codex/s06-arched-washer-passage
python tools/blender/arched-passage06/isolate_slot.py assets/arched-passage06/panel.png assets/arched-passage06/slot.png
blender -b --python-exit-code 1 --python tools/blender/arched-passage06/build_passage.py -- "$PWD" "$DONOR_BLEND" "$proof/editable/world-layout.json" "$proof/editable/Screen06_Arched_Washer_Passage.blend" assets/arched-passage06/passage.glb
npm run build
npm run test:continuity
npm run verify:refs
```

For native stills and uninterrupted films, serve the real game with the project’s Vite dev server on loopback. Copy **reproduce** into a writable capture directory and set **RAINBOW_RUN** to that directory. Set **RAINBOW_BASE_URL** to the server, **RAINBOW_CHROMIUM** to a Chromium executable and **NODE_PATH** to the installed Playwright 1.57.0 and Pixelmatch 7.1.0 directories. The harness includes the retained gameplay suite as a fixture. Run `node capture.cjs stills 06:BEFORE 06:NEW`, then `node capture.cjs ride 06:BEFORE 06:NEW` and `node capture.cjs full-safe 06:NEW`. The movie encoder requires FFmpeg with libx264. The validation script checks CPU state, camera, input, clock, H.264 decoding and reference bytes.

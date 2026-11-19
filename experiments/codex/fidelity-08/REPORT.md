# Screen 08 Final Spin Chamber

CANDIDATE for owner review.

More cyan water is visible beside Benny on hard left and hard right. The left magenta bank keeps its curved path and a lower, narrower shoulder. On the native bottom quarter, the earlier curved candidate had 228,997 magenta pixels on hard left and 101,576 on hard right. The fitted version has 189,565 and 84,916. The approved artwork supplies no exact pixel count for these two views.

The retained chamber floor carried the river on a plane. This trial uses its existing mesh to raise a low, irregular shoulder along the fitted left bank. The center of the water stays at its established height. The quilted near-water material now switches in according to the least-resolved texture direction and shifts the painted magenta edge 0.46 game units outward. The door, platform, towel, ring and four spouts use their existing geometry and transforms.

At +3 the long cyan highlights are still visible. Later views can show repeated glints from the saved water tile. The opening has identical mean-RGB tolerance agreement with the artwork and one Pixelmatch difference between Claudia and the trial. A mesh comparison found changes only in the chamber floor among 22 named meshes. The new shoulder peaks at about 0.106 game units above its previous height. Its unseen shape is an interpretation awaiting review.

This isolated test follows the renewed instruction to improve all five worlds. The round-17 retained and earlier curved-current commits both remain available. Interpret the early foreground and hard-left contact as proposed moving views.

## Opening comparison

The original artwork and both gameplay openings are separate full-size images at 864 × 1536. The whole-frame measure counts a pixel as agreeing when its mean absolute RGB channel error is at most 20 on a 0–255 scale. Claudia’s opening scored 84.0857% and this experiment scored 84.0857%. Pixelmatch 7.1.0 at threshold 0.1, excluding antialias-only differences, counted 197,021 and 197,011 differing pixels. These measures describe this particular opening. The approved image supplies no pixel target for turning or descending.

The fresh control reproduced the archived retained opening exactly. Comparing the candidate with Claudia’s opening gives 72,174 pixels with any channel difference across 1,327,104 pixels. See measurements/opening-metrics.json for both tolerance tests.

## Matched swimming evidence

APPROVED.jpg contains the unchanged source bytes. CLAUDIA_BEFORE and CODEX_NEW each contain separate native screenshots and one H.264 entrance-to-exit ride. The 22 recorded frames and all 14 still poses match on camera, course distance, steering, counters and fixed simulation clock. The videos render at 648 × 1152 and 12 frames per second, with five 60 Hz simulation steps between recorded frames. The same finish and five hearts are visible in both runs. Real-time motion between the recorded frames is not sampled.

Under reproduce, capture.cjs uses the existing Three.js renderer and gameplay step API. From an isolated checkout run the usual Vite development server. Set RAINBOW_BASE_URL to that loopback address. With Playwright 1.57, Chromium and FFmpeg on the path, run the following with the evidence directory as the current directory.

```sh
node reproduce/capture.cjs stills 08:BEFORE 08:NEW
node reproduce/capture.cjs repeat 08:BEFORE
node reproduce/capture.cjs ride 08:BEFORE 08:NEW
node reproduce/capture.cjs full-safe 08:NEW
```

The clip follows the chamber from its inlet, past the fixed spouts and platform, through the final handoff. Use measurements/clip-timestamps.json to find the foreground and platform poses by distance. The +20 pose falls outside this stage.

Each route log gives the precise video time and course position for every frame. The still logs record full camera matrices. Hard steering stills stress individual viewpoints. The safe full-ride regression uses a different steering trace.

## Game and recovery

All 8 gameplay checks passed. A complete successful ride collected 91 coins, advanced from 1,330 to 2,240, finished in Stage 11 with 5 hearts and recorded zero collisions. The collision assertion deliberately tests a wall bump in a separate run. TypeScript checks and the production Vite build passed. The cloud renderer verifies appearance and gameplay behavior. Sustained frame time and thermal behavior on a physical Android device are pending.

Claudia’s checkpoint is claude/rainbow-s08-scenery-c17 at 3c0fa97090afb2c0fca41898774db7247e23e522. The tested source is codex/s08-fitted-foreground-water at ad66a3a3eda766347669a086d35aa22aa13a7093. It starts from 19970fa9de964db8836814a57c773a0f45ffde29. Every experiment remains opt-in. To restore the retained view use its existing saved query without the additional Codex switches. No promotion was performed.

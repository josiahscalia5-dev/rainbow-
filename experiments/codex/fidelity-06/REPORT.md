# Screen 06 Crest the Rinse Arch

CANDIDATE for the owner’s review.

Benny’s lower pink body is easier to see on both hard turns. The smaller inner lobes and the uneven outer shoulder leave space around him. Each heap stays anchored to the crest.

At the same 432 × 768 camera pose, the clusters obscured 976 silhouette pixels on the hard left and 2,706 on the hard right. The reshaped clusters obscured 78 and 459 respectively. The unobscured silhouettes contained 19,462 and 21,751 pixels. The test rendered each pose with Benny and the two cluster passes independently visible or hidden. A pixel counted as visibly changed when the sum of absolute RGB differences exceeded 30.

The pale cone below Benny just after crest release remained when the foam clusters and splash were hidden. Disabling the floor projection removed it. The long cyan highlights are still visible in the descent. A follow-up should separate painted whitewater from the underlying water material and reproject approved ripple detail at a physical scale.

The retained meshes contain 25 rings with their centers on a straight line. The earlier curved candidate turns the ring-center path by up to 37.8 degrees and preserves about 12.87 units of center spacing. All 108 sampled floor centers inside this stage coincide with the playable course center to the precision recorded. In the separate compatibility capture, the tube, rings and floor have identical vertex and index hashes with the curved candidate alone and with both options enabled. The saved curved branch remains at its original commit.

Review the hard-right and arch-exit frames as proposed views of the banks and hidden bend. The artwork establishes the off-center tunnel and rounded foam. The bank clearance farther along the swim and the bend beyond the crest are interpretations awaiting review.

## Opening comparison

The original artwork and both gameplay openings are separate full-size images at 864 × 1536. The whole-frame measure counts a pixel as agreeing when its mean absolute RGB channel error is at most 20 on a 0–255 scale. Claudia’s opening scored 79.0857% and this experiment scored 79.0857%. Pixelmatch 7.1.0 at threshold 0.1, excluding antialias-only differences, counted 262,246 and 262,246 differing pixels. These measures describe this particular opening. The approved image supplies no pixel target for turning or descending.

The fresh control reproduced the archived retained opening exactly. Comparing the candidate with Claudia’s opening gives 0 pixels with any channel difference across 1,327,104 pixels. See measurements/opening-metrics.json for both tolerance tests.

## Matched swimming evidence

APPROVED.jpg contains the unchanged source bytes. CLAUDIA_BEFORE and CODEX_NEW each contain separate native screenshots and one H.264 entrance-to-exit ride. The 63 recorded frames and all 14 still poses match on camera, course distance, steering, counters and fixed simulation clock. The videos render at 648 × 1152 and 12 frames per second, with five 60 Hz simulation steps between recorded frames. The same finish and five hearts are visible in both runs. Real-time motion between the recorded frames is not sampled.

Under reproduce, capture.cjs uses the existing Three.js renderer and gameplay step API. From an isolated checkout run the usual Vite development server. Set RAINBOW_BASE_URL to that loopback address. With Playwright 1.57, Chromium and FFmpeg on the path, run the following with the evidence directory as the current directory.

```sh
node reproduce/capture.cjs stills 06:BEFORE 06:NEW
node reproduce/capture.cjs repeat 06:BEFORE
node reproduce/capture.cjs ride 06:BEFORE 06:NEW
node reproduce/capture.cjs full-safe 06:NEW
```

In the continuous footage, compare the pale crest patch at 1.0 seconds, the bend near 2.0 seconds and the arch exit at 4.0 seconds. The dedicated hard-left and hard-right images hold the same distance with maximum steering.

Each route log gives the precise video time and course position for every frame. The still logs record full camera matrices. Hard steering stills stress individual viewpoints. The safe full-ride regression uses a different steering trace.

## Game and recovery

All 8 gameplay checks passed. A complete successful ride collected 91 coins, advanced from 1,330 to 2,240, finished in Stage 11 with 5 hearts and recorded zero collisions. The collision assertion deliberately tests a wall bump in a separate run. TypeScript checks and the production Vite build passed. The cloud renderer verifies appearance and gameplay behavior. Sustained frame time and thermal behavior on a physical Android device are pending.

Claudia’s checkpoint is claude/rainbow-s06-match-c17 at c649fcbc35780e11cefce83eb54684f1d55752a5. The tested source is codex/s06-crest-foam-clearance at e0e3ed187fe4596bd351a5e4cb4d62d796e92250. It starts from c649fcbc35780e11cefce83eb54684f1d55752a5. Every experiment remains opt-in. To restore the retained view use its existing saved query without the additional Codex switches. No promotion was performed.

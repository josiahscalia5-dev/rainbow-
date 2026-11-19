# Screen 05 Flow into the Current

REJECTED as the final-bend correction. Keep Claudia’s retained water and the earlier wall candidate.

The water gains fine definition at both hard turns. The original long highlights still spread across the frame, and the newly visible dark cross-ripples repeat across the left bend. This pass does not earn promotion.

At the final hard-left bend, hiding the near water changed 107,206 pixels in the lower 336 diagnostic rows. Hiding the far water changed 0. On the final hard-right, the counts were 94,086 and 17,112. Both layers contribute later, while the early foreground streaks belong to the near river.

The saved projection layout carries the broad pink and cyan flow. The shader samples the approved fine ripple patch with the actual arc length along the mesh and the lateral distance in game units. It uses the source patch’s recorded scale of 2.8 game units per longitudinal tile. The correction fades through the existing join and at the exit. It preserves the wall-perforation candidate and the existing band layout.

Fit the large painted highlight lobes to the S-shaped surface itself and measure their length before testing another pass. The final right bend exposes both near and far water, so their physical highlight widths and direction must agree across the join.

## Opening comparison

The original artwork and both gameplay openings are separate full-size images at 864 × 1536. The whole-frame measure counts a pixel as agreeing when its mean absolute RGB channel error is at most 20 on a 0–255 scale. Claudia’s opening scored 89.4424% and this experiment scored 89.4423%. Pixelmatch 7.1.0 at threshold 0.1, excluding antialias-only differences, counted 119,454 and 119,456 differing pixels. These measures describe this particular opening. The approved image supplies no pixel target for turning or descending.

The fresh control reproduced the archived retained opening exactly. Comparing the candidate with Claudia’s opening gives 1,074 pixels with any channel difference across 1,327,104 pixels. See measurements/opening-metrics.json for both tolerance tests.

## Matched swimming evidence

APPROVED.jpg contains the unchanged source bytes. CLAUDIA_BEFORE and CODEX_NEW each contain separate native screenshots and one H.264 entrance-to-exit ride. The 84 recorded frames and all 14 still poses match on camera, course distance, steering, counters and fixed simulation clock. The videos render at 648 × 1152 and 12 frames per second, with five 60 Hz simulation steps between recorded frames. The same finish and five hearts are visible in both runs. Real-time motion between the recorded frames is not sampled.

Under reproduce, capture.cjs uses the existing Three.js renderer and gameplay step API. From an isolated checkout run the usual Vite development server. Set RAINBOW_BASE_URL to that loopback address. With Playwright 1.57, Chromium and FFmpeg on the path, run the following with the evidence directory as the current directory.

```sh
node reproduce/capture.cjs stills 05:BEFORE 05:NEW
node reproduce/capture.cjs repeat 05:BEFORE
node reproduce/capture.cjs ride 05:BEFORE 05:NEW
node reproduce/capture.cjs full-safe 05:NEW
```

Inspect the final S from 5.42 to 6.67 seconds in the continuous footage, including the right bend near 6.42 seconds. The matching hard-turn stills isolate the river foreground.

Each route log gives the precise video time and course position for every frame. The still logs record full camera matrices. Hard steering stills stress individual viewpoints. The safe full-ride regression uses a different steering trace.

## Game and recovery

All 8 gameplay checks passed. A complete successful ride collected 91 coins, advanced from 1,330 to 2,240, finished in Stage 11 with 5 hearts and recorded zero collisions. The collision assertion deliberately tests a wall bump in a separate run. TypeScript checks and the production Vite build passed. The cloud renderer verifies appearance and gameplay behavior. Sustained frame time and thermal behavior on a physical Android device are pending.

Claudia’s checkpoint is claude/rainbow-s05-match-c17 at f033f7cc895752907621f82fb9d6bee4899ac0e0. The tested source is codex/s05-final-bend-river-uv at 4fa3e0fc4c400ef8c247460359e90fb169c53c07. It starts from 8729b96daeb2b73ff27a20b5435fb8eba923d4f2. Every experiment remains opt-in. To restore the retained view use its existing saved query without the additional Codex switches. No promotion was performed.

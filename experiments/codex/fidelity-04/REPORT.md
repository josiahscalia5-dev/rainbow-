# Screen 04 Through the Five Arrows

CANDIDATE for the owner’s review.

The fourth complete lip inside the washer has a fuller rolled edge. Its lower flanks pick up violet on the left and pink on the right as Benny approaches. The effect is local and is clearest at +20. Other distant bays still read as smooth copper.

The ring terminates 18.4 units inside the measured mouth. Only its existing profile and flank shading change. Its spacing remains 4.6 units, and the merged lathe keeps the same vertex and ring count. At +20 there are 30,219 pixels with summed RGB change above 50 compared with the earlier curved-water candidate. The positional test and visual review cover both turns and the handoff.

The experiment continues the saved Codex curved-water branch. The independent gold-ring specialist’s step 5 established small amber lip lights and identified missing pink-violet sheen. Its branch remains independent. The five arrows, entrance and curved watercourse use their existing geometry.

The +20 view is a proposal for how the next polished lip can reflect the water deeper inside the tunnel. The approved artwork shows those colors at the entrance. The strength of the reflection farther down remains an interpretation for the owner.

## Opening comparison

The original artwork and both gameplay openings are separate full-size images at 864 × 1536. The whole-frame measure counts a pixel as agreeing when its mean absolute RGB channel error is at most 20 on a 0–255 scale. Claudia’s opening scored 81.8399% and this experiment scored 81.8399%. Pixelmatch 7.1.0 at threshold 0.1, excluding antialias-only differences, counted 223,529 and 223,529 differing pixels. These measures describe this particular opening. The approved image supplies no pixel target for turning or descending.

The fresh control reproduced the archived retained opening exactly. Comparing the candidate with Claudia’s opening gives 1,283 pixels with any channel difference across 1,327,104 pixels. See measurements/opening-metrics.json for both tolerance tests.

## Matched swimming evidence

APPROVED.jpg contains the unchanged source bytes. CLAUDIA_BEFORE and CODEX_NEW each contain separate native screenshots and one H.264 entrance-to-exit ride. The 42 recorded frames and all 13 still poses match on camera, course distance, steering, counters and fixed simulation clock. The videos render at 648 × 1152 and 12 frames per second, with five 60 Hz simulation steps between recorded frames. The same finish and five hearts are visible in both runs. Real-time motion between the recorded frames is not sampled.

Under reproduce, capture.cjs uses the existing Three.js renderer and gameplay step API. From an isolated checkout run the usual Vite development server. Set RAINBOW_BASE_URL to that loopback address. With Playwright 1.57, Chromium and FFmpeg on the path, run the following with the evidence directory as the current directory.

```sh
node reproduce/capture.cjs stills 04:BEFORE 04:NEW
node reproduce/capture.cjs repeat 04:BEFORE
node reproduce/capture.cjs ride 04:BEFORE 04:NEW
node reproduce/capture.cjs full-safe 04:NEW
```

The fourth lip is clearest around 2.0 seconds in the continuous footage. Follow it towards the exit at 3.17 seconds. The separately held +20 frame has the matching course distance.

Each route log gives the precise video time and course position for every frame. The still logs record full camera matrices. Hard steering stills stress individual viewpoints. The safe full-ride regression uses a different steering trace.

## Game and recovery

All 8 gameplay checks passed. A complete successful ride collected 91 coins, advanced from 1,330 to 2,240, finished in Stage 11 with 5 hearts and recorded zero collisions. The collision assertion deliberately tests a wall bump in a separate run. TypeScript checks and the production Vite build passed. The cloud renderer verifies appearance and gameplay behavior. Sustained frame time and thermal behavior on a physical Android device are pending.

Claudia’s checkpoint is claude/rainbow-s04-match-c17 at ad5fbac592444e90fd1b53d62e7fa0b62391c032. The tested source is codex/s04-distant-ring-profile at 33e1b117205526e59b0f14735ae1b200b6dd3b5e. It starts from 13cf566586fb72be002a005bd84fe8cd50bad33f. Every experiment remains opt-in. To restore the retained view use its existing saved query without the additional Codex switches. No promotion was performed.

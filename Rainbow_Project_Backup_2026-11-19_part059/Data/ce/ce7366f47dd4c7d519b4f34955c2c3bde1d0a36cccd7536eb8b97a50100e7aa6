# Screen 07 Dive the Washer Tube

REJECTED as the full plunge correction. Claudia’s retained game is the baseline.

The lower bank exposes more cyan and magenta through the middle of the descent. At the bottom the large white shoulders still dominate. The test only reshapes the existing lather in Screen 07.

At two-thirds down, 4,937 of the 10,970 retained white lather pixels still appeared white in the candidate. At the plunge bottom 33,479 of 34,651 remained white. These are fixed-view layer masks at 432 × 768. White means every RGB channel exceeds 166 and their range is below 77. Only pixels whose white appearance disappeared with lather hidden counted. No motion similarity percentage is implied.

Disabling the whole foam group clears the large near-bank slabs at the bottom. Hiding the shared water ribbon removes the central river and exposes the foam beside it. Hiding the painted plunge floor removes the lengthened violet and cyan patterns close to the camera. These are separate rendering problems.

The saved bank-ownership views color the rendered continuous berm by its exact course position. Green belongs to Screen 07 and red lies beyond its exit at 390.16 units. Just before the transition the red area covers 42,390 classified pixels and green covers 10,592 below the HUD. At the plunge bottom the screen sees bank geometry up to about 435 units along the course. This explains why lowering only the Screen 07 banks leaves prominent white sides ahead.

Claudia’s separate Account 17 tracked patch contains unfinished changes to foam.ts, waterRibbon.ts and match07.ts. It was examined as recovery material. The opt-in test starts at the published specialist tip. Claudia’s improved near water and the earlier rejected Image2Blender bank stayed outside this change.

Before the next joint handoff experiment, review the plunge-bottom view and Claudia’s unpublished wall work. A physically continuous bank through the bend needs agreement on the incoming Screen 08 shoreline. Keep the paused chamber at its retained checkpoint in the meantime.

## Opening comparison

The original artwork and both gameplay openings are separate full-size images at 864 × 1536. The whole-frame measure counts a pixel as agreeing when its mean absolute RGB channel error is at most 20 on a 0–255 scale. Claudia’s opening scored 80.0458% and this experiment scored 80.0458%. Pixelmatch 7.1.0 at threshold 0.1, excluding antialias-only differences, counted 249,370 and 249,370 differing pixels. These measures describe this particular opening. The approved image supplies no pixel target for turning or descending.

The fresh control reproduced the archived retained opening exactly. Comparing the candidate with Claudia’s opening gives 0 pixels with any channel difference across 1,327,104 pixels. See measurements/opening-metrics.json for both tolerance tests.

## Matched swimming evidence

APPROVED.jpg contains the unchanged source bytes. CLAUDIA_BEFORE and CODEX_NEW each contain separate native screenshots and one H.264 entrance-to-exit ride. The 147 recorded frames and all 16 still poses match on camera, course distance, steering, counters and fixed simulation clock. The videos render at 648 × 1152 and 12 frames per second, with five 60 Hz simulation steps between recorded frames. The same finish and five hearts are visible in both runs. Real-time motion between the recorded frames is not sampled.

Under reproduce, capture.cjs uses the existing Three.js renderer and gameplay step API. From an isolated checkout run the usual Vite development server. Set RAINBOW_BASE_URL to that loopback address. With Playwright 1.57, Chromium and FFmpeg on the path, run the following with the evidence directory as the current directory.

```sh
node reproduce/capture.cjs stills 07:BEFORE 07:NEW
node reproduce/capture.cjs repeat 07:BEFORE
node reproduce/capture.cjs ride 07:BEFORE 07:NEW
node reproduce/capture.cjs full-safe 07:NEW
```

In the continuous footage, compare the plunge from 5.4 seconds, halfway down at 8.67 seconds, two-thirds at 9.75 seconds, and the white sides near the bottom at 11.75 seconds.

Each route log gives the precise video time and course position for every frame. The still logs record full camera matrices. Hard steering stills stress individual viewpoints. The safe full-ride regression uses a different steering trace.

## Game and recovery

All 8 gameplay checks passed. A complete successful ride collected 91 coins, advanced from 1,330 to 2,240, finished in Stage 11 with 5 hearts and recorded zero collisions. The collision assertion deliberately tests a wall bump in a separate run. TypeScript checks and the production Vite build passed. The cloud renderer verifies appearance and gameplay behavior. Sustained frame time and thermal behavior on a physical Android device are pending.

Claudia’s checkpoint is claude/rainbow-s07-match-c17 at 8651edf92525a9aab82b02fad9aa44621216708a. The tested source is codex/s07-plunge-bank-continuity at ac10d511420c7b547a2f8b47567f13afe9c9c7cf. It starts from 8651edf92525a9aab82b02fad9aa44621216708a. Every experiment remains opt-in. To restore the retained view use its existing saved query without the additional Codex switches. No promotion was performed.

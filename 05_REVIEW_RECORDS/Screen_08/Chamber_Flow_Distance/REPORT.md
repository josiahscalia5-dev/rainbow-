# Screen 08 · Final Spin Chamber

REJECTED. The glints follow the chamber’s measured curve, but the foreground water shows no clear visual improvement.

The previous chamber candidate narrowed the magenta shoulder and exposed more cyan water beside Benny. This trial keeps that physical shoulder and bases the highlights on the distance traveled along the curved channel. The positions and world transforms of all 22 named chamber meshes match the preceding candidate, including the washer door, ring, perforated platform, purple towel and four spouts.

Across the sampled floor the fitted river travels 52.883 game units while the longitudinal span is 51.956. That difference changes which glints pass Benny on turns. At +3, the long foreground strokes still have the same shape. Across the fixed cyan crop the longest vertical bright run measures 38 pixels in both versions. Under hard right the longest run increases from 77 to 90 pixels. These counts describe the camera view, not similarity to an unpictured reference.

The exact approved Screen 08 has separated bright strokes that bend around a winding cyan channel and leave the gold rim and platform legible. Shifting the existing repeating glints does not reproduce those shapes in the moving foreground. Keep the earlier chamber shoulder candidate. The next physical test should measure the transverse width and direction of individual highlights across the near-water and projected-floor join.

## Opening and movement

The exact original file is APPROVED.jpg. Its source in the project is references/08_final_spin_chamber.png. Both files have SHA-256 ab7d0bc5777bc9b262ec0563839a51663d4ec271e4a099c8d417b2de5f498e14. All gameplay stills are separate images at 864 × 1536.

Across the entire opening, 84.0857% of retained pixels and 84.0857% of experimental pixels fall within a mean absolute RGB channel error of 20 on the 0–255 scale. Pixelmatch 7.1.0 at threshold 0.1, excluding antialias-only discrepancies, counts 197,021 and 197,011 differing pixels against the artwork. The opening comparison between the two game versions contains 72,174 pixels with any channel difference. The fresh retained capture exactly reproduces the archived opening.

CLAUDIA_BEFORE and CODEX_NEW each contain 13 playable views and a complete H.264 swim at 648 × 1152. The 22 video frames align on course position, steering, camera, clock, coins and hearts. The game advances at 60 steps per second. The films sample it at 12 frames per second. The route logs and pose logs record the exact inputs, cameras and timestamps.

The pose set covers the opening, forward movement, maximum left and right steering, the main bend or drop, the last in-stage view and the following transition. The +20 view would cross the exit of this short chamber. Its skipped state is documented in poses.json.

Watch the early river at +3 and the hard-right view around 1.1 seconds. Compare the platform-and-spouts pose and the exit to see how the scene holds together around the water.

Use the existing chamber shoulder’s hard turns and platform approach to review the unseen foreground. The new flow-coordinate calculation is saved for inspection. This trial is rejected as a visual replacement.

## Game and verification

All eight gameplay assertions passed. The successful full ride began at 1,330, collected 91 coins and finished in Stage 11 at 2,240 with five hearts and zero collisions. The wall-hit assertion intentionally uses a different ride. The route and test outputs are in CODEX_NEW. TypeScript and the production Vite build passed.

The cloud uses Chromium WebGL 2 with SwiftShader. A physical Android device is needed to measure sustained frame times, touch response and heat. The Screen 06 Android package verification and modeling tool checks are recorded on the Screen 06 evidence branch.

## Reproduction and recovery

Claudia’s retained commit is 3c0fa97090afb2c0fca41898774db7247e23e522 on claude/rainbow-s08-scenery-c17. The experimental source is e56ab3a42cc886d88eba4c8ca2df5b039f7eec64 on codex/s08-chamber-flow-distance. The parent used for the isolated adjustment is bca810eb1cffd5fae1274ce7fa02fec892b47c6c. The provenance file records the exact visual switches. These switches enable the trial on its own branch.

Start Vite from an isolated checkout with the project lockfile and saved assets. Set RAINBOW_BASE_URL to the local server. Run these commands from the evidence directory. The default capture output is under reproduce/proof. The pinned toolchain uses Playwright 1.57.0, Chromium and FFmpeg.

```sh
node reproduce/capture.cjs stills 08:BEFORE 08:NEW
node reproduce/capture.cjs repeat 08:BEFORE
node reproduce/capture.cjs ride 08:BEFORE 08:NEW
node reproduce/capture.cjs full-safe 08:NEW
```

The original artwork supplies one approved camera per stage. The additional moving views are proposed interpretations until the owner approves specific frames. No experimental switch has been promoted. [Motion-matching skill and project rules](https://github.com/josiahscalia5-dev/rainbow-/tree/3b57658f78fd5d7dce498d2743f1a09a173a570a)

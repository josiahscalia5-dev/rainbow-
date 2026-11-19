# Screen 06 · Crest the Rinse Arch

CANDIDATE. The water beneath Benny reads as part of the crest again when he starts moving.

At +1.1 game units, most of the pale patch below Benny now shows the existing flowing cyan water. In the same 292 × 160 native crop, the pale area falls from 18,020 pixels to 3,861. Both runs use the same position, steering and shader time. This count measures the visible patch, whose remaining pale crescent is easy to see along the lower ripple.

Four real floor renders with Benny shown or hidden established which part of the original camera’s floor was occluded by his body. The experiment uses that footprint to limit the painted layer on the actual 3D crest. The water material beneath it stays visible when Benny swims away. The previous clustered-foam adjustment still gives his body clearance on hard turns.

The descent retains elongated cyan glints. The deeper ring passage still reads too centered. The earlier separate curved-ring model and its 25 measured centers remain available for reviewing the tunnel beyond the crest. Its measured direction changes by up to 37.8 degrees. This release-water test changes the floor material and projection mask only.

## Opening and movement

The exact original file is APPROVED.jpg. Its source in the project is references/06_crest_the_rinse_arch.png. Both files have SHA-256 3946058c0893e97a99dd5015f3197901859475cd7ef55e09d982d232951441fe. All gameplay stills are separate images at 864 × 1536.

Across the entire opening, 79.0857% of retained pixels and 79.0857% of experimental pixels fall within a mean absolute RGB channel error of 20 on the 0–255 scale. Pixelmatch 7.1.0 at threshold 0.1, excluding antialias-only discrepancies, counts 262,246 and 262,246 differing pixels against the artwork. The opening comparison between the two game versions contains 0 pixels with any channel difference. The fresh retained capture exactly reproduces the archived opening.

CLAUDIA_BEFORE and CODEX_NEW each contain 14 playable views and a complete H.264 swim at 648 × 1152. The 63 video frames align on course position, steering, camera, clock, coins and hearts. The game advances at 60 steps per second. The films sample it at 12 frames per second. The route logs and pose logs record the exact inputs, cameras and timestamps.

The pose set covers the opening, forward movement, maximum left and right steering, the main bend or drop, the last in-stage view and the following transition. The forward poses include +3, +6, +10 and +20 game units where they keep Benny in the stage.

In the ride, inspect the release around 1.0 seconds, the arch bend near 2.0 seconds and the exit around 4.0 seconds. The separate matched sequence samples +0.6, +1.1, +1.5 and +2.2 game units.

The crest-release, hard-left, hard-right and arch-exit images are proposed views for owner review. The +1.1 view specifically tests how much water should be visible beneath Benny.

## Game and verification

All eight gameplay assertions passed. The successful full ride began at 1,330, collected 91 coins and finished in Stage 11 at 2,240 with five hearts and zero collisions. The wall-hit assertion intentionally uses a different ride. The route and test outputs are in CODEX_NEW. TypeScript and the production Vite build passed.

The cloud uses Chromium WebGL 2 with SwiftShader. A physical Android device is needed to measure sustained frame times, touch response and heat. The Screen 06 Android package verification and modeling tool checks are recorded on the Screen 06 evidence branch.

## Reproduction and recovery

Claudia’s retained commit is c649fcbc35780e11cefce83eb54684f1d55752a5 on claude/rainbow-s06-match-c17. The experimental source is 41d4d840b9325bf810397ed6bfe28002603723c8 on codex/s06-crest-release-water. The parent used for the isolated adjustment is 394609842ebc30c2832e23b8992c7d9a868ba0c0. The provenance file records the exact visual switches. These switches enable the trial on its own branch.

Start Vite from an isolated checkout with the project lockfile and saved assets. Set RAINBOW_BASE_URL to the local server. Run these commands from the evidence directory. The default capture output is under reproduce/proof. The pinned toolchain uses Playwright 1.57.0, Chromium and FFmpeg.

```sh
node reproduce/capture.cjs stills 06:BEFORE 06:NEW
node reproduce/capture.cjs repeat 06:BEFORE
node reproduce/capture.cjs ride 06:BEFORE 06:NEW
node reproduce/capture.cjs full-safe 06:NEW
```

The original artwork supplies one approved camera per stage. The additional moving views are proposed interpretations until the owner approves specific frames. No experimental switch has been promoted. [Motion-matching skill and project rules](https://github.com/josiahscalia5-dev/rainbow-/tree/3b57658f78fd5d7dce498d2743f1a09a173a570a)

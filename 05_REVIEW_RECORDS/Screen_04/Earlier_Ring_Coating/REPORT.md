# Screen 04 · Through the Five Arrows

REJECTED. The new reflection puts muted green-gold streaks on the deeper ring shoulders.

Sampling the river from the rings’ actual surface normals adds a moving reflection to four deep bays. The previous candidate already gave the selected distant ring a thicker, rounder lip. At +20, the extra coating is subtle. At the final approach, parallel olive-gold streaks cross the upper shoulders. The artwork’s stronger pink-violet accents and the depth of the polished bands are still missing.

At the last in-stage pose, 36,600 pixels in a fixed crop of the upper right shoulder change visibly. Their median color goes from RGB (243, 159, 36) to (218, 156, 62). This measures the coating’s effect on a particular surface. The original camera supplies no pixel target for this deeper bay.

Keep the previous curved-water and fourth-ring lip candidate for review. The next ring test should fit the approved pink-violet reflections and alternating polished metal bands to the actual ring profile, with the gold-ring specialist’s geometry and lighting as the reference. The five arrows and river path retain their positions.

## Opening and movement

The exact original file is APPROVED.jpg. Its source in the project is references/04_through_the_five_arrows.png. Both files have SHA-256 1b0ccdacbb4c97e9ea67c4910080668ebaf6a6c326249ef40340bc1472676193. All gameplay stills are separate images at 864 × 1536.

Across the entire opening, 81.8399% of retained pixels and 81.8399% of experimental pixels fall within a mean absolute RGB channel error of 20 on the 0–255 scale. Pixelmatch 7.1.0 at threshold 0.1, excluding antialias-only discrepancies, counts 223,529 and 223,529 differing pixels against the artwork. The opening comparison between the two game versions contains 1,283 pixels with any channel difference. The fresh retained capture exactly reproduces the archived opening.

CLAUDIA_BEFORE and CODEX_NEW each contain 13 playable views and a complete H.264 swim at 648 × 1152. The 42 video frames align on course position, steering, camera, clock, coins and hearts. The game advances at 60 steps per second. The films sample it at 12 frames per second. The route logs and pose logs record the exact inputs, cameras and timestamps.

The pose set covers the opening, forward movement, maximum left and right steering, the main bend or drop, the last in-stage view and the following transition. The forward poses include +3, +6, +10 and +20 game units where they keep Benny in the stage.

Watch the deeper corridor in the final second of the swim. Compare forward-20 and last-in-stage with the immediate previous ring candidate in PRIOR_CANDIDATE.

Use the earlier fourth-ring candidate’s forward-20 and last-in-stage images as proposed layouts for the deeper corridor. The extra coating in this isolated branch was rejected.

## Game and verification

All eight gameplay assertions passed. The successful full ride began at 1,330, collected 91 coins and finished in Stage 11 at 2,240 with five hearts and zero collisions. The wall-hit assertion intentionally uses a different ride. The route and test outputs are in CODEX_NEW. TypeScript and the production Vite build passed.

The cloud uses Chromium WebGL 2 with SwiftShader. A physical Android device is needed to measure sustained frame times, touch response and heat. The Screen 06 Android package verification and modeling tool checks are recorded on the Screen 06 evidence branch.

## Reproduction and recovery

Claudia’s retained commit is ad5fbac592444e90fd1b53d62e7fa0b62391c032 on claude/rainbow-s04-match-c17. The experimental source is 6a5bc52854542aebac32c4d5b543e0fd7a4ff97e on codex/s04-reflected-ring-bays. The parent used for the isolated adjustment is 38ad7b0dfc042f34e8239d4bea7448248375b371. The provenance file records the exact visual switches. These switches enable the trial on its own branch.

Start Vite from an isolated checkout with the project lockfile and saved assets. Set RAINBOW_BASE_URL to the local server. Run these commands from the evidence directory. The default capture output is under reproduce/proof. The pinned toolchain uses Playwright 1.57.0, Chromium and FFmpeg.

```sh
node reproduce/capture.cjs stills 04:BEFORE 04:NEW
node reproduce/capture.cjs repeat 04:BEFORE
node reproduce/capture.cjs ride 04:BEFORE 04:NEW
node reproduce/capture.cjs full-safe 04:NEW
```

The original artwork supplies one approved camera per stage. The additional moving views are proposed interpretations until the owner approves specific frames. No experimental switch has been promoted. [Motion-matching skill and project rules](https://github.com/josiahscalia5-dev/rainbow-/tree/3b57658f78fd5d7dce498d2743f1a09a173a570a)

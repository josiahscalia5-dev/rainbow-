# Screen 05 · Flow into the Current

REJECTED. The last S-bend still smears and the new shading breaks up the blue water unevenly.

The last bend’s large highlights were painted into the near river. The trial samples broad satin illumination using distance along the actual ribbon. It keeps the original magenta bands and existing transition to far water. Both hard-bend poses change visibly, with 214,104 significantly different native pixels at the left bend and 154,055 at the right bend relative to the earlier wall candidate.

On hard left, the new blue water has dark lengthwise channels beside the main pink sweep. On hard right, the foreground gains broad blotches while the white highlight still stretches into the corner. The added shading does not restore the compact, glossy curls of the approved river. Keep the retained water and the earlier perforated-wall candidate.

In a fixed foreground crop, the 95th-percentile length of bright vertical runs fell from 54 to 35.6 pixels on hard left. On hard right, the number of runs longer than 30 pixels went from 33 to 40. The native screenshots show why the shorter left-side measurement is insufficient to keep this change.

Two different surface corrections have now been tested at this bend. The previous pass added small repeating ripples. This one relocated broad illumination. The next approach should trace the major approved glints as curved shapes on the river mesh, measure their widths across the final S and fit the near and far surfaces at their shared edge.

## Opening and movement

The exact original file is APPROVED.jpg. Its source in the project is references/05_flow_into_the_current.png. Both files have SHA-256 d3f339d49199598e03541c15a3ec6f7fa6342f40de650361c44ab4301bfb44dd. All gameplay stills are separate images at 864 × 1536.

Across the entire opening, 89.4424% of retained pixels and 89.3659% of experimental pixels fall within a mean absolute RGB channel error of 20 on the 0–255 scale. Pixelmatch 7.1.0 at threshold 0.1, excluding antialias-only discrepancies, counts 119,454 and 120,248 differing pixels against the artwork. The opening comparison between the two game versions contains 5,897 pixels with any channel difference. The fresh retained capture exactly reproduces the archived opening.

CLAUDIA_BEFORE and CODEX_NEW each contain 14 playable views and a complete H.264 swim at 648 × 1152. The 84 video frames align on course position, steering, camera, clock, coins and hearts. The game advances at 60 steps per second. The films sample it at 12 frames per second. The route logs and pose logs record the exact inputs, cameras and timestamps.

The pose set covers the opening, forward movement, maximum left and right steering, the main bend or drop, the last in-stage view and the following transition. The forward poses include +3, +6, +10 and +20 game units where they keep Benny in the stage.

Compare the last-left-bend and last-right-bend images and the 5.4–6.7 second section of the ride. The blue near water, the right-side foam and the far water past the turn are visible together here.

Use Claudia’s final-bend positions and the preceding perforated-wall version as proposed camera targets. The latest water shading is rejected.

## Game and verification

All eight gameplay assertions passed. The successful full ride began at 1,330, collected 91 coins and finished in Stage 11 at 2,240 with five hearts and zero collisions. The wall-hit assertion intentionally uses a different ride. The route and test outputs are in CODEX_NEW. TypeScript and the production Vite build passed.

The cloud uses Chromium WebGL 2 with SwiftShader. A physical Android device is needed to measure sustained frame times, touch response and heat. The Screen 06 Android package verification and modeling tool checks are recorded on the Screen 06 evidence branch.

## Reproduction and recovery

Claudia’s retained commit is f033f7cc895752907621f82fb9d6bee4899ac0e0 on claude/rainbow-s05-match-c17. The experimental source is 91e91b57f81dbc0567ec6709d8d09f553a3631f7 on codex/s05-anchored-bend-highlights. The parent used for the isolated adjustment is 8729b96daeb2b73ff27a20b5435fb8eba923d4f2. The provenance file records the exact visual switches. These switches enable the trial on its own branch.

Start Vite from an isolated checkout with the project lockfile and saved assets. Set RAINBOW_BASE_URL to the local server. Run these commands from the evidence directory. The default capture output is under reproduce/proof. The pinned toolchain uses Playwright 1.57.0, Chromium and FFmpeg.

```sh
node reproduce/capture.cjs stills 05:BEFORE 05:NEW
node reproduce/capture.cjs repeat 05:BEFORE
node reproduce/capture.cjs ride 05:BEFORE 05:NEW
node reproduce/capture.cjs full-safe 05:NEW
```

The original artwork supplies one approved camera per stage. The additional moving views are proposed interpretations until the owner approves specific frames. No experimental switch has been promoted. [Motion-matching skill and project rules](https://github.com/josiahscalia5-dev/rainbow-/tree/3b57658f78fd5d7dce498d2743f1a09a173a570a)

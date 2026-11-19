# Screen 04 · Carry the entrance gold into the fifth ring bay

**CANDIDATE**. The fifth ring bay now carries the warm amber groove and pink-blue glints visible on your original gold entrance.

The original entrance has two gold grooves enclosing a curved band. I used Claudia’s measured centers and radii to read colors along the visible upper half of that band. Those colors follow the angle and depth of the fifth existing ring bay as Benny swims through it. The lower half of this test bay keeps the existing metal where the entrance’s foam and water hide the source.

At +20 the generic yellow lip now has an amber recess and distinct cool-blue and pink glints. Near the exit the upper shoulder reflects a deeper copper-violet color. In the matched turn and swim, the markings stay attached to the same metal. This pass adds one texture to the existing material. It adds zero rings or draw passes.

The earlier curved water and fuller fourth ring lip are carried by the experimental parent. Against that parent the opening pixels are identical. The change to the fifth bay alone affects 43,684 pixels at +20 and 124,586 at the final in-stage view under a summed RGB difference threshold of 30. These counts identify visible changes. The untouched neighboring rings still have a smoother and more regular finish than the entrance. The older olive-toned coating stays rejected.

## Review the playable result

APPROVED.jpg contains the exact original file bytes from GitHub. Open it, CLAUDIA_BEFORE/opening.png and CODEX_NEW/opening.png separately at 864 × 1536. The two ride.mp4 files show the actual game from inlet to exit and across the next transition.

Watch the fifth bay approach from about 1.9 to 3.2 seconds. Compare the +20 and final-in-stage images with both Claudia’s retained frames and the previous thicker-lip candidate.

The cool reflected streak and amber recess in the deeper bay are proposed extensions of the original metal. Your review determines whether to use this appearance in other bays.

The entire opening measured 81.8399% for Claudia and 81.8399% for the experiment. This counts pixels whose mean absolute difference from the original across RGB channels is at most 20 on the 0–255 scale. Pixelmatch at threshold 0.1 counted 223,529 and 223,529 differing pixels respectively. Between the retained and experimental openings, 1,283 pixels had at least one changed channel. The repeated retained frame was pixel-identical.

All 13 tested native positions matched in camera, steering and shader time. All 42 H.264 video frames matched on gameplay inputs, coins, health, course position and camera. The simulation advances at 60 steps per second and the clips sample 12 frames per second at 648 × 1152.

The full-course run passed eight assertions, collected 91 coins, went from 1,330 to 2,240 and entered Stage 11 with five hearts and zero collisions. TypeScript and the production Vite build passed. These runs used desktop Chromium WebGL 2. Sustained Android performance still requires a physical device.

## Reproduce

Use an isolated checkout with the project lockfile and a local Vite server. Set RAINBOW_BASE_URL to that server and run the following commands inside reproduce. The recorder uses Playwright 1.57.0, Chromium and FFmpeg. The flags and queries files hold the exact visual switches.

```sh
node capture.cjs stills 04:BEFORE 04:NEW
node capture.cjs ride 04:BEFORE 04:NEW
node capture.cjs full-safe 04:NEW
node capture.cjs repeat 04:BEFORE
```

The exact comparison conditions, reference hash and initial branch check are in provenance.json. The individual capture files and measurements are listed in checksums.json. The original artwork supplies one approved angle. Moving views are proposals awaiting the owner’s decision.

Original artwork on Claudia’s specialist checkpoint. [Open the immutable GitHub source](https://github.com/josiahscalia5-dev/rainbow-/blob/ad5fbac592444e90fd1b53d62e7fa0b62391c032/references/04_through_the_five_arrows.png)

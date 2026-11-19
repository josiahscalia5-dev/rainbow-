# Screen 06 · Original yarn and fur on the retained Benny model

**REJECTED**. The violet stripe shows more weave, but the added grain leaves Benny’s hat and coat visibly different from the artwork.

I sampled the pink coat, ribbed cuff and shaggy violet pom directly from the verified original Screen 06. The trial wraps that detail around the six existing materials. It leaves the yellow star and every mesh, fur-shell count, rig, animation and game camera intact. At the opening and on both hard turns all 3D mesh attributes, visible states and world transforms matched Claudia’s retained actor.

The new purple stripe has vertical ridges. The pale stripe looks mottled, the pom still lacks the original separated yarn tips, and the body fur still reads as fine parallel strands. A fixed native rectangle around Benny covers 349,250 pixels. Mean absolute RGB error against the original changed from 35.733 to 35.744 on a 0–255 scale. Every changed opening pixel falls within the rendered actor and a two-pixel antialias margin.

Claudia’s Screen 06 Benny measures 448 × 477 visible pixels at the approved camera. The original silhouette measures approximately 435 × 459, with soft boundaries. The cuff ends about 54 pixels lower in the game. The material test held these dimensions fixed. A fitted, properly scaled knit on the physical cuff is a stronger separate test than adding grain over all six surfaces.

## Review the playable result

APPROVED.jpg contains the exact original file bytes from GitHub. Open it, CLAUDIA_BEFORE/opening.png and CODEX_NEW/opening.png separately at 864 × 1536. The two ride.mp4 files show the actual game from inlet to exit and across the next transition.

Inspect the beginning, the first crest release and the hard-right view at native resolution. Compare the ribbed cuff and yellow star on the original with the woven bands and star face in the two game versions. The two complete swims use 63 identical camera and gameplay states.

The fixed-scale crops of all five versions of Benny are in character-review. Only the original image in each pair is an approved target. The Screen 06 material pilot is preserved as a rejected study.

The entire opening measured 79.0857% for Claudia and 79.0825% for the experiment. This counts pixels whose mean absolute difference from the original across RGB channels is at most 20 on the 0–255 scale. Pixelmatch at threshold 0.1 counted 262,246 and 262,337 differing pixels respectively. Between the retained and experimental openings, 121,866 pixels had at least one changed channel. The repeated retained frame was pixel-identical.

All 14 tested native positions matched in camera, steering and shader time. All 63 H.264 video frames matched on gameplay inputs, coins, health, course position and camera. The simulation advances at 60 steps per second and the clips sample 12 frames per second at 648 × 1152.

The full-course run passed eight assertions, collected 91 coins, went from 1,330 to 2,240 and entered Stage 11 with five hearts and zero collisions. TypeScript and the production Vite build passed. These runs used desktop Chromium WebGL 2. Sustained Android performance still requires a physical device.

## Reproduce

Use an isolated checkout with the project lockfile and a local Vite server. Set RAINBOW_BASE_URL to that server and run the following commands inside reproduce. The recorder uses Playwright 1.57.0, Chromium and FFmpeg. The flags and queries files hold the exact visual switches.

```sh
node capture.cjs stills 06:BEFORE 06:NEW
node capture.cjs ride 06:BEFORE 06:NEW
node capture.cjs full-safe 06:NEW
node capture.cjs repeat 06:BEFORE
```

The exact comparison conditions, reference hash and initial branch check are in provenance.json. The individual capture files and measurements are listed in checksums.json. The original artwork supplies one approved angle. Moving views are proposals awaiting the owner’s decision.

Original artwork on Claudia’s specialist checkpoint. [Open the immutable GitHub source](https://github.com/josiahscalia5-dev/rainbow-/blob/c649fcbc35780e11cefce83eb54684f1d55752a5/references/06_crest_the_rinse_arch.png)

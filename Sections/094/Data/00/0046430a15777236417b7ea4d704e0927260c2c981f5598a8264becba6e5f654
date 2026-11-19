# Benny’s pink coat on Screen 06

**Candidate for owner review.** In your original, the fur grows in overlapping tapered locks. Pale pink tips sit above darker roots, and the coat becomes mauve beside the water. The retained character shows finer, fairly uniform hot-pink fibres. On the new body you can see groups of hairs overlapping at the opening and during both steering directions. The upper coat still catches too much warm light, the lower fringe looks sharper, and the hands still have Claudia’s finer fuzz.

## What you are seeing

The original is `references/06_crest_the_rinse_arch.png`, SHA-256 `3946058c0893e97a99dd5015f3197901859475cd7ef55e09d982d232951441fe`. **APPROVED.jpg** preserves its original 864 × 1536 JPEG bytes. **CLAUDIA_BEFORE** comes from `claude/rainbow-s06-match-c18` at `c649fcbc35780e11cefce83eb54684f1d55752a5`. **CODEX_NEW** is the experiment on `codex/s06-benny-layered-coat`, with game source `bf61823aa512cb6f6326a0423178b49b8945154f`. It uses Claudia’s retained swimming route. The separately tested crest-curve experiment and previous cuff study are independent.

The test samples a 96 × 96 patch of pink locks directly from the approved picture. Two real game renders under known grey albedos establish how the Screen 06 lights respond. Longitude and latitude on Benny’s existing body carry the lock directions. The raised tips occupy several of the actual fur shells, and their normals respond to lighting when he turns. The project retains the original actor mesh, scale, rig, star, hat, hand materials, controls and physics. The material switches back when he leaves Screen 06.

The first pass sampled the same swatch but left most of the shell surface broken into fine independent strands. It changed the pink color while leaving the surface too prickly. The refined version fills each lock through its depth, keeps small strands at the tips, and uses the light response from the first live render to fit the color. The first pass and its source are in **first-pass**. The earlier six-material experiment that put grain across the character remains rejected. [Earlier six-material report](https://github.com/josiahscalia5-dev/rainbow-/blob/2c8f2091fa046c4ee2a6d075d16edf6c86831b87/experiments/codex/s06-benny-original-fibers/REPORT.md)

## Size and the hat

At the native opening the hand-read original whole silhouette is approximately **435 × 459 pixels**. Allow about eight pixels for the soft fur and splashing water. The retained game measures **448 × 477**. The rolled edge of the retained hat ends near **y = 1,080**, against about **y = 1,026** in the original. Its visible pom measures 186 × 189 pixels and sits farther left. The photographed pom is approximately 174 × 148 pixels and its tufts radiate out from the centre.

The new fur draws a few longer tips, so the measured whole silhouette becomes **448 × 480**. Benny’s physical dimensions and root scale stay the same. The coat test does not address the 54-pixel cuff offset. The existing separate knit-cuff candidate produced an 8-pixel rib pitch at the opening. The original measures about 7 pixels and Claudia’s cuff about 20. Its pose and low edge still differ. The owner’s scale decision can be made from the two native photographs independently of this fur material. [Independent cuff candidate](https://github.com/josiahscalia5-dev/rainbow-/blob/393c83ceaed1d3261ce72a3aec2824be18627e03/experiments/codex/s06-benny-fitted-knit-cuff/REPORT.md)

## What the measurements mean

The visible retained body is measured by hiding only the body fur in a frozen native opening and taking the pixel difference. Over that area the mean absolute RGB error falls from **41.65** to **36.64** on a 0–255 scale. The RMS fine-detail contrast moves from **20.05** to **13.84**, closer to **9.79** in the artwork. The broader tuft contrast moves from **10.62** to **12.74**, closer to the original **14.12**. The comparison includes the limits imposed by the differing hat fit and body outline. A central patch remains too peach. Its median RGB is approximately (245, 105, 172) in the trial, (255, 50, 188) before and (229, 71, 166) in the original.

Across the complete opening, **79.0857%** of Claudia’s pixels and **79.2618%** of this trial’s pixels are within a mean absolute RGB difference of 20 of the original. Pixelmatch 7.1.0 at threshold 0.1, excluding antialiasing, finds 262,246 and 259,515 mismatches out of 1,327,104. The retained repeat matches exactly. These measurements describe the original camera position. The hidden sides of the coat extend the direction and spacing measured on the visible side, and those moving views await the owner’s judgment.

## Gameplay and recovery

There are fourteen native full-size pairs and two uninterrupted H.264 swims. The simulation advances at 60 steps per second and the movies sample 12 frames per second at 648 × 1152. They use the same camera, steering, station, shader clock, score and health throughout 63 frames. The hard turns show that the fur follows the body as Benny leans. Existing foam still obscures his lower outline at some angles. The stage boundary occurs at 4.92 seconds. The complete gameplay run passes eight assertions, collects 91 coins, goes from 1,330 to 2,240 and enters Stage 11 with five hearts and zero collisions.

The source includes the material and its reconstruction script. **checks** records gameplay, camera, native actor measurements and the lighting fit. **measurement-inputs** contains the two frozen grey-lighting passes. **first-pass/refinement.json** stores the measured adjustment. Run the project lockfile build in a disposable checkout. To bake the final texture from the original artwork, run the following from the game root.

```sh
proof=experiments/codex/s06-benny-layered-coat
python tools/benny-coat06/bake-locks.py references/06_crest_the_rinse_arch.png "$proof/measurement-inputs" /tmp/coat-locks.png /tmp/coat-measure.json --refinement "$proof/first-pass/refinement.json"
```

Start the local playable game with the switches in **reproduce/queries.json** and add `cx06LayeredCoat=1` for the new version. Use the capture harness with **stills**, **ride** and **full-safe** for `06:NEW` or `06:BEFORE`. It needs Playwright 1.57.0, Chromium, FFmpeg and the project dependencies. The body-only measurement and original camera data are saved alongside the full captures.

The renderer also drew the project’s lower mobile fur setting with 12 shells. The retained version and the trial used the same geometry, draw count and poses at the opening and hard right. The high-tier actor check verified all 41 node transforms and mesh attributes at the opening and both hard turns. Four additional native low-tier captures are on the experiment branch in mobile-tier.

No physical Android device was available for sustained performance testing. The owner has not approved the material. Nothing from this experiment has been merged or promoted.

# Screen 06 structural proof

**Decision — rejected for promotion. Claudia’s Screen 06 is the retained game.**

The original river sweeps up the left side, carries a shrinking arc of coins over its crest and curls into a gold-ring passage on the right. You can see slotted purple washer wall through the middle of that loop. The experimental water fills most of that opening. It also loses the original highlights on the broad foreground whirlpool and the carefully spaced gold arcs in the upper-right. Benny uses the retained model, camera, pose and animation in both captures. His fur, hat and size still warrant a separate comparison with the artwork.

## What changed in real 3D

I built a continuous editable washer drum, gold collars fitted to its bend, a sculpted water surface with two glossy lips, four mounted paddles and rounded foam clusters. The GLB runs in the existing Three.js game under the experimental switch. Water and metal use physical coordinates and photographed material swatches. Photograph sampling is limited to corresponding surfaces at the locked source camera. Its depth buffer and surface-normal checks prevent hidden surfaces from borrowing that paint.

The retained deep view contains a dense stack of gold rings. In the experiment you can follow fewer, more widely spaced rings around the real bend. During hard turns, the bank foam leaves more of Benny’s lower body visible. Farther ahead the river narrows into a raised ribbon, the small foam groups become repetitive and the slots repeat too evenly. The original does not show these moving viewpoints. They remain unapproved.

## What the opening measured

The original and both game captures are 864 × 1536. For each pixel, average the absolute red, green and blue differences on the 0–255 scale. The table shows the share of pixels whose average difference is at most 20. The three files were decoded in place. There was no resizing, alignment adjustment or masking in the whole-frame result.

| Region in original pixels | Claudia before | Codex new |
| --- | ---: | ---: |
| Entire opening | 79.09% | 38.09% |
| Purple crest opening, x 295–559 and y 575–709 | 92.53% | 2.14% |
| Gold and slotted wall, x 335–857 and y 242–556 | 98.63% | 12.30% |

Whole-frame mean absolute RGB error increased from 16.20 to 44.83. The retained opening was captured again in this build and reproduced the saved image pixel for pixel. The metric describes one viewpoint. No numerical likeness claim is made for the rest of the ride. [Native measures](checks/camera-and-aperture.json) · [Pixelmatch and repeat-capture results](checks/motion.json)

## What the fitting study found

Claudia’s original camera fit measured Benny’s visible box at approximately (203, 732) to (638, 1169), against the artwork target (205, 730) to (635, 1172). This is a saved geometry fit. It does not measure fur or knit detail. That fit allowed the pictured coins to sit up to 2.5 units to either side of the route and constrained the river’s top edge. It did not impose the boundary inside the loop or both playable steering limits. The new tests add those constraints. [Original fitting script](../../../tools/match06/fit_river06.py)

I checked the unchanged route against the approved crest mask, camera and fifteen recorded coin centres. At 3.75 game units ahead of the approved opening, the middle of the route projects to pixel (461, 649), 48.2 pixels inside the purple wall region. Between 10 and 30 units from the inlet, 38 of 81 sampled route centres project onto the saved wall mask. These positions describe a sightline. Hidden water behind a physically plausible nearer surface remains possible.

A camera fit to the fifteen saved coin centres reproduced the existing camera. Allowing the lens, position and direction to vary while also penalizing the wall overlap moved the coin centres by 9.0 pixels RMS and left 47.7 pixels of overlap. The world coin locations were themselves fitted from this camera. This tests consistency with the current composition.

I also traced **140 cross-sections** from the photographed crest and built a separate Blender ribbon at the saved coin depths. It leaves 27,104 of 27,215 purple-mask pixels visible in the crest crop. On its own, that pictured ribbon misses the existing central water path by up to 1.42 game units and the right steering trace by up to 3.67. Those distances apply to this partial model and its assumed depths. They do not establish the shape of hidden water. [Annotated original and route](diagnostics/visible-crest-and-swim.png) · [Editable fitting study](editable/Crest_Fit_Study.blend) · [Surveyed cross-sections](editable/visible-crest-fit.json)

A separate calculation allowed the depth to vary freely along every *visible* water pixel in the original. At the respective worst stations, the current centre, left and right traces are at least 0.34, 1.04 and 2.17 game units from any such ray. This constrains a scenery-only solution to explain which water is physically hidden, who hides it and why the camera can pass it. [Visible-water clearance calculation](checks/visible-water-clearance.json)

Blender also cast 343 rays through the pixels labelled as purple inside the opening. All 343 hit the experimental water first. On the worst ray the water was 9.08 units from the camera and the actual drum shell was 78.97 units away. A hypothetical flat covering at 6–8 units puts all 343 sampled points inside the assumed swimming volume. A covering at 2–4 units clears the sampled volume but would put a new object in the near foreground. The saved relative depth map places this purple region farther than nearby cyan water. Together those checks identify the misplaced water surface and give no support for adding a flat foreground patch. [Physical mesh intersections](checks/physical-wall-rays.json)

## Reviewing the actual ride

The two 5.25-second H.264 clips start at the inlet. Both integrate the real game at 60 simulated steps per second and encode 12 matched samples per second at 648 × 1152. The engine steers left and right. At roughly 0.9 s the camera passes the approved starting station. The stem of the painted loop and the foam are easiest to compare during the 1.0–2.5 s steering sequence. At 3.67–4.00 s compare the depth of the rings and the distant water’s thickness. At 4.92 s the game enters Screen 07. The separate hard-left and hard-right stills use the full steering input and reach lateral offsets −2.95 and +2.95. The video uses a different continuous steering sequence.

The 14 native before/new pairs match camera matrix, Benny position, station, steering, game state, render size and shader clock. The transition still in Screen 07 was byte-identical after RGB decoding. I decoded the full duration of both films and compared adjacent frames. [Native state and comparisons](checks/motion.json) · [Every video sample](checks/film-timeline.json)

The real-game regression passed all eight assertions. A full successful ride collected 91 coins, went from 1,330 to 2,240, kept five hearts and reached Screen 11. The separate collision assertion still detects a heart lost on an intentional wall bump. TypeScript, the production build and stage-continuity checks passed. A separately named Android review APK built with SDK 34. Its signature, packaged game assets and two review choices were verified. Physical Android frame pacing and sustained performance remain unmeasured. [Game tests](CODEX_NEW/gameplay.json) · [Full successful ride](CODEX_NEW/full-safe-ride.json) · [Android checks](checks/android-receipt.json)

## What should carry forward

Keep the editable wall, rings and bank tests as research assets. Use the photographed ribbon to fit an actual attached inner drum wall and the water that continues behind it. Test the wall against the full steering and camera envelopes before rendering a new playable trial. The saved depth map gives relative ordering rather than surveyed distances. A change to Benny’s route or steering range requires separate owner authorization. No stage has been marked approved.

| Screen | Existing decision and next visual target |
| --- | --- |
| 04 | The distant gold-bay candidate is preserved. Inspect ring thickness, spacing and reflections while swimming into the drum. |
| 05 | The latest tested bend-highlight change was rejected. The retained S-river and earlier wall-detail candidate remain separate. Inspect near/far mapping in the final bend. |
| 06 | This full reconstruction was rejected. The earlier curved-tunnel and crest-seam experiments remain separate. |
| 07 | Claudia’s near water remains the baseline. An earlier outlet-bank candidate covers the bottom of the plunge. The full descent, white sides and vertical smearing still need work. The rejected Image2Blender banks remain separate. |
| 08 | Owner pause in effect. Its chamber objects, earlier water candidates and rejected flow-distance test remain recorded. |

[Earlier five-screen visual evidence](https://github.com/josiahscalia5-dev/rainbow-/blob/7a04d763a1ab108aa11588ede0ee338f4acd6817/OPEN_RAINBOW_ON_ANDROID.md)

## Source and recovery

- Protected base **claude/rainbow-s06-match-c17** at **c649fcbc35780e11cefce83eb54684f1d55752a5**.
- Isolated game source **codex/s06-world-space-rinse-arch** at **a1c1f0c7e35239c9f7065a56f19b79264313994c**. The following evidence commit adds the review files and modeling studies. Use the commit ID shown at the top of this GitHub page for the complete proof.
- Exact original **references/06_crest_the_rinse_arch.png**. The original contains JPEG bytes. The review copy uses the corresponding .jpg extension. Its SHA-256 is **3946058c0893e97a99dd5015f3197901859475cd7ef55e09d982d232951441fe**.
- Retained view parameters are in **reproduce/queries.json**. Only **cx06RinseWorld=1** selects this experimental world. The Blender study has no game switch.
- The editor scene packs six images. The runtime GLB has 22 meshes and 103,882 triangles. It was reimported with Blender 5.3.0, its surface types and names were checked, and the editor camera reproduces the fifteen saved coin centres to under 0.002 pixels. [Editable world](editable/Screen06_Rinse_Arch.blend) · [Runtime GLB](../../../assets/reconstruction06/rinse_arch.glb) · [Model verification](checks/model-verification.json)
- [Full reproduction steps](reproduce/README.md) · [GitHub checkpoints](checks/github-checkpoints.json) · [File hashes](SHA256.json)

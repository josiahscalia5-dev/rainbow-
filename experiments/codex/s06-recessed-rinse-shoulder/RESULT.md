# Screen 06 · What changed in the swim

**Keep this as a partial visual candidate for owner review.** The view through the crest now shows the real purple washer and a gold ring as Benny approaches. In the earlier camera fit, the nearer solid metal face filled the same gap. The new smooth bank grade and recessed underside preserve a continuous riding surface. The camera, Benny, coins, collision geometry and movement code come from the existing game.

## What the real surfaces were doing

In Claudia’s retained game, the opening-camera ray through native pixel (390, 650) met `m06_floor` at 9.20 game units. The purple washer tube was behind it at 58.61. Foam was absent from the front of this ray. The local projection made this part of the water look like exposed metal at the registered camera. In the previous Codex fit, its added `m06_crest_outer_soffit` also presented a solid face between the raised arm and near bank as the camera advanced. The diagnostic records other rays where water, the lip, washer shell and rings legitimately remain in front. [Retained and new intersections](checks/camera-rays.json) · [Earlier fit and candidate](checks/visibility.json)

The repair samples the game’s established curved course. It trims the decorative near-water swell, lowers the outer shoulder beyond the steering envelope and seats its rolled edge, rounded foam and metal return using the same continuous grade. Under the raised arm, the metal rolls back toward its outboard side. The downstream wet rim tapers onto measured bank points. These are static world-space vertices with metric surface coordinates. The game still uses the inherited reference projection where it was registered. Parts of the opening, including the middle of the pictured purple crescent, are still supplied by paint on the foreground water.

## What to look for

| Held game view | Visible result |
|---|---|
| Approved opening | The photographed curl, right-hand passage and starting composition remain recognizable. The game's simpler beanie and coin faces, wake and local water highlights still differ. |
| Three units forward | Look just left of the pom-pom, beside the coin. The opening is narrow, partly interrupted by Benny, but purple tunnel slots and a gold edge appear between the waters. |
| Six units forward | Look under the raised cyan arm on the left. The purple drum and gold rings extend behind the foam. The left edge is still sharp, and the curved arm falls more steeply than the artwork suggests. |
| Both turns and +20 | The previously broad metal baffle opens up. Foam and the winding lower water remain visible underneath. The tapered top can look like a narrow blade when approached from the side, and a dark edge and thin foam band remain visible close to the left bank. Some animated water highlights still lengthen. |
| Final approach and transition | The lower river remains steerable and enters Screen 07. The distant rings repeat more evenly than in the original artwork. The existing handoff to 07 visibly changes the wall and water finish. |

The first structural trial opened the underside but left the far water tip apparently suspended. Its source and diagnostics are in `diagnostics/intermediate-open-underside/`. The delivered version also seats and tapers the tip into the existing bank. The moving views are proposed continuations from the original and require the owner's judgment.

The recorded inlet-to-exit movie shows the early shoulder around 0.8–1.6 seconds, the opened underside and tapered edge during the first two steers around 1.6–3.1 seconds, the deeper water and repeated collars through 4.8 seconds, then the handoff around 5 seconds. The camera for the approved artwork is partway into the stage. The approved-camera stills and the inlet-to-exit movie therefore begin at different points. [New continuous ride](CODEX_NEW/ride.mp4) · [Recorded inputs](CODEX_NEW/route.json)

## Measurements and checks

At the fixed +3 sample window used by the prior experiment, 127 of 306 diagnostic pixels now reach the actual perforated washer wall and 12 reach a gold ring. In the prior camera fit neither surface was exposed there, and 131 samples hit the added metal baffle. The count satisfying the diagnostic's purple-color test fell from 202 to 191. The improvement is in real depth and visible continuity. At +20 the near metal face fell from 9,124 to 790 pixels in an identical 270 × 480 surface-ID pass. [Visibility report](checks/visibility.json)

At the 864 × 1,536 approved opening, the share of pixels within a mean absolute RGB channel error of 20/255 was 79.086% for Claudia and 79.104% for this candidate. Pixelmatch 7.1.0 at threshold 0.1 with antialiased pixels included flagged 262,573 and 262,362 pixels respectively, out of 1,327,104. Against the preceding Codex fit the thresholded counts improved slightly, while mean absolute RGB error rose from 16.164 to 16.183/255. The opening measures are effectively tied. The fresh Claudia capture exactly reproduced the archived opening. A second fresh Claudia capture differed at one pixel. The independent candidate repeat was byte-identical. [Opening color](checks/whole-frame-color.json) · [Pixelmatch](checks/opening-pixelmatch.json) · [Repeats](checks/independent-opening-repeats.json)

All 14 comparison poses had matched camera, Benny transform, simulation state, clock and steering. All 63 recorded frame states matched the retained ride. Both H.264 files decoded end to end. All eight gameplay assertions passed. The full successful route collected 91 coins, went from 1,330 to 2,240 and finished with five hearts. Blender 5.3.0 reopened and verified nine editable meshes and all three registered cameras. The extracted editable game rebuilt all 79 production outputs byte-for-byte. The Android APK assembled and its packaged game files were verified. Physical Android performance remains unmeasured. [Matched simulation](checks/matched-results.json) · [Source rebuild](checks/editable-source-restore.json) · [Android build checks](playable/BUILD_CHECKS.json) · [Blender verification](editable/verification.json)

This host could not run Mira-Scene inference. It exposes no NVIDIA GPU or CUDA runtime and had less free space than the core weights alone require. Mira contributed no geometry. No generation or paid jobs ran. [Feasibility check](MIRA_FEASIBILITY.md)

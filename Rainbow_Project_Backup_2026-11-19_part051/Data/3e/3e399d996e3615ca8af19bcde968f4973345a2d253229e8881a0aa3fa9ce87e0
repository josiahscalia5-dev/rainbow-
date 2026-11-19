# Screen 06 | Crest the Rinse Arch

**Candidate for the crest release.** As Benny first rises, the purple perforations and curved edges of the gold rings continue across the right side of the crest. The abrupt horizontal stripe across that part of the tunnel is much less visible. Compare the complete frames at +1.1 game units and the enlarged detail in the phone PDF.

[Open the pictures](PHONE_REVIEW.md)

## What caused the stripe

At the approved camera the river surface hides a thin part of the physical tunnel. As Benny comes up over the crest, the newly exposed wall and rings fall back to a different gold pattern. A surface-identification pass and rays through the stripe identify the actual tube and ring meshes. The opening illustration already contains purple metal and gold detail in the right-hand portion of that strip.

The test measures the silhouette of Claudia’s real river mesh at the locked camera. It permits the existing wall shader to reuse the verified wall paint only where the artwork identifies metal and the depth buffer shows the water had hidden a more distant surface. Its 3,570-byte mask adds one texture and zero meshes. The same course, camera, Benny, coins and water geometry run in both recordings.

## What was discarded

An initial trial kept the recovered paint visible farther downstream. A second strip of purple appeared across the curved rings during a hard turn. That trial is saved under `discarded-unbounded-trial/`. The candidate hands the wall back to Claudia’s physical metal as the camera leaves the crest, using the same 1.2-unit outer limit her ring shader uses. This is a local repair where the original artwork identifies the wall material.

## What still needs work

The left side of the break crosses painted water and foam. There the artwork gives no wall color to recover. The next structural correction should fit the real upper water surface to the broad painted crest. The deeper gold tunnel still narrows into a repetitive centered stack. Its course and ring axes need to turn together around the approved off-center opening. The pale patch under Benny belongs to a separate saved crest-release candidate. Both candidates have independent review status.

## Evidence

The original opening is 864 × 1,536. At the approved viewpoint the candidate reproduces Claudia’s retained frame pixel for pixel. For perspective on the distance to the original artwork, the opening comparison counts a pixel as within tolerance when its mean absolute red, green and blue difference is at most 20 on the 0–255 scale. This percentage applies to the opening frame. At the release, sixteen rays through the problematic strip identified known wall paint in the original. The mean RGB difference on those samples fell from 76.93 to 19.77 on the 0–255 scale. At both hard turns and at +6, +10 and +20, the full native frames were pixel-identical to Claudia’s retained frames. See both measurements and their definitions below.

[Opening, poses, complete film and gameplay checks](checks/motion.json) · [Known wall samples](checks/known-wall-paint.json) · [Frame-by-frame film diagnostic](checks/film-timeline.json) · [Retained film](CLAUDIA_BEFORE/ride.mp4) · [Experimental film](CODEX_NEW/ride.mp4)

The approved camera, forward +3, +6, +10, +20, both hard turns, inlet, middle, crest, exit and transition are captured with matching game state and shader clock. The uninterrupted film advances the actual game at 60 simulation steps per second and samples at 12 frames per second. The owner’s physical Android performance check and approval remain outstanding.

The trial is isolated on `codex/s06-crest-wall-seam`, based directly on Claudia’s `claude/rainbow-s06-match-c17` at `c649fcbc35780e11cefce83eb54684f1d55752a5`. Enable it with the retained Screen 06 settings plus `cx06CrestJoin=1`.

[Source and capture provenance](provenance.json) · [Reproduce the test](reproduce/README.md)

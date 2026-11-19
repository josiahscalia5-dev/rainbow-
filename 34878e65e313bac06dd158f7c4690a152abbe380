---
name: rainbow-visual-motion-matcher
description: Use for matching Rainbow's playable Three.js washing-machine stages 04 through 08 to the owner's approved artwork. Evaluate full-size opening frames and continuous steered rides, diagnose scenery defects, and preserve Claudia's retained checkpoints and active work.
---

# Rainbow visual motion matcher

## Establish the comparison

1. Resolve the owner's named lead, five current specialist tips, separate Screen 04 ring specialist, and any existing Codex experiment on GitHub. Record full commit IDs and the observation time. Check for a newer handoff before capturing. Read `CLAUDE.md`, the current coordination and resume briefs, the visual goal, agent status, tool manifest, screen progress, and WIP records. Keep the specialist's retained features distinct from paused, rejected, untracked, and owner-approved work. Evaluate the two Screen 04 specialists independently.
2. Verify `scripts/reference.sha256` against the actual hydrated files in `references/`. Preserve their original bytes, even when the extension differs from the encoded format. Confirm full-size dimensions. Locate the kept runtime flags and native camera, the clean projection plate and masks, available depth maps, Blender curves or meshes, texture sources, and past in-game captures. Record which assets belong to which commit.
3. Run the existing playable build from a disposable copy with the retained flags. Use Claudia's saved comparison for provenance and reproduce the checkpoint on the same renderer used for the candidate. Export the original artwork, Claudia before, and candidate as three separate native images. Use the same viewport, device pixel ratio, projection, camera, pose, action schedule, fixed clock, HUD, and color interpretation for each before/candidate pair. Keep the HUD and Benny in the whole-frame comparison. Record any difference between the archived and reproduced baseline.

The Account 17 lead stores game depth, DA3 relative depth, and disagreement maps for each screen in `qa/da3/2026-11-18/`. Check their pose and scale before using them for reconstruction. Screen 05 has saved camera-lock and paddle-lid Blender scenes, plus the existing Marble projection trial in `qa/pilot05/`. Locate each other specialist's fitted layout, masks, plates and retained textures by commit. Use an available screen-specific mesh or fitted layout for scale. A Marble panorama or monocular depth estimate needs a multi-angle geometry check before use as playable scenery.

## Record the whole ride

Use the real QA interface in the running game. In this project `goto(id)` sets the approved pose and `startRideAt(previous)` enters the actual stage from its route inlet. Read `course.stage(id)`, `course.marks`, `state()`, and `camera()`. Use the existing fixed simulation step and steering input, then render through `drawList()`. Save frame data, including stage ID, course distance, time, steering, lateral position, camera and resolution. A handoff frame belongs to the destination stage. Record which upcoming-stage flags existed in the source specialist build. Verify integration separately if the owner authorizes a combined build.

Use a fresh page for each independent opening repeat. This game can retain visual state after an in-tab ride and checkpoint reset. For each retained screen, capture the approved view twice, early and later forward travel, both full steering inputs at equal travel, halfway, deep water, the final in-stage view, and the first view across the handoff. Capture landmark-specific positions from the real course. Record one uninterrupted inlet-to-boundary clip at a fixed sampling rate with moving water, Benny, HUD, and both steering directions. Keep the route log with the clip. Verify encoded frame count, boundary crossing and any respawn or pause. Separate software-renderer timing from Android performance.

| Screen | Additional views and features to inspect |
| --- | --- |
| 04 | Pass through the five arrows and the gold entrance ring. Follow the pink room, metal mouth, arrow spacing, near-water bands, foam, and the change into the tunnel. Inspect the ring specialist separately. |
| 05 | Follow the S-shaped current, paddle lids and rings, collectibles, berm thickness, and foam around the last left and right bends into 06. |
| 06 | Capture just after the crest, inside the curved arch, and approaching 07. Inspect the curved water silhouette, ripple scale, gold rings, purple wall and foam clusters from both banks. |
| 07 | Include the approved tube, the near water around Benny, hard turns, the plunge lip, halfway and two-thirds down the descent, late plunge, and the 08 boundary. Track each gold paddle in world space and watch the magenta banks, cyan highlights, foam and coins through changes of angle. |
| 08 | Pass the raised platform, folded purple towel, gold-banded cups, central ring, river bend, and chamber exit. Identify the 09 Google Flow handoff in the log. |

Review each native frame and play each clip. Check physical scale, wall and ring continuity, real parallax, paddle and coin occlusion, Benny's silhouette, hat and star, gold roughness and highlights, cyan and magenta flow, foam volume, seams, stretching and popping. Inspect the frames on either side of conspicuous changes. Use scene transforms, geometry, depth settings, texture resolution and shader evidence to establish a cause. A ray hit, an object name or a draw call alone cannot establish which object contributes visible pixels.

## Make a bounded experiment

Choose one specific visible defect on one retained checkpoint outside Claudia's active WIP. Where a saved Blender scene or Image2Blender helps, reconstruct editable geometry in a copy, match the approved camera and scale, and carry the material to an oblique view. Use saved depth and plate masks for correspondence. Preserve the clean textures, stable scenery, character, controls, collision paths, scoring, animations, videos and transitions. Document inferred widths, hidden backs or unseen downstream scenery for the owner's review. Import a trial GLB into a disposable copy and check coordinate transform, scale, texture orientation, mipmaps, alpha, depth test, and occlusion before assessing a playable frame.

Use one Blender Lab bridge on loopback. Use a clean browser profile and local game endpoint. Prefer deterministic Playwright scripts for repeatability and the Microsoft MCP for interactive investigation. Use Chrome or Three.js inspectors for a specific scene question, and Spector only when draw order, shader input, textures or WebGL state is in doubt. Pin verified versions. Keep credentials out of processes and evidence. Paid generation requires explicit owner authorization.

## Measure, review and decide

At the approved pose decode the original and both captures at native size without cropping, rescaling or repositioning. Record whole-frame RGB agreement as the share of all pixels for which the sum of the three absolute 8-bit channel differences is at most 60. Also report Pixelmatch version, threshold, antialias handling, mismatch count and denominator. During this trial Pixelmatch 7.1.0 used threshold 0.1 and includeAA false. Use exact decoded-pixel difference between baseline and candidate and an independent repeat as a regression guard. Optionally add a labelled local silhouette or material measurement to explain a specific change.

Run the included helper with Node, Python/Pillow and the pinned Pixelmatch package installed in the disposable environment. It accepts the original image in its native encoding.

```sh
python3 scripts/compare-opening.py APPROVED BEFORE --candidate NEW --repeat REPEATED_BEFORE
```

At unseen moving views compare matched before and candidate frames and their continuous clips. Report what improved, where it occurred, how interpretations follow the approved art, and any regression. An exact-reference percentage applies only to a photographed pose. The owner's 90–95% goal requires a named method and visual judgment. A favorable metric by itself cannot accept a change.

Run the existing eight gameplay checks on the exact trial flags. Record the assertion details, the 91 real pickups, and final total 2,240. Save separate original, before and candidate files, full-size moving pairs, short clips, measurements, query flags, software versions and source commit. Keep an experiment only when its target improves and the opening, steering views, complete route and gameplay hold up. Record a worse or inconclusive result as rejected and preserve the baseline. The owner makes the approval decision. Commit and push only an expressly authorized isolated Codex branch and verify its tip on GitHub.

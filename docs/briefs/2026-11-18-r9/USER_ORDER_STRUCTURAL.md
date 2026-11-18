# User order 2026-11-18 ~03:10 UTC — RECONSTRUCT THE APPROVED DESIGNS, STOP POLISHING THE WRONG SCENERY (binding, all screens)

User: "I HAVE ALREADY DESIGNED MY RAINBOW GAME. MY ORIGINAL APPROVED PICTURES ARE THE DESIGNS I WANT. You keep making small
improvements to scenery that is still structurally different from my artwork. Making an incorrect tunnel shinier does not
make it my approved tunnel. Adding more foam to the wrong water formation does not make it my approved water. I WANT YOU TO
RECONSTRUCT THE ACTUAL VISUAL DESIGN, NOT JUST MAKE THE CURRENT GAME LOOK BETTER." "IF THE CURRENT METHOD CANNOT
REALISTICALLY ACHIEVE THAT, TELL ME CLEARLY." "I WANT MY APPROVED SCREENS RECONSTRUCTED — NOT YOUR INTERPRETATION OF THEM."

Screen 04 (user): approved = rounded glossy gold washer entrance, laundry room above, a WIDE richly coloured water formation
flowing through the washer, broad pink/magenta swirls mixed with luminous cyan, FIVE prominent glowing arrows, LOWER softer
foam, precisely arranged bubbles / gold rings / coins / reflections, Benny full and fluffy. Current = long repetitive orange
tunnel, oversized white foam banks, wrong water formation → STRUCTURAL mismatch.
Screen 05 (user): continuous S-shaped cyan-and-magenta river inside the specific purple-and-gold tunnel; current = distorted
water shapes, abrupt edges, surfaces that don't connect → fix river geometry + water/wall relationship + proportions first.

## Workflow (every screen 04–08)
1. VISUAL BLUEPRINT of the approved picture (shapes, positions, proportions, colours, materials, details) — authoritative.
2. CORRECT THE FOUNDATION: compare the 3D environment with the blueprint; fix the 3D construction first; no polishing of
   incorrect geometry.
3. REPRODUCE: real 3D geometry, carefully mapped original textures, accurate lighting, depth; no generic tunnel, no invented
   water design.
4. INDEPENDENT REVIEW: reference-match-director (+ playwright-visual-qa for real-game views) checks that the result is closer
   to the approved picture; changes that improve rendering quality but reduce fidelity are rejected.
5. PROOF: separate full-size APPROVED / BEFORE / NEW + matching views from the real playable game; say what looks more like
   the approved artwork, not which objects were built.
Keep two builders at once, rotate all five screens; no 01–03 / 09–11; no paid credits without approval; goal ≥ 8.5/10
throughout gameplay; preserve successful work; never restart.

## Lead diagnosis (Screen 04, measured from `qa/match/04/r8/BEFORE/motion.json`)
Stage 04 = s 77.41 → 114.69 (37.3 u). The washer opening is only ~6–8 u ahead of the approved camera, so from f10 on
(~80 % of the stage) the camera is inside a ring corridor the painting never shows — the "long orange tunnel" is invented by
construction. Foundation fix being tried: `&m04lay=1` forced-perspective washer front (scaled about the approved camera, so
the approved view stays identical) that keeps the painted composition ahead of Benny for the whole stage; the rings become
the short painted funnel inside the opening. Blueprints for 06/07/08 + honest per-screen ceilings: reviewer, files
`BLUEPRINT_<NN>.md`, `REVIEW_SUMMARY.md` in this folder.

## User follow-up ~03:20 UTC (binding)
"YES, FIX THE ACTUAL SCENERY, BUT PRESERVE MY GAME." Correct the structural problem across ALL FIVE playable screens; the
approved artwork stays the visual blueprint. Screen 04: "do not replace the invented orange corridor with another invented
design … I want its exact distinctive appearance: the rounded gold entrance, glowing rings, colorful water, five arrows,
foam, bubbles, and laundry-room surroundings. Reconstruct that visual design accurately throughout the existing stage."
Same for 05, 06, 07, 08 (each keeps its unique approved scenery). **Do not change the existing gameplay length, coin totals,
movement rules, or transitions without the user's permission.** No more than TWO specialist agents actively working at once
(the reviewer runs only while a builder is paused). Show separate large APPROVED / BEFORE / NEW pictures proving the scenery
genuinely looks closer. No generic replacements, no unnecessary redesigns. 01–03 / 09–11 = Google Flow videos.

## User clarification ~03:25 UTC — REAL, CONSISTENT 3D (binding)
"Do not simply move or stretch my approved picture in front of Benny to make it appear correct. Reconstruct the actual
visual shapes, gold rings, scenery, water, foam, bubbles, materials, and lighting so they continue looking like my approved
artwork as Benny swims. I want the same beautiful visual appearance, not an illusion that breaks when the character moves."
Rules derived (sent to both builders): world-fixed geometry only (nothing recalibrated from the camera / Benny per frame, no
sliding seams, no Benny-relative texture offsets); the painting supplies SHAPES and MATERIALS (world-anchored textures in each
object's own UVs, or a fixed projector onto correctly shaped surfaces); every kept step passes a consistency check (forward,
steering, through-screen views look like one coherent place with correct parallax).
Disclosed to the user: kept switches that are NOT real fixed 3D — 05 `m05ride` (painted water pattern laid out relative to
Benny), 05 `m05far` (far tunnel block recalibrated to the live eye every frame, sliding seam), 04 `m04room` (flat painted
backdrop). They stay in the code (nothing deleted); the world-fixed reconstruction replaces them only when it looks at least
as close, and the user decides.

## User correction ~03:35 UTC — KEEP SUCCESSFUL IMPROVEMENTS, FIX ONLY WHAT IS VISUALLY WRONG (binding; supersedes the strict "world-fixed only" reading above)
"I am NOT demanding that every single piece of scenery be physically modeled in 3D. You are allowed to combine real 3D
environments and geometry, original approved artwork and texture projection, properly mapped textures, background scenery
and image planes, visual effects and materials. USE WHATEVER COMBINATION PRODUCES THE MOST ACCURATE VISUAL RESULT … The
result must remain convincing while Benny swims and steers. I do not want obvious flat pictures following Benny, stretched
scenery, duplicated surfaces, incorrect perspectives, or backgrounds that visibly break apart. However, if an existing
technique works visually, DO NOT remove it simply because it uses projection or a moving texture." Screen 05: keep m05ride
(water around Benny) and m05far (distant tunnel + river) if they work visually; fix only specific distortions. Screen 04: a
flat laundry-room backdrop is acceptable for distant scenery if it does not visibly break; the washer opening, nearby gold
structure, river and foreground scenery must have convincing depth and match the approved design; never another generic
orange tunnel. "VISUAL FIDELITY IS THE GOAL. THE TECHNIQUE IS A MEANS TO ACHIEVE IT." Nothing approved until the user approves.

## Screen 04 foundation result (~03:33 UTC, `05e383c9`, `qa/match/04/r9/PROGRESS.md`)
`&m04lay` NOT kept: on the fixed course the camera stays 3.39 u above the water, and the painted composition needs height /
opening distance = 0.26, so the OUTSIDE view (opening + basin + room) exists only ≈ 13 u before the opening (the stage
start). A bigger/farther world-fixed front puts the painted pool 6.8 u below Benny (coins float mid-tunnel); a receding front
helps a little at f20 only. Decision (lead): keep steps 1–2 (painted opening + room) and reconstruct the ≈ 30 u INSIDE as the
PAINTED interior (fast-converging painted ring bands + warm VP glow, broad pink/magenta swirl water around a narrow cyan lane,
five fat arrows, low foam, bubbles). Showing the outside view for longer would need a course/checkpoint change → user's call.

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

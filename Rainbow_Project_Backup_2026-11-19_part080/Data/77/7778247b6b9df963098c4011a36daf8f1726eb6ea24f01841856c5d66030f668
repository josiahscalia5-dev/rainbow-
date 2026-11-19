# Screen 04 — BLUEPRINT of the approved picture (round 9, lead order "BLUEPRINT → FOUNDATION")

Source: `references/04_through_the_five_arrows.png` (864 × 1536). Measurements: `tools/match04/blueprint04.py`
→ `qa/match/04/r9/blueprint04.json`; annotated overlay `/home/user/wt/s04/qa/match/04/r9/blueprint_overlay.png`.
Camera/proxy solve already in the repo: `assets/textures/match04/proj04.json` (locked game camera; the painted opening
fitted as a circle of r 3.58 / outer 4.11 u, axis parallel to the 32° slide, 13.1 u ahead of the camera along the
axis, camera 3.39 u above Benny's water, 1.12 u above the opening's axis).

## 1. The composition (frame px)
| element | approved picture |
|---|---|
| **Opening** (rounded gold entrance) | centre ≈ (435, 790); inner edge top (434, 445), left (87, 790), right (782, 794) → r ≈ 347 px; outer lip top 392, left 37, right 834 → ≈ 398 px. Thick polished band y 402–460 at the top (yellow-white at the top centre), thin bright lips, row of glowing hot spots on both lips (14 detected, `assets/textures/match04/mouth04.json`). The opening fills **93 %** of the frame width. |
| **Nested rings** inside the opening | ≈ 8–9 rings between the opening and the vanishing point (490, 690); grooves at 44, 59, 81, 101, 159, 171, 225, 291 px above the VP — they converge FAST (the visible funnel is only ≈ 250 px deep on screen); far end = a small bright warm glow at the VP, no visible corridor. |
| **Basin / pink bowl** | the opening sits at the back of a round swirling pool: gold basin rim at the top (y ≈ 338 at the centre, 392 at the left edge, 376 at the right), pink/magenta water ring all around the opening, and the pool's near gold rim arcs through the bottom-left corner (≈ (0, 1380) → (440, 1536)). Benny swims INSIDE this bowl. |
| **River formation** | not a channel with banks but a whirlpool: the cyan arrow lane rises from under Benny (x 448–572 at y 1500) to the opening's bottom and converges into the VP (x 446–495 at y 720); broad pink/magenta swirl bands on both sides (pink px per row: y 1300: 220 left / 106 right; y 900: 75 / 118); at y 1100–1200 the water fills the whole width (cyan x 72–851) — the swirl wraps around Benny. |
| **Five arrows** | A1 x 352–549, y 910–981 (≈ 200 px wide, ≈ 40 px thick bars, right above Benny's hat); A2 378–534, 842–892; A3 408–522, 790–825; A4 464–510, 752–774; A5 460–502, 720–732 — fat flat white-cyan chevrons, shrinking fast toward the VP. |
| **Coins** | five, on the left of the lane: (176, 974) 107 px wide, (262, 872) 85, (329, 790) 57, (378, 740) 39, (424, 711) 24. |
| **Foam** | LOW piles of glossy lilac-white balls only at the frame edges: upper left on the basin (x 4–365, y 370–645), left bank (4–153, 925–1063), right bank (584–860, 911–1173), lower right (478–860, 1226–1468), lower left (45–285, 1253–1394). No foam walls along the lane. |
| **Bubbles** | a few big iridescent ones: (65, 355) r ≈ 45, (790, 385) r ≈ 70, (770, 1255) r ≈ 65, (720, 1470) r ≈ 40, small ones along the rings' right side. |
| **Room** | porthole (centre ≈ (437, 228), r ≈ 122, window cross + clouds), console with T-shirt display (x 0–350, y 180–380; display 70–215 × 225–325, two buttons), towels on a wooden shelf (x 565–864, y 180–360), pipes in the top corners. |
| **Benny** | x 190–590, y 975–1400 (hat top just below arrow A1). |

## 2. STRUCTURAL mismatches of the current kept build (frames `qa/match/04/r9/BEFORE/`)
Stage 04 runs s 77.41 → 114.69 (37.3 u). The painted opening is ≈ 6.8 u ahead of Benny's approved water point, so
from ≈ f06 on Benny is inside the tunnel for ≈ 80 % of the stage — a view the painting never shows.
1. **Layout / proportion:** from f10 to t95 the frame is a long straight ring CORRIDOR around the camera (rings
   passing overhead), not the approved composition (opening ahead, basin, room). Structural, not a material issue.
2. **Nested rings:** a 90 u cylinder with a ring every 2.6 u → 35 evenly spaced rings receding slowly to a big orange
   disc; the painting shows ≈ 8–9 rings converging fast into a small glow.
3. **River:** a straight trough (flat lane + sides rising to the walls) ending in hard edges at the tunnel wall; the
   painting shows a round swirling pool with the lane rising into the opening and pink bands wrapping around Benny.
4. **Foam:** tall continuous foam walls along both banks for the whole tunnel; painted foam = low piles at the frame
   edges / pool rim only.
5. **Arrows:** one arrow every 5.6 u from 9.6 u on (many thin far ones, none right above Benny once moving);
   painted = five fat bars stacked right above Benny's hat converging into the opening.
6. **Basin / room:** both disappear above the top of the frame within ≈ 5 u (camera descends the 32° slide toward
   them); the near gold bowl rim (bottom-left) is never modeled.

## 3. Geometric constraint for any re-layout (measured, with pictures)
* Painted composition = camera 3.39 u above Benny's water, 13.1 u from the opening along its axis, 1.12 u above the
  axis, opening r 3.58 u (ratios to the distance: height 0.26, radius 0.27, above-axis 0.085).
* Course/camera untouched ⇒ the camera stays 3.39 u above Benny's water for the whole stage and travels 37 u down
  the straight 32° slide; the approved moment is the stage start (Benny s ≈ 78.4, opening 6.84 u ahead of him).
* STATIC forced perspective (front scaled about the approved camera by k, world-fixed): the approved view stays the
  same picture, but the painted pool / river is then 3.39·k u below the camera while Benny and the coins stay at
  3.39 u ⇒ with k = 3 the painted pool lies 6.8 u BELOW Benny, Benny's path and the coins run through the MIDDLE of
  the opening (coins float in mid-tunnel), and the river near Benny slides at 1/k of his speed. Pictures:
  `qa/match/04/r9/lay_test/k3scale_f10_forward10u.png`, `k3scale_f20_forward20u.png`, `k3scale_t66_through_screen.png`.
* A front that moves with the camera keeps the composition but is a camera-relative illusion (forbidden by the
  user's 2026-11-18 rule): evidence only, `qa/match/04/r9/lay_test/moving_front_REJECTED/`.
* ⇒ With the course fixed, a coherent world-fixed layout has the opening at the painted size and place: ≈ 7 u of
  approach, then ≈ 30 u INSIDE the gold tunnel. "The approved design throughout the stage" therefore has to be
  reproduced inside the tunnel from the painted parts (painted nested ring bands as modeled rings, the painted swirl
  water, the five fat arrows, low foam, bubbles) — or the course/checkpoint would have to change (user's permission).

## 4. To be rebuilt later (lead rule 4)
* `&m04room=1` is a flat painted backdrop (porthole, shelf, towels, console on one plane behind the opening) —
  acceptable for now; to be rebuilt as modeled porthole / shelf / towels / console. Big structure first.

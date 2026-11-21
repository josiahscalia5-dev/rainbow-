# BLUEPRINT 08 · FINAL SPIN CHAMBER — independent review (reference-match-director, round 9, 2026-11-18)

Approved picture: `references/08_final_spin_chamber.png` (864×1536). Overlay: `BLUEPRINT_08_overlay.png`. Coordinates were
read by eye from a 50 px grid (±20 px); colours are 12×12 px medians. Current version reviewed: branch
`claude/rainbow-s08-scenery-c9` @ `c0d8c97b`, frames `qa/match/08/scenery/r7/NEW/` (kept set B7, 12 shots). The unfinished
r8 coin/towel-mask edits were not reviewed in frames (none exist yet).

## 1. Blueprint (ranked by visual importance)
1. **Foreground gold ring ARCH framing the whole scene**: outer edge from x ≈ 20 to 845, top at y ≈ 195. Its legs run down
   both sides to y ≈ 1180 (left leg inner edge near x 210, right near x 650 at the bottom) and the bottom is hidden by the
   water. It has a bulb row. This single shape defines the composition: everything else is seen THROUGH it.
2. **Chamber**: pink-magenta perforated drum walls with slot rows (wall ≈ (206,37,184)) and a lighter purple perforated
   floor (≈ (179,118,235)).
3. **Back focal group**: the chrome washer-door window, centre ≈ (490, 400), r ≈ 140 incl. the rim, glass ≈ (73,87,156)
   with foamy water behind it; hinge at (590, 410). A purple folded towel (388–582, 478–548, ≈ (85,5,182)) sits on a
   round gold-rimmed perforated platform (ellipse 262–700 × 525–580).
4. **Four gold spout cups pouring water**: upper-left (148–322, 330–425), upper-right (662–782, 368–462), and two BIG near
   cups: mid-left (0–265, 600–800) and mid-right (612–864, 640–800). Each has a thin falling stream.
5. **Long winding S-river** from the platform at (480, 598): left to (395, 650), right to (480, 720), left to (330, 880),
   then behind Benny, widening to the full frame width at the bottom. Magenta edges ≈ (232,32,197), cyan centre
   ≈ (22,250,253), glossy streaks, white foam fringe on both banks.
6. **Benny**: x 258–600, y 850–1215, centre x ≈ 430, with a splash crown.
7. **Small coins in a tidy line** along the S: (480,600) … (335,860), about 30–90 px wide, growing toward the camera.
8. Floating iridescent bubbles (about 10, mid-size).

## 2. Current vs blueprint
Stage range of the audit: checkpoint s = 391.43 to stage end 404.37, so **only 13 u**. The door, platform, spouts and S-river
stay AHEAD of the camera for the WHOLE stage, so the painted composition is on screen ≈ 100 % of the time. 08 is
structurally the healthiest of the three screens. (`f20` = s 411.9 is already Screen 09 and is not counted.)

* **a00:** matches (projected approved pixels on fitted geometry). ≈ 8.5/10.
* **f06 → t95 (s 395–404):** door, towel, platform, upper spouts and the S-river with coins read as the picture.
  STRUCTURAL differences:
  1. **The foreground gold arch disappears from about f06 on.** The camera passes through it, and only fragments remain at
     the left and right edges. This is the biggest compositional loss: the picture's frame-filling golden oval is gone for
     ≈ 60 % of the stage.
  2. The big near spout cups get magnified and cut at the frame edges (s_*_hard show flat undersides).
  3. **Coins are oversized and sit on Benny** (f06, f10, t33, t66: 2–3× the painted size, one covering his body).
  4. The near water at the frame bottom is stretched painted pixels (soft) when steering hard.
* Material: chamber walls and door are close. The foam fringes along the river are thinner than painted, and there are
  fewer bubbles.
* **Overall while swimming: ≈ 7/10** (the specialist's own 7/10 is fair). Hard steering ≈ 6/10.

## 3. Foundation fix (look only; course, coins 91/2,240, movement and transitions unchanged)
1. **Keep the gold arch as the painted foreground frame for the whole 13 u.** Use forced perspective: move the arch
   with the camera's forward travel at a fraction (≈ 0.7–0.85), or scale it about the approved camera's projector so it
   recedes slowly. Benny then stays "inside" the oval through the stage end instead of the camera passing it at ~5 u. This
   is the #1 fix. It is invisible at the approved view (0 px there by construction).
2. Coins at the painted size (finish the unfinished `coins.ts` work in the worktree), fading while they overlap Benny's
   screen box. Positions and pickups stay unchanged.
3. Near spout cups: close the flat undersides with real cup geometry (modeled bowl + rim), textured from the painted cup
   pixels.
4. A world-anchored near-water layer from the least magnified painted river band (as `projnear05`), fading in only away
   from the approved view. Thicker painted foam fringe and bubble density as painted.

## 4. Honest ceiling
**8–8.5/10 while swimming is realistic for free** with the existing method (approved pixels + the paid fal plate already
in the repo, camera-projected onto fitted geometry), because the painting depicts what the camera sees for the whole short
stage. The limits are softness of magnified near pixels in the last ~3 u, and the arch fix showing a slight "sliding frame"
feel if its factor is too low. Nothing paid is needed.

INCOMPLETE: the unfinished r8 work in the worktree (`src/gameplay/coins.ts`, `match08.ts`, `occ08.py`, `towelmask08.py`)
was not rendered or judged. It needs an audit set before review.

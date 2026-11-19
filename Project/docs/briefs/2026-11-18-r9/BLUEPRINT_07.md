# BLUEPRINT 07 · DIVE THE WASHER TUBE — independent review (reference-match-director, round 9, 2026-11-18)

Approved picture: `references/07_dive_the_washer_tube.png` (864×1536). Overlay: `BLUEPRINT_07_overlay.png` (this folder).
Coordinates were read by eye from a 50 px grid (±20 px); colours are 12×12 px medians of the approved pixels.
Current version reviewed: branch `claude/rainbow-s07-match-c9` @ `dbc7678c`, frames `qa/match/07/r7/NEW/` (kept set K, 12
shots) + `qa/match/07/r8/plunge_foam_coinsz/` (K + m07foam + m07coinsz, t33–t95). No renders were made for this review.

## 1. Blueprint (ranked by visual importance)
1. **Tube architecture (upper ~55 % of the frame).** A horizontal drum tube seen almost straight down its axis. Vanishing
   point / golden glow at ≈ (615, 555), i.e. 71 % across, 36 % down: right of centre and high. Concentric polished gold
   rings with warm bulb rows: ring tops at y ≈ 215, 300, 370, 430, 490, 535 (about six visible rings, spacing shrinking
   roughly geometrically, ~0.75× per ring). The outermost ring's left arc reaches x ≈ 40; on the right the rings leave the
   frame. Between rings there are purple-to-magenta perforated panels with slot rows (wall sample RGB ≈ (250,119,250)), and
   the glow at the VP is ≈ (253,226,137).
2. **Thick S-river (lower ~60 %).** It starts at the VP (615, 575), swings right to (690, 605), back left through
   (520, 700) and (420, 760), passes behind Benny and spreads to the full frame width at the bottom. It has magenta outer
   bands: on the left from (0, 1090) curving to (300, 1536), sample ≈ (227,127,240); on the right from (650, 800) to the
   right edge at y ≈ 1080, sample ≈ (234,45,199). The centre is electric cyan ≈ (3,189,250), about 55–60 % of the river
   width at y ≈ 1300, with glossy WAVY white streaks that follow the S. The river is LEVEL: it reads as a horizontal
   stream going away from the camera.
3. **Benny** is big, lower-middle and slightly left: x 210–640, y 785 (pom-pom top) to 1215, centre x ≈ 425. A splash and
   ripple crown surrounds him.
4. **Five gold paddles**, upper-left, shrinking toward the VP: (185–340, 210–330), (65–245, 400–525), (345–430, 390–450),
   (440–500, 472–515), (515–552, 522–548).
5. **Foam clouds** (soft white-lilac, sample ≈ (135,158,243) in shadow): on the left bank (185–360, 850–1000) and
   (0–150, 1000–1110); a big right-bank mass (700–864, 1150–1420); a bottom ridge (430–700, 1350–1425).
6. **Coins**: one near coin at (610, 825), about 95 px wide (it is NOT huge), then a tidy line along the river's far
   curve: (505,745), (480,678), (530,650), (595,635) and on toward the VP.
7. About 12 large iridescent bubbles, mostly at the left and right edges.

## 2. Current vs blueprint (structural first, materials second)
Stage range seen by the audit: from the checkpoint at s = 273.06 to the stage end at 390.16, so **117 u**. The level stretch
lasts until the plunge top (s ≈ 310.4): **37 u = 32 %**. The vertical PLUNGE (s 310 → 389) is **79 u = 68 %** of the stage.
**The approved picture never depicts a plunge.** For about two-thirds of Screen 07 the camera therefore shows scenery the
painting does not contain.

* **a00 (approved view):** composition matches (projected approved pixels on the fitted tube). Rating ≈ 8/10.
* **f10 / f20 (level stretch):** the tube and VP stay roughly in place (the probe found the far ring within ±25 px of the
  painted VP up to 20 u). STRUCTURAL difference: the near river turns into long FLAT pink/cyan smeared bands, which is the
  river tile magnified ~10×. The painted S-curve with wavy glossy streaks is gone from the lower half. At f20 a cut-off gold
  paddle slab appears at the top-left. Foam banks are reduced to thin white lines. Material: walls are acceptable.
  Rating ≈ 6/10.
* **s_left_hard / s_right_hard:** a hard diagonal perforated wall edge at the frame bottom where the painting has a foam
  bank. Rating ≈ 5.5/10.
* **t33 (plunge top, s 312):** the frame is a flat wall plus a horizontal water edge. There are no rings or river S.
  Structurally unrelated to the picture. Rating ≈ 3/10.
* **t50 / t66 / t80 (plunge):** a SYMMETRIC tube seen head-on, VP at the frame centre (the painting has it at 71 % across),
  with rings converging. The river is a STRAIGHT vertical ribbon with parallel streaks, and white lather columns stand on
  both sides (at t80 they are still visible with m07foam). There is no S, no paddles, no foam clouds. The rings and the
  purple walls are the only painted elements. Rating ≈ 4/10.
* **t95 (08 inlet):** pink chamber, lather walls, coin column. Not the 07 picture. Rating ≈ 2.5/10 for 07 likeness (it is
  really the 08 hand-over).
* **Overall while swimming: ≈ 4.5/10** (time-weighted: 32 % at about 6, 68 % at about 3.5–4).

## 3. Foundation fix (scenery/look only; course, coins 91/2,240, movement and transitions unchanged)
1. **Level stretch (32 %): rebuild the near river as REAL geometry fitted to the painted S.** The river ribbon's edges come
   from the painted magenta/cyan boundaries cast on the water plane (river07.json already holds the centreline). It is
   textured with world-anchored tiles cut from the LEAST magnified painted band (y 1250–1500), with the streak direction
   following the S tangent. Raised foam-cloud bank meshes replace the lowest wall band, so hard steering shows foam, not a
   wall edge.
2. **Plunge (68 %): stop treating it as invented scenery. Make it the painted tube seen head-on.** The camera is already
   looking down a ring tube. Re-use the PAINTED tube look along the plunge axis: ring spacing ratio, the off-centre glow
   (shift the plunge's apparent VP toward 71 %/36 % of the frame by the tube shape, not by moving the camera), the
   paddles, and the painted S-river laid on the plunge floor as a winding S (look only: the game path stays straight; the
   painted S is a texture/geometry band on the ribbon). Remove the white lather columns completely (invented; the painting
   has soft foam clouds on low banks).
3. Keep coins at the painted size (m07coinsz) and fade coins that overlap Benny.

## 4. Honest ceiling
* Level stretch with fix 1: **7.5–8/10** reachable for free (approved pixels on fitted geometry). Magnified painted
  pixels soften within ~5 u of the camera; world-anchored tiles hide this only partly.
* Plunge with fix 2: **6–6.5/10 at best**. The painting shows a level stream into a horizontal tube. A 79 u vertical drop
  looked at from behind and above Benny can only imitate it, because the camera geometry is fundamentally different.
* **Whole stage, time-weighted: ≈ 6.5–7/10. 8.5 THROUGHOUT 07 IS NOT REALISTIC with the current course,** because 68 % of
  it is a plunge the approved picture does not show. Reaching 8.5 would need a course/camera change (shorter plunge, or a
  camera that looks along the tube like the painting during the drop). The user has forbidden changes to gameplay length
  and movement, so this must be the USER's decision, not ours. Nothing paid would solve it: a new plate cannot invent an
  approved design the user never painted.

INCOMPLETE: ring radii and spacing were read by eye, not fitted. `qa/match/07/rings/approved.json` holds the
specialist's fitted values and should be used instead.

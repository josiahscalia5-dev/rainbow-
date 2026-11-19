# BLUEPRINT 06 · CREST THE RINSE ARCH — independent review (reference-match-director, round 9, 2026-11-18)

Approved picture: `references/06_crest_the_rinse_arch.png` (864×1536). Overlay: `BLUEPRINT_06_overlay.png`. Coordinates were
read by eye from a 50 px grid (±20 px); colours are 12×12 px medians. Current version reviewed: branch
`claude/rainbow-s06-match-c9` @ `efaf78b7`, frames `qa/match/06/r7/RING6/` (full kept set, 7 shots) plus
`qa/match/06/r7/NEW/` for f03/t33/steer (kept set without rings/bubbles/foam).

## 1. Blueprint (ranked by visual importance)
1. **Off-centre tunnel mouth (upper right).** The outer gold ring has centre ≈ (650, 570), r ≈ 330: its left arc is at
   x ≈ 320, its top at y ≈ 235, and it leaves the frame on the right. The inner rings are r ≈ 215, 130 and 75, and their
   centres drift DOWN-RIGHT toward the glow at ≈ (700, 690) (81 % across, 45 % down). The tunnel bends down-right, where
   the river dives in. About 6–7 ring groups are visible; they are well spaced, with bright yellow lips (≈ (251,222,22)) and
   bulb rows, over lilac-violet perforated panels (≈ (94,39,143) inside).
2. **Large purple drum wall upper-left** (≈ 40 % of the upper half), pink-magenta with slot rows (≈ (235,97,194)), and **two
   gold paddles** at (205–370, 180–305) and (65–250, 345–455).
3. **WIDE river S-loop with the "crest" hole.** At the bottom the river fills the full width (cyan core ≈ (2,238,252)
   below Benny, magenta edges ≈ (224,62,247) left and (237,134,251) right with a soft rainbow sheen). It rises up-left
   (x 0–300 at y 600–750), crests across the top (y ≈ 510–560) carrying the coin arc, and curls right and down into the
   tunnel at ≈ (700, 700). Inside the loop there is a **hole showing purple wall** (≈ 300–560 × 575–720). A broad
   rainbow-sheen band also runs from (560, 700) down-right to the right edge at y ≈ 960–1060.
4. **Benny** is big, lower-middle: x 205–640, y 725–1195, hat 260–570 × 840–1010. He sits in a **round whirlpool ripple
   ring** (ellipse ≈ 150–700 × 1110–1230).
5. **Foam clouds**, puffy white-lilac (≈ (224,219,252)): top-left by the crest (0–250, 470–570), left (0–135, 995–1250),
   right (700–864, 1090–1420), bottom-left (0–240, 1440–1536).
6. **Coins**: a big arc along the crest, (268,715) (180,622) (235,545) (320,520) (405,532), then shrinking into the tunnel
   (505,585) … (680,685).
7. Many iridescent bubbles (≈ 15), mostly left.

## 2. Current vs blueprint
Audit range: checkpoint s = 198.91 to stage end 242.87, so **44 u**.

* **a00:** composition matches (projection). Benny renders larger and higher than painted. ≈ 8/10.
* **From f06 (6 u = 14 % of the stage) to t66 the composition is REPLACED.** `m06cam` aims the camera down the tunnel
  axis, so the tunnel becomes a CENTRED BULLSEYE (VP at ≈ 50 % across / 27 % down instead of 81 % / 45 %). The rings fill the
  whole upper half symmetrically, with 15+ tightly packed rings instead of 6–7 spaced ones. The purple wall with the two
  paddles, the crest loop and its hole, the coin arc over the crest, and the right rainbow band are all gone. The river
  is a STRAIGHT wide ribbon falling away with vertical speed streaks (no S-loop) and white cloud foam on both banks.
* **The painted composition is seen for only ≈ 3–6 u of 44 u (≈ 10 %).** About 90 % of Screen 06 shows an invented
  symmetric tunnel plus a straight ribbon. The real modeled rings and the foam are good MATERIALS on the WRONG LAYOUT. This
  is exactly the user's complaint: "an incorrect tunnel made shinier".
* **t95:** the camera is inside rings swinging left (the 06→07 turn). Not depicted.
* **Steering hard:** foam bank under Benny, rings centred. Not depicted.
* Ratings: approved view ≈ 8/10; **swimming ≈ 4.5/10**. I disagree with the r7 lead estimate of 7/10: the colours and
  rings are right, the structure is not.

## 3. Foundation fix (look only; course, coins 91/2,240, movement and transitions unchanged)
1. **Hold the painted composition ahead of Benny.** Do this with forced perspective about the approved camera, not by aiming
   the camera down the axis. Build the tunnel as the PAINTED bent tube: an off-centre mouth whose axis curves down-right,
   ring centres fitted to the painted drift (650,570) → (700,690), ring spacing solved from the painted radii (≈ 0.62–0.65×
   per ring), and only the painted number of rings. Scale or recede it with the camera's travel so the mouth stays at
   ≈ 75–80 % across for most of the stage. Keep the large purple wall and the two paddles as real geometry on the left.
2. **Rebuild the river as the painted S-loop in 3D:** a wide ribbon that rises left, crests (with the coin arc on it) and
   curls right into the mouth, plus the hole inside the loop showing wall. Use world-anchored painted water. This is look
   geometry; the gameplay path and coins stay where they are. Where the course is straight, the painted loop is shown as
   the scenery ahead, and the straight ribbon with vertical streaks is removed.
3. The whirlpool ripple ring around Benny while swimming (painted, not the vertical speed streaks).
4. REMOVE the invented elements: the centred dense ring stack, the straight streak ribbon, and the pale VP disc (already
   gone).
5. `m06cam` should be REVISITED. It fixed "looking straight down at the water", but it also created the centred bullseye. A
   camera change counts only if the scenery cannot be lined up otherwise. Here the scenery CAN be lined up (fix 1), so the
   aim should stay close to the approved camera's yaw (≈ the mouth right of centre).

## 4. Honest ceiling
* With fixes 1–3 and the free method: **≈ 7–7.5/10 over the first ~70 % of the stage**. The 06→07 turn (last ~25 %) is not
  depicted, and the camera must follow it, so it stays ≈ 5–6.
* **Time-weighted ≈ 6.5–7/10. 8.5 throughout is NOT realistic** with the current course: the painting shows a crest/loop
  that the course's straight-ish 06 path does not actually ride, and the stage ends in a turn the painting never shows.
  Reaching 8.5 would need the course to ride the painted loop. That changes movement, so it is the user's call. No paid
  job would fix this.

INCOMPLETE: there are no ring-radius fits on the approved pixels (read by eye). There is no full 12-shot audit of the kept
set (RING6 has 7 shots; t33 and steer were judged from the r7/NEW set without rings).

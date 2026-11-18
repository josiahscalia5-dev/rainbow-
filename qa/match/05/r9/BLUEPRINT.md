# Screen 05 — BLUEPRINT (round 9, lead order "BLUEPRINT → FOUNDATION → REPRODUCE")

Measured, not estimated. Approved picture: `/home/user/wt/s05/references/05_flow_into_the_current.png` (864 × 1536,
vanishing point (497, 478)). Game frames = the current kept query
`?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1`, rendered
with the measured 3D edges: `/home/user/wt/s05/qa/match/05/r9/blueprint/kept/<shot>.png` + `<shot>.geo.json`.

Tools: `tools/match05/blueprint05_game.mjs` (screenshot + projected 3D river edges, course centre, rings, throat per
shot), `tools/match05/blueprint05.py` (approved: region masks of `qa/pilot05/full_reference_match/masks`; game: the
projected 3D edges; magenta / cyan shares by colour inside the river), `tools/match05/channel05.py` (painted channel
read from the approved design E — first attempt, see "limits").

Annotated overlays (yellow = river edges per row with width label, green = river centre line, magenta squares = bank
band centres, orange = gold ring circles, blue = throat):
* APPROVED: `/home/user/wt/s05/qa/match/05/r9/blueprint/APPROVED_overlay.png`
* game: `/home/user/wt/s05/qa/match/05/r9/blueprint/{a00_approved_view,f10_forward10u,f20_forward20u,t33_through_screen,t66_through_screen}_overlay.png`
* all numbers: `/home/user/wt/s05/qa/match/05/r9/blueprint/blueprint.json`, `painted_vs_course.txt`

## 1. The approved picture (the blueprint)

### River per screen row (W = width px, C = centre x, mag / cyan = share of the river's pixels, foam = foam bank px beyond each edge)
| y | W | C | magenta | cyan | foam L / R |
|---|---|---|---|---|---|
| 540 | 217 | 486 | 0.18 | 0.46 | 56 / 0 |
| 580 | 285 | 432 | 0.36 | 0.39 | 38 / 69 |
| 600 | 418 | 446 | 0.28 | 0.47 | 40 / 28 |
| 630 | 524 | 480 | 0.30 | 0.46 | 67 / 23 |
| 660 | 536 | 534 | 0.29 | 0.44 | 40 / 27 |
| 700 | 578 | 554 | 0.24 | 0.47 | 129 / 17 |
| 750 | 673 | 466 | 0.30 | 0.48 | 78 / 58 |
| 800 | 737 | 400 | 0.47 | 0.36 | 29 / 43 |
| 900 | 765 | 382 | 0.27 | 0.38 | 0 / 46 |
| 1100 | ≥ 863 (frame) | — | 0.36 | 0.55 | foam piles at the frame edge |
| 1300 | between frame pieces | — | 0.25 | 0.56 | — |

* S centre line: C swings 432 → 554 → 382 px between y 580 and 900 (the painted S, amplitude ≈ ±85 px), then runs out
  of the frame under Benny. Magenta bank bands hold 24–47 % of the river everywhere from the far bend to the bottom
  frame; the cyan lane 36–56 %.
* Banks: the painted river is edged by white foam piles 17–129 px wide on a low shelf, then the purple slotted wall
  rises directly behind them (left wall visible down to y ≈ 1000, right wall down to y ≈ 950).
* Tunnel: gold ring tops at 165 px and 257 px above the vanishing point (rings B, A); the throat glow ≈ 28 px radius at
  (497, 478); the far rings shrink geometrically into it.

### Painted river edges back-projected onto the game river (locked eye, `painted_vs_course.txt`)
| screen y | s | course half width | painted left edge (lat, u) | painted right edge (lat, u) |
|---|---|---|---|---|
| 580 | 173.6 | 5.30 | −7.58 | +3.34 |
| 600 | 165.6 | 4.84 | −7.01 | +5.78 |
| 630 | 157.6 | 4.93 | −5.88 | +6.94 |
| 660 | 152.3 | 5.38 | −4.23 | +6.76 |
| 700 | 147.4 | 5.70 | −3.87 | +5.87 |
| 750 | 143.4 | 5.53 | −5.48 | +3.69 |
| 800 | 140.6 | 5.63 | −5.99 | +2.67 |
| 900 | 136.9 | 5.62 | (frame edge) | +2.33 |
Painted channel centre relative to the course centre: −1.7 (s 140.6) → +1.3 (s 152) → −2.1 (s 173.6) u; painted width
8.7–12.8 u vs course width 9.7–11.4 u. Benny's steering reach (audit, full steer 12 u in): lat ±5.06 at s 145.

## 2. The same quantities in the current game frames (kept query)
River width in px at the same rows (approved → a00 · f10 · f20 · t33 · t66; game = projected 3D edges of the water
surface, so a width beyond 864 = the water runs off-screen wall-to-wall):
| y | approved | a00 | f10 | f20 | t33 | t66 |
|---|---|---|---|---|---|---|
| 700 | 578 | 729 | 653 | 614 | 611 | 568 |
| 750 | 673 | 877 | 857 | 752 | 757 | 649 |
| 800 | 737 | 1063 | 1049 | 907 | 923 | 830 |
| 900 | 765 | 1372 | 1372 | 1252 | 1283 | 1261 |
| 1000 | ≥ 863 | 1671 | 1674 | 1609 | 1649 | 1525 |
Magenta share of the lower river while swimming (y 1100 / 1200 / 1300 / 1400): approved 0.36 / 0.00 (Benny) / 0.25 /
0.00 (frame) — f10 0.00 / 0.00 / 0.00 / 0.01, f20 0.06 / 0.00 / 0.00 / 0.01, t33 0.03 / 0.00 / 0.00 / 0.01, t66 0.09 /
0.07 / 0.08 / 0.11. Throat: 31–34 px radius at (498–499, 478–482) in every frame (approved 28 px at (497, 478)).
Rings at the locked view: 158 / 267 px (approved 165 / 257 px).

## 3. Structural mismatches (biggest first)
1. **The water surface is the wrong shape.** The game's river surface is the full course width at every row (wall to
   wall, 9.7–11.4 u, flat), centred on the course. The painted river is an S-channel whose edges swing ±2–3 u across
   the course: at s 137–143 its right bank is only 2.3–3.7 u right of the course centre (the painted right foam pile and
   wall chunk therefore lie ON flat water in the game — the right-side slab / pale shelf when swimming), at s 152–174
   the painted water reaches 1–2.5 u BEYOND the course's left edge (where the game has the foam berm, the apron strip
   and the tube wall — painted water ends up on those surfaces). At the locked eye the projection hides this; any
   other viewpoint shows texture stretched over a surface of the wrong shape.
2. **The lower river while swimming has no magenta banks** (0–11 % magenta vs 25–36 % painted at y 1100–1300): a broad
   cyan sheet. The approved picture holds the near water only in a narrow strip between the bottom frame pieces
   (E's near rows span u −0.26…+0.28 at s 129.7); riding exposes river that the picture never showed.
3. **No bank geometry.** The painted foam piles sit on a low shelf where the walls meet the water; the game has no
   raised bank — painted foam lies flat on the water (pale shelves) and the walls meet flat water.
4. **The left-bank lilac slab at t66** (x 0–380, y 560–760) is the far wall's real-scale part (probe: s 184–188,
   lat −7…−8, 0.3–2 u above the water) wearing the approved bay row whose waterline texels hold painted water / foam,
   magnified 3–6×, plus the edge of the foam berm and the real tube wall.
5. **Walls** are the approved pixels projected per bay; swimming magnifies them 2–6× (smeared slots).
6. **Far tunnel / far river** (m05far) is re-laid for the live eye every frame — per the user's ruling an illusion,
   not a world-fixed place (kept as a switch only).

## 4. Decision needed before a faithful world-fixed river (not taken by me)
A world-fixed water channel with the PAINTED proportions puts the painted right bank at lat +2.3…+3.7 (s 137–143)
while Benny can steer to lat +5.06 there, and the painted left water 1–2.5 u outside the course (s 152–174). Without
changing the course meander / steering range (forbidden without the user's OK) the options are:
* (a) visual channel follows the painted S; inside Benny's reach the bank is only a low foam shelf (≤ 0.25 u, Benny
  stays visible, never sinks), it rises into the wall only beyond lat ±5.1; on the left (s 152–174) the water surface is
  widened visually over the tube floor;
* (b) re-fit the course meander to the painted centre line (gameplay change → user's permission);
* (c) keep the course-width water and paint the banks as foam on it (today's state).
My recommendation: (a) — it keeps gameplay untouched and gives the painted S its real 3D banks where Benny cannot go.

## 5. Foundation plan (world-fixed; does not use m05ride / m05far)
1. `&m05geo=1`: world-fixed visual river from the back-projected painted edges (table above, densified from the region
   masks — `channel05.py` on E is not reliable yet: pink-tinted foam piles read as water): bank shelf + rise into the
   tube wall (option a), the approved design E world-anchored on it (no Benny offset), the crisp tile only as fine
   detail (not as layout).
2. World-anchored rectified purple wall material (the `m05wall` slot pattern without the projection where magnified).
3. Real-scale world-fixed far tunnel with modeled rings at the painted spacing instead of the live-eye block.

## Limits / what was NOT done
* Per the user's correction (keep what works: m05ride / m05far stay), `&m05geo=1` was built ON the kept set: banks
  raised beyond the painted edge, laid out Benny-relative like the design. Tried, NOT kept: forward frames barely change
  and on hard right steering a large stretched slab rises in front of Benny (the painted right bank lies inside the
  steering reach) — pictures in `qa/match/05/r9/tried_m05geo/`. The steering-reach conflict of §4 needs a decision first.
* `channel05.json` (E-based channel) over-reads water where foam piles are pink-tinted; use the region-mask
  back-projection (`painted_vs_course.txt`) as the reference until a better channel extraction exists.

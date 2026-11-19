# Screen 05 "FLOW INTO THE CURRENT": director review, wave 6 (review only, no source changes)

Reviewer: reference-match-director, 2026-11-15. Scope: the approved reference against the live Three.js game at the
locked checkpoint `05_crest` (camera LOCKED, VP Δ 1.4 px; S-curve refitted to the coin trail).

## 0. Inputs and method

| Image | File | Notes |
|---|---|---|
| Approved target | `qa/pilot05/wave6/proof/1_approved_reference.png` | sha256 `d3f339d4…44dd`, identical to `references/05_flow_into_the_current.png` (checked; neither touched) |
| Blender layout | `qa/pilot05/wave6/proof/2_blender_layout.png` | geometry skeleton only; judged as geometry (§9) |
| Live game | `qa/pilot05/wave6/proof/3_threejs_gameplay.png` | the real running game; this is what counts |
| Overlay / report | `qa/pilot05/wave6/proof/4_overlay_50pct_game.png`, `proof/report/*` | report: mad 59.0, hue_corr 0.81, edge_corr 0.12 |

* All numbers come from `python3 -I qa/pilot05/wave6/director/measure_review05.py` (writes `measurements.json`)
  and `scripts/landmarks05.py` (outputs `lm_ref.json`, `lm_game.json` here). Both images go through the same
  colour thresholds. These are **crude colour/geometry measurements that locate and describe elements. They are
  not a fidelity score.** Where a value was read by eye from a tick-marked crop, it says "≈ (read)" (±10–15 px).
* "Share of frame |Δ|" = that zone's part of the summed per-pixel mean |ΔRGB| at 1/4 scale (4×4 box mean; whole
  frame 60.8; the report's 59.0 uses a different resize). It ranks zones by "area × how different". It is not a
  percentage of similarity.
* Colour classes (HSV): gold/warm metal, dark (slots), white, cyan/blue, violet (h 235–292), magenta/pink
  (h 292–345). Map: `crops/classmap_ref_vs_game.png` (reference left, game right).

## 1. Per-element verdict (one line each)

| Element | Verdict | Key measured evidence |
|---|---|---|
| Camera / VP | **Matches** (locked) | VP (498.6, 479.4) vs (499.1, 478.0) |
| Coins 1–4 (near) | **Close** | Δ ≤ 14 px position, Ø −3…−7 px (camera_lock README) |
| Coin trail into the VP | **Missing** | Reference: 11 tiny coins (2–12 px) at y 479–492 curling across x 456–518. Game: 0; one coin off-trail at (580, 541) |
| Mid-field S-curve (y 700–850) | **Close** | Pink band edges agree within ≈0–50 px (§5) |
| Far river near the VP (y 498–534) | **Wrong shape** | Reference water centre winds 495→540→484 px. Game is straight at x 496–500 with 3 parallel stripes |
| Near-field bands (y ≥ 950) | **Wrong** | Game keeps two vertical pink sheets (x≈100–210 / 640–780). In the reference the bands have left the frame and the channel is cyan |
| Tunnel rings | **Wrong profile, colour, spacing** | Flat clipped orange tori (V≡1.0) vs copper collars with lips and a yellow highlight line; ring #2 +16…+23 px; one extra ring; yellow/purple "target" at the VP |
| Walls | **Wrong material** | Violet share of wall 2–28 % vs 29–47 %; specular-white 0.5–2 % vs 5.6 %; slots 2× more slender with bright rims |
| Lids | **Wrong shape and material** | Flat orange slabs (V std 0.008–0.057) vs copper drums (0.16–0.20); R1 ≈ 99×47 vs 146×130 px |
| Distant light | **Too big, too pale** | Glow radius 22/32 vs 13/20 px; hot core 289 vs 115 px |
| Near gold frame ring | **Missing** | Reference gold 44 / 51 / 38 % in the BL / BR / bottom-arc windows; game 0 % |
| Foam | **Too much, too white** | Right bank foam 38.5 % vs 15.6 % of the window; pure-white share 50–63 % vs 27–28 % |
| Benny | **Preserved** (no regression) | Pom top 774/774; hat/body split 1032/1023; bottom 1188/1182 |
| Water colour (near) | **Darker, fewer glints** | (6,141,238) vs (1,163,246); white glints 2.5 % vs 9.9 % |

## 2. (a) Tunnel rings

Crops: `crops/tunnel_upper_ref_vs_game.png`, `crops/left_wall_ref_vs_game.png`, `crops/vp_rings_ref_vs_game.png`,
`crops/vp_core_x6_ref_vs_game.png`.

**Radii about the VP** (warm-band crossings on the vertical above the VP, x 497–501, confirmed on 60°/120° rays):

| Ring | Reference r (px) / width | Game r (px) / width | Δ |
|---|---|---|---|
| #1 | 251–290 / 39 | 256–286 / 30 | ≈0, 9 px thinner |
| #2 | 164–179 / 12–16 | 180–202 / 18–22 | **+16…+23**, thicker |
| #3 | 98–110 / ≈10 (shaded, pinkish copper) | 108–121 / 9–11 | +10 |
| — | none | **74–84 / 7** | **extra ring** |
| #4 | 57–68 / 9–10 | 58–64 / 5–6 | ≈0 |
| core | r 8–48: one continuous warm orange well (97–100 % warm, 0 % purple) | ≥3 thin yellow lines r 31–52; r 32–64 is 34–37 % purple | "target" look |
| Distinct rings, VP → title bar | 4 + warm core | 7 | +3 |

The reference radius ratios are steady (287/178/108/67 → 1.61, 1.65, 1.61). The game's are uneven (1.43, 1.67, 1.48, 1.29, 1.26):
there are extra rings toward the VP.

**Cross-section and colour** (horizontal profile y 448–452 through the 2nd-left ring; vertical profile x 499):

| | Reference | Game |
|---|---|---|
| Profile (y 450) | x 201–240: lip (245,95,86) h3 → orange (251,121,13) h27 → **highlight line (255,219,122) h44, x 216–231** → (253,136,95) → lip (210,81,91) h355 | x 117–156: (255,158,0) h37 flat, S≈1.0, a faint (255,180,112) smear, **no lips** |
| Hue (band median) | 2–28° (copper / rose-gold); yellow only on the highlight line | 25–31° near rings (saturated orange); 39–44° far rings (pale yellow (255,226,152)) |
| Value | lips V 0.67–0.85, core 0.96–1.0 | V = 1.00 across the whole band (clipped) |
| Contours | dark copper lip both sides; recessed groove lines; collar sits flush on the wall | none: a round tube in front of the wall, reads as a plastic hoop |

**Correction to the wave-6 coordinator table, item 1:** the reference rings are **not yellow-gold overall**. Their median hue is
copper (≈ 3–20°). Only the thin highlight line is yellow (h 36–46°). Making the rings yellower would move them away from
the reference. The game's far rings (h 40–44) are already too yellow.

**Area accounting** (tunnel zone): ring/lid pixels coincide on only **2.4 %** of the frame. Game-only ring pixels cover 5.5 %
(mean |Δ| 98.7, 9.0 % of the frame |Δ|) and reference-only collars 4.7 % (5.9 %). Rings and lids together carry ≈ **16.5 %** of
the frame |Δ|.

## 3. (b) Metallic purple walls

Crops: `crops/left_wall_ref_vs_game.png`, `crops/right_wall_ref_vs_game.png`, `crops/lid_left_ref_vs_game.png`.

| Window (same pixels in both) | Ref violet share of wall | Game | Ref hue / RGB median | Game hue / RGB median | Ref specular white | Game |
|---|---|---|---|---|---|---|
| upper x300–700 y190–300 | 29 % | 28 % | 304° (171,44,177) | 295° (186,42,196) | 5.6 % | **0.5 %** |
| left x0–130 y420–620 | 37 % | **2.4 %** | 298° (188,51,205) | 304° (193,33,183) | 5.6 % | **2.0 %** |
| inner annulus r60–150 | 47 % | **14 %** | 292° (154,46,166) | 299° (188,45,185) | 3.3 % | 2.2 % |
| inner annulus: gold fraction | 5.1 % | **25.2 %** | | | | |

| Slots (dark components, y 190–540, r > 60) | Reference | Game |
|---|---|---|
| Count | 128 | 152 |
| Median area | 25.5 px | 40 px |
| Elongation (major/minor) | **4.3** (plump capsule) | **8.8** (thin slit) |
| Long axis ring-wise | 88 % | 100 % |
| Slot core V | 0.22 | 0.17 |
| 3-px rim V | **0.58** (shaded lip) | **0.75** (bright pink dotted outline, aliased) |
| Wall edge energy running toward the VP (streaks) / ring-wise | 14.6 % / 51.3 % | 9.1 % / 61.1 % |

Reading: the reference wall is a violet metal. Magenta appears only where light hits, short white-pink highlight streaks sit on every
panel, and the slots are dark plump capsules. The game wall is almost uniformly magenta with a marbled/swirl reflection
(visible in the crops), very few white highlights, and thin slits with bright pink outlines. Wall pixels present in both
images: 13.8 % of the frame, mean |Δ| 52.8, **12.0 % of the frame |Δ|**.

## 4. (c) Water boundaries (wall → foam/river edge)

Method: manual read of `crops/row_strips_ref_vs_game.png` (2× zoom, x ticks) checked against the class-run lists. ±15 px.
(The automated markers in `crops/banks_ref_vs_game.png` are noisy where bubbles sit on the bank.)

| y | Ref left bank | Game left | Δ | Ref right bank | Game right | Δ |
|---|---|---|---|---|---|---|
| 560 | ≈230 | ≈360 | **+130** | ≈600 | ≈652 | +52 |
| 600 | ≈190 | ≈265 | +75 | ≈689 | ≈684 | ≈0 |
| 650 | ≈165 | ≈145 | −20 | ≈800 | ≈822 | +22 |
| 700 | ≈136 | ≈62 | −74 | foam from ≈849 to edge | foam from ≈822 to edge | −27 |
| 750 | ≈48 | 0 (foam reaches the edge) | ≈−48 | foam 804–863 | **water to the edge** | — |
| 800 | wall gone | wall gone | — | foam ≈770–810, wall from ≈811 | **foam heap 705–863, no wall** | — |
| 900 | (pink band at edge) | (pink band at edge) | — | wall ≈812–863 | foam heap 683–836, water at edge | — |
| 1100 | river to edge | river to edge | — | river to edge | river to edge | — |
| 1300 | **gold frame inner edge ≈65** | none (pink sheet to x 0) | — | **gold from ≈790** | none | — |
| 1400 | gold frame to 139 | none | — | gold from 704 | none | — |

How far down the purple wall reaches at the frame edge (class runs down columns x = 12 / 850): left wall ends at **y ≈ 771
(ref) vs ≈ 728 (game)**; right wall ends at **y ≈ 900–960 (ref) vs ≈ 664 (game)**. So the reference shows ≈ 250 px more right-hand
wall. In the game, a white foam heap plus water fill that area.

Foam (S < 0.3, V > 0.75):

| Window | Ref coverage / median / pure-white share | Game |
|---|---|---|
| left bank x0–330 y560–800 | 19.9 % / (241,218,254) lavender / 27 % | 26.3 % / (248,240,255) / **63 %** |
| right bank x620–864 y560–960 | 15.6 % / (247,219,255) / 28 % | **38.5 %** / (245,237,255) / **50 %** |

In the reference, the foam is a low lavender-shaded rim of small bubbles. In the game it is white sphere heaps, and the far
section also has grey flat planes (`crops/far_river_ref_vs_game.png`, x≈600–650 y≈540–590, and the sides of the far strip).

## 5. (d) S-curves

Hot-pink runs per row (`landmarks05.py` thresholds, runs ≥ 10 px). Reference vs game:

| y | Ref left band | Game left band | Ref right band | Game right band | Comment |
|---|---|---|---|---|---|
| 700 | 309–386 | 218–396 | 759–802 | 709–794 | close |
| 750 | 210–292 | 138–277 | 709–802 | 686–847 | close (game wider) |
| 800 | 56–182 | 62–205 | 608–698 | 628–689 | **close** |
| 850 | 9–129 | 8–209 | 570–668 | 624–663 | left ok, game band wider |
| 900 | 0–54 (leaving frame) | **0–203** | 595–707 | 655–682 | game left band does not leave |
| 1000 | none (cyan 20–282) | **90–186** | 706–863 (leaving) | 728–857 | |
| 1100 | **none** (cyan 25–245) | **102–211** | **none** (cyan 570–804) | **641–777** | vertical sheets in game |
| 1200 | none | 108–177 | none | 652–755 | |
| 1300 | 124–203 (diagonal wake) | 0–138 | 616–699 (diagonal wake) | 666–798 | ref wake streaks fan out from Benny |
| 1400 | none (gold frame) | 5–80 | none (gold frame) | 688–837 | |

**Far river (y 498–534, cyan-pixel centre per row):**
* Reference: 495 → 504 → 505 → 540 → 538 → 484 → 480 → 500. It winds about ±30 px, and the coin trail curls left across
  the VP at y 479–492.
* Game: 498, 499, 499, 498, 496, 498, 500 (straight). It shows three parallel cyan stripes plus pink stripes, and the width
  grows linearly from 36 to 98 px. This reads as the straight 06 strip.

The Blender layout shows the same straight raised strip entering a dark tunnel-end hole (§9). So the straightness is in the
geometry (far tunnel / far river block), not only in a shader. Small area (0.8 % of the frame |Δ|), but very visible.

## 6. (e) Benny (preserved, no regression)

Crop: `crops/benny_ref_vs_game.png`. Column profile at x ≈ 422:

| | Reference | Game | Δ |
|---|---|---|---|
| bbox (camera_lock README) | x 230–612, y 767–1185 | x 231–612, y 766–1196 | bottom +11 |
| Pom-pom top | 774 | 774 | 0 |
| Cream stripes | 900–918, 960–978 | 894–906, 948–966 | −6…−12 |
| Hat/body split (cuff bottom) | ≈1032 | ≈1023 | −9 |
| Body bottom | ≈1188 | ≈1182 | −6 |
| Cuff (violet) at y 1000 | x 290–567 | x 275–541 | −15 / −26 |
| Fur at y 1100 | x 292–552 | x 272–568 | +36 wider (spikier strands) |
| Fur colour (x330–520 y1060–1150) | (246,76,171) V 0.96 | (255,73,180) V 1.00 | game clipped; no shading toward the bottom (ref V falls to ≈0.55 by y 1176, game stays ≈1.0) |

Verdict: identity, size and placement are preserved. Remaining differences are lighting (no bottom/contact shading), slightly
spikier fur and pinker cream stripes. These are not regressions, and benny-character-artist is not running this wave.

## 7. (f) Distant golden light

| | Reference | Game |
|---|---|---|
| Hot core (`landmarks05`) | 115 px, 17×12 | **289 px, 19×19** (2.5×) |
| Glow radius, mean lum < 0.85 / < 0.75 | 13 / 20 px | **22 / 32 px** |
| r 16–24 mean RGB | (248,169,89) orange | (255,220,139) pale yellow |
| r 24–32 | (244,134,76) | (254,203,126) |
| r 32–48 | (229,111,81), 99 % warm, 0 % purple | (230,142,114), 63 % warm, **37 % purple** |

The reference light is a small warm point inside a deep orange-lit tunnel throat with sun-ray streaks. The game light is a
larger pale disc inside alternating yellow/purple rings.

## 8. Lids, coins, near gold frame, HUD

**Lids** (bboxes ≈ (read) from `crops/lids_ticks_ref_top_game_bottom.png`; colour from lid-only samples):

| | Reference | Game |
|---|---|---|
| L1 | x 62–215, y 318–420 | x 0–128, y 300–395 (≈ −75 px x) |
| L2 | x 248–332, y 418–470 | x 190–283, y 388–430 |
| R1 | x 718–864, y 395–525 (146×130) | x 727–826, y 385–425 (99×40–47) |
| R2 | x 630–697, y 393–450 | x 657–722, y 428–460 |
| Visible count | ≈7 | ≈9–10 (stack down to the VP) |
| Colour L1 / R1 | (229,91,93) h3, (246,130,114) h13; S 0.58–0.69; V std 0.20 / 0.16 | (255,139,29) h28, (255,126,36) h24; S 0.86–0.89; **V ≡ 1.0, std 0.008 / 0.057** |
| Shape | short copper drums seen from below: visible bottom face, rim, specular band | flat lozenge slabs, no face or rim |

**Coins:**

| | Reference | Game |
|---|---|---|
| Discs ≥ 20 px on the trail | 6 (y 726, 661, 612, 574, 546, 533) | 6 (coins 1–6 in README; `landmarks05` merges 4+5) |
| Tiny coins into the VP (y 479–492) | **11** | **0** |
| Off-trail | — | 1 at (580, 541) on the right foam bank |
| Coin 1 face colour | (252,214,15) h49, S 0.94, dark rim | (255,198,82) h40, S 0.68, V clipped |

**Near gold frame ring:** reference gold fraction 44 % (BL x0–200 y1250–1536), 51 % (BR), 38 % (bottom arc x200–664
y1440–1536). Game 0 % in all three. Crops: `crops/corner_bl_ref_vs_game.png`, `crops/near_field_ref_vs_game.png`.
Near-channel water (x250–600 y1230–1500): ref (1,163,246) h200 with 9.9 % white glints; game (6,141,238) h205 with
2.5 % glints and horizontal "∩" ripple arcs.

**HUD** (outside this review's scope; 11.2 % of the frame |Δ|, partly wall behind it): the game's coin icon is x 451–490
(centre 472,64), while the reference's is x 378–459 (centre 418,59). The game icon is about half the diameter and 54 px to the right.

## 9. Blender layout (`2_blender_layout.png`), geometry only

* Tube, ring markers, river surface and coin anchors agree with the game's geometry: game ring #1 (y 192–222 at x 499) ≈
  layout marker at y ≈ 210; ring #2 (276–294) ≈ marker ≈ 270–285. Coin anchors follow the refitted S-trail.
  Crop: `crops/blender_vs_game_rings_x300-700_y60-500.png`.
* The layout's walls reach the frame edge to y ≈ 790 (left) and ≈ 700 (right), the same as the game and short of the
  reference's right wall (≈ 900–960). The **wider-river/short-right-wall difference therefore lives in the geometry** (ribbon
  width or tube radius at u ≈ 25–45), not in foam.
* The far end is an open dark hole with a straight raised river strip running into it. There is no winding far river and no ring stack. This
  confirms that the straight far river comes from the far-section geometry.
* There is no near collar in front of the camera, so the missing bottom gold frame is a missing object, not a material issue.

## 10. Where the difference is (whole frame, ranked by share of |Δ|)

| Zone (fixed pixels, same in both) | Area | Mean \|Δ\| | Share of frame \|Δ\| |
|---|---|---|---|
| **Near field y ≥ 1000 (excl. Benny)** | 28.9 % | 69.5 | **33.1 %** |
|   of which: reference gold frame pixels | 6.1 % | **112.7** (highest in frame) | 11.3 % |
|   of which: game pink where ref not pink | 2.8 % | 89.6 | 4.2 % |
|   of which: water vs water (darker, fewer glints, ripple arcs) | 19.7 % | 52.9 | 17.2 % |
| **Tunnel above banks** | 27.1 % | 65.1 | **29.0 %** |
|   rings/lids (game-only 9.0 + ref-only 5.9 + both 1.6) | 12.6 % | — | **16.5 %** |
|   wall vs wall (material) | 13.8 % | 52.8 | **12.0 %** |
| River y < 1000 (excl. Benny) | 18.9 % | 55.6 | 17.3 % |
|   game foam where ref has none / band mismatch / ref wall where game has river / texture / far strip | | | 4.1 / 4.0 / 3.2 / 3.1 / 0.8 % |
| HUD y < 185 | 12.0 % | 57.0 | 11.2 % |
| Benny box | 13.1 % | 43.8 | 9.5 % |

## 11. The three biggest remaining differences

### #1 Near field: no gold frame, pink sheets, darker water (33.1 % of frame |Δ|)
* **What (measured):** the reference's bottom-corner and bottom-arc gold collar (gold 44 / 51 / 38 %) is absent (0 %). These are
  the most-wrong pixels in the frame (mean |Δ| 112.7). Pink bands stay on screen as vertical sheets (x≈100–210 / 640–780,
  y 1000–1250) where the reference is cyan. Water is (6,141,238) vs (1,163,246), and white glints are 2.5 % vs 9.9 %.
* **Why:** composition/geometry. No ring intersects the near frustum at the checkpoint (confirmed: absent from the Blender
  layout too). Water shader: the band mask keeps fixed lateral offsets toward the camera, and the ripple arcs come from the ribbon pattern.
* **Fix (real 3D):**
  (a) **washer-environment-modeler** (`tube.ts` ring placement, same lathe profile and material as fix #2): place one ring so
  its inner edge projects through ≈ (65,1300), (139,1400) left, ≈ (790,1300), (704,1400) right and a bottom arc at y ≈ 1440–1536
  (x 200–664). This is an inner radius ≈ 930–990 px from the VP. Pinhole estimate: ≈ 1.3 tunnel radii ahead of the camera (f = 768/tan 31° ≈
  1278 px; ring #1 at r ≈ 287 px ≈ 4.5 R). Confirm by back-projection through `camera_lock/camera05.json`. Do this
  by re-phasing the ring sequence, not with a one-off prop, so the ride stays consistent; run the ride check.
  (b) **water-fx-specialist** (`waterRibbon.ts`, `glsl.ts`): near the camera (below Benny) increase the band lateral offset
  so the left band leaves the frame by y≈950 and the right by y≈1050. Keep the centre channel cyan. Add the two diagonal
  wake streaks from Benny's sides (y 1250–1350, x 124–203 / 616–714). Lift the water toward (0,163,246) and raise the white
  streak/star-glint coverage toward ≈ 10 %. Remove the concentric "∩" ripple arcs.

### #2 Rings, lids and the VP ring stack (≈ 16.5 % of frame |Δ|, plus the "target" look)
* **What:** the tori are flat clipped orange (h 25–37, S 0.85–1.0, V ≡ 1.0) with no lips. The reference collars run
  copper lip → orange → yellow highlight line → copper lip. Ring #2 is at r 180–202 vs 164–179, there is one extra ring at
  r 74–84, and r 32–64 has 37 % purple stripes vs a warm throat. Lids are flat slabs (V std ≤ 0.06 vs 0.16–0.20); R1 is ≈ 1/3 of the area.
  Glow radius is 22 vs 13 px.
* **Why:** geometry (torus cross-section, ring phase/count, far-block ring density, slab lids) plus material (unlit/clipped
  saturated orange; no environment-driven highlight).
* **Fix:** **washer-environment-modeler**: replace the torus with a `LatheGeometry` collar (flat band ≈ 1.6:1 width:thickness,
  raised lip each side, recessed groove, outer face flush with the wall). Use a copper PBR material (base ≈ sRGB (232,110,70),
  metalness 1, roughness ≈ 0.25, no emissive) lit so only the highlight line reaches V ≈ 1 (h ≈ 44). Re-phase the near rings to
  r ≈ 287/178/108/67. Lids become bevelled drums (radius:height ≈ 3:1) in the same material at the L1/L2/R1/R2 boxes in §8.
  **path-camera** (far block): drop the extra thin rings inside r ≈ 120 px, tint the far throat warm (≈ (229,111,81)
  at r 32–48 px), and shrink the glow sprite by ≈ 40 % in radius.

### #3 Wall material (12.0 % of frame |Δ| where both show wall; reads as "marbled magenta")
* **What:** violet share 2–28 % vs 29–47 %; specular-white 0.5–2.0 % vs 5.6 %; slots 8.8:1 / 40 px with bright rims
  (V 0.75) vs 4.3:1 / 25.5 px with shaded rims (V 0.58); a visible swirl/marble reflection pattern.
* **Why:** material/shader. Base colour is too magenta, the environment reflection produces the swirl, and the slot texture
  outline is aliased or alpha-tested.
* **Fix:** **washer-environment-modeler** (`materials.ts` wall, `render/env.ts`): shift the base colour to violet (target
  wall medians ≈ (154–188, 44–51, 166–205), h 292–304, with 30–45 % of wall pixels in the violet range). Replace the swirl
  reflection with a lengthwise brushed-metal highlight (anisotropic along the tube axis, or a 1-D stripe environment) aiming
  at ≈ 5–6 % near-white streak pixels. Make slot capsules plumper (≈ 4:1) with a darker shaded lower rim, using a
  mip-mapped normal/AO map instead of a bright outline.

**Next after these three:** the far river must wind and carry ≈ 11 tiny coins into the VP (path-camera; the S-curve itself
stays locked). Foam should be a low lavender rim, not white heaps, with the grey flat planes removed (foam-bubbles-particles).
The right-hand wall should reach y ≈ 900–960 at the edge, i.e. a narrower ribbon on the right at u ≈ 25–45 (geometry; coordinator
and water-fx, outside the locked S-curve centreline).

## 12. Honest overall assessment

* **Layout is close; the rendered look is not.** Camera, VP (1.4 px), the four near coins (≤ 14 px), Benny (≤ ≈ 10 px
  vertical) and the mid-field S-curve bands (≈ 0–50 px at y 700–850) line up well, and the wave-6 lock made this measurably better
  (coin 3 residual was +101 px). Most of the remaining difference is the **surface and finish** of about 60 % of the
  frame (tunnel 27 % + near field 29 %): rings, walls, lids, the missing near frame and the near water.
* **No percentage is given:** there is no validated mapping from mad/hue_corr/edge_corr to "% similar", so any number
  would be invented (CLAUDE.md). As a **subjective** judgement, side by side a viewer recognises the same scene and
  layout at once. A viewer also sees immediately that it is not the same picture: orange plastic hoops vs copper collars,
  marbled magenta vs violet brushed metal, a missing gold frame, a different near water. edge_corr 0.12 supports this: the fine
  structure (ring lips, slots, glints, foam) barely correlates yet.
* **90–95 % is currently far.** Reaching a state where a side-by-side reads as "the same picture" would take, at least,
  fixes #1–#3 above, then the far winding river with coins, lavender foam rims, drum lids and the right-wall reach. After that,
  re-capture and judge with the same per-zone table (§10) plus the user's own side-by-side look. Targets should be
  agreed per zone in advance, not as a fidelity percentage.

## 13. Files

* Measurements: `qa/pilot05/wave6/director/measure_review05.py` → `measurements.json`; landmarks `lm_ref.json`, `lm_game.json`.
* Crops (all reference left, game right unless named otherwise): `crops/tunnel_upper_ref_vs_game.png`,
  `crops/vp_rings_ref_vs_game.png`, `crops/vp_core_x6_ref_vs_game.png`, `crops/vp_coins_x4_ref_vs_game.png`,
  `crops/far_river_ref_vs_game.png`, `crops/left_wall_ref_vs_game.png`, `crops/right_wall_ref_vs_game.png`,
  `crops/lid_left_ref_vs_game.png`, `crops/lids_ticks_ref_top_game_bottom.png`, `crops/mid_river_ref_vs_game.png`,
  `crops/near_field_ref_vs_game.png`, `crops/corner_bl_ref_vs_game.png`, `crops/benny_ref_vs_game.png`,
  `crops/row_strips_ref_vs_game.png`, `crops/banks_ref_vs_game.png`, `crops/classmap_ref_vs_game.png`,
  `crops/blender_vs_game_rings_x300-700_y60-500.png` (Blender left, game right).
* No source files, references or character references were changed. Nothing was committed by this reviewer.

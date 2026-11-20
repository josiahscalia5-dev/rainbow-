# Scene comparisons: reference vs live (screens 01–11)

> **STATUS: these comparisons describe the build at commit `81e639e`, before the current Screen 05 pilot work.**
> The live images reviewed are `screenshots/NN.png` and `qa/NN_side_by_side.png` as committed at `81e639e`.
> Their bytes are unchanged at the time of writing: `git diff --stat 81e639e HEAD -- qa screenshots` is empty, and
> the only working-tree change under `qa/` is `qa/capture_log.json`, which the pilot iteration overwrote.
> **`playwright-visual-qa` will refresh this file after the Screen 05 pilot lands.**

Owner: `reference-match-director`. The targets themselves are documented in `docs/reference_inventory.md`, which also holds
the measurement method and Appendix A, the snippet that reproduces every number below.

No similarity or fidelity percentage is claimed anywhere in this document. Where numbers appear, they are
reproducible indicators (coverage %, pixel boxes, run lengths). They are **not** scores.

---

## 0. Inputs, build and method

| Item | Value |
|---|---|
| References | `references/01…11_*.png` (SHA-256 verified, see the inventory §1) and `character_references/official_cartoon_girl_original.jpg` |
| Live captures | `screenshots/01.png`…`11.png` (864×1536; 03 at 727×1536, the reference's own width) plus `screenshots/1080x1920/` |
| Side-by-sides | `qa/NN_side_by_side.png`, `qa/NN_overlay.png`, `qa/NN_diff.png` (from `scripts/compare.py`) |
| Capture run | 2026-11-15T17:56:22Z, headless Chromium, **SwiftShader software WebGL** (from the `81e639e` `qa/capture_log.json`). Page errors: none. Logged HUD state matched the reference values for every shot. Triangles per shot ranged from 226,929 (11) to 740,386 (04), with 64–299 draw calls. The ≈60 fps figures come from SwiftShader and are **not device measurements**. |
| Rule for 01/10/11 | The girl's **identity** is judged against the official cartoon girl, and her **pose and framing** against the reference. Replacing the realistic woman is required and is never counted as a discrepancy. |
| Ranking | Within each screen, discrepancies are ranked by visual impact. Categories, in the order fixes should go in: camera/framing → geometry → materials/colour → water → foam/bubbles → characters → HUD. |
| Owners | `path-camera-transition-engineer` (PCT), `washer-environment-modeler` (WEM), `water-fx-specialist` (WFX), `foam-bubbles-particles` (FBP), `benny-character-artist` (BCA), `cartoon-girl-character-artist` (CGA), `animation-and-gameplay-engineer` (AGE), `playwright-visual-qa` (PVQ), `android-build-performance` (ABP) |

---

## 1. Existing crude metrics (`qa/compare_summary.md`)

**Method** (`scripts/compare.py`, Pillow/numpy). The live frame is resized to the reference size, then:

* `mad`: the mean absolute RGB difference (0–255) on 1/4-scale images. Lower is closer.
* `hue_corr`: the correlation of 36-bin hue histograms over saturated pixels (S>60, V>50 on Pillow's 0–255 HSV scale). Range −1…1.
* `edge_corr`: the correlation of Sobel-like edge magnitudes at 1/8 scale. Range −1…1. It indicates whether the compositions line up.

Masks: the legacy-girl box in 01/10/11, and the outer 4% border (phone bezel) in 03.

| Screen | mad | hue_corr | edge_corr | masked |
|---|---|---|---|---|
| 01 | 63.0 | 0.548 | 0.054 | girl identity region |
| 02 | 70.3 | 0.731 | -0.0 | — |
| 03 | 67.0 | 0.585 | 0.011 | phone outline |
| 04 | 72.1 | 0.64 | 0.069 | — |
| 05 | 78.5 | 0.513 | 0.001 | — |
| 06 | 74.5 | 0.746 | -0.012 | — |
| 07 | 75.1 | 0.487 | -0.005 | — |
| 08 | 76.5 | 0.553 | -0.013 | — |
| 09 | 73.1 | 0.789 | -0.051 | — |
| 10 | 79.1 | 0.704 | -0.018 | girl identity region |
| 11 | 70.3 | 0.765 | 0.098 | girl identity region |

**These are crude indicators, not fidelity percentages.** None of them should be turned into or reported as a "%
similar". The narrow reading they support:

* `edge_corr` is about 0 on every screen, so live and reference structure do not line up at 1/8 scale.
  This agrees with the visual review: camera and framing is the first problem on every screen.
* `hue_corr` between 0.49 and 0.79 says the hue *families* broadly overlap (pink, violet, cyan, gold). It says nothing
  about whether they sit in the right place or at the right saturation.

**Caveat for PVQ.** The girl masks are boxes in *reference* coordinates. In the live 01 and 10 the cartoon girl stands
somewhere else (01: about x 330–700, y 520–1120; 10: about x 180–420, y 280–700), so her pixels are **not** masked
and do count in those metrics.

---

## 2. Additional reproducible indicators (this review)

These come from the method in `docs/reference_inventory.md`, Appendix A. They are indicators, not scores.

### 2a. Colour-class coverage (% of frame below the HUD band; 01/02 full frame) and class median

| NN | src | gold/copper | cyan water | violet | magenta/hot-pink | white/foam |
|---|---|---|---|---|---|---|
| 01 | ref | 4% #E9923F | 11% #1AAEF2 | 16% #9F42DF | 30% #DB4AB0 | 11% #F9E8FB |
| 01 | live | 14% #E97903 | 7% #349EEB | 12% #A661FF | 20% #F335CB | 26% #EAECFF |
| 02 | ref | 3% #EA9246 | 14% #09A4EB | 16% #9737E5 | 31% #E548B9 | 12% #FBEBFD |
| 02 | live | 8% #EF7910 | 12% #20B0E5 | 20% #A968FF | 26% #FF5BCB | 14% #FFE8FF |
| 03 | ref | 9% #EA9E48 | 18% #249DDC | 7% #9A53D1 | 22% #D752A8 | 15% #F9EAFC |
| 03 | live | 12% #FF9625 | 7% #57B2F9 | 3% #AC75FF | 11% #FF7CD3 | 30% #EFF7FF |
| 04 | ref | 16% #EC7D28 | 16% #129FEE | 7% #9546DE | 20% #E84BB0 | 8% #FAE7FC |
| 04 | live | 18% #FF9B2B | 14% #0294ED | 2% #B064EA | 25% #FC31C0 | 14% #FEEDFF |
| 05 | ref | 8% #F78B2F | 28% #039FF6 | 13% #9E36DF | 22% #EB38C3 | 7% #FCF6FF |
| 05 | live | 21% #FFA933 | 13% #529FEC | 10% #AA4BFF | 23% #FF43B2 | 11% #FFF0FF |
| 06 | ref | 4% #F89D45 | 24% #05A6F7 | 18% #973CDA | 21% #E346C1 | 9% #FBF4FE |
| 06 | live | 15% #FF9A2B | 8% #3695E1 | 34% #E357FF | 21% #FD68FF | 3% #F9E0EA |
| 07 | ref | 7% #F99540 | 21% #04A2EE | 16% #9632CC | 29% #DE37BB | 7% #FCF7FF |
| 07 | live | 18% #FFA338 | 11% #5BA8F3 | 13% #B553FF | 18% #FF48B4 | 10% #FFEAFF |
| 08 | ref | 13% #F28126 | 16% #03A0F1 | 13% #9730CC | 30% #D530AC | 6% #FDF8FF |
| 08 | live | 6% #FFB931 | 9% #4098ED | 15% #AF42FF | 41% #F924FF | 14% #FFE7FF |
| 09 | ref | 6% #F79333 | 30% #0799F0 | 16% #9235D6 | 16% #DD39BA | 8% #FBF6FF |
| 09 | live | 7% #FFBB32 | 20% #4190ED | 14% #AB43FF | 24% #FB3BC4 | 15% #FFE7FF |
| 10 | ref | 2% #F69749 | 19% #0E91F3 | 26% #8A29D5 | 15% #E53ABC | 8% #FAEFFE |
| 10 | live | 8% #FFB033 | 5% #3297E6 | 11% #9F4DFF | 31% #FB47D0 | 23% #FFE8FF |
| 11 | ref | 6% #F29248 | 2% #518EE5 | 24% #8E2BC0 | 29% #BC47AB | 3% #FFEEF8 |
| 11 | live | 14% #FF8F11 | 1% #2D7AD7 | 30% #B330EE | 28% #F423FF | 9% #FFEBFF |

Patterns across all screens:

* **Live cyan is desaturated and lighter**: #3695E1 to #5BA8F3 against the references' #029AF3 to #0799F0. It also covers less of the frame on 03, 05, 06, 07, 09 and 10.
* **Live gold is a brighter, yellower orange**: #FFA338 to #FFBB32 against #F28126 to #F99540. It also covers too much of the frame on the tube screens (05: 21% against 8%), because thin overlapping rings fill the view.
* **Live magenta leans to neon violet-magenta** (#F924FF, #F423FF) against a deeper pink-magenta (#D530AC, #BC47AB).
* **Lime/yellow-green** pixels (H 60–110°, S>0.5, V>0.6), which do not belong in the palette: 01 live 2.04% (#CEFF2F) against 0.05% in the ref; 02 live 2.29% against 0.00%. Every other screen is ≤0.3%. The lime is a band on the gold rims.
* **Blown-out white** (V>0.97, S<0.08, below the HUD): 01 10.7% against 4.6%; 03 13.4% against 6.3%; 04 6.0% against 2.8%; 10 9.0% against 4.0%; 11 4.4% against 1.4%.

### 2b. Benny placement (mask method ±20 px; reference values by eye where noted in the inventory)

| NN | ref bbox → height / centre x / bottom | live bbox → height / centre x / bottom |
|---|---|---|
| 03 | 30–399 × 470–956 → 32% / 30% / 62% | 0–419 × 603–999 → 26% / 29% / 65% (clipped at x=0) |
| 04 | 190–590 × 975–1400 → 27% / 46% / 92% | 421–611 × 620–849 → **15%** / 60% / **55%** |
| 05 | 230–612 × 768–1190 → 27% / 49% / 77% | 265–605 × 1062–1450 → 25% / 51% / **94%** |
| 06 | 200–640 × 730–1190 → 30% / ≈49% / 77% | 150–582 × 940–1519 → **38%** / 42% / **99%** |
| 07 | 205–640 × 780–1215 → 28% / 49% / 79% | 100–499 × 1060–1472 → 27% / **35%** / **96%** |
| 08 | 260–600 × 850–1210 → ≈24–27% / 50% / ≈80% | 335–699 × 1050–1419 → 24% / **60%** / 92% |
| 09 | 225–620 × 850–1275 → ≈28% / ≈50% / 83% | 303–689 × 940–1333 → 26% / 57% / 87% |
| 10 | 160–655 × 860–1395 → 35% / 47% / 90% | 300–699 × 960–1419 → 30% / **58%** / 92% |

Pattern: on 05–08 Benny sits 10–20% of frame height **too low**. He is seen from too steep an angle, so the
hat crown dominates and the fluffy body and arm nubs are mostly hidden. On 04 he is far too small and distant.

### 2c. Vanishing point / door centre (x%, y%)

| NN | ref | live |
|---|---|---|
| 03 | drain (500,1090) 69, 71; glow (559,1101) 77, 72 | glow (546,1061) 75, 69, but there is no drain or slide in the frame |
| 04 | (491,681) 57, 44 | (479,662) 55, 43 (good) |
| 05 | (498,479) 58, 31 | (471,478) 55, 31. This is a glare peak; the live tube bends, so there is no single VP |
| 07 | (634,565) 73, 37 | (542,576) 63, 38 |
| 08 | door 58, 26 | door ≈24, 21 (door at upper-left) |
| 09 | door 63, 22 | door ≈67, 23 (good) |
| 10 | door 51, 25 | door ≈42, ≈25, but the door fills most of the top half |
| 11 | door 48, 29 | door ≈55, ≈35, filled by the girl's torso |

---

## 3. Systemic issues (one fix improves many screens)

| # | Issue | Evidence | Screens | Owner |
|---|---|---|---|---|
| S1 | **Ring design.** Thin round orange torus pipes, often doubled, instead of thick, flat, warm-gold bands with a double lip and evenly spaced "marquee" highlights. | 05 outer ring is a 26 px flat band in the ref; live rings are 17–22 px round pipes. Gold median #FFA933 against #F78B2F. | 01–11 | WEM |
| S2 | **Wall material.** Pale sky-blue/lilac panels and low-contrast dashes instead of glossy magenta-violet metal with white specular streaks along the length and circumferential capsule slots in rows between ribs. Square holes on 06. | 05 right-wall box is 41% pale-blue (#87C9FF) in the live frame against 0.4% in the ref. | 04–10 | WEM |
| S3 | **Water colour and width.** Cyan is too light and desaturated, and the ribbon reads narrow in the mid-ground and pink-heavy near the camera. | 05 row y=1200: ref 83% cyan / 0% pink; live 12% cyan / 41% pink. | 03–10 | WFX |
| S4 | **Foam and bubbles.** Foam is uniform white-pink spheres strung like a necklace, with no cloud banks and no V-spray fan at Benny. Bubbles run the wrong way round: dozens of tiny ones everywhere, including over Benny, while the large iridescent ones are faint outlines. | Visual, every ride screen | 01–10 | FBP |
| S5 | **Rear camera too high and steep** (05–08) or too far (04). | §2b. The `81e639e` `STAGE_CAM['05']` (up 4.1, back 6.4) with Benny ≈2.3 units tall implies roughly a 25–30° look-down at Benny. The ref reads as about 10–20° (estimate). | 04–10 | PCT |
| S6 | **Benny rear read.** The hat dome takes about 75% of his visible height (ref ≈62%). Stripes are wide and smooth, and knit stitches show only on the cuff. The star is orange (#FF9B1C) and **edge-on** at the side, where the ref has a yellow (#F7BB19) star on the front-right of the cuff facing the camera. Arm nubs are not visible. | 05/06/07/10 captures | 04–10 | BCA (with PCT for the camera angle) |
| S7 | **Coins.** Orange tint (#FFBF33). The embossed glyph does not read as "$" (it looks like a struck "C"/"€"). Many are edge-on or crowd right at the camera or behind Benny, against the ref's tilted, camera-facing, yellow-gold coins (#F4B70F) centred on the path. | 05, 07, 08, 10 | 03–10 | AGE (placement/orientation/glyph); WEM if the coin material is shared |
| S8 | **Lime band on gold rims** and **blown-out whites** | §2a | 01, 02, 03, 10, 11 | WEM (materials, lighting and grade in `src/render/*`) |
| S9 | **HUD.** Values and titles are correct on every screen. The coin icon is ≈57 px against ≈82 px and sits ≈60 px too far right; the value text is ≈45 px right; the heart icon is smaller (≈55 against ≈80 px); the banner face is a narrower italic. | 05: ref coin icon x 378–460, live x 443–500 | 03–11 | AGE |
| S10 | **Girl framing.** Identity is right, but she is too large on 01, 10 and 11, visible on 09 where the ref shows no one, and in the wrong pose on 11. | §4 | 01, 09, 10, 11 | AGE (placement and timing), CGA (identity details), PCT (11 camera) |
| S11 | **Performance unknown on device.** 225k–740k triangles per captured frame, measured on SwiftShader only. Adding lids, foam and bubbles must be budgeted. | `81e639e` capture log | all | ABP |

---

## 4. Per-screen comparisons

### 01 Inside the Washing Machine (cinematic)

`references/01_inside_washer_girl_and_towel.png` vs `screenshots/01.png` (`qa/01_side_by_side.png`).
Verdict: the right ingredients are there (round-hole pink drum, gold door, room, cartoon girl, Benny, bubbles), but the camera is too close to the door, so the water, towel, laundry and Benny's peek are lost.

**Identity check:** PASS. The official cartoon girl is used: curly brown ringlets, lavender/white striped hoodie, blue cuffed jeans, purple/white sneakers. There is no realistic woman.

| # | Category | Reference | Live (`81e639e`) | Impact |
|---|---|---|---|---|
| 1 | Camera/framing | Door opening (195–690 × 200–640) centred 51%/27%, ≈57% of frame width; water fills the lower ≈70% from y≈480 | The gold rim fills the top ≈70% of the frame, with the inner opening ≈60–760 × 370–1100 centred ≈47%/48%; water only in the bottom ≈25% | High |
| 2 | Characters (Benny) | Peeks from inside the purple towel at lower left (hat 0–335 × 700–1000, face 30–330 × 930–1110), paws on the towel edge, whole face in frame | Face cut by the bottom-left frame edge (≈0–370 × 1180–1440), hat cut by the left edge, no towel draped over him in view | High |
| 3 | Characters (girl framing) | Composition target ≈240 px (16% of height), centre 68% x / 29% y, small, deep in the room | ≈515 px (34%), centre ≈53% x, standing just behind the door: about 2× too large and too central | High |
| 4 | Water | Glossy cyan/pink wave bands with white foam crests and a splash at the door lip | A few smooth flat pink, blue and white blobs at the bottom. Cyan 7% vs 11%, white 26% vs 11% | Med-High |
| 5 | Props | Blue striped sock (200–365 × 685–855) and pink star T-shirt (430–864 × 615–890) float mid-frame | A pink block and a blue ringed roll at the right edge (570–864 × 830–1010) do not read as a sock and a shirt | Medium |
| 6 | Materials | Warm gold rim (#E28A3C) and gold blade-shaped lifter paddles in the top corners | A lime-green band on the rim (2.04% of frame, #CEFF2F); paddles are orange rounded blobs; gold covers 14% vs 4% | Medium |
| 7 | Lighting | Soft bright room | Room overexposed (blow-out 10.7% vs 4.6%) | Low-Med |
| 8 | Girl identity detail | Official: voluminous curly **high** ponytail and a purple bow with a gold star, both readable from behind | Thin ringlets hanging from the crown; bow not visible from the back | Low-Med |

Fix list:
1. **PCT**: pull the 01 camera back from the door and lower it toward the wave crests. Targets: door-opening centre ≈(442, 420), inner opening ≈495 px wide, and water from y≈480 down.
2. **AGE**: place Benny's peek inside the frame at lower left, with the towel draped over him and his paws on its edge. Move the girl's walk path deeper into the room, to the right of centre (≈68% x, about 16% of frame height), walking away.
3. **WFX**: give the drum water glossy wave bands with white foam crests and door-lip splashes.
4. **WEM**: remove the lime rim band; model the lifter paddles as gold blades; tone down the room exposure. Rebuild the sock and T-shirt so they are readable, with AGE placing them mid-frame.
5. **CGA**: make the high curly ponytail and the bow read from behind, with its volume matched to the official reference.

### 02 Whirlpool Tumble (cinematic)

Verdict: the spiral eyes and the hat identity are good. The framing is extreme: Benny's face fills the screen, and the drum, laundry and swirl are not visible.

| # | Category | Reference | Live | Impact |
|---|---|---|---|---|
| 1 | Camera/framing | Benny ≈34% of height, mid-frame (centre ≈50%), with the door ring at the top centre (55%/11%) and the swirl around him | Benny's head is ≈68% of height (≈380–1430) and cropped at the right; the camera is inches away | High |
| 2 | Composition | Sock upper-left, pink star T-shirt upper-right, purple towel across the bottom | None of the three readable in frame | High |
| 3 | Water | A large clockwise spiral of cyan/pink with white foam lips wrapping the frame | A soft, blurred pink/cyan backdrop with no spiral structure | High |
| 4 | Characters | Arms up, paw pads facing the camera (465–565 × 1030–1120, 640–720 × 900–1010), open mouth | Spiral eyes and open mouth present; paw pads not shown; wide smooth hat stripes | Medium |
| 5 | Materials | Warm gold door ring, round-hole pink drum | Orange/lime ring (lime 2.29% of frame); orange paddle blobs | Medium |
| 6 | Render | Crisp detail throughout | Background strongly blurred (depth of field / motion) | Low-Med |

Fix list:
1. **PCT**: roughly double the `cam02` stand-off so Benny is ≈34% of height and centred, with the door ring visible at the top centre.
2. **AGE + BCA**: keep the sock, T-shirt and towel in the tumble frame as in the ref; give the tumble pose paw pads facing the camera.
3. **WFX**: build the spiral swirl surface with foam lips (shared with the 03 whirlpool).
4. **WEM**: fix the rim colour (no lime); lighten the depth-of-field blur on the drum.

### 03 · WHIRLPOOL TWIRL (interactive)

Verdict: Benny's placement and front three-quarter view are close, and the bezel is correctly omitted. The whirlpool basin, drain, slide, backdrop props and coin spiral are missing.

| # | Category | Reference | Live | Impact |
|---|---|---|---|---|
| 1 | Geometry | A spiral basin converging on a glowing **gold-ringed drain** at (500, 1090), with the start of the **cyan chevron slide** visible inside | A pale, sky-like open background with horizontal pink/cyan bands. No visible drain or slide; the bright blob at (546, 1061) is only a highlight | High |
| 2 | Geometry (backdrop) | Console with neon T-shirt screen, porthole window, striped towel shelf (y 180–360) | Absent; huge orange pipe arcs instead | High |
| 3 | Water | Polished 3-turn cyan (#1E9BD9) / hot-pink (#DD52AE) spiral with cloud foam on the rims | Flat horizontal bands. Cyan 7% vs 18%, blow-out 13.4% vs 6.3% | High |
| 4 | Coins | **10**: one big foreground coin plus 9 spiralling into the drain | 2 large edge-on coins near the top | Med-High |
| 5 | Camera | Benny centre 30% x, top 31% | Centre 29% x (good), top 39%, cut by the left frame edge | Medium |
| 6 | Materials | A thin gold basin rim | Thick orange pipes dominate the upper and lower-right corners | Medium |
| 7 | HUD | 5/5, $1,330, title | Correct values; icon size as in S9 | Low |

Fix list:
1. **WEM**: build the whirlpool basin, the gold-ringed drain at the lower right and the slide mouth. Add the 03/04 backdrop: porthole, console screen and towel shelf.
2. **WFX**: give the spiral surface 3 visible turns, cyan dominant with pink bands, and foam rims; cut the white overexposure.
3. **AGE**: lay out a 10-coin spiral trail plus one large foreground coin at lower left.
4. **PCT**: shift the framing about 40 px right and 120 px up so Benny is not clipped at x=0. Keep the high front three-quarter view.

### 04 · THROUGH THE FIVE ARROWS (interactive)

Verdict: the tunnel VP is in the right spot. The camera is far too far back, the 5 chevrons are not visible, and the ring tunnel and backdrop differ.

| # | Category | Reference | Live | Impact |
|---|---|---|---|---|
| 1 | Camera/framing | Close rear camera; Benny 27% of height, bottom-centre (bottom 92%) | Benny **15%**, sitting in the tunnel mouth (centre 60% x, bottom 55%); a huge foreground ramp | High |
| 2 | Chevrons | **Exactly 5** glowing white-cyan chevrons ahead of Benny, widening 50→210 px | **None visible.** The shader defines 5 (`src/vfx/waterRibbon.ts`, from stage start +8.5 at 3.6 spacing), but they are out of view at this checkpoint | High |
| 3 | Geometry | A deep tunnel mouth of ≈12 concentric thick gold ring bands (≈30–840 px across) | Two huge round orange pipe-rings crossing the top half plus a thin-ring "spring" | High |
| 4 | Backdrop | Console, porthole and towel shelf continue from 03 | A pink perforated wall with round dots | Medium |
| 5 | Water | Blue ramp (#049BED) centred, with magenta edges | Pink-left / blue-right curved surface filling the foreground | Medium |
| 6 | Coins / foam | 5 coins on the left edge; cloud foam both sides | 1 coin; strings of white spheres | Medium |

Fix list:
1. **PCT**: put a close rear camera above Benny (bottom ≈92%, height ≈27%) looking down the slide. Keep the VP at ≈(491, 681). Choose the checkpoint so all 5 chevrons lie ahead of him.
2. **WFX**: make the 5 chevrons readable at this distance (size, glow, contrast); keep exactly 5.
3. **WEM**: build the deep gold ring tunnel mouth with ≈12 flat bands, and the 03 backdrop above it.
4. **AGE**: place 5 coins along the left water edge. **FBP**: cloud foam banks.

### 05 · FLOW INTO THE CURRENT (interactive): pilot screen, detailed

`references/05_flow_into_the_current.png` vs `screenshots/05.png` (`qa/05_side_by_side.png`). Live state at capture:
stage 05, s=144.18, coins 1,420, hearts 5, cam (4.75, −37.93, −79.82). Live rig at `81e639e` (`STAGE_CAM['05']`):
back 6.4, up 4.1, ahead 18, lookUp 1.8, vFOV 62, latFollow 0.6, roll 0.5.

Verdict: the HUD values and the general ingredients are right. The geometry reads as a bending spring of orange pipes in a blue-lilac tube, where the reference is a **straight** magenta tube with concentric gold bands and a meandering water floor. Benny sits too low and is seen too steeply.

#### 5.1 Camera, height and vanishing point

| | Reference | Live |
|---|---|---|
| VP | **(498, 479) = 57.6% x / 31.2% y** (measured). Every ring is concentric about it. | Brightest point (471, 478) lies in a white glare band (y≈500–700). Rings are **not** concentric, so there is no single VP. |
| Pitch | Implied at vFOV 62°: view axis ≈12.7° below the tube axis, ≈3° left of it | Stream and coin line **climb** toward the upper centre; the view looks up a rising, bending tube |
| Camera height over Benny | Low elevation (estimated 10–20°): the hat brim is a shallow ellipse and the whole back of the body is visible | Steep (≈25–30° from the rig numbers): the hat crown fills the view and the body is hidden |
| Benny in frame | x 230–612, y 768–1190: height 27%, centre 49%, **bottom 77%** | x 265–605, y 1062–1450: height 25%, centre 51%, **bottom 94%**. About 290 px (19% of frame) too low |
| Benny vs VP | Benny's centre is 32.5% of frame height below the VP | 50.8% below |

#### 5.2 Tube straightness
* **Reference**: the visible tube stretch is **straight**; ≈10 rings sit concentric around one point. All the S-curves are in the
  **water bands on the floor**. The tube itself does not bend.
* **Live**: the tube bends inside the visible range, so successive rings appear as tilted, overlapping ellipses with different
  centres: the "slinky" look. The stream climbs.

#### 5.3 Rings (count, spacing, thickness, colour)

| | Reference | Live |
|---|---|---|
| Count | ≈10 full rings to the VP, plus the near frame ring at the bottom corners (0–160 × 1200–1536, 690–864 × 1220–1536) and the bottom arc (130–760 × 1440–1536) | ≈8–10 ring arcs, but they overlap and do not share a centre; no near frame ring at the bottom |
| Spacing (screen, ring tops on the VP column) | ≈105 → 60 → 25 → 20 → ≤15 px: smooth perspective falloff of evenly spaced rings | Irregular (e.g. 224, 273, 297, 370 on x=471); rings cross each other |
| Thickness / profile | **Flat band**, 26 px at the top of the outer ring (x=498, y 196–221), with a **double contour** (thin bright lip plus thick band) | **Round torus pipe** 17–22 px, often a pair of parallel thin pipes |
| Highlights | Evenly spaced bright "marquee" spots (≈12–16 per visible half-ring) and pale-yellow hot spots (#FCE082) | Smooth continuous specular streak; no marquee spots |
| Colour | Median **#F99649** (warm gold-copper); gold class 8% of frame | Median **#FF9F2F**, a yellower and more saturated orange; gold class **21%** of frame |

#### 5.4 Wall colour and perforation pattern

| | Reference | Live |
|---|---|---|
| Base colour | Magenta-violet metal: violet #992FC2, magenta #CD32AA; non-gold medians left wall #B830AE, right #D234AB, ceiling #B131A9 | Left lilac #BD5FD7, ceiling #C976FF, right wall **sky-blue #86C8FF** (41% of the right-wall box against 0.4% in the ref) |
| Specular | Strong white-pink streaks running along the tube length on every panel | Soft gradients; one overexposed white band across the middle (y≈500–700) |
| Perforations | **Capsule slots laid along the circumference**: horizontal dashes on the ceiling, vertical on the side walls, 3–5 rows per bay between rings, near slots ≈14×40 px, dark and high-contrast | Small dark-violet dashes (≈6×18 px) in long diagonal rows, lower contrast, no per-bay row structure |

#### 5.5 Nozzle lids

| | Reference | Live |
|---|---|---|
| Layout | Copper half-dome lids, one per bay, in a **symmetric row on each side wall** at ≈3 and 9 o'clock just above the waterline, shrinking toward the VP | One large flat red-orange disc in the top-right corner (≈610–864 × 0–300), at ceiling height |
| Positions (centres) | Left (140, 368) ≈150×105, (291, 444), (390, 468), (≈428, 480). Right (791, 462) ≈145×125, (663, 421), (599, 450), (569, 457) | n/a |

#### 5.6 Water: width, curves, colour bands

| | Reference | Live |
|---|---|---|
| Width | Fills the whole tube floor: ≈60 px at the VP → ≈420 px (49% of frame) at y=600 → full frame width from y≈800 | Narrow cyan channel in the mid-ground (≈110–120 px at y=900–1000) between pink bands and foam; reads as a ribbon, not a floor |
| Curves | The cyan core meanders: bottom centre → under Benny → (560, 700) → (450, 600) → (520, 520) → VP. ≈2 meanders, ±60–120 px | Bands run radially, straight up the rising tube; no S-meander |
| Colour | Cyan dominant: class 28% of frame, **#029AF3**. Two principal hot-pink S-bands **#F739E5** in the mid-ground. Rows y=1200/1400: **0% pink**, 83%/55% cyan | Cyan **#3993E7** (lighter, less saturated), 13% of frame. Pink dominates near the camera: row y=1200 41% pink / 12% cyan; row y=1400 51% pink / 26% cyan |
| Surface detail | White **4-point star glints**, glossy flow streaks | White motion streaks; no star glints |

#### 5.7 Foam, bubbles, splash

| | Reference | Live |
|---|---|---|
| Foam | **Cloud banks** of white-lavender clumps (#FCF6FF, 10–40 px puffs, soft lavender shading) hugging both edges from y≈540 to y≈1300 | Uniform white-pink spheres (≈30–60 px, #FFF0FF) strung along both banks (y≈730–1150) |
| Splash | A **V-shaped spray fan** of white/cyan droplets from Benny's base (180–680 × 1080–1260) | No spray fan; white streak particles near the bottom edge |
| Bubbles | ≈18 large iridescent bubbles (25–65 px) **at the sides** and ≈25 small; none over the path or Benny | Dozens of tiny 5–15 px bubbles across the whole frame, **including over Benny's hat**; ≈6 large bubbles drawn as faint thin outlines in the upper tube |

#### 5.8 Coins

| | Reference | Live |
|---|---|---|
| Count / line | ≈9–10, **centred on the stream ahead of Benny**, winding with the cyan core | ≈14 in a line to Benny's **left**, climbing to (≈380, 480) |
| Nearest coin | (473, 728), ≈95 px, ≈40 px above the pom-pom | (290, 1085), ≈135 px, overlapping the left edge of the hat |
| Orientation | Tilted to face the camera; rim thickness visible | Upright, mostly side-on to the camera |
| Colour / glyph | #F4B70F yellow-gold; embossed "$" legible | #FFBF33 orange-gold; the glyph does not read as "$" |

#### 5.9 Benny (proportions, position)

| | Reference | Live |
|---|---|---|
| Size / position | 27% of height, centre 49%, bottom 77% | 25%, centre 51%, bottom 94% |
| Hat : body | Hat including pom ≈62% of visible height; fur body below the cuff ≈38%; arm nubs at y≈1000–1080 | Hat dome ≈75%; fur only a fringe round the cuff (y≈1310–1450); no arm nubs visible |
| Hat | White and purple knit stripes (3 purple) with visible stitches and a purple ribbed cuff (#7513ED); pom-pom ≈140 px (#7F14EC) | Two wide smooth white stripes; ribbing only on the cuff; pom-pom ≈110 px and spikier (#AA4BFF) |
| Star | Yellow #F7BB19, **front-right of the cuff, facing the camera** (480–555 × 915–985) | Orange #FF9B1C, **edge-on on the right side** (535–590 × 1280–1360) |
| Fur | #F64EB1 | #FF55CB (lighter, more magenta) |

#### 5.10 HUD
Values are correct: `5/5`, `$ 1,420`, `05 · FLOW INTO THE CURRENT`, pause. Differences: the coin icon is ≈57 px at x 443–500
against ≈82 px at x 378–460; the value sits at x 537–638 against 495–620; the heart is smaller; the pill sits ≈6 px lower; the banner font is a narrower italic.

#### 5.11 Prioritised fix list for 05 (with acceptance checks)

| P | Owner | Task | Acceptance (re-capture at the same checkpoint) |
|---|---|---|---|
| P1 | PCT (+WEM) | Make the 05 checkpoint stretch a **straight, level tube** for ≥10 ring spacings ahead of the camera. Put the S-meander into the **water bands and lateral offset on the floor**, not the tube centreline. | Ring arcs concentric about a single point within ±10 px; that point at (498±25, 479±25) |
| P1 | PCT | Lower the camera's elevation over Benny and re-pitch so the VP stays at ≈31% y | Benny bbox ≈ x 230–612 / y 768–1190 (±25 px); full back, both arm nubs and the cuff star visible |
| P1 | WEM | Rings: flat gold bands (≈26 px at the outer ring top) with a double lip, marquee highlights and colour toward #F99649; remove the paired thin pipes | Gold class ≈6–12% of frame (ref 8%); no overlapping ring arcs |
| P1 | WEM | Walls: magenta-violet metal (#992FC2 / #CD32AA) with lengthwise white specular streaks; circumferential capsule slots, 3–5 rows per bay; **no sky-blue panels**; remove the mid-frame white glare | Pale-blue share in the right-wall box <2%; blow-out ≤ ref (3.9%) |
| P2 | WEM | Add 4 copper half-dome nozzle lids per side wall at the listed centres, one per bay | 8 lids visible, symmetric, shrinking toward the VP |
| P2 | WFX | Water fills the tube floor (≈49% of width at y=600, full width from y≈800). Cyan core #029AF3 dominant with 2 hot-pink S-bands (#F739E5) in the mid-ground, no pink in the near-centre, star glints | Cyan class ≈20–30% of frame; rows y=1200/1400 cyan-dominant |
| P2 | FBP | Cloud-like foam banks on both edges; a V-spray fan at Benny; ≈15–20 large iridescent bubbles at the sides; keep the centre path and Benny clear; cut the tiny-bubble count | No bubbles overlapping Benny's bbox; large bubbles clearly iridescent |
| P3 | AGE | Coins: ≈9–10 centred on the meander ahead of Benny, the first ≈40 px above the pom-pom at ≈95 px, tilted to face the camera; fix the "$" glyph; colour toward #F4B70F | No coin overlapping Benny; glyph reads "$" in the capture |
| P3 | BCA | Hat stripe pattern and knit texture as in the ref; star yellow and on the front-right of the cuff facing rear-camera views; ride waterline showing ≈38% body below the cuff | Star visible facing the camera in the 05 capture |
| P3 | AGE | HUD coin icon ≈82 px at x≈378–460; value at x≈495–620; heart ≈80 px | Pixel positions within ±10 px |
| P4 | PVQ | Re-capture 05, regenerate the side-by-side, overlay and diff; add the VP, Benny-bbox and ring-concentricity checks above to the report; refresh this section | New `qa/05_*` plus an updated section here |
| P4 | ABP | Re-measure triangles and draw calls after the lids, foam and bubbles go in (05 at `81e639e`: 625,575 triangles, 73 calls, SwiftShader) | Numbers logged; device fps if a device is available |

### 06 · CREST THE RINSE ARCH (interactive)

Verdict: the defining **arch** is not in frame. The camera is too close, and the walls and holes are the wrong pattern.

| # | Category | Reference | Live | Impact |
|---|---|---|---|---|
| 1 | Geometry/camera | The stream rises up the left, crests at top-left (≈150–330 × 500–560), then curls right and dives into a ring tunnel whose VP is ≈78% x / 44% y | No arch or crest visible; a flat violet/magenta wall with 3–4 thin orange ring arcs | High |
| 2 | Camera | Benny 30% of height, bottom ≈77% | Benny **38%**, cut by the bottom edge (bottom 99%) | High |
| 3 | Walls | Violet slotted walls (#873DB6) with gold rings; 2 nozzle lids upper-left | Large dark **square** holes (~25 px) in rows; violet 34% vs 18% and lighter (#E357FF) | Medium |
| 4 | Coins | ≈13: 4 large on the arch's left limb, ≈9 small along the crest into the tunnel | 1 coin, edge-on beside Benny | Medium |
| 5 | Water / foam | Cyan 24% (#05A6F7), rainbow fringe on the right edge, ripple rings and V-splash at Benny | Cyan 8%, white 3%, no fringe or splash | Medium |
| 6 | Benny | As in S6 | Hat-dominant, star edge-on | Low-Med |

Fix list:
1. **PCT**: pull the camera back and lower it; pick the checkpoint so the arch crest and the right-side tunnel are ahead. Targets: Benny 30% of height, bottom ≈77%, tunnel VP ≈(670, 680).
2. **WFX**: model the rising arch that crests and curls into the tunnel, with a rainbow fringe on its right edge and ripple rings at Benny.
3. **WEM**: capsule slots instead of square holes; 2 upper-left lids; flat gold rings.
4. **AGE**: coins on the arch crest (4 large + ≈9 small). **FBP**: corner cloud foam plus a V-splash.

### 07 · DIVE THE WASHER TUBE (interactive)

Verdict: the VP height is right and the tunnel reads, but Benny is low-left, and the rings, walls and lids share the 05 issues.
(Continuity of the 07→08 plunge is proven separately in `qa/07_to_08_continuity.md`: a 61.4-unit drop over 6.58 s, no camera
cut. That is not a visual comparison with this frame.)

| # | Category | Reference | Live | Impact |
|---|---|---|---|---|
| 1 | Camera | Benny centre 49% x, bottom 79%; VP 73% x / 37% y | Benny centre **35%**, bottom **96%**; VP ≈63% x / 38% y | High |
| 2 | Geometry/materials | ≥10 concentric flat gold rings; violet/magenta slotted walls; **5 copper lids on the left wall** | Thin orange torus rings; pale lilac-blue walls; red-orange flat "petal" lids on both walls | High |
| 3 | Water | An S-stream entering from the lower left, cyan #03A0EB with pink #EF3AC6 bands | A rising stream, pink-heavy, cyan #5BA8F3 | Med-High |
| 4 | Coins | ≈10–12 from a big near coin at (608, 820) winding into the VP | ≈6, one directly behind and over Benny's head | Medium |
| 5 | Foam | Cloud banks, splash droplets at Benny | Strings of spheres; no splash | Medium |
| 6 | Benny | As in S6 | Hat-dominant, star edge-on | Low-Med |

Fix list:
1. **PCT**: centre Benny (49% x) at bottom ≈79% and move the VP to ≈73% x. The tube stays straight in the visible stretch, and the plunge begins only after it.
2. **WEM**: same ring and wall fixes as 05; put the 5 copper half-dome lids on the left wall at the inventory positions.
3. **WFX**: S-curve stream from the lower left, cyan-dominant.
4. **AGE**: coin line ahead of Benny, never overlapping him. **FBP**: cloud banks plus splash.

### 08 · FINAL SPIN CHAMBER (interactive)

Verdict: the chamber is seen from the wrong direction. The door is at the upper left with no gold inlet ring framing the view, and saturated magenta floods one wall.

| # | Category | Reference | Live | Impact |
|---|---|---|---|---|
| 1 | Camera/composition | A full-frame gold **inlet ring** (≈0–864 × 190–1260) frames a centred chamber; door centre 58%/26% | No inlet frame; door at the upper left (≈25–390 × 180–470, ≈24%/21%); camera turned left | High |
| 2 | Geometry | A symmetric round chamber, receding perforated violet floor (#9A36CF), **4 half-dome spout lids pouring water** | One saturated magenta wall (#F924FF; magenta 41% vs 30%) with huge black slots; translucent cyan columns instead of lid spouts | High |
| 3 | Platform/towel | A folded towel on a perforated, gold-rimmed round platform with legs, below the door | A towel roll at the door on a thin orange ring | Medium |
| 4 | Coins | 9 in one winding line toward the platform | ≈16 crowded in two lines, several huge near Benny | Medium |
| 5 | Benny | Centre 50%, bottom ≈80% | Centre 60%, bottom 92% | Medium |

Fix list:
1. **PCT + WEM**: frame the chamber through the big gold inlet ring at the bottom of the 07 plunge, looking at a centred door (≈58% x / 26% y).
2. **WEM + WFX**: 4 perforated half-dome spout lids with pouring water falls; a receding perforated violet floor; tone the magenta down to #D530AC.
3. **WEM**: towel on a perforated gold-rimmed platform with legs, under the door.
4. **AGE**: one winding 9-coin line. **PCT**: Benny centred, bottom ≈80%.

### 09 · RIDE THE FINAL WAVE (interactive)

Verdict: the closest composition among the ride screens (door upper right, towel below it, wave at left, coin line toward the door). The wave lacks its foaming crest, and the girl is visible where the reference shows none.

| # | Category | Reference | Live | Impact |
|---|---|---|---|---|
| 1 | Water (wave) | A **tall wall of blue water at the left with a white curling foam crest** (0–380 × 390–700) | A pale lavender-white tube-like curl with little foam and no crest | High |
| 2 | Composition (girl) | The door shows **only the laundry room** (no person) | The cartoon girl is visible from behind in the door (≈20% of frame height) | Medium |
| 3 | Geometry | Chrome door with a thick gold surround; **3 spout lids pouring** (upper-left, upper-right, lower-right) | Thin rings and door ring; no lid spouts | Medium |
| 4 | Water colour | Cyan 30% (#0799F0), pink 16% | Cyan 20% (#4190ED), pink 24% | Medium |
| 5 | Camera | Door 63%/22%; Benny centre ≈50%, bottom 83% | Door ≈67%/23% (good); Benny centre 57%, bottom 87% (close) | Low |
| 6 | Coins | 10 along the left of the stream to the platform | ≈11 in a similar line (good); orange and glyph as S7 | Low |

Fix list:
1. **WFX + FBP**: a tall left wave in the stream's cyan, with a white curling crest, crest spray and foam.
2. **AGE**: keep the girl out of the 09 door view; she appears in 10.
3. **WEM**: 3 pouring spout lids; a thick gold surround on the chrome door.
4. **PCT**: shift Benny ≈60 px left.

### 10 · SLIDE INTO HIDING (interactive)

Verdict: the plush towel tent, the key story prop, is a thin strip. The girl is far too large in the door.

**Identity check:** PASS. The official cartoon girl is used: curly high ponytail, purple headband, gold hoops, striped hoodie. There is no realistic woman.

| # | Category | Reference | Live | Impact |
|---|---|---|---|---|
| 1 | Geometry (towel tent) | A big plush purple towel (#6C0CC6) with lavender trim draped as a **tent** (85–720 × 430–710) over a perforated gold platform (55–830 × 580–760); the stream enters its dark mouth | A thin purple arch strip (≈20–760 × 520–700) with no volume or plush; the platform reads only as an orange bar edge-on at y≈700 | High |
| 2 | Girl framing | ≈165 px (11% of height), at the window in the right part of the door, unaware | ≈420 px (27%), filling the left-centre of the door, back view | High |
| 3 | Camera/coins | Benny 35% of height, centre 47%; 3 coins lead into the tent | Benny 30%, centre 58%; 3 coins stacked vertically right above Benny | Medium |
| 4 | Geometry | A spout lid at the right pouring water; cloud foam at the left | No lid; foam spheres | Medium |
| 5 | Exposure | White class 8% | White 23%, blow-out 9.0% vs 4.0% (glare from the room and door) | Medium |

Fix list:
1. **WEM** (with AGE for the tent/fold states in `src/world/towel.ts`): a plush, volumetric towel tent on a perforated gold platform, with a dark opening the stream flows into. **WFX**: narrow the stream into that opening.
2. **AGE**: place the girl small, deep in the room at the window (right part of the door, ≈11% of frame height), facing away.
3. **PCT**: Benny centred at ≈47% x, ≈35% height; coins leading into the tent.
4. **WEM**: right-hand spout lid; reduce the room glare.

### 11 · SAFELY HOME (victory cinematic): stage-11 girl override check

Verdict: **identity override PASS.** The official cartoon girl is present and the realistic woman is gone. The **pose,
framing, door, towel, platform and badge** still differ markedly from the locked composition.

**Stage-11 girl check, against `character_references/official_cartoon_girl_original.jpg`:**
* Present: purple headband with a bow, curly brown ringlets at the sides, gold hoop earrings, lavender/white striped hoodie with drawstrings, a cartoon face with large eyes and an open smile. There is no realistic face.
* Gaps: the hair on top looks flat and straight, and the side ringlets are thin strands, where the official shows a **voluminous curly high ponytail** with a smooth crown. The bow is partly hidden behind the title banner and its **gold star** is not visible. The eyes are very large and red-brown (official: dark brown). The skin reads orange under the magenta grade (official #FAA477). The sleeve star is not visible in this frame.

| # | Category | Reference (composition) / official girl (identity) | Live | Impact |
|---|---|---|---|---|
| 1 | Pose/framing | Leans forward through the door, **both hands on the folded towel**; visible height ≈580 px (38%); head top y≈200 | Stands upright facing the camera with arms down, holding a roll at her waist; visible ≈700 px (46%); head ≈340 px wide; **the title banner overlaps her head and bow** | High |
| 2 | Door | **Open** chrome door swung to the **right** (680–855 × 165–710) with hinges and handle | No open door visible; only gold ring arcs on the right | High |
| 3 | Towel | A large **folded** towel stack with lavender trim (190–630 × 520–785) centred on the platform | A cylindrical roll (≈170–610 × 840–1000) | Med-High |
| 4 | Platform | A perforated violet disc (#7A13C2) with a gold edge and two curved gold bracket legs | A neon magenta grid oval (#F423FF) with an orange torus rim and thin tube legs | Medium |
| 5 | Floor water | Glimmering central puddles with foam clumps and bubbles (40–790 × 1040–1310) | Blue blobs in the bottom corners only | Medium |
| 6 | Badge | Gold-bordered purple pill, **laurel wreaths inside both ends**, check medallion on top, italic gold `FINAL SPIN` / `COMPLETE` | Plain purple pill, check medallion on top (good), upright cream text (good wording), laurels **outside** the pill at the frame corners | Medium |
| 7 | Identity detail | Voluminous curly ponytail, bow with a gold star, dark-brown eyes, warm skin | See the gaps above | Medium |
| 8 | HUD | 5/5, $2,500, `11 · SAFELY HOME` | Correct | — |

Fix list:
1. **AGE + PCT**: drive the 11 capture at the `leanReachTowel`/`holdTowel` pose with both hands on the folded towel. Move the
   camera lower and further back so her head sits below the banner (head top ≈y 200) and her visible height is ≈38%.
2. **WEM**: the chrome door swung **open to the right**; the folded towel stack; the perforated violet platform with a gold edge and two curved gold legs.
3. **CGA**: hair volume (curly high ponytail) and the gold star on the bow, matched to the official reference; check eye and skin colour under the 11 lighting.
4. **AGE**: badge with the laurels inside the pill, a gold border and italic gold text. **WFX/FBP**: central floor puddles with foam clumps.

---

## 5. QA-tooling follow-ups (PVQ)

1. After the pilot lands, re-run the captures and `python3 -I scripts/compare.py`, then refresh §1, §2 and the 05 section of this file.
2. Move the girl masks for 01, 10 and 11 to wherever the live girl actually is, or add a second mask in live coordinates. Today her live pixels in 01 and 10 are not masked.
3. Add landmark checks to the report: VP position, Benny bbox, ring concentricity (05/07), visible chevron count == 5 (04),
   coin count in frame, girl absent in the 09 door, door open on the right (11), and that the HUD and banner do not overlap the girl (11).
4. Keep one capture log per run. The pilot iteration overwrote `qa/capture_log.json`, and it now points to a scratchpad 05 file.
5. Keep 03 compared at 727×1536 content scale, with the bezel masked as today.

---

## 6. Top 3 fixes per screen (summary)

| Screen | 1 | 2 | 3 |
|---|---|---|---|
| 01 | PCT: pull the camera back and down; door opening centred at 51%/27%, water filling the lower 70% | AGE: Benny peeking from under the towel in frame at lower left; girl ≈16% height, deep right in the room | WFX: glossy cyan/pink wave bands with foam crests |
| 02 | PCT: about 2× camera stand-off; Benny ≈34% height, centred, door ring at the top | AGE/BCA: sock, T-shirt and towel in frame; paw pads to the camera | WFX: big spiral swirl with foam lips |
| 03 | WEM: whirlpool basin + gold-ringed drain with the slide mouth + backdrop props | WFX: 3-turn cyan/pink spiral surface with foam rims, less white blow-out | AGE: 10-coin spiral including the big foreground coin |
| 04 | PCT: close rear camera; Benny 27% height, bottom-centre | WFX: exactly 5 visible glowing chevrons ahead of Benny | WEM: deep 12-ring flat-gold tunnel mouth + 03 backdrop |
| 05 | PCT+WEM: straight, level tube, rings concentric on (498, 479); meander only in the water | PCT: lower camera elevation; Benny bbox ≈230–612 × 768–1190 | WEM: flat gold ring bands, magenta-violet slotted walls (no blue), 4 lids per side |
| 06 | PCT: camera back and down so the arch crest and right-side tunnel are visible; Benny 30%, bottom 77% | WFX: rising arch stream curling into the tunnel, rainbow fringe | WEM: capsule slots instead of squares; flat gold rings; upper-left lids |
| 07 | PCT: Benny centred (49%), bottom 79%, VP at 73% x | WEM: ring and wall material + 5 left-wall copper lids | WFX: saturated cyan S-stream from the lower left |
| 08 | PCT+WEM: centred chamber seen through a full-frame gold inlet ring, door at 58%/26% | WEM+WFX: 4 half-dome spouts pouring + perforated violet floor; less magenta | AGE: one 9-coin winding line |
| 09 | WFX+FBP: tall left wave with a white curling foam crest | AGE: no girl in the 09 door view | WEM: 3 pouring spout lids, thick gold door surround |
| 10 | WEM: plush towel tent on a perforated gold platform with a dark opening | AGE: girl ≈11% height at the window, right part of the door | PCT: Benny centred, ≈35% height, coins leading into the tent |
| 11 | AGE+PCT: lean-in pose with both hands on the towel, head below the banner, ≈38% visible height | WEM: chrome door open to the right, folded towel stack, perforated platform with gold legs | CGA: voluminous curly ponytail + gold star on the bow; eye and skin colour per the official girl |

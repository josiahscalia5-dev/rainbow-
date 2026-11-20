# RAINBOW: reference inventory (11 locked screens + official cartoon girl)

Owner: `reference-match-director`. Sources: `Rainbow_Claude_Code_Master_Prompt_11_Screens.md`, `REFERENCE_ORDER.md`,
`VISUAL_QA_CHECKLIST.md`, `references/*.png`, `character_references/official_cartoon_girl_original.jpg`.
This file describes the **locked targets only**. For live-build comparisons see `qa/scene_comparisons.md`.

Read this first:

* All 12 images are immutable. Nothing in this document asks for them to be edited, re-encoded or cropped in place.
* **Identity override:** the girl in 01, 10 and 11 is ALWAYS the official cartoon girl
  (`character_references/official_cartoon_girl_original.jpg`). The women painted into references 01, 10 and 11 are
  **composition-only**: their position, pose, scale and line of sight are targets, but their face, hair, outfit and
  proportions are not. The realistic woman in 11 must never appear in the game.
* Everything else (Benny, scenery, water, coins, HUD, order) stays as close to the references as real-time 3D allows.
* The coordinates below are in each image's native pixels (x right, y down, origin top-left). Percentages are % of
  frame width (x) or height (y).
* No similarity or fidelity percentage is claimed anywhere in this file.

---

## 1. Integrity (verified)

Verified on 2026-11-15 with `sha256sum references/*.png character_references/*.jpg`. Every hash matched both
`REFERENCE_ORDER.md` and `scripts/reference.sha256`. Dimensions were read with Pillow.

| # | File | Bytes | Size (px) | SHA-256 | Role |
|---|---|---|---|---|---|
| 01 | `references/01_inside_washer_girl_and_towel.png` | 443,868 | 864×1536 | `99509fb6f6528a7e48043d71ef949751439e1cde071f87e7c5136bff6b752c24` | real-time **cinematic**, no HUD |
| 02 | `references/02_mascot_tumbles_in_whirlpool.png` | 501,744 | 864×1536 | `50eec332c50b136a5dcb4350fca8fa0f9c737bc3c778c06845e578f5f5e243d3` | real-time **cinematic**, no HUD |
| 03 | `references/03_whirlpool_twirl.png` | 385,938 | **727**×1536 | `6f298ac5183ededf04b2a786c500999690864641a503867b721ea49970474a49` | **interactive** ride (dynamic whirlpool angle) |
| 04 | `references/04_through_the_five_arrows.png` | 392,932 | 864×1536 | `1b0ccdacbb4c97e9ea67c4910080668ebaf6a6c326249ef40340bc1472676193` | **interactive** ride |
| 05 | `references/05_flow_into_the_current.png` | 484,196 | 864×1536 | `d3f339d49199598e03541c15a3ec6f7fa6342f40de650361c44ab4301bfb44dd` | **interactive** ride |
| 06 | `references/06_crest_the_rinse_arch.png` | 497,882 | 864×1536 | `3946058c0893e97a99dd5015f3197901859475cd7ef55e09d982d232951441fe` | **interactive** ride |
| 07 | `references/07_dive_the_washer_tube.png` | 494,067 | 864×1536 | `75782e387240d79436808c3b1c642040eda75fd5b58dbb76192035c7c60f78c9` | **interactive** ride (+ the deep plunge AFTER this view) |
| 08 | `references/08_final_spin_chamber.png` | 492,730 | 864×1536 | `ab7d0bc5777bc9b262ec0563839a51663d4ec271e4a099c8d417b2de5f498e14` | **interactive** ride |
| 09 | `references/09_ride_the_final_wave.png` | 512,948 | 864×1536 | `260e9504b7b10d6185c05ccc9d991dcd7907d17d4c4eb72db5df371e6fd56ed8` | **interactive** ride |
| 10 | `references/10_slide_into_hiding.png` | 504,650 | 864×1536 | `c0db71df8dc88c0741bbcf840ac99fbb7078c58964313713de9803b6ac7268e0` | **interactive** ride (ends in the hide) |
| 11 | `references/11_safely_home_final_victory.png` | 481,475 | 864×1536 | `4f30ca59a926d6eed449a2865d35776368864bfd92c5c7f0845a96bf500397ae` | real-time **victory cinematic** + final UI |
| G | `character_references/official_cartoon_girl_original.jpg` | 231,475 | 983×1536 | `92bbaa61a66c7a4dc16d70730be76a34b9575d3f4484e72d95129ad574460daf` | identity reference (not a stage) |

There is no 12th stage. Screen 03 is the only reference that is not 864 wide: it includes a decorative phone bezel
(see §3.03).

---

## 2. How the numbers were measured

Every value here can be reproduced with Pillow and numpy. The snippet is in Appendix A.

| Quantity | Method | Confidence |
|---|---|---|
| Colour **class coverage** (% of frame) and **class median hex** | Pixels are classified in HSV (thresholds in Appendix A). The class median is taken over all pixels of that class in the frame. Screens 03–11 skip the top 13% of the frame (the HUD band). | Reproducible |
| **Material hex** (e.g. "Benny fur") | Median of the pixels that belong to the material's class **inside a hand-chosen box** (box listed in Appendix B). | Reproducible. The box is a judgement call. |
| **Vanishing point (VP)** | For tube screens, the luminance maximum after an 8 px Gaussian blur, inside a hand-chosen window around the tunnel end. Door screens use the visual centre of the door opening. | ±15 px for the measured ones, ±30 px for the visual ones |
| **Benny bbox** | Union of the hat-purple mask (H 250–292°, S>0.55) and the fur-pink mask (H 312–350°, S 0.30–0.85, V>0.75) inside a window, cross-checked by eye on a 50 px grid. Where the two disagree, the visual box is given. | ±20 px |
| **Landmark boxes, counts** | Read by eye from the full-resolution images overlaid with a 50 px or 100 px grid. | ±15 px. Counts are exact unless marked "≈". |
| **Camera FOV** | **Estimated, not measured.** These images are AI-painted, and their ring spacing does not fit one consistent pinhole projection, so no FOV can be solved for. The ranges given are the judgement of an art director (convergence rate, how far the foreground stretches, subject scale), meant as starting values to tune by overlay. "Implied pitch" is exact *given* an assumed vertical FOV: `pitch = atan((0.5 − VPy) · 2 · tan(vFOV/2))`. | Low. Tune by overlay. |

FOV is quoted as a Three.js **vertical** FOV. For the 9:16 portrait frame, horizontal FOV is about 0.6× of it
(vFOV 62° gives hFOV 37.3°).

---

## 3. Per-screen inventory

### Shared design invariants (all screens)

* **Benny** (screens 01–10): pink fur (measured medians #F363BF to #F877BF across refs), violet eyes, rosy cheeks, little paw
  pads (white pads with pink beans), a purple-and-white knit beanie (purple measured #751EE3 to #832BDE) with a ribbed purple cuff,
  a large deep-purple pom-pom, and a gold/yellow star (#F7BB19) on the **front-right of the cuff**. Rear views (04–10) always show
  two small fluffy arm nubs sticking out sideways just below the cuff. The body is visible **above** the water. He is never
  buried.
* **Gold metal**: a warm gold-copper. Class medians run #E18F49 to #F99649 (H ≈ 25–32°). Specular hot spots shift toward
  pale yellow (#FCE082). There is essentially no lime or yellow-green in any reference (<0.1% of pixels).
* **Water**: an electric cyan core (#029AF3 to #10AEF2, S ≈ 0.99) with hot-pink/magenta bands (#E240BB to #F739E5), white
  star-shaped specular glints, and white-lavender cloud foam (#F4E5FC to #F7F5FF).
* **Drum vs tube perforation**: the drums in 01, 02 and 03 (and the 11 interior) use **round holes**. The tubes and the
  chamber (04–10) use **elongated capsule slots** laid along the ring circumference in rows between the gold ribs.
* **HUD** (03–11, measured on 05 in 864 px space): a translucent purple pill at x 35–825, y 15–100. Inside it: a heart
  icon (≈80 px, x 65–145), "5/5 +", a divider at x≈345, a large gold "$" coin icon (≈82 px, x 378–460, overlapping
  the pill edge), the value (x 495–620), a divider at x≈708, and a round pause button (x 728–822). Below the pill sits
  the title banner (a purple capsule with a gold rim) at x ≈ 118–745, y ≈ 113–182. Banner text is bold italic in a
  cream-to-gold gradient with a dark outline, formatted as `NN · TITLE`.

### 3.01 Inside the Washing Machine (cinematic, no HUD)

| Field | Value |
|---|---|
| Camera | Inside the drum, low, just above the wave crests, looking along the drum axis toward the open door. The door-opening centre is at ≈(442, 420), i.e. **51% x / 27% y**. The inner opening is ≈495 px wide (57% of the frame width). Estimated vFOV **60–70°**. At 64° the door centre sits ≈16° above the optical axis, so the lower 70% of the frame is water. |
| Drum | Glossy pink-magenta perforated drum with **round** holes in concentric rows (holes ≈20–30 px near the top edge). Two gold blade-shaped **lifter paddles**: top-left (0–105, 30–280) and top-right (675–864, 0–275). |
| Door | Thick double gold rim: outer ring ≈110–760 px across, inner gold lip 195–690 × 200–640, with chrome bands between. |
| Laundry room (through the door) | Shelf of detergent bottles (300–440, 260–420), a white laundry basket with orange towels (285–440, 400–580), a window with a potted plant (470–560, 290–440). Soft, bright, desaturated lilac-white (#BBA6CC). |
| Water | Glossy waves rising from y≈480: cyan (#10AEF2) and hot-pink (#E949C5) bands with white foam crests (#F8E6FB) and splash droplets at the door lip. |
| Props | Pink T-shirt with a yellow star (430–864, 615–890, #EE50C6). Blue sock with white cuff stripes (200–365, 685–855, #2374F4). |
| Benny | Peeks out of the purple towel at lower left: hat 0–335 × 700–1000, face 30–330 × 930–1110, both paws gripping the towel edge at y≈1060–1110. Happy face, violet eyes. Visible part ≈410 px (**27% of frame height**), centre x ≈19%. The towel (#9533DB) fills the lower left, 0–640 × 1030–1500. |
| Bubbles | ≈20 large iridescent soap bubbles (largest ≈210 px at (720, 1150)) and ≈20 small ones. |
| Girl | **Composition only (identity override).** The pictured woman walks away inside the room at (530–640, 320–560): ≈240 px tall (**16%**), centred at 68% x / 29% y, back view, mid-stride, not looking at the drum. Target = the **official cartoon girl** at this position and scale, walking away. |
| Palette (coverage / median) | gold 4% #E9923F · cyan 11% #1AAEF2 · violet 16% #9F42DF · magenta-pink 30% #DB4AB0 · white 11% #F9E8FB |

### 3.02 Whirlpool Tumble (cinematic, no HUD)

| Field | Value |
|---|---|
| Camera | Same drum, dynamic. Looks up and back toward the door ring at the top centre: ring centre ≈(472, 165), **55% x / 11% y**. Water swirls around the frame edges in a spiral, giving the frame an implied Dutch tilt (Benny's head-to-feet axis leans ≈20° off vertical). Estimated vFOV **65–75°** (very wide, strong edge stretch). |
| Landmarks | Gold door ring (245–700, 0–330, #E78D43) with a glass splash inside. Pink drum wall with round holes (upper right, #C33FA4). Sock at upper left (30–245, 290–600, #0756E7). Pink star T-shirt at upper right (470–830, 235–610). Purple towel across the bottom (0–730, 1100–1536). A large spiral of cyan (#09A6EC) and pink (#E240BB) water with white foam lips. |
| Benny | Tumbling mid-frame with **spiral eyes** (purple spirals on white), an open "whoa" mouth, both arms up, and paw pads visible at (465–565, 1030–1120) and (640–720, 900–1010). Bbox ≈145–720 × 600–1120 (**34%**), centre x ≈50%. Fur #F363BF, hat #751EE3. |
| Girl | Not visible (she must not see Benny). |
| Palette | gold 3% #EA9246 · cyan 14% #09A4EB · violet 16% #9737E5 · magenta-pink 31% #E548B9 · white 12% #FBEBFD |

### 3.03 · WHIRLPOOL TWIRL (interactive)

| Field | Value |
|---|---|
| Frame | 727×1536 and **includes a decorative phone bezel** (≈10–15 px pink-white rim, rounded corners ≈40 px). In-game content is ≈12–715 × 12–1524. Match the content, not the bezel. `scripts/compare.py` masks the outer 4%. |
| Camera | High front three-quarter view looking **down** into the whirlpool basin. Drain mouth centre ≈(500, 1090), **69% x / 71% y**. The brightest glow, at the end of the slide, measures (559, 1101). The basin rim is an ellipse from y≈350 (far rim) to y≈1500 (near rim). Estimated vFOV **55–65°**. The implied view axis points ≈15° above the drain direction (at 64°). |
| Background (y 180–360) | Porthole window with cross mullions and a sky (190–500, 180–330). Pink console with a neon T-shirt screen and two buttons (40–270, 230–335). Pink/white and cyan/white striped towels stacked on a gold rail shelf (515–715, 195–360). The same backdrop recurs at the top of 04. |
| Whirlpool | Polished cyan (#1E9BD9) and hot-pink (#DD52AE) spiral of ≈3 visible turns, with cloud foam (#F4E5FC) on the rims. Converges on a **glowing drain lined with gold rings**; the **start of the cyan chevron slide** is visible inside (465–560, 1080–1160). Gold basin rim at the bottom (#E18F49). |
| Coins | **10**: one big foreground coin (≈145 px) at (226, 1097), plus 9 on the spiral from (440, 668), (538, 637), (421, 851), (505, 873), (568, 916), (615, 965), (640, 1022), (634, 1077) down to (604, 1121), shrinking from ≈60 to ≈22 px. Gold #F1AF10. |
| Benny | **Front** three-quarter view, waving, riding the spiral at left. Bbox ≈30–399 × 470–956 (**32%**), centre x **30%**, top 31%, bottom 62%. Face visible: violet eyes, open smile, foot pads at (175–245, 870–940). |
| HUD | ♥ **5/5** +, $ **1,330**, pause. Banner `03 · WHIRLPOOL TWIRL` (≈125–600, 130–190 in 727 px space). |
| Palette | gold 9% #EA9E48 · cyan 18% #249DDC · violet 7% #9A53D1 · magenta-pink 22% #D752A8 · white 15% #F9EAFC |

### 3.04 · THROUGH THE FIVE ARROWS (interactive)

| Field | Value |
|---|---|
| Camera | **Rear**, above and close behind Benny, looking down the steep slide into the gold ring tunnel. VP measured at (491, 681), **57% x / 44% y**. Estimated vFOV **60–70°**. Implied: VP ≈4° above the optical axis at 66°, so the camera looks almost straight down the slide's slope. |
| Background (y 150–380) | The same console, porthole and towel shelf as 03 (visual continuity from the 03 basin). |
| Tunnel | Large gold ring pipe mouth (outer ≈30–840 px across, centred ≈(440, 700)) with ≈12 concentric thick gold ring bands converging (#E77824), each with marquee-like highlights. |
| Chevrons | **Exactly 5** glowing white-cyan chevrons (#E4FCFF) on the blue ramp, pointing **away** from the camera in the direction of travel. Centres ≈(465, 722), (468, 760), (465, 805), (460, 865), (450, 945); width grows from ≈50 to ≈210 px. |
| Water | Steep blue ramp (#049BED) with magenta water edges (#ED49B5) and cloud foam banks on both sides (#FAE2FB). |
| Coins | **5**, along the **left** edge of the water: (422, 710), (378, 742), (330, 790), (262, 873), (176, 972). Gold #F19211. |
| Benny | Rear view, bbox ≈190–590 × 975–1400 by eye (mask 170–619 × 991–1407): **27%**, centre x 46%, bottom 92%. Hat brim width 52% of frame (mask). The star is on the front-right of the cuff. |
| HUD | ♥ **5/5**, $ **1,330**. Banner `04 · THROUGH THE FIVE ARROWS` (≈105–760, 118–182). |
| Palette | gold 16% #EC7D28 · cyan 16% #129FEE · violet 7% #9546DE · magenta-pink 20% #E84BB0 · white 8% #FAE7FC |

### 3.05 · FLOW INTO THE CURRENT (interactive): the current pilot, most detailed

| Field | Value |
|---|---|
| Camera | **Rear**, slightly above Benny's pom-pom height, centred behind him. VP measured at **(498, 479) → 57.6% x / 31.2% y**. Implied at vFOV 62°: the view axis is ≈12.7° **below** the tube axis and ≈3° to its left. The camera sees the brim of the hat as a shallow ellipse and the whole back of Benny, so its elevation over Benny is low (estimated 10–20° above horizontal). Estimated vFOV **55–65°**. |
| Tube | A **straight** visible stretch: the rings are **concentric about one VP**. The S-curves belong to the **water bands painted on the tube floor**, not to the tube itself. |
| Rings | ≈**10** thick, flat gold-copper ring bands, plus the near "frame" ring visible at the bottom corners (0–160 × 1200–1536, 690–864 × 1220–1536) and the bottom arc (130–760 × 1440–1536). The outermost full ring has its top edge at y≈196, partly behind the title banner, and is **26 px thick** at x=498. Its sides run near the frame edges (x≈10–60 at mid-height). Inner rings converge with rapidly shrinking spacing (screen-space ring-top spacing ≈105 → 60 → 25 → 20 → ≤15 px). Each band has a **double contour** (thin bright lip plus thick band) and evenly spaced bright "marquee" highlights (≈12–16 per visible half-ring). Median #F99649. |
| Walls | Glossy magenta-violet metal: violet #992FC2, magenta #CD32AA, non-gold median of the side walls #B830AE / #D234AB. Bright white-pink **specular streaks** run along the tube length. Perforations are **capsule slots aligned to the circumference**: horizontal dashes on the ceiling, vertical on the side walls. There are 3–5 rows of slots per bay between neighbouring rings. Near slots are ≈14×40 px. **No sky-blue tint anywhere** (pale-blue pixels are 0.4% of the right-wall box). |
| Nozzle lids | Copper half-dome lids protruding from the side walls at ≈3 and 9 o'clock, slightly above the waterline, one per bay, diminishing toward the VP. Left centres: (140, 368) 150×105 px, (291, 444), (390, 468), (≈428, 480). Right: (791, 462) ≈145×125 px, (663, 421), (599, 450), (569, 457). |
| Water | Fills the **entire tube floor**. Width ≈60 px near the VP (y≈500) → ≈420 px (49%) at y=600 → full frame width from y≈800 down. **Cyan dominant**: cyan class 28% of frame, median **#029AF3**. Two principal **hot-pink S-bands** (#F739E5) cross the mid-ground diagonally and split into thinner streaks near the camera. The cyan core meanders: bottom centre (430, 1500) → under Benny → (560, 700) → (450, 600) → (520, 520) → VP. That is ≈2 visible meanders with ±60–120 px lateral amplitude in the mid-ground. White **4-point star glints** are scattered across the surface. Near the camera, rows y=1200 and y=1400 measure **0% pink** (all cyan). |
| Foam | Cloud-like banks of white-lavender clumps (#FCF6FF, 10–40 px puffs with soft lavender shading) hug both water edges from y≈540 to y≈1300. Left bank 0–280 × 600–760; right bank 690–864 × 680–950; small near clumps at (0–130, 1000–1100) and (690–800, 1230–1300). |
| Splash | A **V-shaped spray fan** of white and cyan droplets radiating from Benny's base on both sides (180–680 × 1080–1260). |
| Bubbles | ≈18 large iridescent soap bubbles (25–65 px) **at the sides**, e.g. (85, 910) ≈60 px, (95, 1250) ≈60, (720, 1210) ≈65, (795, 860) ≈60, (50, 705) ≈50, plus ≈25 small ones (8–15 px). None sit over the centre path or over Benny. |
| Coins | ≈9–10 coins **centred on the stream ahead of Benny**, tilted to face the camera with the rim thickness visible: (473, 728) ≈95 px, (548, 660) ≈70, (482, 612) ≈55, (432, 575) ≈45, (465, 545), (495, 532), (519, 523), (535, 512), with the tail fading into the VP glow. Embossed "$" is legible. Median **#F4B70F**. The first coin sits ≈40 px above the pom-pom. |
| Benny | Rear view, bbox **x 230–612, y 768–1190** by eye (mask 200–649 × 740–1184 also catches neighbouring pink water). Height **≈27% of frame**, centre x **49%**, bottom **77%**. Hat cuff ≈297 px wide (34% of frame). Arm nubs at y≈1000–1080 on both sides. Proportions: the hat including the pom-pom is ≈62% of Benny's visible height, and the fur body below the cuff (y≈1030–1190) is ≈38%. Pom-pom ≈140 px across (#7F14EC). Knit: alternating white and purple stripes (3 purple) with visible stitches and a purple ribbed cuff (#7513ED). Yellow star (#F7BB19) on the front-right of the cuff (480–555 × 915–985), **facing the camera**. Fur #F64EB1. |
| HUD | ♥ **5/5** +, $ **1,420**, pause. Banner `05 · FLOW INTO THE CURRENT` (118–745, 113–182). |
| Palette | gold 8% #F78B2F · cyan 28% #039FF6 · violet 13% #9E36DF · magenta-pink 22% #EB38C3 · white 7% #FCF6FF |

### 3.06 · CREST THE RINSE ARCH (interactive)

| Field | Value |
|---|---|
| Camera | **Rear**, low (near the water), close behind Benny. The ring tunnel lies to the **right**: VP by eye ≈(670, 680), **78% x / 44% y**. (The brightest blur peak, (728, 749), is the coin trail end, not the VP.) Estimated vFOV **60–70°**. |
| Arch | The stream rises from beneath Benny (a cyan fan with ripple rings round him), sweeps **up the left side**, crests at top-left (≈150–330 × 500–560), then curls right and **dives into the tunnel** at ≈(560–700, 600–700). The coins follow the crest. A rainbow fringe runs along the right edge of the stream (≈560–864 × 700–1000). |
| Tunnel | Gold rings (#F79D52) with violet slotted walls (#873DB6). Two nozzle lids at upper left: (210–360, 190–300) and (75–240, 350–450). |
| Coins | ≈13: 4 large on the left limb of the arch at (320, 518), (235, 545), (178, 620), (268, 712), and ≈9 small ones along the crest into the tunnel. Gold #F5AB0B. |
| Foam / bubbles | Cloud foam in the lower corners (#F7F5FF), a V-splash at Benny (150–650 × 1100–1250), ≈15 large bubbles. |
| Benny | Rear, bbox ≈200–640 × 730–1190 by eye (mask 223–659 × 700–1172): **≈30%**, centre x ≈48–51%, bottom ≈77%. |
| HUD | ♥ **5/5**, $ **1,680**. Banner `06 · CREST THE RINSE ARCH`. |
| Palette | gold 4% #F89D45 · cyan 24% #05A6F7 · violet 18% #973CDA · magenta-pink 21% #E346C1 · white 9% #FBF4FE |

### 3.07 · DIVE THE WASHER TUBE (interactive)

| Field | Value |
|---|---|
| Camera | **Rear**, slightly above. VP measured at (634, 565), **73% x / 37% y**. Implied at 62°: ≈9° below the axis, with the VP ≈8° right of the view centre. Estimated vFOV **55–65°**. |
| Tube | A straight visible stretch with ≥10 concentric gold rings (#F99544) on violet (#9132BE) and magenta (#C735AA) slotted walls. **Five nozzle lids on the left wall**: (185–340, 215–330), (70–245, 400–525), (345–430, 390–445), (440–500, 470–510), (515–550, 525–545). |
| Water | An S-shaped blue (#03A0EB) and pink (#EF3AC6) stream entering from the lower left, passing under Benny and winding to the VP. Cloud foam on both sides, splash droplets round Benny. |
| Coins | ≈10–12: big (608, 820) ≈95 px, then (504, 740), (472, 690), (530, 650), (594, 636), (624, 626), (652, 624), … into the VP. Gold #F5B210. |
| Benny | Rear, bbox ≈205–640 × 780–1215 by eye: **≈28–30%**, centre x 49%, bottom 79%. |
| Plunge | **Not in this image.** The brief requires that, AFTER this visible winding stretch, the tube turns into a long, deep downward plunge that physically becomes the 08 inlet (no cut, fade or teleport). |
| HUD | ♥ **5/5**, $ **1,940**. Banner `07 · DIVE THE WASHER TUBE`. |
| Palette | gold 7% #F99540 · cyan 21% #04A2EE · violet 16% #9632CC · magenta-pink 29% #DE37BB · white 7% #FCF7FF |

### 3.08 · FINAL SPIN CHAMBER (interactive)

| Field | Value |
|---|---|
| Camera | **Rear**, at the end of the 07 plunge, looking into the chamber through a huge **gold inlet ring** that frames almost the whole picture (≈0–864 × 190–1260, an arch shape). Chamber door centre ≈(500, 400), **58% x / 26% y**. Estimated vFOV **55–65°**. |
| Chamber | The outer drum is magenta (#D22CA9) with large slots. The chamber floor and walls are a perforated violet (#9A36CF) receding toward the door. |
| Door | Round **chrome** door with a porthole of water and foam (360–640, 285–520), latch at right (585–625, 380–430). No person visible. |
| Towel / platform | A folded purple towel (390–580, 480–545, #7010C9) on a perforated round platform with a gold rim and gold legs (260–700, 530–610). |
| Spouts | **Four** perforated half-dome spout lids, each pouring water: upper-left (150–320, 330–420), upper-right (665–780, 370–450), lower-left (0–265, 605–800), lower-right (615–864, 640–850). |
| Water | A winding blue (#029EF1) and pink (#D728B3) stream from the bottom centre to under the platform. Splash at Benny. |
| Coins | **9**: (334, 856), (400, 780), (464, 726), (494, 672), (430, 660), (376, 632), (424, 610), (464, 596), (500, 580). Gold #F2AE17. |
| Benny | Rear, bbox ≈260–600 × 850–1210 by eye: **≈24–27%**, centre x 50%, bottom ≈80%. |
| HUD | ♥ **5/5**, $ **2,040**. Banner `08 · FINAL SPIN CHAMBER`. |
| Palette | gold 13% #F28126 · cyan 16% #03A0F1 · violet 13% #9730CC · magenta-pink 30% #D530AC · white 6% #FDF8FF |

### 3.09 · RIDE THE FINAL WAVE (interactive)

| Field | Value |
|---|---|
| Camera | **Rear**, the same chamber seen from further in. The door is upper right of centre (385–715, 190–480), centre (548, 335), **63% x / 22% y**. The stream end and platform are at ≈(630, 575). Estimated vFOV **55–65°**. |
| Wave | A **tall wall of water rising at the left** with a white curling foam crest (0–380, 390–700; crest #F3F3FF, body #0E8EEA) that rolls along the machinery. |
| Door view | Laundry room only: shelf with towels and jars, plant, baskets, window. **No person** is visible in 09. |
| Towel / platform | Towel (520–725, 435–505, #7811D3) on a perforated gold-rimmed platform (440–810, 490–555). |
| Spouts | Upper-left (115–335, 210–330), upper-right (755–864, 245–400), lower-right (590–864, 610–940), all pouring. |
| Coins | **10**, along the **left** of the stream curving toward the platform: (160, 966), (170, 850), (196, 760), (246, 692), (306, 644), (370, 618), (434, 594), (496, 586), (556, 580), (≈612, 577). Gold #F4A712. |
| Benny | Rear, bbox ≈225–620 × 850–1275 by eye: **≈28–29%**, centre x ≈49–51%, bottom ≈83%. |
| HUD | ♥ **5/5**, $ **2,280**. Banner `09 · RIDE THE FINAL WAVE`. |
| Palette | gold 6% #F79333 · cyan 30% #0799F0 · violet 16% #9235D6 · magenta-pink 16% #DD39BA · white 8% #FBF6FF |

### 3.10 · SLIDE INTO HIDING (interactive)

| Field | Value |
|---|---|
| Camera | **Rear**, close; Benny is large. Door (165–720, 180–580), centre ≈(440, 380), **51% x / 25% y**. The towel-tent opening is at ≈(470, 620) (**54% x / 40% y**) and is where the stream ends. Estimated vFOV **50–60°**. |
| Towel tent | A big plush purple towel (#6C0CC6) with a lavender knit trim, draped as a **tent** over a perforated gold platform: towel 85–720 × 430–710, platform 55–830 × 580–760. The stream narrows into the dark tent mouth (≈330–620 × 560–700). |
| Spout / foam | A spout lid at right (710–864, 400–680, #F99A4E) pouring water. Cloud foam on the left (0–250, 600–950). |
| Coins | **3**: (377, 810), (435, 733), (467, 690). Gold #F0950D. |
| Benny | Rear, bbox ≈160–655 × 860–1395: **≈35%**, centre x 47%, bottom ≈90%. The biggest Benny of the ride. |
| Girl | **Composition only (identity override).** In the right part of the door opening (≈445–570 × 255–420), ≈165 px of upper body (**≈11% of frame height**), side/back view at the window, unaware of Benny. Target = the **official cartoon girl** at this size and place, never looking toward the drum. |
| HUD | ♥ **5/5**, $ **2,500**. Banner `10 · SLIDE INTO HIDING`. |
| Palette | gold 2% #F69749 · cyan 19% #0E91F3 · violet 26% #8A29D5 · magenta-pink 15% #E53ABC · white 8% #FAEFFE |

### 3.11 · SAFELY HOME (victory cinematic + final UI)

| Field | Value |
|---|---|
| Camera | Inside the drum, looking at the door. Door-opening centre ≈(415, 440), **48% x / 29% y**. The perforation rings of the drum floor converge **below** the platform toward ≈(430, 950), **50% x / 62% y**. Estimated vFOV **50–60°**. |
| Door | **Open**: the chrome door is swung to the **RIGHT** (680–855, 165–710), with hinges at (670–700, 320–550) and a handle at (815–850, 405–470). The glass shows the reflected room. |
| Laundry room | Shelves with jars, plant, wicker baskets of lavender towels, a sunny window. |
| Towel / platform | **Folded** purple towel stack (190–630 × 520–785, #7B0DD8) with lavender trim on a perforated violet platform (#7A13C2) with a gold edge (#F79952), 25–835 × 670–870. Two curved gold legs at (175–260, 840–950) and (590–680, 840–950). |
| Floor water | Glimmering leftover blue puddles (#508EE6) with foam clumps and bubbles (40–790 × 1040–1310). |
| Victory badge | Purple pill (#54078E) with a gold border (#EC9627) at 205–645 × 1295–1480. A **gold laurel wreath inside each end**, a round check medallion above the centre (395–475, 1295–1365), and two lines of italic gold text: `FINAL SPIN` / `COMPLETE`. |
| Girl | **Composition only (identity override).** The pictured realistic woman (150–670 × 200–780) leans forward toward the camera through the door with **both hands on the towel's sides/top**. Head top y≈200, face centre ≈(470, 340), visible part ≈580 px (**38% of frame height**), friendly and eyes down on the towel. Target = the **official cartoon girl** in this pose and framing. The realistic woman must never be modelled. Benny stays hidden inside the towel. |
| HUD | ♥ **5/5**, $ **2,500**, pause. Banner `11 · SAFELY HOME`. |
| Palette | gold 6% #F29248 · cyan 2% #518EE5 · violet 24% #8E2BC0 · magenta-pink 29% #BC47AB · white 3% #FFEEF8 |

### 3.G Official cartoon girl (identity reference)

| Field | Value |
|---|---|
| Image | 983×1536 JPEG. Full-length, standing in a three-quarter view facing right, both hands holding up a lavender towel, smiling with an open mouth while looking right. |
| Proportions | Bow top y≈0, hair top ≈75, chin ≈450, soles ≈1530. Head (hair top to chin) ≈375 px against a figure of ≈1455 px gives **≈3.9 heads tall**: childlike cartoon proportions with a large head. |
| Hair | Dark warm brown (#69250B, highlights ≈#873921). Smooth top, pulled into a **big voluminous curly high ponytail** that spreads behind the head (≈40–350 × 80–560). Ringlets are thick and springy, not thin strands. |
| Headwear | **Purple headband** (#AE1AC3) tied into a **big purple bow** (#B91DCF) at the top-left of the head, with a **small gold star** on the bow. |
| Face | Rounded face, warm skin (#FAA477), large dark-brown cartoon eyes with white highlights, rosy cheeks, a small nose, a wide open smile. **Gold hoop earrings** (≈395–430 × 360–395). |
| Top | Hoodie with a hood and **horizontal lavender (#CE6DC9) and white (#FCE2ED) stripes**, plus a **gold star on the upper sleeve** (≈460–540 × 525–600, #F7AA38). |
| Bottom | Blue cargo jeans (#565597) with a flap pocket carrying a **yellow star patch** (≈440–530 × 1060–1150, #F1AC28) and **rolled cuffs** (≈260–540 × 1270–1350). |
| Shoes | Purple-and-white sneakers (#A021B1) with **yellow star** details (≈430–490 × 1440–1500). |
| Not identity | The window, flowers, baskets and lavender towels are background. The bottom-left corner shows a purple/white knit and pink fur next to a gold washer rim (a Benny-hat hint). It is a story cue only. |

---

## 4. Identity override summary (girl)

| Screen | What the reference shows | What to build | Masking for metrics |
|---|---|---|---|
| 01 | Realistic woman walking away in the room (pink tee, jeans, bun), ≈16% of frame height at 68% x / 29% y | **Official cartoon girl**, back view, walking away at normal pace, same place and scale. She must not notice Benny. | `compare.py` masks (500,300)–(680,600) in reference pixels |
| 02 | No girl | No girl | none |
| 09 | No girl in the door (room only) | No girl required in the 09 door view | none |
| 10 | Realistic woman at the window inside the door, ≈11% of frame height | **Official cartoon girl**, small, facing away or sideways, unaware | `compare.py` masks (430,230)–(590,470) |
| 11 | Realistic woman leaning in, hands on the towel, ≈38% of frame height | **Official cartoon girl**, same pose and framing, hands on the folded towel, Benny hidden inside | `compare.py` masks (150,190)–(700,780) |

Stage 11 check: the brief and both QA documents forbid the realistic woman at the ending. Any 11 capture must be
judged against `character_references/official_cartoon_girl_original.jpg` for identity and against `references/11…`
for pose, framing, door, towel, platform, puddles and badge.

---

## 5. Camera summary (targets)

Live rig values at commit 81e639e are listed for orientation only (`src/game/cameraRig.ts` `STAGE_CAM`; cinematic
FOVs from `src/game/Game.ts`).

| Screen | View | VP / door centre (x%, y%) | Estimated vFOV (ref) | Live vFOV @81e639e | Benny height (% frame) | Benny centre x / bottom y |
|---|---|---|---|---|---|---|
| 01 | inside drum → door | 51, 27 | 60–70° | 64 | ≈27 (peek) | 19% / ≈72% |
| 02 | inside drum, up toward door, tilted | 55, 11 | 65–75° | 64→68 | ≈34 | 50% / 73% |
| 03 | high front ¾ into basin | drain 69, 71 | 55–65° | 64 | ≈32 | 30% / 62% |
| 04 | rear, above, down the slide | 57, 44 (meas.) | 60–70° | 66 | ≈27 | 46% / 92% |
| 05 | rear, slightly above pom | **57.6, 31.2 (meas.)** | 55–65° | 62 | ≈27 | 49% / 77% |
| 06 | rear, low; tunnel at right | ≈78, 44 | 60–70° | 66 | ≈30 | ≈49% / 77% |
| 07 | rear, slightly above | 73, 37 (meas.) | 55–65° | 62 | ≈28–30 | 49% / 79% |
| 08 | rear, through the inlet ring | door 58, 26 | 55–65° | 62 | ≈24–27 | 50% / ≈80% |
| 09 | rear | door 63, 22 | 55–65° | 62 | ≈28–29 | ≈50% / 83% |
| 10 | rear, close | door 51, 25; tent 54, 40 | 50–60° | 62 | ≈35 | 47% / 90% |
| 11 | inside drum → open door | door 48, 29; floor 50, 62 | 50–60° | 66→58 | hidden | n/a |

---

## Appendix A: reproducible measurement snippet (Pillow + numpy)

```python
# python3 -I measure.py  (reads only; writes nothing)
import numpy as np
from PIL import Image, ImageFilter

def hsv(a):  # a: uint8 HxWx3 -> H deg, S 0..1, V 0..1
    a = a.astype(np.float32) / 255.; r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(-1), a.min(-1); d = mx - mn; h = np.zeros_like(mx); m = d > 1e-6
    rr = m & (mx == r); gg = m & (mx == g) & ~rr; bb = m & ~rr & ~gg
    h[rr] = (60 * ((g - b)[rr] / d[rr])) % 360; h[gg] = 60 * ((b - r)[gg] / d[gg]) + 120
    h[bb] = 60 * ((r - g)[bb] / d[bb]) + 240
    return h, np.where(mx > 0, d / np.maximum(mx, 1e-6), 0), mx

CLASSES = {  # H in degrees
  'gold':   lambda h, s, v: (h >= 18) & (h < 52) & (s > .45) & (v > .55),
  'cyan':   lambda h, s, v: (h >= 180) & (h < 225) & (s > .45) & (v > .55),
  'violet': lambda h, s, v: (h >= 255) & (h < 295) & (s > .40) & (v > .30),
  'pink':   lambda h, s, v: (h >= 295) & (h < 345) & (s > .40) & (v > .45),
  'white':  lambda h, s, v: (s < .18) & (v > .85),
  'fur':    lambda h, s, v: (h >= 312) & (h < 350) & (s > .30) & (s < .85) & (v > .75),
  'lime':   lambda h, s, v: (h >= 60) & (h < 110) & (s > .5) & (v > .6),
}

def coverage(path, skip_hud):  # % of frame + median hex per class
    a = np.asarray(Image.open(path).convert('RGB')); a = a[int(.13 * a.shape[0]):] if skip_hud else a
    h, s, v = hsv(a)
    return {k: (100 * f(h, s, v).mean(), '#%02X%02X%02X' % tuple(int(x) for x in np.median(a[f(h, s, v)], 0)))
            for k, f in CLASSES.items() if f(h, s, v).any()}

def material(path, box, cls):  # median of class pixels inside box (x0,y0,x1,y1)
    a = np.asarray(Image.open(path).convert('RGB'))[box[1]:box[3], box[0]:box[2]]
    m = CLASSES[cls](*hsv(a)); return '#%02X%02X%02X' % tuple(int(x) for x in np.median(a[m], 0))

def vp(path, win):  # brightest point after an 8 px blur inside window (x0,y0,x1,y1)
    L = np.asarray(Image.open(path).convert('L').filter(ImageFilter.GaussianBlur(8))).astype(float)
    sub = L[win[1]:win[3], win[0]:win[2]]; y, x = np.unravel_index(np.argmax(sub), sub.shape)
    return x + win[0], y + win[1]
# VP windows used: 03 (420,1020,580,1160) · 04 (400,600,600,760) · 05 (380,380,640,520) · 07 (520,480,720,640)
```

## Appendix B: material boxes used for the per-material hex values

Boxes are (x0, y0, x1, y1) with their class. Each box is a deliberate choice: a different box gives a slightly
different median.

* 01: drum wall (0,0,864,180) pink · door rim (190,200,700,640) gold · water (250,600,864,1300) cyan · pink water (400,1000,864,1500) pink · towel (0,1150,500,1500) violet · Benny fur (60,940,330,1100) fur · shirt (440,620,864,880) pink · sock (200,690,360,850) blue H205–245
* 02: door ring (240,0,700,340) gold · swirl (0,300,864,1100) cyan · Benny fur (240,780,700,1110) fur · hat (200,640,600,900) violet · towel (0,1100,730,1530) violet
* 03: basin rim (0,1350,727,1536) gold · spiral (300,450,727,1300) cyan/pink · Benny fur (50,640,380,950) fur · big coin (150,1020,300,1170) gold
* 04: rings (0,400,864,1050) gold · ramp (330,700,600,1000) cyan · chevrons (340,720,560,990) white · coins (120,700,440,1020) gold · fur (190,1250,590,1400) fur
* 05: rings (0,150,864,600) gold · walls (0,200,864,600) violet/pink · water (0,900,864,1536) cyan · pink bands (0,700,864,900) pink · coins (420,500,600,780) gold · fur (240,1030,610,1190) fur · hat (275,880,575,1030) violet · pom (355,770,500,890) violet · star (480,915,555,985) gold
* 06: rings & walls (300,180,864,800) · arch (0,500,700,1536) cyan/pink · coins (130,500,330,770) · fur (200,1000,640,1190)
* 07: rings & walls (0,150,864,800) · water (0,1000,864,1536) · coins (450,620,700,880) · fur (205,1030,640,1215)
* 08: inlet ring (0,190,864,1260) gold · floor (250,600,700,900) violet · towel (390,480,580,545) violet · water (0,1250,864,1536) · coins (290,590,520,900) · fur (270,1060,600,1210)
* 09: door (380,190,720,480) any · towel (520,435,725,505) · wave crest (0,390,380,560) white · wave (0,450,300,900) cyan · coins (100,560,640,1020) · fur (225,1080,620,1275)
* 10: towel tent (85,430,720,710) violet · spout (710,400,864,680) gold · water (0,700,864,1536) · coins (320,670,500,850) · fur (160,1150,655,1390)
* 11: drum wall (0,850,864,1300) violet · door (680,165,855,710) any · towel (190,520,630,785) violet · platform (25,670,835,870) violet/gold · puddles (40,1040,790,1310) cyan · badge (205,1295,645,1480) violet/gold
* G: hair (40,80,350,560) brown H5–38 S>.4 V .2–.75 · bow (380,0,560,120) violet · face (430,200,700,470) skin H5–35 S .2–.6 V>.75 · hoodie (300,450,800,880) lavender H260–310 S .15–.6 V>.6 / white · sleeve star (440,520,540,600) gold · jeans (280,850,600,1300) blue · star patch (440,1060,530,1150) gold · sneakers (280,1380,640,1530) violet · towel (680,420,950,860) lavender

# Screens 04–10: what the screen kit reuses and what each screen needs of its own (round 43, 2026-11-22)

Source: the user's approved pictures in `references/` (read-only), `analyze_reference.py` on each (`analysis_04_10/NN_analysis.json`,
`NN_overlay.jpg`), contact sheet in the round-43 report. Order of play (user, round 42): 04 → Bubble Dash → Sock Rescue → 05 → 06 → 07 → 08 → 09 → 10.
01, 02, 03 and 11 are the user's Google Flow videos and are never rebuilt.

## Kit components (tools/screenkit/blender_kit.py, Geometry Nodes) and where each picture uses them
| component | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
|---|---|---|---|---|---|---|---|
| washer drum / tube (RB_Sweep_Tube, radius profile, segments) | warm-gold ring pipe | straight perforated tube | **built** (off-centre drum, 2.79 u) | tube with broad S-bends (bent axis) | chamber (wide, short) + far tube | room wall + porthole surround | room wall + porthole |
| gold rings (RB_Sweep_Band) | many warm-gold rings with bulbs | rings | **built** (broad bands) | rings with bulbs | one huge arch ring | porthole ring | porthole ring |
| river channel (RB_Sweep_Ribbon + Flume, banked) | slide into the pipe + **five arrows** | S-river | **built** (crest arch, banked to 72°) | S-river down the tube | S-river across the chamber | river + **big wave crest** (left) | river toward the towel |
| pool / floor water | — | pool | **built** | — | chamber floor water | yes | yes |
| foam banks (RB_FoamBank) | yes | yes | pool edges | yes | yes | yes + wave foam | yes |
| copper wall paddles (half-disc trays) | — | yes | **built** (2 painted) | yes | big trays + **waterfalls** | trays + waterfalls | trays |
| coins (painted trail, depth from painted size) | yes | yes | **built** | yes | yes | yes | yes |
| bubbles | yes | yes | **built** | yes | yes | yes | yes |

## Own geometry each screen still needs (new kit builders, same `grid()` / Geometry Nodes helpers)
* **04 Through the Five Arrows** — the laundry-room drain opening at the top (towel shelf, buttons), the warm-gold tunnel mouth, and the **five white
  chevron arrows** lying on the water (3D chevron slabs). Analysis: VP confidence LOW (the arrows hide the core) → confirm the VP by eye first.
* **05 Flow Into the Current** — already its own kit (`tools/kit05`, 80 % round 33); to move it onto the screen kit: tube + S-river + rings fit.
* **06 Crest the Rinse Arch** — DONE in round 43 (this kit): drum, crest channel, pool, rings, paddles.
* **07 Dive the Washer Tube** — tube with a bent axis (broad S-bends), ring bulbs; the 07 → 08 downward drop (path continuity).
* **08 Final Spin Chamber** — a chamber (not a tube): back wall with the **glass porthole door**, the **towel on a ledge**, side trays with
  **waterfalls**, the huge arch ring framing it; Benny box LOW confidence in the analysis (wide spray) → SAM 2 prompts needed.
* **09 Ride the Final Wave** — the **wave crest** curling on the left (a swept surface with a lip), porthole showing the laundry room, towel ledge.
* **10 Slide Into Hiding** — the **purple towel** draped over the ledge at the top (the hiding place, cloth-like surface), open porthole with the
  girl (painted pixels only on a door plane INSIDE the room geometry, never a picture over the screen), river to the towel; hand-over to the 11 Flow video.

## Measured per picture (analyze_reference.py, phone frame 412 × 915)
| screen | VP (phone px) | VP confidence | ring ratio | river area | Benny box (phone px) | coins |
|---|---|---|---|---|---|---|
| 04 | (690, 1008)* | LOW | 1.40 | 0.18 | 25,584 – 283,822 | 10 |
| 05 | (491, 499) | ok | 1.51 | 0.48 | 90,465 – 309,692 | 12 |
| 06 | (138, 514)* → fitted (700, 605) picture px | LOW → fitted by ring RANSAC | 1.15 | 0.44 | 75,554 – 323,696 (SAM 2: 67,432 – 331,711) | 10 |
| 07 | (138, 236) | ok | – | 0.65 | 53,450 – 325,714 | 14 |
| 08 | (145, 316) | ok | – | 0.50 | 0,275 – 412,705 (LOW) | 5 |
| 09 | (749, 772) | ok | 1.24 | 0.36 | 88,515 – 312,748 | 20 |
| 10 | (375, 873) | ok | 1.38 | 0.24 | 47,518 – 335,807 | 4 |
\* the automatic VP is an estimate; 06 showed it can be far off (the ring RANSAC in `fit06.py` replaced it). Every screen's VP is confirmed on
its overlay before a fit.

## Process per screen (what is now automatic vs manual)
1. `analyze_reference.py` (auto) → confirm VP / Benny / coins on the overlay (manual check, minutes).
2. `screens/NN/fitNN.py` — the only screen-specific code: measured points → layout.json (06: ~150 lines, written once).
3. `segment.py` with SAM 2 prompts in `segmentNN.json` (auto masks + clean plate).
4. `setup_screen.sh NN` (auto, ~10 s): fit → masks → Blender Geometry Nodes → game folder.
5. Stills at the picture camera + `compare_screen.py` (auto, ~1 min) → one factor at a time.
6. Short / full real-touch runs (`tools/reflock/section_run.cjs`, TOUCH=1) only at milestones.

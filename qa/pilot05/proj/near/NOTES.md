# Screen 05 water while RIDING — `?proj05=1&projnear05=1` (2026-11-17 ~10:00–11:30 UTC)

User: "go fix the water swirls" → part 2 of `../flow2/NOTES.md`: the approved water is crisp only from the locked
start view; as Benny rides on, the water near him came from 24-texel-per-unit layers and melted into a pastel blur.
Test switch only — the default build, the protected BEFORE and every earlier switch are pixel-identical (below).
Full test URL: `?proj05=1&projwall05=1&projring05=1&projframe05=1&projlid05=1&projflow05=2&projnear05=1`.

## What it is
1. **Sharp near tile** (`tools/proj05/near_bake.py` → `assets/textures/water05/proj05_T2.png`, 2048 × 1024, about
   213 × 244 texels per world unit; `proj05_WT2.png` flow map; `proj05_near.json`). Built ONLY from approved pixels of the
   exact layer E: the crisp band just in front of Benny (s 132.2–136.4: glossy cyan core, the start of both pink
   ribbons), river coordinates `tile/approved_water_in_river_coordinates_far_on_top.png`.
   * Columns the locked view sees only further away (the sides with the pink ribbons) borrow their rows from the
     nearest stretch where they ARE visible (smooth per-column shift along s).
   * The right bank, never seen close by, is the mirror of the left bank (as the old tile layer did); anything else is
     folded from the nearest visible column (3.8 %).
   * Bubbles (they would repeat): 15 circles found in E (`tile/bubbles_found_in_exact_layer.png`), filled ALONG s
     from the water above / below (the streaks run along s); foam islands inside the river likewise; the foam banks
     along the edges stay.
   * Repeats MIRRORED along s (seamless). The band ends where both ribbons run straight (s 132.2 and the right
     ribbon's turning point at s 136.4), so the mirrored ribbons meander instead of zig-zagging
     (`tile/near_tile_three_periods_far_on_top.png`).
2. **Shader** (`src/vfx/waterRibbon.ts`, inside `#ifdef PROJ05`, runtime branch `uPjNear`; own samplers `uPjT2`,
   `uPjWT2` → 9 texture units with proj05): `pjNearK` = 1 only on river the camera has APPROACHED — within ≈14–20 units
   of the eye, not on the lifted outer bank edge, and with BOTH the exact layer and the near layer magnified. There the
   sharp tile replaces the soft tile and the near layer, the flow map follows the tile (sign flipped on mirrored
   periods), and the approved near-field flares come back (the 05 flare set the default water was tuned with: big
   horizontal-armed 4-point stars + a few lens flares; `projglint05` = gain). Everywhere else nothing changes.
   The detail layer stays on (it adds fine ripples on the tile).

## Measured
**Riding** (`NEAR_WATER_STATS.json`, `tools/proj05/near_water_stats.py`): the water beside and below Benny (rows
900–1460, minus Benny + splash, near gold frame, coins). Riding frames show another stretch of river than the approved
picture, so this compares how the water LOOKS, not pixels.

| | detail (crisp streaks) | colour strength | pink share | sparkle share |
|---|---|---|---|---|
| approved picture | 6.13 | 0.743 | 12.9 % | 9.1 % |
| BEFORE, 8 / 12 / 17 / 25 units ahead | 2.07 / 1.93 / 1.38 / 1.26 | 0.74 / 0.78 / 0.72 / 0.76 | 35 / 11 / 12 / 35 % | 5.0 / 5.9 / 0.1 / 0.5 % |
| **NEW**, 8 / 12 / 17 / 25 units ahead | **2.66 / 3.55 / 3.23 / 3.44** | 0.75 / 0.76 / 0.84 / 0.78 | 16 / 13 / 4 / 11 % | 2.6 / 2.9 / 1.2 / 1.1 % |
| BEFORE ride clip, flow running, 1 / 2 / 3 s | 1.55 / 0.83 / 1.00 | 0.78 / 0.72 / 0.77 | | |
| **NEW ride clip**, flow running, 1 / 2 / 3 s | **3.07 / 2.78 / 2.38** | 0.79 / 0.79 / 0.79 | | |

So riding water is 1.3–2.7× crisper (2–3× with the flow running) and keeps the painting's colour strength — but it
reaches about half of the approved picture's crispness (the painting itself only holds 60–240 texels per unit in that
band), and near Benny it is more cyan / less pink than the painting at some moments (4 % pink at 17 units ahead).

**Start view** with the switch: water region vs approved unchanged (mean 8.32, 88.5 % within 10 levels, SSIM 0.923);
2,696 of 1,327,104 pixels differ (110 by > 10 levels), a faint line on the right bank invisible at 3× zoom.

## Checks
* Default build (no switches): 0 differing pixels; protected BEFORE `?ringa=26&nearfloor05=0` vs
  `qa/pilot05/wave9/baseline/05.png`: 0; tunnel + paddles combo without `projnear05`: 0; old flow and `projflow05=2`,
  12 running-clock frames each: 0 in every frame.
* `gameplay-test.mjs` with every switch on (incl. `projflow05=2&projnear05=1`): 8 / 8 (`tests/gameplay_projnear05.json`);
  continuity: all stage joins gap 0; references 13 / 13 unchanged; `tsc` OK.
* `tools/proj05/flow_bake.py` was made importable (functions reused by near_bake.py): re-run, outputs byte-identical.

## Pictures (full size, separate)
`1_APPROVED.png` · `2_BEFORE_riding_17_units_ahead.png` · `3_NEW_projnear05_riding_17_units_ahead.png`;
`ride/` 8 and 25 units ahead (before / new), `ride/NEW_locked_start_view.png`, 3 s ride clips with the flow running
(`ride/BEFORE_ride_3s_flow_running.mp4`, `ride/NEW_ride_3s_flow_running.mp4`).

## Remaining (seen in these frames)
* The `?proj05=1` river-bank strip (`src/vfx/proj05Apron.ts`, low-resolution) shows as a lighter wedge with a hard edge
  at the left / right of the near water — more visible now that the water beside it is crisp.
* Near Benny the riding water is cyan-dominated; the painting has more pink near him (its pink ribbons converge
  toward the bottom corners).
* The repeat of the tile (8.4 units, mirrored) is visible as a regular rhythm if one looks for it; a symmetric "eye"
  of streaks sits on each mirror line.

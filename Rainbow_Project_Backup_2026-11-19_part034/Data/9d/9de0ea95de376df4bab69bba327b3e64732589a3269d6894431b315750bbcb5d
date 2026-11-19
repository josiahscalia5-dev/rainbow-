# Screen 05 water in motion — `?proj05=1&projflow05=2` (2026-11-16 ~21:50–22:15 UTC)

User (after approving the Blender paddles): "yes go fix the water swirls" — the water must keep the approved swirl
design while the game runs / Benny rides. Work in progress: part 1 is done and measured, part 2 is diagnosed and
planned but NOT built yet (the user asked to save everything at this point).

## Part 1 (done): the flow animation no longer blurs the design — `&projflow05=2`
**Finding.** Every screenshot so far was taken with the QA clock frozen at t = 12, the one instant at which the
two-phase flow has zero offset. With the clock running the old flow slides two copies of the WHOLE approved picture up
to ±0.8 u straight along the river and cross-fades them: the pink ribbons, foam banks and bubbles double up for most of
each 1.8 s cycle (`still_worst_moment/2_BEFORE_old_flow.png`).

**Fix** (switch only; the old flow stays the default of `proj05`):
* `tools/proj05/flow_bake.py` → `assets/textures/water05/proj05_WN.png`, `proj05_WT.png`, `proj05_flow.json`: the
  direction of the approved picture's OWN streaks in river coordinates (structure tensor of the baked N / T layers;
  `flow_direction_map_N.png`: yellow = streak direction, grey = foam banks / bubbles that stay still).
* `src/vfx/waterRibbon.ts` (inside the `#ifdef PROJ05` block, runtime branch `uPjFlow2`): each flow phase slides ALONG
  the streak direction (the S-curves), scaled by the mask; `projflowmix05` (default 0.5) = share of the picture that
  travels, the rest stays exactly where it is painted. `projflowd05` (1.6 u) and `projrate05` (0.55 /s) as before.

**Measured** (`measurements.txt`, tools in `tools/`; locked camera, 12 running-clock frames = one cycle). The water
surface also heaves with the waves (Benny and the coins float on it; the tunnel does not move), so each flowing frame
is compared with the flow-OFF frame of the SAME instant (`projflow05=0`), water region:

| similarity to the unflowed approved design | old flow | `projflow05=2`, mix 1 | **`projflow05=2` (mix 0.5, default)** |
|---|---|---|---|
| SSIM, cycle mean / worst frame | 0.721 / 0.631 | 0.777 / 0.696 | **0.930 / 0.905** |
| pixels within 10 levels, cycle mean | 65.0 % | 71.0 % | **82.9 %** |

Direction (the moving part alone, tracked with phase correlation in three river windows): toward the camera in 8 / 8
frame pairs in every window (old flow: 7 / 8 in two windows); on the diagonal pink ribbon it also drifts sideways along
the ribbon. Moving-part amplitude is about half the old flow's (mix 0.5) — raise `projflowmix05` for more motion.

**Checks.** Old flow (no `projflow05`): 0 differing pixels in all 12 running-clock frames before vs after the shader
change. New mode at the frozen clock vs old: 100 px differ by 1 level (rounding of the extra mix). NOT yet re-run after
this change: default-build capture, protected BEFORE, gameplay test with `projflow05=2` (the code is inside
`#ifdef PROJ05`, so the default program should be unchanged — verify first thing next time).

## Part 2 (diagnosed, NOT built): the water turns into a pastel smear while RIDING, with either flow
`ride/BEFORE_old_flow_17u_ahead.png` / `ride/NEW_projflow05_2_17u_ahead.png` (ride clips `ride/*.mp4`): 17 u into the
ride the near water is a blur with both flows. Layer map `ride/layer_map_0_8_17u_…png` (green exact E, blue near N, red
tile T): E is only sharp from the locked camera; as the camera advances the near field switches to N then T, both
stored at 24 texels per unit along the river while the screen near Benny needs 100+.
Source resolution of E along the river (texels per world unit): s 130.2 → 239, 131 → 171, 132 → 116, 134 → 72,
136 → 60, 137.5 → 51, 140 → 29, 144 → 23; visible u-range grows from ±0.33 (s 130) to full width at s ≈ 144.6.
A single painting cannot give crisp detail for the far river; the crisp detail that exists is the NEAREST water.

**Plan (`?projnear05=1`, one factor, reversible):**
1. Bake a high-resolution near tile T2 (≈1024 × 768, u −1..1 × s 130.5..137.5 = 7 u) from E through the LUT; outside
   the visible u-range reflect the row about its visible edge. Load it with `MirroredRepeatWrapping` along s (seamless,
   period 14 u) and mipmaps, INTO the existing `uPjT` sampler (set `uPjTS = (130.5, 7)`): no new sampler.
2. Shader: under the switch gate the near layer by the same magnification factor as E
   (`wN *= smoothstep(0.3, 0.55, mE)`), so E and N both hand over to the crisp T2 as a stretch of river gets close. At
   the locked camera mE ≈ 1 → the locked picture stays as it is.
3. Flow map W2 for T2 (`flow_bake.flow_of`), loaded into `uPjWT`; flip the slope sign on mirrored periods
   (`mod(floor((s − a) / P), 2)`).
4. Measure near-water detail contrast at 8 / 17 u ahead (old vs new), layer map, ride clip, locked-view pixel check,
   gameplay 8 / 8.
Known trade-off to show the user: far layout (exact) dissolves into the repeating near pattern as it approaches.

## Also seen
* Flow-off frames show two faint vertical seams beside Benny when the wave lowers the surface (the artwork fill under
  the approved Benny), already listed in `../NOTES.md`.
* `scripts/proj05-move.mjs`: the previous session's script was overwritten by mistake earlier in this session and
  restored byte-identical from `e27c6fa` (options `--d`, `--still`, `--steer`, `--zigzag`, `--clip`).

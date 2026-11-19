# water-fx-specialist, wave 10 (Screen 05 water) — test switch `?water05=1`

Goal (user, 2026-11-16): the 05 water as close as possible to `references/05_flow_into_the_current.png` — thick
brilliant cyan-blue liquid, rich flowing magenta-pink bands, continuous S-curves into the golden light, strong white
glossy highlights, layered movement, natural splashes around Benny; no flat stripes / runner track.
Baseline = CURRENT = `qa/pilot05/current_default_05.png` (default build, T2). Only Screen 05 water was touched; the
river width (course.ts), camera, gameplay, tunnel/rings/walls/lids, Benny and HUD are unchanged.

## The switch
`WATER05` in `src/vfx/waterRibbon.ts` = `location.search` has `water05=1` (guarded: false in vite-node). Off, every
shader program and geometry attribute is the old one (`#ifdef WATER05` blocks, `+ coreShiftW10() = + 0`), so the
default build renders pixel-identically. Capture: `node scripts/capture.mjs 05 --out=DIR --q=water05=1`.

## What I learned first (approved vs CURRENT, colour samples + masks, scratch tools)
* Approved cyan has R ≈ 0 (#00B5FB, #02C6FC, highlights aqua #21E0FC … #7DF9FA); CURRENT cyan is pastel
  (#46BDFF, #5FC7FF: R 0x30–0x60, B clipped) — the base palette was right, the white Fresnel / speculars / streak
  overlays pushed it pastel.
* Approved bands ramp in hue across each edge: hot pink #F92BD6 → violet #A14FE4 → periwinkle #866FF6 → blue
  #3FA3F9 → cyan over ≈40 px, and toward the bank to blue-violet #5F73F3 / deep #4287ED (the "black" gaps in the
  HSV masks). CURRENT cuts pink → cyan in 1–2 samples and its pink is lavender (#FF60FF).
* Approved near field = deep glossy blue with ∩-bowed bright crest arcs and ≈8–12 big jagged white flares;
  CURRENT = fanning rays, a grid of small stars, flat white lens pills. Approved splash = a wide fan of thin water
  threads; CURRENT = two dense white "wings".
* Far river (screen mapping from a scratch probe of the locked camera): the real ribbon's exit bend (s 174–181)
  jogged the visible core 478 → 547 px over only 18 rows (y 587 → 569) just before the far-block seam, then the
  far block swung back left — the "blob" at the VP. The far block drew a narrow body hugging the outer wall with
  thin bands on its banks, and a flat lavender foam sheet left of the seam (the "wedge", identified with a scratch
  debug-colour render). Note: the approved far river is WIDER than our whole floor chord at y 505–560 (e.g. y 525
  approved ≈ 355–630 incl. foam, our chord 415–583) — tunnel/camera geometry, not water.

## Iterations (each: 05 capture with the switch, `tools/qa/diff05.py`, full-size visual comparison)
All iterations: 86 draw calls / 567,415 triangles at the 05 checkpoint (identical to CURRENT; ≤130 / ≤650k);
0 console errors. Full table: `DIFF05_all_iterations.md`. Shares are crude HSV indicators, not a fidelity score.

| band (y) | metric | APPROVED | CURRENT | it01 | it02 | it03 | it04 (NEW) |
|---|---|---|---|---|---|---|---|
| VP + far river 470–640 | cyan / pink / white % | 8.5 / 19.1 / 5.3 | 7.4 / 43.5 / 6.7 | 7.0 / 43.0 / 6.8 | 7.5 / 42.5 / 6.3 | 7.5 / 42.5 / 6.6 | 7.3 / 42.6 / 6.9 |
| mid river 640–1000 | cyan / pink / white % | 23.3 / 20.4 / 9.3 | 38.7 / 25.2 / 8.1 | 30.5 / 22.6 / 8.2 | 30.5 / 22.6 / 8.2 | 30.5 / 22.6 / 8.2 | 29.0 / 22.3 / 8.8 |
| Benny + near 1000–1536 | cyan / pink / white % | 32.1 / 12.7 / 8.1 | 49.1 / 15.6 / 10.3 | 49.4 / 15.0 / 9.7 | 49.2 / 15.0 / 9.7 | 48.8 / 15.1 / 9.3 | 47.5 / 15.0 / 9.7 |
| mid / near | mean saturation | 0.68 / 0.72 | 0.66 / 0.69 | 0.62 / 0.69 | 0.62 / 0.69 | 0.62 / 0.69 | 0.60 / 0.67 |
| S-swing px VP / mid / near | | 231 / 360 / 436 | 192 / 271 / 378 | 171 / 319 / 337 | 219 / 319 / 337 | 219 / 319 / 417 | 219 / 310 / 298 |
(The VP band pink share is dominated by the tunnel walls, not the water. The S-swing is the median x of cyan|pink
pixels per row, so it also moves when colours / flares change — the near value jumps 337 → 417 → 298 between
iterations without any change to the band paths; treat it as unstable.)

### it01 — ribbon look (`src/vfx/waterRibbon.ts`)
`WATER05` flag + define; `W5_*` palette solved from approved samples through the post chain; `brush05()` (flow-
aligned anisotropic value-noise satin, 3 octaves, pixel-size fade, finer octaves drift faster); new `#ifdef WATER05`
05 colour block in `FRAG` main(): band coordinate `tb` per nearer band / wake sweep, hue ramp pink → violet →
periwinkle → blue → cyan (core side) and → blue-violet (bank side), hot-pink satin with white-pink lens streaks,
electric cyan with aqua cores, same-hue Fresnel only, near swells; old `speedStreaks()` skipped under the switch.
Verdict: mid field hue clearly closer (cyan R ≈ 0, violet band edges, pink hotter), cyan share 38.7 → 30.5 and pink
25.2 → 22.6 move toward the approved; near field duller than CURRENT (lost sparkle, soft swell bands). Mixed.

### it02 — far river + seam jog + near gloss (`waterRibbon.ts`, `src/world/far05.ts`, `src/world/materials.ts`)
`coreShiftW10()` (CPU, ribbon `aCore` + far-block mirror `relLay`): holds the visible core near the tunnel line
across the exit bend s 171–189 (coins NOT moved; ride frames show them on cyan as before). `FAR05_CORE_W10` +
`designW10()`: far body over the whole floor chord, bands beside the winding core. `farRiverMaterial` W10 block:
same palette / ramp / brushed streaks, `customProgramCacheKey` 'far-river-w8-w10'. Near: brighter swell tiers,
bigger flares. Verdict: the far river now continues as one banded channel into the light (VP S-swing 171 → 219,
approved 231; CURRENT 192); near still dull; the flat lavender wedge is still there. Far closer, near not.

### it03 — near arcs, far rim, splash (`waterRibbon.ts`, `materials.ts`, `src/vfx/riderSplash.ts`)
Near swells with a strong ∩ bow (approved arcs), crisp aqua-white crest lines; `bolt05()` jagged lightning flares
replace the flat lens pills; far: beyond the bank = deep violet water, only a narrow bubbly foam rim (wedge no
longer pale); splash VERT5 (`#ifdef WATER05`): rope threads ≈0.4× as wide, 1.15× longer, fanned from straight back
to ≈65° out. Verdict: near field structurally closer (∩ arcs, thin thread fan instead of wings) but only ≈2 flares.

### it04 — FINAL / best (`05_NEW.png`)
Flares on one cell row per swell crest (≈10 bolts sit on the arcs), softer troughs, whiter streak cores in cyan and
pink, more / longer mid-field flow flares; far bands wider (w 0.85 → 0.55 u, separation 3.9 → 3.0 u) and darker
purple-violet outer water (#7A2AD8-ish, approved #9837C3). Verdict (full-size `05_APPROVED_CURRENT_NEW.png`):
* closer: far river (continuous banded S-channel into the light instead of the right-hand blob; VP swing 219 vs
  approved 231), near field (∩ crest arcs + lightning flares + thin splash threads vs rays / star grid / pills /
  wings), electric cyan without the pastel cast, hue-ramped satin band edges; mid cyan / pink / white shares all
  moved toward the approved (cyan 38.7 → 29.0 vs 23.3; pink 25.2 → 22.3 vs 20.4; white 8.1 → 8.8 vs 9.3).
* not closer / worse: mean saturation fell (mid 0.66 → 0.60, approved 0.68; near 0.69 → 0.67, approved 0.72) —
  the violet / periwinkle ramps and aqua-white cores lower it; the mid-field bands still read wider and less
  densely streaked than the approved; near S-swing indicator 378 → 298 (approved 436, unstable metric).
* Overall: closer in structure in the far river and the near field; the mid field is only somewhat closer. I would
  not call the whole frame "clearly closer" without the user's eye — it is a candidate for the user's yes/no.

## Checks (switch logic and regressions)
* Default build: fresh `capture.mjs 05` vs `qa/pilot05/current_default_05.png`: max pixel difference 0 over the
  WHOLE frame (HUD included), 86 calls / 567,415 tris.
* Switch on, 04 / 06 / 07 (`--q=water05=1`) vs off: 06 and 07 pixel-identical. 04: with `bloom=0` the difference is
  confined to x 310–526, y 448–674 = the 05 water seen through the 04 drum exit (22,018 px); with bloom on another
  22,799 px elsewhere differ by 1–2 levels only (the bloom halo of that opening). `tests/04_off_on_diffmask.png`.
* LOW quality with the switch (`--q=water05=1&quality=low`): compiles, 0 console errors, 86 calls / 425,525 tris
  (`it04_low/05.png`).
* Ride through the end of 05 into 06 with the switch (scratch ride, steer 0, s 150 → 194): continuous, no pops at
  the seam or the 06 hand-over, coins on cyan like the switch-off ride (`ride/`).
* `npx tsc --noEmit` pass; `npm run -s test:continuity` `"ok": true` (05→06 gap 0); `node scripts/gameplay-test.mjs`
  (default) pass 8/8, plunge drop 61.41. `scripts/gameplay-test.mjs` has NO query-param option, so I ran an
  unmodified-logic scratch copy with `&water05=1` appended to its URL: pass 8/8, plunge 61.41
  (`tests/gameplay_test_water05.json`; the tracked qa/ outputs were restored afterwards).
* Scratch renders that were not iterations: two compile/look checks before it01, one `waterhide=foam` render and one
  debug-colour render to identify the far wedge.

## Left undone
* Mid-field bands: still wider / flatter than the approved ribbons; the approved packs far more bright white-pink and
  white-aqua streaks and glints into each band; saturation is lower than CURRENT.
* Far river: the approved far river is wider than our floor chord (geometry, not water); the course's exit-bend
  body still forces a small residual jog at y 567–586; the far coin at ≈(550, 540) is off the core (coins untouched,
  path-camera "far coin trail" candidate); the far block has no time uniform, so it does not animate (needs a
  game-clock hook in environment.ts, which I did not touch); a darker purple wedge remains left of the seam.
* Near: the bolts are smaller and dimmer than the approved's big haloed flares; LOW_Q draws no flares at all under
  the switch.
* Splash: threads are thinner and fanned, but the approved has many more droplet beads and a white froth collar
  where the threads leave the fur.
* The Marble pano (`marblePano05()`) is not used as a water reflection source (not needed for these changes).

## Files
Code (all changes behind `?water05=1`): `src/vfx/waterRibbon.ts`, `src/world/far05.ts`, `src/world/materials.ts`,
`src/vfx/riderSplash.ts`; docs: `docs/vfx/water.md` (section "Screen 05 test W10").
Evidence: `05_NEW.png`, `05_APPROVED_CURRENT_NEW.png`, `DIFF05_all_iterations.md`, `it01`–`it04/` (05.png +
diff05.md), `it04_low/`, `ride/`, `tests/`.

# wave 8 · washer-environment-modeler · Screen 05 (second pass after wave 7 it06)

## Plan (written first, before any capture)
1. RINGS (gold05/withBandShading, sign-robust): measure ref ring #1/#2 bulb pitch/size/brightness + highlight line + halo first;
   then denser, bigger, brighter warm-white bulbs with a yellow halo + a brighter white-yellow crown line; body hue only if measured.
2. WALLS (wall05): warmer F0/base toward magenta-pink (between '#d49cf4' and '#f29ad6'), lighter lit panels, stronger lengthwise
   white-pink streaks; keep the capsule-slot rows. Target: violet share 29–46 %, spec-white ≈5 %.
3. LIDS (lid05 geometry in tube.ts + lidMat05): rounded half-dome puck SHAPE first (domed top, rounded rim), then glossy shading
   with a top highlight (target lid V std ≈0.22).
4. VP (my glow/tunnelEndGlow section): larger warm white-gold core so the rings recede evenly into light.
5. Near gold frame corners last (gold share 32/33/43 → 43/50/45 %). Max 6 captures, screen_report + side-by-side each,
   revert what does not look closer; tsc + regress 04 06 07 08 at the end; read REQUESTS.md between iterations.

## Log
Measurement script (reproducible windows/classes): `qa/pilot05/wave8/environment/measure05.py` (VP centre fixed at (499,478) from 4x crops of
both images; classes in its docstring). REF / BASE values below come from it, so they differ slightly from the wave-7 table.
Whole-frame/band mads also move with the water + foam specialists' parallel wave-8 edits (river mid / near bands).

* it01 (02:55) — materials.ts: `withBandShading` v2 (sides/deeper rings: pale-yellow crown (252,206,130) between orange (246,151,70) and an
  orange-red line (234,89,4); peach-orange lip; only the near top arc (±30°) keeps the rose body; deeper rings orange), new `marblePano05()` +
  `marblePanoRotation05()` (Marble asset used: `qa/worldlabs/05/pilot/full/pano.png` → `assets/textures/marble05_env_1024.jpg`, 1024×512, 183 KB,
  lower hemisphere mirrored from the upper about the VP row so it never reflects the cyan river; texture created with a frozen Math.random +
  fixed uuid so later canvas textures stay identical), `PerforatedOptions.envMapRotation`, VP disc profile (white core to 0.3R, pale yellow,
  yellow-orange, orange, red-orange). environment.ts (my section): DROPPED the real ring at sF05 (path-camera request; `ringSlots05` keeps lids +
  slot phase), near ring `band05near` (height 0.13, lip 0.065/0.32, groove 0.1), wall05 F0 '#eaa2ea', emissive '#3c0848', no bevel, Marble env,
  mid tint '#9a3ad8' 0.3 @14–60, strips05 4.4 / alt 0.8.
  Report vs baseline: mad 51.2 → 52.7 (river mid 47.2 → 49.5, near 46.7 → 50.3: water/foam parallel edits, not mine), **tunnel+VP 61.0 → 59.7**.
  86 calls / 572,007 tris. Seen: walls now pink-magenta (overshoot: violet share upper 14 %, left 22 % vs ref 40/51 %) with RED-ORANGE
  blotches on the near upper-left wall (smeared reflections of the pano's ring arcs) and pale pink far walls near the VP; ring #1 top now
  192–234 (ref 188–230); ring sides between spots match the ref ring #2 cross-section (no-bloom scratch: dark → orange (245,118,85) → orange
  line → pale yellow (252,204,132) ≈10 px → peach); bloom adds a ≈(+8,+8,+15) haze. VP core: r8–16 (255,221,151) vs ref (250,220,141),
  r16–24 (252,164,101) vs (248,175,97) — close; r32–90 too bright/pale (far walls). Lids unchanged (V std 0.139).
* it02 (RECOVERED in wave 9 from the evidence — the wave-8 account ran out of credits before logging it; changes read from the
  autosave diff 64b9e5e → aa35c8a): `assets/textures/marble05_env_1024.jpg` pre-blurred ≈6 px (183 → 51 KB) so the pano's sharp ring
  arcs no longer smear into red-orange blotches; wall05 F0 '#eaa2ea' → '#dc9ef0' and mid tint '#8a30d2' 0.45 @8–50 (violet back with
  depth); `withLidShading` v2 palette sampled on ref L1 (orange near end, peach → orange-gold → pale yellow → white → orange-red band,
  dark plum underside, view-side-aware lathe azimuth); tube.ts `wallLidGeometry('slab')` barrel rim (0.95 → 1.04 → 0.95) + domed top;
  unused `oval` option added to buildTubeGeometry/buildRingsAt/buildWallLids. Report (it02/metrics.md): mad 51.2 → 50.7, hue_corr
  0.856 → 0.88, edge_corr 0.177 → 0.189, **tunnel+VP 61.0 → 58.7**. measure05.py on it02: lid L1 V std 0.188 (ref 0.216), upper-wall
  violet share 25.4 % (ref 40.0), left wall 4.0 % (ref 50.9), VP core px 723 (ref 1306). Side-by-side: walls magenta-pink with dark
  slots, rings orange-salmon, lids still read as long copper planks jutting out (shape, not shading, is the mismatch). = wave-9 baseline.

# Rainbow water system (`src/vfx/`)

Owner: water-fx-specialist + foam-bubbles-particles. Real-time, traversable 3D geometry with custom
GLSL; no video, no baked frames. Flow direction follows the master course (`src/world/course.ts`).

## API (`src/vfx/index.ts`)

```ts
const water = createWater(course, { quality: 'high' | 'low' });
scene.add(water.group);
water.update(time, dt, bennyS, camera);              // every frame
water.wake(bennyPos, forward, right, speed, dt);     // while riding (ripple rings, V-wake, side spray)
water.splash(pos, up, strength);                     // landings / impacts
water.surfaceHeight(s, lateral, time);               // height along course `up` at (s, lateral)
water.controls.drumSwirl     // 0..1  scene 02 spinning shell on the Drum A wall
water.controls.drumAgitation // 0..1  Drum A swell (0.15 calm for 01, 1 for 02)
water.controls.outro         // 0..1  scene 11: stream + chamber foam drain away, puddles fade in
water.parts.{ribbon, whirlpool, drum, drumSwirl, finalWave, puddles, foam, bubbles, spray}
```

Benny rides ON the surface: body centre at
`course.pointAt(s, lateral, water.surfaceHeight(s, lateral, t) + BENNY_RIDE_OFFSET)` with
`BENNY_RIDE_OFFSET = 0.55` (0.8-radius body → lower third in the water). `surfaceHeight` mirrors the
vertex displacement on the CPU (ribbon trough + waves; whirlpool funnel in 03; Drum A swell in 01/02).

## Components

| Part | File | Geometry | Shader highlights |
|---|---|---|---|
| Stream ribbon | `waterRibbon.ts` | rows every 0.4 u (0.7 low) × 18 cols (10 low) + edge skirts, from the Drum A drain (`marks['02_drain']−1`) to the towel; concave trough, edges +0.28 | cyan core / meandering hot-pink bands, two-phase flow-map advection (speed = stage speed, no shear), crisp white streak lines + fine near-detail layer, Fresnel haze, spec, twinkling sparkles, cellular soap-foam fringe, Benny ripple rings + V-wake, **exactly 5 chevrons** on 04 (`s0+8.5`, spacing 3.6), clean foamy hand-over to the whirlpool in 03, outro drain |
| Whirlpool | `whirlpool.ts` | polar funnel mesh over `WORLD.basin` (`funnelY`), 56×128 (32×72 low) | bands follow the course's log-spiral (θ − C·ln r, C = 2π/ln(9.6/2.8)) and swirl toward the drain; θ-periodic noise (no seam); drain glow; rim foam; channel opened where the 04 tube leaves |
| Drum A water | `drumWater.ts` | 72² grid (36² low) clipped to the drum cylinder; open conical shell for the 02 swirl | analytic wave normals, layered pink/cyan bands, white foam seams + crests, streaks, sparkles; swirl shell with 4 spiralling bands and ragged gaps |
| Final wave | `finalWave.ts` | Bézier curl profile swept along stage 09 on the LEFT, ≈9 u tall, 90×28 (50×16 low) | rolling lip + travelling bulge, bands flowing up the face, foam crest/foot, translucent; crest spray emitted from `index.ts` |
| Puddles | `puddles.ts` | 6 patches conforming to the chamber cylinder in front of the platform | wobbly outline, glimmer, foam rim; alpha = `controls.outro` |
| Foam banks | `foam.ts` | instanced icosphere puffs, 40-u chunks (LOD by focusS), whirlpool rim clusters rotating with the swirl | MeshStandard + env IBL, lavender rim tint |
| Bubbles | `bubbles.ts` | 44 instanced thin-film spheres (22 low) + 700 point-sprite bubbles (280 low), pooled around focusS or inside Drum A | rainbow Fresnel rim, window highlights, ring sprites |
| Spray | `spray.ts` | 600 pooled droplets (220 low), ballistic | soft glossy droplets |

All ShaderMaterials: `fog: true` + fog chunks, `<tonemapping_fragment>`, `<colorspace_fragment>`.
Palette base hues are scaled to ≤ ~0.75 linear (`glsl.ts`) because NeutralToneMapping desaturates
channels near 1.0 — that was the cause of the pastel look in the first lab rounds. Highlights/foam/
chevrons intentionally exceed 1.0 (bloom-friendly).

## Uniforms (main ones)

* ribbon: `uTime`, `uCyanDeep/uCyan/uCyanBright/uPink/uPinkLight/uFoam/uFoamLav/uHaze`, `uLightDir`,
  `uBenny (s, lateral, strength)`, `uChevron (start s, spacing, enabled)`, `uOutro (amount, s08)`,
  `uHide (s03, s04)`; attributes `aUV (u, s)`, `aHalfW`, `aSpeed`, `aAmp`, `aSkirt`.
* whirlpool: `uTime`, `uSpiralC`, `uRim`, `uDrain`, `uCut[8]`, `uCutR`, palette.
* drum: `uTime`, `uAgitation`, `uDrumC (x, y, R)`; swirl: `uSwirl`.
* final wave: `uTime`, `uSpeed`; puddles: `uAmount`.

## 05 river (`waterRibbon.ts` FRAG, `sw = 1 − aStyle.w` = 1 on 05 only)

The 05 current uses its own branch of the same ribbon shader (no extra pass, no extra draw):
* Channel: cyan core centred on `coreLateral(course, s)` (= `CORE_SWING · offset05 · right.x`, the coins'
  lateral; exported, unchanged). The two hot-pink bands swing a further `sbend = 1.05·sin(0.31 s − 0.834) +
  0.18·sin(0.62 s + 0.6)` u about the core (in phase with the course meander: ≈2 S-bends to the VP on the
  locked view). The band nearest a bank is clamped with a smooth minimum (`smin`) and thins to ≥0.6× instead
  of collapsing the core.
* Channel shape (wave 7): a stationary per-band offset `fL(s)` / `fR(s)` fitted to ref 05 (band centres
  back-projected through the locked camera): the river widens at s≈148–166 (right band along the right bank,
  left band bulging toward the core, then swinging out), right band ≈0.3 u closer to the core at s≈136–139;
  0 beyond s 180, so the 06 join is untouched.
* Approaching Benny (wave 7, `db = s − uBenny.x`): the bands are pushed OUT to the banks
  (`offL += 2.0·ss(7, 2.5, db)`, `offR += 1.6·ss(2.6, 0.4, db)`, before the bank clamp) and leave the frame at
  the image sides (ref: left at y≈930, right at y≈1090). Behind him two separate **wake sweeps** `pW` carry the
  pink: satin ribbons leaving his sides diagonally toward the bottom corners, centre ±(0.2 + 0.55·back) u from
  his track, half width (0.12 + 0.07·back)·ss(0.7, 1.4, back) u, frayed edges, deep-magenta rims and braided
  pink-white silk streaks (`stW`, `silk(relW…)`). Water right under and behind him stays cyan. (Wave 5's glide of
  the main bands to his track ±1.42 u drew two wide vertical pink sheets and is gone.) Band edges are combed into
  pink / cyan strands only where a strand is ≥ ≈10 px (`brush`), crisp per pixel: no violet pink-over-cyan blend.
* Surface: braided swell ridges + silk streak lines along the flow coordinate (mid/far) with 4-point flares
  (`flA`, `flD`) and small horizontal lens sparkles (`lensFlare`, `lzM`) on the core AND the pink ribbons
  (pink-white there). Near field (`near5`, fwidth(s) < 0.014), wave 7: NO cross-flow crest arcs (the wave-5
  "∩" swells and the Benny ripple rings / V lines read as pool ripples; rings and V-wake are ×(1 − sw)).
  Everything runs along the flow, which FANS OUT behind Benny (`kN = (lat − uBenny.y)/(1 + 0.7·back)`,
  domain-warped `kNw`): deep azure lanes, glossy cyan ridges burning to cyan-white, long thin speed streaks,
  big lens-shaped white flares (`lensFlare`, two sets, ≈60–90 px half length) and staggered small 4-point
  stars (`flC`, rows bent by a smooth warp so they never form a dot grid).
* `glsl.ts`: `flowGlint` core is now a ≈2 px hot point (the old soft core read as round snow dots);
  `lensFlare(g, density, Lpx, Tpx, time)` = lens-shaped screen-horizontal flare on a world-anchored advected
  cell grid, clamped inside its cell, derivatives before any early-out (Android-safe). Both are used only by
  the 05 branch. `LOW_Q` replaces the flowGlint/lens stars by two hashed sparkle grids.
* Numbers per capture: `qa/pilot05/wave5/water/NOTES.md`, `qa/pilot05/wave7/water/NOTES.md`.

## Measured budgets (water lab, headless Chromium + SwiftShader)

Water system only (no environment/characters), per frame, from `renderer.info`
(`docs/vfx/water_stats*.json`):

| Scene | high: draw calls / triangles / points | low: draw calls / triangles / points |
|---|---|---|
| 01 Drum A | 7 / 94.7k / 1300 | 7 / 24.6k / 500 |
| 03 Whirlpool | 12 / 211k / 1300 | 12 / 40.8k / 500 |
| 05 Current | 13 / 148k / 1300 | 13 / 31.1k / 500 |
| 09 Final wave | 11 / 102k / 1300 | 11 / 28.0k / 500 |

Instances: 2,532 foam puffs (high) / 1,219 (low), only chunks within [s−25, s+140] drawn.
Frame times were **not** meaningfully measured: SwiftShader is software rendering and no Android
device/emulator was available to this specialist. Most triangle cost is foam puffs (80-tri icospheres);
the low tier uses 20-tri puffs. Fragment cost is dominated by the ribbon (two advected fbm layers);
`LOW_Q` drops it to single-octave noise.

Suggested device tiers: `high` on recent Adreno/Mali (≥ 2021); `low` + half-res bloom otherwise.

## Lab

`tools/water-lab.html?preset=01..11|07mid` (or `?s=&back=&up=&ahead=&lookUp=&fov=`, `&q=low`,
`&hide=foam,whirlpool,bubbles`, `&benny=0`) and `node scripts/water-lab.mjs [presets] [--q=low]` →
`docs/vfx/water_*.png`. The lab has no tunnel/drum geometry (magenta backdrop) and a placeholder
pink/purple ball for Benny's scale and ride height only.

## Known differences vs references

* Drum A (01/02) swell reads glossy/satin with white seams; the reference has more chaotic foam
  splashes and a higher, more curled wave near the door.
* The 03 drain: the course spiral exits at r≈2.8 (just outside the 2.6 drain hole) and the 04 slide
  then runs up to ~5 u *below* the funnel surface, so the funnel is cut open along the slide
  (`uCut`) — a keyhole-shaped opening rather than the reference's round centred drain.
* Foam puffs are smooth spheres; the references' foam is finer, cloudier soap lather.
* Colours are tuned for NeutralToneMapping at exposure ≈1.0; changing tone mapping/exposure in the
  game will shift saturation.

## Screen 05 test W10 (`?water05=1`, wave 10, not the default)

One URL switch, read once at module load by `WATER05` in `src/vfx/waterRibbon.ts` (false in vite-node / without
`location`). Off, every program and attribute is the previous one (`#ifdef WATER05` / `+ 0`), so the default build
is pixel-identical. On, only Screen 05 changes (04 differs only inside the drum-exit opening where the 05 water is
visible; 06/07 identical):

* Ribbon 05 block (`FRAG`, `sw = 1`): colours sampled from the approved image and solved through exposure 0.86 →
  Neutral → sRGB → grade (`W5_*` consts). Electric cyan with R ≈ 0 and aqua (G ≈ B) highlights; each band is a
  hot-pink satin ribbon ramping to violet → periwinkle → blue into the core and to deep blue-violet toward the bank
  (`tb` = band coordinate, −1 bank edge … +1 core edge). `brush05()` = flow-aligned anisotropic value noise
  (3 octaves, 2 in LOW_Q, each faded before its cells drop under ≈4–8 px; finer octaves drift faster) giving
  brushed lanes, soft highlight lanes and crisp lens-shaped white-aqua / white-pink streak cores. Same-hue Fresnel
  only (a whitish Fresnel turned the river pastel). Near field: ∩-bowed travelling swells with aqua-white crest
  arcs and `bolt05()` jagged lightning flares placed on the crest rows (derivatives before any early-out).
* `coreShiftW10()` (CPU, `aCore` attribute and the far-block mirror): holds the visible core near the tunnel
  line across the 05 exit bend (s 171–189) so it no longer jogs ≈70 px right in 18 rows at the seam. Coins are not
  moved.
* Far block (`far05.ts` `designW10`, `materials.ts` `farRiverMaterial`): body over the whole floor chord, the two
  bands beside the winding core (`FAR05_CORE_W10`), same palette/ramp, purple-violet outer water, a narrow bubbly
  foam rim instead of the flat lavender sheet behind the seam.
* 05 splash (`riderSplash.ts` VERT5): thinner, slightly longer rope threads in a wider fan.
Cost: 05 still 86 draw calls / 567,415 tris (low 425,525); the old 5-octave streak field is skipped under the
switch. Evidence and numbers: `qa/pilot05/wave10/water/NOTES.md`.

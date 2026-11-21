# Screen 05 splat track: water flow + track cleanup (water-fx specialist, agentB)

All work is inside `agentB/`. Nothing in the repository, git or agentA was touched. No paid API or credits were used.

## Files
| file | what |
|---|---|
| `waterflow.js` | NEW. Spark 2.4 dyno **worldModifier** that makes the river's own splats flow (GPU, inside Spark's splat-generation pass) |
| `play3.html` | edited. Hooks are marked `// [waterflow]` (flow), `// [track]` (track cleanup, splat budget, end light), `// [end]` (ending transition), `// [qa]` (QA only). Original: `play3_orig.html` |
| `tools/build_track_w.py` | my copy of `tools/marble05/build_track.py`; every change is marked `[wfx]` |
| `tools/build_backing.py` | NEW. Builds the backing shells (`track_w/backing_*.json`) |
| `tools/split_near.py` | NEW (round 32b). Splits the start piece into `near_a.ply` (rear, 253k) + `near_b.ply` (front, 204k) + `near_a_hull.json` (Android splat budget, see 2d) |
| `tools/plyio.py`, `tools/spz.py` | PLY reader (new); copy of the SPZ reader / PLY writer |
| `track_w/` | rebuilt pieces (N = 14 copies): near (+ near_a / near_b), bay, bay_m, *_lo, *_lo2, far, track.json (+ ring centres XA / XB), backing_*.json |
| `shots_w.cjs` | stills: `STILLS='[s, [s, lane, rise], ...]'`, `TSEQ='[s, n, dt]'` (flow-only consecutive frames), visible-splat count; own server on 9400-9899, verified to serve agentB |
| `budget_w.cjs` | NEW. No-render sweep of the WHOLE level (696 frames at 30 fps, speed 1.4, lanes -0.22/0/+0.22, leaps +0.12): visible splats per section, near_a hiding, ending-transition k per frame |
| `tools/check_stills.sh` | runs the lead's `tools/marble05/viewer/visual_check.py` (read-only, version of 13:18 UTC) on stills (412x915 JPEG q92, f_*.jpg) |
| `tools/endlight.py` | position / size of the end light (brightest spot near a given point; approved = scaled to h 915, centre-cropped like the checker) |
| `tools/sheets.py` | APPROVED / BEFORE / AFTER side by side (each scaled to 960 high, own aspect, no stretching) |
| `out_water/` | `before/` (540x960, earlier session), `before412/`, `after412/` (flow v1), `after_final/` (flow v2), `full/` (whole level + ending), `final_end/` (final end light), `sheets/`, `diag/` (green gap renders, `noflow412/`, `split_proof/`, `v2_bullseye_disc/` = rejected variant), `budget_*.json` |

Rebuild: `python3 -I tools/build_track_w.py <full_500k.spz> <full_100k.spz> scene05.json tile_frame.json rings.json track_w 14`,
then `python3 -I tools/build_backing.py track_w scene05.json tile_frame.json rings.json`, then `python3 -I tools/split_near.py track_w 1.25`.

## 1. Water flow (`waterflow.js`)
Why a splat modifier and not overlay layers: in Spark 2.4 every SplatMesh can take a `worldModifier` (a dyno GLSL block run
per splat in the generation pass). Spark already regenerates all splats whenever the camera moves, so during gameplay
the flow costs only a few extra ALU operations per splat, adds no geometry, no textures and no transparency layers that
could blur the painting. Overlay layers were not needed.

Per splat, in world coordinates (so the pattern runs straight across the copied sections, no seam at the rings):
* **water mask**: height above that section's water surface `h = P.n - d - DH * clamp((u - UA)/LT, 0, kmax)` (the same
  plane and per-section drop the builder uses), `1 - smoothstep(0.05, 0.15, h)`, and inside the tunnel floor
  (`|lat| < ~1.0`). Walls, rings, paddles and the tops of the foam banks are untouched.
* **flow**: three travelling wave trains with phase `(u + 0.9 t)`, i.e. crests move toward the camera along the tunnel
  axis (the river's direction), with a sideways wobble so they are not straight bars. They **multiply** the colour by
  1 +/- 8 % (brightness only: hue and saturation of the painted cyan/pink streaks stay the painting's).
  Round 32b: splats that are already bright (max channel > 0.55 -> 0.85) are only DARKENED in the troughs, never brightened:
  brightening pushes them into the Neutral tone-mapping shoulder, which bleaches the saturated cyan / pink (measured with the lead's
  colour-look score at s = 0: flow v1 cost -0.015, v2 -0.010). No channel ever passes 1.0.
* **varied reflections**: each splat gets a ripple normal from the analytic slope of the same waves; the view ray is
  reflected and compared with the light from the golden tunnel end -> sparse glints that move with the waves and change as
  the camera moves (+0.13 max incl. twinkle); since round 32b half white-cyan, half the water's own hue (pure white bleached it).
* **sideways shimmer**: water splats sway up to 3.5 mm sideways with the flow phase.
* everything fades out between 5 and 9 units from the camera.
URL switches: `?noflow=1` off, `?flowamp=0.5`, `?flowspeed=1.2`. The per-splat random phase uses the splat index inside its piece.

Hook lines in `play3.html`:
```
import { createWaterFlow } from './waterflow.js'; // [waterflow]
const WF = q.get('noflow') ? null : createWaterFlow({ TR, SC, meshes: [near, far, ...tiles.flatMap((t) => [t.hi, t.lo, t.lo2].filter(Boolean))], far, amp: +(q.get('flowamp') ?? 1), speed: +(q.get('flowspeed') ?? 0.9) }); // [waterflow]
  WF?.update(dt, camera); // [waterflow]            (end of window.step, after the camera is placed)
window.qaFlow = (dt) => WF?.update(dt, camera); // [waterflow] QA only
```

## 2. Track cleanup
### (a) black patches = real holes (proved with a green test background, `?bg=%2300ff00`, `out_water/diag/green*/`)
Causes found:
1. The builder mirrored EVERYTHING below 0.32 above the water (water, foam AND the lower walls) about the river line,
   which is 8 cm off the tunnel centre, so in every mirrored copy the lower walls moved sideways -> wedge holes at the wall bases.
   Fix `[wfx]`: only the water channel is mirrored (`h < 0.10` and within 0.95 of the river line); walls stay.
2. The cross-fade at each ring used two 50 % layers (coverage drops to ~75 % at the joint). Fix: the incoming copy is
   fully opaque at the ring, the outgoing one fades after it (coverage never below one full layer).
3. Walls were cut exactly at the ring; now they overlap 3 cm.
4. The reconstruction's cross-section at ring B is not the same as at ring A (at ring B the left wall dips 0.35 under
   the water, at ring A it does not), so a hole remains where two sections meet whatever the cut. Fix: **backing
   shells** (`tools/build_backing.py`): per piece a 64-segment tube 4 cm BEHIND the piece's own splat surface (97th
   percentile radius per cell + 4 cm, below the water on the floor), coloured with the piece's own local surface colour
   (opacity-weighted, saturation restored x1.35 because averaging greys it), with 1.2-unit outward flanges at both ends
   so no view ray can slip between two neighbouring shells. Drawn opaque before the splats, so it is hidden wherever the
   splats cover and only fills the holes. ~10k vertices for near, 3k per copy. `?noback=1` = off.
The clear colour stays black (no purple backdrop): the holes are closed by geometry, not hidden by a background colour.

### (b) far end ("tube inside the tube")
The far piece is the reconstruction beyond ring B: its radius shrinks from 1.03 to 0.41 within 6 units (the painting's
perspective baked into the geometry) and it is very sparse (a few hundred big splats) - that is the narrow inner tube.
Fix: the far piece is no longer drawn (`?far=1` shows it); instead the copies run on 9 sections ahead (sections 2-3
ahead use `*_lo`, 4-9 ahead use the new `*_lo2` = 35 % of `*_lo`, ~18.7k splats, splats enlarged so coverage stays)
and the last ring opens into an opaque end-light sprite behind the splats (the last shell's end flange hides its corners).
Round 32b (lead: "at frame 0 a LARGE orange-pink disc ~3-4 rings away"): the sprite is now 3.6 units (2.6 left a thin black
slit at the left wall at s = 29, 787 px) and shows the far tunnel's own mauve-pink at its edge (sampled from frame 0, so no
disc edge shows), soft gold rings closer and closer inward, a gold halo and a SMALL white-gold core. A second sprite (the
"light opening", white -> gold -> warm pink) is faded in with the camera's distance to the end (0 beyond 12 units, 1 at 4):
far away the end stays a small core, from s ~ 25 on it opens up into bright golden light. `?endglow=0` = the previous disc.
A bolder bullseye variant (strong rings) was rendered and REJECTED: it reads as a flat target (`out_water/diag/v2_bullseye_disc/`).

### (d) Android splat budget (round 32b)
At section 1 (s 2.47 -> 4.5) the start piece (456k splats) was still drawn although the camera had passed most of it:
1.08 M visible (BEFORE: 1.06 M). `tools/split_near.py` splits it at u = 1.25 into near_b (front, 204k) and near_a (rear, 253k,
from far behind the start camera up to u = 1.25; every splat in exactly one piece, unchanged). Each frame the page hides near_a
only when ALL of it is behind the camera: max over the 164 convex-hull vertices of (p - cam) . viewDir < -0.378 (= 3 sigma of
its largest splat near the cut + 2 cm). ?nosplit=1 = one piece.

### (e) Ending transition (round 32b, `// [end]` in play3.html)
`S_LAST` = trail s nearest to the last ring (TR.XB + TR.offsets[N-1]) = 32.16. Over s in [S_LAST-1.25, S_LAST-0.15] the strength
k = smoothstep eases 0 -> 1: both end sprites grow (x1.8 at k = 1) and a full-screen warm white-gold bloom (DOM layer between the
canvas and the HUD, radial gradient centred on the projected end light, radii and outer alpha growing with k, opacity min(1, 1.25k))
fills the screen; at k = 1 the screen is entirely warm light (hand-over to Screen 06). `window.endK()` -> k, `window.S_LAST`.

### (c) floaters / smears
Checked: the only splats floating inside the tunnel's free space are the painted paddle at upper left (legit) and
splats behind the camera in the near piece. No filter applied. NOT fixed: the stretched / smeared water directly in
front of the camera when a copied section is close (that is the reconstruction's own mid-distance resolution seen up
close; it needs better source splats, not a filter).

## 3. Results (round 32b, 2026-11-21 ~13:40 UTC)
All checker numbers: the lead's `tools/marble05/viewer/visual_check.py` (version of 13:18: approved scaled to height 915 and
centre-cropped), stills at 412x915 native (portrait like the acceptance run) unless marked 540. BEFORE = `play3.html?trk=track/&noflow=1`
(the original pieces and visibility logic, no flow = what `play3_orig.html` shows). Software rendering (SwiftShader), still frames
reached by stepping the game (`window.step`), Benny's lane / a leap's camera rise set with `window.qaPose` (QA only).

### Dark patches (rule: connected near-black >= 150 px below the HUD; target 0 in every frame)
| still (s; lane, rise) | nearest join(s) in view | BEFORE patches / largest px | AFTER patches / largest px |
|---|---|---|---|
| 0 (approved camera) | 2.56 (+ all up to 9 sections) | 3 / 1488 (540: 2 / 2037) | **0 / 0** |
| 0.7 | 2.56 | (540: 4 / 1674) | **0 / 17** |
| 1.4 | 2.56 | (540: 4 / 2451) | **0 / 0** |
| 2.3 | 2.56, 4.72 | (540: 3 / 566) | **0 / 0** |
| 4.4 | 4.72 | 3 / 1345 (540: 4 / 1514) | **0 / 0** |
| 6.4 | 6.82 | (540: 3 / 608) | **0 / 0** |
| 8.5; -0.22 | 8.96 | - | **0 / 0** |
| 10.4; +0.22, +0.12 | 11.08 | 3 / 706 | **0 / 4** |
| 12.2 | 13.22, 15.32 | - (not rendered) | **0 / 0** |
| 16.4; -0.22 | 17.46, 19.58 | - | **0 / 0** |
| 20.6 | 21.72, 23.82 | - | **0 / 0** (final end light; also 0 / 0 with the intermediate one) |
| 24.8; +0.22, +0.12 | 25.98, 28.08 | - | **0 / 48** |
| 29.0 | 30.22, end 32.16 | - | 1 / 787 with the 2.6 sprite (slit at the left wall) -> **0 / 0** with the final 3.6 sprite |
| 31.0 (k 0.02) | end | - | **0 / 0** |
| 31.3 (k 0.29) | end | - | **0 / 0** (final), 0 / 0 (intermediate) |
| 31.6 (k 0.68) | end | - | **0 / 0** |
| 32.05 (k 1) | end | - | **0 / 0** |
Joins 15.32, 19.58, 23.82 and 28.08 were seen 3-4 units ahead, not right in front of Benny; the lead's full 690-frame run covers them up close.
Stills 12.2, 16.4, 24.8, 31.0, 31.6 and 32.05 were rendered with the intermediate end sprite (2.6 units, strong rings); only the
end sprite changed after that (s 0, 20.6, 29.0, 31.3 re-rendered with the final code).

### Colour look vs approved (hue/saturation overlap, higher = closer) - did NOT improve
| still | BEFORE | AFTER (final) | AFTER flow v1 |
|---|---|---|---|
| 0 | 0.672 | 0.642 | 0.637 |
| 4.4 | 0.654 | 0.625 * | 0.619 |
| 10.4; +0.22, +0.12 | 0.641 | 0.623 * | 0.619 |
\* rendered with flow v2 but the previous end disc; s 0 with the previous disc was 0.644 (final 0.642), so the end light changes it by ~0.002.
Further AFTER: 0.7 0.619, 1.4 0.604, 2.3 0.654, 6.4 0.634, 8.5 0.611, 12.2 0.596, 16.4 0.586, 20.6 0.587, 24.8 0.582, 29.0 0.488
(the bright end light fills the view), 31.0 0.446, then the bloom (0.25 -> 0.004; the acceptance test does not score look for k > 0.05).
Attribution at s = 0 (region swaps, earlier squeezed reference): the water flow costs ~0.010 (v1: 0.015) - any moving pattern moves
colour edges against the static approved frame; the rest (~0.02) is the far end: BEFORE showed the old narrow far piece whose
magenta concentric rings resemble the painting's ring rhythm, AFTER shows the continuing golden ribbed copies + the end light.
`?noflow=1` gives 0.648 at s = 0 (vs 0.642), `?far=1` brings the old far piece back.

### End light at frame 0 vs approved (412x915, `tools/endlight.py`)
| | position | white core (luma >= 235) | warm light (luma >= 190) |
|---|---|---|---|
| approved | (248, 287) | 12 px across | 40 px across |
| previous orange disc | (191, 231) | 7 px | 27 px, inside an ~80 px orange-pink disc |
| final | (191, 231) | 8 px | 26 px, inside a mauve-pink opening with soft rings (no orange disc) |
NOT fixed: the position. The end is where the copied sections lead: each copy is offset by TR.D (0.30 left, 0.16 up per section),
so after 8 sections the tunnel end sits ~57 px left and ~56 px higher than the painting's vanishing point. Moving it means changing
the track layout (path-camera / track owner), not the light.

### Visible splats (Android budget ~1 M) - whole level, `budget_w.cjs`, 696 frames, lanes + leaps
* BEFORE: max **1,061,727** (section 1). AFTER: max **866,071** (section 0, s 0.33). Per section AFTER: -1: 655,734 · 0: 866,071 ·
  1: 823,650 · 2-5: 830,237 · 6: 811,652 · 7: 792,775 · 8: 774,190 · 9: 755,313 · 10: 736,728 · 11: 717,851 · 12: 674,431 · 13: 631,011 ·
  14: 420,674 (the far copies run out, the count only falls). near_a hidden from s = 2.19, never visible in section >= 1.
* Split proof (`out_water/diag/split_proof/`, s 0 / 0.7 / 1.4 / 2.3 split vs `?nosplit=1`, same step sequence): walls and ceiling
  (rows 150-300) identical to the pixel (mean diff 0.000); differences only on the water = the flow's per-splat random phase
  (it uses the splat index inside its piece, which the split renumbers), mean 1.3-3.0 levels.

### Flicker of the water flow
Three consecutive frames 1/30 s apart at s = 4.4, camera still, only the flow advancing: mean change 0.875 and 0.899 levels (of 255),
0.30 % of pixels change by > 10 levels, mean brightness drift -0.045 per frame (no pulsing); the lead's "pop" of the middle frame =
**0.58** levels (spike limit >= 4). Flow v1: 1.07 / 1.09, pop 0.675.

### Ending transition (whole-level sweep)
Frames 663 (s 30.94) -> 686: 23 frames from k = 0.002 to 1 (0.77 s), largest step 0.064 per frame, k = 1 from s = 32.01 on.
No dark frame in the transition stills (k 0.02 / 0.29 / 0.68 / 1: 0 patches). At k = 1 the frame is uniform warm cream-gold
(look / sharpness are meaningless there, as agreed).

### Sheets
`out_water/sheets/sheet_s*.jpg` = APPROVED | BEFORE | AFTER (s 0, 0.7, 1.4, 2.3, 4.4, 6.4, 10.4; for 0.7 / 1.4 / 2.3 / 6.4 the BEFORE is
the 540x960 capture, wider view), `sheet_s29_end_approach.jpg` (intermediate vs final end light), `full_level_and_ending.jpg`
(s 12.2 -> 32.05, AFTER only: the old track is 23.6 long and has no ending).

### Open issues (honest)
* Colour-look score is 0.02-0.03 LOWER than BEFORE (far end + moving water), although the black patches are gone.
* The end light is in the right style now but ~80 px away from the painting's vanishing point (track layout, see above).
* At mid distance (s ~ 15-22) the end still reads a little like a flat pink disc with rings; fading the "light opening" in earlier
  (e.g. 17 -> 5 units instead of 12 -> 4) would soften it - not rendered (still budget used up).
* Smeared / stretched water right in front of the camera when a copied section is close (reconstruction resolution), unchanged;
  it shows as a lilac smear in the lower part of the frame at some positions (s 1.4, 4.4, 29).
* Stills: 14 new ones for round 32b as allowed; earlier part of this session used ~20 (several diagnostic), over the first limit of 12.

## Pitfall found (affects every specialist's captures)
`play_shots2.cjs` and my first `shots_w.cjs` start `python3 -m http.server` on a random port in a range the other
specialist's scripts also use; if the port is taken, the browser silently loads THE OTHER FOLDER's page. One of my
AFTER runs did exactly that (different coins, old far tunnel, no QA hooks) and was thrown away. `shots_w.cjs` now binds
127.0.0.1 on 9400-9899 and fetches a marker from its own file before rendering.

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
and the last ring opens into an opaque golden light disc (canvas radial gradient white -> gold -> orange -> magenta,
2.6 units, behind the splats; the last shell's end flange hides its square corners).

### (c) floaters / smears
Checked: the only splats floating inside the tunnel's free space are the painted paddle at upper left (legit) and
splats behind the camera in the near piece. No filter applied. NOT fixed: the stretched / smeared water directly in
front of the camera when a copied section is close (that is the reconstruction's own mid-distance resolution seen up
close; it needs better source splats, not a filter).

## 3. Results
RESULTS_PLACEHOLDER

## Pitfall found (affects every specialist's captures)
`play_shots2.cjs` and my first `shots_w.cjs` start `python3 -m http.server` on a random port in a range the other
specialist's scripts also use; if the port is taken, the browser silently loads THE OTHER FOLDER's page. One of my
AFTER runs did exactly that (different coins, old far tunnel, no QA hooks) and was thrown away. `shots_w.cjs` now binds
127.0.0.1 on 9400-9899 and fetches a marker from its own file before rendering.

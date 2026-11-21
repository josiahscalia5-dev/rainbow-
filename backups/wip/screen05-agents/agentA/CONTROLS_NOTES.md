# Screen 05 swipe controls: `controls.js` + hook lines in `play3.html`

## What changed
* **New ES module `controls.js`** (`installControls(ctx)`): input, lanes, leap, dive, body animation, pom-pom inertia,
  extra coins, 3D coin pick-up, leap/dive splashes + droplets + bubbles, underwater tint while diving, camera offsets,
  `window.state()`, `window.input`, optional real-time loop (`?live=1`).
* **`play3.html`**: 12 hook lines, every one ends with `// [controls]`. The untouched original is `play3.orig.html`
  (`diff play3.orig.html play3.html` shows only these lines). `?controls=0` turns the module off and runs the old
  code path (old analog `steer`, old coin rule).

### Exact hook lines (in `play3.html`)
```js
import { installControls } from './controls.js'; // [controls]
const CT = q.get('controls') === '0' ? null : installControls({ THREE, canvas: renderer.domElement, camera, q, at, frameAt, coins, scene, U, bmat, benny, splash, splashTex, bubTex, coinTex: ctex, coinD: SC.coin_d, bennyFullH: 0.99 * KH, pxW, coinEl, getS: () => st.s, getCoins: () => coinCount, render: () => renderer.render(scene, camera) }); // [controls]
// inside window.step(t, dt, steer, speed):
if (CT) st.lat = CT.update(t, dt).lat; else { /* old analog steer, unchanged */ } // [controls]
st.lean += ((-(CT ? 0 : steer) * 0.22 - turn * 2.2) - st.lean) * Math.min(1, dt * 5); // [controls]  (river-bend lean kept)
benny.position.copy(tmp).addScaledVector(F.n, Math.sin(t * Math.PI * 1.6) * 0.006 + (CT ? CT.c.h : 0)); // [controls]
if (CT) CT.orient(benny.quaternion); // [controls]
if (CT) CT.anim(st.lean); // [controls]          (after play3's own uniform line, which it overrides)
if (CT) CT.water(F, speed, dt); // [controls]    (after play3's own splash lines)
if (CT) st.camLat = CT.c.camLat; else st.camLat += (st.lat * 0.5 - st.camLat) * Math.min(1, dt * 4); // [controls]
camera.position.copy(relPos).applyMatrix4(Mc).add(at(st.s, tmp)).addScaledVector(Fc.r, st.camLat).addScaledVector(Fc.n, CT ? CT.c.camH : 0); // [controls]
if (c.got < 0 && (CT ? CT.hits(c) : st.s >= c.s && Math.abs(st.lat - c.lat) < 0.14)) { ...unchanged... } // [controls]
return { s, lat, coins, tile, ...(CT ? CT.state() : {}) }; // [controls]
```

## Behaviour
| Input | Effect |
|---|---|
| swipe left / right (touch, ≥ 30 px, dominant axis, fires as soon as the threshold is crossed; read on the WINDOW so no overlay can swallow it, except gestures that start on a button / link / input / `[data-noswipe]`), ← → / A D, mouse or pen drag | one lane left / right (lanes −0.22 / 0 / +0.22 world units). Critically damped spring, ω = 16 → 95 % in ~0.28 s, no overshoot. Swiping toward the edge from an outer lane = no move, only a small pom-pom wobble. |
| swipe up, ↑ / W | leap: ballistic arc, peak 0.6 × his full height (0.28 u), 0.62 s; splash + 12 droplets on take-off, splash + 14 droplets on landing; arms tuck at the top (uSwim × 0.3); nose up while rising, nose down while falling (pitch follows vertical speed, spring-smoothed); waist splash fades while he is out of the water. |
| swipe down, ↓ / S | dive: smooth sink (0.24 s; was 0.2 s, lengthened 2026-11-21 so every height step stays < 0.06 u per 1/30 s frame) to 80 % of his height under the surface (−0.27 u), hold 0.38 s, resurface (0.26 s) with a splash; bubbles rise around him while under; cyan underwater tint on the submerged part of his body (uniform `uDive`, 0 at rest, so the approved look is unchanged). |
| `window.input.swipe('left'|'right'|'up'|'down')` | test injection (the test does NOT use it; it uses real touch events). |

* Forward movement stays continuous (`speed` from `window.step`). One move at a time: a lane change blocks the next
  move for 0.16 s, a leap / dive for its duration; at most ONE swipe is queued (the latest wins) and starts as soon as
  the current move ends. Lane changes during a leap/dive are queued.
* `steer` of `window.step(t, dt, steer, speed)` is ignored while the controls are on (lanes own the lateral position);
  `?controls=0` gives the old analog steering (e.g. for `track_clip.cjs` clips with the old sine steering).
* Natural swim: paddling shader kept; the shader clock `uT` is a swim clock that runs up to 1.9× faster during a lane
  change (+35 % while diving); body roll ±0.045 rad with each stroke; bank into the move (0.2 rad per u/s of lateral
  speed, max 0.3, easing out as the spring settles); body yaw toward the move (0.12 rad per u/s, max 0.2);
  pom-pom = damped spring (ω 9, ζ 0.32) driven by his lateral acceleration (lags, swings, settles) plus vertical
  acceleration / pitch for the front-back swing; the river-bend lean of play3 is kept.
* Coins: the 40 water coins on the centre line stay. Added: 3 air arcs over the centre lane (s = 3.1, 6.7, 10.3,
  3 coins each, 0.47–0.53 u above the water: out of reach without a leap; his head top is at 0.36) and 4 side-lane rows
  (3 coins each: left s 1.6–2.2, right 4.4–5.0, left 8.0–8.6, right 11.6–12.2). Pick-up = 3D distance < 0.13 from his
  body segment (water point + n·[0.06, 0.30] + his current height), so lane and height matter; +10 each, the existing pop
  animation, plus a scale pulse of the HUD counter.
* Camera: lateral offset = 50 % of his lane offset through a critically damped spring (ω 6), clamped to ±0.12 u (never
  toward the walls); vertical offset = 35 % of a leap (8 % of a dive) through a spring (ω 7.5), clamped to
  [−0.03, +0.12]. Frame 0: every offset is exactly 0, so the start camera is still exactly the approved picture's camera.
* `window.state()` → `{ s, lane, lat, height, coins, move, queued, lean, pitch, yaw, pom, camLat, camH, swim, got:{water,lane,air}, lastPick, swipes }`.
* `?live=1` (optional, `&speed=1.4`): requestAnimationFrame loop for playing on a phone / desktop. Tests do not use it. Game time = sum of the
  clamped dt (≤ 0.05 s per frame), so a slow frame slows the game instead of skipping a move.
* Move timers (lane busy, leap, dive, queue) run on the module's OWN clock = Σ dt of `window.step`, not on its `t` argument (fixed
  2026-11-21: in `?live=1` t was wall time while dt was clamped, so on a slow frame a whole leap could finish between two frames).
* `window.camInfo()` (only if the page has none) → `{ pos, dir, fov, camLat, camH, toBenny, aboveWater }` for the lead's
  `final_acceptance.cjs`, which logs it every frame (`camera` was added to the `installControls` context for this).

## Tuning constants (`TUNING` in controls.js; any can be overridden by URL `?c_NAME=value`, e.g. `?c_LANE=0.2`)
LANE 0.22 · LAT_MAX 0.26 · LANE_OMEGA 16 · LANE_BUSY 0.16 s · LEAN_K 0.2 · LEAN_MAX 0.3 · YAW_K 0.12 · ROLL_STROKE 0.045 ·
PADDLE_BOOST 0.9 · LEAP_T 0.62 s · LEAP_FRAC 0.6 · DIVE_DOWN/HOLD/UP 0.24/0.38/0.26 s · DIVE_FRAC 0.8 · PITCH_K 0.13 ·
PITCH_MAX 0.28 · CAM_LAT_K 0.5 · CAM_LAT_MAX 0.12 · CAM_LAT_OMEGA 6 · CAM_H_K 0.35 · CAM_H_DIVE_K 0.08 · CAM_H_OMEGA 7.5 ·
CAM_H_MIN/MAX −0.03/0.12 · SWIPE_PX 30 · COIN_R 0.13 · BODY_LO/HI 0.06/0.30.

## Test server: `serve.cjs`
Every test of mine serves this folder with `python3 -m http.server` on a random port in **9000–9399** (8900–8989 is the lead's
acceptance range) and, before the browser loads anything, proves the port serves THIS folder: it writes a fresh random token
file here, fetches it back over HTTP and checks `export function installControls` in `controls.js`; a busy or foreign port is
rejected and another one tried. Used by `swipe_test.cjs`, `acceptance_logic.cjs`, `live_key_check.cjs`.

## Test: `swipe_test.cjs`
`NODE_PATH=$(npm root -g) node swipe_test.cjs [--nostills] [--compare0]` — Playwright Chromium + SwiftShader (same args
as track_clip.cjs), Pixel-7-like context 412×915, dpr 1, isMobile, hasTouch, Android UA; opens `play3.html?w=412&h=915`;
drives REAL finger swipes with CDP `Input.dispatchTouchEvent` (touchStart → 6 touchMove → touchEnd over ~120 ms) on the
canvas: left, left, right, up, right, down, left, up (timed like a player: side rows, air arcs); steps the game
deterministically at 30 fps (speed 1.4) between swipes; logs `state()` before/after each swipe and a per-swipe window
summary; renders 6 stills to `out_controls/`; writes `swipe_log.json` (+ every step row and the input log).
`--compare0` also renders frame 0 with `?controls=0` (`out_controls/a_start_frame0_controls_off.png`).
`--stills=a_start_frame0,e_dive` renders only those stills; `--log=file.json` changes the log name. Frame-0 identity:
`python3 -I compare0.py .` → `compare0.json` (controls on vs `?controls=0`).

## Test: `acceptance_logic.cjs` (logic-only replica of the lead's `final_acceptance.cjs`)
`NODE_PATH=$(npm root -g) node acceptance_logic.cjs` → `acceptance_logic.json` (~40 s). Same device, 7.6 s at 30 fps, speed 1.4,
the same 10-swipe plan with the SAME CDP touch events (touchStart + 4 touchMoves 30 ms apart + touchEnd, 140 px at x 206,
y 640.5), the same per-frame read (`step()` merged with `state()`, `camInfo()`) and the lead's checks verbatim, but no
`renderNow` / screenshots. Adds: which element receives a touch at the swipe point, a read-only `state()` right after each swipe
(lane / move / queued), each swipe's response vs the intended one, smoothness second differences and camera numbers.

## Verification results
(see below — filled in from the actual run)

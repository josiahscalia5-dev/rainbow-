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
const CT = q.get('controls') === '0' ? null : installControls({ THREE, canvas: renderer.domElement, q, at, frameAt, coins, scene, U, bmat, benny, splash, splashTex, bubTex, coinTex: ctex, coinD: SC.coin_d, bennyFullH: 0.99 * KH, pxW, coinEl, getS: () => st.s, getCoins: () => coinCount, render: () => renderer.render(scene, camera) }); // [controls]
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
| swipe left / right (touch, ≥ 30 px, dominant axis), ← → / A D, mouse or pen drag | one lane left / right (lanes −0.22 / 0 / +0.22 world units). Critically damped spring, ω = 16 → 95 % in ~0.28 s, no overshoot. Swiping toward the edge from an outer lane = no move, only a small pom-pom wobble. |
| swipe up, ↑ / W | leap: ballistic arc, peak 0.6 × his full height (0.28 u), 0.62 s; splash + 12 droplets on take-off, splash + 14 droplets on landing; arms tuck at the top (uSwim × 0.3); nose up while rising, nose down while falling (pitch follows vertical speed, spring-smoothed); waist splash fades while he is out of the water. |
| swipe down, ↓ / S | dive: smooth sink (0.2 s) to 80 % of his height under the surface (−0.27 u), hold 0.42 s, resurface (0.26 s) with a splash; bubbles rise around him while under; cyan underwater tint on the submerged part of his body (uniform `uDive`, 0 at rest, so the approved look is unchanged). |
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
* `?live=1` (optional, `&speed=1.4`): requestAnimationFrame loop for playing on a phone / desktop. Tests do not use it.

## Tuning constants (`TUNING` in controls.js; any can be overridden by URL `?c_NAME=value`, e.g. `?c_LANE=0.2`)
LANE 0.22 · LAT_MAX 0.26 · LANE_OMEGA 16 · LANE_BUSY 0.16 s · LEAN_K 0.2 · LEAN_MAX 0.3 · YAW_K 0.12 · ROLL_STROKE 0.045 ·
PADDLE_BOOST 0.9 · LEAP_T 0.62 s · LEAP_FRAC 0.6 · DIVE_DOWN/HOLD/UP 0.2/0.42/0.26 s · DIVE_FRAC 0.8 · PITCH_K 0.13 ·
PITCH_MAX 0.28 · CAM_LAT_K 0.5 · CAM_LAT_MAX 0.12 · CAM_LAT_OMEGA 6 · CAM_H_K 0.35 · CAM_H_DIVE_K 0.08 · CAM_H_OMEGA 7.5 ·
CAM_H_MIN/MAX −0.03/0.12 · SWIPE_PX 30 · COIN_R 0.13 · BODY_LO/HI 0.06/0.30.

## Test: `swipe_test.cjs`
`NODE_PATH=$(npm root -g) node swipe_test.cjs [--nostills] [--compare0]` — Playwright Chromium + SwiftShader (same args
as track_clip.cjs), Pixel-7-like context 412×915, dpr 1, isMobile, hasTouch, Android UA; opens `play3.html?w=412&h=915`;
drives REAL finger swipes with CDP `Input.dispatchTouchEvent` (touchStart → 6 touchMove → touchEnd over ~120 ms) on the
canvas: left, left, right, up, right, down, left, up (timed like a player: side rows, air arcs); steps the game
deterministically at 30 fps (speed 1.4) between swipes; logs `state()` before/after each swipe and a per-swipe window
summary; renders 6 stills to `out_controls/`; writes `swipe_log.json` (+ every step row and the input log).
`--compare0` also renders frame 0 with `?controls=0` (`out_controls/a_start_frame0_controls_off.png`).

## Verification results (final run 2026-11-21 ~12:40 UTC, final code)
* `swipe_test.cjs`: **16/16 checks true** (`swipe_log.json` → `checks`). All 8 swipes arrived as real `touch` events
  (CDP touch → DOM touchstart/move/end on the canvas; `window.input.swipe` not used). Per swipe (lane / lat at the next swipe):
  left → −1 / −0.218 · left → −1 / −0.220 (edge clamp) · right → 0 / −0.025 (0.23 s later) · up → leap peak 0.2794 ·
  right → 1 / 0.213 · down → dive bottom −0.2704 · left → 0 / 0.003 · up → leap peak 0.2794.
  Coins 1,420 → 1,620 (8 water, 6 side-lane, 6 air); HUD text equals the counter. Max |lat| 0.22, max |camLat| 0.1095
  (clamp 0.12), camH −0.020…+0.073; max per-step 2nd difference camLat 0.0013 / camH 0.0019 (no jerks). No page errors.
* **Frame 0 = old code path, pixel for pixel**: `compare0.py` → `compare0.json`: 100.0 % identical, max diff 0, comparing
  `out_controls/a_start_frame0.png` (controls on) with `a_start_frame0_controls_off.png` (`?controls=0`).
* Stills (412×915, SwiftShader, ~25–40 s each): `out_controls/a_start_frame0.png`, `b_mid_lane_change_left.png`
  (banked into the move), `c_leap_top.png` (whole body out of the water, collected air coins popping above him, HUD 1,500),
  `d_after_air_coin.png` (descending, HUD 1,510), `e_dive.png` (only the pom-pom above the water, bubbles, right lane),
  `f_resurface_splash.png`. Earlier runs kept for reference in `out_controls/_noviewport_run/` (the viewport bug, below) and
  `out_controls/_run2_before_coin_scale_fade/`.
* `live_key_check.cjs` (`live_key_check.json`): `?live=1` RAF loop runs (s 0 → 0.35) and ArrowLeft changed lane to −1 with
  bank/yaw. The follow-up KeyW leap check timed out (300 s) under SwiftShader (each live frame takes many seconds); the leap
  itself uses the same `request()` path verified by the touch test, but the live-mode leap is NOT confirmed.

## Fixes found by the test
* `play3.html` had no `<meta name="viewport">`: on a phone (isMobile) the 412×915 canvas was drawn shrunk into the top-left
  corner of a 980-px layout. Added a viewport meta (marked `<!-- [controls] -->`).
* Missed coins (other lane / under a leap) used to slide huge past the camera; they now shrink + sink away behind him.
  The added lane/air coins grow in during the first 0.4 s of travel so frame 0 stays exactly the approved picture
  (scale, not opacity: the coin material has alphaTest 0.35).

## Honest issues / not done
* The underwater tint (`uDive`) is effectively invisible: the water splats already hide everything below the surface,
  so in a dive only the pom-pom shows. Harmless (0 at rest).
* Coin sprites show square cyan/blue halos around the gold coin (pre-existing `05_coin.png` + alphaTest; visible in frame 0 too).
* Lane changes during a leap/dive are queued, not air-strafed (per "one move at a time").
* `steer` in `window.step` is ignored while controls are on; `track_clip.cjs` clips need `?controls=0` for the old sine steering.
* No motion clip rendered (software rendering too slow); smoothness is shown numerically, not by video.
* Water coins under a dive are still collected (the pick-up segment reaches 0.03 above the water); diving does not dodge.

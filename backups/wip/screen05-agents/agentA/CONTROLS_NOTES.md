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

## Verification results (2026-11-21, actual runs in this folder, after every change listed above)
All numbers from the JSON files named; SwiftShader, Chromium headless, Pixel-7-like 412×915 portrait, real CDP touch events.

### 1. `acceptance_logic.json` — the lead's `final_acceptance.cjs` plan, logic only (load 42.9 s, run 45 s)
* API present: `step`, `state`, `renderNow`, `camInfo` = functions; `input` = object. Element under the swipe point
  (206, 640.5) = `CANVAS` (the HUD is `pointer-events:none`; the listeners are on the window anyway).
* The lead's checks, verbatim: 228 frames / 7.6 s, **0 errors**; forward step 0.046–0.047 u per frame, **0 freezes**;
  lateral **max |Δlat| 0.0414 per frame** (limit 0.06), **0 teleports**, **lanes seen 0, −1, +1**; vertical max step
  **0.0569 per frame**, **height +0.2794 (leap peak) … −0.2704 (dive bottom)**; **coins 1,420 → 1,590** (HUD "1,590" =
  counter); 10 swipes sent, all 10 logged as `touch`.
* Each swipe (input clock = the last stepped frame, i.e. handled before the next `step`, no race):

| t (s) | swipe | intended | state right after the swipe | result |
|---|---|---|---|---|
| 0.9 | left | lane −1 | lane −1, move `lane` | lane 0 → −1 from 0.9 s; +40 coins in its window (left row + water) |
| 1.6 | left | already at the left edge | lane −1, no move | stays −1 (pom-pom wobble only) |
| 2.3 | right | lane 0 | lane 0, move `lane` | −1 → 0 from 2.3 s; +30 |
| 2.9 | up | leap | move `leap` | peak +0.2794, lands, +20 (water coins after landing) |
| 3.7 | right | lane +1 | lane +1, move `lane` | 0 → +1 from 3.7 s |
| 4.3 | right | stay in the right lane | lane +1, no move | stays +1 (wobble only) |
| 4.9 | down | dive | move `dive` | bottom −0.2704, resurfaces |
| 5.6 | left | queued during the dive | move `dive`, **queued `left`** | executes when the dive ends: +1 → 0 at 5.767 s; +30 |
| 6.2 | up | leap | move `leap` | peak +0.2794; +20 |
| 6.9 | left | lane −1 | lane −1, move `lane` | 0 → −1 from 6.9 s (the 0.62 s leap had ended at 6.79 s, so it ran at once, not queued) |

* Extra numbers: max second difference per frame lat 0.0221, camLat 0.0013, camH 0.0019 (camera springs smooth);
  |lat| ≤ 0.22, |camLat| ≤ 0.11, camH −0.020 … +0.073; camera moves 0.043–0.059 u per frame (no jumps), camera 1.06–1.38 u
  from Benny and always ≥ 0.69 u above his water level (no clipping into the water). Coins by kind: water 14, lane 3, air 0.

### 2. `swipe_log_logic_only.json` / `swipe_log.json` — my own 8-swipe test (timed for the side rows and air arcs)
* 16 / 16 checks true (real touch, frame-0 offsets exactly 0, left / edge / right / leap / dive / queue, left-lane coins,
  air coins on both leaps, HUD = counter, camera clamp, inside the river, no page errors). Max |Δlat| 0.0414 / frame, max
  height step 0.0569 / frame, leap peak 0.2794 (= 0.6 × his height), dive −0.2704 (= 80 % under), coins 1,420 → 1,620
  (water 8, lane 6, air 6). The per-frame rows are identical before and after the clock fix.
* Frame 0, re-rendered this session (`out_controls/a_start_frame0.png`, 23.9 s) vs `?controls=0`
  (`a_start_frame0_controls_off.png`): `compare0.json` = **100 % identical pixels, max difference 0**, so the start view
  is still exactly the approved camera. The other five stills in `out_controls/` are from the previous session (the dive
  still was made with the old 0.2 s sink; frame 102 is at the dive bottom in both timings). No clip was rendered.

### 3. `live_key_check.json` — `?live=1` real-time loop + keyboard (206×458)
* First run found a bug: KeyW never showed a leap because the live loop passed wall-clock `t` while clamping `dt`, so on a
  slow SwiftShader frame the whole 0.62 s leap ended between two frames. Fixed (own clock = Σ dt; live game time = Σ clamped
  dt). Re-run: ArrowLeft → lane −1 (lat −0.18 and moving), KeyW → `move: leap`, height 0.205, then 0.2794 at the peak a
  few frames later; s advanced by itself 0 → 0.84; both keys logged as `key`. Real-time FEEL was not judged (SwiftShader
  runs at several seconds per frame).

### Open issues / honest limits
* With the lead's plan Benny catches **no air coins and only 3 side-lane coins**: the air arcs (s 3.1 / 6.7 / 10.3) and side
  rows (s 1.6, 4.4, 8.0, 11.6) do not line up with that plan's leaps and lane changes. "Coins increase" passes (+170).
  I did not move the coins to fit the test.
* Swipes toward the edge from an outer lane do nothing except a pom-pom wobble (by design).
* The leap is a ballistic arc: take-off and landing are speed jumps (height second difference 0.057 at those two frames),
  softened only by the splash, pitch spring and camera spring.
* Merge notes for the lead: agentB's `play3.html` loads the rebuilt `track_w/` pieces; LANE 0.22 / LAT_MAX 0.26 were set
  for the current track (river half-width ~0.30–0.35) and are untested on `track_w/` (tunable by `?c_LANE=` / `?c_LAT_MAX=`).
  agentB adds `WF?.update(dt, camera); // [waterflow]` right after original line 173, between my coin-line and return-line
  hooks; keep both. The old copied scripts `track_clip.cjs`, `shots.cjs`, `play_shots*.cjs` still use ports 8700–8899
  (unchanged and not used by my tests; `track_clip.cjs` steers with `steer`, which the controls ignore).
* All motion checks are numeric. No moving clip was rendered (software rendering only).

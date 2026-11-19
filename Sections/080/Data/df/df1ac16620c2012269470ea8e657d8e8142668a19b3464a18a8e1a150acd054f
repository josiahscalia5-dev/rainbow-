# Screen 05 — Benny's wake (`splash05m`) + approved bubbles (`bub05`) — foam-bubbles-particles

Session 01VCMXob (2026-11-17, from ~02:35 UTC), branch `ccr-b0757dec-dj6l1o`. Brief: `../briefs/foam-bubbles-particles.md`.
Order parts: 8 (Benny's wake), 11 (every bubble), 2, 14, 15 phase D/E. **Relaunch: read this file first; continue from
"Remaining"; do not redo finished steps.** (In-progress checkpoint; final numbers at the end when written.)

## Switches (default build: nothing runs; explicit `=0` turns a part off even under `?match05=1`)
* `splash05m` — `src/vfx/riderSplash.ts` `createWakeCard05` (replaces the 05 rope fans), `src/vfx/spray.ts` (small wake
  droplets not drawn while the 05 card is live).
* `bub05` — `src/vfx/bubbles.ts` `createApproved05`: the 16 approved bubbles the game did not show. `?bub05all=1` (explicit
  only): all 30, for after the 14 painted copies are removed from the water texture (REQUEST 1).
* Tools: `tools/splash05/probe.mjs` (locked camera, splash frame, bubble rays, background capture with parts hidden),
  `tools/splash05/bake.py` (solve + write textures), `tools/splash05/post.py` (post chain + inverse in numpy, round trip
  exact), `tools/splash05/bubble_audit.py` (per-bubble numbers + contact sheet).
* Assets: `assets/textures/splash05/wake05.png|json`, `assets/textures/bub05/bub05.png|json`.

## Step A — measured (locked frame, cp3 = `../coordinator/checkpoints/cp3_match05_benny_tunnel_done.png`)
### Wake (`masks/wake_splash.png`, 83,491 px): 41.48 mean / 38.9 % within 20, signed +19.7 +15.8 +7.9
| | approved | game (cp3) | difference | cause |
|---|---|---|---|---|
| shape | low fan of thin white-blue filaments hanging from Benny's base down/outward to y ≈ 1290, x 150–715, curved, with droplets, foam collar at the waterline, bright cyan water under the body | two symmetric "angel wings" of straight white rope streaks beside the body, y ≈ 1060–1200, wide white wedges | game white where approved is water: 15,981 px (mean 80); approved white where game is water: 8,751 px (mean 71) | `riderSplash.ts` createRiderSplash05 rope fans (procedural, wrong shape); spray droplets (1,905 px of extra white dots) |
| water between filaments | bright cyan | the river texture's fill under the approved Benny + splash footprint (isolated artwork): pink streaks + light haze | "neither white" pixels 51,240 px mean 28 (41 % of the region error) | coordinator water texture (`assets/textures/water05`), not the splash → REQUEST 2 |
| removing the game splash entirely | | | 41.48 → 37.77 mean (the current splash is worse than none) | |

### Bubbles (`masks/bubbles.png`, approved list of 30): 25.89 mean / 64.5 % (cp3)
Per bubble (`bubble_audit.py` on the splash-free capture): **14 painted in the projected water texture and matching**
(#5 6 7 8 14 15 16 17 18 20 21 25 26 29: mean 1.5–14.6, 75–100 % within 20) — **16 missing in the game**: over the tunnel
walls / apron (#0 1 2 3 4 10 11 12 13 22 23: mean 38–72, the env05 wall bake has no bubbles) and beside the splash
(#9 19 24 27 28: mean 39–51, the water there is the isolated-artwork fill). The game's own bubble system shows none on 05
(`index.ts`: thinned to 0 under `proj05`), so no extra bubbles; no doubles at present.

## Steps B + C — what was built
* **Approach (Part 14 "reuse the actual approved artwork … 2.5D camera-projected detail layers attached to legitimate 3D
  geometry")**: the approved splash / bubble pixels as a premultiplied LINEAR layer (L, a), solved per pixel against a
  real capture of the game without them, through the exact inverse post chain (bloom is off on 05 under match05):
  out = L + background · (1 − a), the most transparent solution (a = smallest alpha that keeps L ≥ 0). Mean alpha of the
  bubbles 0.01–0.28: they are light + a little cover, i.e. transparent; the splash is mostly additive white light.
* **Wake card**: flat card (3.6 × 3.6 u, 2 triangles) on the water in Benny's frame, placed every frame exactly like the
  old fans (so it rides, steers and turns with him). Fragment → texel by projecting its local position with the LOCKED
  camera. Matte: approved pixels whiter than the game's water (less saturated, brighter) + a band under the body (foam
  collar / bright reflection), inside the wake mask, minus Benny, bubbles, foam banks, coins. Water-hue differences are
  NOT carried (nothing water-like slides with Benny). Animated: two-phase flow streams the spray outward from his base
  (12 px per cycle, 1.4 cycles/s; phase-locked so the frozen QA clock t = 12 shows the approved pixels) and it scales
  with the ride strength. Depth: gl_FragDepth biased 0.4 u toward the camera (the river's vertex waves cut holes into it
  otherwise: measured 17.25 → 14.59 mean in the wake), Benny's fur in front still hides it.
* **Bubbles**: camera-facing instanced sprites, world-anchored on their locked view ray at 0.85–0.9 × the distance of the
  first surface (probe), quad size = approved radius + 5 px at that depth; slow bob + thin-film hue swirl, both exactly 0
  at t = 12; on-screen size capped (84 px), fade-out closer than 1.6–2.6 u; visible only while Benny is on 05.

## Measured (real captures, `tools/match05/metrics.py`)
| | cp3 / before | NEW (c2, 02:50, walls before env05's 02:53 re-bake) |
|---|---|---|
| whole frame mean / ≤20 | 11.87 / 83.6 % | **9.58 / 86.9 %** |
| wake / splash | 41.48 / 38.9 % | **14.59 / 77.5 %** |
| bubbles | 25.89 / 64.5 % | **2.08 / 99.7 %** |
| water | 6.75 / 91.6 % | 6.62 / 91.9 % |
| foam banks | 5.62 / 95.1 % | 5.61 / 95.1 % |
| Benny + hat | 19.24 / 73.0 % | 19.22 / 73.0 % |
Default `node scripts/capture.mjs 05` == `qa/pilot05/current_default_05.png`: **0 px** (02:52).
env05 re-baked walls / rings at 02:53: the current game with my parts off (`before.png`, `?match05=1&splash05m=0&bub05=0`)
is whole 11.55 / 84.0 %, wake 41.48 / 38.9 %, bubbles 25.19 / 64.7 %, water 6.08 / 92.6 %, foam banks 2.84 / 98.7 %.

## REQUESTS (coordinator)
1. (bubbles, needed for "no doubles" + "not painted on while moving") remove the 14 painted approved bubbles from the
   projected water texture (`assets/textures/water05/**`, E/far layers): disks listed in `assets/textures/bub05/bub05.json`
   (`group: "painted"`, approved x, y, r; use r + 4) → fill like the Benny/splash hidden area. Then run
   `tools/splash05/bake.py` again against a fresh background capture and turn on `bub05all` (move it into `match05`).
2. (wake) the river fill under the approved Benny + splash footprint shows pink streaks + light haze where the approved
   shows bright cyan water between the splash filaments (51 k px, signed +25 R): use the approved pixels where the approved
   shows water between the filaments (mask to be written: `request_water_visible_mask.png`).

## Remaining
* re-bake against the current walls (env05 02:53), capture new.png + metrics; moving / steering frames
  (`proj05-move.mjs`), 04 / 06 with switches on, gameplay, continuity; matte refinement; REQUEST 2 mask file.

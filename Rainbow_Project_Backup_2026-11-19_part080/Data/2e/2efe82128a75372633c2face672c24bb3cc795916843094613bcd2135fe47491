# Screen 07 · DIVE THE WASHER TUBE — `?match07=1` (Screen 08 method)

Approved picture: `references/07_dive_the_washer_tube.png` (864×1536, unchanged). Switch: `?match07=1` (also `?matchall=1`).
Without the switch the game is unchanged (0 px proofs below). Approval status: **in development / under review** — only
the user approves.

## Pictures for the user (separate, full size)
| | file |
|---|---|
| APPROVED | `qa/match/07/07_APPROVED.png` (copy of the reference) |
| BEFORE (current game, no switch) | `qa/match/07/07_BEFORE_current_game.png` |
| NEW (`?match07=1`) | `qa/match/07/07_NEW_match07.png` (round-3 re-capture: `qa/match/07/m3/07_NEW_match07_r3.png`) |
| moving, NEW | `qa/match/07/m1/motion/` — forward 3 / 6 / 10 / 20 u, steering left / right, before the drop, drop start, drop +4 u, drop middle |
| moving, BEFORE | `qa/match/07/m1/motion_default/` — the same frames without the switch |

## Numbers (`tools/match07/metrics07.py`, same measures as `tools/qa/screen_match.py`; share of pixels within 20 levels / mean abs / SSIM)
| region | BEFORE | NEW |
|---|---|---|
| whole frame | 6.7 % / 74.3 / 0.19 | **80.1 %** / 15.0 / 0.79 |
| below the HUD | 5.8 % / 75.9 / 0.19 | 86.7 % / 10.4 / 0.85 |
| scenery (no HUD/title, no Benny) | 6.0 % / 74.5 / 0.20 | **95.5 %** / 3.8 / 0.95 |
| upper: tube, rings, paddles (y 200–560) | 3.8 % | 99.96 % |
| middle: river, coins, far rings (y 560–900) | 6.1 % | 90.4 % |
| lower: water + foam, no Benny (y 900–1536) | 7.5 % | 95.6 % |
| Benny's area | 4.3 % | 16.6 % (Benny is the game's own model — not changed here; owner: Screen 08 Benny specialist) |

The whole-frame number is held down mainly by Benny (game model vs painted Benny: size, hat stripes, pose) and the
HUD/title (game-drawn, same design). These are pixel statistics, not a "fidelity score".

## How it is built (`src/world/match07.ts`, tools in `tools/match07/`)
1. **Camera solve** (`solve_cam07.py` → `assets/textures/match07/cam07_locked.json`, `qa/match/07/m1/cam07.json`): at the
   game FOV 62°, so Benny's box lands on the painted Benny (221,768–626,1223 vs 208,780–640,1210) and the tube axis'
   vanishing point on the painted ring centre (612,548). In the game: `MATCH_CAM['07']` = camera at Benny's water point
   + `off07`, looking along `dir07` (level), blended in after the 07 start and out before the plunge top.
2. **3D proxy geometry fitted to the picture** (`fit_proxies07.py` → `proj07.json`): the purple tube = a cylinder along
   the game's 07 tube axis (r 5.84 u), painted gold rings at 11.2 / 19.8 / 35.6 / 60.0 / 102.6 u, the water plane at
   Benny's water level, the five paddles upper-left as blocks at the painted spots.
3. **The user's ORIGINAL pixels camera-projected** from that locked camera, with the game's post chain undone
   (`PROJ05_INVERSE`, no fog). HUD, title, Benny and the 8 coins are removed by a PROVISIONAL local fill
   (`make_plate07.py` → `plate07_hybrid.png`, mask `plate07_fillmask.png`, 22.1 % of the frame). A fal clean plate is
   PREPARED, NOT run: `qa/match/07/FAL_PLATE_REQUEST.md`.
4. **Unseen surfaces** (stretch guard + projector depth test): RING-STRUCTURED tiles unwrapped from the artwork —
   `tile_wall.png` = one painted ring bay (R2..R3), repeated every 8.55 u so rings stay rings deep in the tube;
   `tile_river.png` = the painted river, cross-faded for a seamless repeat along the water.
5. **River path along the painted S-river** (`river_coins07.py`, `river_iter07.py` → `river07.json`; `course.ts` `x07()`),
   level (bank 0 on 07), eased in/out so the 06 join, the plunge and 08 keep their shape.
6. **The picture's 8 coins at the painted spots** as real pickups (`coins07.json`, `coins.ts`); they replace the first 8
   trail coins, so the run total stays exactly **91 coins / 2,240**.
7. The projected scenery is shown from 07 start +14 u to 8 u before the plunge top; **the huge 07→08 downward drop keeps
   the game's own tube and camera** (frames `d0..d3` in `m1/motion*/`).

## Proofs
* Default build 0 px different from the pre-change commit `3c7fca9` on 06 / 07 / 08, `?match08=1` on 08 0 px, protected
  05 BEFORE (`?ringa=26&nearfloor05=0` vs `qa/pilot05/wave9/baseline/05.png`) 0 px — round 2: `m1/proofs_0px.json`;
  round 3 re-run: `m3/proofs_0px_r3.json`.
* Continuity (`scripts/continuity-test.ts`): all joins gap 0; plunge vertical drop 61.19 u default / 61.02 u with
  `match07=1`, min pitch −70° (`m3/continuity_default.json`, `m3/continuity_match07.json`, identical to round 2).
* Gameplay `scripts/gameplay-test.mjs` 8/8 with and without `match07=1`, coins end at 2,240 both (`m1/gameplay_*.json`).
* `npx tsc --noEmit -p .` clean.

## Known problems (honest)
* Benny is the game's model (not the painted Benny) → the Benny area stays far apart (16.6 %). Not this workstream's file.
* Provisional fill: where a coin is collected or Benny steers aside, a soft patch of filled river/wall is visible.
* Moving: at 20 u forward a faint doubled ring layer shows upper-left (the projected picture and the ring tile overlap
  where the stretch guard cross-fades); at 3 u the near water shows a mirrored diamond from the river tile. MILESTONE 2.
* The projected look is strongest near the locked view; farther along, the tube relies on the ring tiles (less detail
  than the painting, but no smears).
* No phone test (no device in the cloud).

## MILESTONE 2 (round 4, 2026-11-17) — moving-view fixes
Kept set: `?match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1` (details + verdicts: `STATUS.md`).
* `m07wall` → `assets/textures/match07/tile_wall_clean.png`: the painted paddle rows of the ring-bay tile replaced by the
  perforated wall from just below (feathered) + a small inpaint at its tip.
* `m07river` → `tile_river_clean.png`: orange/gold hues of the river tile recoloured to the pink bank hue (brightness kept).
* `m07fill` → `plate07_fillmask_soft.png`: the fill mask eroded + blurred, clipped to the original mask (fades only inside).
* `m07gold`: paddles take the picture only within ~14° of the approved view direction, else solid polished gold.
* `m07coins` (`src/gameplay/coins.ts`): two far trail coins at lateral 0.42 / 1.82, scale 0.45 (`m2/coins/probe_m07coins.json`).
* `m07ang`: tested in round 3, no visible effect → not kept (code stays, off).
Pictures: `m2r4/pictures/1_APPROVED_07.png`, `2_BEFORE_M1_07.png`, `3_NEW_M2_07.png`; moving: `m2r4/motion_k5/`.

## MILESTONE 3 (round 7, 2026-11-18) — whole stage incl. the plunge
New kept set: `?match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1&m07tube=1&m07ring=1` (verdicts, numbers,
honest rating: `STATUS.md`; pictures `r7/APPROVED_07.png`, `r7/BEFORE/`, `r7/NEW/`).
* `m07tube` (`src/world/match07.ts` `Plunge07` + `setPlunge`, `src/game/Game.ts`): plunge tube + river ribbon built from
  `course.sample` every 0.4 u from `07_plunge_top − 4` to `07_plunge_bottom`; centre = path + up·3.10 (+ an offset that
  matches the fitted axis at the start and decays over 14 u); uv = (arc depth, angle) / (lateral, arc depth) → shader
  modes 3/4 (tile only, no projection, post-chain inverse). The fitted proxy is clipped beyond that depth (`uClip`) only
  after the hand-over (8 u before the plunge top). The game's own water is visible again once the camera has passed the
  start (Benny ≥ start + 9 u) and lies under the plunge ribbon; the ribbon fades out between bottom−14 and bottom−3 u.
  The game's tube zone stays hidden until stage 08 starts. Plunge meshes are excluded from the projector depth bake.
* `m07ring`: `tools/match07/straighten_wall07.py` → `assets/textures/match07/tile_wall_ring.png` (+ `r7/straighten_wall07.json`:
  row shifts −123…+98 px of 512; band centre after ±20 px).
* `m07near`: code kept, off (no visible change).
* Hand-overs (disclosed): at 8 u before the plunge top the straight painted far tunnel is replaced by the plunge tube
  (the old build switched to the default world at the same point); at the 07→08 boundary the game's tube zone returns.
* Tools: `tools/match07/probe_r7.mjs` (pitch / far-ring projection), `tools/match07/proof0px_r7.mjs` +
  `diff0px_r7.py` (deterministic checkpoint captures + pixel diff), `tools/lead_r6/motion_audit.mjs` + `motion_metrics.py`
  (copied from the lead branch).

### The preview branch's `x07` change (`claude/rainbow-preview-all-c6` @ `41ea6618`) — inspected read-only, NOT ported
It is not a visual fade: it is a one-line change in `src/world/course.ts` `x07()`. The ease-out of the painted S-river
override never finished before the plunge top, leaving a ≈0.49 u sideways offset that moved the whole plunge and Screen
08's path against 08's world-fixed projected chamber (08 with all switches fell to 29.5 %). The change multiplies the
weight by `smooth(0, 4, z − (s7.z − 60))`, so the 07 river returns exactly to the default path over the last 4 u before the
plunge top (match07-guarded). Preview evidence: 08 with all switches 87.7 %, 07's own view unchanged (80.1 %), 8 stages,
2,240, drop 61.19. Effect on 07 if ported: the last 4 u of the level stretch steer slightly sideways; the plunge tube of
`m07tube` follows the path, so it would move with it. Waiting for the user's approval.
* APK (one attempt, 2026-11-18): `VITE_RAINBOW_Q05="<new set>" npm run android:debug` → web build + sync OK, Gradle
  FAILED configuring the root project: `Could not resolve all files for configuration ':classpath'` — `Could not find
  org.apache.httpcomponents:httpmime:4.5.6` and `io.grpc:grpc-api:1.45.1` (searched dl.google.com and
  repo.maven.apache.org; Maven fetches through this network are intermittent). Not retried. No new APK this round.

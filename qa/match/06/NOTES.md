# Screen 06 · CREST THE RINSE ARCH — `?match06=1` (Screen 08 method) — milestone 1

Status: **in development — under review by the user. Nothing here is approved; only the user approves.**
Default build unchanged; everything runs only with `?match06=1` (or `matchall`). Line A only.

## What `?match06=1` does
1. **Approved view camera** locked at the game FOV 62° (`tools/match06/solve_cam06.py`, `fit_river06.py` →
   `assets/textures/match06/cam06_locked.json`; one `MATCH_CAM['06']` line + a switch-guarded block in `cameraRig.ts`).
2. **River follows the painted river** (`course.ts`, 06 segment only, value + slope 0 at both ends →
   05→06 join and the whole 07 / plunge / 08 route unchanged; `path06.json`).
3. **Real 3D geometry fitted to the picture** (`src/world/match06.ts`, layout `proj06.json`): perforated tunnel tube
   around the river, river floor, far end cap. The user's ORIGINAL pixels (HUD/title/Benny/coins provisionally filled:
   `plate06_hybrid.png`) camera-projected from the locked camera, post chain undone, no fog, no bloom on 06.
4. **Unseen surfaces**: ring-structured tube tile (gold rings + slotted metal unwrapped round the painted vanishing
   point) + stretch / magnification guard + projector depth test.
5. **The picture's 15 coins** at the painted spots as real pickups (`coins06.json`, `tools/match06/coins06.py`) + 3 of
   the default 18-coin row on the 06 entry → run total unchanged.

## Round 3 changes (2026-11-17, branch `claude/rainbow-s06-match-c3`)
* **Coin trail on the far river.** The river crests, so a ray through the painted coin trail crosses the near water
  first and the far river again. The solver had put 6 trail coins on the near water as tiny coins (0.05–0.17 of a coin);
  they now sit on the far river (s 212–219, 0.13–0.33 of a coin), one receding line like the painted trail. Result:
  every coin is collectible — gameplay **91 coins / 2,240** with `match06=1` (was 86 / 2,190).
* **Moving camera** (was: white smear under Benny at 3 u, upside-down tunnel copy on the water at 6 u and when steering,
  kaleidoscope diamonds + floating foam blobs on the water from 10 u):
  * `tools/match06/make_masks06.py` → `assets/textures/match06/mask06.png` (check: `masks06_check.png`): G = outline of the
    painted water (near river + crest loop + thin far stream) — the river floor carries painted tunnel pixels outside it;
    R = Benny's provisional fill (soft edge). Where the floor shows such pixels, it shows the painted-water tile as soon
    as the camera leaves the approved view (fades in over the first ~1 u) — the approved view is pixel-identical.
  * `tools/match06/make_floor06.py` → `tile_floor2.png`: the painted water just below Benny RECTIFIED to a top view of
    the floor, seamless along the river (repeat, ~2.5 u period, laid 4× longer so the streaks run with the flow), mirrored
    only across the river. Replaces the mirrored perspective crop (`tile_floor.png`, kept).
  * `&m06v=2` reproduces the round-2 result exactly (old floor tile, no masks). `&m06dbg=1` (QA only) tints tube green /
    floor red.

## Measured (`tools/qa/screen_match.py`, `tools/match06/measure06.py`; JSON in this folder)
Pictures (full size, 864×1536): APPROVED `references/06_crest_the_rinse_arch.png` · BEFORE `06_BEFORE_current_game.png` ·
NEW `06_NEW_match06.png` (+ Android size `06_NEW_match06_android1080x1920.png`).

| within 20 levels (SSIM) | BEFORE (current game) | NEW `?match06=1` |
|---|---|---|
| whole frame | 5.0 % (0.18) | **79.1 %** (0.785) |
| below HUD strip | 4.1 % | 85.6 % |
| SCENERY (no HUD strip, no Benny + splash) | 4.1 % (0.20) | **98.8 %** (0.987) |
| upper: tunnel, rings, paddles | 1.4 % | 97.8 % |
| middle: river crest, coins, far stream | 4.5 % | 98.4 % |
| lower: near river, foam | 6.5 % | 99.8 % |
| Benny + splash box | 4.0 % | 55.2 % |
The whole frame is held back by the game's own HUD bar/title (different style from the painted HUD) and Benny (game
Benny is larger, different hat; Benny is the Benny specialist's work, untouched here).

## Moving frames (`node tools/match06/motion06.mjs <dir>`): `motion/` (round 3) vs `motion_r2/` (round 2)
3 / 6 / 10 / 15 / 20 / 30 u forward + steering left / right (`contact_sheet.png` in each). Round 3: no smears, no
mirrored copies, no walls or rings between the view and Benny. Still visible: the floor tile's repetition (soft pink
chevrons), faint ghost of the painted rainbow band on the outer banks right after leaving the approved view, the far
trail coins face the approved camera (seen at an angle from behind), and from ~10 u the river is the tile, not the
painted design (the picture never showed that water up close).

## Proofs (round 3, `proofs_r3.json`)
* Default captures 05/06/07/08 and `?match08=1` 08: 0 px different below the HUD strip vs a worktree of `752d6d8` (line A
  before any 06 code; that worktree's own HUD strip renders differently). Repeat default 06 captures at HEAD: 0 px full
  frame; one batch run differed by 27 px in the HUD bar only (rows 21–104, ≤ 6 levels) = capture noise.
* `?ringa=26&nearfloor05=0` vs `qa/pilot05/wave9/baseline/05.png`: **0 px, full frame**.
* Gameplay `node scripts/gameplay-test.mjs`: **8/8, 91 coins / 2,240** default (`qa/gameplay_test.json` unchanged) and with
  `match06=1` (`gameplay_test_match06.json`); coin reachability probe `tools/match06/coinrun06.mjs` → 91/91.
* Continuity `npm run test:continuity`: unchanged (all gaps 0). `npx tsc --noEmit -p .` clean. 13 reference checksums OK.

## Reproduce
```
node scripts/capture.mjs 06 --q=match06=1 --out=<dir>
python3 -I tools/match06/measure06.py references/06_crest_the_rinse_arch.png BEFORE=<before.png> NEW=<dir>/06.png
node tools/match06/motion06.mjs <dir>            # add 'match06=1&m06v=2' as 2nd arg for round 2
python3 -I tools/match06/coins06.py tools/match06/probe06_locked.json assets/textures/match06/cam06_locked.json assets/textures/match06/plate06.json assets/textures/match06/coins06.json
python3 -I tools/match06/make_masks06.py assets/textures/match06 qa/match/06
python3 -I tools/match06/make_floor06.py tools/match06/probe06_locked.json assets/textures/match06/cam06_locked.json assets/textures/match06
```

## Open
* Provisional local fill (HUD/title/Benny/coins) — clean plate prepared, NOT run: `FAL_PLATE_REQUEST.md` (needs the
  user's OK through the lead).
* The `?camclear=1` 06 obstruction fix belongs to the Screen 08 camera specialist; under `match06=1` the 06 camera is
  this switch's own (no walls/rings between the view and Benny in the moving frames). Combining both switches is untested.
* Android APK `builds/rainbow-debug-06-2026-11-17-r3.apk` (`VITE_RAINBOW_Q05="match06=1"`) — NOT phone-tested.

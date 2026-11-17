# Screen 04 — approved scenery on real 3D geometry (`?match04=1`, 2026-11-17, branch `claude/rainbow-s04-match`)

Method = Screen 08's (`qa/match/08/NOTES.md`). Approved picture `references/04_through_the_five_arrows.png` (unchanged,
13/13 reference checksums OK). **Default build unchanged (0 px, verified). Status: in development — only the user approves.**

## What `?match04=1` does (all behind the switch)
1. **Camera** (`src/game/match.ts` MATCH_CAM['04'], `src/game/cameraRig.ts` off04/dir04): solved offline at the game's
   FOV 62 from Benny's real mesh vertices at the 04 checkpoint (`tools/match04/bennypts04.mjs` → `solve_cam04.py`) so his
   box lands on the approved picture's Benny (195,965–590,1400; residual < 0.2 px) and the tunnel's vanishing point (the
   image of the straight 32° slide) on (490,690). Camera = Benny's water point + off04 (0.40, 6.20, 3.52), level, looking
   along dir04; it rides with Benny down the slide (blended in at the 04 start, out before 05).
2. **Geometry** (`src/world/match04.ts`, layout `assets/textures/match04/proj04.json` from `tools/match04/fit_proxies04.py`):
   gold-ring tunnel = cylinder along the slide (r 3.58, axis 2.27 above the water, mouth 6.8 u ahead of Benny) fitted to
   the painted big ring's inner circle; mouth ring (annulus to r 4.11, the painted outer edge); room wall around the mouth
   (porthole, towels, control panel, foam banks); water plane at Benny's water level from behind the camera down the
   tunnel; tunnel end cap. Old 04 decor (basin + tube zones), river ribbon, foam, bubbles, splash hidden on 04 only.
3. **Texture** (`assets/textures/match04/plate04_hybrid.png`, 864×1536): the user's ORIGINAL pixels for all scenery
   (76.6 % of the frame) + a PROVISIONAL local fill (23.4 %: HUD bar, title, Benny, five coins; OpenCV Telea inpainting
   for colour + high frequencies of mirrored artwork patches for texture) — fal clean plate prepared, NOT run
   (`FAL_PLATE_REQUEST.md`). Camera projection from the locked camera, projector depth test, inverse post chain
   (PROJ05_INVERSE), no fog, bloom 0 on 04 under the switch.
4. **Unseen surfaces**: mirrored tiles of patches cut from the artwork (`patch_gold|water|wall.png`) where the moving
   camera sees a surface much more face-on OR much closer than the approved view (stretch × magnification guard; = 1 in
   the approved view, so that view is unchanged).
5. **Coins**: the picture's five coins are real pickups at the painted pixels (`tools/match04/coins04.py` →
   `coins04.json`): on their view rays, pulled to the nearest depth inside the river (|lateral| ≤ 1.6) ≥ 1 u ahead of the
   checkpoint, sized to cover the painted coin, facing the approved camera. The other 3 of the 8-coin 04 row sit on the
   slide entry before the view: **91 coins / 2,240 unchanged**.

## Measured (approved vs capture, 864×1536; `04_NEW_screen_match.json`, `scenery_metrics_BEFORE_NEW.json`)
| | BEFORE (current game) | **NEW `?match04=1`** |
|---|---|---|
| whole frame within 20 levels | 6.4 % (SSIM 0.32) | **79.9 %** (SSIM 0.80) |
| below HUD within 20 | 5.2 % | **87.9 %** (SSIM 0.86) |
| layout (blurred) within 20 | 4.7 % | **90.0 %** |
| SCENERY (no HUD strip, no Benny) | 5.1 % | **97.6 %** (SSIM 0.967) |
| upper: room + ring top (y 200–560) | 4.6 % | **100.0 %** |
| middle: tunnel, arrows, coins (y 560–960) | 4.0 % | **95.7 %** |
| lower: water + foam, no Benny (y 960–1536) | 6.4 % | **97.3 %** |
| Benny area | 6.6 % | 16.5 % (game Benny's look differs) |
1080×1920 capture: whole 79.9 %, below HUD 87.9 % (same). Pictures (separate, full size 1080×1920):
`04_APPROVED.png` (the reference resized for viewing), `04_BEFORE_current_game.png`, `04_NEW_match04.png`
(+ 864×1536 natives `*_864x1536.png`). Draw calls 47 vs 97 default, triangles 170k vs 712k.

## Moving camera (`motion/`, real sim: forward 3/6/10/20 u, steering left/right at 6 u)
Holds with correct parallax: room, mouth ring, tunnel rings, arrows, coins; Benny + coins stay on the painted river;
steering left collects 2 picture coins (real pickups). Breaks / to fix: (a) under and just in front of Benny the
provisional fill shows (mirrored water texture, softer) — the fal plate fixes this; (b) inside the tunnel (≥ 10 u) the
walls switch to mirrored gold tiles — visible tile seams, no ring structure; next: a cylindrical ring texture cut from
the painted rings (angle × axis UV) instead of triplanar tiles; (c) the painted water is static (no flow yet).

## Remaining visual differences
1. **Benny** (owner: Screen 08 agent): the game's beanie is flatter with fewer, wider stripes, the pom-pom smaller, body
   narrower at the base; the painted white SPLASH around his base is missing. Line A already has the ported `benny05`
   look (knit stitches, stripes, pom yarn) behind `?benny05=1 / ?match08=1` — enabling it under `?match04=1` needs a one-flag
   edit in `src/characters/benny/benny05.ts` (Benny file → lead's decision). A splash card cut from the picture (as
   `splash08`) can live in my files.
2. HUD is the game's HUD (the picture's painted HUD is not reproduced — by design).
3. Coins float 1.5–2.7 u above the water (painted perspective puts them on the bank beyond the tunnel wall; moved
   inward on their view rays to stay collectible) — visible only when moving.

## Proofs (2026-11-17)
* Default `node scripts/capture.mjs 04 05`: 0 px different before/after. `?match08=1` 08: 0 px different.
* `node scripts/gameplay-test.mjs`: 8/8, output byte-identical to before; with `--q=match04=1`: 8/8
  (`gameplay_test_match04.json`), 91 coins collected, 1,330 → 2,240. (Victory state shows hearts 4 under the switch vs 5
  default — the wall-bump check passes in both; noted for the lead.)
* `npx tsc --noEmit -p .` clean. `sha256sum -c scripts/reference.sha256` 13 OK.

## Reproduce
```
node tools/match04/bennypts04.mjs > bpts.json                       # Benny vertices at the 04 checkpoint (default build)
python3 -I tools/match04/solve_cam04.py bpts.json assets/textures/match04/cam04_locked.json
python3 -I tools/match04/fit_proxies04.py assets/textures/match04/cam04_locked.json assets/textures/match04/proj04.json
python3 -I tools/match04/make_plate04.py references/04_through_the_five_arrows.png assets/textures/match04
python3 -I tools/match04/coins04.py assets/textures/match04/proj04.json 77.41308465825975 assets/textures/match04/coins04.json
node scripts/capture.mjs 04 --q=match04=1 --out=<dir>; node tools/match04/motion04.mjs qa/match/04/motion
python3 -I tools/match04/metrics04.py references/04_through_the_five_arrows.png <before.png> <new.png> <out.json>
```
(`off04` / `dir04` in match.ts = `off04` / `fwd` of cam04_locked.json.)

## Milestone 2 (2026-11-17 ~17:30 UTC, branch `claude/rainbow-s04-match-c2`) — the screen while riding
Same switch `?match04=1`; `&tile04=0` brings back milestone 1 for A/B. Only `src/world/match04.ts`, `tools/match04/`,
`assets/textures/match04/` changed (+ the `camera` argument of `m04.sync` in Game.ts, inside `if (m04)`).
1. **Deep tunnel = real gold rings, no smears, no mirrored copies.** The painted rings are not concentric with a straight
   tube (their centres drift toward the vanishing point), so an unwrap through the tube gave wavy, smeared rings (the
   saved `tile_tunnel.png`, kept but unused). New `tile_ring.png` (`make_tiles04.py`): ONE painted ring — groove, lip,
   groove, polished band — read straight off the picture along the tunnel top (x 445–485, y 517–575), times the painted
   colour at every angle around the tunnel (side reflections, pink/violet glints, long highlights; polar unwrap around the
   drifting ring centres). It repeats every 6.5 u along the tunnel, anchored to the world, phase set so a lip sits where
   the painted near rings are (≈ 1, 7.1, 13.6 u past the mouth). Used only where the stretch guard drops the projection.
2. **Water under / around Benny = the painted river.** The water plane's fallback is now `tile_river.png` (the approved
   cyan river with its chevron arrow unwrapped from 9.5–14.8 u ahead of Benny, lateral ±4 u, now seamless — the earlier
   cross-fade left a seam line), anchored to the world; outside ±4 u the old patch stays. Where the plate is a provisional
   fill (the area painted under Benny) the painted river replaces the fill once the camera has moved > 0.3–2 u from the
   approved view (water only; the coin fills on the bank stay — the tile there looked like brown barrels).
3. **Approved view unchanged:** 4 of 1,327,104 pixels differ from milestone 1 (max 47 levels); whole frame 79.9 %
   (SSIM 0.798), scenery 97.6 % (SSIM 0.967), bands 100.0 / 95.7 / 97.3 %, Benny 16.5 % — identical to milestone 1
   (`scenery_metrics_M1_M2.json`, `04_NEW_m2_864x1536.png`).
4. **Moving frames** (`motion_m2/BEFORE_milestone1/` vs `motion_m2/NEW/`, full size 864×1536, forward 3/6/10/15/20 u,
   steering left/right at 6 u): NEW shows ring structure all the way down the tunnel at 10–20 u (BEFORE: kaleidoscope of
   mirrored gold tiles) and the painted river with chevrons under and in front of Benny (BEFORE: mirrored pink/white
   water tiles, mirrored fill under Benny when steering). Not fixed yet: the ring closest to the camera at 15–20 u is
   soft (one ring band is only 58 painted pixels tall), the big chevron right in front of the camera is soft for the
   same reason, and the painted water is still static (no flow).
5. **fal clean plate — RUN ONCE** after the lead's "FAL READY" (16:43 UTC; the user's one authorised edit, no retry):
   re-checked first, no Screen 04 record on any branch / in Image-Blaster. ONE `fal-ai/nano-banana-2/edit` 2K call with
   the prepared prompt, request id **`01a1ea70-42d8-7943-b035-7bb5f129d872`** (16:56:27 → 16:56:49 UTC). Result
   `fal/1-04-five-arrows-plate_fal_nano-banana-2_2K.png` (1536×2752) + record `fal/fal_edit1_plate_request.json`. It
   keeps the rings, porthole, towels and control panel, removes Benny, coins and title and continues the river and
   chevrons; the HUD came back as an empty purple bar (covered by the game's HUD). `tools/match04/fal_plate04.py`:
   ECC affine alignment (0.996; outside the mask 78.3 % → 94.5 % within 20 levels), colour matched around the mask,
   composited ONLY inside `plate04_fillmask.png` → NEW file `plate04_hybrid_fal.png` (the M1/M2 plate is untouched).
   Switch **`?match04=1&fal04=1`**: whole frame 79.9 → **81.3 %** (SSIM 0.798 → 0.812), scenery 97.6 → **98.1 %**
   (SSIM 0.973), middle 95.7 → 96.9 %, lower 97.7 %, Benny area 16.5 → 21.1 % (`scenery_metrics_M2_vs_fal04.json`,
   `04_NEW_m2_fal04_864x1536.png`); moving frames `motion_m2/NEW_fal04/` — continuous painted swirls under Benny
   instead of the mirrored fill; gameplay 8/8, 91 coins (`gameplay_test_match04_fal04.json`).
6. **Splash card under Benny:** not done this milestone.
Proofs: default 04 capture 0 px different from the saved milestone-1 default capture (full frame); default 05 and
`?match08=1` 08 0 px different below the HUD strip vs a checkout of the milestone-1 commit (the HUD strip differed only
in that temporary checkout's own run); `?ringa=26&nearfloor05=0` vs `qa/pilot05/wave9/baseline/05.png` 0 px;
`node scripts/gameplay-test.mjs` 8/8 without and with `--q=match04=1` (`gameplay_test_match04_m2.json`, coins
1,330 → 2,240 = 91 coins); `npx tsc --noEmit -p .` clean; references 13/13 OK.
Reproduce: `python3 -I tools/match04/make_tiles04.py assets/textures/match04`; `node tools/match04/motion04.mjs <dir> [q]`.

## Milestone 3 (2026-11-17 ~17:40 UTC, account 3, branch `claude/rainbow-s04-match-c3`)
Started from `4d1f5b25` (= `-c2` head `255ec5e6` + one transcript autosave). Lead = session_01Q46SCLi5xPVn25aRuxkVwK.
### Step 1 — fal04 on by default under `?match04=1` (autosave `255ec5e6`), verified
* `?match04=1` capture = milestone-2 `&fal04=1` picture (`04_NEW_m2_fal04_864x1536.png`): **0 px different** → numbers
  unchanged (whole 81.3 %, scenery 98.1 %, SSIM 0.973).
* `?match04=1&fal04=0` = milestone 2 without fal: 4 px differ (max 43 levels) from the saved M2 picture — the same 4-pixel
  run-to-run difference already seen between M1 and M2 captures; otherwise identical.
* Default build 04 0 px vs `04_BEFORE_current_game_864x1536.png`; default 05 0 px vs `qa/pilot05/current_default_05.png`;
  `?match08=1` 08 0 px vs `qa/match/08/08_NEW_match08.png`; `?ringa=26&nearfloor05=0` 0 px vs the wave9 baseline.
* Gameplay 8/8 with `--q=match04=1` (`gameplay_test_match04_m3.json`, samples identical to the M2 fal04 run, coins
  1,330 → 2,240 = 91 coins); default run 8/8 and `qa/gameplay_test.json` byte-identical.
### Step 2 — approved river colours while riding (`&river04=0` = milestone-2 river), on by default under match04
* Cause: the riding fallback `tile_river.png` was cut from the narrow river INSIDE the tunnel (9.5–14.8 u), which the
  picture paints almost plain cyan. New `tools/match04/make_river04_m3.py` → `tile_river3.png`: the painted water AROUND
  Benny (1.8–6.4 u ahead, ±4 u: pink swirl ribbons, cyan streams, foam banks; fal clean plate under Benny/coins — checked:
  no brown marks where the coins were removed), gold ring pixels removed and refilled along the flow, seamless along the
  slide; `tile_chev3.png` = the milestone-2 tile's glowing arrow only (alpha), laid on top with its own period (5.3 u vs
  5.2 u, so the two never line up into an obvious repeat). Inside the tunnel the banks are drawn 1.3× closer to the walls.
* Approved view: 4 px differ from the M2 fal04 picture (max 34 levels, the usual run-to-run pixels) → numbers unchanged.
* Riding frames `motion_m3/step2_river/` (BEFORE = `motion_m2/NEW_fal04/`): pink ribbons + foam banks + arrows under
  and around Benny at 3–20 u and when steering. Remaining: the flat water meets the tunnel wall in a hard straight edge
  near the camera at 15–20 u (geometry, also in M2).
### Step 3 — sharper far rings (`&rings04=0` = milestone 2; `&keep04=a,b` test override), on by default under match04
* Cause: deep in the tunnel the rings ahead still came from the approved picture's FAR rings, magnified 2–2.5× (soft,
  glowy haze). The tunnel wall now hands over from the projection to the sharp painted ring tile at magnification
  1.5–2.6 instead of 2.5–6 (tunnel wall only; room, mouth ring and water unchanged). The approved view (magnification 1)
  is unchanged: 4 px vs the M2 fal04 picture, max 34 levels.
* Tunnel-area sharpness (y 200–900, mean gradient / Laplacian variance): 10 u 18.6 → 19.4 / 44 → 41; **15 u 16.7 → 24.2 /
  45 → 59; 20 u 17.0 → 25.6 / 24 → 82**. Frames `motion_m3/step3_rings/` vs `motion_m3/step2_river/`: the same painted
  ring repeats sharply all the way down instead of turning into haze, so the tunnel keeps one character while riding.

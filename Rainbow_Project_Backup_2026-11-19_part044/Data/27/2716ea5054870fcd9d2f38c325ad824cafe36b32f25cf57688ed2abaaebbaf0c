# Screen 06 — round 16 (account 16) — visuals only

Branch `claude/rainbow-s06-match-c16` (from `050155b5` = r15 audit + the r15 worker's unfinished `m06gold` edits, restored).
History: `qa/match/06/r15/PROGRESS.md` (ranked audit, BEFORE shots `qa/match/06/r15/BEFORE/`). Authority: `references/06_crest_the_rinse_arch.png`.
Kept set (unchanged): `match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1`.
Shots: `tools/match06/r16_shots.mjs` (the lead's motion-audit positions, only the named views, port 5276).
Not touched: camera, composition, Benny, coins, physics, HUD, other screens. Default build unchanged (all under `match06=1`).

## Step 1 — `&m06gold=1`: the painted gold ring band on every modeled ring (r15 rank 1, approved by the lead 18:46)
* What: `tools/match06/make_ring06.py` straightens the nearest complete painted ring of the approved picture (upper-left arc,
  circle fit through the orange band, each angle column straightened between its own band edges; the user's pixels are only
  resampled) into `assets/textures/match06/tile_ring6.png` (1024 x 256). The modeled rings (`m06ring`) carry it along their
  profile: outer painted tier on the camera-facing face (37 %), the wide bright tier with the highlight dashes on the inner
  cylinder, the yellow lip at the far end; 4 mirrored repeats round each ring (no seam); a light view-dependent sheen.
* Pictures: `qa/match/06/r16/step1_m06gold/` — `1_APPROVED.png`, `BEFORE/` (kept set, r15 audit shots), `NEW/` (kept set +
  `&m06gold=1`): start, forward 3 / 6 / 10 / 20 u, 33 / 66 / 95 % through, hard left, hard right. Clip `m06gold_swim.mp4`.
* Start view: only the rings change (where the start camera already shows the rings' own material through the approved
  pixels): the thin striped ring strip just above the crest is now gold instead of brown. Coins: identical counts at every shot.
* Verdict: **GOOD IMPROVEMENT.** While Benny swims the rings no longer read as dull rust-brown hoops with one thin yellow line;
  they are thick polished salmon-gold bands with bright highlight dashes all round, like the painted rings. Remaining on the
  rings: the painting's rings are a little more yellow-gold with pink-lilac reflections, and its highlights are a little
  longer along the ring.

### Step 1 v2 — start view untouched (lead order ~19:45)
* The lead's motion-audit "a00" shot runs the live game for two animation frames after `goto`, so it lands ~1.1 u past the
  checkpoint (s 200.01; on another run 199.71 — timing-dependent under CPU load), where the camera is 0.55 u from the
  approved viewpoint and the rings already show 28 % of their own material. v1 changed that material there (59k px).
* v2: the painted band fades in by the camera's distance from the approved viewpoint, exactly like the game's away factor
  (0 up to 0.6 u, full from 2 u). All moving shots (forward 3 u and beyond, >= 2.9 u away) are unchanged from v1.
* New deterministic start check `tools/match06/r16_start.mjs` (page clock frozen, game not run, fixed simulation steps):
  `START_v2/` BEFORE vs NEW at the checkpoint and at +1.1 u: **0 px differ** (byte-identical PNGs); BEFORE repeat = 0 px.

## Ranked list update (lead ~19:45): start-view artefacts, by eye, BEFORE and NEW identical there
Seen at +1.1 u (`START_v2/BEFORE_forward1.1u.png`; the exact checkpoint itself is clean):
* (a) faint see-through ring arcs crossing the painted rings in the upper tunnel (double exposure: the modeled rings cross-fade
  from the approved pixels to their own material between 0.2 and 1.2 u from the approved viewpoint);
* (b) a striped strip of rings just above the crest edge across the whole width (the crest water painted onto the modeled
  rings, mixed with their own material), the crest top sheared there;
* (c) a pale ghost of the painted Benny on the water just under him.
How visible while swimming: only in the ~2 u around the start view (≈ 0.2 s at 06 speed, on the way in and on the way out),
but it is exactly the moment the screen should look most like the picture, and double exposure is forbidden by the goal.
Ranking now: 2. foam (whole ride, large, near the camera) → 3. start-view flash (a)+(b)+(c) → 4. ripple rings round Benny →
5. purple slotted walls → 6. gold paddle lids → 7. crest water pink bands → 8. bubbles.

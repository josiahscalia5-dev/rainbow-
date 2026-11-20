# Screen 06 — round 22 progress (branch `claude/rainbow-s06-match-c23`)

## (r22) WHERE I STOPPED / NEXT
* Step 1 (`&m06view=1` proof) — DONE, see below. Verdict: NOT YET PROVEN (small gain, main goal not reached). Waiting for the user
  to judge it from gameplay; NOT in the kept set.
* Step 2 (`&m06st=1`, rank-3 start-view flash) — DONE: GOOD IMPROVEMENT (small; first ~1.3 u of the swim). Candidate for the
  kept set (lead / user decide).
* Next: task 3 (big white foam walls → low puffy foam clouds in the lower corners), with and without `m06view`.

K6 = `match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1&m06gold=1&m06fclu=1`

## Step 1 — composition test `&m06view=1` (user-approved camera-framing TEST)
* BEFORE = K6; NEW = K6 + `&m06view=1` (current defaults `m06vw=20,38`, `m06vx=0.85`; code from r21, unchanged this round).
* Folder `qa/match/06/r22/step1_m06view/`: `1_APPROVED.png`, `BEFORE/*.png`, `NEW/*.png` (separate full-size 864×1536 shots from
  the real game: start, early 12 % / 22 %, middle 35 % / 47 %, late 60 %, end 85 %, hard left / right at 35 %, left / right early at
  15 %), `swim_06_BEFORE.mp4`, `swim_06_NEW.mp4` (uninterrupted real-gameplay clip, 4.8 s: straight, then hard left, then hard
  right, then straight, from the 06 checkpoint through the whole of 06 into 07 — logs `swim_06_*.log` show s 199 → 264, stage 06 → 07).
* Start view: BEFORE vs NEW `a_start` **0 px differ** (pixeldiff threshold 0.1, whole frame). At threshold 0, 4.6 % of pixels move by
  at most 12 / 255 (water shimmer only) — no visible change.
* Gameplay `node scripts/gameplay-test.mjs --q="K6&m06view=1"` → **8/8 pass**, coins 1,330 → 2,240 = **91 coins**, no camera cut,
  no teleport. `npm run test:continuity` → OK (05→06 and 06→07 gap 0).

### Verdict — NOT YET PROVEN (small gain; the main goal is not reached)
* Closer: once Benny leaves the start, he sits lower and smaller in the frame, much like the painting, and you see the river
  rising ahead of him with the coin line along the crest. When steering hard left or right he stays fully in the picture (BEFORE
  cuts him off at the screen edge).
* Not closer: within the first second the gold rings still turn into a straight, centred bullseye in both versions — the painted
  off-centre tunnel and the leftward curve of the crest are not held. NEW also shows MORE of the big white foam walls on both
  banks (task 3 targets those).
* The user decides from the clip whether to keep it. Most visible remaining difference: centred ring tunnel + big foam walls.

## Step 2 — start-view flash `&m06st=1` (r18 rank-3 WIP, finished)
* Switch: `&m06st=1` (needs K6). This round I shortened its hand-over: `m06stw` default 0.6,1.2 → **0.75,0.85** (`src/world/match06.ts`).
  The r18 setting cross-faded the painting into the 3D tunnel and at +1.5 u showed a see-through DOUBLE-EXPOSED tunnel with
  smeared paddle lids (`rejected_r18_stw_0.6_1.2/f_1.5u.png`); a later switch (1.0,1.1) held the painting too long and it
  stretched for a frame at +1.7 u (`rejected_stw_1.0_1.1/f3_1.7u.png`). Both rejected.
* BEFORE = K6, NEW = K6 + `&m06st=1`. Folder `qa/match/06/r22/step2_m06st/`: `1_APPROVED.png`, `BEFORE/` + `NEW/` full-size shots at
  the start and Benny +0.3 / 0.6 / 0.9 / 1.1 / 1.3 / 1.5 / 1.7 / 2 / 3 u (`tools/match06/r18_dbg.mjs`), the same with `m06view`
  (`with_m06view/`), `swim_start_BEFORE.mp4` / `swim_start_NEW.mp4` (2 s real gameplay from the checkpoint).
* Start view **0 px** differ (pixeldiff 0.1), also with `m06view`; at +3 u NEW = BEFORE (8 px). Gameplay 8/8, 91 coins
  (1,330 → 2,240) for `K6&m06st=1` and `K6&m06view=1&m06st=1`; continuity OK (`gameplay.txt`).

### Verdict — GOOD IMPROVEMENT (small: the first moment of the swim only)
* BEFORE, as soon as Benny moves: a pale white ghost of the painted Benny smears on the water under him, thin see-through ring
  arcs cut across the crest, then a striped ring strip and torn crest appear on the right before the 3D tunnel takes over.
* NEW: the painted start picture stays clean and crisp (blue water under Benny, crest and off-centre tunnel intact) up to about
  +1.3 u, then switches straight to the 3D tunnel — no ghost, no see-through arcs, no double exposure.
* With `m06view` the camera leaves the painted viewpoint sooner, so the clean hold lasts only ~1 u (still clean, no artefacts).
* Not changed: from +2 u both look the same (centred ring tunnel, big foam walls; a pale streak on the right crest for a moment).

# Screen 06 — round 23 progress (worktree `/home/user/wt/s06`, LOCAL branch `claude/rainbow-s06-match-c24`, port 5276)

## (r23) WHERE I STOPPED / NEXT — STOPPED after 3 finished steps (final report sent to the lead, ~09:55 UTC)
* Step 1 `&m06fcl=1` (big white foam walls → low separate puffy heaps): **GOOD IMPROVEMENT** (moderate). Candidate for K6.
* Step 2 `&m06view=1&m06vs=0` (ring tunnel held off-centre right through the first second): **GOOD IMPROVEMENT** as a
  camera-framing TEST — the USER decides (show the clip); never in the kept set without the user's OK. No code change.
* Step 3 `&m06rip=1` (the painted ripple rings round Benny carried with him): **GOOD IMPROVEMENT (small)** — visible round
  Benny in the first ~0.7 s and up close; subtle later. Candidate for K6 (lead / user decide).
* Nothing committed / pushed from the worktree (lead autosave snapshots it). Uncommitted code: `src/world/match06.ts`
  (step 3), `src/game/Game.ts` (1 line, step 3); QA tools `tools/match06/r23_*.mjs`. Container restart ~09:40 UTC: worktree,
  proofs and all 5 clips intact (re-verified 09:49: `tsc` clean, step 3 `code.patch` == live diff, references 13/13 OK).
* Best combined query so far (each part still needs the lead's / user's OK):
  `match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1&m06gold=1&m06fclu=1&m06st=1&m06fcl=1&m06view=1&m06vs=0&m06rip=1`
* NEXT (most visible remaining differences, by eye): (1) after the crest top (~47 % on) the rings still drift back into a
  target near the top centre — the game river turns ~18° right / 12° down off the straight painted tunnel; framing cannot hold
  it, bend is banned, so only a route or approved-artwork decision by the user could; (2) at the crest top the river beyond is
  hidden for a moment with `m06vs=0`; (3) big near foam clouds in the lower right mid-stage and when steering hard right
  (they partly cover Benny); (4) hard steering early still cuts Benny at the screen edge (as K6); (5) coins along the crest.
* Lead note (all workers): worktrees whose `node_modules` is a symlink to `/home/user/rainbow-/node_modules` get the HUD fonts
  refused by Vite (fallback font in every shot). `tools/match06/r23_vite.mjs` (fs.allow incl. the real node_modules) fixes it;
  the river shader's wall clock also makes per-run water differ — pin `performance.now` around the draw for BEFORE / NEW.

K6 = `match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1&m06gold=1&m06fclu=1`
r23 BEFORE base = K6 + `&m06st=1` (r22 step 2, small GOOD IMPROVEMENT, lead review pending; not yet in K6).

## Step 1 — `&m06fcl=1`: big white foam walls → low separate puffy foam heaps (r22 step 3 code, finished + proved in r23)
* Code: unchanged from r22 (`src/world/match06.ts`, `const FCL = …`, built at `f1cbe0f`), `code.patch` = that diff.
  `npx tsc --noEmit` clean. Defaults `m06fclp=3.5` (heap period, u), `m06fclk=0.65` (kept share), `m06fclw=0.7` (band, u).
* BEFORE = K6 + `&m06st=1`; NEW = BEFORE + `&m06fcl=1`. Also with `&m06view=1` (`with_m06view/`).
  NEW query: `match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1&m06gold=1&m06fclu=1&m06st=1&m06fcl=1`
* Folder `qa/match/06/r23/step1_m06fcl/`: `1_APPROVED.png`, `BEFORE/`, `NEW/`, `with_m06view/{BEFORE,NEW}/` (separate full-size
  864×1536 shots of the real game: start, early 12 / 22 %, middle 35 / 47 %, late 60 %, end 85 %, hard left / right at 35 %,
  left / right early at 15 %; `shots.json` = s / lat / coins per shot), swim clips `swim_06_BEFORE.mp4`, `swim_06_NEW.mp4`,
  `with_m06view/swim_06_NEW.mp4` (4.8 s uninterrupted real gameplay from the 06 checkpoint into 07: straight, hard left, hard
  right, straight), `gameplay_NEW*.json`, `continuity.log`, `code.patch`.
* Tools (r23, QA only): `tools/match06/r23_audit.mjs` (= lead audit tool) and `r23_swim.mjs` (= pinned swim clip) with a Vite
  server that may serve the symlinked `node_modules` — without it the worktree's HUD falls back to a plain font.
* Start view: BEFORE vs NEW `a_start` **0 px** differ (pixeldiff 0.1), also with `m06view` (0 px).
* Gameplay `scripts/gameplay-test.mjs`: NEW **8/8**, coins 1,330 → 2,240 = **91**; NEW + `m06view` **8/8**, **91**. No camera
  cut, no teleport. `npm run test:continuity` OK (05→06 gap 0, 06→07 gap 0).

### Verdict — GOOD IMPROVEMENT (moderate; the banks while swimming)
* BEFORE: along the far bank of the descending river a tall, unbroken white foam wall builds up (end, late, middle), and on the
  right crest a white foam cliff stands behind Benny.
* NEW: the same foam becomes low, separate puffy heaps hugging the water's edge with blue water and purple wall between them —
  much closer to the painting's soft foam clouds and to "clean water, no giant foam walls"; the lower corners keep a foam cloud.
* Not changed / still different: heaps along the far bank follow a slightly regular rhythm; when Benny steers hard right he still
  rides into foam heaps that partly cover him; the ring tunnel still turns into a bullseye (step 2).

## Step 2 — the off-centre ring tunnel while swimming (diagnosis, ~04:52 UTC)
* Probe `tools/match06/r23_tunprobe.mjs` (where camera / Benny / river sit in the straight `m06tun` tunnel, and where the tunnel's
  vanishing point = the centre of the gold rings lands on screen). Logs: `qa/match/06/r23/step2_m06vs0/probe/tp_{K6,VIEW,VIEWNR}.txt`.
* Why the bullseye: the painted tunnel is straight (its axis = the painted vanishing-point ray). The game river first crests
  slightly LEFT, then after the crest top (≈ +9 u) turns ~18° RIGHT and drops ~12° below that axis, ending near the lower-right
  tunnel wall. The ring centre on screen depends only on where the camera LOOKS relative to the tunnel. K6's camera follows the
  river, so the ring centre slides from the painted spot (660, 632) to the upper LEFT (253, 252) by +20 u = the bullseye.
* Scenery cannot hold it: re-aiming the straight tunnel moves the painted ring centre at the start (snap at the hand-over) and
  brings back twisted ring bands (r7); bending it = `m06bend` (rejected twice, never repeated); moving the river would change
  the route / 07. So the lever is the user-approved framing TEST.
* r22 `m06view` (default): the camera climbs up to 7 u above the water over the crest ("rise", `m06vs=1`), which tips the
  view down and throws the ring centre to the TOP of the screen (y ≈ 30–100) — that is why it still read as a bullseye.
* Candidate `&m06view=1&m06vs=0` (no climb): the ring centre stays at the painted spot (≈ 655, 645) for the first ~12 u
  (~0.9 s, up to the crest top), then drifts slowly to (445, 338) at +26 u before the hand-over to the route view; Benny stays
  in the lower middle (x 406–462, y 845–1006).

### Step 2 result — `&m06view=1&m06vs=0` (camera-framing TEST, user-approved test only; NOT in the kept set)
* Switch: the r21 test `&m06view=1` with its existing tunable `&m06vs=0` (no climb over the crest). No code change
  (`step2_m06vs0/code.patch` = note). Partial values `m06vs=0.3 / 0.5` were probed: both still climb to ~7 u mid-stage
  (`probe/tp_VS03.txt`, `tp_VS05.txt`) — not useful.
* BEFORE = K6 + `m06st=1` + `m06fcl=1` = `step1_m06fcl/NEW/` (same query, same shots); r22 `m06view` for reference =
  `step1_m06fcl/with_m06view/NEW/`. NEW = BEFORE + `&m06view=1&m06vs=0` → `step2_m06vs0/NEW/` (11 full-size shots, same names).
  NEW query: `match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1&m06gold=1&m06fclu=1&m06st=1&m06fcl=1&m06view=1&m06vs=0`
* Start view 0 px differ (pixeldiff 0.1). Gameplay **8/8**, coins 1,330 → 2,240 = **91**, no camera cut
  (`step2_m06vs0/gameplay_NEW.json`). Continuity unchanged (camera only; `npm run test:continuity` OK in step 1).
* Clips (4.8 s uninterrupted real gameplay from the 06 checkpoint into 07: straight, hard left, hard right, straight):
  BEFORE = `step1_m06fcl/swim_06_NEW.mp4`, r22 `m06view` = `step1_m06fcl/with_m06view/swim_06_NEW.mp4`, NEW =
  `step2_m06vs0/swim_06_NEW.mp4`. In the clip: 0.4 s / 0.9 s in, NEW keeps the tunnel off-centre right with big ring arcs
  sweeping past where BEFORE already shows a centred target; ~1.5 s in NEW's target sits top-centre-right (BEFORE upper
  left) with a big near foam cloud lower right; from the hard-left section on (~2.3 s) both are the same, and the 07
  entry is identical (06→07 join unchanged).

#### Verdict — GOOD IMPROVEMENT (as a framing test; the first second of the swim and the middle)
* BEFORE: within the first second the gold rings swing up into a centred target at the top of the screen; by the middle it
  sits in the upper LEFT corner. r22 `m06view` keeps it right but throws it to the very top (camera climbs ~7 u).
* NEW: from the start through the crest top (early 12 / 22 %, middle 35 %) the ring tunnel stays where it is painted — off-
  centre RIGHT at mid-height, rings telescoping away to the right, the purple drum wall with the gold paddle lids upper left,
  Benny low in the middle; steering hard left / right keeps that layout (tunnel right, coin line visible).
* Still different: at the crest top the river beyond the crest is hidden for a moment (only the coin line on the right shows
  the way); from ~47 % on the rings drift back toward a target near the top centre (the game river turns right off the
  painted tunnel there), and the end (85 %) is unchanged; steering hard early still cuts Benny at the screen edge (as BEFORE).

## Step 3 — `&m06rip=1`: the painted ripple rings round Benny, carried with him (built ~05:00 UTC)
* Why: in the painting Benny sits in white-cyan concentric ripple rings with a lacy splash collar and bright streaks behind
  him. While swimming the game shows none of it (the projection pins the painted rings to the checkpoint; the flowing river
  material has no rings; only the game's white spray remains).
* How (no new asset, no paid job): at load, the approved plate (`plate06_hybrid.png`, the user's pixels) is re-sampled in the
  river's own coordinates round the approved Benny (lateral ±1.45 u, 2.4 u behind to 1.3 u ahead, exactly the river surface
  the projector painted at the checkpoint); where the painted Benny's body was filled (`plate06_fillmask.png`, dilated) it is
  transparent; the painted soap bubbles next to the rings are cut out (5 circles) and the foam heaps stay outside the width, so
  nothing looks glued to Benny. This decal rides with Benny on the river (lateral + distance), water only, soft rim, two copies
  drifting slowly outward (cross-faded) so the rings spread; it fades in only once the camera has left the approved viewpoint
  (start view unchanged). Tunables: `m06ripl` (half width), `m06ripd=a,b` (behind, ahead), `m06ripk` (strength),
  `m06ripx` (outward drift, 0 = still). Debug dump: `tools/match06/r23_ripdump.mjs`.
* BEFORE = step 2 NEW (`…&m06view=1&m06vs=0`); NEW = BEFORE + `&m06rip=1`.

### Step 3 result — `&m06rip=1`
* NEW query: `match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1&m06gold=1&m06fclu=1&m06st=1&m06fcl=1&m06view=1&m06vs=0&m06rip=1`
* Folder `qa/match/06/r23/step3_m06rip/`: `1_APPROVED.png`, `BEFORE/` + `NEW/` (11 separate full-size shots each, same names
  as steps 1–2, BOTH rendered with the water clock pinned so only the change shows), `swim_06_NEW.mp4` (4.8 s, 06 → 07;
  its BEFORE = `step2_m06vs0/swim_06_NEW.mp4`, both clips pin the clock per frame), `gameplay_NEW.json`, `continuity.log`,
  `code.patch` (= the live worktree diff of `src/world/match06.ts` + `src/game/Game.ts`).
* Fixed during the step: the first decal ended in a straight seam where the water behind Benny leaves the approved picture's
  bottom edge (visible at y ≈ 1185 early); now faded toward the picture's edges (260 px) — no seam in the final shots / clip.
* Start view: 5 px differ (pixeldiff 0.1), all on the HUD (pause-button rim, heart outline: capture noise); the scenery is
  unchanged (the rings fade in only once the camera has left the approved viewpoint).
* Where it changes the picture (pinned clock, > 30 levels): only round Benny — early 12 % x 202–669 / y 872–1148, 22 %
  x 211–676 / y 966–1099; middle / late small bands under him; hard right 0 px (Benny on the foam bank: water only).
* Gameplay **8/8**, coins 1,330 → 2,240 = **91**, no camera cut, no teleport. `npm run test:continuity` OK (05→06 / 06→07 gap 0).
  `npx tsc --noEmit` clean. Default build unchanged (all behind `?match06=1&m06rip=1`).

#### Verdict — GOOD IMPROVEMENT (small; round Benny, mostly in the first second)
* BEFORE: while swimming Benny only throws white spray; the painted ripple rings round him are gone as soon as he moves.
* NEW: Benny sits in the painting's own ripple — a lacy white-cyan collar round his base, a deeper-blue ring band and bright
  streaks fanning out behind him, carried with him and spreading slowly; no glued bubbles or foam, no seam, water only.
* Still different: the low camera flattens the rings, so they read fainter than the painted white rings (more a collar +
  darker band than three bright rings); from the crest top on and when steering hard they are hard to see.

---
## (r22, copied from `/home/user/wt/s06/qa/match/06/r22/PROGRESS.md`) WHERE I STOPPED / NEXT
* Step 1 (`&m06view=1` proof) — DONE, see below. Verdict: NOT YET PROVEN (small gain, main goal not reached). Waiting for the user
  to judge it from gameplay; NOT in the kept set.
* Step 2 (`&m06st=1`, rank-3 start-view flash) — DONE: GOOD IMPROVEMENT (small; first ~1.3 u of the swim). Candidate for the
  kept set (lead / user decide).
* Next: task 3 (big white foam walls → low puffy foam clouds in the lower corners), with and without `m06view`.
* (lead, r23 launch) step 3 `m06fcl` was BUILT (code in `src/world/match06.ts`) with BEFORE / NEW pictures, a
  `rejected_wide_band_fclw1.0/` try, `swim_06_NEW.mp4`, `with_m06view/` and `gameplay.txt` in `qa/match/06/r22/step3_m06fcl/`,
  but no verdict was written. Gameplay there: `K6&m06fcl=1` and `K6&m06view=1&m06fcl=1` 8/8, 91 coins; continuity 05→06 / 06→07 gap 0.

r22 verdicts in short: step 1 `&m06view=1` NOT YET PROVEN (Benny lower / smaller like the painting, stays in frame when steering;
rings still turn into a centred bullseye within the first second; more foam walls visible). Step 2 `&m06st=1` GOOD IMPROVEMENT
(small: clean painted start up to ~+1.3 u, no ghost / see-through arcs / double exposure).

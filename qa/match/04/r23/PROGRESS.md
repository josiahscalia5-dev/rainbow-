# Screen 04 — round 23 (new account, lead session branch `claude/rainbow-r22-restore-ut3m39`) — lead log

## (r24) WHERE I STOPPED / NEXT — s04 specialist (relaunched r24, worktree `/home/user/wt/s04`, LOCAL branch `claude/rainbow-s04-match-c25`)
* Resumed from the 10:25 snapshot (no patch re-applied). Recreated worktree verified: K23-S2 and K23-1 rendered with the final code
  == the r23 pictures, 0 px over the WHOLE frame in all 7 shots (`s3_glossy/K23-S2_with_new_code/`, `s3_glossy/K23-1_with_new_code/`).
* Step 2 DONE — GOOD IMPROVEMENT (clip frames step 1 vs step 2 compared in r24, see "Step 2" below). Candidate **K23-S2**.
* Step 3 DONE — glossy clean lane water, `&m04lgs=1` + tuning (`s3_glossy/`, see "Step 3" below) — GOOD IMPROVEMENT. New candidate
  **K23-S3** = `s3_glossy/QUERY_K23-S3.txt`. Up to 3 steps done -> STOPPED, reported to the lead.
* NEXT (not started): near-camera glints shorter (painted short crescents), richer cyan/pink ribbon contrast round Benny, far foam
  rows as cloud banks, then projection of the three accepted views (`&m04mp=1`, brief task 3).
* Tool note: `s04_tools/clip.sh` temp folder now `$S04_SCRATCH` (default = the r24 scratchpad; the r23 one is gone). Under heavy
  machine load a shot can be taken before the foam meshes / tunnel finish loading (seen twice in scratch variants: no foam, black
  tunnel corner) — every proof shot here was checked by eye for complete foam + tunnel.

## (r23) WHERE I STOPPED / NEXT
* Candidate **K23-1** = `QUERY_K23-1.txt` = K22-2 with `m04wup=0` (no pink water climbing the gold walls) + `m04nwhirl=0&m04nband=0`
  (no pink swirl wrapped round Benny) + `m04lane2=0.25` (calmer lane water). Lead verdict: GOOD IMPROVEMENT on the user's
  two complaints (pink walls by the gold, too much pink). Shown to the user ~04:35 UTC. Waiting for the user's eye.
* Next (s04 specialist, `docs/briefs/2026-11-20-r23/LAUNCH_S04_R23.md`): Benny going naturally THROUGH the five arrows (chevrons
  clearly ahead of him, not at hat height), the hard straight lilac edge where water meets gold → low bubbly foam bank, glossy long
  white streaks instead of the frosted ripple, then projection of the three approved generated views.

## (r23 s04) WHERE I STOPPED / NEXT
* Specialist (washer-environment-modeler, worktree `/home/user/wt/s04`, local branch `claude/rainbow-s04-match-c24`, port 5273-5275,
  brief `docs/briefs/2026-11-20-r23/LAUNCH_S04_R23.md`). Uncommitted edits only.
* Step 0 DONE: BEFORE = K23-1 re-rendered with the pinned audit -> `s04_BEFORE_K23-1/` == lead `lead_t2/C2/` 0 px in all 7 shots.
* Step 1 DONE — GOOD IMPROVEMENT (details below, "s04 Step 1"). New candidate **K23-S1** = `s1_arrows/QUERY_K23-S1.txt`.
* Step 2 DONE (finished in r24; `s2_edge/`, switches only, no new code; query `s2_edge/QUERY_K23-S2.txt`): lower, cleaner pink edges
  (`m04ry=0.45`) + continuous LOW foam banks on both water edges down the tunnel (`m04bbd` window 30-40 u, on the edge, sunk,
  denser) + softer lilac fringe. 7-shot NEW audit (start 0 px), clip, gameplay all done. Step 3 = glossy lane water: see r24 block.
* User confirmation ~09:55 UTC (via coordinator): "continue with the cleaner, lower pink edges. Keep the gold visible, the blue
  water clear, and show Benny travelling naturally through all five arrows." Never pink walls / wide pink.
* QA tools (mine): `s04_tools/` (pinned audit / clip copies with a 300 s screenshot timeout, probes, variant runner `variant.sh`,
  `clip.sh` = 20 fps real game speed + 10 fps half speed; one clip frame = 0.05 s of game time).

## (r23 s04) Step 1 — Benny swims down THROUGH the five arrows; Benny IN the water — `s1_arrows/` — GOOD IMPROVEMENT
* Switch (`s1_arrows/SWITCH.txt`, replaced in place on K23-1 with `setq.mjs`): `m04a3sc=1&m04a3sy=2.1&m04a3sr=0.9&m04a3s0=-0.005&
  m04a3s1=0.03&m04a3sx=0.02` (chevrons show only where they lie ABOVE his pompom on screen; calibrated: his pompom top = 2.1 u over
  his root), `m04a3d=0.6&m04a3t=0.4&m04a3w=1.5&m04a3k=60` (chunkier, wider bars), `m04a3p=6.5&m04a3f0=50&m04a3f1=58` (five spaced
  down the lane), NEW `m04a3fl=26` (far chevrons lean flatter, like arrows painted ON the water: no ladder near the far end), NEW
  `m04wl=1&m04wly=0.4&m04wlr=0.66&m04wlo=1.1&m04wle=1.65&m04wlz=1.6` (a soft raised water patch round him, depth-tested, so the
  water covers his round bottom like real water, with a neat white foam lace ring at his waterline; Benny / camera untouched).
* Why: measured lane perspective — the camera sits ~3.6 u over the water 8 u behind him, so his body covers the lane from 0 to ~14 u
  ahead; only the band between his pompom top (y≈900) and the vanishing point (y≈694) is free. The chevrons 3–14 u ahead stood
  behind his hat with their arm ends poking out beside the brim.
* WHAT LOOKS CLOSER (NEW `s1_arrows/NEW/` vs BEFORE `s04_BEFORE_K23-1/`): in every swim shot (early / middle / late / end / hard
  left / hard right) the glowing white-cyan chevrons lie AHEAD of him down the blue lane, above / beyond his pompom like the
  painting (5 in view: 4–5 whole + 1 fading in far away or out as he reaches it), nothing round his hat; in the clip they come
  toward him and vanish as he swims through them. His round bottom now sits IN the water with a white lace ring (was perched on it).
* STILL DIFFERENT: the chevrons are smaller than painted (the painting's camera looks down from higher; camera not authorized);
  the hard straight lilac water/gold edge, frosted ripple water (step 2).
* Proof: start view 0 px (rows 180–1536); K23-1 rendered with the new code == BEFORE 0 px in all 7 shots
  (`K23-1_with_new_code/`); gameplay `gameplay.json` 8/8 pass, 91 coins, 1,330 → 2,240; `npx tsc --noEmit` OK (`tsc.log`);
  chevron count probe (5 in view at every shot). APPROVED: `APPROVED/1_APPROVED_original_start_early.png`, ACCEPTED GENERATED
  views (labelled, not the original) `APPROVED/2_ACCEPTED_GENERATED_view_{c_middle,d_late,e_end}.png`.
* Clips (pinned clock, uninterrupted through all of 04 into 05, straight / left / right / straight, 2.9 s game time):
  `swim04_BEFORE_K23-1_realspeed.mp4` / `swim04_NEW_K23-S1_realspeed.mp4` (REAL game speed, 20 fps) and `*_halfspeed_exact.mp4`
  (half speed, 10 fps); full-size NEW frames `swim04_NEW_K23-S1_frames/`. Code: `code.patch` (full worktree diff),
  `step1_only.patch` (this step's hunks on top of the r22 K22-2 code).
* Mobile cost: no new textures; one 96-segment disc with a small noise shader under Benny (~300 × 150 px of screen), two point
  projections per chevron per frame on the CPU. Negligible.

## (r23 s04) Step 2 — cleaner, LOWER pink edges with a low foam bank where the water meets the gold — `s2_edge/` — GOOD IMPROVEMENT
* Switch on top of K23-S1 (`s2_edge/SWITCH.txt`, replaced in place): `m04ry=0.45` (the water's sides climb 0.45 u instead of 0.8:
  lower, narrower pink side water, the gold comes further down), `m04bbdf=30&m04bbdf1=40&m04bbdx=-0.25&m04bbdk=0.3&m04bbd1=1.05&
  m04bbdg=0.45` (the existing glossy pearly foam heaps line BOTH water edges down the tunnel, ON the water/gold edge, low, a bit
  denser and puffier far away — was only a 9–12 u window), `m04edges=0.3&m04sbf=0` (softer lilac fringe). No new code.
  Candidate **K23-S2** = `s2_edge/QUERY_K23-S2.txt`.
* WHAT LOOKS CLOSER (NEW `s2_edge/NEW/` vs step 1 `s1_arrows/NEW/` and BEFORE `s04_BEFORE_K23-1/`; compare the ACCEPTED GENERATED
  views): low white bubbly foam banks now run along both water edges from Benny down to the chevrons, like the accepted views; the
  gold rings come down to them; the pink at the sides is lower and thinner (mostly blue water, a little pink on the sides — the
  user's words); the straight lilac top line is mostly covered by the foam. Early view especially close to the painting.
* STILL DIFFERENT: the far foam rows are smaller, more separate bubbles than the painted cloud banks; near the end (e_end) the
  banks thin out where the far telescope begins; a little lilac still shows on the upper side slope; lane water still a frosted
  ripple (step 3).
* Rejected tries (`scratchpad`, not kept): E1/E2 (banks without lowering the sides: banks sit on a tall pink slope), E3 (lower
  sides only: lilac line still bare), E5 (fringe softening alone changes almost nothing).
* Proof: start view 0 px vs BEFORE; gameplay `gameplay.json` 8/8, 91 coins, 1,330 → 2,240; code unchanged since step 1
  (`npx tsc --noEmit` OK, `s1_arrows/code.patch`).
* Mobile cost: more instanced foam heaps visible at once (same 4 Blender heap meshes, ~5k triangles each, instanced; the far window
  now 30–40 u instead of 9–12 u) — the main cost of this step; worth checking on the Android build.

## User feedback driving this round (verbatim, 2026-11-20)
* ~03:58 (r22): "I don't want the water to look messy. I want it to look very clean ... like the original approved screen through
  the 5 arrows ... he's going naturally." Pink on the left and right "near the gold part" inside the tunnel.
* ~04:20 (r23): "my screen has like the pink around it, around the blue water. I don't want all that pink stuff ... it's mostly blue
  water, and there's a little bit pink on the sides. I think I have too much pink, like wet or water on the left and right side."

## Step 1 — pink walls off (`lead_t1/`)
BEFORE = K22-2 (`lead_t1/QUERY_BEFORE.txt`), NEW = K22-2 with `m04wup=0` (`lead_t1/QUERY_NEW.txt`). Pinned-clock audit (7 shots).
The tall wavy magenta walls are gone in every shot; the gold rings reach the water. Start view unchanged (0 px > 25 levels).
Left: a hard straight lilac edge where the water meets the gold; still a lot of pink ON the water near the camera.

## Step 2 — less pink on the water (`lead_t2/`)
* METHOD TRAP (fixed): the game reads the FIRST occurrence of a URL switch, and K22-2 already contains `m04lanew`, `m04nwhirl`,
  `m04pink` ... — appended overrides were ignored in the first sweep (P1–P3, Q1–Q3, deleted). Overrides must REPLACE the value in
  place (`URLSearchParams.set`; scratch helper copied to `tools/lead23/setq.mjs`).
* Diagnostic (c_middle): whirl/band round Benny off = mostly blue + thin pink bands at the edges (closest to the user's words);
  all bands off / lane 10 u = all blue (too far; the painting has pink side swirls).
* C1 = + `m04nwhirl=0&m04nband=0`; **C2 = C1 + `m04lane2=0.25`** (slightly calmer lane) → K23-1.
* Pictures `lead_t2/C2/` (7 shots), BEFORE `lead_t1/BEFORE/`, APPROVED `references/04_through_the_five_arrows.png`.
* Clips (pinned clock, real speed 2.4 s + half speed): `lead_t2/swim04_BEFORE_K22-2*.mp4`, `lead_t2/swim04_NEW_K23-1*.mp4`.
* Gameplay `gameplay_K23-1.json`: 8/8, 91 coins, 1,330 → 2,240. Start view 0 px > 25 levels vs BEFORE.
* Verdict GOOD IMPROVEMENT (pink walls gone, mostly blue water, thin pink edges, gold clean to the water). NOT yet like the painting:
  chevrons straddle Benny's hat (he does not read as swimming through the arrows), hard straight water/gold edge, frosted ripple
  texture instead of long glossy streaks, foam banks small.

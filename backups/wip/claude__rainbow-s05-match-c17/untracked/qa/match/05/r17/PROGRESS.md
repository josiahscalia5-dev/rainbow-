# Screen 05 — round 17 (account 17) progress log

Worker: water-fx-specialist on branch `claude/rainbow-s05-match-c17` (worktree `/home/user/wt/s05`, dev-server port 5275).
Started from `34aadd11` (= r14 step 3) + the account-16 worker's UNFINISHED edits (task 1, `&m05trans=1`), restored uncommitted.
Binding: `docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md` (VISUALS ONLY), `docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md`,
launch brief `docs/briefs/2026-11-18-r15/S05_LAUNCH.md` read with `-c17` / `r17`, resume notes `docs/briefs/2026-11-18-r17/RESUME_R17.md`.
History: `qa/match/05/r14/PROGRESS.md` (steps 1–3), `qa/match/05/r13/PROGRESS.md` (rejected m05slot / m05lump: never repeat),
`qa/match/05/r16/PROGRESS.md` (header only; account 16 was cut off before logging), partial shots in `qa/match/05/r15/step1_trans/`.

Kept start set (= r14 step 3, `qa/match/05/r16/KEPT_START.txt`):
`?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1&m05flat=1&m05cloud=1&m05wtile=1&m05end=1&m05fmag=1&m05fpaint=1&m05fcloud=1&m05fcoin=1&m05join=1&m05frim=1&m05vee2=1&m05bank=1`

Positions: `tN` / `xN` = Benny at N % of Stage 05 (x98p5 = 98.5 %); `L` / `R` = steering hard left / right on the way there.
Stage 05 ends (Benny enters 06, HUD turns to 06) between x98p5 and x99.

## Step 1 — `&m05trans=1` (task 1: the 05 → 06 hand-over; account-15/16 unfinished edit, finished here) — GOOD IMPROVEMENT, kept
* Kept query: `<start set>&m05trans=1` =
  `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1&m05flat=1&m05cloud=1&m05wtile=1&m05end=1&m05fmag=1&m05fpaint=1&m05fcloud=1&m05fcoin=1&m05join=1&m05frim=1&m05vee2=1&m05bank=1&m05trans=1`
* Method (unchanged from the account-15/16 edit): the 05 far scenery block (painted 05 tunnel, far gold rings, far river, warm
  throat, far foam clouds) stays whole through all of 05 and is removed in one step at the moment Benny crosses into 06 (the HUD
  title turns to 06), driven by Benny's course position instead of the eye → seam distance; its state is also applied before the
  draw (no one-frame lag); the 06 coins stop being drawn on the far 05 river from that moment (`src/gameplay/coins.ts`, one
  DISPLAY-only condition behind `M05FCOIN` + `popS`, which is Infinity without the switch). 06 itself is not changed.
* Round-17 fix before judging: with the switch the locked approved view differed by 1,009 px (a few small 06 coins drawn near the
  warm throat): `goto('05')` settles the camera springs while Benny stays on the checkpoint, the new pre-draw call saw the
  half-settled camera and marked the block live for the coins. The pre-draw call now runs only once Benny has left the checkpoint
  (`src/vfx/index.ts`). Locked view after the fix: 0 px, the PNG is byte-identical to the start set's
  (`node scripts/capture.mjs 05 --q=<start set>` vs `--q=<start set>&m05trans=1`).
* WHAT LOOKS CLOSER (BEFORE = start set, NEW = + m05trans, same positions):
  - x97 (3 % before the end of 05): BEFORE the far tunnel had swollen into a smeared purple ring stack round a flat pink disc
    (the 06 floor seen through it) and a straight hard line crossed the water just below Benny. NEW: the painted 05 tunnel
    continues: purple slotted walls, the telescope of thin gold rings, the warm light at the end, foam banks on both sides,
    the coin line running into the light; no disc, no line.
  - t98 (2 % before the end): BEFORE four loose copper hoops floated in mid-air over the rising 06 crest with a stray foam
    streak behind Benny's hat. NEW: still the 05 tunnel with its rings and throat.
  - x97R (hard right near the end): BEFORE the screen was the pink 06 hall with copper hoops and a pale foam column in the
    middle. NEW: the purple 05 tunnel with gold rings, the throat, the cyan / pink river and foam banks.
  - x98p5 (last frame still in 05): BEFORE already showed the 06 crest; NEW still the 05 tunnel.
  - x99 (first frame in 06): same 06 view as before, without the stray foam streak behind Benny's hat; the three 06 coins sit at
    their own place on the crest.
  - t95, x97L: no visible change in kind (the block was still whole there before too).
* Still wrong: the hand-over itself is a hard cut (05 tunnel one frame, 06 crest the next) — but it now happens exactly when the
  HUD changes stage, which reads as the start of the next screen; near the end of 05 the walls close to the camera are soft /
  radially smeared and the near water is a plain cyan sheet (not this step).
* Gameplay (`node scripts/gameplay-test.mjs --q=<kept query>`): 8/8 checks, 91 coins collected, 1,330 → 2,240.
* APPROVED: `/home/user/wt/s05/qa/match/05/r17/step1_trans/1_APPROVED.png`
* BEFORE (start set): `/home/user/wt/s05/qa/match/05/r17/step1_trans/before/` (t95_through_screen, x97, t98_end, x98p5, x99, x97L, x97R)
* NEW (+`&m05trans=1`): `/home/user/wt/s05/qa/match/05/r17/step1_trans/new/` (same names)
* Files: `src/world/match05far.ts` (M05TRANS, popS), `src/world/environment.ts`, `src/vfx/clip05.ts` (m05rideS, m05farPre),
  `src/vfx/index.ts`, `src/gameplay/coins.ts` (display only), `tools/match05/r8_shots.mjs` (free x-positions, PRE_JS),
  `tools/match05/r15_probe.mjs` (read-only layer probe).

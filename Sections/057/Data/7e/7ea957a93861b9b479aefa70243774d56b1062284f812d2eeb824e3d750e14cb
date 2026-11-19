# Screen 08 · Final Spin Chamber — round 17 progress (branch `claude/rainbow-s08-scenery-c17`)

Authority: `references/08_final_spin_chamber.png`. Brief: `docs/briefs/2026-11-18-r15/S08_LAUNCH.md` (read `-c15` as `-c17`, log
folder `r17`) + `docs/briefs/2026-11-18-r17/RESUME_R17.md` section s08 + binding user order
`docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md` (VISUALS ONLY). History: `qa/match/08/r16/PROGRESS.md`, `r15/PROGRESS.md`.
Start = `6da32d57` (r16 tip) + account-16 unfinished edits restored uncommitted (`src/world/match08.ts` `m08vh` + QA `m08dbgvk`,
`tools/match08/shots08.mjs` screenshot timeout, `qa/match/08/r16/step2_m08vh/new_raw/` f20 + motion.json).

Kept set at start: `K15 = K14&m08sr=1` =
`match08=1&coins08px=1&m08bw=1&m08fill=1&m08arch=1&m08swim=1&m08seam=1&m08sill=1&m08towel=1&m08far=1&m08coinv=1&m08ceil=1&m08near=1&m08cup=1&m08rw=1&m08drum=1&m08ring=1&m08cupg=1&m08bore=1&m08flange=1&m08cupw=1&m08nq=1&m08sr=1`
Rejected, never repeat: `m08urcup` (invented upper-right cup front).

* 2026-11-18 ~20:47 UTC round 17 started (washer-environment-modeler, account 17). The unfinished edit IS r16 step 2 `&m08vh=1`
  (one line in the wall / prop shader: `vs = max(vs, vis)` — the 5 x 5 soft hand-over may only LOWER visibility where the single
  tap already says hidden, never fade a seen point) + QA-only `&m08dbgvk=1|2`. Finishing it: re-render NEW, compare, decide.

## Step 1 — `&m08vh=1` (r16 step 2 finished: soft visibility hand-over only on the HIDDEN side of a depth edge) — KEPT (GOOD IMPROVEMENT, small)
Kept query: `K16 = K15&m08vh=1`
* What changed (`src/world/match08.ts`, all projected scenery, only with `&m08vh=1`): off the approved viewpoint the projector
  visibility test averages 5 x 5 depth taps for a soft hand-over to the fill. That average also faded points the approved view
  DID see when they lay next to a nearer silhouette (the cups, the platform rim / legs, the towel, the foam bank): those points
  were washed toward the fill tile -> pale glowing fringes and pale boxes beside every silhouette while swimming. Now a point the
  approved view saw keeps its own painted pixel; the soft hand-over only happens on the hidden side.
* Approved start view: scenery pixel-identical (0 px in rows 180-1536). Coins: same positions in every shot (only scenery
  pixels along silhouettes differ, ~0.5-0.75 % of the frame). f20 (stage 09): 0 px.
* What looks closer: forward 10 u — the pale whitish fringe under the upper-left cup's rim is gone (crisp purple wall under
  it); the washed-out pale box over the foam bank left of the river (below the platform's left end) is gone, foam and floor are
  crisp painted pixels; the pale ghost round the splash under the platform's right end is crisper. Hard left / right — the pale
  glow along the platform rim and legs is gone.
* Still wrong (not this step): the hard-edged rectangle of window pixels round the towel at hard left / right (towel double
  exposure, next brief task `m08towelm`), rectangular blocks at the platform ends at hard steer, the torn white "lightning"
  glints in the near water, a curved hand-over edge on the floor behind the lower-right cup.
* Verdict: GOOD IMPROVEMENT (small).
* Pictures (separate, full size): `/home/user/wt/s08/qa/match/08/r17/step1_m08vh/1_APPROVED.png`, `2_BEFORE_<shot>.png` (K15),
  `3_NEW_<shot>.png` (K16), all 12 shots (best: `f10_forward10u`, `s_left_hard`, `s_right_hard`). `npx tsc` clean.
  (The account-16 raw f20 render + motion.json were moved here as `3_NEW_f20_forward20u.png` / `3_NEW_motion_f20.json`.)

## Step 2 — `&m08gl=1` (near-water glints with their painted glow) — UNFINISHED, NOT YET PROVEN (paused ~21:10 UTC)
Query under test: `K16&m08gl=1` (only with `m08near` + `m08nq`; default build and K16 unchanged).
* Problem: the near water below Benny shows hard-edged white "lightning" cut-outs lying ~30 deg across the streaks (the
  nq08 tile's glints = only the bright CORES of the painted glints, cut from the UNRECTIFIED band). Painted: white cores
  inside a soft bright-CYAN glow, stretched along the curved glossy streaks.
* Done: `tools/match08/nq08.py` v7 (opt-in `NQ08_GLOW=1`; without it the tool still reproduces `nq08.png` byte-identical,
  checked): the same 7 painted glints, carried into the RECTIFIED band (they lie along the tile's straight streaks), cut with
  their glow (core + 16 texels, feathered), alpha = excess over the satin in green and in luminance (the glow is cyan, so a
  luminance excess alone dropped it). Output `assets/textures/match08/nq08g.png|json` (built with
  `NQ08_GLOW=1 python3 -I tools/match08/nq08.py assets/textures/match08/nq08g.png assets/textures/match08/nq08g.json`),
  loaded by `&m08gl=1` in `src/world/match08.ts` instead of nq08. `npx tsc` clean.
* Seen so far (raw NEW renders, deterministic, K16&m08gl=1: `qa/match/08/r17/step2_m08gl_UNFINISHED/new_raw/`, a00 f03 f06
  f10 s_left_steer s_right_steer s_left_hard s_right_hard; BEFORE = `qa/match/08/r17/step1_m08vh/3_NEW_<shot>.png`):
  approved start view 0 px (rows 180-1536). At f06 / s_left_hard / s_right_hard the tile glints now run along the streaks
  with a cyan glow halo instead of torn diagonal white shards — looks closer by eye (likely a small GOOD IMPROVEMENT), but the
  full 12-shot set (t33 / t66 / t95 / f20 missing) and the side-by-side verdict were NOT finished. Remaining look issues:
  the glow halos show slightly squarish cyan patches at their outer edge; the jagged glints directly below Benny's splash
  (y ~1150-1300 at f06) come from the PROJECTED plate (the near-tile weight ramps in only from y ~950 to ~1400), not from the
  tile — a separate fix.
* NEXT STEP when Screen 08 resumes: render the missing shots (`M08_DET=1 M08_ONLY=t33,t66,t95,f20 node
  tools/match08/shots08.mjs 08 <dir> "K16&m08gl=1"`), write the verdict, keep or reject; then brief task: towel double
  exposure at hard left / right — test `&m08towelm=1` alone (mask `towel08_mask.png` fits the painted towel, checked), then
  `&m08occ=1` separately (r8 frames `qa/match/08/scenery/r8/occ/` showed the window running cleanly behind the towel with
  both on); then wall seams, river-edge foam + coin line, spout cups, cup band V.
* 2026-11-18 ~21:15 UTC: PAUSED by user order (coordinator, ~21:10 UTC: Screen 08 paused, effort to screens 04-07; no
  approval decision yet). Kept set at pause: `K16 = K15&m08vh=1`. Render stopped, no dev server left running.

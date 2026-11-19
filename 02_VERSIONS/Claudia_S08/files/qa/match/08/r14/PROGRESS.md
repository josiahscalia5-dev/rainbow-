round 14 (account 14) resumed from e36430c4

# Screen 08 · Final Spin Chamber — round 14 progress (branch `claude/rainbow-s08-scenery-c14`)

Authority: `references/08_final_spin_chamber.png`. Start = `claude/rainbow-s08-scenery-c13` @ `71e7cf54` + `e36430c4`
(account-13 unfinished helper `tools/match08/nq08.py` restored from `backups/wip`; not yet wired into the game).
Kept set at start: `K13 = K12&m08bore=1&m08flange=1&m08cupw=1` (r13 steps 1 + 2, GOOD IMPROVEMENT), with
`K12 = K11&m08cup=1&m08rw=1&m08drum=1&m08ring=1&m08cupg=1`, `K11 = K10&m08ceil=1&m08near=1`,
`K10 = match08=1&coins08px=1&m08bw=1&m08fill=1&m08arch=1&m08swim=1&m08seam=1&m08sill=1&m08towel=1&m08far=1&m08coinv=1`.
Rejected, never repeat: `m08urcup` (invented upper-right cup front).

* 2026-11-18 round 14 started (washer-environment-modeler, account 14, worktree `/home/user/wt/s08`).
  Now on task (a): the S-river and the near water ahead of / around Benny (no sideways stretching / smearing at
  forward 6 / 10 / 20 u and hard left / right; one continuous glossy S-river with the painted pink bands, diagonal
  streaks and white glints, Benny seated in it). Then (b) wall seams, (c) river-edge foam + coin-line shape,
  (d) soft V in the upper-right cup's gold band (only if a clean fix exists).

## Round 14 restarted ~16:45 UTC after interrupt
* restarted ~16:45 UTC after interrupt (previous round-14 instance cancelled ~16:43 UTC by a user message to the lead;
  nothing committed lost). Resumed at `b62b9c34`, kept set K13. Checking the half-captured `BEFORE_K13/` set first,
  then task (a): S-river / near water ahead of and around Benny.

BEFORE set for round 14 (fresh, kept set K13, 12 shots, `tools/match08/shots08.mjs`, port 5278): `/home/user/wt/s08/qa/match/08/r14/BEFORE_K13/`
(the set half-written by the cancelled instance was checked: all 12 PNGs open, 864 x 1536, query = K13; kept as is).

## Step 1 — `&m08nq=1` (near water at the PAINTED scale while swimming; with m08near) — KEPT (GOOD IMPROVEMENT)
Kept query: `K13&m08nq=1` (= `K12&m08bore=1&m08flange=1&m08cupw=1&m08nq=1`)
* Cause: `m08near` lays the painted near band (rows ~1250-1520) over the whole swim lane (+-2.95 u) scaled evenly
  ~2.3x, from a 191 texel / u cut: at forward 6 / 10 u and hard left / right the bottom third of the frame showed
  blurry white "flames" 2-3x the painted glint size; at hard left Benny sat half on the foam / purple floor.
* What changed (`src/world/match08.ts` floor shader, only with `&m08nq=1`, only off the approved viewpoint):
  `tools/match08/nq08.py` v6 -> `assets/textures/match08/nq08.png/.json` (1336 x 1236, 6.1 u x 7.5 u, 220 / 165 texels
  per u), built only from the user's own near band at the painted scale: (1) the band is resampled along its own painted
  flow lines (its streaks are S-curved ~30 deg inside the band), (2) split into the base satin and the 7 painted glints,
  (3) the middle +-0.7 u keeps the painted layout 1:1 (pink band left, cyan centre), toward the lane banks the extra width
  is laid from whole painted columns of the same colour zone (left pink, right cyan), (4) the painted glints are put back
  WHOLE, with their painted shape and angle, at the painted size and density, scattered over the 7.5 u period. The shader
  lays the tile in world units across the lane (no magnification).
* Tried inside the step and dropped (frames in `tried_v4_quilted_NEW/`): block quilting of the band (account-13 v1 and
  r14 v2-v4): wavy "scales" from the S-curved streaks, then the painted glints cut into glittery fragments and a
  repeated "barcode" pink band; v6 first pass: pink-tinted glints (additive), a hard seam across the water below Benny
  (tile length not a whole number of column periods) and bank foam blobs copied as glints — all fixed before the renders.
* Approved view: scenery pixel-identical (deterministic capture with / without: 594 px differ, all in the stage-title
  banner rows 114-161, at most 12 levels = HUD timing).
* What looks closer: forward 6 u, forward 10 u, hard left and hard right: the near water is one continuous pink-and-cyan
  S-river — the pink band of the painted S-curves now runs on down the left of the lane to the frame bottom, the cyan
  carries crisp white lightning glints at their painted size (BEFORE: a blown-out cyan-white blur with glints 2-3x the
  painted size); at hard left Benny now swims in pink water instead of on the foam bank.
* Still wrong: the near streaks run straight along the river (the painted ones sweep in curves), the satin is a little
  flatter / less glossy than painted and the glints a little sparse; at forward 3 u (tile not yet active, same as
  BEFORE) a hard straight edge crosses the water near the frame bottom; t95 BEFORE crossed into stage 09 both times
  (frame timing at the stage end), the stage end is shown by `s_left_hard` / `s_right_hard` (s 404.03, stage 08).
* Verdict: GOOD IMPROVEMENT (near water while swimming).
* Images (separate, full size): `/home/user/wt/s08/qa/match/08/r14/step1_m08nq/1_APPROVED.png`, `2_BEFORE_<shot>.png`
  (= K13), `3_NEW_<shot>.png` for all 12 audit shots (best: `f06_forward6u`, `f10_forward10u`, `s_left_hard`,
  `s_right_hard`) + `2_BEFORE/3_NEW_capture_approved_view.png`.

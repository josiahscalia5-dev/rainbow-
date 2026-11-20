# Round 16 resume notes — where each round-15 worker stopped (account 15 hit its 5-hour limit at 18:49 UTC)

Every worker below was cut off mid-step. Its committed work is on its `-c15` tip; its UNFINISHED edits (tracked diff + new files)
were captured by the account-15 autosave at 19:00:09 UTC in `backups/wip/<branch>/` on `origin/ccr-47b10cec-03c7co` (`90528de`) and
are applied on top of the new `-c16` branch in the worker's worktree (left UNCOMMITTED, exactly as the worker left them). Large
renders listed under `untracked_skipped` in each `INFO.json` were not saved: re-render what you need. Scratchpad files of the old
container (`/tmp/claude-0/.../6b384c42-.../scratchpad/...`, quick render scripts, debug renders) are gone.

Common to all: user order 2026-11-18 ~18:55 UTC (`docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md`) — VISUALS ONLY, biggest
visible difference first, APPROVED / BEFORE / NEW pictures from the real game, plain visual words, minimal checks (approved start view
unchanged, coins unchanged). Your launch brief is the r15 one named below; read every `-c15` as `-c16` and every `r15` log folder as
`r16` (`qa/match/<NN>/r16/`), but keep reading `qa/match/<NN>/r15/` for what was already done.

## s04tex — Screen 04 painted-ring test `&m04rpaint` (brief `S04B_RINGTEX_LAUNCH.md`) — THE USER IS WAITING FOR THIS
* Tip `fc28323a` (no r15 commit yet). Unfinished: `src/world/match04m4.ts` (the `m04rpaint` shader path), new
  `assets/textures/match04/tile_ring_paint.png`, `tile_ring_paint_soft.png`, `ring_paint04.json`, `tools/match04/ring_paint04.py`.
* Done: the painted inner gold ring straightened from the approved picture (4 groove circles fitted, psi × position-in-period strip,
  bubbles masked); interim texture shown to the user at 18:45 (NOT YET PROVEN).
* Was doing: in-game variant renders `&m04rpaint=1&m04rpsoft=1&m04rpj=0.35` (+ a further variant) on the kept L4 set.
* Lead's notes to act on: (1) long vertical bright streaks across the band — the painting has short glows / light dots near the lips,
  shorten / soften them if they read as stripes; (2) a pale V-shaped smear near the bottom rows (psi ≈ +0.6…+1.0), probably bubble
  fill or the mirror seam — must not show as a mark on every ring.
* User asked at 18:44 UTC "show me the painted ring test results": render the first full APPROVED / BEFORE / NEW set and report it
  FIRST, before any further polishing.

## s04 — Screen 04 foam + side swirls (brief `S04_LAUNCH.md`)
* Tip `160ce059` = r15 step 1 `m04fclu` (entrance foam as clusters of small shiny bubbles) KEPT and shown: GOOD IMPROVEMENT (small).
* Lead order 18:32: SKIP task 2 (interior rings — handled by s04tex); do NOT edit the ring shader (GOLD_FRAG).
* Unfinished = task 3 (pink-magenta side swirls on the side water): `src/world/match04m4.ts` (side-band uniforms: bands start
  cyan..lilac nearer the pink ribbon, slow lateral wander), new `assets/textures/match04/tile_side04.png`,
  `tools/match04/sideband04.py`. Was rendering f06 / t66 / hard-right checks when cut off. Then task 4 of the brief.

## s05 — Screen 05 (brief `S05_LAUNCH.md`)
* Tip `34aadd11` (= r14 step 3). Kept start set: `qa/match/05/r15/KEPT_START.txt`.
* Unfinished = task 1, 05 → 06 transition, switch `&m05trans=1`: tracked edits in `src/vfx/clip05.ts`, `src/vfx/index.ts`,
  `src/world/environment.ts`, `src/world/match05far.ts`, `tools/match05/r8_shots.mjs`; probe `tools/match05/r15_probe.mjs`;
  BEFORE shots `qa/match/05/r15/step1_trans/before/` (partial) and a few NEW ones. Last approach: the 05 scenery block is removed
  when BENNY crosses into 06 (driven by Benny's course position, not the eye distance); was re-checking x99 with `m05trans` alone.
* Lead note 18:22 (task 2, before the m05bank column fix): at hard left (`qa/match/05/r14/step3_m05bank/new/k81_kink_left.png`) the
  whole LEFT wall is a smeared, radially streaked projection (x 0–300, y 200–1100), a flat cut-off chunk of gold ring / paddle sits at
  x 150–300 y 440–540, and a hot-pink triangular smear at the bottom-left corner — make it the painted crisp purple slotted wall with
  glossy gold bands (find the cause: projection used outside its valid view / wrong fallback material). Then brief tasks 2–4.

## s06 — Screen 06 (brief `S06_LAUNCH.md`)
* Tip `050155b5` (r15 audit). Lead approved rank 1 at 18:46: `&m06gold` (painted gold ring texture). Unfinished:
  `src/world/match06.ts`, new `assets/textures/match06/tile_ring6.png`, `tools/match06/make_ring06.py` ("the texture is now
  straight"; the shader switch was being wired; first `gold1` renders f03 / f10 / t33 existed). Rank 2 = foam as bubbly soap
  clusters: borrow 04 `m04fclu` (`git show 160ce059 -- src/` on `claude/rainbow-s04-match-c15`, read-only) with 06's own colours;
  the 04 painted-ring idea `tools/match04/ring_paint04.py` (s04tex worktree, read-only). Keep 06's own approved colours.

## s07 — Screen 07 (brief `S07_LAUNCH.md`)
* Tip `dbc7678c` (no r15 commit yet). Unfinished, all untracked: step-1 BEFORE / NEW `t95_through_screen` + motion logs in
  `qa/match/07/r15/step1/` (the other step-1 renders were too big for the snapshot: re-render), `tools/match07/audit_r15.mjs`,
  `tools/lead_r13/swim_clip.mjs` copy, and `tools/match07/near_tiles_r15.py` = the next step `&m07nearw=1` (near-water tiles cut from
  the approved Screen 07 picture at its painted near scale, instead of the stretched `tile_river_clean.png`), written at 18:50 just
  before the cut-off, not yet run. Finish step 1 (round-8 m07foam + m07coinsz proofs, minimal checks), then `m07nearw`.

## s08 — Screen 08 scenery (brief `S08_LAUNCH.md`)
* Tip `df4a3bb7` (= r14 step 1 `m08nq`). Log `qa/match/08/r15/PROGRESS.md` (restored, untracked). Unfinished = r15 step 1
  `m08sr`: `src/world/match08.ts`, `tools/match08/shots08.mjs`; pictures `qa/match/08/r15/step1_m08sr/` (1_APPROVED,
  2_BEFORE_f20_forward20u, 3_NEW_f20_forward20u — check BEFORE ≠ NEW, the two files had the same size) + `BEFORE_K14/`. Was assembling
  the step-1 proof set, then planned a QA-only debug output in the floor shader mapping frame pixels back to plate pixels (only if a
  visual step needs it). Then brief tasks: wall seams → river-edge foam + coin line → spout cups → cup band V.

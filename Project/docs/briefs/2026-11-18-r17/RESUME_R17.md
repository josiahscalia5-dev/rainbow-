# Round 17 resume notes — where each round-16 worker stopped (account 16 stopped saving at 20:14 UTC)

Every worker below was cut off mid-step. Its committed work is on its `-c16` tip; its UNFINISHED edits (tracked diff + new files)
were captured by the account-16 autosave at 20:14 UTC in `backups/wip/<branch>-c16/` on `origin/ccr-e42bb3c0-jpif8d` (`e057fe80`)
and are applied, UNCOMMITTED, in the worker's `-c17` worktree exactly as the worker left them. Large renders listed under
`untracked_skipped` in each `INFO.json` were not saved: re-render what you need. The old container's scratchpad files are gone.

Common to all: user order 2026-11-18 ~18:55 UTC (`docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md`) — VISUALS ONLY, biggest
visible difference first, APPROVED / BEFORE / NEW pictures from the real game, plain visual words, minimal checks (approved start view
unchanged, coins unchanged: 91 coins / 2,240). Your launch brief is the r15 one named below; read every `-c15` as `-c17` and every
`r15` log folder as `r17` (`qa/match/<NN>/r17/`), but keep reading `qa/match/<NN>/r15/` and `r16/` for what was already done.
FIRST: read your own `r16/PROGRESS.md` (and NOTES) + `git diff` in your worktree, decide whether the unfinished edit is the step
described below, finish or discard it (never silently), commit + push, then continue.

## s04tex — Screen 04 painted rings (brief `S04B_RINGTEX_LAUNCH.md`), worktree `/home/user/wt/s04b`
* Tip `3fdcbc0b`: step 3 KEPT (`&m04rpaint=1&m04rpsoft=1&m04rpj=0.35&m04rplu=3.95&m04rpgu=4.28` — thick separate copper-gold rings with
  dark grooves; GOOD IMPROVEMENT for shape, shown to the user); step 4 `&m04rwarm=1` NOT AN IMPROVEMENT (not kept).
* Unfinished (+19 lines in `src/world/match04m4.ts`) = step 5: painted-style small bright orange-yellow LIGHT DOTS on every ring lip
  (+ a slightly pinker sheen as a SEPARATE factor afterwards), on top of step 3. Then full APPROVED / BEFORE / NEW set.

## s04 — Screen 04 foam + side swirls + near water (brief `S04_LAUNCH.md`), worktree `/home/user/wt/s04`
* Tip `465e4c59`: step 3 `&m04sband=1` KEPT (pink-magenta satin swirl bands on the side water; GOOD IMPROVEMENT).
* Unfinished (+91 lines in `src/world/match04m4.ts`) = r16 `&m04end=1`: the distant glowing OPENING at the end of the tunnel as its
  own material on the far end disc (telescoping copper rings brightening into the light, pink-violet reflections, the river converging
  into the light); the ring shader is untouched. Finish + prove it, then the remaining brief task: the painted pink / cyan bands that
  sweep round Benny in the NEAR water inside the tunnel (game: plain cyan there). Do NOT edit the ring shader (GOLD_FRAG) — s04tex
  owns the rings.

## s05 — Screen 05 (brief `S05_LAUNCH.md`), worktree `/home/user/wt/s05`
* Tip `34aadd11` (= r14 step 3 `m05bank`). Kept start set: `qa/match/05/r15/KEPT_START.txt`.
* Unfinished (6 tracked files incl. a one-line DISPLAY-only change in `src/gameplay/coins.ts` behind `M05FCOIN`: far coins drawn on
  the far core only until `popS`) = task 1, 05 → 06 transition `&m05trans=1` (05 scenery block removed when BENNY crosses into 06).
  BEFORE shots partly in `qa/match/05/r15/step1_trans/before/`. Prove coins unchanged (91 / 2,240, gameplay 8/8) if the coin line stays.
* Then lead note (task 2): at hard left the whole LEFT wall is a smeared, radially streaked projection (x 0–300, y 200–1100), a flat
  cut-off chunk of gold ring / paddle at x 150–300 y 440–540, a hot-pink triangular smear in the bottom-left corner — make it the painted
  crisp purple slotted wall with glossy gold bands (find the cause first). Then brief tasks 2–4.

## s06 — Screen 06 (brief `S06_LAUNCH.md`), worktree `/home/user/wt/s06`
* Tip `4b6c637c`: step 1 `&m06gold=1` v2 KEPT (painted gold ring band; start view 0 px).
* Unfinished (+140 lines `src/world/match06.ts`, `tools/match06/r16_shots.mjs`) = rank 2: foam as bubbly soap clusters `&m06fclu`
  (borrow 04's `m04fclu` idea read-only, 06's own colours). Then rank 3: the start-view flash at +1.1 u ((a) see-through ring arcs,
  (b) striped ring strip above the crest, (c) pale ghost of the painted Benny on the water) → 4 ripple rings → 5 walls → 6 paddle lids.
* USER DECISION pending (do not change): at the 06 start view Benny (hat ≈ 1.5× wider) and the nearest coins look bigger than painted.

## s07 — Screen 07 (brief `S07_LAUNCH.md`), worktree `/home/user/wt/s07`
* Tip `669420af`: step 1 `&m07foam=1&m07coinsz=1` KEPT (GOOD IMPROVEMENT, moderate).
* Unfinished (`src/world/match07.ts` +128, `qa/match/07/r16/PROGRESS.md`, new `assets/textures/match07/near07.json`, `near_bank.png`,
  `near_foam.png`, `tools/match07/near_tiles_r16.py`, step-2 `motion.json` + `swim_NEW_nearw.mp4`) = step 2 `&m07nearw=1`: near water
  on the level stretch from tiles cut from the approved 07 picture at its painted near scale (the NEW stills were not saved: re-render).
  Remaining after it: white lather walls restart further down the drop with a visible cut.

## s08 — Screen 08 scenery (brief `S08_LAUNCH.md`), worktree `/home/user/wt/s08`
* Tip `6da32d57`: r16 step 1 `&m08sr=1` KEPT (smooth river course; GOOD IMPROVEMENT, small). Kept set K15 = K14 + `&m08sr=1`.
* Unfinished (`src/world/match08.ts` +12, `tools/match08/shots08.mjs`) = r16 step 2 `&m08vh=1`: soft visibility hand-over only on
  the HIDDEN side of a depth edge, so points the approved view saw keep their own painted pixel (fixes pale outlines / boxes along the
  platform ends, the towel and the cups' silhouettes while swimming); plus QA-only `&m08dbgvk`. Raw NEW renders started (only
  `f20_forward20u.png` + `motion.json` saved; re-render). Still open from step 1: near water blurry / flat at forward 3 u, near streaks
  straight instead of curved sweeps, torn "lightning" glints. Then brief tasks: wall seams →
  towel double exposure at hard left / right (`&m08towelm`, then `&m08occ` separately) → river-edge foam + coin line → spout cups →
  cup band V.

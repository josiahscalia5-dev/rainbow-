# Round 18 resume notes — where each round-17 worker stopped (the account-17 environment closed after its 21:11 UTC save)

Every worker below was cut off mid-step at ~21:11 UTC 2026-11-18. Its committed work is on its `-c17` tip; its UNFINISHED edits
(tracked diff + new files) were captured by the 21:11 autosave in `backups/wip/<branch>-c17/` on the r17 lead
`ccr-bbe2b27e-oxfh1w` @ `d22ec46` and are applied, UNCOMMITTED, in the worker's `-c18` worktree exactly as the worker left them
(`setup_worker.sh` in this folder). Large renders listed under `untracked_skipped` in each `INFO.json` were not saved: re-render.

Common to all: user order 2026-11-18 ~18:55 UTC (`docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md`) — VISUALS ONLY, biggest
visible difference first, APPROVED / BEFORE / NEW pictures from the real game, plain visual words, minimal checks (approved start
view unchanged, coins unchanged: 91 coins / 2,240). User order ~21:02 UTC: **Screen 08 PAUSED** (no approval decision; work on the
other screens). Your launch brief is the r15 one named below; read every `-c15` as `-c18` and every `r15` log folder as `r18`
(`qa/match/<NN>/r18/`), but keep reading `r15/`, `r16/`, `r17/` for what was already done.
FIRST: read your own `r17/PROGRESS.md` (or NOTES) + `git diff` in your worktree, decide whether the unfinished edit is the step
described below, finish or discard it (never silently), commit + push, then continue.

## s04tex — Screen 04 painted rings (brief `S04B_RINGTEX_LAUNCH.md`), worktree `/home/user/wt/s04b`, port 5274
* Tip `0f275af1`: step 5 `&m04rpdots=1` KEPT on K3 (light dots on every ring lip; GOOD IMPROVEMENT, small).
  Kept set K5 = L4 + `&m04rpaint=1&m04rpsoft=1&m04rpj=0.35&m04rplu=3.95&m04rpgu=4.28&m04rpdots=1`.
* Unfinished (`match04m4.ts` +22, `tools/match04/ring_paint04.py` +5, new `tools/match04/ring_paint04_var.py`,
  `assets/textures/match04/tile_ring_paint_var.png` + `_soft.png`) = step 6 `&m04rpvar=1`: brighter, more polished painted rings
  with the soft pink-violet sheen (the straightened ring texture was a depth MEDIAN, which dropped most of the sheen) and the
  violet (left) / pink (right) water reflections on the lower walls. Log: `qa/match/04/r18/ringpaint/NOTES.md`.

## s04 — Screen 04 foam + side swirls + near water (brief `S04_LAUNCH.md`), worktree `/home/user/wt/s04`, port 5273
* Tip `ad5fbac5`: r17 step 1 `&m04end=1` KEPT (distant glowing opening; GOOD IMPROVEMENT, moderate). K17-1 = K17-0 + `&m04end=1`.
* Unfinished (`match04m4.ts` +33) = r17 step 2 `&m04nband=1` (+ tunables `m04nbs`, `m04nbr`): the painted pink / cyan bands that
  sweep round Benny in the NEAR water inside the tunnel (game: plain cyan). NEW stills + half-size clip already rendered in
  `qa/match/04/r17/s2_nband/NEW/` (a00 / f03 skipped: re-render); BEFORE = r17 step-1 NEW set. Judge, finish, prove.
  Never edit the ring shader GOLD_FRAG (s04tex owns the rings).

## s05 — Screen 05 (brief `S05_LAUNCH.md`), worktree `/home/user/wt/s05`, port 5275
* Tip `f033f7cc`: r17 step 1 `&m05trans=1` KEPT (05 → 06 hand-over; GOOD IMPROVEMENT). Kept set: `qa/match/05/r17/KEPT_STEP1.txt`
  (restored untracked: commit it).
* No unfinished code. Next = task 2 (lead note): at hard left the whole LEFT wall is a smeared, radially streaked projection
  (x 0–300, y 200–1100), a flat cut-off chunk of gold ring / paddle at x 150–300 y 440–540 (cause found in r17, see PROGRESS),
  a hot-pink triangular smear in the bottom-left corner; near the end of 05 the walls close to the camera are radially smeared and
  the near water is a plain cyan sheet → make it the painted crisp purple slotted wall with glossy gold bands. Then brief tasks 2–4.

## s06 — Screen 06 (brief `S06_LAUNCH.md`), worktree `/home/user/wt/s06`, port 5276
* Tip `c649fcbc`: r17 step 2 `&m06fclu=1` KEPT (bubbly soap foam; GOOD IMPROVEMENT, small). Kept set = `&m06gold=1` v2 + `&m06fclu=1`.
* No unfinished code. Next = rank 3: the start-view flash at +1.1 u ((a) see-through ring arcs, (b) striped ring strip above the
  crest, (c) pale ghost of the painted Benny on the water) → 4 ripple rings round Benny → 5 purple slotted walls → 6 gold paddle
  lids. Lead note r17: while swimming 06 is still far — straight centred ring target instead of the painted left-curving crest into
  an off-centre tunnel (scenery only; do not change framing). Still open from step 2: at hard left / right foam heaps cover Benny's
  lower body. USER DECISION pending (do not change): Benny and nearest coins look bigger than painted at the 06 start view.

## s07 — Screen 07 (brief `S07_LAUNCH.md`), worktree `/home/user/wt/s07`, port 5277
* Tip `8651edf9`: r17 step 2 `&m07nearw=1` KEPT (painted near river on the level stretch; GOOD IMPROVEMENT).
  Kept set `K&m07foam=1&m07coinsz=1&m07nearw=1`.
* Unfinished (`src/world/match07.ts` +53, `src/vfx/foam.ts` +26, `src/vfx/waterRibbon.ts` +4; BEFORE / NEW / try_ramp5 / try_ramp8
  t95 stills in `qa/match/07/r17/step3_foamb/`) = step 3 `&m07foamb=1`: the white lather walls that restart further down the drop
  with a visible cut — ramp tuning was being tried; plus the start of step 4 `&m07nearf` (only a `motion.json`). Lead note r17: at
  hard left a wide flat pale lilac-white foam sheet fills the lower-left quarter (painted: separate puffy foam clouds). Also open:
  near Benny the magenta bands are narrow straight ribbons (painted: thick, big S-curve sweeps).

## s08 — PAUSED by the user (2026-11-18 ~21:02 UTC). Final `3c0fa970` on `claude/rainbow-s08-scenery-c17` (K16 kept; `&m08gl=1`
near-water glints committed UNFINISHED / not proven, behind its switch only). Resume only when the user asks; then `-c18` from
`3c0fa970` (no WIP).

## UPDATE 2026-11-19 ~18:55 UTC (user: "save everything") — where each worker is now
| Worker | Branch tip (pushed) | State | Next |
|---|---|---|---|
| s04tex | `617556fd` | running | kept K8 (… `m04rpvar`, `m04rfew&m04rfg=1.2`, `m04rpol`); next: smooth copper band in the top third, steering seam check |
| s04 | `a6219412` | running | kept K18-3b + `m04flo` (`m04nband`, `m04nwhirl`, `m04nwc=1.3`, `m04flo`); next: whirl smear while steering, coin over Benny, colour up the low banks |
| s05 | `acbeeeea` | running | step 2 WIP `m05lidf` committed unproven; task 2 left-wall smear |
| s06 | `c649fcbc` | STOPPED (usage limit; left stopped for 04/05) | unfinished rank-3 edit (`match06.ts` +139, `tools/match06/r18_dbg.mjs`) in `backups/wip/claude__rainbow-s06-match-c18/` |
| s07 | `8accdad0` | STOPPED (usage limit; left stopped for 04/05) | step 5: real 3D puffy foam clouds at hard left / right; thin sliver across a gold paddle at f10 |
| preview | `claude/rainbow-s04-preview-c18` @ `c338978b` | user-approved combined 04 preview (v2) | v3 = newest s04 + s04tex, refit `m04end` to the moved end disc |
If the running workers are cut off: their unfinished edits are in `backups/wip/<branch>/` (every autosave); next account → `-c19`
branches from these tips + WIP (`setup_worker.sh` with `-c18` → `-c19`). Transcripts (lead + all five workers, sanitized):
`backups/claude-sessions/8bb9eeab-1f60-5900-884e-9151051fb861/` (+ `subagents/`).

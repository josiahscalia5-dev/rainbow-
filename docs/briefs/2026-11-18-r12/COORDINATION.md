# Round 12 (account 12) — coordination of the five playable screens (VISUALS ONLY)

Lead session branch `ccr-e908f8da-cy4yc1` (started from the account-11 lead `ccr-3b139b48-0qqkkz` @ `f06a53e`; the
account-11 daemon later added `5c40dde` = backup bookkeeping only, no game content — not merged). Started 2026-11-18 ~12:33 UTC.
Rules unchanged (binding): `docs/briefs/2026-11-18-r8/COMMON_RULES.md` + `docs/briefs/2026-11-18-r10/RULES_R10.md` +
`docs/briefs/2026-11-18-r11/USER_ORDER_R11_STRICT.md` (read "-c8/-c10/-c11" as "-c12", "r8/r10/r11" as "r12").

## Services verified at start (free reads only, ~12:40 UTC)
* Five-minute autosave: daemon running; manual test save `74500f89` pushed, `git ls-remote` == HEAD.
* World Labs: this environment injects the key for `api.worldlabs.ai` (no form needed) → authenticated, 5,420 credits;
  Screen 08 world `32b5b2f4…` → 200; Screen 05 pilot worlds → 404 (other WL account; their files are in Git LFS).
* fal.ai: this environment injects the key for `queue.fal.run` → request `01a1ea70…` (nano-banana-2) COMPLETED. No new paid jobs.
* Hugging Face: reachable directly (no connector in this session). Stable Virtual Camera + ViewCrafter Spaces → RUNTIME_ERROR
  (Hugging Face side, same as round 11) → no GPU test possible today.
* Depth Anything 3: NOT reinstalled (no need yet) — all five approved pictures' depth maps are saved in
  `qa/da3/2026-11-18/depth_npz/`; reinstall steps in `docs/briefs/2026-11-18-r11/DA3_TEST.md` (~5 min) only when a new
  picture must be measured.
* Bootstrap: LFS 59/59 local + GitHub, references 13/13, Blender 5.3.0, Android SDK 34, Playwright/WebGL2, tsc + continuity OK.

## Workstream map (two specialists + the lead's own 04 test; rotation 05 + 08 now → 07 → 06)
| Screen | Round-12 branch | Started at (= newest round-11 tip) + WIP | State |
|---|---|---|---|
| 05 | `claude/rainbow-s05-match-c12` | `2d9fe975` + WIP `&m05fmag=1` (account-11 snapshot, unverified) | RUNNING water-fx-specialist, worktree `/home/user/wt/s05`, log `qa/match/05/r12/` |
| 08 scenery | `claude/rainbow-s08-scenery-c12` | `35b5fc5a` + WIP `&m08cup=1` + `tools/match08/cupmask08.py` (unverified) | RUNNING washer-environment-modeler, worktree `/home/user/wt/s08`, log `qa/match/08/r12/` |
| 04 | `claude/rainbow-s04-match-c12` | `d3ea4200` (`&m04mv=1` V04-1/V04-2 multi-view test) + its partial NEW renders | LEAD finishes the decisive test, worktree `/home/user/wt/s04`, log `qa/match/04/r12/` |
| 07 | (`-c11` = `-c9` `dbc7678c`) | — | READY next slot |
| 06 | (`-c11` `8182130c`; bend method rejected twice — never repeat) | — | READY after 07 |

All `-c11` branches and `ccr-3b139b48-0qqkkz` are now in the autosave's `protected_branches`. Merging needs the user's OK.
If account 12 runs out: `-c13` branches from each NEWEST `-c12` tip (or `-c11` where no `-c12` commit was added).

## Progress shown to the user (separate full-size APPROVED / BEFORE / NEW)
| # | Screen / step | Verdict |
|---|---|---|
| 1 (~12:50) | 04 lead: round-11 decisive test `m04mv` (V04-1/V04-2 projected from their game cameras; `0c941001`, log `qa/match/04/r12/PROGRESS.md`) | NOT AN IMPROVEMENT (views reach only the upper tunnel wall; torn gold blocks at the top). Method stopped; V04-1/V04-2 stay by-eye design references for the real 3D rebuild |
| 2 (~12:55) | 05 step 1 `m05fmag` (far river behind the sliding seam: own painted cyan-core / hot-pink-band continuation instead of the magnified pale smear; `38fb442c`) | GOOD IMPROVEMENT, modest (far continuation flatter than painted; straight join line at t66/t75/k81; pale slab left at t66 unchanged) |
| 3 (~12:58) | 08 step 1 `m08cup` (upper-left spout cup keeps its pink perforated cap and gold band round its top while swimming; `a4be4114`) | GOOD IMPROVEMENT, small (small gold wedge on the upper-right cup; cup undersides still painted on the wall behind) |
| 4 (~13:00) | 05 step 2 `m05fpaint` (far river t66–t95 wears the approved painted water: glossy cyan with white glints between hot-pink satin bands; softer near/far line; `be2087cb`) | GOOD IMPROVEMENT (left far bank still a flat pale lilac wedge) |
| 5 (~13:00) | 08 step 2 `m08rw` (water below Benny at forward 3 u / one-third through = one continuous glossy S-river with diagonal streaks instead of a sideways-smeared magenta patch; `fc67bedd`) | GOOD IMPROVEMENT |
| 6 (~13:07) | 04 lead: exact diagnosis of `m04mv` + corrected controlled test `m04mv2` (`40a72c43`) | NOT YET PROVEN: GOOD at the two view cameras and within ≈ 3 u (arrows, glossy rings, painted water, low foam), DOUBLE EXPOSURE half-way between views → next: fit the interior geometry to the views (DA3 multi-view, known cameras) |
| 7 (~13:09) | 08 step 3 `m08drum` (wall beside/above the upper-left spout cup carries the same curved slot rows as the door rings instead of a seamed patch of fine diagonal slots; `fd947f9d`) | GOOD IMPROVEMENT, small (hard diagonal edge at the far top-left corner remains) |
| 8 (~13:14) | 05 step 3 `m05fcloud` (puffy white foam clouds line both far banks t66–t95 instead of a flat pale-lilac rim band; `1d5990d4`) | GOOD IMPROVEMENT (hard-left steering at t95: pale floor behind the foam line) |
| 9 (~13:14) | 08 step 4 `m08ring` (regular slot rows curving round the door above/right of it instead of kaleidoscope diamonds / X shapes; `a6f7e183`) | GOOD IMPROVEMENT (gold wedge on the upper-right cup's top remains) |
| 10 (~13:14) | 04 lead: geometry / calibration checks of the view projection (`232bbedd`, `5232975b`) | NOT AN IMPROVEMENT — path stopped: the two AI views disagree with each other and are 1.7× Benny-scale repaints; next = real geometry rebuild (specialist slot) |
| 11 (~13:25) | 05 step 4 `m05fcoin` (coins near the 05→06 transition sit on the river and wind into the throat instead of floating over the left wall; look only, 91 coins / score unchanged; `24877989`) | GOOD IMPROVEMENT, small |
| 12 (~13:28) | 08 step 5 `m08cupg` (both upper spout cups stay one solid cup while swimming: cap, gold band and perforated underside joined, stream from the underside; `05ed1bee`) | GOOD IMPROVEMENT |

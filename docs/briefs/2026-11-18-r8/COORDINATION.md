# Round 8 (account 8) — coordination of the five playable screens (VISUALS ONLY)

Started 2026-11-18 ~01:26 UTC. User order: all five playable screens 04–08 must look like their ORIGINAL approved
images (≥ 8.5/10, ideally 9–9.5) while Benny swims. Faster, visible progress; no redesign; drop methods that show no
visible gain; no work on 01–03 / 09–11 (Google Flow); no paid jobs without approval; max TWO specialists at once.
Rules from round 7 still bind: `docs/briefs/2026-11-17-r7/COORDINATION.md`, `USER_FEEDBACK_R7B.md`.

## Lead
Session branch `ccr-58dd182e-m48xwk` (this cloud session's own branch), created from `claude/rainbow-lead-c7` @
`1d9aebd96e58c67d48f04790396fc0a412c6a6c5` (newest remote tip at 01:31 UTC). Nothing merged.

## How specialists run in round 8
Background specialist agents INSIDE the lead's container (instructions passed directly — no send_message, no
first-task delivery problem). Each works in its own git worktree under `/home/user/wt/<screen>` on its own `-c8`
branch (node_modules symlinked to the lead checkout), commits + pushes its own branch, reports via
`qa/match/<NN>/STATUS.md` + NOTES.md and a final reply to the lead. If the container is reclaimed, restart them from
their branch + STATUS.md (the worktrees are gone, the branches are on GitHub).

## Workstream map (newest remote SHAs fetched 2026-11-18 01:31–01:40 UTC)
| Workstream | Round-7 tip (preserved, never written by round 8) | Round-8 branch | State |
|---|---|---|---|
| 04 | `claude/rainbow-s04-match-c7` = `-c5` @ `d1e422fa` | `claude/rainbow-s04-match-c8` | **RUNNING** slot A (M4, `washer-environment-modeler`) |
| 05 | `claude/rainbow-s05-match-c7` @ `a34fb925` (m05far) | `claude/rainbow-s05-match-c8` | **RUNNING** slot B (user's 05 list, `water-fx-specialist`); 1st checkpoint `a1f14e7b` pushed |
| 06 | `claude/rainbow-s06-match-c7` @ `efaf78b7` (m06ring) | — | queued |
| 07 | `claude/rainbow-s07-match-c7` @ `3afaa7e9` (M3 done: m07tube + m07ring, plunge band fixed) | — | queued (next: m07foam, near water) |
| 08 scenery | `claude/rainbow-s08-scenery-c7` @ `c0d8c97b` (r7 done @ dafa3752; r8 UNFINISHED: coins.ts, match08.ts, occ08.py, towelmask08.py) | — | queued (finish r8 seams + coin look) |
| 08 Benny | `claude/rainbow-s08-benny08-bake-c5` @ `3133a3ad` | — | waiting for the user's verdict on r6 variants |
| 08 camera | `claude/rainbow-s08-camclear-c5` @ `18687513` | — | only if needed |
| preview | `claude/rainbow-preview-all-c6` @ `41ea6618` | — | preserved |
NOTE: the old account's 07 / 08 / 08-Benny sessions were still autosaving to their c7/c5 branches until ~01:22 UTC.
Never write those branches; continue on `-c8` only.

## Rotation (two slots)
04 + 05 now → when one reports: 07 (plunge foam walls, near water, oversized near coin) → 08 (finish r8 seams + coin
look) → 06 (ring highlights/bulbs, crisp perforated wall, foam + bubbles) → back to the lowest-rated screen.

## Services verified this session (free reads only)
World Labs key = the 5,190-credit account (Account B: Screen 05 pilot worlds draft 200 / full 200; Screen 08 world
32b5b2f4 → 404 with this key, its assets are in Git LFS). fal.ai key = same purchased account (request 01a1ea70 →
COMPLETED). Download hosts cdn.marble.worldlabs.ai, v3b.fal.media, v3.fal.media added to the environment allow-list
(user-approved 01:39 UTC). Atlas connector: not connected in this session (not needed for visual work).

## Update 2026-11-18 ~01:53 UTC (user order: ALL FIVE screens; 04 + 05 keep running)
* User: "Continue the two active Screen 04 and 05 specialists. When a slot becomes available, resume Screen 07 to fix the
  tall white foam walls, oversized coin, and remaining differences from my approved scenery. Keep Screen 06 and Screen 08
  in the specialist rotation too." Preserve the 07 plunge fix (m07tube + m07ring). Visuals only; no Atlas / Parallax
  detours; verify the World Labs plugin skills when the next session starts.
* 07: lead WIP saved `claude/rainbow-s07-match-c8` @ `401984b4` (`&m07foam=1` plunge walls → painted banks, clearly
  closer; `&m07coinsz=1` near coin at painted size). Proofs owed — list in `qa/match/07/STATUS.md` (top). The next 07
  specialist starts from there (do not redo m07foam).
* Rotation: first free slot → 07 (finish proofs, level-stretch near water, hard wall edge) → 08 (finish the unfinished
  r8 on `claude/rainbow-s08-scenery-c7` @ `c0d8c97b` on a new `-c8` branch: seams around towel/window/walls, coin look)
  → 06 (`-c7` @ `efaf78b7`: ring highlights/bulbs, thinner far rings, crisp perforated wall, foam + bubbles).

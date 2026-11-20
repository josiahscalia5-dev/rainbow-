# Round 23 — coordination (new account; lead session branch `claude/rainbow-r22-restore-ut3m39`, 2026-11-20 from ~04:08 UTC)

Lead = this session (started from the r22 lead `ccr-4742c19f-ez2mrs` @ `f4193fe`; checkpoint `e2d4ac4` = ancestor). Nothing merged.
User authorizations carried forward (restated by the user at the start of r23): paid artwork + paid credits when they help (report job +
cost), up to FOUR specialists at once, camera-framing TESTS for 06 + 07, Screen 08 polish resumed, consistent approved Benny 04–08.

## Restore audit (lead, ~04:10 UTC)
* Remote `ccr-4742c19f-ez2mrs` = `f4193fe` = local start; `e2d4ac4` (03:55) is its ancestor (7 newer autosaves, end-of-session saves).
* Git LFS 97 / 97 real files, 592.8 MB, `git lfs fsck` OK, 0 pointer stubs. References 13 / 13 OK. Agents 10 / 10 present.
* Worktrees (`docs/briefs/2026-11-20-r22/setup_worker_r23.sh`, inspected before running): s04 `-c24` = `34cb4941` + WIP snapshot
  (byte-identical to `34cb4941` + `qa/match/04/r22/s2_bbd/code.patch` = K22-2 code); s07 `-c24` = `8accdad0` + WIP snapshot (contains
  step 1 `m07cloud` + the unfinished, untested `m07satin`); s06 `-c24` from `claude/rainbow-s06-match-c23` @ `e162aec` (04:09, step-3
  `m06fcl` clips, newer than the handoff); Benny `-c24` from `claude/rainbow-benny-c23` @ `734efb6` (04:05: knit texture edits after
  step 1 `b9c91d0`, newer than the handoff); s08 `-c24` @ `3c0fa97`; s05 `-c24` @ `eb7233e`.
* Old-account cloud sessions s06 / Benny: not visible from this account; last pushes 04:09 / 04:05, nothing by 04:34 (their autosave
  runs every 5 min while alive) → treated as STOPPED. Their `-c23` branches are never written from this account.
* Keys / services: World Labs key OK (free read, 5,420 credits); fal key OK (status read HTTP 200); Atlas connector OK (project
  `My project`, credits available — fixed since r22); GitHub OK (`josiahscalia5-dev`); Hugging Face connector NOT attached on this
  account (public models work without); Playwright + Chromium OK; Blender 5.3.0, Android SDK 34 OK; autosave OK.
* Pixel tool rebuilt: `/home/user/tools-pixelmatch/pixeldiff.mjs` (copy of `docs/briefs/2026-11-18-r16/pixeldiff.mjs`, pixelmatch 5.3.0).

## TRAP (all workers): URL switch overrides
The game reads the FIRST occurrence of a switch. Appending `&m04lanew=3` to a query that already holds `m04lanew=2.3` does NOTHING.
Replace values in place: `node /home/user/rainbow-/tools/lead23/setq.mjs "<base query>" "a=1&b=2"`.

## Workers (four at once, user-approved) — in-process background agents of this lead session
| Worker | Agent | Worktree / LOCAL branch (never pushed; lead autosave snapshots to `backups/wip/`) | Port | Launch |
|---|---|---|---|---|
| s04 | washer-environment-modeler | `/home/user/wt/s04` `claude/rainbow-s04-match-c24` | 5273 | `LAUNCH_S04_R23.md` |
| s07 | water-fx-specialist | `/home/user/wt/s07` `claude/rainbow-s07-match-c24` | 5277 | `LAUNCH_S07_R23.md` |
| s06 | path-camera-transition-engineer | `/home/user/wt/s06` `claude/rainbow-s06-match-c24` | 5276 | `LAUNCH_S06_R23.md` |
| Benny | benny-character-artist | `/home/user/wt/benny` `claude/rainbow-benny-c24` | 5279 | `LAUNCH_BENNY_R23.md` |
| s08 polish / s05 polish | QUEUED (next free slot) | `/home/user/wt/s08` `-c24` @ `3c0fa97`; `/home/user/wt/s05` `-c24` @ `eb7233e` | 5278 / 5275 | r22 RESUME table |

## Results log
* ~04:35 lead Screen 04 **K23-1** (`qa/match/04/r23/`): pink water-climb off + pink round Benny off + calmer lane → mostly blue water,
  thin pink at the sides, gold clean to the water. GOOD IMPROVEMENT by the lead; shown to the user (APPROVED / BEFORE / NEW middle +
  real-speed and half-speed clips). Gameplay 8/8, 91 coins; start view 0 px.
* ~04:40 lead review of s07 r22 step 1 `&m07cloud=1`: flat streaky pale sheets → puffier white cloud banks = small GOOD IMPROVEMENT
  (texture); still tall white foam walls along the drop where the painting shows purple slotted walls + gold rings and only low foam.

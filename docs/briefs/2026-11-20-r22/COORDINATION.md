# Round 22 — coordination (new account; lead session branch `ccr-4742c19f-ez2mrs`, 2026-11-20 from ~03:05 UTC)

Lead session `session_0179kWgNJzw5v4674DNtMpda`. Started from the round-21 lead `ccr-68d26c2d-gwegce`. Nothing merged anywhere.
User authorizations carried forward verbatim from round 21 (`docs/briefs/2026-11-20-r21/RESUME_R21.md` §"User decisions"): paid
artwork, up to FOUR specialists at once, 06 + 07 camera-framing TESTS, Screen 08 resumed, consistent approved Benny on 04–08.

## Restore audit (lead, ~03:10 UTC)
* Checkpoint `47bfbf8` (02:44) is an ancestor of this branch. Newer: `8c76568`, `6badff7`, `521cc82`, `c58faf2` (02:45–02:48,
  end-of-session saves, in this branch) and `e1b1311` (03:02, only on `ccr-68d26c2d-gwegce`: end-of-session metadata — cost state,
  last prompt, WIP INFO timestamps; no game work, no user verdict). Left on GitHub, not merged.
* Git LFS: 89 / 89 real files, 577.2 MB, 0 pointer stubs, 89 / 89 on GitHub LFS.
* s04 / s07 saved patches = byte-identical to the autosave WIP snapshots → applied ONCE in fresh worktrees (below); tsc OK.
* **Newer work found:** `claude/rainbow-s06-match-c22` @ `c7cac38` (02:50) — the round-21 06 session DID start after the handoff
  was written: `&m06view=1` built + tuned (defaults `m06vw=20,38`, `m06vx=0.85`, `src/game/cameraRig.ts`, `src/world/match06.ts`),
  BEFORE / NEW shots in `qa/match/06/r21/step1_m06view/`; it was recording the swim clip when it stopped; no verdict, no
  PROGRESS.md. The r18 rank-3 WIP is ALREADY applied there (do not re-apply). → s06 restarts from `c7cac38`, not from `c649fcbc`.
* Benny: `claude/rainbow-benny-c22` @ `70d3b83b` as recorded (restored r20 WIP, untested).

## Workers (four at once, user-approved)
| Worker | Agent / where | Branch / worktree | Port | Launch |
|---|---|---|---|---|
| s04 water / foam / arrows | in-process `foam-bubbles-particles` | LOCAL `claude/rainbow-s04-match-c23` in `/home/user/wt/s04` (`34cb4941` + r21 patch), uncommitted; WIP autosaved to `backups/wip/claude__rainbow-s04-match-c23/` | 5273 | `LAUNCH_S04.md` |
| s07 | in-process `water-fx-specialist` | LOCAL `claude/rainbow-s07-match-c23` in `/home/user/wt/s07` (`8accdad0` + r21 patch), uncommitted | 5277 | `LAUNCH_S07.md` |
| s06 | cloud session (path-camera + reference-match roles) | `claude/rainbow-s06-match-c23` from `c7cac38` (pushes its own branch) | 5276 | `LAUNCH_S06.md` |
| Benny | cloud session (benny-character-artist) | `claude/rainbow-benny-c23` from `70d3b83b` (pushes its own branch) | — | `LAUNCH_BENNY.md` |
| s08 polish | QUEUED (next free slot) | from `claude/rainbow-s08-scenery-c17` @ `3c0fa970` | 5278 | coin sizing, `m08gl` verdict, towel double |
| s05 polish | QUEUED | from `claude/rainbow-s05-match-c19` @ `eb7233e3` | 5275 | end of 05, hard left |
| Lead | this session | — | — | 04 artwork proposals await the user's verdict → multi-plate projection; keys |

### Launched ~03:17 UTC
* s04, s07: in-process background agents of this lead session (reports arrive here; logs `qa/match/0N/r22/PROGRESS.md`).
* s06: cloud session `session_0179kWgNZhiYHyDdV12Eaw6e` → `claude/rainbow-s06-match-c23`.
* Benny: cloud session `session_0179kWgM7wtBDT3n5KLuLz7o` → `claude/rainbow-benny-c23`.
Resume after an interruption: s04 / s07 = `git worktree add -b <branch> /home/user/wt/s0N <INFO.head>` + `git apply --binary
backups/wip/claude__rainbow-s0N-match-c23/tracked.patch`, then relaunch with `LAUNCH_S0N.md` (continue from r22 PROGRESS.md);
s06 / Benny = their pushed `-c23` tips + their r22 PROGRESS.md.

## Candidates (NOT accepted until the user approves in motion)
* 04: K21-1 = V4 + `&m04wgl=1` (r21 GOOD IMPROVEMENT by the worker; re-verified in r22 step 0).
* 07: K7 + `&m07end=1` (r21 GOOD IMPROVEMENT by the worker; re-verified in r22 step 0).
* 06: `&m06view=1` (NOT YET PROVEN).
* 04 artwork proposals `qa/review_r21/artwork/04/FOR_APPROVAL_04_*.png` — awaiting the user.

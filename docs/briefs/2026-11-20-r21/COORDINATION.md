# Round 21 — coordination (lead session branch `ccr-68d26c2d-gwegce`, 2026-11-20)

Session opened on the r20 lead `ccr-681a37bb-5jqfbu` @ `413e419` (nothing merged). Task 1 (done): Screen 04 ring bands — `m04rsoft`
+ `msaa` (`qa/match/04/r21_rings/NOTES.md`). User ~01:55 UTC: "all my approved screens ... look exactly like [them] while the pink
character swims ... even 90 % close, I'll be pleased" + Screen 04 water / background / arrows first.

## Push rule this session
This session may push ONLY `ccr-68d26c2d-gwegce`. Workers keep code UNCOMMITTED in local worktrees (local branches `*-c22`, never
pushed); the five-minute autosave snapshots it to `backups/wip/<branch>/`; proof pictures / logs go straight into the lead checkout
(`qa/match/0N/r21/`). Restore a worker: `git worktree add -b <branch> <wt> <INFO.head>` + `git apply --binary tracked.patch`.

## Audit of the current best version of every playable screen in motion (`qa/review_r21/audit/<screen>/`, queries `QUERY_0N.txt`)
Deterministic shots (tools/lead21/audit_screen.mjs): start, early (12 %), middle (35 %), late (60 %), end (85 %), hard left / right.
| Screen | Build (worktree) | Lead verdict by eye (start / in motion) | Biggest difference in motion |
|---|---|---|---|
| 04 | preview V4 = `34cb4941` + rings `70e5595` + r21 (`/home/user/wt/s04p`, local `claude/rainbow-s04-preview-c22`) | ~9 / ~6.5 | hazy magenta blur climbing the walls; foam banks vanish inside; Benny's look |
| 05 | `claude/rainbow-s05-match-c19` @ `eb7233e3` (`/home/user/wt/a05`) | ~9 / ~8 | end of 05: smeared walls + bunched coins; hard left: foam column, streaked wall |
| 06 | `claude/rainbow-s06-match-c18` @ `c649fcbc` (`/home/user/wt/a06`) | ~8.5 / ~5 | centred ring "target" instead of the left-curving crest into an off-centre tunnel; big foam walls; Benny bigger |
| 07 | `claude/rainbow-s07-match-c18` @ `8accdad0` (`/home/user/wt/a07`) | ~9 / ~5 | view faces close purple walls mid-stage; pale streaky waterfall + white columns at the end |
| 08 | `claude/rainbow-s08-scenery-c17` @ `3c0fa970` (`/home/user/wt/a08`) — PAUSED by the user | ~9 / ~8.5 | holds well; coins a little large |

## Workers (two at a time, binding rule; 04 = user's first priority, 07 = next in the rotation 05 + 08 → 07 → 06)
| Worker | Agent | Worktree / local branch | Port | Brief |
|---|---|---|---|---|
| s04 water / foam / arrows | foam-bubbles-particles | `/home/user/wt/s04` / `claude/rainbow-s04-match-c22` (V4 + r20 unfinished `m04farsm/m04endfit/m04bbx`) | 5273 | `S04_R21.md` |
| s07 | water-fx-specialist | `/home/user/wt/s07` / `claude/rainbow-s07-match-c22` (`8accdad0`) | 5277 | `S07_R21.md` |
Next in line: 06 (composition needs a user decision: the painted off-centre tunnel vs the centred target while swimming; never
`m06bend`), 05 polish (end + hard left), Benny's approved look on every screen (`claude/rainbow-benny-c21` @ `bade594` + WIP).

## Update ~02:50 UTC — user authorized paid artwork + up to four specialists; account switch
| Worker | Where | Result / state |
|---|---|---|
| s04 (in-process) | local `claude/rainbow-s04-match-c22` (never pushed) | step 1 `&m04wgl=1` GOOD IMPROVEMENT; stopped by the account switch; code `qa/match/04/r21/code_at_stop_full.patch` (base `34cb4941`) |
| s07 (in-process) | local `claude/rainbow-s07-match-c22` (never pushed) | step 1 `&m07end=1` GOOD IMPROVEMENT; stopped; code `qa/match/07/r21/code_at_stop_full.patch` (base `8accdad0`) |
| s06 | cloud session `session_018Sg3ATJADxqD5ATsNChkL5` → `claude/rainbow-s06-match-c22` | brief `S06_R21.md` (framing test `m06view`); asked to save + write WHERE I STOPPED |
| Benny | cloud session `session_018Sg3ASkM3eaYYiggDeDayi` → `claude/rainbow-benny-c22` | brief `BENNY_R21.md`; asked to save + write WHERE I STOPPED |
| artwork (lead) | `qa/review_r21/artwork/` | 5 paid fal jobs ($0.60); 04 proposals middle / late / end awaiting the user's approval |
Resume: `RESUME_R21.md`, recipe `setup_worker_r22.sh`.

# Round 19 — coordination (new account, lead `ccr-d00ac5ec-gabdsh`, started 2026-11-19 19:05 UTC)

The r18 lead `ccr-ae71d3a5-80naq2` and all its workers stopped at the 5-hour usage limit at 18:54–18:55 UTC (last lead
saves 18:56 `74839a0` + 19:04 `20e2a73` — the 19:04 save holds only backup bookkeeping, nothing to merge). User at 19:25 UTC:
"continue on where we're at in the chat". Nothing merged; r18 lead + every `-c18` branch added to `protected_branches`.

## Services verified at start (free reads only)
Autosave OK (remote == HEAD); GitHub MCP `get_me` OK; named-branch fetch / push / ls-remote OK (the full all-branch fetch takes
> 6 min in this shallow clone: fetch named branches only). World Labs Marble connector `list_projects` → "My project",
credits available; Marble key authenticated (5,420 credits; old worlds 404 = made on an earlier account, files in Git LFS).
fal.ai: request `01a1ea70` → 200 COMPLETED (same account). Hugging Face, Playwright MCP OK. Bootstrap: Blender 5.3.0, Android
SDK 34, Node 22, Python QA libs, Chromium WebGL2, ffmpeg / ImageMagick, tsc + continuity OK; LFS 76/76 local + on GitHub;
13/13 references identical. Pixelmatch rebuilt at `/home/user/tools-pixelmatch/pixeldiff.mjs`.

## Workers (in-process background agents in the lead container; `setup_worker.sh` in this folder)
| Screen | Round-19 branch | Started at (= newest -c18 tip + 18:56 WIP) | Agent | Worktree | Port |
|---|---|---|---|---|---|
| 04 water/foam | `claude/rainbow-s04-match-c19` | `a6219412` + WIP step 5 `m04nwq=2&m04nwr=3.2` (steering smear fix, log drafted, clip was rendering) | foam-bubbles-particles | `/home/user/wt/s04` | 5273 |
| 04 rings | `claude/rainbow-s04-ringtex-c19` | `617556fd` (K8) + WIP step 9 (`match04m4.ts` +16, `ringpaint/step9_crisp/` NEW stills; top-third band) | washer-environment-modeler | `/home/user/wt/s04b` | 5274 |
| 05 | `claude/rainbow-s05-match-c19` | `ef5dd0cd` (step 2 code `m05wcrisp`+`m05lidf`+`m05pink` committed, final NEW set was re-rendering) | water-fx-specialist | `/home/user/wt/s05` | 5275 |
| 06 | stopped (`claude/rainbow-s06-match-c18` @ `c649fcbc` + WIP rank-3) | not restarted (usage: 04 / 05 first) | — | — | — |
| 07 | stopped (`claude/rainbow-s07-match-c18` @ `8accdad0`) | not restarted (usage: 04 / 05 first) | — | — | — |
| 08 | PAUSED by the user | `claude/rainbow-s08-scenery-c17` @ `3c0fa970` | — | — | — |
| 04 preview | `claude/rainbow-s04-preview-c18` @ `c338978b` (v2, user-approved snapshot) | lead builds v3 = newest s04 + s04tex + `m04end` refit once both report | lead | — | 5279 |

Logs continue in the r18 files (`qa/match/04/r18/PROGRESS.md`, `qa/match/04/r18/ringpaint/NOTES.md`, `qa/match/05/r18/PROGRESS.md`),
entries marked (r19). If this account runs out: `-c20` branches from each newest `-c19` tip + `backups/wip/` snapshot.

## Progress shown to the user
| # | Screen / step | Verdict |
|---|---|---|

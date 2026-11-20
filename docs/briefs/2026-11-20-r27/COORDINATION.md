# Round 27 — coordination (lead session branch `claude/rainbow-restore-screen-match-ijjdai`, new Claude account, 2026-11-20 from ~15:11 UTC)

User (new account, ~15:11): "RESTORE MY COMPLETE RAINBOW PROJECT, ENABLE MY TOOLS AND AGENTS, AND CONTINUE FROM THE LATEST SAVE" — source branch
`ccr-08ece3a6-xcwyls`; verified checkpoint + five-minute autosave first; restore conversations, tools, connectors, plugins, ten specialists,
unfinished work incl. the separate `lead/trial07-c27` trial and the DevTools / Spector experiments; continue 07 / 06 / 04 / Benny, preserve 08
K23-3 (unapproved) and the 05 queue. **New user request (r27):** a preview of what every mobile screen looks like now + an honest 1–10 rating vs
its approved picture while swimming; for anything under ~8–8.5, how to fix it and every tool needed. **New foam clarification for 07 (verbatim
in `LAUNCH_R27.md`).** Authorizations unchanged: useful paid artwork within the recorded scope (record provider, purpose, job ID, cost), up to four
specialists at once; a new paid GPU service (Runpod) needs its configuration and cost shown first. Nothing is approved until the user says so.

## Restore audit (lead, 15:11–15:40 UTC)
* Session branch started at `abe6dd1` (14:18) — the hook's `git fetch` failed. `git ls-remote` showed the source at
  **`e655f1953bb543b70b46bd47c9c074bc8531fb23`** (r26 container's last daemon save, 15:03 UTC). Fetched and merged (`e2e1d12`; conflicts only in the
  regenerated `backups/LIVE_TOOLS_STATE.json` + `backups/MANIFEST.json`, source versions kept). Pushed; remote == local; `AUTOSAVE OK … (match)`.
* Real backup gap: r26's last save 15:03 → this session's first save 15:15 UTC (12 min, nobody working: the r26 lead and workers had stopped
  at 13:57–14:03 on the 5-hour limit).
* Saved conversations: r26 lead `57d35962…` to **14:52:00 UTC** (last real user message 13:58:22: "save everything … every 5 minutes … I don't
  want to interrupt the agent"); its four workers to 13:57:14 (Benny), 13:57:58 (s07), ~13:58 (s06), ~14:03 (s04) — all HTTP 429, not rejections.
* Worktrees: `setup_worker_r27.sh` (base + 15:03 snapshots) → LOCAL `-c28`; `trial07` recreated separately (`lead/trial07-c28` = `8accdad` +
  `backups/wip/lead__trial07-c27/`). **All 9: tracked patch-id MATCH, every untracked file byte-identical** (s04 1, s07 10, s06 15, Benny 7,
  s08 2, lead06 6, trial07 10 untracked files; s05 clean).
* DevTools / Spector trial: files were in the lost scratch; scripts recovered from the saved conversation →
  `tools/lead26/trial07_recovered/` (+ `NOTES.md` with the established results). Installs rebuilt (`/home/user/tools-threejs-devtools`,
  `/home/user/tools-spector`, `/home/user/tools-pixelmatch`).
* Bootstrap (15:16): LFS 170/170 real (0 pointer stubs), references 13/13 OK, 10/10 agent definitions unchanged, Blender 5.3.0, Android SDK 34 +
  Java 21 + Gradle 8.2.1, Node 22.23.5, Playwright Chromium 157 (SwiftShader), ffmpeg 6.1.1, tsc OK, continuity OK (07→08 drop 61.19).

## Services on this account (15:30 UTC)
| Capability | State |
|---|---|
| GitHub (git push to session branch) | working |
| World Labs API key (`api.worldlabs.ai`) | **working** — free read 5,420 credits (proxy-injected on this account). Saved Marble world IDs → 404 for this key (other account's worlds); all their files are in Git LFS |
| World Labs Atlas connector | **working** — project "My project", credits available (r25/r26 "no active Atlas account" is RESOLVED) |
| fal (`queue.fal.run`) | **working** — request authenticated (unknown-model probe → 404 "application not found", not 401); no paid job run |
| Hugging Face connector | NOT connected on this account (claude.ai → Connectors) |
| Context7 | plugin MCP needs a sign-in (not needed for the game) |
| Thrixel | not connected (optional; its one test was NOT AN IMPROVEMENT) |
| Playwright MCP (plugin) | connected; the Playwright library + Chromium work (all renders use it) |
| Plugins synced from the account | context7, design, frontend-design, playwright (+ project `worldlabs` installed locally) |
| Plugins NOT enabled on this account | claude-bridge, claude-code-setup, claude-md-management, code-review, code-simplifier, commit-commands, feature-dev, security-guidance, superpowers, typemux-cc, typescript-native-lsp — all found in the catalog; install card shown at 15:30; they load in the NEXT session once enabled |
| GPU | none in this container (SwiftShader CPU rendering) |

## Workers (four at once, user-approved) — in-process background agents of this lead session, launched ~15:40 UTC
| Worker | Agent | Worktree / LOCAL branch | Port | Resume point |
|---|---|---|---|---|
| s07 | water-fx-specialist | `/home/user/wt/s07` `claude/rainbow-s07-match-c28` | 5277 | combo rebuild → gameplay + landmark stills; user's new foam clarification; inside-bend foam over Benny |
| s06 | path-camera-transition-engineer | `/home/user/wt/s06` `claude/rainbow-s06-match-c28` | 5276 | NEW3 gameplay → step-1 verdict + the OWED opening comparison; foam height `m06fcn`; crest / river / coin trail |
| s04 | washer-environment-modeler | `/home/user/wt/s04` `claude/rainbow-s04-match-c28` | 5273 | `m04lgc` crescents; `m04bbdc` cloud banks + lower pink; five-arrow trade-off; combined gameplay + clip |
| Benny | benny-character-artist | `/home/user/wt/benny` `claude/rainbow-benny-c28` | 5279 | silk `b20silk=2` verdict; hat crown; 06 star start colour |
| s08 | — FINISHED (K23-3, unapproved) | `/home/user/wt/s08` `claude/rainbow-s08-scenery-c28` | — | read-only source for s07 |
| s05 | — queued | `/home/user/wt/s05` `claude/rainbow-s05-match-c28` | 5275 | end section + hard-left (+ check right steering) |
| trial07 | lead tool trial | `/home/user/wt/trial07` `lead/trial07-c28` | — | DevTools / Spector (see `tools/lead26/trial07_recovered/NOTES.md`) |
Briefs: `LAUNCH_R27.md`. If this account stops: next account runs `bash docs/briefs/2026-11-20-r27/setup_worker_r28.sh` (LOCAL `-c29` from the
newest `backups/wip/*-c28/`, trial07 included).

## Results log
* ~15:40 four workers launched (s07, s06, s04, Benny). Lead: screen preview + ratings for the user (`qa/review_r27/`).

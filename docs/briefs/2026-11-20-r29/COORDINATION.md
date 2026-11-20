# Round 29 — coordination (lead session branch `ccr-ac160b4c-3hdecw`, new Claude account, 2026-11-20 from ~18:21 UTC)

User (new account, ~18:21): restore the project from **`ccr-9652868f-lkw0w0`** (the r28 lead), verified five-minute GitHub autosave first,
recover every unfinished edit (s04 s05 s06 s07 s08 benny lead06 lead07 trial07 view04 view06 view07 + `tools/lead26/trial07_recovered/`),
restore the ten specialists and the toolchain, continue the AUTHORIZED work — **Screen 06 route test = next main checkpoint** — and answer
honestly whether the approved screens can be delivered as playable 3D that matches them THROUGHOUT gameplay (per-screen: largest
mismatch, correction, demonstrated / unproven / blocked, what is needed). Same rules as r28: at most four specialists; nothing approved until
the user says so; generated NEW VIEW / try artwork = proposals; 04 K27-B and 08 K23-3 = saved, unapproved candidates.

## Restore audit (lead, 18:21–18:50 UTC)
* Session branch `ccr-ac160b4c-3hdecw` started at **`31d3a8cd71970e5ab0835b112e66f9d15f555a0a`** (18:12 UTC, the r28 container's last daemon
  save). The hook's start-time `git fetch` failed; the lead's retry succeeded: `git ls-remote` of `ccr-9652868f-lkw0w0` = `31d3a8c…` = the
  session's start commit → nothing newer existed, nothing merged.
* Why r28 stopped: the old account's 5-hour limit (HTTP 429) killed Benny 17:30, s05 17:30, s06 17:32, s07 17:36 and the lead (no
  rejections). The r28 lead conversation is saved to 18:04:21 UTC (`backups/claude-sessions/a72797b0-…/`, 5 worker transcripts in
  `subagents/`). Last user decisions in it: the 06 route test authorized (~17:05), scope 04–10 playable incl. 09 / 10 (~17:25), "save
  everything every 5 minutes" (~17:22). No unanswered decision is newer than those.
* Real backup gap: none in data (r28's container kept saving until 18:12 after its lead stopped; this session's first save 18:22).
* First save on this branch: `1e5f29c` 18:22 UTC (daemon), `git ls-remote` == local HEAD. One daemon (`scripts/autosave-daemon.sh`).
* Worktrees: `docs/briefs/2026-11-20-r28/setup_worker_r29.sh` → LOCAL `-c30` (all 12). **All 12: tracked patch-id MATCH, every untracked file
  byte-identical** to the 18:12:48 snapshots (s04 1, s07 10, s06 17, Benny 10, s08 2, s05 0, lead07 0, lead06 6, trial07 10, view04 1, view06 15,
  view07 10 untracked files; s05 now has tracked edits = the r28 `m05endr` step).
* Helper installs rebuilt outside the repo: `/home/user/tools-pixelmatch` (pixelmatch 5.3.0 + pngjs 7 + `pixeldiff.mjs`),
  `/home/user/tools-threejs-devtools` (threejs-devtools-mcp 0.5.0), `/home/user/tools-spector` (spectorjs 0.9.33).
* Bootstrap (18:22): LFS 212/212 real (0 pointer stubs; 212/212 on GitHub LFS, 1,031 MB), references 13/13 byte-identical, 10/10 agent
  definitions unchanged, Blender 5.3.0, Android SDK 34 + Java 21 + Gradle 8.2.1, Node 22.23.5, Playwright Chromium 157 (SwiftShader),
  ffmpeg 6.1.1, ImageMagick 6.9.12, tsc OK, continuity OK (all joins gap 0, 07→08 drop 61.19).

## Services on this account (18:45 UTC, free checks only)
| Capability | State |
|---|---|
| GitHub (git push + GitHub MCP, login `josiahscalia5-dev`) | working |
| World Labs API key (`api.worldlabs.ai`, proxy-injected) | **working** — free read 5,420 credits; the saved Marble world IDs → 404 (another account's worlds); all their files are in Git LFS |
| World Labs Atlas connector | **needs the user**: "this sign-in has no active Atlas account" → finish the sign-up at atlas.worldlabs.ai (not needed for current work) |
| fal (`queue.fal.run`, proxy-injected) | **working** — unknown-model probe → 404 (authenticated, not 401); no paid job |
| Hugging Face connector | **working** — user `josdois` (sign-in expires 2026-11-21 01:42 UTC) |
| Context7 | claude.ai connector **working**; the duplicate plugin MCP asks for a sign-in (not needed) |
| Playwright MCP (plugin) | loaded; Playwright library + Chromium work |
| Plugins enabled locally on this account | claude-code-setup, code-review, context7, design, feature-dev, frontend-design, playwright, superpowers + project `worldlabs@worldlabs` |
| Plugins of the inventory NOT enabled here | claude-bridge, claude-md-management, code-simplifier, commit-commands, security-guidance, typemux-cc, typescript-native-lsp (none needed for the game work) |
| GPU | none (SwiftShader CPU rendering, 4 CPUs, 15 GB) |

## Workers — four at once; in-process background agents of this lead session (launched ~18:48 UTC, `LAUNCH_R29.md`)
| Worker | Agent | Worktree / LOCAL branch | Port | Resume point |
|---|---|---|---|---|
| s06 ROUTE (priority) | path-camera-transition-engineer | `/home/user/wt/s06` `claude/rainbow-s06-match-c30` | 5276 | `&m06route=1` coded → quick BEFORE/NEW → proof `qa/match/06/r28/route/` |
| s07 | water-fx-specialist | `/home/user/wt/s07` `claude/rainbow-s07-match-c30` | 5277 | `&m07fsoft=1` v5 full proof → `qa/match/07/r27/s2_fsoft/`; then `m07coinw` |
| s05 | water-fx-specialist | `/home/user/wt/s05` `claude/rainbow-s05-match-c30` | 5275 | `&m05endr=1` v3 quick check → proof `qa/match/05/r28/s1_endr/` |
| Benny | benny-character-artist | `/home/user/wt/benny` `claude/rainbow-benny-c30` | 5279 | `&b20s06a=1` proof → `qa/benny/r28/s6_star06/` |
| s04 | — FINISHED (K27-B, unapproved) | `/home/user/wt/s04` `claude/rainbow-s04-match-c30` | — | next items wait for a slot |
| s08 | — FINISHED (K23-3, unapproved) | `/home/user/wt/s08` `claude/rainbow-s08-scenery-c30` | — | read-only source for s07 |
| lead07 / lead06 | lead investigations (detached) | `/home/user/wt/lead07`, `/home/user/wt/lead06` | — | kept as restored |
| trial07 | lead tool trial | `/home/user/wt/trial07` `lead/trial07-c30` | — | DevTools / Spector (`tools/lead26/trial07_recovered/NOTES.md`) |
| view04/06/07 | lead clean-frame worktrees | `/home/user/wt/view0N` `lead/view0N-c30` | — | kept as restored |
| 09 / 10 | queued (playable, user r28) | — | — | `docs/briefs/2026-11-20-r28/S0910_R28.md` |
If this account stops: the next account runs `bash docs/briefs/2026-11-20-r29/setup_worker_r30.sh` (LOCAL `-c31` from the newest
`backups/wip/*-c30/`, trial07 + view04/06/07 included).

## Results log
* 18:21 session start; 18:22 first autosave `1e5f29c` verified; worktrees restored 18:30–18:37 and verified 18:38.
* ~18:48 four workers relaunched (s06 route, s07, s05, Benny).

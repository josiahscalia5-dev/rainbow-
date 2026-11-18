# Round 17 (account 17) — coordination of the five playable screens (VISUALS ONLY)

Lead session branch **`ccr-bbe2b27e-oxfh1w`** (session `session_01VCMXoYUDAtThkAJzb9fwd7`, started 2026-11-18 20:16 UTC). The cloud
session was opened on the OLD lead `ccr-5495e9c4-g0apvl` (`77bce73`, 2026-11-17 22:44 UTC); at the user's order "do exactly where we
left off … everything from this GitHub branch" the account-16 lead `ccr-e42bb3c0-jpif8d` @ `e057fe80` (its last save, 20:14 UTC) was
merged into this fresh session branch (`9eea720d`; the old branch's 9 extra commits were backup / transcript autosaves only, no game
code). No specialist branch was merged. Account 16 stopped saving at 20:14 UTC (its six workers were mid-step; their unfinished
edits are in the 20:14 `backups/wip/*-c16/` snapshot on `origin/ccr-e42bb3c0-jpif8d`).

Rules (binding, unchanged): `docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md` (visuals only) +
`docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md` + `docs/briefs/2026-11-18-r11/USER_ORDER_R11_STRICT.md` +
`docs/briefs/2026-11-18-r10/RULES_R10.md` + `docs/briefs/2026-11-18-r8/COMMON_RULES.md`. Launch briefs: the r15 ones in
`docs/briefs/2026-11-18-r15/` (read `-c15` as `-c17`, `r15` log folders as `r17`) + `docs/briefs/2026-11-18-r16/RESUME_R16.md`
(history) + `RESUME_R17.md` in this folder (where each worker stopped at 20:14 UTC).

## Services verified at start (free reads only, 20:25–20:50 UTC)
* Five-minute autosave: daemon running; `backups/autosave.config.json` → `branch` = `ccr-bbe2b27e-oxfh1w`; the account-16 lead and its
  six `-c16` branches added to `protected_branches` (72 protected). Save `1825bf6` pushed, `git ls-remote` == HEAD.
* GitHub: MCP `get_me` OK (`josiahscalia5-dev`); git fetch / push / ls-remote OK through the proxy. A full `git fetch origin` of all
  131 branches times out (> 2 min) — fetch named branches only.
* World Labs: Marble API key (environment secret, host `api.worldlabs.ai`) authenticated, **5,420 credits**; claude.ai connector
  **World Labs Atlas** connected, `list_projects` → "My project" (`proj_ad4fdb076f4a4c80934406cfefc4d30b`), 6 task tools,
  `credits_available: true`. No paid job. fal.ai (`queue.fal.run`, environment secret): fake request → 404 (= key accepted). No paid job.
* Cloud environment `rainbow-` (personal, limited network): the user approved adding `cdn.marble.worldlabs.ai` (Marble world files)
  and `mcp.context7.com` (Context7 plugin) at ~20:47 UTC; already allowed: `download.blender.org`, `dl.google.com`, `lfs.github.com`,
  `v3.fal.media`, `v3b.fal.media`, package registries, MCP servers.
* Plugins (synced from claude.ai): superpowers 7.0.2, playwright (MCP connected), parallax-threejs 0.4.12 (playwright / chrome-devtools /
  threejs-devtools MCP connected; spector MCP fails to start, optional), code-review, feature-dev, frontend-design, claude-code-setup,
  typescript-lsp, context7 (failed at session start: host was blocked, now allowed); local: worldlabs@worldlabs (4 Atlas skills).
  Hugging Face connector: NOT on this account (account 16 had it; optional — DA3 depth maps already in `qa/da3/2026-11-18/`).
* Bootstrap: Blender 5.3.0, Android SDK 34 + build-tools 34.0.0, Java 21, Node 22 / npm 10.9.9, Python QA libs, Playwright Chromium
  (WebGL2), ffmpeg / ImageMagick, tsc + continuity tests: OK. LFS 67/67 local real files. 13/13 references byte-identical.
* QA tool rebuilt: Pixelmatch `/home/user/tools-pixelmatch/pixeldiff.mjs` (pixelmatch 7 + pngjs 7).
* Container: 4 CPU cores, 15 GB RAM.

## Workstream map (six background workers inside the lead container, as in rounds 15–16)
| Screen | Round-17 branch | Started at (= newest -c16 tip + 20:14 WIP) | Agent | Worktree | Port |
|---|---|---|---|---|---|
| 04 | `claude/rainbow-s04-match-c17` | `465e4c59` + WIP (`match04m4.ts` +91) | foam-bubbles-particles | `/home/user/wt/s04` | 5273 |
| 04 test | `claude/rainbow-s04-ringtex-c17` | `3fdcbc0b` + WIP (`match04m4.ts` +19) | washer-environment-modeler | `/home/user/wt/s04b` | 5274 |
| 05 | `claude/rainbow-s05-match-c17` | `34aadd11` + WIP (6 tracked files, 24 untracked shots) | water-fx-specialist | `/home/user/wt/s05` | 5275 |
| 06 | `claude/rainbow-s06-match-c17` | `4b6c637c` + WIP (`match06.ts` +140, `r16_shots.mjs`) | reference-match-director | `/home/user/wt/s06` | 5276 |
| 07 | `claude/rainbow-s07-match-c17` | `669420af` + WIP (`match07.ts`, near tiles, step-2 clip) | water-fx-specialist | `/home/user/wt/s07` | 5277 |
| 08 scenery | `claude/rainbow-s08-scenery-c17` | `6da32d57` + WIP (`match08.ts`, `shots08.mjs`, step-2 raw) | washer-environment-modeler | `/home/user/wt/s08` | 5278 |

Worktrees built by `setup_worker.sh` (this folder) under the autosave lock, sparse (`/qa/pilot05/ /qa/worldlabs/ /qa/imageblaster/
/builds/ /backups/` excluded), `node_modules` → lead checkout. Logs: `qa/match/<NN>/r17/PROGRESS.md` (resume from `r16/PROGRESS.md`).
Merging needs the user's OK. If account 17 runs out: `-c18` branches from each NEWEST `-c17` tip + `backups/wip/` snapshot; never
write `-c17` from another account.

## Progress shown to the user (separate full-size APPROVED / BEFORE / NEW)
| # | Screen / step | Verdict |
|---|---|---|
| (r16 1–6) | see `docs/briefs/2026-11-18-r16/COORDINATION.md` | 08 m08sr, 07 m07foam+coinsz, 06 m06gold, 04 m04rpaint step 3, 04 m04sband: GOOD IMPROVEMENT |

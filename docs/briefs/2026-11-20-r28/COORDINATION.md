# Round 28 — coordination (lead session branch `ccr-9652868f-lkw0w0`, new Claude account, 2026-11-20 from ~16:36 UTC)

User (new account, ~16:36): "RESTORE MY COMPLETE RAINBOW PROJECT ON THIS ACCOUNT, SAVE EVERYTHING EVERY FIVE MINUTES, AND CONTINUE FROM THE
LATEST VERIFIED BACKUP" — source branch **`claude/rainbow-restore-screen-match-ijjdai`** (the r27 lead). Same rules as r27: verified checkpoint +
five-minute autosave first; restore conversations, tools, plugins, ten specialists, every unfinished edit incl. `trial07`, the lead 06 / 07
investigations and `tools/lead26/trial07_recovered/`; continue the latest AUTHORIZED work; at most four specialists at once; nothing is approved
until the user says so; generated "NEW VIEW" / "try" artwork = proposals only; K23-3 = unapproved; the Screen 06 route change = an open question.

## Restore audit (lead, 16:36–17:00 UTC)
* Session branch `ccr-9652868f-lkw0w0` started at **`7d3ba1081f69ced795421d2f3d070ad898e295ba`** (16:15 UTC, the r27 container's last daemon save).
  The hook's `git fetch` failed at start; the lead's retry succeeded: `git ls-remote` of the source = `7d3ba10…` = local HEAD → nothing newer
  existed, nothing merged.
* Real backup gap: r27's last save 16:15 → this session's first save 16:36 UTC (21 min). Nobody was working: the r27 lead and all four workers
  stopped at 16:09–16:13 on the old account's 5-hour limit (HTTP 429 — NOT rejections). The r27 lead ended without an end-of-session save
  (its container closed after the 16:15 automatic save).
* Saved conversations: r27 lead `c05b9d04…` to **16:13:27 UTC** (last user message 15:56:19 approving the extra-view artwork step; last lead
  reply 16:09:41 with three open questions); its five workers to 16:11:44 (Benny), 16:11:47 (s04), 16:12:34 (s05), 16:13:27 (s07); s06 finished
  ~16:05. No user answer to the three questions exists in any saved conversation.
* Worktrees: `docs/briefs/2026-11-20-r27/setup_worker_r28.sh` → LOCAL `-c29` (s04 s07 s06 benny s08 s05 lead07 lead06 trial07) + the three lead
  clean-frame worktrees the r27 recipe did not include (`view04/06/07`, LOCAL `lead/view0N-c29`, same method). **All 12: tracked patch-id MATCH,
  every untracked file byte-identical** to the 16:15 snapshots (s04 1, s07 10, s06 15, Benny 10, s08 2, s05 0, lead07 0, lead06 6, trial07 10,
  view04 1, view06 15, view07 10 untracked; no snapshot skipped a file). s05 has no edits (it only ran one raycast probe before the stop).
* Helper installs rebuilt outside the repo: `/home/user/tools-pixelmatch` (pixelmatch 5.3.0 + pngjs 7 + `pixeldiff.mjs` from
  `docs/briefs/2026-11-18-r16/`), `/home/user/tools-threejs-devtools` (threejs-devtools-mcp 0.5.0), `/home/user/tools-spector` (spectorjs 0.9.33).
* Bootstrap (16:42): LFS 170/170 real (0 pointer stubs; 170/170 on GitHub LFS, 865 MB), references 13/13 byte-identical, 10/10 agent definitions
  unchanged, Blender 5.3.0, Android SDK 34 + Java 21 + Gradle 8.2.1, Node 22.23.5, Playwright Chromium 157 (SwiftShader), ffmpeg 6.1.1, tsc OK,
  continuity OK (07→08 drop 61.19). Its "Resume newest work FAIL" line = the start-time fetch only (fixed by the retry above).

## Services on this account (16:50 UTC)
| Capability | State |
|---|---|
| GitHub (git push + GitHub MCP, login `josiahscalia5-dev`) | working |
| World Labs API key (`api.worldlabs.ai`, proxy-injected) | **working** — live free read 16:45: 5,420 credits. Saved Marble world IDs → 404 for this key (another account's worlds); all their files are in Git LFS |
| World Labs Atlas connector | **working** — project "My project" (`proj_ad4f…`), credits_available = true |
| fal (`queue.fal.run`, proxy-injected) | **working** — unknown-model probe → 404 "application not found" (authenticated, not 401); no paid job run |
| Hugging Face connector | **working** — user `josdois` (current sign-in token expires 18:21 UTC; if Hugging Face tools then fail, reconnect it in claude.ai → Connectors) |
| Context7 | claude.ai connector **working** (resolve-library-id OK); the duplicate plugin MCP asks for a sign-in (not needed) |
| Playwright MCP (plugin) + claude-bridge chrome-devtools MCP | loaded; the Playwright library + Chromium work (all renders use it) |
| Plugins synced from THIS account (14, same publishers as the inventory) | claude-bridge, claude-code-setup, claude-md-management, code-review, code-simplifier, commit-commands, context7, feature-dev, frontend-design, playwright, security-guidance, superpowers, typemux-cc, typescript-native-lsp; + project `worldlabs@worldlabs` installed locally |
| Plugin NOT enabled on this account | `design` (Anthropic, knowledge-work-plugins) — in the catalog; optional, not needed for the game |
| Thrixel | not connected (optional; its one test was NOT AN IMPROVEMENT) |
| GPU | none (SwiftShader CPU rendering); Runpod = NOT authorized (configuration + price must be shown first) |

## Workers — four at once (user-approved limit); in-process background agents of this lead session
| Worker | Agent | Worktree / LOCAL branch | Port | Resume point (from its "(r27) WHERE I STOPPED") |
|---|---|---|---|---|
| s07 | water-fx-specialist | `/home/user/wt/s07` `claude/rainbow-s07-match-c29` | 5277 | `&m07fsoft=1` v2 (drop clouds ×0.82, sunk domes, irregular skirt) → judge vs BEFORE landmarks → proof `qa/match/07/r27/s2_fsoft/` + full NEW clip; then coin column down the drop |
| s04 | washer-environment-modeler | `/home/user/wt/s04` `claude/rainbow-s04-match-c29` | 5273 | step 1 crescent glints (`m04lgcg` clusters, V11/V12) verdict; step 2 cloud banks (C3 pick) + lower pink; step 3 `m04a5v=1` arrows slide under Benny + gameplay + combined whole-04 clip |
| s05 | water-fx-specialist (as in r27) | `/home/user/wt/s05` `claude/rainbow-s05-match-c29` | 5275 | started fresh at r27 16:10 (only a raycast probe at t85): end section → painted winding river + coin trail; hard left bead-foam wall / paddle chunk (check hard right) |
| Benny | benny-character-artist | `/home/user/wt/benny` `claude/rainbow-benny-c29` | 5279 | silk = NOT AN IMPROVEMENT (done); `&b20crown=1` proof → `qa/benny/r27/s5_crown/`; then 06 start star amber |
| s06 | — WAITING FOR USER (step 3 needs the route decision) | `/home/user/wt/s06` `claude/rainbow-s06-match-c29` | 5276 | steps 1 + 2 GOOD IMPROVEMENT (`&m06hole=2&m06fade=1&m06spl=1`, `&m06fcn=3&m06fcg=1`); step 3 only if the user allows the river after the opening to curve left |
| s08 | — FINISHED (K23-3, unapproved) | `/home/user/wt/s08` `claude/rainbow-s08-scenery-c29` | — | read-only source for s07 |
| lead07 / lead06 | lead investigations (detached) | `/home/user/wt/lead07`, `/home/user/wt/lead06` | — | kept as restored |
| trial07 | lead tool trial | `/home/user/wt/trial07` `lead/trial07-c29` | — | DevTools / Spector (`tools/lead26/trial07_recovered/NOTES.md`) |
| view04/06/07 | lead clean-frame worktrees (extra-view artwork) | `/home/user/wt/view0N` `lead/view0N-c29` | — | kept as restored |
Briefs: `LAUNCH_R28.md`. If this account stops: next account runs `bash docs/briefs/2026-11-20-r28/setup_worker_r29.sh` (LOCAL `-c30` from the
newest `backups/wip/*-c29/`, trial07 + view04/06/07 included).

## Open questions to the user (carried from r27 16:09, unanswered)
1. Which of the 31 extra views (fal, $3.72, `qa/review_r27/artwork/`) to approve — proposals until approved. Unusable: 04 g_hard_right, 07 e_end.
2. Screen 06: may the river after the opening curve up to the left like the picture (changes the 06→07 join; tested as a separate version)?
3. Screens 09 and 10: playable or part of the Google Flow videos? (01, 02, 03, 11 = Flow video slots — user ~15:30 r27.)

## Results log
* 16:36 session start; 16:41 first autosave `65e5e49` verified; worktrees restored + verified 16:47–16:50.
* 16:58 restore checkpoint `0cda7f4356918dd78fe5a68594cad18ab6aaa8fe` saved; `git ls-remote` == local HEAD.
* ~17:00 four workers relaunched (s07, s04, s05, Benny) with `LAUNCH_R28.md`. s06 not relaunched (waits for the route answer).
* ~17:05 backup coverage checked: allow-list covers src / assets / references / qa / docs / tools / scripts / backups / android / builds /
  `.claude/agents` + skills + settings; LFS patterns cover .blend .glb .ply .spz .fbx .hdr .exr .ktx2 .psd .mp4 .webm .mov .apk .aab .zip;
  no file > 49 MB outside LFS; worktree snapshots skipped nothing. NOT saved by design: `/home/user/scratch/*` temp renders, the helper installs
  in `/home/user/tools-*` and `node_modules` (reinstallable), hidden reasoning + image payloads in conversation copies, running processes.
  Protected list += the finished r23–r27 lead branches (`claude/rainbow-r22-restore-ut3m39`, `ccr-5be1062a-0ffyej`, `ccr-a9235d04-90cw28`,
  `ccr-08ece3a6-xcwyls`, `claude/rainbow-restore-screen-match-ijjdai`).
  **TRAP (found 16:57):** `claude/rainbow-r22-restore-ut3m39` is the config's own `"branch"` value — putting it in `protected_branches` makes
  EVERY save refuse ("is a protected original branch"). Removed again at once (one manual save refused, no daemon run missed); saved `6be3641`.
  Never add the config's `"branch"` value to the protected list.
* ~17:10 draft PR #25 (DO NOT MERGE, backup only; the create call returned HTTP 502 but the PR exists) — subscribed to its activity.
* ~17:12 the r27 review page (old account's artifact `WVqynQ46…` is NOT readable from this account) republished here from
  `qa/review_r28/index.html` (= `qa/review_r27/index.html` + four status lines updated; pictures/clips from `qa/review_r27/web/`):
  **https://claude.ai/artifact/S7TMhvuzJVvKirMBM88pjX** (private to the owner). Same ratings and extra views as r27; nothing approved.
* **~17:05 USER DECISION: the separate Screen 06 route test is AUTHORIZED** (river curves up-left after the opening into the off-centre
  tunnel; tunnel, camera and 07 connection adjusted; existing assets first; route before any new artwork; BEFORE / NEW proof through the
  actual exit into 07; final approval after the user sees it; all other approvals unchanged). Brief: `S06_ROUTE_R28.md`.
* ~17:08 Benny stopped at a clean point to free the slot (user: 06 has priority within four): step 2 `&b20crown=1` = GOOD IMPROVEMENT (hat
  shape, unapproved; proof `qa/benny/r27/s5_crown/COMPARE/`, gameplay 8/8 + 91); step 3 `&b20s06a=1` (06 start star lighter yellow) code
  written, NOT YET PROVEN (probe stopped 8/20). Best Benny query `…&b20star=1&b20crown=1`. Resume Benny when a slot frees.
* ~17:10 s06 relaunched (path-camera-transition-engineer, `/home/user/wt/s06` `claude/rainbow-s06-match-c29`, port 5276) on the route test.
  Active now: s06 (route), s07, s04, s05.
* ~17:25 USER: **USER SCOPE DECISION (r28, ~17:25 UTC, permanent): 01, 02, 03, 11 = Google Flow videos; 04–10 INCLUDING 09 AND 10 = real playable 3D.** Verbatim + per-screen clarifications (04 / 06 / 09 / 10): `docs/briefs/2026-11-20-r28/USER_CLARIFICATIONS_R28.md`.
  Open question 3 (09 / 10) is ANSWERED: playable. 09 and 10 = new workstreams, queued for the next free slot (06 route test stays the focused
  checkpoint). Screen 04 K27-B (glints `m04lgc…` + cloud banks `m04bbdc…`) GOOD IMPROVEMENT ×2, arrows `m04a5v=2` NOT AN IMPROVEMENT (switch off);
  proof `qa/match/04/r27/s4_combined/`; s04 FINISHED ~17:20. Benny resumed ~17:22 on step 3 (06 start star, `b20s06a`).
* ~17:22 USER: "save everything to my repository, everything, every 5 minutes." Audit: daemon OK, but the loop slept 300 s AFTER each save
  (cadence drifted to ~5 min 15–20 s) and a tick that found the save lock busy was skipped for a whole extra 5 min (no data gap: manual
  saves covered it). `scripts/autosave-daemon.sh` now runs START TO START every 300 s and, when a tick is skipped by the lock (no new row
  in `backups/.live/BACKUP_LOG.md`), retries every 20 s. Swapped atomically, old loop stopped between saves, new loop started via
  `install-autosave-scheduler.sh` (a stale pidfile had to be removed first — the installer briefly saw the exiting pid). One daemon
  (pid 30909); scheduled saving was down ~1 min (last save before 17:20:24, first new save 17:22:05, verified on GitHub).

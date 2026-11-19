# Round 18 — coordination of the playable screens (VISUALS ONLY)

Lead session branch **`ccr-ae71d3a5-80naq2`** (session started 2026-11-19 02:15 UTC from the r17 lead `ccr-bbe2b27e-oxfh1w` @
`d22ec46`, its last save 2026-11-18 21:11 UTC; nothing merged). The account-17 environment closed after that save: no end-of-session
backup, 5.1 h with no environment open (nothing could be saved then; nothing was lost — every worker tip and the 21:11 WIP snapshot
are on GitHub). User's word at start: "Continue" → the r17 plan continues: 04 + 04 ring test, 05, 06, 07; **08 stays PAUSED**.

Rules (binding, unchanged): `docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md` (visuals only) +
`docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md` + `docs/briefs/2026-11-18-r11/USER_ORDER_R11_STRICT.md` +
`docs/briefs/2026-11-18-r10/RULES_R10.md` + `docs/briefs/2026-11-18-r8/COMMON_RULES.md`. Launch briefs: the r15 ones in
`docs/briefs/2026-11-18-r15/` (read `-c15` as `-c18`, `r15` log folders as `r18`) + `RESUME_R18.md` in this folder.

## Services verified at start (free reads only, 02:20–02:45 UTC)
* Five-minute autosave: daemon running; `backups/autosave.config.json` → `branch` = `ccr-ae71d3a5-80naq2`; the r17 lead and its six
  `-c17` branches added to `protected_branches` (79 protected). Save `5ea6292` pushed, `git ls-remote` == HEAD.
* GitHub: MCP `get_me` OK (`josiahscalia5-dev`); named-branch fetch / push / ls-remote OK. The bootstrap's full `git fetch` of all
  branches timed out (known, > 2 min) — fetch named branches only; nothing is merged automatically anyway.
* World Labs: Marble API key authenticated, **5,420 credits**; connector **World Labs Atlas** connected (`list_projects` → "My project",
  6 task tools, `credits_available: true`). fal.ai (`queue.fal.run`): fake request → 404 (= key accepted). No paid job.
* Bootstrap: Blender 5.3.0, Android SDK 34 + build-tools 34.0.0, Java 21, Node 22 / npm 10.9.9, Python QA libs, Playwright Chromium
  (WebGL2), ffmpeg / ImageMagick, tsc + continuity tests: OK. LFS 70/70 local + on GitHub. 13/13 references byte-identical.
* QA tool rebuilt: Pixelmatch `/home/user/tools-pixelmatch/pixeldiff.mjs` (pixelmatch 7 + pngjs 7; copy `docs/briefs/2026-11-18-r16/pixeldiff.mjs`).
  Note: pngjs refuses the approved `references/*.png` (extra bytes after the image end) — use it on game screenshots only.
* Container: 4 CPU cores, 15 GB RAM, 49 GB free disk.

## Workstream map (five background workers inside the lead container)
| Screen | Round-18 branch | Started at (= newest -c17 tip + 21:11 WIP) | Agent | Worktree | Port |
|---|---|---|---|---|---|
| 04 | `claude/rainbow-s04-match-c18` | `ad5fbac5` + WIP (`match04m4.ts` +33 = `m04nband`) | foam-bubbles-particles | `/home/user/wt/s04` | 5273 |
| 04 test | `claude/rainbow-s04-ringtex-c18` | `0f275af1` + WIP (`m04rpvar`, var tiles) | washer-environment-modeler | `/home/user/wt/s04b` | 5274 |
| 05 | `claude/rainbow-s05-match-c18` | `f033f7cc` (+ `KEPT_STEP1.txt`) | water-fx-specialist | `/home/user/wt/s05` | 5275 |
| 06 | `claude/rainbow-s06-match-c18` | `c649fcbc` (no WIP) | reference-match-director | `/home/user/wt/s06` | 5276 |
| 07 | `claude/rainbow-s07-match-c18` | `8651edf9` + WIP (`m07foamb`, `foam.ts`, `waterRibbon.ts`) | water-fx-specialist | `/home/user/wt/s07` | 5277 |
| 08 | PAUSED (user) | `claude/rainbow-s08-scenery-c17` @ `3c0fa970` | — | — | — |

Worktrees built by `setup_worker.sh` (this folder) under the autosave lock, sparse, `node_modules` → lead checkout. Logs:
`qa/match/<NN>/r18/PROGRESS.md`. Merging needs the user's OK. If this account runs out: `-c19` branches from each NEWEST `-c18` tip +
`backups/wip/` snapshot; never write `-c18` from another account.

## Progress shown to the user (separate full-size APPROVED / BEFORE / NEW)
| # | Screen / step | Verdict |
|---|---|---|
| (r17 1–6) | see `docs/briefs/2026-11-18-r17/COORDINATION.md` | 08 m08vh, 07 m07nearw, 04 m04end, 04 m04rpdots, 06 m06fclu, 05 m05trans: GOOD IMPROVEMENT |
| 1 (~03:05) | 04 r18 step 2 `&m04nband=1` near-water bands round Benny (s04 `31372d6`) | GOOD IMPROVEMENT (worker + lead at full size): the plain cyan sheet round Benny inside the tunnel now carries glossy pink and cyan streaks sweeping in on both sides (f03 → t95, steering), arrow lane stays cyan; start view 0 px; no tearing in the clip. Still: straight stripes where the painting sweeps in S-curves under Benny; long straight corridor of thin rings — `qa/review_r18/04_step2_nband/` |
| 2 (~03:15) | 04 ring test step 6 `&m04rpvar=1` on K5 (s04tex `9eb27e6e`) | GOOD IMPROVEMENT (small–moderate, ring colour; worker + lead at full size): the inner rings are no longer one plain copper — the first ring inside and every few rings deeper carry the painted soft pink-violet sheen and violet glints on the lower walls beside the water (clearest t66, f06); notched first-ring lip fixed; start view 0 px. Still: painted rings brighter, more contrasty (white-hot highlights, deeper grooves) → step 7 — `qa/review_r18/04_rings_step6_sheen/` |
| 3 (~03:30) | 07 r18 step 3 `&m07foamb=1` (s07 `48d2ae6e`) | GOOD IMPROVEMENT (small; worker + lead at full size; only in the drop, which the approved picture does not show): the two tall white lather walls that restarted half-way down the drop are gone from the lower / middle view (t72–t88; their far tops remain), purple tube + gold rings + pink/cyan banks show instead; 05/06/07/08 start views 0 px, gameplay 8/8, 91 coins. Next s07: thick S-curve magenta bands + puffy foam clouds on the level stretch (the approved view) — `qa/review_r18/07_step3_foamb/` |

## User ~03:20 UTC: "Make my screen 4 exactly like the approved screen what is so hard"
Lead answer: the start view already IS the painting (the user's own pixels); within a moment of swimming the scenery turns into a long
straight corridor of many thin copper rings + flat water + big foam heaps — the biggest gap, and exactly what the binding goal forbids
("FEW, THICK, polished yellow-gold rings", "no generic orange ring corridor", "no giant foam walls"). Both 04 workers redirected:
s04tex → step 7 ring STRUCTURE (few thick yellow-gold telescoping bands; polish on hold); s04 → S-curve river, river curving up the
sides, low foam instead of heaps. Pictures: `qa/review_r18/04_where_it_drifts/`.

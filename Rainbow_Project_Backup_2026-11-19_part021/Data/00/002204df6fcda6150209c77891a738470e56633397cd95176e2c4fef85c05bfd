# Round 15 (account 15) — coordination of the five playable screens (VISUALS ONLY)

Lead session branch **`ccr-47b10cec-03c7co`** (session started from the account-14 lead `ccr-6c7564b1-fmlt1w` @ `58b94d9`, its newest
commit, 17:43 UTC; nothing merged). Started 2026-11-18 ~18:12 UTC. Account 14 stopped at ~17:46 UTC (usage limit; its three
workers were cut off; `backups/wip/` snapshots at 17:45–17:46 show NO unfinished code edits, only a few 05 "before" screenshots).
Rules unchanged (binding): `docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md` + `docs/briefs/2026-11-18-r11/USER_ORDER_R11_STRICT.md`
+ `docs/briefs/2026-11-18-r10/RULES_R10.md` + `docs/briefs/2026-11-18-r8/COMMON_RULES.md`. Launch briefs (complete, reusable):
`S04_LAUNCH.md`, `S05_LAUNCH.md`, `S08_LAUNCH.md` in this folder. Four GitHub 3D tools: `GITHUB_3D_TOOLS.md`.

## Services verified at start (free reads only, ~18:15–18:30 UTC)
* Five-minute autosave: daemon running (re-armed by the SessionStart hook); `backups/autosave.config.json` → `branch` =
  `ccr-47b10cec-03c7co`; the account-14 lead and its three `-c14` branches added to `protected_branches` (58 protected). Saves
  `8224dd2` / `f4cd769` pushed, `git ls-remote` == HEAD.
* GitHub: git proxy fetch / push / ls-remote OK (the hook's 18:12 fetch failure was transient). SHALLOW clone: fetch branch tips ONE AT
  A TIME with `git fetch --depth=1 origin +<b>:refs/remotes/origin/<b>` (a tip can take minutes; LFS 63/63 OK).
* World Labs Marble: key injected by this account's environment (no form needed) → authenticated, **5,420 credits**; Screen 08 world
  `32b5b2f4-…` → 200. No paid job started.
* World Labs Atlas: claude.ai connector **NOT connected on this account** (ListConnectors: none at all). Plugin `worldlabs@worldlabs`
  0.2.2 with the four skills installed. Pending 04 Atlas test NOT submitted (price unknown; see `GITHUB_3D_TOOLS.md`).
* fal.ai: key injected for `queue.fal.run` → request `01a1ea70-42d8-7943-b035-7bb5f129d872` **COMPLETED** (= the purchased account;
  fal exposes no balance read with this key — the balance is on fal.ai → Billing).
* Hugging Face: public `depth-anything/DA3-LARGE` → 200; no token; claude.ai connector not connected. DA3 is not installed in the
  container (no torch) — not needed now: depth maps of all five approved pictures are saved in `qa/da3/2026-11-18/`.
* Blender 5.3.0, Android SDK 34 + build-tools 34.0.0, Java 21, Node 22 / npm ci, Playwright Chromium (WebGL2) + Playwright MCP,
  GitHub MCP, ffmpeg / ImageMagick, tsc + continuity tests: OK (bootstrap 18:12 UTC run; see `backups/BOOTSTRAP_REPORT.md`).
  13/13 approved references byte-identical. context7 MCP needs auth (not used).

## Connections re-verified at the user's request (~18:31 UTC, free reads only, no paid task)
* Hugging Face MCP (claude.ai connector, now connected): CONNECTED — `hf_whoami` = user `josdois` (OAuth, scopes read-repos /
  inference-api / jobs / contribute-repos, token expires 2026-11-19 02:28 UTC); model search works (DA3-LARGE, DA3-SMALL, DA3-BASE,
  DA3-LARGE-1.1); enabled Spaces listed by `dynamic_space discover` (19, incl. `prithivMLmods/SAM3-Demo` = SAM 3 masks on HF GPUs,
  `not-lain/background-removal`, FLUX / Qwen image editors).
* World Labs Atlas (claude.ai connector "World_Labs_Marble", now connected): CONNECTED — `list_projects` → "My project"
  (`proj_ad4fdb076f4a4c80934406cfefc4d30b`, Personal workspace), tools atlasChisel, atlasGenerate, atlasTextToImage,
  images2PosedRGBD, posedImages2Splats, splats2Mesh, `credits_available: true`. No task started.
* World Labs Marble Developer API (environment-injected key, unchanged): CONNECTED — 5,420 credits; existing world
  `32b5b2f4-…` "rainbow-08-final-spin-chamber" readable (mesh, imagery, splats). The two Screen 05 pilot worlds were made under
  another key (Account B) → 404 with this key; their files are in Git LFS (`qa/worldlabs/`).

## Workstream map (three workers inside the lead container; rotation 07 → 06 next)
| Screen | Round-15 branch | Started at (= newest round-14 tip) | State |
|---|---|---|---|
| 04 | `claude/rainbow-s04-match-c15` | `fc28323a` (r14 step 9 L4 entrance foam) | RUNNING `foam-bubbles-particles` (`s04`, lead-directed), worktree `/home/user/wt/s04`, brief `S04_LAUNCH.md`: foam clusters → interior thick rings (measure first) → pink side swirls; log `qa/match/04/r15/PROGRESS.md` |
| 04 test | `claude/rainbow-s04-ringtex-c15` | `fc28323a` | RUNNING `washer-environment-modeler` (`s04tex`), worktree `/home/user/wt/s04b`, brief `S04B_RINGTEX_LAUNCH.md`: user-requested controlled test `&m04rpaint` = the painted rings unwrapped from the approved picture onto every 3D ring band (s04 worker skips its ring task) |
| 05 | `claude/rainbow-s05-match-c15` | `34aadd11` (r14 step 3 m05bank) + untracked step-4 BEFORE shots | RUNNING `water-fx-specialist` (`s05`), worktree `/home/user/wt/s05`, brief `S05_LAUNCH.md`: 05 → 06 transition, then (lead note) smeared left wall + cut gold-ring chunk at hard left, m05bank column, V glints; log `qa/match/05/r15/PROGRESS.md` |
| 08 scenery | `claude/rainbow-s08-scenery-c15` | `df4a3bb7` (r14 step 1 m08nq) | RUNNING `washer-environment-modeler` (`s08`), worktree `/home/user/wt/s08`, brief `S08_LAUNCH.md`: step-1 leftovers → wall seams → river-edge foam + coin line → spout cups → cup band V; log `qa/match/08/r15/PROGRESS.md` |
| 07 | `claude/rainbow-s07-match-c15` | `dbc7678c` (= -c11/-c9/-c8) | RUNNING `water-fx-specialist` (`s07`, user asked ~18:45 to work on the other screens too), worktree `/home/user/wt/s07`, brief `S07_LAUNCH.md`: finish round-8 m07foam + m07coinsz proofs → near water → foam-bank colour / plunge lip; log `qa/match/07/r15/PROGRESS.md` |
| 06 | `claude/rainbow-s06-match-c15` | `8182130c` (-c11) | RUNNING `reference-match-director` (`s06`), worktree `/home/user/wt/s06`, brief `S06_LAUNCH.md`: fresh ranked audit → fix materials / parts one at a time → ONE illustrated forced-perspective proposal for the user (never another bend); log `qa/match/06/r15/PROGRESS.md` |

Merging needs the user's OK. If account 15 runs out: `-c16` branches from each NEWEST `-c15` tip; never write `-c15` from another account.
TRAP (still valid): a user message that interrupts the lead's turn can cancel the background workers — check `git -C /home/user/wt/s0N
log -1` + `ps` and relaunch from the brief + PROGRESS.md.

## Progress shown to the user (separate full-size APPROVED / BEFORE / NEW)
| # | Screen / step | Verdict |
|---|---|---|
| 1 (~18:25) | 08 r14 step 1 `m08nq` (near water at the painted scale; kept by account 14, not shown before) | GOOD IMPROVEMENT (small; lead checked by eye): painted-size white glints and the pink band continuing down the left replace big blurry white flames; still straight, slightly combed streaks at the bottom left (painted: sweeping curves) — `qa/review_r15/08_step1_near_water/` |
| 2 (~18:25) | 05 r14 step 3 `m05bank` (bubbly near bank; kept by account 14, not shown before) | GOOD IMPROVEMENT (small): the flat pale slab at the kink becomes piled foam bubbles; the same frame shows the much bigger 05 problem (smeared left wall at hard left) → assigned — `qa/review_r15/05_step3_bubbly_bank/` |

## DISK TRAP (account 15, ~18:50 UTC) — read before creating worktrees
The session's writable-disk allowance is ~40 GB. Five full worktrees (2.5–3.6 GB each, mostly `qa/pilot05` 1.5 GB, `qa/worldlabs`,
`qa/imageblaster`, `builds/`, `backups/` and smudged LFS binaries) filled it: the 06 worktree failed with "No space left on device".
Fix (no work lost, everything stays in git and in the lead checkout): every worker worktree uses a per-worktree sparse checkout
without those folders (none of them is used by the game or the capture tools):
`printf '/*\n!/qa/pilot05/\n!/qa/worldlabs/\n!/qa/imageblaster/\n!/builds/\n!/backups/\n' | git -C <wt> sparse-checkout set --no-cone --stdin`
(new worktrees: `git worktree add --no-checkout <wt> <branch>`, then the sparse-checkout line, then `git -C <wt> checkout <branch>`).
NEVER apply it to the lead checkout (the autosave writes `backups/`). Result: 3.5 → 1.5 GB per worktree, 1.5 → 13 GB free.

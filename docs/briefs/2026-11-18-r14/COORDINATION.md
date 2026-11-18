# Round 14 (account 14) — coordination of the five playable screens (VISUALS ONLY)

Lead session branch `ccr-6c7564b1-fmlt1w` (session started from the account-13 lead `claude/rainbow-restore-autosave-1mgga0` @
`6d6e669`; that branch later got one more account-13 autosave `624c920` (16:20 UTC) with only transcript / backup-status files —
its newer lead transcript `db1282e5…/transcript.sanitized.jsonl` was copied in; NO code merged). Started 2026-11-18 ~16:22 UTC.
Account 13 stopped at ~15:48 UTC (its 5-hour usage limit; both specialists were cut off at the same moment).
Rules unchanged (binding): `docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md` + `docs/briefs/2026-11-18-r11/USER_ORDER_R11_STRICT.md`
+ `docs/briefs/2026-11-18-r10/RULES_R10.md` + `docs/briefs/2026-11-18-r8/COMMON_RULES.md`. Launch brief:
`docs/briefs/2026-11-18-r13/SPECIALIST_PROMPT_TEMPLATE.md` (read "-c13" as "-c14", "r13" as "r14").

## Services verified at start (free reads only, ~16:30 UTC)
* Five-minute autosave: daemon running; `backups/autosave.config.json` → `branch` = `ccr-6c7564b1-fmlt1w`; the account-13 lead and
  its three `-c13` specialist branches added to `protected_branches`. Manual save `7cd8786` pushed, `git ls-remote` == HEAD.
* GitHub: git proxy push / ls-remote OK; GitHub MCP `list_branches` OK. SHALLOW clone: fetch branch tips ONE AT A TIME with
  `git fetch --depth=1 origin +<b>:refs/remotes/origin/<b>` (parallel fetches collide on `.git/shallow.lock`).
* World Labs: this account's environment injects the key (no form needed) → authenticated, 5,420 credits; Screen 08 world
  `32b5b2f4-32bc-4fa5-80a5-861129a528c8` → 200. The Atlas MCP (plugin `worldlabs`) needs a sign-in on this account (not available
  to Claude; not needed for the visual work). No paid job started.
* fal.ai: key injected for `queue.fal.run` → request `01a1ea70-42d8-7943-b035-7bb5f129d872` COMPLETED (= the purchased account).
* Hugging Face: public model `depth-anything/DA3-LARGE` → 200; `whoami` → 401 (no token; not needed for public models). The HF
  claude.ai connector is NOT connected. DA3 depth maps of all five approved pictures: `qa/da3/2026-11-18/depth_npz/`.
* Blender 5.3.0, Android SDK 34 + build-tools 34.0.0, Java 21, Node 22 / npm ci, Playwright Chromium (WebGL2) + Playwright MCP,
  ffmpeg / ImageMagick, tsc + continuity tests: all OK (bootstrap 16:27 UTC). 13/13 approved references byte-identical.

## World Labs Atlas (verified ~17:15 UTC, free reads only)
* claude.ai connector `World_Labs_Atlas` (https://api.atlas.worldlabs.ai/mcp) connected by the user on account 14: `list_projects`
  → project "My project" (`proj_ad4fdb076f4a4c80934406cfefc4d30b`, Personal workspace), tools atlasChisel / atlasGenerate /
  atlasTextToImage / images2PosedRGBD / posedImages2Splats / splats2Mesh, `credits_available: true` (amount not reported).
* Atlas REST (`api.atlas.worldlabs.ai`) without a key → 401: this environment injects only the Marble key (`api.worldlabs.ai`);
  the connector needs no key. `worldlabs` CLI not installed (npm `@worldlabsai/cli` 0.6.0; only needed with an Atlas key).
* Plugin `worldlabs@worldlabs` 0.2.2 = `worldlabsai/skills` HEAD `6cdb6b9` (skills atlas-blender, atlas-splats, atlas-flythrough,
  worldlabs-cli) — current, not reinstalled. Marble key + fal key untouched.
* Prices: docs publish only splats (refined 5,000 credits, draft 500; 1,000 credits = US$1); atlasGenerate / images2PosedRGBD
  prices are on the account's rate card (atlas.worldlabs.ai → Settings → Developer Platform). NO paid Atlas task started.

## Workstream map (two specialists + the lead's own 04 rebuild; rotation 05 + 08 now → 07 → 06)
| Screen | Round-14 branch | Started at (= newest round-13 tip) + WIP | State |
|---|---|---|---|
| 04 | `claude/rainbow-s04-match-c14` | `9ef21200` + account-13 WIP `&m04a3lum` (luminous arrow layer) → committed `c69b7f33` | LEAD, worktree `/home/user/wt/s04`, log `qa/match/04/r14/` |
| 05 | `claude/rainbow-s05-match-c14` | `ebc9676c` + account-13 WIP `&m05vee=1` → committed `9735443d` | RUNNING water-fx-specialist (`s05`), worktree `/home/user/wt/s05`, log `qa/match/05/r14/PROGRESS.md` (first commit `0dbe931b`) |
| 08 scenery | `claude/rainbow-s08-scenery-c14` | `71e7cf54` + helper `tools/match08/nq08.py` → committed `e36430c4` | RUNNING washer-environment-modeler (`s08`), worktree `/home/user/wt/s08`, log `qa/match/08/r14/PROGRESS.md` (first commit `b62b9c34`) |
| 07 | (`-c11` = `-c9` `dbc7678c`) | — | READY next slot |
| 06 | (`-c11` `8182130c`; bend method rejected twice — never repeat) | — | READY after 07 |

Merging needs the user's OK. If account 14 runs out: `-c15` branches from each NEWEST `-c14` tip; never write `-c14` from another account.
TRAP (still valid): a user message that interrupts the lead's turn cancels the background specialists — check and relaunch.

## Progress shown to the user (separate full-size APPROVED / BEFORE / NEW)
| # | Screen / step | Verdict |
|---|---|---|
| 1 (~16:50) | 04 lead step 6 G5 luminous arrows (`m04a3lum` on top, brighter rim; s04-c14 `450d211b`) | GOOD IMPROVEMENT (small): arrows clearly whiter / brighter with bold edges while swimming and steering; still paler water round them than painted (no deep-blue lane, no cyan glow) — `qa/review_r14/04_step6_glow_arrows/` |
| 2 (~17:00) | 05 step 1 `m05vee` (account-13 unfinished near-water V; s05-c14 `448d3f32`) | NOT AN IMPROVEMENT (left pink band behind Benny closer, but right half of the painted V missing, flat magenta mass at f06/f10, new pale-violet slab at hard right) — reverted, patch kept in `qa/match/05/r14/step1_m05vee/`; next `m05vee2` (corrected method) |
| 3 (~17:35) | 05 step 2 `m05vee2` (painted pink V behind Benny; s05-c14 `e5c4e7f2`) | GOOD IMPROVEMENT (lead checked by eye): hot-pink satin bands from Benny to the lower corners with cyan + white glints between, follows Benny; hard left / right smears gone — `qa/review_r14/05_step2_painted_V/` |
| 4 (~17:35) | 04 lead steps 7 + 8 (deep-blue lane H/I series, pink side bands J/K series; s04-c14 `da40a708`) | NOT AN IMPROVEMENT (too subtle, or flat royal-blue patch at hard left; sides lost their pink) — not shown, switches off |
| 5 (~17:55) | Atlas test for 04 (user approved up to 5,000 credits IF the price is verified first) | NOT SUBMITTED: atlasGenerate price is not in the docs or the connector; user to read it on the Atlas rate card. 0 credits spent. Account-14 setup snapshot `backups/claude-config/2026-11-18-account14/` + `TOOL_MANIFEST.json` → `account14_2026_11_18` |

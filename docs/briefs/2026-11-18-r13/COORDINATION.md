# Round 13 (account 13) — coordination of the five playable screens (VISUALS ONLY)

Lead session branch `claude/rainbow-restore-autosave-1mgga0` (session started from the account-12 lead `ccr-e908f8da-cy4yc1` @
`d256bc4`, which equals that branch's remote tip — nothing merged). Started 2026-11-18 ~14:00 UTC.
Rules unchanged (binding): `docs/briefs/2026-11-18-r8/COMMON_RULES.md` + `docs/briefs/2026-11-18-r10/RULES_R10.md` +
`docs/briefs/2026-11-18-r11/USER_ORDER_R11_STRICT.md` (read "-c8/-c10/-c11/-c12" as "-c13"). Specialist launch brief:
`docs/briefs/2026-11-18-r13/SPECIALIST_PROMPT_TEMPLATE.md`.

## Services verified at start (free reads only, ~14:05–14:30 UTC)
* Five-minute autosave: daemon running (pid in `backups/.live/`); this branch had never been pushed — the daemon's first save
  `9838ddb` (14:09) and `47878b9` (14:20) pushed, `git ls-remote` == HEAD both times.
* GitHub: git proxy works for push / ls-remote. The local clone is SHALLOW: a plain `git fetch` of another branch downloads the
  whole history (> 2 GB, times out). Use `git fetch --depth=1 origin <branch>:refs/remotes/origin/<branch>` (≈ 0.5–1 GB per branch,
  several minutes each because of committed screenshots).
* World Labs: this NEW account's environment had NO network secrets. Free read → HTTP 401 → key re-entered by the user through the
  secure form (host `api.worldlabs.ai`, header `WLT-Api-Key`) → authenticated, 5,420 credits; Screen 08 world `32b5b2f4…` → 200.
  Atlas connector (claude.ai) connected: project "My project", credits available. No paid job started.
* fal.ai: no key in the new environment → re-entered through the secure form (`queue.fal.run`, `Authorization: Key …`) → request
  `01a1ea70-42d8-7943-b035-7bb5f129d872` COMPLETED (= the purchased account). No new paid jobs.
* Hugging Face: direct Hub reads work without login (model `depth-anything/DA3-LARGE` → 200); `whoami` → 401 (no HF token, none
  needed for public models). The Hugging Face claude.ai connector is NOT installed on this account (user must connect it on claude.ai
  if wanted). Stable Virtual Camera + ViewCrafter Spaces → RUNTIME_ERROR (Hugging Face side, same as rounds 11 + 12).
* Depth Anything 3: not reinstalled; all five approved pictures' depth maps are in `qa/da3/2026-11-18/depth_npz/`.

## Workstream map (two specialists + the lead's own 04 rebuild; rotation 05 + 08 now → 07 → 06)
| Screen | Round-13 branch | Started at (= newest round-12 tip) + WIP | State |
|---|---|---|---|
| 05 | `claude/rainbow-s05-match-c13` | `24877989` + account-12 WIP (wall-slot capsule fix in `proj05Tunnel.ts`, `waterRibbon.ts`; unverified) | RUNNING water-fx-specialist, worktree `/home/user/wt/s05`, log `qa/match/05/r13/` |
| 08 scenery | `claude/rainbow-s08-scenery-c13` | `05ed1bee` (+ WIP = screenshot moves only) | washer-environment-modeler, worktree `/home/user/wt/s08`, log `qa/match/08/r13/` |
| 04 | `claude/rainbow-s04-match-c13` | `4a8f1860` + account-12 WIP `&m04arr3d=1` (five chevrons as real geometry on the lane; variants C1 C2 D1 D2 rendered, not judged) | LEAD, worktree `/home/user/wt/s04`, log `qa/match/04/r13/` |
| 07 | (`-c11` = `-c9` `dbc7678c`) | — | READY next slot |
| 06 | (`-c11` `8182130c`; bend method rejected twice — never repeat) | — | READY after 07 |

All `-c12` branches and `ccr-e908f8da-cy4yc1` are now in the autosave's `protected_branches`. Merging needs the user's OK.
If account 13 runs out: `-c14` branches from each NEWEST `-c13` tip (or `-c12` where no `-c13` commit was added).

## Progress shown to the user (separate full-size APPROVED / BEFORE / NEW)
| # | Screen / step | Verdict |
|---|---|---|
| 1 (~14:40) | 05 step 1 `m05slot` (account-12 wall-slot capsule edit; `c3fe9423`) | NOT AN IMPROVEMENT (far bays crisper, but near the wall the painted slot blobs stay as a ghost grid = doubled slots while steering) — reverted, patch kept in `qa/match/05/r13/step1_m05slot/` |
| 2 (~14:55) | 05 step 2 `m05join` (`3b396a91`) | GOOD IMPROVEMENT (lead checked by eye: at t66 / k81 the pale slab and straight line across the far river are gone; pink bands + cyan core run unbroken) — `qa/review_r13/05_step2_join/` |
| 3 (~14:55) | 08 step 1 `m08bore&m08flange` (`f7dc9625`) | GOOD IMPROVEMENT, small (lead checked: top-left gold ring now curves smoothly while swimming instead of a hard diagonal edge + slot band) — `qa/review_r13/08_step1_ring_edge/` |
| 4 (~14:55) | 04 lead step 2 `m04arr3d` E4 (`5ecdbd1e`) | GOOD IMPROVEMENT (arrows only): white-cyan chevrons visible down the lane above Benny while swimming and steering (BEFORE none); still pale vs painted neon; tunnel still a dense orange ring corridor + ribbed water sides = next — `qa/review_r13/04_step2_arrows/` + 2.2 s real-gameplay clip |

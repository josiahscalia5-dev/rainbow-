# Round 24 — coordination (lead session branch `ccr-5be1062a-0ffyej`, 2026-11-20 from ~10:30 UTC)

Lead = this session (started from the r23 lead `claude/rainbow-r22-restore-ut3m39` @ `4209ec3`). User: "Continue where we exactly left
off … make sure all the agents, tools, the Marble World Labs … the Hugging Face … everything … enabled and working on this session".
→ the r23 lead's final save `a735ec7` (10:25, a direct descendant: one more autosave after this session's start) merged into this
branch (`ecc22ac`; same precedent as round 17). Nothing else merged.

## Restore audit (lead, ~10:35 UTC)
* Round 23 stopped at **10:19 UTC**: the account's 5-hour limit (HTTP 429) stopped the lead and all four workers mid-step (s04, s07,
  s08, Benny). Just before, the lead had sent the user the complete labelled Screen 07 clip (`qa/match/07/r23/lead_clip/`).
* Hook: `git fetch` failed once at session start (network); GitHub reachable at 10:31, autosave pushed this branch (remote = local).
* Worktrees: `docs/briefs/2026-11-20-r24/setup_worker_r24.sh` = r23 base commit + 10:25:53 snapshot `backups/wip/<branch>-c24/`
  for s04, s07, s06, Benny, s08, s05 and the lead's 07 clip worktree; dirty-file counts identical to each snapshot's INFO.json.
* Services (free reads only): World Labs key OK (5,420 credits); Atlas connector OK (`My project`, credits available); Hugging Face
  connector OK (`josdois`); fal OK (status read HTTP 200); GitHub MCP OK (`josiahscalia5-dev`); Playwright MCP + local Chromium OK;
  Blender 5.3.0; Android SDK 34; 10 / 10 specialist definitions; 13 / 13 references. Context7 needs a sign-in (user action).
* Pixel tool rebuilt: `/home/user/tools-pixelmatch/pixeldiff.mjs` (pixelmatch 5.3.0). Machine: 4 CPUs.

## Workers (four at once, user-approved) — in-process background agents of this lead session
| Worker | Agent | Worktree / LOCAL branch | Port | Task |
|---|---|---|---|---|
| s07 | water-fx-specialist | `/home/user/wt/s07` `claude/rainbow-s07-match-c25` | 5277 | user note ~10:35 (S-bends, steering view, 07→08 join) |
| s04 | washer-environment-modeler | `/home/user/wt/s04` `claude/rainbow-s04-match-c25` | 5273 | resume steps 2–3 |
| s08 | washer-environment-modeler | `/home/user/wt/s08` `claude/rainbow-s08-scenery-c25` | 5278 | resume `m08gl` clips, `m08coinsz`, `m08towelm` |
| Benny | benny-character-artist | `/home/user/wt/benny` `claude/rainbow-benny-c25` | 5279 | resume felt star, knit, fur |
| s06 | — (finished in r23) | `/home/user/wt/s06` `claude/rainbow-s06-match-c25` | 5276 | lead: opening-ripple test; crest / river / coin trail next slot |
| s05 | — queued | `/home/user/wt/s05` `claude/rainbow-s05-match-c25` | 5275 | |
Briefs: `LAUNCH_R24.md` (this folder). If this account runs out: `-c26` LOCAL branches from the newest `backups/wip/*-c25/` snapshot.

## Results log
* **~10:35 USER (verbatim)** on the lead's labelled Screen 07 clip — see `LAUNCH_R24.md` § s07 (S-bends for the WHOLE river; route
  ahead visible while steering at t = 2.5–3.5 s; the water + foam-bank join at t = 7.25–8 s; transition must use the latest 08; keep the
  fuller foam; then the same labelled sequence). Lead finding: the r23 clip query had NO `match08` switches → its 08 entry showed the
  OLD default 08; the latest 08 = K16 & `m08gl=1`.
* ~10:40 four workers relaunched (s07, s04, s08, Benny). Lead: Screen 06 opening-ripple comparison `qa/match/06/r24/lead_rip/`
  (no ripple / current ripple / V1 / V2 at 3 / 7 / 12 % of 06; r23 V2 render had produced no shots).
* ~10:58 USER asked for a complete review package for ChatGPT ("CLAUDIA — EXPORT MY COMPLETE RAINBOW APP FOR REVIEW"). Lead built
  it from ONE commit `bf01adf` (11:07:52 UTC; first freeze `e71b45b` 11:00 superseded when s08 finished): builder
  `tools/export/make_review_package.py`, zip + extraction test `docs/review_package/2026-11-20/zip_and_test.py`; README, manifest,
  verification and clip index copied to `docs/review_package/2026-11-20/`. ZIPs (core + 5 asset parts, each < 512 MB) live only in
  the session scratchpad (not committed: GitHub LFS quota).
* ~11:05 s08 FINISHED 3 steps (worker: small GOOD each): `m08gl`, `m08coinsz`, `m08towelm&m08towelv` → candidate **K23-3**
  (`qa/match/08/r23/QUERY_CANDIDATE_K23-3.txt`); s07 told to use K23-3 as "the latest Screen 08".
* Screen 06 cone diagnosis (lead): the cone = the hole where the painted Benny was cut out of the projected plate (filled with the
  river's own water, hard edge) + the painted ring left behind — `qa/match/06/r24/lead_rip/NOTES.md`; fix in progress.

# Round 25 — coordination (lead session branch `ccr-a9235d04-90cw28`, new Claude account, 2026-11-20 from ~11:54 UTC)

User (new account): "RESTORE MY COMPLETE RAINBOW SETUP AND CONTINUE WHERE MY PREVIOUS ACCOUNT STOPPED" — starting branch
`ccr-5be1062a-0ffyej`; restore instructions, saved chat history, connectors, plugins, tools, specialists; continue 07 → 06 → 04 → Benny,
preserve 08 K23-3, 05 per open items; recover the ChatGPT review package. Authorizations unchanged: useful paid artwork (record job + cost),
up to four specialists at once. Nothing is approved until the user says so.

## Restore audit (lead, 11:54–12:10 UTC)
* Session branch `ccr-a9235d04-90cw28` starts at `36bc5332f9b48cf6b638b943b2e7f1eb55b40e8c` = the latest commit of `ccr-5be1062a-0ffyej`
  on GitHub (r24's last daemon save, 11:43 UTC). Nothing merged.
* Hook: `git fetch` failed once at session start (network); retried OK at ~12:00. Autosave on this branch: `AUTOSAVE OK … (match)`.
* Saved conversations recovered: r24 lead `b7c4382b…` to **11:17:57 UTC** (+ 4 worker transcripts, s08 to 11:05:56, s07 / s04 / Benny to
  11:12:11 = the user's interrupt); daemon saves continued to 11:43; gap 11:43 → 11:54 (no session open).
* Worktrees: `setup_worker_r25.sh` = base commits + 11:43:21 snapshots → LOCAL `-c26` branches; modified-file counts identical to each
  INFO.json (s04 3, s07 5, s06 2, Benny 10, s08 3, s05 0, lead07 2, lead06 2).
* The lead's r24 Screen 06 test code (`m06ripz`, `m06wdbg`) copied from `/home/user/wt/lead06/src/world/match06.ts` into the s06 worktree
  (lead06 = s06 + those additions only; verified by diff).
* Pixel tool rebuilt `/home/user/tools-pixelmatch/pixeldiff.mjs`. New: `tools/lead25/render_slot.sh` (2 machine-wide render slots; 4 CPUs).
* Services: see `backups/AGENTS_STATUS.json` → `round25.services_12_00`.

## Workers (four at once, user-approved) — in-process background agents of this lead session
| Worker | Agent | Worktree / LOCAL branch | Port | Task |
|---|---|---|---|---|
| s07 | water-fx-specialist | `/home/user/wt/s07` `claude/rainbow-s07-match-c26` | 5277 | user note ~10:35: S-bends `m07swing`, steering view `m07look`, 07→08 join with K23-3, labelled clip |
| s06 | path-camera-transition-engineer | `/home/user/wt/s06` `claude/rainbow-s06-match-c26` | 5276 | opening blue cone fix + owed APPROVED / CURRENT / NEW; then crest / winding river / curved coin trail |
| s04 | washer-environment-modeler | `/home/user/wt/s04` `claude/rainbow-s04-match-c26` | 5273 | labelled whole-04 clip K23-S3 vs K23-1; glints, ribbon contrast, far foam banks, `m04mp` projection |
| Benny | benny-character-artist | `/home/user/wt/benny` `claude/rainbow-benny-c26` | 5279 | finish felt star `b20star`; silky combed fur `b20silk`; next difference |
| s08 | — FINISHED r24 (K23-3) | `/home/user/wt/s08` `claude/rainbow-s08-scenery-c26` | — | read-only source for s07's combined 07→08 build |
| s05 | — queued | `/home/user/wt/s05` `claude/rainbow-s05-match-c26` | 5275 | |
Briefs: `LAUNCH_R25.md` (this folder). If this account stops: next account recreates `-c27` LOCAL branches from the newest
`backups/wip/*-c26/` snapshots (same recipe as `docs/briefs/2026-11-20-r24/setup_worker_r25.sh` with `-c25` → `-c26` sources).

## Results log
* ~12:10 four workers launched (s07, s06, s04, Benny).

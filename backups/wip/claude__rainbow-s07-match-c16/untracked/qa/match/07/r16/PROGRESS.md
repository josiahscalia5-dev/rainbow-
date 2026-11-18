# Screen 07 · round 16 (account 16) — progress log

Branch `claude/rainbow-s07-match-c16` (worktree `/home/user/wt/s07`), start `dbc7678c` + the round-15 worker's unfinished files
(`qa/match/07/r15/step1/` t95 shots, `tools/match07/audit_r15.mjs`, `tools/lead_r13/swim_clip.mjs`, `tools/match07/near_tiles_r15.py`).
Brief: `docs/briefs/2026-11-18-r15/S07_LAUNCH.md` + `docs/briefs/2026-11-18-r16/RESUME_R16.md` (s07). User order: VISUALS ONLY
(`docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md`). Nothing is approved until the user says so.

Kept set K (round 7, M3): `match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1&m07tube=1&m07ring=1` (`K.txt`).
APPROVED picture (copy of `references/07_dive_the_washer_tube.png`, sha256 75782e38…): `APPROVED_07.png`.
Shots: `tools/match07/audit_r15.mjs` / `audit_r16.mjs` (the lead's 12-shot motion audit + plunge t50 / t80), real game, 864×1536.
The real-time audit is NOT pixel-deterministic (two runs of the same set differ over most of the frame by animation timing);
the "start view unchanged" check uses the deterministic `scripts/capture.mjs 07`.

## Step 1 — round-8 lead work `&m07foam=1&m07coinsz=1` (owed proofs) — 19:15–19:40 UTC
* `m07foam`: down the plunge the game's tall grey-white lather walls (berm + puffs) and the sheet's lifted white edges step aside,
  so the matched tube's river with its painted pink / cyan banks shows. `m07coinsz`: coins never draw larger than the painted coin
  size on screen (the huge near coin at the bottom of the frame).
* Pictures: `step1/BEFORE/` (K) and `step1/NEW/` (K + m07foam + m07coinsz), 14 shots each: a00 start, f03 / f06 / f10 / f20
  forward, steer left / right, hard left / right, plunge t33 / t50 / t66 / t80 / t95.
* Checks: approved start view, deterministic capture K vs NEW: **0 px** differ (rows 180–1536).

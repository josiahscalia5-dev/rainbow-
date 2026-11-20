# Round 30 — coordination (lead session branch `ccr-2644c3c0-iikckn`, 2026-11-20 from ~20:05 UTC)

User's messages verbatim: `USER_R30.md` (+ the two pictures `USER_S06_RING_MISMATCH_R30.png`, `USER_S06_STORYBOARD_R30.png`).

## Restore (lead, 20:05–20:16 UTC)
* Session branch started at `8abed78` (19:57). The hook's fetch failed; the lead's retry found the r29 lead `ccr-ac160b4c-3hdecw` two saves
  newer (`b93b67c` 19:58, `f090393` 20:02: the r29 ring diagnosis + haze fix). Merged on the user's "continue exactly where we left off"
  (`1d1f359`; only the generated `backups/MANIFEST.json` / `LIVE_TOOLS_STATE.json` conflicted, this session's copies kept). Saved `44a4649`
  (GitHub == local).
* Worktrees: `docs/briefs/2026-11-20-r29/setup_worker_r30.sh` → LOCAL `-c31` (all 12), **all 12 tracked patch-id MATCH + every untracked
  file byte-identical** to the 20:02 snapshots.
* This account / environment ("Default", personal, no network secrets): GitHub works; World Labs API key was HTTP 401 → **re-entered by the user via the secure form ~21:22 UTC, verified
  (free read 5,420 credits; the old world IDs 404 = previous account's worlds, files in LFS)**; Marble/Atlas connector "no active Atlas account" (atlas.worldlabs.ai sign-up); fal key not on this
  environment; Hugging Face + Context7 connectors connected; plugins playwright + claude-code-setup NOT enabled (install card shown; the
  Playwright LIBRARY + Chromium work, all renders use it). 10/10 specialist definitions unchanged; no worker relaunched (the user's r29 order:
  Screen 06 alone, lead does it).

## Screen 06 (lead, in `/home/user/wt/s06`, LOCAL `claude/rainbow-s06-match-c31`; edits snapshotted every 5 min to `backups/wip/`)
* Diagnosis (`qa/match/06/r30/diag/`, sent ~20:18): the gold "target" = mesh `m06_rings` (25 modeled rings, every 12.87 u, radius 13.6, to
  294 u ahead) down ONE straight 346 u tube, camera 6.2 u off its axis looking 11° off it → 21 nested circles within ~160 px; plus the wall
  tile's painted gold stripes (2–3 per 59 u). Projection not involved.
* Built `&m06curl=1` (with m06deep; `tools/match06/r30_design_curl.py` → `assets/textures/match06/route06curl.json`; `src/world/match06.ts`,
  `course.ts`, `gameplay/coins.ts`, `game/Game.ts`): tunnel unchanged to virtual depth 40 (approved opening, crest, painted coins 0–6), then
  its axis curls right 30° + descends 7°, S-bend (left to −14°, right onto 07's heading 15.9°), last 24 u eased onto 07's tube mouth (07's
  gold collar = doorway); gold bands every 22 u, 1.5× wider, perpendicular to the local axis; 07 tube shown from 160 u back (seen only
  through the 06 tunnel's end = the warm glow ahead; `Game.ts`: from s07 − 175). 06 = 207 u (deep 124). Start view: a 40×70 px gap at the right edge (the approved view looked past the bend at the old straight wall ~100–120 u deep) is filled by `m06_stub0` (that patch of the old straight wall, visible only within 10 u past the checkpoint) → start view vs BEFORE 0.13 % of pixels > 20 levels (fur speckle). Camera hold `m06vw=20,38` (the m06view default) instead of r29's 34,56: the view turns with the river during the curl (34,56 looked at the wall for ~2 s). Coins: the 8 far painted coins re-spread along the new route
  (total 91, HUD 2,240 unchanged). Query `qa/match/06/r30/QUERY_NEW.txt` (= r29 final with `&m06curl=1&m06haze=80,170,0.55&m06vw=20,38`).
* Checks: `npx tsc --noEmit` OK; continuity default OK and WITH the switch OK (`tools/match06/r30_continuity.ts`: all joins gap 0, 06→07
  0.003°); gameplay test 8/8, 91 coins, 2,240 (`qa/match/06/r30/gameplay_NEW.json`); start view see above.
* Proof: `qa/match/06/r30/proof/` (marked spot APPROVED | BEFORE | NEW; uninterrupted clip 06 → 07; storyboard panel vs gameplay).
* NOT approved — waiting for the user. Default build and every earlier candidate unchanged.

## Next account
`docs/briefs/2026-11-20-r29/setup_worker_r30.sh` pattern with the newest `backups/wip/*-c31/` snapshots (copy the script, bump -c31 → -c32 and
the wip folder names to `*-c31`).

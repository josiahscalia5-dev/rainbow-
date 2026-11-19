# Screen 07 — STATUS (round 3, 2026-11-17)

* **Assigned screen:** 07 · DIVE THE WASHER TUBE (`references/07_dive_the_washer_tube.png`), switch `?match07=1`
* **Assigned specialist:** Screen 07 workstream session (round 3, account 3); no project subagent running
* **Working branch:** `claude/rainbow-s07-match-c3` — started from `e34e02582e2730d944a20ff661b0cb4aed95330e`
  (= `claude/rainbow-s07-match-c2` @ `21a1fdd5` + one autosave; the -c2 branch had no newer commit at startup)
* **Running-session status:** MILESTONE 1 finished and verified (`412297e5`); PAUSED by the lead (weekly usage warning, 17:57 UTC) — MILESTONE 2 not started; waiting for the lead
* **Latest verified commit:** see the final commit of this round in the lead status message (remote == HEAD checked after each push)
* **Completed improvements:** camera solved to the approved view; real 3D tube / rings / paddles / water proxies fitted to
  the picture; the user's original pixels camera-projected (post chain undone); ring-structured wall tile + seamless river
  tile for surfaces the picture never showed; river path follows the painted S-river (level); the picture's 8 coins at the
  painted spots as real pickups (run total unchanged); the 07→08 drop keeps the game's own tube and camera
* **Latest visual measurements** (`tools/match07/metrics07.py`, share within 20 levels, BEFORE → NEW):
  whole frame 6.7 % → **80.1 %** (SSIM 0.19 → 0.79); scenery without HUD/Benny 6.0 % → **95.5 %** (SSIM 0.95);
  tube/rings/paddles band 3.8 % → 99.96 %; river/coins/far rings 6.1 % → 90.4 %; lower water + foam 7.5 % → 95.6 %;
  Benny area 4.3 % → 16.6 % (game Benny, not changed here)
* **Pictures:** APPROVED `qa/match/07/07_APPROVED.png` · BEFORE `qa/match/07/07_BEFORE_current_game.png` · NEW
  `qa/match/07/07_NEW_match07.png` (r3 re-capture identical: `qa/match/07/m3/07_NEW_match07_r3.png`) · moving NEW
  `qa/match/07/m1/motion/` · moving BEFORE `qa/match/07/m1/motion_default/` (3/6/10/20 u, steering, drop start)
* **Unfinished problems:** provisional local fill where Benny/coins/HUD were (soft patch visible when a coin is collected or
  Benny steers aside; fal clean plate PREPARED, not run: `FAL_PLATE_REQUEST.md`); faint doubled ring layer upper-left at
  20 u; mirrored diamond in the near water at 3 u; Benny's look differs from the painted Benny (not this workstream's file)
* **Test results (round 3 re-run):** 0 px default 06/07/08 vs pre-change `3c7fca9`, `?match08=1` 08 0 px, protected 05
  BEFORE 0 px (`m3/proofs_0px_r3.json`); continuity all joins gap 0, drop 61.19 u / 61.02 u (`m3/continuity_*.json`);
  gameplay 8/8 with and without `match07=1`, 91 coins collected, total 2,240 both (`m3/gameplay_*.json`); tsc clean
* **Android:** `builds/rainbow-debug-07-2026-11-17-r3.apk` (debug, `VITE_RAINBOW_Q05="match07=1"`, Git LFS, sha256 a2ad08180fae22b0…) — NOT phone-tested (no device in the cloud)
* **Next task:** MILESTONE 2 (one factor at a time): gold rings to the bright end, pink-and-blue water, bubbles + tall
  foam walls, coins at the painted spots — consistent while moving (fix the 20 u doubled rings and the 3 u mirrored tile)
* **Approval status:** under review (only the user approves)

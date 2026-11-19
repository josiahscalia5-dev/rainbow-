# Screen 04 — STATUS

* **Assigned screen:** 04 · Through the Five Arrows (`?match04=1`)
* **Assigned specialist:** Screen 04 workstream session (Claude Code, account 3, session_01Q46SCGVVo94Weug9VM7yDG); lead = session_01Q46SCLi5xPVn25aRuxkVwK
* **Working branch:** `claude/rainbow-s04-match-c3` — started from `4d1f5b25` (= `-c2` head `255ec5e6` + one transcript autosave; line A, nothing merged)
* **Running-session status:** milestone 3 finished, pushed; stopped and waiting for the lead
* **Latest verified commit:** branch head (`git ls-remote origin refs/heads/claude/rainbow-s04-match-c3`); step commits 7f660f4 (1), 7eb571e (2), 9d67852 (3), d93d65e (4), 6cbbaf6 (5)
* **Completed improvements:** M1 camera solve + 3D proxies + original pixels; M2 ring tunnel + painted river tiles + ONE fal
  clean plate. **M3 (all on by default under `?match04=1`, each with an off switch):** (1) fal plate default verified;
  (2) river while riding = painted water around Benny — pink swirl ribbons, foam banks, cyan streams + the glowing arrows
  (`&river04=0`); no brown marks where coins were removed; (3) sharp painted rings all the way down the tunnel at 15–20 u,
  no glowy haze (`&rings04=0`); (4) the approved splash around Benny's base, cut from the picture (`&splash04=0`);
  (5) picture coins rest on the water while riding, approved view unchanged (`&coinwater04=0`).
* **Latest visual measurements:** approved view (864×1536, `tools/match04/metrics04.py`): whole frame 81.3 → **81.8 %**
  within 20 levels (SSIM 0.812 → 0.819), scenery 98.1 → **98.2 %** (SSIM 0.973), bands 100.0 / 96.9 / 97.7 %, Benny area
  21.1 → **25.3 %**. Tunnel sharpness while riding (mean gradient): 15 u 16.7 → 24.2, 20 u 17.0 → 25.6.
  Pictures: APPROVED `04_APPROVED.png`, BEFORE (M2) `04_BEFORE_m2_864x1536.png`, NEW `04_NEW_m3_864x1536.png`; riding
  frames BEFORE `motion_m2/NEW_fal04/`, NEW `motion_m3/NEW/` (3/6/10/15/20 u, steering left/right) + per-step sets.
* **Unfinished problems:** near the camera at 15–20 u the flat water meets the tunnel wall in a hard straight edge; the
  painted water is static (no flow); the swirl tile repeats every 4.7 u (softened by the arrow layer's own period);
  game Benny's look (owner: Screen 08 Benny specialist); coins can't rest on the water AT their painted spots (painted
  perspective), so they settle while the ride starts.
* **Test results:** default 04 / 05, `?match08=1` 08, `?ringa=26&nearfloor05=0` → 0 px; gameplay 8/8 with and without the
  switch, 91 coins / 2,240, default output byte-identical; tsc clean; references 13/13 OK. APK
  `builds/rainbow-debug-04-2026-11-17-r3.apk` (`VITE_RAINBOW_Q05="match04=1"`, all M3 parts, Git LFS) — NOT phone-tested.
* **Next task:** wait for the lead (candidates: water flow, soften the water/wall edge, Benny look via the 08 specialist).
* **Approval status:** under review

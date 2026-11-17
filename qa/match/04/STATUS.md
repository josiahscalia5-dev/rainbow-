# Screen 04 — STATUS

* **Assigned screen:** 04 · Through the Five Arrows (`?match04=1`)
* **Assigned specialist:** Screen 04 workstream session (Claude Code, account 2); lead = session_01VCMXob2ipUeLE1o7yXNSsZ
* **Working branch:** `claude/rainbow-s04-match-c2` (continued from `claude/rainbow-s04-match` @ e0bad9c, line A; nothing merged)
* **Running-session status:** milestone 2 finished, pushed; stopped and waiting for the lead
* **Latest verified commit:** milestone 2 `1bdb28b`, fal `1837672`, final status commit = branch head (`git ls-remote`)
* **Completed improvements:** M1 — approved camera solved, real 3D proxies (ring tunnel, mouth ring, room wall, water,
  end cap), original pixels projected, 5 painted coins as real pickups. M2 — deep tunnel shows ONE painted gold ring
  repeating straight down the tunnel (no smears, no mirrored tiles); water under/around Benny shows the painted cyan
  river with its chevron arrows, world-anchored, seamless; provisional fill under Benny replaced by the painted river once
  the camera moves; approved view unchanged. fal clean plate (ONE edit, request 01a1ea70) composited inside the fill
  mask only, behind `&fal04=1` (measured closer, below).
* **Latest visual measurements:** approved view (864×1536): whole frame 79.9 % within 20 levels (SSIM 0.798), scenery
  97.6 % (SSIM 0.967), upper 100.0 % / middle 95.7 % / lower 97.3 %, Benny 16.5 % — same as M1 (4 px differ).
  With `&fal04=1`: whole frame 81.3 % (SSIM 0.812), scenery 98.1 % (SSIM 0.973), middle 96.9 %, Benny 21.1 %.
  Moving frames: `motion_m2/BEFORE_milestone1/` vs `motion_m2/NEW/` (3/6/10/15/20 u, steer left/right) — visual
  comparison only (there is no approved picture for those views).
* **Unfinished problems:** ring and chevron closest to the camera at 15–20 u are soft; painted water is static (no flow);
  splash under Benny missing; Benny's look (owned by the 08 Benny specialist); coins float above the water when seen from
  the side; fal plate's purple HUD-strip fill (hidden by the game HUD); `fal04` not yet the default under `match04`
  (lead/user decision).
* **Test results:** default 04 0 px vs saved M1 default; default 05 + `?match08=1` 08 0 px below the HUD strip;
  `?ringa=26&nearfloor05=0` 0 px vs baseline; gameplay 8/8 with and without the switch, 91 coins / 2,240; tsc clean;
  references 13/13 OK; with `&fal04=1` gameplay 8/8, 91 coins. Debug APK `builds/rainbow-debug-04-2026-11-17-r2.apk`
  (`?match04=1`, milestone-2 tiles, WITHOUT fal04; Git LFS) — NOT phone-tested.
* **Next task:** wait for the lead (candidates: promote `fal04` inside `match04`, splash card, gentle water flow,
  sharper near ring band).
* **Approval status:** under review

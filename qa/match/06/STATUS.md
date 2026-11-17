# Screen 06 — STATUS (round 3, 2026-11-17)

* **Assigned screen:** 06 · CREST THE RINSE ARCH (`references/06_crest_the_rinse_arch.png`)
* **Assigned specialist:** Screen 06 workstream session (Screen 08 method; no project subagent launched this round)
* **Working branch:** `claude/rainbow-s06-match-c3` — started from `581129e97eccfed7731365d9aaa13173a3bfaaf6`
  (= `claude/rainbow-s06-match-c2` @ `2570f3ac` + one autosave), recorded before any change; `-c2` had no newer commits.
* **Running-session status:** milestone 1 finished, status sent to the lead, stopped and waiting.
* **Latest verified commit:** see `git log -1` on the branch / the lead message (remote == HEAD verified at each push).
* **Completed improvements:** locked approved camera + river along the painted river (r2); projected approved scenery on
  fitted tube + floor, ring-structured tube tile, picture coins as pickups (r2); r3: measured APPROVED/BEFORE/NEW,
  coin trail moved onto the far river (91/91 collectible), moving-camera fixes (painted-water mask + soft Benny-fill
  mask + rectified repeating floor tile), proofs, fal request prepared (not run), NOTES / SHARED_CHANGES, APK.
* **Latest visual measurements (within 20 levels):** scenery 4.1 % → **98.8 %** (SSIM 0.987); whole frame 5.0 % →
  **79.1 %** (SSIM 0.785); upper 97.8 %, middle 98.4 %, lower 99.8 %, Benny box 55.2 %.
* **Unfinished problems:** provisional local fill (fal clean plate prepared, needs the user's OK); floor tile repetition
  (soft chevrons) and tile-only river from ~10 u; far trail coins face the approved camera; game HUD/Benny differ from
  the painted ones (not this workstream); `?camclear=1` + `?match06=1` together untested.
* **Test results:** default 05/06/07/08 + `?match08=1` 0 px below the HUD strip vs `752d6d8`; `?ringa=26&nearfloor05=0`
  0 px full frame vs baseline; gameplay 8/8 and 91 coins / 2,240 with and without `match06=1`; continuity unchanged;
  tsc clean; 13 reference checksums OK. APK built, NOT phone-tested.
* **Next task:** wait for the lead / the user's verdict (fal clean plate only with explicit OK).
* **Approval status:** under review (NOT approved — only the user approves).

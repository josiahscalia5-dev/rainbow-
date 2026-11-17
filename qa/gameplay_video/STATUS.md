# STATUS — Screen 08 camera specialist (`?camclear=1`), round 3

* **Assigned screen:** 08 (+ view blockers along the whole ride seen in the user's phone recording)
* **Assigned specialist:** path-camera-transition-engineer (camera specialist)
* **Working branch:** `claude/rainbow-s08-camclear-c3`, started from `57b6eb8adfc6218560fd77b5acff1142fc77b673` (`-c2` head; `-c2` had no newer commits at start)
* **Running-session status:** round-3 milestone done; stopped and waiting for the lead
* **Latest verified commit:** see `git log -1` of the branch (pushed, remote == HEAD verified at every step)
* **Completed improvements:**
  - Round 2: rings / lids / foam no longer cover Benny or fill the screen (04, 06, 07); 06 view stays inside the tube; the 08 picture view engages and holds while Benny rides into it.
  - Round 3: **03→04 drain drop** — the falling chute water no longer covers the whole screen. Before, a striped water sheet hid Benny 60–100 % for ~0.6 s. Now Benny stays in the frame all the way down: the worst moment is a see-through water veil over up to half of him for ~0.4 s, then a clear view down the 04 gold tunnel.
* **Latest visual measurements** (share of Benny hidden, probe `tools/camclear/probe.mjs`):
  - 03→04 drop, 16.6–18.6 s: max 100 % → max 51 %; frames > 50 % hidden: 6 → 1.
  - 07 at 42 s (your video 35 s, gold band fills the screen): build 100 % of the screen within 2 u of the lens / Benny 100 % hidden → camclear 0 % / 3 %.
  - 07→08→09 moving check (steer straight / right): no frame with Benny > 39 % hidden; the 39 % at 43.75 s is the lower screen edge at the top of the big drop, not an object.
* **Pictures:** `qa/gameplay_video/compare_r3/` — per moment `<t>_1_video.png` (your recording) | `_2_build.png` (match08 build) | `_3_camclear.png`, each full size 360×800, plus `_side_by_side.png`. Moving check: `qa/gameplay_video/moving_r3/sheet_steer{0,1,-1}.png` + frames.
* **Unfinished problems:**
  - 03 at the drain lip: ~0.4 s where the falling water still veils part of Benny (he really passes through that water).
  - 07: gold ring bands still cross the upper screen as Benny passes under them (scenery, they no longer cover Benny or fill the screen).
  - Video ↔ game moments matched stage by stage (`tools/camclear/vidmap.py`); the phone ran some stages at a different speed, so moments are close, not frame-exact.
  - Holding left all the time in 07 makes Benny bump the wall and restart the level (game rule, unchanged).
* **Test results:** `npx tsc --noEmit` clean; gameplay 8/8 + 91 coins / 2,240 default, `camclear=1`, `match08=1&camclear=1` (`qa/gameplay_video/tests/r3_*.json`); continuity ok, all joins gap 0, 07→08 drop 61.19 u (unchanged); `match08=1` without camclear 0 px at 8 moments incl. the approved 08 view; `match08=1&camclear=1` approved 08 view 0 px (only floating soap bubbles differ elsewhere — they spawn around the view); 13 reference images OK.
* **APK:** `builds/rainbow-debug-08camclear-2026-11-17-r3.apk` (Git LFS, `match08=1&camclear=1` baked in, sha256 `fa4ae363…0a47`) — **NOT phone-tested** (no device in the cloud).
* **Next task:** wait for the lead / the user's verdict on the phone.
* **Approval status:** under review

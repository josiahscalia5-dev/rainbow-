# STATUS — Screen 08 camera specialist (`?camclear=1`), round 4

* **Branch:** `claude/rainbow-s08-camclear-c4`, started from `5da9623f9aaa144e46e15e23c8248de11c6a90ab` (= `-c3` head `c03f391c` + one autosave of backups only). `-c3` had no newer commits at start.
* **Status:** round-4 milestone done; stopped, waiting for the lead.
* **Done (visual terms):**
  - **03→04 drain drop:** the picture no longer tilts sideways as Benny goes over the drain lip (tilt up to 16° → ≤ 1°; the picture's "up" can no longer flip), no one-frame jolt (biggest single-step view jump 1.0 u → 0.73 u, same as the normal build), and less falling water over Benny: share of Benny hidden max 44 % → 25 % (normal build 100 %), frames > 25 % hidden 5 → 1, frames with Benny cut by the screen edge 12 → 2. Frames every 0.1 s, 16.6–17.6 s: `qa/gameplay_video/lip_r4/t<time>_{1_default,2_camclear_r3,3_camclear_NEW}.png` (r3 frames: HUD font fallback only).
  - **08 while steering left/right:** coins Benny missed sat huge in the front, over the lower third of the picture (the view holds the approved 08 picture while he rides away). Now coins nearer to the lens than Benny fade out (pickup unchanged).
* **Not changed by me (needs another workstream, told the lead):**
  - **07 gold bands across the upper screen** are the 07 tube's own big rings 14–45 u AHEAD (raycast, `qa/gameplay_video/r07_band_distances_r4.json`), not something passing the lens. Thinning them changes the 07 scenery look → Screen 07 workstream. A trial fade of overhead rings within 7 u changed 0 % (reverted).
  - **08 steering hard right:** Benny rides into the right-hand pipe/arch of the 08 picture geometry (`m08_pipe`, `m08_arch`, his centre 0.5 u below its surface; 45 % of him hidden at 44.5 s) → 08 scenery / Benny workstream (lateral limit or geometry).
* **Moving check 07→08→09 (`match08=1&camclear=1`)**, `qa/gameplay_video/moving_r4/sheet_steer{0,1,-1}.png` + frames: straight max 22 % of Benny hidden, nothing within 2 u of the lens, camera never inside a mesh; left max 29 %; right max 45 % (the pipe above). Steering into walls costs hearts (game rule).
* **Proofs:** `npx tsc --noEmit` clean; gameplay 8/8, 91 coins / 2,240, 07→08 drop 61.41 u (`camclear=1`) / 61.31 u (`match08=1&camclear=1`), identical to r3 (`qa/gameplay_video/tests/r4_*.json`); continuity all joins gap 0; still views vs r3 (`qa/gameplay_video/stills_r4/`): default 03–09, `match08=1` 08 with and without camclear, `match07=1` 07 with and without camclear — **0 px** below the HUD (HUD differs only by the comparison copy's font fallback); `match07=1` vs `match07=1&camclear=1` 0 px; 13 reference images OK.
* **APK:** `builds/rainbow-debug-08camclear-2026-11-17-r4.apk` (Git LFS, `match08=1&camclear=1` baked in, sha256 `93667373…2aab`) — **NOT phone-tested**.
* **Approval status:** under review.

---

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

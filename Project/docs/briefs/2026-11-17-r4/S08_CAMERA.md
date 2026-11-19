You are the SCREEN 08 CAMERA SPECIALIST (path-camera-transition-engineer role) of the RAINBOW game — my EXISTING Android game. Do NOT restart, redesign or rebuild anything; never discard earlier work. Lead = session `session_01Kbt6BTTnCGMUULjZoCLDTo` (branch `ccr-067047f0-up5d1m`). Screen 08 is my highest priority.

Your branch: **`claude/rainbow-s08-camclear-c4`**, continued from `claude/rainbow-s08-camclear-c3` @ `c03f391c` (round 3 done: `491c2d56`, `6282ce70`, `0f12867b`). Push ONLY your `-c4` branch.

FIRST read: `docs/briefs/2026-11-17-r4/COMMON_RULES.md`, then the r3 and r2 COMMON_RULES and `docs/briefs/2026-11-17-r3/S08_CAMERA.md` (all from `ccr-067047f0-up5d1m` via `git show FETCH_HEAD:…`). Then `CLAUDE.md`, `qa/match/08/NOTES.md` and your own saved work: `qa/gameplay_video/NOTES.md`, `STATUS.md`, `SHARED_CHANGES.md`, `src/game/camClear.ts`, the camclear-guarded parts of `cameraRig.ts` / `Game.ts`, `tools/camclear/` (probe.mjs, vidmap.py), `qa/gameplay_video/` (source video in Git LFS).

## Where round 3 stopped (account 3 ran out at ~18:13 UTC)
* `?camclear=1`: 03→04 drain drop keeps Benny in the frame (Benny hidden: max 100 % → 51 %, frames > 50 % hidden 6 → 1); 07 gold band no longer fills the screen (100 % → 0 % of screen, Benny 3 % hidden). Tests 8/8, 91 / 2,240, drop 61.19 u; APK `builds/rainbow-debug-08camclear-2026-11-17-r3.apk` (NOT phone-tested).
* Open: ~0.4 s see-through water veil over part of Benny at the 03 drain lip; 07 gold ring bands still cross the upper screen as Benny passes under them; the known risk that following the water's changing "up" near the drain lip can flip the view.

## Your milestone (round 4), each fix minimal and camclear-guarded
1. **Steady view at the drain lip:** make the view's "up" stable (world-anchored, eased) through the 03→04 lip so it can never flip; shorten the remaining see-through veil if possible. Prove it with full-size moving frames every ~0.1 s through the lip (default | camclear r3 | camclear NEW) and the probe numbers.
2. **07 ring bands:** reduce how much of the upper screen the passing gold bands cover, WITHOUT changing the approved 07 view under `?match07=1` (that look belongs to the Screen 07 workstream — if it needs their geometry, write it in NOTES and tell the lead).
3. Moving check 07 → 08 → 09 with `match08=1&camclear=1`, steering straight / left / right: nothing between the view and Benny, no stretched textures revealed, the approved 08 framing unchanged (`?match08=1` 0 px with AND without camclear), the huge 07→08 drop intact (~61 u), steering / collisions / coin pickup unchanged.
4. Proofs: tsc clean; default build 0 px; gameplay 8/8 + 91 / 2,240 with camclear; continuity joins gap 0. `STATUS.md`, `NOTES.md`, `SHARED_CHANGES.md`; APK with `match08=1&camclear=1` if the fixes hold (`builds/rainbow-debug-08camclear-2026-11-17-r4.apk`, Git LFS, NOT phone-tested). Report in VISUAL terms (what blocked the view, what it looks like now).

## Coordination
You own `src/game/camClear.ts`, `tools/camclear/`, `qa/gameplay_video/` and the camclear-guarded parts of `cameraRig.ts` / `Game.ts`. Never change Benny files or any screen's scenery/texture files (match04–08). The Screen 08 Benny specialist works in parallel on `claude/rainbow-s08-benny08-bake-c4`; the Screen 07 workstream on `claude/rainbow-s07-match-c4`. No paid jobs. When done: push, verify remote SHA == HEAD, ONE `send_message` to `session_01Kbt6BTTnCGMUULjZoCLDTo`, stop and wait.

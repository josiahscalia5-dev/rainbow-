You are the SCREEN 08 CAMERA SPECIALIST (path-camera-transition-engineer role) of the RAINBOW game — my EXISTING Android game. Do NOT restart, redesign or rebuild anything; never discard earlier work. Lead = session `session_01Q46SCLi5xPVn25aRuxkVwK` (branch `ccr-c0235034-ks6sx3`). Screen 08 is my highest priority.

Your branch: **`claude/rainbow-s08-camclear-c3`**, continued from `claude/rainbow-s08-camclear-c2` @ `57b6eb8a` (newest commit of the round-2 camera specialist). Push ONLY your `-c3` branch.

FIRST read: `docs/briefs/2026-11-17-r3/COMMON_RULES.md`, then `docs/briefs/2026-11-17-r2/COMMON_RULES.md` and your round-2 brief `docs/briefs/2026-11-17-r2/S08_CAMERA.md` (both from `ccr-c0235034-ks6sx3` via `git show FETCH_HEAD:…`). Then `CLAUDE.md`, `docs/NEW_CLAUDE_ACCOUNT_HANDOFF.md`, `qa/match/08/NOTES.md`, and your saved work: `qa/gameplay_video/NOTES.md`, `src/game/camClear.ts`, the camclear-guarded parts of `cameraRig.ts` / `Game.ts`, `tools/camclear/`, `qa/gameplay_video/{scan,timeline,trace}/`.

## Where round 2 stopped (account 2 ran out at ~17:07 UTC)
* Step 1 DONE and pushed (`f360a199`): tsc clean, continuity unchanged, gameplay 8/8 + 91 / 2,240 three times with camclear, default build and `?match08=1` 0 px + `qa/gameplay_video/NOTES.md`.
* NOT done: steps 2–4 of the round-2 brief.

## Your milestone (round 3) = round-2 steps 2–4
2. Review my saved gameplay recording `qa/gameplay_video/source/rainbow_gameplay_for_claudia-1_0-48.9s.mp4` (Git LFS). For every problem moment put SEPARATE full-size frames side by side: my video frame | current build at the same moment | `camclear=1` at the same moment — 03 4–6 s (white sheet), 04 7–10 s (white sheet, then inside a pink wall at 8 s), 06 18–20 s (drum wall + gold band fill the view), 07 33–36 s (gold ring band fills the frame) and the 07→08 drop, 08 38–40 s (does the match08 view engage and hold?), 09–11 40–47 s. Fix only what the newer builds still show; each fix minimal and camclear-guarded.
3. Moving check through 07 → 08 → 09 with `match08=1&camclear=1`: no walls, rings, foam or washer parts between the view and Benny; no stretched texture revealed by a fix; no wrong transitions; steering, collisions and coin pickup unchanged. The approved 08 framing must not move (`?match08=1` 0 px with AND without camclear). Screen 08's scenery match must be preserved exactly.
4. `qa/gameplay_video/STATUS.md`, `SHARED_CHANGES.md`, and an APK with `match08=1&camclear=1` if the fixes hold (`builds/rainbow-debug-08camclear-2026-11-17-r3.apk`, Git LFS, NOT phone-tested). Report in VISUAL terms (what blocked the view, what it looks like now) — I don't want camera/movement jargon.

## Coordination
You own `src/game/camClear.ts`, `tools/camclear/`, `qa/gameplay_video/` and the camclear-guarded parts of `cameraRig.ts` / `Game.ts`. Never change Benny files or any screen's scenery/texture files (match04–08). The Screen 08 Benny specialist works in parallel on `claude/rainbow-s08-benny08-bake-c3`; the 04, 05, 06, 07 agents own the look of their views (`-c3` branches) — if a fix needs their geometry changed, write it in NOTES and tell the lead. No paid jobs. When done: push, verify, ONE `send_message` to `session_01Q46SCLi5xPVn25aRuxkVwK`, stop and wait.

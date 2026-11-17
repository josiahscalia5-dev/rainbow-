# Rainbow session — session d9f895bf-45eb-56d9-b25c-4cb6284b4b7e

### 🧑 User — 2026-11-17T18:39:30.426Z

Your full brief is below and is also saved at docs/briefs/2026-11-17-r4/S08_CAMERA.md on the lead branch (git fetch origin ccr-067047f0-up5d1m && git show FETCH_HEAD:docs/briefs/2026-11-17-r4/S08_CAMERA.md). Read docs/briefs/2026-11-17-r4/COMMON_RULES.md from the lead branch first — it has the startup check and the usage rules.

You are the SCREEN 08 CAMERA SPECIALIST (path-camera-transition-engineer role) of the RAINBOW game — my EXISTING Android game. Do NOT restart, redesign or rebuild anything; never discard earlier work. Lead = session `session_01Kbt6BTTnCGMUULjZoCLDTo` (branch `ccr-067047f0-up5d1m`). Screen 08 is my highest priority.

Your branch: `claude/rainbow-s08-camclear-c4`, continued from `claude/rainbow-s08-camclear-c3` @ `c03f391c` (round 3 done: `491c2d56`, `6282ce70`, `0f12867b`). Push ONLY your `-c4` branch.

FIRST read: `docs/briefs/2026-11-17-r4/COMMON_RULES.md`, then the r3 and r2 COMMON_RULES and `docs/briefs/2026-11-17-r3/S08_CAMERA.md` (all from `ccr-067047f0-up5d1m` via `git show FETCH_HEAD:…`). Then `CLAUDE.md`, `qa/match/08/NOTES.md` and your own saved work: `qa/gameplay_video/NOTES.md`, `STATUS.md`, `SHARED_CHANGES.md`, `src/game/camClear.ts`, the camclear-guarded parts of `cameraRig.ts` / `Game.ts`, `tools/camclear/` (probe.mjs, vidmap.py), `qa/gameplay_video/` (source video in Git LFS).

Where round 3 stopped (account 3 ran out at ~18:13 UTC):
* `?camclear=1`: 03→04 drain drop keeps Benny in the frame (Benny hidden: max 100 % → 51 %, frames > 50 % hidden 6 → 1); 07 gold band no longer fills the screen (100 % → 0 % of screen, Benny 3 % hidden). Tests 8/8, 91 / 2,240, drop 61.19 u; APK `builds/rainbow-debug-08camclear-2026-11-17-r3.apk` (NOT phone-tested).
* Open: ~0.4 s see-through water veil over part of Benny at the 03 drain lip; 07 gold ring bands still cross the upper screen as Benny passes under them; the known risk that following the water's changing "up" near the drain lip can flip the view.

Your milestone (round 4), each fix minimal and camclear-guarded:
1. Steady view at the drain lip: make the view's "up" stable (world-anchored, eased) through the 03→04 lip so it can never flip; shorten the remaining see-through veil if possible. Prove it with full-size moving frames every ~0.1 s through the lip (default | camclear r3 | camclear NEW) and the probe numbers.
2. 07 ring bands: reduce how much of the upper screen the passing gold bands cover, WITHOUT changing the approved 07 view under `?match07=1` (that look belongs to the Screen 07 workstream — if it needs their geometry, write it in NOTES and tell the lead).
3. Moving check 07 → 08 → 09 with `match08=1&camclear=1`, steering straight / left / right: nothing between the view and Benny, no stretched textures revealed, the approved 08 framing unchanged (`?match08=1` 0 px with AND without camclear), the huge 07→08 drop intact (~61 u), steering / collisions / coin pickup unchanged.
4. Proofs: tsc clean; default build 0 px; gameplay 8/8 + 91 / 2,240 with camclear; continuity joins gap 0. `STATUS.md`, `NOTES.md`, `SHARED_CHANGES.md`; APK with `match08=1&camclear=1` if the fixes hold (`builds/rainbow-debug-08camclear-2026-11-17-r4.apk`, Git LFS, NOT phone-tested). Report in VISUAL terms (what blocked the view, what it looks like now).

Coordination: You own `src/game/camClear.ts`, `tools/camclear/`, `qa/gameplay_video/` and the camclear-guarded parts of `cameraRig.ts` / `Game.ts`. Never change Benny files or any screen's scenery/texture files (match04–08). The Screen 08 Benny specialist works in parallel on `claude/rainbow-s08-benny08-bake-c4`; the Screen 07 workstream (paused) on `claude/rainbow-s07-match-c4`. No paid jobs of any kind. Work lean (usage: three earlier accounts ran out). When done: push, verify remote SHA == HEAD, ONE `send_message` to `session_01Kbt6BTTnCGMUULjZoCLDTo`, then stop and wait.

### 🤖 Claude — 2026-11-17T18:39:33.092Z

> 🔧 **Bash** `{"command": "git status --short | head; git log --oneline -3; for i in 1 2 3; do git fetch origin ccr-067047f0-up5d1m && break; sleep 3; done; git show FETCH_HEAD:docs/briefs/2026-11-17-r4/COMMON_RULES.md", "description": "Check repo state and read r4 common rules"}`

### 🧑 User — 2026-11-17T18:39:39.723Z

> ↩︎ result: M backups/CONVERSATION_INDEX.md
> ?? backups/claude-sessions/d9f895bf-45eb-56d9-b25c-4cb6284b4b7e/
> c03f391 autosave: Rainbow 2026-11-17 18:03 UTC
> 7c24779 autosave: Rainbow 2026-11-17 18:03 UTC
> 67e07b0 autosave: Rainbow 2026-11-17 18:02 UTC
> From https://github.com/josiahscalia5-dev/rainbow-
>  * branch            ccr-067047f0-up5d1m -> FETCH_HEAD
>  * [new branch]      ccr-067047f0-up5d1m -> origin/ccr-067047f0-up5d1m
> # RAINBOW — common rules, round 4 (account 4, 2026-11-17 ~18:35 UTC)
> 
> **The round-3 and round-2 rules stay binding word for word:** `docs/briefs/2026-11-17-r3/COMMON_RULES.md` and
> `docs/briefs/2026-11-17-r2/COMMON_RULES.md` (startup, git, visual goal, protected behaviour, money and secrets,
> reporting, saving, pace). Read both first. Only these points change:
> 
> ## What changed
> * **Lead coordinator ("Lead Claudia") = session `session_01Kbt6BTTnCGMUULjZoCLDTo`** ("Rainbow game restoration",
>   account 4), branch **`ccr-067047f0-up5d1m`** (started from the round-3 lead branch `ccr-c0235034-ks6sx3` @ `ed23f9e5`).
>   Every `send_message` that older rules address to an earlier lead goes to **`session_01Kbt6BTTnCGMUULjZoCLDTo`**.
>   Read these briefs with `git fetch origin ccr-067047f0- …[+3477 chars]

### 🤖 Claude — 2026-11-17T18:39:41.727Z

> 🔧 **Bash** `{"command": "git branch --show-current; git rev-parse HEAD; git show FETCH_HEAD:docs/briefs/2026-11-17-r3/COMMON_RULES.md | head -80; echo ======; git show FETCH_HEAD:docs/briefs/2026-11-17-r3/S08_CAMERA.md | head -60", "description": "Read r3 rules and r3 camera brief"}`

### 🧑 User — 2026-11-17T18:39:41.775Z

> ↩︎ result: claude/rainbow-s08-camclear-c4
> 5da9623f9aaa144e46e15e23c8248de11c6a90ab
> # RAINBOW — common rules, round 3 (account 3, 2026-11-17 ~17:30 UTC)
> 
> **The round-2 rules stay binding word for word:** `docs/briefs/2026-11-17-r2/COMMON_RULES.md` (startup, git, visual goal,
> protected behaviour, money and secrets, reporting, saving, pace). Read it first. Only these points change:
> 
> ## What changed
> * **Lead coordinator ("Lead Claudia") = session `session_01Q46SCLi5xPVn25aRuxkVwK`** ("Rainbow game restoration",
>   account 3), branch **`ccr-c0235034-ks6sx3`** (started from the round-2 lead branch `ccr-5495e9c4-g0apvl` @ `7db2982`).
>   Every `send_message` that the round-2 rules address to `session_01VCMXob2ipUeLE1o7yXNSsZ` goes to
>   **`session_01Q46SCLi5xPVn25aRuxkVwK`** instead. Read these briefs with
>   `git fetch origin ccr-c0235034-ks6sx3 && git show FETCH_HEAD:docs/briefs/2026-11-17-r3/<file>`.
> * **Why `-c3` branches:** account 2 (round 2) ran out of usage at ~17:07–17:12 UTC. Its six sessions and their
>   containers may still autosave to the `…-c2` branches, and they may wake when that account resets. Every round-3
>   workstream continues on its OWN **`…-c3`** branch, created from the newest remo …[+4841 chars]


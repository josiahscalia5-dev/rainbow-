You are the SCREEN 08 BENNY SPECIALIST (benny-character-artist role) of the RAINBOW game — my EXISTING Android game. Do NOT restart, redesign or rebuild anything; never discard earlier work. Lead = session `session_01Q46SCLi5xPVn25aRuxkVwK` (branch `ccr-c0235034-ks6sx3`). Screen 08 is my highest priority.

Your branch: **`claude/rainbow-s08-benny08-bake-c3`**, continued from `claude/rainbow-s08-benny08-bake-c2` @ `a4c6a5cc` (newest commit of the round-2 Benny specialist). Push ONLY your `-c3` branch.

FIRST read: `docs/briefs/2026-11-17-r3/COMMON_RULES.md`, then `docs/briefs/2026-11-17-r2/COMMON_RULES.md` and your round-2 brief `docs/briefs/2026-11-17-r2/S08_BENNY.md` (both from `ccr-c0235034-ks6sx3` via `git show FETCH_HEAD:…`). Then `CLAUDE.md`, `docs/NEW_CLAUDE_ACCOUNT_HANDOFF.md`, `qa/match/08/NOTES.md` (FINISH ROUND, BENNY ROUND, BENNY PORT, BENNY CHECK ROUND) and your saved work: `qa/match/08/benny08/` (work/, compare_CURRENT_NEW.json, screen_match_*.json, tests/, motion/), `src/characters/benny/benny05.ts`, `assets/textures/benny08/`, the `git log` of commits `8cb3e72`, `6392658`, `df1a91f8`, `7c425531`.

## Where round 2 stopped (account 2 ran out at ~17:07 UTC)
* Maps re-baked from the APPROVED 08 picture (`?bake08=1`, match08 uses them; `bake08=0` = previous maps): whole frame 83.3 → 84.3 % within 20 levels, below HUD 90.1 → 91.2 %.
* Round 2 (`df1a91f8`, `7c425531`): pom-pom moved onto the painted spot, star 1.2× at the painted spot, beanie roll −0.08 so the stripes run level like the painting → Benny + splash region 63.3 → 64.8 → **65.7 %** (pom 13 → 23 %, star 15 → 47 %).
* NOT done: `qa/match/08/benny08/NOTES.md`, `STATUS.md`, `SHARED_CHANGES.md`; the verification set; motion + 04–07 checks; APK.

## Your milestone (round 3)
1. **Verify and document first** (commit + push after each): tsc clean; default build 0 px; scenery band of `?match08=1` unchanged (97.4 % scenery must not drop); gameplay 8/8 + 91 coins / 2,240 with and without match08; `bake08=0` reproduces the previous match08 Benny. Write `NOTES.md` (what the bake and the round-2 refits do, numbers, reproduce commands), `STATUS.md`, `SHARED_CHANGES.md`.
2. **Compare the newest Benny with the ORIGINAL APPROVED 08 Benny AND with the pre-bake Benny** (`bake08=0`); keep whichever is visually closer (measured region + full-size pictures). Never keep a change that looks worse.
3. Continue the LOOK one factor at a time, keep only what is measurably or visibly closer: soft shaded pink/magenta fur texture and shading; knitted purple-and-white beanie (visible stitches, ribbed cuff, white stripes); yarn pom-pom; gold star shape + approved gold; correct body shape; position and scale (switch-guarded `M08_BENNY` placement in Game.ts only); the approved water SPLASH around him (splash08 look/strength only — its approved position stays). Benny stays an animated real 3D character, canonical everywhere: pink fluff, violet eyes, knitted star hat, paw pads.
4. Motion check on 08 (swimming, steering left/right, 360° views) and on 04–07 with the switch (only Benny changes).
5. Deliver `qa/match/08/benny08/APPROVED_08.png | CURRENT_08.png | NEW_08.png` full size + closeups + numbers; APK with `match08=1` if NEW is closer (`builds/rainbow-debug-08benny-2026-11-17-r3.apk`, Git LFS, NOT phone-tested).

## Coordination
You OWN `src/characters/benny/*` and `assets/textures/benny0*/`. Never edit `src/world/match08.ts`, `assets/textures/match08/*`, `cameraRig.ts`, `match.ts`, `camClear.ts`. The Screen 08 camera specialist works in parallel on `claude/rainbow-s08-camclear-c3`. No paid jobs. When done: push, verify, ONE `send_message` to `session_01Q46SCLi5xPVn25aRuxkVwK`, stop and wait.

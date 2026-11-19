> **USER DECISIONS 19:00 UTC (override this brief where they differ, full text `USER_DECISIONS.md`):** round 3b is
> the preferred base; compare with r2 / r4 / approved; body rounder and FULLER (not tapered toward the water — the
> 18:55 taper `b08shape` stays as an off-by-default switch); fur soft and natural, not spiky; preserve best details.

You are the SCREEN 08 BENNY SPECIALIST (benny-character-artist role) of the RAINBOW game — my EXISTING Android game. Do NOT restart, redesign or rebuild anything; never discard earlier work or earlier Benny variants. Lead = session `session_01Kbt6BTTnCGMUULjZoCLDTo` (branch `ccr-067047f0-up5d1m`). Screen 08 is my highest priority.

Your branch: **`claude/rainbow-s08-benny08-bake-c4`**, continued from `claude/rainbow-s08-benny08-bake-c3` @ `c64ff28b` (round 4 done: `71aa6d85`, `8e40c541`). Push ONLY your `-c4` branch.

FIRST read: `docs/briefs/2026-11-17-r4/COMMON_RULES.md`, then the r3 and r2 COMMON_RULES and `docs/briefs/2026-11-17-r3/S08_BENNY.md` (all from `ccr-067047f0-up5d1m` via `git show FETCH_HEAD:…`). Then `CLAUDE.md`, `qa/match/08/NOTES.md` and your own saved work: `qa/match/08/benny08/NOTES.md`, `STATUS.md`, `SHARED_CHANGES.md`, `r3/`, `r3b/`, `r4/`, `src/characters/benny/*`, `assets/textures/benny08/`.

## Where round 4 stopped (account 3 ran out at ~18:13 UTC)
* Benny + splash within 20 levels: pre-bake 49.8 → bake 57.2 → **r2 65.7** → r3b 65.3 → r4 65.4 %; scenery 97.3 % unchanged; whole 85.4 %. The three variants are numerically almost equal — the choice is VISUAL.
* r3b: softer fur strands + softer silhouette, crisp cuff ribs, fuller splash ring. r4: shoulder highlight (`b08hi=0` off) + lighter violet pom (`b08pom=0` off). Proportion changes measured worse (rejected).
* Open: painted large soft fur clumps; pom-pom yarn tufts. APKs r3 / r3b / r4 in `builds/` (NOT phone-tested).

## Your milestone (round 5)
1. **Variant review set for the user (first, commit + push):** the exact URL that reproduces each of r2, r3b and r4 (write them in NOTES), then for EACH variant separate full-size files: the 08 approved-view frame and a Benny close-up at the same crop as `closeup_APPROVED.png`, plus three moving frames (swimming forward, steering left, steering right). Folder `qa/match/08/benny08/review_r5/`, names starting `1_APPROVED`, `2_r2`, `3_r3b`, `4_r4`. No collages.
2. **One factor at a time, keep only what is visibly closer to the approved Benny** (pictures + region numbers; a lower fur number can still look closer — say so honestly): (a) pom-pom as soft yarn tufts in the approved light violet; (b) softer fur edge / larger soft fur clumps like the painting; (c) brighter white hat stripes; (d) **body shape — the user's first Benny priority** (lead's visual review of r4 vs `closeup2x_APPROVED.png`, 18:40 UTC): in the approved picture the round pink body is WIDER than the hat and the hat brim sits directly on it, with short stubby arms high on the sides; in r4 the body is about as narrow as the hat, the arms hang lower as separate puffs, and there are jagged pixels at the arm edges. Earlier proportion tries measured worse — try again visually (switch-guarded `M08_BENNY` placement/scale only) and keep it if it LOOKS closer, saying honestly what the numbers did. Every new change behind its own switch so earlier variants stay reproducible.
3. Proofs after the last kept change: tsc clean; default build 0 px; `?match08=1` scenery band unchanged (97.3 %); r4 reproducible 0 px; gameplay 8/8 + 91 coins / 2,240 with and without match08; 04–07 with the switch: only Benny changes.
4. APK with `match08=1` only if a new change is kept (`builds/rainbow-debug-08benny-2026-11-17-r5.apk`, Git LFS, NOT phone-tested). `STATUS.md`, `NOTES.md`, `SHARED_CHANGES.md` updated.

## Coordination
You OWN `src/characters/benny/*` and `assets/textures/benny0*/`. Never edit `src/world/match08.ts`, `assets/textures/match08/*`, `cameraRig.ts`, `match.ts`, `camClear.ts`. The Screen 08 camera specialist works in parallel on `claude/rainbow-s08-camclear-c4`. No paid jobs. When done: push, verify remote SHA == HEAD, ONE `send_message` to `session_01Kbt6BTTnCGMUULjZoCLDTo`, stop and wait.

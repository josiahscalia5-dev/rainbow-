# Rainbow session — session 25fbdcde-09fd-5e26-a26e-a6fcde151fae

### 🧑 User — 2026-11-17T18:40:06.967Z

Your full brief is below and is also saved at docs/briefs/2026-11-17-r4/S08_BENNY.md on the lead branch (git fetch origin ccr-067047f0-up5d1m && git show FETCH_HEAD:docs/briefs/2026-11-17-r4/S08_BENNY.md). Read docs/briefs/2026-11-17-r4/COMMON_RULES.md from the lead branch first — it has the startup check and the usage rules.

You are the SCREEN 08 BENNY SPECIALIST (benny-character-artist role) of the RAINBOW game — my EXISTING Android game. Do NOT restart, redesign or rebuild anything; never discard earlier work or earlier Benny variants. Lead = session `session_01Kbt6BTTnCGMUULjZoCLDTo` (branch `ccr-067047f0-up5d1m`). Screen 08 is my highest priority.

Your branch: `claude/rainbow-s08-benny08-bake-c4`, continued from `claude/rainbow-s08-benny08-bake-c3` @ `c64ff28b` (round 4 done: `71aa6d85`, `8e40c541`). Push ONLY your `-c4` branch.

FIRST read: `docs/briefs/2026-11-17-r4/COMMON_RULES.md`, then the r3 and r2 COMMON_RULES and `docs/briefs/2026-11-17-r3/S08_BENNY.md` (all from `ccr-067047f0-up5d1m` via `git show FETCH_HEAD:…`). Then `CLAUDE.md`, `qa/match/08/NOTES.md` and your own saved work: `qa/match/08/benny08/NOTES.md`, `STATUS.md`, `SHARED_CHANGES.md`, `r3/`, `r3b/`, `r4/`, `src/characters/benny/*`, `assets/textures/benny08/`.

Where round 4 stopped (account 3 ran out at ~18:13 UTC):
* Benny + splash within 20 levels: pre-bake 49.8 → bake 57.2 → r2 65.7 → r3b 65.3 → r4 65.4 %; scenery 97.3 % unchanged; whole 85.4 %. The three variants are numerically almost equal — the choice is VISUAL.
* r3b: softer fur strands + softer silhouette, crisp cuff ribs, fuller splash ring. r4: shoulder highlight (`b08hi=0` off) + lighter violet pom (`b08pom=0` off). Proportion changes measured worse (rejected).
* Open: painted large soft fur clumps; pom-pom yarn tufts. APKs r3 / r3b / r4 in `builds/` (NOT phone-tested).

Your milestone (round 5):
1. Variant review set for the user (first, commit + push): the exact URL that reproduces each of r2, r3b and r4 (write them in NOTES), then for EACH variant separate full-size files: the 08 approved-view frame and a Benny close-up at the same crop as `closeup_APPROVED.png`, plus three moving frames (swimming forward, steering left, steering right). Folder `qa/match/08/benny08/review_r5/`, names starting `1_APPROVED`, `2_r2`, `3_r3b`, `4_r4`. No collages.
2. One factor at a time, keep only what is visibly closer to the approved Benny (pictures + region numbers; a lower fur number can still look closer — say so honestly): (a) pom-pom as soft yarn tufts in the approved light violet; (b) softer fur edge / larger soft fur clumps like the painting; (c) brighter white hat stripes. Every new change behind its own switch so earlier variants stay reproducible.
3. Proofs after the last kept change: tsc clean; default build 0 px; `?match08=1` scenery band unchanged (97.3 %); r4 reproducible 0 px; gameplay 8/8 + 91 coins / 2,240 with and without match08; 04–07 with the switch: only Benny changes.
4. APK with `match08=1` only if a new change is kept (`builds/rainbow-debug-08benny-2026-11-17-r5.apk`, Git LFS, NOT phone-tested). `STATUS.md`, `NOTES.md`, `SHARED_CHANGES.md` updated.

Coordination: You OWN `src/characters/benny/*` and `assets/textures/benny0*/`. Never edit `src/world/match08.ts`, `assets/textures/match08/*`, `cameraRig.ts`, `match.ts`, `camClear.ts`. The Screen 08 camera specialist works in parallel on `claude/rainbow-s08-camclear-c4`. No paid jobs of any kind. Work lean (usage: three earlier accounts ran out). When done: push, verify remote SHA == HEAD, ONE `send_message` to `session_01Kbt6BTTnCGMUULjZoCLDTo` (picture paths, numbers, commit SHA, open problems, in visual terms), then stop and wait.

### 🤖 Claude — 2026-11-17T18:40:10.376Z

> 🔧 **Bash** `{"command": "git fetch origin ccr-067047f0-up5d1m 2>&1 | tail -2; git show FETCH_HEAD:docs/briefs/2026-11-17-r4/COMMON_RULES.md; git log --oneline -5; git status --short | head", "description": "Fetch lead branch and read common rules"}`

### 🧑 User — 2026-11-17T18:40:19.203Z

> ↩︎ result: * branch            ccr-067047f0-up5d1m -> FETCH_HEAD
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
>   Read these briefs with `git fetch origin ccr-067047f0-up5d1m && git show FETCH_HEAD:docs/briefs/2026-11-17-r4/<file>`.
> * **Why `-c4` branches:** account 3 (round 3) ran out of usage at ~18:13 UTC. Its sessions' containers may keep
>   autosaving to the `…-c3` branches, and they may wake when that account resets. Every round-4 workstream continu …[+3774 chars]


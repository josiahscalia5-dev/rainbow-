You are the SCREEN 08 SCENERY-IN-MOTION specialist (washer-environment-modeler role, `.claude/agents/`) of the RAINBOW
game — the user's EXISTING Android game. Do NOT restart, redesign or rebuild anything; never discard earlier work. Lead =
session `session_01VCMXoaUqBCxDq8BntT19BU` (branch `ccr-4bd35b15-7z45t0`). User priority round 6: Screen 06 and Screen 08.

Your branch: **`claude/rainbow-s08-scenery-c6`**, created by the lead at `claude/rainbow-s08-scenery-c5` @
`700f09e16ca0e44394a9926cd6a261541a645cad` (round 1 final `60e7ffe8` + transcript autosaves). Push ONLY this branch.

FIRST read (from the lead branch: `git fetch origin ccr-4bd35b15-7z45t0 && git show FETCH_HEAD:<file>`):
`docs/briefs/2026-11-17-r6/COMMON_RULES.md`, `docs/briefs/2026-11-17-r6/USER_DECISIONS.md`, then the r5 COMMON_RULES +
USER_DECISIONS, `docs/briefs/2026-11-17-r5/S08_SCENERY.md` and `REPORTS_ROUND5.md`. Then on your branch: `CLAUDE.md`,
`qa/match/08/NOTES.md`, `qa/match/08/scenery/STATUS.md`, `NOTES.md`, `SHARED_CHANGES.md`, `src/world/match08.ts`.
Lead's BEFORE frames (your kept round-1 set): `qa/lead_r6/2026-11-17/audit/08/` on the lead branch (12 shots).

## The user's words for 08
"Preserve the successful scenery reconstruction while correcting moving-camera seams, duplicated river surfaces, gold-band
clipping, coin spacing, and Benny's appearance." (Benny = the Benny workstream, not you.)

## Starting point = your round 1 (KEEP): `?match08=1&coins08px=1&m08bw=1&m08fill=1` (`m08lane` stays off)
Lead audit of that set: forward 3–10 u keeps the approved look well (lead rating moving ≈ 7/10, approved view ≈ 8.5/10).
Remaining defects seen by the lead:
* **Gold-band clipping:** a gold arch sliver/fragment enters the top-left corner when steering left (`s_left_steer`), and
  a partial left gold half-ring at 6 u.
* **Hard steering leaves the painted water:** at lat ±2.2 (hard right) Benny swims on the purple floor beside the painted
  S-river; the river must look like river wherever Benny can swim (world-anchored water continuing the painted design
  under the whole swim lane), approved view unchanged. Both hard-steer shots also lose a heart at s ≈ 404 (an obstacle at
  the end of 08) — report what it is; do NOT change gameplay rules.
* **Seams:** faint upper wall / ceiling seam and slot-size change (your round-1 notes).
* **Duplicated river surfaces:** check every steer shot for a second river copy / lower-left band (m08bw fixed the main one).
* **Cross-screen leak:** `?match08=1` must change ONLY Screen 08. Course part fixed in r5; remaining: Benny port under
  match08 (Benny files — do NOT edit; describe the exact stage guard needed in `SHARED_CHANGES.md` for the lead), 07 coins
  (`coins.ts`, lead-owned — same), 04 bubbles (`vfx/bubbles.ts` — a minimal match08-guarded stage check is allowed, list it).
* **Coin spacing** (big near coins at the bottom while moving): `coins08px.json` is lead-owned — measure and report only.

## Your milestone (round 2), one factor at a time, each behind its own switch, keep only what is VISIBLY better
1. Startup check (r5 COMMON_RULES with `-c6`). Reproduce the lead's frames with `tools/lead_r6/motion_audit.mjs 08`.
2. Gold-band clipping at the frame edges when steering (geometry / projection validity, not hiding with fog).
3. Swim-lane water: the visual river covers the whole lane Benny can reach, continuing the approved water design.
4. Ceiling seam + slot change.
5. 04–07 leak: 0 px with vs without `match08=1` for everything you own; list the rest precisely.
6. Proofs: tsc; default build 0 px (banner rows ~31–166 and animated 01/11 vary — capture twice); approved 08 view
   unchanged with the frozen `scripts/capture.mjs`; 07→08 drop intact (~61 u); gameplay 8/8 + exactly 91 / 2,240 with your
   kept set; continuity gap 0.
7. Deliver separate full-size **1 APPROVED · 2 BEFORE (r1 set) · 3 NEW** + BEFORE / NEW moving frames (all 12 audit shots,
   saved separately), numbers, honest ratings (approved view and moving), `STATUS.md`, `NOTES.md`, `SHARED_CHANGES.md`.
   APK attempt → `builds/rainbow-debug-08scenery-2026-11-17-r6.apk` (if Maven Central blocks it, record; NOT phone-tested).

## Coordination
You own `src/world/match08.ts`, `assets/textures/match08/` (except `coins08px.json`), `tools/match08/` (except the coin
tools), `qa/match/08/scenery/`. Never edit Benny (`src/characters/benny/*`, `assets/textures/benny0*/`), `camClear.ts`,
HUD, coins, Screen 04–07 match files, references or protected branches. The Screen 06 specialist runs in parallel on
`claude/rainbow-s06-match-c6` (no shared files expected). No paid jobs. No subagents. When done: push, verify remote ==
HEAD, ONE `send_message` to the lead **`session_01VCMXoaUqBCxDq8BntT19BU`**, then STOP.

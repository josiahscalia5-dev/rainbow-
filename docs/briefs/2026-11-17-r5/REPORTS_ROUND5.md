# Round 5 (account 5) — specialists' final reports to the lead (received 2026-11-17 ~20:42 and ~21:00 UTC)

Saved verbatim in substance (from `send_message` to lead session `session_013VHsJ9SbWPe9YXRvtUSngc`). Nothing is approved.

## Screen 08 Benny round 6 — `session_013VHsJAoze5D4wh6tk7r1hj`
* Branch `claude/rainbow-s08-benny08-bake-c5` @ `c68926764849cdaf3e51acf823a06eafb0c522cc` (remote == HEAD verified), started `fb72cc50`.
* KEPT (default on `?match08=1`; BEFORE r5b = `?match08=1&b08clump=0&b08yarn=0`):
  1. Soft layered fur clumps on the body (`b08clump`): a new clump model — rounded clumps lying downward, overlapping like
     shingles as in the painting, gentle shading; the spiky radial starburst is gone; the full round r5b body is kept
     (wider than the brim, round bottom in the splash). Arm puffs keep the r5b fur (clumps looked ragged there).
  2. Pom-pom yarn tufts (`b08yarn`): separate pointed violet tufts with darker gaps and lighter tips.
* Pictures `qa/match/08/benny08/review_r6/` (on its branch): 1_APPROVED / 2_BEFORE_r5b / 3_NEW as `_08_approved_view`,
  `_closeup`, `_pompom_closeup`; moving frames checkpoint, forward 3 / 6 / 10 u, steer left / right (fur, beanie, pom-pom
  and splash stay attached).
* Numbers (honest, a visual choice): Benny+splash within 20 levels 62.2 → 60.0 %; scenery 97.3 % unchanged; whole 85.0 →
  84.7 %; pom 19 → 14 % (new tufts do not line up texel-for-texel with the painted ones).
* Proofs: tsc clean; default 0 px vs `fb72cc50`; r5b / r3b / r4 / r2 URLs 0 px; gameplay 8/8, 91 coins (1,330 → 2,240),
  errors [] with and without match08; 04–07 with match08: only Benny's pom-pom and body change.
* Still open: pale streaks on the upper-left body beside the left arm (painting lighter there too, but softer); jagged
  pixels on the body outline and arm edges; pom tips lilac where the painting is deeper violet with white sparkle dots.
* APK NOT built: Gradle → Maven Central 429 (Too Many Requests); the container's Gradle cache lacks the Android plugin's
  dependencies. Retry step in its STATUS.md. The r5b APK remains the latest Benny APK.

## Screen 08 scenery-in-motion round 1 — `session_013VHsJAQsMA73qb7GCXdQ12`
* Branch `claude/rainbow-s08-scenery-c5` @ `60e7ffe8` (remote == HEAD), started `12fb8c5`.
* KEEP: `?match08=1&coins08px=1&m08bw=1&m08fill=1`. NOT kept: `m08lane` (no better with real textures; adds a gold arch
  sliver top-right when steering hard right; Benny was already clear of the pipe).
* Pictures `qa/match/08/scenery/final_r5/` (on its branch): `1_APPROVED_original.png`, `2_BEFORE_match08.png`,
  `3_NEW_match08_m08bw_m08fill.png`; moving frames `moving_BEFORE/`, `moving_NEW/` (checkpoint, forward 3/6/10/15/20 u,
  steer left / right, hard left / right, hard right at 6 and 10 u).
* Visually: `m08bw` — the jagged tear and second river copy at lower left stay gone when moving or steering. `m08fill` —
  the mirrored kaleidoscope on the upper chamber ceiling replaced by a continuous slotted wall made from the approved
  picture's own near pipe wall, world-anchored, colour matched (181/74/175 vs 181/74/179); the hard curved seam is a soft blend.
* Proofs: tsc clean; default 0 px on all 11 screens (01/10/11 capture noise, re-capture 0 px); approved 08 view: m08fill
  0 px, m08bw 13,374 px (1-px sliver on the arch's outer rim, 249 px > 20 levels, slightly closer); whole frame 81.04 %
  unchanged; continuity gap 0, 07→08 drop 61.2 u; gameplay 91 / 2,240 with and without its switches.
* `match08` on 04–07: main cause fixed in `src/world/course.ts` (08 river changed the course length → every path sample on
  03–07 shifted; match08-guarded, listed in SHARED_CHANGES.md): 04 510k → 234k px. Remaining (other owners): Benny under
  match08 (Benny files), 07 coins (`coins.ts`, lead), a few bubbles on 04 (`vfx/bubbles.ts`).
* Open: mild slot-pattern change where the fill meets the painted wall; faint corner line ceiling/door wall at 3 u; the
  real gold arch at frame edges when steering hard; at 20 u Benny is already on Screen 09.
* APK NOT built: Maven Central 404 for `kotlin-stdlib-jdk8-1.9.10.jar` through this environment's network (curl too).

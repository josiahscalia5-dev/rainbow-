# Round 34 (2026-11-21, lead session branch `ccr-3830a7b8-af3hrd`) — Screen 05: five parallel specialists

User's orders this round (verbatim excerpts: `USER_R34.md`): Benny swims naturally through the ORIGINAL approved Screen 05 with
Subway-Surfers-quality swipe controls (3 lanes that follow the river's real curves, leap, dive), natural follow camera, approved look kept
WHILE swimming (90–95 % target, never claimed without evidence), real touch tests over the whole ~23 s level, then a phone-playable build the
user can try. Five specialists in parallel + a reusable "Rainbow Screen Builder" skill. Screen 05 only. No paid credits. No restarts.

## Base (do not replace it)
The round-33 tunnel kit (`docs/briefs/2026-11-21-r33/RESUME_R33.md`, `REPORT_R33.md`): one straight 3D tunnel fitted to the painted rings,
textured with the APPROVED picture's own pixels, camera-relative depth curve; round-32 Benny + `controls.js`. Start frame: scenery 80 % of
pixels within 20 levels, SSIM 0.76, colour 0.99 (splat world: 12.7 %). Lead commit with the shared foundation: `9a46d34` (+ autosaves).

## Shared tools (all in `tools/kit05/`)
* `setup_kit.sh <ws>` — runnable game folder `<ws>/game` from YOUR worktree's code (bake ~15 s; `SKIP_BAKE=1` after page-only edits).
* `render_slot.sh <cmd>` — EVERY headless-Chromium render goes through it (max 2 at once on this 4-CPU, software-WebGL machine).
  Whole-level runs (~30 min): `RENDER_SLOT=2`. Usage log: `/tmp/rainbow_r34/locks/usage.log`.
* `tools/marble05/viewer/final_acceptance.cjs <game> <out> [secs] [speed]` — frame-stepped run with REAL CDP touch swipes,
  412x915 Android-portrait emulation; `PLAN=fixed` = the 7.6 s plan; without it = whole level following the coin trail. ~2.5 s/frame.
* `live.js` + `play3.html?live=1` — REAL-TIME mode (requestAnimationFrame, tap to start, fps + swipe-response meter, `window.liveStats()`);
  `live_check.cjs <game> <out.json> [secs]` drives it with real touch swipes on the wall clock (software WebGL here: fps is not a phone's).
* `compare_r33.py`, `tools/marble05/viewer/visual_check.py`, `acceptance_verdict.py` — likeness / dark-patch / verdict tools.

## Worktrees and file ownership (edit ONLY what you own; never commit; never push; the lead merges)
| specialist | agent | worktree (branch, LOCAL) | owns |
|---|---|---|---|
| S1 visual accuracy | washer-environment-modeler | `/home/user/wt/s05-visual` (`claude/rainbow-s05-visual-c34`) | `bake_kit.py`, `kit_model.py`, `bake_foam.py`, new bake scripts, `kit.json` fields incl. the NEW `river_center`; in `kitgame.html` the SCENERY code: "the depth curve" … water-surface mesh, `core` sprite, glints (setup + loop in `step`), FLOW/REMAP uniform lines in `step`, `updateEnd` / ending |
| S2 Benny swimming + controls | animation-and-gameplay-engineer | `/home/user/wt/s05-swim` (`claude/rainbow-s05-swim-c34`) | `controls.js` (all), new `swimfx.js` if needed; in `kitgame.html` the BENNY block ("Benny (round-32 Benny…" … splash sprite), and in `step` the `U.*`, `CT.anim`, splash and `CT.water` lines |
| S3 camera + gameplay | path-camera-transition-engineer | `/home/user/wt/s05-camera` (`claude/rainbow-s05-camera-c34`) | in `kitgame.html`: "Benny's path" (`at`, `frameAt`, trail), coin layout / visibility / declutter / `coinScreen`, the `qc` camera defaults, and in `step` the `st.*`, Benny position / orientation, camera and coin lines; reads `K.river_center` |
| S4 testing | playwright-visual-qa | `/home/user/wt/s05-qa` (`claude/rainbow-s05-qa-c34`) | NEW files under `tools/kit05/qa/` only (tests, checkers, reports); never game code |
| S5 Rainbow Screen Builder | general-purpose | `/home/user/wt/s05-builder` (`claude/rainbow-screen-builder-c34`) | NEW `.claude/skills/rainbow-screen-builder/**` only |

Interface S1 → S3: `kit.json` → `river_center = {"ds": 0.05, "c": [...]}` = the river's centre line as a lateral offset (world units along
`K.RR`) every `ds` of path length from Benny's start point; S3 makes `at(s)` / `frameAt(s)` follow it (so lanes, coins, glints, splash
follow the river's bends automatically). Until S1 delivers it, S3 tests with `?bend=amp,wavelength` (synthetic) and treats a missing
`river_center` as straight.

Each specialist writes its running notes to `<worktree>/docs/briefs/2026-11-21-r34/notes/<s1|s2|s3|s4|s5>.md` and proof images to
`<worktree>/qa/kit05/r34/<s1..s5>/` (≤ 5 MB each). The five-minute autosave snapshots every worktree's uncommitted work to
`backups/wip/<branch>/` on GitHub (`tracked.patch` + new files), so nothing is lost if the session ends.

## Rules for every specialist
* Screen 05 ONLY. Never change `references/**` (13 approved files, `sha256sum -c scripts/reference.sha256`). No paid credits / jobs
  (World Labs, Thrixel, fal, SpAItial, Meshy, Hugging Face paid) — free reads only. No installs of new plugins; never `playwright install`.
* Keep the approved look: purple-and-gold tunnel, gold rings + machinery, cyan/blue/pink river, white splashes, coin trail, the approved
  pink Benny (fluffy body, purple-and-white striped hat, pom-pom, yellow star). Never redesign to make movement easier.
* No scripted / automatic jumps or dives; swipes must drive Benny's real 3D position.
* Measure, don't guess: every claim with numbers + pictures (APPROVED | BEFORE | NEW as separate full-size images, no grids for the user).
* Short tests while developing (stills, ≤ 3 s runs); whole-level runs only at milestones (S4 / lead).
* Never interrupt or edit another specialist's worktree; read-only look is fine.

## Integration (lead)
`git diff` of each worktree → applied onto the session branch in the order S1, S3, S2 (scenery, path, Benny); conflicts resolved by the
owner rules above; then S4's whole-level acceptance + visual checks; fix → retest; only after EVERYTHING passes: phone build
(web link + Android debug APK). Phone frame rate can only be measured on the user's phone (no KVM / emulator here): the build shows it.

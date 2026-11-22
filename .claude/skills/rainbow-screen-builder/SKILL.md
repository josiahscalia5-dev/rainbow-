---
name: rainbow-screen-builder
description: Use when the Rainbow lead wants to turn an approved Rainbow screen picture (references/04-10) into a playable 3D level, to measure or test a Rainbow level against its approved picture (likeness numbers, APPROVED / BEFORE / NEW pictures, short or whole-level touch runs), or to dispatch the project specialists for a Rainbow screen in isolated worktrees.
---

# Rainbow Screen Builder

**Core principle:** every playable screen is REAL 3D geometry fitted to THAT screen's own approved picture, textured with that
picture's own pixels, played with the shared Benny + swipe controls, and MEASURED against the picture after every change.
No generic environments, no AI re-interpretation, never another screen's level (Screen 05's tunnel stays Screen 05's).

Files: `screens.json` (per-screen settings, gates, validated masks) · `LESSONS.md` (bugs and rules already paid for — read before
building) · `dispatch_templates.md` (specialist briefs + ownership map) · `scripts/` (thin wrappers; paths below are relative to this
skill folder; run them with `bash` / `python3 -I`).

## Gates — check FIRST, every time
| Rule | Enforced by |
|---|---|
| 01, 02, 03, 11 are the user's Google Flow videos, never 3D levels | `new_screen_workspace.sh` refuses (exit 3) |
| Never start the next screen / batch (04+06, 07+08, 09+10) before the user approved the previous one | `screens.json` `gate`; the workspace script refuses (exit 4) without `--user-ok <file with the user's verbatim OK>` |
| No paid credits (World Labs, SpAItial, Thrixel, fal, Meshy, HF paid) without the user's OK naming the job and its credits; no plugin installs; never `playwright install` | you |
| `references/**` never modified | `validate_05.sh` step 1 (`scripts/reference.sha256`) |
| Never show unfinished gameplay as finished; every claim = numbers + pictures | steps 6 and 8 |

## Workflow (in order)

**1. Load the screen's OWN approved picture + clarifications.** `screens.json → screens.NN` gives the reference, its identity line and
its briefs; also read `binding_briefs_all_screens` (USER_VISUAL_BRIEF_R26 §6 per screen, USER_CLARIFICATIONS_R28, the newest
`docs/briefs/*/USER_R*.md`). Write down the screen's defining features (e.g. 06 = curling crest + off-centre tunnel).

**2. Analyse it.** `python3 -I scripts/analyze_reference.py references/NN_*.png <ws>/analysis/analysis.json --overlay <ws>/analysis/overlay.jpg`
→ HUD band, vanishing point (glowing core ranked by surrounding gold arcs + an LSD line estimate), repeated ring tops and their ratio
(05: ~1.5 = the painting's NON-strict perspective), water area + river centre, palette + colour classes, intentional dark spots,
painted Benny box, painted coins. These are ESTIMATES: look at the overlay, re-run with `--vp x,y` if the core is wrong, then record
the confirmed values (validated `compare_mask`, measured constants) in `screens.json`. LOW confidence flags are normal for chambers / waves.

**3. Choose the construction method from what really happened:**
| Method | Evidence | Verdict |
|---|---|---|
| **Kit fitted to the picture**: real geometry fitted to the painted structures, camera-relative depth curve where the painting is not strict perspective, textures = bilinear samples of the APPROVED pixels where each surface lands in the approved view, own-pixel LOD near the start, clean plate only where Benny / coins / HUD hide the scenery (`tools/kit05`, r33) | 05 start: 80.0 % scenery pixels within 20 levels, SSIM 0.76, colour 0.99; stays sharp all level; 2.5 s/frame software render | **USE** — refit for each screen from ITS picture |
| Splat world from one picture (Marble / SpAItial, r32) | 12.7 % at start, blurs after ~2-3 s of swimming, rings + water plane do not sit on the painting (VP 138 px off), ~25 s/frame, paid | NO |
| Painted plate held still + 3D Benny (`?paint=1`), zoom loop (`?paintfly=1`), picture depth plates (`?paint06=1`) | 97-98 % pixels, but the user demands REAL playable 3D: "no video / moving background / scripted path" (USER_R32) | NO |
| Live camera projection of the picture onto fitted geometry (`?match08=1`, `?proj05=1`) | 95.4 % at the start, TEARS when Benny moves / steers | Only as a BAKE source (into per-surface textures), never projected live |
| Generic / AI-generated environments or re-textures (Thrixel, Scenario YVO3D, Cuberta kit pieces) | a new interpretation of the art; Thrixel foam test (r19) not an improvement (`TOOL_EVALUATION_R33.md`) | FORBIDDEN |
| Copying another screen's level (e.g. the 05 tunnel into 04 / 07) | every screen keeps its own approved design (user, r34) | FORBIDDEN |
Starting hypotheses only (test them on the start frame first): 04 and 07 are ring tubes → a kit fitted to THEIR rings (04 warm-gold
tunnel + five 3D arrows; 07 bent axis for broad S-bends + the 07→08 drop); 06 = crest surface fitted to the painted crest + an
off-centre tunnel; 08 / 09 / 10 = chamber / wave / towel geometry fitted to their own pictures, baked from their own pixels.

**4. Build with the proven tools — parametrised per screen, never forked copies.** Today `tools/kit05/` is Screen-05-only. Its
screen-specific numbers must move into a per-screen config read by the SAME scripts (default 05 stays byte-identical: prove it with
`bash scripts/validate_05.sh <scratch>`): `kit_model.py` (reference path, camera `scene05.json`, `VP`, `RING2_PX`, `RATIO`, `CAM_OFF`,
`RT`, `RING_IN/W`, `CAM_H`), `bake_kit.py` (clean plate `qa/worldlabs/05/r32/input_05_clean.png`, HUD cover rows 205), `bake_foam.py`
(foam band centre / angle), `painted_coins.py` (coin ROI), `fit_tunnel.py` (gold cut-off rows, start values), `kitgame.html` (title,
level length, coin runs, ending), `setup_kit.sh` (kit05 paths). A new screen without a clean plate: free inpainting of Benny / coins /
HUD from its own pixels first; generated plates only with the user's OK. Owner: `washer-environment-modeler` (after 05 is approved).

**5. Reuse Benny, controls, camera and the phone mode.** Same files, no copies: Benny = `assets/models/benny31.glb` + bake + the
paddling shader block; swipes = `tools/kit05/controls.js` (`installControls`; lanes follow `kit.json river_center`); follow camera =
the `qc` defaults; real-time phone loop = `live.js` (`play3.html?live=1`). Per screen only the numbers change (Benny scale / offset to
the PAINTED outline from step 2, camera height). Page contract the tests need: `window.ready`, `step(t, dt, steer, speed)`, `state()`,
`renderNow(n)`, `camInfo()`; whole level also `coinLayout()`, `levelEnd()`, `endK()`, `bennyInfo()`, `coinScreen()`; live `liveStats()`.

**6. Compare automatically against the approved picture.**
`python3 -I scripts/compare_to_approved.py screen:NN <frame or run dir> [--before <frame or run dir>] [--frames 0,45,89] --out <dir>`
* aligned start frame (approved camera): share of SCENERY pixels within 20 levels, mean difference, SSIM, colour look, sharpness —
  same formulas as `compare_r33.py`; mask = below the HUD minus Benny's box (`screen:NN` validated mask, or `auto:<analysis.json>`).
* moving frames: colour look, sharpness, colour-class balance vs the approved (water / pink / gold / purple / foam).
* writes `APPROVED.jpg`, `BEFORE_fNNNN.jpg`, `NEW_fNNNN.jpg` (SEPARATE full-size phone frames with a label band — never a grid for the
  user) + `DIFF_NEW_fNNNN.jpg` + `compare.json` with the regions and screen zones holding the mismatch.
Report "X % of scenery pixels within 20 levels" — a measurement, never "X % likeness". Judge IN MOTION: start, middle, end, hard left,
hard right, crest / bend, transition — normal speed first (USER_VISUAL_BRIEF_R26 §8; R19 "approved screen" = same look while swimming).

**7. Route the biggest differences to the right specialist.** `compare.json → route_first` names the region + owner (water →
`water-fx-specialist`, walls / rings → `washer-environment-modeler`, foam → `foam-bubbles-particles`, coins → `path-camera-transition-engineer`,
Benny's look → `benny-character-artist`, swim / swipes → `animation-and-gameplay-engineer`, tests → `playwright-visual-qa`, triage →
`reference-match-director`). Dispatch with `dispatch_templates.md`: ONE owner per file / code block, one LOCAL worktree each
(`bash scripts/new_screen_workspace.sh NN --round R` → sparse checkout + `GIT_LFS_SKIP_SMUDGE=1`), every render through
`bash tools/kit05/render_slot.sh <cmd>` (2 slots on this 4-CPU software-WebGL machine), lead merges scenery → path → Benny. At most
two screens per batch. Reuse the ten agents in `.claude/agents/`; never rename or recreate them.

**8. Short tests while iterating, whole-level touch acceptance only at milestones.**
| Ladder | Command | Cost |
|---|---|---|
| start frame + numbers | `bash scripts/acceptance.sh <game> <out> --start --screen NN` | ~1 min |
| short real-touch run (fixed swipe plan, <= 3 s) | `... --short 3` (numbers + visual checks, no verdict) | ~4 min |
| whole level, real CDP touch, 412x915 Android portrait, fixed-threshold verdict | `... --full` (RENDER_SLOT=2, QA / lead only) | ~30 min |
| real-time phone loop | `... --live 8` (software WebGL: fps is NOT a phone's) | ~2 min |
Phone build (web link + Android debug APK) only after `--full` passes EVERY criterion; never loosen a threshold to pass.

**9. Save settings, assets and lessons.** Confirmed values + status → `screens.json`; new bug or user rule → `LESSONS.md` (one line:
symptom → cause → fix → how to check); running notes `docs/briefs/<round>/notes/<sN>.md`; proof pictures `qa/<area>/<round>/<sN>/`
(<= 5 MB each). The five-minute autosave snapshots worktrees; check `python3 -I scripts/autosave-status.py` → `AUTOSAVE OK … (match)`.
Specialists never commit or push; never commit secrets.

**10. The user's approval gates.** Show APPROVED | BEFORE | NEW + moving views + clip, say what got closer, what still differs, any new
problem, what is next. Then WAIT: the next screen / batch starts only after the user approves (record the OK in a brief, flip the
gate in `screens.json`). Paid jobs: name the job and its credits, wait for the OK.

## Red flags — stop
* "Reuse the 05 tunnel for 04/07, they look similar" → no: fit a kit to THEIR picture.
* "A generated world / AI plate will be faster" → measured worse (12.7 %) and blurs; paid.
* "The start frame matches, ship it" → the user judges while swimming; run the moving views.
* "Loosen the check so the run passes" / "add an automatic jump for the test" → never.
* "Start 04+06 while waiting for the verdict" → the gate is closed until the user approves 05.
* A whole-level run while specialists iterate → use `--start` / `--short`; full runs are milestones.

## Self-test
`bash scripts/validate_05.sh <scratch dir>` (Screen 05 only, ~1 min, one render): references unchanged, gates refuse 01 / 06,
workspace = the round-34 kit workspace (bake byte-identical), analysis vs the round-33 hand measurements, stored round-33 frames
re-scored to the exact `compare_r33.py` numbers, fresh start frame 77-83 % / SSIM 0.73-0.79 (r33: 80.0 % / 0.759).

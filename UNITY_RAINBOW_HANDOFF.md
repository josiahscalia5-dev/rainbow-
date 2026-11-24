# Rainbow Unity — handoff (latest verified state)

Last verified: **2026-11-23 23:30 UTC** (18:30 New York time), Claude session on the user's laptop (after the third account switch).
Read this first in any new Claude account or session. **This is an existing project — never start over.**
Project rules for Claude: `CLAUDE.md` (loaded automatically when a session is opened in `C:\RainbowUnity`).

<!-- NEXT-TASK:START -->
**UPDATE 2026-11-23 23:30 UTC (third Claude account; ROUND 3 RUNNING):** the second account hit its 5-hour limit at 23:07 UTC
while the round-2 BUBBLES agent was starting its final check. The new account verified everything (Git = GitHub `f67c5f1`,
one autosave task, Editor open + ready, nothing running) and finished round 2 itself: `bubbles_final` cycle 18:25 local exit 0,
compile-clean, 0 warnings, gameplay check 33-50 visible bubbles and none over Benny while steering/jumping. Round 2's separate
integration/review was SKIPPED to save credits (round 3's own Integrate/Review cover it). Honest round-3 baseline (S = 14.00,
normal camera): `evidence/screen05/ROUND3_BASELINE.png` + `_sbs.jpg`, scores **visual 52.4 / layout 32.7** (round-2 start
51.1 / 32.1). `tools/screen05-cycle.ps1` now prints the measure table + writes `<still>_overlay.jpg` after every cycle.
The user (18:15 local) read and APPROVED skipping all three tools in `docs/tool-evaluation-2026-11-23.md` (install nothing).
The water-contact test is NOT started yet: it is part of round 3's BENNY stage (the splash agent's contact shadow behind Benny
already exists - build on it). **Round 3 = Workflow run `wf_9320b9e1-c74`** (launched 23:28 UTC, session
`df1b2c26-91e9-4240-8bd4-29c06e5960e0`; journal: `%USERPROFILE%\.claude\projects\C--Users-josia--unity\df1b2c26-91e9-4240-8bd4-29c06e5960e0\subagents\workflows\wf_9320b9e1-c74\journal.jsonl`):
frame -> river | tunnel -> benny -> integrate -> 2 reviewers. **FRAME finished 19:35 local** (partly improved; OVERALL
52.4/32.7 -> 52.8/33.8, walls 49.5 -> 54.1, throat 65.6 -> 67.9; still `work/20261123_192653_frame_final.png`): DrumLayout05
Radius 6.8, axis 4.25 m above water (near drop to 3.25 for s < 35.5), rings at s 5.6/24.3/45.5/66.4/106.5/163.6/230.1/333/450.4,
throat cap s 470, camera at s 14 (-0.06, 3.40, 7.48) euler (12.78, 357.20, 0) fov 62, vanishing point (496, 478); the hold is now
deterministic (whole frames, always S = 14.00). River | tunnel lanes started 19:35. **If interrupted:** read that journal, put every area with a
"result" line into `args.skip`, write `args.notes.<area>` for the interrupted one (its newest files + work stills), and relaunch
`staging/shared/round3-composition.workflow.js` with the same `baseline` + `context` args, saved exactly in
`staging/shared/round3-args.json`. After round 3: send the user the ROUND3_FINAL side-by-side + both scores + the recording.
**User 18:35 local:** after EACH stage (Frame, Shape, Benny, Integrate) send the stage agent's existing final side-by-side +
its scores (no extra tests just for previews); at the next safe checkpoint evaluate whether procedural geometry / live Editor
tuning / stronger compatible Unity tools could speed things up (install nothing without approval); AVOID REDUNDANT AI REVIEWERS:
the running run still has 2 critics after Integrate, so the coordinator stops it (TaskStop) right after the integration result
and reviews the final evidence itself; relaunches use `round3-args.json` (`reviewers: 0`, supported by the script since 18:45).
**User 19:05 local (read-only, nothing installed):** full tool inventory + speed-up options in `docs/tool-inventory-2026-11-23.md`
(keep Unity; no engine switch). Not working but harmless: Playwright + TypeScript LSP plugins (need Node.js), Blender MCP (Blender not
installed), old Unity AI Assistant relay in `~\.unity\relay`, empty `Hub\Editor\6000.6.0f1` stub. Proposed for after round 3 (free):
approved-screen TARGET SHEET, solve-first FITTER (extend `screen05_frame_probe.cs`), live tuning while paused, numbers-first agents;
needs the user's OK: cheaper Claude model for mechanical steps, connecting the CLI's `unity mcp` server.
**User 19:20 local:** interested in the CLI's `unity mcp`, but only if it brings a real benefit (Unity's own unity-cli skill says:
with a shell, use `unity command`, not MCP - the CLI reaches more). A read-only CLI-vs-MCP speed/token test (temporary `unity mcp`
child process, nothing registered; takes the cycle lock) runs at the Frame->Shape stage boundary; result goes here. Also found
(read-only, for after round 3, each needs the user's OK where it changes settings): Enter Play Mode is set to RELOAD the domain
(`EditorSettings m_EnterPlayModeOptions: 0`) - ~30 s of every ~65-100 s cycle is that reload ("Reload Scene only" + static resets
would cut it); Pipeline `script.methodreload` (hot-reload `[MethodReload]` methods in Play mode); Splines `SplineExtrude` (round
tube along a D-shaped spline = thick paddle rims); Cinemachine 3 `CinemachinePositionComposer` / `RotationComposer` (screen-space
framing: Benny's screen spot, dead zones); unity:urp-postprocessing skill for bloom/tonemapping; craft-game-floors references
(camera-rigs, scene-lighting, vfx). ProBuilder: little value for code-built meshes.

**UPDATE 2026-11-23 23:05 UTC (USER PRIORITY = COMPOSITION):** the user wants the approved Screen 05 COMPOSITION recreated in
the playable scene, in this order: (1) tunnel geometry, perspective, depth, camera framing; (2) narrow winding S-shaped river
and its proportions; (3) purple walls, gold rings, larger copper paddles; (4) narrow, taller foam banks; (5) Benny's size,
position, waterline, splash; (6) coins and HUD. Target 90–95 % VISUAL similarity; report visual AND layout similarity with
how they are calculated; no score manipulation by alignment/cropping (the measure tool now compares at identical positions,
no shift search); identical 864×1536 resolution and the normal gameplay camera at s = 14.00. Round 3 = composition-first
workflow `staging/shared/round3-composition.workflow.js` (launch after round 2 finishes). The water-contact test from the
tool evaluation is folded into round 3's Benny stage. Never declare Screen 05 approved; no Screen 06.

**UPDATE 2026-11-23 23:00 UTC (tool evaluation):** see `docs/tool-evaluation-2026-11-23.md`. Unity AI Material Generator: not
now (credits unknown - the user must sign in to Unity in the browser pane to check; needs package/Cloud link or the beta CLI
`ai` plugin; adds surface detail, not the shapes that dominate the gap). ShoreLine: do not import (v1.0, no docs/ratings,
Asset Store EULA blocks pushing it to the public GitHub branch); borrow its water-contact idea natively. Material Maker: skip.
**Next small test after round 2:** analytic water-contact at Benny's waterline (absorption + contact foam line in the wake
section of `RainbowRiver.hlsl`), judged on splash/benny crops + `tools/screen05-measure.ps1` + steer/jump; keep only if closer.

**UPDATE 2026-11-23 22:45 UTC (likeness measuring + round-3 plan):** new read-only tool `tools/screen05-measure.ps1 <still.png> ...`
prints two calibrated scores vs the approved image (100 = same picture), overall and per crop area: **look** (at a glance:
coarse shapes/colour layout within ±48–64 px + colour distribution) and **exact** (strict layout within ±16 px). `-Calibrate`:
the approved image shifted 8–48 px or 15 % brighter scores look ≈ 90–91, mirrored 65, upside down 37 → use look ≥ 90 as the
measured meaning of the user's 90–95 % target, always with the side-by-side. Scores: round-2 BASELINE look 51.2 / exact 32.3;
`bubbles_t2` (17:34 local) look 52.3 / exact 32.6. Round 2: splash ✔ and foam ✔ finished (reports in the run journal),
bubbles running, then integration + 2 critics. **Round 3 plan (biggest differences first):** (1) camera framing + tunnel
cross-section/depth: walls must rise right behind narrow foam rims (Unity floor too wide, walls at x = ±6.25), many tightly
spaced concentric rings into a small bright vanishing point, big copper D-tray paddles, wall slot rows; (2) river course
composition (narrower open river, stronger S-curves at mid distance, foam rims following, coins on the curve); (3) Benny +
splash + HUD polish (flat-cut bottom at the waterline, suds too high, HUD bar colours). Add the measure to the cycle tool
after round 2 (not while its agents run cycles).

**UPDATE 2026-11-23 21:47 UTC (new Claude account, round 2 RESUMED):** the previous account hit its 5-hour limit at 21:21 UTC
while the round-2 splash + foam agents were working (checkpoint `759d746`). The new account re-verified everything (Unity
6000.3.29f1 + Unity Personal active, Editor open, `unity status` ready on port 7800, all packages in `Library/PackageCache`,
GitHub in sync + push dry-run OK, exactly one autosave task) and recompiled (0 errors). Note: the Claude Code sessions are
opened in `C:\Users\josia\.unity` (the user calls it their workspace; it only holds Unity's MCP relay + Claude settings); the
project itself is here in `C:\RainbowUnity`. The optional "Unity" Claude plugin is not added to the new account (not needed).
Round 2 relaunched as Workflow run `wf_14866b3f-a9e` with `args.skip = ["water","scenery"]` and `args.notes` (new: per-area
text appended to the brief) telling splash/foam what their interrupted attempt left: splash = new `RainbowSplash.shader`,
rewritten `SplashWake.cs`, first result `work/20261123_162048_splash_t1_*`; foam = new `RainbowFoamBank.hlsl` + rewritten
`FoamBank.cs` (sphere impostors), never tested. If interrupted AGAIN: look at the run's `journal.jsonl`
(`%USERPROFILE%\.claude\projects\C--Users-josia--unity\394c2944-483b-4b91-b420-f0503d3c2477\subagents\workflows\wf_14866b3f-a9e`)
to see which areas returned a result, add those to `skip`, and relaunch
`staging/shared/round2-fixes.workflow.js` with `notes` describing the unfinished areas' newest files and work images.

**UPDATE 2026-11-23 20:30 UTC (round 2 started):** the tuned wall / gold / Benny-fur / bubble values are now IN the builders
(EnvironmentBuilder.SetupWall/SetupGold, BennyRigBuilder.BennyMaterial, WaterBuilder.BuildBubbles, camera depth in
GameplayBuilder) — verified: a full rebuild leaves all 141 material values identical (commit `c1a3217`, pushed).
New test tool: `tools/screen05-cycle.ps1 -Tag <name> -Areas water|foam|bubbles|splash|light|all [-Series] [-NoRebuild]`
(recompile → rebuild → Play → hold at s = 14 → 864×1536 still + side-by-side + area crops; one cycle at a time via a lock;
work images in `UnityProject/Recordings/Screen05/work`, git-ignored). `AgentScripts/screen05_hold_approved.cs` is now
deterministic (Benny exactly s = 14.00, camera (-0.06, 3.32, 7.07) every run). Baseline: `work/20261123_152447_BASELINE*`.
Round-2 fix workflow running (water → splash | scenery → foam → bubbles, then final capture + recording + 2 critics).
If it was interrupted: check `git log`, rerun the cycle with `-Areas all -Series`, compare with the baseline, continue.

**UPDATE 2026-11-23 19:20 UTC:** all 4 specialists are DONE and integrated; the full scene builds and plays
(`Assets/Rainbow/Scenes/Screen05.unity`, Rainbow → Build Screen 05 Scene). ProBuilder 6.1.4 + Animation Rigging 1.4.1 added.
Round 1 evidence: `evidence/screen05/round1_*.jpg`. Five biggest differences found: (1) foam banks too thin/flat,
(2) bubbles invisible (they spawn 11–30 u ahead over the white foam), (3) water = many thin outlined stripes instead of
broad satin pink bands, (4) walls: holes too sparse + white "spoke" streaks, (5) Benny's white splash wake missing.
Walls/gold/Benny fur were tuned live in `UnityProject/AgentScripts/screen05_tune_look.cs` (materials saved; SSAO turned off)
— these values must still be copied into `EnvironmentBuilder.SetupWall/SetupGold` or a rebuild resets them. The round-2 fix
workflow (river+wake, foam, bubbles) was stopped by the user mid-way: check `git diff` in Assets/Rainbow/Water before rebuilding.
Useful scripts: `AgentScripts/screen05_hold_approved.cs` (pause at the approved view), `screen05_series_approved.cs`
(before/at/after stills), `screen05_framedebug.cs` (Frame Debugger list), `screen05_record_gameplay.cs` (run reset first).
Original plan below (steps 1–3 are done):
**Next unfinished task: finish the short playable Screen 05 test (original approved reference only).**
1. Open the Unity Editor if it is closed: `unity open C:\RainbowUnity\UnityProject --until-ready`, then check
   `unity status --project-path C:\RainbowUnity\UnityProject` (state must be ready).
2. Finish the 3 unfinished specialists from their saved briefs, KEEPING the files they already wrote
   (a staging folder without README.md is unfinished). At most 2 at a time on this laptop:
   * Agent 2 environment (purple washer tunnel, gold rings, copper-gold paddles, far glow): 16 files in `staging/agent2-environment`
   * Agent 3 water, foam, bubbles, lighting: 12 files in `staging/agent3-water-vfx`
   * Agent 4 Benny, swim/steer/jump, camera, coins, HUD: 19 files in `staging/agent4-benny-gameplay`
   Prompt: "Read COMMON and AGENTn in C:\RainbowUnity\staging\shared\specialists.workflow.js and follow them. Continue from
   the files already in your staging folder; do not rewrite finished files; write README.md when done."
3. Coordinator only: copy the finished outputs into `UnityProject/Assets/Rainbow`, run menu Rainbow → Build Screen 05 Scene
   (`UnityProject/AgentScripts/screen05_build_scene.cs`), fix compile errors.
4. Play-test about 10 s, then evidence with the test tools: approved vs Unity Game view at 864×1536 side by side, a continuous
   gameplay recording, a moving-view series, and an explicit list of remaining differences (no likeness % without measurements).
5. Update this handoff (keep these NEXT-TASK markers). Autosave pushes to GitHub every 5 minutes.
<!-- NEXT-TASK:END -->

## ✅ CURRENT STATE (2026-11-23 21:55 UTC) — verified by the new Claude account
**Newer (23:30 UTC, third account):** round 2 is COMPLETE (water, lighting/scenery, splash, foam, bubbles); round 3
(composition-first) is RUNNING as run `wf_9320b9e1-c74` (see the first NEXT-TASK entry). Newest honest still:
`evidence/screen05/ROUND3_BASELINE.png` (visual 52.4 / layout 32.7). The bullets below are older where they disagree.
This also completes the user's 16:13 local request "SAVE EVERYTHING TO MY GITHUB NOW" (the old account made and pushed the
checkpoint commit but hit its limit before updating this file and confirming).
* **Git / GitHub**: branch `unity/screen05-dev`. The user's requested checkpoint = `759d746` (16:21 local, "Screen 05 round 2 in
  progress"); newer autosave commits follow it. Every check today: local HEAD = GitHub (`git ls-remote`), push dry-run OK.
  Git LFS: 2 objects (`benny31.glb` 5.2 MB, stored once and used twice; round-1 gameplay mp4 7.2 MB) confirmed STORED on GitHub
  via the LFS batch API. Library/Temp/Logs/UserSettings and `Recordings/Screen05/work` are git-ignored (regenerable).
* **Five-minute autosave = Windows Task Scheduler task "Rainbow Unity Autosave"** (the only one; no Claude scheduled tasks or
  shell loops). Every 5 min, hidden, runs as the user while signed in: `tools/autosave.ps1` (one pass: commit + push only when
  something changed or a push is pending; never force-push/merge/reset/delete; leaves out likely secrets and >50 MB non-LFS
  files). Log `.git/autosave.log`, last pass `.git/autosave.status`. Needs no Claude session, so it survives account switches
  and restarts. Repair (safe to re-run, never duplicates): `tools/setup-resume-system.ps1`.
* **Unity**: 6000.3.29f1 + Unity Personal (and Asset Store) licenses active; Editor OPEN with this project since 13:23 local;
  `unity status` = ready (port 7800); CLI 1.0.1; the Pipeline 1.0.1 bridge answers commands. Packages (all already in
  `Library/PackageCache`, no reinstall): URP 17.3.0, Input System 1.20.1, Cinemachine 3.1.7, Pipeline 1.0.1, glTFast 6.21.0,
  Splines 2.9.2, ProBuilder 6.1.4, Animation Rigging 1.4.1, Timeline 1.8.13, Test Framework 1.6.0, uGUI 2.0.0. Recompile at
  21:45 UTC: 0 errors.
* **Screen 05**: `Assets/Rainbow/Scenes/Screen05.unity` is built from code (menu Rainbow → Build Screen 05 Scene) and plays
  (swim, steer, jump, coins, HUD). Target: the approved `references/05_flow_into_the_current.png` only (binding rules below).
* **Specialists**: all 4 original specialists FINISHED (README.md in each staging folder) and integrated. Round 2 fix workflow
  (`staging/shared/round2-fixes.workflow.js`): water bands ✔ and lighting/scenery ✔ (`evidence/screen05/round2_progress/NOTES.md`);
  splash/water contact and foam banks were interrupted at 21:21 UTC and are RUNNING again (run `wf_14866b3f-a9e`, 21:44 UTC);
  bubbles, the final integration (full cycle + 12 s gameplay recording) and two reviewers are queued after them.
* **Remaining visual differences** vs the approved image (newest still: `work/20261123_162048_splash_t1_sbs.jpg`):
  1. Foam banks: a flat snowy strip on the far banks only, nothing in the lower half (approved: thick pearly clustered soap foam
     along both banks down to the near corners) — foam agent running.
  2. Bubbles: none visible (approved: about 25–35 iridescent bubbles) — bubbles agent queued.
  3. Benny's splash: he now sits in the water with a collar and two spray fans, but the fans are straight white streaks and a hard
     ring shows under him (approved: bubbly foam spray, droplets, soft V wake) — splash agent running.
  4. The open river reads ~1.5× too wide at mid/far distance (Three.js `channel05` narrowing + far foam shelves not ported).
  5. Scenery: deep walls lack the concentric dark slot rows; paddles smaller, higher and tilted (approved: big D-trays with a thick
     polished rim near the horizon); rings less polished; far glow merges into one over-saturated orange disc.
  6. Camera: about 0.5 m too far back (near ring ~4 % small), vanishing point ~9 px right, Benny ~30–40 px lower than approved.
* **Resume helpers** (read-only): `CLAUDE.md`; `.claude/settings.json` SessionStart hook → `tools/session-start.ps1`;
  `/resume-rainbow` skill; desktop shortcut "Resume Rainbow"; a short pointer in `%USERPROFILE%\.claude\CLAUDE.md`.
* Laptop: C: 8.5 GB free, RAM ~1.6 GB free. Errors today: two 5-hour usage limits (17:39 and 21:21 UTC); nothing was lost.

## Switching Claude accounts (what the user does)
1. Wait until the newest autosave is pushed (or ask Claude "save now"). Everything is in `C:\RainbowUnity` and on GitHub.
2. In the Claude app: click your name/initials at the bottom left → **Log out** → sign in with the other account.
3. Click **Code** → start a new session → choose the folder **`C:\RainbowUnity`** → type **Resume Rainbow** → Enter.
   (The user's sessions so far were opened in `C:\Users\josia\.unity`; that works too — Claude then reads this file and
   `CLAUDE.md` by hand, because the automatic status check only runs for sessions opened in `C:\RainbowUnity`.)
   (If the "Unity" plugin is missing in that account, it is optional: + → Add plugins → search "Unity" → Install.)

---
# History (older notes; the sections above win where they disagree)

## Earlier state (2026-11-23 18:25 UTC, superseded)
* Autosave was moved from a loop in a Claude background shell (it died with that session; last loop autosave 12:46 local,
  `42af05a`) to the Windows task; its first run 13:19 committed `4fc8139` and pushed it.
* The Editor was closed at that time; Agent 1 (setup runbook + 15 test-tool files) was finished and its tools compiled
  (`610a16e`); Agents 2, 3, 4 had stopped at 17:40 UTC at the previous account's 5-hour limit (files kept, autosaves up to
  `42af05a`) and were finished later; the Screen 05 scene was not built yet then.

## CURRENT STATE (2026-11-23 ~14:00 UTC) — Unity is installed, licensed and connected
* Windows restarted 2026-11-23 07:54 local → C: free went 8.2 → 16.6 GB.
* **Unity 6000.3.29f1 installed** (official installer, silent, user approved the Windows prompt) at
  `C:\Program Files\Unity\Hub\Editor\6000.3.29f1`; default Editor in the Unity CLI. Lowest free space during install: 2.2 GB.
* User signed in (`unity auth login`, browser) and **Unity Personal is active** (`unity license activate --personal`).
  The user accepted the Unity Editor Software Terms (recorded with `unity terms accept 6000.3.29f1 --yes` at their request).
* **Project created**: `C:\RainbowUnity\UnityProject` (URP blank template, `--no-cloud`): URP 17.3.0, Input System 1.20.1,
  Cinemachine 3.1.7, Pipeline 1.0.1 (CLI ↔ Editor bridge), glTFast 6.21.0, Splines 2.9.2. Removed template extras
  (Visual Scripting, Collab, Multiplayer Center, AI Navigation, Rider) to speed up compiles on this laptop.
* **Editor ↔ CLI connection verified**: `unity status` = ready; `unity command script eval --file <cs>` runs C# in the live Editor
  (PowerShell 5.1 mangles inline quotes → always pass code with `--file`). Pipeline asset in use: `PC_RPAsset`, GPU "Intel(R) Graphics".
* Coordinator files in the project: `Assets/Rainbow/Shared/RiverPath.cs`, `Assets/Rainbow/Editor/Screen05SceneBuilder.cs`
  (menu **Rainbow → Build Screen 05 Scene**, finds the specialists' builders by reflection).
* Specialists were launched as parallel background agents (the Workflow runner only allows 2 at a time on this 4-core laptop).
  Briefs: constants COMMON + AGENT1..4 in `staging/shared/specialists.workflow.js`; outputs land in `staging/agent1..4`
  (each writes a README.md when done).
* Evidence tool: `tools/make-side-by-side.ps1` (APPROVED vs UNITY image, no percentage claims).
* **Git**: portable Git 2.56.1 + git-lfs 3.8.1 at `C:\Users\josia\PortableGit` (user approved; SHA-256 verified). Local repo in
  `C:\RainbowUnity`, branch **`unity/screen05-dev`** (orphan, nothing from the 22 GB repo downloaded), remote `origin` =
  the Rainbow repo. Neutral commit author "Rainbow Unity" (no personal email). GitHub sign-in stored by Git Credential Manager.

## User's binding rules
* Target = the ORIGINAL approved Screen 05 **"Flow Into the Current"**: `references/05_flow_into_the_current.png`
  (864×1536, SHA-256 `d3f339d49199598e03541c15a3ec6f7fa6342f40de650361c44ab4301bfb44dd`, matches `REFERENCE_ORDER.md`).
  **Confirmed by the user on 2026-11-23.** Never use simplified / redesigned candidate images. No creative redesign.
* Must stay: Benny's original look (round pink fluffy body, purple-and-white striped knitted beanie, purple pompom, yellow star),
  purple/lavender metallic washer tunnel, rounded polished gold rings, copper-gold paddles, cyan water with pink currents,
  white foam, bubbles, gold coin trail, portrait camera behind Benny. Real playable 3D (swim, steer, jump, collect coins).
* Keep the original Three.js game and every existing branch untouched. Separate Unity project + separate branch.
* Free tools only (Unity Personal, existing assets). No purchases, paid services or GPU rental without asking.
* Ask before deleting files. Never commit passwords, tokens or Unity license files.
* Likeness target 90–95 % — only claim a number with real measurements + visual evidence.
* **User, 2026-11-23 17:15 local:** keep targeting ~90–95 % likeness to the approved image, matching shapes, proportions,
  composition, materials and richness (river curves, tunnel depth, gold ring spacing, metallic reflections, water, foam,
  bubbles, HUD, Benny's natural swimming) — not just colours. Scenery must stay consistent while Benny swims, steers and
  jumps, and he must look naturally supported by the water. Save successful changes permanently (code/builders, pushed),
  compare the real Game view after each major improvement, fix the biggest visible differences first, conserve credits.
  **Do not start Screen 06 until the user approves Screen 05.**

## Machine (user's laptop)
* HP 14", Windows 11 Home, Intel N150, 8 GB RAM, Intel integrated GPU, **one drive C:** (~118 GB).
* Unity CLI **1.0.1**: `C:\Users\josia\AppData\Local\Unity\bin\unity.exe`. Unity Hub app: **not installed**.
* Android Build Support: **deferred** (needs ~7–10 GB more disk).

## Files on the laptop
* `C:\Users\josia\claude yes\Rainbow_Screen05_Source\` — 111 files (30 MB) downloaded from GitHub branch
  `ccr-6deca498-03lhkc`: reference + hi-res reference, Three.js source (`src/`), models `benny31.glb`, `benny.glb`, `lids05.glb`
  (all three SHA-256-verified identical to the GitHub LFS objects on 2026-11-23), textures (`tunnel05`, `water05`, `benny05`,
  `benny31`, `paint`), docs.
* `C:\RainbowUnity\` — the Unity work folder and git working tree of the Unity branch:
  * `references/05_flow_into_the_current.png` — verified copy of the approved reference.
  * `staging/shared/CONTRACT.md` + `staging/shared/Assets/Rainbow/Shared/RiverPath.cs` — integration contract and the shared
    course API (port of `course.ts` S05 / `meander05`).
  * `staging/shared/specialists.workflow.js` — the saved briefs for the 4 specialists.
  * `staging/agent1-unity-setup`, `agent2-environment`, `agent3-water-vfx`, `agent4-benny-gameplay` — specialist outputs.
  * `UnityProject/` — the Unity URP project.

## GitHub
* Repo `https://github.com/josiahscalia5-dev/rainbow-` (public, ~22 GB — never clone it whole on this laptop).
* Source branch `ccr-6deca498-03lhkc` @ `856ef9d` (autosave 2026-11-23 11:03 UTC); the user's checkpoint `544bc51` is an
  ancestor — nothing lost. `CLAUDE.md` and `docs/briefs/2026-11-23-r48/UNITY_EVAL_R48.md` exist there.
* Unity branch `unity/screen05-dev` (orphan) pushed from `C:\RainbowUnity`; Git LFS for `*.glb *.fbx *.psd *.exr *.mp4 *.apk` etc.
  like the repo's `.gitattributes`; the approved reference PNG stays in plain git (byte-identical).

# Rainbow Unity — handoff (latest verified state)

Last verified: **2026-11-23 18:25 UTC** (13:25 New York time), Claude session on the user's laptop (after switching accounts).
Read this first in any new Claude account or session. **This is an existing project — never start over.**
Project rules for Claude: `CLAUDE.md` (loaded automatically when a session is opened in `C:\RainbowUnity`).

<!-- NEXT-TASK:START -->
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

## ✅ CURRENT STATE (2026-11-23 18:25 UTC)
* **Git**: branch `unity/screen05-dev`, newest commits are on GitHub (checked with `git ls-remote`). Working tree saved.
* **Five-minute autosave = Windows Task Scheduler task "Rainbow Unity Autosave"** (created 2026-11-23 13:18 local, every
  5 min, hidden, runs as the user while signed in). It runs `tools/autosave.ps1` (one pass: commit + push only when
  something changed or a push is pending; never force-push/merge/reset/delete; leaves out likely secrets and >50 MB non-LFS
  files). Verified: first run 13:19 committed `4fc8139` and pushed it (push exit 0). Log `.git/autosave.log`, last pass
  `.git/autosave.status`. It needs no Claude session, so it survives account switches and restarts.
  Repair (safe to re-run, never duplicates): `tools/setup-resume-system.ps1`.
* Why it was broken: the old autosave was a loop in the previous Claude session's background shell; it died with that
  session (last autosave 12:46 local, commit `42af05a`).
* **Unity**: 6000.3.29f1 installed + Unity Personal active; project `C:\RainbowUnity\UnityProject` (URP 17.3.0, Input System
  1.20.1, Cinemachine 3.1.7, Pipeline 1.0.1, glTFast 6.21.0, Splines 2.9.2). The Editor is **closed** right now
  (`unity status` → exit 12, no Editor). It was open earlier today.
* **Specialists**: Agent 1 (setup runbook + 15 test-tool files) **finished**; tools copied into `UnityProject/Assets/Rainbow/Testing`
  + `UnityProject/AgentScripts` and compiled with no errors (commit `610a16e`); not yet used in Play mode (no scene yet).
  Agents 2, 3, 4 **unfinished**: they stopped at 17:40 UTC when the previous account hit its 5-hour limit (HTTP 429). All files
  they had written are committed (autosaves up to `42af05a`).
* Screen 05 scene: **not built yet** (only `Assets/Scenes/SampleScene.unity` exists). Coordinator files: `Assets/Rainbow/Shared/RiverPath.cs`,
  `Assets/Rainbow/Editor/Screen05SceneBuilder.cs`.
* **Resume helpers** (already in place, all read-only): `CLAUDE.md`; `.claude/settings.json` SessionStart hook →
  `tools/session-start.ps1` (prints a status block); `/resume-rainbow` skill; desktop shortcut "Resume Rainbow"; a short pointer
  in `%USERPROFILE%\.claude\CLAUDE.md`.
* Laptop: C: 10.2 GB free, RAM ~1.8 GB free.
* Errors today: 5-hour usage limit on the previous account (17:39 UTC); autosave loop died with that session; Unity Editor closed.

## Switching Claude accounts (what the user does)
1. Wait until the newest autosave is pushed (or ask Claude "save now"). Everything is in `C:\RainbowUnity` and on GitHub.
2. In the Claude app: click your name/initials at the bottom left → **Log out** → sign in with the other account.
3. Click **Code** → start a new session → choose the folder **`C:\RainbowUnity`** → type **Resume Rainbow** → Enter.
   (If the "Unity" plugin is missing in that account, it is optional: + → Add plugins → search "Unity" → Install.)

---
# History (older notes; the sections above win where they disagree)

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

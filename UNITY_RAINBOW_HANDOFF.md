# Rainbow Unity — handoff (latest verified state)

Last verified: **2026-11-23 ~14:00 UTC**, Claude session on the user's laptop (second Claude account).
(Sections below "CURRENT STATE" are the earlier history; where they disagree, CURRENT STATE wins.)
Read this first in any new Claude account or session. **This is an existing project — never start over.**

## ✅ CURRENT STATE (2026-11-23 ~14:00 UTC) — Unity is installed, licensed and connected
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
* **Specialists running** (workflow run `wf_2483b79c-4aa`, script `staging/shared/specialists.workflow.js`) — outputs land in
  `staging/agent1..4`. If they were interrupted: re-run the Workflow tool with that scriptPath and `resumeFromRunId`.
* **Git**: portable Git 2.56.1 + git-lfs 3.8.1 at `C:\Users\josia\PortableGit` (user approved; SHA-256 verified). Local repo in
  `C:\RainbowUnity`, branch **`unity/screen05-dev`** (orphan, nothing from the 22 GB repo downloaded), remote `origin` =
  the Rainbow repo. Neutral commit author "Rainbow Unity" (no personal email). **Push needs the user's one-time GitHub sign-in**
  (Git Credential Manager window on the laptop).
* Remote Control is on for this session; keep-awake is held while working (laptop lid must stay open).

### Resume checklist (new session / new account)
1. `unity status --project-path C:\RainbowUnity\UnityProject` — if no Editor: `unity open C:\RainbowUnity\UnityProject --until-ready`.
2. Check `staging/agent1..4/README.md` exist (specialists finished); integrate them into `UnityProject/Assets/Rainbow/...`
   (coordinator only), then menu Rainbow → Build Screen 05 Scene, fix compile errors, play-test.
3. Visual tests (user's mandatory list): approved vs Game view at 864×1536, continuous gameplay recording, moving-view series,
   explicit list of differences. Never claim a likeness % without measurements.
4. Commit + push `unity/screen05-dev` (`C:\Users\josia\PortableGit\cmd\git.exe`), verify on GitHub, update this file.

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
* C: free **8.3 GB**. `pagefile.sys` had expanded to 14.8 GB (base allocation 10.6 GB) → a Windows **restart** is pending to
  shrink it (~4 GB back). Hibernation already off (previous session). Free RAM was only 0.8 GB (last boot 2026-11-19).
* Unity CLI **1.0.1**: `C:\Users\josia\AppData\Local\Unity\bin\unity.exe`. Unity Hub app: **not installed**.
* Git for Windows / git-lfs / gh: **not installed**.

## Unity status
* Editor **6000.3.29f1 (6.3 LTS): NOT installed.** Official installer downloaded + verified (Authenticode *Valid*, signer
  "Unity Technologies SF"): `C:\Users\josia\AppData\Roaming\UnityHub\downloads\UnitySetup64-6000.3.29f1.exe` (4.2 GB).
* Why the first install failed: `unity install` copied the installer to a temp folder and ran it; C: fell to ~1 GB at 50 %,
  the install aborted and rolled back. (The 7-Zip "extract" workaround was never used; 7-Zip cannot open this installer.)
* Plan: after the restart run the official installer directly (no temp copy), user approves the Windows prompt:
  `Start-Process 'C:\Users\josia\AppData\Roaming\UnityHub\downloads\UnitySetup64-6000.3.29f1.exe' -ArgumentList '/S /D=C:\Program Files\Unity\Hub\Editor\6000.3.29f1' -Verb RunAs -Wait`
  then (with the user's OK) delete the 4.2 GB download, sign in (`unity auth login`) and activate the free Personal license
  (`unity license activate --personal --accept-eula`).
* Android Build Support: **deferred** (needs ~9.7 GB more disk). Personal license: **not activated yet**.
* Leftover from September: `C:\Program Files\Unity\Hub\Editor\6000.6.0f1` (2 metadata files only).

## Files on the laptop
* `C:\Users\josia\claude yes\Rainbow_Screen05_Source\` — 111 files (30 MB) the previous session downloaded from GitHub branch
  `ccr-6deca498-03lhkc`: reference + hi-res reference, Three.js source (`src/`), models `benny31.glb`, `benny.glb`, `lids05.glb`
  (all three SHA-256-verified identical to the GitHub LFS objects on 2026-11-23), textures (`tunnel05`, `water05`, `benny05`,
  `benny31`, `paint`), docs.
* `C:\Users\josia\claude yes\RainbowUnity_Prep\` — **empty**: the previous session's 4 helper agents hit the usage limit and
  saved no deliverables (only analysis in their transcripts + small helper scripts).
* `C:\RainbowUnity\` — the Unity work folder (will become the git working tree of the Unity branch):
  * `references/05_flow_into_the_current.png` — verified copy of the approved reference.
  * `staging/shared/CONTRACT.md` + `staging/shared/Assets/Rainbow/Shared/RiverPath.cs` — integration contract and the shared
    course API (port of `course.ts` S05 / `meander05`).
  * `staging/shared/specialists.workflow.js` — the saved briefs for the 4 specialists (Unity setup runbook, environment,
    water/VFX/lighting, Benny/gameplay/HUD), ready to run with the Workflow tool.
  * `staging/agent1-unity-setup`, `agent2-environment`, `agent3-water-vfx`, `agent4-benny-gameplay` — specialist outputs
    (empty: agents not started yet; they start right after the restart).
  * `UnityProject/` — the Unity URP project (not created yet).

## GitHub
* Repo `https://github.com/josiahscalia5-dev/rainbow-` (public, ~22 GB — never clone it whole on this laptop).
* Source branch `ccr-6deca498-03lhkc` @ `856ef9d` (autosave 2026-11-23 11:03 UTC); the user's checkpoint `544bc51` is an
  ancestor (13 commits behind) — nothing lost. `CLAUDE.md` and `docs/briefs/2026-11-23-r48/UNITY_EVAL_R48.md` exist there.
* Unity branch: **not created yet.** Plan: orphan branch `unity/screen05-dev` pushed from `C:\RainbowUnity`
  (git init + remote + orphan branch, no 22 GB clone), Git LFS for `*.glb *.fbx *.psd *.exr *.mp4 *.apk` like the repo's
  `.gitattributes`; approved reference PNG stays in plain git (byte-identical).

## Next steps (in order)
1. User restarts Windows (Start → Power → **Restart**).
2. Launch the 4 specialists (setup runbook, environment, water/VFX, Benny/gameplay) into their staging folders.
3. Install the Editor (command above), user approves; sign in + activate Personal license.
4. Create the URP project `C:\RainbowUnity\UnityProject`, add glTFast + Input System, integrate staging (coordinator only),
   build the scene with `Screen05SceneBuilder`, play a ~10 s section, capture 864×1536, compare with the reference.
5. Install Git (per-user), create + push `unity/screen05-dev`, verify the branch and LFS objects on GitHub.

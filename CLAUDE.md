# Rainbow Unity - instructions for every Claude session (any Claude account)

This folder (`C:\RainbowUnity`) is the user's EXISTING Rainbow Unity port of Screen 05 "Flow Into the Current".
It is a continuing project: never start over, never make the user explain the setup again, never rebuild finished work.
Everything needed to continue lives in this folder, on GitHub and in local Windows tools, so it works the same with
every Claude account.

## PERMANENT RULE: cross-account continuation (user, 2026-11-24)
The user switches Claude accounts whenever credits run out. Any account must continue EXACTLY where the last one stopped.
- "Resume Rainbow" (any account, any folder): BRIEF verification only = the RAINBOW STATUS block (or `tools/session-start.ps1 -Text`):
  Git = GitHub, autosave OK, Unity state, disk. Then the handoff's NOW block, then continue its NEXT STEP in Unity right away.
  Never repeat completed setup, installs, storage scans or passed tests; ask the user only for real decisions.
- What lives in GitHub (branch `unity/screen05-dev` = C:\RainbowUnity, autosaved every 5 min by the Windows task): Unity scenes,
  scripts, materials, shaders, ProjectSettings (Play Mode = "Reload Scene only"), assets (big binaries via Git LFS, `.gitattributes`),
  test / measuring tools (`tools/`, `UnityProject/Assets/Rainbow/Testing`, `UnityProject/AgentScripts`), workflows and specialist
  briefs (`staging/shared`), the resume skill (`.claude/skills`), the startup hook (`.claude/settings.json`), permission rules
  (`tools/claude-permissions`), the approved reference (`references/`), comparisons and scores (`evidence/`, handoff).
- Per account / per laptop, NOT in GitHub: Claude sign-in, claude.ai plugins and connectors (none required; the optional "Unity"
  plugin is only know-how; never connect `unity mcp`), the Unity sign-in / license (re-activate with
  `unity license activate --personal` only if `unity status` reports a licensing problem). The GitHub repo is PUBLIC: never upload
  personal notes, Claude config or anything from `~/.claude`.
- Local-only backups (never GitHub): `tools/autosave.ps1` copies `~/.claude/settings.json`, `~/.claude/CLAUDE.md`, the Rainbow memory
  notes and the workspace `settings.local.json` to `%USERPROFILE%\RainbowUnity-local-backup\claude-config` (newest + one copy per day).
- EXPERIMENTAL vs VALIDATED: every autosave commit may hold experimental work. VALIDATED = git tags `validated/*` (pushed) listed in
  the NOW block's table. Tag only after an honest coordinator cycle that kept or raised the score with a passing gameplay check:
  `& C:\Users\josia\PortableGit\cmd\git.exe -C C:\RainbowUnity tag -a validated/<name> <commit> -m "<scores>"`, then push that tag.
  Restoring = copying single files from a validated tag (ask the user first); never reset.
- Keep the handoff CONCISE: rewrite the NOW block (between the NEXT-TASK markers) after every finished step and before credits run
  out; move superseded details into the DETAILED LOG below it; then run `tools/autosave.ps1` and confirm the push.
- A Workflow run dies with its account: the next account reads its journal and relaunches the same stage with `skip` / `notes`.

## PERMANENT RULE: gameplay quality + master direction (user, 2026-11-24 13:28 local)
- `references/correction-guides-2026-11-24b/README.md` is binding: water first, natural swimming, continuous 3D world, smooth camera, wake, foam, 30-60 s recording.
- Gameplay is judged SEPARATELY from the still scores. Before any "done" claim run the motion check and look at several positions, not only s = 14:
  `powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\screen05-eval.ps1 -File AgentScripts/screen05_motion_strip.cs -Play -Timeout 580`
  (parameters in `UnityProject/Recordings/Screen05/work/strip_params.txt`; prints per-frame steps / second differences of Benny and the camera + a contact sheet).
- The course is LONG since 2026-11-24: swim s 14 -> 466 (~41 s). Baked: river / foam to s 120, walls / rings to s 470; `Course05Extension` builds the rest at the start of
  Play from the same generators (nothing extra in the repository). `SwimLine05` = the line Benny follows + the swimmable width between the foam banks.
  `BennySwimAnimator` (code-driven, one continuous stroke phase) replaced the Animator states. Keep the approved view at s = 14 unchanged by these.
- Short helpers: `tools/screen05-quick.ps1 -Tag x [-NoRebuild] [-Refresh] [-Crop "x,y,w,h,scale"]` (cycle with short output), `tools/screen05-recompile.ps1`,
  `tools/screen05-sheenloop.ps1` (broad water sheen calibration), `tools/diag/patches.ps1` (patch colours), `AgentScripts/screen05_water_measure_compact.cs`.
- SCRIPT SAFETY (incident 2026-11-24 13:51 local): a helper function named `Rd` ran the PowerShell alias `rd` = Remove-Item and deleted four source files (restored at
  once from the autosave commit, nothing lost). Never name functions like aliases (rd, rm, del, ri, sc, mv, cp, sl ...); use Verb-Noun names; patch files with perl / Edit.

## At the start of every session (before changing anything)
1. Read the "RAINBOW STATUS" block that the SessionStart hook adds (`tools/session-start.ps1`, configured in
   `.claude/settings.json`). If it is missing, run it yourself (read-only):
   `powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\session-start.ps1 -Text`
2. Read `UNITY_RAINBOW_HANDOFF.md`: "NEXT UNFINISHED TASK" and "CURRENT STATE" first (where sections disagree, the newest wins).
3. Inspect the real project instead of trusting reports: Git status, newest local commit, newest GitHub commit
   (`git ls-remote origin refs/heads/unity/screen05-dev`), `staging/agent1..4`, `UnityProject/Assets/Rainbow`, and
   `unity status --project-path C:\RainbowUnity\UnityProject`.
4. Preserve work that is not committed or not pushed yet. Never `reset --hard`, `checkout`/`restore` over changes, `clean`,
   drop stashes, rebase published commits or force-push. If GitHub has commits this laptop lacks, fetch and merge them
   without losing local work (ask the user if anything conflicts).
5. Reuse what exists: Unity 6000.3.29f1 is installed and licensed (Unity Personal); the URP project is
   `C:\RainbowUnity\UnityProject`; models, textures and the approved reference are already in this repo; the test tools and
   the specialists' partial files already exist. Never reinstall Unity, never create another Unity project, never download
   the whole 22 GB Rainbow repo.
6. When the user says "Resume Rainbow" (or "continue", "I'm back", or `/resume-rainbow`): give a 3-5 line plain status,
   then continue the NEXT UNFINISHED TASK. For any other request, use the status only as background.

## The user
- A beginner on Windows who does not read commands well: one step at a time, short plain updates, no long reports.
- Ask only for Windows permission prompts, sign-ins or real decisions, and put the question in the message text too
  (the user sometimes works over Remote Control from another device, where buttons may not show).
- Always ask first before: deleting any file, installing anything, restarting the laptop, spending money or paid services.
- Laptop: HP, Intel N150, 8 GB RAM, Intel graphics, one C: drive (~10 GB free). Run at most 2 agents at a time; no big downloads.

## Binding rules for the game
- The target is ONLY the ORIGINAL approved Screen 05 "Flow Into the Current": `references/05_flow_into_the_current.png`
  (864x1536, SHA-256 d3f339d49199598e03541c15a3ec6f7fa6342f40de650361c44ab4301bfb44dd, confirmed by the user 2026-11-23).
  Never use simplified or redesigned candidate images. No creative redesign.
- Must stay: Benny's original look (round pink fluffy body, purple-and-white striped knitted beanie, purple pompom, yellow
  star), purple/lavender metallic washer tunnel, rounded polished gold rings, copper-gold paddles, cyan water with pink
  currents, white foam, bubbles, gold coin trail, portrait camera behind Benny.
- Real playable 3D: swim, steer, jump, collect coins.
- Keep the original Three.js game and every other branch untouched. Unity work goes only to branch `unity/screen05-dev`.
- Likeness target 90-95 %: only state a number with real measurements and side-by-side images.
- Match shapes, proportions, composition, materials and richness, not just colours; keep the scenery consistent while Benny
  swims, steers and jumps; fix the biggest visible differences first and conserve credits.
- Do NOT start Screen 06 (or any other screen) until the user explicitly approves Screen 05. Never declare Screen 05
  approved yourself.
- User's priority order (2026-11-23 18:00 local): recreate the approved COMPOSITION in the playable scene, not pretty parts:
  (1) tunnel geometry, perspective, depth and camera framing; (2) the narrow winding S-shaped river and its exact proportions;
  (3) purple walls, gold rings, LARGER copper paddles; (4) narrow, TALLER foam banks; (5) Benny's size, position, waterline,
  splash; (6) coin placement and HUD. Target: 90-95 % visual similarity.
- Honest comparisons only: the real Unity Game view at 864x1536, Benny at s = 14.00 with the normal gameplay camera, beside
  the approved image at the same resolution. Never shift, crop, rescale or retouch stills to raise a score, and never give
  the capture its own camera pose. Report BOTH scores from `tools/screen05-measure.ps1` (visual similarity and layout
  similarity) with how they are calculated.
- Never commit or upload passwords, tokens, Unity license files (`*.ulf`, `*.alf`), anything from `~/.claude`, or Git credentials.

## Where things are
| What | Where |
|---|---|
| State + next task | `UNITY_RAINBOW_HANDOFF.md` |
| Approved reference | `references/05_flow_into_the_current.png` |
| USER'S CORRECTION GUIDES (binding visual direction, 2026-11-24): rings, paddles, walls, frame, river, foam, bubbles, Benny, HUD | `references/correction-guides-2026-11-24/` (README.md + 3 images) |
| USER'S REFINEMENT GUIDES 2 + MASTER DIRECTION (BINDING, 2026-11-24 13:28 local: water, natural swimming, camera, wake, foam, 30-60 s recording) | `references/correction-guides-2026-11-24b/` (README.md + 3 full-resolution images; read FIRST) |
| Unity project (URP 17.3, Input System, Cinemachine, Splines, glTFast, Pipeline bridge) | `UnityProject/` |
| Scene builder | `UnityProject/Assets/Rainbow/Editor/Screen05SceneBuilder.cs` (menu Rainbow -> Build Screen 05 Scene) |
| Shared course API + contract | `UnityProject/Assets/Rainbow/Shared/RiverPath.cs`, `staging/shared/CONTRACT.md` |
| Test tools (864x1536 capture, gameplay recording, side-by-side, autopilot) | `UnityProject/Assets/Rainbow/Testing/`; ready C# for `script eval`: `UnityProject/AgentScripts/` |
| Specialist briefs | `staging/shared/specialists.workflow.js` (constants COMMON, AGENT1..AGENT4) |
| Specialist outputs | `staging/agent1-unity-setup`, `agent2-environment`, `agent3-water-vfx`, `agent4-benny-gameplay` (finished = has README.md) |
| Original Three.js source, models, textures (local copy) | `C:\Users\josia\claude yes\Rainbow_Screen05_Source\` |
| GitHub | https://github.com/josiahscalia5-dev/rainbow- , branch `unity/screen05-dev` (public repo, ~22 GB: never clone it whole) |

## Tools
- Git is portable and NOT on PATH: `C:\Users\josia\PortableGit\cmd\git.exe` (Git LFS included). The repo already has the
  author "Rainbow Unity" (noreply email) and the GitHub sign-in is stored in Windows Credential Manager.
- Unity CLI: `C:\Users\josia\AppData\Local\Unity\bin\unity.exe`
  - `unity status --project-path C:\RainbowUnity\UnityProject` (exit code 12 with an empty table = no Editor open)
  - `unity open C:\RainbowUnity\UnityProject --until-ready` (takes a few minutes on this laptop)
  - `unity command script eval --file <file.cs>` runs C# in the live Editor. Always pass code with `--file`
    (Windows PowerShell 5.1 breaks inline quotes).
- The "Unity" Claude plugin (Anthropic Directory) only adds Unity know-how; the CLI works without it.
- Shell is Windows PowerShell 5.1: no `&&`, `||`, `?:` or `??`.
- Git Bash (user request 2026-11-24): Git for Windows is NOT installed and must not be; Claude Code finds PortableGit's bash through
  `CLAUDE_CODE_GIT_BASH_PATH=C:\Users\josia\PortableGit\bin\bash.exe` in the `env` block of `~/.claude/settings.json`, and
  `CLAUDE_CODE_USE_POWERSHELL_TOOL=1` keeps PowerShell as the shell. Keep using the PowerShell commands of this file (the permission rules are
  written for them). The SessionStart hook works under both shells (tested); never add `"shell": "powershell"` to it (that means pwsh 7, not installed).
- Permission rules (2026-11-24): `tools/claude-permissions/rainbow-permissions.json`, applied BY THE USER with
  `tools/claude-permissions/apply-rainbow-permissions.ps1` into `~/.claude/settings.json` (Claude never applies or widens its own
  permissions). To match them, write commands with literal paths and no variables, e.g.
  `powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\screen05-cycle.ps1 -Tag x -Areas all`,
  `& C:\Users\josia\AppData\Local\Unity\bin\unity.exe command script eval --project-path C:\RainbowUnity\UnityProject -- --file AgentScripts/x.cs`,
  `& C:\Users\josia\PortableGit\cmd\git.exe -C C:\RainbowUnity log -n 5`. Deleting, uninstalling, system settings, credentials and
  destructive Git still ask the user.

## Blender = asset tool (user decision 2026-11-24: permanent Claude + Blender + Unity workflow)
- Unity stays the game engine. Blender only makes more accurate, professional meshes (and baked maps) for the gold paddles, gold rings
  and the washing-machine drum; an asset stays only after the normal cycle tool shows it closer to the approved image in the playable scene.
- Portable Blender 5.3.0 (official zip, no installer, per laptop, NOT in GitHub): `C:\Users\josia\Blender\blender-5.3.0-windows-x64\blender.exe`.
  One-time setup (user-approved, re-runnable, checks free disk >= 6.5 GB first - if short, tell the user - and the official SHA-256):
  `powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\blender\setup-blender.ps1`
- Run Blender ONLY headless (background mode, factory settings, hard timeout) for short modelling jobs, one process at a time, never while a
  round's agents run Unity cycles: `powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\blender\run-blender.ps1 -Script C:\RainbowUnity\tools\blender\<x>.py`
  8 GB laptop: if it reports low RAM, close Unity safely first (`unity close --if-saved`), reopen afterwards (`unity open ... --until-ready`).
- Form to model (user's guide 02): paddles = wide, shallow half-moon trays (a shallow, wide curved block, rounded rim, flat visible underside, each fitted
  separately, no pointed / hanging wedges); rings = broad polished copper faces with defined bevels (not tubes); keep the measured ring centres.
- In GitHub: scripts `tools/blender/*.py` + `*.ps1` (deterministic: same output every run; each names the approved-image targets it fits),
  exported meshes `UnityProject/Assets/Rainbow/Environment/Models/*.fbx` (Git LFS). Claude's Blender connector (Blender Lab MCP) is optional:
  its live mode needs the Blender window + add-on, so prefer the headless scripts on this laptop.

## Saving (automatic five-minute checkpoints)
- The Windows Task Scheduler task "Rainbow Unity Autosave" runs `tools/autosave.ps1` every 5 minutes, hidden. It commits
  and pushes `unity/screen05-dev` only when something changed or a push is still pending. It never force-pushes, merges,
  resets or deletes, and it leaves out likely secrets and >50 MB files that are not in Git LFS. It needs no Claude session,
  so it keeps working across account switches and restarts.
- Log: `.git/autosave.log`; last pass: `.git/autosave.status`.
  Save right now: `powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\autosave.ps1`
- Repair the task, the "Resume Rainbow" desktop shortcut and the `~/.claude/CLAUDE.md` pointer (safe to re-run, never
  makes duplicates): `powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\setup-resume-system.ps1`
- Never start another autosave loop in a Claude background shell; the Windows task is the only autosave.

## Before credits run out, and after each finished step
Update `UNITY_RAINBOW_HANDOFF.md`: CURRENT STATE, errors, branch + newest commit, and the next unfinished task between the
`NEXT-TASK:START` / `NEXT-TASK:END` markers (the startup hook reads them). Then run `tools/autosave.ps1` and confirm the push.

## Specialists
- Relaunch an unfinished specialist with: "Read COMMON and AGENTn in C:\RainbowUnity\staging\shared\specialists.workflow.js
  and follow them. Continue from the files already in your staging folder; do not rewrite finished files; write README.md
  when done." At most 2 at a time on this laptop.
- A lane of a RUNNING Workflow cannot be messaged: SendMessage to its agent id starts a SECOND copy of that specialist (happened 2026-11-24 08:27, the
  copies were stopped after ~70 s, they had only read files). New user wishes for running lanes go into `references/` + the handoff and into the next stage's brief.
- Only the coordinator (the main session) copies staging outputs into `UnityProject/Assets/Rainbow` and builds the scene.

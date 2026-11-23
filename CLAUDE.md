# Rainbow Unity - instructions for every Claude session (any Claude account)

This folder (`C:\RainbowUnity`) is the user's EXISTING Rainbow Unity port of Screen 05 "Flow Into the Current".
It is a continuing project: never start over, never make the user explain the setup again, never rebuild finished work.
Everything needed to continue lives in this folder, on GitHub and in local Windows tools, so it works the same with
every Claude account.

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
- Never commit or upload passwords, tokens, Unity license files (`*.ulf`, `*.alf`), anything from `~/.claude`, or Git credentials.

## Where things are
| What | Where |
|---|---|
| State + next task | `UNITY_RAINBOW_HANDOFF.md` |
| Approved reference | `references/05_flow_into_the_current.png` |
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
- Only the coordinator (the main session) copies staging outputs into `UnityProject/Assets/Rainbow` and builds the scene.

# Rainbow Unity - tool inventory and speed-up options (2026-11-23, ~19:10 New York time)

Read-only check on the user's laptop while round 3 was running (nothing was installed, updated, removed, bought or restarted).
"Working" means verified today on this laptop. Unity stays the engine; nothing here replaces the existing project or systems.

## 1. Unity Editor and Unity command-line tools

| Item | Version | Working? | What it does |
|---|---|---|---|
| Unity Editor (Unity 6.3 LTS) | 6000.3.29f1 (rev 96d2fe17529c) | Yes. Open since 13:23, `unity status` ready on port 7800, last compile 0 errors (18:25) | The game engine. Licence: Unity Personal (active). |
| Build support | Windows Standalone (Mono) only | Yes | Android / iOS / WebGL not installed (Android deferred: ~7-10 GB disk). |
| Folder `Hub\Editor\6000.6.0f1` | - | Not an Editor | Leftover from 12 Sept 2026 (2 small Hub files, no Unity.exe). Harmless. |
| Unity Hub app | - | Not installed | Not needed: the Unity CLI does its jobs. |
| Unity CLI (`unity.exe`) | 1.0.1 | Yes | Installs/opens Editors, licences, drives the OPEN Editor (C# `script eval`, recompile, Play/pause, console), builds, tests, `watch`, and can run as an MCP server (`unity mcp`, not connected to Claude). |
| CLI component: Unity Licensing Client | 1.19.0 | Yes | Licence activation/checks. |
| CLI components not installed | plastic 11.0.16, ugs 2.1.0, ai 0.2.0-beta.1, transform 0.1.0-alpha.9, assetlibrary 0.1.0-beta.1 | - | Unity Version Control, Gaming Services, AI asset generation (user declined), CAD conversion (not public), Asset Store search/import (not public). |

## 2. Unity packages in `C:\RainbowUnity\UnityProject` (all present in `Library/PackageCache`; project compiles clean)

| Package | Version | Used by the game? | What it does |
|---|---|---|---|
| com.unity.render-pipelines.universal (URP) | 17.3.0 | Yes (core) | Renders the game: 26 hand-written HLSL shaders + post-processing Volume (bloom, colour grade, vignette ported from the Three.js glow). |
| com.unity.inputsystem | 1.20.1 | Yes | Swim / steer / jump controls (keyboard + touch). |
| com.unity.cinemachine | 3.1.7 | Referenced (5 files) | Camera framework. |
| com.unity.splines | 2.9.2 | Yes (2 files) | Spline paths. |
| com.unity.cloud.gltfast | 6.21.0 | Yes | Imports Benny's `.glb` models. |
| com.unity.ugui | 2.0.0 | Yes | The HUD (hearts, coins, pause button, title banner). |
| com.unity.pipeline | 1.0.1 | Yes (all automation) | Bridge between the Unity CLI and the open Editor. |
| com.unity.probuilder | 6.1.4 | Installed, not used yet | In-Editor mesh modelling. |
| com.unity.animation.rigging | 1.4.1 | Installed, not used yet | Runtime bone constraints. |
| com.unity.timeline | 1.8.13 | Not used | Cut-scene sequencing. |
| com.unity.test-framework | 1.6.0 | No tests written | EditMode/PlayMode tests (the project uses its own test tools instead). |
| com.unity.ide.visualstudio | 2.0.26 | Inactive | Links Unity to Visual Studio / VS Code (neither is installed). |
| Dependencies | render-pipelines.core 17.3.0, shadergraph 17.3.0 (0 graphs - all shaders hand-written), universal-config 17.0.3, burst 1.8.31, collections 2.7.1, mathematics 1.3.3, newtonsoft-json 3.2.2, mono-cecil 1.11.6, ext.nunit 2.0.5, searcher 4.9.5, settings-manager 2.1.1, test-framework.performance 3.7.0 | Pulled in by the packages above | |
| Built-in modules | 36 x com.unity.modules.* 1.0.0 (animation, audio, physics, particles, UI, video, screen capture, ...) | Yes | Engine features. |
| Third-party plugins / DLLs / Asset Store packages in Assets | none | - | Everything in `Assets/Rainbow` is the project's own code. |

## 3. Claude Code

| Item | Version / state | Working? | What it does |
|---|---|---|---|
| Claude desktop app | 6.28899.6 | Yes | Hosts Claude Code (Code tab). |
| Claude Code | 2.1.330, Workflows enabled | Yes | Coordinator + multi-agent rounds (`Workflow`), at most 2 agents at a time on this laptop. |
| Plugin: **Unity** (official, unity@claude-plugins-official) | enabled | Yes (33 skills loaded) | Unity know-how skills (list below). |
| Plugin: Playwright (Microsoft) | enabled | **No**: its MCP server fails to start ("Connection closed") - needs Node.js | Web-page automation/testing. Not needed for Unity. |
| Plugin: TypeScript/JavaScript language server | enabled | **No** on this laptop (needs Node.js) | Code intelligence for TypeScript (only the original Three.js source). |
| Plugin data folders from other Claude accounts | Serena, Superpowers, parallax-threejs, claude-bridge, typemux-cc, typescript-native-lsp | Not enabled on this account | Leftovers; harmless. |

**Unity plugin skills (33):** unity-cli, unity-package-management, urp-postprocessing, validate-urp-render-graph-renderer-feature,
craft-game-floors, shader-graph-create-custom-node, migrate-birp-to-urp, physics-3d-collision, create-2d-physics,
initialize-ai-navigation, ui, ui-ugui, ui-uitk, ui-imgui, localization, optimize-text-mesh-pro, optimize-audio, audio-setup-mixers,
optimize-web, generate-editor-search-query, asset-transformer-toolkit, build-gtk, build-live-game, setup-multiplayer-services,
setup-vivox-voice-chat, implement-in-app-purchases, levelplay-unity-integration, new-unity-project, 2d-pixel-perfect,
create-tile-palette-or-rule-tiles, manage-sprite-atlas, sprite-editor, sprite-segment-3x3grid.
Most relevant to Screen 05: unity-cli, urp-postprocessing (premium lighting: bloom / tonemapping / vignette), craft-game-floors
(look polish), validate-urp-render-graph-renderer-feature, shader-graph-create-custom-node.

**Claude account skills (13):** docs, google-workspace, computer-use, chrome-browser, built-in-browser, deep-research, import-memory,
morning, skill-creator, xlsx, pptx, pdf, docx (plus consolidate-memory, explain-usage, setup-claude).
**Built-in Claude Code skills:** workflow-authoring, run, code-review, simplify, security-review, init, loop, schedule, claude-api,
update-config, keybindings-help, fewer-permission-prompts, plugin-authoring, ship, steward, dataviz, artifact-design / -diagramming / -capabilities.
**Project skill + hook:** `/resume-rainbow` (`C:\RainbowUnity\.claude\skills`) and the SessionStart status hook (`tools/session-start.ps1`) -
they run only in sessions opened in `C:\RainbowUnity` (sessions opened in `C:\Users\josia\.unity` read the handoff by hand).

**MCP servers / connectors in this session**

| Server | State | What it does | For Screen 05? |
|---|---|---|---|
| World Labs Atlas | connected, 11 tools | 3D scenes / Gaussian splats / meshes from images; spends World Labs credits | No: it would rebuild the scene from the approved picture itself (against the no-projection rule) and splats are not game-ready on this laptop. |
| Claude Docs | connected, 8 tools | Editable shared documents | Not needed. |
| Blender (desktop extension) | server connected, 26 tools | Drives a running Blender | **Not usable now**: Blender is not installed (only an old settings folder for Blender 5.2). |
| scheduled-tasks | connected, 6 tools | Scheduled Claude tasks | Not used (the autosave deliberately uses Windows Task Scheduler). |
| plugin:playwright | **failed** | Browser automation | Needs Node.js. |
| Desktop-app built-ins | available | Built-in browser pane, Claude in Chrome (needs the Chrome extension), computer use, terminal panel, visual widgets, MCP registry, session/window tools | Not needed for Unity work. |
| Unity AI Assistant relay `C:\Users\josia\.unity\relay\relay_win.exe` | 1.3.14 (31 Aug 2026) + old bridge file (12 Sep) | **Not connected** | Leftover from Unity's AI Assistant package, which is not in this project. |
| Unity CLI MCP server (`unity mcp`) | installed with CLI 1.0.1 | **Not connected to Claude** | Could expose Editor commands as direct Claude tools (see section 5). |

## 4. The project's own automation (all working)

| Tool | What it does |
|---|---|
| `tools/screen05-cycle.ps1` | Test cycle: recompile -> rebuild scene from code -> Play -> hold at s = 14.00 -> exact 864x1536 still -> side-by-side + area crops -> visual/layout scores + outline overlay (since 18:30) -> console check. One at a time (lock). ~65-100 s. |
| `tools/screen05-measure.ps1` | Visual + layout similarity vs the approved image at identical pixel positions, overall + 11 areas, calibrated; outline overlay. Offline, ~5 s. |
| `tools/make-side-by-side.ps1`, `make-crop-compare.ps1`, `make-strip.ps1` | Comparison pictures. |
| `tools/autosave.ps1` + Windows task "Rainbow Unity Autosave" | Commit + push every 5 min (task Ready, last run 18:59, result 0). |
| `tools/session-start.ps1`, `Resume-Rainbow.ps1`, `setup-resume-system.ps1`, `integrate-staging.ps1` | Status, resume shortcut, repair, staging copy. |
| `UnityProject/AgentScripts/*.cs` (32+) | C# run inside the open Editor: hold at the approved view, stills, moving-view series, 12 s gameplay recording (H.264), probes, live material tuning, frame debugger. |
| `Assets/Rainbow/Testing` (15 C# files) | Capture, frame grabber, gameplay recorder, series, side-by-side, autopilot, test bridge. |
| Builders (5) | Screen05SceneBuilder (menu Rainbow -> Build Screen 05 Scene), EnvironmentBuilder, WaterBuilder, GameplayBuilder, BennyRigBuilder: the whole scene is rebuilt from code. |
| Workflows | `staging/shared/specialists.workflow.js`, `round2-fixes.workflow.js`, `round3-composition.workflow.js` (+ `round3-args.json`). |
| Git | PortableGit 2.56.1 + Git LFS 3.8.1 (push OK 18:29). |
| Other software | Antigravity IDE (installed, not connected to Unity). Not installed: Python (only the Windows Store shortcut), Node.js, ffmpeg, .NET SDK, Visual Studio, VS Code, Blender. Disk C: 8.2 GB free; RAM 8 GB. |

## 5. What would make the remaining screens faster, more accurate and cheaper (ranked)

Where time and credits go now: each specialist spends ~40-50 min, ~10 full test cycles (65-100 s each on the N150) and many
full-size picture reads, and every specialist re-measures the approved image by eye. The gap is mostly shapes and layout
(visual 52.4 / layout 32.7), not textures, so no plugin "paints" the answer; the big wins are methods using what is installed.

1. **Approved-screen target sheet (free, no install).** Measure the approved image ONCE into a small data file: ring ellipses and
   vanishing point, open-water and foam edges per row, paddle boxes, coin centres and sizes, Benny's outline box, HUD boxes. Every
   specialist fits to the same numbers instead of re-measuring -> fewer credits, consistent targets. Reusable for later screens.
2. **Solve first, render once (free).** The frame specialist already wrote a projection probe (`AgentScripts/screen05_frame_probe.cs`).
   Extended into a fitter, it computes where the camera, rings, river edges, paddles and coins land on screen straight from the
   code-built geometry and solves the numbers in seconds; a render only confirms. Expect ~2-3 test cycles per stage instead of ~10.
3. **Live tuning while paused (free; the hooks exist).** Colours, materials, lighting and camera values can be changed in the paused
   game (`-NoRebuild` / `-EvalAtHold`, `screen05_tune_look.cs`) with a still in ~10-20 s instead of a full rebuild; the winning values
   are then written into the builders once.
4. **Cheaper Claude model for mechanical steps (free setting; needs your OK).** Integration, recording and measuring steps can run on a
   smaller model with lower effort; the strongest model stays on the design-heavy specialists. This is the largest direct credit
   saving and keeps one essential gameplay check per round.
5. **Numbers first, pictures second (free).** Every cycle now prints per-area scores and writes an outline overlay; specialists can steer
   by numbers and small crops and read full side-by-sides only at milestones (fewer picture tokens).
6. **Connect the Unity CLI's built-in MCP server (`unity mcp`; already installed - a Claude settings change, needs your OK).** Direct
   Unity Editor tools for Claude instead of PowerShell wrappers: fewer retries and cleaner results. Moderate gain.
7. **Use the installed Unity plugin skills** (urp-postprocessing, craft-game-floors, unity-cli) for premium lighting and polish. No cost.

Optional installs (free, but only with your approval - not recommended now):
* **Blender** (~1.2 GB installed; the Blender MCP is already connected and waiting): precise hero meshes such as the copper D-tray
  paddles. Code-built meshes already exist, and Unity + Blender together strain 8 GB RAM / 8.2 GB free disk -> only if the paddles
  are still wrong after round 3.
* **Node.js** (~100 MB): makes the Playwright and TypeScript plugins work and could run the original Three.js game in the browser
  pane as a reference. Useful later for other screens' original numbers, not for Screen 05's composition now.
* Not needed: Python/OpenCV and fSpy (our own C#/PowerShell tools measure and camera-match), Unity Recorder (own recorder works),
  VFX Graph (GPU-heavy on Intel graphics), Shader Graph authoring (shaders already hand-written and tuned).
* Not recommended: Unity AI generators / `unity ai` (paid credits, no shape changes), paid Asset Store tools (do not fix shapes;
  licences block the public GitHub branch), World Labs (rebuilds from the picture itself; spends its credits).

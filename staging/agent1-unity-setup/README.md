# Agent 1 – Unity setup runbook + visual-test tooling (Screen 05)

## Files
| File (staging → project) | Purpose |
|---|---|
| `RUNBOOK.md` | Verified CLI commands: drive the open Editor, eval/compile-check, build scene, recompile + Safe Mode, Play-mode loop, captures, packages, Android modules, Git state |
| `DISK_REPORT.md` | 30 largest folders on C:, duplicates, what could be freed (nothing deleted) |
| `Assets/Rainbow/Testing/Scripts/Screen05TestBridge.cs` | Reflection bridge to `SwimInputOverride`, `BennyController`, `Screen05Events` (compiles without Agent 4's code) |
| `Assets/Rainbow/Testing/Scripts/Screen05Autopilot.cs` | Runtime MonoBehaviour: coin-line following, hard left/right excursions, 2 jumps, stats |
| `Assets/Rainbow/Testing/Scripts/Screen05AutopilotMode.cs` / `Screen05AutopilotSegment.cs` / `Screen05AutopilotStats.cs` | Autopilot program types and run statistics |
| `Assets/Rainbow/Testing/Scripts/Screen05CaptureFrameHook.cs` | Runtime hook: one callback per frame after all LateUpdates (Cinemachine included) |
| `Assets/Rainbow/Testing/Editor/Screen05Capture.cs` | Public API + menu **Rainbow → Capture**: `CaptureStill`, `CaptureSeries`, `CaptureDefaultSeries`, `RecordGameplay`, `IsBusy/Status/LastOutput`, `Cancel`, `SetGameViewResolution`, `ToggleAutopilot` |
| `Assets/Rainbow/Testing/Editor/Screen05FrameGrabber.cs` | Exact-size camera render (URP stack + post) + HUD composite → RGBA32 texture |
| `Assets/Rainbow/Testing/Editor/Screen05SeriesRun.cs` | Moving-view series state machine (EditorApplication.update) |
| `Assets/Rainbow/Testing/Editor/Screen05GameplayRecorder.cs` | Deterministic MP4 recording (Time.captureFramerate + MediaEncoder) |
| `Assets/Rainbow/Testing/Editor/Screen05SideBySide.cs` | approved │ capture │ diff×3 sheet + per-region colour numbers |
| `Assets/Rainbow/Testing/Editor/Screen05CaptureUtil.cs`, `Screen05CaptureIndex.cs`, `Screen05CaptureIndexEntry.cs`, `Screen05RecordingLog.cs` | Paths/JSON helpers and JSON record types |
| `AgentScripts/*.cs` (11) → `UnityProject/AgentScripts/` | Ready-made `script eval --file` scripts (status, build scene, stills, series, recording, wait, side-by-side, Game view size, cancel, autopilot) |

One class per file; runtime namespace `Rainbow.Screen05`, editor `Rainbow.Screen05.EditorTools`; no asmdefs.

## Verified against the live Editor (read-only)
* All 15 C# files, concatenated, compiled with `unity command script run --dry-run` against Unity 6000.3.29f1 +
  URP 17.3 + uGUI 2.0: **0 errors, 0 warnings** (a deliberately broken copy reported its error, so the check is real).
  Runtime files use no `UnityEditor` API. The AgentScripts were syntax-checked with a probe (`Wait.Until`, `--file`
  absolute path, double `--timeout` fence) – they reference the Testing types, so they run only after integration.
* APIs confirmed: `RenderPipeline.StandardRequest`/`SubmitRenderRequest` (URP 17.3 `ProcessRenderRequests`),
  URP never draws overlay UI into a RenderTexture (`UniversalCameraData.rendersOverlayUI` needs `targetTexture == null`)
  → HUD handled separately, CanvasScaler formula copied from uGUI 2.0 source, `PlayModeWindow.SetCustomRenderingResolution`,
  `MediaEncoder(string, VideoTrackAttributes)` (not obsolete in 6000.3), CinemachineBrain updates in `LateUpdate` at
  default order (hook runs at order 30000, after it).

## Integration steps (coordinator)
1. Copy `staging\agent1-unity-setup\Assets\Rainbow\Testing\` → `C:\RainbowUnity\UnityProject\Assets\Rainbow\Testing\`
   and `staging\agent1-unity-setup\AgentScripts\` → `C:\RainbowUnity\UnityProject\AgentScripts\` (outside Assets).
2. `& $u recompile --project-path $pp` → expect no errors (the folder compiles even if Gameplay is not integrated yet).
3. After all areas are integrated and the scene is built: Play, then `AgentScripts/screen05_status.cs` – the `hooks=`
   line must say `ok` everywhere (SwimInputOverride, BennyController.Instance/S/LateralX/TeleportTo, Screen05Events).
4. Run the evidence sequence in RUNBOOK §2.5. Outputs land in `UnityProject\Recordings\Screen05\` (git-ignored);
   copy chosen evidence elsewhere if it should be committed.

## How the tools behave
* **Stills** (`CaptureStill(png, 864, 1536)`): Edit or Play mode. Renders `Camera.main` with post forced on at the exact
  size (camera aspect set to w/h for the render, then reset), forces alpha 255, then the HUD pass: every active Screen
  Space - Overlay root canvas is switched for that frame to Screen Space - Camera on a hidden UI camera (Width×Height
  target, CanvasScaler maths redone), rendered over black and over white, matted in linear space and composited (HUD
  not post-processed, as in the game), canvases restored.
* **Series** (`CaptureDefaultSeries()`): Play mode. Input held neutral via the override, `Time.captureFramerate = 30`,
  warm-up teleport measures how far Benny swims in the 10 settle frames and later teleports subtract that lead.
  index.json records requested s/x, the teleport s, Benny's real world position, controller S/LateralX, camera pose,
  frame/time. x values are **world X** (CONTRACT: `ClampLateral` clamps world X); hard left/right = ∓4.2
  (`ClampLateral(±∞, 0.8)`). An autopilot that was running is paused and restored.
* **Recording** (`RecordGameplay(null, 12f, 30)`): Play mode. Teleports to `StartS` on the coin line, enables/creates the
  autopilot, `Time.captureFramerate = fps`, encodes one frame per game frame from the hook, writes `.mp4`, `.json` log
  (coins via `Screen05Events.CoinCollected`, jumps requested, min/max world X, start/end s, hard-left/right frames,
  finished event, rings by spacing and by scene renderers named *ring*), `_first.png`, `_last.png`. Existing files are
  never overwritten (`_2` suffix). Stalls (no frame for 60 s) and leaving Play mode end it cleanly.
* **Autopilot**: execution order −500 (sets the override before Benny reads input). Reads Benny's world x/z from
  `BennyController.Instance.transform`, so it does not depend on how LateralX is defined.

## Contract feedback
* RiverPath values: not checked by Agent 1 (environment/water agents own that). The tools only use `Meander`,
  `ClampLateral`, `StartS`, `FinishS`, `RingSpacing`.
* Please confirm in Agent 4's code: `TeleportTo(s, lateralX)` takes **world X** (as `ClampLateral` implies) and
  `SwimInputOverride.Steer/Active/JumpRequested` are settable statics; `JumpRequested` is consumed by the controller.
* Suggest adding to CONTRACT: Agent 4's HUD should be a Screen Space - Overlay or Screen Space - Camera canvas
  (both are captured); a camera stack overlay camera would also be captured (StandardRequest renders the stack).

## Risks
* Nothing was run in Play mode (not allowed for Agent 1): HUD matting, MediaEncoder output orientation and timing
  are untested at runtime. If the clip is upside down, record with `flipVertical = true`; `_first.png` shows the
  expected upright frame. If the HUD composite looks wrong, use `CaptureStill(path, 864, 1536, false)` (3D only)
  plus `capture game_view --source screen` for the HUD.
* Switching canvases in **Edit** mode may mark the scene dirty (values are restored identically).
* Settle drift: s of a still differs from the request by the lead-estimate error (index.json has the real value).
* Rings-by-scene counting is a heuristic (0 if rings are one combined mesh); rings-by-spacing assumes multiples of 9.
* Recording speed on the N150 iGPU: roughly 2–4× slower than real time (deterministic, so only wall time grows); the
  Editor must keep ticking (`editor set_auto_tick`, unlocked screen, lid open).
* Android needs ≥ 10 GB free; C: has 10.2 GB – free space first (DISK_REPORT).

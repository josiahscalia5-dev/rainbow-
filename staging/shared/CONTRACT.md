# Rainbow Screen 05 — Unity integration contract (coordinator-owned; specialists read, never edit)

## Target
* Unity **6000.3.29f1** (Unity 6.3 LTS), **URP 17.3** (Universal RP), Linear colour space, portrait **1080×1920**
  (approved reference is 864×1536, same 9:16 ratio).
* Approved image (the ONLY visual target): `C:\RainbowUnity\references\05_flow_into_the_current.png`
  (SHA-256 d3f339d4…fb44dd, verified against REFERENCE_ORDER.md). Do not use any other "candidate"/simplified image as target.
* Source of truth for values: the Three.js game at `C:\Users\josia\claude yes\Rainbow_Screen05_Source\`
  (`src/`, `assets/`, `docs/`). It was tuned for many rounds against the approved image: port its numbers/colours.

## Unity project (coordinator integrates)
* Project: `C:\RainbowUnity\UnityProject` (does not exist yet; Editor install in progress).
* Packages available: `com.unity.render-pipelines.universal` 17.3 (+ Shader Graph), `com.unity.inputsystem` 1.20 (write input
  with `#if ENABLE_INPUT_SYSTEM` + legacy `UnityEngine.Input` fallback), `com.unity.cinemachine` 3.x (namespace `Unity.Cinemachine`:
  `CinemachineBrain`, `CinemachineCamera`, `CinemachineFollow`, `CinemachineRotationComposer`), `com.unity.splines` 2.x (namespace
  `UnityEngine.Splines`: `SplineContainer`, `Spline`, `BezierKnot`), `com.unity.cloud.gltfast` (imports `.glb` as prefab),
  `com.unity.recorder` (coordinator's capture tools), `com.unity.ugui` (prefer `UnityEngine.UI.Text` with the built-in
  `LegacyRuntime.ttf` font to avoid TextMeshPro import prompts). No Asset Store, no paid assets.
* **Shader Graph:** the user wants URP + Shader Graph materials. Put each material's shading math in `Shaders/<Name>.hlsl` as
  Shader Graph *Custom Function* functions (`void <Name>_float(in ..., out ...)` + `_half` variant), and make it render right away
  through a hand-written URP `.shader` that `#include`s the same `.hlsl`. The coordinator wraps the `.hlsl` in Shader Graph assets in
  the live Editor. Do not hand-write `.shadergraph` files.
* **User's binding quality rules:** no stationary background images and NO projection of the reference picture (or any screenshot)
  onto geometry. Tunnel, rings, paddles, river, foam = coherent 3D geometry with proper UVs and continuous materials that stay
  convincing as Benny approaches, passes and leaves objects: no stretching, no visible texture boundaries/seams, no blurry patches,
  no sudden changes of the water's look, no flat highway-like stripes.
* No assembly definitions (default Assembly-CSharp / Assembly-CSharp-Editor). Editor code lives in an `Editor` folder.
* Namespaces: runtime `Rainbow.Screen05`, editor `Rainbow.Screen05.EditorTools`.

## Folder ownership (write ONLY inside your staging folder, mirroring the project layout)
| owner | staging folder | project folder(s) |
|---|---|---|
| coordinator | `C:\RainbowUnity\staging\shared\` | `Assets/Rainbow/Shared/`, `Assets/Rainbow/Editor/`, `Assets/Rainbow/Scenes/` |
| Agent 2 environment | `C:\RainbowUnity\staging\agent2-environment\` | `Assets/Rainbow/Environment/` |
| Agent 3 water + VFX + lighting | `C:\RainbowUnity\staging\agent3-water-vfx\` | `Assets/Rainbow/Water/` |
| Agent 4 Benny + gameplay + HUD | `C:\RainbowUnity\staging\agent4-benny-gameplay\` | `Assets/Rainbow/Benny/`, `Assets/Rainbow/Gameplay/`, `Assets/Rainbow/UI/` |
| Agent 1 Unity setup + test tools | `C:\RainbowUnity\staging\agent1-unity-setup\` | `Assets/Rainbow/Testing/` + runbooks |

Copy the source textures/models you need into your own staging `Assets/...` folder (they are small).

## Shared code
* `Assets/Rainbow/Shared/RiverPath.cs` (in `C:\RainbowUnity\staging\shared\`): course geometry API — `RiverPath.Meander(s)`,
  `CorePoint(s)`, `Forward(s)`, `Right(s)`, `AxisPoint(s)`, `ClampLateral(x, r)`, constants `StageLength 72`, `TunnelLength 120`,
  `TunnelStart -12`, `StartS 14`, `FinishS 68`, `FloorDepth 3.3`, `StreamExtent 6`, `RingSpacing 9`, `WaterY 0`,
  `TunnelRadius` (provisional ≈ 6.85), `WaterHalfWidth 6`.
  Frame: tunnel line along +Z at x = 0, +X = rider's right, water plane y = 0, tunnel axis at y = FloorDepth.
  Three.js → Unity: heading −Z becomes +Z; lateral +X (rider's right) keeps its sign; y unchanged.

## Builder entry points (called by the coordinator's `Screen05SceneBuilder`, in this order)
1. `Rainbow.Screen05.EditorTools.EnvironmentBuilder.Build(Transform parent)` → tunnel walls, rings, paddles, far throat, near frame.
2. `Rainbow.Screen05.EditorTools.WaterBuilder.Build(Transform parent)` → water, foam banks, bubbles, lights, reflections,
   fog/ambient, global post-processing `Volume` (bloom etc.).
3. `Rainbow.Screen05.EditorTools.GameplayBuilder.Build(Transform parent)` → `SwimRoute` (a `SplineContainer` built from
   `RiverPath`), Benny (glb + `Animator` with a generated `AnimatorController`), main camera (tag `MainCamera`, URP
   post-processing ON, `CinemachineBrain`) + `CinemachineCamera` rig, coins along the spline, HUD canvas, game flow
   (start → swim → finish screen → restart), EventSystem.
Each returns the root `GameObject` it created, is idempotent (re-running replaces its own objects and assets), creates
materials/meshes as assets under its own project folder (`AssetDatabase.CreateAsset`, then `SaveAssets`), and never touches
another area's objects. Runtime behaviour lives in MonoBehaviours under each area's `Scripts/` folder.

## Cross-area runtime hooks (fixed names)
* `Rainbow.Screen05.SplashWake` (implemented by Agent 3, `Assets/Rainbow/Water/Scripts/SplashWake.cs`): MonoBehaviour that
  draws Benny's white splash wake around/behind its transform on the water. API: `public void SetIntensity(float v01)`
  (0 = airborne, 1 = full swim), `public void Burst(float strength)` (landing splash). Agent 4 adds it to Benny's root with
  `AddComponent<SplashWake>()` and drives it.
* `Rainbow.Screen05.Screen05Events` (implemented by Agent 4, `Assets/Rainbow/Gameplay/Scripts/Screen05Events.cs`): static C#
  events `Action<Vector3> CoinCollected`, `Action Finished`, `Action Restarted`, and a static `float BennyS` (Benny's current s)
  other areas may read (e.g. bubbles spawning around him).
* `Rainbow.Screen05.SwimInputOverride` (implemented by Agent 4, `Assets/Rainbow/Gameplay/Scripts/SwimInputOverride.cs`): static
  `bool Active`, `float Steer` (−1…1), `bool JumpRequested` (consumed by the controller). When `Active`, Benny's input code uses it
  instead of keyboard/touch (the test autopilot drives it).
* `Rainbow.Screen05.BennyController` (Agent 4): `public static BennyController Instance`, `public float S` (distance along the
  course), `public float LateralX`, `public void TeleportTo(float s, float lateralX)` (places Benny on the water, resets velocity,
  snaps the camera) — used by the capture tools.
* Agent 1 owns `Assets/Rainbow/Testing/` (autopilot + capture/recording editor tools).
* Benny body radius 0.8 u; Benny root rides at the water surface + the ride height from `src/characters/benny/runtime.ts`.
* Camera: approved 05 view ported from the Three.js (`benny-lab.ts` 'game05': camera at Benny + (0, 4.1−RIDE, −6.4),
  looking at Benny + (0, 1.8−RIDE, 18), vertical FOV 62°, RIDE = 0.44); Agent 4 verifies against `src/game/cameraRig.ts`.

## Coding rules (we cannot compile until the Editor is installed — be conservative)
* Only stable Unity 6 APIs: `Object.FindAnyObjectByType/FindObjectsByType`, `Rigidbody.linearVelocity`,
  `UniversalAdditionalCameraData` via `cam.GetUniversalAdditionalCameraData()` (namespace `UnityEngine.Rendering.Universal`),
  `UnityEngine.Rendering.Volume`/`VolumeProfile`, `UnityEngine.Rendering.Universal.Bloom/Tonemapping/ColorAdjustments/Vignette`.
* Shaders (see "Shader Graph" above): hand-written URP HLSL (`"RenderPipeline"="UniversalPipeline"`, `LightMode`=`UniversalForward`), include
  `Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl` (+ `Lighting.hlsl` if lit), SRP-Batcher-compatible
  `CBUFFER_START(UnityPerMaterial)`, `#pragma multi_compile_fog` + fog where it matters, shadow-caster pass only if needed.
  Keep them simple and mobile-friendly (no tessellation, no compute, no geometry shaders).
* Mobile/iGPU budget (Intel N150 laptop + Android phone): ≲ 300 k triangles total, ≲ 150 draw calls, no per-frame GC allocs,
  particles ≲ 600 alive.
* Finish with a line-by-line self-review for compile errors (usings, API names, HLSL syntax, semicolons, matching braces).
* Never: install software, run installers, start Unity, use git, download large files, delete anything outside your staging folder.

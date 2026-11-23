# Agent 2 – Screen 05 environment (washer-drum tunnel)

Purple perforated drum walls, chunky rounded gold ring bands, copper-gold wall paddles, the far white-gold throat
(plus the far river chord inside it) and the near gold frame. Project folder: `Assets/Rainbow/Environment/`.
Entry point: `Rainbow.Screen05.EditorTools.EnvironmentBuilder.Build(Transform parent)`. It returns the root `Environment05`.

## Files (staging → `C:\RainbowUnity\UnityProject\Assets\Rainbow\Environment\…`)
| File | Purpose |
|---|---|
| `Editor/EnvironmentBuilder.cs` | `Build(Transform parent)` + menu **Rainbow → Build → Environment 05**. Creates or overwrites `Materials/*.mat` and `Meshes/*.asset` (GUIDs are kept on a rebuild), sets the pano texture's import settings, and replaces its own root. It is idempotent and touches nothing else. |
| `Scripts/DrumLayout05.cs` | Verified layout: radius, floor depth, near-floor dip, ring/paddle positions, slot grid, paddle pose, water chord. |
| `Scripts/DrumMeshes05.cs` | Procedural meshes: tube wall (UV = arc metres, s metres), half-round ring band lathe, tray paddle, frame strips, throat cap, far river. |
| `Scripts/Environment05Root.cs` | Marker on the root (rebuild lookup + read-only layout info: ring/paddle s, radius, throat s). |
| `Scripts/NearFrame05.cs` | Holds the near gold frame 0.8 m in front of the `MainCamera` in Play mode (`beginCameraRendering`, after Cinemachine). `Place(cam)` is public. |
| `Shaders/RainbowEnvCommon.hlsl` | Shared helpers: Marble 05 pano lookup, far glow, mid tint, analytic strip lights. |
| `Shaders/RainbowEnvLighting.hlsl` | Main + additional lights (forward and Forward+ cluster loop of URP 17.3), no shadows. |
| `Shaders/RainbowDrumWall.hlsl` + `.shader` | Wall: procedural capsule slots in metres (fwidth AA, settle to mean coverage when sub-pixel), lit slot lips, strips, far glow, pink floor sheet below the water line. |
| `Shaders/RainbowGoldMetal.hlsl` + `.shader` | Gold: ring band shading with marquee spots (`_GOLD_RING`), paddles (`_GOLD_PADDLE`, vertex-colour regions), frame (`_GOLD_FRAME`). |
| `Shaders/RainbowThroatGlow.hlsl` + `.shader` | HDR white-gold throat cap with slow soft rays (unlit, no fog). |
| `Shaders/RainbowFarRiver.hlsl` + `.shader` | Cheap unlit far river s 119→250 (cyan core, pink bands, foam lips, glints), warming into the glow. |
| `Textures/marble05_env_1024.jpg` | Copy of the source Marble 05 panorama (reflection source of all environment shaders). |

## Integration steps (coordinator)
1. Copy the folder `C:\RainbowUnity\staging\agent2-environment\Assets\Rainbow\Environment\` to
   `C:\RainbowUnity\UnityProject\Assets\Rainbow\Environment\` (all four subfolders). Nothing else is needed: it only
   depends on `Assets/Rainbow/Shared/RiverPath.cs` (already integrated, identical to staging).
2. Let the Editor import, then check the console: `& $u command console get --project-path $pp -- --tail 80 --level error`.
   Any shader error shows here and as magenta surfaces (see Risks 1).
3. Build: **Rainbow → Build Screen 05 Scene** (your `Screen05SceneBuilder` finds `EnvironmentBuilder.Build(Transform)` by
   reflection), or **Rainbow → Build → Environment 05** alone. Expected log:
   `[Rainbow] Environment05 built: 8 rings, 14 paddles, throat at s=250.0`.
4. Camera (Agent 4): far clip **≥ 300** (throat at s = 250, ~242 m from the start eye), near clip **≤ 0.5** (frame at
   0.75–0.8 m), tag `MainCamera`, HDR on, so the throat core (3.0) blooms.
5. Agent 3: keep fog light or its end beyond ~250 m (walls and gold use `MixFog`; the throat cap ignores fog).
   `DrumLayout05.WaterChord(s)` gives the exact half-width where the wall meets the water, if wanted.
6. Optional Shader Graph wrap. Custom Function, **File** mode, same folder, two-sided (Render Face = Both). Blackboard
   reference names = the `.shader` Properties (incl. `_EnvPano` Texture2D):
   * `RainbowDrumWall`: in PositionWS, NormalWS, ViewDirWS (world, normalized), WallUV = UV0, Time, Ambient (Baked GI /
     SH). Out Color, Albedo, Metallic, Smoothness, Emission. Use Color on an Unlit target, or the rest on a Lit target.
   * `RainbowGoldRing` (PositionWS, NormalWS, ViewDirWS, PositionOS, AxisWS = object +Z in world),
     `RainbowGoldPaddle` (… , VertexColor), `RainbowGoldFrame` (NormalWS, ViewDirWS, UV = UV0, Piece = UV1.x), or the
     dispatcher `RainbowGoldMetal` (by `_GoldMode`). Out Color.
   * `RainbowThroatGlow` (UV = UV0, Time). `RainbowFarRiver` (PositionWS, NormalWS, ViewDirWS, RiverUV = UV0, Time). Out Color.

## Source values ported (Three.js `src/`)
| Value | Source | Unity |
|---|---|---|
| Tube radius **7.6** | `world/course.ts:470` `def('05', … tube: 7.6)` | `DrumLayout05.Radius` |
| floorDepth **3.3** = tube **bottom** below the water | `course.ts:282`; `tube.ts:195` centre = path + up·(radius − depth) | axis **4.3** above water |
| Near-floor dip **2.0** (T2, promoted) | `environment.ts:248-252` (smootherstep eye+28…38, smoothstep 2…10) | `FloorExtra(s)` |
| Bay **14**, last slot sF05 = eye + 54, ring A moved to eye + **20** | `environment.ts:263-294` | rings 5.6, 19.6, 27.6, 47.6, 66.6 |
| Far rings at depths 59, 97, 161, 222 (322 lies past the throat) | `environment.ts:521` `ringDv` | 104.6, 168.6, 229.6 (+66.6), built as real rings |
| Eye = crest 14 − back 6.4 = **7.6** | `environment.ts:250` | `DrumLayout05.EyeS` |
| Slots: 64 round, rows every bay/10 = **1.4 m**, no stagger, row phase between rings | `environment.ts:220, 304, 330-331` | `_SlotPitch` |
| Wall `#dc9ef0`, emissive `#3c0848`×0.16, env 0.9, rough 0.07, metal 0.92, hole `#0c0014`, mid tint `#8a30d2` 8–50 ×0.45 | `environment.ts:216-221, 326-328` | `SetupWall` |
| Throat warmth `#ff9c5a` | `environment.ts:313` glowT05 | `_FarGlowColor` |
| Lids: angle 8°, droop −34°, size 2.2, thickness 0.36, stretch 1, sink 0.1, 2.7 u camera-side of each slot | `environment.ts:462-466`; placement `tube.ts:404-421` | `PaddlePose`, `PaddlePositions` → 16.9, 30.9, 44.9, 58.9, 101.9, 165.9, 226.9 |
| Ring profiles band05near / band05, ring and lid palettes, frame geometry and palette, throat palette, Marble pano mapping | `environment.ts`, `tube.ts` (roundBandGeometry, nearFrameGeometry), `materials.ts` | `DrumLayout05.NearBand/FarBand`, `RainbowGoldMetal.hlsl`, `RainbowThroatGlow.hlsl` |

Deliberate differences (each can be tuned on the materials):
* **Slot shape.** The source's `slotHalf [0.3, 0.16]` is in anisotropic cell units (a 0.746 × 1.4 m cell), which makes
  near-square 0.45 m holes. The approved image shows thin capsules along the arc with a lit pink lip (source note: "ref near
  slots ≈10 × 28 px, elongation 4.3"). So the slots are 0.46 × 0.19 m in metres (`_SlotSize.xy`, mean coverage `.z`, lip
  glow `.w`). If the walls read too bright, raise `_SlotSize.y` toward 0.14 and recompute `.z` (`DrumLayout05.SlotCoverage`).
* **Paddles** use the brief's tray lid (`proj05Tunnel.ts` trayLidGeometry). The source default is the solid 'slab' puck
  (`tube.ts:455-466`). The approved paddles show a thick glossy rim with a shallow rosy underside. If the tray reads too
  deep, raise its floor (profile `0.68f * h` in `BuildPaddleTray`).
* **Far section** is a real long tunnel (throat cap at s = 250), not the source's forced-perspective block, which only works
  from the locked eye. The glow range is compressed to it (`_FarGlowRange` 80 / 260 / 1.6).

## Contract feedback (RiverPath)
* `TunnelRadius` should be **7.6** (course.ts:470), not √(6² + 3.3²) ≈ 6.85.
* `FloorDepth 3.3` is the depth of the tube **bottom** below the water (tube.ts:195), so the axis is **4.3** above
  the water. Near the start view (s ≈ 2–45) it is **2.3**, because of the 2 u near-floor dip. `RiverPath.AxisPoint` and its comment are off.
  The wall meets the water at |x| ≈ 6.27 (7.24 near the start), slightly outside `WaterHalfWidth 6`. The wall's pink
  floor sheet fills that strip, and Agent 3's foam banks should cover it.
* `RingSpacing 9` belongs to stages 06/07 (environment.ts:211, 408). Stage 05 uses bay 14 with the ring list above.
  The environment uses `DrumLayout05` and does not read `TunnelRadius`, `AxisPoint` or `RingSpacing`.

## Verification (read-only, 2026-11-23)
* C#: all 5 files compiled with `unity command script run … --dry-run true` against the open Editor
  (6000.3.29f1, URP 17.3.0). The result was **0 errors, 0 warnings**, both for all files together and for the runtime scripts alone
  (no `UnityEditor` needed). `executeMs 0`: nothing ran. A deliberately broken copy reported CS0117, so the check is real.
* Shaders: they cannot be compiled without importing them. Every URP/Core name they use was checked in the installed
  17.3.0 package source: `Fog.hlsl` (`#include_with_pragmas`), `_CLUSTER_LIGHT_LOOP`/`USE_CLUSTER_LIGHT_LOOP`
  (it also defines `_ADDITIONAL_LIGHTS`), `LIGHT_LOOP_BEGIN` (needs `inputData`), `URP_FP_DIRECTIONAL_LIGHTS_COUNT`,
  `GetNormalizedScreenSpaceUV(float4)`, `SampleSH`, `MixFog`, `ComputeFogFactor`, `GetWorldSpaceNormalizeViewDir`,
  `PackNormalOctQuadEncode`, `PackFloat2To888`, `TransformObjectToWorldDir`. All are SRP-Batcher-compatible (all props in `UnityPerMaterial`).
* Budget: about 70 k triangles (walls 25 k, rings 32 k, paddles 9 k, frame/throat/river 4 k) and 31 renderers (SRP Batcher).

## Known risks
1. Shaders are unverified until import. A typo shows as magenta; read the console and fix the named line.
2. The near frame moves only in Play mode, for the camera tagged `MainCamera`. For Edit-mode stills, call
   `FindAnyObjectByType<NearFrame05>().Place(Camera.main)` first, or capture in Play mode.
3. A camera far clip below ~250 m, or strong fog, hides the throat.
4. Look not yet compared side by side with the approved image in Unity (first captures should check slot density,
   paddle depth, ring brightness under Agent 3's bloom/lights; knobs: `_SlotSize`, `_StripIntensity`, `_EnvIntensity`,
   `_LightInfluence`, `_BandS.z`, `_ThroatIntensity`).
5. The wall shader is the heaviest pass (pano sample + strip lights + slots per pixel) on the Intel N150 / phone. If needed,
   drop `_LightInfluence` to 0 on the walls or lower the wall `radial` (128) in the builder.

# Agent 3: water, foam, bubbles, splash, lighting, post-processing (Screen 05)

Staging folder: `C:\RainbowUnity\staging\agent3-water-vfx\`. It mirrors the project folder `Assets/Rainbow/Water/`.

**Compile status:** all 7 C# files were joined into one check file, with no stubs needed because the project already contains `RiverPath`, `Screen05Events` and the temporary `SplashWake` stub. That file was compile-checked read-only (`unity command script run ... --dry-run true`) against the open Editor (6000.3.29f1, URP 17.3) with **0 errors and 0 warnings**. A copy with one deliberate error failed as expected, so the check is real. The shaders could not be compiled without importing them. Instead they were reviewed line by line, and every URP shader-library function they call was confirmed to exist in this project's URP 17.3 / Core RP package cache. Nothing has run in Play mode yet.

## Files (`Assets/Rainbow/Water/...`)
| file | what it is |
|---|---|
| `Scripts/SplashWake.cs` | **Contract hook** `Rainbow.Screen05.SplashWake` with `SetIntensity(float v01)` and `Burst(float strength)`. It writes the shader globals `_RainbowBenny` = (s, x, wake 0..1, waterline radius) and `_RainbowSplash` = (x, z, age, strength). The river shader draws the foam collar, spray fans, trail and landing ring on the water from these, so the wake is part of the depth-tested water surface. It also draws a crown of droplet streaks beside Benny (ballistic, simulated relative to him, `Graphics.RenderMesh`). It needs no setup: the material comes from `Resources/RainbowSpray05`, or from the shader if that is missing. Globals are cleared in `OnDisable`. |
| `Scripts/BubbleField.cs` | Iridescent bubbles: 19 big and 22 small, at the sides only. They avoid the coin line and the lane above Benny (the main camera's x), drift with the current, rise slowly and are recycled ahead of Benny. Benny's position comes only from `Screen05Events.BennyS`. One dynamic mesh. |
| `Scripts/CameraFillLight.cs` | Keeps the pink fill light at `Camera.main` (Game.ts does `fill.position.copy(camera.position)`). |
| `Scripts/RiverSurface.cs` | CPU copy of the river surface: `HeightAt(x, s)` (animated swell, the same formula as the shader), stream centre and width, core x. Benny and coins may use `HeightAt`. |
| `Scripts/RiverMeshGenerator.cs` | One continuous river grid from s = -12 to 120 (about 35 k triangles). UV0 = (x, s), UV1 = (stream centre, half width, core shift). |
| `Scripts/FoamBank.cs` | Seeded foam puffs along both banks: lace at the waterline, shelf fill, and varied clusters with piled tops. Merged into 10 u chunk meshes with LOD0 (12x5) and LOD1 (7x3). |
| `Editor/WaterBuilder.cs` | **Contract entry point** `Rainbow.Screen05.EditorTools.WaterBuilder.Build(Transform parent)`. It is idempotent: it replaces its own `Water05` root and rewrites its own assets in place, so GUIDs stay the same. It also adds the menu item **Rainbow > Water > Rebuild Water In Open Scene (Agent 3)**. |
| `Shaders/RainbowWaterCommon.hlsl` | Shared noise, cell, glint, bolt, streak, brush and ripple helpers (`RBW_` prefix). |
| `Shaders/RainbowRiver.hlsl` + `.shader` | `Rainbow/Water/River`: cyan core, hot-pink S-bands that follow the meander, a hue ramp, brushed satin, silk streaks, flow flares, the foam shelf, Benny's wake and the landing ring, plus a reflection of the marble05 panorama. It has Forward, DepthOnly and DepthNormals passes. |
| `Shaders/RainbowFoam.hlsl` + `.shader` | `Rainbow/Water/Foam`: soap05 pearly foam with bubble cells, pores, an iridescent rim and slow breathing. |
| `Shaders/RainbowBubble.hlsl` + `.shader` | `Rainbow/Water/Bubble`: thin-film bubble quads, soft against the scene depth, fading near the camera. |
| `Shaders/RainbowSpray.hlsl` + `.shader` | `Rainbow/Water/Spray`: velocity-aligned premultiplied droplet streaks. |
| `Textures/marble05_env_1024.jpg` | A copy of the source pano, imported as a 2D lat-long texture for the river reflection. |
| `Textures/marble05_env_cube.jpg` | The same image, imported by the builder as a Cubemap (lat-long, specular convolution) for `RenderSettings` reflections. |

The builder creates `Generated/RiverSurface05.asset`, `Generated/Foam/*.asset`, `Materials/RainbowRiver05|Foam05|Bubble05.mat`, `Resources/RainbowSpray05.mat` and `Screen05_PostFX.asset` (a VolumeProfile with Bloom, Tonemapping, ColorAdjustments and Vignette as sub-assets).

Scene objects under `Screen05/Water05`: `River05`, `FoamBanks05/FoamBank05_[L|R]_NN` (LODGroup), `Bubbles05` (BubbleField), `Lights05/KeySun05`, `ThroatWarm05` and `CameraFill05`, and `PostFX05 (global Volume)` (priority 10). The builder also sets the scene's trilight ambient, ExpSquared fog, custom reflection cubemap and `RenderSettings.sun`.

## Integration steps (coordinator)
1. Copy `staging\agent3-water-vfx\Assets\Rainbow\Water\*` into `C:\RainbowUnity\UnityProject\Assets\Rainbow\Water\`. Overwrite the temporary stub `Scripts/SplashWake.cs` **in place**. That keeps its `.meta` GUID, and the class and API are identical, so Agent 4's code and any saved scene keep working. There are no `.meta` files in staging.
2. Recompile (`unity recompile`) and check the console. The shaders `Rainbow/Water/River`, `Foam`, `Bubble` and `Spray` must import without errors. If one is magenta, its import error is in the console.
3. URP asset: **HDR on**, which bloom needs because its threshold is above 1. **Depth Texture on**, which gives the bubbles and spray their soft edges. The main camera needs Post Processing on (Agent 4). If the camera clears to a colour, the Three.js background was `#b23fb4`.
4. Build: **Rainbow > Build Screen 05 Scene**. `WaterBuilder` runs second. The console should log `[Rainbow Agent3] WaterBuilder: river ... foam ... global Volume ...`. The `Screen05` root must stay at the origin with no rotation or scale, because the water meshes are in world space (RiverPath frame).
5. Shader Graph wrapping (Custom Function nodes, File mode):
   - `RainbowRiver.hlsl`: `RainbowRiverWave` (vertex y offset), `RainbowRiver`, `RainbowRiverReflect`
   - `RainbowFoam.hlsl`: `RainbowFoamVertex`, `RainbowFoam`
   - `RainbowBubble.hlsl`: `RainbowBubble`
   - `RainbowSpray.hlsl`: `RainbowSpray`
   - Each has `_float` and `_half` variants. The hand-written `.shader` files show exactly which inputs each one needs.
6. In Play mode, check that the white wake hugs Benny's waterline and follows him, that the bands keep their shape while he jumps, that bubbles appear only at the sides, and that only highlights glow.

## Source values ported
* **River** (waterRibbon.ts W10/W12): master-s offset 116.7, CORE_SWING 0.9, EDGE_LIFT 0.28, AMP['05'] 0.1, flow 11 x FLOW05 1.3 = 14.3 u/s, `sbend05`, band layout [1, 0.62, 0.19], `coreShiftW10`, the W10/W12 palette (#0068AD, #0086D8, #00A8F5, #00C4FB, #C81CAE, #F72BD4, #FB57F9, #F0AFF7, #F8D7FD, ...), and course.ts `widthAt` for 05.
* **Splash** (riderSplash.ts `createRiderSplash05` jetPos): roots 1.6 to 0.8 rad from straight back, thrown 1.2 to 0.45 rad, height 0.12 to 0.42, length 0.3 to 0.8.
* **Bubbles** (bubbles.ts): RIDE.high big 19 / small05 22, uNear 3.2, drift 0.1x (big) and 0.2x (small) the speed, rise 0.04 to 0.16 u/s, life 7 to 15 s.
* **Lights** (Game.ts):
  - Sun `#fff4e6` 1.6 from (0.3, 1, 0.45), giving 0.51 in URP.
  - Hemisphere `#fff0ff` / `#a33bb8` 1.15, giving a trilight scaled by 1.15/pi, with 30 % water cyan on the ground.
  - Fill PointLight `#ffd8ff` (30, distance 30, decay 1.6) at the camera, giving 20 with range 30.
  - three.js r155+ lights are physical (albedo/pi), so intensities were scaled by 1/pi.
* **Fog**: FogExp2 `#ffbde9` 0.0035, giving ExponentialSquared with the same density.
* **Post-processing**:
  - Game.ts glow05 UnrealBloom (1.0, 0.4, threshold 2.6 linear), giving URP Bloom threshold 1.2 (gamma), intensity 2.5, scatter 0.65.
  - env.ts Neutral tone mapping with exposure 0.86, giving Tonemapping None plus Post Exposure log2(0.86) = -0.218 EV.
  - grade.ts saturation 1.36 and contrast 1.15, giving +36 and +15.
  - grade.ts vignette 0.18, giving intensity 0.15 and smoothness 0.4.
* **Reflection**: materials.ts `marblePano05`. The vanishing point at u 0.514 gives `_EnvYaw` 5.04 deg.

## Known risks
* The shaders are not compiled yet (see Compile status). The first import is the real test.
* **Bloom** is a perceptual port. UnrealBloom keeps a pixel's whole colour above its threshold, while URP subtracts the threshold. Tune `Screen05_PostFX.asset` (intensity and threshold) after the first side-by-side capture.
* **Tonemapping None** clips very bright glints per channel instead of the Khronos neutral roll-off. URP's own Neutral curve would darken mid-tones (0.5 becomes 0.34).
* **Foam budget**: about 2.3 k puffs along the whole course (estimate). LOD0 (108 triangles per puff) only applies within about 28 u. If the frame is over about 300 k triangles, raise the LOD0 height in `WaterBuilder.BuildFoam` or use 10x4 in `FoamBank.BuildChunks`.
* The **custom reflection cubemap** orientation follows Unity's lat-long import. It only affects URP Lit materials such as Benny and the coins, because the river uses its own pano lookup.
* **ThroatWarm05** (warm directional light, 0.35) is not in the source. It was added because the brief asks for warm light from the far end. Tune or disable it freely.
* The spray uses `Graphics.RenderMesh`. A capture that renders a camera outside the normal frame loop might miss the droplets. The wake drawn on the water is not affected.
* Without the URP Depth Texture on GLES (no reversed Z), the soft-depth fade could hide bubbles and spray. Keep Depth Texture on.

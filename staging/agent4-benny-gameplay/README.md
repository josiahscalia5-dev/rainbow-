# Agent 4: Benny, gameplay and HUD (Screen 05)

Staging folder: `C:\RainbowUnity\staging\agent4-benny-gameplay\`. It has the same layout as the Unity project (`Assets/Rainbow/Benny`, `Assets/Rainbow/Gameplay`, `Assets/Rainbow/UI`).
**Compile status:** all 13 C# files were concatenated with a stub for Agent 3's `SplashWake`, then compile-checked read-only (`unity command script run ... --dry-run true`) against the open Editor (6000.3.29f1, Cinemachine 3.1.7, Splines 2.9.2, Input System 1.20.1, URP 17.3). Both `ENABLE_INPUT_SYSTEM` defined and undefined gave **0 errors and 0 warnings**. The HLSL shaders were reviewed by hand only. Nothing has been run in Play mode yet.

## Files
| File | What it is |
|---|---|
| `Assets/Rainbow/Gameplay/Editor/GameplayBuilder.cs` | **Contract entry point** `Rainbow.Screen05.EditorTools.GameplayBuilder.Build(Transform parent)` builds the whole "Gameplay" root and returns it. Idempotent. |
| `Assets/Rainbow/Gameplay/Editor/BennyRigBuilder.cs` | Builds Benny from `benny31.glb`: it reads the GLB itself to make a SkinnedMeshRenderer with 4 generated bones (Squash, ArmL, ArmR, Pom), using the vertex regions benny31.ts deformed. Fallback 1 is the glTFast prefab; fallback 2 is a procedural Benny. Also generates the AnimationClips and the `Benny.controller` (Swim 1D blend tree on Steer with lean left/right, Jump, Fall, Land). |
| `Assets/Rainbow/Gameplay/Editor/GameplayAssetUtil.cs` | Helpers for folders, PNG, mesh and material assets |
| `Assets/Rainbow/Benny/Scripts/BennyController.cs` | Contract members `Instance`, `S`, `LateralX`, `TeleportTo(s, lateralX)`. Auto-swim along the SwimRoute, steering, jump, ride pose, pompom spring, Animator parameters, and calls to `SplashWake.SetIntensity`/`Burst` |
| `Assets/Rainbow/Benny/Scripts/BennyInput.cs` | Keyboard A/D or arrows to steer, Space/W/Up to jump, Esc/P to pause. Touch or mouse: drag or hold left/right to steer, swipe up to jump. Works with the new Input System and the legacy Input Manager. |
| `Assets/Rainbow/Gameplay/Scripts/SwimInputOverride.cs` | Contract statics `Active`, `Steer`, `JumpRequested` (the controller consumes the jump) |
| `Assets/Rainbow/Gameplay/Scripts/Screen05Events.cs` | Contract: `CoinCollected`, `Finished`, `Restarted`, `BennyS` |
| `Assets/Rainbow/Gameplay/Scripts/SwimRoute.cs` | SplineContainer route from `RiverPath.CorePoint` (knot every 2 u from TunnelStart to StageLength, AutoSmooth), plus s/t/distance lookups |
| `Assets/Rainbow/Gameplay/Scripts/Screen05CameraRig.cs` | Cinemachine 3 rig with the STAGE_CAM['05'] numbers (follow and look-ahead targets) |
| `Assets/Rainbow/Gameplay/Scripts/CoinTrail.cs` | C05 coin layout, bob/wobble, pickup, pop and sparkles, raises `CoinCollected` |
| `Assets/Rainbow/Gameplay/Scripts/Screen05GameFlow.cs` | Swim → finish panel at FinishS → Restart. Hearts (a foam-bank bump costs one), pause, +10 per coin from 1,420 |
| `Assets/Rainbow/UI/Scripts/Screen05Hud.cs`, `UISpriteFactory.cs` | Portrait uGUI HUD (1080×1920, match 0.5): pill bar (heart 5/5 +, coin counter that counts up, pause button), gold-bordered banner "05 • FLOW INTO THE CURRENT", hint, pause overlay, finish panel. All art is drawn in code. |
| `Assets/Rainbow/Benny/Shaders/RainbowFluff.hlsl/.shader` | Plush shader: baked radiance ×4, wrap light, fuzz rim, fur noise. Shader Graph function `RainbowFluff_float/_half` |
| `Assets/Rainbow/Gameplay/Shaders/RainbowCoin.hlsl/.shader` | Gold coin: emissive art, milled rim, metal sheen. Shader Graph functions `RainbowCoin_float/_half`, `RainbowCoinEdge_float/_half` |
| `Assets/Rainbow/Gameplay/Shaders/RainbowSparkle.shader` | Additive HDR sparkle for the coin pop particles |
| `Assets/Rainbow/Benny/Models/benny31.glb`, `Benny/Textures/benny31_bake.png` | The approved Benny model and bake (copied unchanged from the source) |

## Integration steps (coordinator)
1. Copy `staging\agent4-benny-gameplay\Assets\Rainbow\{Benny,Gameplay,UI}` into `C:\RainbowUnity\UnityProject\Assets\Rainbow\`.
2. **Integrate Agent 3's `Assets/Rainbow/Water/Scripts/SplashWake.cs` in the same import.** `BennyController` and `GameplayBuilder` reference `Rainbow.Screen05.SplashWake`. If that file is late, add this temporary stub and delete it when the real one arrives:
   `namespace Rainbow.Screen05 { public class SplashWake : UnityEngine.MonoBehaviour { public void SetIntensity(float v01) {} public void Burst(float strength) {} } }`
3. Recompile (`unity recompile`). Then build the scene with **Rainbow → Build Screen 05 Scene**; `Screen05SceneBuilder` calls `GameplayBuilder.Build(root)` third.
4. Check that the console shows `[Rainbow Agent4] Benny built from benny31.glb (skinned, generated bones)` and `GameplayBuilder: route ... 12 coins ...`.
5. Shader Graph: wrap `RainbowFluff.hlsl` (function `RainbowFluff`) and `RainbowCoin.hlsl` (`RainbowCoin`, `RainbowCoinEdge`) as Custom Function nodes. The hand-written `.shader` files already render.
6. Project settings: Active Input Handling may be "Input System Package" or "Both"; both compile. The camera already has URP post-processing on, FXAA, HDR and a CinemachineBrain (LateUpdate, cut blends).
7. Play: Benny starts at s = 14 on the route line and auto-swims. The finish panel appears at s = 68. Restart is on the panel, or press Esc/P after the finish.

Generated assets: `Benny/Generated/Benny31_Skinned.asset`, `Benny/Materials/*.mat`, `Benny/Animation/*.anim + Benny.controller`, `Gameplay/Generated/Coin05.asset, Coin05_Face.png, Coin05_Sparkle.png`, `Gameplay/Materials/Coin05*.mat`, `UI/Generated/Hud_*.png`.

Scene hierarchy under `Gameplay`:
- `SwimRoute`
- `Benny` (with BennyInput, SplashWake and BennyController)
  - `Visual` (Animator) → `Lean` → `Bob` → `Model` → `Squash` → `ArmL`, `ArmR`, `Pom`
  - `CamTarget`
- `CameraRig`
  - `CamLookAhead`
  - `CM RideCamera` (CinemachineCamera, Follow, HardLookAt)
- `Main Camera`
- `Coins` (12 coins and the `CoinSparkles` particle system)
- `HUD`
- `GameFlow`
- `EventSystem`

## Source values ported
* Swim speed **11 u/s** (`course.ts` stage 05 `speed: 11`). Steering: input eased ×10/s, side speed eased to steer × 7.5 u/s at ×8/s (Game.ts). A bank bump happens after pushing a bank for 0.6 s. Jump: v 9 u/s, gravity 30.
* Ride (`runtime.ts`): body radius 0.8, root at water + 0.8 × 0.55 = 0.44, model lift 0.12, lean 0.22 rad. Pompom spring k 120, c 9, ×2.2.
* Model (`benny31.ts`): scale 2.308, centre y 0.26, turned 180°. Arm/pompom deform regions and doggy-paddle stroke at rate 7.5.
* Camera (`cameraRig.ts` STAGE_CAM['05']): back 6.4, up 3.6, ahead 18, lookUp −1.92, vFOV 62, yaw 2.96° left, latFollow 0.85, deadZone 1.0, no roll. Laterally the camera stays on the tunnel axis and eases toward Benny only when he swings wide.
* Coins (`coins.ts` C05): first coin at the 05 crest + 5.7. Gaps 5 + 1.5k (max 8) up to the stage end − 3. Height 1.2, size 0.9, tilt 0.8 rad, lateral 0.7 × 0.9 × meander. Pickup |ds| < 1, |dx| < 1.25. Pop ×1.8 over 0.35 s. Cylinder r 0.5, thickness 0.2, 48 segments. Rim stripes #ffe070/#c08000 ×64. Face emissive ×1.15 on metal #7a5200. Decorative far trail: one coin every 6.5 u.
* HUD (`hud.ts`): bar gradient rgba(150,60,200,.72)→rgba(92,22,150,.78) with a pink border; banner #7a2bb0→#4f1489 with #ffd36b border. The score starts at 1,420 (`refCoins` 05).

## Known risks
* **SplashWake (Agent 3)** blocks compilation until it is integrated (see step 2). Benny calls only `AddComponent<SplashWake>()`, `SetIntensity(float)` and `Burst(float)`.
* Shaders are not compile-checked. If one shows magenta, look at its console error; the builder falls back to URP Unlit only when a shader is missing entirely.
* The run lasts about 5 s from s = 14 to 68 at the source speed of 11, not the ~10 s the contract mentions. `swimSpeed` is in the Inspector.
* Steering is an offset from the SwimRoute line, so Benny follows the S-curve when there is no input. `LateralX` is still world X. Agent 1's autopilot steers on world X with a PD controller and works with this.
* There are 7 playable coins plus 5 decorative far coins, so the finish panel shows "n / 7".
* Nothing has been verified in Play mode: framing, clipping when steering hard or jumping, and the feel all need the coordinator's capture pass.

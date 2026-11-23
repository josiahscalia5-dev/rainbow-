// Rainbow Unity — Screen 05 specialists (saved 2026-11-23, NOT yet run: the user paused before launch).
// Resume: in Claude Code call the Workflow tool with { scriptPath: "C:\\RainbowUnity\\staging\\shared\\specialists.workflow.js" }.
// Each agent writes ONLY to its own folder under C:\RainbowUnity\staging\ ; the coordinator integrates into the Unity project.
export const meta = {
  name: 'rainbow-unity-screen05-specialists',
  description: 'Four Rainbow Screen 05 Unity specialists (setup runbook, environment, water/VFX, Benny/gameplay) work in parallel in separate staging folders',
  phases: [
    { title: 'Specialists', detail: 'Agent 1 Unity setup runbook, Agent 2 environment, Agent 3 water/VFX/lighting, Agent 4 Benny/gameplay/HUD' },
  ],
}

const SRC = 'C:\\Users\\josia\\claude yes\\Rainbow_Screen05_Source'
const COMMON = `
You are one of four specialist agents working IN PARALLEL for a coordinator who integrates your output into a Unity project.
The user (a beginner) is building their ORIGINAL approved mobile game screen "05 - Flow into the Current" of the Rainbow game in Unity.
Progress toward a playable game matters more than reports: deliver complete, working, compile-safe files.

READ FIRST: C:\\RainbowUnity\\staging\\shared\\CONTRACT.md (binding contract: folders, namespaces, builder entry points, hooks,
coding rules) and C:\\RainbowUnity\\staging\\shared\\Assets\\Rainbow\\Shared\\RiverPath.cs (shared course API; read-only).

MACHINE: Windows 11 HP 14-inch laptop, Intel N150 CPU, 8 GB RAM, Intel integrated GPU, drive C: nearly full.
Write only small text files (C#, shaders, markdown) plus copies of the few small source textures/models you need.
Use PowerShell / Read / Write / Edit / Grep / Glob tools. NEVER: install software, run installers, start or batch-run Unity,
use git, download anything bigger than a few MB, change system settings, or delete/modify anything outside your own staging folder.
The source folder ${SRC} is READ-ONLY for you.

THE APPROVED IMAGE (the ONLY visual target; do not redesign): C:\\RainbowUnity\\references\\05_flow_into_the_current.png (864x1536 portrait;
also ${SRC}\\references\\hires\\05_flow_into_the_current_1080.jpg). Look at it with the Read tool. What it shows:
- Top HUD: rounded dark-purple glossy pill bar with a red heart "5/5 +", a gold $ coin "1,420", a round pause button; under it a
  gold-bordered purple banner "05 • FLOW INTO THE CURRENT" in gold italic capitals.
- A round washer-drum TUNNEL of rich purple / magenta / lavender polished metal covered in rows of elongated dark slot perforations,
  with hot-pink and white specular streaks; chunky polished rounded GOLD/COPPER RING bands at regular intervals receding to a
  bright warm white-gold glowing THROAT at the vanishing point (about x 490, y 480 px of 864x1536).
- Copper-gold rounded rectangular PADDLES (washer lifters / "lids") mounted on the upper side walls at the rings, left and right.
- A wide glossy bright CYAN / electric-blue RIVER filling the tunnel floor, with hot-pink / magenta satin CURRENT BANDS in S-curves on
  both sides of a cyan core, long white glints showing flow; soft white puffy FOAM clouds piled along both banks; iridescent BUBBLES.
- A winding trail of chunky gold COINS (embossed $) standing upright facing the camera along the S-curve toward the vanishing point.
- BENNY in the lower middle seen from BEHIND (body centre about x 430, y 1060 px): round pink fluffy fur-ball body, two small fluffy arm
  nubs, purple-and-white striped knitted beanie with ribbed cuff, big purple fluffy pompom, small yellow star on the cuff's right side;
  white splashing wake around his lower body. The nearest gold ring frames the bottom corners of the screen.
- Overall: saturated, glossy, bright, glowing highlights (bloom), warm light from the far end, cool cyan from the water.
It must look like this WHILE PLAYING (camera following Benny from s=14 to s=68, hard left / right steering), not only from one angle.

USER'S BINDING RULES (highest priority): reproduce the approved artwork as closely as practical (their target is 90-95 % likeness,
judged by eye in side-by-side captures - never claim a percentage). NO stationary background images and NO projection of the reference
picture or any screenshot onto geometry: everything is coherent 3D geometry with proper UVs and continuous materials that stay
convincing as Benny approaches, passes and leaves objects (no stretching, seams, blurry patches, sudden changes). Materials: URP +
Shader Graph - put the shading math in Shaders/<Name>.hlsl as Shader Graph Custom Function functions (void <Name>_float(...) plus a
_half variant) and #include it from a hand-written URP .shader so it renders immediately (see CONTRACT.md); the coordinator wraps the
.hlsl into Shader Graph assets in the live Editor. Re-read CONTRACT.md: it was updated (Cinemachine, Splines, SwimInputOverride,
BennyController API, Testing folder).

SOURCE OF TRUTH FOR VALUES: the existing Three.js game in ${SRC}\\src (and ${SRC}\\assets, ${SRC}\\docs). It was tuned for many rounds
against the approved image: port its numbers, colours and spacing; don't invent new ones when the source has them. Big files: use
Grep to find the Screen 05 parts and Read with offset/limit instead of reading whole files.

UNITY: 6000.3.29f1 (6.3 LTS) + URP 17.3 is installed; the coordinator alone opens the Editor and compiles your code after
integration, so you cannot test-compile: follow the contract's coding rules and finish with a careful line-by-line self-review for
compile errors. Keep a mobile / integrated-GPU budget. If the Skill tool is available to you, Unity's own skills can help with exact
URP 17 / uGUI details (unity:urp-postprocessing, unity:ui-ugui, unity:craft-game-floors) - load only what you need.

DELIVERABLE: everything inside YOUR staging folder (named below) mirroring the Unity project layout, plus a README.md there that lists
each file, the exact integration steps, what source values you ported, and known risks. Work efficiently (aim to finish in about
30-40 minutes of work); a complete working first version beats an unfinished perfect one.
Return the structured result: absolute paths of all files written, a short summary, integration steps, contract feedback (any
RiverPath value you found to be wrong, with evidence from the source), and risks.
`

const AGENT1 = `
YOU ARE AGENT 1 - UNITY SETUP + PIPELINE (research + runbooks; READ-ONLY on the system). Staging folder:
C:\\RainbowUnity\\staging\\agent1-unity-setup\\
State now: Unity 6000.3.29f1 IS installed at C:\\Program Files\\Unity\\Hub\\Editor\\6000.3.29f1 (default Editor, registered with the
Unity CLI 1.0.1 at C:\\Users\\josia\\AppData\\Local\\Unity\\bin\\unity.exe). The coordinator handles sign-in, the license, creating the
project C:\\RainbowUnity\\UnityProject (URP template, --no-cloud; the CLI adds com.unity.pipeline) and opening the Editor. Do NOT
install anything, start/stop/open the Editor, run \`unity open\`/\`unity install\`/winget install, delete files, or change settings.
Set $env:UNITY_NO_CONSENT_PROMPT='1'; $env:DO_NOT_TRACK='1' before any \`unity\` call; use only read-only CLI calls (--help, list,
status, info, --dry-run). Read the Unity skill docs on disk:
C:\\Users\\josia\\AppData\\Local\\Claude-Data\\claude_pzs8sxrjxfjjc\\rpm\\505767f9\\fa3dd438\\plugin_012dAT1EB1GCjar34htA97xJ\\skills\\
(unity-cli and its references\\, unity-package-management, urp-postprocessing, craft-game-floors ...).
Write C:\\RainbowUnity\\staging\\agent1-unity-setup\\RUNBOOK.md with exact, verified commands (from the docs / --help, not guesses) for:
 1. Driving the open Editor of THIS project from the CLI: \`unity status --until-ready --project-path C:\\RainbowUnity\\UnityProject\`,
    discovering commands (\`unity command --query ...\`), running C# with \`unity command script eval --caller plugin --skill unity-cli\`,
    calling our static editor method \`Rainbow.Screen05.EditorTools.Screen05SceneBuilder.Build()\`, recompiling and reading compile
    errors (\`unity recompile\`, Safe Mode recovery), entering/leaving Play mode and confirming the game advances (the playmode
    verification loop reference), reading the console.
 2. Capturing the Game view at exactly 864x1536 (and 1080x1920) during Play mode as PNG files, and recording a ~10 s gameplay clip
    (Pipeline screenshot commands, or the free com.unity.recorder driven by a small editor script - include that script), and how to
    drive steering/jumps during an automated capture (e.g. an autopilot component instead of real key presses).
 3. Adding packages com.unity.cloud.gltfast and, if missing, com.unity.inputsystem / com.unity.recorder with the Pipeline \`package\`
    commands (unity-package-management skill), with versions verified for 6000.3.
 4. Android: which modules Unity 6000.3.29f1 needs and their sizes (read-only dry run if the CLI offers one) and whether an existing
    Android SDK / NDK r27c / JDK 17 on this laptop could be used instead (search %LOCALAPPDATA%\\Android\\Sdk, C:\\Program Files\\Android,
    %USERPROFILE%\\.gradle, JAVA_HOME). C: has ~8.9 GB free.
 5. Git: Git for Windows is NOT installed (git, git-lfs, gh absent). Smallest safe way to get git + git-lfs + Git Credential Manager
    (\`winget show --id Git.Git\`, per-user \`--scope user\`, size, admin needed?) and the commands to create an ORPHAN branch
    \`unity/screen05-dev\` in https://github.com/josiahscalia5-dev/rainbow- WITHOUT cloning the 22 GB repo (git init in C:\\RainbowUnity +
    remote + orphan branch + push), a Unity .gitignore keeping UnityProject/Library, Temp, Logs, obj, Build(s), UserSettings out, LFS for
    *.glb/*.fbx/*.psd/*.exr/*.mp4/*.apk (the approved reference PNG stays in plain git), and the browser sign-in.
Also write DISK_REPORT.md: the 30 largest folders under C:\\Users\\josia (incl. AppData\\Local, AppData\\Roaming, Downloads, OneDrive),
C:\\ProgramData and C:\\Program Files*, plus big caches / old installers / duplicates that could be freed, each with size, what it is,
risk, and whether the user must decide (never delete). Note: the 4.2 GB installer download
(%APPDATA%\\UnityHub\\downloads\\UnitySetup64-6000.3.29f1.exe) is no longer needed now that the Editor is installed.
Measure folder sizes efficiently (e.g. robocopy /L /S /NJH /BYTES, or Get-ChildItem -Recurse -File) and skip folders you cannot read.

ALSO WRITE THE VISUAL-TEST TOOLING (C#, in your staging folder under Assets/Rainbow/Testing/; the user requires real evidence):
- Scripts/Screen05Autopilot.cs (runtime MonoBehaviour): when enabled, drives Rainbow.Screen05.SwimInputOverride (contract) for a
  ~12 s run: follow the coin line (target x = RiverPath.Meander(s + 3)) with deliberate hard-left and hard-right excursions and two
  jumps, so one recording shows swimming through several gold rings, steering both ways, jumping and collecting coins.
- Editor/Screen05Capture.cs (editor, static methods + [MenuItem("Rainbow/Capture/...")], callable from \`unity command script eval\`):
  * CaptureStill(string pngPath, int w = 864, int h = 1536): render Camera.main into a w x h RenderTexture (URP post-processing on)
    and save a PNG - independent of the Game-view window size or focus.
  * CaptureSeries(string folder, float[] sValues, float[] lateral): in Play mode, for each pair call
    BennyController.Instance.TeleportTo(s, x), wait a few frames for the camera, CaptureStill; drive it frame by frame with an
    EditorApplication.update state machine (no blocking loops). Default set: s = 10, 14 (approved view), 20, 28, 40, 55, 66 at x on
    the coin line, plus hard-left and hard-right at s = 14 and s = 30. Write an index.json (file, s, x, time).
  * RecordGameplay(string mp4Path, float seconds = 12, int fps = 30): in Play mode enable the autopilot, set Time.captureFramerate =
    fps (deterministic, smooth even on a slow laptop), every frame render Camera.main to an 864x1536 RenderTexture, ReadPixels into
    an RGBA32 Texture2D and add it to UnityEditor.Media.MediaEncoder (H.264 .mp4, VideoTrackAttributes 864x1536 @ fps); finalize,
    restore Time.captureFramerate, write a small JSON log (coins collected, jumps, min/max lateral x, rings passed).
  * Keep every class in its own file; no blocking waits; clean up RenderTextures.
`

const AGENT2 = `
YOU ARE AGENT 2 - 3D ENVIRONMENT. Staging folder: C:\\RainbowUnity\\staging\\agent2-environment\\ (project folder Assets/Rainbow/Environment/).
Build the Screen 05 washer-drum tunnel for Unity URP, reproducing the approved image's look from every gameplay viewpoint:
- purple / magenta / lavender polished metallic drum wall with rows of elongated dark slot perforations (procedural slots in the
  shader are fine - they must stay crisp and not stretch along the tube; a perforation texture from ${SRC}\\assets\\textures\\tunnel05
  only if it tiles convincingly in 3D), strong hot-pink/white specular, environment reflection, slight colour shift toward the bright
  far end;
- chunky rounded polished GOLD/COPPER ring bands (rounded profile, not flat) at RiverPath.RingSpacing, anchored like the Three.js;
- copper-gold rounded rectangular PADDLES ("lids") on the upper side walls at the rings, left and right (prefer the existing model
  ${SRC}\\assets\\models\\lids05.glb imported with glTFast if its geometry fits - inspect it (it's glTF 2.0 binary; you can parse the
  JSON chunk with PowerShell) - otherwise a procedural rounded tray lid like trayLidGeometry in src\\vfx\\proj05Tunnel.ts);
- the bright warm white-gold far THROAT glow at the vanishing point (emissive + optional light), deep enough to read at the end;
- the near gold FRAME ring that frames the bottom corners of the portrait screen at the approved start view.
Port from: src\\world\\tube.ts (tube + rings: buildRingsAt), src\\world\\environment.ts (ringSpacing, lids, slot rows, stage anchors),
src\\world\\materials.ts (metal colours/roughness), src\\world\\far05.ts (far throat), src\\vfx\\proj05Tunnel.ts (lids/ring/frame),
src\\render\\env.ts and ${SRC}\\assets\\textures\\marble05_env_1024.jpg (env map), ${SRC}\\assets\\textures\\tunnel05\\* (+ json),
docs\\briefs\\*\\S05*.md (visual rules). VERIFY the tube radius / water depth used for stage 05 in the source and report it as
contract feedback if RiverPath.TunnelRadius (provisional sqrt(6^2+3.3^2) ~ 6.85) or FloorDepth (3.3) is wrong.
Write: URP HLSL shaders (e.g. Shaders/RainbowDrumWall.shader, Shaders/RainbowGoldMetal.shader, Shaders/RainbowThroatGlow.shader),
procedural mesh code (tube from RiverPath.TunnelStart to RiverPath.TunnelLength, inner faces, only what the camera can see - the
part below the water may be skipped), Editor/EnvironmentBuilder.cs with public static GameObject Build(Transform parent) creating
materials (.mat) and meshes (.asset) under Assets/Rainbow/Environment/, idempotent. Copy needed textures/models into your staging
Assets/Rainbow/Environment/Textures|Models. The water, foam, lights and post-processing belong to Agent 3 - don't create them, but make
your materials look right under strong bloom and an env reflection made from marble05_env_1024.jpg (Agent 3 sets RenderSettings
reflection to that); your shaders may also sample their own copy of it as a fallback reflection.
USER'S SPECIFIC BARS for your area: rich luminous purple / violet / lavender metallic drum; SMALL dark perforations arranged NEATLY in a
regular grid across the walls (consistent size and spacing measured in metres along the arc - UV u = arc length, never stretched; crisp
up close, anti-aliased with fwidth and faded with distance so there is no shimmer or moire); strong depth, rounded tunnel geometry and
the original perspective; polished gold rings with the source's thickness and spacing (rounded profile, enough segments to stay round
up close); rounded copper-gold paddles on the walls. Everything must hold up as the camera passes right next to rings and paddles.
`

const AGENT3 = `
YOU ARE AGENT 3 - WATER, FOAM, BUBBLES, SPLASH, LIGHTING, REFLECTIONS, POST-PROCESSING. Staging folder:
C:\\RainbowUnity\\staging\\agent3-water-vfx\\ (project folder Assets/Rainbow/Water/).
Reproduce the approved river and its effects so they hold up during gameplay (camera moving s=14..68, Benny steering hard left/right):
- the wide glossy bright cyan / electric-blue water surface filling the floor chord x in [-RiverPath.WaterHalfWidth, +WaterHalfWidth]
  at y = RiverPath.WaterY from RiverPath.TunnelStart to RiverPath.TunnelLength; hot-pink/magenta satin current bands in S-curves on
  both sides of the cyan core that follows RiverPath.Meander(s); long white glints / sparkles; flow animation moving away from the
  camera (+Z); fresnel + reflection; gentle ripple normals. Build the mesh in C# with attributes the shader needs (e.g. UV0.x =
  lateral distance from the core line, UV0.y = s) so the bands follow the S exactly;
- soft white puffy foam clouds piled along both banks where the water meets the wall (instanced/billboarded soft spheres with a soapy
  shader, slow wobble), continuous along the course;
- iridescent soap bubbles floating above the water (thin-film fresnel shader, bob/drift, recycled around Benny using
  Screen05Events.BennyS - read the contract; keep the dependency to that one static float);
- Rainbow.Screen05.SplashWake (exact API in the contract): Benny's white splash spray + foam ring around his lower body on the water;
- lighting: key directional light, warm far-throat light(s), ambient (purple/pink/cyan trilight), fog if it helps depth, reflections
  (RenderSettings custom reflection from ${SRC}\\assets\\textures\\marble05_env_1024.jpg turned into a cubemap asset in the builder,
  or a reflection probe - pick what works robustly in URP 17), and a global post-processing Volume + VolumeProfile asset: Bloom
  (the user said the glow on highlights is most of what makes the approved image look right - port the bloom strength / radius /
  threshold from src\\game\\Game.ts), tonemapping that keeps the saturated colours, colour adjustments, subtle vignette.
Port from: src\\vfx\\waterRibbon.ts (RIVER05_PAL, channel05, sbend05 ... it is 100 KB: grep for 05), src\\vfx\\flow05.ts, src\\vfx\\foam.ts
(SOAP05_GLSL, bermScale05), src\\vfx\\bubbles.ts, src\\vfx\\riderSplash.ts (createRiderSplash05), src\\vfx\\spray.ts, src\\vfx\\glsl.ts,
src\\render\\grade.ts, src\\render\\env.ts, src\\game\\Game.ts (bloom), textures ${SRC}\\assets\\textures\\water05\\* (+ json),
${SRC}\\docs\\vfx\\water_05.png and ${SRC}\\references\\water\\05_water_isolated_original.png (isolated approved water).
Write: URP HLSL shaders (Shaders/RainbowRiver.shader, Shaders/RainbowFoam.shader, Shaders/RainbowBubble.shader, splash as needed),
runtime scripts (Scripts/SplashWake.cs, Scripts/BubbleField.cs, Scripts/FoamBank.cs, ...), Editor/WaterBuilder.cs with
public static GameObject Build(Transform parent) creating materials/meshes/volume profile assets under Assets/Rainbow/Water/,
idempotent. Benny, the camera, coins and HUD belong to Agent 4; the tunnel, rings and paddles belong to Agent 2.
USER'S SPECIFIC BARS for your area: bright cyan-blue water with NATURALLY CURVED magenta currents (varying band widths that follow the
S, soft edges, flow distortion - never flat parallel "highway" stripes); elegant white reflections, ripples and flowing highlights;
the same recognisable river width and bends as the reference; one continuous procedural material along the whole course (no texture
seams, no stretching, no blurry patches, no sudden change of look); soft PEARLY white foam following the river edges in rounded,
naturally varied clusters (not identical repeated blobs); transparent iridescent bubbles; Benny's wake must sit AT THE WATERLINE,
follow his position (a flat foam/ripple decal or ribbon on the water around and behind him plus small spray at the waterline),
be depth-tested, and never show a foam ring crossing his body or a splash floating disconnected from him.
`

const AGENT4 = `
YOU ARE AGENT 4 - BENNY + GAMEPLAY + HUD. Staging folder: C:\\RainbowUnity\\staging\\agent4-benny-gameplay\\
(project folders Assets/Rainbow/Benny/, Assets/Rainbow/Gameplay/, Assets/Rainbow/UI/).
- BENNY: reuse the existing approved model ${SRC}\\assets\\models\\benny31.glb (texture ${SRC}\\assets\\textures\\benny31\\bake.png; see
  src\\characters\\benny\\benny31.ts for how the game loads/orients/scales it and which parts exist; inspect the GLB JSON chunk with
  PowerShell for meshes, materials, skins and animation clips). Import with glTFast (copy into Assets/Rainbow/Benny/Models/). Keep his
  round pink fluffy body, purple-and-white striped knitted beanie with cuff, purple pompom and yellow star exactly. If the imported
  look is flat, add a cheap URP fluffy/velvet shader (Shaders/RainbowFluff.shader: soft wrap lighting + fresnel fuzz + fur noise) and
  apply it to the body/pompom materials keeping their textures. Provide a procedural fallback Benny (spheres + striped hat) only for the
  case where the GLB fails to import, so the scene still plays.
- MOVEMENT (port src\\game\\Game.ts, src\\characters\\benny\\runtime.ts, src\\gameplay\\input.ts): auto-swim forward along the course from
  RiverPath.StartS to RiverPath.FinishS (the Three.js speed - about 10 s for the section), smooth left/right steering clamped with
  RiverPath.ClampLateral, a jump with gravity and a landing splash, correct ride height on the water (runtime.ts), natural procedural
  swim animation (bob, roll, arm-nub paddling, lean into steering, squash/stretch on jump/land) and the SplashWake hook from the contract.
  Input: keyboard A/D or arrows to steer, Space/W/Up to jump; touch/mouse drag to steer, swipe up to jump; support both the new Input
  System and the legacy Input Manager (#if ENABLE_INPUT_SYSTEM).
- CAMERA (port src\\game\\cameraRig.ts and the benny-lab 'game05' view): portrait camera following Benny from behind, reproducing the
  approved framing at the start (Benny lower-middle, vanishing point upper-middle) and staying smooth while steering/jumping; URP
  post-processing enabled on it; tag MainCamera.
- COINS (port src\\gameplay\\coins.ts C05 layout): chunky gold coins with embossed $ (procedural cylinder + bevel, face texture from
  ${SRC}\\assets\\textures\\paint\\05_coin.png or emboss in shader) standing upright facing the camera along the S trail, slow spin/bob,
  collected when Benny touches them (distance check), sparkle pop, +10 each, Screen05Events.CoinCollected.
- HUD + FLOW (port src\\ui\\hud.ts look): portrait uGUI Canvas (Scale With Screen Size, 1080x1920, match 0.5): top glossy dark-purple
  pill with heart "5/5 +", coin "1,420" counter (counts up as coins are collected), round pause button (toggles pause), the gold-bordered
  purple title banner "05 • FLOW INTO THE CURRENT"; a short readable ending at FinishS ("Great swimming!", coins collected, Restart
  button) and restart. Use UnityEngine.UI.Text with Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf"); generate rounded sprites
  in code. Implement Rainbow.Screen05.Screen05Events exactly as in the contract.
Write: Scripts under Benny/Scripts, Gameplay/Scripts, UI/Scripts; shader(s) under Benny/Shaders; Gameplay/Editor/GameplayBuilder.cs
with public static GameObject Build(Transform parent) that creates Benny (PrefabUtility.InstantiatePrefab of the imported glb,
fallback procedural), the camera rig, coins, HUD, game flow and an EventSystem (InputSystemUIInputModule when ENABLE_INPUT_SYSTEM,
else StandaloneInputModule), idempotent. Water/foam/splash visuals belong to Agent 3, the tunnel to Agent 2.
USER'S REQUIRED UNITY TOOLS for your area (they replace the plain-transform versions above):
- SPLINES: build a SplineContainer "SwimRoute" from RiverPath.CorePoint (knots every ~2 u from RiverPath.TunnelStart to
  RiverPath.StageLength, TangentMode.AutoSmooth, y = WaterY). Benny's forward progress and the coin trail use the spline
  (EvaluatePosition / EvaluateTangent with normalized t from the distance); steering is a lateral offset clamped with
  RiverPath.ClampLateral.
- CINEMACHINE 3 (Unity.Cinemachine): Main Camera with CinemachineBrain; a CinemachineCamera following a camera-target child of Benny
  with CinemachineFollow (approved offset, world-space binding, smooth damping) and looking at a look-ahead target on the route
  (CinemachineRotationComposer or CinemachineHardLookAt), vertical FOV from the source. Reproduce the approved start framing; no
  clipping into Benny, the water or the walls while steering hard or jumping.
- ANIMATOR + C#: generate AnimationClips and an AnimatorController in the builder (UnityEditor.Animations): Swim (alternating left/right
  paw paddling, gentle bob and roll), steering lean (blend by a Steer parameter), Jump, Fall, Land (squash/stretch); parameters
  driven by BennyController. Inspect benny31.glb's node hierarchy first and animate the real arm/hat/pompom nodes (or wrapper
  transforms you add around them).
- Benny must look soft and plush (no sharp or spiky fur), keep his exact size and screen position, float with correct water contact
  (no hovering, no sinking), and drive SplashWake at the waterline.
- Implement SwimInputOverride and the BennyController API (Instance, S, LateralX, TeleportTo) exactly as in CONTRACT.md.
`

const RESULT = {
  type: 'object',
  properties: {
    files: { type: 'array', items: { type: 'string' }, description: 'absolute paths of every file written' },
    summary: { type: 'string' },
    integration_steps: { type: 'array', items: { type: 'string' } },
    contract_feedback: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } },
  },
  required: ['files', 'summary', 'integration_steps', 'contract_feedback', 'risks'],
}

const SPECS = [
  { key: 'agent1', label: 'Agent 1 - setup runbook + test tools', prompt: AGENT1 },
  { key: 'agent2', label: 'Agent 2 - 3D environment', prompt: AGENT2 },
  { key: 'agent3', label: 'Agent 3 - water, VFX, lighting', prompt: AGENT3 },
  { key: 'agent4', label: 'Agent 4 - Benny, gameplay, HUD', prompt: AGENT4 },
]

phase('Specialists')
log('Launching 4 specialists in parallel; each writes only to its own staging folder under C:\\RainbowUnity\\staging')
const results = await parallel(SPECS.map(s => () =>
  agent(COMMON + s.prompt, { label: s.label, phase: 'Specialists', schema: RESULT })
    .then(r => ({ key: s.key, label: s.label, result: r }))
))
log(`${results.filter(Boolean).filter(r => r.result).length}/4 specialists returned results`)
return results

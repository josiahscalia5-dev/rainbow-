using System.Collections.Generic;
using Unity.Cinemachine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using UnityEngine.SceneManagement;
using UnityEngine.Splines;
#if ENABLE_INPUT_SYSTEM
using UnityEngine.InputSystem.UI;
#endif

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>
    /// CONTRACT entry point 3 (called by Screen05SceneBuilder after EnvironmentBuilder and WaterBuilder):
    /// builds everything of Agent 4 under one "Gameplay" root and returns it:
    ///   SwimRoute (SplineContainer from RiverPath.CorePoint, knots every 2 u, AutoSmooth, y = WaterY),
    ///   Benny (benny31.glb -> skinned rig with generated bones / glTFast prefab / procedural fallback, Animator with the
    ///   generated AnimatorController, BennyController + BennyInput + Agent 3's SplashWake on the root),
    ///   Main Camera (tag MainCamera, URP post-processing ON, CinemachineBrain) + CinemachineCamera rig
    ///   (CinemachineFollow world-space + CinemachineHardLookAt, approved STAGE_CAM['05'] framing, vFOV 62),
    ///   the C05 gold coin trail (+ sparkle particles), the HUD canvas, Screen05GameFlow and an EventSystem.
    /// Idempotent: replaces its own "Gameplay" root and rewrites its own assets under Assets/Rainbow/{Benny,Gameplay,UI}.
    /// Never touches objects of other areas.
    /// </summary>
    public static class GameplayBuilder
    {
        public const string RootName = "Gameplay";
        public const string GameplayGenDir = "Assets/Rainbow/Gameplay/Generated";
        public const string GameplayMatDir = "Assets/Rainbow/Gameplay/Materials";
        public const string UiGenDir = "Assets/Rainbow/UI/Generated";
        public const string CoinShaderPath = "Assets/Rainbow/Gameplay/Shaders/RainbowCoin.shader";
        public const string SparkleShaderPath = "Assets/Rainbow/Gameplay/Shaders/RainbowSparkle.shader";

        public static GameObject Build(Transform parent)
        {
            RemoveExisting(parent);
            GameplayAssetUtil.EnsureFolder(GameplayGenDir);
            GameplayAssetUtil.EnsureFolder(GameplayMatDir);
            GameplayAssetUtil.EnsureFolder(UiGenDir);

            GameObject root = new GameObject(RootName);
            if (parent != null) root.transform.SetParent(parent, false);

            // 1. route spline
            SwimRoute route = BuildRoute(root.transform);

            // 2. Benny (mesh + bones + Animator controller) and his gameplay components
            BennyRigBuilder.Rig rig = BennyRigBuilder.Build(root.transform);
            float s0 = RiverPath.StartS;
            Vector3 p0, f0, r0;
            route.SampleAtS(s0, out p0, out f0, out r0);
            float x0 = RiverPath.ClampLateral(p0.x, BennyController.BodyRadius, 1.0f);
            rig.root.transform.SetPositionAndRotation(
                new Vector3(x0, RiverPath.WaterY + BennyController.RootRide, p0.z),
                Quaternion.LookRotation(f0, Vector3.up));

            BennyInput input = rig.root.AddComponent<BennyInput>();
            SplashWake wake = rig.root.AddComponent<SplashWake>();
            BennyController benny = rig.root.AddComponent<BennyController>();
            benny.route = route;
            benny.startS = s0;
            benny.visual = rig.visual;
            benny.animator = rig.animator;
            benny.pom = rig.pom;
            benny.input = input;
            benny.wake = wake;

            // 3. camera: Main Camera (Brain) + CinemachineCamera following a target child of Benny
            Screen05CameraRig camRig = BuildCamera(root.transform, rig.root.transform, s0, x0);
            benny.cameraRig = camRig;

            // 4. coins + sparkles
            CoinTrail coins = BuildCoins(root.transform, route);

            // 5. HUD, game flow, EventSystem
            Screen05Hud hud = Screen05Hud.Create(root.transform, HudSprites());
            GameObject flowGo = new GameObject("GameFlow");
            flowGo.transform.SetParent(root.transform, false);
            Screen05GameFlow flow = flowGo.AddComponent<Screen05GameFlow>();
            flow.benny = benny;
            flow.coins = coins;
            flow.hud = hud;
            flow.finishS = RiverPath.FinishS;
            BuildEventSystem(root.transform);

            AssetDatabase.SaveAssets();
            if (root.scene.IsValid()) EditorSceneManager.MarkSceneDirty(root.scene);
            Debug.Log("[Rainbow Agent4] GameplayBuilder: route " + route.Length.ToString("0.0") + " u, Benny from " + rig.source
                + ", " + coins.slots.Count + " coins, HUD + flow + camera rig built.");
            return root;
        }

        // ---- idempotency -------------------------------------------------------------------------------------------
        static void RemoveExisting(Transform parent)
        {
            if (parent != null)
            {
                for (int i = parent.childCount - 1; i >= 0; i--)
                {
                    Transform c = parent.GetChild(i);
                    if (c.name == RootName) Object.DestroyImmediate(c.gameObject);
                }
                return;
            }
            Scene scene = SceneManager.GetActiveScene();
            if (!scene.IsValid()) return;
            foreach (GameObject g in scene.GetRootGameObjects())
                if (g.name == RootName) Object.DestroyImmediate(g);
        }

        // ---- route ---------------------------------------------------------------------------------------------------
        static SwimRoute BuildRoute(Transform root)
        {
            GameObject go = new GameObject("SwimRoute");
            go.transform.SetParent(root, false);
            go.transform.localPosition = Vector3.zero;
            go.transform.localRotation = Quaternion.identity;
            SplineContainer container = go.AddComponent<SplineContainer>();
            SwimRoute.BuildKnots(container);
            SwimRoute route = go.AddComponent<SwimRoute>();
            route.EnsureReady();
            return route;
        }

        // ---- camera --------------------------------------------------------------------------------------------------
        static Screen05CameraRig BuildCamera(Transform root, Transform bennyRoot, float s0, float x0)
        {
            GameObject rigGo = new GameObject("CameraRig");
            rigGo.transform.SetParent(root, false);
            Screen05CameraRig camRig = rigGo.AddComponent<Screen05CameraRig>();

            Transform camTarget = GameplayAssetUtil.Child("CamTarget", bennyRoot, Vector3.zero).transform;
            Transform lookAhead = GameplayAssetUtil.Child("CamLookAhead", rigGo.transform, Vector3.zero).transform;

            GameObject vgo = new GameObject("CM RideCamera");
            vgo.transform.SetParent(rigGo.transform, false);
            CinemachineCamera vcam = vgo.AddComponent<CinemachineCamera>();
            vgo.AddComponent<CinemachineFollow>();
            vgo.AddComponent<CinemachineHardLookAt>();

            camRig.followTarget = camTarget;
            camRig.lookTarget = lookAhead;
            camRig.vcam = vcam;
            camRig.ConfigureCinemachine();
            camRig.Apply(s0, x0, 0f);

            Vector3 camPos = camTarget.position + new Vector3(0f, camRig.up, -camRig.back);
            Quaternion camRot = Quaternion.LookRotation(lookAhead.position - camPos, Vector3.up);
            vgo.transform.SetPositionAndRotation(camPos, camRot);

            // Main Camera (warn only if another area already made one: never touch it)
            foreach (Camera other in Object.FindObjectsByType<Camera>(FindObjectsSortMode.None))
                if (other.CompareTag("MainCamera"))
                    Debug.LogWarning("[Rainbow Agent4] another MainCamera exists (" + other.name + "); the gameplay camera is also tagged MainCamera.");

            GameObject camGo = new GameObject("Main Camera");
            camGo.tag = "MainCamera";
            camGo.transform.SetParent(root, false);
            camGo.transform.SetPositionAndRotation(camPos, camRot);
            Camera cam = camGo.AddComponent<Camera>();
            cam.fieldOfView = camRig.verticalFov;
            cam.nearClipPlane = camRig.nearClip;
            cam.farClipPlane = camRig.farClip;
            cam.clearFlags = CameraClearFlags.SolidColor;
            cam.backgroundColor = new Color(0.23f, 0.05f, 0.36f, 1f);
            cam.allowHDR = true;
            cam.depth = 0f;
            camGo.AddComponent<AudioListener>();

            UniversalAdditionalCameraData data = cam.GetUniversalAdditionalCameraData();
            data.renderPostProcessing = true;
            // bubbles and splash spray soften their edges against the scene depth (AgentScripts/screen05_camera_depth.cs)
            data.requiresDepthOption = CameraOverrideOption.On;
            data.antialiasing = AntialiasingMode.FastApproximateAntialiasing;
            data.stopNaN = false;
            data.dithering = true;

            CinemachineBrain brain = camGo.AddComponent<CinemachineBrain>();
            brain.UpdateMethod = CinemachineBrain.UpdateMethods.LateUpdate;
            brain.BlendUpdateMethod = CinemachineBrain.BrainUpdateMethods.LateUpdate;
            brain.DefaultBlend = new CinemachineBlendDefinition(CinemachineBlendDefinition.Styles.Cut, 0f);
            return camRig;
        }

        // ---- coins ---------------------------------------------------------------------------------------------------
        static CoinTrail BuildCoins(Transform root, SwimRoute route)
        {
            GameObject coinsGo = new GameObject("Coins");
            coinsGo.transform.SetParent(root, false);
            CoinTrail trail = coinsGo.AddComponent<CoinTrail>();
            trail.route = route;
            trail.slots = new List<CoinTrail.Slot>();

            Mesh mesh = CoinMesh();
            Material mat = CoinMaterial();
            List<Vector2> layout = new List<Vector2>();
            CoinTrail.ComputeLayout(layout);
            for (int i = 0; i < layout.Count; i++)
            {
                GameObject c = new GameObject("Coin_" + i.ToString("00"));
                c.transform.SetParent(coinsGo.transform, false);
                c.AddComponent<MeshFilter>().sharedMesh = mesh;
                MeshRenderer mr = c.AddComponent<MeshRenderer>();
                mr.sharedMaterial = mat;
                mr.shadowCastingMode = ShadowCastingMode.Off;
                mr.receiveShadows = false;
                mr.lightProbeUsage = LightProbeUsage.Off;
                mr.reflectionProbeUsage = ReflectionProbeUsage.BlendProbes;
                CoinTrail.Slot slot = new CoinTrail.Slot();
                slot.coin = c.transform;
                slot.s = layout[i].x;
                slot.lateral = layout[i].y;
                trail.slots.Add(slot);
            }
            trail.sparkles = BuildSparkles(coinsGo.transform);
            trail.PlaceInEditor();
            return trail;
        }

        /// <summary>coins.ts CylinderGeometry(0.5, 0.5, 0.2, 48) stood up: faces along +-Z (front face normal -Z toward
        /// the chase camera). Vertex colour R = 1 on the faces, 0 on the rim; face UVs upright (not mirrored from either
        /// side); rim UV.x = angle 0..1 (milled-edge stripes in the shader).</summary>
        static Mesh CoinMesh()
        {
            string path = GameplayGenDir + "/Coin05.asset";
            bool isNew;
            Mesh m = GameplayAssetUtil.LoadOrNewMesh(path, out isNew);
            const int seg = 48;
            const float r = 0.5f, h = 0.1f;
            List<Vector3> v = new List<Vector3>();
            List<Vector3> n = new List<Vector3>();
            List<Vector2> uv = new List<Vector2>();
            List<Color> col = new List<Color>();
            List<int> tri = new List<int>();
            Color face = Color.white, rim = new Color(0f, 0f, 0f, 1f);

            int f0 = v.Count; // front face (-Z)
            v.Add(new Vector3(0f, 0f, -h)); n.Add(Vector3.back); uv.Add(new Vector2(0.5f, 0.5f)); col.Add(face);
            for (int i = 0; i <= seg; i++)
            {
                float a = 2f * Mathf.PI * i / seg, x = Mathf.Cos(a) * r, y = Mathf.Sin(a) * r;
                v.Add(new Vector3(x, y, -h)); n.Add(Vector3.back); uv.Add(new Vector2(0.5f + x / (2f * r), 0.5f + y / (2f * r))); col.Add(face);
            }
            for (int i = 0; i < seg; i++) { tri.Add(f0); tri.Add(f0 + 2 + i); tri.Add(f0 + 1 + i); }

            int b0 = v.Count; // back face (+Z)
            v.Add(new Vector3(0f, 0f, h)); n.Add(Vector3.forward); uv.Add(new Vector2(0.5f, 0.5f)); col.Add(face);
            for (int i = 0; i <= seg; i++)
            {
                float a = 2f * Mathf.PI * i / seg, x = Mathf.Cos(a) * r, y = Mathf.Sin(a) * r;
                v.Add(new Vector3(x, y, h)); n.Add(Vector3.forward); uv.Add(new Vector2(0.5f - x / (2f * r), 0.5f + y / (2f * r))); col.Add(face);
            }
            for (int i = 0; i < seg; i++) { tri.Add(b0); tri.Add(b0 + 1 + i); tri.Add(b0 + 2 + i); }

            int e0 = v.Count; // rim
            for (int i = 0; i <= seg; i++)
            {
                float a = 2f * Mathf.PI * i / seg;
                Vector3 d = new Vector3(Mathf.Cos(a), Mathf.Sin(a), 0f);
                v.Add(d * r + new Vector3(0f, 0f, -h)); n.Add(d); uv.Add(new Vector2(i / (float)seg, 0f)); col.Add(rim);
                v.Add(d * r + new Vector3(0f, 0f, h)); n.Add(d); uv.Add(new Vector2(i / (float)seg, 1f)); col.Add(rim);
            }
            for (int i = 0; i < seg; i++)
            {
                int a = e0 + 2 * i, b = a + 1, c = a + 2, d = a + 3;
                tri.Add(a); tri.Add(c); tri.Add(d);
                tri.Add(a); tri.Add(d); tri.Add(b);
            }

            m.SetVertices(v);
            m.SetNormals(n);
            m.SetUVs(0, uv);
            m.SetColors(col);
            m.SetTriangles(tri, 0);
            m.RecalculateBounds();
            GameplayAssetUtil.FinishMesh(m, path, isNew);
            return m;
        }

        static Material CoinMaterial()
        {
            Texture2D faceTex = UISpriteFactory.CoinFace("Coin05_Face", 256);
            Texture2D face = GameplayAssetUtil.SavePng(faceTex, GameplayGenDir + "/Coin05_Face.png", false, true);
            Object.DestroyImmediate(faceTex);
            Shader sh = GameplayAssetUtil.FindShader(CoinShaderPath, "Rainbow/Gameplay/Coin");
            Material m = GameplayAssetUtil.LoadOrCreateMaterial(GameplayMatDir + "/Coin05.mat", sh);
            if (m.HasProperty("_FaceMap")) m.SetTexture("_FaceMap", face);
            if (m.HasProperty("_BaseMap")) m.SetTexture("_BaseMap", face);   // URP Unlit fallback
            if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", Color.white);
            EditorUtility.SetDirty(m);
            return m;
        }

        static ParticleSystem BuildSparkles(Transform parent)
        {
            Texture2D sparkTex = UISpriteFactory.Sparkle("Coin05_Sparkle", 64);
            Texture2D spark = GameplayAssetUtil.SavePng(sparkTex, GameplayGenDir + "/Coin05_Sparkle.png", false, true);
            Object.DestroyImmediate(sparkTex);
            Shader sh = GameplayAssetUtil.FindShader(SparkleShaderPath, "Rainbow/Gameplay/Sparkle");
            Material mat = GameplayAssetUtil.LoadOrCreateMaterial(GameplayMatDir + "/Coin05_Sparkle.mat", sh);
            if (mat.HasProperty("_MainTex")) mat.SetTexture("_MainTex", spark);
            if (mat.HasProperty("_BaseMap")) mat.SetTexture("_BaseMap", spark);
            EditorUtility.SetDirty(mat);

            GameObject go = new GameObject("CoinSparkles");
            go.transform.SetParent(parent, false);
            ParticleSystem ps = go.AddComponent<ParticleSystem>();
            ps.Stop(true, ParticleSystemStopBehavior.StopEmittingAndClear);
            ParticleSystem.MainModule main = ps.main;
            main.duration = 1f;
            main.loop = true;
            main.playOnAwake = true;
            main.startLifetime = 0.5f;
            main.startSpeed = 0f;
            main.startSize = 0.2f;
            main.startColor = new Color(1f, 0.9f, 0.5f, 1f);
            main.gravityModifier = 0.5f;
            main.simulationSpace = ParticleSystemSimulationSpace.World;
            main.scalingMode = ParticleSystemScalingMode.Hierarchy;
            main.maxParticles = 160;
            ParticleSystem.EmissionModule em = ps.emission;
            em.enabled = true;
            em.rateOverTime = 0f;
            ParticleSystem.ShapeModule shape = ps.shape;
            shape.enabled = false;
            ParticleSystem.SizeOverLifetimeModule sol = ps.sizeOverLifetime;
            sol.enabled = true;
            sol.size = new ParticleSystem.MinMaxCurve(1f, new AnimationCurve(new Keyframe(0f, 0.6f), new Keyframe(0.25f, 1f), new Keyframe(1f, 0f)));
            ParticleSystem.ColorOverLifetimeModule colm = ps.colorOverLifetime;
            colm.enabled = true;
            Gradient g = new Gradient();
            g.SetKeys(
                new[] { new GradientColorKey(Color.white, 0f), new GradientColorKey(Color.white, 1f) },
                new[] { new GradientAlphaKey(1f, 0f), new GradientAlphaKey(1f, 0.6f), new GradientAlphaKey(0f, 1f) });
            colm.color = new ParticleSystem.MinMaxGradient(g);
            ParticleSystemRenderer pr = go.GetComponent<ParticleSystemRenderer>();
            pr.renderMode = ParticleSystemRenderMode.Billboard;
            pr.sharedMaterial = mat;
            pr.shadowCastingMode = ShadowCastingMode.Off;
            pr.receiveShadows = false;
            return ps;
        }

        // ---- HUD sprites (saved as PNG sprite assets so the scene keeps real references) -----------------------------
        static Screen05Hud.Sprites HudSprites()
        {
            Screen05Hud.Sprites s = new Screen05Hud.Sprites();
            s.bar = SaveSprite(Screen05Hud.BarTexture(), "Hud_Bar.png");
            s.banner = SaveSprite(Screen05Hud.BannerTexture(), "Hud_Banner.png");
            s.heart = SaveSprite(UISpriteFactory.Heart("Hud_Heart", 128), "Hud_Heart.png");
            s.coin = SaveSprite(UISpriteFactory.CoinFace("Hud_Coin", 128), "Hud_Coin.png");
            s.pause = SaveSprite(UISpriteFactory.PauseButton("Hud_Pause", 128), "Hud_Pause.png");
            s.panel = SaveSprite(Screen05Hud.PanelTexture(), "Hud_Panel.png");
            s.button = SaveSprite(Screen05Hud.ButtonTexture(), "Hud_Button.png");
            s.white = SaveSprite(UISpriteFactory.Solid("Hud_White", 8, Color.white), "Hud_White.png");
            return s;
        }

        static Sprite SaveSprite(Texture2D tex, string file)
        {
            string path = UiGenDir + "/" + file;
            GameplayAssetUtil.SavePng(tex, path, true, false);
            Object.DestroyImmediate(tex);
            Sprite sp = GameplayAssetUtil.LoadSprite(path);
            if (sp == null) Debug.LogWarning("[Rainbow Agent4] sprite not imported: " + path + " (the HUD generates it at runtime).");
            return sp;
        }

        // ---- EventSystem ---------------------------------------------------------------------------------------------
        static void BuildEventSystem(Transform root)
        {
            EventSystem existing = Object.FindAnyObjectByType<EventSystem>();
            if (existing != null) return;
            GameObject go = new GameObject("EventSystem");
            go.transform.SetParent(root, false);
            go.AddComponent<EventSystem>();
#if ENABLE_INPUT_SYSTEM
            go.AddComponent<InputSystemUIInputModule>(); // assigns its default UI actions on enable
#else
            go.AddComponent<StandaloneInputModule>();
#endif
        }
    }
}

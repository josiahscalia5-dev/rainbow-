using System.Collections.Generic;
using System.Globalization;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>
    /// Agent 2 (environment) builder for Screen 05 "Flow into the Current": purple perforated washer-drum tunnel walls,
    /// chunky rounded gold ring bands, copper-gold tray paddles on the upper side walls, the far white-gold throat (+ the
    /// far river chord inside it) and the near gold frame held in front of the rider camera.
    /// Creates/overwrites its materials (.mat) and meshes (.asset) under Assets/Rainbow/Environment/ (GUIDs are kept on a
    /// rebuild) and replaces its own scene objects (root "Environment05" with an Environment05Root marker). Idempotent.
    /// Never touches water, lights, post-processing, Benny, camera, coins or HUD.
    /// </summary>
    public static class EnvironmentBuilder
    {
        public const string RootName = "Environment05";
        const string Dir = "Assets/Rainbow/Environment";
        const string MatDir = Dir + "/Materials";
        const string MeshDir = Dir + "/Meshes";
        const string TexDir = Dir + "/Textures";
        const string PanoPath = TexDir + "/marble05_env_1024.jpg";

        [MenuItem("Rainbow/Build/Environment 05 (tunnel, rings, paddles, throat, frame)")]
        static void BuildFromMenu()
        {
            GameObject go = Build(null);
            Selection.activeGameObject = go;
        }

        /// <summary>Builds (or rebuilds) the Screen 05 environment under <paramref name="parent"/> (may be null).</summary>
        public static GameObject Build(Transform parent)
        {
            EnsureFolder("Assets", "Rainbow");
            EnsureFolder("Assets/Rainbow", "Environment");
            EnsureFolder(Dir, "Materials");
            EnsureFolder(Dir, "Meshes");
            EnsureFolder(Dir, "Textures");

            RemoveExisting(parent);

            Texture2D pano = ImportPano();

            // ---------------- materials ----------------
            Material wallMat = MakeMaterial("DrumWall05", "Rainbow/Screen05/DrumWall");
            SetupWall(wallMat, pano);
            Material ringNearMat = MakeMaterial("Ring05_Near", "Rainbow/Screen05/GoldMetal");
            SetupGold(ringNearMat, pano, 0);
            SetVec(ringNearMat, "_BandG", DrumLayout05.NearBand.ShaderBandG);
            Material ringFarMat = MakeMaterial("Ring05_Far", "Rainbow/Screen05/GoldMetal");
            SetupGold(ringFarMat, pano, 0);
            SetVec(ringFarMat, "_BandG", DrumLayout05.FarBand.ShaderBandG);
            Material paddleMat = MakeMaterial("Paddle05", "Rainbow/Screen05/GoldMetal");
            SetupGold(paddleMat, pano, 1);
            Material frameMat = MakeMaterial("NearFrame05", "Rainbow/Screen05/GoldMetal");
            SetupGold(frameMat, pano, 2);
            Material throatMat = MakeMaterial("Throat05", "Rainbow/Screen05/ThroatGlow");
            SetFloat(throatMat, "_ThroatIntensity", 1f);
            // light round 2026-11-23: no light rays (they bloomed into a white starburst; the approved vanishing point is a
            // soft warm glow inside the last rings), gradient radius 1:1 with the cap (RainbowThroatGlow.hlsl palette)
            SetVec(throatMat, "_ThroatParams", new Vector4(0f, 9f, 0.15f, 1f));
            Material farRiverMat = MakeMaterial("FarRiver05", "Rainbow/Screen05/FarRiver");
            // centred on the course line x = 0 like the playable river it continues; reaches both walls of the drum, whose
            // axis sits AxisX off that line (frame round 2026-11-23)
            float riverHalf = DrumLayout05.WaterChord(DrumLayout05.FarRiverStart) + Mathf.Abs(DrumLayout05.AxisX) + 0.05f;
            SetupFarRiver(farRiverMat, pano, riverHalf);

            // ---------------- meshes ----------------
            const int radial = 128;
            const float nearUntil = 52f;   // the near-floor blend ends at EyeS + 38 = 45.6
            var wallMeshes = new List<Mesh>
            {
                SaveMesh(DrumMeshes05.BuildWall(DrumLayout05.TunnelStart, 20f, radial, 1f, 6f, nearUntil, "DrumWall05_A"), "DrumWall05_A"),
                SaveMesh(DrumMeshes05.BuildWall(20f, 52f, radial, 1f, 6f, nearUntil, "DrumWall05_B"), "DrumWall05_B"),
                SaveMesh(DrumMeshes05.BuildWall(52f, 120f, radial, 1f, 6f, nearUntil, "DrumWall05_C"), "DrumWall05_C"),
                SaveMesh(DrumMeshes05.BuildWall(120f, DrumLayout05.ThroatS, radial, 1f, 6f, nearUntil, "DrumWall05_D"), "DrumWall05_D"),
            };
            float ringRadius = DrumLayout05.Radius - DrumLayout05.RingInset;
            Mesh ringNear = SaveMesh(DrumMeshes05.BuildRing(DrumLayout05.NearBand, ringRadius, 96, "Ring05_Near"), "Ring05_Near");
            Mesh ringFar = SaveMesh(DrumMeshes05.BuildRing(DrumLayout05.FarBand, ringRadius, 72, "Ring05_Far"), "Ring05_Far");
            float paddleSize = DrumLayout05.PaddleScaledSize;
            Mesh paddle = SaveMesh(DrumMeshes05.BuildPaddleTray(paddleSize, DrumLayout05.PaddleThickness, DrumLayout05.PaddleStretch, 28, "Paddle05_Tray"), "Paddle05_Tray");
            Mesh frameL = SaveMesh(DrumMeshes05.BuildFrameCornerLeft(), "NearFrame05_CornerL");
            Mesh frameR = SaveMesh(DrumMeshes05.BuildFrameCornerRight(), "NearFrame05_CornerR");
            Mesh frameLip = SaveMesh(DrumMeshes05.BuildFrameLip(), "NearFrame05_Lip");
            Mesh cap = SaveMesh(DrumMeshes05.BuildThroatCap(DrumLayout05.Radius + 0.15f, 64, "Throat05_Cap"), "Throat05_Cap");
            Mesh farRiver = SaveMesh(DrumMeshes05.BuildFarRiver(DrumLayout05.FarRiverStart - 1f, DrumLayout05.ThroatS - 0.05f, riverHalf,
                RiverPath.WaterY - 0.015f, 2.5f, 12, "FarRiver05"), "FarRiver05");

            // ---------------- scene objects ----------------
            var root = new GameObject(RootName);
            if (parent != null) root.transform.SetParent(parent, false);
            Undo.RegisterCreatedObjectUndo(root, "Build Environment 05");
            var marker = root.AddComponent<Environment05Root>();

            Transform walls = Child(root.transform, "DrumWall");
            string[] wallNames = { "Wall_A_start", "Wall_B_nearFloor", "Wall_C_mid", "Wall_D_far" };
            for (int i = 0; i < wallMeshes.Count; i++) MakeRenderer(walls, wallNames[i], wallMeshes[i], wallMat);

            Transform rings = Child(root.transform, "Rings");
            List<float> ringS = DrumLayout05.RingPositions();
            foreach (float s in ringS)
            {
                bool far = s > DrumLayout05.FarBandFromS;
                GameObject r = MakeRenderer(rings, "Ring_" + F(s), far ? ringFar : ringNear, far ? ringFarMat : ringNearMat);
                r.transform.localPosition = DrumLayout05.Centre(s);
            }

            Transform paddles = Child(root.transform, "Paddles");
            List<float> padS = DrumLayout05.PaddlePositions();
            List<DrumLayout05.PaddleSlot> padSlots = DrumLayout05.PaddleSlots();
            foreach (DrumLayout05.PaddleSlot ps in padSlots)
            {
                // frame round 2026-11-23: each tray on its approved place (side and mount height per paddle)
                DrumLayout05.PaddlePose(ps.s, ps.side, out Vector3 p, out Quaternion q, ps.mountY);
                GameObject pd = MakeRenderer(paddles, (ps.side < 0 ? "Paddle_L_" : "Paddle_R_") + F(ps.s), paddle, paddleMat);
                pd.transform.localPosition = p;
                pd.transform.localRotation = q;
            }

            Transform throat = Child(root.transform, "FarThroat");
            GameObject capGo = MakeRenderer(throat, "ThroatCap", cap, throatMat);
            capGo.transform.localPosition = DrumLayout05.Centre(DrumLayout05.ThroatS - 0.05f);
            MakeRenderer(throat, "FarRiver", farRiver, farRiverMat);

            var frameGo = new GameObject("NearFrame05");
            frameGo.transform.SetParent(root.transform, false);
            var nf = frameGo.AddComponent<NearFrame05>();
            nf.leftCorner = MakeRenderer(frameGo.transform, "CornerLeft", frameL, frameMat).transform;
            nf.rightCorner = MakeRenderer(frameGo.transform, "CornerRight", frameR, frameMat).transform;
            nf.bottomLip = MakeRenderer(frameGo.transform, "BottomLip", frameLip, frameMat).transform;
            PlaceFrameForPreview(nf);

            marker.radius = DrumLayout05.Radius;
            marker.floorDepth = DrumLayout05.FloorDepth;
            marker.throatS = DrumLayout05.ThroatS;
            marker.ringS = ringS.ToArray();
            marker.paddleS = padS.ToArray();

            AssetDatabase.SaveAssets();
            if (root.scene.IsValid()) EditorSceneManager.MarkSceneDirty(root.scene);
            Debug.Log("[Rainbow] Environment05 built: " + ringS.Count + " rings, " + padSlots.Count + " paddles, throat at s=" + F(DrumLayout05.ThroatS));
            return root;
        }

        // ------------------------------------------------------------------ materials
        static void SetupWall(Material m, Texture2D pano)
        {
            // Coordinator look tuning 2026-11-23 (AgentScripts/screen05_tune_look.cs, compared against the approved image):
            // a touch more violet, softer pink streaks, more mid tint, and dense small slots elongated along the tunnel.
            // These exact values were saved in DrumWall05.mat (commit a78f508); keep them here so a rebuild keeps the look.
            SetCol(m, "_BaseColor", new Color(0.80f, 0.60f, 0.98f, 1f));         // was #dc9ef0
            SetHex(m, "_HoleColor", "#0c0014");
            SetHex(m, "_EmissionColor", "#3c0848");
            SetFloat(m, "_EmissionStrength", 0.16f);
            SetFloat(m, "_Metallic", 0.92f);
            SetFloat(m, "_Roughness", 0.07f);
            SetTex(m, "_EnvPano", pano);
            SetFloat(m, "_EnvIntensity", 0.9f);
            SetFloat(m, "_EnvBlur", 0.6f);
            SetCol(m, "_StripColor", new Color(1f, 0.70f, 0.97f, 1f));           // was #ffd9f6
            SetFloat(m, "_StripIntensity", 2.8f);                                // was 4.4
            SetVec(m, "_StripParams", new Vector4(28f, 0.017f, 0f, 0.8f));
            SetHex(m, "_MidTint", "#8a30d2");
            // was 0.45 mid-tint mix; w = violet self-glow of the deep walls (light round 2026-11-23, RainbowDrumWall.hlsl)
            SetVec(m, "_MidRange", new Vector4(8f, 50f, 0.6f, 0.9f));
            SetGlow(m);
            // slots: arc pitch 0.50 m, row pitch 0.70 m (was 2*PI*R/64 = 0.746 and Bay/10 = 1.4), half sizes 0.19 x 0.08 m,
            // mean coverage 0.158 (= stadium area / cell area), lip glow 1.0 (was 0.5). DrumLayout05 constants stay as they
            // are because the ring placement (RingSlots / SlotRowOffset) depends on them.
            // Tunnel round 2026-11-23 (measured on the approved image with the gameplay camera at s = 14): the holes form
            // NEAT CONCENTRIC brick ROWS, ~44 round the drum (arc pitch ~0.97 m, hole ~0.52 m along the arc), the row pitch
            // growing with the depth (~1.5 m on the near left wall, ~2.4 m between rings A / B, ~3.4 m between B / C), hole
            // ~0.36 of the row pitch along the tube. The old metric 0.70 m rows were 4 px apart at ring A and melted into
            // the mean coverage, so only the lengthwise strip reflections showed (radial spokes).
            // _SlotWarp = (s0 = approved eye, pitch at s0, growth per m, hole half length along the tube / pitch).
            SetVec(m, "_SlotPitch", new Vector4(2f * Mathf.PI * DrumLayout05.Radius / 44f, 0.70f, 0f, 0.5f));
            SetVec(m, "_SlotSize", new Vector4(0.26f, 0.08f, 0.16f, 1.0f));
            SetVec(m, "_SlotWarp", new Vector4(DrumLayout05.EyeS, 0.8f, 0.033f, 0.18f));
            // magenta land glow (linear rgb, strength): the approved lands are bright magenta-pink, only the holes dark
            SetVec(m, "_WallGlow", new Vector4(0.55f, 0.06f, 0.42f, 0.6f));
            SetHex(m, "_RimColor", "#ff8ceb");
            SetVec(m, "_FloorSheet", new Vector4(RiverPath.WaterY + 0.06f, 0.35f, 5.4f, 1f));
            SetHex(m, "_FloorColorA", "#c81f9c");
            SetHex(m, "_FloorColorB", "#ff4fc0");
            SetFloat(m, "_Exposure", 1f);
            SetFloat(m, "_LightInfluence", 1f);
            // light round 2026-11-23: strips / reflection fade with view distance (strips 8 %, panorama 50 % beyond 80 m)
            // so the deep walls stay violet instead of pink-white radial spokes converging on the throat
            SetVec(m, "_WallFar", new Vector4(25f, 80f, 0.08f, 0.5f));
            EditorUtility.SetDirty(m);
        }

        /// <summary>mode 0 = ring band, 1 = paddle, 2 = near frame.</summary>
        static void SetupGold(Material m, Texture2D pano, int mode)
        {
            string[] kw = { "_GOLD_RING", "_GOLD_PADDLE", "_GOLD_FRAME" };
            for (int i = 0; i < kw.Length; i++)
            {
                if (i == mode) m.EnableKeyword(kw[i]);
                else m.DisableKeyword(kw[i]);
            }
            SetFloat(m, "_Gold", mode);
            SetFloat(m, "_GoldMode", mode);
            // light round 2026-11-23: smaller, softer marquee spots on the band crown (were 0.055 / 1.6 across the whole
            // band: clipped white bars)
            SetVec(m, "_BandS", new Vector4(20f, 0.045f, 1.0f, 0f));
            // tone curve after environment.ts TONE05 [1.35, 1.75, 1.3] (test G1, measured: approved ring gold G/R 0.48,
            // plain palette 0.64); blue exponent raised to 1.5 here because TONE05 left the rings rose-pink in this grade.
            // Rings AND paddles (the paddles read as brown wood without it); the near frame a milder curve (it was pale
            // yellow-cream G/R 0.67-0.95 where the approved corners are orange G/R ~0.5 with thin white-yellow lines).
            SetVec(m, "_GoldTone", mode == 2 ? new Vector4(1.15f, 1.3f, 1.3f, 1f) : new Vector4(1.3f, 1.6f, 1.5f, 1f));
            SetVec(m, "_BandF", new Vector4(44f, 110f, 0f, 0f));
            SetVec(m, "_PaddleParams", new Vector4(0.55f, 0.12f, 1f, 0f));
            SetVec(m, "_FrameParams", new Vector4(0.3f, 0.06f, 0f, 0f));
            SetTex(m, "_EnvPano", pano);
            // Coordinator look tuning 2026-11-23 (screen05_tune_look.cs, saved in commit a78f508): less white reflection
            // so the orange gold palette shows. Rings + frame: env 0.5 / strips 1.4 (was 1.15 / 3.2); paddles: env 0.7 /
            // strips 1.2 (was 1.35 / 2.4); exposure 0.82 for all (was 1).
            SetFloat(m, "_EnvIntensity", mode == 1 ? 0.55f : 0.5f);
            // paddles: blurrier reflection (light round: the sharp panorama ring lights on the curved rim read as wood grain)
            SetFloat(m, "_EnvBlur", mode == 1 ? 3f : 1f);
            SetHex(m, "_StripColor", "#fff0c8");
            SetFloat(m, "_StripIntensity", mode == 1 ? 1.2f : 1.4f);
            SetVec(m, "_StripParams", new Vector4(28f, 0.022f, 0f, 0.65f));
            SetHex(m, "_MidTint", "#8a30d2");
            SetVec(m, "_MidRange", new Vector4(8f, 50f, 0f, 0f));
            SetGlow(m);
            // 0.95 for rings, paddles and frame (light round: the tone curve above darkens the mid-tones, this keeps the
            // approved brightness)
            SetFloat(m, "_Exposure", 0.95f);
            SetFloat(m, "_LightInfluence", mode == 2 ? 0f : 0.25f);
            EditorUtility.SetDirty(m);
        }

        static void SetupFarRiver(Material m, Texture2D pano, float halfWidth)
        {
            // linear colours from src/vfx/waterRibbon.ts RIVER05_PAL (cyan / cyanBright, pink, foam white)
            SetVec(m, "_RiverCore", new Vector4(0.08f, 0.6f, 1.3f, 1f));
            SetVec(m, "_RiverBand", new Vector4(0.75f, 0.1f, 0.66f, 1f));
            SetVec(m, "_RiverFoam", new Vector4(0.95f, 0.92f, 1.0f, 1f));
            SetVec(m, "_RiverParams", new Vector4(halfWidth, 11f, 0.55f, 0.11f));
            SetTex(m, "_EnvPano", pano);
            SetFloat(m, "_EnvIntensity", 0.6f);
            SetFloat(m, "_EnvBlur", 1.5f);
            SetGlow(m);
            SetFloat(m, "_Exposure", 1f);
            EditorUtility.SetDirty(m);
        }

        /// <summary>
        /// Warm throat glow by view distance: materials.ts glowT05 '#ff9c5a', near 95 / far 330 / strength 1.5 in the far
        /// block's VIRTUAL depth. Light round 2026-11-23: the real rings here sit at those virtual depths (DrumLayout05
        /// FarRingDepths) and the throat at ~283 m, so the original numbers apply 1:1 (the compressed 80 / 260 / 1.6 turned
        /// the walls orange from ~150 m, where the approved walls are still pink-violet).
        /// </summary>
        static void SetGlow(Material m)
        {
            SetHex(m, "_FarGlowColor", "#ff9c5a");
            // tunnel round 2026-11-23: with real rings at s 230 / 333 / 450 (frame round) the 95..330 m range painted every
            // wall beyond ~250 m pink-white (r 26-46 px round the vanishing point: (254, 150, 160)); the approved keeps
            // rose-purple walls between golden rings down to r ~34 px (D ~270 m) and is glow-orange only inside r ~32
            SetVec(m, "_FarGlowRange", new Vector4(200f, 420f, 1.2f, 0f));
        }

        static Material MakeMaterial(string name, string shaderName)
        {
            string path = MatDir + "/" + name + ".mat";
            Shader sh = Shader.Find(shaderName);
            if (sh == null)
            {
                Debug.LogWarning("[Rainbow] Shader '" + shaderName + "' not found (compile error?). Using URP Unlit for " + name + ".");
                sh = Shader.Find("Universal Render Pipeline/Unlit");
            }
            Material mat = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (mat == null)
            {
                mat = new Material(sh) { name = name };
                AssetDatabase.CreateAsset(mat, path);
            }
            else if (mat.shader != sh)
            {
                mat.shader = sh;
            }
            return mat;
        }

        static void SetHex(Material m, string prop, string hex)
        {
            if (!m.HasProperty(prop)) return;
            if (ColorUtility.TryParseHtmlString(hex, out Color c)) m.SetColor(prop, c);   // sRGB -> linear by Unity
        }

        static void SetCol(Material m, string prop, Color c)
        {
            if (m.HasProperty(prop)) m.SetColor(prop, c);   // same storage as SetHex (sRGB values, Unity linearises)
        }

        static void SetFloat(Material m, string prop, float v)
        {
            if (m.HasProperty(prop)) m.SetFloat(prop, v);
        }

        static void SetVec(Material m, string prop, Vector4 v)
        {
            if (m.HasProperty(prop)) m.SetVector(prop, v);
        }

        static void SetTex(Material m, string prop, Texture t)
        {
            if (t != null && m.HasProperty(prop)) m.SetTexture(prop, t);
        }

        // ------------------------------------------------------------------ assets
        static Texture2D ImportPano()
        {
            var ti = AssetImporter.GetAtPath(PanoPath) as TextureImporter;
            if (ti == null)
            {
                Debug.LogWarning("[Rainbow] " + PanoPath + " missing: copy it from the staging folder. Reflections fall back to grey.");
                return null;
            }
            bool changed = false;
            if (ti.textureType != TextureImporterType.Default) { ti.textureType = TextureImporterType.Default; changed = true; }
            if (ti.wrapModeU != TextureWrapMode.Repeat) { ti.wrapModeU = TextureWrapMode.Repeat; changed = true; }
            if (ti.wrapModeV != TextureWrapMode.Clamp) { ti.wrapModeV = TextureWrapMode.Clamp; changed = true; }
            if (!ti.mipmapEnabled) { ti.mipmapEnabled = true; changed = true; }
            if (!ti.sRGBTexture) { ti.sRGBTexture = true; changed = true; }
            if (ti.filterMode != FilterMode.Trilinear) { ti.filterMode = FilterMode.Trilinear; changed = true; }
            if (ti.maxTextureSize != 1024) { ti.maxTextureSize = 1024; changed = true; }
            if (ti.textureCompression != TextureImporterCompression.CompressedHQ) { ti.textureCompression = TextureImporterCompression.CompressedHQ; changed = true; }
            if (changed) ti.SaveAndReimport();
            return AssetDatabase.LoadAssetAtPath<Texture2D>(PanoPath);
        }

        static Mesh SaveMesh(Mesh m, string fileName)
        {
            string path = MeshDir + "/" + fileName + ".asset";
            Mesh existing = AssetDatabase.LoadAssetAtPath<Mesh>(path);
            if (existing != null)
            {
                existing.Clear();
                EditorUtility.CopySerialized(m, existing);
                existing.name = fileName;
                Object.DestroyImmediate(m);
                EditorUtility.SetDirty(existing);
                return existing;
            }
            m.name = fileName;
            AssetDatabase.CreateAsset(m, path);
            return m;
        }

        static void EnsureFolder(string parentFolder, string name)
        {
            if (!AssetDatabase.IsValidFolder(parentFolder + "/" + name)) AssetDatabase.CreateFolder(parentFolder, name);
        }

        // ------------------------------------------------------------------ scene
        static void RemoveExisting(Transform parent)
        {
            foreach (Environment05Root r in Object.FindObjectsByType<Environment05Root>(FindObjectsInactive.Include, FindObjectsSortMode.None))
            {
                if (r != null) Object.DestroyImmediate(r.gameObject);
            }
            if (parent != null)
            {
                Transform t = parent.Find(RootName);
                if (t != null) Object.DestroyImmediate(t.gameObject);
            }
        }

        static Transform Child(Transform parent, string name)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            return go.transform;
        }

        static GameObject MakeRenderer(Transform parent, string name, Mesh mesh, Material mat)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            go.AddComponent<MeshFilter>().sharedMesh = mesh;
            var mr = go.AddComponent<MeshRenderer>();
            mr.sharedMaterial = mat;
            mr.shadowCastingMode = ShadowCastingMode.Off;    // closed tube: never shadow the scene's key light
            mr.receiveShadows = false;
            mr.reflectionProbeUsage = ReflectionProbeUsage.Off; // the shaders sample their own Marble 05 panorama
            mr.allowOcclusionWhenDynamic = true;
            return go;
        }

        /// <summary>Edit-mode preview pose: in front of the approved checkpoint camera (cameraRig.ts '05').</summary>
        static void PlaceFrameForPreview(NearFrame05 nf)
        {
            // Screen05CameraRig (frame round 2026-11-23): up 3.40, back 6.52, pitch 12.78 deg down, yaw 2.78 deg left, vFOV 62
            Vector3 camPos = new Vector3(0f, RiverPath.WaterY + 3.40f, DrumLayout05.EyeS);
            Quaternion camRot = Quaternion.Euler(12.78f, -2.78f, 0f);
            float px = nf.depth * Mathf.Tan(31f * Mathf.Deg2Rad) / 768f;
            nf.transform.SetPositionAndRotation(camPos + camRot * new Vector3(0f, 0f, nf.depth), camRot);
            nf.transform.localScale = Vector3.one * px;
        }

        static string F(float v) => v.ToString("0.0", CultureInfo.InvariantCulture);
    }
}

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
            SetVec(throatMat, "_ThroatParams", new Vector4(0.25f, 9f, 0.15f, 0.8f));
            Material farRiverMat = MakeMaterial("FarRiver05", "Rainbow/Screen05/FarRiver");
            float riverHalf = DrumLayout05.WaterChord(DrumLayout05.FarRiverStart) + 0.05f;
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
            float paddleSize = DrumLayout05.PaddleSize * Mathf.Min(1.4f, DrumLayout05.Radius / 7.6f);
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
            foreach (float s in padS)
            {
                for (int side = -1; side <= 1; side += 2)
                {
                    DrumLayout05.PaddlePose(s, side, out Vector3 p, out Quaternion q);
                    GameObject pd = MakeRenderer(paddles, (side < 0 ? "Paddle_L_" : "Paddle_R_") + F(s), paddle, paddleMat);
                    pd.transform.localPosition = p;
                    pd.transform.localRotation = q;
                }
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
            Debug.Log("[Rainbow] Environment05 built: " + ringS.Count + " rings, " + (padS.Count * 2) + " paddles, throat at s=" + F(DrumLayout05.ThroatS));
            return root;
        }

        // ------------------------------------------------------------------ materials
        static void SetupWall(Material m, Texture2D pano)
        {
            SetHex(m, "_BaseColor", "#dc9ef0");
            SetHex(m, "_HoleColor", "#0c0014");
            SetHex(m, "_EmissionColor", "#3c0848");
            SetFloat(m, "_EmissionStrength", 0.16f);
            SetFloat(m, "_Metallic", 0.92f);
            SetFloat(m, "_Roughness", 0.07f);
            SetTex(m, "_EnvPano", pano);
            SetFloat(m, "_EnvIntensity", 0.9f);
            SetFloat(m, "_EnvBlur", 0.6f);
            SetHex(m, "_StripColor", "#ffd9f6");
            SetFloat(m, "_StripIntensity", 4.4f);
            SetVec(m, "_StripParams", new Vector4(28f, 0.017f, 0f, 0.8f));
            SetHex(m, "_MidTint", "#8a30d2");
            SetVec(m, "_MidRange", new Vector4(8f, 50f, 0.45f, 0f));
            SetGlow(m);
            SetVec(m, "_SlotPitch", new Vector4(DrumLayout05.SlotArcPitch, DrumLayout05.SlotRowPitch, DrumLayout05.SlotRowOffset(), 0f));
            SetVec(m, "_SlotSize", new Vector4(DrumLayout05.SlotHalfLength, DrumLayout05.SlotHalfWidth, DrumLayout05.SlotCoverage(), 0.5f));
            SetHex(m, "_RimColor", "#ff8ceb");
            SetVec(m, "_FloorSheet", new Vector4(RiverPath.WaterY + 0.06f, 0.35f, 5.4f, 1f));
            SetHex(m, "_FloorColorA", "#c81f9c");
            SetHex(m, "_FloorColorB", "#ff4fc0");
            SetFloat(m, "_Exposure", 1f);
            SetFloat(m, "_LightInfluence", 1f);
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
            SetVec(m, "_BandS", new Vector4(20f, 0.055f, 1.6f, 0f));
            SetVec(m, "_BandF", new Vector4(44f, 110f, 0f, 0f));
            SetVec(m, "_PaddleParams", new Vector4(0.55f, 0.12f, 1f, 0f));
            SetVec(m, "_FrameParams", new Vector4(0.3f, 0.06f, 0f, 0f));
            SetTex(m, "_EnvPano", pano);
            SetFloat(m, "_EnvIntensity", mode == 1 ? 1.35f : 1.15f);
            SetFloat(m, "_EnvBlur", 1f);
            SetHex(m, "_StripColor", "#fff0c8");
            SetFloat(m, "_StripIntensity", mode == 1 ? 2.4f : 3.2f);
            SetVec(m, "_StripParams", new Vector4(28f, 0.022f, 0f, 0.65f));
            SetHex(m, "_MidTint", "#8a30d2");
            SetVec(m, "_MidRange", new Vector4(8f, 50f, 0f, 0f));
            SetGlow(m);
            SetFloat(m, "_Exposure", 1f);
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
        /// Warm throat glow by view distance (materials.ts glowT05 '#ff9c5a', near 95 / far 330 / 1.5 over the virtual
        /// 430 u far block), compressed to this real tunnel whose throat is ~242 u from the approved camera.
        /// </summary>
        static void SetGlow(Material m)
        {
            SetHex(m, "_FarGlowColor", "#ff9c5a");
            SetVec(m, "_FarGlowRange", new Vector4(80f, 260f, 1.6f, 0f));
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
            // STAGE_CAM['05']: back 6.4, up 3.6, ahead 18, lookUp -1.92 -> pitch 12.75 deg down, yaw 2.96 deg left, vFOV 62
            Vector3 camPos = new Vector3(0f, RiverPath.WaterY + 3.6f, DrumLayout05.EyeS);
            Quaternion camRot = Quaternion.Euler(12.75f, -2.96f, 0f);
            float px = nf.depth * Mathf.Tan(31f * Mathf.Deg2Rad) / 768f;
            nf.transform.SetPositionAndRotation(camPos + camRot * new Vector3(0f, 0f, nf.depth), camRot);
            nf.transform.localScale = Vector3.one * px;
        }

        static string F(float v) => v.ToString("0.0", CultureInfo.InvariantCulture);
    }
}

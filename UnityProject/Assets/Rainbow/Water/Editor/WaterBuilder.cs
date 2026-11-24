using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using UnityEngine.SceneManagement;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>
    /// Agent 3 builder (contract entry point, called second by Screen05SceneBuilder): river surface + material,
    /// foam banks (LOD chunks), bubble field, spray material for SplashWake, lights (key sun, warm throat light,
    /// camera fill), ambient trilight, fog, custom reflection cubemap (marble05 panorama) and the global
    /// post-processing Volume + VolumeProfile asset (bloom / tonemapping / colour grade / vignette ported from
    /// src/game/Game.ts, src/render/env.ts and src/render/grade.ts).
    /// Idempotent: it replaces its own root "Water05" under the parent and rewrites its own assets in place
    /// (stable GUIDs). Everything it creates lives under Assets/Rainbow/Water/. Never touches other areas.
    /// </summary>
    public static class WaterBuilder
    {
        public const string RootName = "Water05";
        const string Dir = "Assets/Rainbow/Water";
        const string GenDir = Dir + "/Generated";
        const string FoamDir = GenDir + "/Foam";
        const string MatDir = Dir + "/Materials";
        const string ResDir = Dir + "/Resources";
        const string TexDir = Dir + "/Textures";
        const string PanoPath = TexDir + "/marble05_env_1024.jpg";   // 2D lat-long for the river shader
        const string CubePath = TexDir + "/marble05_env_cube.jpg";   // same image imported as a cubemap
        const string ProfilePath = Dir + "/Screen05_PostFX.asset";
        const string Tag = "[Rainbow Agent3] ";

        // three.js r155+ lights are physical: radiance = albedo / PI * intensity (URP Lit: albedo * intensity)
        const float ThreeToUrp = 1f / Mathf.PI;
        // Game.ts sun.position (0.3, 1, 0.45) -> Unity (heading -Z becomes +Z): direction TOWARD the sun
        static readonly Vector3 ToSun = new Vector3(0.3f, 1f, -0.45f).normalized;
        // marble05 pano: its vanishing point sits at u 0.514 -> rotate the lookup so +Z (downstream) hits it
        const float PanoYawDeg = 5.04f;

        [MenuItem("Rainbow/Water/Rebuild Water In Open Scene (Agent 3)")]
        static void RebuildMenu()
        {
            Transform parent = null;
            foreach (var go in SceneManager.GetActiveScene().GetRootGameObjects())
                if (go.name == "Screen05") { parent = go.transform; break; }
            var root = Build(parent);
            Selection.activeGameObject = root;
        }

        public static GameObject Build(Transform parent)
        {
            EnsureFolder(GenDir);
            EnsureFolder(FoamDir);
            EnsureFolder(MatDir);
            EnsureFolder(ResDir);
            EnsureFolder(TexDir);
            RemoveExisting(parent);

            var root = new GameObject(RootName);
            if (parent != null) root.transform.SetParent(parent, false);
            // the water / foam meshes are authored in world space (RiverPath frame)
            root.transform.position = Vector3.zero;
            root.transform.rotation = Quaternion.identity;
            root.transform.localScale = Vector3.one;

            Texture2D pano = PreparePano();
            Cubemap cube = PrepareCube();

            int riverTris = BuildRiver(root.transform, pano);
            int puffs, chunks;
            BuildFoam(root.transform, out puffs, out chunks);
            BuildBubbles(root.transform);
            PrepareSprayMaterial();
            BuildLights(root.transform);
            ApplyEnvironment(cube);
            BuildPostFX(root.transform);

            AssetDatabase.SaveAssets();
            if (root.scene.IsValid()) EditorSceneManager.MarkSceneDirty(root.scene);
            Debug.Log(Tag + "WaterBuilder: river " + riverTris + " tris, foam " + puffs + " puffs in " + chunks
                      + " LOD chunks, bubbles, spray material, 3 lights, trilight ambient, fog, reflection "
                      + (cube != null ? "marble05 cubemap" : "MISSING (no cubemap)") + ", global Volume " + ProfilePath);
            return root;
        }

        // ------------------------------------------------------------------ river
        /// <summary>Cyan water grade (rgb multiplier, strength) for RainbowRiver.shader _RiverGrade.</summary>
        public static readonly Vector4 RiverGrade = new Vector4(0.55f, 0.70f, 0.93f, 1f);

        public const float GlintStreak = 1f, GlintFlare = 1f;
        /// <summary>River lanes (RainbowRiver.hlsl): lane gain, core gain, broad streaks, fine streaks.</summary>
        public static readonly Vector4 RiverLook = new Vector4(0.9f, 0.5f, 0.5f, 0.5f);

        static int BuildRiver(Transform root, Texture2D pano)
        {
            Mesh mesh = SaveMesh(RiverMeshGenerator.Build(), GenDir + "/RiverSurface05.asset");
            Material mat = GetOrCreateMaterial(MatDir + "/RainbowRiver05.mat", "Rainbow/Water/River");
            mat.SetFloat("_SOffset", RiverSurface.SOffset);
            mat.SetFloat("_CoreSwing", RiverSurface.CoreSwing);
            mat.SetFloat("_FlowSpeed", RiverSurface.FlowSpeed);
            mat.SetFloat("_WaveAmp", RiverSurface.WaveAmp);
            mat.SetVector("_RiverLightDir", new Vector4(ToSun.x, ToSun.y, ToSun.z, 0f));
            if (pano != null) mat.SetTexture("_EnvPano", pano);
            mat.SetFloat("_EnvStrength", 0.9f);
            mat.SetFloat("_EnvYaw", PanoYawDeg);
            mat.SetFloat("_EnvLod", 1f);
            // coordinator round 3 (2026-11-23, live variants coord_e1/e2): deeper AZURE water like the approved (cyan/blue
            // water only; RainbowRiver.shader). (0.55, 0.70, 0.93) beat (0.70, 0.80, 0.96) and (0.45, 0.62, 0.92):
            // water_near 48.0 -> 56.7, bubbles 48.4 / 39.3 -> 59.0 / 48.2, splash 60.4 -> 67.9.
            mat.SetVector("_RiverGrade", RiverGrade);
            mat.SetVector("_W4Look", RiverLook); mat.SetFloat("_W4Edge", 0.6f); mat.SetVector("_W4Band", new Vector4(0.95f, 0.65f, 0.5f, 0.35f));
            EditorUtility.SetDirty(mat);

            var go = new GameObject("River05");
            go.transform.SetParent(root, false);
            go.AddComponent<MeshFilter>().sharedMesh = mesh;
            MeshRenderer mr = go.AddComponent<MeshRenderer>();
            mr.sharedMaterial = mat;
            NoShadowsNoProbes(mr);

            // river round 4b: light streaks / star flares on the water (RiverGlints.cs)
            AssetDatabase.ImportAsset(Dir + "/Shaders/RainbowRiverGlints.shader", ImportAssetOptions.ForceSynchronousImport);
            Texture2D lut = RiverLayout05.BuildLut();
            string lutPath = GenDir + "/RiverLut05.asset";
            var oldLut = AssetDatabase.LoadAssetAtPath<Texture2D>(lutPath);
            if (oldLut == null) { AssetDatabase.CreateAsset(lut, lutPath); oldLut = lut; }
            else { EditorUtility.CopySerialized(lut, oldLut); Object.DestroyImmediate(lut); EditorUtility.SetDirty(oldLut); }
            Material gm = GetOrCreateMaterial(MatDir + "/RainbowRiverGlints05.mat", "Rainbow/Water/RiverGlints");
            gm.SetTexture("_RiverLut", oldLut);
            gm.SetVector("_LutRange", new Vector4(RiverLayout05.S0, RiverLayout05.S1, 0f, 0f));
            gm.SetFloat("_HoldTime", 1.5f);
            gm.SetFloat("_Drift", 7.5f);
            gm.SetFloat("_Streak", GlintStreak);
            gm.SetFloat("_Flare", GlintFlare);
            EditorUtility.SetDirty(gm);
            MakeRenderer(root, "RiverGlints05", SaveMesh(RiverGlints.Build(), GenDir + "/RiverGlints05.asset"), gm);
            return mesh.triangles.Length / 3;
        }

        // ------------------------------------------------------------------ foam banks
        static void BuildFoam(Transform root, out int puffCount, out int chunkCount)
        {
            // (foam round 2026-11-23) sphere-impostor soap bubbles; they ride the river swell (same values as the River)
            AssetDatabase.ImportAsset(Dir + "/Shaders/RainbowFoam.shader", ImportAssetOptions.ForceSynchronousImport);
            Material mat = GetOrCreateMaterial(MatDir + "/RainbowFoam05.mat", "Rainbow/Water/Foam");
            mat.SetVector("_FoamLightDir", new Vector4(ToSun.x, ToSun.y, ToSun.z, 0f));
            mat.SetFloat("_Brightness", 1f);
            mat.SetFloat("_SOffset", RiverSurface.SOffset);
            mat.SetFloat("_WaveAmp", RiverSurface.WaveAmp);
            EditorUtility.SetDirty(mat);

            var foamRoot = new GameObject("FoamBanks05");
            foamRoot.transform.SetParent(root, false);
            var puffs = FoamBank.GeneratePuffs();
            var chunks = FoamBank.BuildChunks(puffs, 10f);
            foreach (FoamBank.Chunk c in chunks)
            {
                Mesh m0 = SaveMesh(c.lod0, FoamDir + "/" + c.lod0.name + ".asset");
                Mesh m1 = SaveMesh(c.lod1, FoamDir + "/" + c.lod1.name + ".asset");
                var go = new GameObject(c.name);
                go.transform.SetParent(foamRoot.transform, false);
                Renderer r0 = MakeRenderer(go.transform, "LOD0", m0, mat);
                Renderer r1 = MakeRenderer(go.transform, "LOD1", m1, mat);
                LODGroup lg = go.AddComponent<LODGroup>();
                lg.SetLODs(new[]
                {
                    // 10 u chunk: all bubbles within ~70 u of the camera (impostors cost 4 vertices each; switching at
                    // ~28 u dropped every small bubble at once in plain view = popping as Benny approached)
                    new LOD(0.12f, new[] { r0 }),
                    new LOD(0.002f, new[] { r1 }),
                });
                lg.RecalculateBounds();
            }
            puffCount = puffs.Count;
            chunkCount = chunks.Count;
        }

        static Renderer MakeRenderer(Transform parent, string name, Mesh mesh, Material mat)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            go.AddComponent<MeshFilter>().sharedMesh = mesh;
            MeshRenderer mr = go.AddComponent<MeshRenderer>();
            mr.sharedMaterial = mat;
            NoShadowsNoProbes(mr);
            return mr;
        }

        // ------------------------------------------------------------------ bubbles + spray
        /// <summary>Bubble look (RainbowBubble.hlsl), bubbles round 3 vs zoomed crops of the approved 05 bubbles:
        /// big = (rim gain, blob gain, lens alpha, film mix), (cyan spot gain, glint gain, rim half width px, blob ring radius);
        /// small = (ring gain, dot gain, body alpha, glint gain).</summary>
        public static readonly Vector4 BubbleLook0 = new Vector4(1.3f, 1.2f, 0.62f, 0.45f);
        public static readonly Vector4 BubbleLook1 = new Vector4(1f, 0.5f, 2.2f, 0.76f);
        public static readonly Vector4 BubbleLookS = new Vector4(1f, 1f, 0.3f, 0.6f);

        static void BuildBubbles(Transform root)
        {
            // (bubbles round 3) the look properties must exist before the material is written
            AssetDatabase.ImportAsset(Dir + "/Shaders/RainbowBubble.shader", ImportAssetOptions.ForceSynchronousImport);
            Material mat = GetOrCreateMaterial(MatDir + "/RainbowBubble05.mat", "Rainbow/Water/Bubble");
            mat.SetVector("_Look0", BubbleLook0);
            mat.SetVector("_Look1", BubbleLook1);
            mat.SetVector("_LookS", BubbleLookS);
            // Coordinator tuning 2026-11-23 (AgentScripts/screen05_bubble_nearfade.cs, commit be4abef): bubbles may come
            // closer to the camera (the approved image has big bubbles near the bottom corners) and read a bit stronger.
            // bubbles.ts uNear was 3.2 / intensity 1.
            mat.SetFloat("_NearFade", 1.5f);
            mat.SetFloat("_SoftDepth", 0.3f);
            // (bubbles round 3) 1.4 -> 1.1: with the opaque blue lens the bubbles read too bright / white-cyan (live variants
            // b3: 1.0 / 1.2 / 1.4 = visual 57.9 / 57.8 / 57.7)
            mat.SetFloat("_Intensity", 1.1f);
            // (bubbles round 2026-11-23) bubbles.ts on-screen caps: MAX_PX_RIDE 66 / MAX_PX_SMALL 22 px diameters (864x1536);
            // round 3: 68 px (approved big edge bubbles 52-65 px)
            mat.SetFloat("_MaxPx", 34f);
            mat.SetFloat("_MaxPxSmall", 11f);
            EditorUtility.SetDirty(mat);

            var go = new GameObject("Bubbles05");
            go.transform.SetParent(root, false);
            go.AddComponent<MeshFilter>();
            MeshRenderer mr = go.AddComponent<MeshRenderer>();
            mr.sharedMaterial = mat;
            NoShadowsNoProbes(mr);
            go.AddComponent<BubbleField>();
        }

        /// <summary>(water4 2026-11-24) splash strand look on Rainbow/Water/Splash: width scale, opacity, extra fan angle (rad),
        /// roots moved round toward his back (rad). Live variants t1: (0.75, 0.8, 0.2) splash 69.7 vs the old (1, 1, 0) 68.8.</summary>
        public const float SplashRopeWidth = 1.2f /* splash6_t4: 1.5 -> 1.2 */, SplashRopeAlpha = 0.85f, SplashSpread = 0.2f, SplashRootBack = 0.3f, SplashJetAlpha = 0.6f, SplashStrandBack = 0f,
                           SplashLen = 1.5f;   // (t3 variants: 1.55 splash 72.0 > 1.35 71.6 > 1.15 71.2)
        /// <summary>(splash6 2026-11-24) starburst strand layout on Rainbow/Water/Splash (_Radial 0 = the old flank V).
        /// splash6_t1 variants: _Radial 1 = splash 73.9 vs 0 = 77.1 (kept 0 until a better starburst fit wins).</summary>
        public const float SplashRadial = 0f, SplashRayFan = 0.6f, SplashRayLong = 0.35f, SplashRayRoot = 0.97f,
                           SplashFanOpen = 0f;

        static void PrepareSprayMaterial()
        {
            // SplashWake (added to Benny by Agent 4's builder) loads these at runtime: Resources.Load("RainbowSpray05")
            // for the droplets and Resources.Load("RainbowSplash05") for the whitewater fans / froth collar / crown
            Material mat = GetOrCreateMaterial(ResDir + "/RainbowSpray05.mat", "Rainbow/Water/Spray");
            mat.SetFloat("_SoftDepth", 0.12f);
            mat.SetFloat("_Intensity", 1f);
            EditorUtility.SetDirty(mat);

            // river round 4b: Benny's wake foam (SplashWake draws FoamBank.BuildWakeMesh with it)
            Material wf = GetOrCreateMaterial(ResDir + "/RainbowWakeFoam05.mat", "Rainbow/Water/Foam");
            wf.SetVector("_FoamLightDir", new Vector4(ToSun.x, ToSun.y, ToSun.z, 0f));
            wf.SetFloat("_Brightness", 1f);
            EditorUtility.SetDirty(wf);

            // (splash round 2026-11-23) make sure the fan shader is imported before it is looked up by name
            AssetDatabase.ImportAsset(Dir + "/Shaders/RainbowSplash.shader", ImportAssetOptions.ForceSynchronousImport);
            Material fan = GetOrCreateMaterial(ResDir + "/RainbowSplash05.mat", "Rainbow/Water/Splash");
            fan.SetFloat("_SoftDepth", 0.05f);      // ropes ride 0.035-0.1 above the water: only their very ends fade
            fan.SetFloat("_Intensity", 1f);
            fan.SetFloat("_Len", SplashLen);        // riderSplash.ts createRiderSplash05 uLen 1.55 (water4: shorter, splashier)
            // (water4 2026-11-24) approved spray = see-through streams of droplets fanning toward the bottom corners with the
            // water showing between them (splash box luminance p50 ~175), not a solid white comb (Unity p50 ~250)
            fan.SetFloat("_RopeWidth", SplashRopeWidth);
            fan.SetFloat("_RopeAlpha", SplashRopeAlpha);
            fan.SetFloat("_Spread", SplashSpread);
            fan.SetFloat("_RootBack", SplashRootBack);
            fan.SetFloat("_JetAlpha", SplashJetAlpha);      // river5 live-variant hooks
            fan.SetFloat("_StrandBack", SplashStrandBack);
            fan.SetFloat("_FootprintBack", 0.14f);  // benny31 footprint ~0.91 u toward the camera vs ~0.8 u beside him
            // (splash6 2026-11-24) starburst layout: strands rooted along his bottom contact line, radiating down-outward
            fan.SetFloat("_Radial", SplashRadial);
            fan.SetFloat("_RayFan", SplashRayFan);
            fan.SetFloat("_RayLong", SplashRayLong);
            fan.SetFloat("_RayRoot", SplashRayRoot);
            fan.SetFloat("_FanOpen", SplashFanOpen);
            EditorUtility.SetDirty(fan);
        }

        // ------------------------------------------------------------------ lights
        static void BuildLights(Transform root)
        {
            var group = new GameObject("Lights05");
            group.transform.SetParent(root, false);

            // Game.ts: DirectionalLight('#fff4e6', 1.6) at (0.3, 1, 0.45)
            Light sun = MakeLight(group.transform, "KeySun05", LightType.Directional, Hex(0xfff4e6), 1.6f * ThreeToUrp);
            sun.transform.rotation = Quaternion.LookRotation(-ToSun, Vector3.up);
            RenderSettings.sun = sun;

            // warm light from the bright far throat (rim light on Benny / coins seen from behind)
            Light throat = MakeLight(group.transform, "ThroatWarm05", LightType.Directional, Hex(0xffd9a0), 0.35f);
            throat.transform.rotation = Quaternion.LookRotation(new Vector3(0f, -0.25f, -1f), Vector3.up);

            // Game.ts: PointLight('#ffd8ff', 30, distance 30, decay 1.6) copied to the camera every frame.
            // 30 / d^1.6 / PI at the 6.5 u chase distance = 0.48 -> URP inverse-square 20 / d^2.
            Light fill = MakeLight(group.transform, "CameraFill05", LightType.Point, Hex(0xffd8ff), 20f);
            fill.range = 30f;
            fill.transform.position = RiverPath.CorePoint(RiverPath.StartS) + new Vector3(0f, 3.66f, -6.4f);
            fill.gameObject.AddComponent<CameraFillLight>();
        }

        static Light MakeLight(Transform parent, string name, LightType type, Color color, float intensity)
        {
            var go = new GameObject(name);
            go.transform.SetParent(parent, false);
            Light l = go.AddComponent<Light>();
            l.type = type;
            l.color = color;
            l.intensity = intensity;
            l.shadows = LightShadows.None;
            l.lightmapBakeType = LightmapBakeType.Realtime;
            return l;
        }

        // ------------------------------------------------------------------ ambient, fog, reflection
        static void ApplyEnvironment(Cubemap cube)
        {
            // Game.ts HemisphereLight('#fff0ff', '#a33bb8', 1.15) -> trilight (linear * 1.15 / PI); the ground gets 30 %
            // of the river's cyan bounce (#00a8f5) so the undersides pick up the water colour
            float k = 1.15f * ThreeToUrp;
            Color skyL = Hex(0xfff0ff).linear;
            Color groundL = Color.Lerp(Hex(0xa33bb8).linear, Hex(0x00a8f5).linear, 0.3f);
            Color equatorL = Color.Lerp(skyL, Hex(0xa33bb8).linear, 0.5f);
            RenderSettings.ambientMode = AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = Opaque(skyL * k).gamma;
            RenderSettings.ambientEquatorColor = Opaque(equatorL * k).gamma;
            RenderSettings.ambientGroundColor = Opaque(groundL * k).gamma;

            // Game.ts: FogExp2('#ffbde9', 0.0035)
            RenderSettings.fog = true;
            RenderSettings.fogMode = FogMode.ExponentialSquared;
            RenderSettings.fogColor = Hex(0xffbde9);
            RenderSettings.fogDensity = 0.0035f;

            // reflections: the marble05 panorama (materials.ts marblePano05) as the custom reflection cubemap
            if (cube != null)
            {
                RenderSettings.defaultReflectionMode = DefaultReflectionMode.Custom;
                RenderSettings.customReflectionTexture = cube;
                RenderSettings.reflectionIntensity = 1f;
            }
            else
            {
                Debug.LogWarning(Tag + "WaterBuilder: " + CubePath + " missing - reflections left at the scene default.");
            }
            DynamicGI.UpdateEnvironment();
        }

        // ------------------------------------------------------------------ post-processing
        static void BuildPostFX(Transform root)
        {
            VolumeProfile profile = AssetDatabase.LoadAssetAtPath<VolumeProfile>(ProfilePath);
            if (profile == null)
            {
                profile = ScriptableObject.CreateInstance<VolumeProfile>();
                AssetDatabase.CreateAsset(profile, ProfilePath);
            }

            // Game.ts glow05 UnrealBloom(strength 1.0, radius 0.4, threshold 2.6 linear). UnrealBloom keeps a pixel's FULL
            // colour above its threshold; URP subtracts the threshold (soft knee), so a lower threshold (1.2 gamma =
            // 1.5 linear: river body < 1.0 and foam ~1.2 stay out, streak cores / flares / lamps / throat glow) and a
            // higher intensity give the same "only the highlights glow" look.
            Bloom bloom = GetOrAdd<Bloom>(profile);
            bloom.active = true;
            bloom.threshold.Override(1.2f);
            bloom.intensity.Override(2.5f);
            bloom.scatter.Override(0.65f);
            bloom.clamp.Override(65472f);
            bloom.tint.Override(Color.white);
            bloom.highQualityFiltering.Override(false);
            bloom.maxIterations.Override(6);

            // env.ts NeutralToneMapping (Khronos PBR Neutral) is the identity below ~0.8, so "None" keeps the solved
            // palette; URP's own Neutral curve would darken mid-tones (0.5 -> 0.34) and desaturate.
            Tonemapping tm = GetOrAdd<Tonemapping>(profile);
            tm.active = true;
            tm.mode.Override(TonemappingMode.None);

            // env.ts toneMappingExposure 0.86 + grade.ts saturation 1.36 / contrast 1.15
            ColorAdjustments ca = GetOrAdd<ColorAdjustments>(profile);
            ca.active = true;
            ca.postExposure.Override(Mathf.Log(0.86f, 2f));
            ca.saturation.Override(36f);
            ca.contrast.Override(15f);
            ca.hueShift.Override(0f);
            ca.colorFilter.Override(Color.white);

            // grade.ts vignette 0.18 * smoothstep(0.25, 0.75, |uv - 0.5|) -> ~15 % in the corners, ~9 % at the edges
            Vignette vg = GetOrAdd<Vignette>(profile);
            vg.active = true;
            vg.color.Override(Color.black);
            vg.center.Override(new Vector2(0.5f, 0.5f));
            vg.intensity.Override(0.15f);
            vg.smoothness.Override(0.4f);
            vg.rounded.Override(false);

            EditorUtility.SetDirty(profile);

            var go = new GameObject("PostFX05 (global Volume)");
            go.transform.SetParent(root, false);
            Volume vol = go.AddComponent<Volume>();
            vol.isGlobal = true;
            vol.priority = 10f;
            vol.weight = 1f;
            vol.sharedProfile = profile;
        }

        static T GetOrAdd<T>(VolumeProfile profile) where T : VolumeComponent
        {
            T c;
            if (profile.TryGet(out c)) return c;
            c = profile.Add<T>(true);
            AssetDatabase.AddObjectToAsset(c, profile);
            return c;
        }

        // ------------------------------------------------------------------ textures
        static Texture2D PreparePano()
        {
            var imp = AssetImporter.GetAtPath(PanoPath) as TextureImporter;
            if (imp == null)
            {
                Debug.LogWarning(Tag + "WaterBuilder: " + PanoPath + " missing - the river reflects nothing.");
                return null;
            }
            bool dirty = false;
            if (imp.textureType != TextureImporterType.Default) { imp.textureType = TextureImporterType.Default; dirty = true; }
            if (imp.textureShape != TextureImporterShape.Texture2D) { imp.textureShape = TextureImporterShape.Texture2D; dirty = true; }
            if (!imp.sRGBTexture) { imp.sRGBTexture = true; dirty = true; }
            if (!imp.mipmapEnabled) { imp.mipmapEnabled = true; dirty = true; }
            if (imp.wrapModeU != TextureWrapMode.Repeat) { imp.wrapModeU = TextureWrapMode.Repeat; dirty = true; }
            if (imp.wrapModeV != TextureWrapMode.Clamp) { imp.wrapModeV = TextureWrapMode.Clamp; dirty = true; }
            if (imp.filterMode != FilterMode.Trilinear) { imp.filterMode = FilterMode.Trilinear; dirty = true; }
            if (dirty) imp.SaveAndReimport();
            return AssetDatabase.LoadAssetAtPath<Texture2D>(PanoPath);
        }

        static Cubemap PrepareCube()
        {
            var imp = AssetImporter.GetAtPath(CubePath) as TextureImporter;
            if (imp == null) return null;
            var st = new TextureImporterSettings();
            imp.ReadTextureSettings(st);
            bool dirty = st.textureType != TextureImporterType.Default
                         || st.textureShape != TextureImporterShape.TextureCube
                         || st.generateCubemap != TextureImporterGenerateCubemap.Cylindrical
                         || st.cubemapConvolution != TextureImporterCubemapConvolution.Specular
                         || !st.mipmapEnabled || !st.sRGBTexture;
            if (dirty)
            {
                st.textureType = TextureImporterType.Default;
                st.textureShape = TextureImporterShape.TextureCube;
                st.generateCubemap = TextureImporterGenerateCubemap.Cylindrical;   // lat-long layout
                st.cubemapConvolution = TextureImporterCubemapConvolution.Specular; // glossy mips
                st.seamlessCubemap = true;
                st.mipmapEnabled = true;
                st.sRGBTexture = true;
                imp.SetTextureSettings(st);
                imp.SaveAndReimport();
            }
            return AssetDatabase.LoadAssetAtPath<Cubemap>(CubePath);
        }

        // ------------------------------------------------------------------ helpers
        static Material GetOrCreateMaterial(string path, string shaderName)
        {
            Shader sh = Shader.Find(shaderName);
            if (sh == null)
            {
                Debug.LogError(Tag + "Shader '" + shaderName + "' not found (is Assets/Rainbow/Water/Shaders imported without errors?). Using URP Unlit.");
                sh = Shader.Find("Universal Render Pipeline/Unlit");
            }
            var m = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (m == null)
            {
                m = new Material(sh);
                AssetDatabase.CreateAsset(m, path);
            }
            else if (sh != null && m.shader != sh)
            {
                m.shader = sh;
            }
            return m;
        }

        /// <summary>Writes a generated mesh into its asset, in place when it already exists (keeps the GUID).</summary>
        static Mesh SaveMesh(Mesh mesh, string path)
        {
            var existing = AssetDatabase.LoadAssetAtPath<Mesh>(path);
            if (existing == null)
            {
                AssetDatabase.CreateAsset(mesh, path);
                return mesh;
            }
            existing.Clear();
            EditorUtility.CopySerialized(mesh, existing);
            Object.DestroyImmediate(mesh);
            EditorUtility.SetDirty(existing);
            return existing;
        }

        static void NoShadowsNoProbes(Renderer r)
        {
            r.shadowCastingMode = ShadowCastingMode.Off;
            r.receiveShadows = false;
            r.lightProbeUsage = LightProbeUsage.Off;
            r.reflectionProbeUsage = ReflectionProbeUsage.Off;
        }

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
            foreach (var go in SceneManager.GetActiveScene().GetRootGameObjects())
                if (go.name == RootName) Object.DestroyImmediate(go);
        }

        static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path)) return;
            string parentPath = Path.GetDirectoryName(path).Replace('\\', '/');
            EnsureFolder(parentPath);
            AssetDatabase.CreateFolder(parentPath, Path.GetFileName(path));
        }

        static Color Hex(int rgb)
        {
            return new Color(((rgb >> 16) & 255) / 255f, ((rgb >> 8) & 255) / 255f, (rgb & 255) / 255f, 1f);
        }

        static Color Opaque(Color c)
        {
            c.a = 1f;
            return c;
        }
    }
}

using System;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEditor.Animations;
using UnityEngine;
using UnityEngine.Rendering;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>
    /// Builds Benny: the approved benny31.glb mesh (one 40 k-triangle mesh, one material, no skin / clips / sub-nodes -
    /// inspected: nodes "world" -> "tmp25pgrq5c.ply") turned into a SkinnedMeshRenderer with four added bones
    /// (Squash, ArmL, ArmR, Pom) whose weights are the exact regions benny31.ts deformed in its vertex shader
    /// (arms: smoothstep(0.30, 0.37, |x|) * (1 - smoothstep(0.08, 0.16, |y + 0.18|)) around (+-0.31, -0.18, 0);
    /// pom-pom / hat top: smoothstep(0.17, 0.27, y) around (0, 0.19, 0.05); squash about the bottom (0, -0.5, 0)),
    /// the Rainbow/Benny/Fluff material on the approved bake (bake.png x 4), and a generated AnimatorController
    /// (Swim 1D blend tree on Steer with lean left / right, Jump, Fall, Land).
    /// Fallbacks: the glTFast-imported prefab (static mesh, wrapper transforms still animated) and a procedural Benny.
    ///
    /// Hierarchy (Benny root faces +Z, rides at water + 0.44):
    ///   Benny / Visual [Animator] / Lean / Bob / Model (rot 180, scale 2.308, y 0.26) [SkinnedMeshRenderer]
    ///         / Squash (0,-0.5,0) / ArmL, ArmR, Pom
    /// Model placement = benny31.ts attachBenny31: scale k = old Benny height / 0.99 (old benny.glb extent: sole bottom
    /// -0.885 .. pom top 1.40 in body space -> k = 2.308), centre at min.y + 0.496 k = 0.26, turned 180 deg so the rear
    /// design faces the chase camera.
    /// </summary>
    public static class BennyRigBuilder
    {
        public const string GlbPath = "Assets/Rainbow/Benny/Models/benny31.glb";
        public const string BakePath = "Assets/Rainbow/Benny/Textures/benny31_bake.png";
        public const string ShaderPath = "Assets/Rainbow/Benny/Shaders/RainbowFluff.shader";
        public const string GenDir = "Assets/Rainbow/Benny/Generated";
        public const string AnimDir = "Assets/Rainbow/Benny/Animation";
        public const string MatDir = "Assets/Rainbow/Benny/Materials";

        public const float ModelScale = 2.308f;
        public const float ModelCenterY = 0.26f;
        public static readonly Vector3 SquashPivot = new Vector3(0f, -0.5f, 0f);
        // Unity mesh space = glTF with X mirrored (glTFast convention): his right side (glTF +x) is Unity -x
        public static readonly Vector3 ArmLPivot = new Vector3(0.31f, -0.18f, 0f);
        public static readonly Vector3 ArmRPivot = new Vector3(-0.31f, -0.18f, 0f);
        public static readonly Vector3 PomPivot = new Vector3(0f, 0.19f, 0.05f);

        // animation (benny31.ts + build.ts swim clip)
        const float ArmRate = 7.5f;                       // uT * 7.5
        static readonly float SwimCycle = 2f * Mathf.PI / ArmRate; // 0.838 s: arms once, squash twice
        const float LeanRollRad = 0.30f;                  // steering roll (runtime.ts 0.28 + Game.ts 0.25 combined, eased down)
        const float LeanYawRad = 0.17f;                   // runtime.ts -lean * 0.6

        public const string PathLean = "Lean";
        public const string PathBob = "Lean/Bob";
        public const string PathSquash = "Lean/Bob/Model/Squash";
        public const string PathArmL = "Lean/Bob/Model/Squash/ArmL";
        public const string PathArmR = "Lean/Bob/Model/Squash/ArmR";

        public class Rig
        {
            public GameObject root;
            public Transform visual, lean, bob, model, squash, armL, armR, pom, footL, footR;
            public BennySwimAnimator swimAnimator;
            public Animator animator;
            public string source;
        }

        public static Rig Build(Transform parent)
        {
            GameplayAssetUtil.EnsureFolder(GenDir);
            GameplayAssetUtil.EnsureFolder(AnimDir);
            GameplayAssetUtil.EnsureFolder(MatDir);

            Rig rig = new Rig();
            rig.root = new GameObject("Benny");
            if (parent != null) rig.root.transform.SetParent(parent, false);
            rig.visual = GameplayAssetUtil.Child("Visual", rig.root.transform, new Vector3(0f, 0.12f, 0f)).transform;
            rig.visual.localRotation = Quaternion.Euler(0.22f * Mathf.Rad2Deg, 0f, 0f);
            rig.lean = GameplayAssetUtil.Child("Lean", rig.visual, Vector3.zero).transform;
            rig.bob = GameplayAssetUtil.Child("Bob", rig.lean, Vector3.zero).transform;
            rig.model = GameplayAssetUtil.Child("Model", rig.bob, new Vector3(0f, ModelCenterY, 0f)).transform;
            rig.model.localRotation = Quaternion.Euler(0f, 180f, 0f);
            rig.model.localScale = Vector3.one * ModelScale;
            rig.squash = GameplayAssetUtil.Child("Squash", rig.model, SquashPivot).transform;
            rig.armL = GameplayAssetUtil.Child("ArmL", rig.squash, ArmLPivot - SquashPivot).transform;
            rig.armR = GameplayAssetUtil.Child("ArmR", rig.squash, ArmRPivot - SquashPivot).transform;
            // round 4: the approved arms are small round nubs (~50 px); the bones scale them about the shoulder (bind pose keeps scale 1)
            rig.armL.localScale = rig.armR.localScale = Vector3.one * ArmScale;
            rig.pom = GameplayAssetUtil.Child("Pom", rig.squash, PomPivot - SquashPivot).transform;
            BuildFeet(rig);

            Material mat = BennyMaterial();
            Mesh skinned = null;
            try { skinned = BuildSkinnedMesh(); }
            catch (Exception e) { Debug.LogWarning("[Rainbow Agent4] benny31.glb skinning failed: " + e.Message); }

            if (skinned != null)
            {
                SkinnedMeshRenderer smr = rig.model.gameObject.AddComponent<SkinnedMeshRenderer>();
                smr.sharedMesh = skinned;
                smr.bones = new[] { rig.squash, rig.armL, rig.armR, rig.pom };
                smr.rootBone = rig.squash;
                smr.sharedMaterial = mat;
                smr.localBounds = new Bounds(new Vector3(0f, 0.5f, 0f), new Vector3(1.7f, 1.7f, 1.7f));
                smr.updateWhenOffscreen = false;
                smr.skinnedMotionVectors = false;
                smr.shadowCastingMode = ShadowCastingMode.Off;
                smr.quality = SkinQuality.Bone2;
                rig.source = "benny31.glb (skinned, generated bones)";
            }
            else if (TryGltfPrefab(rig, mat))
            {
                rig.source = "benny31.glb (glTFast prefab, static mesh)";
            }
            else
            {
                BuildProceduralFallback(rig);
                rig.source = "procedural fallback";
            }

            rig.swimAnimator = rig.visual.gameObject.AddComponent<BennySwimAnimator>();
            rig.swimAnimator.lean = rig.lean; rig.swimAnimator.bob = rig.bob; rig.swimAnimator.squash = rig.squash;
            rig.swimAnimator.armL = rig.armL; rig.swimAnimator.armR = rig.armR; rig.swimAnimator.footL = rig.footL; rig.swimAnimator.footR = rig.footR;
            rig.animator = rig.visual.gameObject.AddComponent<Animator>();
            rig.animator.applyRootMotion = false;
            rig.animator.cullingMode = AnimatorCullingMode.AlwaysAnimate;
            rig.animator.updateMode = AnimatorUpdateMode.Normal;
            try { rig.animator.runtimeAnimatorController = BuildController(); }
            catch (Exception e) { Debug.LogWarning("[Rainbow Agent4] Animator controller build failed: " + e.Message); }
            Debug.Log("[Rainbow Agent4] Benny built from " + rig.source);
            return rig;
        }

        /// <summary>Two small round pink feet under the body (master direction 2026-11-24: feet paddle too). They hang below the waterline, so the
        /// approved view never shows them; they kick in the water and dangle while he jumps. Mesh space (scale 2.308, model turned 180 deg).</summary>
        static void BuildFeet(Rig rig)
        {
            Material m = FlatFluff("Benny_Feet", new Color(0.93f, 0.52f, 0.72f, 1f));
            GameObject tmp = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            Mesh sphere = tmp.GetComponent<MeshFilter>().sharedMesh;
            UnityEngine.Object.DestroyImmediate(tmp);
            foreach (float side in new[] { -1f, 1f })
            {
                Transform hip = GameplayAssetUtil.Child(side > 0f ? "FootL" : "FootR", rig.squash, new Vector3(0.15f * side, 0.05f, 0.1f)).transform;
                GameObject f = GameplayAssetUtil.Child("Nub", hip, new Vector3(0f, -0.1f, 0.02f));
                f.transform.localScale = new Vector3(0.15f, 0.13f, 0.19f);
                f.AddComponent<MeshFilter>().sharedMesh = sphere;
                MeshRenderer mr = f.AddComponent<MeshRenderer>();
                mr.sharedMaterial = m;
                mr.shadowCastingMode = ShadowCastingMode.Off;
                mr.receiveShadows = false;
                if (side > 0f) rig.footL = hip; else rig.footR = hip;
            }
        }

        // ---- material ------------------------------------------------------------------------------------------------
        static Material BennyMaterial()
        {
            Shader sh = GameplayAssetUtil.FindShader(ShaderPath, "Rainbow/Benny/Fluff");
            Material m = GameplayAssetUtil.LoadOrCreateMaterial(MatDir + "/Benny_Fluff.mat", sh);
            TextureImporter imp = AssetImporter.GetAtPath(BakePath) as TextureImporter;
            if (imp != null && (!imp.sRGBTexture || imp.maxTextureSize < 2048 || imp.textureType != TextureImporterType.Default))
            {
                imp.textureType = TextureImporterType.Default;
                imp.sRGBTexture = true;
                imp.maxTextureSize = 2048;
                imp.mipmapEnabled = true;
                imp.SaveAndReimport();
            }
            Texture2D bake = AssetDatabase.LoadAssetAtPath<Texture2D>(BakePath);
            if (bake == null) Debug.LogWarning("[Rainbow Agent4] missing " + BakePath + " (Benny will be white).");
            if (m.HasProperty("_BaseMap")) m.SetTexture("_BaseMap", bake);
            if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", Color.white);
            if (m.HasProperty("_BakeGain")) m.SetFloat("_BakeGain", 4f);
            if (m.HasProperty("_LightInfluence")) m.SetFloat("_LightInfluence", 0.35f);
            // Coordinator look tuning 2026-11-23 (screen05_tune_look.cs, saved in commit a78f508): a weaker, pinker fuzz
            // rim so it no longer blooms into a white halo round Benny (shader defaults 0.35 / (1, 0.82, 0.93)).
            if (m.HasProperty("_FuzzStrength")) m.SetFloat("_FuzzStrength", 0.15f);
            if (m.HasProperty("_FuzzColor")) m.SetColor("_FuzzColor", new Color(1f, 0.62f, 0.86f, 1f));
            // (splash6 2026-11-24) approved: his fur darkens to deep magenta where he sits in the water (y 1168-1200 was
            // 30-90 luma too bright), with no hard edge (SplashWake writes the water height as _RainbowBennyWater)
            if (m.HasProperty("_UnderShade")) m.SetFloat("_UnderShade", UnderShade);
            if (m.HasProperty("_UnderHeight")) m.SetFloat("_UnderHeight", UnderHeight);
            if (m.HasProperty("_UnderColor")) m.SetColor("_UnderColor", new Color(0.62f, 0.36f, 0.78f, 1f));
            if (m.HasProperty("_WaterBand")) m.SetFloat("_WaterBand", WaterBand);
            EditorUtility.SetDirty(m);
            return m;
        }

        /// <summary>(splash6) underside / waterline shade strengths on Benny_Fluff (0 = off).</summary>
        // splash6_t2 variants: band 0.35 -> 0 splash 77.1 -> 77.7; shade 0.8 -> 1.0 (height 0.42) 77.1 -> 76.7.
        // splash6_t6: shade 0.9 over 0.2 u = benny +0.2
        public const float UnderShade = 0.9f, UnderHeight = 0.2f, WaterBand = 0f;

        static Material FlatFluff(string name, Color c)
        {
            Shader sh = GameplayAssetUtil.FindShader(ShaderPath, "Rainbow/Benny/Fluff");
            Material m = GameplayAssetUtil.LoadOrCreateMaterial(MatDir + "/" + name + ".mat", sh);
            if (m.HasProperty("_BaseMap")) m.SetTexture("_BaseMap", Texture2D.whiteTexture);
            if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", c);
            if (m.HasProperty("_BakeGain")) m.SetFloat("_BakeGain", 1f);
            if (m.HasProperty("_LightInfluence")) m.SetFloat("_LightInfluence", 1f);
            EditorUtility.SetDirty(m);
            return m;
        }

        // ---- glb -> skinned mesh -------------------------------------------------------------------------------------
#pragma warning disable 0649 // filled by JsonUtility
        [Serializable] class GJson { public GAccessor[] accessors; public GBufferView[] bufferViews; public GMesh[] meshes; }
        [Serializable] class GAccessor { public int bufferView = -1; public int byteOffset; public int componentType; public int count; public string type; }
        [Serializable] class GBufferView { public int buffer; public int byteOffset; public int byteLength; public int byteStride; }
        [Serializable] class GMesh { public string name; public GPrimitive[] primitives; }
        [Serializable] class GPrimitive { public GAttributes attributes; public int indices = -1; public int mode = 4; }
        [Serializable] class GAttributes { public int POSITION = -1; public int NORMAL = -1; public int TEXCOORD_0 = -1; }
#pragma warning restore 0649

        static float Smooth(float e0, float e1, float x)
        {
            float t = Mathf.Clamp01((x - e0) / (e1 - e0));
            return t * t * (3f - 2f * t);
        }

        static Mesh BuildSkinnedMesh()
        {
            string full = GameplayAssetUtil.FullPath(GlbPath);
            if (!File.Exists(full)) throw new FileNotFoundException(GlbPath);
            byte[] glb = File.ReadAllBytes(full);
            if (glb.Length < 28 || BitConverter.ToUInt32(glb, 0) != 0x46546C67u) throw new Exception("not a GLB");
            int jsonLen = (int)BitConverter.ToUInt32(glb, 12);
            string json = System.Text.Encoding.UTF8.GetString(glb, 20, jsonLen);
            int binChunk = 20 + jsonLen;
            int binStart = binChunk + 8;
            GJson g = JsonUtility.FromJson<GJson>(json);
            if (g == null || g.meshes == null || g.meshes.Length == 0) throw new Exception("no meshes");
            GPrimitive prim = g.meshes[0].primitives[0];
            if (prim.attributes == null || prim.attributes.POSITION < 0) throw new Exception("no POSITION");

            Vector3[] pos = ReadVec3(glb, binStart, g, prim.attributes.POSITION);
            Vector3[] nrm = prim.attributes.NORMAL >= 0 ? ReadVec3(glb, binStart, g, prim.attributes.NORMAL) : null;
            Vector2[] uv = prim.attributes.TEXCOORD_0 >= 0 ? ReadVec2(glb, binStart, g, prim.attributes.TEXCOORD_0) : null;
            int[] idx = prim.indices >= 0 ? ReadIndices(glb, binStart, g, prim.indices) : Sequential(pos.Length);

            int n = pos.Length;
            Vector3[] v = new Vector3[n];
            Vector3[] vn = new Vector3[n];
            Vector2[] vt = new Vector2[n];
            BoneWeight[] bw = new BoneWeight[n];
            for (int i = 0; i < n; i++)
            {
                Vector3 p = pos[i];
                v[i] = new Vector3(-p.x, p.y, p.z);
                vn[i] = nrm != null ? new Vector3(-nrm[i].x, nrm[i].y, nrm[i].z) : Vector3.up;
                vt[i] = uv != null ? new Vector2(uv[i].x, 1f - uv[i].y) : Vector2.zero;
                float wa = Smooth(0.30f, 0.37f, Mathf.Abs(p.x)) * (1f - Smooth(0.08f, 0.16f, Mathf.Abs(p.y + 0.18f)));
                float wp = Smooth(0.17f, 0.27f, p.y);
                if (wa > 1e-4f) bw[i] = Two(p.x >= 0f ? 2 : 1, wa, 0);   // glTF +x = his right = ArmR (bone 2)
                else if (wp > 1e-4f) bw[i] = Two(3, wp, 0);
                else { BoneWeight b = new BoneWeight(); b.boneIndex0 = 0; b.weight0 = 1f; bw[i] = b; }
            }
            int[] tri = new int[idx.Length];
            for (int t = 0; t + 2 < idx.Length; t += 3)
            {
                tri[t] = idx[t];
                tri[t + 1] = idx[t + 2];
                tri[t + 2] = idx[t + 1];
            }

            string meshPath = GenDir + "/Benny31_Skinned.asset";
            bool isNew;
            Mesh m = GameplayAssetUtil.LoadOrNewMesh(meshPath, out isNew);
            m.indexFormat = n > 65000 ? IndexFormat.UInt32 : IndexFormat.UInt16;
            m.vertices = v;
            m.normals = vn;
            m.uv = vt;
            m.triangles = tri;
            m.boneWeights = bw;
            m.bindposes = new[]
            {
                Matrix4x4.Translate(-SquashPivot),
                Matrix4x4.Translate(-ArmLPivot),
                Matrix4x4.Translate(-ArmRPivot),
                Matrix4x4.Translate(-PomPivot),
            };
            m.RecalculateBounds();
            GameplayAssetUtil.FinishMesh(m, meshPath, isNew);
            return m;
        }

        static BoneWeight Two(int bone, float w, int other)
        {
            BoneWeight b = new BoneWeight();
            if (w >= 0.5f)
            {
                b.boneIndex0 = bone; b.weight0 = w;
                b.boneIndex1 = other; b.weight1 = 1f - w;
            }
            else
            {
                b.boneIndex0 = other; b.weight0 = 1f - w;
                b.boneIndex1 = bone; b.weight1 = w;
            }
            return b;
        }

        static int ViewStart(GJson g, int binStart, GAccessor a, out int stride, int defaultStride)
        {
            GBufferView bv = g.bufferViews[a.bufferView];
            stride = bv.byteStride > 0 ? bv.byteStride : defaultStride;
            return binStart + bv.byteOffset + a.byteOffset;
        }

        static Vector3[] ReadVec3(byte[] b, int binStart, GJson g, int accessor)
        {
            GAccessor a = g.accessors[accessor];
            if (a.componentType != 5126) throw new Exception("VEC3 accessor is not float");
            int stride;
            int o = ViewStart(g, binStart, a, out stride, 12);
            Vector3[] r = new Vector3[a.count];
            for (int i = 0; i < a.count; i++, o += stride)
                r[i] = new Vector3(BitConverter.ToSingle(b, o), BitConverter.ToSingle(b, o + 4), BitConverter.ToSingle(b, o + 8));
            return r;
        }

        static Vector2[] ReadVec2(byte[] b, int binStart, GJson g, int accessor)
        {
            GAccessor a = g.accessors[accessor];
            if (a.componentType != 5126) throw new Exception("VEC2 accessor is not float");
            int stride;
            int o = ViewStart(g, binStart, a, out stride, 8);
            Vector2[] r = new Vector2[a.count];
            for (int i = 0; i < a.count; i++, o += stride)
                r[i] = new Vector2(BitConverter.ToSingle(b, o), BitConverter.ToSingle(b, o + 4));
            return r;
        }

        static int[] ReadIndices(byte[] b, int binStart, GJson g, int accessor)
        {
            GAccessor a = g.accessors[accessor];
            int size = a.componentType == 5125 ? 4 : a.componentType == 5123 ? 2 : 1;
            int stride;
            int o = ViewStart(g, binStart, a, out stride, size);
            int[] r = new int[a.count];
            for (int i = 0; i < a.count; i++, o += stride)
            {
                if (size == 4) r[i] = (int)BitConverter.ToUInt32(b, o);
                else if (size == 2) r[i] = BitConverter.ToUInt16(b, o);
                else r[i] = b[o];
            }
            return r;
        }

        static int[] Sequential(int n)
        {
            int[] r = new int[n];
            for (int i = 0; i < n; i++) r[i] = i;
            return r;
        }

        // ---- fallback 1: glTFast prefab --------------------------------------------------------------------------------
        static bool TryGltfPrefab(Rig rig, Material mat)
        {
            GameObject prefab = AssetDatabase.LoadAssetAtPath<GameObject>(GlbPath);
            if (prefab == null) return false;
            GameObject inst = PrefabUtility.InstantiatePrefab(prefab) as GameObject;
            if (inst == null) return false;
            inst.transform.SetParent(rig.squash, false);
            inst.transform.localPosition = -SquashPivot;
            inst.transform.localRotation = Quaternion.identity;
            inst.transform.localScale = Vector3.one;
            foreach (Renderer r in inst.GetComponentsInChildren<Renderer>(true)) r.sharedMaterial = mat;
            return true;
        }

        // ---- fallback 2: procedural Benny (model space: height ~0.99, rear on +Z, his right = -X) -----------------------
        static void BuildProceduralFallback(Rig rig)
        {
            Material pink = FlatFluff("Benny_Fallback_Pink", new Color(1f, 0.45f, 0.72f));
            Material purple = FlatFluff("Benny_Fallback_Purple", new Color(0.45f, 0.2f, 0.95f));
            Material cream = FlatFluff("Benny_Fallback_Cream", new Color(0.97f, 0.93f, 0.97f));
            Material yellow = FlatFluff("Benny_Fallback_Star", new Color(1f, 0.85f, 0.1f));
            Transform sq = rig.squash;
            Prim(PrimitiveType.Sphere, "Body", sq, new Vector3(0f, 0.36f, 0f), new Vector3(0.74f, 0.70f, 0.74f), pink);
            Prim(PrimitiveType.Sphere, "ArmNub", rig.armL, new Vector3(0.05f, 0f, 0f), Vector3.one * 0.2f, pink);
            Prim(PrimitiveType.Sphere, "ArmNub", rig.armR, new Vector3(-0.05f, 0f, 0f), Vector3.one * 0.2f, pink);
            Prim(PrimitiveType.Cylinder, "Cuff", sq, new Vector3(0f, 0.63f, 0f), new Vector3(0.74f, 0.07f, 0.74f), purple);
            Prim(PrimitiveType.Sphere, "Crown", sq, new Vector3(0f, 0.72f, 0f), new Vector3(0.66f, 0.5f, 0.66f), cream);
            Prim(PrimitiveType.Cylinder, "Stripe", sq, new Vector3(0f, 0.8f, 0f), new Vector3(0.62f, 0.035f, 0.62f), purple);
            Prim(PrimitiveType.Sphere, "PomBall", rig.pom, new Vector3(0f, 0.27f, -0.05f), Vector3.one * 0.3f, purple);
            Prim(PrimitiveType.Sphere, "Star", sq, new Vector3(-0.3f, 0.65f, 0.2f), new Vector3(0.1f, 0.1f, 0.03f), yellow);
        }

        static void Prim(PrimitiveType type, string name, Transform parent, Vector3 pos, Vector3 scale, Material m)
        {
            GameObject go = GameObject.CreatePrimitive(type);
            go.name = name;
            Collider c = go.GetComponent<Collider>();
            if (c != null) UnityEngine.Object.DestroyImmediate(c);
            go.transform.SetParent(parent, false);
            go.transform.localPosition = pos;
            go.transform.localScale = scale;
            Renderer r = go.GetComponent<Renderer>();
            r.sharedMaterial = m;
            r.shadowCastingMode = ShadowCastingMode.Off;
        }

        // ---- animation -----------------------------------------------------------------------------------------------
        delegate Quaternion RotFn(float t);
        delegate Vector3 VecFn(float t);

        class ClipWriter
        {
            public readonly AnimationClip clip;
            readonly float length;
            readonly int samples;

            public ClipWriter(string name, float length, int samples)
            {
                clip = new AnimationClip();
                clip.name = name;
                clip.frameRate = 60f;
                this.length = length;
                this.samples = Mathf.Max(1, samples);
            }

            float T(int i) { return length * i / samples; }

            AnimationCurve Curve(Func<float, float> f)
            {
                Keyframe[] k = new Keyframe[samples + 1];
                for (int i = 0; i <= samples; i++) k[i] = new Keyframe(T(i), f(T(i)));
                AnimationCurve c = new AnimationCurve(k);
                for (int i = 0; i <= samples; i++) c.SmoothTangents(i, 0f);
                return c;
            }

            public void Rot(string path, RotFn f)
            {
                Quaternion[] q = new Quaternion[samples + 1];
                for (int i = 0; i <= samples; i++)
                {
                    q[i] = f(T(i));
                    if (i > 0 && Quaternion.Dot(q[i], q[i - 1]) < 0f) q[i] = new Quaternion(-q[i].x, -q[i].y, -q[i].z, -q[i].w);
                }
                clip.SetCurve(path, typeof(Transform), "localRotation.x", Curve(t => q[Index(t)].x));
                clip.SetCurve(path, typeof(Transform), "localRotation.y", Curve(t => q[Index(t)].y));
                clip.SetCurve(path, typeof(Transform), "localRotation.z", Curve(t => q[Index(t)].z));
                clip.SetCurve(path, typeof(Transform), "localRotation.w", Curve(t => q[Index(t)].w));
            }

            int Index(float t) { return Mathf.Clamp(Mathf.RoundToInt(t / length * samples), 0, samples); }

            public void Pos(string path, VecFn f)
            {
                clip.SetCurve(path, typeof(Transform), "localPosition.x", Curve(t => f(t).x));
                clip.SetCurve(path, typeof(Transform), "localPosition.y", Curve(t => f(t).y));
                clip.SetCurve(path, typeof(Transform), "localPosition.z", Curve(t => f(t).z));
            }

            public void Scale(string path, VecFn f)
            {
                clip.SetCurve(path, typeof(Transform), "localScale.x", Curve(t => f(t).x));
                clip.SetCurve(path, typeof(Transform), "localScale.y", Curve(t => f(t).y));
                clip.SetCurve(path, typeof(Transform), "localScale.z", Curve(t => f(t).z));
            }

            public AnimationClip Save(string assetPath, bool loop)
            {
                clip.EnsureQuaternionContinuity();
                AnimationClipSettings s = AnimationUtility.GetAnimationClipSettings(clip);
                s.loopTime = loop;
                s.stopTime = length;
                AnimationUtility.SetAnimationClipSettings(clip, s);
                GameplayAssetUtil.DeleteIfExists(assetPath);
                AssetDatabase.CreateAsset(clip, assetPath);
                return clip;
            }
        }

        static Quaternion Euler(float xRad, float yRad, float zRad)
        {
            return Quaternion.Euler(xRad * Mathf.Rad2Deg, yRad * Mathf.Rad2Deg, zRad * Mathf.Rad2Deg);
        }

        /// <summary>Round 4: arm nub size and rest raise (rad), measured on the approved Benny (nub centres y 1043, 50 px across).</summary>
        const float ArmScale = 0.8f, ArmRest = 0.30f;

        /// <summary>benny31.ts doggy-paddle stroke expressed in Unity mesh space (X mirrored => Y / Z angles negate).</summary>
        static Quaternion ArmStroke(bool hisRight, float ph, float weight)
        {
            float side = hisRight ? 1f : -1f;            // glTF side sign
            float phase = ph + (hisRight ? 0f : Mathf.PI);
            // round 4 (2026-11-24): 0.42 / 0.5 -> 0.30 / 0.36 (approved: two short level arm nubs; a full stroke threw one arm out)
            float z = -side * weight * 0.24f * Mathf.Sin(phase);
            float y = -side * weight * 0.10f * Mathf.Cos(phase);
            return ArmRaise(hisRight, ArmRest) * Quaternion.AngleAxis(y * Mathf.Rad2Deg, Vector3.up) * Quaternion.AngleAxis(z * Mathf.Rad2Deg, Vector3.forward);
        }

        /// <summary>Arms raised (+) or dropped (-) sideways, radians; his right arm is on mesh -X.</summary>
        static Quaternion ArmRaise(bool hisRight, float rad)
        {
            return Quaternion.AngleAxis((hisRight ? -rad : rad) * Mathf.Rad2Deg, Vector3.forward);
        }

        /// <summary>Round 4: phases of the swim cycle at clip start. He passes the approved view 1.533 s into the cycle (normalized 1.8303):
        /// body phase 7 pi / 4 there (squash 0.97 = the approved height: pompom top y 770, waterline 1192), no roll, level arms.</summary>
        const float SwimPhase = 0.281f, ArmPhase = 1.066f, RollZero = 5.498f;

        static void SwimBody(ClipWriter w, float leanSign)
        {
            float T = SwimCycle;
            float Ph(float t) => 2f * Mathf.PI * t / T + SwimPhase;
            float ArmPh(float t) => 2f * Mathf.PI * t / T + ArmPhase;
            w.Rot(PathLean, t => Euler(0f, leanSign * LeanYawRad, -leanSign * LeanRollRad));
            w.Pos(PathBob, t => new Vector3(0f, Mathf.Abs(Mathf.Sin(Ph(t))) * 0.04f - 0.01f, 0f));
            w.Rot(PathBob, t => { float ph = Ph(t); return Euler(Mathf.Sin(ph * 2f) * 0.03f, 0f, Mathf.Sin(ph - RollZero) * 0.05f); });
            w.Scale(PathSquash, t =>
            {
                float sq = 1f + 0.03f * Mathf.Sin(2f * Ph(t));
                float xz = 1f / Mathf.Sqrt(sq);
                return new Vector3(xz, sq, xz);
            });
            w.Rot(PathArmR, t => ArmStroke(true, ArmPh(t), 1f));
            w.Rot(PathArmL, t => ArmStroke(false, ArmPh(t), 1f));
        }

        static AnimatorController BuildController()
        {
            int n = 24;
            ClipWriter swim = new ClipWriter("Benny_Swim", SwimCycle, n);
            SwimBody(swim, 0f);
            AnimationClip swimClip = swim.Save(AnimDir + "/Benny_Swim.anim", true);

            ClipWriter left = new ClipWriter("Benny_SwimLeanLeft", SwimCycle, n);
            SwimBody(left, -1f);
            AnimationClip leftClip = left.Save(AnimDir + "/Benny_SwimLeanLeft.anim", true);

            ClipWriter right = new ClipWriter("Benny_SwimLeanRight", SwimCycle, n);
            SwimBody(right, 1f);
            AnimationClip rightClip = right.Save(AnimDir + "/Benny_SwimLeanRight.anim", true);

            // Jump: take-off stretch, arms up
            float jl = 0.3f;
            ClipWriter jump = new ClipWriter("Benny_Jump", jl, 18);
            jump.Rot(PathLean, t => Quaternion.identity);
            jump.Pos(PathBob, t => Vector3.zero);
            jump.Rot(PathBob, t => Euler(-0.12f * Mathf.Sin(Mathf.PI * Mathf.Clamp01(t / jl)), 0f, 0f));
            jump.Scale(PathSquash, t =>
            {
                float k = Mathf.Clamp01(t / jl);
                float s = k < 0.25f ? Mathf.Lerp(0.86f, 1.2f, k / 0.25f) : Mathf.Lerp(1.2f, 1.07f, (k - 0.25f) / 0.75f);
                float xz = 1f / Mathf.Sqrt(s);
                return new Vector3(xz, s, xz);
            });
            jump.Rot(PathArmR, t => ArmRaise(true, Mathf.Lerp(0f, 0.75f, Mathf.Clamp01(t / (jl * 0.5f)))));
            jump.Rot(PathArmL, t => ArmRaise(false, Mathf.Lerp(0f, 0.75f, Mathf.Clamp01(t / (jl * 0.5f)))));
            AnimationClip jumpClip = jump.Save(AnimDir + "/Benny_Jump.anim", false);

            // Fall: airborne flutter, slightly stretched
            float fl = 0.5f;
            ClipWriter fall = new ClipWriter("Benny_Fall", fl, 16);
            fall.Rot(PathLean, t => Quaternion.identity);
            fall.Pos(PathBob, t => Vector3.zero);
            fall.Rot(PathBob, t => Euler(0.05f * Mathf.Sin(2f * Mathf.PI * t / fl), 0f, 0.04f * Mathf.Sin(2f * Mathf.PI * t / fl + 1f)));
            fall.Scale(PathSquash, t => new Vector3(0.96f, 1.05f, 0.96f));
            fall.Rot(PathArmR, t => ArmRaise(true, 0.6f + 0.18f * Mathf.Sin(2f * Mathf.PI * t / fl)));
            fall.Rot(PathArmL, t => ArmRaise(false, 0.6f + 0.18f * Mathf.Sin(2f * Mathf.PI * t / fl + Mathf.PI)));
            AnimationClip fallClip = fall.Save(AnimDir + "/Benny_Fall.anim", true);

            // Land: splash-down squash, then recover
            float ll = 0.34f;
            ClipWriter land = new ClipWriter("Benny_Land", ll, 20);
            land.Rot(PathLean, t => Quaternion.identity);
            land.Pos(PathBob, t =>
            {
                float k = Mathf.Clamp01(t / ll);
                return new Vector3(0f, -0.07f * Mathf.Sin(Mathf.PI * Mathf.Clamp01(k / 0.6f)), 0f);
            });
            land.Rot(PathBob, t => Quaternion.identity);
            land.Scale(PathSquash, t =>
            {
                float k = Mathf.Clamp01(t / ll);
                float s;
                if (k < 0.18f) s = Mathf.Lerp(1.0f, 0.74f, k / 0.18f);
                else if (k < 0.5f) s = Mathf.Lerp(0.74f, 1.08f, (k - 0.18f) / 0.32f);
                else s = Mathf.Lerp(1.08f, 1.0f, (k - 0.5f) / 0.5f);
                float xz = 1f / Mathf.Sqrt(s);
                return new Vector3(xz, s, xz);
            });
            land.Rot(PathArmR, t => ArmRaise(true, -0.35f * Mathf.Sin(Mathf.PI * Mathf.Clamp01(t / ll))));
            land.Rot(PathArmL, t => ArmRaise(false, -0.35f * Mathf.Sin(Mathf.PI * Mathf.Clamp01(t / ll))));
            AnimationClip landClip = land.Save(AnimDir + "/Benny_Land.anim", false);

            string ctrlPath = AnimDir + "/Benny.controller";
            GameplayAssetUtil.DeleteIfExists(ctrlPath);
            AnimatorController ctrl = AnimatorController.CreateAnimatorControllerAtPath(ctrlPath);
            ctrl.AddParameter("Steer", AnimatorControllerParameterType.Float);
            AnimatorControllerParameter speedP = new AnimatorControllerParameter();
            speedP.name = "SwimSpeed"; speedP.type = AnimatorControllerParameterType.Float; speedP.defaultFloat = 1f;
            ctrl.AddParameter(speedP);
            AnimatorControllerParameter groundedP = new AnimatorControllerParameter();
            groundedP.name = "Grounded"; groundedP.type = AnimatorControllerParameterType.Bool; groundedP.defaultBool = true;
            ctrl.AddParameter(groundedP);
            ctrl.AddParameter("Jump", AnimatorControllerParameterType.Trigger);
            ctrl.AddParameter("VerticalSpeed", AnimatorControllerParameterType.Float);

            AnimatorStateMachine sm = ctrl.layers[0].stateMachine;
            BlendTree tree;
            AnimatorState swimState = ctrl.CreateBlendTreeInController("Swim", out tree, 0);
            tree.name = "SwimSteer";
            tree.blendType = BlendTreeType.Simple1D;
            tree.blendParameter = "Steer";
            tree.useAutomaticThresholds = false;
            tree.AddChild(leftClip, -1f);
            tree.AddChild(swimClip, 0f);
            tree.AddChild(rightClip, 1f);
            swimState.speedParameterActive = true;
            swimState.speedParameter = "SwimSpeed";
            sm.defaultState = swimState;

            AnimatorState jumpState = sm.AddState("Jump");
            jumpState.motion = jumpClip;
            AnimatorState fallState = sm.AddState("Fall");
            fallState.motion = fallClip;
            AnimatorState landState = sm.AddState("Land");
            landState.motion = landClip;

            AnimatorStateTransition t1 = swimState.AddTransition(jumpState);
            t1.hasExitTime = false; t1.duration = 0.06f;
            t1.AddCondition(AnimatorConditionMode.If, 0f, "Jump");

            AnimatorStateTransition t2 = swimState.AddTransition(fallState);
            t2.hasExitTime = false; t2.duration = 0.15f;
            t2.AddCondition(AnimatorConditionMode.IfNot, 0f, "Grounded");

            AnimatorStateTransition t3 = jumpState.AddTransition(fallState);
            t3.hasExitTime = true; t3.exitTime = 0.95f; t3.duration = 0.1f;

            AnimatorStateTransition t4 = jumpState.AddTransition(landState);
            t4.hasExitTime = false; t4.duration = 0.04f;
            t4.AddCondition(AnimatorConditionMode.If, 0f, "Grounded");

            AnimatorStateTransition t5 = fallState.AddTransition(landState);
            t5.hasExitTime = false; t5.duration = 0.04f;
            t5.AddCondition(AnimatorConditionMode.If, 0f, "Grounded");

            AnimatorStateTransition t6 = landState.AddTransition(swimState);
            t6.hasExitTime = true; t6.exitTime = 0.85f; t6.duration = 0.12f;

            EditorUtility.SetDirty(ctrl);
            AssetDatabase.SaveAssets();
            return ctrl;
        }
    }
}

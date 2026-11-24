using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace Rainbow.Screen05
{
    /// <summary>
    /// The long continuous course (master direction 2026-11-24: 30-60 s of unbroken swimming through one real 3D washing machine).
    /// The scene builder bakes the approved stretch (s -12 .. 120 river / foam, walls and rings to s 470); this component builds the
    /// rest once at the start of Play from the SAME generators (river surface, foam puffs, wall bays, ring bands, paddles), so there is
    /// no seam, and nothing has to be stored in the repository. Everything stands at fixed world positions: Benny and the camera
    /// travel through it. To keep the approved view at s = 14 untouched, extra rings / paddles that the picture does not show grow
    /// out of the wall far ahead (> 60-110 m away, a few pixels) before he reaches them, and the bright throat cap stays far ahead
    /// (it recedes at 65 % of his speed, so the light slowly gets nearer).
    /// </summary>
    [DefaultExecutionOrder(50)]
    public class Course05Extension : MonoBehaviour
    {
        public const float FoamEnd = 660f;
        /// <summary>Rings added between the approved ones (fill) and beyond them (the first four of the far set are permanent).</summary>
        static readonly float[] FillRings = { 132.5f, 183f, 206.5f, 256.5f, 308f, 357f, 381f, 404f, 427f };
        static readonly float[] FarRings = { 474f, 500f, 526f, 552f, 580f, 612f, 650f, 700f, 760f };

        struct Grow { public Transform t; public float s, d0, d1, scale; public Vector3 home, outward; public Renderer r; }

        readonly List<Grow> grows = new List<Grow>();
        readonly List<Object> owned = new List<Object>();
        Transform cap;
        Transform root;
        bool built;

        void Start() { Build(); }

        void OnDestroy()
        {
            foreach (Object o in owned) if (o != null) Destroy(o);
            owned.Clear();
        }

        static Transform FindPath(Transform scene, string path) => scene != null ? scene.Find(path) : null;

        void Build()
        {
            if (built) return;
            built = true;
            Transform scene = transform;
            while (scene.parent != null) scene = scene.parent;
            root = new GameObject("Course05 (run time)").transform;
            root.SetParent(scene, false);

            Transform env = FindPath(scene, "Environment05"), water = FindPath(scene, "Water05");
            Renderer wallR = Rend(FindPath(env, "DrumWall/Wall_Bay7")), riverR = Rend(FindPath(water, "River05"));
            Renderer foamR = null;
            Transform foamRoot = FindPath(water, "FoamBanks05");
            if (foamRoot != null && foamRoot.childCount > 0) foamR = foamRoot.GetChild(0).GetComponentInChildren<Renderer>();
            Transform rings = FindPath(env, "Rings"), paddles = FindPath(env, "Paddles");
            Material ringNear = null, ringFar = null;
            if (rings != null)
                foreach (Renderer r in rings.GetComponentsInChildren<Renderer>())
                {
                    if (r.name == "Ring_46") ringNear = r.sharedMaterial;
                    if (r.name == "Ring_283") ringFar = r.sharedMaterial;
                }
            if (ringNear == null) ringNear = ringFar;

            // ---- river (replaces the simple far river)
            Transform farRiver = FindPath(env, "FarThroat/FarRiver");
            if (riverR != null)
            {
                if (farRiver != null) farRiver.gameObject.SetActive(false);
                float[] cuts = { RiverPath.TunnelLength, 200f, 290f, 380f, 470f, 620f, RiverPath.CourseLength };
                for (int i = 0; i + 1 < cuts.Length; i++)
                    Add("River_" + i, RiverMeshGenerator.Build(i < 4 ? 0.5f : 1f, i < 4 ? 46 : 30, cuts[i], cuts[i + 1], "River05x_" + i), riverR.sharedMaterial);
            }
            // ---- walls beyond the baked ones
            if (wallR != null)
            {
                float[] t = { -122, -102, -69.5f, -38.5f, -9, 23, 54, 86, 107, 125 };
                float[] k = { 0.3f, 0.5f, 0.8f, 0.9f, 0.8f, 0.8f, 0.9f, 0.6f, 0.6f, 0.3f };
                float[] w = { DrumLayout05.ThroatS, 560f, 660f, 800f };
                for (int i = 0; i + 1 < w.Length; i++)
                    Add("Wall_" + i, DrumPolish05.BuildWallBay(new DrumPolish05.WallBay(w[i], w[i + 1], 8f, t, t, k), 96, "DrumWall05x_" + i), wallR.sharedMaterial);
            }
            // ---- rings
            if (ringNear != null)
            {
                float rr = DrumLayout05.Radius - DrumLayout05.RingInset;
                Mesh mA = DrumPolish05.BuildRing(DrumLayout05.NearBand, rr, 120, DrumPolish05.LampsFor(50f), "Ring05x_A", 1000f);
                Mesh mB = DrumPolish05.BuildRing(DrumLayout05.NearBand, rr, 120, DrumPolish05.LampsFor(110f), "Ring05x_B", 1000f);
                owned.Add(mA); owned.Add(mB);
                for (int i = 0; i < FillRings.Length; i++) AddRing(FillRings[i], (i & 1) == 0 ? mB : mA, ringNear, true);
                for (int i = 0; i < FarRings.Length; i++) AddRing(FarRings[i], (i & 1) == 0 ? mA : mB, ringNear, i % 2 == 0);
            }
            // ---- paddles: copies of the approved ones, sliding out of the wall far ahead
            if (paddles != null)
            {
                string[] names = { "Paddle_L_big", "Paddle_R_big", "Paddle_L_mid", "Paddle_R_mid" };
                int n = 0;
                for (float s = 146f; s < 640f; s += 19f, n++)
                {
                    Transform src = paddles.Find(names[n & 3]);
                    if (src == null) continue;
                    Vector3 p = src.position, c0 = DrumLayout05.Centre(p.z), c1 = DrumLayout05.Centre(s);
                    float rs = DrumLayout05.RadiusAt(s) / DrumLayout05.RadiusAt(p.z);
                    GameObject go = AddShared("Paddle_" + Mathf.RoundToInt(s), src.GetComponent<MeshFilter>().sharedMesh, src.GetComponent<Renderer>().sharedMaterial);
                    Vector3 home = new Vector3(c1.x + (p.x - c0.x) * rs, c1.y + (p.y - c0.y) * rs, s);
                    float side = p.x < c0.x ? -1f : 1f;
                    go.transform.SetPositionAndRotation(home, src.rotation);
                    go.transform.localScale = src.localScale;
                    grows.Add(new Grow { t = go.transform, s = s, d0 = 74f, d1 = Mathf.Min(s - 16f, 118f), home = home, outward = new Vector3(side * 3.4f, 1.2f, 0f), r = go.GetComponent<Renderer>() });
                }
            }
            // ---- foam (the same puffs; a little thinner): built in small pieces over the first second, long before he gets there (no hitch)
            if (foamR != null) StartCoroutine(BuildFoam(foamR.sharedMaterial));
            // ---- throat
            cap = FindPath(env, "FarThroat/ThroatCap");
            Tick(RiverPath.StartS - 6.52f);
        }

        System.Collections.IEnumerator BuildFoam(Material mat)
        {
            const float step = 20f;
            for (float a = RiverPath.TunnelLength; a < FoamEnd; a += step)
            {
                yield return null;
                List<FoamBank.Puff> puffs = FoamBank.GenerateRange(a, Mathf.Min(a + step, FoamEnd), (uint)(0x0577u + (uint)a * 31u), 0.8f);
                foreach (FoamBank.Chunk c in FoamBank.BuildChunks(puffs, step))
                {
                    var go = new GameObject("x" + c.name);
                    go.transform.SetParent(root, false);
                    Renderer r0 = AddChild(go.transform, "LOD0", c.lod0, mat), r1 = AddChild(go.transform, "LOD1", c.lod1, mat);
                    LODGroup lg = go.AddComponent<LODGroup>();
                    lg.SetLODs(new[] { new LOD(0.2f, new[] { r0 }), new LOD(0.004f, new[] { r1 }) });
                    lg.RecalculateBounds();
                }
            }
        }

        static Renderer Rend(Transform t) => t != null ? t.GetComponent<Renderer>() : null;

        void AddRing(float s, Mesh mesh, Material mat, bool grow)
        {
            GameObject go = AddShared("Ring_" + Mathf.RoundToInt(s), mesh, mat);
            float k = DrumLayout05.RadiusAt(s) / DrumLayout05.Radius;
            go.transform.localPosition = DrumLayout05.Centre(s);
            go.transform.localScale = Vector3.one * k;
            if (!grow) return;
            float d1 = Mathf.Min(s - 10f, 172f);      // never visible in the approved view (camera at s 7.5)
            grows.Add(new Grow { t = go.transform, s = s, d0 = d1 * 0.64f, d1 = d1, scale = k, r = go.GetComponent<Renderer>() });
        }

        GameObject AddShared(string n, Mesh mesh, Material mat)
        {
            var go = new GameObject(n);
            go.transform.SetParent(root, false);
            AddComponents(go, mesh, mat);
            return go;
        }

        void Add(string n, Mesh mesh, Material mat)
        {
            owned.Add(mesh);
            AddShared(n, mesh, mat);
        }

        Renderer AddChild(Transform parent, string n, Mesh mesh, Material mat)
        {
            owned.Add(mesh);
            var go = new GameObject(n);
            go.transform.SetParent(parent, false);
            return AddComponents(go, mesh, mat);
        }

        static Renderer AddComponents(GameObject go, Mesh mesh, Material mat)
        {
            go.AddComponent<MeshFilter>().sharedMesh = mesh;
            MeshRenderer mr = go.AddComponent<MeshRenderer>();
            mr.sharedMaterial = mat;
            mr.shadowCastingMode = ShadowCastingMode.Off;
            mr.receiveShadows = false;
            mr.lightProbeUsage = LightProbeUsage.Off;
            mr.reflectionProbeUsage = ReflectionProbeUsage.Off;
            return mr;
        }

        void LateUpdate()
        {
            Camera cam = Camera.main;
            if (cam != null) Tick(cam.transform.position.z);
        }

        void Tick(float camS)
        {
            for (int i = 0; i < grows.Count; i++)
            {
                Grow g = grows[i];
                float e = Mathf.Clamp01((g.d1 - (g.s - camS)) / Mathf.Max(1f, g.d1 - g.d0));
                e = e * e * (3f - 2f * e);
                bool on = e > 0.001f;
                if (g.r.enabled != on) g.r.enabled = on;
                if (!on) continue;
                if (g.scale > 0f) g.t.localScale = Vector3.one * (g.scale * (1f + 0.17f * (1f - e)));   // out of the wall
                else g.t.position = g.home + g.outward * (1f - e);
            }
            if (cap != null)
            {
                float s = DrumLayout05.ThroatS - 0.05f + 0.65f * Mathf.Max(0f, camS - (RiverPath.StartS - 6.52f));
                cap.position = DrumLayout05.Centre(Mathf.Min(s, RiverPath.CourseLength - 4f));
            }
        }
    }
}

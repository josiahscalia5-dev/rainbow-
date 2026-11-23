using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Iridescent soap bubbles floating above the river (Agent 3). Port of src/vfx/bubbles.ts (ride mode, ref 05):
    /// RIDE.high = 19 large bubbles + 22 small ones (small05) visible at once, at the SIDES of the stream (over the
    /// outer water and the foam banks), never over the coin line or Benny, drifting downstream with the current
    /// (big 0.1x, small 0.2x the stage speed 11) and rising slowly (0.04-0.16 u/s), life 7-15 s, recycled ahead of
    /// Benny (respawns start far away, small on screen, and grow naturally as he swims toward them).
    /// Benny's position comes only from Screen05Events.BennyS (contract); the main camera's x keeps the lane above
    /// Benny clear. One dynamic mesh (4 vertices per bubble: position = centre, UV0 = (corner, radius, seed),
    /// colour.a = fade); Rainbow/Water/Bubble expands the camera-facing quads. No per-frame allocations.
    /// </summary>
    [RequireComponent(typeof(MeshFilter), typeof(MeshRenderer))]
    [AddComponentMenu("Rainbow/Water/Bubble Field")]
    public class BubbleField : MonoBehaviour
    {
        [Tooltip("Large soap bubbles (bubbles.ts RIDE.high.big = 19).")]
        public int bigCount = 19;
        [Tooltip("Small bubbles near the banks (bubbles.ts RIDE.high.small05 = 22).")]
        public int smallCount = 22;
        [Tooltip("Spawn window ahead of Benny (u along the course).")]
        public float spawnAheadMin = 3f;
        public float spawnAheadMax = 30f;
        [Tooltip("Bubbles further than this behind Benny are recycled (the camera sits 6.4 u behind him).")]
        public float recycleBehind = 7f;
        [Tooltip("Stage speed (course.ts 05 = 11): bubbles drift with the current.")]
        public float stageSpeed = 11f;
        [Tooltip("Half width of the clear lane above Benny (around the main camera's x).")]
        public float bennyLane = 1.3f;
        public uint seed = 0xB0BB1E5u;

        struct Bubble
        {
            public Vector3 pos, vel;
            public float r, seed, phase, age, life;
            public bool big;
        }

        Bubble[] bubbles;
        Mesh mesh;
        Vector3[] verts;
        Vector4[] uvs;
        Color32[] cols;
        uint rng = 1u;
        float lastS = float.NaN;

        void OnEnable()
        {
            lastS = float.NaN;
        }

        void OnDestroy()
        {
            if (mesh == null) return;
            if (Application.isPlaying) Destroy(mesh);
            else DestroyImmediate(mesh);
            mesh = null;
        }

        void Init()
        {
            int nb = Mathf.Max(0, bigCount), n = nb + Mathf.Max(0, smallCount);
            bubbles = new Bubble[n];
            verts = new Vector3[n * 4];
            uvs = new Vector4[n * 4];
            cols = new Color32[n * 4];
            var tris = new int[n * 6];
            for (int i = 0; i < n; i++)
            {
                bubbles[i].big = i < nb;
                int v = i * 4, t = i * 6;
                uvs[v] = new Vector4(-1f, -1f, 0f, 0f);
                uvs[v + 1] = new Vector4(1f, -1f, 0f, 0f);
                uvs[v + 2] = new Vector4(-1f, 1f, 0f, 0f);
                uvs[v + 3] = new Vector4(1f, 1f, 0f, 0f);
                for (int k = 0; k < 4; k++) cols[v + k] = new Color32(255, 255, 255, 0);
                tris[t] = v; tris[t + 1] = v + 2; tris[t + 2] = v + 1;
                tris[t + 3] = v + 1; tris[t + 4] = v + 2; tris[t + 5] = v + 3;
            }
            mesh = new Mesh { name = "Bubbles05 (runtime)" };
            mesh.hideFlags = HideFlags.DontSave;
            mesh.MarkDynamic();
            mesh.vertices = verts;
            mesh.SetUVs(0, uvs);
            mesh.colors32 = cols;
            mesh.triangles = tris;
            mesh.bounds = new Bounds(Vector3.zero, Vector3.one * 1000f);   // quads are expanded in the shader
            GetComponent<MeshFilter>().sharedMesh = mesh;
            rng = seed == 0u ? 1u : seed;
        }

        float Rand()
        {
            rng ^= rng << 13;
            rng ^= rng >> 17;
            rng ^= rng << 5;
            return (rng & 0xFFFFFFu) / 16777216f;
        }

        float Range(float lo, float hi) { return lo + (hi - lo) * Rand(); }

        static float WallHalfWidth(float y)
        {
            float dy = RiverPath.FloorDepth - (y - RiverPath.WaterY);
            float rr = RiverPath.TunnelRadius;
            return Mathf.Sqrt(Mathf.Max(rr * rr - dy * dy, 0f));
        }

        void SpawnAll(float bennyS)
        {
            for (int i = 0; i < bubbles.Length; i++) Spawn(ref bubbles[i], bennyS, true);
        }

        void Spawn(ref Bubble b, float bennyS, bool initial)
        {
            b.phase = Rand() * 6.2832f;
            b.seed = Rand();
            b.age = initial ? Range(0.5f, 3f) : 0f;
            b.life = Range(7f, 15f);
            float s = bennyS + (initial ? Range(spawnAheadMin, spawnAheadMax) : Range(spawnAheadMax * 0.5f, spawnAheadMax));
            s = Mathf.Clamp(s, RiverPath.TunnelStart + 1f, RiverPath.TunnelLength - 2f);
            b.r = b.big ? 0.12f + 0.3f * Mathf.Pow(Rand(), 1.25f) : 0.03f + 0.06f * Mathf.Pow(Rand(), 1.4f);
            float side = Rand() < 0.5f ? -1f : 1f;
            float d = RiverPath.Meander(s);
            float x = side * Range(b.big ? 2.8f : 2.4f, 5.4f);
            float lane = 2.1f + b.r;                                   // keep the coin line / cyan core clear
            if (Mathf.Abs(x - d) < lane) x = d + side * lane;
            float y = RiverPath.WaterY + (b.big ? Range(0.35f, 2.3f) : Range(0.15f, 1.3f));
            float floor = RiverPath.WaterY + RiverSurface.BaseHeight(x, s) + b.r
                        + (RiverSurface.OnStream(x, s, 0.3f) ? 0.15f : 0.55f);   // above the water / the bank foam
            y = Mathf.Max(y, floor);
            float wall = WallHalfWidth(y) - b.r - 0.35f;
            x = Mathf.Clamp(x, -wall, wall);
            b.pos = new Vector3(x, y, s);
            b.vel = RiverPath.Forward(s) * (stageSpeed * (b.big ? 0.1f : 0.2f)) + Vector3.up * Range(0.04f, 0.16f);
        }

        void LateUpdate()
        {
            if (bubbles == null || mesh == null) Init();
            if (bubbles.Length == 0) return;
            float s = Screen05Events.BennyS;
            if (float.IsNaN(lastS) || Mathf.Abs(s - lastS) > 6f) SpawnAll(s);   // first frame, restart or teleport
            lastS = s;

            float dt = Mathf.Min(Time.deltaTime, 0.05f);
            float t = Time.time;
            Camera cam = Camera.main;
            bool hasCam = cam != null;
            float camX = hasCam ? cam.transform.position.x : 0f;
            Matrix4x4 toLocal = transform.worldToLocalMatrix;

            for (int i = 0; i < bubbles.Length; i++)
            {
                Bubble b = bubbles[i];
                b.age += dt;
                b.pos += b.vel * dt;
                if (b.age > b.life || b.pos.z < s - recycleBehind || b.pos.z > RiverPath.TunnelLength - 1f)
                    Spawn(ref b, s, false);
                bubbles[i] = b;

                float fade = Mathf.Clamp01(Mathf.Min(b.age, b.life - b.age) / 0.4f);
                var p = new Vector3(b.pos.x + Mathf.Sin(t * 0.9f + b.phase) * 0.06f,
                                    b.pos.y + Mathf.Sin(t * 1.3f + b.phase * 1.7f) * 0.05f,
                                    b.pos.z);
                if (hasCam) fade *= Mathf.Clamp01((Mathf.Abs(p.x - camX) - (bennyLane + b.r)) / 0.6f);
                Vector3 lp = toLocal.MultiplyPoint3x4(p);
                byte a = (byte)Mathf.RoundToInt(fade * 255f);
                int v = i * 4;
                for (int k = 0; k < 4; k++)
                {
                    verts[v + k] = lp;
                    uvs[v + k].z = b.r;
                    uvs[v + k].w = b.seed;
                    cols[v + k].a = a;
                }
            }
            mesh.vertices = verts;
            mesh.SetUVs(0, uvs);
            mesh.colors32 = cols;
            mesh.bounds = new Bounds(Vector3.zero, Vector3.one * 1000f);
        }
    }
}

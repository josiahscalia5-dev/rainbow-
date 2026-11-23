using UnityEngine;
using UnityEngine.Rendering;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Benny's white splash wake on the water (Agent 3, contract hook). Agent 4 adds it to Benny's root
    /// (<c>AddComponent&lt;SplashWake&gt;()</c>) and drives it: <see cref="SetIntensity"/> every frame
    /// (0 = airborne, 1 = full swim) and <see cref="Burst"/> on landing / jump / bank bump.
    ///
    /// Both parts are locked to Benny's waterline, so nothing floats disconnected from him:
    ///  1. The flat foam wake ON the water (bubbly collar around his waterline, white spray fans streaming back and
    ///     out, churned trail, expanding landing ring) is drawn by the river shader itself (RainbowRiver.hlsl) from
    ///     two global vectors written here every frame: _RainbowBenny = (s, x, wake 0..1, waterline radius) and
    ///     _RainbowSplash = (x, z, age, strength). It is part of the water surface, so it is depth-tested and can
    ///     never cross Benny's body.
    ///  2. A low crown of droplet streaks thrown up and back beside his body (port of src/vfx/riderSplash.ts
    ///     createRiderSplash05 jetPos: roots from beside the body to its back flank, 0.12-0.42 u high, 0.3-0.8 u
    ///     long), simulated relative to Benny and drawn as one dynamic mesh with Rainbow/Water/Spray
    ///     (depth-tested, soft where it meets the water). Burst() adds a ring of higher droplets.
    /// No per-frame allocations. Works with no setup: the material comes from Resources/RainbowSpray05
    /// (made by WaterBuilder) or, failing that, from the shader.
    /// </summary>
    [DisallowMultipleComponent]
    [AddComponentMenu("Rainbow/Water/Splash Wake")]
    public class SplashWake : MonoBehaviour
    {
        [Tooltip("Spray material (shader Rainbow/Water/Spray). Empty = Resources/RainbowSpray05, else built from the shader.")]
        public Material sprayMaterial;

        [Header("Benny's body (contract: radius 0.8 u)")]
        public float bodyRadius = 0.8f;
        [Tooltip("Body centre height above this transform (BennyController ride lift).")]
        public float bodyCentreOffset = 0.12f;
        [Tooltip("Clamp of the waterline radius sent to the river shader (foam collar).")]
        public float minWaterlineRadius = 0.5f;
        public float maxWaterlineRadius = 0.8f;

        [Header("Spray droplets")]
        [Tooltip("Droplets per second at full intensity.")]
        public float sprayRate = 60f;
        [Range(16, 256)] public int maxDroplets = 128;
        [Tooltip("How fast the wake follows SetIntensity (1/s).")]
        public float response = 8f;

        /// <summary>Current (smoothed) wake intensity 0..1.</summary>
        public float Intensity { get { return current; } }

        const float Gravity = 9.81f;
        const float SplashLife = 1.2f;   // the river shader draws the landing ring while age < 1.2 s

        struct Drop
        {
            public Vector3 p;     // offset from the waterline centre (world axes)
            public Vector3 v;     // velocity relative to Benny
            public float age, life, halfWidth, alpha;
        }

        static readonly int BennyId = Shader.PropertyToID("_RainbowBenny");
        static readonly int SplashId = Shader.PropertyToID("_RainbowSplash");

        Drop[] drops;
        int dropCount;
        Mesh mesh;
        Vector3[] verts;
        Vector4[] uv0;
        Vector4[] uv1;
        Material ownMaterial;
        bool materialTried;
        float target = 1f;
        float current;
        float emitCarry;
        uint rng = 0x05A1E5u;
        Vector3 fwd = Vector3.forward;
        Vector3 right = Vector3.right;
        Vector3 lastCentre;
        bool hasLast;
        Vector2 splashPos;
        float splashAge = 99f;
        float splashStrength;

        /// <summary>Contract: 0 = airborne, 1 = full swim.</summary>
        public void SetIntensity(float v01)
        {
            target = Mathf.Clamp01(v01);
        }

        /// <summary>Contract: landing splash (also used for jump take-off and bank bumps), strength 0..1.</summary>
        public void Burst(float strength)
        {
            float k = Mathf.Clamp01(strength);
            if (k <= 0f) return;
            EnsureBuffers();
            Vector3 c = WaterlineCentre();
            UpdateBasis(c.z);
            splashPos = new Vector2(c.x, c.z);
            splashAge = 0f;
            splashStrength = k;
            float rw = WaterlineRadius(c.y);
            int n = Mathf.RoundToInt(Mathf.Lerp(10f, 34f, k));
            for (int i = 0; i < n; i++) EmitBurstDrop(rw, k);
        }

        void OnEnable()
        {
            EnsureBuffers();
            hasLast = false;
        }

        void OnDisable()
        {
            Shader.SetGlobalVector(BennyId, Vector4.zero);
            Shader.SetGlobalVector(SplashId, Vector4.zero);
            dropCount = 0;
            splashAge = 99f;
        }

        void OnDestroy()
        {
            Release(mesh);
            Release(ownMaterial);
            mesh = null;
            ownMaterial = null;
        }

        static void Release(Object o)
        {
            if (o == null) return;
            if (Application.isPlaying) Destroy(o);
            else DestroyImmediate(o);
        }

        void LateUpdate()
        {
            EnsureBuffers();
            float dt = Mathf.Min(Time.deltaTime, 0.05f);
            Vector3 c = WaterlineCentre();
            UpdateBasis(c.z);
            float rw = WaterlineRadius(c.y);
            float h = transform.position.y + bodyCentreOffset - c.y;          // body centre above the water
            float contact = Mathf.Clamp01((bodyRadius - h) / 0.25f);          // 0 once the body leaves the water
            current = Mathf.Lerp(current, target, 1f - Mathf.Exp(-response * dt));
            float wake = current * contact;

            // teleports / restarts: drop everything instead of smearing it along the course
            if (hasLast && (c - lastCentre).sqrMagnitude > 9f)
            {
                dropCount = 0;
                splashAge = 99f;
            }
            else if (hasLast && splashAge < SplashLife)
            {
                // the landing ring rides the current with him
                splashPos.x += (c.x - lastCentre.x) * 0.9f;
                splashPos.y += (c.z - lastCentre.z) * 0.9f;
            }
            lastCentre = c;
            hasLast = true;
            splashAge += dt;

            // w = waterline radius (> 0 = Benny present: the river keeps its near-Benny band layout even while he is
            // airborne), z = wake strength (fades the foam collar / fans / trail)
            Shader.SetGlobalVector(BennyId, new Vector4(c.z, c.x, wake, rw));
            Shader.SetGlobalVector(SplashId, splashAge < SplashLife
                ? new Vector4(splashPos.x, splashPos.y, splashAge, splashStrength)
                : Vector4.zero);

            emitCarry += sprayRate * wake * dt;
            while (emitCarry >= 1f)
            {
                emitCarry -= 1f;
                EmitCrownDrop(rw, wake);
            }
            Simulate(dt);
            Draw(c);
        }

        Vector3 WaterlineCentre()
        {
            Vector3 p = transform.position;
            return new Vector3(p.x, RiverSurface.HeightAt(p.x, p.z), p.z);
        }

        float WaterlineRadius(float waterY)
        {
            float h = transform.position.y + bodyCentreOffset - waterY;
            float r2 = bodyRadius * bodyRadius - h * h;
            float r = r2 > 0f ? Mathf.Sqrt(r2) : 0f;
            return Mathf.Clamp(r, minWaterlineRadius, maxWaterlineRadius);
        }

        void UpdateBasis(float s)
        {
            fwd = RiverPath.Forward(s);
            right = RiverPath.Right(s);
        }

        float Rand()
        {
            rng ^= rng << 13;
            rng ^= rng >> 17;
            rng ^= rng << 5;
            return (rng & 0xFFFFFFu) / 16777216f;
        }

        // riderSplash.ts jetPos: root on the waterline circle from beside the body (1.6 rad from straight back) to its
        // back flank (0.8 rad), thrown back-outward (1.2 .. 0.45 rad from straight back) in a low arc
        void EmitCrownDrop(float rw, float strength)
        {
            if (dropCount >= drops.Length) return;
            float side = Rand() < 0.5f ? -1f : 1f;
            float a = Rand();
            float thR = Mathf.Lerp(1.6f, 0.8f, a) + (Rand() - 0.5f) * 0.2f;
            float phi = Mathf.Lerp(1.2f, 0.45f, a) + (Rand() - 0.5f) * 0.35f;
            float rootR = Mathf.Max(rw, 0.5f) * 1.25f;                          // just outside the fur at the water
            Vector3 back = -fwd;
            Vector3 root = (right * (side * Mathf.Sin(thR)) + back * Mathf.Cos(thR)) * rootR;
            Vector3 dir = right * (side * Mathf.Sin(phi)) + back * Mathf.Cos(phi);
            float len = (0.3f + 0.5f * Rand()) * (0.55f + 0.45f * strength);
            float apex = (0.12f + 0.3f * Rand()) * Mathf.Max(strength, 0.3f);
            float vy = Mathf.Sqrt(2f * Gravity * apex);
            float flight = 2f * vy / Gravity;
            Drop d;
            d.p = root + Vector3.up * 0.02f;
            d.v = dir * (len / flight) + Vector3.up * vy;
            d.age = 0f;
            d.life = flight;
            d.halfWidth = Mathf.Lerp(0.018f, 0.034f, Rand());
            d.alpha = 0.85f;
            drops[dropCount++] = d;
        }

        // landing / bump: a ring of higher droplets all round the waterline
        void EmitBurstDrop(float rw, float k)
        {
            if (dropCount >= drops.Length) return;
            float ang = Rand() * Mathf.PI * 2f;
            Vector3 radial = right * Mathf.Cos(ang) + fwd * Mathf.Sin(ang);
            float rootR = Mathf.Max(rw, 0.5f) * 1.15f;
            float apex = Mathf.Max((0.2f + 0.45f * Rand()) * k, 0.06f);
            float vy = Mathf.Sqrt(2f * Gravity * apex);
            float flight = 2f * vy / Gravity;
            float len = (0.4f + 0.9f * Rand()) * k;
            Drop d;
            d.p = radial * rootR + Vector3.up * 0.03f;
            d.v = radial * (len / flight) + Vector3.up * vy;
            d.age = 0f;
            d.life = flight;
            d.halfWidth = Mathf.Lerp(0.022f, 0.04f, Rand());
            d.alpha = 0.95f;
            drops[dropCount++] = d;
        }

        void Simulate(float dt)
        {
            int i = 0;
            while (i < dropCount)
            {
                Drop d = drops[i];
                d.age += dt;
                d.v.y -= Gravity * dt;
                d.p += d.v * dt;
                if (d.age >= d.life + 0.05f || (d.p.y < -0.03f && d.v.y < 0f))
                {
                    dropCount--;
                    drops[i] = drops[dropCount];   // swap-remove, re-check slot i
                    continue;
                }
                drops[i] = d;
                i++;
            }
        }

        void EnsureBuffers()
        {
            int n = Mathf.Clamp(maxDroplets, 16, 256);
            if (drops != null && drops.Length == n && mesh != null) return;
            drops = new Drop[n];
            dropCount = 0;
            verts = new Vector3[n * 4];
            uv0 = new Vector4[n * 4];
            uv1 = new Vector4[n * 4];
            var tris = new int[n * 6];
            for (int i = 0; i < n; i++)
            {
                int v = i * 4, t = i * 6;
                uv0[v] = new Vector4(-1f, -1f, 0f, 0f);
                uv0[v + 1] = new Vector4(1f, -1f, 0f, 0f);
                uv0[v + 2] = new Vector4(-1f, 1f, 0f, 0f);
                uv0[v + 3] = new Vector4(1f, 1f, 0f, 0f);
                tris[t] = v; tris[t + 1] = v + 2; tris[t + 2] = v + 1;
                tris[t + 3] = v + 1; tris[t + 4] = v + 2; tris[t + 5] = v + 3;
            }
            if (mesh == null)
            {
                mesh = new Mesh { name = "SplashWakeSpray05" };
                mesh.hideFlags = HideFlags.DontSave;
                mesh.MarkDynamic();
            }
            mesh.Clear();
            mesh.vertices = verts;
            mesh.SetUVs(0, uv0);
            mesh.SetUVs(1, uv1);
            mesh.triangles = tris;
        }

        Material ResolveMaterial()
        {
            if (sprayMaterial != null) return sprayMaterial;
            if (materialTried) return ownMaterial;
            materialTried = true;
            sprayMaterial = Resources.Load<Material>("RainbowSpray05");
            if (sprayMaterial != null) return sprayMaterial;
            Shader sh = Shader.Find("Rainbow/Water/Spray");
            if (sh == null)
            {
                Debug.LogWarning("[Rainbow Agent3] SplashWake: shader Rainbow/Water/Spray not found - spray droplets off (the wake on the water still draws).");
                return null;
            }
            ownMaterial = new Material(sh) { name = "RainbowSpray05 (runtime)", hideFlags = HideFlags.DontSave };
            return ownMaterial;
        }

        void Draw(Vector3 c)
        {
            int n = drops.Length;
            for (int i = 0; i < n; i++)
            {
                int v = i * 4;
                if (i < dropCount)
                {
                    Drop d = drops[i];
                    Vector3 p = c + d.p;
                    float fadeIn = Mathf.Clamp01(d.age / 0.06f);
                    float fadeOut = Mathf.Clamp01((d.life - d.age) / 0.15f);
                    float a = d.alpha * fadeIn * Mathf.Max(fadeOut, 0.25f);
                    Vector3 vel = d.v - fwd * 1.5f;                              // streak along the motion past the water
                    float halfLen = d.halfWidth + Mathf.Min(vel.magnitude * 0.03f, 0.12f);
                    var u1 = new Vector4(vel.x, vel.y, vel.z, a);
                    for (int k = 0; k < 4; k++)
                    {
                        verts[v + k] = p;
                        uv0[v + k].z = halfLen;
                        uv0[v + k].w = d.halfWidth;
                        uv1[v + k] = u1;
                    }
                }
                else
                {
                    for (int k = 0; k < 4; k++)
                    {
                        verts[v + k] = c;
                        uv0[v + k].z = 0f;
                        uv0[v + k].w = 0f;
                        uv1[v + k] = Vector4.zero;
                    }
                }
            }
            var bounds = new Bounds(c, new Vector3(6f, 4f, 6f));
            mesh.vertices = verts;
            mesh.SetUVs(0, uv0);
            mesh.SetUVs(1, uv1);
            mesh.bounds = bounds;
            if (dropCount == 0) return;
            Material m = ResolveMaterial();
            if (m == null) return;
            var rp = new RenderParams(m)
            {
                layer = gameObject.layer,
                shadowCastingMode = ShadowCastingMode.Off,
                receiveShadows = false,
                worldBounds = bounds,
            };
            Graphics.RenderMesh(rp, mesh, 0, Matrix4x4.identity);
        }
    }
}

using UnityEngine;
using UnityEngine.Rendering;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Benny's white splash wake at the waterline (Agent 3, contract hook). Agent 4 adds it to Benny's root
    /// (<c>AddComponent&lt;SplashWake&gt;()</c>) and drives it: <see cref="SetIntensity"/> every frame
    /// (0 = airborne, 1 = full swim) and <see cref="Burst"/> on landing / jump / bank bump.
    ///
    /// Everything is locked to Benny's waterline, so nothing floats disconnected from him:
    ///  1. The V of splash fans (port of src/vfx/riderSplash.ts createRiderSplash05, wave 8, refitted to the approved image
    ///     in the splash round 2026-11-23): splash strands leaving his flanks and running back toward the camera, bubbly
    ///     suds piled on his flanks and a low crown of droplet jets - nothing straight behind him. One static mesh (built
    ///     once here) drawn every frame in his waterline frame with Rainbow/Water/Splash, which shapes and animates every
    ///     ribbon on the GPU and sets it onto the animated river surface (depth-tested, soft where it meets the water / fur).
    ///  2. What lies flat on the water (the dark contact shadow straight behind him, a broken bubbly rim on his flanks, the
    ///     landing ring) is drawn by the river shader itself (RainbowRiver.hlsl) from two global vectors written here every frame:
    ///     _RainbowBenny = (s, x, wake 0..1, waterline radius) and _RainbowSplash = (x, z, age, strength).
    ///  3. Spray droplets (port of src/vfx/spray.ts + the 05 wake() emitter in src/vfx/index.ts): small translucent water
    ///     beads thrown off the two fans, simulated relative to Benny and drawn as one dynamic mesh with
    ///     Rainbow/Water/Spray. Burst() adds the landing / bump splash (spray.ts splash()).
    /// No per-frame allocations. Works with no setup: the materials come from Resources/RainbowSplash05 and
    /// Resources/RainbowSpray05 (made by WaterBuilder) or, failing that, from the shaders.
    /// </summary>
    [DisallowMultipleComponent]
    [AddComponentMenu("Rainbow/Water/Splash Wake")]
    public class SplashWake : MonoBehaviour
    {
        [Tooltip("Droplet material (shader Rainbow/Water/Spray). Empty = Resources/RainbowSpray05, else built from the shader.")]
        public Material sprayMaterial;
        [Tooltip("Fan material (shader Rainbow/Water/Splash). Empty = Resources/RainbowSplash05, else built from the shader.")]
        public Material splashMaterial;

        [Header("Benny's body (index.ts BENNY_OUTER_R 0.86)")]
        public float bodyRadius = 0.86f;
        [Tooltip("Body centre height above this transform (BennyController ride lift).")]
        public float bodyCentreOffset = 0.12f;
        [Tooltip("Clamp of the waterline radius (index.ts: >= 0.35 x outer radius).")]
        public float minWaterlineRadius = 0.3f;
        public float maxWaterlineRadius = 0.86f;

        [Header("Fans (riderSplash.ts createRiderSplash05, high quality)")]
        [Tooltip("Splash strands per side (riderSplash.ts high = 44 thin ropes; the approved shows fewer, splashier strands)")]
        [Range(0, 64)] public int ropesPerSide = 22;
        [Tooltip("Crown droplet jets per side (water4 2026-11-24: 40 -> 24, the dense crown read as solid white wings on his flanks)")]
        [Range(0, 64)] public int jetsPerSide = 24;
        [Tooltip("Bubbly suds pads per side on his flanks (riderSplash.ts high = 16 froth pads; fewer, bigger ones read as soap bubbles; water4: 11 -> 8)")]
        [Range(0, 32)] public int frothPerSide = 0;

        [Header("Spray droplets (spray.ts / index.ts wake())")]
        [Tooltip("Droplets per second at full strength (150 x (1 + 1.4) inside 05).")]
        public float sprayRate = 360f;
        [Range(16, 256)] public int maxDroplets = 192;
        [Tooltip("How fast the wake follows SetIntensity (1/s; riderSplash.ts update: dt x 6).")]
        public float response = 6f;

        /// <summary>Current (smoothed) wake intensity 0..1.</summary>
        public float Intensity { get { return current; } }

        const float Gravity = 18f;       // spray.ts
        const float SplashLife = 1.2f;   // the river shader draws the landing ring while age < 1.2 s
        const int Seg = 8;               // riderSplash.ts SEG5

        struct Drop
        {
            public Vector3 p;     // offset from the waterline centre (world axes)
            public Vector3 v;     // velocity relative to Benny
            public float age, life, halfWidth;
        }

        static readonly int BennyId = Shader.PropertyToID("_RainbowBenny");
        static readonly int SplashId = Shader.PropertyToID("_RainbowSplash");
        static readonly int StateId = Shader.PropertyToID("_SplashState");
        static readonly int RiverId = Shader.PropertyToID("_SplashRiver");
        static readonly int River2Id = Shader.PropertyToID("_SplashRiver2");

        Drop[] drops;
        int dropCount;
        Mesh mesh;
        Vector3[] verts;
        Vector4[] uv0;
        Vector4[] uv1;
        Mesh fanMesh;
        Mesh wakeFoamMesh;                 // river round 4b: soap foam he drags along (FoamBank.BuildWakeMesh)
        Material wakeFoamMaterial;
        bool wakeFoamTried;
        MaterialPropertyBlock fanProps;
        Material ownMaterial, ownFanMaterial;
        bool materialTried, fanMaterialTried;
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
            int n = Mathf.RoundToInt(30f * k);     // spray.ts splash(): 30 x strength (high quality)
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
            Release(fanMesh);
            Release(wakeFoamMesh);
            wakeFoamMesh = null;
            Release(ownMaterial);
            Release(ownFanMaterial);
            mesh = null;
            fanMesh = null;
            ownMaterial = null;
            ownFanMaterial = null;
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
            current = Mathf.Lerp(current, target, Mathf.Min(1f, dt * response));
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
            // airborne), z = wake strength (fades the contact line / foam rim)
            Shader.SetGlobalVector(BennyId, new Vector4(c.z, c.x, wake, rw));
            Shader.SetGlobalVector(SplashId, splashAge < SplashLife
                ? new Vector4(splashPos.x, splashPos.y, splashAge, splashStrength)
                : Vector4.zero);

            // index.ts wake(): rate x strength, at most 26 new droplets per frame
            emitCarry += sprayRate * wake * dt;
            int emit = 0;
            while (emitCarry >= 1f)
            {
                emitCarry -= 1f;
                if (emit++ < 26) EmitSprayDrop(rw);
            }
            Simulate(dt);
            DrawFans(c, rw, wake);
            DrawWakeFoam(c, wake);
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

        float Rnd(float a, float b) { return a + (b - a) * Rand(); }

        // the fans' root circle (Rainbow/Water/Splash SPL_RootR): just outside the fur at the water, a little further out
        // toward the camera where his ride lean pushes the fur back
        static float RootRadius(float rw, float th)
        {
            return Mathf.Max(rw, 0.5f) * 1.3f * (1f + 0.1f * Mathf.Max(0f, Mathf.Cos(th)));
        }

        // index.ts wake() inside 05: droplets thrown off the two rope fans, rooted on the flanks at the waterline and
        // flying back-outward (roots 1.5 -> 0.6 rad, directions 0.8 -> 0.2 rad from straight back), a short hop up
        void EmitSprayDrop(float rw)
        {
            if (dropCount >= drops.Length) return;
            float side = Rand() < 0.5f ? -1f : 1f;
            float a = Rand();
            float thR = 1.5f - 0.9f * a;
            float phi = 0.8f - 0.6f * a + Rnd(-0.12f, 0.12f);
            float t0 = Rnd(0.1f, 0.55f);                       // leave the jet part-way along it
            float rootR = RootRadius(rw, thR);
            Vector3 back = -fwd;
            Drop d;
            d.p = right * (side * (Mathf.Sin(thR) * rootR + Mathf.Sin(phi) * t0 * 0.9f))
                + back * (Mathf.Cos(thR) * rootR + Mathf.Cos(phi) * t0 * 0.9f)
                + Vector3.up * Rnd(0.04f, 0.16f);
            float sp = Rnd(1.1f, 2.6f);
            d.v = right * (side * Mathf.Sin(phi) * sp) + back * (Mathf.Cos(phi) * sp) + Vector3.up * Rnd(1.2f, 3.0f);
            d.age = 0f;
            d.life = Rnd(0.3f, 0.6f);
            d.halfWidth = 0.5f * Rnd(0.012f, 0.04f);
            drops[dropCount++] = d;
        }

        // spray.ts splash(): a burst of bigger beads all round the waterline, flung up and out
        void EmitBurstDrop(float rw, float k)
        {
            if (dropCount >= drops.Length) return;
            float ang = Rand() * Mathf.PI * 2f;
            Vector3 radial = right * Mathf.Cos(ang) + fwd * Mathf.Sin(ang);
            float rootR = Mathf.Max(rw, 0.5f) * 1.25f;
            Drop d;
            d.p = radial * rootR + Vector3.up * Rnd(0.05f, 0.2f);
            d.v = radial * (Rnd(1f, 4f) * k) + Vector3.up * (Rnd(3f, 7f) * k);
            d.age = 0f;
            d.life = Rnd(0.5f, 1.1f);
            d.halfWidth = 0.5f * Rnd(0.06f, 0.16f);
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
                if (d.age >= d.life || (d.p.y < -0.03f && d.v.y < 0f))
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

        // ---- fans: one static mesh, every ribbon shaped / animated by Rainbow/Water/Splash ----
        Mesh BuildFanMesh()
        {
            int perSide = Mathf.Max(0, ropesPerSide) + Mathf.Max(0, jetsPerSide) + Mathf.Max(0, frothPerSide);
            int n = perSide * 2;
            if (n == 0) return null;
            int vpr = (Seg + 1) * 2;
            var fv = new Vector3[n * vpr];
            var f0 = new Vector4[n * vpr];
            var f1 = new Vector4[n * vpr];
            var ft = new int[n * Seg * 6];
            int k = 0;
            foreach (float side in new[] { -1f, 1f })
            {
                // riderSplash.ts: deterministic stratified layout, golden-ratio phases (no clumping in a frozen frame)
                AddRibbons(ref k, side, frothPerSide, 2f, 11.0, fv, f0, f1, ft);
                AddRibbons(ref k, side, ropesPerSide, 0f, 0.0, fv, f0, f1, ft);
                AddRibbons(ref k, side, jetsPerSide, 1f, 5.0, fv, f0, f1, ft);
            }
            var m = new Mesh { name = "SplashWakeFans05" };
            m.hideFlags = HideFlags.DontSave;
            m.vertices = fv;
            m.SetUVs(0, f0);
            m.SetUVs(1, f1);
            m.triangles = ft;
            m.bounds = new Bounds(Vector3.zero, new Vector3(8f, 4f, 8f));   // the shader moves every vertex
            return m;
        }

        static double Frac(double x) { return x - System.Math.Floor(x); }

        static void AddRibbons(ref int k, float side, int count, float type, double salt,
                               Vector3[] fv, Vector4[] f0, Vector4[] f1, int[] ft)
        {
            int vpr = (Seg + 1) * 2;
            for (int i = 0; i < count; i++)
            {
                double hA = Frac(System.Math.Sin((i * 1.7 + salt) * 127.1 + side * 311.7) * 43758.5453);
                double hP = Frac(System.Math.Sin((i * 3.3 + salt) * 127.1 + side * 311.7) * 43758.5453);
                double hS = Frac(System.Math.Sin((i * 5.1 + 0.37 + salt) * 127.1 + side * 311.7) * 43758.5453);
                float a = Mathf.Clamp01((float)((i + hA) / count));
                float phase = (float)Frac(i * 0.6180339 + hP * 0.25);
                var jet = new Vector4(side, a, phase, (float)hS);
                int vb = k * vpr;
                for (int j = 0; j <= Seg; j++)
                {
                    float u = j / (float)Seg;
                    f0[vb + j * 2] = new Vector4(u, -1f, type, 0f);
                    f0[vb + j * 2 + 1] = new Vector4(u, 1f, type, 0f);
                    f1[vb + j * 2] = jet;
                    f1[vb + j * 2 + 1] = jet;
                    fv[vb + j * 2] = Vector3.zero;
                    fv[vb + j * 2 + 1] = Vector3.zero;
                }
                int tb = k * Seg * 6;
                for (int j = 0; j < Seg; j++)
                {
                    int a0 = vb + j * 2, b = a0 + 1, c = a0 + 2, d = a0 + 3;
                    ft[tb + j * 6] = a0; ft[tb + j * 6 + 1] = c; ft[tb + j * 6 + 2] = b;
                    ft[tb + j * 6 + 3] = b; ft[tb + j * 6 + 4] = c; ft[tb + j * 6 + 5] = d;
                }
                k++;
            }
        }

        void DrawFans(Vector3 c, float rw, float strength)
        {
            if (strength < 0.01f) return;                      // airborne / stopped: no fans (riderSplash: visible > 0.01)
            Material m = ResolveFanMaterial();
            if (m == null) return;
            if (fanMesh == null) fanMesh = BuildFanMesh();
            if (fanMesh == null) return;
            if (fanProps == null) fanProps = new MaterialPropertyBlock();
            float s = c.z;
            fanProps.SetVector(StateId, new Vector4(rw, strength, 0f, 0f));
            fanProps.SetVector(RiverId, new Vector4(RiverSurface.StreamCentre(s), RiverSurface.StreamHalfWidth(s),
                                                    RiverSurface.SOffset, RiverSurface.WaveAmp));
            fanProps.SetVector(River2Id, new Vector4(RiverPath.WaterY, RiverSurface.EdgeLift, 0f, 0f));
            var rp = new RenderParams(m)
            {
                layer = gameObject.layer,
                shadowCastingMode = ShadowCastingMode.Off,
                receiveShadows = false,
                worldBounds = new Bounds(c, new Vector3(8f, 4f, 8f)),
                matProps = fanProps,
            };
            Graphics.RenderMesh(rp, fanMesh, 0, Matrix4x4.TRS(c, Quaternion.LookRotation(fwd, Vector3.up), Vector3.one));
        }

        // the soap foam in his wake (round puffs, the bank foam's impostor shader; shrinks with the wake strength)
        void DrawWakeFoam(Vector3 c, float strength)
        {
            if (strength < 0.02f) return;
            if (!wakeFoamTried)
            {
                wakeFoamTried = true;
                wakeFoamMaterial = Resources.Load<Material>("RainbowWakeFoam05");
            }
            if (wakeFoamMaterial == null) return;
            if (wakeFoamMesh == null)
            {
                wakeFoamMesh = FoamBank.BuildWakeMesh();
                wakeFoamMesh.hideFlags = HideFlags.DontSave;
            }
            var rp = new RenderParams(wakeFoamMaterial)
            {
                layer = gameObject.layer,
                shadowCastingMode = ShadowCastingMode.Off,
                receiveShadows = false,
                worldBounds = new Bounds(c, new Vector3(8f, 4f, 8f)),
            };
            Graphics.RenderMesh(rp, wakeFoamMesh, 0, Matrix4x4.Translate(c));
        }

        Material ResolveFanMaterial()
        {
            if (splashMaterial != null) return splashMaterial;
            if (fanMaterialTried) return ownFanMaterial;
            fanMaterialTried = true;
            splashMaterial = Resources.Load<Material>("RainbowSplash05");
            if (splashMaterial != null) return splashMaterial;
            Shader sh = Shader.Find("Rainbow/Water/Splash");
            if (sh == null)
            {
                Debug.LogWarning("[Rainbow Agent3] SplashWake: shader Rainbow/Water/Splash not found - splash fans off (droplets and the wake on the water still draw).");
                return null;
            }
            ownFanMaterial = new Material(sh) { name = "RainbowSplash05 (runtime)", hideFlags = HideFlags.DontSave };
            return ownFanMaterial;
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
                Debug.LogWarning("[Rainbow Agent3] SplashWake: shader Rainbow/Water/Spray not found - spray droplets off (the fans and the wake on the water still draw).");
                return null;
            }
            ownMaterial = new Material(sh) { name = "RainbowSpray05 (runtime)", hideFlags = HideFlags.DontSave };
            return ownMaterial;
        }

        // droplets: small beads stretched a little along their motion (spray.ts draws round points; the stretch keeps
        // fast ones from strobing), alpha = min(1, (1 - age / life) x 2.5)
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
                    float fadeIn = Mathf.Clamp01(d.age / 0.04f);
                    float a = Mathf.Min(1f, (1f - d.age / d.life) * 2.5f) * fadeIn;
                    float halfLen = d.halfWidth * (1f + Mathf.Min(d.v.magnitude * 0.06f, 0.5f));
                    var u1 = new Vector4(d.v.x, d.v.y, d.v.z, a);
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
            var bounds = new Bounds(c, new Vector3(8f, 6f, 8f));
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

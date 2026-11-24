using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Iridescent soap bubbles at the SIDES of the stream (Agent 3; bubbles round 2026-11-23). Port of src/vfx/bubbles.ts,
    /// ride mode (ref 05): RIDE.high = 19 large impostor bubbles + 22 small ring bubbles (small05) visible at once, over the
    /// foam banks, the outer water and the lower walls - never over the stream corridor where Benny, his splash and the
    /// coin line are.
    /// Placement is done in SCREEN space like the original, so it holds for any camera (hard left / right, jumps): pick a
    /// side point of the portrait frame, cast its view ray to the water and float the bubble between the camera and that
    /// point (kept inside the tube, above the water and the foam heap); the world radius is chosen from the wanted
    /// on-screen diameter there (big 18-56 px, small 6-17 px). From then on the bubble lives in world space: it RIDES the
    /// current (bubbles round 3: 0.74-0.88x the stage speed 11 instead of bubbles.ts' 0.1x / 0.2x, which swept every bubble
    /// through the frame in under a second, still inflating), rises slowly (0.04-0.16 u/s), wobbles a little and lives
    /// 10-20 s, so it floats beside Benny for seconds while it slowly grows and drifts out toward the frame edge. A new
    /// bubble rises out of the foam / water under its spot while it inflates. Bubbles are recycled only where
    /// nobody sees them (out of the frame or closer to the camera than the shader's near fade); one that drifts into the
    /// corridor or reaches the end of its life shrinks away quickly. The shader caps the on-screen size (bubbles.ts uMaxPx).
    /// Unity addition (round 2, approved 05 while moving): with the camera moving at 11 u/s the side bubbles leave the frame
    /// at the sides long before they reach its bottom, so a small WAKE set (3 big + 9 small) is thrown up inside Benny's
    /// splash fans beside his body (alternating sides), rides the current at 0.78-0.9x his speed and falls slowly behind him toward the bottom
    /// corners, growing in perspective (the approved big bubbles at the bottom corners and the small ones beside the splash).
    /// Benny's position comes only from Screen05Events.BennyS (contract); the camera is Camera.main of THIS frame (the
    /// component runs after the Cinemachine brain). One dynamic mesh (4 vertices per bubble: position = centre, UV0 = (corner,
    /// radius, seed + 1 for small bubbles), colour.a = fade); Rainbow/Water/Bubble expands the camera-facing quads.
    /// No per-frame allocations.
    /// </summary>
    [DefaultExecutionOrder(1000)]
    [RequireComponent(typeof(MeshFilter), typeof(MeshRenderer))]
    [AddComponentMenu("Rainbow/Water/Bubble Field")]
    public class BubbleField : MonoBehaviour
    {
        [Tooltip("Large soap bubbles (bubbles.ts RIDE.high.big = 19; bubbles round 3: 22 = the approved ~5 big + ~13 medium " +
                 "at the sides, the rest far / leaving the frame).")]
        public int bigCount = 22;
        [Tooltip("Small ring bubbles near the banks (bubbles.ts RIDE.high.small05 = 22; round 3: 18 + 12 wake, approved ~20 small).")]
        public int smallCount = 18;
        [Tooltip("Stage speed (course.ts 05 = 11): bubbles drift with the current.")]
        public float stageSpeed = 11f;
        [Tooltip("Wanted on-screen DIAMETER at spawn, big bubbles, at the BOTTOM of the side band (px of the 864x1536 frame; " +
                 "bubbles.ts BIG_PX 25-65). Round 3: the size now follows the screen row (bigPxFar at the top of the band).")]
        public Vector2 bigPx = new Vector2(36f, 66f);
        [Tooltip("Wanted on-screen DIAMETER at spawn, big bubbles, at the TOP (far end) of the side band.")]
        public Vector2 bigPxFar = new Vector2(18f, 44f);
        [Tooltip("Wanted on-screen DIAMETER at spawn, small bubbles, bottom of the band (bubbles.ts 6 + 14 * rand^1.4).")]
        public Vector2 smallPx = new Vector2(7f, 18f);
        [Tooltip("Wanted on-screen DIAMETER at spawn, small bubbles, top (far end) of the band.")]
        public Vector2 smallPxFar = new Vector2(5f, 13f);
        [Tooltip("Bubbles round 3: the side bubbles RIDE the current at this share of the stage speed (min, max). bubbles.ts " +
                 "drifted at 0.1x (big) / 0.2x (small), so with the camera at 11 u/s every bubble crossed the frame in ~0.5-1 s, " +
                 "still inflating: the frame only ever held a few small, faint ones. Riding at ~0.8x they float beside Benny for " +
                 "seconds, slowly growing and drifting out toward the frame edges (the approved big edge bubbles).")]
        public Vector2 sideCarry = new Vector2(0.74f, 0.88f);
        [Tooltip("Screen rows (px of the 864x1536 frame) where side bubbles are placed / born: top, bottom.")]
        public Vector2 bandPx = new Vector2(515f, 1000f);
        [Tooltip("Share of the side bubbles placed in the upper (far) band, bandPx.x..farBottomPx; the rest go to " +
                 "farBottomPx..bandPx.y (approved: ~12 side bubbles at y 500-700, ~8 at 700-1000).")]
        [Range(0f, 1f)] public float farShare = 0.55f;
        [Tooltip("The same share for the small ring bubbles (approved: most small ones float low, beside the splash and " +
                 "the near banks, only a few tiny ones far up).")]
        [Range(0f, 1f)] public float farShareSmall = 0.3f;
        public float farBottomPx = 700f;
        [Tooltip("Inner edge of the side band, |NDC x| of the portrait frame, big / small (bubbles.ts 0.55 / 0.5).")]
        public Vector2 innerXn = new Vector2(0.36f, 0.3f);
        [Tooltip("Outer edge of the side band, |NDC x| (bubbles.ts 0.97; approved: no bubble centre beyond ~0.9).")]
        public float outerXn = 0.9f;
        [Tooltip("Half width (NDC x) of the bubble-free stream corridor: lower frame (y > 691 px) / upper frame.")]
        public Vector2 corridorXn = new Vector2(0.47f, 0.26f);
        [Tooltip("Life of a side bubble (s), min / max (bubbles.ts 7-15).")]
        public Vector2 lifeRange = new Vector2(10f, 20f);
        [Tooltip("A new side bubble rises out of the foam / water under its spot while it inflates (s to full size).")]
        public float inflateSeconds = 0.9f;
        [Tooltip("Wake bubbles thrown up beside Benny's splash that ride the current and slowly fall behind him (approved 05: " +
                 "two big ones at the bottom corners, small ones beside the splash fans). Big / small counts.")]
        public int wakeBigCount = 3;
        public int wakeSmallCount = 12;
        [Tooltip("Wake bubbles keep this share of Benny's speed (the rest = how fast they fall behind him). Round 3: " +
                 "0.78-0.9 -> 0.84-0.93, they swept out of the frame (approved: big ones still inside the bottom corners).")]
        public Vector2 wakeCarry = new Vector2(0.84f, 0.93f);
        public uint seed = 0x0B0Bu;

        struct Bubble
        {
            public Vector3 pos, vel;
            public float r, seed, phase, age, life;
            public float rise;                       // newborn: extra upward speed out of the foam (decays; 0 = floating)
            public bool big, wake, dead;
        }

        const float RefH = 1536f;                    // the approved frame height: bubbles.ts sizes / caps are authored for it
        const float PortraitAspect = 864f / 1536f;
        const float CoreLane = 0.19f;                // bubbles.ts CORE_LANE: half width (NDC x) of the lane kept clear around the coin line
        const int CoreN = 24;

        Bubble[] bubbles;
        Mesh mesh;
        Vector3[] verts;
        Vector4[] uvs;
        Color32[] cols;
        uint rng = 1u;
        float lastS = float.NaN;
        Vector3 lastCam = new Vector3(1e9f, 1e9f, 1e9f);
        float nearRecycle = 1.5f;
        float bennySpeed = 11f;
        static readonly int BennyId = Shader.PropertyToID("_RainbowBenny");   // SplashWake: (s, x, wake 0..1, waterline radius)
        // Benny's body centre in the portrait frame's NDC + eye depth (read-only from BennyController.Instance)
        bool hasBenny;
        float bennyXn, bennyYn, bennyEye;

        // camera basis of the current frame
        Vector3 camPos, camFwd, camRight, camUp;
        Matrix4x4 worldToCam;
        float tanV = 0.6f, tanH = 0.34f, tanHView = 0.34f, focalRef = 1280f;
        // projected coin line (NDC of the portrait frame), sorted bottom -> top
        readonly float[] coreX = new float[CoreN], coreY = new float[CoreN];
        int coreN;

        void OnEnable()
        {
            lastS = float.NaN;
            lastCam = new Vector3(1e9f, 1e9f, 1e9f);
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
            // order: side big, side small, wake big, wake small
            int nb = Mathf.Max(0, bigCount), ns = nb + Mathf.Max(0, smallCount);
            int nwb = ns + Mathf.Max(0, wakeBigCount), n = nwb + Mathf.Max(0, wakeSmallCount);
            bubbles = new Bubble[n];
            verts = new Vector3[n * 4];
            uvs = new Vector4[n * 4];
            cols = new Color32[n * 4];
            var tris = new int[n * 6];
            for (int i = 0; i < n; i++)
            {
                bubbles[i].big = i < nb || (i >= ns && i < nwb);
                bubbles[i].wake = i >= ns;
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
            // recycle only where the shader has faded a bubble out completely (no visible pop near the camera)
            Material mat = GetComponent<MeshRenderer>().sharedMaterial;
            if (mat != null && mat.HasProperty("_NearFade")) nearRecycle = Mathf.Max(0.5f, mat.GetFloat("_NearFade"));
            rng = seed == 0u ? 1u : seed;
        }

        // mulberry32 (the generator of bubbles.ts)
        float Rand()
        {
            unchecked
            {
                rng += 0x6D2B79F5u;
                uint t = rng;
                t = (t ^ (t >> 15)) * (t | 1u);
                t ^= t + (t ^ (t >> 7)) * (t | 61u);
                return (t ^ (t >> 14)) / 4294967296f;
            }
        }

        float Range(float lo, float hi) { return lo + (hi - lo) * Rand(); }

        static float SS(float a, float b, float x)
        {
            float t = Mathf.Clamp01((x - a) / (b - a));
            return t * t * (3f - 2f * t);
        }

        /// <summary>
        /// |x| of the tunnel wall at height y. Frame round 2026-11-23: the real drum (DrumLayout05, radius 6.8, axis 4.25
        /// above the water, 0.7 m lower near the camera, AxisX 0.6 m left) instead of the contract circle (6.85 about 3.3);
        /// the narrower of its near and far cross-sections, so a bubble never sinks into either wall.
        /// </summary>
        static float WallHalfWidth(float y)
        {
            float rr = DrumLayout05.Radius;
            float dFar = DrumLayout05.CentreY(DrumLayout05.EyeS + 60f) - y;
            float dNear = DrumLayout05.CentreY(DrumLayout05.EyeS + 15f) - y;
            float dy = Mathf.Max(Mathf.Abs(dFar), Mathf.Abs(dNear));
            // the drum axis sits AxisX off the course line x = 0: |x| below this is inside the tube on both sides
            return Mathf.Max(0f, Mathf.Sqrt(Mathf.Max(rr * rr - dy * dy, 0f)) - Mathf.Abs(DrumLayout05.AxisX));
        }

        /// <summary>Highest foam-bank top at camera distance dist (RainbowFoam.hlsl grows the heap 0.62..1.45x with distance).</summary>
        static float FoamTop(float dist) => 1.05f * Mathf.Lerp(0.62f, 1.45f, SS(5f, 30f, dist));

        /// <summary>World x of the coin line / cyan core (CoinTrail: latK 0.7 * CORE_SWING 0.9 * meander from the route centre).</summary>
        static float CoinLineX(float s) => 1.63f * RiverPath.Meander(s);

        void SetView(Camera cam)
        {
            Transform ct = cam.transform;
            camPos = ct.position;
            camFwd = ct.forward;
            camRight = ct.right;
            camUp = ct.up;
            worldToCam = cam.worldToCameraMatrix;
            tanV = Mathf.Tan(cam.fieldOfView * 0.5f * Mathf.Deg2Rad);
            tanHView = tanV * cam.aspect;                                   // the frame actually shown (recycling)
            tanH = tanV * Mathf.Min(cam.aspect, PortraitAspect);            // placement + corridor: the portrait 9:16 frame
            focalRef = RefH / (2f * tanV);                                  // px of the 1536-high frame per unit at depth 1
        }

        /// <summary>Projected coin line from just ahead of Benny to the far field (bubbles.ts coreX / coreY).</summary>
        void ProjectCore(float focusS)
        {
            coreN = 0;
            for (int k = 0; k < CoreN; k++)
            {
                float s = Mathf.Min(RiverPath.TunnelLength - 1f, focusS + 1f + k * k * 0.06f + k * 0.5f);
                Vector3 v = worldToCam.MultiplyPoint3x4(new Vector3(CoinLineX(s), RiverPath.WaterY + 0.05f, s));
                float depth = -v.z;
                if (depth < 1f) continue;
                float yn = v.y / (depth * tanV);
                if (coreN > 0 && yn <= coreY[coreN - 1]) continue;   // keep it monotonic in screen y
                coreX[coreN] = v.x / (depth * tanH);
                coreY[coreN] = yn;
                coreN++;
            }
        }

        /// <summary>
        /// bubbles.ts allowed(): 1 = fine, 0 = in the no-bubble corridor (stream centre: Benny, splash, coin line) or the
        /// upper tube / HUD, -1 = out of the frame or inside the shader's near fade. r (world radius) widens the corridor.
        /// </summary>
        int Allowed(Vector3 p, float r)
        {
            Vector3 v = worldToCam.MultiplyPoint3x4(p);
            float depth = -v.z;
            if (depth < nearRecycle) return -1;
            float yn = v.y / (depth * tanV);
            if (Mathf.Abs(v.x / (depth * tanHView)) > 1.12f || yn < -1.12f || yn > 1.1f) return -1;
            if (yn > 0.62f) return 0;                                    // upper tube / HUD: keep clear (ref 05 has none there)
            float xn = v.x / (depth * tanH);
            float rN = r / (depth * tanH);
            float corridor = yn < 0.1f ? corridorXn.x : corridorXn.y;
            if (Mathf.Abs(xn) - rN < corridor) return 0;
            // Benny himself, wherever he is on screen (the corridor assumes him in the middle; steering hard and jumping move
            // him off centre): no bubble in front of his body / beanie (ellipse 1.15 x 1.35 m around his silhouette centre)
            if (hasBenny && depth < bennyEye + 1.2f)
            {
                float ex = (xn - bennyXn) / (1.15f / (bennyEye * tanH) + rN);
                float ey = (yn - bennyYn) / (1.35f / (bennyEye * tanV) + r / (depth * tanV));
                if (ex * ex + ey * ey < 1f) return 0;
            }
            // the route ahead (cyan core + coin line) winds off the screen centre in 05: keep a lane clear around it
            if (coreN > 1 && yn <= coreY[coreN - 1] && yn >= coreY[0] - 0.4f)
            {
                int i = 0;
                while (i < coreN - 2 && coreY[i + 1] < yn) i++;
                float t = Mathf.Clamp01((yn - coreY[i]) / Mathf.Max(1e-4f, coreY[i + 1] - coreY[i]));
                float xc = coreX[i] + (coreX[i + 1] - coreX[i]) * t;
                if (Mathf.Abs(xn - xc) - rN < CoreLane) return 0;
            }
            return 1;
        }

        void Spawn(ref Bubble b, bool initial)
        {
            b.phase = Rand() * 6.2832f;
            b.seed = Rand();
            // initial fill (run start / teleport): already floating at full size; respawn: born now (inflates)
            b.age = initial ? Range(0.9f, 4f) : 0f;
            b.life = Range(lifeRange.x, Mathf.Max(lifeRange.x, lifeRange.y));
            b.rise = 0f;
            float side = Rand() < 0.5f ? -1f : 1f;
            Vector3 p = camPos + camFwd * 10f;
            float r = 0.1f, floorY = RiverPath.WaterY;
            for (int attempt = 0; attempt < 6; attempt++)
            {
                // a side point of the portrait frame. Bubbles round 3: initial fill and respawns use the SAME bands (they ride
                // the current now, so the frame keeps the composition it starts with): farShare of them in the upper (far)
                // band along the far foam banks and walls, the rest in the lower band down to the near water beside Benny
                // (approved: ~12 in y 500-700, ~8 in 700-1000, the bottom ones come from the wake set)
                float yPx = Rand() < (b.big ? farShare : farShareSmall) ? Range(bandPx.x, farBottomPx) : Range(farBottomPx, bandPx.y);
                float yn = 1f - 2f * yPx / RefH;
                float xn = side * Range(b.big ? innerXn.x : innerXn.y, outerXn);
                Vector3 ray = camFwd + camRight * (xn * tanH) + camUp * (yn * tanV);
                // distance (along the view axis) to the water plane, then somewhere between the camera and that point
                float dw = ray.y < -1e-3f ? (RiverPath.WaterY - camPos.y) / ray.y : 40f;
                dw = Mathf.Clamp(dw, 3f, 40f);
                float d = Mathf.Max(3.9f, dw * Range(b.big ? 0.55f : 0.6f, 0.92f));
                // wanted on-screen diameter: smaller up in the far band, bigger down near the camera (approved: 15-42 px
                // along the far banks, 30-62 px at the frame edges lower down)
                float rowK = Mathf.Clamp01((yPx - bandPx.x) / Mathf.Max(1f, bandPx.y - bandPx.x));
                float pxLo = b.big ? Mathf.Lerp(bigPxFar.x, bigPx.x, rowK) : Mathf.Lerp(smallPxFar.x, smallPx.x, rowK);
                float pxHi = b.big ? Mathf.Lerp(bigPxFar.y, bigPx.y, rowK) : Mathf.Lerp(smallPxFar.y, smallPx.y, rowK);
                float px = pxLo + (pxHi - pxLo) * Mathf.Pow(Rand(), b.big ? 1.25f : 1.4f);
                // keep inside the tube and above the water / bank foam heap: slide toward the camera along the view ray, so
                // the bubble keeps its screen spot (raising it moved the lower-band bubbles up into the far band)
                bool ok = false;
                for (int k = 0; k < 8; k++)
                {
                    p = camPos + ray * d;
                    float depthK = Mathf.Max(2.5f, Vector3.Dot(p - camPos, camFwd));
                    r = px * depthK / (2f * focalRef);
                    r = b.big ? Mathf.Clamp(r, 0.05f, 0.5f) : Mathf.Clamp(r, 0.01f, 0.15f);
                    float sk = Mathf.Clamp(p.z, RiverPath.TunnelStart + 1f, RiverPath.TunnelLength - 1f);
                    floorY = RiverSurface.HeightAt(p.x, sk)
                           + (FoamBank.InChannel(p.x, sk, -r) ? 0.15f + 0.5f * r : 0.85f * FoamTop(Vector3.Distance(p, camPos)) + 0.4f * r);
                    if (Mathf.Abs(p.x) <= WallHalfWidth(p.y) - r - 0.25f && p.y >= floorY) { ok = true; break; }
                    if (d * 0.88f < 3.2f) break;
                    d *= 0.88f;
                }
                // that side of the frame is all near wall (hard left / right): try the other side instead of clamping
                // every respawn onto the same strip of wall (they piled up in one clump)
                if (!ok && Mathf.Abs(p.x) > WallHalfWidth(p.y) - 0.45f) { side = -side; continue; }
                if (p.y < floorY) p.y = floorY;
                float wall = WallHalfWidth(p.y) - r - 0.25f;
                p.x = Mathf.Clamp(p.x, -wall, wall);
                if (Allowed(p, b.big ? r : r * 0.5f) > 0) break;
            }
            b.pos = p;
            b.r = r;
            b.dead = false;
            if (!initial)
            {
                // a new bubble rises out of the foam / water under its spot while it inflates (decaying lift, ~1 s), so
                // respawns never appear out of thin air in the middle of the frame
                float lift = Mathf.Clamp(p.y - (floorY - 0.6f * r), 0f, 0.9f);
                b.pos.y -= lift;
                b.rise = 2.2f * lift;
            }
            float sv = Mathf.Clamp(p.z, RiverPath.TunnelStart, RiverPath.TunnelLength);
            // ride the current (see sideCarry), plus the slow float upward of bubbles.ts
            b.vel = RiverPath.Forward(sv) * (stageSpeed * Range(sideCarry.x, Mathf.Max(sideCarry.x, sideCarry.y)))
                  + Vector3.up * Range(0.04f, 0.16f);
        }

        /// <summary>
        /// Wake bubble: born inside the white splash fan just behind Benny, beside his body (screen side bands next to the fans,
        /// outside the corridor), carried by the current at wakeCarry x his speed, so it falls slowly behind him, rises out of
        /// the spray and drifts toward the bottom corner of the frame while it grows in perspective. initial = fill the whole
        /// trail at once (restart / teleport), anywhere between the fans and the camera.
        /// </summary>
        void SpawnWake(ref Bubble b, bool initial, float bennyDepth, float speed, float side)
        {
            b.phase = Rand() * 6.2832f;
            b.seed = Rand();
            b.age = 0f;
            b.life = Range(3f, 5f);
            b.dead = true;
            b.rise = 0f;
            for (int attempt = 0; attempt < 5; attempt++)
            {
                float yPx = Range(990f, 1150f);
                float yn = 1f - 2f * yPx / RefH;
                float xn = side * Range(0.52f, 0.78f);
                Vector3 ray = camFwd + camRight * (xn * tanH) + camUp * (yn * tanV);
                float d = Mathf.Max(nearRecycle + 1f, bennyDepth - Range(0.4f, 1.4f));
                Vector3 p = camPos + ray * d;
                float r = b.big ? Range(0.085f, 0.13f) : 0.018f + 0.03f * Mathf.Pow(Rand(), 1.3f);
                float s = Mathf.Clamp(p.z, RiverPath.TunnelStart + 1f, RiverPath.TunnelLength - 1f);
                p.y = Mathf.Max(p.y, RiverSurface.HeightAt(p.x, s) + 0.12f + 0.5f * r);
                float wall = WallHalfWidth(p.y) - r - 0.25f;
                p.x = Mathf.Clamp(p.x, -wall, wall);
                if (Allowed(p, b.big ? r : r * 0.5f) <= 0) continue;
                b.pos = p;
                b.r = r;
                b.dead = false;
                break;
            }
            float sv = Mathf.Clamp(b.pos.z, RiverPath.TunnelStart, RiverPath.TunnelLength);
            Vector3 fwd = RiverPath.Forward(sv);
            b.vel = fwd * (speed * Range(wakeCarry.x, wakeCarry.y)) + Vector3.up * Range(0.12f, 0.35f) + camRight * (side * Range(0f, 0.14f));
            if (initial && !b.dead)
            {
                // fill the trail at once: as if it had been thrown up tau seconds ago (camera and Benny moved on since)
                float tau = Range(0f, 1.1f);
                b.pos += (b.vel - fwd * speed) * tau;
                b.age = tau;
                if (Allowed(b.pos, b.big ? b.r : b.r * 0.5f) <= 0) b.dead = true;
            }
        }

        void LateUpdate()
        {
            if (bubbles == null || mesh == null) Init();
            if (bubbles.Length == 0) return;
            Camera cam = Camera.main;
            if (cam == null) return;
            SetView(cam);
            float s = Screen05Events.BennyS;
            ProjectCore(s);
            BennyController bc = BennyController.Instance;
            hasBenny = false;
            if (bc != null)
            {
                // centre of his silhouette (body + beanie + pompom, ~2.2 m tall from the waterline) ~0.65 m above the body pivot
                Vector3 vb = worldToCam.MultiplyPoint3x4(bc.BodyCenter + Vector3.up * 0.65f);
                bennyEye = -vb.z;
                if (bennyEye > 0.5f)
                {
                    hasBenny = true;
                    bennyXn = vb.x / (bennyEye * tanH);
                    bennyYn = vb.y / (bennyEye * tanV);
                }
            }
            float dt = Mathf.Min(Time.deltaTime, 0.05f);
            // respawn everything after a restart / teleport / camera jump (the screen-space placement needs the camera that
            // will actually show the bubbles); re-seeded from s so captures of the same moment are deterministic
            bool jump = float.IsNaN(lastS) || Mathf.Abs(s - lastS) > 6f || (lastCam - camPos).sqrMagnitude > 12.25f;
            if (!jump && dt > 1e-4f) bennySpeed = Mathf.Lerp(bennySpeed, Mathf.Max(0f, (s - lastS) / Mathf.Max(Time.deltaTime, 1e-4f)), 1f - Mathf.Exp(-dt * 4f));
            lastS = s;
            lastCam = camPos;
            // Benny's depth in front of the camera, and whether he is swimming in the water (SplashWake's _RainbowBenny.z = wake)
            float bennyDepth = Vector3.Dot(new Vector3(camPos.x, RiverPath.WaterY + 0.3f, s) - camPos, camFwd);
            Vector4 bg = Shader.GetGlobalVector(BennyId);
            float wakeK = bg.w > 0f ? bg.z : 1f;
            bool emitWake = bennySpeed > 3f && wakeK > 0.3f && s < RiverPath.FinishS;
            if (jump)
            {
                rng = (seed ^ (uint)Mathf.RoundToInt(Mathf.Abs(s) * 16f)) | 1u;
                bennySpeed = stageSpeed;
                for (int i = 0; i < bubbles.Length; i++)
                {
                    if (bubbles[i].wake) SpawnWake(ref bubbles[i], true, bennyDepth, stageSpeed, (i & 1) == 0 ? -1f : 1f);
                    else Spawn(ref bubbles[i], true);
                }
            }

            float t = Screen05Clock.Time;
            Matrix4x4 toLocal = transform.worldToLocalMatrix;
            for (int i = 0; i < bubbles.Length; i++)
            {
                Bubble b = bubbles[i];
                b.age += dt;
                b.pos += b.vel * dt;
                b.pos += new Vector3(Mathf.Sin(t * 1.3f + b.phase), Mathf.Cos(t * 1.1f + b.phase * 1.7f), Mathf.Sin(t * 0.9f + b.phase * 0.6f)) * (0.12f * dt);
                if (b.rise > 1e-3f)
                {
                    // newborn side bubble rising out of the foam / water (decaying lift)
                    b.pos.y += b.rise * dt;
                    b.rise *= Mathf.Exp(-2.2f * dt);
                }
                int a = b.dead ? -1 : Allowed(b.pos, b.big ? b.r : 0f);
                if (a < 0 || b.age > b.life || b.pos.z > RiverPath.TunnelLength - 1f)
                {
                    if (!b.wake) Spawn(ref b, false);
                    else if (emitWake) SpawnWake(ref b, false, bennyDepth, bennySpeed, (i & 1) == 0 ? -1f : 1f);   // alternate sides
                    else b.dead = true;                                          // Benny stopped / jumped: no new wake bubbles
                }
                else if (a == 0) b.life = Mathf.Min(b.life, b.age + 0.3f);      // drifted into the corridor: shrink away
                bubbles[i] = b;

                // grow from nothing when born, shrink away at the end (bubbles.ts pop), gentle breathing of the big ones
                // (wake bubbles inflate faster: they are only ~1-1.5 s on screen)
                float inflK = 1f / Mathf.Max(0.1f, inflateSeconds);
                float pop = b.wake ? Mathf.Min(1f, b.age * 3.5f, (b.life - b.age) * 3f)
                          : b.big ? Mathf.Min(1f, b.age * inflK, (b.life - b.age) * 2f) : Mathf.Min(1f, b.age * 2f * inflK, (b.life - b.age) * 3f);
                pop = b.dead ? 0f : Mathf.Max(0f, pop);
                float size = b.r * pop * (b.big ? 1f + 0.04f * Mathf.Sin(t * 4f + b.phase) : 1f);
                byte alpha = (byte)Mathf.RoundToInt(Mathf.Clamp01(pop * 2f) * 255f);
                Vector3 lp = toLocal.MultiplyPoint3x4(b.pos);
                float w = Mathf.Min(b.seed, 0.999f) + (b.big ? 0f : 1f);
                int v = i * 4;
                for (int k = 0; k < 4; k++)
                {
                    verts[v + k] = lp;
                    uvs[v + k].z = size;
                    uvs[v + k].w = w;
                    cols[v + k].a = alpha;
                }
            }
            mesh.vertices = verts;
            mesh.SetUVs(0, uvs);
            mesh.colors32 = cols;
            mesh.bounds = new Bounds(Vector3.zero, Vector3.one * 1000f);
        }
    }
}

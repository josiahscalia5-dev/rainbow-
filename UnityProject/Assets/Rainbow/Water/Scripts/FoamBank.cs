using System.Collections.Generic;
using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Thick pearly soap-foam banks along both sides of the river (foam area, round 2 2026-11-23). Approved Screen 05: the
    /// foam covers the outer water on BOTH sides so the open river is narrower and winds with the pink S-bands; it is a
    /// heap of clustered round soap bubbles of many sizes (big puffs, many small ones, 0.4-1 m tall), with a bubbly
    /// scalloped waterline and lavender / blue creases.
    /// Layout: BankEdges (CPU mirror of RBW_BankEdges in Shaders/RainbowFoamBank.hlsl - keep identical): the foam waterline
    /// runs just outside each pink band, the river shader draws the flat foam shelf from there to the wall (faded out close
    /// to the camera, where only these 3D clumps stand on open water), and these puffs pile on it: a lace of small bubbles
    /// on the waterline, the round rim mound, a sprinkle of small bubbles on its crest, a low heap body up to the wall,
    /// compact packed mounds where the cluster noise is high and a few loose small bubbles (cluster noise along s:
    /// naturally varied mounds and low stretches, never repeated blobs).
    /// Deterministic (same result on every build). Port of src/vfx/foam.ts (05 berm / bank puffs, wave-8 fine-foam lumps).
    /// Each puff is a camera-facing sphere IMPOSTOR (4 vertices, true per-pixel sphere depth in Shaders/RainbowFoam.shader),
    /// so every bubble is perfectly round at any distance and sinks into the water and its neighbours with curved creases.
    /// The shader scales each bubble (and its height above the floor) smoothly with the camera distance, 0.62 near .. 1.45
    /// far (foam.ts rafts: on-screen sizes stay ~10-45 px), so radii here are mid-distance sizes.
    /// Vertex data: POSITION = puff centre, UV0 = (corner x, corner y, radius, seed), UV1 = (ao, tint, stream centre, stream
    /// half width) - the shader lets the puffs on the stream ride the river swell and parts them around Benny.
    /// </summary>
    public static class FoamBank
    {
        public struct Puff
        {
            public Vector3 centre;
            public float radius;
            public float seed;
            public float ao;
            public float tint;
            public int side;         // -1 left bank, +1 right bank
        }

        public sealed class Chunk
        {
            public string name;
            public Mesh lod0;
            public Mesh lod1;
            public int puffCount;
        }

        /// <summary>|x| of the tunnel wall at the water (between the contract's 6.0 and the Three.js tube's 6.27).</summary>
        public const float WallX = 6.25f;
        /// <summary>LOD1 keeps only the puffs at least this big (the far banks read the same, much less overdraw).</summary>
        public const float Lod1MinRadius = 0.085f;   // (water round 3v: 0.13 -> 0.085 with the smaller suds)

        // mulberry32, the generator the Three.js game uses for its seeded effects
        sealed class Rng
        {
            uint a;
            public Rng(uint seed) { a = seed; }
            public float Next()
            {
                unchecked
                {
                    a += 0x6D2B79F5u;
                    uint t = a;
                    t = (t ^ (t >> 15)) * (t | 1u);
                    t ^= t + (t ^ (t >> 7)) * (t | 61u);
                    return ((t ^ (t >> 14)) >> 0) / 4294967296f;
                }
            }
            public float Range(float lo, float hi) => lo + (hi - lo) * Next();
        }

        static float Hash(float n)
        {
            float x = Mathf.Sin(n * 127.1f + 311.7f) * 43758.5453f;
            return x - Mathf.Floor(x);
        }

        static float SS(float a, float b, float x)
        {
            float t = Mathf.Clamp01((x - a) / (b - a));
            return t * t * (3f - 2f * t);
        }

        static float SMin(float a, float b, float k)
        {
            float h = Mathf.Max(k - Mathf.Abs(a - b), 0f) / k;
            return Mathf.Min(a, b) - h * h * k * 0.25f;
        }

        /// <summary>
        /// Waterlines of the left / right foam bank at s, RELATIVE to the stream centre RiverPath.Meander(s): x &lt; 0 &lt; y.
        /// (river round 4b: from the one layout table RiverLayout05, no formulas, no shader mirror)
        /// </summary>
        public static Vector2 BankEdges(float s)
        {
            float d = RiverPath.Meander(s);
            return new Vector2(RiverLayout05.X(RiverLayout05.WL, s) - d, RiverLayout05.X(RiverLayout05.WR, s) - d);
        }

        /// <summary>Half chord of the drum wall at the water at s (the nearer wall).</summary>
        public static float WallChord(float s) => Mathf.Min(DrumLayout05.WallXAt(s, 1), -DrumLayout05.WallXAt(s, -1));
        /// <summary>World x of the foam waterline on one side (-1 left, +1 right).</summary>
        public static float WaterlineX(float s, int side)
        {
            Vector2 e = BankEdges(s);
            return RiverPath.Meander(s) + (side < 0 ? e.x : e.y);
        }

        /// <summary>True when (x, s) lies on the open water between the foam banks (margin = extra distance inside).</summary>
        public static bool InChannel(float x, float s, float margin = 0f)
        {
            Vector2 e = BankEdges(s);
            float lr = x - RiverPath.Meander(s);
            return lr >= e.x + margin && lr <= e.y - margin;
        }

        /// <summary>
        /// Water round 3v: smooth 2-D value noise over the bank (world x, s), 0..1 - the rounded foam LUMPS (~0.5-0.8 m)
        /// the small suds heap into (approved: cauliflower lumps along the banks, not an even carpet of beads).
        /// </summary>
        static float Lump(float x, float z, int side)
        {
            float px = x * 1.7f + (side > 0 ? 31.7f : 5.3f), pz = z * 1.25f;
            float ix = Mathf.Floor(px), iz = Mathf.Floor(pz);
            float fx = px - ix, fz = pz - iz;
            fx = fx * fx * (3f - 2f * fx);
            fz = fz * fz * (3f - 2f * fz);
            float h00 = Hash(ix * 57.1f + iz * 113.3f), h10 = Hash((ix + 1f) * 57.1f + iz * 113.3f);
            float h01 = Hash(ix * 57.1f + (iz + 1f) * 113.3f), h11 = Hash((ix + 1f) * 57.1f + (iz + 1f) * 113.3f);
            return Mathf.Lerp(Mathf.Lerp(h00, h10, fx), Mathf.Lerp(h01, h11, fx), fz);
        }

        /// <summary>Smooth 1-D value noise along s (mound density), 0..1.</summary>
        static float ClusterNoise(float s, int side)
        {
            float p = s * 0.55f + (side > 0 ? 57.3f : 11.9f);                  // ~1-2 m clumps (approved near field)
            float i = Mathf.Floor(p);
            float f = p - i;
            f = f * f * (3f - 2f * f);
            float a = Mathf.Lerp(Hash(i), Hash(i + 1f), f);
            float q = s * 0.11f + (side > 0 ? 3.7f : 8.2f);
            float j = Mathf.Floor(q);
            float g = q - j;
            g = g * g * (3f - 2f * g);
            float b = Mathf.Lerp(Hash(j + 100f), Hash(j + 101f), g);
            return Mathf.Clamp01(a * 0.65f + b * 0.35f);
        }

        /// <summary>
        /// Geometry round 2026-11-24: height of the rope's mound surface above the floor at t = distance outward from the
        /// waterline / rope width (0 waterline .. 1 outer foot): a steep puffy front, the crest at ~0.4, a lower back that
        /// lets the purple wall show down to its base (approved: a rope of big puffs hugging the river, the wall right
        /// behind it), then a low lather (~0.08 m) from the rope to the wall.
        /// </summary>
        static float RopeSurface(float t, float crest)
        {
            if (t > 1f) return 0.08f;
            float g = (t - 0.4f) / 0.36f;
            return crest * (0.3f + 0.7f * Mathf.Exp(-g * g));
        }

        public static List<Puff> GeneratePuffs(uint seed = 0x05F0A3u)
        {
            return GenerateRopePuffs(seed);
        }

        /// <summary>
        /// River round 4b (2026-11-24): a narrow ROPE of big rounded puffs along each table waterline (RiverLayout05.Rope: width,
        /// crest, puff size): lace on the waterline, big puffs, medium puffs between them, small suds on the crest. NO lather
        /// between the rope and the wall: the river shader draws the drum's purple floor there.
        /// </summary>
        /// <summary>Puffs of a run-time stretch of the course (Course05Extension).</summary>
        public static List<Puff> GenerateRange(float s0, float s1, uint seed, float density)
        {
            rangeMin = s0; rangeMax = s1;
            try { return GenerateRopePuffs(seed, s0, s1, density, false); }
            finally { rangeMin = RiverPath.TunnelStart; rangeMax = RiverPath.TunnelLength; }
        }

        static float rangeMin = RiverPath.TunnelStart, rangeMax = RiverPath.TunnelLength;

        static List<Puff> GenerateRopePuffs(uint seed) => GenerateRopePuffs(seed, RiverPath.TunnelStart, RiverPath.TunnelLength, 1f, true);

        static List<Puff> GenerateRopePuffs(uint seed, float sFrom, float sTo, float density, bool approvedClumps)
        {
            var list = new List<Puff>(17000);
            var rng = new Rng(seed);
            for (int side = -1; side <= 1; side += 2)
            {
                float s = sFrom + 0.15f;
                while (s < sTo - 0.15f)
                {
                    float step = rng.Range(0.2f, 0.28f) / density;
                    float edge = WaterlineX(s, side);
                    Vector3 rope = RiverLayout05.Rope(s, side);
                    float cl = ClusterNoise(s, side);
                    float room = Mathf.Max(0.25f, side * (OuterAt(s, side) - edge));
                    float ropeW = Mathf.Min(rope.x * (0.8f + 0.4f * cl), room);
                    float crest = rope.y * (0.72f + 0.5f * cl);
                    float rs = rope.z;
                    float tk = ropeW / Mathf.Min(ropeW, 1.25f);   // shape round 6: the mound crest stays within ~1.25 m of the waterline
                    // the steps follow the bank's direction, so a steeply crossing waterline (far bends) stays closed
                    float slope = Mathf.Abs(WaterlineX(s + 0.25f, side) - WaterlineX(s - 0.25f, side)) / 0.5f;
                    float dens = Mathf.Min(1f + 0.5f * slope, 2f);

                    int nLace = Mathf.RoundToInt((3 + rng.Next() * 2f) * dens);   // round 8: finer, fewer beads
                    for (int k = 0; k < nLace; k++)
                    {
                        float u = rng.Next();
                        float r = 0.016f + 0.05f * u * u * u;
                        float z = s + rng.Range(-0.5f, 0.5f) * step;
                        Add(list, rng, side, WaterlineX(z, side) + side * rng.Range(-0.14f, 0.16f), z, r, rng.Range(0.3f, 0.5f), rng.Range(0.5f, 0.95f));
                    }
                    int nBig = 1 + (rng.Next() < 0.45f * dens + 0.3f * cl ? 1 : 0);
                    for (int k = 0; k < nBig; k++)
                    {
                        float t = rng.Range(0.18f, 0.85f);            // shape round 6: 0.1 -> 0.18 (big puffs bulged over the water)
                        float z = s + rng.Range(-0.5f, 0.5f) * step;
                        float x = WaterlineX(z, side) + side * t * ropeW;
                        float lump = Lump(x, z, side);
                        float r = (rng.Next() < 0.4f ? rng.Range(0.18f, 0.28f) : rng.Range(0.09f, 0.18f)) * (0.8f + 0.5f * lump) * rs;
                        if (rng.Next() < 0.18f && t > 0.35f) r *= 1.3f;   // shape round 6: mixed sizes, an odd big puff behind the rim
                        float surf = RopeSurface(t * tk, crest) * (0.75f + 0.5f * lump);
                        float y = RiverPath.WaterY + RiverSurface.BaseHeight(x, z) + Mathf.Max(surf - 0.82f * r, -0.35f * r);
                        AddAt(list, rng, side, new Vector3(ClampToWall(x, z), y, z), r, rng.Range(0.82f, 0.98f) * Valley(z, t, side));
                    }
                    int nMed = Mathf.RoundToInt((1.6f + rng.Next()) * dens * Mathf.Max(1f, 1f / Mathf.Max(rs, 0.5f)));   // finer ropes: more puffs
                    for (int k = 0; k < nMed; k++)
                    {
                        float t = rng.Range(0f, 1f);
                        float z = s + rng.Range(-0.5f, 0.5f) * step;
                        float x = WaterlineX(z, side) + side * t * ropeW;
                        float lump = Lump(x, z, side);
                        float r = rng.Range(0.08f, 0.14f) * (0.7f + 0.3f * rs);
                        float surf = RopeSurface(t * tk, crest) * (0.75f + 0.5f * lump);
                        float y = RiverPath.WaterY + RiverSurface.BaseHeight(x, z) + surf * 0.8f - 0.6f * r;
                        AddAt(list, rng, side, new Vector3(ClampToWall(x, z), y, z), r, rng.Range(0.7f, 0.86f) * Valley(z, t, side));
                    }
                    int nCrest = rng.Next() < 0.25f ? 1 : 0;
                    for (int k = 0; k < nCrest; k++)
                    {
                        float t = rng.Range(0.1f, 0.8f);
                        float z = s + rng.Range(-0.5f, 0.5f) * step;
                        float x = WaterlineX(z, side) + side * t * ropeW;
                        float lump = Lump(x, z, side);
                        float r = 0.03f + 0.045f * rng.Next();
                        float y = RiverPath.WaterY + RiverSurface.BaseHeight(x, z) + RopeSurface(t * tk, crest) * (0.75f + 0.5f * lump)
                                + 0.05f + r * 0.2f;
                        AddAt(list, rng, side, new Vector3(ClampToWall(x, z), y, z), r, rng.Range(0.93f, 1f));
                    }
                    s += step;
                }
            }
            if (!approvedClumps) return list;
            // separate low clumps drifting on the open water beside the route (approved: px x 0-130 / y 1010-1120)
            Clump(list, rng, -1, 14.2f, -2.85f, 0.7f, 0.42f, 60);
            for (int k = 0; k < 6; k++)
            {
                int sd = (k & 1) == 0 ? 1 : -1;
                float cs = 24f + 8.7f * k + rng.Range(-1.5f, 1.5f);
                float cx = WaterlineX(cs, sd) - sd * rng.Range(0.1f, 0.35f);
                Clump(list, rng, sd, cs, cx, rng.Range(0.35f, 0.6f), rng.Range(0.5f, 0.9f), 16);
            }
            return list;
        }

        /// <summary>Shape round 6: AO factor of the left bay (s 29-37): the middle of the rope is shaded bluer (approved: bluish
        /// valley at (200-240, 640-680) between the waterline puffs and the bright rim at the wall).</summary>
        static float Valley(float s, float t, int side)
        {
            if (side > 0) return 1f;
            float v = SS(28.5f, 30f, s) * (1f - SS(35f, 38f, s)) * SS(0.2f, 0.4f, t) * (1f - SS(0.75f, 0.95f, t));
            return 1f - 0.3f * v;
        }

        static void Clump(List<Puff> list, Rng rng, int side, float cs, float cx, float rx, float rz, int n)
        {
            for (int k = 0; k < n; k++)
            {
                float a = rng.Next() * 2f * Mathf.PI, q = Mathf.Sqrt(rng.Next());
                float x = cx + Mathf.Cos(a) * q * q * rx, z = cs + Mathf.Sin(a) * q * rz;
                float r = Mathf.Lerp(0.05f, 0.17f, Mathf.Pow(rng.Next(), 1.2f)) * (1.15f - 0.5f * q);
                float y = RiverPath.WaterY + RiverSurface.BaseHeight(x, z) + 0.2f * (1f - q * q) + r * rng.Range(-0.4f, 0.1f);
                AddAt(list, rng, side, new Vector3(x, y, z), r, Mathf.Lerp(0.97f, 0.82f, 1f - q));
            }
        }

        /// <summary>World x up to which foam puffs are placed at s on one side: the drum wall at the water plus a little tuck.</summary>
        static float WallAt(float s, int side) => DrumLayout05.WallXAt(s, side) + side * 0.15f;
        /// <summary>Shape round 6: outer limit of the puffs; the LEFT rope stops at x -6.05 for s 18-31 (approved: the wall stands
        /// right behind the bar at (60-290, 690-740); Unity's drum wall there is at -6.8..-7.0, puffs up to it rose 20-80 px into it).</summary>
        static float OuterAt(float s, int side)
        {
            float w = WallAt(s, side);
            if (side < 0) { float k = SS(18f, 20f, s) * (1f - SS(28f, 31f, s)); w = Mathf.Max(w, Mathf.Lerp(w, -6.05f, k)); }
            return w;
        }
        static float ClampToWall(float x, float s)
        {
            return x > 0f ? Mathf.Min(x, OuterAt(s, 1)) : Mathf.Max(x, OuterAt(s, -1));
        }

        /// <summary>A smaller bubble piled on top of (and a little outward from) another one.</summary>
        static void Pile(List<Puff> list, Rng rng, Puff b, int side, float ao)
        {
            float r2 = b.radius * rng.Range(0.48f, 0.74f);
            var c = b.centre + new Vector3(side * b.radius * rng.Range(0.05f, 0.4f), b.radius * rng.Range(0.55f, 0.8f),
                                           b.radius * rng.Range(-0.35f, 0.35f));
            AddAt(list, rng, side, c, r2, ao);
        }

        static int Add(List<Puff> list, Rng rng, int side, float x, float z, float r, float sink, float ao)
        {
            if (z < rangeMin || z > rangeMax) return -1;
            x = ClampToWall(x, z);
            float y = RiverPath.WaterY + RiverSurface.BaseHeight(x, z) + r * (1f - 2f * sink);
            return AddAt(list, rng, side, new Vector3(x, y, z), r, ao);
        }

        static int AddAt(List<Puff> list, Rng rng, int side, Vector3 c, float r, float ao)
        {
            if (c.z < rangeMin || c.z > rangeMax) return -1;
            list.Add(new Puff { centre = c, radius = r, seed = rng.Next(), ao = ao, tint = rng.Range(-1f, 1f), side = side });
            return list.Count - 1;
        }

        /// <summary>
        /// River round 4b: the soap foam Benny drags along, in HIS frame (x = right, z = forward; drawn by SplashWake): a rope along
        /// the outer edge of each pink wake sweep, bubbly suds piled beside his lower flanks, small lather behind. seed &gt;= 10
        /// marks wake puffs for RBW_FoamVertex (no parting, own swell).
        /// </summary>
        public static Mesh BuildWakeMesh(uint seed = 0x0511u)
        {
            // round 8 (2026-11-24, user: "remove the bulky lavender foam balls beside his wake"): only small soft clumps along the outer edge of the
            // sweeps, tapering backward; the lacy water itself is drawn by the splash sheets (SplashLace)
            var list = new List<Puff>(300);
            var rng = new Rng(seed);
            for (int side = -1; side <= 1; side += 2)
            {
                for (float b = 0.6f; b < 2.3f; b += 0.07f)
                {
                    float grow = SS(0.7f, 1.5f, b), taper = 1f - 0.55f * SS(1.7f, 2.3f, b);
                    int n = 7;                                  // round 9 wake: soft overlapping clumps with a few small bubbles
                    float cl = ClusterNoise(b * 4f + 3f * side, side);
                    for (int k = 0; k < n; k++)
                    {
                        float r = (k < 2 ? rng.Range(0.034f, 0.075f) * (0.55f + 0.65f * cl) : rng.Range(0.010f, 0.026f)) * (0.5f + 0.5f * grow) * taper;
                        float dl = 0.6f + 0.48f * b + (rng.Next() + rng.Next() - 1f) * 0.22f * (0.5f + 0.5f * grow);
                        AddWake(list, rng, side, dl, b + rng.Range(-0.05f, 0.05f), k < 2 ? -0.45f * r : 0.0f + 0.04f * grow * rng.Next(), r, rng.Range(0.86f, 1f));
                    }
                }
            }
            return BuildMesh(list, "WakeFoam05");
        }

        static void AddWake
(List<Puff> list, Rng rng, int side, float dl, float back, float y, float r, float ao)
        {
            list.Add(new Puff { centre = new Vector3(side * dl + 0.06f, y, -back), radius = r, seed = 10f + rng.Next(), ao = ao, tint = rng.Range(-1f, 1f), side = side });
        }

        /// <summary>Merges the puffs into chunk meshes (per bank side, chunkLength units along s): LOD0 all, LOD1 the big ones.</summary>
        public static List<Chunk> BuildChunks(List<Puff> puffs, float chunkLength = 10f)
        {
            var groups = new SortedDictionary<int, List<Puff>>();
            foreach (var p in puffs)
            {
                int ci = Mathf.FloorToInt((p.centre.z - RiverPath.TunnelStart) / chunkLength);
                int key = ci * 2 + (p.side > 0 ? 1 : 0);
                if (!groups.TryGetValue(key, out var g)) { g = new List<Puff>(); groups.Add(key, g); }
                g.Add(p);
            }
            var chunks = new List<Chunk>();
            foreach (var kv in groups)
            {
                int ci = kv.Key / 2;
                string side = (kv.Key % 2) == 1 ? "R" : "L";
                string nm = "FoamBank05_" + side + "_" + ci.ToString("00");
                var big = kv.Value.FindAll(p => p.radius >= Lod1MinRadius);
                chunks.Add(new Chunk
                {
                    name = nm,
                    lod0 = BuildMesh(kv.Value, nm + "_LOD0"),
                    lod1 = BuildMesh(big.Count > 0 ? big : kv.Value, nm + "_LOD1"),
                    puffCount = kv.Value.Count,
                });
            }
            return chunks;
        }

        /// <summary>One camera-facing quad per puff (expanded in the vertex shader); bounds cover the spheres + swell.</summary>
        public static Mesh BuildMesh(List<Puff> puffs, string name)
        {
            int nv = puffs.Count * 4;
            var pos = new Vector3[nv];
            var uv0 = new List<Vector4>(nv);
            var uv1 = new List<Vector4>(nv);
            var tri = new int[puffs.Count * 6];
            int v = 0, t = 0;
            float maxR = 0f;
            foreach (var p in puffs)
            {
                maxR = Mathf.Max(maxR, p.radius);
                float d = RiverPath.Meander(p.centre.z);
                float hw = RiverSurface.StreamHalfWidth(p.centre.z);
                for (int k = 0; k < 4; k++)
                {
                    float cx = (k == 1 || k == 2) ? 1f : -1f;
                    float cy = k >= 2 ? 1f : -1f;
                    pos[v + k] = p.centre;
                    uv0.Add(new Vector4(cx, cy, p.radius, p.seed));
                    uv1.Add(new Vector4(p.ao, p.tint, d, hw));
                }
                tri[t++] = v; tri[t++] = v + 2; tri[t++] = v + 1;
                tri[t++] = v; tri[t++] = v + 3; tri[t++] = v + 2;
                v += 4;
            }
            var mesh = new Mesh { name = name };
            mesh.indexFormat = nv > 65000 ? UnityEngine.Rendering.IndexFormat.UInt32 : UnityEngine.Rendering.IndexFormat.UInt16;
            mesh.vertices = pos;
            mesh.SetUVs(0, uv0);
            mesh.SetUVs(1, uv1);
            mesh.triangles = tri;
            mesh.RecalculateBounds();
            var b2 = mesh.bounds;
            b2.Expand(2f * maxR + 0.4f);    // sphere radius, swell, breathing, Benny push
            mesh.bounds = b2;
            return mesh;
        }
    }
}

using System.Collections.Generic;
using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// Soft pearly foam clouds piled along both river banks (Agent 3). Deterministic placement (same result on every
    /// build): a lace of small puffs straddling the stream's waterline, medium puffs filling the foam shelf up to the
    /// wall, and rounded clusters of big puffs with smaller ones piled on top (cluster noise along s, so the banks have
    /// naturally varied mounds and gaps - never identical repeated blobs). Ported idea and colours: src/vfx/foam.ts
    /// (bank lace, puffs, wave-7 05 soap shading); shading lives in Shaders/RainbowFoam.hlsl.
    /// Puffs are low-poly domes merged into chunk meshes (LOD0 12x5, LOD1 7x3); each vertex carries
    /// UV0 = (seed, ao) and UV1 = (puff centre, radius) so the shader shades every puff as a perfect sphere.
    /// </summary>
    public static class FoamBank
    {
        public struct Puff
        {
            public Vector3 centre;
            public Vector3 scale;    // per-axis squash (x across, y up, z along the river)
            public float radius;
            public float seed;
            public float ao;
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

        /// <summary>Smooth 1-D value noise along s (cluster density), 0..1.</summary>
        static float ClusterNoise(float s, int side)
        {
            float p = s * 0.33f + (side > 0 ? 57.3f : 11.9f);
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

        public static List<Puff> GeneratePuffs(uint seed = 0x05F0A3u)
        {
            var list = new List<Puff>(1400);
            var rng = new Rng(seed);
            for (int side = -1; side <= 1; side += 2)
            {
                float s = RiverPath.TunnelStart + 0.3f;
                while (s < RiverPath.TunnelLength - 0.3f)
                {
                    float d = RiverPath.Meander(s);
                    float hw = RiverSurface.StreamHalfWidth(s);
                    float edge = d + side * hw;                                   // stream waterline
                    float shelfW = Mathf.Max(0f, side * (side * WallX - edge));   // foam shelf width to the wall
                    float cl = ClusterNoise(s, side);

                    // 1) lace: small puffs straddling the waterline
                    int nLace = 1 + (rng.Next() < 0.6f ? 1 : 0);
                    for (int k = 0; k < nLace; k++)
                        Add(list, rng, side, edge + side * rng.Range(-0.22f, 0.12f), s + rng.Range(-0.25f, 0.25f),
                            rng.Range(0.07f, 0.17f), rng.Range(0.25f, 0.4f), rng.Range(0.85f, 1f));

                    // 2) shelf fill up to the wall
                    int nFill = Mathf.FloorToInt(shelfW / 0.6f);
                    for (int k = 0; k < nFill; k++)
                        Add(list, rng, side, edge + side * (0.25f + rng.Next() * shelfW), s + rng.Range(-0.3f, 0.3f),
                            rng.Range(0.16f, 0.34f), rng.Range(0.15f, 0.3f), rng.Range(0.8f, 0.95f));

                    // 3) rounded clusters of big puffs, some with smaller ones piled on top
                    if (cl > 0.42f)
                    {
                        int nBig = 1 + Mathf.FloorToInt(cl * 2.2f * rng.Range(0.6f, 1f));
                        for (int k = 0; k < nBig; k++)
                        {
                            float r = rng.Range(0.3f, 0.42f + 0.33f * cl);
                            float x = edge + side * rng.Range(-0.05f, 0.55f);
                            float z = s + rng.Range(-0.35f, 0.35f);
                            int baseIndex = Add(list, rng, side, x, z, r, rng.Range(0.18f, 0.3f), rng.Range(0.86f, 0.96f));
                            if (rng.Next() < 0.5f && baseIndex >= 0)
                            {
                                Puff b = list[baseIndex];
                                float r2 = r * rng.Range(0.45f, 0.7f);
                                var p = new Puff
                                {
                                    centre = b.centre + new Vector3(side * r * rng.Range(0.1f, 0.4f), r * rng.Range(0.5f, 0.65f), rng.Range(-0.2f, 0.2f) * r),
                                    scale = new Vector3(rng.Range(0.92f, 1.08f), rng.Range(0.85f, 1f), rng.Range(1f, 1.25f)),
                                    radius = r2,
                                    seed = rng.Next(),
                                    ao = 1f,
                                    side = side,
                                };
                                list.Add(p);
                            }
                        }
                    }
                    s += rng.Range(0.42f, 0.72f);
                }
            }
            return list;
        }

        static int Add(List<Puff> list, Rng rng, int side, float x, float z, float r, float sink, float ao)
        {
            if (z < RiverPath.TunnelStart || z > RiverPath.TunnelLength) return -1;
            x = Mathf.Clamp(x, -WallX, WallX);
            float y = RiverPath.WaterY + RiverSurface.BaseHeight(x, z) - r * sink;
            list.Add(new Puff
            {
                centre = new Vector3(x, y, z),
                scale = new Vector3(rng.Range(0.9f, 1.1f), rng.Range(0.8f, 1f), rng.Range(1f, 1.35f)),
                radius = r,
                seed = rng.Next(),
                ao = ao,
                side = side,
            });
            return list.Count - 1;
        }

        /// <summary>Merges the puffs into chunk meshes (per bank side, chunkLength units along s), LOD0 + LOD1.</summary>
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
                chunks.Add(new Chunk
                {
                    name = nm,
                    lod0 = BuildMesh(kv.Value, 12, 5, nm + "_LOD0"),
                    lod1 = BuildMesh(kv.Value, 7, 3, nm + "_LOD1"),
                    puffCount = kv.Value.Count,
                });
            }
            return chunks;
        }

        /// <summary>Domes (sphere cap from slightly below the equator to the pole) merged into one mesh.</summary>
        public static Mesh BuildMesh(List<Puff> puffs, int segments, int rings, string name)
        {
            const float latMin = -0.3f;
            int vpp = segments * rings + 1;
            int tpp = segments * (rings - 1) * 2 + segments;
            int nv = puffs.Count * vpp;
            var pos = new Vector3[nv];
            var nor = new Vector3[nv];
            var uv0 = new Vector2[nv];
            var uv1 = new List<Vector4>(nv);
            var tri = new int[puffs.Count * tpp * 3];
            int v = 0, t = 0;
            foreach (var p in puffs)
            {
                int baseV = v;
                var cr = new Vector4(p.centre.x, p.centre.y, p.centre.z, p.radius);
                for (int k = 0; k < rings; k++)
                {
                    float lat = latMin + (Mathf.PI * 0.5f - latMin) * k / rings;
                    float cl = Mathf.Cos(lat), sl = Mathf.Sin(lat);
                    for (int m = 0; m < segments; m++)
                    {
                        float az = 2f * Mathf.PI * (m + 0.5f * (k & 1)) / segments;
                        var dir = new Vector3(cl * Mathf.Cos(az), sl, cl * Mathf.Sin(az));
                        pos[v] = p.centre + Vector3.Scale(dir, p.scale) * p.radius;
                        nor[v] = dir;
                        uv0[v] = new Vector2(p.seed, p.ao);
                        uv1.Add(cr);
                        v++;
                    }
                }
                pos[v] = p.centre + new Vector3(0f, p.scale.y * p.radius, 0f);
                nor[v] = Vector3.up;
                uv0[v] = new Vector2(p.seed, p.ao);
                uv1.Add(cr);
                int pole = v;
                v++;
                for (int k = 0; k < rings - 1; k++)
                {
                    for (int m = 0; m < segments; m++)
                    {
                        int m1 = (m + 1) % segments;
                        int a = baseV + k * segments + m;
                        int b = baseV + k * segments + m1;
                        int c = baseV + (k + 1) * segments + m;
                        int dd = baseV + (k + 1) * segments + m1;
                        tri[t++] = a; tri[t++] = c; tri[t++] = b;     // outward-facing (clockwise from outside)
                        tri[t++] = b; tri[t++] = c; tri[t++] = dd;
                    }
                }
                int top = baseV + (rings - 1) * segments;
                for (int m = 0; m < segments; m++)
                {
                    int m1 = (m + 1) % segments;
                    tri[t++] = top + m; tri[t++] = pole; tri[t++] = top + m1;
                }
            }
            var mesh = new Mesh { name = name };
            mesh.indexFormat = nv > 65000 ? UnityEngine.Rendering.IndexFormat.UInt32 : UnityEngine.Rendering.IndexFormat.UInt16;
            mesh.vertices = pos;
            mesh.normals = nor;
            mesh.uv = uv0;
            mesh.SetUVs(1, uv1);
            mesh.triangles = tri;
            mesh.RecalculateBounds();
            var b2 = mesh.bounds;
            b2.Expand(0.15f);    // breathing / wobble
            mesh.bounds = b2;
            return mesh;
        }
    }
}

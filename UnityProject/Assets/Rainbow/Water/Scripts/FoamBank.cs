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
        /// The open water lies between them, the foam from there to the wall (CPU mirror of RBW_BankEdges).
        /// </summary>
        public static Vector2 BankEdges(float s)
        {
            float d = RiverPath.Meander(s);
            float hw = Mathf.Max(RiverSurface.StreamHalfWidth(s), 0.5f);
            float sm = s + RiverSurface.SOffset;
            float mb = RiverSurface.CoreSwing * d + RiverSurface.CoreShift(s) + RiverSurface.SBend(sm) + BandFitM(sm);
            return BankEdges(d, hw, mb, sm, WallChord(s));
        }

        /// <summary>
        /// River round 2026-11-23: half chord of the drum wall at the water at s (DrumLayout05; the river mesh carries it in
        /// UV1.w for the shader). The foam rims hug this wall.
        /// </summary>
        public static float WallChord(float s) => DrumLayout05.WaterChord(s) - Mathf.Abs(DrumLayout05.AxisX);

        /// <summary>RBW_BandFL (Shaders/RainbowFoamBank.hlsl): left band offset fit.</summary>
        public static float BandFL(float sm)
        {
            return -0.5f * SS(143f, 147f, sm) * (1f - SS(151f, 155f, sm))
                 + 1.0f * SS(154f, 158f, sm) * (1f - SS(168f, 176f, sm))
                 + 1.5f * SS(147.5f, 151.5f, sm) * (1f - SS(158f, 166f, sm))
                 - 0.45f * SS(135.5f, 137.5f, sm) * (1f - SS(140.0f, 142.0f, sm));
        }

        /// <summary>RBW_BandFR (Shaders/RainbowFoamBank.hlsl): right band offset fit.</summary>
        public static float BandFR(float sm)
        {
            return -0.3f * SS(133f, 136f, sm) * (1f - SS(139.5f, 142f, sm))
                 + 1.9f * SS(146.5f, 154f, sm) * (1f - SS(160f, 168f, sm))
                 - 0.9f * SS(165f, 170f, sm) * (1f - SS(174f, 180f, sm))
                 + 1.4f * SS(152f, 156f, sm) * (1f - SS(161f, 168f, sm));
        }

        /// <summary>RBW_BandFitM (Shaders/RainbowFoamBank.hlsl): lateral shift of the band pair (added to the band S).</summary>
        public static float BandFitM(float sm)
        {
            return 1.0f * SS(137.2f, 139.7f, sm) * (1f - SS(141.2f, 147.2f, sm))
                 - 0.35f * SS(147.7f, 150.7f, sm) * (1f - SS(153.7f, 158.7f, sm))
                 - 1.0f * SS(166.7f, 171.7f, sm) * (1f - SS(176.7f, 182.7f, sm));
        }

        /// <summary>RBW_BandLimits (Shaders/RainbowFoamBank.hlsl): room of the bands on each side relative to d.</summary>
        public static Vector2 BandLimits(float d, float hw, float W, float sm)
        {
            float k = SS(136.2f, 140.2f, sm) * (W >= 1f ? 1f : 0f);
            return new Vector2(Mathf.Lerp(hw - 0.5f, W + d - 0.6f, k), Mathf.Lerp(hw - 0.5f, W - d - 0.6f, k));
        }

        /// <summary>RBW_BankEdges (Shaders/RainbowFoamBank.hlsl), line by line.</summary>
        public static Vector2 BankEdges(float d, float hw, float mb, float sm, float W)
        {
            hw = Mathf.Max(hw, 0.5f);
            float fR = BandFR(sm);
            float fL = BandFL(sm);
            Vector2 lim = BandLimits(d, hw, W, sm);
            float offL = hw * (0.62f + 0.03f * Mathf.Sin(sm * 0.13f + 1.7f)) + fL;
            float offR = hw * (0.62f + 0.03f * Mathf.Sin(sm * 0.11f + 4.2f)) + fR;
            float wL = hw * 0.205f * (1f + 0.15f * Mathf.Sin(sm * 0.19f + 0.4f));
            float wR = hw * 0.205f * (1f + 0.15f * Mathf.Sin(sm * 0.17f + 2.9f));
            float roomL = mb + lim.x - offL;
            float roomR = lim.y - mb - offR;
            wL = SMin(wL, Mathf.Max(roomL, 0.6f * wL), 0.5f);
            wR = SMin(wR, Mathf.Max(roomR, 0.6f * wR), 0.5f);
            offL = SMin(offL, mb + lim.x - wL, 1.2f);
            offR = SMin(offR, lim.y - wR - mb, 1.2f);
            float eL = mb - offL - wL;
            float eR = mb + offR + wR;
            eL -= 0.26f + 0.12f * Mathf.Sin(sm * 0.37f + 1.3f) + 0.07f * Mathf.Sin(sm * 0.91f + 0.4f);
            eR += 0.26f + 0.12f * Mathf.Sin(sm * 0.41f + 4.1f) + 0.07f * Mathf.Sin(sm * 0.87f + 2.2f);
            float pL = 0.6f * Mathf.Sin(sm * 0.173f + 0.6f) + 0.4f * Mathf.Sin(sm * 0.419f + 2.3f);
            float pR = 0.6f * Mathf.Sin(sm * 0.191f + 3.7f) + 0.4f * Mathf.Sin(sm * 0.443f + 0.9f);
            eL += 0.8f * SS(0.3f, 0.95f, pL);
            eR -= 0.8f * SS(0.3f, 0.95f, pR);
            float kW = SS(136.2f, 136.9f, sm) * (W >= 1f ? 1f : 0f);
            float wallL = -(W + d);
            float wallR = W - d;
            float rimL = 0.35f + 1.2f * SS(136.9f, 137.9f, sm) + 0.5f * SS(137.9f, 140.0f, sm)
                       + 0.9f * SS(139.5f, 142.5f, sm) - 0.4f * SS(143.5f, 146.5f, sm)
                       - 0.6f * SS(146.0f, 148.0f, sm) - 1.35f * SS(148.0f, 149.5f, sm)
                       - 0.25f * SS(149.5f, 151.5f, sm);
            float rimLmin = Mathf.Lerp(rimL, 0.35f, SS(152.0f, 154.0f, sm));
            float rimRn = 0.62f + 0.9f * (1f - SS(141.2f, 143.2f, sm)) + 0.5f * (1f - SS(139.5f, 141.0f, sm))
                        + 0.35f * SS(151.5f, 154.0f, sm) + 0.5f * SS(154.5f, 157.5f, sm);
            float rimR = 0.45f + 0.75f * (1f - SS(141.5f, 144.0f, sm)) + 3.0f * (1f - SS(140.0f, 141.5f, sm))
                       + 1.15f * SS(157.7f, 160.7f, sm) + 0.7f * SS(160.7f, 164.3f, sm)
                       + 0.5f * SS(164.3f, 168.3f, sm) + 0.7f * SS(168.3f, 173.2f, sm)
                       + 0.4f * SS(173.2f, 179.3f, sm) - 1.8f * SS(179.3f, 186.7f, sm)
                       - 1.5f * SS(186.7f, 196.7f, sm);
            rimR = Mathf.Max(rimR, rimRn);
            float rimRmin = Mathf.Lerp(rimRn, rimR, SS(156.5f, 158.5f, sm) * (1f - SS(185.0f, 189.0f, sm)));
            eL = Mathf.Lerp(eL, Mathf.Clamp(eL, wallL + rimLmin, wallL + rimL), kW);
            eR = Mathf.Lerp(eR, Mathf.Clamp(eR, wallR - rimR, wallR - rimRmin), kW);
            float kL1 = SS(126.6f, 127.6f, sm) * (1f - SS(129.0f, 129.8f, sm));
            float kL2 = SS(129.0f, 130.0f, sm) * (1f - SS(131.6f, 132.6f, sm));
            float kR1 = SS(126.6f, 127.6f, sm) * (1f - SS(128.9f, 129.7f, sm));
            float kR2 = SS(130.6f, 132.0f, sm) * (1f - SS(137.0f, 139.5f, sm));
            eL = Mathf.Lerp(eL, Mathf.Max(eL, -1.25f), kL1);
            eL = Mathf.Lerp(eL, Mathf.Max(eL, -2.05f), kL2);
            eR = Mathf.Lerp(eR, Mathf.Min(eR, 1.3f), kR1);
            eR = Mathf.Lerp(eR, Mathf.Min(eR, 2.7f), kR2);
            float coin = 0.63f * d;
            eL = Mathf.Min(eL, coin - 1.25f);
            eR = Mathf.Max(eR, coin + 1.25f);
            var e = new Vector2(Mathf.Max(eL, Mathf.Lerp(-hw, wallL, kW)), Mathf.Min(eR, Mathf.Lerp(hw, wallR, kW)));
            // coordinator round 3 (2026-11-23): narrow foam banks hugging the wall (RBW_FOAM_CAP in RainbowFoamBank.hlsl)
            if (W >= 1f)
            {
                e.x = Mathf.Min(e.x, wallL + FoamRimCap);
                e.y = Mathf.Max(e.y, wallR - FoamRimCap);
            }
            return e;
        }

        /// <summary>Coordinator round 3: maximum foam width in front of the drum wall (m); = RBW_FOAM_CAP (shader).</summary>
        public const float FoamRimCap = 1.3f;

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

        public static List<Puff> GeneratePuffs(uint seed = 0x05F0A3u)
        {
            // (water round 3v 2026-11-23) SOFT, FINE soap suds. The approved banks are narrow rims of MANY small clustered
            // bubbles (world radius ~0.05-0.18 m: 6-15 px far away, 25-50 px beside Benny) piled AGAINST the walls - the
            // bank rises from a lacy waterline to ~0.35-0.7 m at the wall - not wide fields of big round blobs (the old
            // rim / heap puffs were up to 0.44 m and the shader grew far ones 1.45x: 30-60 px cotton balls everywhere).
            // RainbowFoam.hlsl keeps the sizes nearly true now (0.85 near .. 1.0 far), so radii here are real sizes.
            var list = new List<Puff>(22000);
            var rng = new Rng(seed);
            for (int side = -1; side <= 1; side += 2)
            {
                float s = RiverPath.TunnelStart + 0.15f;
                while (s < RiverPath.TunnelLength - 0.15f)
                {
                    float step = rng.Range(0.22f, 0.32f);
                    float edge = WaterlineX(s, side);                               // the foam waterline (world x)
                    // foam from there to the real drum wall (river round 2026-11-23: was the fixed WallX 6.25, which left
                    // wide foam fields where the narrower frame-round drum stands at +-5.3 m)
                    float shelfW = Mathf.Max(0f, side * (side * WallAt(s) - edge));
                    float cl = ClusterNoise(s, side);                               // 0 low stretch .. 1 big mound
                    // bank profile: LOW lumpy mounds (water_t1: a bank rising to ~1.1 m at the wall hid the purple wall
                    // behind a flat carpet of beads; approved: rounded lumps along the waterline, the wall right behind)
                    // coordinator round 3: with the banks capped at FoamRimCap the bank is a narrow TALL rope against the
                    // wall (approved: ~1.3 m wide, ~0.5-0.7 m high puffy rims; was 0.17-0.39 m low lumps)
                    float hW = (0.32f + 0.30f * cl) * Mathf.Clamp(0.7f + shelfW / 2.5f, 0.7f, 1.0f);

                    // 1) lace: tiny bubbles straddling the waterline (the bubbly scalloped edge, soft toward the water)
                    int nLace = 4 + (rng.Next() < 0.5f ? 1 : 0);
                    for (int k = 0; k < nLace; k++)
                    {
                        float u = rng.Next();
                        float r = 0.022f + 0.045f * u * u;
                        Add(list, rng, side, edge + side * rng.Range(-0.12f, 0.08f), s + rng.Range(-0.5f, 0.5f) * step,
                            r, rng.Range(0.3f, 0.5f), rng.Range(0.88f, 1f));
                    }

                    // 2) the bank surface: many small puffs heaped into rounded LUMPS (2-D lump noise: lumps of bumps,
                    //    bigger puffs on the lump crests, bluer puffs in the hollows between them)
                    float nS = (shelfW + hW) / 0.17f * (0.75f + 0.5f * cl) * (0.85f + 0.3f * rng.Next());
                    int nSurf = Mathf.Max(2, Mathf.FloorToInt(nS) + (rng.Next() < nS - Mathf.Floor(nS) ? 1 : 0));
                    for (int k = 0; k < nSurf; k++)
                    {
                        float f = Mathf.Pow(rng.Next(), 0.85f);
                        float x = edge + side * (0.04f + f * Mathf.Max(shelfW - 0.04f, 0f));
                        float z = s + rng.Range(-0.5f, 0.5f) * step;
                        float lump = Lump(x, z, side);
                        float u = rng.Next();
                        float r = Mathf.Lerp(0.06f, 0.13f + 0.10f * lump + 0.05f * cl, Mathf.Pow(u, 1.6f));   // bigger puffs
                        float hs = hW * (0.65f + 0.35f * f) * (0.25f + 1.25f * lump * lump);
                        float y = RiverPath.WaterY + RiverSurface.BaseHeight(x, z) + hs * rng.Range(0.75f, 1.05f) - r * 0.45f;
                        float ao = Mathf.Lerp(0.68f, 0.97f, Mathf.Clamp01(hs / (hW * 1.1f)));
                        AddAt(list, rng, side, new Vector3(ClampToWall(x, z), y, z), r, ao);
                    }

                    // 3) core: a few bigger, sunk puffs inside the bank fill the volume under the surface
                    int nCore = 1 + Mathf.FloorToInt(cl * 1.6f + rng.Next() + shelfW * 0.6f);
                    for (int k = 0; k < nCore; k++)
                    {
                        float f = rng.Range(0.25f, 1f);
                        float x = edge + side * f * shelfW;
                        float z = s + rng.Range(-0.5f, 0.5f) * step;
                        float lump = Lump(x, z, side);
                        float r = rng.Range(0.12f, 0.2f + 0.05f * cl) * (0.75f + 0.4f * lump);
                        float y = RiverPath.WaterY + RiverSurface.BaseHeight(x, z)
                                + hW * (0.65f + 0.35f * f) * (0.25f + 1.25f * lump * lump) * 0.5f - r * 0.5f;
                        AddAt(list, rng, side, new Vector3(ClampToWall(x, z), y, z), r, rng.Range(0.7f, 0.82f));
                    }

                    // 4) crest sprinkle: tiny bubbles resting on the lumps (the fine suds texture)
                    int nCrest = Mathf.FloorToInt(cl * 2.4f + 0.6f + rng.Next());
                    for (int k = 0; k < nCrest; k++)
                    {
                        float f = rng.Next();
                        float x = edge + side * f * shelfW;
                        float z = s + rng.Range(-0.5f, 0.5f) * step;
                        float lump = Lump(x, z, side);
                        float r = 0.02f + 0.035f * rng.Next();
                        float y = RiverPath.WaterY + RiverSurface.BaseHeight(x, z)
                                + hW * (0.65f + 0.35f * f) * (0.25f + 1.25f * lump * lump) + r * 0.2f;
                        AddAt(list, rng, side, new Vector3(ClampToWall(x, z), y, z), r, rng.Range(0.92f, 1f));
                    }

                    // 5) small packed clumps reaching onto the water where the mound noise is high (point bars, the low
                    //    clumps beside / behind Benny)
                    if (rng.Next() < 0.4f * SS(0.4f, 0.85f, cl))
                    {
                        float hx = edge + side * rng.Range(-0.15f, 0.25f);
                        float hz = s + rng.Range(-0.5f, 0.5f) * step;
                        float hR = rng.Range(0.18f, 0.32f);                                 // footprint radius
                        float hH = rng.Range(0.1f, 0.2f) * (0.7f + 0.5f * cl);             // mound height
                        int nH = 10 + Mathf.FloorToInt(rng.Next() * 7f);
                        for (int k = 0; k < nH; k++)
                        {
                            float a = rng.Next() * 2f * Mathf.PI;
                            float q = Mathf.Sqrt(rng.Next());                              // 0 middle .. 1 edge
                            float hxk = hx + Mathf.Cos(a) * q * hR * 0.85f;
                            float hzk = hz + Mathf.Sin(a) * q * hR * 1.25f;
                            float r = Mathf.Lerp(0.04f, 0.12f, Mathf.Pow(rng.Next(), 1.5f)) * (1.1f - 0.4f * q);
                            float y = RiverPath.WaterY + RiverSurface.BaseHeight(hxk, hzk) + hH * (1f - q * q)
                                    + r * rng.Range(-0.4f, 0.1f);
                            AddAt(list, rng, side, new Vector3(ClampToWall(hxk, hzk), y, hzk), r,
                                  Mathf.Lerp(0.97f, 0.8f, 1f - q));
                        }
                    }
                    s += step;
                }
            }
            return list;
        }

        /// <summary>|x| up to which foam puffs are placed at s: the drum wall at the water plus a little tuck under it.</summary>
        static float WallAt(float s) => Mathf.Min(WallX, WallChord(s) + 0.2f);

        static float ClampToWall(float x, float s)
        {
            float w = WallAt(s);
            return Mathf.Clamp(x, -w, w);
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
            if (z < RiverPath.TunnelStart || z > RiverPath.TunnelLength) return -1;
            x = ClampToWall(x, z);
            float y = RiverPath.WaterY + RiverSurface.BaseHeight(x, z) + r * (1f - 2f * sink);
            return AddAt(list, rng, side, new Vector3(x, y, z), r, ao);
        }

        static int AddAt(List<Puff> list, Rng rng, int side, Vector3 c, float r, float ao)
        {
            if (c.z < RiverPath.TunnelStart || c.z > RiverPath.TunnelLength) return -1;
            list.Add(new Puff { centre = c, radius = r, seed = rng.Next(), ao = ao, tint = rng.Range(-1f, 1f), side = side });
            return list.Count - 1;
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

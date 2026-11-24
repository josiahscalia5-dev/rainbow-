using System;
using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>
    /// Water look round 8 (master direction 2026-11-24): the two small textures of the luminous flowing river.
    ///  * RainbowSilk05.png (2048 x 1024, tileable, linear): R = silk value with a UNIFORM histogram (broad satin folds + fine streaks +
    ///    slivers of light, all stretched along the flow), G = glint slivers only, BA = flow-aligned ripple normal (0.5 = flat).
    ///    Purely procedural (seeded).
    ///  * RiverRamp05.asset (96 x 32 RGBAHalf): colour of the water by streamline coordinate q (x, -3..3) and silk value (y), measured
    ///    statistics (quantiles of the colours at every q) of the approved water, converted to scene-linear with the inverse of
    ///    the scene grade. Rows 0-15 = near water, 16-31 = mid / far water. y inside a zone = 1 - sqrt(1 - silk).
    /// Both are made once by AgentScripts/screen05_make_water_textures.cs; WaterBuilder only assigns them.
    /// </summary>
    public static class WaterTextureFactory
    {
        public const string SilkPath = "Assets/Rainbow/Water/Textures/RainbowSilk05.png";
        public const string RampPath = "Assets/Rainbow/Water/Generated/RiverRamp05.asset";
        const int W = 2048, H = 1024;

        // ------------------------------------------------------------------ helpers
        static float Hash(int x, int y, int seed)
        {
            unchecked
            {
                uint h = (uint)(x * 374761393 + y * 668265263 + seed * 1442695041);
                h = (h ^ (h >> 13)) * 1274126177u;
                h ^= h >> 16;
                return (h & 0xFFFFFF) / 16777215f;
            }
        }

        static float PNoise(float x, float y, int px, int py, int seed)
        {
            int ix = Mathf.FloorToInt(x), iy = Mathf.FloorToInt(y);
            float fx = x - ix, fy = y - iy;
            fx = fx * fx * fx * (fx * (fx * 6f - 15f) + 10f);
            fy = fy * fy * fy * (fy * (fy * 6f - 15f) + 10f);
            int M(int a, int m) { a %= m; return a < 0 ? a + m : a; }
            int x0 = M(ix, px), x1 = M(ix + 1, px), y0 = M(iy, py), y1 = M(iy + 1, py);
            float a0 = Mathf.Lerp(Hash(x0, y0, seed), Hash(x1, y0, seed), fx), b0 = Mathf.Lerp(Hash(x0, y1, seed), Hash(x1, y1, seed), fx);
            return Mathf.Lerp(a0, b0, fy);
        }

        /// <summary>One lens-shaped stroke along v: gaussian across, pointed ends; u wanders a little.</summary>
        static void Stroke(float[] buf, float u0, float v0, float halfU, float halfV, float gain, float wander, float phase, bool max)
        {
            int r = Mathf.CeilToInt(halfU * W * 3f) + 1, n = Mathf.CeilToInt(halfV * H);
            for (int j = -n; j <= n; j++)
            {
                float t = j / (float)Mathf.Max(1, n);
                float env = 1f - t * t;
                float w = halfU * W * Mathf.Max(0.25f, env);
                float cu = (u0 + wander * Mathf.Sin(phase + t * 2.2f)) * W;
                int y = Mathf.FloorToInt(v0 * H) + j;
                y %= H; if (y < 0) y += H;
                float amp = gain * env * Mathf.Sqrt(env);
                int c = Mathf.FloorToInt(cu);
                for (int i = -r; i <= r; i++)
                {
                    float d = (c + i + 0.5f - cu) / w;
                    float a = amp * Mathf.Exp(-d * d);
                    if (a < 0.002f) continue;
                    int x = (c + i) % W; if (x < 0) x += W;
                    int k = y * W + x;
                    if (max) buf[k] = Mathf.Max(buf[k], a); else buf[k] += a * (1f - Mathf.Min(buf[k], 1.5f) * 0.5f);
                }
            }
        }

        // ------------------------------------------------------------------ silk
        public static string MakeSilk()
        {
            var rnd = new System.Random(50505);
            float Rnd() => (float)rnd.NextDouble();
            var broad = new float[W * H];
            var fine = new float[W * H];
            var glint = new float[W * H];
            var hgt = new float[W * H];
            // --- broad satin folds (tile = 13.2 m across, 26 m along)
            for (int y = 0; y < H; y++)
            {
                float v = y / (float)H;
                for (int x = 0; x < W; x++)
                {
                    float u = x / (float)W;
                    float wu = u + 0.016f * (PNoise(u * 5f, v * 4f, 5, 4, 11) - 0.5f) + 0.006f * (PNoise(u * 13f, v * 9f, 13, 9, 12) - 0.5f);
                    float b = 0f;
                    b += 1.00f * (PNoise(wu * 8f, v * 2f, 8, 2, 21) - 0.5f);
                    b += 0.85f * (PNoise(wu * 17f + 0.3f, v * 3f, 17, 3, 22) - 0.5f);
                    b += 0.62f * (PNoise(wu * 37f, v * 4f, 37, 4, 23) - 0.5f);
                    b += 0.42f * (PNoise(wu * 79f, v * 5f, 79, 5, 24) - 0.5f);
                    b += 0.26f * (PNoise(wu * 171f, v * 6f, 171, 6, 25) - 0.5f);
                    broad[y * W + x] = b;
                    // ripple height: short waves across the flow, stretched, plus a fine chop
                    hgt[y * W + x] = 0.55f * PNoise(u * 22f, v * 30f, 22, 30, 31) + 0.35f * PNoise(u * 47f, v * 58f, 47, 58, 32)
                                   + 0.6f * PNoise(wu * 40f, v * 9f, 40, 9, 33) + 0.16f * PNoise(u * 110f, v * 120f, 110, 120, 34);
                }
            }
            // --- streaks: soft ribbons, fine lines, hairlines (u half width 1 = 13.2 m)
            for (int i = 0; i < 130; i++) Stroke(fine, Rnd(), Rnd(), Mathf.Lerp(0.0016f, 0.0046f, Rnd()), Mathf.Lerp(0.05f, 0.16f, Rnd()), Mathf.Lerp(0.18f, 0.5f, Rnd()), 0.004f, Rnd() * 6.28f, false);
            for (int i = 0; i < 520; i++) Stroke(fine, Rnd(), Rnd(), Mathf.Lerp(0.0005f, 0.0013f, Rnd() * Rnd()), Mathf.Lerp(0.03f, 0.12f, Rnd()), Mathf.Lerp(0.3f, 0.95f, Rnd()), 0.003f, Rnd() * 6.28f, false);
            for (int i = 0; i < 700; i++) Stroke(fine, Rnd(), Rnd(), 0.00042f, Mathf.Lerp(0.015f, 0.07f, Rnd()), Mathf.Lerp(0.15f, 0.5f, Rnd()), 0.002f, Rnd() * 6.28f, false);
            // --- slivers of light: a bright lens, a longer faint spike, every third one a small kink ("lightning")
            for (int i = 0; i < 250; i++)
            {
                float u = Rnd(), v = Rnd(), big = Mathf.Pow(Rnd(), 2.2f);
                float hv = Mathf.Lerp(0.007f, 0.021f, big), hu = Mathf.Lerp(0.0011f, 0.0030f, big), g = Mathf.Lerp(0.7f, 1.35f, big);
                Stroke(glint, u, v, hu, hv, g, 0f, 0f, true);
                Stroke(glint, u, v, hu * 0.36f, hv * 2.7f, g * 0.62f, 0.0008f, Rnd() * 6.28f, true);
                if (Rnd() < 0.4f)
                {
                    float sg = Rnd() < 0.5f ? -1f : 1f;
                    Stroke(glint, u + sg * hu * 1.5f, v + hv * 0.62f, hu * 0.75f, hv * 0.75f, g * 0.9f, 0f, 0f, true);
                    Stroke(glint, u - sg * hu * 1.2f, v - hv * 0.66f, hu * 0.6f, hv * 0.65f, g * 0.75f, 0f, 0f, true);
                }
                // soft halo
                Stroke(glint, u, v, hu * 2.6f, hv * 1.3f, g * 0.22f, 0f, 0f, true);
            }
            // --- silk value: rank-equalised mix (uniform histogram: the ramp's y axis is a quantile)
            var mix = new float[W * H];
            for (int k = 0; k < mix.Length; k++) mix[k] = broad[k] * 1.0f + fine[k] * 1.05f + glint[k] * 2.4f;
            var sorted = (float[])mix.Clone();
            Array.Sort(sorted);
            int n1 = sorted.Length;
            var px = new Color32[W * H];
            for (int y = 0; y < H; y++)
                for (int x = 0; x < W; x++)
                {
                    int k = y * W + x;
                    int idx = Array.BinarySearch(sorted, mix[k]);
                    if (idx < 0) idx = ~idx;
                    float t = idx / (float)n1;
                    // ripple normal (u slope, v slope), periodic differences
                    float hx = hgt[y * W + (x + 1) % W] - hgt[y * W + (x + W - 1) % W];
                    float hy = hgt[((y + 1) % H) * W + x] - hgt[((y + H - 1) % H) * W + x];
                    px[k] = new Color32((byte)Mathf.RoundToInt(Mathf.Clamp01(t) * 255f), (byte)Mathf.RoundToInt(Mathf.Clamp01(glint[k] / 1.35f) * 255f),
                        (byte)Mathf.RoundToInt(Mathf.Clamp01(0.5f - hx * 4.2f) * 255f), (byte)Mathf.RoundToInt(Mathf.Clamp01(0.5f - hy * 4.2f) * 255f));
                }
            var tex = new Texture2D(W, H, TextureFormat.RGBA32, false, true);
            tex.SetPixels32(px);
            File.WriteAllBytes(SilkPath, tex.EncodeToPNG());
            UnityEngine.Object.DestroyImmediate(tex);
            AssetDatabase.ImportAsset(SilkPath, ImportAssetOptions.ForceSynchronousImport);
            ImportSilk();
            return "silk " + new FileInfo(SilkPath).Length / 1024 + " KB";
        }

        static void ImportSilk()
        {
            var imp = AssetImporter.GetAtPath(SilkPath) as TextureImporter;
            if (imp == null) return;
            imp.textureType = TextureImporterType.Default;
            imp.sRGBTexture = false;
            imp.alphaSource = TextureImporterAlphaSource.FromInput;
            imp.alphaIsTransparency = false;
            imp.mipmapEnabled = true;
            imp.mipmapFilter = TextureImporterMipFilter.KaiserFilter;
            imp.wrapMode = TextureWrapMode.Repeat;
            imp.filterMode = FilterMode.Trilinear;
            imp.anisoLevel = 8;
            imp.maxTextureSize = 2048;
            imp.textureCompression = TextureImporterCompression.CompressedHQ;
            imp.SaveAndReimport();
        }

        // ------------------------------------------------------------------ ramp
        const float GradeSat = 1.4184f, GradeCon = 1.2035f, GradeExp = 0.85045f;

        static float ToLin(float c) => c <= 0.04045f ? c / 12.92f : Mathf.Pow((c + 0.055f) / 1.055f, 2.4f);

        /// <summary>Scene-linear radiance that the scene grade (exposure, LogC contrast, saturation; no tone mapping) shows as this sRGB colour.</summary>
        public static Vector3 SceneFromDisplay(Vector3 srgb01)
        {
            var y = new Vector3(ToLin(srgb01.x), ToLin(srgb01.y), ToLin(srgb01.z));
            float l = y.x * 0.2126729f + y.y * 0.7151522f + y.z * 0.0721750f;
            Vector3 x = new Vector3(l + (y.x - l) / GradeSat, l + (y.y - l) / GradeSat, l + (y.z - l) / GradeSat);
            float ik = 1f / GradeCon;
            float cst = Mathf.Pow(10f, (0.4135884f - 0.386036f) * (1f - ik) / 0.244161f);
            float Inv(float v) { v = Mathf.Max(v, 0f); return Mathf.Max(0f, (Mathf.Pow(5.555556f * v + 0.047996f, ik) * cst - 0.047996f) / 5.555556f) / GradeExp; }
            return new Vector3(Inv(x.x), Inv(x.y), Inv(x.z));
        }

        const int RW = 96, RZ = 16;
        /// <summary>Display colours of the last ramp made (columns q, rows), for WaterSheenFactory.</summary>
        public static Vector3[,] LastDisplayRamp;

        /// <summary>Colour statistics of the approved water: for every q column the colours at 16 quantiles of brightness, two depth zones.</summary>
        public static string MakeRamp(string approvedPath)
        {
            var t = new Texture2D(2, 2);
            t.LoadImage(File.ReadAllBytes(approvedPath));
            Color32[] A = t.GetPixels32();
            int aw = t.width;
            UnityEngine.Object.DestroyImmediate(t);
            if (aw != 864) return "ERROR approved size";
            var R = Quaternion.Euler(12.78f, -2.80f, 0f);
            var C = new Vector3(-0.06f, 3.40f, 7.48f);
            const float F = 1278.2f;
            var circ = new List<Vector3> { new Vector3(474, 729, 62), new Vector3(549, 661, 48), new Vector3(482, 612, 40), new Vector3(431, 576, 32),
                new Vector3(465, 545, 24), new Vector3(496, 533, 18), new Vector3(518, 523, 14), new Vector3(533, 517, 14) };
            foreach (string nm in new[] { "StartBig", "StartSmall" })
            {
                var arr = (Vector3[])typeof(BubbleField).GetField(nm, System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static).GetValue(null);
                foreach (Vector3 b in arr) circ.Add(new Vector3(b.x, b.y, b.z * 0.5f + 6f));
            }
            bool Masked(int x, int y)
            {
                foreach (Vector3 c in circ) if ((x - c.x) * (x - c.x) + (y - c.y) * (y - c.y) < c.z * c.z) return true;
                if (y > 755 && y < 1205 && x > 222 && x < 620) return true;
                if (y >= 1060 && y < 1340 && Mathf.Abs(x - 420) < 330) return true;
                if (y > 985 && y < 1125 && x < 150) return true;
                return false;
            }
            // wide q windows so every column has plenty of pixels; both banks folded together (|q|) outside the core, which gives
            // symmetric, clean bands (the mirror images differ only by the light of the moment)
            var outp = new Vector3[RW, RZ * 2];
            int[] got = new int[2];
            for (int z = 0; z < 2; z++)
            {
                float sa = z == 0 ? 14.4f : 19f, sb = z == 0 ? 20f : 60f;
                var bins = new List<Color32>[RW];
                for (int i = 0; i < RW; i++) bins[i] = new List<Color32>();
                for (int y = 505; y < 1180; y++)
                    for (int x = 1; x < 863; x++)
                    {
                        if (Masked(x, y)) continue;
                        Vector3 d = R * new Vector3((x + 0.5f - 432f) / F, (768f - y - 0.5f) / F, 1f);
                        if (d.y > -1e-4f) continue;
                        Vector3 p = C + d * (-C.y / d.y);
                        if (p.z < sa || p.z >= sb) continue;
                        float q = RiverLayout05.Q(p.z, p.x);
                        // the far bank strip (|q| > 2.35) of the traced layout already holds foam: leave it out, the last clean column is kept
                        if (Mathf.Abs(q) > 2.5f) continue;
                        int qi = Mathf.FloorToInt((q + 3f) / 6f * RW);
                        if (qi < 0 || qi >= RW) continue;
                        bins[qi].Add(A[(1535 - y) * 864 + x]);
                    }
                for (int i = 0; i < RW; i++)
                {
                    float q = -3f + (i + 0.5f) * 6f / RW;
                    var l = new List<Color32>();
                    for (int rad = 1; rad <= 14 && l.Count < 900; rad++)
                    {
                        l.Clear();
                        for (int k = -rad; k <= rad; k++)
                        {
                            int a = i + k, m = RW - 1 - i + k;
                            if (a >= 0 && a < RW) l.AddRange(bins[a]);
                            if (Mathf.Abs(q) > 0.7f && m >= 0 && m < RW) l.AddRange(bins[m]);
                        }
                    }
                    if (l.Count < 60) { for (int r = 0; r < RZ; r++) outp[i, z * RZ + r] = new Vector3(-1, -1, -1); continue; }
                    got[z]++;
                    l.Sort((m, k) => (m.r * 0.3f + m.g * 0.59f + m.b * 0.11f).CompareTo(k.r * 0.3f + k.g * 0.59f + k.b * 0.11f));
                    for (int r = 0; r < RZ; r++)
                    {
                        float yv = (r + 0.5f) / RZ, tq = 1f - (1f - yv) * (1f - yv);             // quantile of this row
                        float half = Mathf.Max(0.012f, 0.06f * (1f - tq));
                        int a = Mathf.Clamp((int)((tq - half) * l.Count), 0, l.Count - 1), b = Mathf.Clamp((int)((tq + half) * l.Count), a + 1, l.Count);
                        float rr = 0, gg = 0, bb = 0;
                        for (int k = a; k < b; k++) { rr += l[k].r; gg += l[k].g; bb += l[k].b; }
                        int nn = Mathf.Max(1, b - a);
                        outp[i, z * RZ + r] = new Vector3(rr / nn, gg / nn, bb / nn) / 255f;
                    }
                }
            }
            // fill missing columns (other zone, then neighbours), smooth across q
            for (int z = 0; z < 2; z++)
                for (int i = 0; i < RW; i++)
                    if (outp[i, z * RZ].x < 0f)
                    {
                        if (outp[i, (1 - z) * RZ].x >= 0f) { for (int r = 0; r < RZ; r++) outp[i, z * RZ + r] = outp[i, (1 - z) * RZ + r]; continue; }
                        for (int k = 1; k < RW; k++)
                        {
                            int c = i < RW / 2 ? i + k : i - k;
                            if (c < 0 || c >= RW || outp[c, z * RZ].x < 0f) continue;
                            for (int r = 0; r < RZ; r++) outp[i, z * RZ + r] = outp[c, z * RZ + r];
                            break;
                        }
                    }
            var sm = new Vector3[RW, RZ * 2];
            for (int r = 0; r < RZ * 2; r++)
                for (int i = 0; i < RW; i++)
                {
                    Vector3 acc = Vector3.zero; float ws = 0f;
                    for (int k = -3; k <= 3; k++) { float w = Mathf.Exp(-k * k / 4.5f); acc += w * outp[Mathf.Clamp(i + k, 0, RW - 1), r]; ws += w; }
                    sm[i, r] = acc / ws;
                }
            LastDisplayRamp = sm;
            var tex = new Texture2D(RW, RZ * 2, TextureFormat.RGBAHalf, false, true) { name = "RiverRamp05", wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Bilinear };
            var px = new Color[RW * RZ * 2];
            for (int r = 0; r < RZ * 2; r++)
                for (int i = 0; i < RW; i++)
                {
                    Vector3 s = SceneFromDisplay(sm[i, r]);
                    px[r * RW + i] = new Color(s.x, s.y, s.z, 1f);
                }
            tex.SetPixels(px);
            tex.Apply(false, false);
            var old = AssetDatabase.LoadAssetAtPath<Texture2D>(RampPath);
            if (old == null) AssetDatabase.CreateAsset(tex, RampPath);
            else { EditorUtility.CopySerialized(tex, old); UnityEngine.Object.DestroyImmediate(tex); EditorUtility.SetDirty(old); }
            AssetDatabase.SaveAssets();
            var sbd = new System.Text.StringBuilder("ramp columns near " + got[0] + " far " + got[1] + " | far zone q 0 / 0.9 / 1.5 / 2.2, rows 2, 8, 13: ");
            foreach (float q in new[] { 0f, 0.9f, 1.5f, 2.2f })
                foreach (int r in new[] { 2, 8, 13 })
                {
                    Vector3 c = sm[Mathf.Clamp((int)((q + 3f) / 6f * RW), 0, RW - 1), RZ + r] * 255f;
                    sbd.Append("(" + (int)c.x + "," + (int)c.y + "," + (int)c.z + ") ");
                }
            return sbd.ToString();
        }
    }
}

using System.Collections.Generic;
using System.IO;
using UnityEditor;
using UnityEngine;

namespace Rainbow.Screen05.EditorTools
{
    /// <summary>
    /// Water look round 8 (2026-11-24): the broad SHEEN of the water, i.e. where its large soft reflections lie (low frequency only, ~17 px;
    /// the fine streaks, ripples and glints are procedural and flow with the current). Measured on the approved picture:
    ///  * RiverSheen05 (96 x 96): mean ramp row (0..1) by streamline coordinate q (x, -3..3) and log2 view distance (y, 3.5 m .. 158 m):
    ///    broad reflections belong to the view, so they stay with the camera distance while the ripples run through them.
    ///  * WakeSheen05 (96 x 96): the standing wake behind Benny in HIS frame, x = dl (-2.2 .. 2.2 m), y = back (0.2 .. 3.8 m):
    ///    R = ramp row, G = pink amount (the two pink sweeps), B = 1 where it was measured.
    /// Made by AgentScripts/screen05_make_water_sheen.cs after MakeRamp.
    /// </summary>
    public static class WaterSheenFactory
    {
        public const string SheenPath = "Assets/Rainbow/Water/Generated/RiverSheen05.asset";
        public const string WakePath = "Assets/Rainbow/Water/Generated/WakeSheen05.asset";
        const int N = 96;
        static readonly Quaternion R = Quaternion.Euler(12.78f, -2.80f, 0f);
        static readonly Vector3 C = new Vector3(-0.06f, 3.40f, 7.48f);
        const float F = 1278.2f;

        static float Luma(Vector3 c) => 0.299f * c.x + 0.587f * c.y + 0.114f * c.z;

        /// <summary>Ramp row 0..1 whose display luma at (q, zone) is nearest to luma (rows ascend in brightness).</summary>
        static float RowFor(Vector3[,] disp, float q, int zone, float luma)
        {
            int rw = disp.GetLength(0), rz = 16;
            int i = Mathf.Clamp((int)((q + 3f) / 6f * rw), 0, rw - 1);
            float prev = Luma(disp[i, zone * rz]);
            if (luma <= prev) return 0.5f / rz;
            for (int r = 1; r < rz; r++)
            {
                float l = Luma(disp[i, zone * rz + r]);
                if (luma <= l) return (r - 0.5f + Mathf.Clamp01((luma - prev) / Mathf.Max(1e-4f, l - prev))) / rz;
                prev = Mathf.Max(prev, l);
            }
            return (rz - 0.5f) / rz;
        }

        public static string Make(string approvedPath, Vector3[,] disp)
        {
            var t = new Texture2D(2, 2);
            t.LoadImage(File.ReadAllBytes(approvedPath));
            Color32[] A = t.GetPixels32();
            Object.DestroyImmediate(t);
            var circ = new List<Vector3> { new Vector3(474, 729, 64), new Vector3(549, 661, 50), new Vector3(482, 612, 42), new Vector3(431, 576, 34),
                new Vector3(465, 545, 25), new Vector3(496, 533, 19), new Vector3(518, 523, 15), new Vector3(533, 517, 15) };
            foreach (string nm in new[] { "StartBig", "StartSmall" })
            {
                var arr = (Vector3[])typeof(BubbleField).GetField(nm, System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static).GetValue(null);
                foreach (Vector3 b in arr) circ.Add(new Vector3(b.x, b.y, b.z * 0.5f + 5f));
            }
            bool Circ(int x, int y)
            {
                foreach (Vector3 c in circ) if ((x - c.x) * (x - c.x) + (y - c.y) * (y - c.y) < c.z * c.z) return true;
                return false;
            }
            // Benny: beanie + body + arms + pompom as ellipses
            bool Benny(int x, int y)
            {
                bool El(float cx, float cy, float rx, float ry) => (x - cx) * (x - cx) / (rx * rx) + (y - cy) * (y - cy) / (ry * ry) < 1f;
                return El(428, 838, 84, 80) || El(425, 975, 158, 115) || El(422, 1100, 158, 104) || El(252, 1043, 34, 38) || El(594, 1043, 34, 38);
            }

            // ---- river sheen
            var acc = new float[N * N]; var wgt = new float[N * N];
            for (int y = 503; y < 1330; y++)
                for (int x = 0; x < 864; x++)
                {
                    if (Circ(x, y) || Benny(x, y)) continue;
                    if (y > 1060 && Mathf.Abs(x - 420) < 190 + (y - 1060) * 0.55f) continue;     // splash and wake
                    if (y > 985 && y < 1125 && x < 152) continue;                                 // left foam clump
                    Vector3 d = R * new Vector3((x + 0.5f - 432f) / F, (768f - y - 0.5f) / F, 1f);
                    if (d.y > -1e-4f) continue;
                    Vector3 p = C + d * (-C.y / d.y);
                    if (p.z < 11f || p.z > 158f) continue;
                    float q = RiverLayout05.Q(p.z, p.x);
                    if (Mathf.Abs(q) > 2.45f) continue;
                    Color32 c = A[(1535 - y) * 864 + x];
                    float dist = (p - C).magnitude;
                    int zone = dist < 11.5f ? 0 : 1;
                    float row = RowFor(disp, q, zone, (0.299f * c.r + 0.587f * c.g + 0.114f * c.b) / 255f);
                    float u = (q + 3f) / 6f * N - 0.5f, v = Mathf.Log(dist / 3.5f, 2f) / 5.5f * N - 0.5f;
                    int iu = Mathf.RoundToInt(u), iv = Mathf.RoundToInt(v);
                    if (iu < 0 || iv < 0 || iu >= N || iv >= N) continue;
                    acc[iv * N + iu] += row; wgt[iv * N + iu] += 1f;
                }
            float[] sheen = Fill(acc, wgt, 1.0f, 0.333f);
            float mean = 0f; int cnt = 0;
            for (int i = 0; i < N * N; i++) if (wgt[i] > 0f) { mean += sheen[i]; cnt++; }
            mean /= Mathf.Max(1, cnt);
            var px = new Color[N * N];
            for (int i = 0; i < N * N; i++) px[i] = new Color(sheen[i], sheen[i], sheen[i], 1f);
            Save(px, SheenPath, "RiverSheen05");

            // ---- wake sheen (Benny's frame): only clean water pixels (no foam, splash, frame, bubbles)
            var ra = new float[N * N]; var rw = new float[N * N]; var ga = new float[N * N]; var gw = new float[N * N];
            for (int y = 1150; y < 1536; y++)
                for (int x = 0; x < 864; x++)
                {
                    if (Circ(x, y) || Benny(x, y)) continue;
                    Color32 c = A[(1535 - y) * 864 + x];
                    float mx = Mathf.Max(c.r, Mathf.Max(c.g, c.b)), mn = Mathf.Min(c.r, Mathf.Min(c.g, c.b));
                    if (c.b < 150 || c.r > c.b + 25) continue;                                    // frame copper, gold
                    bool white = mn > 170;
                    if (white && y < 1330) continue;                                              // foam / splash
                    if (mx - mn < 60 && y < 1420) continue;
                    Vector3 d = R * new Vector3((x + 0.5f - 432f) / F, (768f - y - 0.5f) / F, 1f);
                    Vector3 p = C + d * (-C.y / d.y);
                    float dl = p.x + 0.45f - 0.1f, back = 14f - p.z;
                    float u = (dl + 2.2f) / 4.4f * N - 0.5f, v = (back - 0.2f) / 3.6f * N - 0.5f;
                    int iu = Mathf.RoundToInt(u), iv = Mathf.RoundToInt(v);
                    if (iu < 0 || iv < 0 || iu >= N || iv >= N) continue;
                    // pink amount from the hue: cyan / blue water has r << g; pink has g << r
                    float pink = Mathf.Clamp01((c.r - c.g) / 110f);
                    float row = RowFor(disp, pink > 0.5f ? 1.5f : 0f, 0, (0.299f * c.r + 0.587f * c.g + 0.114f * c.b) / 255f);
                    ra[iv * N + iu] += row; rw[iv * N + iu] += 1f;
                    ga[iv * N + iu] += pink; gw[iv * N + iu] += 1f;
                }
            float[] wr = Fill(ra, rw, 0.7f, 0.3f), wg = Fill(ga, gw, 0.7f, 0f), wb = Fill(Mask(rw), One(), 1.2f, 0f);
            for (int i = 0; i < N * N; i++) px[i] = new Color(wr[i], wg[i], wb[i], 1f);
            Save(px, WakePath, "WakeSheen05");
            return "sheen mean row " + mean.ToString("0.000") + " cells " + cnt;
        }

        static float[] Mask(float[] w) { var o = new float[w.Length]; for (int i = 0; i < w.Length; i++) o[i] = w[i] > 0f ? 1f : 0f; return o; }
        static float[] One() { var o = new float[N * N]; for (int i = 0; i < o.Length; i++) o[i] = 1f; return o; }

        /// <summary>Normalised blur (sigma cells) with hole filling by ever wider blurs.</summary>
        static float[] Fill(float[] acc, float[] wgt, float sigma, float fallback)
        {
            var o = new float[N * N];
            var done = new bool[N * N];
            foreach (float s in new[] { sigma, 2f, 4f, 8f, 16f })
            {
                float[] a = Blur(acc, s), w = Blur(wgt, s);
                for (int i = 0; i < N * N; i++)
                    if (!done[i] && w[i] > 0.02f) { o[i] = a[i] / w[i]; done[i] = true; }
            }
            for (int i = 0; i < N * N; i++) if (!done[i]) o[i] = fallback;
            return Blur(o, 0.6f);
        }

        static float[] Blur(float[] a, float sigma)
        {
            int r = Mathf.CeilToInt(sigma * 2.6f);
            var k = new float[2 * r + 1];
            for (int i = -r; i <= r; i++) k[i + r] = Mathf.Exp(-0.5f * i * i / (sigma * sigma));
            float ks = 0f; foreach (float v in k) ks += v;
            var t = new float[N * N]; var o = new float[N * N];
            for (int y = 0; y < N; y++)
                for (int x = 0; x < N; x++)
                {
                    float s = 0f;
                    for (int i = -r; i <= r; i++) { int xx = Mathf.Clamp(x + i, 0, N - 1); s += k[i + r] * a[y * N + xx]; }
                    t[y * N + x] = s / ks;
                }
            for (int y = 0; y < N; y++)
                for (int x = 0; x < N; x++)
                {
                    float s = 0f;
                    for (int i = -r; i <= r; i++) { int yy = Mathf.Clamp(y + i, 0, N - 1); s += k[i + r] * t[yy * N + x]; }
                    o[y * N + x] = s / ks;
                }
            return o;
        }

        static void Save(Color[] px, string path, string name)
        {
            var tex = new Texture2D(N, N, TextureFormat.RGBA32, false, true) { name = name, wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Bilinear };
            tex.SetPixels(px);
            tex.Apply(false, false);
            var old = AssetDatabase.LoadAssetAtPath<Texture2D>(path);
            if (old == null) AssetDatabase.CreateAsset(tex, path);
            else { EditorUtility.CopySerialized(tex, old); Object.DestroyImmediate(tex); EditorUtility.SetDirty(old); }
            AssetDatabase.SaveAssets();
        }
    }
}

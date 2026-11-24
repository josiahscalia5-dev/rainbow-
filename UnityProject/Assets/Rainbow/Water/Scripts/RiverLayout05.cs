using System.Globalization;
using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// River round 4b (2026-11-24): the ONE layout table of the S-shaped river (replaces the hand-fitted smoothstep formulas that
    /// were mirrored in HLSL and C#). World x of six curves as a function of s, traced row by row on the approved image and
    /// unprojected with the gameplay camera (tools/diag/unproject-river.ps1):
    ///   0 WL left foam waterline, 1 LO / 2 LI outer / inner edge of the left pink band, 3 RI / 4 RO inner / outer edge of the
    ///   right pink band, 5 WR right foam waterline.  WL &lt; LO &lt; LI &lt; RI &lt; RO &lt; WR.
    /// Used by the foam banks (C#), the river shader (mesh UV2 / UV3 per row) and the glints (LUT texture). Far rows are fitted
    /// between the real drum walls (DrumLayout05.WallXAt).
    /// </summary>
    public static class RiverLayout05
    {
        public const int WL = 0, LO = 1, LI = 2, RI = 3, RO = 4, WR = 5;
        public const float S0 = RiverPath.TunnelStart, S1 = RiverPath.CourseLength, Step = 0.25f;

        const string Data_wl = ""
            + "-12:-5.4 17:-5.35 19.97:-5.00 20.40:-4.89 20.86:-4.84 21.36:-4.82 21.89:-4.77 22.45:-4.71 23.07:-4.63 23.74:-4.36 "
            + "24.47:-3.99 25.25:-3.64 26.11:-3.35 27.04:-3.23 28.04:-3.46 29.14:-3.87 30.36:-4.23 31.71:-4.94 33.23:-5.69 34.97:-6.17 "
            + "36.96:-6.60 39.26:-6.88 41.94:-7.09 45.10:-7.33 48.89:-7.60 53.50:-7.85 56.21:-7.84 59.26:-7.68 62.69:-7.83 66.59:-8.01 "
            + "71.09:-8.01 76.33:-7.91 82.52:-6.87 89.90:-5.87 98.83:-5.02 109.87:-4.44 123.90:-3.52 142.39:-1.17 160:0";
        const string Data_lo = ""
            + "-12:-5.1 17:-5.0 19.11:-4.85 19.48:-4.83 19.88:-4.79 20.29:-4.75 20.74:-4.59 21.22:-4.55 21.73:-4.40 22.28:-4.17 "
            + "22.87:-3.85 23.50:-3.70 24.19:-3.45 24.93:-3.29 25.73:-3.10 26.60:-2.98 27.54:-2.94 28.58:-3.00 29.71:-3.30 30.96:-3.72 "
            + "32.34:-4.51 33.90:-5.20 35.68:-5.72 37.72:-6.15 40.08:-6.43 42.83:-6.65 46.07:-6.91 49.96:-6.92 54.72:-6.35 60.65:-5.72 "
            + "68.24:-4.63 78.25:-3.74 92.00:-4.98 112.50:-2.77 145.84:0.81 160:1.2";
        const string Data_li = ""
            + "-12:-3.5 14.2:-3.4 15.42:-3.35 15.78:-3.38 16.18:-3.38 16.62:-3.39 17.09:-3.44 17.35:-3.37 17.62:-3.31 17.90:-3.28 "
            + "18.20:-3.28 18.51:-3.27 18.84:-3.28 19.19:-3.25 19.56:-3.25 19.95:-3.19 20.37:-3.15 20.82:-3.08 21.29:-2.99 21.81:-2.76 "
            + "22.35:-2.64 22.94:-2.50 23.57:-2.35 24.26:-2.10 25.00:-1.80 25.80:-1.70 26.66:-1.58 27.61:-1.49 28.65:-1.50 29.79:-1.56 "
            + "31.05:-1.81 32.45:-2.19 34.02:-2.70 35.79:-3.45 37.82:-4.07 40.17:-4.53 42.92:-4.74 46.17:-4.89 50.06:-4.77 54.82:-4.37 "
            + "60.74:-3.82 68.32:-2.94 78.32:-2.21 92.16:-1.72 112.63:0.05 145.92:2.61 160:3";
        const string Data_ri = ""
            + "-12:2.1 12.9:1.95 13.96:1.74 14.19:1.72 14.45:1.68 14.71:1.58 15.00:1.48 15.30:1.29 15.64:1.16 16.00:1.04 16.39:0.92 "
            + "16.82:0.79 17.29:0.67 17.54:0.65 17.81:0.61 18.09:0.59 18.39:0.57 18.70:0.57 19.03:0.59 19.38:0.64 19.75:0.72 "
            + "20.15:0.81 20.57:0.96 21.02:1.12 21.51:1.40 22.03:1.77 22.59:2.12 23.18:2.49 23.82:2.84 24.51:3.14 25.25:3.41 "
            + "26.06:3.65 26.93:3.83 27.88:3.96 28.92:4.03 30.07:4.11 31.34:4.08 32.75:3.98 34.34:3.84 36.14:3.62 38.18:3.31 "
            + "40.52:2.69 43.25:1.94 46.46:1.12 50.31:0.34 55.03:-0.06 60.94:0.14 68.52:1.19 78.58:2.97 92.45:4.27 112.89:5.29 "
            + "146.11:6.32 160:6.4";
        const string Data_ro = ""
            + "-12:3.7 12.5:3.5 14.4:3.05 15.70:2.51 16.06:2.39 16.46:2.24 16.88:1.98 17.34:1.75 17.60:1.69 17.86:1.62 18.14:1.59 "
            + "18.44:1.60 18.75:1.63 19.09:1.72 19.44:1.82 19.82:2.01 20.22:2.17 20.64:2.42 21.10:2.70 21.59:3.06 22.11:3.41 "
            + "22.66:3.56 23.25:3.82 23.88:4.05 24.57:4.27 25.30:4.43 26.10:4.58 26.98:4.83 27.93:5.09 28.98:5.31 30.14:5.47 "
            + "31.41:5.47 32.83:5.48 34.42:5.44 36.22:5.36 38.26:5.02 40.61:4.48 43.34:3.77 46.54:2.81 50.39:1.90 55.09:1.22 "
            + "61.00:1.42 68.61:2.88 78.66:4.56 92.53:5.96 112.97:6.98 146.17:7.59 160:7.8";
        const string Data_wr = ""
            + "-12:4.6 12.5:4.4 14.2:3.75 15.3:2.85 16.05:2.43 16.24:2.29 16.44:2.16 16.66:2.03 16.88:1.93 17.11:1.85 17.36:1.78 "
            + "17.62:1.74 17.89:1.70 18.18:1.68 18.48:1.71 18.81:1.79 19.16:1.91 19.53:2.09 19.92:2.33 20.33:2.55 20.78:2.79 "
            + "21.25:3.02 21.76:3.32 22.29:3.53 22.87:3.83 23.50:4.15 24.17:4.41 24.89:4.64 25.67:4.84 26.52:5.03 27.45:5.20 "
            + "28.47:5.41 29.60:5.63 30.85:5.77 32.24:5.90 33.79:5.86 35.55:5.81 37.55:5.53 39.84:5.07 42.50:4.41 45.63:3.54 "
            + "47.39:2.50 49.36:2.04 53.98:1.95 59.73:2.02 63.20:2.71 67.17:3.68 71.71:4.60 76.97:5.35 90.50:6.45 110.47:7.99 "
            + "142.95:10.29 160:10.4";

        static float[][] table;
        static int count;

        static void Ensure()
        {
            if (table != null) return;
            string[] src = { Data_wl, Data_lo, Data_li, Data_ri, Data_ro, Data_wr };
            count = Mathf.RoundToInt((S1 - S0) / Step) + 1;
            var t = new float[6][];
            for (int c = 0; c < 6; c++)
            {
                string[] tok = src[c].Split(new[] { ' ' }, System.StringSplitOptions.RemoveEmptyEntries);
                var xs = new float[tok.Length];
                var ys = new float[tok.Length];
                for (int i = 0; i < tok.Length; i++)
                {
                    string[] p = tok[i].Split(':');
                    xs[i] = float.Parse(p[0], CultureInfo.InvariantCulture);
                    ys[i] = float.Parse(p[1], CultureInfo.InvariantCulture);
                }
                float[] m = Slopes(xs, ys);
                var raw = new float[count];
                for (int i = 0; i < count; i++)
                {
                    float si = S0 + i * Step;
                    raw[i] = Hermite(xs, ys, m, si);
                    if (si > 136f) raw[i] = Mathf.Lerp(raw[i], FarX(c, si), SS(136f, 168f, si));
                }
                // light smoothing of the pixel trace (~ +-2 px at every distance)
                t[c] = new float[count];
                for (int i = 0; i < count; i++)
                {
                    float sig = Mathf.Clamp(0.016f * (S0 + i * Step - 7.5f), 0.1f, 1.4f) / Step;
                    int r = Mathf.Max(1, Mathf.CeilToInt(sig * 2.5f));
                    float sum = 0f, ws = 0f;
                    for (int k = -r; k <= r; k++)
                    {
                        float w = Mathf.Exp(-0.5f * k * k / (sig * sig));
                        sum += w * raw[Mathf.Clamp(i + k, 0, count - 1)];
                        ws += w;
                    }
                    t[c][i] = sum / ws;
                }
            }
            for (int i = 0; i < count; i++)
            {
                float s = S0 + i * Step;
                for (int c = 1; c < 6; c++) t[c][i] = Mathf.Max(t[c][i], t[c - 1][i] + (c == RI ? 0.8f : 0.12f));
                // between the real drum walls (linear squeeze keeps the order and the proportions)
                float l0 = t[WL][i], r0 = t[WR][i];
                float l1 = Mathf.Max(l0, DrumLayout05.WallXAt(s, -1) + 0.15f), r1 = Mathf.Min(r0, DrumLayout05.WallXAt(s, 1) - 0.15f);
                if (l1 > l0 || r1 < r0)
                    for (int c = 0; c < 6; c++) t[c][i] = l1 + (t[c][i] - l0) / (r0 - l0) * (r1 - l1);
            }
            table = t;
        }

        /// <summary>Layout beyond the traced picture (master direction 2026-11-24: the playable course is ~450 m long): the same kind of S-shaped
        /// river (cyan core between two pink bands, foam rims at the drum wall), winding round the tunnel axis and its bends.</summary>
        static float FarX(int c, float s)
        {
            const float tau = 2f * Mathf.PI;
            float mid = RiverPath.Bend(s) + 1.5f * SS(120f, 150f, s) * (1f - SS(185f, 235f, s))
                      + 1.15f * (1f - 0.35f * SS(300f, 360f, s)) * Mathf.Sin(tau * (s - 150f) / 47f + 0.6f) + 0.3f * Mathf.Sin(tau * s / 29f + 2f);
            float half = 3.75f + 0.35f * Mathf.Sin(tau * s / 83f + 1f);
            float bl = 1.4f + 0.25f * Mathf.Sin(s * 0.11f), br = 1.4f + 0.25f * Mathf.Sin(s * 0.093f + 2f);
            float el = 0.34f + 0.1f * Mathf.Sin(s * 0.17f + 1f), er = 0.34f + 0.1f * Mathf.Sin(s * 0.15f + 4f);
            switch (c)
            {
                case WL: return mid - half;
                case LO: return mid - half + el;
                case LI: return mid - half + el + bl;
                case RI: return mid + half - er - br;
                case RO: return mid + half - er;
                default: return mid + half;
            }
        }

        static float[] Slopes(float[] x, float[] y)      // Fritsch-Carlson monotone cubic
        {
            int n = x.Length;
            var d = new float[n - 1];
            var m = new float[n];
            for (int i = 0; i < n - 1; i++) d[i] = (y[i + 1] - y[i]) / Mathf.Max(x[i + 1] - x[i], 1e-4f);
            m[0] = d[0]; m[n - 1] = d[n - 2];
            for (int i = 1; i < n - 1; i++)
            {
                if (d[i - 1] * d[i] <= 0f) { m[i] = 0f; continue; }
                float h0 = x[i] - x[i - 1], h1 = x[i + 1] - x[i];
                float w1 = 2f * h1 + h0, w2 = h1 + 2f * h0;
                m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
            }
            return m;
        }

        static float Hermite(float[] x, float[] y, float[] m, float s)
        {
            int n = x.Length;
            if (s <= x[0]) return y[0];
            if (s >= x[n - 1]) return y[n - 1];
            int lo = 0, hi = n - 1;
            while (hi - lo > 1) { int mid = (lo + hi) / 2; if (x[mid] <= s) lo = mid; else hi = mid; }
            float h = x[hi] - x[lo], t = (s - x[lo]) / h, t2 = t * t, t3 = t2 * t;
            return (2f * t3 - 3f * t2 + 1f) * y[lo] + (t3 - 2f * t2 + t) * h * m[lo]
                 + (-2f * t3 + 3f * t2) * y[hi] + (t3 - t2) * h * m[hi];
        }

        /// <summary>World x of one curve (WL .. WR) at s.</summary>
        public static float X(int curve, float s)
        {
            Ensure();
            float f = Mathf.Clamp((s - S0) / Step, 0f, count - 1.001f);
            int i = (int)f;
            return Mathf.Lerp(table[curve][i], table[curve][i + 1], f - i);
        }

        /// <summary>World x of the middle of the cyan core.</summary>
        public static float CoreX(float s) => 0.5f * (X(LI, s) + X(RI, s));

        /// <summary>Streamline coordinate: -3 WL, -2 LO, -1 LI, +1 RI, +2 RO, +3 WR.</summary>
        public static float Q(float s, float x)
        {
            float wl = X(WL, s), lo = X(LO, s), li = X(LI, s), ri = X(RI, s), ro = X(RO, s), wr = X(WR, s);
            if (x < lo) return -2f - (lo - x) / (lo - wl);
            if (x < li) return -1f - (li - x) / (li - lo);
            if (x < ri) return -1f + 2f * (x - li) / (ri - li);
            if (x < ro) return 1f + (x - ri) / (ro - ri);
            return 2f + (x - ro) / (wr - ro);
        }

        // ---- the foam rope in front of each waterline (width m, crest m, puff size scale) ----
        static float SS(float a, float b, float x)
        {
            float t = Mathf.Clamp01((x - a) / (b - a));
            return t * t * (3f - 2f * t);
        }

        public static Vector3 Rope(float s, int side)
        {
            Vector3 near = RopeNear(s, side);
            if (s <= 118f) return near;
            // beyond the traced picture the foam fills the gap between the waterline and the drum wall (no dry floor strip)
            float gap = side < 0 ? X(WL, s) - DrumLayout05.WallXAt(s, -1) : DrumLayout05.WallXAt(s, 1) - X(WR, s);
            var far = new Vector3(Mathf.Clamp(gap + 0.25f, 0.6f, 2.6f), 0.42f + 0.06f * Mathf.Clamp01(gap), 0.92f);
            return Vector3.Lerp(near, far, SS(118f, 136f, s));
        }

        static Vector3 RopeNear(float s, int side)
        {
            // shape round 6 (2026-11-24, user guide #5: a NARROW, irregular rim of mixed puffs): the left bar at s 24-28 (approved
            // y 690-740, x 60-290) runs from the waterline right up to the wall (was a dark floor strip behind a 1.75 m lobe); the
            // left rim lower at s 17-23 (approved top edge (90,725)-(0,785)); beyond s ~30 both ropes lower, narrower and finer
            // (approved: ~20-30 px tall rims with the wall straight behind, Unity's were ~2x as tall with 20+ px puffs)
            if (side < 0)
            {
                float lobe = SS(23.5f, 25.5f, s) * (1f - SS(29.5f, 32f, s));
                float bar = SS(23.8f, 24.8f, s) * (1f - SS(27.6f, 29.2f, s));
                float low = SS(16f, 18f, s) * (1f - SS(22.5f, 24.5f, s));
                float far = SS(30f, 40f, s);
                float k = SS(18f, 20f, s) * (1f - SS(28f, 31f, s));   // = FoamBank.OuterAt: rope ends at x -6.05 here
                float wLim = Mathf.Lerp(99f, Mathf.Max(0.3f, X(WL, s) + 6.05f), k);
                return new Vector3(Mathf.Min((1.0f + 0.75f * lobe + 2.2f * bar) * (1f - 0.2f * low), wLim),
                                   (0.5f + 0.08f * SS(40f, 60f, s)) * (1f - 0.24f * low) * (1f - 0.22f * far) * (1f - 0.5f * bar),
                                   1.3f - 0.4f * SS(23.5f, 25.5f, s) - 0.05f * SS(30f, 42f, s));   // finer puffs from the bay on
            }
            float bank = SS(44f, 50f, s) * (1f - SS(74f, 84f, s));
            float near = 1f - SS(19f, 23f, s);
            float mid = SS(25f, 30f, s) * (1f - SS(66f, 76f, s));
            return new Vector3((0.85f - 0.38f * near + 0.75f * bank) * (1f - 0.3f * mid),
                               (0.45f - 0.1f * near + 0.12f * bank) * (1f - 0.25f * mid),
                               (0.95f - 0.12f * near) * (1f - 0.22f * mid));
        }

        /// <summary>LUT for shaders: s (S0 .. S1) along u, row 0 = (WL, LO, LI, RI), row 1 = (RO, WR, 0, 0).</summary>
        public static Texture2D BuildLut(int width = 4096)
        {
            var tex = new Texture2D(width, 2, TextureFormat.RGBAHalf, false, true)
            {
                name = "RiverLut05", wrapMode = TextureWrapMode.Clamp, filterMode = FilterMode.Bilinear,
            };
            var px = new Color[width * 2];
            for (int i = 0; i < width; i++)
            {
                float s = Mathf.Lerp(S0, S1, (i + 0.5f) / width);
                px[i] = new Color(X(WL, s), X(LO, s), X(LI, s), X(RI, s));
                px[width + i] = new Color(X(RO, s), X(WR, s), 0f, 0f);
            }
            tex.SetPixels(px);
            tex.Apply(false, false);
            return tex;
        }
    }
}
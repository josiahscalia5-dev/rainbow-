using UnityEngine;

namespace Rainbow.Level2
{
    /// <summary>
    /// LEVEL 2 "Swim Up The Rainbow" - the real 3D course (brand new, independent of the older screens).
    /// u = distance along the slide in metres. The centre line is integrated from a heading and a slope profile (natural cubic
    /// splines = smooth curvature), so the camera and Benny never meet a kink. The first 62 m are fitted to the user's Level 2
    /// picture (Benny at u = 0, crest with the splash at the upper right); then the second climb through the golden washer door,
    /// the summit, the big drop and the right-hand spiral into Level 3's whirlpool.
    /// Local coordinates everywhere: (u, x, h) = along, to the rider's right, above the water; World() turns them into 3D.
    /// </summary>
    public static class L2Path
    {
        public struct Frame
        {
            public Vector3 pos, fwd, right, up;
            /// <summary>degrees: slope (+ = uphill), heading (+ = right), bank (+ = leaning into a right turn)</summary>
            public float slope, heading, bank;
            /// <summary>horizontal curvature (rad per metre, + = right turn)</summary>
            public float kappa;
        }

        public const float UMin = -36f, UMax = 424f, Step = 0.25f;
        public const float StartU = 0f, Crest1U = 64f, DoorU = 156f, SummitU = 163f, PoolU = 306f, FinishU = 396f;
        /// <summary>Half width of the rainbow water (m).</summary>
        public const float HalfWidth = 3.6f;
        /// <summary>How far Benny's centre may go to the side (m).</summary>
        public const float RideHalf = 2.75f;
        /// <summary>Height of the water at its edges above the middle (the slide is a soft trough).</summary>
        public const float EdgeRise = 0.62f;
        public const float Gravity = 9.81f;

        static readonly float[] KU = { -36, -20, -8, 0, 6, 13, 20, 28, 36, 44, 52, 60, 68, 78, 90, 104, 118, 132, 146, 156, 164, 172, 184, 200, 218, 236, 254, 272, 292, 312, 332, 352, 378, 404, 424 };
        // heading (deg, + = right)
        static readonly float[] KH = { -7, -7, -6, -5, -3, 1, 6, 13, 20, 25, 23, 17, 10, 4, 3, 9, 18, 22, 15, 8, 4, 0, -10, -24, -32, -28, -10, 22, 70, 120, 172, 228, 308, 398, 474 };
        // slope (deg, + = uphill)
        static readonly float[] KS = { 0, 0, 2, 4.5f, 6.5f, 9, 11.5f, 15.5f, 19.5f, 22, 21, 14, 7.5f, 6, 9.5f, 17, 24, 25.5f, 18, 8, -2, -9, -18, -24, -25, -21, -16.5f, -12, -8, -4.5f, -2.2f, -1.4f, -1.2f, -1.2f, -1.2f };

        static float[] m2H, m2S;
        static Frame[] nodes;
        static int count;

        public static float Smooth(float a, float b, float x)
        {
            float t = Mathf.Clamp01((x - a) / (b - a));
            return t * t * (3f - 2f * t);
        }

        // ---- natural cubic spline ----------------------------------------------------------------------------------
        static float[] SplineM(float[] x, float[] y)
        {
            int n = x.Length;
            var a = new float[n]; var b = new float[n]; var c = new float[n]; var d = new float[n]; var m = new float[n];
            b[0] = b[n - 1] = 1f;
            for (int i = 1; i < n - 1; i++)
            {
                float h0 = x[i] - x[i - 1], h1 = x[i + 1] - x[i];
                a[i] = h0; b[i] = 2f * (h0 + h1); c[i] = h1;
                d[i] = 6f * ((y[i + 1] - y[i]) / h1 - (y[i] - y[i - 1]) / h0);
            }
            for (int i = 1; i < n; i++)
            {
                float w = a[i] / b[i - 1];
                b[i] -= w * c[i - 1];
                d[i] -= w * d[i - 1];
            }
            m[n - 1] = d[n - 1] / b[n - 1];
            for (int i = n - 2; i >= 0; i--) m[i] = (d[i] - c[i] * m[i + 1]) / b[i];
            return m;
        }

        static float SplineEval(float[] x, float[] y, float[] m, float v)
        {
            int n = x.Length;
            v = Mathf.Clamp(v, x[0], x[n - 1]);
            int i = 0;
            while (i < n - 2 && v > x[i + 1]) i++;
            float h = x[i + 1] - x[i], A = (x[i + 1] - v) / h, B = (v - x[i]) / h;
            return A * y[i] + B * y[i + 1] + ((A * A * A - A) * m[i] + (B * B * B - B) * m[i + 1]) * h * h / 6f;
        }

        /// <summary>Nominal riding speed (m/s) at u: the washing-machine current gathers, the summit floats, the drop flies.</summary>
        public static float NominalSpeed(float u)
        {
            float v = Mathf.Lerp(5.2f, 8.2f, Smooth(0f, 18f, u));
            v = Mathf.Lerp(v, 10.2f, Smooth(18f, 60f, u));
            v = Mathf.Lerp(v, 11.2f, Smooth(70f, 104f, u));
            v = Mathf.Lerp(v, 12.2f, Smooth(110f, 140f, u));
            v = Mathf.Lerp(v, 9.6f, Smooth(146f, 164f, u));
            v = Mathf.Lerp(v, 18.2f, Smooth(168f, 232f, u));
            v = Mathf.Lerp(v, 15.4f, Smooth(250f, 300f, u));
            v = Mathf.Lerp(v, 12.2f, Smooth(316f, 380f, u));
            return v;
        }

        static void Ensure()
        {
            if (nodes != null) return;
            m2H = SplineM(KU, KH);
            m2S = SplineM(KU, KS);
            count = Mathf.RoundToInt((UMax - UMin) / Step) + 1;
            var nd = new Frame[count];
            int i0 = Mathf.RoundToInt((0f - UMin) / Step);
            for (int i = 0; i < count; i++)
            {
                float u = UMin + i * Step;
                nd[i].heading = SplineEval(KU, KH, m2H, u);
                nd[i].slope = SplineEval(KU, KS, m2S, u);
            }
            // positions: midpoint integration outward from u = 0 (the water surface under Benny's start = world origin)
            nd[i0].pos = Vector3.zero;
            for (int i = i0 + 1; i < count; i++) nd[i].pos = nd[i - 1].pos + Dir(0.5f * (nd[i].heading + nd[i - 1].heading), 0.5f * (nd[i].slope + nd[i - 1].slope)) * Step;
            for (int i = i0 - 1; i >= 0; i--) nd[i].pos = nd[i + 1].pos - Dir(0.5f * (nd[i].heading + nd[i + 1].heading), 0.5f * (nd[i].slope + nd[i + 1].slope)) * Step;
            // bank from the speed the curve is ridden with
            var raw = new float[count];
            for (int i = 0; i < count; i++)
            {
                int a = Mathf.Max(0, i - 2), b = Mathf.Min(count - 1, i + 2);
                float k = (nd[b].heading - nd[a].heading) * Mathf.Deg2Rad / ((b - a) * Step);
                nd[i].kappa = k;
                float v = NominalSpeed(UMin + i * Step);
                raw[i] = Mathf.Clamp(Mathf.Atan(0.62f * v * v * k * Mathf.Cos(nd[i].slope * Mathf.Deg2Rad) / Gravity) * Mathf.Rad2Deg, -24f, 24f);
            }
            const float sigma = 5f;
            int r = Mathf.CeilToInt(sigma * 2.5f / Step);
            for (int i = 0; i < count; i++)
            {
                float sum = 0f, ws = 0f;
                for (int k = -r; k <= r; k += 2)
                {
                    float w = Mathf.Exp(-0.5f * (k * Step) * (k * Step) / (sigma * sigma));
                    sum += w * raw[Mathf.Clamp(i + k, 0, count - 1)];
                    ws += w;
                }
                nd[i].bank = sum / ws;
                Vector3 f = Dir(nd[i].heading, nd[i].slope);
                float hr = nd[i].heading * Mathf.Deg2Rad, br = nd[i].bank * Mathf.Deg2Rad;
                Vector3 r0 = new Vector3(Mathf.Cos(hr), 0f, -Mathf.Sin(hr));
                Vector3 u0 = Vector3.Cross(f, r0);
                nd[i].fwd = f;
                nd[i].right = Mathf.Cos(br) * r0 - Mathf.Sin(br) * u0;
                nd[i].up = Mathf.Cos(br) * u0 + Mathf.Sin(br) * r0;
            }
            nodes = nd;
        }

        static Vector3 Dir(float headingDeg, float slopeDeg)
        {
            float h = headingDeg * Mathf.Deg2Rad, s = slopeDeg * Mathf.Deg2Rad;
            return new Vector3(Mathf.Cos(s) * Mathf.Sin(h), Mathf.Sin(s), Mathf.Cos(s) * Mathf.Cos(h));
        }

        /// <summary>Smooth path frame at u.</summary>
        public static Frame At(float u)
        {
            Ensure();
            float f = Mathf.Clamp((u - UMin) / Step, 0f, count - 1.001f);
            int i = (int)f;
            float t = f - i;
            Frame a = nodes[i], b = nodes[i + 1], o;
            o.pos = Vector3.LerpUnclamped(a.pos, b.pos, t);
            o.fwd = Vector3.LerpUnclamped(a.fwd, b.fwd, t).normalized;
            o.right = Vector3.LerpUnclamped(a.right, b.right, t).normalized;
            o.up = Vector3.Cross(o.fwd, o.right).normalized;
            o.slope = Mathf.LerpUnclamped(a.slope, b.slope, t);
            o.heading = Mathf.LerpUnclamped(a.heading, b.heading, t);
            o.bank = Mathf.LerpUnclamped(a.bank, b.bank, t);
            o.kappa = Mathf.LerpUnclamped(a.kappa, b.kappa, t);
            return o;
        }

        /// <summary>Still-water height (m, along the local up) of the trough at side offset x.</summary>
        public static float Trough(float x)
        {
            float k = Mathf.Clamp01(Mathf.Abs(x) / HalfWidth);
            return EdgeRise * k * k * k;
        }

        public static float TroughSlope(float x)
        {
            float k = Mathf.Clamp(x / HalfWidth, -1f, 1f);
            return 3f * EdgeRise / HalfWidth * k * Mathf.Abs(k);
        }

        /// <summary>Gentle travelling swell (the water shader moves its vertices with the same formula).</summary>
        public static float Swell(float u, float x, float time)
        {
            return 0.055f * Mathf.Sin(u * 0.55f - time * 2.6f + x * 0.35f) + 0.03f * Mathf.Sin(u * 1.37f - time * 4.1f - x * 0.8f);
        }

        /// <summary>World position of local (u, x, h above the still trough surface).</summary>
        public static Vector3 World(float u, float x, float h)
        {
            Frame f = At(u);
            return f.pos + f.right * x + f.up * (Trough(x) + h);
        }

        /// <summary>World position relative to the flat frame (h above the centre line, no trough).</summary>
        public static Vector3 WorldFlat(float u, float x, float h)
        {
            Frame f = At(u);
            return f.pos + f.right * x + f.up * h;
        }
    }
}

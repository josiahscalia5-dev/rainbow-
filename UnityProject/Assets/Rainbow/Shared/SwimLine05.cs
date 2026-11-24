using UnityEngine;

namespace Rainbow.Screen05
{
    /// <summary>
    /// The line Benny swims when the player does not steer (master direction 2026-11-24: "his forward movement must follow the
    /// direction and curvature of the water current"). Until s = 16 it is the approved start (RiverPath.Meander, so the approved
    /// view at s = 14 is unchanged); from there it follows the VISIBLE current: half the middle of the cyan core, half the coin
    /// line, smoothed so his heading changes gently. Also gives the swimmable width between the two foam banks.
    /// </summary>
    public static class SwimLine05
    {
        public const float S0 = RiverPath.TunnelStart, S1 = RiverPath.CourseLength - 60f, Step = 0.5f;
        /// <summary>Distance (m) Benny's body centre keeps from the foam waterlines.</summary>
        public const float BankGap = BennyController.BodyRadius + 0.2f;

        static float[] line;
        static int count;

        static float SS(float a, float b, float x)
        {
            float t = Mathf.Clamp01((x - a) / (b - a));
            return t * t * (3f - 2f * t);
        }

        static float[] Gauss(float[] a, float sigma)
        {
            float sg = sigma / Step;
            int r = Mathf.CeilToInt(sg * 2.6f);
            var o = new float[a.Length];
            for (int i = 0; i < a.Length; i++)
            {
                float sum = 0f, ws = 0f;
                for (int k = -r; k <= r; k++)
                {
                    float w = Mathf.Exp(-0.5f * k * k / (sg * sg));
                    sum += w * a[Mathf.Clamp(i + k, 0, a.Length - 1)];
                    ws += w;
                }
                o[i] = sum / ws;
            }
            return o;
        }

        static void Ensure()
        {
            if (line != null) return;
            count = Mathf.RoundToInt((S1 - S0) / Step) + 1;
            var raw = new float[count];
            for (int i = 0; i < count; i++)
            {
                float s = S0 + i * Step;
                float core = RiverLayout05.CoreX(s);
                raw[i] = s < 118f ? Mathf.Lerp(core, CoinTrail.ApprovedLineX(s), 0.5f * (1f - SS(108f, 118f, s))) : core;
            }
            float[] sm = Gauss(raw, 3.2f);
            var o = new float[count];
            for (int i = 0; i < count; i++)
            {
                float s = S0 + i * Step;
                float x = Mathf.Lerp(RiverPath.Meander(s), sm[i], SS(16f, 28f, s));
                if (s > 16f)
                {
                    float l = RiverLayout05.X(RiverLayout05.WL, s) + 1.4f, r = RiverLayout05.X(RiverLayout05.WR, s) - 1.4f;
                    if (l < r) x = Mathf.Lerp(x, Mathf.Clamp(x, l, r), SS(16f, 20f, s));
                }
                o[i] = x;
            }
            float[] sm2 = Gauss(o, 1.6f);
            for (int i = 0; i < count; i++) o[i] = Mathf.Lerp(o[i], sm2[i], SS(17f, 22f, S0 + i * Step));
            line = o;
        }

        /// <summary>World x of the swim line at s.</summary>
        public static float X(float s)
        {
            Ensure();
            float f = Mathf.Clamp((s - S0) / Step, 0f, count - 1.001f);
            int i = (int)f;
            float t = f - i;
            // Catmull-Rom: a smooth heading between the table points
            float p0 = line[Mathf.Max(0, i - 1)], p1 = line[i], p2 = line[i + 1], p3 = line[Mathf.Min(count - 1, i + 2)];
            return 0.5f * (2f * p1 + (p2 - p0) * t + (2f * p0 - 5f * p1 + 4f * p2 - p3) * t * t + (3f * p1 - p0 - 3f * p2 + p3) * t * t * t);
        }

        public static Vector3 Point(float s) => new Vector3(X(s), RiverPath.WaterY, s);

        /// <summary>dx/ds of the line averaged over [s + a, s + b] (the camera looks where the current goes).</summary>
        public static float SlopeAhead(float s, float a, float b) => (X(s + b) - X(s + a)) / Mathf.Max(0.1f, b - a);

        /// <summary>Swimmable x range at s: between the foam waterlines (a little ahead too, so he never runs into a narrowing bank).</summary>
        public static Vector2 Limits(float s)
        {
            float l = -1e6f, r = 1e6f;
            for (int k = 0; k <= 4; k++)
            {
                float sk = s - 0.8f + 0.6f * k;
                l = Mathf.Max(l, RiverLayout05.X(RiverLayout05.WL, sk));
                r = Mathf.Min(r, RiverLayout05.X(RiverLayout05.WR, sk));
            }
            l += BankGap; r -= BankGap;
            if (l > r) { float m = 0.5f * (l + r); l = r = m; }
            return new Vector2(l, r);
        }
    }
}

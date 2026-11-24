using System;
using System.Text;
using System.Collections.Generic;

public static class M
{
    public static float Clamp01(float x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }
    public static float Clamp(float x, float a, float b) { return x < a ? a : (x > b ? b : x); }
    public static float SS(float a, float b, float x) { float t = Clamp01((x - a) / (b - a)); return t * t * (3f - 2f * t); }
    public static float SMin(float a, float b, float k) { float h = Math.Max(k - Math.Abs(a - b), 0f) / k; return Math.Min(a, b) - h * h * k * 0.25f; }
    public static float Lerp(float a, float b, float t) { return a + (b - a) * t; }
    public static float Sin(float x) { return (float)Math.Sin(x); }
    public static float Cos(float x) { return (float)Math.Cos(x); }
    public static float Sqrt(float x) { return (float)Math.Sqrt(x); }
    public static float Pow(float x, float p) { return (float)Math.Pow(x, p); }
    public const float PI = (float)Math.PI;
}

// ---------------- RiverPath (exact port of the current file, plus an optional override) ----------------
public static class RP
{
    public const float StageLength = 72f, Lambda = 32f, UCrest = 14f, A0 = 0.45f, A1 = 1.85f, StreamExtent = 6.0f;
    const float UKeep = UCrest + Lambda / 4f;
    const float UTail = 67f;
    const float ExitU0 = 56f, ExitU1 = UTail, ExitAmp = 1.353668f;
    static readonly float[] KnotU = { UKeep, 26.3f, 32.2f, 43f, 55.5f, UTail };
    static readonly float[] KnotV = new float[6];
    static float SlopeKeep, SlopeTail;
    public static Func<float, float> Override = null;   // if set, Meander = Override(s)
    static RP()
    {
        KnotV[0] = MeanderSine(UKeep);
        KnotV[1] = 0.37f; KnotV[2] = -0.23f; KnotV[3] = -1.14f; KnotV[4] = -0.79f;
        KnotV[5] = MeanderSine(UTail);
        SlopeKeep = SlopeOf(UKeep); SlopeTail = SlopeOf(UTail);
    }
    public static float MeanderSine(float u)
    {
        float grow = M.Clamp01((u - UCrest) / (1.5f * Lambda));
        float amp = (A0 + (A1 - A0) * grow) * M.SS(0f, 10f, u) * (1f - M.SS(StageLength - 12f, StageLength, u));
        return -amp * M.Cos(2f * M.PI * (u - UCrest) / Lambda);
    }
    static float SlopeOf(float u) { return (MeanderSine(u + 1e-3f) - MeanderSine(u - 1e-3f)) / 2e-3f; }
    static float Tan(int j)
    {
        int n = KnotU.Length;
        return j == 0 ? SlopeKeep : j == n - 1 ? SlopeTail : (KnotV[j + 1] - KnotV[j - 1]) / (KnotU[j + 1] - KnotU[j - 1]);
    }
    static float HermiteKnots(float u)
    {
        int n = KnotU.Length;
        if (u >= KnotU[n - 1]) return KnotV[n - 1];
        int i = 0;
        while (u > KnotU[i + 1]) i++;
        float u0 = KnotU[i], p0 = KnotV[i], u1 = KnotU[i + 1], p1 = KnotV[i + 1];
        float h = u1 - u0, t = (u - u0) / h, t2 = t * t, t3 = t2 * t;
        return (2f * t3 - 3f * t2 + 1f) * p0 + (t3 - 2f * t2 + t) * h * Tan(i) + (-2f * t3 + 3f * t2) * p1 + (t3 - t2) * h * Tan(i + 1);
    }
    public static float MeanderOld(float s)
    {
        if (s <= 0f || s >= StageLength) return 0f;
        if (s <= UKeep || s >= UTail) return MeanderSine(s);
        float bend = (s > ExitU0 && s < ExitU1) ? ExitAmp * M.Pow(M.Sin(M.PI * (s - ExitU0) / (ExitU1 - ExitU0)), 2f) : 0f;
        return HermiteKnots(s) + bend;
    }
    public static float Meander(float s) { return Override != null ? Override(s) : MeanderOld(s); }
}

public static class RS
{
    public const float SOffset = 116.7f, CoreSwing = 0.9f;
    public static float StreamHalfWidth(float s) { float d = RP.Meander(s); return RP.StreamExtent - M.Sqrt(d * d + 0.09f); }
    public static float SBend(float ms) { return 1.05f * M.Sin(ms * 0.31f - 0.834f) + 0.18f * M.Sin(ms * 0.62f + 0.6f); }
    public static float CoreShift(float s)
    {
        float ms = s + SOffset;
        float w = M.SS(171f, 175f, ms) * (1f - M.SS(182f, 189f, ms));
        if (w <= 0f) return 0f;
        float d = RP.Meander(s);
        float visible = d + (CoreSwing * d + SBend(ms));
        float target = -0.67f + 0.37f * M.SS(172f, 180f, ms);
        return w * (target - visible);
    }
}

public static class DL
{
    public const float Radius = 6.8f, FloorDepth = 2.55f, NearFloorExtra = 1.0f, EyeS = 14f - 6.52f;
    static float Smoother(float e0, float e1, float x) { float t = M.Clamp01((x - e0) / (e1 - e0)); return t * t * t * (t * (t * 6f - 15f) + 10f); }
    public static float FloorExtra(float s) { return NearFloorExtra * (1f - Smoother(EyeS + 28f, EyeS + 38f, s)) * M.SS(2f, 10f, s); }
    public static float CentreY(float s) { return Radius - (FloorDepth + FloorExtra(s)); }
    public static float WaterChord(float s) { float h = CentreY(s); return M.Sqrt(Math.Max(0f, Radius * Radius - h * h)); }
}

public static class FB
{
    public static float BandFL(float sm)
    {
        return -0.5f * M.SS(143f, 147f, sm) * (1f - M.SS(151f, 155f, sm))
             + 1.0f * M.SS(154f, 158f, sm) * (1f - M.SS(168f, 176f, sm))
             + 1.5f * M.SS(147.5f, 151.5f, sm) * (1f - M.SS(158f, 166f, sm))
             - 0.45f * M.SS(135.5f, 137.5f, sm) * (1f - M.SS(140.0f, 142.0f, sm));
    }
    public static float BandFR(float sm)
    {
        return -0.3f * M.SS(133f, 136f, sm) * (1f - M.SS(139.5f, 142f, sm))
             + 1.9f * M.SS(146.5f, 154f, sm) * (1f - M.SS(160f, 168f, sm))
             - 0.9f * M.SS(165f, 170f, sm) * (1f - M.SS(174f, 180f, sm))
             + 1.4f * M.SS(152f, 156f, sm) * (1f - M.SS(161f, 168f, sm));
    }
    public static float BandFitM(float sm)
    {
        return 1.0f * M.SS(137.2f, 139.7f, sm) * (1f - M.SS(141.2f, 147.2f, sm))
             - 0.35f * M.SS(147.7f, 150.7f, sm) * (1f - M.SS(153.7f, 158.7f, sm))
             - 1.0f * M.SS(166.7f, 171.7f, sm) * (1f - M.SS(176.7f, 182.7f, sm));
    }
    public static float[] BandLimits(float d, float hw, float W, float sm)
    {
        float k = M.SS(136.2f, 140.2f, sm) * (W >= 1f ? 1f : 0f);
        return new float[] { M.Lerp(hw - 0.5f, W + d - 0.6f, k), M.Lerp(hw - 0.5f, W - d - 0.6f, k) };
    }
    public static float WallChord(float s) { return DL.WaterChord(s); }
    public static float[] BankEdges(float s)
    {
        float d = RP.Meander(s);
        float hw = Math.Max(RS.StreamHalfWidth(s), 0.5f);
        float sm = s + RS.SOffset;
        float mb = RS.CoreSwing * d + RS.CoreShift(s) + RS.SBend(sm) + BandFitM(sm);
        return BankEdges(d, hw, mb, sm, WallChord(s));
    }
    public static float[] BankEdges(float d, float hw, float mb, float sm, float W)
    {
        hw = Math.Max(hw, 0.5f);
        float fR = BandFR(sm), fL = BandFL(sm);
        float[] lim = BandLimits(d, hw, W, sm);
        float offL = hw * (0.62f + 0.03f * M.Sin(sm * 0.13f + 1.7f)) + fL;
        float offR = hw * (0.62f + 0.03f * M.Sin(sm * 0.11f + 4.2f)) + fR;
        float wL = hw * 0.205f * (1f + 0.15f * M.Sin(sm * 0.19f + 0.4f));
        float wR = hw * 0.205f * (1f + 0.15f * M.Sin(sm * 0.17f + 2.9f));
        float roomL = mb + lim[0] - offL;
        float roomR = lim[1] - mb - offR;
        wL = M.SMin(wL, Math.Max(roomL, 0.6f * wL), 0.5f);
        wR = M.SMin(wR, Math.Max(roomR, 0.6f * wR), 0.5f);
        offL = M.SMin(offL, mb + lim[0] - wL, 1.2f);
        offR = M.SMin(offR, lim[1] - wR - mb, 1.2f);
        float eL = mb - offL - wL;
        float eR = mb + offR + wR;
        eL -= 0.26f + 0.12f * M.Sin(sm * 0.37f + 1.3f) + 0.07f * M.Sin(sm * 0.91f + 0.4f);
        eR += 0.26f + 0.12f * M.Sin(sm * 0.41f + 4.1f) + 0.07f * M.Sin(sm * 0.87f + 2.2f);
        float pL = 0.6f * M.Sin(sm * 0.173f + 0.6f) + 0.4f * M.Sin(sm * 0.419f + 2.3f);
        float pR = 0.6f * M.Sin(sm * 0.191f + 3.7f) + 0.4f * M.Sin(sm * 0.443f + 0.9f);
        eL += 0.8f * M.SS(0.3f, 0.95f, pL);
        eR -= 0.8f * M.SS(0.3f, 0.95f, pR);
        float kW = M.SS(136.2f, 136.9f, sm) * (W >= 1f ? 1f : 0f);
        float wallL = -(W + d);
        float wallR = W - d;
        float rimL = 0.35f + 0.65f * M.SS(136.9f, 137.9f, sm) + 0.25f * M.SS(137.9f, 141.0f, sm)
                   + 0.6f * M.SS(141.0f, 143.5f, sm) - 0.15f * M.SS(144.0f, 147.0f, sm)
                   - 0.5f * M.SS(147.0f, 149.0f, sm) - 0.85f * M.SS(149.0f, 151.5f, sm);
        float rimLmin = M.Lerp(rimL, 0.35f, M.SS(152.0f, 154.0f, sm));
        float rimRn = 0.62f + 0.9f * (1f - M.SS(141.2f, 143.2f, sm)) + 0.5f * (1f - M.SS(139.5f, 141.0f, sm))
                    + 0.35f * M.SS(151.5f, 154.0f, sm) + 0.5f * M.SS(154.5f, 157.5f, sm);
        float rimR = 0.45f + 0.75f * (1f - M.SS(141.5f, 144.0f, sm)) + 3.0f * (1f - M.SS(140.0f, 141.5f, sm))
                   + 1.15f * M.SS(157.7f, 160.7f, sm) + 0.7f * M.SS(160.7f, 164.3f, sm)
                   + 0.5f * M.SS(164.3f, 168.3f, sm) + 0.7f * M.SS(168.3f, 173.2f, sm)
                   + 0.4f * M.SS(173.2f, 179.3f, sm) - 1.8f * M.SS(179.3f, 186.7f, sm)
                   - 1.5f * M.SS(186.7f, 196.7f, sm);
        rimR = Math.Max(rimR, rimRn);
        float rimRmin = M.Lerp(rimRn, rimR, M.SS(156.5f, 158.5f, sm) * (1f - M.SS(185.0f, 189.0f, sm)));
        eL = M.Lerp(eL, M.Clamp(eL, wallL + rimLmin, wallL + rimL), kW);
        eR = M.Lerp(eR, M.Clamp(eR, wallR - rimR, wallR - rimRmin), kW);
        float kL1 = M.SS(126.6f, 127.6f, sm) * (1f - M.SS(129.0f, 129.8f, sm));
        float kL2 = M.SS(129.0f, 130.0f, sm) * (1f - M.SS(131.6f, 132.6f, sm));
        float kR1 = M.SS(126.6f, 127.6f, sm) * (1f - M.SS(128.9f, 129.7f, sm));
        float kR2 = M.SS(130.6f, 132.0f, sm) * (1f - M.SS(137.0f, 139.5f, sm));
        eL = M.Lerp(eL, Math.Max(eL, -1.25f), kL1);
        eL = M.Lerp(eL, Math.Max(eL, -2.05f), kL2);
        eR = M.Lerp(eR, Math.Min(eR, 1.3f), kR1);
        eR = M.Lerp(eR, Math.Min(eR, 2.7f), kR2);
        float coin = 0.63f * d;
        eL = Math.Min(eL, coin - 1.25f);
        eR = Math.Max(eR, coin + 1.25f);
        return new float[] { Math.Max(eL, M.Lerp(-hw, wallL, kW)), Math.Min(eR, M.Lerp(hw, wallR, kW)) };
    }
}

// shader band layout (RainbowRiver_float), time = 0, no noise pert; returns world x of {leftBandOuter, leftBandInner, rightBandInner, rightBandOuter, core}
public static class SH
{
    public static float BennyS = 14f, BennyX = -0.45f, Time = 0f;
    public static float[] Bands(float s)
    {
        float d = RP.Meander(s);
        float hw = Math.Max(RS.StreamHalfWidth(s), 0.5f);
        float sm = s + RS.SOffset;
        float M_ = RS.CoreSwing * d + RS.CoreShift(s);
        float sbend = RS.SBend(sm) + FB.BandFitM(sm);
        float db = s - BennyS;
        float bOn = 1f;
        float hwc = Math.Min(hw, 4.5f);
        float gate = M.Lerp(1.0f, 0.62f + 0.38f * M.SS(1.5f, 20.0f, db), bOn);
        float near05 = M.Lerp(1.0f, 0.8f + 0.2f * M.SS(2.0f, 14.0f, db), bOn);
        float tv = sm - Time * 11.0f * 0.3f;
        float offL = hw * (0.62f * near05 + 0.03f * M.Sin(sm * 0.13f + 1.7f)) + hwc * 0.05f * M.Sin(tv * 0.42f + 1.1f);
        float offR = hw * (0.62f * near05 + 0.03f * M.Sin(sm * 0.11f + 4.2f)) + hwc * 0.05f * M.Sin(tv * 0.37f + 3.9f);
        float wL = hw * 0.205f * (1.0f + 0.15f * M.Sin(sm * 0.19f + 0.4f) + 0.08f * hwc * M.Sin(tv * 0.6f)) * gate;
        float wR = hw * 0.205f * (1.0f + 0.15f * M.Sin(sm * 0.17f + 2.9f) + 0.08f * hwc * M.Sin(tv * 0.55f + 2.0f)) * gate;
        float fR = FB.BandFR(sm), fL = FB.BandFL(sm);
        float[] lim = FB.BandLimits(d, hw, DL.WaterChord(s), sm);
        offL += fL; offR += fR;
        offL += bOn * 2.0f * M.SS(7.0f, 2.5f, db);
        offR += bOn * 1.6f * M.SS(2.6f, 0.4f, db);
        float Mb = M_ + sbend;
        float roomL = Mb + lim[0] - offL;
        float roomR = lim[1] - Mb - offR;
        wL = M.SMin(wL, Math.Max(roomL, 0.6f * wL), 0.5f);
        wR = M.SMin(wR, Math.Max(roomR, 0.6f * wR), 0.5f);
        offL = M.SMin(offL, Mb + lim[0] - wL, 1.2f);
        offR = M.SMin(offR, lim[1] - wR - Mb, 1.2f);
        float kWL = 1.0f - 0.4f * M.SS(136.7f, 138.7f, sm) * (1.0f - M.SS(146.7f, 149.7f, sm));
        float kWR = 1.0f - 0.42f * M.SS(129.0f, 131.5f, sm);
        offR -= 1.45f * M.SS(128.0f, 131.0f, sm) * (1.0f - M.SS(134.9f, 138.4f, sm));
        float wLv = Math.Max(wL * kWL, 0.2f);
        float wRv = Math.Max(wR * kWR, 0.2f);
        // band frame: xb = latR - M - sbend; left band centre at xb = -offL (sdL = xb + offL), right at xb = +offR
        float baseX = d + Mb;
        // pink visible to |t| ~ 0.98 of the band half... band coordinate t = sd / w, pink |t| < ~0.85-1.0
        return new float[] { baseX - offL - wLv, baseX - offL + wLv, baseX + offR - wRv, baseX + offR + wRv, baseX, d };
    }
}

public static class Cam
{
    public static double Cx = -0.06, Cy = 3.40, Cz = 7.48, Pitch = 12.78, Yaw = -2.8, F = 1278, U0 = 432, V0 = 768;
    // returns (u, v)
    public static double[] Project(double x, double y, double z)
    {
        double vx = x - Cx, vy = y - Cy, vz = z - Cz;
        double ya = -Yaw * Math.PI / 180.0;     // Ry^T
        double x1 = vx * Math.Cos(ya) + vz * Math.Sin(ya);
        double z1 = -vx * Math.Sin(ya) + vz * Math.Cos(ya);
        double pa = Pitch * Math.PI / 180.0;    // Rx(-pitch)
        double y2 = vy * Math.Cos(pa) + z1 * Math.Sin(pa);
        double z2 = -vy * Math.Sin(pa) + z1 * Math.Cos(pa);
        return new double[] { U0 + F * x1 / z2, V0 - F * y2 / z2 };
    }
    // s on the water for image row v at world x (iterate)
    public static double SAtRow(double v, double x)
    {
        double lo = 7.6, hi = 2000;
        for (int i = 0; i < 80; i++)
        {
            double mid = 0.5 * (lo + hi);
            double vv = Project(x, 0, mid)[1];
            if (vv > v) lo = mid; else hi = mid;
        }
        return 0.5 * (lo + hi);
    }
}

public static class Report
{
    public static string Rows(int y0, int y1, int step)
    {
        var sb = new StringBuilder();
        sb.AppendLine("   y      s   meand  bankL  bandLo bandLi  core  bandRi bandRo bankR | px: bankL bandL(lo-li) core bandR(ri-ro) bankR coin");
        for (int y = y0; y <= y1; y += step)
        {
            double s = Cam.SAtRow(y, -0.45);
            float fs = (float)s;
            float d = RP.Meander(fs);
            float[] e = FB.BankEdges(fs);
            float[] b = SH.Bands(fs);
            double bl = d + e[0], br = d + e[1];
            Func<double, int> px = (xx) => (int)Math.Round(Cam.Project(xx, 0, s)[0]);
            double coinX = 1.63 * d;
            sb.AppendLine(string.Format("{0,4} {1,6:0.0} {2,6:0.00} {3,6:0.00} {4,6:0.00} {5,6:0.00} {6,6:0.00} {7,6:0.00} {8,6:0.00} {9,6:0.00} | {10,5} {11,5}-{12,-5} {13,5} {14,5}-{15,-5} {16,5} {17,5}",
                y, s, d, bl, b[0], b[1], b[4], b[2], b[3], br, px(bl), px(b[0]), px(b[1]), px(b[4]), px(b[2]), px(b[3]), px(br), px(coinX)));
        }
        return sb.ToString();
    }
}

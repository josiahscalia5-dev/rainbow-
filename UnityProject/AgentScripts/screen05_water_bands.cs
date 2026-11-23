// WATER agent (read-only): band layout of RainbowRiver.hlsl along the course without Benny terms / noise / wobble:
// world x of the cyan-core line (d + M + sbend), left / right band centres and the stream banks, per s.
var sb = new System.Text.StringBuilder();
float SS(float a, float b, float x) { float t = Mathf.Clamp01((x - a) / (b - a)); return t * t * (3f - 2f * t); }
float SMin(float a, float b, float k) { float h = Mathf.Max(k - Mathf.Abs(a - b), 0f) / k; return Mathf.Min(a, b) - h * h * k * 0.25f; }
for (float s = 14f; s <= 76f; s += 1f)
{
    float d = Rainbow.Screen05.RiverPath.Meander(s);
    float hw = Mathf.Max(Rainbow.Screen05.RiverSurface.StreamHalfWidth(s), 0.5f);
    float sm = s + Rainbow.Screen05.RiverSurface.SOffset;
    float M = 0.9f * d + Rainbow.Screen05.RiverSurface.CoreShift(s);
    float sbend = Rainbow.Screen05.RiverSurface.SBend(sm);
    float offL = hw * (0.62f + 0.03f * Mathf.Sin(sm * 0.13f + 1.7f));
    float offR = hw * (0.62f + 0.03f * Mathf.Sin(sm * 0.11f + 4.2f));
    float wL = hw * 0.205f * (1f + 0.15f * Mathf.Sin(sm * 0.19f + 0.4f));
    float wR = hw * 0.205f * (1f + 0.15f * Mathf.Sin(sm * 0.17f + 2.9f));
    float fR = -0.3f * SS(133f, 136f, sm) * (1f - SS(139.5f, 142f, sm)) + 1.9f * SS(146.5f, 154f, sm) * (1f - SS(160f, 168f, sm))
             - 0.9f * SS(165f, 170f, sm) * (1f - SS(174f, 180f, sm));
    float fL = -0.5f * SS(143f, 147f, sm) * (1f - SS(151f, 155f, sm)) + 1.0f * SS(154f, 158f, sm) * (1f - SS(168f, 176f, sm));
    offL += fL; offR += fR;
    float Mb = M + sbend;
    float roomL = Mb + hw - 0.5f - offL, roomR = hw - 0.5f - Mb - offR;
    wL = SMin(wL, Mathf.Max(roomL, 0.6f * wL), 0.5f);
    wR = SMin(wR, Mathf.Max(roomR, 0.6f * wR), 0.5f);
    offL = SMin(offL, Mb + hw - wL - 0.5f, 1.2f);
    offR = SMin(offR, hw - wR - 0.5f - Mb, 1.2f);
    float c = d + Mb;
    sb.AppendLine(string.Format("s {0,5:F1} sm {1,6:F1} d {2,6:F2} hw {3,5:F2} core {4,6:F2} Lc {5,6:F2} Rc {6,6:F2} wL {7,5:F2} wR {8,5:F2} bank {9,6:F2}..{10,6:F2}",
        s, sm, d, hw, c, c - offL, c + offR, wL, wR, d - hw, d + hw));
}
return sb.ToString();

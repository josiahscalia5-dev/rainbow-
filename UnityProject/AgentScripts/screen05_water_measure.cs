// Read-only: mean / low / high display colours of the approved water (and a Unity still) by streamline coordinate q and depth zone.
// Recordings/Screen05/work/water_measure_params.txt: line 1 = Unity still path (optional)
string refp = @"C:\RainbowUnity\references\05_flow_into_the_current.png";
string still = System.IO.File.Exists("Recordings/Screen05/work/water_measure_params.txt") ? System.IO.File.ReadAllText("Recordings/Screen05/work/water_measure_params.txt").Trim() : "";
Color32[] Load(string p) { var t = new Texture2D(2, 2); t.LoadImage(System.IO.File.ReadAllBytes(p)); var c = t.GetPixels32(); int w = t.width; UnityEngine.Object.DestroyImmediate(t); if (w != 864) return null; return c; }
var A = Load(refp); var U = still.Length > 0 ? Load(still) : null;
var R = Quaternion.Euler(12.78f, -2.80f, 0f); var C = new Vector3(-0.06f, 3.40f, 7.48f); const float F = 1278.2f;
var circ = new System.Collections.Generic.List<Vector3> { new Vector3(474,729,62), new Vector3(549,661,48), new Vector3(482,612,40), new Vector3(431,576,32), new Vector3(465,545,24), new Vector3(496,533,18), new Vector3(518,523,14), new Vector3(533,517,14) };
foreach (var n in new[] { "StartBig", "StartSmall" })
{
    var arr = (Vector3[])typeof(Rainbow.Screen05.BubbleField).GetField(n, System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static).GetValue(null);
    foreach (var b in arr) circ.Add(new Vector3(b.x, b.y, b.z * 0.5f + 6f));
}
bool Masked(int x, int y)
{
    foreach (var c in circ) if ((x - c.x) * (x - c.x) + (y - c.y) * (y - c.y) < c.z * c.z) return true;
    if (y > 755 && y < 1205 && x > 222 && x < 620) return true;
    if (y >= 1060 && y < 1340 && Mathf.Abs(x - 420) < 330) return true;
    if (y > 985 && y < 1125 && x < 150) return true;
    return false;
}
float[] zs = { 14.6f, 18f, 24f, 34f, 60f };
int nq = 24;   // q -3 .. 3 in 0.25 steps
var sb = new System.Text.StringBuilder();
for (int z = 0; z + 1 < zs.Length; z++)
{
    var la = new System.Collections.Generic.List<Color32>[nq]; var lu = new System.Collections.Generic.List<Color32>[nq];
    for (int i = 0; i < nq; i++) { la[i] = new System.Collections.Generic.List<Color32>(); lu[i] = new System.Collections.Generic.List<Color32>(); }
    for (int y = 505; y < 1180; y += 1) for (int x = 2; x < 862; x += 2)
    {
        if (Masked(x, y)) continue;
        Vector3 d = R * new Vector3((x + 0.5f - 432f) / F, (768f - y - 0.5f) / F, 1f);
        if (d.y > -1e-4f) continue;
        float t = -C.y / d.y; Vector3 p = C + d * t;
        if (p.z < zs[z] || p.z >= zs[z + 1]) continue;
        float q = Rainbow.Screen05.RiverLayout05.Q(p.z, p.x);
        int qi = Mathf.FloorToInt((q + 3f) / 6f * nq); if (qi < 0 || qi >= nq) continue;
        int idx = (1535 - y) * 864 + x;
        la[qi].Add(A[idx]); if (U != null) lu[qi].Add(U[idx]);
    }
    sb.Append("zone s " + zs[z] + " - " + zs[z + 1] + "   (q: approved mean | p15 luma colour | p85 luma colour || unity mean | p15 | p85)\n");
    string Desc(System.Collections.Generic.List<Color32> l)
    {
        if (l.Count < 12) return "-";
        float r = 0, g = 0, b = 0; foreach (var c in l) { r += c.r; g += c.g; b += c.b; }
        l.Sort((m, k) => (m.r * 0.3f + m.g * 0.59f + m.b * 0.11f).CompareTo(k.r * 0.3f + k.g * 0.59f + k.b * 0.11f));
        string Avg(int a0, int a1) { float rr = 0, gg = 0, bb = 0; int n = 0; for (int i = a0; i < a1; i++) { rr += l[i].r; gg += l[i].g; bb += l[i].b; n++; } n = Mathf.Max(n, 1); return (int)(rr / n) + "," + (int)(gg / n) + "," + (int)(bb / n); }
        int N = l.Count;
        return (int)(r / N) + "," + (int)(g / N) + "," + (int)(b / N) + " | " + Avg((int)(N * 0.08f), (int)(N * 0.22f)) + " | " + Avg((int)(N * 0.78f), (int)(N * 0.92f)) + " | top4% " + Avg((int)(N * 0.96f), N);
    }
    for (int i = 0; i < nq; i++) if (la[i].Count >= 12) sb.Append((-3f + (i + 0.5f) * 0.25f).ToString("0.00").PadLeft(6) + " n" + la[i].Count + "  " + Desc(la[i]) + "  ||  " + Desc(lu[i]) + "\n");
}
return sb.ToString();

// Edit mode (or Play paused): one correction step of the broad water sheen (RiverSheen05 / WakeSheen05). Compares a Unity still (normal camera, s = 14)
// with the approved picture on clean water pixels only (no foam, splash, bubbles, coins, Benny, frame) and moves the low-frequency ramp
// rows by the difference. Recordings/Screen05/work/water_measure_params.txt = path of the still; gain below.
float gain = 0.75f;
const int N = 96;
string still = System.IO.File.ReadAllText("Recordings/Screen05/work/water_measure_params.txt").Trim();
string refp = @"C:\RainbowUnity\references\05_flow_into_the_current.png";
Color32[] Load(string p) { var t = new Texture2D(2, 2); t.LoadImage(System.IO.File.ReadAllBytes(p)); var c = t.GetPixels32(); UnityEngine.Object.DestroyImmediate(t); return c; }
var A = Load(refp); var U = Load(still);
if (Rainbow.Screen05.EditorTools.WaterTextureFactory.LastDisplayRamp == null) Rainbow.Screen05.EditorTools.WaterTextureFactory.MakeRamp(refp);
var disp = Rainbow.Screen05.EditorTools.WaterTextureFactory.LastDisplayRamp;
var rowFor = typeof(Rainbow.Screen05.EditorTools.WaterSheenFactory).GetMethod("RowFor", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static);
var fill = typeof(Rainbow.Screen05.EditorTools.WaterSheenFactory).GetMethod("Fill", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static);
float Row(float q, int zone, Color32 c) => (float)rowFor.Invoke(null, new object[] { disp, q, zone, (0.299f * c.r + 0.587f * c.g + 0.114f * c.b) / 255f });
var R = Quaternion.Euler(12.78f, -2.80f, 0f); var C = new Vector3(-0.06f, 3.40f, 7.48f); const float F = 1278.2f;
var circ = new System.Collections.Generic.List<Vector3> { new Vector3(474, 729, 66), new Vector3(549, 661, 52), new Vector3(482, 612, 44), new Vector3(431, 576, 36), new Vector3(465, 545, 27), new Vector3(496, 533, 20), new Vector3(518, 523, 16), new Vector3(533, 517, 16) };
foreach (var nm in new[] { "StartBig", "StartSmall" })
{
    var arr = (Vector3[])typeof(Rainbow.Screen05.BubbleField).GetField(nm, System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static).GetValue(null);
    foreach (var b in arr) circ.Add(new Vector3(b.x, b.y, b.z * 0.5f + 8f));
}
bool Circ(int x, int y) { foreach (var c in circ) if ((x - c.x) * (x - c.x) + (y - c.y) * (y - c.y) < c.z * c.z) return true; return false; }
bool El(float x, float y, float cx, float cy, float rx, float ry) => (x - cx) * (x - cx) / (rx * rx) + (y - cy) * (y - cy) / (ry * ry) < 1f;
bool Benny(int x, int y) => El(x, y, 428, 838, 90, 86) || El(x, y, 425, 975, 165, 122) || El(x, y, 422, 1100, 166, 112) || El(x, y, 252, 1043, 40, 44) || El(x, y, 594, 1043, 40, 44);
bool White(Color32 c) => Mathf.Min(c.r, Mathf.Min(c.g, c.b)) > 165;
var acc = new float[N * N]; var wg = new float[N * N]; var acw = new float[N * N]; var ww = new float[N * N];
double sumA = 0, sumU = 0; int cnt = 0;
for (int y = 503; y < 1520; y++) for (int x = 0; x < 864; x++)
{
    if (Circ(x, y) || Benny(x, y)) continue;
    int idx = (1535 - y) * 864 + x;
    Color32 a = A[idx], u = U[idx];
    if (White(a) && White(u)) continue;
    Vector3 d = R * new Vector3((x + 0.5f - 432f) / F, (768f - y - 0.5f) / F, 1f);
    if (d.y > -1e-4f) continue;
    Vector3 p = C + d * (-C.y / d.y);
    bool wakeZone = y >= 1215;
    if (a.b < 150 || a.r > a.b + 25 || u.b < 150 || u.r > u.b + 25) continue;     // copper / gold
    if (wakeZone)
    {
        if (White(a) || White(u)) continue;
        float dl = p.x + 0.45f - 0.1f, back = 14f - p.z;
        if (Mathf.Abs(dl) > 0.5f + 0.45f * back) continue;                          // foam ropes outside
        int iu = Mathf.RoundToInt((dl + 2.2f) / 4.4f * N - 0.5f), iv = Mathf.RoundToInt((back + 0.7f) / 4.5f * N - 0.5f);
        if (iu < 0 || iv < 0 || iu >= N || iv >= N) continue;
        bool pa = a.r > a.g + 55, pu = u.r > u.g + 55;
        if (pa != pu) continue;
        float df = Row(pa ? 1.5f : 0f, 0, a) - Row(pa ? 1.5f : 0f, 0, u);
        acw[iv * N + iu] += Mathf.Clamp(df, -0.35f, 0.35f); ww[iv * N + iu] += 1f;
        continue;
    }
    if (y > 1050 && Mathf.Abs(x - 420) < 200 + (y - 1050) * 0.8f) continue;
    if (y > 975 && y < 1135 && x < 165) continue;
    if (p.z < 11f || p.z > 158f) continue;
    float q = Rainbow.Screen05.RiverLayout05.Q(p.z, p.x);
    if (Mathf.Abs(q) > 2.3f) continue;
    float dist = (p - C).magnitude; int zone = dist < 11.5f ? 0 : 1;
    int ju = Mathf.RoundToInt((q + 3f) / 6f * N - 0.5f), jv = Mathf.RoundToInt(Mathf.Log(dist / 3.5f, 2f) / 5.5f * N - 0.5f);
    if (ju < 0 || jv < 0 || ju >= N || jv >= N) continue;
    float ra = Row(q, zone, a), ru = Row(q, zone, u);
    acc[jv * N + ju] += Mathf.Clamp(ra - ru, -0.35f, 0.35f); wg[jv * N + ju] += 1f;
    sumA += ra; sumU += ru; cnt++;
}
string Apply(string path, float[] ac, float[] w)
{
    var t = UnityEditor.AssetDatabase.LoadAssetAtPath<Texture2D>(path);
    float[] dm = (float[])fill.Invoke(null, new object[] { ac, w, 1.3f, 0f });
    var px = t.GetPixels(); float mx = 0f;
    for (int i = 0; i < N * N; i++) { float v = Mathf.Clamp(px[i].r + gain * dm[i], 0.02f, 0.9f); mx = Mathf.Max(mx, Mathf.Abs(dm[i])); px[i].r = v; if (path.Contains("River")) { px[i].g = v; px[i].b = v; } }
    t.SetPixels(px); t.Apply(false, false); UnityEditor.EditorUtility.SetDirty(t);
    return System.IO.Path.GetFileNameWithoutExtension(path) + " max " + mx.ToString("0.00");
}
string r1 = Apply(Rainbow.Screen05.EditorTools.WaterSheenFactory.SheenPath, acc, wg), r2 = "wake map untouched";
UnityEditor.AssetDatabase.SaveAssets();
return r1 + " | " + r2 + " | mean row approved " + (sumA / cnt).ToString("0.000") + " unity " + (sumU / cnt).ToString("0.000") + " n " + cnt;

// GEOMETRY lane (read-only probe, Play mode paused at s = 14): where the drum wall base, the foam waterline and the foam
// puffs land on the 864x1536 still, row by row. Changes nothing.
var sb = new System.Text.StringBuilder();
var cam = Camera.main;
if (cam == null) return "no camera";
float W = 864f, H = 1536f;
float f = (H * 0.5f) / Mathf.Tan(cam.fieldOfView * 0.5f * Mathf.Deg2Rad);
Matrix4x4 w2c = cam.transform.worldToLocalMatrix;
Matrix4x4 c2w = cam.transform.localToWorldMatrix;
System.Func<Vector3, Vector2> P = (Vector3 wp) =>
{
    Vector3 c = w2c.MultiplyPoint(wp);
    if (c.z <= 0.01f) return new Vector2(-9999f, -9999f);
    return new Vector2(W * 0.5f + f * c.x / c.z, H * 0.5f - f * c.y / c.z);
};
System.Func<Vector2, string> S = (Vector2 v) => "(" + v.x.ToString("0") + "," + v.y.ToString("0") + ")";
sb.AppendLine("cam " + cam.transform.position.ToString("F2") + " eul " + cam.transform.eulerAngles.ToString("F2") + " f " + f.ToString("0"));
// 1) per s: wall base, wall at 0.5 / 1.0 m, foam waterline, foam outer end
foreach (float s in new float[] { 16f, 18f, 20f, 22f, 24f, 26f, 28f, 30f, 33f, 36f, 40f, 44f, 50f, 60f, 75f })
{
    float ch = Rainbow.Screen05.DrumLayout05.WaterChord(s);
    float cy = Rainbow.Screen05.DrumLayout05.CentreY(s);
    float R = Rainbow.Screen05.DrumLayout05.Radius;
    System.Func<float, float> wallXAt = (float y) => Mathf.Sqrt(Mathf.Max(0f, R * R - (y - cy) * (y - cy)));
    float wl = Rainbow.Screen05.FoamBank.WaterlineX(s, -1), wr = Rainbow.Screen05.FoamBank.WaterlineX(s, 1);
    float d = Rainbow.Screen05.RiverPath.Meander(s);
    sb.AppendLine("s " + s.ToString("0") + " chord " + ch.ToString("0.00") + " d " + d.ToString("0.00")
        + " | wallL y0 " + S(P(new Vector3(-ch, 0f, s))) + " y.5 " + S(P(new Vector3(-wallXAt(0.5f), 0.5f, s))) + " y1 " + S(P(new Vector3(-wallXAt(1f), 1f, s)))
        + " | wlL x " + wl.ToString("0.00") + " " + S(P(new Vector3(wl, 0f, s)))
        + " | wlR x " + wr.ToString("0.00") + " " + S(P(new Vector3(wr, 0f, s)))
        + " | wallR y0 " + S(P(new Vector3(ch, 0f, s))) + " y.5 " + S(P(new Vector3(wallXAt(0.5f), 0.5f, s))) + " y1 " + S(P(new Vector3(wallXAt(1f), 1f, s))));
}
// 2) rows: ray -> water plane (x, s)
foreach (float y in new float[] { 540f, 560f, 600f, 650f, 700f, 760f, 800f, 900f, 1000f })
{
    string line = "row " + y + ":";
    foreach (float x in new float[] { 0f, 100f, 200f, 300f, 400f, 600f, 700f, 800f, 864f })
    {
        Vector3 dirC = new Vector3((x - W * 0.5f) / f, -(y - H * 0.5f) / f, 1f);
        Vector3 dir = c2w.MultiplyVector(dirC);
        Vector3 o = cam.transform.position;
        if (dir.y >= -1e-4f) { line += " x" + x + " sky"; continue; }
        float t = -o.y / dir.y;
        Vector3 hit = o + dir * t;
        line += " x" + x + "->(" + hit.x.ToString("0.0") + "," + hit.z.ToString("0.0") + ")";
    }
    sb.AppendLine(line);
}
// 3) foam puffs: bounding box on screen per side and the highest puffs
var puffs = Rainbow.Screen05.FoamBank.GeneratePuffs();
int nL = 0, nR = 0; float maxYL = 0f, maxYR = 0f;
foreach (var p in puffs)
{
    if (p.centre.z < 15f || p.centre.z > 60f) continue;
    if (p.side < 0) { nL++; maxYL = Mathf.Max(maxYL, p.centre.y + p.radius); } else { nR++; maxYR = Mathf.Max(maxYR, p.centre.y + p.radius); }
}
sb.AppendLine("puffs total " + puffs.Count + " | s15-60 L " + nL + " (top " + maxYL.ToString("0.00") + ") R " + nR + " (top " + maxYR.ToString("0.00") + ")");
// foam width at several s
foreach (float s in new float[] { 18f, 22f, 26f, 30f, 35f, 40f, 45f, 50f })
{
    float ch = Rainbow.Screen05.DrumLayout05.WaterChord(s);
    float wl = Rainbow.Screen05.FoamBank.WaterlineX(s, -1), wr = Rainbow.Screen05.FoamBank.WaterlineX(s, 1);
    sb.AppendLine("s " + s + " foam L width " + (wl + ch).ToString("0.00") + " R width " + (ch - wr).ToString("0.00") + " open " + (wr - wl).ToString("0.00"));
}
// scene objects that could cover the lower wall
var root = UnityEngine.GameObject.Find("Environment05");
if (root != null) foreach (Transform t in root.transform) sb.AppendLine("env child " + t.name + " active " + t.gameObject.activeInHierarchy);
return sb.ToString();

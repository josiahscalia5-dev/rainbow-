// TUNNEL lane (round 4, 2026-11-24), run with -EvalAtHold while paused at the hold (s = 14):
// 1) PROBE (read-only): projects the paddles (built pose + candidate poses), the near-frame corner inner edges and the
//    ring crowns with the gameplay camera at 864x1536.
// 2) VARIANTS: Recordings/Screen05/work/tunnel_variants.txt, lines "name|target|prop|x,y,z,w[|color|float]",
//    target = wall | ring | pad | frame | throat | padpose (prop ignored; x = tilt deg, y = mount height offset m, every
//    paddle) | padposeL / padposeR (one side only). Several lines with the same name combine into one variant.
//    One 864x1536 still per variant -> Recordings/Screen05/work/tunnel_var_<tag>_<name>.png, then EVERYTHING is restored
//    so the cycle's own still shows exactly the builder state. Exploration only: winning values go into the builders.
// Tag: Recordings/Screen05/work/tunnel_tag.txt (one word).
var log = new System.Text.StringBuilder();
var cam = Camera.main;
if (cam == null) return "no camera";
float W = 864f, H = 1536f;
float fpx = (H * 0.5f) / Mathf.Tan(cam.fieldOfView * 0.5f * Mathf.Deg2Rad);
Matrix4x4 w2c = cam.transform.worldToLocalMatrix;
System.Func<Vector3, Vector2> Proj = wp =>
{
    Vector3 c = w2c.MultiplyPoint(wp);
    if (c.z <= 0.01f) return new Vector2(float.NaN, float.NaN);
    return new Vector2(W * 0.5f + fpx * c.x / c.z, H * 0.5f - fpx * c.y / c.z);
};
string F0(float v) => v.ToString("0", System.Globalization.CultureInfo.InvariantCulture);
log.AppendLine("cam " + cam.transform.position.ToString("F2") + " fov " + cam.fieldOfView.ToString("0.0") + " f " + F0(fpx));

var root = GameObject.Find("Environment05");
if (root == null) return "no Environment05";
var padsT = root.transform.Find("Paddles");
var slots = Rainbow.Screen05.DrumLayout05.PaddleSlots();
System.Func<Transform, Rainbow.Screen05.DrumLayout05.PaddleSlot?> SlotOf = t =>
{
    foreach (var ps in slots)
    {
        string nm = (ps.side < 0 ? "Paddle_L_" : "Paddle_R_") + ps.s.ToString("0.0", System.Globalization.CultureInfo.InvariantCulture);
        if (nm == t.name) return ps;
    }
    return null;
};
string BBox(Mesh m, Matrix4x4 l2w)
{
    float x0 = 1e9f, y0 = 1e9f, x1 = -1e9f, y1 = -1e9f;
    foreach (var v in m.vertices)
    {
        Vector2 p = Proj(l2w.MultiplyPoint(v));
        if (float.IsNaN(p.x)) continue;
        x0 = Mathf.Min(x0, p.x); x1 = Mathf.Max(x1, p.x); y0 = Mathf.Min(y0, p.y); y1 = Mathf.Max(y1, p.y);
    }
    return "x " + F0(x0) + "-" + F0(x1) + " y " + F0(y0) + "-" + F0(y1) + " c (" + F0((x0 + x1) * 0.5f) + "," + F0((y0 + y1) * 0.5f) + ")";
}
var padT = new System.Collections.Generic.List<Transform>();
var padQ = new System.Collections.Generic.List<Quaternion>();
var padP = new System.Collections.Generic.List<Vector3>();
if (padsT != null)
{
    foreach (Transform t in padsT)
    {
        padT.Add(t); padQ.Add(t.localRotation); padP.Add(t.localPosition);
        var mf = t.GetComponent<MeshFilter>();
        if (mf == null || mf.sharedMesh == null) continue;
        log.AppendLine("paddle " + t.name + " built " + BBox(mf.sharedMesh, t.localToWorldMatrix));
        var slot = SlotOf(t);
        if (slot == null || slot.Value.s > 90f) continue;
        Matrix4x4 parent = t.parent.localToWorldMatrix;
        foreach (float tilt in new float[] { 10f, 18f, 26f })
            foreach (float dy in new float[] { -0.8f, -0.4f, 0f })
            {
                Quaternion q = Rainbow.Screen05.EditorTools.EnvironmentBuilder.PaddleRotation(slot.Value, tilt, dy, out Vector3 p);
                log.AppendLine("   tilt " + F0(tilt) + " dy " + dy.ToString("0.0") + " : " + BBox(mf.sharedMesh, parent * Matrix4x4.TRS(p, q, Vector3.one)));
            }
    }
}
// near frame corners: inner edge (uv.y == 0) at u = 0, .25, .5, .75, 1
var frame = root.transform.Find("NearFrame05");
if (frame != null)
{
    foreach (Transform t in frame)
    {
        var mf = t.GetComponent<MeshFilter>();
        if (mf == null || mf.sharedMesh == null) continue;
        var m = mf.sharedMesh; var vs = m.vertices; var uvs = m.uv;
        var sb = new System.Text.StringBuilder(t.name + " inner edge:");
        for (int i = 0; i < vs.Length; i++)
        {
            if (uvs[i].y > 1e-4f) continue;
            float u = uvs[i].x;
            if (Mathf.Abs(u * 4f - Mathf.Round(u * 4f)) > 0.02f) continue;
            Vector2 p = Proj(t.localToWorldMatrix.MultiplyPoint(vs[i]));
            sb.Append(" u" + u.ToString("0.00") + "(" + F0(p.x) + "," + F0(p.y) + ")");
        }
        log.AppendLine(sb.ToString());
    }
}
// ring crowns: band inner crest and wall at 12 o'clock, inner crest at 9 o'clock
var ringsT = root.transform.Find("Rings");
if (ringsT != null)
{
    float R = Rainbow.Screen05.DrumLayout05.Radius - Rainbow.Screen05.DrumLayout05.RingInset;
    foreach (Transform t in ringsT)
    {
        Vector3 c = t.position;
        var band = Rainbow.Screen05.DrumLayout05.BandFor(c.z);
        float rin = R * (1f - band.height);
        Vector2 top = Proj(c + Vector3.up * rin), wall = Proj(c + Vector3.up * R), left = Proj(c + Vector3.left * rin), right = Proj(c + Vector3.right * rin);
        log.AppendLine("ring s " + c.z.ToString("0.0") + " crown y " + F0(wall.y) + "-" + F0(top.y) + " left x " + F0(left.x) + " right x " + F0(right.x));
    }
}

// ---------------- variants ----------------
Material Mat(string p) { var m = AssetDatabase.LoadAssetAtPath<Material>(p); if (m == null) log.AppendLine("missing " + p); return m; }
var wall = Mat("Assets/Rainbow/Environment/Materials/DrumWall05.mat");
var ringN = Mat("Assets/Rainbow/Environment/Materials/Ring05_Near.mat");
var ringF = Mat("Assets/Rainbow/Environment/Materials/Ring05_Far.mat");
var pad = Mat("Assets/Rainbow/Environment/Materials/Paddle05.mat");
var frm = Mat("Assets/Rainbow/Environment/Materials/NearFrame05.mat");
var thr = Mat("Assets/Rainbow/Environment/Materials/Throat05.mat");
if (wall == null || ringN == null || ringF == null || pad == null || frm == null || thr == null) return log.ToString();
var mats = new Material[] { wall, ringN, ringF, pad, frm, thr };
var orig = new Material[mats.Length];
for (int i = 0; i < mats.Length; i++) orig[i] = new Material(mats[i]);
void Restore()
{
    for (int i = 0; i < mats.Length; i++) mats[i].CopyPropertiesFromMaterial(orig[i]);
    for (int i = 0; i < padT.Count; i++) { padT[i].localRotation = padQ[i]; padT[i].localPosition = padP[i]; }
}
void Pose(float tilt, float dy, int sideOnly)
{
    for (int i = 0; i < padT.Count; i++)
    {
        var slot = SlotOf(padT[i]);
        if (slot == null) continue;
        if (sideOnly != 0 && slot.Value.side != sideOnly) continue;
        Quaternion q = Rainbow.Screen05.EditorTools.EnvironmentBuilder.PaddleRotation(slot.Value, tilt, dy, out Vector3 p);
        padT[i].localPosition = p; padT[i].localRotation = q;
    }
}
string tag = System.IO.File.Exists("Recordings/Screen05/work/tunnel_tag.txt") ? System.IO.File.ReadAllText("Recordings/Screen05/work/tunnel_tag.txt").Trim() : "x";
void Shot(string name) { log.AppendLine(name + " -> " + Rainbow.Screen05.EditorTools.Screen05Capture.CaptureStill("Recordings/Screen05/work/tunnel_var_" + tag + "_" + name + ".png", 864, 1536)); }
var lines = System.IO.File.Exists("Recordings/Screen05/work/tunnel_variants.txt") ? System.IO.File.ReadAllLines("Recordings/Screen05/work/tunnel_variants.txt") : new string[0];
var order = new System.Collections.Generic.List<string>();
foreach (var l in lines) { var p = l.Split('|'); if (p.Length >= 4 && !l.TrimStart().StartsWith("#") && !order.Contains(p[0])) order.Add(p[0]); }
foreach (var name in order)
{
    Restore();
    foreach (var l in lines)
    {
        var p = l.Split('|'); if (p.Length < 4 || p[0] != name || l.TrimStart().StartsWith("#")) continue;
        var v = p[3].Split(','); var f = new float[4];
        for (int i = 0; i < 4; i++) f[i] = i < v.Length ? float.Parse(v[i], System.Globalization.CultureInfo.InvariantCulture) : 0f;
        if (p[1] == "padpose") { Pose(f[0], f[1], 0); continue; }
        if (p[1] == "padposeL") { Pose(f[0], f[1], -1); continue; }
        if (p[1] == "padposeR") { Pose(f[0], f[1], 1); continue; }
        System.Action<Material> set = m =>
        {
            if (!m.HasProperty(p[2])) { log.AppendLine("no prop " + p[2] + " on " + m.name); return; }
            if (p.Length > 4 && p[4] == "color") m.SetColor(p[2], new Color(f[0], f[1], f[2], f[3]));
            else if (p.Length > 4 && p[4] == "float") m.SetFloat(p[2], f[0]);
            else m.SetVector(p[2], new Vector4(f[0], f[1], f[2], f[3]));
        };
        if (p[1] == "wall") set(wall);
        else if (p[1] == "ring") { set(ringN); set(ringF); }
        else if (p[1] == "pad") set(pad);
        else if (p[1] == "frame") set(frm);
        else if (p[1] == "throat") set(thr);
        else log.AppendLine("unknown target " + p[1]);
    }
    Shot(name);
}
Restore();
log.AppendLine("variants " + order.Count + ", paddles " + padT.Count + "; restored");
return log.ToString();

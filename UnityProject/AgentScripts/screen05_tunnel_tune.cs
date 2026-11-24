// TUNNEL lane (round 3v) live look exploration while paused at the hold (s = 14): tries material variants on the wall /
// ring / paddle materials, captures one 864x1536 still per variant into Recordings/Screen05/work/tunnel_var_<tag>_<name>.png,
// then RESTORES the built values so the cycle's own still shows exactly the builder state. Exploration only: winning
// values are copied into EnvironmentBuilder.cs afterwards.
var log = new System.Text.StringBuilder();
Material Mat(string p) { var m = AssetDatabase.LoadAssetAtPath<Material>(p); if (m == null) log.AppendLine("missing " + p); return m; }
var wall = Mat("Assets/Rainbow/Environment/Materials/DrumWall05.mat");
var ringN = Mat("Assets/Rainbow/Environment/Materials/Ring05_Near.mat");
var ringF = Mat("Assets/Rainbow/Environment/Materials/Ring05_Far.mat");
var pad = Mat("Assets/Rainbow/Environment/Materials/Paddle05.mat");
if (wall == null || ringN == null || ringF == null || pad == null) return log.ToString();
var wallOrig = new Material(wall); var ringNOrig = new Material(ringN); var ringFOrig = new Material(ringF); var padOrig = new Material(pad);
string tag = System.IO.File.Exists("Recordings/Screen05/work/tunnel_tag.txt") ? System.IO.File.ReadAllText("Recordings/Screen05/work/tunnel_tag.txt").Trim() : "x";
void Restore() { wall.CopyPropertiesFromMaterial(wallOrig); ringN.CopyPropertiesFromMaterial(ringNOrig); ringF.CopyPropertiesFromMaterial(ringFOrig); pad.CopyPropertiesFromMaterial(padOrig); }
void Shot(string name) { log.AppendLine(name + " -> " + Rainbow.Screen05.EditorTools.Screen05Capture.CaptureStill("Recordings/Screen05/work/tunnel_var_" + tag + "_" + name + ".png", 864, 1536)); }
void Ring(System.Action<Material> a) { a(ringN); a(ringF); }

// variant list: read from tunnel_variants.txt lines "name|target|prop|x,y,z,w" (target wall / ring / pad; several lines per name)
var lines = System.IO.File.Exists("Recordings/Screen05/work/tunnel_variants.txt") ? System.IO.File.ReadAllLines("Recordings/Screen05/work/tunnel_variants.txt") : new string[0];
var order = new System.Collections.Generic.List<string>();
foreach (var l in lines) { var p = l.Split('|'); if (p.Length >= 4 && !order.Contains(p[0])) order.Add(p[0]); }
foreach (var name in order)
{
    Restore();
    foreach (var l in lines)
    {
        var p = l.Split('|'); if (p.Length < 4 || p[0] != name) continue;
        var v = p[3].Split(','); var f = new float[4];
        for (int i = 0; i < 4; i++) f[i] = i < v.Length ? float.Parse(v[i], System.Globalization.CultureInfo.InvariantCulture) : 0f;
        System.Action<Material> set = m =>
        {
            if (!m.HasProperty(p[2])) { log.AppendLine("no prop " + p[2] + " on " + m.name); return; }
            if (p.Length > 4 && p[4] == "color") m.SetColor(p[2], new Color(f[0], f[1], f[2], f[3]));
            else if (p.Length > 4 && p[4] == "float") m.SetFloat(p[2], f[0]);
            else m.SetVector(p[2], new Vector4(f[0], f[1], f[2], f[3]));
        };
        if (p[1] == "wall") set(wall); else if (p[1] == "ring") Ring(set); else if (p[1] == "pad") set(pad);
    }
    Shot(name);
}
Restore();
// paddle / ring projections with the real camera (read-only)
var cam = Camera.main;
float W = 864f, H = 1536f, fpx = (H * 0.5f) / Mathf.Tan(cam.fieldOfView * 0.5f * Mathf.Deg2Rad);
Matrix4x4 w2c = cam.transform.worldToLocalMatrix;
System.Func<Vector3, string> P = (Vector3 wp) => { Vector3 c = w2c.MultiplyPoint(wp); if (c.z <= 0.01f) return "behind"; return "(" + (W * 0.5f + fpx * c.x / c.z).ToString("0") + "," + (H * 0.5f - fpx * c.y / c.z).ToString("0") + ")"; };
var root = GameObject.Find("Environment05");
if (root != null)
{
    var pads = root.transform.Find("Paddles");
    if (pads != null) foreach (Transform t in pads)
    {
        var mf = t.GetComponent<MeshFilter>(); var b = mf.sharedMesh.bounds;
        float x0 = 9999, x1 = -9999, y0 = 9999, y1 = -9999;
        foreach (var vv in mf.sharedMesh.vertices) { Vector3 c = w2c.MultiplyPoint(t.TransformPoint(vv)); if (c.z <= 0.01f) continue; float sx = W * 0.5f + fpx * c.x / c.z, sy = H * 0.5f - fpx * c.y / c.z; x0 = Mathf.Min(x0, sx); x1 = Mathf.Max(x1, sx); y0 = Mathf.Min(y0, sy); y1 = Mathf.Max(y1, sy); }
        log.AppendLine("paddle " + t.name + " screen box x " + x0.ToString("0") + ".." + x1.ToString("0") + " y " + y0.ToString("0") + ".." + y1.ToString("0"));
    }
}
log.AppendLine("cam " + cam.transform.position.ToString("F2") + " " + cam.transform.eulerAngles.ToString("F2"));
return log.ToString();

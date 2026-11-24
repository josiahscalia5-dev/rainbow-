// COORDINATOR (round 3, 2026-11-23) live look exploration while paused at the hold (s = 14), generalising
// screen05_tunnel_tune.cs: tries variants on the wall / ring / paddle / river / foam materials and the paddle dish tilt,
// captures one 864x1536 still per variant into Recordings/Screen05/work/coord_var_<tag>_<name>.png, then RESTORES every
// value so the cycle's own still shows exactly the builder state. Exploration only: winning values go into the builders.
// Variants: Recordings/Screen05/work/coord_variants.txt, lines "name|target|prop|x,y,z,w[|color|float]"
//   target = wall | ring | pad | river | foam | padtilt (prop ignored, x = dish tilt in degrees; built tilt =
//   EnvironmentBuilder.PaddleFaceTiltDeg). Several lines with the same name combine into one variant.
// Tag: Recordings/Screen05/work/coord_tag.txt (one word).
var log = new System.Text.StringBuilder();
Material Mat(string p) { var m = AssetDatabase.LoadAssetAtPath<Material>(p); if (m == null) log.AppendLine("missing " + p); return m; }
var wall = Mat("Assets/Rainbow/Environment/Materials/DrumWall05.mat");
var ringN = Mat("Assets/Rainbow/Environment/Materials/Ring05_Near.mat");
var ringF = Mat("Assets/Rainbow/Environment/Materials/Ring05_Far.mat");
var pad = Mat("Assets/Rainbow/Environment/Materials/Paddle05.mat");
var river = Mat("Assets/Rainbow/Water/Materials/RainbowRiver05.mat");
var foam = Mat("Assets/Rainbow/Water/Materials/RainbowFoam05.mat");
if (wall == null || ringN == null || ringF == null || pad == null || river == null || foam == null) return log.ToString();
var mats = new Material[] { wall, ringN, ringF, pad, river, foam };
var orig = new Material[mats.Length];
for (int i = 0; i < mats.Length; i++) orig[i] = new Material(mats[i]);

// paddles: remember the built rotations; re-tilt the dish round the tray's inward axis like EnvironmentBuilder does
var padT = new System.Collections.Generic.List<Transform>();
var padQ = new System.Collections.Generic.List<Quaternion>();
var root = GameObject.Find("Environment05");
var pads = root != null ? root.transform.Find("Paddles") : null;
if (pads != null) foreach (Transform t in pads) { padT.Add(t); padQ.Add(t.localRotation); }
float builtTilt = Rainbow.Screen05.EditorTools.EnvironmentBuilder.PaddleFaceTiltDeg * Mathf.Deg2Rad;
void Tilt(float deg)
{
    float nt = deg * Mathf.Deg2Rad;
    for (int i = 0; i < padT.Count; i++)
    {
        Quaternion q = padQ[i];
        Vector3 tx = q * Vector3.right, ty2 = q * Vector3.up, fw = Vector3.forward;
        Vector3 ty = ((ty2 - fw * Mathf.Sin(builtTilt)) / Mathf.Max(Mathf.Cos(builtTilt), 1e-3f)).normalized;
        Vector3 ty3 = (ty * Mathf.Cos(nt) + fw * Mathf.Sin(nt)).normalized;
        padT[i].localRotation = Quaternion.LookRotation(Vector3.Cross(tx, ty3).normalized, ty3);
    }
}
void Restore()
{
    for (int i = 0; i < mats.Length; i++) mats[i].CopyPropertiesFromMaterial(orig[i]);
    for (int i = 0; i < padT.Count; i++) padT[i].localRotation = padQ[i];
}
string tag = System.IO.File.Exists("Recordings/Screen05/work/coord_tag.txt") ? System.IO.File.ReadAllText("Recordings/Screen05/work/coord_tag.txt").Trim() : "x";
void Shot(string name) { log.AppendLine(name + " -> " + Rainbow.Screen05.EditorTools.Screen05Capture.CaptureStill("Recordings/Screen05/work/coord_var_" + tag + "_" + name + ".png", 864, 1536)); }

var lines = System.IO.File.Exists("Recordings/Screen05/work/coord_variants.txt") ? System.IO.File.ReadAllLines("Recordings/Screen05/work/coord_variants.txt") : new string[0];
var order = new System.Collections.Generic.List<string>();
foreach (var l in lines) { var p = l.Split('|'); if (p.Length >= 4 && !l.TrimStart().StartsWith("#") && !order.Contains(p[0])) order.Add(p[0]); }
foreach (var name in order)
{
    Restore();
    foreach (var l in lines)
    {
        var p = l.Split('|'); if (p.Length < 4 || p[0] != name) continue;
        var v = p[3].Split(','); var f = new float[4];
        for (int i = 0; i < 4; i++) f[i] = i < v.Length ? float.Parse(v[i], System.Globalization.CultureInfo.InvariantCulture) : 0f;
        if (p[1] == "padtilt") { Tilt(f[0]); continue; }
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
        else if (p[1] == "river") set(river);
        else if (p[1] == "foam") set(foam);
        else log.AppendLine("unknown target " + p[1]);
    }
    Shot(name);
}
Restore();
log.AppendLine("paddles " + padT.Count + ", built tilt " + (builtTilt * Mathf.Rad2Deg).ToString("0") + " deg; restored");
return log.ToString();

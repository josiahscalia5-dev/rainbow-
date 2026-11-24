// SPLASH6 lane copy of screen05_river_tune.cs (own variant / tag files, s6var_ stills, extra target fluff = Benny_Fluff.mat)
// WATER4 lane (round 4, 2026-11-24) live look exploration while paused at the hold (s = 14), a copy of
// screen05_coord_tune.cs with the water lane's own targets and files (so it never shares variant files with another lane):
// tries variants on the river / splash / spray materials and on shader globals, captures one 864x1536 still per variant
// into Recordings/Screen05/work/w4var_<tag>_<name>.png, then RESTORES every value (globals back to 0) so the cycle's own
// still shows exactly the builder state. Exploration only: winning values go into the builders / shaders.
// Variants: Recordings/Screen05/work/splash6_variants.txt, lines "name|target|prop|x,y,z,w[|float]"
//   target = river | splash | spray | global (Shader.SetGlobalVector(prop, v); _W4Tune of RainbowRiver.hlsl).
//   Several lines with the same name combine into one variant. Tag: Recordings/Screen05/work/splash6_tag.txt (one word).
var log = new System.Text.StringBuilder();
Material Mat(string p) { var m = AssetDatabase.LoadAssetAtPath<Material>(p); if (m == null) log.AppendLine("missing " + p); return m; }
var river = Mat("Assets/Rainbow/Water/Materials/RainbowRiver05.mat");
var splash = Mat("Assets/Rainbow/Water/Resources/RainbowSplash05.mat");
var spray = Mat("Assets/Rainbow/Water/Resources/RainbowSpray05.mat");
if (river == null || splash == null || spray == null) return log.ToString();
var glints = Mat("Assets/Rainbow/Water/Materials/RainbowRiverGlints05.mat");
var fluff = Mat("Assets/Rainbow/Benny/Materials/Benny_Fluff.mat");
var wakeFoamMat = Mat("Assets/Rainbow/Water/Resources/RainbowWakeFoam05.mat");
var passMats = new Material[] { wakeFoamMat, spray, splash };
var mats = new Material[] { river, splash, spray, glints, fluff };
var orig = new Material[mats.Length];
for (int i = 0; i < mats.Length; i++) orig[i] = new Material(mats[i]);
var globals = new System.Collections.Generic.List<string>();
void Restore()
{
    for (int i = 0; i < mats.Length; i++) mats[i].CopyPropertiesFromMaterial(orig[i]);
    foreach (var g in globals) Shader.SetGlobalVector(g, Vector4.zero);
    foreach (var pm in passMats) if (pm != null) pm.SetShaderPassEnabled("UniversalForward", true);
}
string tag = System.IO.File.Exists("Recordings/Screen05/work/splash6_tag.txt") ? System.IO.File.ReadAllText("Recordings/Screen05/work/splash6_tag.txt").Trim() : "x";
void Shot(string name) { log.AppendLine(name + " -> " + Rainbow.Screen05.EditorTools.Screen05Capture.CaptureStill("Recordings/Screen05/work/s6var_" + tag + "_" + name + ".png", 864, 1536)); }

var lines = System.IO.File.Exists("Recordings/Screen05/work/splash6_variants.txt") ? System.IO.File.ReadAllLines("Recordings/Screen05/work/splash6_variants.txt") : new string[0];
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
        if (p[1] == "passoff") { var pm = p[2] == "wakefoam" ? wakeFoamMat : p[2] == "spray" ? spray : p[2] == "splash" ? splash : null; if (pm != null) pm.SetShaderPassEnabled("UniversalForward", false); continue; }
        if (p[1] == "global") { if (!globals.Contains(p[2])) globals.Add(p[2]); Shader.SetGlobalVector(p[2], new Vector4(f[0], f[1], f[2], f[3])); continue; }
        Material m = p[1] == "river" ? river : p[1] == "splash" ? splash : p[1] == "spray" ? spray : p[1] == "glints" ? glints : p[1] == "fluff" ? fluff : null;
        if (m == null) { log.AppendLine("unknown target " + p[1]); continue; }
        if (!m.HasProperty(p[2])) { log.AppendLine("no prop " + p[2] + " on " + m.name); continue; }
        if (p.Length > 4 && p[4] == "float") m.SetFloat(p[2], f[0]);
        else m.SetVector(p[2], new Vector4(f[0], f[1], f[2], f[3]));
    }
    Shot(name);
}
Restore();
log.AppendLine("restored (" + order.Count + " variants, globals " + string.Join(",", globals) + ")");
return log.ToString();



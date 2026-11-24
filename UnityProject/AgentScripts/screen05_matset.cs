// Live material tuning at the hold (use with screen05-quick.ps1 -NoRebuild -EvalAtHold AgentScripts/screen05_matset.cs).
// Recordings/Screen05/work/matset.txt, one line per value: short material name or asset path | property | x[,y,z,w]
// Values stay on the material asset until the next rebuild (the builder writes its own values again), so copy the winners into the builder / tuning file.
var ci = System.Globalization.CultureInfo.InvariantCulture;
var shortNames = new System.Collections.Generic.Dictionary<string, string>
{
    { "river", "Assets/Rainbow/Water/Materials/RainbowRiver05.mat" },
    { "glints", "Assets/Rainbow/Water/Materials/RainbowRiverGlints05.mat" },
    { "lace", "Assets/Rainbow/Water/Resources/RainbowSplashLace05.mat" },
    { "foam", "Assets/Rainbow/Water/Materials/RainbowFoam05.mat" },
    { "wakefoam", "Assets/Rainbow/Water/Resources/RainbowWakeFoam05.mat" },
    { "wall", "Assets/Rainbow/Environment/Materials/DrumWall05.mat" },
    { "frame", "Assets/Rainbow/Environment/Materials/NearFrame05.mat" },
    { "fluff", "Assets/Rainbow/Benny/Materials/Benny_Fluff.mat" },
};
var sb = new System.Text.StringBuilder();
foreach (var line in System.IO.File.ReadAllLines("Recordings/Screen05/work/matset.txt"))
{
    if (line.Trim().Length == 0 || line.StartsWith("#")) continue;
    var p = line.Split('|');
    string path = shortNames.ContainsKey(p[0].Trim()) ? shortNames[p[0].Trim()] : p[0].Trim();
    var m = AssetDatabase.LoadAssetAtPath<Material>(path);
    if (m == null) { sb.AppendLine("missing " + path); continue; }
    string prop = p[1].Trim();
    if (!m.HasProperty(prop)) { sb.AppendLine("no property " + prop + " on " + path); continue; }
    var v = p[2].Split(',');
    if (v.Length == 1) m.SetFloat(prop, float.Parse(v[0], ci));
    else
    {
        Vector4 o = m.GetVector(prop);
        for (int i = 0; i < v.Length && i < 4; i++) if (v[i].Trim() != "-") o[i] = float.Parse(v[i], ci);
        m.SetVector(prop, o);
    }
}
return "matset ok " + sb.ToString();

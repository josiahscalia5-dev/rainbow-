// READ-ONLY. Lists the Screen 05 environment / water / Benny materials with their shader and exposed float, colour and vector values.
// unity command script eval --project-path C:\RainbowUnity\UnityProject -- --file AgentScripts/screen05_dump_materials.cs
var sb = new System.Text.StringBuilder();
foreach (var folder in new[] { "Assets/Rainbow/Environment/Materials", "Assets/Rainbow/Water/Materials", "Assets/Rainbow/Benny/Materials" })
{
    if (!AssetDatabase.IsValidFolder(folder)) { sb.AppendLine(folder + ": (none)"); continue; }
    foreach (var guid in AssetDatabase.FindAssets("t:Material", new[] { folder }))
    {
        var path = AssetDatabase.GUIDToAssetPath(guid);
        var m = AssetDatabase.LoadAssetAtPath<Material>(path);
        if (m == null) continue;
        sb.AppendLine("== " + path + "  [" + (m.shader != null ? m.shader.name : "no shader") + "]  keywords: " + string.Join(",", m.shaderKeywords));
        var sh = m.shader;
        for (int i = 0; i < sh.GetPropertyCount(); i++)
        {
            var n = sh.GetPropertyName(i);
            var t = sh.GetPropertyType(i);
            string v = "";
            if (t == UnityEngine.Rendering.ShaderPropertyType.Float || t == UnityEngine.Rendering.ShaderPropertyType.Range) v = m.GetFloat(n).ToString("0.###");
            else if (t == UnityEngine.Rendering.ShaderPropertyType.Color) { var c = m.GetColor(n); v = "(" + c.r.ToString("0.###") + "," + c.g.ToString("0.###") + "," + c.b.ToString("0.###") + "," + c.a.ToString("0.##") + ")"; }
            else if (t == UnityEngine.Rendering.ShaderPropertyType.Vector) { var c = m.GetVector(n); v = "(" + c.x.ToString("0.###") + "," + c.y.ToString("0.###") + "," + c.z.ToString("0.###") + "," + c.w.ToString("0.###") + ")"; }
            else if (t == UnityEngine.Rendering.ShaderPropertyType.Texture) { var tx = m.GetTexture(n); v = tx != null ? tx.name : "-"; }
            else if (t == UnityEngine.Rendering.ShaderPropertyType.Int) v = m.GetInteger(n).ToString();
            sb.Append("   " + n + "=" + v);
        }
        sb.AppendLine();
    }
}
return sb.ToString();

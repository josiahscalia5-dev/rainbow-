// Coordinator look-tuning pass (walls, gold, Benny's fur, SSAO). Sets material values live (no recompile), then takes an
// 864x1536 still of the current Game camera. The values that work are then copied into the builders so a rebuild keeps them.
// unity command script eval --project-path C:\RainbowUnity\UnityProject -- --file AgentScripts/screen05_tune_look.cs
var log = new System.Text.StringBuilder();
Material Mat(string p) { var m = AssetDatabase.LoadAssetAtPath<Material>(p); if (m == null) log.AppendLine("missing " + p); return m; }

// --- drum wall: dense small slots elongated along the tunnel (s), softer pink streaks, more violet ---
var wall = Mat("Assets/Rainbow/Environment/Materials/DrumWall05.mat");
if (wall != null)
{
    wall.SetVector("_SlotPitch", new Vector4(0.50f, 0.70f, 0f, 0f));         // arc pitch, s pitch (m)
    wall.SetVector("_SlotSize", new Vector4(0.19f, 0.08f, 0.158f, 1.0f));   // half along arc, half along s, mean coverage, lip glow
    wall.SetColor("_BaseColor", new Color(0.80f, 0.60f, 0.98f, 1f));        // a touch more violet
    wall.SetFloat("_StripIntensity", 2.8f);
    wall.SetColor("_StripColor", new Color(1f, 0.70f, 0.97f, 1f));
    wall.SetVector("_MidRange", new Vector4(8f, 50f, 0.6f, 0f));
    wall.SetFloat("_EnvIntensity", 0.9f);
    EditorUtility.SetDirty(wall);
}
// --- gold rings / paddles / frame: less white reflection so the orange palette shows ---
foreach (var p in new[] { "Ring05_Near", "Ring05_Far", "Paddle05", "NearFrame05" })
{
    var g = Mat("Assets/Rainbow/Environment/Materials/" + p + ".mat");
    if (g == null) continue;
    g.SetFloat("_EnvIntensity", p == "Paddle05" ? 0.7f : 0.5f);
    g.SetFloat("_StripIntensity", p == "Paddle05" ? 1.2f : 1.4f);
    g.SetFloat("_Exposure", 0.82f);
    EditorUtility.SetDirty(g);
}
// --- Benny: less white fuzz rim (it blooms into a white halo), keep the hot pink ---
var fluff = Mat("Assets/Rainbow/Benny/Materials/Benny_Fluff.mat");
if (fluff != null)
{
    fluff.SetFloat("_FuzzStrength", 0.15f);
    fluff.SetColor("_FuzzColor", new Color(1f, 0.62f, 0.86f, 1f));
    EditorUtility.SetDirty(fluff);
}
// --- SSAO off (not in the original game; 4 extra passes + a depth-normals prepass on this laptop) ---
foreach (var guid in AssetDatabase.FindAssets("t:UniversalRendererData"))
{
    var rd = AssetDatabase.LoadAssetAtPath<UnityEngine.Rendering.Universal.UniversalRendererData>(AssetDatabase.GUIDToAssetPath(guid));
    foreach (var f in rd.rendererFeatures)
        if (f != null && f.GetType().Name.Contains("AmbientOcclusion") && f.isActive) { f.SetActive(false); EditorUtility.SetDirty(rd); log.AppendLine("SSAO off in " + rd.name); }
}
AssetDatabase.SaveAssets();
log.AppendLine(Rainbow.Screen05.EditorTools.Screen05Capture.CaptureStill(null, 864, 1536));
return log.ToString();

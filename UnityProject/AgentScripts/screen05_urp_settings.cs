// Turns on HDR and the camera Depth Texture on every URP asset in the project (needed for the water's bloom threshold > 1
// and the soft edges of bubbles / spray). Reports the values before and after.
// unity command script eval --project-path C:\RainbowUnity\UnityProject -- --file AgentScripts/screen05_urp_settings.cs
var sb = new System.Text.StringBuilder();
sb.AppendLine("default RP: " + (UnityEngine.Rendering.GraphicsSettings.defaultRenderPipeline != null ? UnityEngine.Rendering.GraphicsSettings.defaultRenderPipeline.name : "none")
    + " | quality '" + QualitySettings.names[QualitySettings.GetQualityLevel()] + "' RP: " + (QualitySettings.renderPipeline != null ? QualitySettings.renderPipeline.name : "none"));
foreach (var guid in AssetDatabase.FindAssets("t:UniversalRenderPipelineAsset"))
{
    var path = AssetDatabase.GUIDToAssetPath(guid);
    var a = AssetDatabase.LoadAssetAtPath<UnityEngine.Rendering.Universal.UniversalRenderPipelineAsset>(path);
    if (a == null) continue;
    sb.Append(path + ": HDR " + a.supportsHDR + " depthTex " + a.supportsCameraDepthTexture + " opaqueTex " + a.supportsCameraOpaqueTexture + " msaa " + a.msaaSampleCount + " renderScale " + a.renderScale);
    a.supportsHDR = true;
    a.supportsCameraDepthTexture = true;
    EditorUtility.SetDirty(a);
    sb.AppendLine("  ->  HDR " + a.supportsHDR + " depthTex " + a.supportsCameraDepthTexture);
}
AssetDatabase.SaveAssets();
return sb.ToString();

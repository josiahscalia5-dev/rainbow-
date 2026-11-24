// PLAY MODE. Frame time at render scale 1 / 0.75 / 0.5 (is the laptop GPU- or CPU-bound?). Restores the scale.
var flow = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05GameFlow>();
if (flow == null) return "enter Play mode first";
if (EditorApplication.isPaused) EditorApplication.isPaused = false;
Time.captureFramerate = 0; int vs = QualitySettings.vSyncCount; QualitySettings.vSyncCount = 0; Application.targetFrameRate = -1;
var urp = (UnityEngine.Rendering.Universal.UniversalRenderPipelineAsset)UnityEngine.Rendering.GraphicsSettings.currentRenderPipeline;
float s0 = urp.renderScale; var sb = new System.Text.StringBuilder();
foreach (float sc in new[] { 1f, 0.75f, 0.5f })
{
    urp.renderScale = sc; flow.Restart();
    float t0 = Time.realtimeSinceStartup;
    await Wait.Until(() => Time.realtimeSinceStartup - t0 > 1.2f, timeoutMs: 30000, because: "warm");
    int f0 = Time.frameCount; float a = Time.realtimeSinceStartup;
    await Wait.Until(() => Time.realtimeSinceStartup - a > 4f, timeoutMs: 30000, because: "run");
    sb.Append("scale " + sc + ": " + (1000f * (Time.realtimeSinceStartup - a) / (Time.frameCount - f0)).ToString("0.0") + " ms | ");
}
urp.renderScale = s0; QualitySettings.vSyncCount = vs; EditorApplication.isPaused = true;
return sb.ToString() + "UnityStats batches " + UnityEditor.UnityStats.batches + " tris " + UnityEditor.UnityStats.triangles;

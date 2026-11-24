// PLAY MODE. Real-time frame cost of the game on this laptop (no captureFramerate): swims from the start for ~8 s and prints average / worst frame
// time, plus draw statistics. Editor overhead included, so a built game is faster.
var flow = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05GameFlow>();
if (flow == null) return "enter Play mode first";
if (EditorApplication.isPaused) EditorApplication.isPaused = false;
Time.captureFramerate = 0;
int vs = QualitySettings.vSyncCount; QualitySettings.vSyncCount = 0; Application.targetFrameRate = -1;
flow.Restart();
int f0 = Time.frameCount; float t0 = Time.realtimeSinceStartup;
await Wait.Until(() => Time.realtimeSinceStartup - t0 > 1.5f, timeoutMs: 30000, because: "warm up");
var l = new System.Collections.Generic.List<float>(); int last = Time.frameCount; float lt = Time.realtimeSinceStartup;
await Wait.Until(() => { if (Time.frameCount != last) { float n = Time.realtimeSinceStartup; l.Add((n - lt) / Mathf.Max(1, Time.frameCount - last)); lt = n; last = Time.frameCount; } return l.Count > 120 || Time.realtimeSinceStartup - t0 > 14f; }, timeoutMs: 60000, because: "frames");
QualitySettings.vSyncCount = vs;
EditorApplication.isPaused = true;
l.Sort();
float sum = 0f; foreach (var v in l) sum += v;
var b = Rainbow.Screen05.BennyController.Instance;
return "frames " + l.Count + " avg " + (1000f * sum / l.Count).ToString("0.0") + " ms (" + (l.Count / sum).ToString("0.0") + " fps) median " + (1000f * l[l.Count / 2]).ToString("0.0") + " ms p95 " + (1000f * l[(int)(l.Count * 0.95f)]).ToString("0.0")
  + " ms | game view " + Screen.width + "x" + Screen.height + " renderScale " + ((UnityEngine.Rendering.Universal.UniversalRenderPipelineAsset)UnityEngine.Rendering.GraphicsSettings.currentRenderPipeline).renderScale + " | S " + b.S.ToString("0");

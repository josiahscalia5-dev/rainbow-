// PLAY MODE. Before / at / after the approved camera position: s = 10, 14 (approved view), 20 on the coin line
// -> Recordings/Screen05/series_<time>/NN_<label>.png + index.json. Returns at once; then wait with screen05_wait_capture.cs.
// unity command script eval --project-path C:\RainbowUnity\UnityProject -- --file AgentScripts/screen05_series_approved.cs
return Rainbow.Screen05.EditorTools.Screen05Capture.CaptureSeries(null, new float[] { 10f, 14f, 20f }, null,
    new string[] { "before_s10", "APPROVED_VIEW_s14", "after_s20" }, 864, 1536, true);

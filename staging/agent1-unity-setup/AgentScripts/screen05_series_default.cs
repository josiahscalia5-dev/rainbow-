// PLAY MODE. Moving-view series: s = 10, 14 (approved view), 20, 28, 40, 55, 66 on the coin line,
// plus hard-left and hard-right at s = 14 and s = 30 -> Recordings/Screen05/series_<time>/NN_<label>.png + index.json.
// Returns at once ("started: ..."); then wait with AgentScripts/screen05_wait_capture.cs.
// unity command script eval --project-path C:\RainbowUnity\UnityProject -- --file AgentScripts/screen05_series_default.cs
return Rainbow.Screen05.EditorTools.Screen05Capture.CaptureDefaultSeries();

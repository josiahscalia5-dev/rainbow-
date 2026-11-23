// Exact 864x1536 still of Camera.main (URP post on, HUD composited) -> Recordings/Screen05/still_864x1536_<time>.png
// Works in Edit and Play mode, independent of the Game view size or focus. Returns the PNG path.
// unity command script eval --project-path C:\RainbowUnity\UnityProject -- --file AgentScripts/screen05_still_864x1536.cs
return Rainbow.Screen05.EditorTools.Screen05Capture.CaptureStill(null, 864, 1536);

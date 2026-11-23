// PLAY MODE. 12 s autopilot run from the approved start, recorded at 30 fps, 864x1536, H.264
// -> Recordings/Screen05/gameplay_<time>.mp4 (+ .json log, _first.png, _last.png).
// Returns at once ("started: ..."); then wait with AgentScripts/screen05_wait_capture.cs.
// unity command script eval --project-path C:\RainbowUnity\UnityProject -- --file AgentScripts/screen05_record_gameplay.cs
return Rainbow.Screen05.EditorTools.Screen05Capture.RecordGameplay(null, 12f, 30);

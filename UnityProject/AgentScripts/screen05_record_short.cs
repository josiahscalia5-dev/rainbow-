// PLAY MODE (unpaused). 4 s autopilot run from the approved start, recorded at 30 fps (expect 120 frames), 864x1536
// -> Recordings/Screen05/gameplay_<time>.mp4 (+ .json, _first.png, _last.png). Returns at once; then run
// AgentScripts/screen05_wait_capture.cs. Used by the Play Mode A/B test (twice in a row = LateFrame reset check).
return Rainbow.Screen05.EditorTools.Screen05Capture.RecordGameplay(null, 4f, 30);

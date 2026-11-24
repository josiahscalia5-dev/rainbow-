// PLAY MODE. Continuous, unedited recording of the whole Screen 05 course from the approved start (autopilot: coin line, hard left / right, jumps),
// 40 s at 30 fps, 864x1536, HUD included -> Recordings/Screen05/gameplay_<time>.mp4 + .json. Then wait with screen05_wait_capture.cs.
if (EditorApplication.isPaused) EditorApplication.isPaused = false;
var flow = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05GameFlow>();
if (flow == null) return "enter Play mode first";
flow.Restart();
var hud = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05Hud>();
if (hud != null) hud.ShowHint("", 0f);
Rainbow.Screen05.Screen05Clock.Reset(0f);
return Rainbow.Screen05.EditorTools.Screen05Capture.RecordGameplay(null, 40f, 30);

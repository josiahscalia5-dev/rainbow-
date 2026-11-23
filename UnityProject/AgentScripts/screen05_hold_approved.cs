// PLAY MODE. Restarts the run, hides the hint, puts Benny on the coin line so that he reaches s = 14 (the approved view)
// after 45 deterministic frames (1.5 s at 30 fps: camera damping, wake and spray settle the same way every time, whatever
// ran before), then PAUSES the Editor there. Use it before Game-view captures or a Frame Debugger snapshot.
// Unpause with: unity command editor.playmode pause   (toggle)
float targetS = 14f;
int settleFrames = 45;
var flow = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05GameFlow>();
if (flow == null) return "enter Play mode first";
if (EditorApplication.isPaused) EditorApplication.isPaused = false;
flow.Restart();
var hud = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05Hud>();
if (hud != null) hud.ShowHint("", 0f);
var benny = Rainbow.Screen05.BennyController.Instance;
Time.captureFramerate = 30;
// pass 1 (calibration): measure how far Benny really travels in settleFrames from a teleport (speed is not exactly swimSpeed)
float startS = targetS - benny.swimSpeed * settleFrames / 30f;
benny.TeleportTo(startS, Rainbow.Screen05.RiverPath.Meander(startS));
int f0 = Time.frameCount;
await Wait.Until(() => Time.frameCount >= f0 + settleFrames, timeoutMs: 30000, because: "the Game view is not ticking (run: unity command editor set_auto_tick)");
float travel = benny.S - startS;
// pass 2: same deterministic run, started so that Benny is exactly at targetS when the Editor pauses
flow.Restart();
if (hud != null) hud.ShowHint("", 0f);
startS = targetS - travel;
benny.TeleportTo(startS, Rainbow.Screen05.RiverPath.Meander(startS));
f0 = Time.frameCount;
await Wait.Until(() => Time.frameCount >= f0 + settleFrames, timeoutMs: 30000, because: "the Game view is not ticking (run: unity command editor set_auto_tick)");
EditorApplication.isPaused = true;
Time.captureFramerate = 0;
var cam = Camera.main;
return "paused at frame " + Time.frameCount + ": Benny S=" + benny.S.ToString("0.00") + " x=" + benny.LateralX.ToString("0.00")
    + " | camera " + cam.transform.position + " euler " + cam.transform.eulerAngles;

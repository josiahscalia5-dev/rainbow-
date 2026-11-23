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
// warm-up: the frame in which captureFramerate is set still has a long real-time step (Benny would jump ahead), so let a
// few fixed 1/30 s frames pass first; after that the swim is exactly swimSpeed per second
int f0 = Time.frameCount;
await Wait.Until(() => Time.frameCount >= f0 + 3, timeoutMs: 30000, because: "the Game view is not ticking (run: unity command editor set_auto_tick)");
// pass A (calibration): how far Benny travels in settleFrames from a teleport, in this frame phase (the eval continuation
// can land before or after Benny's Update, which shifts the result by one frame = swimSpeed / 30 between Editor sessions)
flow.Restart();
if (hud != null) hud.ShowHint("", 0f);
float startS = targetS - benny.swimSpeed * settleFrames / 30f;
benny.TeleportTo(startS, Rainbow.Screen05.RiverPath.Meander(startS));
f0 = Time.frameCount;
await Wait.Until(() => Time.frameCount >= f0 + settleFrames, timeoutMs: 30000, because: "the Game view is not ticking (run: unity command editor set_auto_tick)");
float travel = benny.S - startS;
// pass B: the same run, started so that Benny is exactly at targetS when the Editor pauses. The frame phase of the eval
// continuation can still differ from pass A by one frame (S = 13.63 / 14.37 = one 1/30 s swim step off): then correct
// the start by the measured error and run pass B again (frame round 2026-11-23; at most 4 tries).
for (int attempt = 0; attempt < 4; attempt++)
{
    flow.Restart();
    if (hud != null) hud.ShowHint("", 0f);
    startS = targetS - travel;
    benny.TeleportTo(startS, Rainbow.Screen05.RiverPath.Meander(startS));
    f0 = Time.frameCount;
    await Wait.Until(() => Time.frameCount >= f0 + settleFrames, timeoutMs: 30000, because: "the Game view is not ticking (run: unity command editor set_auto_tick)");
    float err = benny.S - targetS;
    if (Mathf.Abs(err) < 0.02f) break;
    travel += err;
}
EditorApplication.isPaused = true;
Time.captureFramerate = 0;
var cam = Camera.main;
return "paused at frame " + Time.frameCount + ": Benny S=" + benny.S.ToString("0.00") + " x=" + benny.LateralX.ToString("0.00")
    + " | camera " + cam.transform.position + " euler " + cam.transform.eulerAngles;

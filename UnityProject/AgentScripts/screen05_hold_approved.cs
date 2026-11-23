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
// Frame round 2026-11-23: the eval continuation runs in the middle of a frame (after Benny's Update, before LateUpdate),
// so pausing right there froze a HALF frame: Benny at the new s but the camera (Cinemachine, LateUpdate) still one swim
// step behind (0.37 m further back than any rendered gameplay frame). Each pass now pauses one frame early and then
// advances ONE COMPLETE frame with EditorApplication.Step(), so the still is a whole gameplay frame (camera, pom-pom,
// wake and bubbles all updated for the same s). Pass A calibrates the travel of this exact sequence; pass B repeats it
// from the corrected start (up to 4 tries, so a frame-phase slip of one 1/30 s step is corrected: S = 14.00 every time).
var cam = Camera.main;
float startS = targetS - benny.swimSpeed * settleFrames / 30f;
float travel = 0f;
string tries = "";
for (int pass = 0; pass < 5; pass++)
{
    if (EditorApplication.isPaused) EditorApplication.isPaused = false;
    int fu = Time.frameCount;
    await Wait.Until(() => Time.frameCount >= fu + 1, timeoutMs: 30000, because: "the Game view is not ticking (run: unity command editor set_auto_tick)");
    flow.Restart();
    if (hud != null) hud.ShowHint("", 0f);
    if (pass > 0) startS = targetS - travel;
    benny.TeleportTo(startS, Rainbow.Screen05.RiverPath.Meander(startS));
    f0 = Time.frameCount;
    await Wait.Until(() => Time.frameCount >= f0 + settleFrames - 1, timeoutMs: 30000, because: "the Game view is not ticking (run: unity command editor set_auto_tick)");
    EditorApplication.isPaused = true;
    int fs = Time.frameCount;
    EditorApplication.Step();
    await Wait.Until(() => Time.frameCount > fs, timeoutMs: 30000, because: "EditorApplication.Step did not advance a frame");
    if (pass == 0) { travel = benny.S - startS; continue; }   // pass A: calibration only
    float err = benny.S - targetS;
    tries += (tries.Length > 0 ? "," : "") + benny.S.ToString("0.00");
    if (Mathf.Abs(err) < 0.02f) break;
    travel += err;
}
Time.captureFramerate = 0;
float lagZ = (benny.S - cam.transform.position.z);
return "paused at frame " + Time.frameCount + ": Benny S=" + benny.S.ToString("0.00") + " x=" + benny.LateralX.ToString("0.00")
    + " | camera " + cam.transform.position.ToString("F2") + " euler " + cam.transform.eulerAngles.ToString("F2")
    + " | S - camZ " + lagZ.ToString("0.00") + " | tries " + tries;

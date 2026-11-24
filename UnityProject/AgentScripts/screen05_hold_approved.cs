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
// Frame round 2026-11-23: (1) the eval continuation runs in the middle of a frame (after Benny's Update, before
// LateUpdate) and its frame-count polling can slip a frame, so pausing from here froze HALF frames (Benny at the new s,
// the camera one 0.37 m swim step behind) and landed on S = 13.63 / 14.37 now and then. Now the pause is set from
// Screen05CaptureFrameHook.LateFrame (runs once per frame AFTER every LateUpdate, Cinemachine's brain included) in the
// very frame Benny reaches s = 14, so the still is one whole gameplay frame. (2) The start is chosen on the route so
// that exactly settleFrames swim steps of swimSpeed / 30 end on s = 14.00 (no calibration pass). (3) Benny's clips
// restart with the run (Animator rebind), so his pose at s = 14 is the same in every still. (4) Since 2026-11-23 21:10 the
// shared animation clock (Screen05Clock: water, foam, bubbles, splash, walls, coins) restarts with the run too, so the
// still is identical from cycle to cycle (before, the animation phase alone moved water scores by up to 4 points).
var cam = Camera.main;
var route = benny.route;
route.EnsureReady();
float step = benny.swimSpeed / 30f;
float dTarget = route.DistanceAtS(targetS);
float startS = route.SAtDistance(dTarget - settleFrames * step);
var hook = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05CaptureFrameHook>();
GameObject hookGo = null;
if (hook == null) { hookGo = new GameObject("HoldFrameHook (temp)"); hook = hookGo.AddComponent<Rainbow.Screen05.Screen05CaptureFrameHook>(); }
bool armed = false, hit = false;
System.Action<int> onLate = (fc) =>
{
    if (!armed || hit || benny.S < targetS - 0.05f) return;
    hit = true;
    EditorApplication.isPaused = true;   // takes effect after this (complete) frame
};
Rainbow.Screen05.Screen05CaptureFrameHook.LateFrame += onLate;
string tries = "";
try
{
    for (int pass = 0; pass < 3; pass++)
    {
        if (EditorApplication.isPaused) EditorApplication.isPaused = false;
        int fu = Time.frameCount;
        await Wait.Until(() => Time.frameCount >= fu + 2, timeoutMs: 30000, because: "the Game view is not ticking (run: unity command editor set_auto_tick)");
        flow.Restart();
        if (hud != null) hud.ShowHint("", 0f);
        if (benny.animator != null) { benny.animator.Rebind(); benny.animator.Update(0f); }
        benny.TeleportTo(startS, Rainbow.Screen05.RiverPath.Meander(startS));
        Rainbow.Screen05.Screen05Clock.Reset(0f);   // same animation phase (water, foam, bubbles, coins) in every still
        hit = false; armed = true;
        await Wait.Until(() => hit && EditorApplication.isPaused, timeoutMs: 30000, because: "Benny did not reach s = 14 (is the Game view ticking?)");
        armed = false;
        float err = benny.S - targetS;
        tries += (tries.Length > 0 ? "," : "") + benny.S.ToString("0.00");
        if (Mathf.Abs(err) < 0.02f) break;
        // numeric slip on the route: shift the start by the error and run again
        startS = route.SAtDistance(route.DistanceAtS(startS) - err);
    }
}
finally
{
    Rainbow.Screen05.Screen05CaptureFrameHook.LateFrame -= onLate;
    if (hookGo != null) UnityEngine.Object.Destroy(hookGo);
}
Time.captureFramerate = 0;
float lagZ = (benny.S - cam.transform.position.z);
return "paused at frame " + Time.frameCount + ": Benny S=" + benny.S.ToString("0.00") + " x=" + benny.LateralX.ToString("0.00")
    + " | camera " + cam.transform.position.ToString("F2") + " euler " + cam.transform.eulerAngles.ToString("F2")
    + " | S - camZ " + lagZ.ToString("0.00") + " | tries " + tries;

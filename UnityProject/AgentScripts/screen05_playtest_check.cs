// Coordinator (PLAY MODE, paused at s = 14): gameplay check for the Play Mode A/B test. Drives SwimInputOverride:
// hard LEFT 0.8 s, hard RIGHT 0.8 s, JUMP, landing, then 2 s straight with the autopilot-free input, and reports
// lateral range, jump height, landing, score (coins) and hearts. Pauses at the end. Changes no files or assets.
var sb = new System.Text.StringBuilder();
var benny = Rainbow.Screen05.BennyController.Instance;
var flow = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05GameFlow>();
if (benny == null || flow == null) return "no BennyController / GameFlow (enter Play mode first)";
if (EditorApplication.isPaused) EditorApplication.isPaused = false;
Time.captureFramerate = 30;
int score0 = flow.Score, hearts0 = flow.Hearts; float s0 = benny.S, minX = benny.LateralX, maxX = benny.LateralX, maxH = 0f;
System.Func<int, System.Threading.Tasks.Task> frames = async (n) =>
{
    int f0 = Time.frameCount;
    await Wait.Until(() => { minX = Mathf.Min(minX, benny.LateralX); maxX = Mathf.Max(maxX, benny.LateralX); maxH = Mathf.Max(maxH, benny.Height); return Time.frameCount >= f0 + n; }, timeoutMs: 30000, because: "game view not ticking");
};
Rainbow.Screen05.SwimInputOverride.Active = true;
Rainbow.Screen05.SwimInputOverride.Steer = -1f; await frames(24);
float xl = benny.LateralX;
Rainbow.Screen05.SwimInputOverride.Steer = 1f; await frames(24);
float xr = benny.LateralX;
Rainbow.Screen05.SwimInputOverride.Steer = 0f;
Rainbow.Screen05.SwimInputOverride.JumpRequested = true; await frames(9);
bool airborne = !benny.IsGrounded; float hAir = benny.Height;
await Wait.Until(() => { maxH = Mathf.Max(maxH, benny.Height); return benny.IsGrounded; }, timeoutMs: 30000, because: "Benny did not land");
float sLand = benny.S;
await frames(60);
EditorApplication.isPaused = true;
Time.captureFramerate = 0;
Rainbow.Screen05.SwimInputOverride.Active = false;
sb.Append("steer L x " + xl.ToString("0.00") + " | steer R x " + xr.ToString("0.00") + " | lateral range " + minX.ToString("0.00") + ".." + maxX.ToString("0.00"));
sb.Append(" | jump airborne " + airborne + " h " + hAir.ToString("0.00") + " max " + maxH.ToString("0.00") + " landed at S " + sLand.ToString("0.0"));
sb.Append(" | S " + s0.ToString("0.0") + " -> " + benny.S.ToString("0.0") + " | score " + score0 + " -> " + flow.Score + " | hearts " + hearts0 + " -> " + flow.Hearts + " | state " + flow.Current);
return sb.ToString();

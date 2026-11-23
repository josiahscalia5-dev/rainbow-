// SPLASH agent (PLAY MODE, paused at s = 14 by screen05_hold_approved.cs): gameplay check of the wake. Drives
// Rainbow.Screen05.SwimInputOverride: hard LEFT for 0.8 s, hard RIGHT for 0.8 s, then a JUMP; samples the SplashWake
// state (_RainbowBenny wake strength / waterline radius, _RainbowSplash landing ring) while swimming, airborne and after
// landing, then leaves Benny steering hard right on the water and PAUSES there, so the cycle's still shows the wake
// during hard steering. Changes no files or assets.
var sb = new System.Text.StringBuilder();
var benny = Rainbow.Screen05.BennyController.Instance;
if (benny == null) return "no BennyController (enter Play mode first)";
if (EditorApplication.isPaused) EditorApplication.isPaused = false;
Time.captureFramerate = 30;
System.Func<string> state = () =>
{
    Vector4 b = Shader.GetGlobalVector("_RainbowBenny");
    Vector4 s = Shader.GetGlobalVector("_RainbowSplash");
    return "S " + benny.S.ToString("0.00") + " x " + benny.LateralX.ToString("0.00") + " h " + benny.Height.ToString("0.00")
        + " grounded " + benny.IsGrounded + " wake " + b.z.ToString("0.00") + " rw " + b.w.ToString("0.00")
        + " splash(age " + s.z.ToString("0.00") + ", str " + s.w.ToString("0.00") + ")"
        + " intensity " + (benny.wake != null ? benny.wake.Intensity.ToString("0.00") : "none");
};
Rainbow.Screen05.SwimInputOverride.Active = true;
Rainbow.Screen05.SwimInputOverride.Steer = -1f;
int f0 = Time.frameCount;
await Wait.Until(() => Time.frameCount >= f0 + 24, timeoutMs: 30000, because: "game view not ticking");
sb.AppendLine("hard left : " + state());
Rainbow.Screen05.SwimInputOverride.Steer = 1f;
f0 = Time.frameCount;
await Wait.Until(() => Time.frameCount >= f0 + 24, timeoutMs: 30000, because: "game view not ticking");
sb.AppendLine("hard right: " + state());
Rainbow.Screen05.SwimInputOverride.Steer = 0f;
Rainbow.Screen05.SwimInputOverride.JumpRequested = true;
f0 = Time.frameCount;
await Wait.Until(() => Time.frameCount >= f0 + 9, timeoutMs: 30000, because: "game view not ticking");
sb.AppendLine("airborne  : " + state());
await Wait.Until(() => benny.IsGrounded, timeoutMs: 30000, because: "Benny did not land");
f0 = Time.frameCount;
await Wait.Until(() => Time.frameCount >= f0 + 2, timeoutMs: 30000, because: "game view not ticking");
sb.AppendLine("landed    : " + state());
Rainbow.Screen05.SwimInputOverride.Steer = 1f;
f0 = Time.frameCount;
await Wait.Until(() => Time.frameCount >= f0 + 12, timeoutMs: 30000, because: "game view not ticking");
sb.AppendLine("steer R   : " + state());
EditorApplication.isPaused = true;
Time.captureFramerate = 0;
Rainbow.Screen05.SwimInputOverride.Steer = 0f;
Rainbow.Screen05.SwimInputOverride.Active = false;
return sb.ToString();

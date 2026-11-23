// PLAY MODE. Restarts the run (Benny back at the start, finish panel hidden, score 1,420) and hides the gameplay hint,
// so evidence captures show the normal swimming state like the approved image. Run before a series or a recording.
// unity command script eval --project-path C:\RainbowUnity\UnityProject -- --file AgentScripts/screen05_reset_run.cs
var flow = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05GameFlow>();
if (flow == null) return "no Screen05GameFlow in the scene (enter Play mode first)";
flow.Restart();
var hud = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05Hud>();
if (hud != null) hud.ShowHint("", 0f);
return "run restarted, hint hidden";

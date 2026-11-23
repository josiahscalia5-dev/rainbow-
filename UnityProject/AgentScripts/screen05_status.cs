// READ-ONLY status of the Screen 05 test setup.
// unity command script eval --project-path C:\RainbowUnity\UnityProject -- --file AgentScripts/screen05_status.cs
var sb = new System.Text.StringBuilder();
sb.AppendLine("playing=" + EditorApplication.isPlaying + " paused=" + EditorApplication.isPaused
    + " frame=" + Time.frameCount + " time=" + Time.time.ToString("0.00") + " captureFramerate=" + Time.captureFramerate);
sb.AppendLine("scene=" + UnityEngine.SceneManagement.SceneManager.GetActiveScene().path);
sb.AppendLine("capture=" + Rainbow.Screen05.EditorTools.Screen05Capture.Status);
sb.AppendLine("lastOutput=" + Rainbow.Screen05.EditorTools.Screen05Capture.LastOutput);
sb.AppendLine("hooks=" + Rainbow.Screen05.Screen05TestBridge.Describe());
float s, x;
if (Rainbow.Screen05.Screen05TestBridge.TryGetBennyState(out s, out x))
    sb.AppendLine("benny S=" + s.ToString("0.00") + " LateralX=" + x.ToString("0.00"));
var cam = Camera.main;
if (cam != null) sb.AppendLine("camera pos=" + cam.transform.position + " euler=" + cam.transform.eulerAngles + " fov=" + cam.fieldOfView);
return sb.ToString();

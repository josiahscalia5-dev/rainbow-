// FRAME agent (Play mode, paused): is the gameplay camera one frame behind Benny? Steps single frames with a fixed
// 1/30 s and reads Benny's S and the camera z after each step (camera z should be S - back if it is up to date).
var sb = new System.Text.StringBuilder();
var benny = Rainbow.Screen05.BennyController.Instance;
var rig = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05CameraRig>();
var cam = Camera.main;
if (benny == null || rig == null || cam == null) return "enter Play mode first";
Time.captureFramerate = 30;
sb.AppendLine("paused state: frame " + Time.frameCount + " S " + benny.S.ToString("0.000") + " camZ " + cam.transform.position.z.ToString("0.000") + " -> S - camZ " + (benny.S - cam.transform.position.z).ToString("0.000"));
for (int i = 0; i < 3; i++)
{
    int f0 = Time.frameCount;
    EditorApplication.Step();
    await Wait.Until(() => Time.frameCount > f0, timeoutMs: 20000, because: "step did not advance");
    await Wait.Until(() => true, timeoutMs: 1000, because: "settle");
    sb.AppendLine("after step: frame " + Time.frameCount + " S " + benny.S.ToString("0.000") + " camZ " + cam.transform.position.z.ToString("0.000") + " -> S - camZ " + (benny.S - cam.transform.position.z).ToString("0.000") + " back " + rig.back);
}
Time.captureFramerate = 0;
return sb.ToString();

// FRAME agent (read-only probe, Play mode paused at s = 14): camera rig state + projection of tunnel landmarks with the
// real gameplay camera at the 864x1536 still resolution. Changes nothing.
var sb = new System.Text.StringBuilder();
var cam = Camera.main;
var rig = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05CameraRig>();
var benny = Rainbow.Screen05.BennyController.Instance;
if (cam == null || rig == null) return "no camera / rig";
sb.AppendLine("cam pos " + cam.transform.position.ToString("F3") + " euler " + cam.transform.eulerAngles.ToString("F3") + " fov " + cam.fieldOfView);
sb.AppendLine("followTarget " + (rig.followTarget != null ? rig.followTarget.position.ToString("F3") : "null") + " look " + (rig.lookTarget != null ? rig.lookTarget.position.ToString("F3") : "null"));
var follow = rig.vcam != null ? rig.vcam.GetComponent<Unity.Cinemachine.CinemachineFollow>() : null;
if (follow != null) sb.AppendLine("FollowOffset " + follow.FollowOffset.ToString("F3") + " damping " + follow.TrackerSettings.PositionDamping.ToString("F3") + " binding " + follow.TrackerSettings.BindingMode);
if (rig.vcam != null) sb.AppendLine("vcam pos " + rig.vcam.transform.position.ToString("F3") + " state raw " + rig.vcam.State.RawPosition.ToString("F3") + " corr " + rig.vcam.State.PositionCorrection.ToString("F3"));
if (benny != null) sb.AppendLine("benny S " + benny.S.ToString("F3") + " x " + benny.LateralX.ToString("F3") + " root " + benny.transform.position.ToString("F3") + " body " + benny.BodyCenter.ToString("F3"));
// projection at 864x1536 (vertical fov, aspect 0.5625)
float W = 864f, H = 1536f;
float f = (H * 0.5f) / Mathf.Tan(cam.fieldOfView * 0.5f * Mathf.Deg2Rad);
Matrix4x4 w2c = cam.transform.worldToLocalMatrix;
System.Func<Vector3, string> P = (Vector3 wp) =>
{
    Vector3 c = w2c.MultiplyPoint(wp);
    if (c.z <= 0.01f) return "behind";
    float sx = W * 0.5f + f * c.x / c.z, sy = H * 0.5f - f * c.y / c.z;
    return "(" + sx.ToString("0") + "," + sy.ToString("0") + ")";
};
Vector3 fwd = Vector3.forward;
Vector3 vp = cam.transform.position + fwd * 10000f;
sb.AppendLine("f px " + f.ToString("0.0") + " VP(+Z) " + P(vp));
// rings: centre + top + left + right
var root = UnityEngine.GameObject.Find("Environment05");
if (root != null)
{
    var rings = root.transform.Find("Rings");
    if (rings != null)
        foreach (Transform r in rings)
        {
            Vector3 c = r.position; float R = Rainbow.Screen05.DrumLayout05.Radius;
            sb.AppendLine("ring " + r.name + " s " + c.z.ToString("0.0") + " centre " + P(c) + " top " + P(c + Vector3.up * R) + " L " + P(c + Vector3.left * R) + " R " + P(c + Vector3.right * R));
        }
    var pads = root.transform.Find("Paddles");
    if (pads != null) foreach (Transform p in pads) sb.AppendLine("paddle " + p.name + " at " + P(p.position));
}
// wall meets water (x = +-chord) at several s
foreach (float s in new float[] { 10f, 14f, 18f, 22f, 26f, 30f, 40f, 50f, 70f, 100f })
{
    float ch = Rainbow.Screen05.DrumLayout05.WaterChord(s);
    sb.AppendLine("s " + s + " chord " + ch.ToString("0.00") + " wallL " + P(new Vector3(-ch, 0f, s)) + " wallR " + P(new Vector3(ch, 0f, s)) + " core " + P(new Vector3(Rainbow.Screen05.RiverPath.Meander(s), 0f, s)));
}
return sb.ToString();

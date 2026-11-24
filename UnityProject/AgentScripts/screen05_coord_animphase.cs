// Coordinator (read-only): the swim-cycle phase of Benny's animator at this moment (paused at the hold) + arm / squash / bob transforms.
var b = Rainbow.Screen05.BennyController.Instance;
if (b == null || b.animator == null) return "no Benny / animator (not in Play mode)";
var st = b.animator.GetCurrentAnimatorStateInfo(0);
var sb = new System.Text.StringBuilder();
sb.Append("S " + b.S.ToString("0.00") + " normalizedTime " + st.normalizedTime.ToString("0.0000") + " length " + st.length.ToString("0.0000") + " speedMul " + st.speedMultiplier.ToString("0.00") + " t " + (st.normalizedTime * st.length).ToString("0.000"));
foreach (var tr in b.visual.GetComponentsInChildren<Transform>())
    if (tr.name == "ArmL" || tr.name == "ArmR" || tr.name == "Squash" || tr.name == "Bob" || tr.name == "Lean")
        sb.Append("\n" + tr.name + " pos " + tr.localPosition.ToString("F3") + " rot " + tr.localEulerAngles.ToString("F1") + " scale " + tr.localScale.ToString("F3"));
var cam = Camera.main;
var rends = b.GetComponentsInChildren<SkinnedMeshRenderer>();
foreach (var r in rends)
{
    var bb = r.bounds; float x0 = 1e9f, y0 = 1e9f, x1 = -1e9f, y1 = -1e9f;
    var bm = new Mesh(); r.BakeMesh(bm, true); var m = r.transform.localToWorldMatrix;
    foreach (var v in bm.vertices) { var p = cam.WorldToViewportPoint(m.MultiplyPoint3x4(v)); float px = p.x * 864f, py = (1f - p.y) * 1536f; x0 = Mathf.Min(x0, px); x1 = Mathf.Max(x1, px); y0 = Mathf.Min(y0, py); y1 = Mathf.Max(y1, py); }
    sb.Append("\n" + r.name + " screen x " + x0.ToString("0") + "-" + x1.ToString("0") + " y " + y0.ToString("0") + "-" + y1.ToString("0"));
    UnityEngine.Object.DestroyImmediate(bm);
}
return sb.ToString();

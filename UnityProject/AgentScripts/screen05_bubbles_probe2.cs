// BUBBLES agent (PLAY MODE, paused at s = 14): why are the bubbles invisible? Forces test bubbles onto approved positions and
// measures, per experiment, how much they change the rendered frame (max / mean RGB difference inside each test circle vs a
// frame without bubbles). Experiments: as is | camera depth texture off | material queue 2450 (opaque pass) | huge soft depth
// tolerance via _SoftDepth 1e-6. Everything is restored at the end (material, camera option, mesh arrays).
var sb = new System.Text.StringBuilder();
var bf = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.BubbleField>();
if (bf == null) return "no BubbleField in the scene";
var mr = bf.GetComponent<MeshRenderer>();
var mesh = bf.GetComponent<MeshFilter>().sharedMesh;
var mat = mr.sharedMaterial;
var cam = Camera.main;
var cd = UnityEngine.Rendering.Universal.CameraExtensions.GetUniversalAdditionalCameraData(cam);
Matrix4x4 P = Matrix4x4.Perspective(cam.fieldOfView, 864f / 1536f, cam.nearClipPlane, cam.farClipPlane);
Matrix4x4 V = cam.worldToCameraMatrix;
Matrix4x4 iVP = (P * V).inverse;
float focal = 1536f / (2f * Mathf.Tan(cam.fieldOfView * 0.5f * Mathf.Deg2Rad));
float[,] tgt = { { 95, 1245, 30 }, { 85, 915, 30 }, { 45, 705, 28 }, { 720, 1205, 30 }, { 795, 860, 28 }, { 690, 830, 12 }, { 180, 672, 12 }, { 735, 573, 10 } };
int nt = tgt.GetLength(0);
var v = mesh.vertices; var c = mesh.colors32; var uv = new System.Collections.Generic.List<Vector4>(); mesh.GetUVs(0, uv);
var v2 = (Vector3[])v.Clone(); var c2 = (Color32[])c.Clone(); var uv2 = new System.Collections.Generic.List<Vector4>(uv);
var cOff = (Color32[])c.Clone();
for (int i = 0; i < cOff.Length; i++) cOff[i].a = 0;
int n = v.Length / 4;
for (int i = 0; i < n; i++)
{
    for (int k = 0; k < 4; k++) c2[i * 4 + k].a = 0;
    if (i >= nt) continue;
    float nx = tgt[i, 0] / 864f * 2f - 1f, ny = (1f - tgt[i, 1] / 1536f) * 2f - 1f;
    Vector4 a4 = iVP * new Vector4(nx, ny, -1f, 1f); Vector4 b4 = iVP * new Vector4(nx, ny, 1f, 1f);
    Vector3 A = new Vector3(a4.x, a4.y, a4.z) / a4.w, B = new Vector3(b4.x, b4.y, b4.z) / b4.w;
    Vector3 dir = (B - A).normalized;
    float tW = dir.y < -1e-3f ? -cam.transform.position.y / dir.y : 30f;
    Vector3 p = cam.transform.position + dir * (Mathf.Min(tW, 40f) * 0.72f);
    float depth = -V.MultiplyPoint3x4(p).z;
    float r = tgt[i, 2] * depth / focal;
    Vector3 lp = bf.transform.InverseTransformPoint(p);
    for (int k = 0; k < 4; k++)
    {
        v2[i * 4 + k] = lp; c2[i * 4 + k].a = 255;
        Vector4 u = uv2[i * 4 + k]; u.z = r; u.w = 0.13f * i + 0.05f; uv2[i * 4 + k] = u;
    }
}
var grab = new Rainbow.Screen05.EditorTools.Screen05FrameGrabber(864, 1536);
System.Func<Color32[]> Shot = () => { grab.Grab(cam, false); return grab.Frame.GetPixels32(); };
System.Func<Color32[], Color32[], string> Diff = (Color32[] f0, Color32[] f1) =>
{
    var o = new System.Text.StringBuilder();
    for (int i = 0; i < nt; i++)
    {
        int cx = (int)tgt[i, 0], cy = (int)tgt[i, 1], R = (int)tgt[i, 2];
        int mx = 0; long sum = 0; int cnt = 0;
        for (int y = cy - R; y <= cy + R; y++) for (int x = cx - R; x <= cx + R; x++)
        {
            if (x < 0 || x >= 864 || y < 0 || y >= 1536 || (x - cx) * (x - cx) + (y - cy) * (y - cy) > R * R) continue;
            int idx = (1535 - y) * 864 + x;
            int d = Mathf.Abs(f1[idx].r - f0[idx].r) + Mathf.Abs(f1[idx].g - f0[idx].g) + Mathf.Abs(f1[idx].b - f0[idx].b);
            if (d > mx) mx = d; sum += d; cnt++;
        }
        o.Append(" [" + cx + "," + cy + "] max " + mx + " mean " + (cnt > 0 ? (sum / (float)cnt).ToString("0.0") : "-"));
    }
    return o.ToString();
};
string result;
try
{
    mesh.vertices = v2; mesh.SetUVs(0, uv2);
    mesh.colors32 = cOff;
    var f0 = Shot();
    mesh.colors32 = c2;
    var f1 = Shot();
    sb.AppendLine("E1 as is:" + Diff(f0, f1));
    var prevDepth = cd.requiresDepthOption;
    cd.requiresDepthOption = UnityEngine.Rendering.Universal.CameraOverrideOption.Off;
    mesh.colors32 = cOff; var f0b = Shot();
    mesh.colors32 = c2; var f2 = Shot();
    sb.AppendLine("E2 depth texture off:" + Diff(f0b, f2));
    cd.requiresDepthOption = prevDepth;
    int prevQ = mat.renderQueue;
    mat.renderQueue = 2450;
    var f3 = Shot();
    sb.AppendLine("E3 queue 2450:" + Diff(f0, f3));
    mat.renderQueue = prevQ;
    float prevSoft = mat.GetFloat("_SoftDepth");
    mat.SetFloat("_SoftDepth", 1e-6f);
    var f4 = Shot();
    sb.AppendLine("E4 soft 1e-6:" + Diff(f0, f4));
    mat.SetFloat("_SoftDepth", prevSoft);
    float prevNear = mat.GetFloat("_NearFade");
    mat.SetFloat("_NearFade", 0.01f);
    var f5 = Shot();
    sb.AppendLine("E5 near 0.01:" + Diff(f0, f5));
    mat.SetFloat("_NearFade", prevNear);
    // save the E1 frame for a look
    grab.Grab(cam, false);
    string png = System.IO.Path.GetFullPath("Recordings/Screen05/work/bubbles_probe2_E1_" + System.DateTime.Now.ToString("HHmmss") + ".png");
    grab.SavePng(png);
    sb.AppendLine("E1 PNG " + png);
    result = "ok";
}
finally
{
    mesh.vertices = v; mesh.SetUVs(0, uv); mesh.colors32 = c;
    mesh.bounds = new Bounds(Vector3.zero, Vector3.one * 1000f);
    grab.Dispose();
}
return result + "\n" + sb.ToString();

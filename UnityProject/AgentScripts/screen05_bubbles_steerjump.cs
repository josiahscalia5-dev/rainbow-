// BUBBLES agent (PLAY MODE, paused at s = 14 by screen05_hold_approved.cs): gameplay check of the bubbles. Drives
// Rainbow.Screen05.SwimInputOverride: hard LEFT 0.8 s, hard RIGHT 0.8 s, then a JUMP, and saves an 864x1536 still at each
// moment (Recordings/Screen05/work/bubbles_play_<moment>_<time>.png) with the live bubble stats (visible, big / small, and how
// many visible bubbles overlap Benny's on-screen box in front of him). Then it puts Benny back at the approved view exactly
// like screen05_hold_approved.cs (restart, calibrated teleport, 45 frames at 30 fps) and PAUSES, so the cycle's still is s = 14.
// Changes no files or assets.
var sb = new System.Text.StringBuilder();
var benny = Rainbow.Screen05.BennyController.Instance;
var flow = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05GameFlow>();
var bf = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.BubbleField>();
if (benny == null || flow == null || bf == null) return "enter Play mode first (Benny / flow / bubbles missing)";
var cam = Camera.main;
var mesh = bf.GetComponent<MeshFilter>().sharedMesh;
var mat = bf.GetComponent<MeshRenderer>().sharedMaterial;
float capB = mat.GetFloat("_MaxPx"), capS = mat.GetFloat("_MaxPxSmall"), nf = mat.GetFloat("_NearFade");
var smr = benny.GetComponentInChildren<SkinnedMeshRenderer>();
string stamp = System.DateTime.Now.ToString("HHmmss");
System.Func<string, string> Snap = (string moment) =>
{
    Matrix4x4 P = Matrix4x4.Perspective(cam.fieldOfView, 864f / 1536f, cam.nearClipPlane, cam.farClipPlane);
    Matrix4x4 V = cam.worldToCameraMatrix;
    Matrix4x4 VP = P * V;
    float focal = 1536f / (2f * Mathf.Tan(cam.fieldOfView * 0.5f * Mathf.Deg2Rad));
    System.Func<Vector3, Vector3> Proj = (Vector3 w) => { Vector4 c4 = VP * new Vector4(w.x, w.y, w.z, 1f); return new Vector3((c4.x / c4.w * 0.5f + 0.5f) * 864f, (1f - (c4.y / c4.w * 0.5f + 0.5f)) * 1536f, -V.MultiplyPoint3x4(w).z); };
    // Benny's on-screen box and depth
    Bounds bb = smr != null ? smr.bounds : new Bounds(benny.transform.position, Vector3.one * 1.6f);
    float bx0 = 1e9f, bx1 = -1e9f, by0 = 1e9f, by1 = -1e9f, bd = 1e9f;
    for (int k = 0; k < 8; k++)
    {
        Vector3 cw = bb.center + Vector3.Scale(bb.extents, new Vector3((k & 1) == 0 ? -1 : 1, (k & 2) == 0 ? -1 : 1, (k & 4) == 0 ? -1 : 1));
        Vector3 sp = Proj(cw);
        bx0 = Mathf.Min(bx0, sp.x); bx1 = Mathf.Max(bx1, sp.x); by0 = Mathf.Min(by0, sp.y); by1 = Mathf.Max(by1, sp.y); bd = Mathf.Min(bd, sp.z);
    }
    var v = mesh.vertices; var c = mesh.colors32; var uv = new System.Collections.Generic.List<Vector4>(); mesh.GetUVs(0, uv);
    int vis = 0, big = 0, overl = 0, low = 0;
    for (int i = 0; i < v.Length; i += 4)
    {
        Vector3 sp = Proj(bf.transform.TransformPoint(v[i]));
        bool small = uv[i].w >= 1f;
        float rpx = sp.z > 0.01f ? Mathf.Min(uv[i].z * focal / sp.z, small ? capS : capB) : 0f;
        float t = Mathf.Clamp01((sp.z - nf) / (nf * 0.8f)); float a = c[i].a / 255f * t * t * (3f - 2f * t);
        if (a < 0.05f || rpx < 0.5f || sp.x < -rpx || sp.x > 864f + rpx || sp.y < -rpx || sp.y > 1536f + rpx) continue;
        vis++; if (!small) big++; if (sp.y > 1000f) low++;
        if (sp.z < bd + 0.3f && sp.x + rpx > bx0 && sp.x - rpx < bx1 && sp.y + rpx > by0 && sp.y - rpx < by1) overl++;
    }
    string png = Rainbow.Screen05.EditorTools.Screen05Capture.CaptureStill("Recordings/Screen05/work/bubbles_play_" + moment + "_" + stamp + ".png", 864, 1536);
    return moment + ": S " + benny.S.ToString("0.00") + " x " + benny.LateralX.ToString("0.00") + " h " + benny.Height.ToString("0.00")
        + " | bubbles visible " + vis + " (big " + big + ", lower third " + low + "), overlapping Benny " + overl
        + " | Benny box x " + bx0.ToString("0") + ".." + bx1.ToString("0") + " y " + by0.ToString("0") + ".." + by1.ToString("0") + " | " + png;
};
if (EditorApplication.isPaused) EditorApplication.isPaused = false;
Time.captureFramerate = 30;
Rainbow.Screen05.SwimInputOverride.Active = true;
Rainbow.Screen05.SwimInputOverride.Steer = -1f;
int f0 = Time.frameCount;
await Wait.Until(() => Time.frameCount >= f0 + 24, timeoutMs: 30000, because: "game view not ticking");
sb.AppendLine(Snap("left"));
Rainbow.Screen05.SwimInputOverride.Steer = 1f;
f0 = Time.frameCount;
await Wait.Until(() => Time.frameCount >= f0 + 30, timeoutMs: 30000, because: "game view not ticking");
sb.AppendLine(Snap("right"));
Rainbow.Screen05.SwimInputOverride.Steer = 0f;
Rainbow.Screen05.SwimInputOverride.JumpRequested = true;
f0 = Time.frameCount;
await Wait.Until(() => Time.frameCount >= f0 + 9, timeoutMs: 30000, because: "game view not ticking");
sb.AppendLine(Snap("jump"));
await Wait.Until(() => benny.IsGrounded, timeoutMs: 30000, because: "Benny did not land");
f0 = Time.frameCount;
await Wait.Until(() => Time.frameCount >= f0 + 15, timeoutMs: 30000, because: "game view not ticking");
sb.AppendLine(Snap("landed"));
Rainbow.Screen05.SwimInputOverride.Steer = 0f;
Rainbow.Screen05.SwimInputOverride.Active = false;

// ---- back to the approved view (screen05_hold_approved.cs) ----
float targetS = 14f;
int settleFrames = 45;
var hud = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05Hud>();
flow.Restart();
if (hud != null) hud.ShowHint("", 0f);
f0 = Time.frameCount;
await Wait.Until(() => Time.frameCount >= f0 + 3, timeoutMs: 30000, because: "game view not ticking");
flow.Restart();
if (hud != null) hud.ShowHint("", 0f);
float startS = targetS - benny.swimSpeed * settleFrames / 30f;
benny.TeleportTo(startS, Rainbow.Screen05.RiverPath.Meander(startS));
f0 = Time.frameCount;
await Wait.Until(() => Time.frameCount >= f0 + settleFrames, timeoutMs: 30000, because: "game view not ticking");
float travel = benny.S - startS;
flow.Restart();
if (hud != null) hud.ShowHint("", 0f);
startS = targetS - travel;
benny.TeleportTo(startS, Rainbow.Screen05.RiverPath.Meander(startS));
f0 = Time.frameCount;
await Wait.Until(() => Time.frameCount >= f0 + settleFrames, timeoutMs: 30000, because: "game view not ticking");
EditorApplication.isPaused = true;
Time.captureFramerate = 0;
sb.AppendLine("re-held at s = 14: " + Snap("hold"));
return sb.ToString();

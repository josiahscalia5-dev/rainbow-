// BUBBLES agent (PLAY MODE, paused at s = 14; read-only for the game): reports the live BubbleField (renderer, material,
// depth texture, every bubble's 864x1536 screen position / on-screen radius / alpha / shader near fade), then renders ONE
// debug still with test bubbles forced onto the approved bubble positions (to separate "placement" from "rendering"),
// and restores the field's mesh so the cycle's own still shows the real state.
var sb = new System.Text.StringBuilder();
var bf = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.BubbleField>();
if (bf == null) return "no BubbleField in the scene";
var mr = bf.GetComponent<MeshRenderer>();
var mf = bf.GetComponent<MeshFilter>();
var mat = mr.sharedMaterial;
var cam = Camera.main;
var cd = UnityEngine.Rendering.Universal.CameraExtensions.GetUniversalAdditionalCameraData(cam);
var urp = UnityEngine.Rendering.GraphicsSettings.currentRenderPipeline as UnityEngine.Rendering.Universal.UniversalRenderPipelineAsset;
sb.AppendLine("BennyS=" + Rainbow.Screen05.Screen05Events.BennyS.ToString("0.00") + " active=" + bf.gameObject.activeInHierarchy + " enabled=" + bf.enabled
    + " layer=" + bf.gameObject.layer + " inMask=" + ((cam.cullingMask & (1 << bf.gameObject.layer)) != 0) + " mr.enabled=" + mr.enabled
    + " isVisible=" + mr.isVisible + " tf=" + bf.transform.position + "/" + bf.transform.lossyScale);
sb.AppendLine("material " + (mat != null ? mat.name + " shader=" + mat.shader.name + " supported=" + mat.shader.isSupported + " error=" + ShaderUtil.ShaderHasError(mat.shader)
    + " queue=" + mat.renderQueue + " NearFade=" + mat.GetFloat("_NearFade") + " SoftDepth=" + mat.GetFloat("_SoftDepth") + " Intensity=" + mat.GetFloat("_Intensity") : "NONE"));
sb.AppendLine("URP depthTex=" + (urp != null ? urp.supportsCameraDepthTexture.ToString() : "?") + " cam depthOption=" + cd.requiresDepthOption
    + " requiresDepthTexture=" + cd.requiresDepthTexture + " post=" + cd.renderPostProcessing);
sb.AppendLine("camera " + cam.transform.position.ToString("0.00") + " euler " + cam.transform.eulerAngles.ToString("0.0") + " fov " + cam.fieldOfView.ToString("0.0")
    + " near " + cam.nearClipPlane + " far " + cam.farClipPlane);
var mesh = mf.sharedMesh;
if (mesh == null) return sb.ToString() + "NO MESH";
sb.AppendLine("mesh " + mesh.name + " verts " + mesh.vertexCount + " bounds " + mesh.bounds);
Matrix4x4 P = Matrix4x4.Perspective(cam.fieldOfView, 864f / 1536f, cam.nearClipPlane, cam.farClipPlane);
Matrix4x4 V = cam.worldToCameraMatrix;
Matrix4x4 VP = P * V;
float tanV = Mathf.Tan(cam.fieldOfView * 0.5f * Mathf.Deg2Rad);
float focal = 1536f / (2f * tanV);
float nf = mat != null ? mat.GetFloat("_NearFade") : 1.5f;
System.Func<float, float, float, float> SS = (float a, float b, float x) => { float t = Mathf.Clamp01((x - a) / (b - a)); return t * t * (3f - 2f * t); };
var v = mesh.vertices; var c = mesh.colors32; var uv = new System.Collections.Generic.List<Vector4>(); mesh.GetUVs(0, uv);
int inView = 0, alphaOk = 0, drawn = 0;
for (int i = 0; i < v.Length; i += 4)
{
    Vector3 w = bf.transform.TransformPoint(v[i]);
    Vector3 vs = V.MultiplyPoint3x4(w);
    float depth = -vs.z;
    Vector4 cc = VP * new Vector4(w.x, w.y, w.z, 1f);
    float sx = (cc.x / cc.w * 0.5f + 0.5f) * 864f, sy = (1f - (cc.y / cc.w * 0.5f + 0.5f)) * 1536f;
    float r = uv[i].z;
    float rpx = depth > 0.01f ? r * focal / depth : -1f;
    bool iv = depth > 0f && sx > -rpx && sx < 864f + rpx && sy > -rpx && sy < 1536f + rpx;
    float near = SS(nf, nf * 1.8f, depth);
    if (iv) inView++;
    if (c[i].a > 10) alphaOk++;
    if (iv && c[i].a > 10 && near > 0.1f) drawn++;
    bool chan = Rainbow.Screen05.FoamBank.InChannel(w.x, w.z, 0f);
    float wh = Rainbow.Screen05.RiverSurface.HeightAt(w.x, w.z);
    sb.AppendLine(string.Format("  b{0,2} w({1,6:0.00},{2,5:0.00},{3,6:0.00}) r {4:0.000} a {5,3} depth {6,5:0.0} px({7,5:0},{8,5:0}) rpx {9,5:0.0} near {10:0.00} {11} {12} y-water {13:0.00}",
        i / 4, w.x, w.y, w.z, r, c[i].a, depth, sx, sy, rpx, near, iv ? "IN " : "out", chan ? "water" : "FOAM ", w.y - wh));
}
sb.AppendLine("bubbles=" + (v.Length / 4) + " inView=" + inView + " alpha>10=" + alphaOk + " drawable(in view, alpha, near)=" + drawn);

// ---- debug still: test bubbles on the approved positions (px x, px y, on-screen radius px) ----
float[,] tgt = { { 95, 1245, 30 }, { 85, 915, 30 }, { 45, 705, 28 }, { 720, 1205, 30 }, { 795, 860, 28 },
                 { 180, 575, 8 }, { 95, 610, 10 }, { 180, 672, 8 }, { 650, 560, 8 }, { 735, 573, 10 }, { 800, 615, 10 }, { 690, 830, 8 },
                 { 150, 1000, 6 }, { 170, 1150, 6 }, { 660, 1080, 6 }, { 700, 1130, 6 } };
var v2 = (Vector3[])v.Clone(); var c2 = (Color32[])c.Clone(); var uv2 = new System.Collections.Generic.List<Vector4>(uv);
Matrix4x4 iVP = VP.inverse;
int n = v.Length / 4;
for (int i = 0; i < n; i++)
{
    for (int k = 0; k < 4; k++) { c2[i * 4 + k].a = 0; }
    if (i >= tgt.GetLength(0)) continue;
    float nx = tgt[i, 0] / 864f * 2f - 1f, ny = (1f - tgt[i, 1] / 1536f) * 2f - 1f;
    Vector4 a4 = iVP * new Vector4(nx, ny, -1f, 1f); Vector4 b4 = iVP * new Vector4(nx, ny, 1f, 1f);
    Vector3 A = new Vector3(a4.x, a4.y, a4.z) / a4.w, B = new Vector3(b4.x, b4.y, b4.z) / b4.w;
    Vector3 dir = (B - A).normalized;
    float tW = dir.y < -1e-3f ? (0.0f - cam.transform.position.y) / dir.y : 30f;
    float t = Mathf.Min(tW, 40f) * 0.72f;
    Vector3 p = cam.transform.position + dir * t;
    float depth = -V.MultiplyPoint3x4(p).z;
    float r = tgt[i, 2] * depth / focal;
    Vector3 lp = bf.transform.InverseTransformPoint(p);
    for (int k = 0; k < 4; k++)
    {
        v2[i * 4 + k] = lp; c2[i * 4 + k].a = 255;
        Vector4 u = uv2[i * 4 + k]; u.z = r; u.w = 0.13f * i + 0.05f; uv2[i * 4 + k] = u;
    }
    sb.AppendLine(string.Format("  test{0,2} px({1},{2}) depth {3:0.0} r {4:0.000} world {5}", i, tgt[i, 0], tgt[i, 1], depth, r, p.ToString("0.00")));
}
mesh.vertices = v2; mesh.SetUVs(0, uv2); mesh.colors32 = c2;
string dbg = Rainbow.Screen05.EditorTools.Screen05Capture.CaptureStill("Recordings/Screen05/work/bubbles_probe_debug_" + System.DateTime.Now.ToString("HHmmss") + ".png", 864, 1536);
mesh.vertices = v; mesh.SetUVs(0, uv); mesh.colors32 = c;
sb.AppendLine("DEBUG STILL " + dbg);
return sb.ToString();

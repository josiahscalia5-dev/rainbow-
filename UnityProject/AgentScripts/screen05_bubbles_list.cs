// BUBBLES agent (read-only, PLAY MODE paused at s = 14): every live bubble's 864x1536 screen position, on-screen radius
// (after the shader cap) and fade, sorted by screen y, plus a summary (how many are visible, big / small, by screen band).
var sb = new System.Text.StringBuilder();
var bf = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.BubbleField>();
if (bf == null) return "no BubbleField in the scene";
var mesh = bf.GetComponent<MeshFilter>().sharedMesh;
var mat = bf.GetComponent<MeshRenderer>().sharedMaterial;
var cam = Camera.main;
float nf = mat.GetFloat("_NearFade"), capB = mat.GetFloat("_MaxPx"), capS = mat.GetFloat("_MaxPxSmall");
Matrix4x4 P = Matrix4x4.Perspective(cam.fieldOfView, 864f / 1536f, cam.nearClipPlane, cam.farClipPlane);
Matrix4x4 V = cam.worldToCameraMatrix;
Matrix4x4 VP = P * V;
float focal = 1536f / (2f * Mathf.Tan(cam.fieldOfView * 0.5f * Mathf.Deg2Rad));
var v = mesh.vertices; var c = mesh.colors32; var uv = new System.Collections.Generic.List<Vector4>(); mesh.GetUVs(0, uv);
var rows = new System.Collections.Generic.List<System.Tuple<float, string>>();
int vis = 0, visBig = 0, visSmall = 0, big25 = 0, band1 = 0, band2 = 0, band3 = 0;
for (int i = 0; i < v.Length; i += 4)
{
    Vector3 w = bf.transform.TransformPoint(v[i]);
    float depth = -V.MultiplyPoint3x4(w).z;
    Vector4 cc = VP * new Vector4(w.x, w.y, w.z, 1f);
    float sx = (cc.x / cc.w * 0.5f + 0.5f) * 864f, sy = (1f - (cc.y / cc.w * 0.5f + 0.5f)) * 1536f;
    bool small = uv[i].w >= 1f;
    float r = uv[i].z;
    float rpx = depth > 0.01f ? Mathf.Min(r * focal / depth, small ? capS : capB) : 0f;
    float t = Mathf.Clamp01((depth - nf) / (nf * 0.8f)); float near = t * t * (3f - 2f * t);
    float a = c[i].a / 255f * near;
    bool iv = depth > 0f && sx > -rpx && sx < 864f + rpx && sy > -rpx && sy < 1536f + rpx && a > 0.05f && rpx > 0.5f;
    if (iv) { vis++; if (small) visSmall++; else visBig++; if (rpx >= 25f) big25++; if (sy < 700f) band1++; else if (sy < 1000f) band2++; else band3++; }
    rows.Add(System.Tuple.Create(sy, string.Format("  {0} {1,2} px({2,4:0},{3,5:0}) rpx {4,5:0.0} a {5:0.00} depth {6,5:0.0} r {7:0.000} y {8:0.00} {9}",
        small ? "s" : "B", i / 4, sx, sy, rpx, a, depth, r, w.y, iv ? "" : "(hidden)")));
}
rows.Sort((x, y) => x.Item1.CompareTo(y.Item1));
foreach (var row in rows) sb.AppendLine(row.Item2);
sb.AppendLine("visible " + vis + " (big " + visBig + ", small " + visSmall + ", radius>=25px " + big25 + ") | screen y<700: " + band1 + ", 700-1000: " + band2 + ", >1000: " + band3);
return sb.ToString();

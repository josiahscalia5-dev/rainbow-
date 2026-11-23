// SPLASH agent (read-only, PLAY MODE paused at s = 14): Benny's real waterline footprint (baked skinned mesh vs the
// animated water height), the SplashWake globals, and the 864x1536 projection of the water plane around him, so the
// splash fans / collar can be placed where the approved image has them.
var sb = new System.Text.StringBuilder();
var benny = Rainbow.Screen05.BennyController.Instance;
if (benny == null) return "no BennyController (enter Play mode first)";
var cam = Camera.main;
Transform bt = benny.transform;
Vector3 bp = bt.position;
float wy = Rainbow.Screen05.RiverSurface.HeightAt(bp.x, bp.z);
Vector3 fwd = bt.forward; fwd.y = 0f; fwd.Normalize();
Vector3 right = Vector3.Cross(Vector3.up, fwd).normalized;
sb.AppendLine("root " + bp.ToString("0.000") + " bodyCenter " + benny.BodyCenter.ToString("0.000") + " waterY@benny " + wy.ToString("0.000")
    + " root-water " + (bp.y - wy).ToString("0.000") + " S " + benny.S.ToString("0.00") + " x " + benny.LateralX.ToString("0.00"));
var wake = benny.wake;
sb.AppendLine("wake intensity " + (wake != null ? wake.Intensity.ToString("0.00") : "none") + " _RainbowBenny " + Shader.GetGlobalVector("_RainbowBenny").ToString("0.000")
    + " _RainbowSplash " + Shader.GetGlobalVector("_RainbowSplash").ToString("0.000"));
// 864x1536 projection (the capture size), same vertical fov as the camera
Matrix4x4 P = Matrix4x4.Perspective(cam.fieldOfView, 864f / 1536f, cam.nearClipPlane, cam.farClipPlane);
Matrix4x4 V = cam.worldToCameraMatrix;
Matrix4x4 VP = P * V;
System.Func<Vector3, Vector2> proj = (Vector3 w) => { Vector4 c = VP * new Vector4(w.x, w.y, w.z, 1f); return new Vector2((c.x / c.w * 0.5f + 0.5f) * 864f, (1f - (c.y / c.w * 0.5f + 0.5f)) * 1536f); };
System.Func<float, float, Vector3> water = (float lat, float back) => { Vector3 p = bp + right * lat - fwd * back; p.y = Rainbow.Screen05.RiverSurface.HeightAt(p.x, p.z); return p; };
sb.AppendLine("camera " + cam.transform.position.ToString("0.00") + " euler " + cam.transform.eulerAngles.ToString("0.0") + " fov " + cam.fieldOfView.ToString("0.0") + " pixelRect " + cam.pixelRect);
// baked mesh
var smr = bt.GetComponentInChildren<SkinnedMeshRenderer>();
if (smr != null)
{
    var m = new Mesh();
    smr.BakeMesh(m, false);
    var vs = m.vertices;
    // BakeMesh(useScale: false) already comes out at world scale: place it with the renderer's position + rotation only
    Matrix4x4 L = Matrix4x4.TRS(smr.transform.position, smr.transform.rotation, Vector3.one);
    float minDy = 1e9f, maxDy = -1e9f;
    float[] bandLo = { -0.4f, -0.2f, -0.1f, -0.03f, 0.03f, 0.1f, 0.2f, 0.3f, 0.45f, 0.6f, 0.8f };
    float[] bandHi = { -0.2f, -0.1f, -0.03f, 0.03f, 0.1f, 0.2f, 0.3f, 0.45f, 0.6f, 0.8f, 1.0f };
    int nb = bandLo.Length;
    float[] rMin = new float[nb], rMax = new float[nb], fMin = new float[nb], fMax = new float[nb], pxMin = new float[nb], pxMax = new float[nb], pyMax = new float[nb];
    int[] cnt = new int[nb];
    for (int b = 0; b < nb; b++) { rMin[b] = fMin[b] = pxMin[b] = 1e9f; rMax[b] = fMax[b] = pxMax[b] = pyMax[b] = -1e9f; }
    float scrBottom = -1e9f; float scrBottomX = 0f;
    // waterline footprint per 15-degree sector (angle from straight BACK toward his right) and the silhouette bottom per
    // 20-px screen column (lowest point above the water)
    float[] secR = new float[24];
    float[] colY = new float[44];
    for (int k = 0; k < colY.Length; k++) colY[k] = -1f;
    for (int i = 0; i < vs.Length; i++)
    {
        Vector3 w = L.MultiplyPoint3x4(vs[i]);
        float h = Rainbow.Screen05.RiverSurface.HeightAt(w.x, w.z);
        float dy = w.y - h;
        if (dy < minDy) minDy = dy;
        if (dy > maxDy) maxDy = dy;
        Vector3 d = w - bp;
        float r = Vector3.Dot(d, right), f = Vector3.Dot(d, fwd);
        Vector2 sp = proj(w);
        if (dy > 0f && sp.y > scrBottom) { scrBottom = sp.y; scrBottomX = sp.x; }
        if (dy > -0.04f && dy < 0.06f)
        {
            float ang = Mathf.Atan2(r, -f) * Mathf.Rad2Deg; // 0 = straight back (toward the camera), +90 = his right
            int sIdx = Mathf.Clamp(Mathf.FloorToInt((ang + 180f) / 15f), 0, 23);
            secR[sIdx] = Mathf.Max(secR[sIdx], Mathf.Sqrt(r * r + f * f));
        }
        if (dy > 0f)
        {
            int cI = Mathf.FloorToInt(sp.x / 20f);
            if (cI >= 0 && cI < colY.Length) colY[cI] = Mathf.Max(colY[cI], sp.y);
        }
        for (int b = 0; b < nb; b++)
        {
            if (dy < bandLo[b] || dy >= bandHi[b]) continue;
            cnt[b]++;
            rMin[b] = Mathf.Min(rMin[b], r); rMax[b] = Mathf.Max(rMax[b], r);
            fMin[b] = Mathf.Min(fMin[b], f); fMax[b] = Mathf.Max(fMax[b], f);
            pxMin[b] = Mathf.Min(pxMin[b], sp.x); pxMax[b] = Mathf.Max(pxMax[b], sp.x); pyMax[b] = Mathf.Max(pyMax[b], sp.y);
        }
    }
    sb.AppendLine("mesh verts " + vs.Length + " dy (above local water) min " + minDy.ToString("0.000") + " max " + maxDy.ToString("0.000")
        + " | lowest visible (dy>0) screen point (" + scrBottomX.ToString("0") + ", " + scrBottom.ToString("0") + ")");
    for (int b = 0; b < nb; b++)
        if (cnt[b] > 0)
            sb.AppendLine(string.Format("  dy {0,5:0.00}..{1,5:0.00} n {2,5}  right {3,6:0.00}..{4,6:0.00}  fwd {5,6:0.00}..{6,6:0.00}  screen x {7,4:0}..{8,4:0} maxY {9,4:0}",
                bandLo[b], bandHi[b], cnt[b], rMin[b], rMax[b], fMin[b], fMax[b], pxMin[b], pxMax[b], pyMax[b]));
    var fl = new System.Text.StringBuilder("  waterline footprint radius by angle from back (deg:r):");
    for (int k = 0; k < 24; k++) fl.Append(" " + (k * 15 - 180 + 7) + ":" + secR[k].ToString("0.00"));
    sb.AppendLine(fl.ToString());
    var cl = new System.Text.StringBuilder("  silhouette bottom (screen col x: max y above water):");
    for (int k = 10; k < 34; k++) if (colY[k] > 0f) cl.Append(" " + (k * 20 + 10) + ":" + colY[k].ToString("0"));
    sb.AppendLine(cl.ToString());
    UnityEngine.Object.Destroy(m);
}
// projection of the water plane around Benny (lat = + right, back = toward the camera)
sb.AppendLine("water plane -> 864x1536 px (lat, back):");
float[] lats = { -2.4f, -1.8f, -1.3f, -0.9f, -0.6f, -0.3f, 0f, 0.3f, 0.6f, 0.9f, 1.3f, 1.8f, 2.4f };
float[] backs = { -0.6f, -0.3f, 0f, 0.3f, 0.6f, 1.0f, 1.5f, 2.0f, 2.6f, 3.2f };
foreach (float bk in backs)
{
    var line = new System.Text.StringBuilder("  back " + bk.ToString("0.0").PadLeft(4) + ":");
    foreach (float lt in lats) { Vector2 p = proj(water(lt, bk)); line.Append(" " + lt.ToString("0.0") + "(" + p.x.ToString("0") + "," + p.y.ToString("0") + ")"); }
    sb.AppendLine(line.ToString());
}
// inverse: approved pixels -> point on the water plane (Benny frame)
Matrix4x4 iVP = VP.inverse;
sb.AppendLine("approved px -> water plane (lat, back) in Benny's frame:");
float[,] px = { { 420, 1187 }, { 330, 1110 }, { 170, 1290 }, { 520, 1110 }, { 700, 1300 }, { 277, 1100 }, { 150, 1293 }, { 570, 1187 }, { 720, 1320 }, { 330, 1185 }, { 540, 1185 }, { 300, 1150 }, { 560, 1150 } };
for (int k = 0; k < px.GetLength(0); k++)
{
    float nx = px[k, 0] / 864f * 2f - 1f, ny = (1f - px[k, 1] / 1536f) * 2f - 1f;
    Vector4 a = iVP * new Vector4(nx, ny, -1f, 1f); Vector4 b2 = iVP * new Vector4(nx, ny, 1f, 1f);
    Vector3 A = new Vector3(a.x, a.y, a.z) / a.w, B = new Vector3(b2.x, b2.y, b2.z) / b2.w;
    float t = (wy - A.y) / (B.y - A.y);
    Vector3 hit = A + (B - A) * t;
    Vector3 d = hit - bp;
    sb.AppendLine("  (" + px[k, 0] + "," + px[k, 1] + ") -> lat " + Vector3.Dot(d, right).ToString("0.00") + " back " + (-Vector3.Dot(d, fwd)).ToString("0.00"));
}
return sb.ToString();

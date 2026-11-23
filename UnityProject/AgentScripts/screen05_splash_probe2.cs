// SPLASH agent (read-only, PLAY MODE paused at s = 14): Benny's real waterline footprint (baked skinned mesh vs the
// animated water height), the camera elevation, and the mapping approved px <-> water plane in Benny's frame, so the
// splash fans / foam / contact can be placed where the approved image has them. Changes nothing.
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
Vector3 toB = new Vector3(bp.x, wy, bp.z) - cam.transform.position;
float elev = Mathf.Atan2(-toB.y, new Vector2(toB.x, toB.z).magnitude) * Mathf.Rad2Deg;
sb.AppendLine("camera " + cam.transform.position.ToString("0.00") + " euler " + cam.transform.eulerAngles.ToString("0.0") + " fov " + cam.fieldOfView.ToString("0.0")
    + " | elevation to Benny's waterline " + elev.ToString("0.0") + " deg, horiz dist " + new Vector2(toB.x, toB.z).magnitude.ToString("0.00"));
Matrix4x4 P = Matrix4x4.Perspective(cam.fieldOfView, 864f / 1536f, cam.nearClipPlane, cam.farClipPlane);
Matrix4x4 V = cam.worldToCameraMatrix;
Matrix4x4 VP = P * V;
System.Func<Vector3, Vector2> proj = (Vector3 w) => { Vector4 c = VP * new Vector4(w.x, w.y, w.z, 1f); return new Vector2((c.x / c.w * 0.5f + 0.5f) * 864f, (1f - (c.y / c.w * 0.5f + 0.5f)) * 1536f); };
System.Func<float, float, Vector3> water = (float lat, float back) => { Vector3 p = bp + right * lat - fwd * back; p.y = Rainbow.Screen05.RiverSurface.HeightAt(p.x, p.z); return p; };
var smr = bt.GetComponentInChildren<SkinnedMeshRenderer>();
if (smr != null)
{
    var m = new Mesh();
    smr.BakeMesh(m, false);
    var vs = m.vertices;
    Matrix4x4 L = Matrix4x4.TRS(smr.transform.position, smr.transform.rotation, Vector3.one);
    float minDy = 1e9f, maxDy = -1e9f;
    float[] secR = new float[24];
    float[] colY = new float[44];
    float[] colYall = new float[44];
    for (int k = 0; k < colY.Length; k++) { colY[k] = -1f; colYall[k] = -1f; }
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
        if (dy > -0.04f && dy < 0.06f)
        {
            float ang = Mathf.Atan2(r, -f) * Mathf.Rad2Deg;
            int sIdx = Mathf.Clamp(Mathf.FloorToInt((ang + 180f) / 15f), 0, 23);
            secR[sIdx] = Mathf.Max(secR[sIdx], Mathf.Sqrt(r * r + f * f));
        }
        int cI = Mathf.FloorToInt(sp.x / 20f);
        if (cI >= 0 && cI < colY.Length)
        {
            if (dy > 0f) colY[cI] = Mathf.Max(colY[cI], sp.y);
            colYall[cI] = Mathf.Max(colYall[cI], sp.y);
        }
    }
    sb.AppendLine("mesh verts " + vs.Length + " dy (above local water) min " + minDy.ToString("0.000") + " max " + maxDy.ToString("0.000"));
    var fl = new System.Text.StringBuilder("  waterline footprint radius by angle from back (deg:r):");
    for (int k = 0; k < 24; k++) fl.Append(" " + (k * 15 - 180 + 7) + ":" + secR[k].ToString("0.00"));
    sb.AppendLine(fl.ToString());
    var cl = new System.Text.StringBuilder("  silhouette bottom above water (col x: y):");
    for (int k = 10; k < 34; k++) if (colY[k] > 0f) cl.Append(" " + (k * 20 + 10) + ":" + colY[k].ToString("0"));
    sb.AppendLine(cl.ToString());
    var cl2 = new System.Text.StringBuilder("  silhouette bottom incl. submerged (col x: y):");
    for (int k = 10; k < 34; k++) if (colYall[k] > 0f) cl2.Append(" " + (k * 20 + 10) + ":" + colYall[k].ToString("0"));
    sb.AppendLine(cl2.ToString());
    UnityEngine.Object.Destroy(m);
}
sb.AppendLine("water plane -> 864x1536 px (lat, back):");
float[] lats = { -2.4f, -1.8f, -1.3f, -0.9f, -0.6f, -0.3f, 0f, 0.3f, 0.6f, 0.9f, 1.3f, 1.8f, 2.4f };
float[] backs = { -0.6f, -0.3f, 0f, 0.3f, 0.6f, 1.0f, 1.5f, 2.0f, 2.6f, 3.2f };
foreach (float bk in backs)
{
    var line = new System.Text.StringBuilder("  back " + bk.ToString("0.0").PadLeft(4) + ":");
    foreach (float lt in lats) { Vector2 p = proj(water(lt, bk)); line.Append(" " + lt.ToString("0.0") + "(" + p.x.ToString("0") + "," + p.y.ToString("0") + ")"); }
    sb.AppendLine(line.ToString());
}
Matrix4x4 iVP = VP.inverse;
sb.AppendLine("approved px -> water plane (lat, back, dist, angle-from-back deg):");
float[,] px = {
    { 420, 1190 }, { 380, 1188 }, { 460, 1188 }, { 330, 1160 }, { 520, 1160 },
    { 330, 1110 }, { 300, 1130 }, { 260, 1150 }, { 220, 1180 }, { 170, 1290 }, { 200, 1250 }, { 250, 1290 }, { 300, 1290 }, { 330, 1230 },
    { 520, 1110 }, { 560, 1130 }, { 600, 1160 }, { 650, 1200 }, { 700, 1300 }, { 660, 1290 }, { 600, 1290 }, { 560, 1290 }, { 530, 1230 },
    { 420, 1300 }, { 420, 1400 }, { 300, 1400 }, { 540, 1400 } };
for (int k = 0; k < px.GetLength(0); k++)
{
    float nx = px[k, 0] / 864f * 2f - 1f, ny = (1f - px[k, 1] / 1536f) * 2f - 1f;
    Vector4 a = iVP * new Vector4(nx, ny, -1f, 1f); Vector4 b2 = iVP * new Vector4(nx, ny, 1f, 1f);
    Vector3 A = new Vector3(a.x, a.y, a.z) / a.w, B = new Vector3(b2.x, b2.y, b2.z) / b2.w;
    float t = (wy - A.y) / (B.y - A.y);
    Vector3 hit = A + (B - A) * t;
    Vector3 d = hit - bp;
    float lat = Vector3.Dot(d, right), back = -Vector3.Dot(d, fwd);
    sb.AppendLine("  (" + px[k, 0] + "," + px[k, 1] + ") -> lat " + lat.ToString("0.00") + " back " + back.ToString("0.00")
        + " r " + Mathf.Sqrt(lat * lat + back * back).ToString("0.00") + " ang " + (Mathf.Atan2(lat, back) * Mathf.Rad2Deg).ToString("0"));
}
return sb.ToString();

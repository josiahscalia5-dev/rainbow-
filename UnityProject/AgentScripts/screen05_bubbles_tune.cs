// BUBBLES lane (round 3, 2026-11-24) live look / placement exploration while paused at the hold (s = 14). Generalises
// screen05_coord_tune.cs for the bubbles: tries variants on the bubble material (Rainbow/Water/Bubble) and on BubbleField's
// public fields, captures one 864x1536 still per variant into Recordings/Screen05/work/bubbles_var_<tag>_<name>.png with the
// live bubble statistics, then RESTORES every value and re-holds, so the cycle's own still shows exactly the builder state.
// Exploration only: winning values go into WaterBuilder / BubbleField.
// Variants: Recordings/Screen05/work/bubbles_variants.txt, lines "name|target|prop|x,y,z,w"
//   target = mat   (material property: Vector, or Float when it is a float property)
//          | field (BubbleField public field: int / float / uint / Vector2) - re-inits the field and re-runs the hold
//   Several lines with the same name combine into one variant. Tag: Recordings/Screen05/work/bubbles_tag.txt (one word).
var log = new System.Text.StringBuilder();
var bf = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.BubbleField>();
var flow = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05GameFlow>();
var benny = Rainbow.Screen05.BennyController.Instance;
if (bf == null || flow == null || benny == null) return "enter Play mode first (bubbles / flow / Benny missing)";
var mat = bf.GetComponent<MeshRenderer>().sharedMaterial;
var origMat = new Material(mat);
var tBF = typeof(Rainbow.Screen05.BubbleField);
var flags = System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Instance;
var nflags = System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance;
var origF = new System.Collections.Generic.Dictionary<System.Reflection.FieldInfo, object>();
foreach (var fi in tBF.GetFields(flags)) origF[fi] = fi.GetValue(bf);
var fBub = tBF.GetField("bubbles", nflags);
var fMesh = tBF.GetField("mesh", nflags);
var fLast = tBF.GetField("lastS", nflags);
var cam = Camera.main;
var hud = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05Hud>();

void Reinit()
{
    var m = fMesh.GetValue(bf) as Mesh;
    if (m != null) UnityEngine.Object.Destroy(m);
    fMesh.SetValue(bf, null);
    fBub.SetValue(bf, null);
    fLast.SetValue(bf, float.NaN);
}

async System.Threading.Tasks.Task<string> Hold()
{
    // = screen05_hold_approved.cs (restart, teleport so that 45 swim steps end on s = 14, pause in that exact frame)
    float targetS = 14f;
    int settleFrames = 45;
    if (EditorApplication.isPaused) EditorApplication.isPaused = false;
    Time.captureFramerate = 30;
    int f0 = Time.frameCount;
    await Wait.Until(() => Time.frameCount >= f0 + 3, timeoutMs: 30000, because: "the Game view is not ticking");
    var route = benny.route;
    route.EnsureReady();
    float step = benny.swimSpeed / 30f;
    float startS = route.SAtDistance(route.DistanceAtS(targetS) - settleFrames * step);
    var hook = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05CaptureFrameHook>();
    GameObject hookGo = null;
    if (hook == null) { hookGo = new GameObject("HoldFrameHook (temp)"); hook = hookGo.AddComponent<Rainbow.Screen05.Screen05CaptureFrameHook>(); }
    bool armed = false, hit = false;
    System.Action<int> onLate = (fc) =>
    {
        if (!armed || hit || benny.S < targetS - 0.05f) return;
        hit = true;
        EditorApplication.isPaused = true;
    };
    Rainbow.Screen05.Screen05CaptureFrameHook.LateFrame += onLate;
    string tries = "";
    try
    {
        for (int pass = 0; pass < 3; pass++)
        {
            if (EditorApplication.isPaused) EditorApplication.isPaused = false;
            int fu = Time.frameCount;
            await Wait.Until(() => Time.frameCount >= fu + 2, timeoutMs: 30000, because: "the Game view is not ticking");
            flow.Restart();
            if (hud != null) hud.ShowHint("", 0f);
            if (benny.animator != null) { benny.animator.Rebind(); benny.animator.Update(0f); }
            benny.TeleportTo(startS, Rainbow.Screen05.RiverPath.Meander(startS));
            Rainbow.Screen05.Screen05Clock.Reset(0f);
            hit = false; armed = true;
            await Wait.Until(() => hit && EditorApplication.isPaused, timeoutMs: 30000, because: "Benny did not reach s = 14");
            armed = false;
            float err = benny.S - targetS;
            tries += (tries.Length > 0 ? "," : "") + benny.S.ToString("0.00");
            if (Mathf.Abs(err) < 0.02f) break;
            startS = route.SAtDistance(route.DistanceAtS(startS) - err);
        }
    }
    finally
    {
        Rainbow.Screen05.Screen05CaptureFrameHook.LateFrame -= onLate;
        if (hookGo != null) UnityEngine.Object.Destroy(hookGo);
    }
    Time.captureFramerate = 0;
    return "S=" + benny.S.ToString("0.00") + " tries " + tries;
}

string Stats(bool rows)
{
    var mesh = bf.GetComponent<MeshFilter>().sharedMesh;
    float nf = mat.GetFloat("_NearFade"), capB = mat.GetFloat("_MaxPx"), capS = mat.GetFloat("_MaxPxSmall");
    Matrix4x4 P = Matrix4x4.Perspective(cam.fieldOfView, 864f / 1536f, cam.nearClipPlane, cam.farClipPlane);
    Matrix4x4 V = cam.worldToCameraMatrix;
    Matrix4x4 VP = P * V;
    float focal = 1536f / (2f * Mathf.Tan(cam.fieldOfView * 0.5f * Mathf.Deg2Rad));
    var v = mesh.vertices; var c = mesh.colors32; var uv = new System.Collections.Generic.List<Vector4>(); mesh.GetUVs(0, uv);
    int vis = 0, dBig = 0, dMed = 0, dSmall = 0, left = 0, right = 0;
    var sb = new System.Text.StringBuilder();
    var list = new System.Collections.Generic.List<System.Tuple<float, string>>();
    for (int i = 0; i < v.Length; i += 4)
    {
        Vector3 w = bf.transform.TransformPoint(v[i]);
        float depth = -V.MultiplyPoint3x4(w).z;
        Vector4 cc = VP * new Vector4(w.x, w.y, w.z, 1f);
        if (cc.w <= 0.01f) continue;
        float sx = (cc.x / cc.w * 0.5f + 0.5f) * 864f, sy = (1f - (cc.y / cc.w * 0.5f + 0.5f)) * 1536f;
        bool small = uv[i].w >= 1f;
        float rpx = depth > 0.01f ? Mathf.Min(uv[i].z * focal / depth, small ? capS : capB) : 0f;
        float t = Mathf.Clamp01((depth - nf) / (nf * 0.8f)); float near = t * t * (3f - 2f * t);
        float a = c[i].a / 255f * near;
        bool iv = depth > 0f && sx > -rpx && sx < 864f + rpx && sy > -rpx && sy < 1536f + rpx && a > 0.05f && rpx > 0.5f;
        if (!iv) continue;
        vis++;
        float dia = 2f * rpx;
        if (dia >= 48f) dBig++; else if (dia >= 20f) dMed++; else dSmall++;
        if (sx < 432f) left++; else right++;
        string kind = (i / 4 >= bf.bigCount + bf.smallCount) ? (small ? "w" : "W") : (small ? "s" : "B");
        list.Add(System.Tuple.Create(sy, string.Format("    {0} ({1,4:0},{2,5:0}) d {3,3:0} a {4:0.00} depth {5,4:0.0}", kind, sx, sy, dia, a, depth)));
    }
    sb.Append("visible " + vis + " (d>=48: " + dBig + ", 20-48: " + dMed + ", <20: " + dSmall + "; left " + left + ", right " + right + ")");
    if (rows)
    {
        list.Sort((x, y) => x.Item1.CompareTo(y.Item1));
        foreach (var r in list) sb.AppendLine().Append(r.Item2);
    }
    return sb.ToString();
}

void RestoreAll()
{
    mat.CopyPropertiesFromMaterial(origMat);
    foreach (var kv in origF) kv.Key.SetValue(bf, kv.Value);
}

string tag = System.IO.File.Exists("Recordings/Screen05/work/bubbles_tag.txt") ? System.IO.File.ReadAllText("Recordings/Screen05/work/bubbles_tag.txt").Trim() : "x";
var lines = System.IO.File.Exists("Recordings/Screen05/work/bubbles_variants.txt") ? System.IO.File.ReadAllLines("Recordings/Screen05/work/bubbles_variants.txt") : new string[0];
var order = new System.Collections.Generic.List<string>();
foreach (var l in lines) { var p = l.Split('|'); if (p.Length >= 4 && !l.TrimStart().StartsWith("#") && !order.Contains(p[0])) order.Add(p[0]); }
log.AppendLine("builder state: " + Stats(true));
bool lastHadFields = false;
foreach (var name in order)
{
    RestoreAll();
    bool hasFields = false;
    float swimSecs = 0f;
    foreach (var l in lines)
    {
        var p = l.Split('|'); if (p.Length < 4 || p[0] != name || l.TrimStart().StartsWith("#")) continue;
        var vv = p[3].Split(','); var f = new float[4];
        for (int i = 0; i < 4; i++) f[i] = i < vv.Length ? float.Parse(vv[i], System.Globalization.CultureInfo.InvariantCulture) : 0f;
        if (p[1] == "swim") { swimSecs = f[0]; continue; }   // steady state: swim on from the hold for x s before the still
        if (p[1] == "mat")
        {
            if (!mat.HasProperty(p[2])) { log.AppendLine("no prop " + p[2]); continue; }
            var sh = mat.shader; int idx = sh.FindPropertyIndex(p[2]);
            if (idx >= 0 && (sh.GetPropertyType(idx) == UnityEngine.Rendering.ShaderPropertyType.Float || sh.GetPropertyType(idx) == UnityEngine.Rendering.ShaderPropertyType.Range)) mat.SetFloat(p[2], f[0]);
            else mat.SetVector(p[2], new Vector4(f[0], f[1], f[2], f[3]));
        }
        else if (p[1] == "field")
        {
            var fi = tBF.GetField(p[2], flags);
            if (fi == null) { log.AppendLine("no field " + p[2]); continue; }
            if (fi.FieldType == typeof(int)) fi.SetValue(bf, Mathf.RoundToInt(f[0]));
            else if (fi.FieldType == typeof(float)) fi.SetValue(bf, f[0]);
            else if (fi.FieldType == typeof(uint)) fi.SetValue(bf, (uint)Mathf.RoundToInt(f[0]));
            else if (fi.FieldType == typeof(Vector2)) fi.SetValue(bf, new Vector2(f[0], f[1]));
            else { log.AppendLine("field type " + fi.FieldType.Name + " not supported"); continue; }
            hasFields = true;
        }
        else log.AppendLine("unknown target " + p[1]);
    }
    string held = "";
    if (hasFields || lastHadFields) { Reinit(); held = " | hold " + await Hold(); }
    lastHadFields = hasFields;
    if (swimSecs > 0f)
    {
        // swim straight on (no teleport, no respawn of the field) and pause again: the bubbles' steady state
        Time.captureFramerate = 30;
        EditorApplication.isPaused = false;
        int fs = Time.frameCount;
        int nf = Mathf.RoundToInt(swimSecs * 30f);
        await Wait.Until(() => Time.frameCount >= fs + nf, timeoutMs: 60000, because: "the Game view is not ticking");
        EditorApplication.isPaused = true;
        int fp = Time.frameCount;
        await Wait.Until(() => Time.frameCount >= fp + 1 || EditorApplication.isPaused, timeoutMs: 10000, because: "pause");
        Time.captureFramerate = 0;
        held += " | swam " + swimSecs.ToString("0.0") + " s to S=" + benny.S.ToString("0.00");
        lastHadFields = true;   // the next variant re-holds
    }
    string png = Rainbow.Screen05.EditorTools.Screen05Capture.CaptureStill("Recordings/Screen05/work/bubbles_var_" + tag + "_" + name + ".png", 864, 1536);
    log.AppendLine(name + held + " | " + Stats(false) + " -> " + png);
}
RestoreAll();
if (lastHadFields) { Reinit(); log.AppendLine("restored + re-held " + await Hold() + " | " + Stats(false)); }
else log.AppendLine("restored (look only)");
return log.ToString();

// PLAY MODE. Motion check: restarts the run, drives SwimInputOverride with a small program, grabs every n-th frame of the REAL game
// camera (post + HUD) into one contact sheet, and prints smoothness numbers (per-frame steps and second differences of Benny's
// position / heading / lean and of the camera), so teleports, snaps and jerks show up as numbers.
// Parameters: Recordings/Screen05/work/strip_params.txt (key=value lines):
//   s0=14  frames=240  every=10  cols=8  w=216  h=384  hud=0  out=Recordings/Screen05/work/strip.png
//   inputs=0:0;20:-1;45:1;70:0;90:J      (frame:steer  or  frame:J = jump)
var ci = System.Globalization.CultureInfo.InvariantCulture;
var kv = new System.Collections.Generic.Dictionary<string, string>();
foreach (var line in System.IO.File.ReadAllLines("Recordings/Screen05/work/strip_params.txt"))
{
    int e = line.IndexOf('='); if (e > 0 && !line.StartsWith("#")) kv[line.Substring(0, e).Trim()] = line.Substring(e + 1).Trim();
}
string G(string k, string d) => kv.ContainsKey(k) ? kv[k] : d;
float F(string k, float d) => kv.ContainsKey(k) ? float.Parse(kv[k], ci) : d;
int frames = (int)F("frames", 240), every = (int)F("every", 10), cols = (int)F("cols", 8), w = (int)F("w", 216), h = (int)F("h", 384);
float s0 = F("s0", 14f);
bool hud = F("hud", 0f) > 0.5f;
var prog = new System.Collections.Generic.List<(int f, string v)>();
foreach (var t in G("inputs", "0:0").Split(';')) { var p = t.Split(':'); if (p.Length == 2) prog.Add((int.Parse(p[0]), p[1].Trim())); }
var flow = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05GameFlow>();
if (flow == null) return "enter Play mode first";
if (EditorApplication.isPaused) EditorApplication.isPaused = false;
Time.captureFramerate = 30;
int f0 = Time.frameCount;
await Wait.Until(() => Time.frameCount >= f0 + 3, timeoutMs: 30000, because: "game view not ticking");
flow.Restart();
var hudC = UnityEngine.Object.FindAnyObjectByType<Rainbow.Screen05.Screen05Hud>(); if (hudC != null) hudC.ShowHint("", 0f);
var benny = Rainbow.Screen05.BennyController.Instance;
Vector3 rp0, rf0, rr0; benny.route.SampleAtS(s0, out rp0, out rf0, out rr0);
benny.TeleportTo(s0, rp0.x);
Rainbow.Screen05.Screen05Clock.Reset(0f);
Rainbow.Screen05.SwimInputOverride.Active = true; Rainbow.Screen05.SwimInputOverride.Steer = 0f;
var cam = Camera.main;
var grab = new Rainbow.Screen05.EditorTools.Screen05FrameGrabber(w, h);
int n = (frames + every - 1) / every, rows = (n + cols - 1) / cols;
var sheet = new Texture2D(cols * (w + 4), rows * (h + 4), TextureFormat.RGB24, false);
int fi = 0, shot = 0, pi = 0; bool done = false; string err = null;
var log = new System.Collections.Generic.List<float[]>();
int coins0 = flow.Score, hearts0 = flow.Hearts;
var hookGo = new GameObject("StripHook (temp)"); hookGo.AddComponent<Rainbow.Screen05.Screen05CaptureFrameHook>();
Transform vis = benny.visual;
Transform lean = vis != null ? vis.Find("Lean") : null;
System.Action<int> onLate = (fc) =>
{
    if (done) return;
    try
    {
        while (pi < prog.Count && prog[pi].f <= fi)
        {
            if (prog[pi].v == "J") Rainbow.Screen05.SwimInputOverride.JumpRequested = true;
            else Rainbow.Screen05.SwimInputOverride.Steer = float.Parse(prog[pi].v, ci);
            pi++;
        }
        Vector3 bp = benny.transform.position, cp = cam.transform.position, be = benny.transform.eulerAngles, ce = cam.transform.eulerAngles;
        Vector3 le = lean != null ? lean.localEulerAngles : Vector3.zero;
        float D(float a) => Mathf.DeltaAngle(0f, a);
        log.Add(new[] { bp.x, vis.position.y, bp.z, D(be.y), cp.x, cp.y, cp.z, D(ce.y), D(ce.x), D(le.z), D(ce.z) });
        if (fi % every == 0 && shot < n)
        {
            string e = grab.Grab(cam, hud);
            if (e != null) { err = e; done = true; return; }
            int cx = shot % cols, cy = rows - 1 - shot / cols;
            sheet.SetPixels(cx * (w + 4), cy * (h + 4), w, h, grab.Frame.GetPixels());
            shot++;
        }
        fi++;
        if (fi >= frames) done = true;
    }
    catch (System.Exception ex) { err = ex.Message; done = true; }
};
Rainbow.Screen05.Screen05CaptureFrameHook.LateFrame += onLate;
try { await Wait.Until(() => done, timeoutMs: 600000, because: "strip did not finish"); }
finally
{
    Rainbow.Screen05.Screen05CaptureFrameHook.LateFrame -= onLate;
    UnityEngine.Object.Destroy(hookGo);
    Time.captureFramerate = 0;
    Rainbow.Screen05.SwimInputOverride.Active = false;
    grab.Dispose();
}
EditorApplication.isPaused = true;
sheet.Apply(false);
string outp = G("out", "Recordings/Screen05/work/strip.png");
System.IO.File.WriteAllBytes(outp, sheet.EncodeToJPG(82));
UnityEngine.Object.DestroyImmediate(sheet);
if (err != null) return "ERROR " + err;
string[] nm = { "bennyX", "bennyY", "bennyS", "bennyYaw", "camX", "camY", "camZ", "camYaw", "camPitch", "leanRoll", "camRoll" };
var sb = new System.Text.StringBuilder("frames " + log.Count + " shots " + shot + " S " + log[0][2].ToString("0.0", ci) + " -> " + log[log.Count - 1][2].ToString("0.0", ci)
    + " score " + coins0 + " -> " + flow.Score + " hearts " + hearts0 + " -> " + flow.Hearts + " state " + flow.Current + " | " + outp + "\n");
for (int c = 0; c < nm.Length; c++)
{
    float mn = 1e9f, mx = -1e9f, d1 = 0f, d2 = 0f; int d1f = 0, d2f = 0;
    for (int i = 0; i < log.Count; i++)
    {
        float v = log[i][c]; mn = Mathf.Min(mn, v); mx = Mathf.Max(mx, v);
        if (i > 0) { float a = Mathf.Abs(v - log[i - 1][c]); if (a > d1) { d1 = a; d1f = i; } }
        if (i > 1) { float b = Mathf.Abs(v - 2f * log[i - 1][c] + log[i - 2][c]); if (b > d2) { d2 = b; d2f = i; } }
    }
    sb.Append(nm[c].PadRight(9) + " min " + mn.ToString("0.00", ci) + " max " + mx.ToString("0.00", ci) + " | max step " + d1.ToString("0.000", ci) + " @f" + d1f
        + " | max 2nd diff " + d2.ToString("0.000", ci) + " @f" + d2f + "\n");
}
return sb.ToString();

// READ-ONLY DESIGN CALCULATION (no project files touched): integrates the proposed 12-stop adventure route from heading / slope / speed profiles
// (natural cubic splines) and prints per-stop numbers; writes the sampled route as JSON next to the design plan work files.
float[] T = { 0,10,25,45,62,80,95,105, 117,125,131,138,145,153,161,169,177,185,193,203,215,229,243,257,271,281,289, 297,309,325,343,361,379,397,417,437,457,477,497,510, 525,545,565,590,615,640,660, 700,760,820,880,908, 925,950,980,1010,1040,1070,1098, 1118,1138,1158,1178,1198,1222,1248, 1262,1280,1300,1318,1332,1346,1362,1378, 1395,1420,1450,1480,1510,1530,1548, 1575,1610,1645,1680,1715,1740,1755, 1775,1795,1812,1825, 1840,1855,1870 };
float[] H = { -60,-60,-50,-15,10,0,-7,-7, -6,-5,-3,1,6,13,20,25,23,17,10,4,3,9,18,22,15,8,4, 0,-10,-24,-32,-28,-10,22,70,124,182,246,318,364, 395,412,405,380,345,352,360, 361,359,361,360,360, 345,300,225,145,70,10,-10, 30,-25,35,-20,40,10,0, -5,-10,-12,-10,-5,5,10,10, 25,65,125,185,245,270,280, 340,435,530,625,720,780,805, 798,775,758,748, 742,738,736 };
float[] S = { -4,-18,-30,-27,-22,-12,-2,0, 2,4.5f,6.5f,9,11.5f,15.5f,19.5f,22,21,14,7.5f,6,9.5f,17,24,25.5f,18,8,-2, -9,-18,-24,-25,-21,-16.5f,-12,-8,-5,-4,-4,-5,-9, -16,-18,-14,-10,-9,-5,0, 0,0,0,0,0, 3,6,6,6,5,3,0, -3,-4,-3,-2,-3,-2,2, 12,24,26,16,0,-14,-20,-24, -34,-38,-36,-32,-24,-12,-3, 2.5f,4.6f,4.6f,4.6f,4.6f,4.6f,5, 16,14,4,-2, -5,-2,0 };
float[] VT = { 0,25,60,90,105,125,150,185,230,265,289,325,360,397,437,497,510,545,600,640,660,700,880,908,950,1050,1098,1150,1248,1290,1332,1378,1420,1470,1530,1560,1700,1755,1795,1825,1845,1870 };
float[] VV = { 4,11,15,13,10,8,8.8f,10,11.2f,12.2f,9.6f,14,18.2f,16.5f,15.5f,16,17,20,20,16,13,12,12,13,14.5f,14,13.5f,13,13,11,9,15,22,25,23,20,19.5f,17,13,12,9.5f,3f };
string[] names = { "Splash Down","Swim Up the Rainbow","Whirlpool Twirl","Into Whirlpool Twirl","Flow Into the Current","Bubble Dash Chamber","Sock Rescue Tunnel","Crest the Rinse Arch","Dive the Washer Tube","Final Spin Chamber","Ride the Final Wave","Slide Into Hiding" };
float[] cut = { 0,105,290,510,660,908,1098,1248,1378,1548,1755,1825,1870 };
System.Func<float[], float[], float[]> mk = (x, y) => {
    int n = x.Length; var a = new float[n]; var b = new float[n]; var c = new float[n]; var d = new float[n]; var m = new float[n];
    b[0] = b[n - 1] = 1f;
    for (int i = 1; i < n - 1; i++) { float h0 = x[i] - x[i - 1], h1 = x[i + 1] - x[i]; a[i] = h0; b[i] = 2 * (h0 + h1); c[i] = h1; d[i] = 6 * ((y[i + 1] - y[i]) / h1 - (y[i] - y[i - 1]) / h0); }
    for (int i = 1; i < n; i++) { float w = a[i] / b[i - 1]; b[i] -= w * c[i - 1]; d[i] -= w * d[i - 1]; }
    m[n - 1] = d[n - 1] / b[n - 1];
    for (int i = n - 2; i >= 0; i--) m[i] = (d[i] - c[i] * m[i + 1]) / b[i];
    return m;
};
System.Func<float[], float[], float[], float, float> ev = (x, y, m, v) => {
    int n = x.Length; v = Mathf.Clamp(v, x[0], x[n - 1]); int i = 0; while (i < n - 2 && v > x[i + 1]) i++;
    float h = x[i + 1] - x[i], A = (x[i + 1] - v) / h, B = (v - x[i]) / h;
    return A * y[i] + B * y[i + 1] + ((A * A * A - A) * m[i] + (B * B * B - B) * m[i + 1]) * h * h / 6f;
};
var mH = mk(T, H); var mS = mk(T, S);
System.Func<float, float> sp = (v) => { int i = 0; while (i < VT.Length - 2 && v > VT[i + 1]) i++; float t = Mathf.Clamp01((v - VT[i]) / (VT[i + 1] - VT[i])); t = t * t * (3 - 2 * t); return Mathf.Lerp(VV[i], VV[i + 1], t); };
int N = 1870 * 4 + 1; var P = new Vector3[N]; var tm = new float[N]; var hh = new float[N]; var ss = new float[N]; var vv = new float[N];
for (int i = 0; i < N; i++) { float u = i * 0.25f; hh[i] = ev(T, H, mH, u); ss[i] = ev(T, S, mS, u); vv[i] = sp(u); }
for (int i = 1; i < N; i++) { float h = 0.5f * (hh[i] + hh[i - 1]) * Mathf.Deg2Rad, s = 0.5f * (ss[i] + ss[i - 1]) * Mathf.Deg2Rad; P[i] = P[i - 1] + 0.25f * new Vector3(Mathf.Cos(s) * Mathf.Sin(h), Mathf.Sin(s), Mathf.Cos(s) * Mathf.Cos(h)); tm[i] = tm[i - 1] + 0.25f / (0.5f * (vv[i] + vv[i - 1])); }
int zero = 660 * 4; Vector3 o = P[zero]; for (int i = 0; i < N; i++) P[i] -= o;   // Stop 5 (Screen 05) keeps its own origin and heading +Z
var sb = new System.Text.StringBuilder();
sb.AppendLine("TOTAL " + 1870 + " m, " + tm[N - 1].ToString("0.0") + " s");
for (int k = 0; k < 12; k++)
{
    int a = (int)(cut[k] * 4), b = (int)(cut[k + 1] * 4);
    float smin = 99, smax = -99, vmin = 99, vmax = 0, rmin = 9999, yaw = 0, lat = 0;
    for (int i = Mathf.Max(a, 2); i < Mathf.Min(b, N - 2); i++)
    {
        smin = Mathf.Min(smin, ss[i]); smax = Mathf.Max(smax, ss[i]); vmin = Mathf.Min(vmin, vv[i]); vmax = Mathf.Max(vmax, vv[i]);
        float kap = (hh[i + 2] - hh[i - 2]) * Mathf.Deg2Rad / 1f; if (Mathf.Abs(kap) > 1e-4f) rmin = Mathf.Min(rmin, 1f / Mathf.Abs(kap));
        yaw = Mathf.Max(yaw, Mathf.Abs(kap) * vv[i] * Mathf.Rad2Deg); lat = Mathf.Max(lat, Mathf.Abs(kap) * vv[i] * vv[i] / 9.81f);
    }
    sb.AppendLine(string.Format("{0,2} {1,-24} {2,4:0} m {3,5:0.0} s  y {4,6:0.0} -> {5,6:0.0} ({6,6:0.0})  slope {7,5:0}..{8,4:0}  v {9,4:0.0}-{10,4:0.0}  Rmin {11,5:0}  yaw {12,4:0} deg/s  lat {13,4:0.0} g", k + 1, names[k], cut[k + 1] - cut[k], tm[b] - tm[a], P[a].y, P[b].y, P[b].y - P[a].y, smin, smax, vmin, vmax, rmin, yaw, lat));
}
// closest approach between different parts of the course (> 60 m apart along it)
float worst = 1e9f; int wi = 0, wj = 0;
for (int i = 0; i < N; i += 8) for (int j = i + 240; j < N; j += 8) { float d = (P[i] - P[j]).magnitude; if (d < worst) { worst = d; wi = i; wj = j; } }
sb.AppendLine("closest approach between parts > 60 m apart: " + worst.ToString("0.0") + " m at u " + wi / 4 + " and " + wj / 4);
int cnt = 0; for (int i = 0; i < N; i += 8) for (int j = i + 240; j < N; j += 8) if ((P[i] - P[j]).magnitude < 11f) { cnt++; if (cnt < 12) sb.AppendLine("  < 11 m: u " + i / 4 + " / " + j / 4 + " = " + (P[i] - P[j]).magnitude.ToString("0.0")); }
var js = new System.Text.StringBuilder("{\"cut\":[" + string.Join(",", cut) + "],\"pts\":[");
for (int i = 0; i < N; i += 12) { if (i > 0) js.Append(','); js.AppendFormat(System.Globalization.CultureInfo.InvariantCulture, "[{0:0.0},{1:0.0},{2:0.0},{3:0},{4:0.00},{5:0.0},{6:0.0}]", P[i].x, P[i].y, P[i].z, i / 4f, tm[i], vv[i], ss[i]); }
js.Append("]}");
System.IO.File.WriteAllText(@"C:\Users\josia\AppData\Local\Temp\claude\f4692f1b7f3bf9b5\2bf4840d-6c45-43b8-bd34-75c27bee0f22\scratchpad\route.json", js.ToString());
return sb.ToString();

// Targets05.cs - measurement core for measure-targets.ps1 (C# 5, .NET Framework, System.Drawing). Read-only on the input image.
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Globalization;
using System.Runtime.InteropServices;
using System.Text;

public class JO { public List<string> K = new List<string>(); public List<object> V = new List<object>();
  public JO A(string k, object v) { K.Add(k); V.Add(v); return this; } }

public static class T05 {
  public static int W, H;
  public static byte[] R, G, B, Cl, Sm;
  public static float[] Hu, Sa, Lu;
  public const string Codes = "cpvwgd.";   // 0 water cyan/blue, 1 pink/magenta, 2 violet, 3 white/pearl, 4 gold/copper/yellow, 5 dark, 6 other
  const int CW = 0, CP = 1, CV = 2, CWH = 3, CG = 4, CD = 5, CO = 6;
  static bool approved;
  static int[] FLab; static bool[] FBig; static long[] FArea;
  static List<Action<Graphics>> draw = new List<Action<Graphics>>();

  // ---------------- pixel classification (HSV) ----------------
  public static byte Classify(int r, int g, int b, out float h, out float s) {
    int mx = Math.Max(r, Math.Max(g, b)), mn = Math.Min(r, Math.Min(g, b));
    double d = mx - mn, hh = 0; s = mx > 0 ? (float)(d / mx) : 0;
    if (d > 0) { if (mx == r) hh = 60 * (((g - b) / d) % 6); else if (mx == g) hh = 60 * (((b - r) / d) + 2); else hh = 60 * (((r - g) / d) + 4); }
    if (hh < 0) hh += 360; h = (float)hh;
    if (mx < 90) return CD;
    if (s < 0.36 && mx >= 195) return CWH;
    if ((hh >= 345 || hh < 65) && s >= 0.30 && mx >= 110) return CG;
    if (s < 0.35) return CO;
    if (hh >= 165 && hh < 248) return CW;
    if (hh >= 290 && hh < 345) return CP;
    if (hh >= 248 && hh < 290) return CV;
    return CO;
  }
  static void Load(string path) {
    var bmp = new Bitmap(path); W = bmp.Width; H = bmp.Height;
    var data = bmp.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
    int st = data.Stride; byte[] px = new byte[st * H]; Marshal.Copy(data.Scan0, px, 0, px.Length); bmp.UnlockBits(data); bmp.Dispose();
    int N = W * H; R = new byte[N]; G = new byte[N]; B = new byte[N]; Cl = new byte[N]; Hu = new float[N]; Sa = new float[N]; Lu = new float[N];
    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
      int o = y * st + x * 3, i = y * W + x; R[i] = px[o + 2]; G[i] = px[o + 1]; B[i] = px[o];
      float h, s; Cl[i] = Classify(R[i], G[i], B[i], out h, out s); Hu[i] = h; Sa[i] = s; Lu[i] = (float)(0.299 * R[i] + 0.587 * G[i] + 0.114 * B[i]);
    }
    Sm = ModeFilter(Cl, 7, 2);
  }
  static byte[] ModeFilter(byte[] src, int K, int rad) {
    var I = new int[K][]; int W1 = W + 1;
    for (int k = 0; k < K; k++) I[k] = new int[W1 * (H + 1)];
    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) { int c = src[y * W + x]; for (int k = 0; k < K; k++) I[k][(y + 1) * W1 + x + 1] = I[k][y * W1 + x + 1] + I[k][(y + 1) * W1 + x] - I[k][y * W1 + x] + (c == k ? 1 : 0); }
    var o = new byte[W * H];
    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
      int x0 = Math.Max(0, x - rad), x1 = Math.Min(W, x + rad + 1), y0 = Math.Max(0, y - rad), y1 = Math.Min(H, y + rad + 1);
      int best = -1, bk = CO; for (int k = 0; k < K; k++) { int n = I[k][y1 * W1 + x1] - I[k][y0 * W1 + x1] - I[k][y1 * W1 + x0] + I[k][y0 * W1 + x0]; if (n > best) { best = n; bk = k; } }
      o[y * W + x] = (byte)bk;
    }
    return o;
  }
  static int S(int x, int y) { return Sm[y * W + x]; }
  static double Frac(byte[] m, int k, int x0, int x1, int y0, int y1) {
    int n = 0, c = 0;
    for (int y = Math.Max(0, y0); y <= Math.Min(H - 1, y1); y++) for (int x = Math.Max(0, x0); x <= Math.Min(W - 1, x1); x++) { n++; if (m[y * W + x] == k) c++; }
    return n > 0 ? (double)c / n : 0;
  }
  static double MeanL(int x0, int x1, int y0, int y1) {
    double t = 0; int n = 0;
    for (int y = Math.Max(0, y0); y <= Math.Min(H - 1, y1); y++) for (int x = Math.Max(0, x0); x <= Math.Min(W - 1, x1); x++) { n++; t += Lu[y * W + x]; }
    return n > 0 ? t / n : 0;
  }
  // connected components (8-conn) of mask; returns label array and stats [area, x0, y0, x1, y1, sumx, sumy]
  static int[] Label(bool[] m, out List<long[]> stats) {
    var lab = new int[W * H]; stats = new List<long[]>(); var st = new Stack<int>(); int L = 0;
    for (int i = 0; i < W * H; i++) {
      if (!m[i] || lab[i] != 0) continue; L++; var s = new long[] { 0, W, H, -1, -1, 0, 0 }; lab[i] = L; st.Push(i);
      while (st.Count > 0) {
        int p = st.Pop(), px = p % W, py = p / W; s[0]++; s[1] = Math.Min(s[1], px); s[2] = Math.Min(s[2], py); s[3] = Math.Max(s[3], px); s[4] = Math.Max(s[4], py); s[5] += px; s[6] += py;
        for (int dy = -1; dy <= 1; dy++) for (int dx = -1; dx <= 1; dx++) {
          int nx = px + dx, ny = py + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; int q = ny * W + nx;
          if (m[q] && lab[q] == 0) { lab[q] = L; st.Push(q); }
        }
      }
      stats.Add(s);
    }
    return lab;
  }
  static double R1(double v) { return Math.Round(v, 1); }
  static double[] P(double x, double y) { return new double[] { R1(x), R1(y) }; }
  static List<int[]> RunsOf(Func<int, bool> pred, int a, int b, int mergeGap, int minLen) {
    var runs = new List<int[]>(); int s = -1;
    for (int i = a; i <= b + 1; i++) {
      bool on = i <= b && pred(i);
      if (on && s < 0) s = i;
      if (!on && s >= 0) { runs.Add(new int[] { s, i - 1 }); s = -1; }
    }
    var m = new List<int[]>();
    foreach (var r in runs) { if (m.Count > 0 && r[0] - m[m.Count - 1][1] - 1 <= mergeGap) m[m.Count - 1][1] = r[1]; else m.Add(new int[] { r[0], r[1] }); }
    m.RemoveAll(r => r[1] - r[0] + 1 < minLen);
    return m;
  }

  // ---------------- main ----------------
  public static string Run(string path, string sha, bool isApproved, string overlay, string checkDir) {
    approved = isApproved; draw.Clear();
    Load(path);
    var root = new JO();
    root.A("meta", new JO().A("image", path).A("sha256", sha).A("approved_reference", isApproved).A("size", new int[] { W, H })
      .A("generated_by", "staging/round3-fit/measure-targets.ps1 (+Targets05.cs)").A("generated_utc", DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"))
      .A("conventions", "pixel coordinates of the 864x1536 frame, x right, y down, origin top-left pixel corner; polylines are [[y, x], ...] where stated; null = not visible / occluded / not measurable")
      .A("tol", "per-feature 1-sigma-ish accuracy of the measurement in px (a fit is 'on target' when |pred - target| <= tol)")
      .A("method", "auto = measured by this script from HSV colour classes (+5x5 mode filter, run/blob logic); manual = hand-measured on zoomed crops of the APPROVED image only")
      .A("classes", "c water cyan/blue, p pink/magenta (river satin bands AND wall magenta AND Benny fur), v violet, w white/pearl (foam, highlights, stripes), g gold/copper/yellow, d dark, . other"));
    if (W != 864 || H != 1536) root.A("warning", "image is not 864x1536; all fields assume that framing");
    // vanishing point
    double vpx, vpy; VanishingPoint(out vpx, out vpy);
    root.A("vanishing_point", new JO().A("x", R1(vpx)).A("y", R1(vpy)).A("tol", 3).A("method", "auto").A("how", "centroid of the whitest/brightest blob in the throat window x400-600, y400-540"));
    int ivx = (int)Math.Round(vpx), ivy = (int)Math.Round(vpy);
    draw.Add(g => { using (var p = new Pen(Color.Lime, 2)) { g.DrawLine(p, (float)vpx - 12, (float)vpy, (float)vpx + 12, (float)vpy); g.DrawLine(p, (float)vpx, (float)vpy - 12, (float)vpx, (float)vpy + 12); } Lbl(g, "VP", vpx + 6, vpy + 4, Color.Lime); });
    // rings + throat
    var throat = new JO(); var rings = Rings(ivx, ivy, throat);
    root.A("rings", rings);
    root.A("throat", throat);
    // benny (needed as occluder for river rows)
    int[] bx0, bx1; int btop, bbot; var benny = Benny(out bx0, out bx1, out btop, out bbot);
    // coins
    var coinBoxes = new List<int[]>(); var coins = Coins(ivx, ivy, btop, coinBoxes);
    // river rows, junction, foam heights
    JO junction, foamH; var rows = RiverRows(ivx, ivy, bx0, bx1, btop, bbot, coinBoxes, out junction, out foamH);
    root.A("wall_foam_junction", junction);
    root.A("river_rows", rows);
    root.A("foam_height", foamH);
    root.A("paddles", Paddles());
    root.A("benny", benny);
    root.A("splash", Splash(bx0, bx1, btop, bbot));
    root.A("coins", coins);
    root.A("bubbles", Bubbles());
    root.A("hud", Hud());
    if (!string.IsNullOrEmpty(overlay)) SaveOverlay(path, overlay, checkDir);
    var sb = new StringBuilder(); Ser(root, sb, 0); return sb.ToString();
  }

  // ---------------- vanishing point ----------------
  static void VanishingPoint(out double vx, out double vy) {
    int x0 = 400, x1 = 600, y0 = 400, y1 = 540, r = 6; double best = -1; int bx = 496, by = 478;
    var wh = new double[W * H];
    for (int y = y0 - r; y <= y1 + r; y++) for (int x = x0 - r; x <= x1 + r; x++) { int i = y * W + x; wh[i] = Lu[i] * (1 - Sa[i]); }
    for (int y = y0; y <= y1; y++) for (int x = x0; x <= x1; x++) {
      double t = 0; for (int dy = -r; dy <= r; dy += 2) for (int dx = -r; dx <= r; dx += 2) t += wh[(y + dy) * W + x + dx];
      if (t > best) { best = t; bx = x; by = y; }
    }
    double mx = 0; for (int y = by - 14; y <= by + 14; y++) for (int x = bx - 14; x <= bx + 14; x++) mx = Math.Max(mx, wh[y * W + x]);
    double sx = 0, sy = 0, sw = 0;
    for (int y = by - 14; y <= by + 2; y++) for (int x = bx - 14; x <= bx + 14; x++) { double w = wh[y * W + x] - 0.85 * mx; if (w > 0) { sx += w * x; sy += w * y; sw += w; } }
    vx = sw > 0 ? sx / sw : bx; vy = sw > 0 ? sy / sw : by;
  }

  // ---------------- rings ----------------
  static object Rings(int vx, int vy, JO throat) {
    int topLimit = 186;   // below the title banner
    int n = vy - 6 - topLimit + 1; var gy = new double[H]; var ly = new double[H];
    for (int y = topLimit; y <= vy - 4; y++) { gy[y] = Frac(Cl, CG, vx - 3, vx + 3, y, y); ly[y] = MeanL(vx - 3, vx + 3, y, y); }
    // gold runs going upward from the VP
    var runs = RunsOf(i => gy[vy - 4 - i] >= 0.35, 0, vy - 4 - topLimit, 1, 3); // indices i -> y = vy-4-i
    var list = new List<JO>();
    var bands = new List<double[]>(); // [crown_y, outer_y(top), inner_y(bottom), method 0 band/1 peak]
    foreach (var rr in runs) {
      int yb = vy - 4 - rr[0], yt = vy - 4 - rr[1]; // yb bottom (inner edge), yt top (outer edge)
      if (yb >= vy - 12) {
        // merged inner run (halo + thin rings): luminance peaks between grooves
        var sm = new double[H]; for (int y = yt; y <= yb; y++) sm[y] = (ly[Math.Max(yt, y - 1)] + ly[y] + ly[Math.Min(yb, y + 1)]) / 3;
        var peaks = new List<int>();
        for (int y = yt + 1; y <= yb - 1; y++) {
          bool isMax = true; for (int k = 1; k <= 3; k++) { if (y - k >= yt && sm[y - k] > sm[y]) isMax = false; if (y + k <= yb && sm[y + k] > sm[y]) isMax = false; }
          if (!isMax) continue;
          double mn = 1e9; for (int k = -6; k <= 6; k++) if (y + k >= yt && y + k <= yb) mn = Math.Min(mn, sm[y + k]);
          if (sm[y] - mn >= 12 && vy - y >= 12) peaks.Add(y);
        }
        // dedupe peaks closer than 3 px
        var pk = new List<int>(); foreach (var p in peaks) if (pk.Count == 0 || p - pk[pk.Count - 1] > 3) pk.Add(p);
        for (int j = 0; j < pk.Count; j++) {
          int p = pk[j];
          int top = j == 0 ? yt : Groove(sm, pk[j - 1], p); int bot = j == pk.Count - 1 ? Math.Min(yb, p + (p - top)) : Groove(sm, p, pk[j + 1]);
          bands.Add(new double[] { p, top, bot, 1 });
        }
      } else bands.Add(new double[] { (yt + yb) / 2.0, yt, yb, 0 });
    }
    bands.Sort((a, b) => a[0].CompareTo(b[0])); // top (largest radius) first
    // horizontal crowns at y = vy - 8
    int yh = vy - 8;
    var gx = new double[W]; for (int x = 0; x < W; x++) gx[x] = Frac(Cl, CG, x, x, yh - 2, yh + 2);
    var lr = RunsOf(i => gx[vx - 1 - i] >= 0.5, 0, vx - 1, 2, 2);    // i -> x = vx-1-i
    var rr2 = RunsOf(i => gx[vx + 1 + i] >= 0.5, 0, W - vx - 2, 2, 2);
    var leftRuns = new List<double[]>(); foreach (var q in lr) leftRuns.Add(new double[] { vx - 1 - q[1], vx - 1 - q[0] });
    var rightRuns = new List<double[]>(); foreach (var q in rr2) rightRuns.Add(new double[] { vx + 1 + q[0], vx + 1 + q[1] });
    int li = 0, ri = 0;
    // skip halo runs that start next to the VP
    if (leftRuns.Count > 0 && leftRuns[0][1] >= vx - 8) li = 1;
    if (rightRuns.Count > 0 && rightRuns[0][0] <= vx + 8) ri = 1;
    string names = "ABCDEFGHIJKL"; var ringsOut = new List<object>();
    var horiz = new Dictionary<int, double[]>();
    for (int k = bands.Count - 1; k >= 0; k--) {   // inner first
      double r = vy - bands[k][0]; if (r < 40) continue;
      double[] L = null, Rr = null;
      for (int j = li; j < leftRuns.Count; j++) { double c = (leftRuns[j][0] + leftRuns[j][1]) / 2, d = vx - c; if (d >= 0.6 * r && d <= 1.35 * r) { L = leftRuns[j]; li = j + 1; break; } if (d > 1.35 * r) break; }
      for (int j = ri; j < rightRuns.Count; j++) { double c = (rightRuns[j][0] + rightRuns[j][1]) / 2, d = c - vx; if (d >= 0.6 * r && d <= 1.35 * r) { Rr = rightRuns[j]; ri = j + 1; break; } if (d > 1.35 * r) break; }
      horiz[k] = new double[] { L == null ? double.NaN : (L[0] + L[1]) / 2, L == null ? double.NaN : L[1] - L[0] + 1, Rr == null ? double.NaN : (Rr[0] + Rr[1]) / 2, Rr == null ? double.NaN : Rr[1] - Rr[0] + 1 };
    }
    for (int k = 0; k < bands.Count; k++) {
      var b = bands[k]; double r = vy - b[0];
      var o = new JO().A("id", k < names.Length ? names[k].ToString() : "R" + k).A("r_up", R1(r))
        .A("crown_y", R1(b[0])).A("outer_edge_y", b[1]).A("inner_edge_y", b[2]).A("band_px", b[2] - b[1] + 1)
        .A("crown_tol", b[3] == 1 ? 2 : 2).A("edge_tol", b[3] == 1 ? 3 : 2)
        .A("crown_from", b[3] == 1 ? "luminance peak inside the merged gold halo run (thin ring)" : "gold band straight up from the VP (column vp.x+-3)");
      double[] h; if (horiz.TryGetValue(k, out h)) {
        o.A("row_y", yh).A("left_x", double.IsNaN(h[0]) ? null : (object)R1(h[0])).A("left_band_px", double.IsNaN(h[1]) ? null : (object)h[1])
         .A("right_x", double.IsNaN(h[2]) ? null : (object)R1(h[2])).A("right_band_px", double.IsNaN(h[3]) ? null : (object)h[3]).A("x_tol", 3);
        if (!double.IsNaN(h[0]) && !double.IsNaN(h[2])) o.A("centre_x_at_row", R1((h[0] + h[2]) / 2)).A("half_width_at_row", R1((h[2] - h[0]) / 2));
      } else o.A("row_y", yh).A("left_x", null).A("right_x", null).A("note", "inside the throat halo at this row; only the crown is measurable");
      o.A("method", "auto");
      ringsOut.Add(o);
      double cy = b[0], yt = b[1], ybm = b[2]; var hh = horiz.ContainsKey(k) ? horiz[k] : null; string id = k < names.Length ? names[k].ToString() : "R";
      draw.Add(g => { using (var p = new Pen(Color.Cyan, 1)) { g.DrawLine(p, vx - 18, (float)yt, vx + 18, (float)yt); g.DrawLine(p, vx - 18, (float)ybm, vx + 18, (float)ybm); } using (var p2 = new Pen(Color.Yellow, 2)) g.DrawLine(p2, vx - 8, (float)cy, vx + 8, (float)cy);
        if (cy < vy - 40 || id == "E") Lbl(g, id, vx + 20, cy - 7, Color.Yellow);
        if (hh != null) { using (var p3 = new Pen(Color.Yellow, 2)) { if (!double.IsNaN(hh[0])) g.DrawLine(p3, (float)hh[0], yh - 9, (float)hh[0], yh + 9); if (!double.IsNaN(hh[2])) g.DrawLine(p3, (float)hh[2], yh - 9, (float)hh[2], yh + 9); } } });
    }
    // near ring (left inner edge)
    var pts = new List<double[]>(); var rpts = new List<double[]>();
    for (int y = 186; y <= 800; y += 2) {
      var gr = RunsOf(x => S(x, y) == CG || (Cl[y * W + x] == CWH && Lu[y * W + x] > 230 && S(x, y) != CWH), 0, 160, 3, 4);
      if (gr.Count > 0 && gr[0][0] <= 40) pts.Add(new double[] { gr[0][1] + 0.5, y });
      var grr = RunsOf(i => S(W - 1 - i, y) == CG, 0, 90, 2, 3);
      if (grr.Count > 0 && grr[0][0] == 0 && grr[0][1] < 85) rpts.Add(new double[] { W - 1 - grr[0][1] - 0.5, y });
    }
    // keep the longest contiguous (in y, gap <= 12) chain of left points
    var chain = Chain(pts, 12);
    var near = new JO();
    if (chain.Count >= 8) {
      double cx, cyy, rad, rms; FitCircle(chain, out cx, out cyy, out rad, out rms);
      var used = new List<double[]>(chain);
      for (int it = 0; it < 4; it++) {   // drop outliers (paddle rims, highlights) and refit
        var keep = new List<double[]>(); foreach (var p in used) { double d = Math.Abs(Math.Sqrt((p[0] - cx) * (p[0] - cx) + (p[1] - cyy) * (p[1] - cyy)) - rad); if (d <= Math.Max(3, 2 * rms)) keep.Add(p); }
        if (keep.Count < 8 || keep.Count == used.Count) break; used = keep; FitCircle(used, out cx, out cyy, out rad, out rms);
      }
      near.A("fit_points_used", used.Count).A("fit_points_total", chain.Count);
      double[] lp = chain[0]; foreach (var p in chain) if (p[0] < lp[0]) lp = p;
      var foot = chain[chain.Count - 1];
      near.A("centre", P(cx, cyy)).A("radius", R1(rad)).A("fit_rms_px", Math.Round(rms, 2)).A("fit_from", "inner (frame-facing) edge of the big near ring on the LEFT side, rows " + chain[0][1] + "-" + foot[1])
        .A("left_crown", P(lp[0], lp[1])).A("left_crown_note", "leftmost measured inner-edge point (the arc is nearly vertical here, so its y is uncertain)")
        .A("foot_on_foam", P(foot[0], foot[1])).A("inner_edge_left", Poly(chain, 10)).A("inner_edge_right_visible", Poly(rpts, 10))
        .A("tol", new JO().A("centre", 25).A("radius", 20).A("edge_x", 4).A("left_crown_y", 40).A("foot", 8)).A("method", "auto");
      var ch = chain; double fcx = cx, fcy = cyy, frad = rad;
      draw.Add(g => { using (var p = new Pen(Color.FromArgb(220, 255, 255, 0), 1)) { p.DashStyle = DashStyle.Dash; g.DrawEllipse(p, (float)(fcx - frad), (float)(fcy - frad), (float)(2 * frad), (float)(2 * frad)); }
        foreach (var q in ch) g.FillRectangle(Brushes.Yellow, (float)q[0] - 1, (float)q[1] - 1, 3, 3); Lbl(g, "near ring", ch[ch.Count / 2][0] + 6, ch[ch.Count / 2][1], Color.Yellow); });
    } else near.A("centre", null).A("note", "near ring not found on the left edge").A("method", "auto");
    // throat radii
    var Lr = new double[90]; var Wr = new double[90];
    for (int r = 0; r < 90; r++) { double t = 0, w = 0; int c = 0; for (int a = 20; a <= 160; a += 4) { double rad = a * Math.PI / 180; int x = (int)Math.Round(vx + r * Math.Cos(rad)), y = (int)Math.Round(vy - r * Math.Sin(rad)); if (x < 0 || y < 0 || x >= W || y >= H) continue; int i = y * W + x; t += Lu[i]; if (Lu[i] >= 235 && Sa[i] <= 0.22) w++; c++; } Lr[r] = c > 0 ? t / c : 0; Wr[r] = c > 0 ? w / c : 0; }
    int core = 0; while (core < 89 && Wr[core] >= 0.5) core++;
    double lwall = 0; for (int r = 75; r < 90; r++) lwall += Lr[r]; lwall /= 15;
    double half = 0.5 * (Lr[0] + lwall); int halo = core; while (halo < 89 && Lr[halo] >= half) halo++;
    var thin = new List<object>(); foreach (var b in bands) { double r = vy - b[0]; if (r < 50) thin.Add(R1(r)); }
    throat.A("white_core_radius", core).A("halo_radius", halo).A("thin_ring_radii_up", thin).A("lum_centre", R1(Lr[0])).A("lum_wall_r75_90", R1(lwall))
      .A("tol", new JO().A("white_core_radius", 2).A("halo_radius", 4).A("thin_ring_radii_up", 2)).A("method", "auto")
      .A("how", "radial profile over the upper half (angles 20-160 deg) around the VP: core = white fraction (L>=235, S<=0.22) >= 0.5; halo = mean L above the midpoint between centre and wall (r 75-90); thin rings = crowns of rings with r < 50 straight up");
    int hc = core, hh2 = halo;
    draw.Add(g => { using (var p = new Pen(Color.White, 1)) g.DrawEllipse(p, vx - hc, vy - hc, 2 * hc, 2 * hc); using (var p = new Pen(Color.Orange, 1)) g.DrawEllipse(p, vx - hh2, vy - hh2, 2 * hh2, 2 * hh2); });
    var ringsObj = new JO().A("list", ringsOut).A("near_ring", near)
      .A("note", "ids by size: A = biggest ring after the near ring, then inward. crown_y straight up from the VP; left_x/right_x = band centres on row vp.y-8. Rings are NOT centred on the VP (drum wider on the left): compare the asymmetry too.");
    return ringsObj;
  }
  static int Groove(double[] sm, int a, int b) { int m = a; for (int y = a; y <= b; y++) if (sm[y] < sm[m]) m = y; return m; }
  static List<double[]> Chain(List<double[]> pts, double gap) {
    var best = new List<double[]>(); var cur = new List<double[]>();
    foreach (var p in pts) { if (cur.Count > 0 && (p[1] - cur[cur.Count - 1][1] > gap || Math.Abs(p[0] - cur[cur.Count - 1][0]) > 25)) { if (cur.Count > best.Count) best = cur; cur = new List<double[]>(); } cur.Add(p); }
    if (cur.Count > best.Count) best = cur; return best;
  }
  static List<object> Poly(List<double[]> pts, int stepY) {
    var o = new List<object>(); double last = -1e9;
    foreach (var p in pts) if (p[1] - last >= stepY) { o.Add(new double[] { p[1], R1(p[0]) }); last = p[1]; }
    return o;
  }
  static void FitCircle(List<double[]> pts, out double cx, out double cy, out double r, out double rms) {
    // Kasa algebraic fit: x^2+y^2 + D x + E y + F = 0
    double sxx = 0, sxy = 0, syy = 0, sx = 0, sy = 0, sxz = 0, syz = 0, sz = 0; int n = pts.Count;
    foreach (var p in pts) { double x = p[0], y = p[1], z = x * x + y * y; sxx += x * x; sxy += x * y; syy += y * y; sx += x; sy += y; sxz += x * z; syz += y * z; sz += z; }
    double[,] A = { { sxx, sxy, sx }, { sxy, syy, sy }, { sx, sy, n } }; double[] bb = { -sxz, -syz, -sz };
    double[] s = Solve3(A, bb); cx = -s[0] / 2; cy = -s[1] / 2; r = Math.Sqrt(Math.Max(0, cx * cx + cy * cy - s[2]));
    double e = 0; foreach (var p in pts) { double d = Math.Sqrt((p[0] - cx) * (p[0] - cx) + (p[1] - cy) * (p[1] - cy)) - r; e += d * d; } rms = Math.Sqrt(e / n);
  }
  static double[] Solve3(double[,] a, double[] b) {
    double det = a[0, 0] * (a[1, 1] * a[2, 2] - a[1, 2] * a[2, 1]) - a[0, 1] * (a[1, 0] * a[2, 2] - a[1, 2] * a[2, 0]) + a[0, 2] * (a[1, 0] * a[2, 1] - a[1, 1] * a[2, 0]);
    var r = new double[3];
    for (int c = 0; c < 3; c++) { var m = (double[,])a.Clone(); for (int i = 0; i < 3; i++) m[i, c] = b[i];
      r[c] = (m[0, 0] * (m[1, 1] * m[2, 2] - m[1, 2] * m[2, 1]) - m[0, 1] * (m[1, 0] * m[2, 2] - m[1, 2] * m[2, 0]) + m[0, 2] * (m[1, 0] * m[2, 1] - m[1, 1] * m[2, 0])) / det; }
    return r;
  }

  // ---------------- Benny ----------------
  static object Benny(out int[] bx0, out int[] bx1, out int top, out int bot) {
    bx0 = new int[H]; bx1 = new int[H]; for (int y = 0; y < H; y++) { bx0[y] = -1; bx1[y] = -1; }
    // seed: centroid of raw pink in the body window
    double sx = 0, sy = 0; int n = 0;
    for (int y = 1000; y <= 1170; y++) for (int x = 280; x <= 580; x++) if (Cl[y * W + x] == CP) { sx += x; sy += y; n++; }
    top = -1; bot = -1;
    if (n < 2000) return new JO().A("found", false).A("method", "auto");
    int cx = (int)Math.Round(sx / n), cy = (int)Math.Round(sy / n);
    Func<int, int, bool> water = (x, y) => S(x, y) == CW;
    Func<int, int, int[]> extent = (y, x0) => {
      if (water(x0, y)) return null;
      int l = x0, r = x0, wc = 0;
      for (int x = x0; x >= 0; x--) { if (water(x, y)) { wc++; if (wc >= 5) break; } else { wc = 0; l = x; } }
      wc = 0; for (int x = x0; x < W; x++) { if (water(x, y)) { wc++; if (wc >= 5) break; } else { wc = 0; r = x; } }
      return new int[] { l, r };
    };
    // pompom column: centroid of violet in the hat window
    double px = 0; int pn = 0; for (int y = cy - 330; y <= cy - 200; y++) for (int x = cx - 90; x <= cx + 90; x++) if (Cl[y * W + x] == CV) { px += x; pn++; }
    int pcx = pn > 50 ? (int)Math.Round(px / pn) : cx;
    int miss = 0; top = cy;
    for (int y = cy; y >= 600; y--) {
      int x0 = y < cy - 150 ? pcx : cx; var e = extent(y, x0); if (e == null || e[1] - e[0] > 520) { miss++; if (miss >= 3) break; continue; }
      miss = 0; bx0[y] = e[0]; bx1[y] = e[1]; top = y;
    }
    miss = 0; bot = cy;
    for (int y = cy + 1; y <= 1400; y++) { var e = extent(y, cx); if (e == null || e[1] - e[0] > 520) { miss++; if (miss >= 3) break; continue; } miss = 0; bx0[y] = e[0]; bx1[y] = e[1]; bot = y; }
    // body bottom: lowest row where raw pink fraction in [cx-30,cx+30] >= 0.5
    int bodyBottom = -1; for (int y = cy; y <= 1400; y++) if (Frac(Cl, CP, cx - 30, cx + 30, y, y) >= 0.5) bodyBottom = y; else if (y > cy + 20 && bodyBottom > 0 && y - bodyBottom > 6) break;
    // hat: in column band [cx-12,cx+12] going down from top: last violet run before fur
    var col = new int[H]; for (int y = top; y <= bodyBottom; y++) { double fv = Frac(Sm, CV, pcx - 12, pcx + 12, y, y), fw = Frac(Sm, CWH, cx - 12, cx + 12, y, y), fp = Frac(Sm, CP, cx - 12, cx + 12, y, y); col[y] = fp >= 0.5 ? CP : (fw >= 0.5 ? CWH : (fv >= 0.5 ? CV : CO)); }
    var vr = RunsOf(y => col[y] == CV, top, bodyBottom, 2, 6);
    int[] brim = null; int[] pompom = vr.Count > 0 ? vr[0] : null;
    foreach (var r in vr) if (r[0] < cy - 20 && r != pompom) brim = r;
    int furTop = brim != null ? brim[1] + 1 : -1;
    // star centroid
    double stx = 0, sty = 0; int stn = 0;
    int sy0 = pompom != null ? pompom[1] : top, sy1 = furTop > 0 ? furTop + 10 : cy;
    for (int y = sy0; y <= sy1; y++) for (int x = Math.Max(0, bx0[y]); x <= bx1[y] && x >= 0; x++) { int i = y * W + x; if (Cl[i] == CG && Hu[i] >= 40 && Hu[i] <= 70 && Sa[i] >= 0.55) { stx += x; sty += y; stn++; } }
    // widest body row (fur rows only)
    int wy = -1, wx0 = 0, wx1 = 0; for (int y = (furTop > 0 ? furTop : cy); y <= bodyBottom; y++) if (bx0[y] >= 0 && bx1[y] - bx0[y] > wx1 - wx0) { wy = y; wx0 = bx0[y]; wx1 = bx1[y]; }
    int ty0 = -1, tx0 = 0, tx1 = 0; for (int y = (furTop > 0 ? furTop + 50 : cy); y <= bodyBottom - 15; y++) if (bx0[y] >= 0 && bx1[y] - bx0[y] > tx1 - tx0) { ty0 = y; tx0 = bx0[y]; tx1 = bx1[y]; }
    var sil = new List<object>(); for (int y = top - (top % 10) + 10; y <= bot; y += 10) if (bx0[y] >= 0) sil.Add(new int[] { y, bx0[y], bx1[y] });
    var o = new JO().A("found", true).A("centre_x", R1((wx0 + wx1) / 2.0)).A("body_centroid", P(sx / n, sy / n)).A("pompom_top_y", top).A("pompom_centre_x", pcx)
      .A("pompom_y_range", pompom == null ? null : (object)pompom).A("hat_band_top_y", brim == null ? null : (object)brim[0]).A("hat_band_bottom_y", brim == null ? null : (object)brim[1])
      .A("fur_top_y_at_centre", furTop).A("star_centre", stn > 30 ? (object)P(stx / stn, sty / stn) : null)
      .A("body_widest", new JO().A("y", wy).A("x0", wx0).A("x1", wx1).A("width", wx1 - wx0 + 1).A("note", "includes the little side ears/arms"))
      .A("torso_widest", new JO().A("y", ty0).A("x0", tx0).A("x1", tx1).A("width", tx1 - tx0 + 1).A("note", "widest row from 50 px below the hat band to 15 px above the body bottom (ears excluded)"))
      .A("body_bottom_y", bodyBottom).A("body_bottom_note", "lowest row whose central 61 px are >= 50% pink fur = waterline under Benny")
      .A("silhouette_bottom_y", bot).A("silhouette_rows", sil).A("silhouette_format", "[y, x_left, x_right] every 10 px; region-grown from the body until >= 5 px of water; the lowest rows include splash")
      .A("tol", new JO().A("pompom_top_y", 3).A("hat_band", 4).A("star", 3).A("body_widest", 5).A("body_bottom_y", 5).A("silhouette_x", 4)).A("method", "auto");
    int[] a0 = (int[])bx0.Clone(), a1 = (int[])bx1.Clone(); int tp = top, bt = bot, bb = bodyBottom; int[] brm = brim; double scx = stn > 30 ? stx / stn : -1, scy = stn > 30 ? sty / stn : -1;
    draw.Add(g => { using (var p = new Pen(Color.Lime, 1)) { for (int y = tp; y < bt; y += 2) if (a0[y] >= 0 && a0[y + 2 < H ? y + 2 : y] >= 0) { g.DrawLine(p, a0[y], y, a0[y + 2], y + 2); g.DrawLine(p, a1[y], y, a1[y + 2], y + 2); } }
      using (var p = new Pen(Color.Lime, 2)) { g.DrawLine(p, a0[tp] - 20, tp, a1[tp] + 20, tp); g.DrawLine(p, wx0, wy, wx1, wy); if (bb > 0) g.DrawLine(p, wx0 + 40, bb, wx1 - 40, bb); if (brm != null) { g.DrawLine(p, a0[brm[0]], brm[0], a1[brm[0]], brm[0]); g.DrawLine(p, a0[brm[1]], brm[1], a1[brm[1]], brm[1]); } }
      if (scx > 0) g.DrawEllipse(Pens.Lime, (float)scx - 5, (float)scy - 5, 10, 10); Lbl(g, "Benny top", a1[tp] + 22, tp - 8, Color.Lime); Lbl(g, "widest", wx1 + 4, wy - 8, Color.Lime); if (bb > 0) Lbl(g, "body bottom", wx1 - 36, bb + 2, Color.Lime); });
    return o;
  }

  // ---------------- coins ----------------
  static object Coins(int vx, int vy, int bennyTop, List<int[]> boxes) {
    var m = new bool[W * H]; int y1 = bennyTop > 0 ? bennyTop + 10 : 800;
    for (int y = vy + 8; y <= Math.Min(H - 1, y1); y++) for (int x = vx - 190; x <= vx + 190; x++) { int i = y * W + x; if (Cl[i] == CG && Hu[i] >= 25 && Hu[i] < 70) m[i] = true; }
    // close small holes ($ sign engraving / highlight): include white pixels that are surrounded by gold horizontally
    List<long[]> st; var lab = Label(m, out st); var list = new List<object>(); var cc = new List<double[]>();
    foreach (var s in st) {
      long w = s[3] - s[1] + 1, h = s[4] - s[2] + 1; if (s[0] < 12 || w < 5 || h < 4) continue;
      double fill = s[0] / (double)(w * h), asp = h / (double)w; if (fill < 0.45 || asp < 0.5 || asp > 1.5) continue;
      double cx = (s[1] + s[3]) / 2.0, cy = (s[2] + s[4]) / 2.0; double r = w / 2.0;
      int wat = 0, tot = 0; for (int a = 0; a < 360; a += 10) { double rad = a * Math.PI / 180; int x = (int)Math.Round(cx + (r + 5) * Math.Cos(rad)), y = (int)Math.Round(cy + (h / 2.0 + 5) * Math.Sin(rad)); if (x < 0 || y < 0 || x >= W || y >= H) continue; tot++; int k = Sm[y * W + x]; if (k == CW || k == CP || k == CWH || k == CG) wat++; }
      if (tot == 0 || wat < 0.6 * tot) continue;   // coins sit on water, not on the wall/foam
      cc.Add(new double[] { cx, cy, r, h / 2.0 }); boxes.Add(new int[] { (int)s[1], (int)s[2], (int)s[3], (int)s[4] });
    }
    cc.Sort((a, b) => b[1].CompareTo(a[1]));
    foreach (var c in cc) list.Add(new JO().A("x", R1(c[0])).A("y", R1(c[1])).A("r", R1(c[2])).A("r_y", R1(c[3])).A("tol", c[2] > 12 ? 2 : 3));
    var cl = cc; draw.Add(g => { using (var p = new Pen(Color.Orange, 2)) foreach (var c in cl) g.DrawEllipse(p, (float)(c[0] - c[2]), (float)(c[1] - c[3]), (float)(2 * c[2]), (float)(2 * c[3])); });
    return new JO().A("list", list).A("count", list.Count).A("method", "auto").A("how", "yellow-gold blobs (hue 25-70, fill >= 0.45, aspect 0.5-1.5) on the river between the throat and Benny's pompom; x,y = bbox centre, r = half width, r_y = half height (includes the coin rim/thickness)");
  }

  // ---------------- river rows, junction, foam ----------------
  static object RiverRows(int vx, int vy, int[] bx0, int[] bx1, int btop, int bbot, List<int[]> coinBoxes, out JO junction, out JO foamH) {
    // masks
    var cm = new bool[W * H]; for (int i = 0; i < W * H; i++) cm[i] = Sm[i] == CW && i / W > vy;
    List<long[]> cst; var clab = Label(cm, out cst); var bigC = new bool[cst.Count + 1];
    for (int k = 0; k < cst.Count; k++) bigC[k + 1] = cst[k][0] >= 2500 && cst[k][4] - cst[k][2] >= 40;
    var fm = new bool[W * H]; for (int i = 0; i < W * H; i++) { int y = i / W, x = i % W; fm[i] = Sm[i] == CWH && y > vy && !(bx0[y] >= 0 && x >= bx0[y] - 2 && x <= bx1[y] + 2); }
    List<long[]> fst; var flab = Label(fm, out fst); var bigF = new bool[fst.Count + 1]; var farea = new long[fst.Count + 1];
    for (int k = 0; k < fst.Count; k++) { bigF[k + 1] = fst[k][0] >= 500 && fst[k][4] - fst[k][2] >= 10 && (fst[k][4] - fst[k][2] + 1) * 1.0 >= 0.12 * (fst[k][3] - fst[k][1] + 1); farea[k + 1] = fst[k][0]; }
    FLab = flab; FBig = bigF; FArea = farea;
    Func<int, int, bool> isC = (x, y) => { int l = clab[y * W + x]; return l > 0 && bigC[l]; };
    Func<int, int, bool> isF = (x, y) => { int l = flab[y * W + x]; return l > 0 && bigF[l]; };
    Func<int, int, bool> wallish = (x, y) => { int c = S(x, y); return c == CP || c == CV || c == CD || c == CG || c == CO; };
    int y0 = vy + 10, n = H - y0; var res = new double[H][]; // [wL, wR, fLout, fLin, fRin, fRout, wallL, wallR, flagsL, flagsR, cL, cR]
    for (int y = y0; y < H; y++) {
      int cL = -1, cR = -1; for (int x = 0; x < W; x++) if (isC(x, y)) { if (cL < 0) cL = x; cR = x; }
      var r = new double[12]; for (int k = 0; k < 12; k++) r[k] = double.NaN; res[y] = r; if (cL < 0) continue; r[10] = cL; r[11] = cR;
      for (int side = 0; side < 2; side++) {
        int dir = side == 0 ? -1 : 1, x = side == 0 ? cL : cR, flag = 0; int fin = -1, fout = -1, dark = 0, gold = 0, edge = -1;
        for (x = x + dir; x >= 0 && x < W; x += dir) {
          if (isF(x, y)) { fin = x; break; }
          int c = S(x, y); if (c == CD) dark++; else dark = 0; if (c == CG) gold++; else gold = 0;
          if (dark >= 4) { edge = x - dir * 3; flag = 2; break; }       // wall reached without foam
          if (gold >= 6 && y > 1000) { edge = x - dir * 5; flag = 3; break; } // bottom frame ring hides the bank
        }
        if (fin < 0 && flag == 0) { edge = side == 0 ? 0 : W - 1; flag = 1; }  // clipped at the frame edge
        if (fin >= 0) {
          int gap = 0; fout = fin; for (int xx = fin; xx >= 0 && xx < W; xx += dir) { if (isF(xx, y)) { fout = xx; gap = 0; } else { gap++; if (gap > 8) break; } }
          bool atEdge = side == 0 ? fout <= 2 : fout >= W - 3; int wc = 0, tot = 0, dk = 0, cy2 = 0;
          for (int k = 1; k <= 12; k++) { int xx = fout + dir * k; if (xx < 0 || xx >= W) break; tot++; if (wallish(xx, y)) wc++; }
          for (int k = 1; k <= 60; k++) { int xx = fout + dir * k; if (xx < 0 || xx >= W) break; int cc2 = S(xx, y); if (cc2 == CD) dk++; if (cc2 == CW && k <= 30) cy2++; }
          // wall = wall-coloured right behind the foam, no water there, and the dark slots of the drum within 60 px
          double wall = (!atEdge && tot >= 8 && wc >= 0.7 * tot && cy2 == 0 && (dk > 0 || y < vy + 120) && y < 1100) ? fout + dir : double.NaN;
          if (side == 0) { r[0] = fin + 1; r[2] = fout; r[3] = fin; r[6] = wall; } else { r[1] = fin - 1; r[4] = fin; r[5] = fout; r[7] = wall; }
        } else { if (side == 0) r[0] = edge; else r[1] = edge; }
        r[8 + side] = flag;
      }
    }
    // occluders per row
    Func<int, int, int, string> occ = (y, xa, xb) => {
      if (y < 190) return "hud";
      if (bx0[y] >= 0 && xb >= bx0[y] - 3 && xa <= bx1[y] + 3) return "benny";
      foreach (var b in coinBoxes) if (y >= b[1] - 2 && y <= b[3] + 2 && xb >= b[0] - 2 && xa <= b[2] + 2) return "coin";
      return null;
    };
    var rows = new List<object>(); var hidden = new List<object>();
    var jl = new List<double[]>(); var jr = new List<double[]>();
    for (int y = vy + 10; y <= 1530; y += 10) {
      var r = Med(res, y, 2);
      if (r == null) { rows.Add(new JO().A("y", y).A("water", null)); continue; }
      var o = new JO().A("y", y);
      object wl = double.IsNaN(r[0]) ? null : (object)R1(r[0]), wr = double.IsNaN(r[1]) ? null : (object)R1(r[1]);
      string fl = Flag(r[8]), fr = Flag(r[9]);
      o.A("water_l", wl).A("water_r", wr).A("water_l_flag", fl).A("water_r_flag", fr);
      o.A("foam_l", double.IsNaN(r[2]) ? null : (object)new double[] { R1(r[2]), R1(r[3]) }).A("foam_r", double.IsNaN(r[4]) ? null : (object)new double[] { R1(r[4]), R1(r[5]) });
      o.A("wall_l", double.IsNaN(r[6]) ? null : (object)R1(r[6])).A("wall_r", double.IsNaN(r[7]) ? null : (object)R1(r[7]));
      // pink bands inside the open water
      int xa = double.IsNaN(r[0]) ? (int)r[10] : (int)r[0], xb = double.IsNaN(r[1]) ? (int)r[11] : (int)r[1];
      var pr = RunsOf(x => S(x, y) == CP && !(bx0[y] >= 0 && x >= bx0[y] - 3 && x <= bx1[y] + 3), Math.Max(0, xa), Math.Min(W - 1, xb), 3, 6);
      pr.Sort((a, b) => (b[1] - b[0]).CompareTo(a[1] - a[0])); var two = pr.GetRange(0, Math.Min(2, pr.Count)); two.Sort((a, b) => a[0].CompareTo(b[0]));
      var bands = new List<object>(); foreach (var p in two) bands.Add(new JO().A("c", R1((p[0] + p[1]) / 2.0)).A("w", p[1] - p[0] + 1));
      o.A("pink_bands", bands);
      var occl = new List<object>();
      if (bx0[y] >= 0) occl.Add(new JO().A("by", "benny").A("x", new int[] { bx0[y], bx1[y] }));
      foreach (var b in coinBoxes) if (y >= b[1] && y <= b[3]) occl.Add(new JO().A("by", "coin").A("x", new int[] { b[0], b[2] }));
      if (occl.Count > 0) o.A("occluded", occl);
      o.A("tol", y < 600 ? 4 : (y < 800 ? 6 : 10));
      rows.Add(o);
      if (!double.IsNaN(r[6])) jl.Add(new double[] { r[6], y }); if (!double.IsNaN(r[7])) jr.Add(new double[] { r[7], y });
    }
    junction = new JO().A("left", Poly(jl, 10)).A("right", Poly(jr, 10)).A("format", "[[y, x], ...] x = first wall pixel next to the foam bank's outer edge (wall_l / wall_r of river_rows)")
      .A("tol", 6).A("method", "auto").A("note", "only rows where >= 70% of the 12 px beyond the foam are wall-coloured; rows where the foam runs off-frame are absent");
    // foam heights: columns through the rim centre at sample rows
    var fh = new List<object>();
    foreach (int side in new int[] { 0, 1 }) {
      for (int y = vy + 30; y <= 1000; y += 30) {
        var r = Med(res, y, 2); if (r == null) continue; double a = side == 0 ? r[2] : r[4], b = side == 0 ? r[3] : r[5]; if (double.IsNaN(a)) continue;
        double wpx = Math.Abs(b - a) + 1; int xc = (int)Math.Round((a + b) / 2); if (xc < 2 || xc > W - 3) continue;
        int t = y, bo = y, gap = 0; for (int yy = y; yy > vy; yy--) { if (isF(xc, yy)) { t = yy; gap = 0; } else if (++gap > 4) break; }
        gap = 0; for (int yy = y; yy < H; yy++) { if (isF(xc, yy)) { bo = yy; gap = 0; } else if (++gap > 4) break; }
        string above = null; if (t - 6 > 0) { int c = S(xc, t - 6); above = c == CW ? "water" : (c == CWH ? "foam" : "wall"); }
        fh.Add(new JO().A("side", side == 0 ? "left" : "right").A("row_y", y).A("x", xc).A("top_y", t).A("waterline_y", bo).A("height_px", bo - t + 1).A("rim_width_px", wpx).A("above_top", above));
      }
    }
    foamH = new JO().A("samples", fh).A("tol", new JO().A("height_px", 5).A("rim_width_px", 6)).A("method", "auto")
      .A("how", "column through the foam rim centre at row_y: contiguous foam (big white blobs) up to top_y and down to waterline_y (gaps <= 4 px bridged). height_px = waterline_y - top_y + 1 = how tall the bank stands on screen; rim_width_px = horizontal foam width on row_y. above_top tells what is above the pile (wall = pile seen against the wall)");
    var rl = res; int vyy = vy;
    draw.Add(g => {
      for (int y = vyy + 10; y < H; y += 2) { var r = rl[y]; if (r == null) continue;
        if (!double.IsNaN(r[0])) g.FillRectangle(Brushes.Lime, (float)r[0] - 1, y - 1, 2, 2); if (!double.IsNaN(r[1])) g.FillRectangle(Brushes.Lime, (float)r[1] - 1, y - 1, 2, 2);
        if (!double.IsNaN(r[2])) g.FillRectangle(Brushes.Red, (float)r[2] - 1, y - 1, 2, 2); if (!double.IsNaN(r[5])) g.FillRectangle(Brushes.Red, (float)r[5] - 1, y - 1, 2, 2); }
    });
    var jjl = jl; var jjr = jr; var fhl = fh;
    draw.Add(g => { using (var p = new Pen(Color.Red, 2)) { for (int i = 1; i < jjl.Count; i++) if (jjl[i][1] - jjl[i - 1][1] <= 20) g.DrawLine(p, (float)jjl[i - 1][0], (float)jjl[i - 1][1], (float)jjl[i][0], (float)jjl[i][1]); for (int i = 1; i < jjr.Count; i++) if (jjr[i][1] - jjr[i - 1][1] <= 20) g.DrawLine(p, (float)jjr[i - 1][0], (float)jjr[i - 1][1], (float)jjr[i][0], (float)jjr[i][1]); }
      foreach (JO f in fhl) { int x = (int)f.V[2], t = (int)f.V[3], b = (int)f.V[4]; using (var p = new Pen(Color.White, 2)) g.DrawLine(p, x, t, x, b); g.DrawLine(Pens.Black, x - 3, t, x + 3, t); g.DrawLine(Pens.Black, x - 3, b, x + 3, b); } });
    return new JO().A("rows", rows).A("fields", "water_l/water_r = open water edges (first/last water pixel between the foam rims); *_flag: foam = bounded by a foam rim, clipped = water runs off the frame edge, no_foam = wall reached without foam, frame_ring = hidden by the bottom gold frame ring; foam_l = [outer, inner] x of the left foam rim, foam_r = [inner, outer]; wall_l/wall_r = first wall pixel beyond the foam; pink_bands = centres c and widths w of the (up to) two widest pink satin runs inside the open water (Benny excluded); occluded = spans hidden by Benny/coins (edges outside them are still valid)")
      .A("method", "auto").A("smoothing", "each row = per-field median of rows y-2..y+2");
  }
  static string Flag(double f) { if (double.IsNaN(f)) return null; int k = (int)f; return k == 0 ? "foam" : (k == 1 ? "clipped" : (k == 2 ? "no_foam" : "frame_ring")); }
  static double[] Med(double[][] res, int y, int h) {
    var o = new double[12]; bool any = false;
    for (int k = 0; k < 12; k++) {
      var v = new List<double>(); for (int yy = y - h; yy <= y + h; yy++) if (yy >= 0 && yy < H && res[yy] != null && !double.IsNaN(res[yy][k])) v.Add(res[yy][k]);
      if (v.Count * 2 <= (2 * h + 1)) { o[k] = double.NaN; continue; } v.Sort(); o[k] = v[v.Count / 2]; any = true;
    }
    return any ? o : null;
  }

  // ---------------- splash ----------------
  static object Splash(int[] bx0, int[] bx1, int top, int bot) {
    if (top < 0) return new JO().A("found", false);
    int cx = 0, cn = 0; for (int y = bot - 120; y <= bot - 60; y++) if (bx0[y] >= 0) { cx += (bx0[y] + bx1[y]) / 2; cn++; } cx = cn > 0 ? cx / cn : 430;
    int wy0 = bot - 130, wy1 = Math.Min(H - 1, bot + 70); var o = new JO(); var tips = new List<double[]>();
    foreach (int side in new int[] { 0, 1 }) {
      int x0 = side == 0 ? Math.Max(0, cx - 280) : cx + 25, x1 = side == 0 ? cx - 25 : Math.Min(W - 1, cx + 280);
      int c = 8; int ex0 = W, ex1 = -1, ey0 = H, ey1 = -1;
      for (int y = wy0; y + c <= wy1; y += c) for (int x = x0; x + c <= x1; x += c) {
        int wn = 0, fb = 0; for (int yy = y; yy < y + c; yy++) for (int xx = x; xx < x + c; xx++) { if (bx0[yy] >= 0 && xx >= bx0[yy] && xx <= bx1[yy] && yy < bot - 30) continue; if (Cl[yy * W + xx] == CWH) wn++; int l = FLab[yy * W + xx]; if (l > 0 && FBig[l] && FArea[l] > 6000) fb++; }
        if (fb > 0.3 * c * c) continue;   // bank foam, not spray
        if (wn < 0.3 * c * c) continue; ex0 = Math.Min(ex0, x); ex1 = Math.Max(ex1, x + c - 1); ey0 = Math.Min(ey0, y); ey1 = Math.Max(ey1, y + c - 1);
      }
      if (ex1 < 0) { o.A(side == 0 ? "left_fan" : "right_fan", null); continue; }
      o.A(side == 0 ? "left_fan" : "right_fan", new JO().A("box", new int[] { ex0, ey0, ex1, ey1 }).A("outer_x", side == 0 ? ex0 : ex1).A("lowest_y", ey1));
      tips.Add(new double[] { side == 0 ? ex0 : ex1, ey1 }); int a = ex0, b = ey0, c2 = ex1, d = ey1; Color col = Color.Aqua;
      draw.Add(g => { using (var p = new Pen(col, 1)) { p.DashStyle = DashStyle.Dot; g.DrawRectangle(p, a, b, c2 - a, d - b); } Lbl(g, "splash", a, d + 2, col); });
    }
    o.A("search_window_y", new int[] { wy0, wy1 }).A("centre_x", cx).A("tol", 12).A("method", "auto")
     .A("how", "8x8 cells with >= 30% white pixels in windows left/right of Benny's lower body (Benny's body excluded); coarse - spray and foam streaks mix");
    return o;
  }

  // ---------------- paddles (manual, approved image only) ----------------
  static object Paddles() {
    if (!approved) return new JO().A("list", null).A("method", "manual_not_available").A("note", "paddles are hand-measured on the approved image only; compare Unity paddles by projecting their 3D bounds, or measure by eye");
    var L = new List<object>();
    // [side, rank, x0, y0, x1, y1, rim_px, note]
    object[][] d = {
      new object[] { "left", "big", 62, 315, 216, 422, 12, "D-tray tipped toward the river; top rim (80,318)-(196,350), bottom lip (88,368)-(214,420); between near ring and ring A" },
      new object[] { "left", "mid", 248, 417, 333, 471, 8, "just inside ring A, below/left of ring B" },
      new object[] { "left", "small", 362, 450, 404, 474, 5, "inside ring B, by ring C" },
      new object[] { "left", "tiny", 424, 456, 444, 470, 3, "inside ring C, in the throat glow; blurry" },
      new object[] { "right", "big", 718, 396, 863, 522, 12, "clipped by the right frame edge; top rim (735,455)-(863,400), lower lip (722,515)-(863,490)" },
      new object[] { "right", "mid", 629, 392, 698, 451, 8, "inside ring A" },
      new object[] { "right", "small", 582, 432, 626, 462, 5, "inside ring B" },
      new object[] { "right", "tiny", 538, 450, 556, 463, 3, "inside ring C; blurry" } };
    foreach (var p in d) {
      int x0 = (int)p[2], y0 = (int)p[3], x1 = (int)p[4], y1 = (int)p[5]; string rank = (string)p[1];
      L.Add(new JO().A("side", p[0]).A("rank", rank).A("box", new int[] { x0, y0, x1, y1 }).A("centre", P((x0 + x1) / 2.0, (y0 + y1) / 2.0)).A("w", x1 - x0 + 1).A("h", y1 - y0 + 1)
        .A("rim_px", p[6]).A("tol", rank == "big" ? 6 : (rank == "mid" ? 5 : 4)).A("note", p[7]));
      string lab = (string)p[0] + " " + rank;
      draw.Add(g => { using (var pen = new Pen(Color.OrangeRed, 2)) g.DrawRectangle(pen, x0, y0, x1 - x0, y1 - y0); if (rank == "big" || rank == "mid") Lbl(g, lab, x0, y0 - 14, Color.OrangeRed); });
    }
    return new JO().A("list", L).A("method", "manual").A("why_manual", "paddles are copper-gold like the rings and touch ring bands, so colour blobs merge with the rings; boxes read off 2.5-4x zoom crops with a 10/20 px grid")
      .A("note", "box = [x0, y0, x1, y1] of the visible tray incl. rim; the big trays are about 1.9x (left) / 2.1x (right) wider than the mid ones");
  }

  // ---------------- bubbles (manual) ----------------
  static object Bubbles() {
    if (!approved) return new JO().A("list", null).A("method", "manual_not_available");
    double[][] b = {
      new double[]{266,541,11}, new double[]{178,572,17}, new double[]{94,612,20}, new double[]{130,670,7}, new double[]{101,675,6}, new double[]{183,672,16}, new double[]{50,706,25},
      new double[]{83,912,31}, new double[]{134,987,15}, new double[]{54,1016,6}, new double[]{340,516,6}, new double[]{362,509,5},
      new double[]{601,553,7}, new double[]{660,559,10}, new double[]{736,574,14}, new double[]{805,619,12}, new double[]{823,700,19}, new double[]{695,829,12}, new double[]{795,861,30}, new double[]{723,1050,16},
      new double[]{95,1250,32}, new double[]{152,1163,9}, new double[]{719,1206,33}, new double[]{802,1246,12}, new double[]{657,1132,8}, new double[]{658,1363,10}, new double[]{186,1100,6}, new double[]{147,1310,6}, new double[]{630,1105,5}, new double[]{688,1078,4} };
    var L = new List<object>(); foreach (var q in b) L.Add(new double[] { q[0], q[1], q[2] });
    var bl = b; draw.Add(g => { using (var p = new Pen(Color.FromArgb(200, 180, 255, 255), 1)) foreach (var q in bl) g.DrawEllipse(p, (float)(q[0] - q[2]), (float)(q[1] - q[2]), (float)(2 * q[2]), (float)(2 * q[2])); });
    return new JO().A("list", L).A("format", "[x, y, r]").A("count", L.Count).A("tol", 6).A("method", "manual").A("why_manual", "transparent iridescent spheres have no stable colour class; read off 1.6x crops");
  }

  // ---------------- HUD ----------------
  static object Hud() {
    var o = new JO();
    o.A("heart", HudBox("heart", 50, 12, 160, 100, (i) => (Cl[i] == CP || Cl[i] == CG) && (Hu[i] >= 330 || Hu[i] < 12) && Sa[i] >= 0.45 && Lu[i] > 90, Color.Red));
    o.A("lives_text", HudBox("5/5 +", 155, 22, 330, 90, (i) => Cl[i] == CWH && Lu[i] >= 215, Color.White));
    o.A("coin_icon", HudBox("coin", 360, 8, 475, 102, (i) => Cl[i] == CG && Hu[i] >= 25 && Hu[i] < 70, Color.Gold));
    o.A("score_text", HudBox("1,420", 480, 22, 650, 90, (i) => Cl[i] == CWH && Lu[i] >= 215, Color.White));
    o.A("pause_button", HudBox("pause", 715, 8, 845, 106, (i) => Cl[i] == CWH && Lu[i] >= 215, Color.White));
    // title banner: its gold/light rounded outline, scanned in from the sides on the mid row and from top/bottom on the centre column
    Func<int, bool> rim = i => (Cl[i] == CG && Lu[i] > 120) || (Cl[i] == CWH && Lu[i] > 200);
    int bym = 147, bl = -1, br = -1, bt = -1, bb = -1; for (int x = 95; x < 300; x++) if (rim(bym * W + x)) { bl = x; break; } for (int x = 775; x > 560; x--) if (rim(bym * W + x)) { br = x; break; }
    for (int y = 104; y < 140; y++) if (rim(y * W + 432) && rim(y * W + 433)) { bt = y; break; } for (int y = 196; y > 155; y--) if (rim(y * W + 432) && rim(y * W + 433)) { bb = y; break; }
    var tb = (bl < 0 || br < 0 || bt < 0 || bb < 0) ? (object)null : new int[] { bl, bt, br, bb };
    var txt = (bl < 0 || br < 0 || bt < 0 || bb < 0) ? null : HudBox("banner text", bl + 15, bt + 8, br - 15, bb - 8, (i) => (Cl[i] == CG && Hu[i] >= 25 && Hu[i] < 70 && Lu[i] > 140) || (Cl[i] == CWH && Lu[i] > 215), Color.Gold);
    o.A("title_banner", new JO().A("box", tb).A("text", txt).A("note", "box from the banner outline on row 147 and column 432"));
    if (tb != null) { int a1 = bl, a2 = bt, a3 = br, a4 = bb; draw.Add(g => { using (var p = new Pen(Color.Gold, 1)) g.DrawRectangle(p, a1, a2, a3 - a1, a4 - a2); }); }
    // top bar (the long rounded bar that holds heart .. pause): light border pixels along its mid row
    int ym = 57, xl = -1, xr = -1; for (int x = 5; x < 80; x++) if (Lu[ym * W + x] > 150 && Sa[ym * W + x] < 0.45) { xl = x; break; } for (int x = W - 6; x > W - 80; x--) if (Lu[ym * W + x] > 150 && Sa[ym * W + x] < 0.45) { xr = x; break; }
    o.A("top_bar", new JO().A("mid_row_y", ym).A("x_left", xl < 0 ? null : (object)xl).A("x_right", xr < 0 ? null : (object)xr).A("note", "the 'progress bar' = the long top bar holding heart, 5/5 +, coin, 1,420 and pause; edges found as the light rim on its mid row"));
    o.A("tol", 6).A("method", "auto").A("how", "fixed search windows (HUD is screen-space) + colour masks; box = bbox of masked pixels, colour = mean RGB of masked pixels");
    return o;
  }
  static object HudBox(string name, int x0, int y0, int x1, int y1, Func<int, bool> pred, Color c) {
    int ax = W, ay = H, bx = -1, by = -1; double r = 0, gg = 0, bb = 0; int n = 0;
    for (int y = y0; y <= y1; y++) for (int x = x0; x <= x1; x++) { int i = y * W + x; if (!pred(i)) continue; n++; r += R[i]; gg += G[i]; bb += B[i]; ax = Math.Min(ax, x); ay = Math.Min(ay, y); bx = Math.Max(bx, x); by = Math.Max(by, y); }
    if (n < 30) return new JO().A("box", null).A("search", new int[] { x0, y0, x1, y1 });
    int a = ax, b2 = ay, cc = bx, d = by; draw.Add(g => { using (var p = new Pen(c, 1)) g.DrawRectangle(p, a, b2, cc - a, d - b2); });
    return new JO().A("box", new int[] { ax, ay, bx, by }).A("centre", P((ax + bx) / 2.0, (ay + by) / 2.0)).A("mean_rgb", new int[] { (int)(r / n), (int)(gg / n), (int)(bb / n) }).A("pixels", n).A("search", new int[] { x0, y0, x1, y1 });
  }

  // ---------------- overlay ----------------
  static void Lbl(Graphics g, string s, double x, double y, Color c) {
    using (var f = new Font("Arial", 9, FontStyle.Bold)) { g.DrawString(s, f, Brushes.Black, (float)x + 1, (float)y + 1); using (var b = new SolidBrush(c)) g.DrawString(s, f, b, (float)x, (float)y); }
  }
  static void SaveOverlay(string src, string outp, string checkDir) {
    using (var img = new Bitmap(src)) using (var bmp = new Bitmap(W, H, PixelFormat.Format24bppRgb)) {
      using (var g = Graphics.FromImage(bmp)) {
        g.DrawImage(img, 0, 0, W, H);
        using (var dim = new SolidBrush(Color.FromArgb(70, 0, 0, 0))) g.FillRectangle(dim, 0, 0, W, H);
        g.SmoothingMode = SmoothingMode.AntiAlias;
        foreach (var d in draw) d(g);
      }
      var enc = GetJpeg(); var ep = new EncoderParameters(1); ep.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, 82L);
      bmp.Save(outp, enc, ep);
      if (!string.IsNullOrEmpty(checkDir)) {
        Crop(bmp, checkDir + "\\targets05_check_rings.jpg", 180, 170, 640, 330, 1.6, enc, ep);
        Crop(bmp, checkDir + "\\targets05_check_throat.jpg", 400, 400, 200, 100, 4, enc, ep);
        Crop(bmp, checkDir + "\\targets05_check_foam_left.jpg", 0, 480, 470, 360, 1.8, enc, ep);
        Crop(bmp, checkDir + "\\targets05_check_foam_right.jpg", 520, 480, 344, 520, 1.6, enc, ep);
        Crop(bmp, checkDir + "\\targets05_check_paddles.jpg", 0, 300, 864, 240, 1.2, enc, ep);
        Crop(bmp, checkDir + "\\targets05_check_benny.jpg", 180, 740, 500, 560, 1.4, enc, ep);
        Crop(bmp, checkDir + "\\targets05_check_coins.jpg", 360, 480, 260, 320, 2, enc, ep);
      }
    }
  }
  static void Crop(Bitmap src, string path, int x, int y, int w, int h, double z, ImageCodecInfo enc, EncoderParameters ep) {
    int ow = (int)(w * z), oh = (int)(h * z);
    using (var d = new Bitmap(ow, oh)) { using (var g = Graphics.FromImage(d)) { g.InterpolationMode = InterpolationMode.HighQualityBicubic; g.DrawImage(src, new Rectangle(0, 0, ow, oh), new Rectangle(x, y, w, h), GraphicsUnit.Pixel);
        using (var f = new Font("Consolas", 8)) for (int gx = (x / 50 + 1) * 50; gx < x + w; gx += 50) { float px = (float)((gx - x) * z); g.DrawLine(Pens.DimGray, px, 0, px, 6); g.DrawString(gx.ToString(), f, Brushes.White, px + 1, 0); }
        using (var f = new Font("Consolas", 8)) for (int gy = (y / 50 + 1) * 50; gy < y + h; gy += 50) { float py = (float)((gy - y) * z); g.DrawLine(Pens.DimGray, 0, py, 6, py); g.DrawString(gy.ToString(), f, Brushes.White, 0, py + 1); } }
      d.Save(path, enc, ep); }
  }
  static ImageCodecInfo GetJpeg() { foreach (var c in ImageCodecInfo.GetImageEncoders()) if (c.MimeType == "image/jpeg") return c; return null; }

  // ---------------- JSON ----------------
  static void Ser(object o, StringBuilder sb, int ind) {
    string pad = new string(' ', ind * 2);
    if (o == null) { sb.Append("null"); return; }
    if (o is string) { sb.Append('"').Append(((string)o).Replace("\\", "\\\\").Replace("\"", "\\\"")).Append('"'); return; }
    if (o is bool) { sb.Append((bool)o ? "true" : "false"); return; }
    if (o is double) { double d = (double)o; if (double.IsNaN(d) || double.IsInfinity(d)) sb.Append("null"); else sb.Append(d.ToString("0.###", CultureInfo.InvariantCulture)); return; }
    if (o is int || o is long || o is float) { sb.Append(Convert.ToDouble(o).ToString("0.###", CultureInfo.InvariantCulture)); return; }
    if (o is JO) {
      var j = (JO)o; sb.Append("{\n");
      for (int i = 0; i < j.K.Count; i++) { sb.Append(pad).Append("  \"").Append(j.K[i]).Append("\": "); Ser(j.V[i], sb, ind + 1); if (i < j.K.Count - 1) sb.Append(','); sb.Append('\n'); }
      sb.Append(pad).Append('}'); return;
    }
    if (o is System.Collections.IEnumerable) {
      var items = new List<object>(); foreach (var x in (System.Collections.IEnumerable)o) items.Add(x);
      bool flat = true; foreach (var x in items) if (x is JO || (x is System.Collections.IEnumerable && !(x is string) && !IsNumArr(x))) flat = false;
      if (flat) { sb.Append('['); for (int i = 0; i < items.Count; i++) { if (i > 0) sb.Append(", "); Ser(items[i], sb, ind + 1); } sb.Append(']'); return; }
      sb.Append("[\n"); for (int i = 0; i < items.Count; i++) { sb.Append(pad).Append("  "); Ser(items[i], sb, ind + 1); if (i < items.Count - 1) sb.Append(','); sb.Append('\n'); } sb.Append(pad).Append(']'); return;
    }
    sb.Append('"').Append(o.ToString()).Append('"');
  }
  static bool IsNumArr(object x) { return x is int[] || x is double[] || x is long[]; }
}

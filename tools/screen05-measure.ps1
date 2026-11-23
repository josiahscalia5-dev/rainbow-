# Screen 05 LIKENESS MEASURE (read-only, offline: never touches Unity, the scene or git).
# Compares real Unity Game-view stills (864x1536 captures of the normal gameplay camera, Benny at s = 14.00, from
# tools\screen05-cycle.ps1) with the approved image AT IDENTICAL PIXEL POSITIONS - no shifting, cropping, rescaling or
# alignment search of any kind - and prints two measured similarities (100 = the same picture), for the whole frame
# (OVERALL) and for fixed areas (the same approved-pixel boxes as the cycle's crops, identical for both images):
#   visual = VISUAL SIMILARITY (what you see at a glance; blur makes it tolerant of fine texture, not of misplacement). Mean of
#            v_shape   SSIM of brightness after an 8 px blur, at 1/16 size (54x96 cells, window sigma 1.5 cells ~ 24 px)
#            v_dE      colour layout: 1 - meanDeltaE/50 at 1/32 size (27x48 cells) after the 8 px blur
#                      (deltaE = CIELAB colour difference per cell; 0 = identical colours)
#            v_colours colour distribution: overlap of the two CIELAB colour histograms of the area (8x8x8 bins, smoothed)
#   layout = LAYOUT SIMILARITY (strict: shapes, colours and outlines in exactly the same places). Mean of
#            l_shape   SSIM of brightness at 1/8 size (108x192 cells, window sigma 1.5 cells ~ 12 px)
#            l_dE      colour layout: 1 - meanDeltaE/50 at 1/16 size, 1-cell blur
#            l_edges   correlation of softly blurred edge maps (Sobel at 1/8 size, blur sigma 1.5 cells)
# Calibration (-Calibrate) shows what shifted, brighter, blurred and wrong-layout copies of the approved image score.
# Both numbers are measurement aids, not a human judgement: always show them with the side-by-side image.
# -Overlay <out.jpg> writes a diagnostic alignment picture (approved outlines over the Unity still and the reverse, same pixel
# positions) for the first still; it is never used for the scores.
# Usage:
#   powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\screen05-measure.ps1 [-Json <out.json>] [-Overlay <out.jpg>] <still.png> [<still2.png> ...]
#   powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\screen05-measure.ps1 -Calibrate
param(
  [string]$Approved = 'C:\RainbowUnity\references\05_flow_into_the_current.png',
  [string]$Json = '',
  [string]$Overlay = '',
  [switch]$Calibrate,
  [Parameter(Position = 0, ValueFromRemainingArguments = $true)][string[]]$Unity
)
$ErrorActionPreference = 'Stop'
$Unity = @($Unity | ForEach-Object { $_ -split '[,;]' } | ForEach-Object { $_.Trim().Trim('"') } | Where-Object { $_ })
if (-not $Calibrate -and $Unity.Count -eq 0) { throw 'Give one or more Unity still paths (or -Calibrate).' }
Add-Type -AssemblyName System.Drawing
if (-not ('Rb05Measure2' -as [type])) {
  Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class Rb05Measure2 {
  public const int W = 864, H = 1536;

  public static float[] LoadRgb(string path) {
    using (Bitmap src = new Bitmap(path)) {
      Bitmap bmp = new Bitmap(W, H, PixelFormat.Format24bppRgb);
      try {
        using (Graphics g = Graphics.FromImage(bmp)) {
          g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
          g.PixelOffsetMode = System.Drawing.Drawing2D.PixelOffsetMode.HighQuality;
          g.CompositingMode = System.Drawing.Drawing2D.CompositingMode.SourceCopy;
          g.DrawImage(src, new Rectangle(0, 0, W, H));
        }
        BitmapData data = bmp.LockBits(new Rectangle(0, 0, W, H), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
        byte[] row = new byte[data.Stride];
        float[] rgb = new float[W * H * 3];
        for (int y = 0; y < H; y++) {
          Marshal.Copy(new IntPtr(data.Scan0.ToInt64() + (long)y * data.Stride), row, 0, data.Stride);
          for (int x = 0; x < W; x++) {
            int i = (y * W + x) * 3;
            rgb[i] = row[x * 3 + 2]; rgb[i + 1] = row[x * 3 + 1]; rgb[i + 2] = row[x * 3];
          }
        }
        bmp.UnlockBits(data);
        return rgb;
      } finally { bmp.Dispose(); }
    }
  }

  // ---- calibration helpers (full-size perturbations of an image) ----
  public static float[] Shift(float[] rgb, int dx, int dy) {
    float[] o = new float[rgb.Length];
    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
      int sx = Math.Min(W - 1, Math.Max(0, x - dx)), sy = Math.Min(H - 1, Math.Max(0, y - dy));
      int i = (y * W + x) * 3, j = (sy * W + sx) * 3;
      o[i] = rgb[j]; o[i + 1] = rgb[j + 1]; o[i + 2] = rgb[j + 2];
    }
    return o;
  }
  public static float[] Gain(float[] rgb, float g) {
    float[] o = new float[rgb.Length];
    for (int i = 0; i < rgb.Length; i++) o[i] = Math.Min(255f, rgb[i] * g);
    return o;
  }
  public static float[] BlurRgb(float[] rgb, double sigma) {
    float[] o = new float[rgb.Length];
    for (int c = 0; c < 3; c++) {
      float[] ch = new float[W * H];
      for (int i = 0; i < W * H; i++) ch[i] = rgb[i * 3 + c];
      float[] b = Blur(ch, W, H, sigma);
      for (int i = 0; i < W * H; i++) o[i * 3 + c] = b[i];
    }
    return o;
  }

  static float[] Down(float[] rgb, int f) {
    int w = W / f, h = H / f; float n = f * f;
    float[] o = new float[w * h * 3];
    for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
      float r = 0, g = 0, b = 0;
      for (int yy = 0; yy < f; yy++) {
        int sy = y * f + yy;
        for (int xx = 0; xx < f; xx++) { int i = (sy * W + x * f + xx) * 3; r += rgb[i]; g += rgb[i + 1]; b += rgb[i + 2]; }
      }
      int j = (y * w + x) * 3; o[j] = r / n; o[j + 1] = g / n; o[j + 2] = b / n;
    }
    return o;
  }

  static float[] Luma(float[] rgb, int n) {
    float[] o = new float[n];
    for (int i = 0; i < n; i++) o[i] = 0.299f * rgb[i * 3] + 0.587f * rgb[i * 3 + 1] + 0.114f * rgb[i * 3 + 2];
    return o;
  }

  static double Lin(double c) { c /= 255.0; return c <= 0.04045 ? c / 12.92 : Math.Pow((c + 0.055) / 1.055, 2.4); }
  static double F(double t) { return t > 0.008856 ? Math.Pow(t, 1.0 / 3.0) : (7.787 * t + 16.0 / 116.0); }

  static float[][] Lab(float[] rgb, int n) {
    float[][] o = new float[3][]; o[0] = new float[n]; o[1] = new float[n]; o[2] = new float[n];
    for (int i = 0; i < n; i++) {
      double r = Lin(rgb[i * 3]), g = Lin(rgb[i * 3 + 1]), b = Lin(rgb[i * 3 + 2]);
      double X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
      double Y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      double Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
      double fx = F(X), fy = F(Y), fz = F(Z);
      o[0][i] = (float)(116 * fy - 16); o[1][i] = (float)(500 * (fx - fy)); o[2][i] = (float)(200 * (fy - fz));
    }
    return o;
  }

  static float[] Blur(float[] a, int w, int h, double sigma) {
    int rad = (int)Math.Ceiling(sigma * 3);
    double[] k = new double[2 * rad + 1]; double s = 0;
    for (int i = -rad; i <= rad; i++) { k[i + rad] = Math.Exp(-(i * i) / (2 * sigma * sigma)); s += k[i + rad]; }
    for (int i = 0; i < k.Length; i++) k[i] /= s;
    float[] t = new float[w * h], o = new float[w * h];
    for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
      double acc = 0;
      for (int i = -rad; i <= rad; i++) { int xx = Math.Min(w - 1, Math.Max(0, x + i)); acc += k[i + rad] * a[y * w + xx]; }
      t[y * w + x] = (float)acc;
    }
    for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
      double acc = 0;
      for (int i = -rad; i <= rad; i++) { int yy = Math.Min(h - 1, Math.Max(0, y + i)); acc += k[i + rad] * t[yy * w + x]; }
      o[y * w + x] = (float)acc;
    }
    return o;
  }

  static float[] ShiftMap(float[] a, int w, int h, int dx, int dy) {
    float[] o = new float[w * h];
    for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
      int sx = Math.Min(w - 1, Math.Max(0, x - dx)), sy = Math.Min(h - 1, Math.Max(0, y - dy));
      o[y * w + x] = a[sy * w + sx];
    }
    return o;
  }

  static float[] Ssim(float[] a, float[] b, int w, int h) {
    int n = w * h;
    float[] aa = new float[n], bb = new float[n], ab = new float[n];
    for (int i = 0; i < n; i++) { aa[i] = a[i] * a[i]; bb[i] = b[i] * b[i]; ab[i] = a[i] * b[i]; }
    float[] ma = Blur(a, w, h, 1.5), mb = Blur(b, w, h, 1.5), saa = Blur(aa, w, h, 1.5), sbb = Blur(bb, w, h, 1.5), sab = Blur(ab, w, h, 1.5);
    double C1 = Math.Pow(0.01 * 255, 2), C2 = Math.Pow(0.03 * 255, 2);
    float[] s = new float[n];
    for (int i = 0; i < n; i++) {
      double mu1 = ma[i], mu2 = mb[i];
      double v1 = saa[i] - mu1 * mu1, v2 = sbb[i] - mu2 * mu2, cv = sab[i] - mu1 * mu2;
      s[i] = (float)(((2 * mu1 * mu2 + C1) * (2 * cv + C2)) / ((mu1 * mu1 + mu2 * mu2 + C1) * (v1 + v2 + C2)));
    }
    return s;
  }

  static float[] Sobel(float[] a, int w, int h) {
    float[] g = new float[w * h];
    for (int y = 1; y < h - 1; y++) for (int x = 1; x < w - 1; x++) {
      float gx = -a[(y - 1) * w + x - 1] - 2 * a[y * w + x - 1] - a[(y + 1) * w + x - 1] + a[(y - 1) * w + x + 1] + 2 * a[y * w + x + 1] + a[(y + 1) * w + x + 1];
      float gy = -a[(y - 1) * w + x - 1] - 2 * a[(y - 1) * w + x] - a[(y - 1) * w + x + 1] + a[(y + 1) * w + x - 1] + 2 * a[(y + 1) * w + x] + a[(y + 1) * w + x + 1];
      g[y * w + x] = (float)Math.Sqrt(gx * gx + gy * gy);
    }
    return g;
  }

  static void Box(int[] regions, int r, int f, int w, int h, out int x0, out int y0, out int x1, out int y1) {
    x0 = regions[r * 4] / f; y0 = regions[r * 4 + 1] / f;
    x1 = Math.Min(w, (regions[r * 4] + regions[r * 4 + 2]) / f); y1 = Math.Min(h, (regions[r * 4 + 1] + regions[r * 4 + 3]) / f);
  }

  public static float[] FlipX(float[] rgb) {
    float[] o = new float[rgb.Length];
    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
      int i = (y * W + x) * 3, j = (y * W + (W - 1 - x)) * 3;
      o[i] = rgb[j]; o[i + 1] = rgb[j + 1]; o[i + 2] = rgb[j + 2];
    }
    return o;
  }
  public static float[] FlipY(float[] rgb) {
    float[] o = new float[rgb.Length];
    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
      int i = (y * W + x) * 3, j = ((H - 1 - y) * W + x) * 3;
      o[i] = rgb[j]; o[i + 1] = rgb[j + 1]; o[i + 2] = rgb[j + 2];
    }
    return o;
  }

  // LOOK-ALIKE (tolerant): per region: coarse shape SSIM at 1/16 (+-3 cells = +-48 px), colour-layout deltaE at 1/32
  // (+-2 cells = +-64 px), and the overlap of the two colour distributions (Lab histogram intersection, position-free).
  public static double[] CompareLoose(float[] A0, float[] U0, int[] regions) {
    int rc = regions.Length / 4;
    double[] best = new double[rc * 3];
    for (int r = 0; r < rc; r++) { best[r * 3] = -1; best[r * 3 + 1] = 1e9; best[r * 3 + 2] = 0; }
    // anti-alias before the coarse grids, so shifts smaller than one cell change the result smoothly
    float[] A = BlurRgb(A0, 8.0), U = BlurRgb(U0, 8.0);

    int w16 = W / 16, h16 = H / 16, n16 = w16 * h16;
    float[] la = Luma(Down(A, 16), n16), lu = Luma(Down(U, 16), n16);
    { int dx = 0, dy = 0;   // identical positions, no alignment search
      float[] ss = Ssim(la, ShiftMap(lu, w16, h16, dx, dy), w16, h16);
      for (int r = 0; r < rc; r++) {
        int x0, y0, x1, y1; Box(regions, r, 16, w16, h16, out x0, out y0, out x1, out y1);
        double s = 0; int c = 0;
        for (int yy = y0; yy < y1; yy++) for (int xx = x0; xx < x1; xx++) { s += ss[yy * w16 + xx]; c++; }
        if (c > 0 && s / c > best[r * 3]) best[r * 3] = s / c;
      }
    }

    int w32 = W / 32, h32 = H / 32, n32 = w32 * h32;
    float[][] ca = Lab(Down(A, 32), n32), cu = Lab(Down(U, 32), n32);
    for (int c = 0; c < 3; c++) { ca[c] = Blur(ca[c], w32, h32, 1.0); cu[c] = Blur(cu[c], w32, h32, 1.0); }
    { int dx = 0, dy = 0;   // identical positions, no alignment search
      float[] c0 = ShiftMap(cu[0], w32, h32, dx, dy), c1 = ShiftMap(cu[1], w32, h32, dx, dy), c2 = ShiftMap(cu[2], w32, h32, dx, dy);
      for (int r = 0; r < rc; r++) {
        int x0, y0, x1, y1; Box(regions, r, 32, w32, h32, out x0, out y0, out x1, out y1);
        if (x1 <= x0) x1 = Math.Min(w32, x0 + 1);
        if (y1 <= y0) y1 = Math.Min(h32, y0 + 1);
        double d = 0; int k = 0;
        for (int yy = y0; yy < y1; yy++) for (int xx = x0; xx < x1; xx++) {
          int i = yy * w32 + xx;
          double dl = ca[0][i] - c0[i], da = ca[1][i] - c1[i], db = ca[2][i] - c2[i];
          d += Math.Sqrt(dl * dl + da * da + db * db); k++;
        }
        if (k > 0 && d / k < best[r * 3 + 1]) best[r * 3 + 1] = d / k;
      }
    }

    // colour distributions at 1/4 size (unblurred): 8x8x8 Lab bins, smoothed over neighbouring bins
    int w4 = W / 4, h4 = H / 4, n4 = w4 * h4;
    float[][] ha = Lab(Down(A0, 4), n4), hu = Lab(Down(U0, 4), n4);
    for (int r = 0; r < rc; r++) {
      int x0, y0, x1, y1; Box(regions, r, 4, w4, h4, out x0, out y0, out x1, out y1);
      double[] pa = Hist(ha, w4, x0, y0, x1, y1), pu = Hist(hu, w4, x0, y0, x1, y1);
      double inter = 0; for (int i = 0; i < pa.Length; i++) inter += Math.Min(pa[i], pu[i]);
      best[r * 3 + 2] = inter;
    }
    return best;
  }

  static int Bin(double v, double lo, double hi) { int b = (int)((v - lo) / (hi - lo) * 8); return Math.Max(0, Math.Min(7, b)); }

  static double[] Hist(float[][] lab, int w, int x0, int y0, int x1, int y1) {
    double[] h = new double[512]; double n = 0;
    for (int y = y0; y < y1; y++) for (int x = x0; x < x1; x++) {
      int i = y * w + x;
      h[Bin(lab[0][i], 0, 100) * 64 + Bin(lab[1][i], -90, 90) * 8 + Bin(lab[2][i], -90, 90)] += 1; n += 1;
    }
    double[] s = new double[512]; double tot = 0;
    for (int l = 0; l < 8; l++) for (int a = 0; a < 8; a++) for (int b = 0; b < 8; b++) {
      double acc = 0;
      for (int dl = -1; dl <= 1; dl++) for (int da = -1; da <= 1; da++) for (int db = -1; db <= 1; db++) {
        int L = l + dl, A2 = a + da, B = b + db;
        if (L < 0 || L > 7 || A2 < 0 || A2 > 7 || B < 0 || B > 7) continue;
        double wgt = (dl == 0 ? 2 : 1) * (da == 0 ? 2 : 1) * (db == 0 ? 2 : 1);
        acc += wgt * h[L * 64 + A2 * 8 + B];
      }
      s[l * 64 + a * 8 + b] = acc; tot += acc;
    }
    if (tot > 0) for (int i = 0; i < 512; i++) s[i] /= tot;
    return s;
  }

  public static double[] CompareFiles(string approvedPath, string unityPath, int[] regions) {
    return Compare(LoadRgb(approvedPath), LoadRgb(unityPath), regions);
  }

  // strongest ~10 % outlines of an image (full size), as a mask
  static bool[] EdgeMask(float[] rgb) {
    float[] l = Blur(Luma(rgb, W * H), W, H, 1.5);
    float[] g = Sobel(l, W, H);
    float[] sample = new float[(W / 4) * (H / 4)]; int k = 0;
    for (int y = 0; y < H; y += 4) for (int x = 0; x < W; x += 4) if (k < sample.Length) sample[k++] = g[y * W + x];
    Array.Sort(sample, 0, k);
    float thr = sample[(int)(k * 0.90)];
    bool[] m = new bool[W * H];
    for (int i = 0; i < W * H; i++) m[i] = g[i] > thr;
    return m;
  }

  // ALIGNMENT OVERLAY (diagnostic only, never used for scores): left = Unity still (dimmed) with the APPROVED outlines in
  // yellow; right = approved (dimmed) with the UNITY outlines in cyan. Same pixel positions, no shifting or scaling.
  public static void Overlay(string approvedPath, string unityPath, string outPath) {
    float[] A = LoadRgb(approvedPath), U = LoadRgb(unityPath);
    bool[] ea = EdgeMask(A), eu = EdgeMask(U);
    using (Bitmap bmp = new Bitmap(W * 2 + 12, H + 44, PixelFormat.Format24bppRgb)) {
      BitmapData d = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), ImageLockMode.WriteOnly, PixelFormat.Format24bppRgb);
      byte[] row = new byte[d.Stride];
      for (int y = 0; y < bmp.Height; y++) {
        for (int x = 0; x < bmp.Width; x++) { row[x * 3] = 36; row[x * 3 + 1] = 18; row[x * 3 + 2] = 24; }
        int sy = y - 44;
        if (sy >= 0 && sy < H) {
          for (int x = 0; x < W; x++) {
            int i = sy * W + x;
            byte r, g, b;
            if (ea[i]) { r = 255; g = 230; b = 0; }
            else { r = (byte)(U[i * 3] * 0.5f); g = (byte)(U[i * 3 + 1] * 0.5f); b = (byte)(U[i * 3 + 2] * 0.5f); }
            row[x * 3] = b; row[x * 3 + 1] = g; row[x * 3 + 2] = r;
            int x2 = W + 12 + x;
            if (eu[i]) { r = 0; g = 230; b = 255; }
            else { r = (byte)(A[i * 3] * 0.5f); g = (byte)(A[i * 3 + 1] * 0.5f); b = (byte)(A[i * 3 + 2] * 0.5f); }
            row[x2 * 3] = b; row[x2 * 3 + 1] = g; row[x2 * 3 + 2] = r;
          }
        }
        Marshal.Copy(row, 0, new IntPtr(d.Scan0.ToInt64() + (long)y * d.Stride), d.Stride);
      }
      bmp.UnlockBits(d);
      using (Graphics gr = Graphics.FromImage(bmp))
      using (Font f = new Font("Segoe UI", 15f, FontStyle.Bold)) {
        gr.DrawString("UNITY (dimmed) + APPROVED outlines (yellow)", f, Brushes.White, 10, 10);
        gr.DrawString("APPROVED (dimmed) + UNITY outlines (cyan)", f, Brushes.White, W + 22, 10);
      }
      ImageCodecInfo jpg = null;
      foreach (ImageCodecInfo c in ImageCodecInfo.GetImageEncoders()) if (c.MimeType == "image/jpeg") jpg = c;
      EncoderParameters ep = new EncoderParameters(1);
      ep.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, 85L);
      bmp.Save(outPath, jpg, ep);
    }
  }

  // returns per region: shape (best SSIM), deltaE (best), edges (best correlation)
  public static double[] Compare(float[] A, float[] U, int[] regions) {
    int rc = regions.Length / 4;
    double[] best = new double[rc * 3];
    for (int r = 0; r < rc; r++) { best[r * 3] = -1; best[r * 3 + 1] = 1e9; best[r * 3 + 2] = -1; }

    // shape + edges at 1/8 size - identical positions, no alignment search (dx = dy = 0)
    int w8 = W / 8, h8 = H / 8, n8 = w8 * h8;
    float[] la = Luma(Down(A, 8), n8), lu = Luma(Down(U, 8), n8);
    float[] ea = Blur(Sobel(la, w8, h8), w8, h8, 1.5), euBase = Blur(Sobel(lu, w8, h8), w8, h8, 1.5);
    { int dx = 0, dy = 0;
      float[] lus = ShiftMap(lu, w8, h8, dx, dy), eus = ShiftMap(euBase, w8, h8, dx, dy);
      float[] ss = Ssim(la, lus, w8, h8);
      for (int r = 0; r < rc; r++) {
        int x0, y0, x1, y1; Box(regions, r, 8, w8, h8, out x0, out y0, out x1, out y1);
        double sSum = 0; int cnt = 0; double sa = 0, su = 0, saa = 0, suu = 0, sau = 0;
        for (int yy = y0; yy < y1; yy++) for (int xx = x0; xx < x1; xx++) {
          int i = yy * w8 + xx; sSum += ss[i]; cnt++;
          double p = ea[i], q = eus[i]; sa += p; su += q; saa += p * p; suu += q * q; sau += p * q;
        }
        if (cnt == 0) continue;
        double ssim = sSum / cnt;
        double cov = sau / cnt - (sa / cnt) * (su / cnt);
        double va = saa / cnt - (sa / cnt) * (sa / cnt), vu = suu / cnt - (su / cnt) * (su / cnt);
        double corr = (va > 1e-9 && vu > 1e-9) ? cov / Math.Sqrt(va * vu) : 0;
        if (ssim > best[r * 3]) best[r * 3] = ssim;
        if (corr > best[r * 3 + 2]) best[r * 3 + 2] = corr;
      }
    }

    // colour layout at 1/16 size, softly blurred - identical positions, no alignment search
    int w16 = W / 16, h16 = H / 16, n16 = w16 * h16;
    float[][] ca = Lab(Down(A, 16), n16), cu = Lab(Down(U, 16), n16);
    for (int c = 0; c < 3; c++) { ca[c] = Blur(ca[c], w16, h16, 1.0); cu[c] = Blur(cu[c], w16, h16, 1.0); }
    { int dx = 0, dy = 0;
      float[] c0 = ShiftMap(cu[0], w16, h16, dx, dy), c1 = ShiftMap(cu[1], w16, h16, dx, dy), c2 = ShiftMap(cu[2], w16, h16, dx, dy);
      for (int r = 0; r < rc; r++) {
        int x0, y0, x1, y1; Box(regions, r, 16, w16, h16, out x0, out y0, out x1, out y1);
        double dSum = 0; int dc = 0;
        for (int yy = y0; yy < y1; yy++) for (int xx = x0; xx < x1; xx++) {
          int i = yy * w16 + xx;
          double dl = ca[0][i] - c0[i], da = ca[1][i] - c1[i], db = ca[2][i] - c2[i];
          dSum += Math.Sqrt(dl * dl + da * da + db * db); dc++;
        }
        if (dc > 0 && dSum / dc < best[r * 3 + 1]) best[r * 3 + 1] = dSum / dc;
      }
    }
    return best;
  }
}
'@
}

# areas: the same approved-pixel boxes as tools\screen05-cycle.ps1, plus the HUD and the whole frame
$Areas = [ordered]@{
  OVERALL       = @(0, 0, 864, 1536)
  hud           = @(0, 60, 864, 200)
  walls         = @(0, 180, 864, 400)
  throat        = @(330, 360, 320, 220)
  water_mid     = @(100, 520, 700, 460)
  water_near    = @(0, 1150, 864, 386)
  foam_left     = @(0, 500, 360, 340)
  foam_right    = @(560, 540, 304, 420)
  bubbles_left  = @(0, 640, 300, 680)
  bubbles_right = @(600, 640, 264, 680)
  splash        = @(150, 1040, 560, 300)
  benny         = @(210, 760, 430, 460)
}
$flat = New-Object 'System.Collections.Generic.List[int]'
foreach ($k in $Areas.Keys) { $flat.AddRange([int[]]$Areas[$k]) }
$regions = $flat.ToArray()

function Get-Rows([double[]]$r, [double[]]$l) {
  $rows = @(); $i = 0
  foreach ($k in $Areas.Keys) {
    $shape = $r[$i * 3]; $de = $r[$i * 3 + 1]; $edge = $r[$i * 3 + 2]
    $layout = 100.0 * ([Math]::Max(0.0, $shape) + [Math]::Max(0.0, 1.0 - $de / 50.0) + [Math]::Max(0.0, $edge)) / 3.0
    $lshape = $l[$i * 3]; $lde = $l[$i * 3 + 1]; $lhist = $l[$i * 3 + 2]
    $visual = 100.0 * ([Math]::Max(0.0, $lshape) + [Math]::Max(0.0, 1.0 - $lde / 50.0) + $lhist) / 3.0
    $rows += [pscustomobject]@{
      area = $k; visual = [Math]::Round($visual, 1); layout = [Math]::Round($layout, 1)
      v_shape = [Math]::Round($lshape, 3); v_dE = [Math]::Round($lde, 1); v_colours = [Math]::Round($lhist, 3)
      l_shape = [Math]::Round($shape, 3); l_dE = [Math]::Round($de, 1); l_edges = [Math]::Round($edge, 3)
    }
    $i++
  }
  $rows
}
function Measure-Pair([float[]]$A, [float[]]$B) {
  Get-Rows ([Rb05Measure2]::Compare($A, $B, $regions)) ([Rb05Measure2]::CompareLoose($A, $B, $regions))
}

if (-not (Test-Path -LiteralPath $Approved)) { throw "Approved image not found: $Approved" }
$appPath = (Resolve-Path -LiteralPath $Approved).Path
$A = [Rb05Measure2]::LoadRgb($appPath)

if ($Calibrate) {
  $tests = [ordered]@{
    'same picture, other file (hi-res jpg)' = { [Rb05Measure2]::LoadRgb('C:\RainbowUnity\references\hires\05_flow_into_the_current_1080.jpg') }
    'whole view shifted 8 px'               = { [Rb05Measure2]::Shift($A, 8, 8) }
    'whole view shifted 24 px'              = { [Rb05Measure2]::Shift($A, 24, 24) }
    'whole view shifted 48 px'              = { [Rb05Measure2]::Shift($A, 48, 48) }
    '15 % brighter'                         = { [Rb05Measure2]::Gain($A, 1.15) }
    '30 % darker'                           = { [Rb05Measure2]::Gain($A, 0.70) }
    'soft blur (sigma 3 px)'                = { [Rb05Measure2]::BlurRgb($A, 3.0) }
    'mirrored left-right (wrong layout)'    = { [Rb05Measure2]::FlipX($A) }
    'upside down (wrong layout)'            = { [Rb05Measure2]::FlipY($A) }
  }
  Write-Output 'CALIBRATION: approved image vs changed copies of itself (OVERALL)     visual  layout'
  foreach ($k in $tests.Keys) {
    $rows = Measure-Pair $A (& $tests[$k])
    Write-Output ("  {0,-62} {1,6} {2,7}" -f $k, $rows[0].visual, $rows[0].layout)
  }
  Write-Output ''
}

$all = @()
foreach ($u in $Unity) {
  if (-not (Test-Path -LiteralPath $u)) { Write-Output "MISSING: $u"; continue }
  $uPath = (Resolve-Path -LiteralPath $u).Path
  $rows = Measure-Pair $A ([Rb05Measure2]::LoadRgb($uPath))
  Write-Output ("MATCH  {0}   (approved vs Unity at identical positions; 100 = same picture)" -f (Split-Path -Leaf $u))
  Write-Output ($rows | Format-Table area, visual, layout, v_shape, v_dE, v_colours, l_shape, l_dE, l_edges -AutoSize | Out-String -Width 160).TrimEnd()
  Write-Output ("SCORE visual={0} layout={1}" -f $rows[0].visual, $rows[0].layout)
  Write-Output ''
  $all += [pscustomobject]@{ still = $u; areas = $rows }
  if ($Overlay -and $all.Count -eq 1) { [Rb05Measure2]::Overlay($appPath, $uPath, $Overlay); Write-Output "OVERLAY $Overlay" }
}
if ($Json) { $all | ConvertTo-Json -Depth 5 | Out-File -Encoding utf8 -FilePath $Json }

param(
  [Parameter(Mandatory=$true)][string]$Image,
  [int[]]$Rows = @(540,560,580,600,625,650,675,700,750,800,850,900,950,1000,1050,1100,1150,1200,1250,1300,1350,1400),
  [string]$MapOut = "",
  [int]$Win = 7,
  [int]$MinRun = 6
)
Add-Type -AssemblyName System.Drawing
$src = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Text;
using System.Collections.Generic;
public static class RowClass {
  public static char Cls(int r, int g, int b) {
    int mx = Math.Max(r, Math.Max(g, b)), mn = Math.Min(r, Math.Min(g, b));
    int sat = mx - mn;
    // gold / orange / copper
    if (r > 170 && g > 70 && b < 110 && r > b + 90) return 'G';
    // white / near-white (foam caps, specular)
    if (mn > 200) return 'W';
    // lavender / periwinkle foam body: bluish, moderately saturated, red and green both mid-high
    if (b > 170 && r > 110 && g > 110 && Math.Abs(r - g) < 60 && b >= r && b >= g && sat < 120) return 'L';
    // cyan water
    if (r < 110 && g > 110 && b > 160) return 'C';
    // deep blue water
    if (r < 110 && g <= 110 && b > 130) return 'B';
    // pink / magenta band (or wall highlights)
    if (r > 170 && g < 140 && b > 110 && r >= b - 20) return 'P';
    // violet / purple
    if (b > 100 && r > 60 && g < 110 && b >= r - 30) return 'V';
    if (mx < 60) return 'D';
    return '.';
  }
  public static string[] Run(string path, int[] rows, int win, int minRun, string mapOut) {
    var bmp = new Bitmap(path);
    int W = bmp.Width, H = bmp.Height;
    var rect = new Rectangle(0, 0, W, H);
    var data = bmp.LockBits(rect, ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
    int stride = data.Stride;
    byte[] px = new byte[stride * H];
    System.Runtime.InteropServices.Marshal.Copy(data.Scan0, px, 0, px.Length);
    bmp.UnlockBits(data);
    char[,] cls = new char[H, W];
    for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
      int o = y * stride + x * 3;
      cls[y, x] = Cls(px[o + 2], px[o + 1], px[o]);
    }
    if (!string.IsNullOrEmpty(mapOut)) {
      var m = new Bitmap(W, H, PixelFormat.Format24bppRgb);
      for (int y = 0; y < H; y++) for (int x = 0; x < W; x++) {
        Color c;
        switch (cls[y, x]) {
          case 'G': c = Color.FromArgb(230, 160, 30); break;
          case 'W': c = Color.White; break;
          case 'L': c = Color.FromArgb(170, 170, 255); break;
          case 'C': c = Color.FromArgb(0, 200, 255); break;
          case 'B': c = Color.FromArgb(0, 60, 200); break;
          case 'P': c = Color.FromArgb(255, 40, 200); break;
          case 'V': c = Color.FromArgb(110, 30, 160); break;
          case 'D': c = Color.Black; break;
          default: c = Color.FromArgb(90, 90, 90); break;
        }
        m.SetPixel(x, y, c);
      }
      m.Save(mapOut, ImageFormat.Png);
      m.Dispose();
    }
    bmp.Dispose();
    var res = new List<string>();
    string order = "GWLCBPVD.";
    foreach (int y in rows) {
      // majority filter over [y-2,y+2] x [x-win/2, x+win/2]
      char[] sm = new char[W];
      for (int x = 0; x < W; x++) {
        int[] cnt = new int[order.Length];
        for (int yy = Math.Max(0, y - 2); yy <= Math.Min(H - 1, y + 2); yy++)
          for (int xx = Math.Max(0, x - win / 2); xx <= Math.Min(W - 1, x + win / 2); xx++)
            cnt[order.IndexOf(cls[yy, xx])]++;
        int bi = 0; for (int k = 1; k < cnt.Length; k++) if (cnt[k] > cnt[bi]) bi = k;
        sm[x] = order[bi];
      }
      // runs
      var runs = new List<int[]>(); // start, end, char
      int s0 = 0;
      for (int x = 1; x <= W; x++) {
        if (x == W || sm[x] != sm[s0]) { runs.Add(new int[] { s0, x - 1, sm[s0] }); s0 = x; }
      }
      // merge short runs into neighbours
      bool changed = true;
      while (changed) {
        changed = false;
        for (int i = 0; i < runs.Count; i++) {
          int len = runs[i][1] - runs[i][0] + 1;
          if (len < minRun && runs.Count > 1) {
            int j = (i == 0) ? 1 : (i == runs.Count - 1 ? i - 1 : ((runs[i - 1][1] - runs[i - 1][0]) >= (runs[i + 1][1] - runs[i + 1][0]) ? i - 1 : i + 1));
            runs[j][0] = Math.Min(runs[j][0], runs[i][0]);
            runs[j][1] = Math.Max(runs[j][1], runs[i][1]);
            runs.RemoveAt(i);
            changed = true; break;
          }
        }
        for (int i = 0; i + 1 < runs.Count; i++) {
          if (runs[i][2] == runs[i + 1][2]) { runs[i][1] = runs[i + 1][1]; runs.RemoveAt(i + 1); changed = true; break; }
        }
      }
      var sb = new StringBuilder();
      sb.Append("y" + y.ToString().PadLeft(4) + ": ");
      foreach (var r in runs) sb.Append(((char)r[2]) + "" + r[0] + "-" + r[1] + " ");
      res.Add(sb.ToString());
    }
    return res.ToArray();
  }
}
"@
if (-not ([System.Management.Automation.PSTypeName]'RowClass').Type) {
  Add-Type -TypeDefinition $src -ReferencedAssemblies System.Drawing
}
[RowClass]::Run($Image, $Rows, $Win, $MinRun, $MapOut)

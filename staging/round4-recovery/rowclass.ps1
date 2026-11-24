param([string]$Src, [int]$Y0 = 480, [int]$Y1 = 1200, [int]$Step = 10, [int]$X0 = 0, [int]$X1 = 864, [int]$MinRun = 6)
Add-Type -AssemblyName System.Drawing
if (-not ("RowClass" -as [type])) {
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Text;
public static class RowClass {
    // P pink/magenta, V violet, B blue, C cyan, W white/pale, G gold/orange, D dark
    public static char Classify(int r, int g, int b) {
        int mx = Math.Max(r, Math.Max(g, b)), mn = Math.Min(r, Math.Min(g, b));
        double sat = mx == 0 ? 0 : (mx - mn) / (double)mx;
        if (mx < 60) return 'D';
        if (sat < 0.22 && mx > 170) return 'W';
        double h;
        double dd = mx - mn; if (dd < 1) dd = 1;
        if (mx == r) h = 60 * (((g - b) / dd) % 6);
        else if (mx == g) h = 60 * ((b - r) / dd + 2);
        else h = 60 * ((r - g) / dd + 4);
        if (h < 0) h += 360;
        if (h >= 20 && h < 70) return 'G';
        if (h >= 160 && h < 205) return 'C';
        if (h >= 205 && h < 245) return 'B';
        if (h >= 245 && h < 285) return 'V';
        if (h >= 285 || h < 20) return 'P';
        return 'O';
    }
    public static string Rows(string path, int y0, int y1, int step, int x0, int x1, int minRun) {
        var bmp = new Bitmap(path);
        var sb = new StringBuilder();
        var data = bmp.LockBits(new Rectangle(0, 0, bmp.Width, bmp.Height), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
        int stride = data.Stride;
        byte[] buf = new byte[stride * bmp.Height];
        System.Runtime.InteropServices.Marshal.Copy(data.Scan0, buf, 0, buf.Length);
        bmp.UnlockBits(data);
        for (int y = y0; y <= y1; y += step) {
            // class per x using a 3-row vertical average
            char[] cls = new char[x1 - x0];
            for (int x = x0; x < x1; x++) {
                int r = 0, g = 0, b = 0, n = 0;
                for (int dy = -1; dy <= 1; dy++) {
                    int yy = Math.Min(bmp.Height - 1, Math.Max(0, y + dy));
                    for (int dx = -1; dx <= 1; dx++) {
                        int xx = Math.Min(bmp.Width - 1, Math.Max(0, x + dx));
                        int o = yy * stride + xx * 3;
                        b += buf[o]; g += buf[o + 1]; r += buf[o + 2]; n++;
                    }
                }
                cls[x - x0] = Classify(r / n, g / n, b / n);
            }
            // majority filter over 7 px window
            char[] f = new char[cls.Length];
            for (int i = 0; i < cls.Length; i++) {
                int[] cnt = new int[128];
                for (int k = Math.Max(0, i - 3); k <= Math.Min(cls.Length - 1, i + 3); k++) cnt[cls[k]]++;
                char best = cls[i]; int bc = 0;
                foreach (char c in "PVBCWGDO") if (cnt[c] > bc) { bc = cnt[c]; best = c; }
                f[i] = best;
            }
            sb.Append(y.ToString().PadLeft(4)).Append(": ");
            int start = 0;
            for (int i = 1; i <= f.Length; i++) {
                if (i == f.Length || f[i] != f[start]) {
                    if (i - start >= minRun) sb.Append(f[start]).Append(x0 + start).Append('-').Append(x0 + i - 1).Append(' ');
                    start = i;
                }
            }
            sb.AppendLine();
        }
        bmp.Dispose();
        return sb.ToString();
    }
}
"@
}
[RowClass]::Rows($Src, $Y0, $Y1, $Step, $X0, $X1, $MinRun)

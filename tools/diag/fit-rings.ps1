# GEOMETRY FITTER (offline, read-only): finds where a circular drum ring (radius R, centre (x0, axisY), distance s) must stand so that its
# projected wall edge / inner crest lands on the circles measured on the approved image, with the real gameplay camera of the approved view
# (Benny s = 14): position (-0.06, 3.40, 7.48), pitch 12.78 down, yaw -2.80, vertical FOV 62 at 864x1536 (f = 1278.2 px).
# Measured target circles (approved px) are listed below; measurement only, nothing here is used by the game at run time.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\diag\fit-rings.ps1 [-R 6.8]
param([double]$R = 6.8)
if (-not ('RingFit' -as [type])) {
Add-Type -TypeDefinition @'
using System;
using System.Text;
public static class RingFit {
  const double F = 1278.2, CX = -0.06, CY = 3.40, CZ = 7.48;
  static readonly double p = 12.78 * Math.PI / 180, y = -2.80 * Math.PI / 180;
  public static bool Proj(double X, double Y, double Z, out double px, out double py) {
    double dx = X - CX, dy = Y - CY, dz = Z - CZ;
    double fx = Math.Sin(y) * Math.Cos(p), fy = -Math.Sin(p), fz = Math.Cos(y) * Math.Cos(p);
    double rx = Math.Cos(y), rz = -Math.Sin(y);
    double ux = Math.Sin(y) * Math.Sin(p), uy = Math.Cos(p), uz = Math.Cos(y) * Math.Sin(p);
    double d = dx * fx + dy * fy + dz * fz;
    px = 432 + F * (dx * rx + dz * rz) / d; py = 768 - F * (dx * ux + dy * uy + dz * uz) / d;
    return d > 0.01;
  }
  // distance error of the projected 3D circle (radius r) to the target circle (tx,ty,tr) over the visible part (py < yMax, 0<px<864 or any)
  static double Err(double x0, double ay, double s, double r, double tx, double ty, double tr, double yMin, double yMax, out int n) {
    double e = 0; n = 0;
    for (int k = 0; k < 180; k++) {
      double a = 2 * Math.PI * k / 180; double qx, qy;
      if (!Proj(x0 + r * Math.Sin(a), ay + r * Math.Cos(a), s, out qx, out qy)) continue;
      if (qy > yMax || qy < yMin || qx < -10 || qx > 874) continue;
      double dd = Math.Sqrt((qx - tx) * (qx - tx) + (qy - ty) * (qy - ty)) - tr; e += dd * dd; n++;
    }
    return e;
  }
  // v = x0, axisY, s, bandFraction ; t = outer (tx,ty,tr) inner (tx,ty,tr) ; R fixed
  public static double Cost(double[] v, double R, double[] t, double yMin, double yMax) {
    int n1, n2; double s = v[2]; if (s < 9) return 1e9;
    double e = Err(v[0], v[1], s, R, t[0], t[1], t[2], yMin, yMax, out n1);
    double e2 = t[5] > 0 ? Err(v[0], v[1], s, R * (1 - v[3]), t[3], t[4], t[5], yMin, yMax, out n2) : 0; if (t[5] <= 0) n2 = 0; else Err(v[0], v[1], s, R * (1 - v[3]), t[3], t[4], t[5], yMin, yMax, out n2);
    if (n1 + n2 < 10) return 1e9;
    return Math.Sqrt((e + e2) / (n1 + n2));
  }
  public static string Fit(string name, double R, double[] t, double yMin, double yMax, double[] start) {
    double[] v = (double[])start.Clone(); double[] step = { 0.4, 0.4, 2.0, 0.02 }; double best = Cost(v, R, t, yMin, yMax);
    for (int it = 0; it < 4000; it++) {
      bool any = false;
      for (int i = 0; i < 4; i++) foreach (int sg in new int[] { 1, -1 }) {
        double[] w = (double[])v.Clone(); w[i] += sg * step[i]; double c = Cost(w, R, t, yMin, yMax);
        if (c < best - 1e-9) { best = c; v = w; any = true; }
      }
      if (!any) { for (int i = 0; i < 4; i++) step[i] *= 0.6; if (step[2] < 1e-3) break; }
    }
    double px, py; Proj(v[0], v[1] + R, v[2], out px, out py);
    return string.Format("{0}: x0 {1:F2} axisY {2:F2} s {3:F1} band {4:F3}  rms {5:F1} px  crown y {6:F0}", name, v[0], v[1], v[2], v[3], best, py);
  }
}
'@
}
# measured on references/05_flow_into_the_current.png (gridshapes.ps1): outer = wall edge, inner = crest
[RingFit]::Fit('N (near)', $R, [double[]]@(453, 485, 492, 453, 485, 424), 100, 720, [double[]]@(-0.6, 3.0, 25, 0.14))
[RingFit]::Fit('A', $R, [double[]]@(468, 455, 265, 468, 454, 225), 0, 590, [double[]]@(-0.7, 3.6, 40, 0.15))
[RingFit]::Fit('B', $R, [double[]]@(486, 453, 153.5, 485.5, 452, 133), 0, 560, [double[]]@(-0.5, 4.3, 64, 0.13))
[RingFit]::Fit('C', $R, [double[]]@(490, 460, 92, 490, 460, 80), 0, 540, [double[]]@(-0.5, 4.5, 100, 0.13))
[RingFit]::Fit('D', $R, [double[]]@(496.5, 469, 59.5, 496.5, 469, 51), 0, 520, [double[]]@(0, 4.4, 150, 0.13))

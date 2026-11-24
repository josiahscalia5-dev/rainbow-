param([string]$Out, [string]$Image = "C:\RainbowUnity\references\05_flow_into_the_current.png", [int]$New = 1)
Add-Type -AssemblyName System.Drawing
$src = @"
using System;
public static class RL {
  static double SS(double a, double b, double x) { double t = Math.Max(0, Math.Min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  static double Smoother(double a, double b, double x) { double t = Math.Max(0, Math.Min(1, (x - a) / (b - a))); return t * t * t * (t * (t * 6 - 15) + 10); }
  static double SMin(double a, double b, double k) { double h = Math.Max(k - Math.Abs(a - b), 0) / k; return Math.Min(a, b) - h * h * k * 0.25; }
  // RiverPath
  const double Lambda = 32, UCrest = 14, A0 = 0.45, A1 = 1.85, StageLength = 72, UKeep = 22, UTail = 67, ExitU0 = 56, ExitU1 = 67, ExitAmp = 1.353668;
  static double[] KU = { 22, 26.3, 32.2, 43, 55.5, 67 };
  static double[] KV = new double[6];
  static double SlopeKeep, SlopeTail;
  static RL() { KV[0] = MS(UKeep); KV[1] = 0.37; KV[2] = -0.23; KV[3] = -1.14; KV[4] = -0.79; KV[5] = MS(UTail); SlopeKeep = Sl(UKeep); SlopeTail = Sl(UTail); }
  static double MS(double u) { double grow = Math.Max(0, Math.Min(1, (u - UCrest) / (1.5 * Lambda))); double amp = (A0 + (A1 - A0) * grow) * SS(0, 10, u) * (1 - SS(StageLength - 12, StageLength, u)); return -amp * Math.Cos(2 * Math.PI * (u - UCrest) / Lambda); }
  static double Sl(double u) { return (MS(u + 1e-3) - MS(u - 1e-3)) / 2e-3; }
  static double Herm(double u) {
    int n = 6; if (u >= KU[n - 1]) return KV[n - 1]; int i = 0; while (u > KU[i + 1]) i++;
    Func<int, double> Tan = j => j == 0 ? SlopeKeep : j == n - 1 ? SlopeTail : (KV[j + 1] - KV[j - 1]) / (KU[j + 1] - KU[j - 1]);
    double u0 = KU[i], p0 = KV[i], u1 = KU[i + 1], p1 = KV[i + 1], h = u1 - u0, t = (u - u0) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * h * Tan(i) + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * h * Tan(i + 1);
  }
  public static double Meander(double s) {
    if (s <= 0 || s >= StageLength) return 0; if (s <= UKeep || s >= UTail) return MS(s);
    double bend = (s > ExitU0 && s < ExitU1) ? ExitAmp * Math.Pow(Math.Sin(Math.PI * (s - ExitU0) / (ExitU1 - ExitU0)), 2) : 0;
    return Herm(s) + bend;
  }
  public static double HW(double s) { double d = Meander(s); return 6.0 - Math.Sqrt(d * d + 0.09); }
  public static double SBend(double sm) { return 1.05 * Math.Sin(sm * 0.31 - 0.834) + 0.18 * Math.Sin(sm * 0.62 + 0.6); }
  public static double CoreShift(double s) { double ms = s + 116.7; double w = SS(171, 175, ms) * (1 - SS(182, 189, ms)); if (w <= 0) return 0; double d = Meander(s); double vis = d + (0.9 * d + SBend(ms)); double tg = -0.67 + 0.37 * SS(172, 180, ms); return w * (tg - vis); }
  // DrumLayout05
  public static double Wall(double s) { double eyeS = 14 - 6.52; double extra = 1.0 * (1 - Smoother(eyeS + 28, eyeS + 38, s)) * SS(2, 10, s); double cy = 6.8 - (2.55 + extra); return Math.Sqrt(Math.Max(0, 6.8 * 6.8 - cy * cy)); }
  public static int NewLayout = 1;
  static double FL(double sm) { double v = -0.5 * SS(143, 147, sm) * (1 - SS(151, 155, sm)) + 1.0 * SS(154, 158, sm) * (1 - SS(168, 176, sm)); if (NewLayout == 1) v += 1.5 * SS(147.5, 151.5, sm) * (1 - SS(158, 166, sm)); return v; }
  static double FR(double sm) { double v = -0.3 * SS(133, 136, sm) * (1 - SS(139.5, 142, sm)) + 1.9 * SS(146.5, 154, sm) * (1 - SS(160, 168, sm)) - 0.9 * SS(165, 170, sm) * (1 - SS(174, 180, sm)); if (NewLayout == 1) v += 1.4 * SS(152, 156, sm) * (1 - SS(161, 168, sm)); return v; }
  public static double FitM(double sm) { if (NewLayout != 1) return 0; return 1.0 * SS(137.2, 139.7, sm) * (1 - SS(141.2, 147.2, sm)) - 0.35 * SS(147.7, 150.7, sm) * (1 - SS(153.7, 158.7, sm)) - 1.0 * SS(166.7, 171.7, sm) * (1 - SS(176.7, 182.7, sm)); }
  // returns world x of: left foam waterline, left band centre, right band centre, right foam waterline, left wall, right wall
  public static double[] Layout(double s) {
    double d = Meander(s), hw = Math.Max(HW(s), 0.5), sm = s + 116.7, W = Wall(s);
    double Mb = 0.9 * d + CoreShift(s) + SBend(sm) + FitM(sm);
    double k = NewLayout == 1 ? SS(136.2, 140.2, sm) : 0;
    double limL = (hw - 0.5) + (W + d - 0.6 - (hw - 0.5)) * k, limR = (hw - 0.5) + (W - d - 0.6 - (hw - 0.5)) * k;
    double offL = hw * (0.62 + 0.03 * Math.Sin(sm * 0.13 + 1.7)) + FL(sm);
    double offR = hw * (0.62 + 0.03 * Math.Sin(sm * 0.11 + 4.2)) + FR(sm);
    double wL = hw * 0.205 * (1 + 0.15 * Math.Sin(sm * 0.19 + 0.4));
    double wR = hw * 0.205 * (1 + 0.15 * Math.Sin(sm * 0.17 + 2.9));
    double roomL = Mb + limL - offL, roomR = limR - Mb - offR;
    wL = SMin(wL, Math.Max(roomL, 0.6 * wL), 0.5); wR = SMin(wR, Math.Max(roomR, 0.6 * wR), 0.5);
    offL = SMin(offL, Mb + limL - wL, 1.2); offR = SMin(offR, limR - wR - Mb, 1.2);
    double bandL = Mb - offL, bandR = Mb + offR;
    double eL = Mb - offL - wL, eR = Mb + offR + wR;
    eL -= 0.26 + 0.12 * Math.Sin(sm * 0.37 + 1.3) + 0.07 * Math.Sin(sm * 0.91 + 0.4);
    eR += 0.26 + 0.12 * Math.Sin(sm * 0.41 + 4.1) + 0.07 * Math.Sin(sm * 0.87 + 2.2);
    double pL = 0.6 * Math.Sin(sm * 0.173 + 0.6) + 0.4 * Math.Sin(sm * 0.419 + 2.3);
    double pR = 0.6 * Math.Sin(sm * 0.191 + 3.7) + 0.4 * Math.Sin(sm * 0.443 + 0.9);
    eL += 0.8 * SS(0.3, 0.95, pL); eR -= 0.8 * SS(0.3, 0.95, pR);
    double kW = NewLayout == 1 ? SS(136.2, 136.9, sm) : 0;
    double wallL = -(W + d), wallR = W - d;
    double rimL = 0.35 + 0.8 * SS(136.9, 137.9, sm) + 0.35 * SS(138.0, 140.5, sm) + 1.25 * SS(140.5, 143.5, sm) - 0.7 * SS(145.0, 148.0, sm) - 0.9 * SS(148.0, 151.0, sm) - 0.35 * SS(151.5, 153.5, sm);
    double rimLmin = rimL + (0.35 - rimL) * SS(152.0, 154.0, sm);
    double rimR = 0.45 + 0.75 * (1 - SS(141.5, 144.0, sm)) + 3.0 * (1 - SS(140.0, 141.5, sm)) + 1.15 * SS(157.7, 160.7, sm) + 0.7 * SS(160.7, 164.3, sm) + 0.5 * SS(164.3, 168.3, sm) + 0.7 * SS(168.3, 173.2, sm) + 0.4 * SS(173.2, 179.3, sm) - 1.8 * SS(179.3, 186.7, sm) - 1.5 * SS(186.7, 196.7, sm);
    double rimRmin = 0.35 + (rimR - 0.35) * (SS(156.5, 158.5, sm) * (1 - SS(185.0, 189.0, sm)));
    double cL = Math.Max(wallL + rimLmin, Math.Min(wallL + rimL, eL)); double cR = Math.Max(wallR - rimR, Math.Min(wallR - rimRmin, eR));
    eL = eL + (cL - eL) * kW; eR = eR + (cR - eR) * kW;
    double kL1 = SS(126.6, 127.6, sm) * (1 - SS(129.0, 129.8, sm)), kL2 = SS(129.0, 130.0, sm) * (1 - SS(131.6, 132.6, sm));
    double kR1 = SS(126.6, 127.6, sm) * (1 - SS(128.9, 129.7, sm)), kR2 = SS(130.6, 132.0, sm) * (1 - SS(137.0, 139.5, sm));
    eL = eL + (Math.Max(eL, -1.25) - eL) * kL1; eL = eL + (Math.Max(eL, -2.05) - eL) * kL2;
    eR = eR + (Math.Min(eR, 1.3) - eR) * kR1; eR = eR + (Math.Min(eR, 2.7) - eR) * kR2;
    double coin = 0.63 * d; eL = Math.Min(eL, coin - 1.25); eR = Math.Max(eR, coin + 1.25);
    eL = Math.Max(eL, -hw + (wallL + hw) * kW); eR = Math.Min(eR, hw + (wallR - hw) * kW);
    return new double[] { d + eL, d + bandL, d + bandR, d + eR, -W, W, d + bandL - wL, d + bandL + wL, d + bandR - wR, d + bandR + wR };
  }
  public static double CamX = -0.06, CamY = 3.40, CamZ = 7.48, Pitch = 12.78, Yaw = -2.80, F = 1278.17;
  public static double[] Project(double X, double Y, double Z) {
    double dx = X - CamX, dy = Y - CamY, dz = Z - CamZ;
    double p = Pitch * Math.PI / 180.0, w = -Yaw * Math.PI / 180.0;
    double x1 = dx * Math.Cos(w) + dz * Math.Sin(w), z1 = -dx * Math.Sin(w) + dz * Math.Cos(w), y1 = dy;
    double y2 = y1 * Math.Cos(-p) - z1 * Math.Sin(-p), z2 = y1 * Math.Sin(-p) + z1 * Math.Cos(-p);
    return new double[] { 432.0 + F * x1 / z2, 768.0 - F * y2 / z2 };
  }
}
"@
if (-not ([System.Management.Automation.PSTypeName]'RL').Type) { Add-Type -TypeDefinition $src }
[RL]::NewLayout = $New
$img = [System.Drawing.Image]::FromFile($Image)
$bmp = New-Object System.Drawing.Bitmap $img.Width, $img.Height
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.DrawImage($img, 0, 0, $img.Width, $img.Height)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$cols = @([System.Drawing.Color]::White, [System.Drawing.Color]::Magenta, [System.Drawing.Color]::Magenta, [System.Drawing.Color]::White, [System.Drawing.Color]::Yellow, [System.Drawing.Color]::Yellow, [System.Drawing.Color]::Pink, [System.Drawing.Color]::Pink, [System.Drawing.Color]::Pink, [System.Drawing.Color]::Pink)
$widths = @(3, 2, 2, 3, 2, 2, 1, 1, 1, 1)
for ($k = 0; $k -lt 10; $k++) {
  $pts = New-Object System.Collections.Generic.List[System.Drawing.PointF]
  for ($s = 16.0; $s -le 118.0; $s += 0.25) {
    $L = [RL]::Layout($s)
    $p = [RL]::Project($L[$k], 0, $s)
    if ($p[1] -gt 470 -and $p[0] -gt -200 -and $p[0] -lt 1100) { $pts.Add((New-Object System.Drawing.PointF ([single]$p[0]), ([single]$p[1]))) }
  }
  if ($pts.Count -gt 1) {
    $pen = New-Object System.Drawing.Pen $cols[$k], $widths[$k]
    if ($k -ge 6) { $pen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash }
    $g.DrawLines($pen, $pts.ToArray())
  }
}
$g.Dispose(); $img.Dispose()
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Jpeg); $bmp.Dispose()
"saved $Out"
foreach ($s in 21,23.5,25,27.3,30,33.3,36.8,40,44,47.6,51.6,56.5,62.6,70) { $L = [RL]::Layout($s); "s={0,5}: foamL {1,6:0.00} bandL {2,6:0.00} bandR {3,6:0.00} foamR {4,6:0.00} wall {5,5:0.00}" -f $s, $L[0], $L[1], $L[2], $L[3], $L[5] }

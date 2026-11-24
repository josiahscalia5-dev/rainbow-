param(
  [string]$Image = "C:\RainbowUnity\references\05_flow_into_the_current.png",
  [int[]]$Rows = @(500,510,520,530,540,550,560,570,580,590,600,615,630,650,675,700,725,750,775,800,850,900,950,1000,1050,1100,1150,1200,1250,1300),
  [int]$MinRun = 8
)
$src = @"
using System;
public static class WorldMap {
  public static double CamX = -0.06, CamY = 3.40, CamZ = 7.48, Pitch = 12.78, Yaw = -2.80, F = 1278.17;
  public static double[] Ray(double px, double py) {
    double x = (px - 432.0) / F, y = -(py - 768.0) / F, z = 1.0;
    double p = Pitch * Math.PI / 180.0, w = Yaw * Math.PI / 180.0;
    double y1 = y * Math.Cos(p) - z * Math.Sin(p), z1 = y * Math.Sin(p) + z * Math.Cos(p), x1 = x;
    double x2 = x1 * Math.Cos(w) + z1 * Math.Sin(w), z2 = -x1 * Math.Sin(w) + z1 * Math.Cos(w);
    return new double[] { x2, y1, z2 };
  }
  // water-plane point at height H for a pixel
  public static double[] Water(double px, double py, double H) {
    var d = Ray(px, py);
    if (d[1] >= -1e-6) return new double[] { double.NaN, double.NaN };
    double t = (H - CamY) / d[1];
    return new double[] { CamX + t * d[0], CamZ + t * d[2] };
  }
  public static double[] Project(double X, double Y, double Z) {
    double dx = X - CamX, dy = Y - CamY, dz = Z - CamZ;
    double p = Pitch * Math.PI / 180.0, w = -Yaw * Math.PI / 180.0;
    // inverse yaw
    double x1 = dx * Math.Cos(w) + dz * Math.Sin(w), z1 = -dx * Math.Sin(w) + dz * Math.Cos(w), y1 = dy;
    // inverse pitch
    double y2 = y1 * Math.Cos(-p) - z1 * Math.Sin(-p), z2 = y1 * Math.Sin(-p) + z1 * Math.Cos(-p);
    return new double[] { 432.0 + F * x1 / z2, 768.0 - F * y2 / z2 };
  }
}
"@
if (-not ([System.Management.Automation.PSTypeName]'WorldMap').Type) { Add-Type -TypeDefinition $src }
$sp = Split-Path -Parent $MyInvocation.MyCommand.Path
$lines = & "$sp\rowclass.ps1" -Image $Image -Rows $Rows -MinRun $MinRun
foreach ($ln in $lines) {
  if ($ln -notmatch '^y\s*(\d+): (.*)$') { continue }
  $y = [int]$Matches[1]; $runs = $Matches[2].Trim() -split ' '
  $c = [WorldMap]::Water(496, $y, 0)
  $s = $c[1]
  $parts = @()
  foreach ($r in $runs) {
    if ($r -notmatch '^(.)(\d+)-(\d+)$') { continue }
    $k = $Matches[1]; $a = [int]$Matches[2]; $b = [int]$Matches[3]
    if ($k -notin @('P','W','L','C','B')) { continue }
    $wa = [WorldMap]::Water($a, $y, 0); $wb = [WorldMap]::Water($b, $y, 0)
    $parts += ("{0}[{1:0.0},{2:0.0}]" -f $k, $wa[0], $wb[0])
  }
  "{0,5} s={1,6:0.0} : {2}" -f $y, $s, ($parts -join ' ')
}

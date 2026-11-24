param([string]$Unity, [string]$Approved = 'C:\RainbowUnity\references\05_flow_into_the_current.png',
  [int]$X0, [int]$Y0, [int]$X1, [int]$Y1, [int]$Step = 2, [int]$Avg = 1)
# Read-only: prints colour along a line (x0,y0)->(x1,y1) in approved and Unity still (same pixel positions).
Add-Type -AssemblyName System.Drawing
$a = New-Object System.Drawing.Bitmap $Approved
$u = $null; if ($Unity) { $u = New-Object System.Drawing.Bitmap $Unity }
$len = [Math]::Max([Math]::Abs($X1 - $X0), [Math]::Abs($Y1 - $Y0))
function Get-Px($bmp, [int]$x, [int]$y, [int]$r) {
  $sr = 0; $sg = 0; $sb = 0; $n = 0
  for ($dy = -$r + 1; $dy -lt $r; $dy++) { for ($dx = -$r + 1; $dx -lt $r; $dx++) {
    $xx = [Math]::Min($bmp.Width - 1, [Math]::Max(0, $x + $dx)); $yy = [Math]::Min($bmp.Height - 1, [Math]::Max(0, $y + $dy))
    $c = $bmp.GetPixel($xx, $yy); $sr += $c.R; $sg += $c.G; $sb += $c.B; $n++ } }
  return @([int]($sr / $n), [int]($sg / $n), [int]($sb / $n))
}
for ($i = 0; $i -le $len; $i += $Step) {
  $t = if ($len -eq 0) { 0 } else { $i / $len }
  $x = [int]($X0 + ($X1 - $X0) * $t); $y = [int]($Y0 + ($Y1 - $Y0) * $t)
  $pa = Get-Px $a $x $y $Avg
  $la = [int](0.2126 * $pa[0] + 0.7152 * $pa[1] + 0.0722 * $pa[2])
  $line = '({0,3},{1,4}) A {2,3},{3,3},{4,3} L{5,3}' -f $x, $y, $pa[0], $pa[1], $pa[2], $la
  if ($u) { $pu = Get-Px $u $x $y $Avg; $lu = [int](0.2126 * $pu[0] + 0.7152 * $pu[1] + 0.0722 * $pu[2]); $line += ' | U {0,3},{1,3},{2,3} L{3,3}' -f $pu[0], $pu[1], $pu[2], $lu }
  $line
}
$a.Dispose(); if ($u) { $u.Dispose() }

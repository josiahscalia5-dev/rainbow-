param([string]$In, [double]$Cx, [double]$Cy, [double]$AngDeg, [int]$RMax = 120)
Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile($In)
$a = $AngDeg * [math]::PI / 180
$line = ''
for ($r = 0; $r -le $RMax; $r++) {
  $x = [int][math]::Round($Cx + $r * [math]::Cos($a)); $y = [int][math]::Round($Cy - $r * [math]::Sin($a))
  $p = $b.GetPixel($x, $y)
  # luminance-ish of green channel: crowns are bright yellow/white, grooves dark
  $line += ("{0}:{1} " -f $r, $p.G)
}
$b.Dispose()
$line

# MEASUREMENT AID (read-only, never part of the game): a zoomed crop of an image with a pixel grid and optional test shapes drawn on top,
# so projected outlines can be compared with the approved image.
#   -Shapes "c:cx,cy,r;c:cx,cy,r;e:cx,cy,rx,ry;p:x,y,x,y,..."   circles / ellipses / polylines in 864x1536 image pixels (yellow, then cyan ...)
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\diag\gridshapes.ps1 -Img <png> -X 0 -Y 0 -W 432 -H 400 -Zoom 2 -Out <jpg> [-Step 50] [-Shapes "..."]
param([string]$Img = 'C:\RainbowUnity\references\05_flow_into_the_current.png', [int]$X = 0, [int]$Y = 0, [int]$W = 432, [int]$H = 400,
  [double]$Zoom = 2.0, [string]$Out, [int]$Step = 50, [string]$Shapes = '', [switch]$NoGrid)
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile($Img)
$ow = [int]($W * $Zoom); $oh = [int]($H * $Zoom)
$bmp = New-Object System.Drawing.Bitmap ($ow + 34), ($oh + 18)
$g = [System.Drawing.Graphics]::FromImage($bmp); $g.Clear([System.Drawing.Color]::Black)
$g.InterpolationMode = 'HighQualityBicubic'; $g.SmoothingMode = 'AntiAlias'
$g.DrawImage($src, (New-Object System.Drawing.Rectangle 34, 18, $ow, $oh), (New-Object System.Drawing.Rectangle $X, $Y, $W, $H), 'Pixel')
$f = New-Object System.Drawing.Font 'Segoe UI', 8
$pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(110, 255, 255, 255)), 1
for ($gx = [int][Math]::Ceiling($X / $Step) * $Step; $gx -le $X + $W; $gx += $Step) {
  $px = 34 + ($gx - $X) * $Zoom
  if (-not $NoGrid) { $g.DrawLine($pen, [single]$px, 18, [single]$px, $oh + 18) }
  $g.DrawString("$gx", $f, [System.Drawing.Brushes]::White, [single]($px - 12), 2)
}
for ($gy = [int][Math]::Ceiling($Y / $Step) * $Step; $gy -le $Y + $H; $gy += $Step) {
  $py = 18 + ($gy - $Y) * $Zoom
  if (-not $NoGrid) { $g.DrawLine($pen, 34, [single]$py, $ow + 34, [single]$py) }
  $g.DrawString("$gy", $f, [System.Drawing.Brushes]::White, 1, [single]($py - 8))
}
$cols = @([System.Drawing.Color]::Yellow, [System.Drawing.Color]::Cyan, [System.Drawing.Color]::Lime, [System.Drawing.Color]::White, [System.Drawing.Color]::Red)
$k = 0
foreach ($s in ($Shapes -split ';' | Where-Object { $_ })) {
  $t, $v = $s.Split(':'); $n = @($v.Split(',') | ForEach-Object { [double]::Parse($_, [System.Globalization.CultureInfo]::InvariantCulture) })
  $p2 = New-Object System.Drawing.Pen $cols[$k % $cols.Count], 1.6; $k++
  if ($t -eq 'c') { $n = @($n[0], $n[1], $n[2], $n[2]); $t = 'e' }
  if ($t -eq 'e') { $g.DrawEllipse($p2, [single](34 + ($n[0] - $n[2] - $X) * $Zoom), [single](18 + ($n[1] - $n[3] - $Y) * $Zoom), [single](2 * $n[2] * $Zoom), [single](2 * $n[3] * $Zoom)) }
  if ($t -eq 'p') { for ($i = 0; $i + 3 -lt $n.Count; $i += 2) { $g.DrawLine($p2, [single](34 + ($n[$i] - $X) * $Zoom), [single](18 + ($n[$i + 1] - $Y) * $Zoom), [single](34 + ($n[$i + 2] - $X) * $Zoom), [single](18 + ($n[$i + 3] - $Y) * $Zoom)) } }
}
$g.Dispose(); $src.Dispose()
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 88L
$bmp.Save($Out, $enc, $ep); $bmp.Dispose(); $Out

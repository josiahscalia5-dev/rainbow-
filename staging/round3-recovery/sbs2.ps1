param([string]$A, [string]$B, [string]$Out, [int]$Y0 = 0, [int]$Y1 = 1536, [double]$Scale = 0.5, [int[]]$Lines = @())
Add-Type -AssemblyName System.Drawing
$ia = [System.Drawing.Image]::FromFile($A)
$ib = [System.Drawing.Image]::FromFile($B)
$h = $Y1 - $Y0
$w = $ia.Width
$ow = [int](2 * $w * $Scale + 10)
$oh = [int]($h * $Scale)
$bmp = New-Object System.Drawing.Bitmap $ow, $oh
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.Color]::Black)
$src = New-Object System.Drawing.Rectangle 0, $Y0, $w, $h
$d1 = New-Object System.Drawing.Rectangle 0, 0, ([int]($w * $Scale)), $oh
$d2 = New-Object System.Drawing.Rectangle ([int]($w * $Scale + 10)), 0, ([int]($w * $Scale)), $oh
$g.DrawImage($ia, $d1, $src, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawImage($ib, $d2, $src, [System.Drawing.GraphicsUnit]::Pixel)
$pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(160, 255, 255, 0)), 1
$font = New-Object System.Drawing.Font "Arial", 9
foreach ($ly in $Lines) {
  $yy = [int](($ly - $Y0) * $Scale)
  $g.DrawLine($pen, 0, $yy, $ow, $yy)
  $g.DrawString("$ly", $font, [System.Drawing.Brushes]::Yellow, 2, $yy - 12)
}
$g.Dispose()
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp.Dispose(); $ia.Dispose(); $ib.Dispose()
"saved $Out"

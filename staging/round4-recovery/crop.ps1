param([string]$Src, [int]$X, [int]$Y, [int]$W, [int]$H, [double]$Zoom = 2, [string]$Out, [int]$Grid = 0)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile($Src)
$ow = [int]($W * $Zoom); $oh = [int]($H * $Zoom)
$bmp = New-Object System.Drawing.Bitmap $ow, $oh
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($img, (New-Object System.Drawing.Rectangle 0, 0, $ow, $oh), (New-Object System.Drawing.Rectangle $X, $Y, $W, $H), [System.Drawing.GraphicsUnit]::Pixel)
if ($Grid -gt 0) {
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(160, 255, 255, 0)), 1
  $font = New-Object System.Drawing.Font 'Arial', 9
  $br = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::Yellow)
  $sx = [int]([math]::Ceiling($X / $Grid) * $Grid)
  for ($gx = $sx; $gx -lt $X + $W; $gx += $Grid) { $px = [int](($gx - $X) * $Zoom); $g.DrawLine($pen, $px, 0, $px, $oh); $g.DrawString("$gx", $font, $br, $px + 1, 1) }
  $sy = [int]([math]::Ceiling($Y / $Grid) * $Grid)
  for ($gy = $sy; $gy -lt $Y + $H; $gy += $Grid) { $py = [int](($gy - $Y) * $Zoom); $g.DrawLine($pen, 0, $py, $ow, $py); $g.DrawString("$gy", $font, $br, 1, $py + 1) }
}
$g.Dispose()
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$bmp.Dispose(); $img.Dispose()
"Saved $Out"

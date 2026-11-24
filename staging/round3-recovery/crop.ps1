param([string]$In, [string]$Out, [int]$X, [int]$Y, [int]$W, [int]$H, [double]$Zoom = 2.0, [int]$Grid = 0)
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile($In)
$ow = [int]($W * $Zoom); $oh = [int]($H * $Zoom)
$dst = New-Object System.Drawing.Bitmap $ow, $oh
$g = [System.Drawing.Graphics]::FromImage($dst)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, $ow, $oh), (New-Object System.Drawing.Rectangle $X, $Y, $W, $H), [System.Drawing.GraphicsUnit]::Pixel)
if ($Grid -gt 0) {
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(160, 0, 255, 0)), 1
  $font = New-Object System.Drawing.Font 'Arial', 9
  $br = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::Lime)
  $gx0 = [math]::Ceiling($X / $Grid) * $Grid
  for ($gx = $gx0; $gx -lt $X + $W; $gx += $Grid) { $px = ($gx - $X) * $Zoom; $g.DrawLine($pen, $px, 0, $px, $oh); $g.DrawString("$gx", $font, $br, $px + 1, 1) }
  $gy0 = [math]::Ceiling($Y / $Grid) * $Grid
  for ($gy = $gy0; $gy -lt $Y + $H; $gy += $Grid) { $py = ($gy - $Y) * $Zoom; $g.DrawLine($pen, 0, $py, $ow, $py); $g.DrawString("$gy", $font, $br, 1, $py + 1) }
}
$g.Dispose(); $src.Dispose()
$dst.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png); $dst.Dispose()

# Crops the same region from the approved image and a Unity capture and shows them side by side, enlarged.
# Usage: powershell -File make-crop-compare.ps1 -Unity <png> -X 0 -Y 180 -W 300 -H 320 -Out <jpg|png> [-Zoom 2]
param(
  [string]$Approved = 'C:\RainbowUnity\references\05_flow_into_the_current.png',
  [Parameter(Mandatory = $true)][string]$Unity,
  [int]$X, [int]$Y, [int]$W, [int]$H,
  [Parameter(Mandatory = $true)][string]$Out,
  [double]$Zoom = 2
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$a = [System.Drawing.Image]::FromFile((Resolve-Path $Approved).Path)
$u = [System.Drawing.Image]::FromFile((Resolve-Path $Unity).Path)
$zw = [int]($W * $Zoom); $zh = [int]($H * $Zoom); $gap = 10; $band = 36
$bmp = New-Object System.Drawing.Bitmap ($zw * 2 + $gap), ($zh + $band)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.Color]::FromArgb(24, 18, 36))
$src = New-Object System.Drawing.Rectangle $X, $Y, $W, $H
$g.DrawImage($a, (New-Object System.Drawing.Rectangle 0, $band, $zw, $zh), $src, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawImage($u, (New-Object System.Drawing.Rectangle ($zw + $gap), $band, $zw, $zh), $src, [System.Drawing.GraphicsUnit]::Pixel)
$font = New-Object System.Drawing.Font 'Segoe UI', 14, ([System.Drawing.FontStyle]::Bold)
$g.DrawString("APPROVED  x$X y$Y ${W}x$H", $font, [System.Drawing.Brushes]::White, 6, 6)
$g.DrawString('UNITY', $font, [System.Drawing.Brushes]::White, ($zw + $gap + 6), 6)
$g.Dispose(); $a.Dispose(); $u.Dispose()
if ($Out -match '\.jpe?g$') {
  $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 90L
  $bmp.Save($Out, $enc, $ep)
} else { $bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png) }
$bmp.Dispose()
"Saved $Out"

# Builds an "APPROVED vs UNITY" comparison image for the user (visual evidence, no percentage claims).
# Usage: powershell -File make-side-by-side.ps1 -Approved <png> -Unity <png> -Out <png> [-Label "s = 14 (approved view)"]
param(
  [Parameter(Mandatory = $true)][string]$Approved,
  [Parameter(Mandatory = $true)][string]$Unity,
  [Parameter(Mandatory = $true)][string]$Out,
  [string]$Label = ''
)
Add-Type -AssemblyName System.Drawing
$W = 864; $H = 1536; $gap = 16; $band = 64
$a = [System.Drawing.Image]::FromFile((Resolve-Path $Approved))
$u = [System.Drawing.Image]::FromFile((Resolve-Path $Unity))
$bmp = New-Object System.Drawing.Bitmap ($W * 2 + $gap), ($H + $band)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.Color]::FromArgb(24, 18, 36))
$g.DrawImage($a, 0, $band, $W, $H)
$g.DrawImage($u, $W + $gap, $band, $W, $H)
$font = New-Object System.Drawing.Font 'Segoe UI', 22, ([System.Drawing.FontStyle]::Bold)
$white = [System.Drawing.Brushes]::White
$g.DrawString('APPROVED  05_flow_into_the_current.png', $font, $white, 12, 14)
$g.DrawString(('UNITY GAME VIEW  ' + $Label), $font, $white, $W + $gap + 12, 14)
$g.Dispose(); $a.Dispose(); $u.Dispose()
$dir = Split-Path -Parent $Out
if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
if ($Out -match '\.jpe?g$') {
  $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 90L
  $bmp.Save($Out, $enc, $ep)
} else { $bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png) }
$bmp.Dispose()
"Saved $Out"

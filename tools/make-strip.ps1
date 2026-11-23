# Puts several screenshots side by side with a label above each (e.g. before / at / after the approved camera position).
# Usage: powershell -File make-strip.ps1 -Images a.png,b.png,c.png -Labels 'A','B','C' -Out strip.png [-Scale 0.5]
param(
  [Parameter(Mandatory = $true)][string[]]$Images,
  [Parameter(Mandatory = $true)][string[]]$Labels,
  [Parameter(Mandatory = $true)][string]$Out,
  [double]$Scale = 0.5
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
# "powershell -File" passes a comma list as ONE string: split it here.
$Images = @($Images | ForEach-Object { $_ -split ',' } | Where-Object { $_ })
$Labels = @($Labels | ForEach-Object { $_ -split ',' } | Where-Object { $_ })
$imgs = @($Images | ForEach-Object { [System.Drawing.Image]::FromFile((Resolve-Path $_).Path) })
$w = [int]($imgs[0].Width * $Scale); $h = [int]($imgs[0].Height * $Scale); $gap = 12; $band = 48
$bmp = New-Object System.Drawing.Bitmap (($w + $gap) * $imgs.Count - $gap), ($h + $band)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.Clear([System.Drawing.Color]::FromArgb(24, 18, 36))
$font = New-Object System.Drawing.Font 'Segoe UI', 16, ([System.Drawing.FontStyle]::Bold)
for ($i = 0; $i -lt $imgs.Count; $i++) {
  $x = $i * ($w + $gap)
  $g.DrawImage($imgs[$i], $x, $band, $w, $h)
  $label = ''; if ($i -lt $Labels.Count) { $label = $Labels[$i] }
  $g.DrawString($label, $font, [System.Drawing.Brushes]::White, ($x + 8), 10)
}
$g.Dispose(); $imgs | ForEach-Object { $_.Dispose() }
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

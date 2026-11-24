param([string]$Unity, [int]$X, [int]$Y, [int]$W, [int]$H, [string]$Out, [double]$Scale = 1.0, [string]$Approved = 'C:\RainbowUnity\references\05_flow_into_the_current.png')
# Read-only diagnostic: the same pixel box from the approved image (left) and a Unity still (right), side by side.
Add-Type -AssemblyName System.Drawing
$a = [System.Drawing.Image]::FromFile($Approved); $u = [System.Drawing.Image]::FromFile($Unity)
$ow = [int]($W * $Scale); $oh = [int]($H * $Scale)
$bmp = New-Object System.Drawing.Bitmap ((2 * $ow + 6), $oh)
$g = [System.Drawing.Graphics]::FromImage($bmp); $g.Clear([System.Drawing.Color]::Black)
$g.InterpolationMode = 'HighQualityBicubic'
$src = New-Object System.Drawing.Rectangle $X, $Y, $W, $H
$g.DrawImage($a, (New-Object System.Drawing.Rectangle 0, 0, $ow, $oh), $src, 'Pixel')
$g.DrawImage($u, (New-Object System.Drawing.Rectangle ($ow + 6), 0, $ow, $oh), $src, 'Pixel')
$g.Dispose(); $a.Dispose(); $u.Dispose()
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters 1
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 88L
$bmp.Save($Out, $enc, $ep); $bmp.Dispose(); $Out

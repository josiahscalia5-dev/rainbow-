param([string]$Src,[int]$X,[int]$Y,[int]$W,[int]$H,[double]$Zoom,[string]$Out,[int]$Grid=0)
Add-Type -AssemblyName System.Drawing
$a = [System.Drawing.Image]::FromFile($Src)
$zw=[int]($W*$Zoom); $zh=[int]($H*$Zoom)
$bmp = New-Object System.Drawing.Bitmap $zw, $zh
$g=[System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode=[System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($a,(New-Object System.Drawing.Rectangle 0,0,$zw,$zh),(New-Object System.Drawing.Rectangle $X,$Y,$W,$H),[System.Drawing.GraphicsUnit]::Pixel)
if ($Grid -gt 0) {
  $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(160,0,255,0)), 1
  $font = New-Object System.Drawing.Font 'Consolas', 9
  for ($gx = [math]::Ceiling($X/$Grid)*$Grid; $gx -lt $X+$W; $gx += $Grid) { $px=[int](($gx-$X)*$Zoom); $g.DrawLine($pen,$px,0,$px,$zh); $g.DrawString("$gx",$font,[System.Drawing.Brushes]::Lime,$px+1,1) }
  for ($gy = [math]::Ceiling($Y/$Grid)*$Grid; $gy -lt $Y+$H; $gy += $Grid) { $py=[int](($gy-$Y)*$Zoom); $g.DrawLine($pen,0,$py,$zw,$py); $g.DrawString("$gy",$font,[System.Drawing.Brushes]::Lime,1,$py+1) }
}
$g.Dispose(); $a.Dispose()
$bmp.Save($Out,[System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
"Saved $Out"

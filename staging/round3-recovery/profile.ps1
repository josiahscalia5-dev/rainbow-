param([string]$Src,[string]$Mode,[int]$A0,[int]$A1,[int]$B0,[int]$B1,[int]$Thr=70)
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap $Src
$out = New-Object System.Text.StringBuilder
if ($Mode -eq 'rows') {
  # for y in A0..A1: dark fraction over x in B0..B1
  for ($y=$A0; $y -le $A1; $y++) {
    $dark=0; $n=0; $sum=0
    for ($x=$B0; $x -le $B1; $x++) { $c=$bmp.GetPixel($x,$y); $l=0.3*$c.R+0.59*$c.G+0.11*$c.B; $sum+=$l; $n++; if ($l -lt $Thr) {$dark++} }
    [void]$out.AppendLine(("{0} dark={1:0.00} mean={2:0}" -f $y, ($dark/$n), ($sum/$n)))
  }
} else {
  for ($x=$A0; $x -le $A1; $x++) {
    $dark=0; $n=0; $sum=0
    for ($y=$B0; $y -le $B1; $y++) { $c=$bmp.GetPixel($x,$y); $l=0.3*$c.R+0.59*$c.G+0.11*$c.B; $sum+=$l; $n++; if ($l -lt $Thr) {$dark++} }
    [void]$out.AppendLine(("{0} dark={1:0.00} mean={2:0}" -f $x, ($dark/$n), ($sum/$n)))
  }
}
$bmp.Dispose()
$out.ToString()

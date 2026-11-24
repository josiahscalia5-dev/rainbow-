param([string]$Src,[int]$Cx,[int]$Ya,[int]$Yb,[int]$Hw=3)
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap $Src
for ($yy=$Ya;$yy -le $Yb;$yy++) { $r=0;$g=0;$b=0;$n=0
  for ($xx=$Cx-$Hw;$xx -le $Cx+$Hw;$xx++) { $c=$bmp.GetPixel($xx,$yy); $r+=$c.R;$g+=$c.G;$b+=$c.B;$n++ }
  "{0}: ({1:0},{2:0},{3:0})" -f $yy,($r/$n),($g/$n),($b/$n) }
$bmp.Dispose()

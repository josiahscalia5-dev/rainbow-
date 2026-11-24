param([string]$Src,[int]$Cy,[int]$Xa,[int]$Xb,[int]$Hw=2)
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap $Src
for ($xx=$Xa;$xx -le $Xb;$xx++) { $r=0;$g=0;$b=0;$n=0
  for ($yy=$Cy-$Hw;$yy -le $Cy+$Hw;$yy++) { $c=$bmp.GetPixel($xx,$yy); $r+=$c.R;$g+=$c.G;$b+=$c.B;$n++ }
  "{0}: ({1:0},{2:0},{3:0})" -f $xx,($r/$n),($g/$n),($b/$n) }
$bmp.Dispose()

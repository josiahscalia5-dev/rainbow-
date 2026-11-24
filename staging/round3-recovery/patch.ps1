param([string]$Src,[string]$Boxes)
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap $Src
foreach ($b in $Boxes.Split(';')) {
  $p = $b.Split(',') | ForEach-Object { [int]$_ }
  $x0=$p[0];$y0=$p[1];$x1=$p[2];$y1=$p[3]
  $r=0;$g=0;$bb=0;$n=0; $rl=0;$gl=0;$bl=0;$nl=0; $dark=0
  $lums = New-Object System.Collections.Generic.List[double]
  for ($y=$y0;$y -le $y1;$y+=1) { for ($x=$x0;$x -le $x1;$x+=1) {
    $c=$bmp.GetPixel($x,$y); $l=0.3*$c.R+0.59*$c.G+0.11*$c.B
    $r+=$c.R;$g+=$c.G;$bb+=$c.B;$n++; $lums.Add($l)
    if ($l -ge 80) { $rl+=$c.R;$gl+=$c.G;$bl+=$c.B;$nl++ } else { $dark++ }
  } }
  $lums.Sort(); $p90=$lums[[int]($lums.Count*0.9)]; $p50=$lums[[int]($lums.Count*0.5)]
  "{0}: mean=({1:0},{2:0},{3:0}) metal(L>=80)=({4:0},{5:0},{6:0}) dark%={7:0} p50={8:0} p90={9:0}" -f $b,($r/$n),($g/$n),($bb/$n),($rl/[math]::Max(1,$nl)),($gl/[math]::Max(1,$nl)),($bl/[math]::Max(1,$nl)),(100*$dark/$n),$p50,$p90
}
$bmp.Dispose()

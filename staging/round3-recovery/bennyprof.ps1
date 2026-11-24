param([string]$In, [int]$X)
Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile($In)
$out = ''
for ($y = 700; $y -le 1300; $y += 4) {
  $r=0;$g=0;$bl=0
  for ($dx=-3;$dx -le 3;$dx++){ $p=$b.GetPixel($X+$dx,$y); $r+=$p.R;$g+=$p.G;$bl+=$p.B }
  $r/=7;$g/=7;$bl/=7
  if ($r -gt 180 -and $g -lt 150 -and $bl -gt 140 -and $r -gt $bl) { $c='p' }      # pink body
  elseif ($bl -gt 150 -and $r -gt 100 -and $g -lt 110 -and $bl -gt $r) { $c='V' } # violet hat/pompom
  elseif ($r -gt 200 -and $g -gt 200 -and $bl -gt 200) { $c='W' }                  # white stripe / foam
  elseif ($bl -gt 150 -and $g -gt 130 -and $r -lt 150) { $c='c' }                  # cyan water
  else { $c='.' }
  $out += $c
}
$b.Dispose(); $out

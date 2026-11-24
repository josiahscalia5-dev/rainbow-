param([string]$In, [string]$RowList, [int]$Step = 6)
$Rows = $RowList.Split(",") | ForEach-Object { [int]$_ }
Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile($In)
foreach ($y in $Rows) {
  $s = ''
  for ($x = 0; $x -lt $b.Width; $x += $Step) {
    $r = 0; $g = 0; $bl = 0; $c = 0
    for ($dx = 0; $dx -lt $Step; $dx++) { for ($dy = -1; $dy -le 1; $dy++) { $p = $b.GetPixel([math]::Min($b.Width-1,$x + $dx), $y + $dy); $r += $p.R; $g += $p.G; $bl += $p.B; $c++ } }
    $r /= $c; $g /= $c; $bl /= $c
    $mx = [math]::Max($r, [math]::Max($g, $bl)); $mn = [math]::Min($r, [math]::Min($g, $bl))
    if ($mn -gt 185 -and ($mx - $mn) -lt 70) { $ch = 'F' }            # foam / white
    elseif ($r -gt 150 -and $bl -lt 0.75 * $r -and $g -lt 0.85 * $r) { $ch = 'G' }   # gold / orange
    elseif ($bl -gt 150 -and $g -gt 120 -and $r -lt 0.8 * $bl) { $ch = 'C' }  # cyan water
    elseif ($r -gt 170 -and $g -lt 110 -and $bl -gt 110 -and $r -gt $bl) { $ch = 'P' }  # hot pink current
    elseif ($bl -ge 0.8 * $r -and $g -lt 0.6 * $bl) { $ch = 'w' }   # purple wall
    else { $ch = '.' }
    $s += $ch
  }
  "{0,4} {1}" -f $y, $s
}
$b.Dispose()


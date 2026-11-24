# Mean colours of small patches: approved vs a Unity still. -Unity still.png [-P "x,y;x,y"] [-R 10]
param([string]$Unity, [string]$P = '100,1080;760,1110;420,1330;300,900;640,720;130,860;700,960;420,1250;200,1000;560,1330', [int]$R = 9)
Add-Type -AssemblyName System.Drawing
$a = New-Object System.Drawing.Bitmap 'C:\RainbowUnity\references\05_flow_into_the_current.png'
$u = New-Object System.Drawing.Bitmap $Unity
function Get-PatchMean($b, $cx, $cy, $r) { $s = @(0,0,0); $n = 0; for ($y = $cy - $r; $y -le $cy + $r; $y += 2) { for ($x = $cx - $r; $x -le $cx + $r; $x += 2) { if ($x -ge 0 -and $x -lt 864 -and $y -ge 0 -and $y -lt 1536) { $c = $b.GetPixel($x, $y); $s[0] += $c.R; $s[1] += $c.G; $s[2] += $c.B; $n++ } } }; '{0,3},{1,3},{2,3}' -f [int]($s[0]/$n), [int]($s[1]/$n), [int]($s[2]/$n) }
foreach ($q in $P -split ';') { $xy = $q -split ','; '{0,-10} approved {1}   unity {2}' -f $q, (Get-PatchMean $a ([int]$xy[0]) ([int]$xy[1]) $R), (Get-PatchMean $u ([int]$xy[0]) ([int]$xy[1]) $R) }
$a.Dispose(); $u.Dispose()

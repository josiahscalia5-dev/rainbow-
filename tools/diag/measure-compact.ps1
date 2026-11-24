param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Stills)
# Runs the official measure tool on several stills and prints one compact line per still (visual per area, then
# OVERALL visual/layout). Read-only.
$json = Join-Path $env:TEMP ("rb05_measure_" + [guid]::NewGuid().ToString('N') + ".json")
$null = powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\screen05-measure.ps1 -Json $json @Stills
$d = Get-Content $json -Raw | ConvertFrom-Json
$d = @($d | ForEach-Object { $_ })
Remove-Item $json -ErrorAction SilentlyContinue
$areas = 'hud','walls','throat','water_mid','water_near','foam_left','foam_right','bubbles_left','bubbles_right','splash','benny'
'{0,-24} {1,5} {2,5} |{3}' -f 'still', 'VIS', 'LAY', (($areas | ForEach-Object { '{0,7}' -f ($_ -replace 'bubbles_', 'bub_' -replace 'water_', 'w_' -replace 'foam_', 'f_') }) -join '')
foreach ($s in $d) {
  $name = [System.IO.Path]::GetFileNameWithoutExtension($s.still) -replace '^coord_var_', '' -replace '^\d{8}_\d{6}_', ''
  $lk = @{}; foreach ($r in @($s.areas)) { $lk[$r.area] = $r }
  $row = foreach ($k in $areas) { if ($lk[$k]) { '{0,7:0.0}' -f [double]$lk[$k].visual } else { '      -' } }
  '{0,-24} {1,5:0.0} {2,5:0.0} |{3}' -f $name, [double]$lk['OVERALL'].visual, [double]$lk['OVERALL'].layout, ($row -join '')
}

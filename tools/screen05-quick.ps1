# Short output wrapper of screen05-cycle.ps1 (coordinator helper, 2026-11-24): runs the cycle and prints only the still path, the score table
# and real errors. -Crop "x,y,w,h,scale" also writes an approved | Unity crop pair next to the still.
# powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\screen05-quick.ps1 -Tag x [-NoRebuild] [-EvalAtHold f] [-Refresh] [-Crop "0,700,864,500,1"]
param([string]$Tag = 'q', [switch]$NoRebuild, [switch]$Refresh, [string]$EvalAtHold = '', [string[]]$Crop = @())
$cycleArgs = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'C:\RainbowUnity\tools\screen05-cycle.ps1', '-Tag', $Tag, '-Areas', 'none')
if ($NoRebuild) { $cycleArgs += '-NoRebuild' }
if ($Refresh) { $cycleArgs += @('-EvalBeforePlay', 'AgentScripts/screen05_refresh.cs') }
if ($EvalAtHold) { $cycleArgs += @('-EvalAtHold', $EvalAtHold) }
$text = & powershell @cycleArgs | Out-String
$lines = $text -split "`r?`n"
$still = ''
foreach ($l in $lines) {
  if ($l -match '^STILL\s+(\S+)') { $still = $Matches[1]; 'STILL ' + $still }
  elseif ($l -match '^(OVERALL|hud|walls|throat|water_mid|water_near|foam_left|foam_right|bubbles_left|bubbles_right|splash|benny)\s') { $l }
  elseif ($l -match 'COMPILE ERRORS|BUILD FAILED|EVAL FAILED|CAPTURE FAILED|did not|NOT READY|BUSY|MISSING|FAILED|error CS|Shader error|"level":"error"') { if ($l.Length -gt 400) { $l.Substring(0, 400) } else { $l } }
  elseif ($l -match 'COMPILE|errors? CS|^\s+(Assets|at )') { if ($l.Length -gt 300) { $l.Substring(0, 300) } else { $l } }
}
$m = [regex]::Match($text, 'counts: (\{[^\r\n]+\})'); if ($m.Success) { 'console ' + $m.Groups[1].Value }
if ($still -and $Crop.Count -gt 0) {
  $i = 0
  foreach ($c in $Crop) {
    $p = $c -split ','
    $out = $still -replace '\.png$', ("_c$i.jpg")
    & powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\diag\cropstack.ps1 -Unity $still -X ([int]$p[0]) -Y ([int]$p[1]) -W ([int]$p[2]) -H ([int]$p[3]) -Out $out -Scale ([double]$p[4])
    $i++
  }
}

# Calibrates the broad water sheen: still -> correction -> still ... (coordinator helper, 2026-11-24). Needs the scene built.
# powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\screen05-sheenloop.ps1 -Steps 2 -Tag sheen [-Crop "..."]
param([int]$Steps = 2, [string]$Tag = 'sheen', [string[]]$Crop = @())
$work = 'C:\RainbowUnity\UnityProject\Recordings\Screen05\work'
for ($i = 0; $i -le $Steps; $i++) {
  $o = & powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\screen05-quick.ps1 -Tag ($Tag + $i) -NoRebuild -Refresh | Out-String
  $m = [regex]::Match($o, 'STILL (\S+\.png)')
  if (-not $m.Success) { $o; break }
  $sc = [regex]::Match($o, 'OVERALL[^\r\n]+').Value
  "step $i  $sc"
  if ($i -lt $Steps) {
    Set-Content -Path (Join-Path $work 'water_measure_params.txt') -Value $m.Groups[1].Value -Encoding ascii
    & powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\screen05-eval.ps1 -File AgentScripts/screen05_sheen_calibrate.cs -Timeout 200
  } else { $o }
}
if ($m.Success -and $Crop.Count -gt 0) {
  $k = 0
  foreach ($c in $Crop) { $p = $c -split ','; & powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\diag\cropstack.ps1 -Unity $m.Groups[1].Value -X ([int]$p[0]) -Y ([int]$p[1]) -W ([int]$p[2]) -H ([int]$p[3]) -Out (Join-Path $work ($Tag + "_c$k.jpg")) -Scale ([double]$p[4]); $k++ }
}

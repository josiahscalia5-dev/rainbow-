# Rainbow Unity - coordinator step: copy specialists' finished staging files into the Unity project.
# Copies staging\<agent>\Assets\... into UnityProject\Assets\... (adds new files, updates changed ones).
# Never deletes anything in the project (robocopy without /PURGE or /MIR). Skips README/notes and _check folders.
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\integrate-staging.ps1 [-Agents agent2-environment,...]
param([string[]]$Agents = @('agent2-environment', 'agent3-water-vfx', 'agent4-benny-gameplay'))
$src = 'C:\RainbowUnity\staging'
$dst = 'C:\RainbowUnity\UnityProject\Assets'
foreach ($a in $Agents) {
  $assets = Join-Path $src "$a\Assets"
  if (-not (Test-Path -LiteralPath $assets)) { Write-Output "skip $a (no Assets folder)"; continue }
  $null = & robocopy $assets $dst /E /NJH /NJS /NDL /NP /XF README.md *.tmp *.bak /XD _check
  $code = $LASTEXITCODE
  $n = @(Get-ChildItem -LiteralPath $assets -Recurse -File).Count
  if ($code -lt 8) { Write-Output "copied $a ($n files, robocopy exit $code = ok)" } else { Write-Output "ERROR copying $a (robocopy exit $code)" }
}

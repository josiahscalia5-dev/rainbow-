<#
  measure-targets.ps1  -  read-only Screen 05 composition measurer (target sheet for the round-3 fit tool)
  Windows PowerShell 5.1. Reads one 864x1536 PNG/JPG and writes a JSON of composition targets (+ optional overlay JPG).
    powershell -NoProfile -ExecutionPolicy Bypass -File measure-targets.ps1                       (approved image -> targets05.json)
    powershell -NoProfile -ExecutionPolicy Bypass -File measure-targets.ps1 -Image <unity.png> -Out <x.json> [-Overlay <x.jpg>]
  Never writes anywhere except -Out / -Overlay / -CheckDir. Hand-measured ("manual") fields are only emitted for the approved
  image (SHA-256 match); on any other image they are null with method "manual_not_available".
#>
param(
  [string]$Image = "C:\RainbowUnity\references\05_flow_into_the_current.png",
  [string]$Out = "",
  [string]$Overlay = "",
  [string]$CheckDir = ""
)
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($Out -eq "") { $Out = Join-Path $here "targets05.json" }
$sw = [System.Diagnostics.Stopwatch]::StartNew()
Add-Type -AssemblyName System.Drawing
$sha = (Get-FileHash -LiteralPath $Image -Algorithm SHA256).Hash.ToLower()
$cs = Get-Content -LiteralPath (Join-Path $here "Targets05.cs") -Raw
if (-not ([System.Management.Automation.PSTypeName]'T05').Type) {
  Add-Type -TypeDefinition $cs -ReferencedAssemblies System.Drawing, System.Core
}
$approvedSha = "d3f339d49199598e03541c15a3ec6f7fa6342f40de650361c44ab4301bfb44dd"
$json = [T05]::Run($Image, $sha, ($sha -eq $approvedSha), $Overlay, $CheckDir)
[System.IO.File]::WriteAllText($Out, $json, (New-Object System.Text.UTF8Encoding($false)))
$sw.Stop()
"wrote {0}  ({1:0.0} s, {2} bytes)" -f $Out, $sw.Elapsed.TotalSeconds, (Get-Item $Out).Length

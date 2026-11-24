# Run one C# AgentScript in the open Unity Editor. -Play enters Play mode first when needed, -Stop leaves it first (coordinator helper, 2026-11-24).
# powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\screen05-eval.ps1 -File AgentScripts/x.cs [-Play] [-Stop] [-Timeout 300]
param([string]$File = '', [switch]$Play, [switch]$Stop, [int]$Timeout = 300)
$env:UNITY_NO_BANNER = '1'; $env:UNITY_NO_CONSENT_PROMPT = '1'; $env:DO_NOT_TRACK = '1'
$U = 'C:\Users\josia\AppData\Local\Unity\bin\unity.exe'; $Proj = 'C:\RainbowUnity\UnityProject'
function Ev([string]$f, [int]$t) {
  Push-Location $Proj
  try { (& $U command script eval --project-path $Proj --timeout ($t + 30) -- --file $f --timeout $t | Out-String).Trim() } finally { Pop-Location }
}
function St { Ev 'AgentScripts/screen05_status.cs' 60 }
[void](& $U command editor set_auto_tick --enabled true --project-path $Proj | Out-String)
if ($Stop -and ((St) -match 'playing=True')) { [void](& $U command editor.playmode stop --project-path $Proj | Out-String); Start-Sleep -Seconds 3 }
if ($Play) {
  if ((St) -notmatch 'playing=True') { [void](& $U command editor.playmode start --project-path $Proj | Out-String) }
  for ($i = 0; $i -lt 40; $i++) { $s = St; if ($s -match 'playing=True' -and $s -match 'BennyController ok') { break }; Start-Sleep -Seconds 3 }
}
if ($File) { Ev $File $Timeout }

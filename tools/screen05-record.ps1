# Continuous unedited Game View recording of the whole Screen 05 course (40 s, 30 fps, 864x1536, HUD) + wait (coordinator helper, 2026-11-24).
# powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\screen05-record.ps1
$env:UNITY_NO_BANNER = '1'; $env:UNITY_NO_CONSENT_PROMPT = '1'; $env:DO_NOT_TRACK = '1'
$U = 'C:\Users\josia\AppData\Local\Unity\bin\unity.exe'; $Proj = 'C:\RainbowUnity\UnityProject'
& powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\screen05-eval.ps1 -File AgentScripts/screen05_record_course.cs -Play -Timeout 120
Push-Location $Proj
try { (& $U command script eval --project-path $Proj --timeout 1500 -- --file AgentScripts/screen05_wait_capture.cs --timeout 1450 | Out-String).Trim() } finally { Pop-Location }
Get-ChildItem "$Proj\Recordings\Screen05" -Filter 'gameplay_*' | Sort-Object LastWriteTime | Select-Object -Last 4 Name, @{n='MB';e={[math]::Round($_.Length/1MB,1)}}

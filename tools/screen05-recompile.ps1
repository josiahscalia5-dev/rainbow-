# Stop Play mode, recompile and wait until the Editor answers again; prints compile errors (coordinator helper, 2026-11-24).
$env:UNITY_NO_BANNER = '1'; $env:UNITY_NO_CONSENT_PROMPT = '1'; $env:DO_NOT_TRACK = '1'
$U = 'C:\Users\josia\AppData\Local\Unity\bin\unity.exe'; $P = 'C:\RainbowUnity\UnityProject'
[void](& $U command editor set_auto_tick --enabled true --project-path $P | Out-String)
[void](& $U command editor.playmode stop --project-path $P | Out-String)
Start-Sleep -Seconds 3
[void](& $U command script recompile --project-path $P | Out-String)
Start-Sleep -Seconds 8
for ($i = 0; $i -lt 60; $i++) {
  $t = (& $U command script recompile_status --project-path $P --result-only | Out-String).Trim()
  $rc = $null; try { $rc = $t | ConvertFrom-Json } catch { $rc = $null }
  if ($null -ne $rc -and $rc.status -notmatch 'compil|progress|pending|queued|reload') { break }
  Start-Sleep -Seconds 4
}
if ($null -ne $rc -and ($rc.compilationFailed -or $rc.failed)) { 'COMPILE ERRORS:'; $rc.errors | ForEach-Object { ($_ | Out-String).Trim() }; exit 2 }
for ($i = 0; $i -lt 40; $i++) {
  $s = (& $U status --project-path $P | Out-String)
  if ($LASTEXITCODE -eq 0 -and $s -match 'ready') { break }
  Start-Sleep -Seconds 4
}
'compiled: ' + $rc.status

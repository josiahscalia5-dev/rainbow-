param([string]$Journal, [int]$Target, [int]$MaxMinutes = 300)
# READ-ONLY watcher: waits until the round-3 workflow journal holds $Target finished-agent entries ("result" or any other
# non-start event such as an error), then prints a short summary of every finished agent and exits. Never touches Unity,
# the project or the workflow.
function Read-Lines([string]$p) {
  if (-not (Test-Path -LiteralPath $p)) { return @() }
  $fs = New-Object System.IO.FileStream($p, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
  try { $sr = New-Object System.IO.StreamReader($fs); $t = $sr.ReadToEnd() } finally { $fs.Close() }
  return ($t -split "`r?`n") | Where-Object { $_.Trim().Length -gt 0 }
}
$deadline = (Get-Date).AddMinutes($MaxMinutes)
$finished = @()
while ($true) {
  $finished = @()
  foreach ($l in (Read-Lines $Journal)) {
    try { $o = $l | ConvertFrom-Json } catch { continue }
    if ($o.type -ne 'launched' -and $o.type -ne 'started') { $finished += $o }
  }
  if ($finished.Count -ge $Target) { break }
  if ((Get-Date) -gt $deadline) { Write-Output "TIMEOUT after $MaxMinutes min with $($finished.Count) finished entries"; break }
  Start-Sleep -Seconds 30
}
Write-Output ("[{0}] finished entries: {1}" -f (Get-Date -Format 'HH:mm:ss'), $finished.Count)
foreach ($o in $finished) {
  $r = $o.result
  Write-Output "=== $($o.type) agent=$($o.agentId) ==="
  if ($null -eq $r) { Write-Output ($o | ConvertTo-Json -Compress -Depth 3); continue }
  foreach ($k in @('area','status','scores_before','scores_after','final_cycle_exit','final_still','final_sbs','final_overlay','cycle_exit','hold_s','still','sbs','overlay','mp4','recording_summary')) {
    if ($r.PSObject.Properties.Name -contains $k -and "$($r.$k)".Length -gt 0) { Write-Output ("{0}: {1}" -f $k, $r.$k) }
  }
  foreach ($k in @('improved','still_different','problems')) {
    if ($r.PSObject.Properties.Name -contains $k -and $r.$k) { Write-Output "${k}:"; $r.$k | ForEach-Object { Write-Output "  - $_" } }
  }
  if ($r.PSObject.Properties.Name -contains 'notes_for_next_agents') { $n = "$($r.notes_for_next_agents)"; if ($n.Length -gt 1500) { $n = $n.Substring(0, 1500) + ' ...[cut]' }; Write-Output "notes: $n" }
}

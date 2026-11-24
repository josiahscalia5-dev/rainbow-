# Rainbow Unity - apply the routine-development permission rules to Claude Code (RUN BY THE USER, not by Claude).
# Merges rainbow-permissions.json into %USERPROFILE%\.claude\settings.json (user settings: every folder, every account on
# this laptop). Keeps every existing setting and rule, adds only missing ones, makes a dated backup first, writes plain
# UTF-8 JSON and checks that the result still reads correctly. Safe to run again (it never adds duplicates).
# Undo: copy the newest settings.json.backup-<date> back over settings.json.
param([string]$Target = (Join-Path $env:USERPROFILE '.claude\settings.json'))
$ErrorActionPreference = 'Stop'
$rules = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'rainbow-permissions.json') | ConvertFrom-Json

if (Test-Path -LiteralPath $Target) {
  $cur = Get-Content -Raw -LiteralPath $Target | ConvertFrom-Json
  $backup = $Target + '.backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
  Copy-Item -LiteralPath $Target -Destination $backup
} else {
  $cur = New-Object psobject
  $backup = '(no earlier file)'
}
if (-not ($cur.PSObject.Properties.Name -contains 'permissions')) {
  $cur | Add-Member -NotePropertyName permissions -NotePropertyValue (New-Object psobject)
}
$added = 0
foreach ($k in 'additionalDirectories', 'allow', 'ask') {
  $list = New-Object System.Collections.Generic.List[string]
  if ($cur.permissions.PSObject.Properties.Name -contains $k) { foreach ($v in @($cur.permissions.$k)) { if ($v) { $list.Add([string]$v) } } }
  foreach ($v in @($rules.$k)) { if ($v -and -not $list.Contains([string]$v)) { $list.Add([string]$v); $added++ } }
  $arr = [object[]]$list.ToArray()
  if ($cur.permissions.PSObject.Properties.Name -contains $k) { $cur.permissions.$k = $arr }
  else { $cur.permissions | Add-Member -NotePropertyName $k -NotePropertyValue $arr }
}
$json = $cur | ConvertTo-Json -Depth 20
[System.IO.File]::WriteAllText($Target, $json, (New-Object System.Text.UTF8Encoding($false)))
$check = Get-Content -Raw -LiteralPath $Target | ConvertFrom-Json   # throws if the file no longer reads as JSON
Write-Output ('Done. Added {0} new rule(s) to {1}' -f $added, $Target)
Write-Output ('Now: allow {0} | always ask {1} | extra folders {2}' -f @($check.permissions.allow).Count, @($check.permissions.ask).Count, @($check.permissions.additionalDirectories).Count)
Write-Output ('Backup of the old file: {0}' -f $backup)

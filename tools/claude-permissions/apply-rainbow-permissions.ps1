# Rainbow Unity - apply the permission rules to Claude Code (RUN BY THE USER, not by Claude).
# Default = STRICT level ("allow" in rainbow-permissions.json). Add -IncludeTestRunners for the optional level
# ("allowTestRunners": game C# edits + test / measuring tools + Unity script eval run without asking).
# Merges into %USERPROFILE%\.claude\settings.json (every folder, every account on this laptop): keeps every existing setting
# and rule, adds only missing ones, makes a dated backup first, writes plain UTF-8 JSON and checks it still reads correctly.
# Safe to run again (never adds duplicates). It only ADDS rules. Undo: copy the newest settings.json.backup-<date> back.
param([switch]$IncludeTestRunners, [string]$Target = (Join-Path $env:USERPROFILE '.claude\settings.json'))
$ErrorActionPreference = 'Stop'
$rules = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'rainbow-permissions.json') | ConvertFrom-Json
$wanted = @{ additionalDirectories = @($rules.additionalDirectories); allow = @($rules.allow); ask = @($rules.ask) }
if ($IncludeTestRunners) { $wanted.allow += @($rules.allowTestRunners) }

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
  foreach ($v in $wanted[$k]) { if ($v -and -not $list.Contains([string]$v)) { $list.Add([string]$v); $added++ } }
  $arr = [object[]]$list.ToArray()
  if ($cur.permissions.PSObject.Properties.Name -contains $k) { $cur.permissions.$k = $arr }
  else { $cur.permissions | Add-Member -NotePropertyName $k -NotePropertyValue $arr }
}
$json = $cur | ConvertTo-Json -Depth 20
[System.IO.File]::WriteAllText($Target, $json, (New-Object System.Text.UTF8Encoding($false)))
$check = Get-Content -Raw -LiteralPath $Target | ConvertFrom-Json   # stops with an error if the file no longer reads as JSON
$level = if ($IncludeTestRunners) { 'strict + test runners' } else { 'strict' }
Write-Output ('Done ({0}). Added {1} new rule(s) to {2}' -f $level, $added, $Target)
Write-Output ('Now: allow {0} | always ask {1} | extra folders {2}' -f @($check.permissions.allow).Count, @($check.permissions.ask).Count, @($check.permissions.additionalDirectories).Count)
Write-Output ('Backup of the old file: {0}' -f $backup)

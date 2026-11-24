# Rainbow Unity autosave - ONE checkpoint pass: commit + push the changes on branch unity/screen05-dev of C:\RainbowUnity.
# The Windows Task Scheduler task "Rainbow Unity Autosave" runs this every 5 minutes (hidden). It is created/repaired by
# tools\setup-resume-system.ps1. It works the same with every Claude account and needs no Claude session or credits.
# Run it by hand to "save now":  powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\autosave.ps1
#
# Safe by design: it never deletes or overwrites project files, never resets, never merges, never force-pushes and only
# saves the branch unity/screen05-dev. .gitignore keeps Unity's Library/Temp/Logs out. Likely secrets (license files, keys,
# tokens, Claude/Git credentials) and files over 50 MB that are not in Git LFS are left out of the commit and reported in the log.
# Log: C:\RainbowUnity\.git\autosave.log   Last pass: C:\RainbowUnity\.git\autosave.status   (inside .git, never committed)
[CmdletBinding()]
param(
  [switch]$Quiet,
  [int]$IntervalSec = 0,   # accepted only for compatibility with the old loop version; ignored (the scheduled task repeats it)
  [double]$MaxHours = 0    # same
)

$ErrorActionPreference = 'Continue'
$git        = 'C:\Users\josia\PortableGit\cmd\git.exe'
$repo       = 'C:\RainbowUnity'
$branch     = 'unity/screen05-dev'
$logPath    = Join-Path $repo '.git\autosave.log'
$statusPath = Join-Path $repo '.git\autosave.status'
$env:GIT_TERMINAL_PROMPT = '0'      # never wait for a typed password
$env:GCM_INTERACTIVE     = 'never'  # Git Credential Manager: never open a sign-in window from the background

# File names that must never be uploaded (license files, keys, credentials, personal Claude files).
$secretNames = '(?i)(\.(ulf|alf|pem|key|pfx|p12|keystore|jks|ppk)$)|((^|/)\.env(\.|$))|((^|/)\.?credentials(\.json)?$)|((^|/)id_(rsa|ed25519|ecdsa)(\.pub)?$)|((^|/)\.claude/settings\.local\.json$)|((^|/)CLAUDE\.local\.md$)|((^|/)\.claude\.json$)'
# Text that looks like a password, token or private key (written so that this file does not match itself).
$secretText  = '(?i)(gh[pousr]_[A-Za-z0-9]{30,})|(github_pat_[A-Za-z0-9_]{40,})|(sk-ant-[A-Za-z0-9_\-]{20,})|(-----BEGIN [A-Z ]*PRIVATE KEY-----)|(xox[abprs]-[A-Za-z0-9-]{10,})|(AKIA[0-9A-Z]{16})|("(access|refresh)_?[Tt]oken"\s*:\s*"[^"]{20,}")|(<Developer[D]ata Value=)'
$binaryExt   = '(?i)\.(png|jpe?g|tga|tif|psd|exr|hdr|glb|gltf|fbx|blend|ply|spz|ktx2|wav|ogg|mp3|mp4|webm|mov|zip|apk|aab|ttf|otf|dll|so|a|bin)$'

function Write-AutosaveLog([string]$m) {
  $line = "$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))  $m"
  try {
    if ((Test-Path -LiteralPath $logPath) -and ((Get-Item -LiteralPath $logPath).Length -gt 1MB)) {
      $keep = Get-Content -LiteralPath $logPath -Tail 2000
      Set-Content -LiteralPath $logPath -Value $keep -Encoding UTF8
    }
    Add-Content -LiteralPath $logPath -Value $line -Encoding UTF8
  } catch { }
  if (-not $Quiet) { Write-Output $line }
}
function Set-AutosaveStatus([string]$m) {
  try { Set-Content -LiteralPath $statusPath -Value "$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))  $m" -Encoding UTF8 } catch { }
}
function Get-UnsafeReason([string]$rel) {
  if ($rel -match $secretNames) { return 'possible secret or credential file' }
  $full = Join-Path $repo ($rel -replace '/', '\')
  if (-not (Test-Path -LiteralPath $full -PathType Leaf)) { return '' }
  $len = (Get-Item -LiteralPath $full).Length
  if ($len -gt 50MB) {
    $attr = "$(& $git check-attr filter -- "$rel" 2>$null)"
    if ($attr -notmatch 'filter: lfs') { return 'over 50 MB and not in Git LFS' }
  }
  if ($len -le 2MB -and $rel -notmatch $binaryExt) {
    try { $txt = [IO.File]::ReadAllText($full) } catch { return '' }
    if ($txt -match $secretText) { return 'looks like it contains a password, token or private key' }
  }
  return ''
}

function Invoke-AutosavePass {
  if (-not (Test-Path -LiteralPath (Join-Path $repo '.git'))) { Set-AutosaveStatus "ERROR: no Git repository in $repo"; return }
  if (-not (Test-Path -LiteralPath $git)) { Set-AutosaveStatus "ERROR: Git not found at $git"; return }
  Set-Location -LiteralPath $repo
  foreach ($busy in 'index.lock', 'MERGE_HEAD', 'rebase-merge', 'rebase-apply', 'CHERRY_PICK_HEAD', 'REVERT_HEAD') {
    if (Test-Path -LiteralPath (Join-Path $repo ".git\$busy")) { Set-AutosaveStatus "skipped: Git is busy ($busy); will retry in 5 minutes"; return }
  }
  $cur = "$(& $git rev-parse --abbrev-ref HEAD 2>$null)".Trim()
  if ($cur -ne $branch) { Write-AutosaveLog "skipped: current branch is '$cur' (autosave only saves $branch)"; Set-AutosaveStatus "skipped: on branch '$cur', not $branch"; return }

  $changes = @(& $git status --porcelain 2>$null | Where-Object { $_ })
  if ($changes.Count -gt 0) {
    & $git add -A 2>$null | Out-Null
    foreach ($f in @(& $git diff --cached --name-only --diff-filter=ACMR 2>$null | Where-Object { $_ })) {
      $reason = Get-UnsafeReason $f
      if ($reason) { & $git reset -q -- "$f" 2>$null | Out-Null; Write-AutosaveLog "LEFT OUT of the save: $f ($reason)" }
    }
    $staged = @(& $git diff --cached --name-only 2>$null | Where-Object { $_ })
    if ($staged.Count -gt 0) {
      $ts = (Get-Date).ToUniversalTime().ToString('yyyy-MM-dd HH:mm')
      & $git commit -q -m "autosave: Rainbow Unity $ts UTC" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" 2>$null | Out-Null
      if ($LASTEXITCODE -eq 0) { Write-AutosaveLog "committed $($staged.Count) file(s) as $("$(& $git rev-parse --short HEAD 2>$null)".Trim())" }
      else { Write-AutosaveLog "commit FAILED (exit $LASTEXITCODE)" }
    }
  }

  # Push whenever this laptop has commits that GitHub does not have yet (this also retries an earlier failed push).
  $head = "$(& $git rev-parse --short HEAD 2>$null)".Trim()
  $count = "$(& $git rev-list --count "origin/$branch..HEAD" 2>$null)".Trim()
  if ($LASTEXITCODE -ne 0 -or $count -notmatch '^\d+$') { $count = '1' }
  if ([int]$count -gt 0) {
    $pushOut = @(& $git push origin $branch 2>&1 | ForEach-Object { "$_" })
    $pushExit = $LASTEXITCODE
    if ($pushExit -eq 0) {
      Write-AutosaveLog "pushed $count commit(s) to GitHub ($branch, HEAD $head)"
      Set-AutosaveStatus "OK: pushed $count commit(s) to GitHub (HEAD $head)"
    } else {
      $why = (@($pushOut | Where-Object { $_ -match 'rejected|fetch first|non-fast-forward|denied|uthenticat|could not|fatal|error' }) | Select-Object -First 2) -join ' / '
      if (@($pushOut | Where-Object { $_ -match 'fetch first|non-fast-forward' }).Count -gt 0) {
        $why = "GitHub has newer commits - a Claude session must fetch and merge them (never force-push). $why"
      }
      Write-AutosaveLog "PUSH FAILED (exit $pushExit): $why"
      Set-AutosaveStatus "PUSH FAILED (exit $pushExit): $why"
    }
  } else {
    Set-AutosaveStatus "OK: nothing new to save; GitHub up to date (HEAD $head)"
  }
}

# Local-only backup (2026-11-24, permanent cross-account rule) of Claude configuration that must NOT go to GitHub (the repo is
# public): the user settings, the global CLAUDE.md pointer, the Rainbow memory notes and the workspace permission list. Copies
# only new or changed files into %USERPROFILE%\RainbowUnity-local-backup\claude-config (outside the repo) plus one dated copy
# per day under daily\<date>. Reads nothing else and never deletes anything.
function Backup-LocalClaudeConfig {
  $h = $env:USERPROFILE
  $root = Join-Path $h 'RainbowUnity-local-backup\claude-config'
  $day = Join-Path $root ('daily\' + (Get-Date -Format 'yyyy-MM-dd'))
  $items = New-Object System.Collections.Generic.List[object]
  $items.Add(@((Join-Path $h '.claude\settings.json'), 'user-settings.json'))
  $items.Add(@((Join-Path $h '.claude\CLAUDE.md'), 'user-CLAUDE.md'))
  $items.Add(@((Join-Path $h '.unity\.claude\settings.local.json'), 'workspace-settings.local.json'))
  foreach ($m in 'C--Users-josia--unity', 'C--RainbowUnity') {
    $md = Join-Path $h ".claude\projects\$m\memory"
    if (Test-Path -LiteralPath $md) { foreach ($f in @(Get-ChildItem -LiteralPath $md -Filter *.md -File)) { $items.Add(@($f.FullName, "memory-$m-$($f.Name)")) } }
  }
  $copied = 0
  foreach ($it in $items) {
    if (-not (Test-Path -LiteralPath $it[0])) { continue }
    $s = Get-Item -LiteralPath $it[0]
    foreach ($dir in $root, $day) {
      if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
      $dst = Join-Path $dir $it[1]
      if (Test-Path -LiteralPath $dst) { $d = Get-Item -LiteralPath $dst; if ($d.LastWriteTimeUtc -ge $s.LastWriteTimeUtc -and $d.Length -eq $s.Length) { continue } }
      Copy-Item -LiteralPath $it[0] -Destination $dst -Force
      $copied++
    }
  }
  if ($copied -gt 0) { Write-AutosaveLog "local config backup: $copied file(s) copied to $root" }
}

# Only one pass at a time (the scheduled task also uses "do not start a new instance").
$mutex = New-Object System.Threading.Mutex($false, 'Local\RainbowUnityAutosave')
$haveMutex = $false
try { $haveMutex = $mutex.WaitOne(0) } catch [System.Threading.AbandonedMutexException] { $haveMutex = $true }
if (-not $haveMutex) {
  Write-AutosaveLog 'skipped: another autosave pass is still running'
} else {
  try {
    Invoke-AutosavePass
    try { Backup-LocalClaudeConfig } catch { Write-AutosaveLog "local config backup failed: $($_.Exception.Message)" }
  }
  catch { Write-AutosaveLog "error: $($_.Exception.Message)"; Set-AutosaveStatus "ERROR: $($_.Exception.Message)" }
  finally { try { $mutex.ReleaseMutex() } catch { } }
}
$mutex.Dispose()

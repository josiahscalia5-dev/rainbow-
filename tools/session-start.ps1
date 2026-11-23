# Rainbow Unity - session start status (READ-ONLY).
# Used by the Claude Code SessionStart hook in C:\RainbowUnity\.claude\settings.json and by the "Resume Rainbow" shortcut.
# It only reads files and asks Git, GitHub and Windows for status. It never writes, deletes, installs, signs in,
# switches Claude accounts or changes any setting.
#   (no switch) prints one JSON object for the hook: additionalContext for Claude + a one-line systemMessage.
#   -Text       prints the same status as plain text for people.
[CmdletBinding()]
param([switch]$Text)

$ErrorActionPreference = 'SilentlyContinue'
$repo     = 'C:\RainbowUnity'
$project  = Join-Path $repo 'UnityProject'
$handoff  = Join-Path $repo 'UNITY_RAINBOW_HANDOFF.md'
$git      = 'C:\Users\josia\PortableGit\cmd\git.exe'
$unityCli = Join-Path $env:LOCALAPPDATA 'Unity\bin\unity.exe'
$branch   = 'unity/screen05-dev'
$taskName = 'Rainbow Unity Autosave'
$env:GIT_TERMINAL_PROMPT = '0'
$env:GCM_INTERACTIVE     = 'never'

function Invoke-Tool {
  param([string]$Exe, [string[]]$ArgList, [int]$TimeoutMs = 8000)
  $r = [pscustomobject]@{ Ok = $false; Code = -1; Out = ''; Err = '' }
  if (-not (Test-Path -LiteralPath $Exe)) { $r.Err = "not found: $Exe"; return $r }
  try {
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = $Exe
    $psi.Arguments = (($ArgList | ForEach-Object { if ($_ -match '[\s"]') { '"' + ($_ -replace '"', '\"') + '"' } else { $_ } }) -join ' ')
    $psi.WorkingDirectory = $repo
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $p = [System.Diagnostics.Process]::Start($psi)
    $o = $p.StandardOutput.ReadToEndAsync()
    $e = $p.StandardError.ReadToEndAsync()
    if (-not $p.WaitForExit($TimeoutMs)) { try { $p.Kill() } catch { }; $r.Err = "no answer within $([int]($TimeoutMs / 1000)) s"; return $r }
    $p.WaitForExit()
    $r.Code = $p.ExitCode; $r.Ok = ($p.ExitCode -eq 0); $r.Out = $o.Result.Trim(); $r.Err = $e.Result.Trim()
  } catch { $r.Err = $_.Exception.Message }
  return $r
}
function Invoke-Git([string[]]$ArgList, [int]$TimeoutMs = 8000) { Invoke-Tool -Exe $git -ArgList (@('--no-optional-locks') + $ArgList) -TimeoutMs $TimeoutMs }
function Get-Short([string]$s, [int]$n) { if ($s.Length -gt $n) { $s.Substring(0, $n) + ' ...' } else { $s } }

$now   = Get-Date
$L     = New-Object System.Collections.Generic.List[string]
$warn  = New-Object System.Collections.Generic.List[string]
$short = New-Object System.Collections.Generic.List[string]

# ---------- project + handoff ----------
$projFound = Test-Path -LiteralPath (Join-Path $project 'Assets')
$unityVer = ''
$pv = Join-Path $project 'ProjectSettings\ProjectVersion.txt'
if (Test-Path -LiteralPath $pv) { $m = Select-String -LiteralPath $pv -Pattern '^m_EditorVersion:\s*(\S+)' | Select-Object -First 1; if ($m) { $unityVer = $m.Matches[0].Groups[1].Value } }
$projText = 'NOT FOUND'
if ($projFound) { $projText = "found (Unity $unityVer)" } else { $warn.Add("Unity project folder $project is missing - do NOT create a new project; ask the user.") }

$next = ''; $lastVerified = ''; $handoffSaved = 'MISSING'
if (Test-Path -LiteralPath $handoff) {
  $h = [IO.File]::ReadAllText($handoff, [Text.Encoding]::UTF8)
  $handoffSaved = (Get-Item -LiteralPath $handoff).LastWriteTime.ToString('yyyy-MM-dd HH:mm')
  $lastVerified = ([regex]::Match($h, '(?m)^Last verified:.*$')).Value.Trim()
  $next = ([regex]::Match($h, '(?s)<!-- NEXT-TASK:START -->(.*?)<!-- NEXT-TASK:END -->')).Groups[1].Value.Trim()
  if (-not $next) { $next = '(The handoff has no NEXT-TASK markers - read the whole handoff.)' }
  $next = Get-Short $next 3500
} else { $warn.Add("Handoff file $handoff is missing.") }

# ---------- Git + GitHub ----------
$gitLine = 'Git: not available'; $dirtyLine = ''; $ghLine = 'GitHub: not checked'
$headShort = '?'; $dirtyCount = -1; $ghShort = '?'
if ((Test-Path -LiteralPath $git) -and (Test-Path -LiteralPath (Join-Path $repo '.git'))) {
  $cur = (Invoke-Git @('rev-parse', '--abbrev-ref', 'HEAD')).Out
  $headFull = (Invoke-Git @('rev-parse', 'HEAD')).Out
  $log = (Invoke-Git @('log', '-1', '--format=%h|%cd|%s', '--date=format-local:%Y-%m-%d %H:%M')).Out
  $parts = $log -split '\|', 3
  if ($parts.Count -ge 3) { $headShort = $parts[0]; $gitLine = "Git: branch $cur, newest local commit $($parts[0]) ($($parts[1]) local time) `"$(Get-Short $parts[2] 90)`"" }
  else { $gitLine = "Git: branch $cur" }
  if ($cur -ne $branch) { $warn.Add("The folder is on branch '$cur', not $branch. Do not switch branches without the user.") }

  $porc = Invoke-Git @('status', '--porcelain')
  $dirty = @($porc.Out -split "`n" | Where-Object { $_.Trim() })
  $dirtyCount = $dirty.Count
  $dirtyLine = "Not yet committed on this laptop: $dirtyCount file(s)"
  if ($dirtyCount -gt 0) { $dirtyLine += ' -> ' + ((@($dirty | Select-Object -First 8 | ForEach-Object { $_.Trim() })) -join '; '); if ($dirtyCount -gt 8) { $dirtyLine += '; ...' }; $dirtyLine += ' (KEEP these; autosave will commit them)' }

  $remote = Invoke-Git @('ls-remote', 'origin', "refs/heads/$branch") 10000
  $remoteSha = ''
  if ($remote.Ok -and $remote.Out) { $remoteSha = ($remote.Out -split '\s+')[0] }
  if (-not $remoteSha) {
    $ghShort = 'not reachable'
    $ghLine = "GitHub: could not check right now ($(Get-Short $remote.Err 120)). Check again before pushing."
  } elseif ($remoteSha -eq $headFull) {
    $ghShort = 'in sync'
    $ghLine = "GitHub: branch $branch is at $($remoteSha.Substring(0, 7)) = same as this laptop (in sync)."
  } else {
    $known = (Invoke-Git @('cat-file', '-e', "$remoteSha^{commit}")).Ok
    if ($known -and (Invoke-Git @('merge-base', '--is-ancestor', $remoteSha, 'HEAD')).Ok) {
      $n = (Invoke-Git @('rev-list', '--count', "$remoteSha..HEAD")).Out
      $ghShort = "$n local commit(s) not on GitHub yet"
      $ghLine = "GitHub: at $($remoteSha.Substring(0, 7)); this laptop has $n newer commit(s) not on GitHub yet (KEEP them; autosave pushes them)."
    } else {
      $ghShort = 'GITHUB HAS NEWER COMMITS'
      $ghLine = "GitHub: at $($remoteSha.Substring(0, 7)), which this laptop does NOT have."
      $warn.Add("GitHub has commits this laptop does not have (maybe work from another account or device). Fetch and merge them carefully before working; never reset or force-push.")
    }
  }
} else { $warn.Add('Git or the repository was not found.') }

# ---------- autosave ----------
$autoLine = 'Autosave: '; $autoShort = '?'
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($task) {
  $info = $task | Get-ScheduledTaskInfo
  $res = "$($info.LastTaskResult)"
  if ($res -eq '0') { $res = 'OK' } elseif ($res -eq '267009') { $res = 'running' } elseif ($res -eq '267011') { $res = 'not run yet' }
  $last = 'never'; if ($info.LastRunTime -and $info.LastRunTime.Year -gt 2000) { $last = $info.LastRunTime.ToString('HH:mm') }
  $nextRun = '?'; if ($info.NextRunTime) { $nextRun = $info.NextRunTime.ToString('HH:mm') }
  $autoLine += "Windows task '$taskName' is $($task.State) (every 5 min; last run $last, result $res; next $nextRun)."
  $autoShort = "$($task.State), last $last"
  if ("$($task.State)" -eq 'Disabled') { $warn.Add("The autosave task is DISABLED. Repair: tools\setup-resume-system.ps1 (ask the user first).") }
} else {
  $autoLine += "the Windows task '$taskName' is NOT installed."
  $autoShort = 'NOT INSTALLED'
  $warn.Add("Autosave task missing. Repair (safe, no duplicates): powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\setup-resume-system.ps1")
}
$statusFile = Join-Path $repo '.git\autosave.status'
if (Test-Path -LiteralPath $statusFile) { $autoLine += ' Last pass: ' + (Get-Short ((Get-Content -LiteralPath $statusFile -TotalCount 1) -join ' ') 200) }
$logFile = Join-Path $repo '.git\autosave.log'
if (Test-Path -LiteralPath $logFile) {
  $bad = @(Get-Content -LiteralPath $logFile -Tail 20 | Where-Object { $_ -match 'FAILED|LEFT OUT|error' } | Select-Object -Last 2)
  if ($bad.Count -gt 0) { $warn.Add('Recent autosave problems: ' + ($bad -join ' | ')) }
}
$loops = @(Get-CimInstance Win32_Process -Filter "Name='powershell.exe' OR Name='pwsh.exe'" | Where-Object { $_.CommandLine -match 'autosave\.ps1' })
if ($loops.Count -gt 1) { $warn.Add("$($loops.Count) autosave processes are running at the same time; only the Windows task should run it.") }

# ---------- Unity ----------
$editors = @(Get-CimInstance Win32_Process -Filter "Name='Unity.exe'" | Where-Object { $_.CommandLine -match 'RainbowUnity' })
if ($editors.Count -gt 0) { $unityLine = "Unity Editor: OPEN for this project (PID $(($editors | ForEach-Object { $_.ProcessId }) -join ', ')). CLI: $unityCli"; $unityShort = 'open' }
else { $unityLine = "Unity Editor: closed. Open it only when needed: unity open C:\RainbowUnity\UnityProject --until-ready (takes a few minutes). CLI: $unityCli"; $unityShort = 'closed' }
if (-not (Test-Path -LiteralPath $unityCli)) { $warn.Add("Unity CLI not found at $unityCli - do NOT reinstall Unity without the user.") }

# ---------- specialists ----------
$specs = @()
$stage = Join-Path $repo 'staging'
foreach ($d in @(Get-ChildItem -LiteralPath $stage -Directory | Where-Object { $_.Name -like 'agent*' } | Sort-Object Name)) {
  $n = @(Get-ChildItem -LiteralPath $d.FullName -Recurse -File).Count
  if (Test-Path -LiteralPath (Join-Path $d.FullName 'README.md')) { $specs += "$($d.Name) finished ($n files)" } else { $specs += "$($d.Name) UNFINISHED ($n files so far, no README.md)" }
}

# ---------- laptop ----------
$freeGB = '?'; $ramGB = '?'
try { $freeGB = '{0:N1}' -f ((Get-PSDrive C).Free / 1GB) } catch { }
try { $ramGB = '{0:N1}' -f ((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1MB) } catch { }
if ($freeGB -ne '?' -and [double]$freeGB -lt 5) { $warn.Add("Low disk space on C: ($freeGB GB free). Avoid big downloads; ask before deleting anything.") }

# ---------- assemble ----------
$L.Add("RAINBOW STATUS - automatic read-only check by C:\RainbowUnity\tools\session-start.ps1 at $($now.ToString('yyyy-MM-dd HH:mm')) local time")
$L.Add('This is the user''s EXISTING Rainbow Unity project (Screen 05 "Flow Into the Current"). Follow C:\RainbowUnity\CLAUDE.md. Never start over.')
$L.Add("- Folder: C:\RainbowUnity | Unity project: C:\RainbowUnity\UnityProject - $projText")
$L.Add("- Handoff: C:\RainbowUnity\UNITY_RAINBOW_HANDOFF.md (saved $handoffSaved). $lastVerified")
$L.Add("- $gitLine")
if ($dirtyLine) { $L.Add("- $dirtyLine") }
$L.Add("- $ghLine")
$L.Add("- $autoLine")
$L.Add("- $unityLine")
if ($specs.Count -gt 0) { $L.Add('- Specialists (staging): ' + ($specs -join '; ')) }
$L.Add("- Laptop: C: $freeGB GB free, RAM $ramGB GB free (low-spec: max 2 parallel agents).")
if ($warn.Count -gt 0) { $L.Add('WARNINGS:'); foreach ($w in $warn) { $L.Add("  ! $w") } }
$L.Add('NEXT UNFINISHED TASK (from the handoff):')
$L.Add($next)
$L.Add('HOW TO USE THIS: when the user says "Resume Rainbow" / "continue" / "I''m back", first give them a 3-5 line plain-language status from this block, then continue the next unfinished task. For any other request, just use this as background. Ask before deleting files, installing anything or restarting the laptop.')
$context = Get-Short (($L -join "`n")) 9500

$summary = "Rainbow Unity: $branch @ $headShort | not committed: $dirtyCount | GitHub: $ghShort | autosave: $autoShort | Unity Editor: $unityShort. Type: Resume Rainbow"
if ($warn.Count -gt 0) { $summary += " ($($warn.Count) warning(s))" }

if ($Text) {
  Write-Output $context
} else {
  $obj = [ordered]@{
    systemMessage      = $summary
    hookSpecificOutput = [ordered]@{ hookEventName = 'SessionStart'; additionalContext = $context }
  }
  $json = $obj | ConvertTo-Json -Depth 5 -Compress
  # Pure ASCII output: escape every non-ASCII character so the console code page can never garble it.
  $json = [regex]::Replace($json, '[^\x00-\x7F]', { param($m) '\u{0:x4}' -f [int][char]$m.Value })
  [Console]::Out.Write($json)
}
exit 0

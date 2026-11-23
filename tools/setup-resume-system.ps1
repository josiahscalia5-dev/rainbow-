# Rainbow Unity - set up or REPAIR the permanent auto-resume system on this laptop. Safe to run again at any time.
#   1) Windows Task Scheduler task "Rainbow Unity Autosave": runs tools\autosave.ps1 every 5 minutes, hidden, as this
#      Windows user only while signed in. Re-running REPLACES the same task (never a second copy). No admin rights,
#      no passwords stored, works with every Claude account (it does not use Claude at all).
#   2) Desktop shortcut "Resume Rainbow" -> tools\Resume-Rainbow.ps1 (shows the status and opens Claude).
#   3) A short Rainbow pointer in %USERPROFILE%\.claude\CLAUDE.md (added once; any other text in that file is kept).
# It never deletes project files, installs software, signs in, switches Claude accounts or touches credentials.
param([switch]$SkipTask, [switch]$SkipShortcut, [switch]$SkipPointer)

$ErrorActionPreference = 'Stop'
$repo     = 'C:\RainbowUnity'
$taskName = 'Rainbow Unity Autosave'
$ps       = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$conhost  = Join-Path $env:SystemRoot 'System32\conhost.exe'
$me       = "$env:USERDOMAIN\$env:USERNAME"

# ---------- 1) autosave task ----------
if (-not $SkipTask) {
  # A hidden console ("conhost --headless") so no window flashes every 5 minutes.
  $arg = "--headless `"$ps`" -NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$repo\tools\autosave.ps1`" -Quiet"
  $action = New-ScheduledTaskAction -Execute $conhost -Argument $arg -WorkingDirectory $repo
  $every5 = New-ScheduledTaskTrigger -Once -At ((Get-Date).AddMinutes(1)) -RepetitionInterval (New-TimeSpan -Minutes 5)
  $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable `
    -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 4)
  $principal = New-ScheduledTaskPrincipal -UserId $me -LogonType Interactive -RunLevel Limited
  $desc = 'Rainbow Unity: every 5 minutes commit + push C:\RainbowUnity (branch unity/screen05-dev) to GitHub when something changed. Created by tools\setup-resume-system.ps1. Safe: never deletes, resets or force-pushes.'
  $triggers = @($every5)
  try { $triggers += New-ScheduledTaskTrigger -AtLogOn -User $me } catch { }
  try {
    Register-ScheduledTask -TaskName $taskName -TaskPath '\' -Action $action -Trigger $triggers -Settings $settings -Principal $principal -Description $desc -Force | Out-Null
  } catch {
    # Some Windows setups refuse a logon trigger without admin rights: fall back to the 5-minute trigger alone.
    Register-ScheduledTask -TaskName $taskName -TaskPath '\' -Action $action -Trigger @($every5) -Settings $settings -Principal $principal -Description $desc -Force | Out-Null
  }
  $t = Get-ScheduledTask -TaskName $taskName
  $rep = $t.Triggers[0].Repetition
  Write-Output ("Autosave task: {0} | every {1} for {2} | triggers: {3}" -f $t.State, $rep.Interval, $(if ($rep.Duration) { $rep.Duration } else { 'ever (no end)' }), $t.Triggers.Count)
}

# ---------- 2) desktop shortcut ----------
if (-not $SkipShortcut) {
  $desktop = [Environment]::GetFolderPath('Desktop')
  $lnkPath = Join-Path $desktop 'Resume Rainbow.lnk'
  $wsh = New-Object -ComObject WScript.Shell
  $lnk = $wsh.CreateShortcut($lnkPath)
  $lnk.TargetPath = $ps
  $lnk.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$repo\tools\Resume-Rainbow.ps1`""
  $lnk.WorkingDirectory = $repo
  $lnk.IconLocation = "$env:SystemRoot\System32\shell32.dll,43"
  $lnk.Description = 'Show the Rainbow Unity status and open Claude to continue'
  $lnk.Save()
  Write-Output "Desktop shortcut: $lnkPath"
}

# ---------- 3) pointer for sessions opened in another folder ----------
if (-not $SkipPointer) {
  $claudeDir = Join-Path $env:USERPROFILE '.claude'
  $userMd = Join-Path $claudeDir 'CLAUDE.md'
  $marker = '<!-- rainbow-unity-pointer -->'
  $block = @(
    $marker,
    '## Rainbow Unity (pointer for every Claude account on this laptop)',
    'The user''s Rainbow Unity game is an EXISTING project in C:\RainbowUnity (rules: C:\RainbowUnity\CLAUDE.md,',
    'state and next task: C:\RainbowUnity\UNITY_RAINBOW_HANDOFF.md). If the user mentions Rainbow, Benny, Screen 05,',
    'Unity or "Resume Rainbow" while this session runs in another folder, read those two files first, never start over,',
    'and suggest opening a new Code session with the folder C:\RainbowUnity so its startup check runs automatically.',
    ''
  ) -join "`r`n"
  $existing = ''
  if (Test-Path -LiteralPath $userMd) { $existing = [IO.File]::ReadAllText($userMd) }
  if ($existing -notmatch [regex]::Escape($marker)) {
    if (-not (Test-Path -LiteralPath $claudeDir)) { New-Item -ItemType Directory -Path $claudeDir | Out-Null }
    $prefix = ''
    if ($existing.Length -gt 0 -and -not $existing.EndsWith("`n")) { $prefix = "`r`n" }
    if ($existing.Length -gt 0) { $prefix += "`r`n" }
    [IO.File]::AppendAllText($userMd, $prefix + $block, (New-Object System.Text.UTF8Encoding($false)))
    Write-Output "Added the Rainbow pointer to $userMd"
  } else {
    Write-Output "Rainbow pointer already present in $userMd"
  }
}

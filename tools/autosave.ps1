# Rainbow Unity autosave: every few minutes, commit + push any changes on unity/screen05-dev.
# Safe: .gitignore keeps Unity's Library/Temp/Logs out; files over 50 MB that are not LFS-tracked are skipped.
# Log: C:\RainbowUnity\.git\autosave.log (not committed).
param([int]$IntervalSec = 300, [double]$MaxHours = 8)
$git = 'C:\Users\josia\PortableGit\cmd\git.exe'
$repo = 'C:\RainbowUnity'
$logPath = Join-Path $repo '.git\autosave.log'
$end = (Get-Date).AddHours($MaxHours)
function Write-AutosaveLog([string]$m) { "$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))  $m" | Add-Content -LiteralPath $logPath }
Write-AutosaveLog "autosave started (every $IntervalSec s, for up to $MaxHours h)"
while ((Get-Date) -lt $end) {
  try {
    Set-Location -LiteralPath $repo
    if (Test-Path -LiteralPath (Join-Path $repo '.git\index.lock')) { Write-AutosaveLog 'skipped: index.lock present'; Start-Sleep -Seconds 30; continue }
    $changes = @(& $git status --porcelain 2>$null)
    if ($changes.Count -gt 0) {
      & $git add -A 2>$null | Out-Null
      foreach ($f in @(& $git diff --cached --name-only 2>$null)) {
        $full = Join-Path $repo $f
        if ((Test-Path -LiteralPath $full) -and (Get-Item -LiteralPath $full).Length -gt 50MB) {
          $attr = & $git check-attr filter -- $f 2>$null
          if ($attr -notmatch 'filter: lfs') { & $git reset -q -- $f 2>$null; Write-AutosaveLog "skipped large non-LFS file: $f" }
        }
      }
      $ts = (Get-Date).ToUniversalTime().ToString('yyyy-MM-dd HH:mm')
      & $git commit -q -m "autosave: Rainbow Unity $ts UTC" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" 2>$null | Out-Null
      & $git push -q origin unity/screen05-dev 2>$null | Out-Null
      $pushExit = $LASTEXITCODE
      $head = (& $git rev-parse --short HEAD 2>$null)
      Write-AutosaveLog "committed $($changes.Count) changes as $head; push exit $pushExit"
    }
  } catch { Write-AutosaveLog "error: $($_.Exception.Message)" }
  Start-Sleep -Seconds $IntervalSec
}
Write-AutosaveLog 'autosave stopped (time limit reached)'

# Screen 05 TEST CYCLE (coordinator + fix agents). Only ONE cycle runs at a time (lock file), because there is one Editor.
#   1 stop Play   2 recompile (stops on compile errors)   3 full scene rebuild (Rainbow -> Build Screen 05 Scene)
#   4 Play   5 hold at the approved view (s = 14, paused)   6 exact 864x1536 still   7 side-by-side + area crops vs approved
#   8 console warnings/errors raised during the cycle.  Leaves the Editor in Play mode, PAUSED at s = 14.
# Work images go to UnityProject\Recordings\Screen05\work (git-ignored). Final evidence is copied by hand to evidence\screen05.
# Usage:
#   powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\screen05-cycle.ps1 -Tag water_try1 -Areas water
#   -Areas: any of water, foam, bubbles, splash, light, all (default all)   -NoRebuild: skip recompile + rebuild
#   -Series: also capture s = 10 / 14 / 20 (moving view)                     -Tag: short name for the files (letters, digits, _)
param(
  [string]$Tag = 'cycle',
  [string[]]$Areas = @('all'),
  [switch]$NoRebuild,
  [switch]$Series,
  [string]$OutDir = 'C:\RainbowUnity\UnityProject\Recordings\Screen05\work'
)
$ErrorActionPreference = 'Continue'
$env:UNITY_NO_BANNER = '1'; $env:UNITY_NO_CONSENT_PROMPT = '1'; $env:DO_NOT_TRACK = '1'
$U = 'C:\Users\josia\AppData\Local\Unity\bin\unity.exe'
$Proj = 'C:\RainbowUnity\UnityProject'
$Tools = 'C:\RainbowUnity\tools'
$Approved = 'C:\RainbowUnity\references\05_flow_into_the_current.png'
$Tag = ($Tag -replace '[^A-Za-z0-9_\-]', '_')
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Force -Path $OutDir | Out-Null }
$stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$base = Join-Path $OutDir ($stamp + '_' + $Tag)

# area -> crops (approved 864x1536 pixel boxes: X, Y, W, H, zoom)
$CropBoxes = [ordered]@{
  water_mid     = @(100, 520, 700, 460, 1.0)
  water_near    = @(0, 1150, 864, 386, 1.0)
  foam_left     = @(0, 500, 360, 340, 1.5)
  foam_right    = @(560, 540, 304, 420, 1.5)
  bubbles_left  = @(0, 640, 300, 680, 1.2)
  bubbles_right = @(600, 640, 264, 680, 1.2)
  splash        = @(150, 1040, 560, 300, 1.2)
  benny         = @(210, 760, 430, 460, 1.0)
  throat        = @(330, 360, 320, 220, 1.6)
  walls         = @(0, 180, 864, 400, 0.9)
}
$AreaCrops = @{
  water = @('water_mid', 'water_near'); foam = @('foam_left', 'foam_right'); bubbles = @('bubbles_left', 'bubbles_right')
  splash = @('splash', 'benny'); light = @('throat', 'walls')
}

function Invoke-Unity([string[]]$CmdArgs) {
  Push-Location $Proj
  try { $o = & $U @CmdArgs | Out-String } finally { Pop-Location }
  [pscustomobject]@{ Code = $LASTEXITCODE; Text = $o.Trim() }
}
function Invoke-Eval([string]$File, [int]$Timeout = 120) {
  Invoke-Unity @('command', 'script', 'eval', '--project-path', $Proj, '--timeout', "$($Timeout + 30)", '--', '--file', $File, '--timeout', "$Timeout")
}
function Get-Status { (Invoke-Eval 'AgentScripts/screen05_status.cs' 60).Text }
function Step([string]$m) { Write-Output ("[{0}] {1}" -f (Get-Date -Format 'HH:mm:ss'), $m) }

# ---- lock (one cycle at a time) ----
$lockPath = Join-Path $Proj 'Temp\screen05-cycle.lock'
$lock = $null; $deadline = (Get-Date).AddMinutes(20)
while ($null -eq $lock) {
  try { $lock = [System.IO.File]::Open($lockPath, 'OpenOrCreate', 'ReadWrite', 'None') }
  catch {
    if ((Get-Date) -gt $deadline) { Write-Output "BUSY: another Screen 05 cycle is still running ($lockPath)"; exit 5 }
    Start-Sleep -Seconds 5
  }
}
$exit = 0
try { do {
  $st = Invoke-Unity @('status', '--project-path', $Proj)
  if ($st.Code -ne 0 -or $st.Text -notmatch 'ready') { Write-Output "EDITOR NOT READY:`n$($st.Text)"; $exit = 4; break }
  [void](Invoke-Unity @('command', 'editor', 'set_auto_tick', '--enabled', 'true', '--project-path', $Proj))
  [void](Invoke-Unity @('command', 'console', 'clear', '--project-path', $Proj))

  if ((Get-Status) -match 'playing=True') { Step 'stop Play mode'; [void](Invoke-Unity @('command', 'editor.playmode', 'stop', '--project-path', $Proj)); Start-Sleep -Seconds 3 }

  if (-not $NoRebuild) {
    Step 'recompile'
    [void](Invoke-Unity @('command', 'script', 'recompile', '--project-path', $Proj))
    Start-Sleep -Seconds 8
    $rc = $null
    for ($i = 0; $i -lt 60; $i++) {
      $r = Invoke-Unity @('command', 'script', 'recompile_status', '--project-path', $Proj, '--result-only')
      try { $rc = $r.Text | ConvertFrom-Json } catch { $rc = $null }
      if ($null -ne $rc -and $rc.status -eq 'completed') { break }
      Start-Sleep -Seconds 5
    }
    if ($null -eq $rc -or $rc.status -ne 'completed') { Write-Output "RECOMPILE did not finish in time:`n$($r.Text)"; $exit = 2; break }
    if ($rc.compilationFailed -or $rc.failed) {
      Write-Output 'COMPILE ERRORS (fix them, then run the cycle again):'
      $rc.errors | ForEach-Object { Write-Output ('  ' + ($_ | Out-String).Trim()) }
      $exit = 2; break
    }
    Step 'rebuild scene'
    $b = Invoke-Eval 'AgentScripts/screen05_build_scene.cs' 600
    Write-Output $b.Text
    if ($b.Code -ne 0 -or $b.Text -match 'FAILED|MISSING') { Write-Output 'BUILD FAILED (see lines above and the console below)'; $exit = 3 }
  }

  if ($exit -eq 0) {
    Step 'enter Play mode'
    [void](Invoke-Unity @('command', 'editor.playmode', 'start', '--project-path', $Proj))
    $ok = $false
    for ($i = 0; $i -lt 40; $i++) {
      Start-Sleep -Seconds 4
      $s = Get-Status
      if ($s -match 'playing=True' -and $s -match 'BennyController ok') { $ok = $true; break }
    }
    if (-not $ok) { Write-Output "PLAY MODE did not start:`n$s"; $exit = 6 }
  }

  if ($exit -eq 0) {
    Step 'hold at the approved view (s = 14)'
    $h = Invoke-Eval 'AgentScripts/screen05_hold_approved.cs' 90
    Write-Output ('  ' + $h.Text)
    if ($h.Text -notmatch 'paused at frame') { $exit = 7 }
  }

  if ($exit -eq 0) {
    Step 'capture 864x1536'
    $c = Invoke-Eval 'AgentScripts/screen05_still_864x1536.cs' 120
    $m = [regex]::Match($c.Text, '[A-Za-z]:\\[^"\r\n]+?\.png')
    if (-not $m.Success) { Write-Output "CAPTURE FAILED:`n$($c.Text)"; $exit = 8 }
    else {
      $still = $base + '.png'
      Copy-Item $m.Value $still -Force
      Write-Output "STILL  $still"
      $sbs = $base + '_sbs.jpg'
      [void](& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Tools 'make-side-by-side.ps1') -Approved $Approved -Unity $still -Out $sbs -Label ("s=14  " + $Tag))
      Write-Output "SBS    $sbs"
      $names = @()
      foreach ($a in $Areas) { if ($a -eq 'all') { $names += $CropBoxes.Keys } elseif ($AreaCrops.ContainsKey($a)) { $names += $AreaCrops[$a] } }
      foreach ($n in ($names | Select-Object -Unique)) {
        $bx = $CropBoxes[$n]; $out = $base + '_' + $n + '.jpg'
        [void](& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Tools 'make-crop-compare.ps1') -Unity $still -X $bx[0] -Y $bx[1] -W $bx[2] -H $bx[3] -Zoom $bx[4] -Out $out)
        Write-Output ("CROP   {0,-13} {1}" -f $n, $out)
      }
    }
  }

  if ($exit -eq 0 -and $Series) {
    Step 'series s = 10 / 14 / 20'
    [void](Invoke-Unity @('command', 'editor.playmode', 'pause', '--project-path', $Proj))   # unpause (toggle)
    $sr = Invoke-Eval 'AgentScripts/screen05_series_approved.cs' 60
    $w = Invoke-Eval 'AgentScripts/screen05_wait_capture.cs' 600
    Write-Output ('  ' + $w.Text)
    $m = [regex]::Match($w.Text, '[A-Za-z]:\\[^"\r\n]+?series_[0-9_]+')
    if ($m.Success) { Write-Output "SERIES $($m.Value)" }
    [void](Invoke-Eval 'AgentScripts/screen05_hold_approved.cs' 90)   # back to the paused approved view
  }

} while ($false) }
finally {
  $con = Invoke-Unity @('command', 'console', 'get', '--level', 'warn', '--tail', '25', '--project-path', $Proj)
  $lines = ($con.Text -split "`r?`n") | Where-Object { $_ -match '\S' } | Select-Object -First 60
  Write-Output 'CONSOLE (warnings/errors during this cycle):'
  $lines | ForEach-Object { Write-Output ('  ' + $_) }
  if ($null -ne $lock) { $lock.Close() }
}
Step "done (exit $exit)"
exit $exit

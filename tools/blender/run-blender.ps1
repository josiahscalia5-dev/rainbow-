# Rainbow Unity - run ONE Blender Python script HEADLESS (background mode: no window, factory settings, no add-ons) with a hard timeout.
# Blender is only the asset tool (gold paddles, gold rings, washing-machine drum -> FBX in UnityProject/Assets/Rainbow/Environment/Models);
# Unity stays the game engine and every asset is validated in the playable scene with tools/screen05-cycle.ps1.
# Rules (8 GB laptop): one Blender process at a time; never while a round's agents run Unity cycles; when free RAM is below
# -MinFreeRamGB this stops and says so - then close Unity safely first (unity close --if-saved) and reopen it afterwards
# (unity open C:\RainbowUnity\UnityProject --until-ready).
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\blender\run-blender.ps1 -Script C:\RainbowUnity\tools\blender\<x>.py [-TimeoutSec 300] [-ScriptArgs a,b]
# Logs: C:\Users\josia\Blender\logs (outside the repo).
param(
    [Parameter(Mandatory = $true)][string]$Script,
    [string[]]$ScriptArgs = @(),
    [int]$TimeoutSec = 300,
    [double]$MinFreeRamGB = 0.35,
    [string]$Blender = 'C:\Users\josia\Blender\blender-5.3.0-windows-x64\blender.exe'
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $Blender)) { Write-Output "STOP: Blender not found at $Blender (run tools\blender\setup-blender.ps1 once)"; exit 2 }
if (-not (Test-Path -LiteralPath $Script)) { Write-Output "STOP: script not found: $Script"; exit 2 }
if (Get-Process -Name blender -ErrorAction SilentlyContinue) { Write-Output "STOP: another Blender process is running (one at a time)"; exit 3 }
$freeRam = (Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1MB
if ($freeRam -lt $MinFreeRamGB) { Write-Output ("STOP: only {0:N2} GB RAM free (< {1} GB). Close Unity safely first, then rerun." -f $freeRam, $MinFreeRamGB); exit 4 }

$logDir = 'C:\Users\josia\Blender\logs'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$log = Join-Path $logDir ((Get-Date -Format 'yyyyMMdd_HHmmss') + '_' + [IO.Path]::GetFileNameWithoutExtension($Script) + '.log')
$errLog = $log + '.err'
$bargs = @('-b', '--factory-startup', '--python-exit-code', '1', '-P', $Script, '--') + $ScriptArgs
$quoted = $bargs | ForEach-Object { if ($_ -match '\s') { '"' + $_ + '"' } else { $_ } }
$sw = [Diagnostics.Stopwatch]::StartNew()
$p = Start-Process -FilePath $Blender -ArgumentList $quoted -NoNewWindow -PassThru -RedirectStandardOutput $log -RedirectStandardError $errLog
$null = $p.Handle   # PowerShell 5.1: keeps ExitCode readable after the process ends
if (-not $p.WaitForExit($TimeoutSec * 1000)) { $p.Kill(); Write-Output "STOP: timeout after $TimeoutSec s (Blender was stopped). Log: $log"; exit 5 }
$p.WaitForExit()
$code = $p.ExitCode
Get-Content -LiteralPath $log -Tail 40
if ((Test-Path -LiteralPath $errLog) -and (Get-Item -LiteralPath $errLog).Length -gt 0) { Write-Output '--- stderr:'; Get-Content -LiteralPath $errLog -Tail 20 }
Write-Output ("Blender exit {0} after {1:N1} s. Log: {2}" -f $code, $sw.Elapsed.TotalSeconds, $log)
exit $code

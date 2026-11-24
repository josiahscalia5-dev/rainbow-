# Rainbow Unity - ONE-TIME setup of PORTABLE Blender (user-approved 2026-11-24: portable Blender 5.3 is the asset tool of the permanent
# Claude + Blender + Unity workflow; Unity stays the game engine).
# Downloads the official zip from download.blender.org, verifies it against the official SHA-256 list, unpacks it to
# C:\Users\josia\Blender\blender-<version>-windows-x64 and then removes ONLY the zip it downloaded. No installer, no admin rights, no
# registry entries; nothing else on the laptop changes. Safe to re-run: stops at once when blender.exe already exists.
# Refuses to download (exit 2) when C: has less than -MinFreeGB free (user rule: notify the user first if space is short).
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\blender\setup-blender.ps1
param(
    [string]$Version = '5.3.0',
    [string]$Root = 'C:\Users\josia\Blender',
    [double]$MinFreeGB = 6.5
)
$ErrorActionPreference = 'Stop'
$name = "blender-$Version-windows-x64"
$exe = Join-Path $Root "$name\blender.exe"
if (Test-Path -LiteralPath $exe) { Write-Output "OK: Blender is already set up: $exe"; exit 0 }

$freeGB = (Get-PSDrive C).Free / 1GB
Write-Output ("C: free before setup: {0:N2} GB (needed for a safe setup: {1} GB; Blender takes about 1.6 GB while unpacking, 1.2 GB after)" -f $freeGB, $MinFreeGB)
if ($freeGB -lt $MinFreeGB) { Write-Output "STOP: not enough free disk for safe development. Nothing was downloaded. Tell the user first."; exit 2 }

$series = ($Version.Split('.')[0..1]) -join '.'
$base = "https://download.blender.org/release/Blender$series"
New-Item -ItemType Directory -Force -Path $Root | Out-Null
$zip = Join-Path $Root "$name.zip"
$sumFile = Join-Path $Root "blender-$Version.sha256"

& curl.exe -fsSL --retry 3 -o $sumFile "$base/blender-$Version.sha256"
if ($LASTEXITCODE -ne 0) { Write-Output "STOP: could not read the official checksum list $base/blender-$Version.sha256"; exit 3 }
$expected = $null
foreach ($line in Get-Content -LiteralPath $sumFile) {
    $p = $line.Trim() -split '\s+'
    if ($p.Count -ge 2 -and $p[-1].TrimStart('*') -eq "$name.zip") { $expected = $p[0].ToLower() }
}
if (-not $expected) { Write-Output "STOP: the official checksum list has no entry for $name.zip"; exit 3 }

Write-Output "Downloading $base/$name.zip ..."
& curl.exe -fL -sS --retry 3 -o $zip "$base/$name.zip"
if ($LASTEXITCODE -ne 0) { Write-Output "STOP: download failed (curl exit $LASTEXITCODE)"; exit 4 }
$actual = (Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash.ToLower()
if ($actual -ne $expected) { Write-Output "STOP: SHA-256 mismatch (expected $expected, got $actual). Nothing was unpacked; the zip was kept for inspection."; exit 5 }
Write-Output "SHA-256 verified: $actual"

& tar.exe -xf $zip -C $Root
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $exe)) { Write-Output "STOP: unpacking failed (tar exit $LASTEXITCODE); the zip was kept."; exit 6 }
Remove-Item -LiteralPath $zip
$sizeGB = (Get-ChildItem -LiteralPath (Join-Path $Root $name) -Recurse -File | Measure-Object Length -Sum).Sum / 1GB
Write-Output ("Unpacked to {0} ({1:N2} GB); the downloaded zip was removed. C: free now {2:N2} GB." -f (Join-Path $Root $name), $sizeGB, ((Get-PSDrive C).Free / 1GB))
& $exe -b --factory-startup --version
exit 0

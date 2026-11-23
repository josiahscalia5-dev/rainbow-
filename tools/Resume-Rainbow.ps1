# "Resume Rainbow" desktop shortcut: shows the Rainbow Unity status, copies the words "Resume Rainbow" and opens Claude.
# Read-only for the project: it never changes, deletes or installs anything, never signs in and never switches accounts.
try { $Host.UI.RawUI.WindowTitle = 'Resume Rainbow' } catch { }
Write-Host 'Checking the Rainbow Unity project...' -ForegroundColor Cyan
& 'C:\RainbowUnity\tools\session-start.ps1' -Text
Write-Host ''

$copied = $false
try { Set-Clipboard -Value 'Resume Rainbow'; $copied = $true } catch { }

$appId = 'Claude_pzs8sxrjxfjjc!Claude'
try { $found = Get-StartApps | Where-Object { $_.Name -eq 'Claude' } | Select-Object -First 1; if ($found) { $appId = $found.AppID } } catch { }
try { Start-Process -FilePath 'explorer.exe' -ArgumentList "shell:AppsFolder\$appId" } catch { Write-Host 'Please open the Claude app yourself.' }

Write-Host 'Claude is opening. Then:' -ForegroundColor Green
Write-Host '  1. Make sure you are signed in to the Claude account you want to use.'
Write-Host '  2. Click "Code", start a NEW session and choose the folder:  C:\RainbowUnity'
if ($copied) { Write-Host '  3. Click the message box, press Ctrl+V (it pastes: Resume Rainbow) and press Enter.' }
else { Write-Host '  3. Type: Resume Rainbow   and press Enter.' }
Write-Host ''
Read-Host 'Press Enter to close this window'

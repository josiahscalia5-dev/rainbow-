param([int]$Runs = 5, [string]$Proj = 'C:\RainbowUnity\UnityProject', [string]$Out = '')
# READ-ONLY comparison of two ways to talk to the open Unity Editor: (A) the Unity CLI 1.0.1 (`unity status`,
# `unity command script eval`) as used today, and (B) the CLI's built-in MCP server (`unity mcp`) started as a TEMPORARY
# child process (nothing is configured, registered or installed). Only read-only calls are made: status queries and the
# read-only AgentScripts/screen05_status.cs. Takes the test-cycle lock so it never overlaps a specialist's Unity cycle.
$ErrorActionPreference = 'Continue'
$env:UNITY_NO_BANNER = '1'; $env:UNITY_NO_PAGER = '1'; $env:UNITY_NO_AGENT_HINTS = '1'; $env:UNITY_NO_CONSENT_PROMPT = '1'; $env:DO_NOT_TRACK = '1'
$U = 'C:\Users\josia\AppData\Local\Unity\bin\unity.exe'
$statusFile = Join-Path $Proj 'AgentScripts\screen05_status.cs'
$statusCode = Get-Content $statusFile -Raw
$report = New-Object System.Collections.ArrayList
function Say([string]$m) { [void]$report.Add($m); Write-Output $m }
function Stats([double[]]$a) { if (-not $a -or $a.Count -eq 0) { return 'n/a' }; $s = $a | Sort-Object; $med = $s[[int][Math]::Floor(($s.Count - 1) / 2)]; return ('median {0:N2} s, min {1:N2}, max {2:N2} (n={3})' -f $med, $s[0], $s[-1], $s.Count) }

# ---- the same lock as tools\screen05-cycle.ps1: wait until no specialist cycle is running, then hold it ----
$lockPath = Join-Path $Proj 'Temp\screen05-cycle.lock'
$lock = $null; $deadline = (Get-Date).AddMinutes(25)
while ($null -eq $lock) {
  try { $lock = [System.IO.File]::Open($lockPath, 'OpenOrCreate', 'ReadWrite', 'None') }
  catch { if ((Get-Date) -gt $deadline) { Say 'BUSY: a specialist cycle held the lock for 25 min - test not run'; exit 5 }; Start-Sleep -Seconds 5 }
}
Say ("[{0}] lock taken (no specialist cycle running)" -f (Get-Date -Format 'HH:mm:ss'))
try {
  # ================= A: Unity CLI (one process per call, as the cycle tool does) =================
  $tStatus = @(); $tEval = @(); $failA = 0; $outA = 0
  for ($i = 0; $i -lt $Runs; $i++) {
    $sw = [Diagnostics.Stopwatch]::StartNew()
    $o = & $U status --project-path $Proj --format json 2>$null | Out-String
    $sw.Stop(); $tStatus += $sw.Elapsed.TotalSeconds; if ($LASTEXITCODE -ne 0) { $failA++ }
    $sw = [Diagnostics.Stopwatch]::StartNew()
    Push-Location $Proj
    $o2 = & $U command script eval --project-path $Proj -- --file AgentScripts/screen05_status.cs 2>$null | Out-String
    Pop-Location
    $sw.Stop(); $tEval += $sw.Elapsed.TotalSeconds; if ($LASTEXITCODE -ne 0 -or $o2 -notmatch 'playing=') { $failA++ }
    $outA = $o2.Length
  }
  $sw = [Diagnostics.Stopwatch]::StartNew()
  $list = & $U command --project-path $Proj --format json 2>$null | Out-String
  $sw.Stop(); $tList = $sw.Elapsed.TotalSeconds
  $cmdCount = 0; try { $lj = $list | ConvertFrom-Json; $cmdCount = @($lj.data.items).Count } catch {}
  Say ''
  Say 'A) UNITY CLI 1.0.1 (current method: one unity.exe process per call)'
  Say ('   unity status                : ' + (Stats $tStatus))
  Say ('   script eval (status script) : ' + (Stats $tEval) + ('   answer {0} chars' -f $outA))
  Say ('   list Editor commands        : {0:N2} s, {1} commands, {2:N0} chars of JSON' -f $tList, $cmdCount, $list.Length)
  Say ('   failed calls                : ' + $failA)

  # ================= B: Unity MCP server (one long-lived process, JSON-RPC over stdio) =================
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $U; $psi.Arguments = "mcp --project-path `"$Proj`""
  $psi.UseShellExecute = $false; $psi.RedirectStandardInput = $true; $psi.RedirectStandardOutput = $true; $psi.RedirectStandardError = $true
  $psi.CreateNoWindow = $true
  $psi.StandardOutputEncoding = [System.Text.Encoding]::UTF8
  foreach ($k in 'UNITY_NO_BANNER', 'UNITY_NO_PAGER', 'UNITY_NO_AGENT_HINTS', 'UNITY_NO_CONSENT_PROMPT', 'DO_NOT_TRACK') { $psi.EnvironmentVariables[$k] = '1' }
  $swStart = [Diagnostics.Stopwatch]::StartNew()
  $p = [System.Diagnostics.Process]::Start($psi)
  $errSb = New-Object System.Text.StringBuilder
  $errJob = Register-ObjectEvent -InputObject $p -EventName ErrorDataReceived -Action { if ($EventArgs.Data) { [void]$Event.MessageData.AppendLine($EventArgs.Data) } } -MessageData $errSb
  $p.BeginErrorReadLine()
  $script:pending = $null
  function Send-Rpc([hashtable]$msg) { $j = ($msg | ConvertTo-Json -Depth 20 -Compress); $p.StandardInput.WriteLine($j); $p.StandardInput.Flush() }
  function Read-Reply([int]$id, [int]$timeoutMs = 60000) {
    $sw2 = [Diagnostics.Stopwatch]::StartNew()
    while ($sw2.ElapsedMilliseconds -lt $timeoutMs) {
      if ($null -eq $script:pending) { $script:pending = $p.StandardOutput.ReadLineAsync() }
      if ($script:pending.Wait(500)) {
        $line = $script:pending.Result; $script:pending = $null
        if ($null -eq $line) { return $null }
        if ($line.Trim().Length -eq 0) { continue }
        try { $o = $line | ConvertFrom-Json } catch { continue }
        if ($o.PSObject.Properties.Name -contains 'id' -and $o.id -eq $id) { return @{ obj = $o; raw = $line } }
      }
    }
    return $null
  }
  $initOk = $false; $tools = @(); $toolsRaw = 0; $tInit = 0; $tListMcp = 0
  Send-Rpc @{ jsonrpc = '2.0'; id = 1; method = 'initialize'; params = @{ protocolVersion = '2025-06-18'; capabilities = @{}; clientInfo = @{ name = 'rainbow-readonly-test'; version = '1.0' } } }
  $r = Read-Reply 1 60000
  $tInit = $swStart.Elapsed.TotalSeconds
  if ($r) {
    $initOk = $true
    $instr = ''; if ($r.obj.result.instructions) { $instr = [string]$r.obj.result.instructions }
    Send-Rpc @{ jsonrpc = '2.0'; method = 'notifications/initialized' }
    $sw = [Diagnostics.Stopwatch]::StartNew(); $cursor = $null; $nid = 2
    do {
      $params = @{}; if ($cursor) { $params.cursor = $cursor }
      Send-Rpc @{ jsonrpc = '2.0'; id = $nid; method = 'tools/list'; params = $params }
      $lr = Read-Reply $nid 60000; $nid++
      if ($null -eq $lr) { break }
      $tools += @($lr.obj.result.tools); $toolsRaw += $lr.raw.Length
      $cursor = $lr.obj.result.nextCursor
    } while ($cursor)
    $sw.Stop(); $tListMcp = $sw.Elapsed.TotalSeconds
  }
  Say ''
  Say 'B) UNITY MCP SERVER (unity mcp, temporary test process; nothing registered in Claude)'
  Say ('   start + initialize          : {0:N2} s ({1})' -f $tInit, $(if ($initOk) { 'OK' } else { 'NO ANSWER' }))
  if ($initOk) {
    Say ('   tools/list                  : {0:N2} s, {1} tools, {2:N0} chars of tool definitions (~{3:N0} tokens if all loaded)' -f $tListMcp, $tools.Count, $toolsRaw, ($toolsRaw / 4))
    if ($instr) { Say ('   server instructions         : {0:N0} chars' -f $instr.Length) }
    $evalTool = $tools | Where-Object { $_.name -match '(?i)script[._]eval$|^script_eval$|eval$' } | Select-Object -First 1
    $statusTool = $tools | Where-Object { $_.name -match '(?i)(editor[._])?status$' } | Select-Object -First 1
    Say ('   eval tool                   : ' + $(if ($evalTool) { $evalTool.name + '  params: ' + (($evalTool.inputSchema.properties.PSObject.Properties.Name) -join ', ') } else { 'not found' }))
    Say ('   status tool                 : ' + $(if ($statusTool) { $statusTool.name } else { 'not found' }))
    $tEvalM = @(); $tStatM = @(); $failB = 0; $outB = 0
    for ($i = 0; $i -lt $Runs; $i++) {
      if ($statusTool) {
        $sw = [Diagnostics.Stopwatch]::StartNew()
        Send-Rpc @{ jsonrpc = '2.0'; id = (100 + $i); method = 'tools/call'; params = @{ name = $statusTool.name; arguments = @{} } }
        $cr = Read-Reply (100 + $i) 60000; $sw.Stop(); $tStatM += $sw.Elapsed.TotalSeconds
        if ($null -eq $cr -or $cr.obj.result.isError) { $failB++ }
      }
      if ($evalTool) {
        $props = @($evalTool.inputSchema.properties.PSObject.Properties.Name)
        $a = @{}
        if ($props -contains 'code') { $a.code = $statusCode } elseif ($props -contains 'script') { $a.script = $statusCode } elseif ($props -contains 'source') { $a.source = $statusCode } elseif ($props -contains 'file') { $a.file = 'AgentScripts/screen05_status.cs' } else { $a[$props[0]] = $statusCode }
        $sw = [Diagnostics.Stopwatch]::StartNew()
        Send-Rpc @{ jsonrpc = '2.0'; id = (200 + $i); method = 'tools/call'; params = @{ name = $evalTool.name; arguments = $a } }
        $cr = Read-Reply (200 + $i) 120000; $sw.Stop(); $tEvalM += $sw.Elapsed.TotalSeconds
        if ($null -eq $cr -or $cr.obj.result.isError -or $cr.raw -notmatch 'playing=') { $failB++; if ($cr) { $outB = $cr.raw.Length; if ($i -eq 0) { Say ('   first eval reply (cut)      : ' + $cr.raw.Substring(0, [Math]::Min(300, $cr.raw.Length))) } } } else { $outB = $cr.raw.Length }
      }
    }
    Say ('   status tool calls           : ' + (Stats $tStatM))
    Say ('   eval (status script) calls  : ' + (Stats $tEvalM) + ('   answer {0} chars' -f $outB))
    Say ('   failed calls                : ' + $failB)
    $names = ($tools | ForEach-Object { $_.name }) -join ', '
    Say ('   tool names: ' + $(if ($names.Length -gt 1500) { $names.Substring(0, 1500) + ' ...' } else { $names }))
  }
  try { $p.StandardInput.Close() } catch {}
  if (-not $p.WaitForExit(5000)) { try { $p.Kill() } catch {} }
  Unregister-Event -SourceIdentifier $errJob.Name -ErrorAction SilentlyContinue
  $e = $errSb.ToString().Trim(); if ($e) { Say ('   server stderr (cut): ' + $e.Substring(0, [Math]::Min(400, $e.Length))) }

  # ---- B2: the same server in its slimmer "--tool-groups" mode (one tool per command group): definitions size only ----
  $psi.Arguments = "mcp --project-path `"$Proj`" --tool-groups"
  $p = [System.Diagnostics.Process]::Start($psi); $script:pending = $null
  Send-Rpc @{ jsonrpc = '2.0'; id = 1; method = 'initialize'; params = @{ protocolVersion = '2025-06-18'; capabilities = @{}; clientInfo = @{ name = 'rainbow-readonly-test'; version = '1.0' } } }
  $r = Read-Reply 1 60000
  if ($r) {
    Send-Rpc @{ jsonrpc = '2.0'; method = 'notifications/initialized' }
    Send-Rpc @{ jsonrpc = '2.0'; id = 2; method = 'tools/list'; params = @{} }
    $lr = Read-Reply 2 60000
    if ($lr) { Say ('   --tool-groups mode          : {0} tools, {1:N0} chars of tool definitions (~{2:N0} tokens)' -f @($lr.obj.result.tools).Count, $lr.raw.Length, ($lr.raw.Length / 4)) }
  } else { Say '   --tool-groups mode          : no answer' }
  try { $p.StandardInput.Close() } catch {}
  if (-not $p.WaitForExit(5000)) { try { $p.Kill() } catch {} }
}
finally {
  if ($null -ne $lock) { $lock.Close() }
  Say ("[{0}] lock released" -f (Get-Date -Format 'HH:mm:ss'))
  if ($Out) { $report | Out-File -Encoding utf8 $Out }
}

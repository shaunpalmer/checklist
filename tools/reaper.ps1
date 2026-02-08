[CmdletBinding()]
param(
  [string]$Message = "",
  [switch]$Push
)

$ErrorActionPreference = "Stop"

function Exec([string]$Command) {
  $ErrorActionPreference = "Continue"
  $out = & cmd.exe /c $Command 2>&1
  $code = $LASTEXITCODE
  $ErrorActionPreference = "Stop"
  return @{ Out = $out; Code = $code }
}

# Ensure we're inside a git repo and jump to root
$top = Exec "git rev-parse --show-toplevel"
if ($top.Code -ne 0) {
  Write-Host "Reaper: not inside a git repo." -ForegroundColor Red
  exit 1
}
$repoRoot = ($top.Out | Select-Object -First 1).ToString().Trim()
Set-Location $repoRoot

$status = Exec "git status --porcelain"
if ($status.Code -ne 0) {
  Write-Host "Reaper: git status failed." -ForegroundColor Red
  exit 1
}

if (-not $status.Out -or ($status.Out | Measure-Object).Count -eq 0) {
  Write-Host "Reaper: nothing to checkpoint (working tree clean)."
  exit 0
}

Write-Host "Reaper: staging changes..."
$add = Exec "git add -A"
if ($add.Code -ne 0) {
  Write-Host "Reaper: git add failed." -ForegroundColor Red
  exit 1
}

$ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$msg = if ([string]::IsNullOrWhiteSpace($Message)) { "checkpoint: $ts" } else { "checkpoint: $ts - $Message" }

Write-Host "Reaper: committing..."
$commit = Exec ("git commit -m " + '"' + $msg.Replace('"','\"') + '"')
if ($commit.Code -ne 0) {
  Write-Host "Reaper: git commit failed (maybe nothing staged?)." -ForegroundColor Yellow
  $commit.Out | ForEach-Object { Write-Host $_ }
  exit $commit.Code
}

if ($Push) {
  Write-Host "Reaper: pushing..."
  $push = Exec "git push"
  if ($push.Code -ne 0) {
    # Try setting upstream if missing
    $branch = Exec "git rev-parse --abbrev-ref HEAD"
    $b = ($branch.Out | Select-Object -First 1).ToString().Trim()
    if ($branch.Code -eq 0 -and $b -and $b -ne "HEAD") {
      $push2 = Exec ("git push -u origin " + $b)
      if ($push2.Code -ne 0) {
        Write-Host "Reaper: push failed." -ForegroundColor Red
        $push2.Out | ForEach-Object { Write-Host $_ }
        exit $push2.Code
      }
    } else {
      Write-Host "Reaper: push failed." -ForegroundColor Red
      $push.Out | ForEach-Object { Write-Host $_ }
      exit $push.Code
    }
  }
}

Write-Host "Reaper: done."
& git --no-pager log -1 --oneline

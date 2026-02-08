[CmdletBinding()]
param(
  [string]$Message = "",
  [switch]$Push
)

# --- helpers ---------------------------------------------------------------
function Invoke-GitCmd {
  param([string[]]$GitArgs)
  $raw = & git.exe @GitArgs 2>&1
  $lines = @($raw | ForEach-Object { "$_" })
  return @{ Out = $lines; Code = $LASTEXITCODE }
}

# --- locate repo root -----------------------------------------------------
$top = Invoke-GitCmd 'rev-parse','--show-toplevel'
if ($top.Code -ne 0) {
  Write-Host "Reaper: not inside a git repo." -ForegroundColor Red
  exit 1
}
$repoRoot = ($top.Out | Select-Object -First 1).Trim()
Set-Location $repoRoot

# --- anything to commit? --------------------------------------------------
$status = Invoke-GitCmd 'status','--porcelain'
if ($status.Code -ne 0) {
  Write-Host "Reaper: git status failed." -ForegroundColor Red
  exit 1
}

if (-not $status.Out -or ($status.Out | Where-Object { $_ -ne '' } | Measure-Object).Count -eq 0) {
  Write-Host "Reaper: nothing to checkpoint (working tree clean)."
  exit 0
}

# --- stage -----------------------------------------------------------------
Write-Host "Reaper: staging changes..."
$add = Invoke-GitCmd 'add','-A'
if ($add.Code -ne 0) {
  Write-Host "Reaper: git add failed." -ForegroundColor Red
  exit 1
}

# --- commit ----------------------------------------------------------------
$ts  = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$msg = if ([string]::IsNullOrWhiteSpace($Message)) {
  "checkpoint: $ts"
} else {
  "checkpoint: $ts - $Message"
}

Write-Host "Reaper: committing..."
$commit = Invoke-GitCmd 'commit','-m',$msg
if ($commit.Code -ne 0) {
  Write-Host "Reaper: commit failed (maybe nothing staged?)." -ForegroundColor Yellow
  $commit.Out | ForEach-Object { Write-Host $_ }
  exit $commit.Code
}

# --- push (optional) ------------------------------------------------------
if ($Push) {
  Write-Host "Reaper: pushing..."
  $pushResult = Invoke-GitCmd 'push'
  if ($pushResult.Code -ne 0) {
    # Try setting upstream if first push on this branch
    $branch = Invoke-GitCmd 'rev-parse','--abbrev-ref','HEAD'
    $b = ($branch.Out | Select-Object -First 1).Trim()
    if ($branch.Code -eq 0 -and $b -and $b -ne "HEAD") {
      $pushResult = Invoke-GitCmd 'push','-u','origin',$b
      if ($pushResult.Code -ne 0) {
        Write-Host "Reaper: push failed." -ForegroundColor Red
        $pushResult.Out | ForEach-Object { Write-Host $_ }
        exit $pushResult.Code
      }
    } else {
      Write-Host "Reaper: push failed." -ForegroundColor Red
      $pushResult.Out | ForEach-Object { Write-Host $_ }
      exit $pushResult.Code
    }
  }
}

Write-Host "Reaper: done." -ForegroundColor Green
& git.exe --no-pager log -1 --oneline

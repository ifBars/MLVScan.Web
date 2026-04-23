param()

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$worktreePath = [System.IO.Path]::GetFullPath((Join-Path $root '..'))
Set-Location $worktreePath

$checks = @(
  @{
    Name = 'bun'
    Test = { Get-Command bun -ErrorAction SilentlyContinue }
    Help = 'Install bun and ensure it is on PATH.'
  },
  @{
    Name = 'package.json'
    Test = { Test-Path (Join-Path $worktreePath 'package.json') }
    Help = 'The worktree path should point at the MLVScan.Web repository root.'
  },
  @{
    Name = 'bun.lock'
    Test = { Test-Path (Join-Path $worktreePath 'bun.lock') }
    Help = 'The repo should keep bun.lock present for deterministic installs.'
  },
  @{
    Name = 'node_modules'
    Test = { Test-Path (Join-Path $worktreePath 'node_modules') }
    Help = 'Run .\.codex\scripts\setup-worktree.ps1 or bun install.'
  }
)

$failed = $false

foreach ($check in $checks) {
  $ok = & $check.Test
  if ($ok) {
    Write-Host "[ok] $($check.Name)"
  } else {
    Write-Host "[missing] $($check.Name): $($check.Help)"
    $failed = $true
  }
}

if (-not $failed) {
  git worktree list
  exit 0
}

exit 1

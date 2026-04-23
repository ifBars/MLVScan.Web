param()

$ErrorActionPreference = 'Stop'

if (-not $env:CODEX_WORKTREE_PATH) {
  throw 'CODEX_WORKTREE_PATH is not set.'
}

$worktreePath = [System.IO.Path]::GetFullPath($env:CODEX_WORKTREE_PATH)
Set-Location $worktreePath

if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
  throw 'bun is required but was not found on PATH.'
}

$packageJsonPath = Join-Path $worktreePath 'package.json'
$lockfilePath = Join-Path $worktreePath 'bun.lock'
$nodeModulesPath = Join-Path $worktreePath 'node_modules'

$needsInstall = -not (Test-Path $nodeModulesPath)

if (-not $needsInstall -and (Test-Path $packageJsonPath)) {
  $packageJsonTime = (Get-Item $packageJsonPath).LastWriteTimeUtc
  $nodeModulesTime = (Get-Item $nodeModulesPath).LastWriteTimeUtc
  if ($packageJsonTime -gt $nodeModulesTime) {
    $needsInstall = $true
  }
}

if (-not $needsInstall -and (Test-Path $lockfilePath)) {
  $lockfileTime = (Get-Item $lockfilePath).LastWriteTimeUtc
  $nodeModulesTime = (Get-Item $nodeModulesPath).LastWriteTimeUtc
  if ($lockfileTime -gt $nodeModulesTime) {
    $needsInstall = $true
  }
}

if ($needsInstall) {
  Write-Host "Installing dependencies in $worktreePath"
  bun install
} else {
  Write-Host "Dependencies already look current in $worktreePath"
}

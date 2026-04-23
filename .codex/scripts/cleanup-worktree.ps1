param(
  [switch]$IncludeDependencies
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$worktreePath = [System.IO.Path]::GetFullPath((Join-Path $root '..'))
Set-Location $worktreePath

$targets = @(
  'dist',
  'tmp',
  '.tmp-vite-out.log',
  '.tmp-vite-err.log',
  '.tmp-wrangler-out.log',
  '.tmp-wrangler-err.log'
)

if ($IncludeDependencies) {
  $targets += 'node_modules'
}

foreach ($target in $targets) {
  $fullPath = Join-Path $worktreePath $target
  if (Test-Path $fullPath) {
    Remove-Item -LiteralPath $fullPath -Recurse -Force
    Write-Host "Removed $fullPath"
  }
}

# ============================================================
# Database restore (Phase 18D-3)
#
# Restores a custom-format (-Fc) dump produced by scripts\backup.ps1
# into a target database. RESTORE IS DESTRUCTIVE: -Force is required
# so a restore can never happen by accident. Existing objects in the
# target are dropped first (--clean --if-exists).
#
# Usage:
#   # restore into the DATABASE_URL database (overwrites it):
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\restore.ps1 -File backups\marble-....dump -Force
#
#   # restore into a separate (e.g. verification) database:
#   ... -File backups\marble-....dump -TargetDatabaseUrl "postgresql://user:pass@localhost:5432/marble_platform_restore_test" -Force
#
# The target database must already exist (createdb <name>).
# ============================================================

param(
  [Parameter(Mandatory = $true)]
  [string]$File,

  [string]$TargetDatabaseUrl = '',

  [switch]$Force
)

$ErrorActionPreference = 'Stop'

function Resolve-PgTool {
  param([Parameter(Mandatory = $true)][string]$ToolName)

  $onPath = Get-Command $ToolName -ErrorAction SilentlyContinue
  if ($onPath) { return $onPath.Source }

  $pgRoot = 'C:\Program Files\PostgreSQL'
  if (Test-Path -LiteralPath $pgRoot) {
    $candidates = Get-ChildItem -LiteralPath $pgRoot -Directory |
      Sort-Object Name -Descending |
      ForEach-Object { Join-Path $_.FullName ("bin\" + $ToolName + ".exe") } |
      Where-Object { Test-Path -LiteralPath $_ }
    if ($candidates) { return ($candidates | Select-Object -First 1) }
  }

  throw "$ToolName.exe not found. Install PostgreSQL or add its bin directory to PATH."
}

function Get-DatabaseUrl {
  if ($env:DATABASE_URL) { return $env:DATABASE_URL.Trim().Trim('"') }

  $envFile = Join-Path $PSScriptRoot '..\.env'
  if (Test-Path -LiteralPath $envFile) {
    $line = Get-Content -LiteralPath $envFile |
      Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } |
      Select-Object -First 1
    if ($line) {
      $value = ($line -replace '^\s*DATABASE_URL\s*=\s*', '').Trim().Trim('"')
      if ($value) { return $value }
    }
  }

  throw 'DATABASE_URL is not set in the environment and no .env file provides it.'
}

if (-not (Test-Path -LiteralPath $File)) {
  throw "Dump file not found: $File"
}

if (-not $Force) {
  throw 'Restore is destructive. Re-run with -Force once you have verified the target database.'
}

# Prisma-only query params (e.g. ?schema=public) are rejected by libpq
# ("invalid URI query parameter") - strip them before handing the URL to
# pg_restore. All other params are preserved.
function ConvertTo-LibpqUrl {
  param([Parameter(Mandatory = $true)][string]$Url)

  $qIndex = $Url.IndexOf('?')
  if ($qIndex -lt 0) { return $Url }

  $base = $Url.Substring(0, $qIndex)
  $pairs = @()
  foreach ($pair in ($Url.Substring($qIndex + 1) -split '&')) {
    $key = (($pair -split '=', 2)[0])
    if ($key -ne 'schema') { $pairs += $pair }
  }

  if ($pairs.Count -eq 0) { return $base }
  return ($base + '?' + ($pairs -join '&'))
}

$pgRestore = Resolve-PgTool -ToolName 'pg_restore'
$targetUrl = ConvertTo-LibpqUrl $(if ($TargetDatabaseUrl) { $TargetDatabaseUrl.Trim().Trim('"') } else { Get-DatabaseUrl })

& $pgRestore --clean --if-exists --no-owner --no-privileges -d $targetUrl $File
if ($LASTEXITCODE -ne 0) {
  throw "pg_restore failed with exit code $LASTEXITCODE."
}

Write-Output "RESTORE_OK $File"
exit 0

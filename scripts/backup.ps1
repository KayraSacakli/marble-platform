# ============================================================
# Database backup (Phase 18D-3)
#
# Produces a restorable custom-format (-Fc) dump of the database
# pointed to by DATABASE_URL (process env or .env fallback) into
# ./backups/ with a timestamped file name.
#
# Usage:
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\backup.ps1
#   npm run backup
#
# Restore counterpart: scripts\restore.ps1
# ============================================================

param(
  [string]$OutDir = (Join-Path $PSScriptRoot '..\backups')
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

# Prisma-only query params (e.g. ?schema=public) are rejected by libpq
# ("invalid URI query parameter") - strip them before handing the URL to
# pg_dump/pg_restore. All other params are preserved.
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

$pgDump = Resolve-PgTool -ToolName 'pg_dump'
$dbUrl = ConvertTo-LibpqUrl (Get-DatabaseUrl)

if (-not (Test-Path -LiteralPath $OutDir)) {
  New-Item -ItemType Directory -Path $OutDir | Out-Null
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$outFile = Join-Path $OutDir "marble-$timestamp.dump"

& $pgDump -Fc -f $outFile $dbUrl
if ($LASTEXITCODE -ne 0) {
  throw "pg_dump failed with exit code $LASTEXITCODE. No backup written."
}

if (-not (Test-Path -LiteralPath $outFile)) {
  throw 'pg_dump reported success but the dump file is missing.'
}

$size = (Get-Item -LiteralPath $outFile).Length
if ($size -le 0) {
  throw 'Backup file is empty - treating as failure.'
}

Write-Output "BACKUP_OK $outFile ($size bytes)"
exit 0

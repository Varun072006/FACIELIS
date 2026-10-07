$ErrorActionPreference = 'Stop'

$projectPath = Split-Path -Parent $PSScriptRoot
Set-Location $projectPath

$postgres = 'C:\Program Files\PostgreSQL\18\bin'
$psql = Join-Path $postgres 'psql.exe'

if (-not (Test-Path $psql)) {
    throw "PostgreSQL 18 was not found at $postgres."
}

Write-Host 'Enter only the PostgreSQL postgres-user password.'
$securePassword = Read-Host 'PostgreSQL password' -AsSecureString
$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)

$env:PGPASSWORD = $password
$encodedPassword = [Uri]::EscapeDataString($password)
$databaseUrl = "postgresql://postgres:$encodedPassword@localhost:2425/facielis"

[IO.File]::WriteAllText(
    (Join-Path $projectPath '.env'),
    ('DATABASE_URL="' + $databaseUrl + '"' + [Environment]::NewLine)
)

$databaseExists = & $psql -h localhost -p 2425 -U postgres -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = 'facielis'"
if ($LASTEXITCODE -ne 0) {
    throw 'PostgreSQL authentication failed. Check the password and run this script again.'
}

if ($databaseExists.Trim() -ne '1') {
    & $psql -h localhost -p 2425 -U postgres -d postgres -c 'CREATE DATABASE facielis'
    if ($LASTEXITCODE -ne 0) {
        throw 'The facielis database could not be created.'
    }
}

Write-Host 'Applying Prisma schema...'
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    throw 'Prisma schema setup failed.'
}

Write-Host 'Seeding demo data...'
npx prisma db seed
if ($LASTEXITCODE -ne 0) {
    throw 'Database seeding failed.'
}

Write-Host 'Starting Facielis...'
npm run dev
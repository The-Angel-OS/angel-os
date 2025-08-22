# Reset Database Script for Angel OS
# This script will drop and recreate the database to eliminate migration conflicts

Write-Host "DATABASE RESET SCRIPT - Angel OS" -ForegroundColor Red
Write-Host "This will completely wipe the database and start fresh!" -ForegroundColor Yellow
Write-Host ""

# Database connection details from memory
$DB_HOST = "74.208.87.243"
$DB_PORT = "5432"
$DB_NAME = "spaces_commerce"
$DB_USER = "postgres"
$PSQL_PATH = "C:\Program Files\pgAdmin 4\runtime\psql.exe"

# Confirm action
$confirmation = Read-Host "Are you sure you want to reset the database? Type 'RESET' to confirm"
if ($confirmation -ne "RESET") {
    Write-Host "Database reset cancelled." -ForegroundColor Green
    exit 0
}

Write-Host "Starting database reset..." -ForegroundColor Blue

try {
    # Step 1: Drop the database
    Write-Host "Dropping existing database..." -ForegroundColor Yellow
    & "$PSQL_PATH" -h $DB_HOST -p $DB_PORT -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;" postgres
    
    # Step 2: Create fresh database
    Write-Host "Creating fresh database..." -ForegroundColor Yellow
    & "$PSQL_PATH" -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;" postgres
    
    # Step 3: Remove local migration files to start fresh
    Write-Host "Cleaning local migration files..." -ForegroundColor Yellow
    if (Test-Path "src/migrations") {
        Remove-Item "src/migrations/*" -Force -Recurse -ErrorAction SilentlyContinue
    }
    
    Write-Host "Database reset complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run: pnpm payload migrate:create" -ForegroundColor White
    Write-Host "2. Run: pnpm payload migrate" -ForegroundColor White
    Write-Host "3. Run: pnpm dev" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "Error during database reset: $_" -ForegroundColor Red
    exit 1
}

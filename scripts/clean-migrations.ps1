# Clean Migrations Script for Angel OS
# This script will remove migration files and let Payload recreate them

Write-Host "CLEAN MIGRATIONS SCRIPT - Angel OS" -ForegroundColor Blue
Write-Host "This will remove existing migration files for a fresh start." -ForegroundColor Yellow
Write-Host ""

# Confirm action
$confirmation = Read-Host "Are you sure you want to clean migrations? Type 'CLEAN' to confirm"
if ($confirmation -ne "CLEAN") {
    Write-Host "Migration cleanup cancelled." -ForegroundColor Green
    exit 0
}

Write-Host "Starting migration cleanup..." -ForegroundColor Blue

try {
    # Remove local migration files to start fresh
    Write-Host "Removing migration files..." -ForegroundColor Yellow
    if (Test-Path "src/migrations") {
        Remove-Item "src/migrations/*" -Force -Recurse -ErrorAction SilentlyContinue
        Write-Host "Migration files removed." -ForegroundColor Green
    } else {
        Write-Host "No migration files found." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Migration cleanup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run: pnpm payload migrate:create" -ForegroundColor White
    Write-Host "2. Run: pnpm payload migrate" -ForegroundColor White
    Write-Host "3. Run: pnpm dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Note: You may need to manually drop/recreate the database" -ForegroundColor Yellow
    Write-Host "using pgAdmin4 if schema conflicts persist." -ForegroundColor Yellow
    
} catch {
    Write-Host "Error during migration cleanup: $_" -ForegroundColor Red
    exit 1
}




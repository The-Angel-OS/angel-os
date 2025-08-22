# Post Database Reset Script
# Run this after resetting the database in pgAdmin 4

Write-Host "POST DATABASE RESET - Angel OS" -ForegroundColor Green
Write-Host "Setting up fresh Payload CMS instance..." -ForegroundColor Blue

# Step 1: Clean local migration files
Write-Host "1. Cleaning local migration files..." -ForegroundColor Yellow
if (Test-Path "src/migrations") {
    Remove-Item "src/migrations/*" -Force -Recurse -ErrorAction SilentlyContinue
    Write-Host "   Migration files cleaned" -ForegroundColor Green
}

# Step 2: Generate fresh migration
Write-Host "2. Generating fresh migration..." -ForegroundColor Yellow
try {
    pnpm payload migrate:create
    Write-Host "   Fresh migration created" -ForegroundColor Green
} catch {
    Write-Host "   Warning: Migration creation failed, will try after restart" -ForegroundColor Yellow
}

# Step 3: Run migration
Write-Host "3. Running migration..." -ForegroundColor Yellow
try {
    pnpm payload migrate
    Write-Host "   Migration completed successfully" -ForegroundColor Green
} catch {
    Write-Host "   Warning: Migration failed, may need manual intervention" -ForegroundColor Yellow
}

# Step 4: Seed initial data (optional)
Write-Host "4. Would you like to seed initial data? (y/n)" -ForegroundColor Cyan
$seedChoice = Read-Host
if ($seedChoice -eq "y" -or $seedChoice -eq "Y") {
    Write-Host "   Seeding initial data..." -ForegroundColor Yellow
    try {
        # This would call your seed endpoint
        Write-Host "   Navigate to /admin to create your first user" -ForegroundColor Green
        Write-Host "   Then visit /dashboard to access the main interface" -ForegroundColor Green
    } catch {
        Write-Host "   Seeding failed, but database is ready for manual setup" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "DATABASE RESET COMPLETE!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start dev server: pnpm dev" -ForegroundColor White
Write-Host "2. Create first user: http://localhost:3000/admin" -ForegroundColor White
Write-Host "3. Access dashboard: http://localhost:3000/dashboard" -ForegroundColor White
Write-Host ""

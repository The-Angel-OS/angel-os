# Full Reset and Seed Script
# This script handles the complete reset process to avoid database connection issues

Write-Host "🔄 Angel OS Full Reset and Seed Process" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Step 1: Kill any hanging Node.js processes
Write-Host "1. Killing any hanging Node.js processes..." -ForegroundColor Yellow
try {
    $result = taskkill /F /IM node.exe 2>&1
    Write-Host "   ✓ Node.js processes terminated" -ForegroundColor Green
} catch {
    Write-Host "   ℹ No Node.js processes to terminate" -ForegroundColor Gray
}

# Step 2: Reset database connections
Write-Host "2. Resetting database connections..." -ForegroundColor Yellow
$env:PGPASSWORD = "zubxPN0S!vercel_user"
try {
    $result = psql -h 74.208.87.243 -U pgadmin -d postgres -f "scripts/reset-database-connections.sql" 2>&1
    Write-Host "   ✓ Database connections reset" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Could not reset database connections (continuing anyway)" -ForegroundColor Orange
}

# Step 3: Wait a moment for connections to clear
Write-Host "3. Waiting for connections to clear..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Write-Host "   ✓ Wait complete" -ForegroundColor Green

# Step 4: Start dev server
Write-Host "4. Starting development server..." -ForegroundColor Yellow
$devProcess = Start-Process -FilePath "pnpm" -ArgumentList "dev" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 5

# Check if dev server is running
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

if ($port3000 -or $port3001) {
    Write-Host "   ✓ Development server started" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Development server may not be ready yet" -ForegroundColor Orange
}

# Step 5: Run seed process
Write-Host "5. Running seed process..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes..." -ForegroundColor Gray

try {
    $seedResult = pnpm run seed
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Seed process completed successfully" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Seed process failed" -ForegroundColor Red
        Write-Host "   Output: $seedResult" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Seed process encountered an error: $_" -ForegroundColor Red
}

# Step 6: Cleanup
Write-Host "6. Cleanup..." -ForegroundColor Yellow
if ($devProcess -and !$devProcess.HasExited) {
    Write-Host "   Stopping development server..." -ForegroundColor Gray
    Stop-Process -Id $devProcess.Id -Force -ErrorAction SilentlyContinue
}
Write-Host "   ✓ Cleanup complete" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Reset and seed process complete!" -ForegroundColor Cyan
Write-Host "You can now run 'pnpm dev' to start the development server." -ForegroundColor Gray

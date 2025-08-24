# Restart and Test Script
Write-Host "🔄 Restarting Angel OS to fix Tasks performance..." -ForegroundColor Cyan

# Kill Node.js processes
Write-Host "1. Stopping Node.js processes..." -ForegroundColor Yellow
try {
    taskkill /F /IM node.exe 2>&1 | Out-Null
    Write-Host "   ✓ Processes stopped" -ForegroundColor Green
} catch {
    Write-Host "   ℹ No processes to stop" -ForegroundColor Gray
}

# Wait a moment
Start-Sleep -Seconds 2

# Start dev server
Write-Host "2. Starting development server..." -ForegroundColor Yellow
Start-Process -FilePath "pnpm" -ArgumentList "dev" -WindowStyle Hidden
Start-Sleep -Seconds 8

# Check if server is running
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

if ($port3000 -or $port3001) {
    $port = if ($port3000) { "3000" } else { "3001" }
    Write-Host "   ✓ Server running on port $port" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Ready to test!" -ForegroundColor Cyan
    Write-Host "Try accessing: http://localhost:$port/admin" -ForegroundColor Gray
    Write-Host "Navigate to Tasks collection to verify it loads properly." -ForegroundColor Gray
} else {
    Write-Host "   ❌ Server may not be ready yet" -ForegroundColor Red
    Write-Host "   Try running 'pnpm dev' manually" -ForegroundColor Gray
}


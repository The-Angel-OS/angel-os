# Angel OS Clean Migration Reset
# This script removes all migration files and lets Payload generate fresh schema

Write-Host "🧹 Angel OS Migration Cleanup" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Step 1: Remove all migration files
Write-Host "`n📋 Step 1: Removing migration files..." -ForegroundColor Yellow

$migrationPath = "src\migrations"
if (Test-Path $migrationPath) {
    Write-Host "🗑️ Removing migration files from $migrationPath..." -ForegroundColor Yellow
    
    # Remove all migration files but keep the directory
    Get-ChildItem $migrationPath -File | Remove-Item -Force
    
    # Create empty index.ts
    @"
// Empty migrations - fresh start
export const migrations = [];
"@ | Out-File -FilePath "$migrationPath\index.ts" -Encoding UTF8
    
    Write-Host "✅ Migration files cleaned!" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Migration directory not found." -ForegroundColor Blue
}

# Step 2: Remove generated schema cache
Write-Host "`n📋 Step 2: Removing schema cache..." -ForegroundColor Yellow

$cacheFiles = @(
    "src\payload-generated-schema.ts",
    ".payload-schema-cache",
    "src\payload-types.ts"
)

foreach ($file in $cacheFiles) {
    if (Test-Path $file) {
        Write-Host "🗑️ Removing: $file" -ForegroundColor Yellow
        Remove-Item $file -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Removed: $file" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Not found: $file" -ForegroundColor Blue
    }
}

# Step 3: Clean node_modules payload cache (if exists)
Write-Host "`n📋 Step 3: Cleaning payload cache..." -ForegroundColor Yellow
$payloadCache = "node_modules\.cache\payload"
if (Test-Path $payloadCache) {
    Remove-Item $payloadCache -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Payload cache cleaned!" -ForegroundColor Green
} else {
    Write-Host "ℹ️ No payload cache found." -ForegroundColor Blue
}

Write-Host "`n🎉 Migration cleanup complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "✅ All migration files removed" -ForegroundColor Green
Write-Host "✅ Schema cache cleared" -ForegroundColor Green
Write-Host "✅ Ready for fresh schema generation" -ForegroundColor Green

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Make sure your database is reset (run the SQL scripts)" -ForegroundColor White
Write-Host "2. Start dev server: pnpm dev" -ForegroundColor White
Write-Host "3. Payload will generate fresh schema automatically" -ForegroundColor White
Write-Host "4. Run seed: pnpm seed" -ForegroundColor White
Write-Host "`n💡 No more interactive prompts or migration conflicts!" -ForegroundColor Yellow

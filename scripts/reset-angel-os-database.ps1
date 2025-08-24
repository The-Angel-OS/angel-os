# Angel OS Database Reset Script
# This script will completely reset the database and start fresh

param(
    [string]$Host = "74.208.87.243",
    [string]$Port = "5432",
    [string]$SuperUser = "pgadmin",
    [switch]$SkipDatabaseReset,
    [switch]$SkipMigrationCleanup,
    [switch]$SkipSeed
)

Write-Host "🚀 Angel OS Database Reset Process" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Step 1: Reset Database (if not skipped)
if (-not $SkipDatabaseReset) {
    Write-Host "`n📋 Step 1: Resetting Database..." -ForegroundColor Yellow
    
    # Prompt for pgadmin password
    $SuperUserPassword = Read-Host "Enter password for PostgreSQL superuser ($SuperUser)" -AsSecureString
    $SuperUserPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($SuperUserPassword))
    
    # Set environment variable for password
    $env:PGPASSWORD = $SuperUserPasswordPlain
    
    try {
        Write-Host "🗑️ Dropping and recreating spaces_commerce database..." -ForegroundColor Yellow
        
        # Execute the database reset script
        $result = psql -h $Host -p $Port -U $SuperUser -d postgres -f "reset_database_clean.sql" 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database reset completed successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Database reset failed:" -ForegroundColor Red
            Write-Host $result
            exit 1
        }
    } catch {
        Write-Host "❌ Error during database reset: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    } finally {
        # Clear the password from environment
        Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "⏭️ Skipping database reset..." -ForegroundColor Yellow
}

# Step 2: Clean Migration History (if not skipped)
if (-not $SkipMigrationCleanup) {
    Write-Host "`n📋 Step 2: Cleaning Migration History..." -ForegroundColor Yellow
    
    # Remove migration files
    $migrationPath = "src\migrations"
    if (Test-Path $migrationPath) {
        Write-Host "🧹 Removing existing migration files..." -ForegroundColor Yellow
        Remove-Item "$migrationPath\*" -Force -Recurse -ErrorAction SilentlyContinue
        Write-Host "✅ Migration files cleaned!" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ No migration files found to clean." -ForegroundColor Blue
    }
    
    # Clean any cached schema files
    $schemaFiles = @(
        "src\payload-generated-schema.ts",
        ".payload-schema-cache"
    )
    
    foreach ($file in $schemaFiles) {
        if (Test-Path $file) {
            Write-Host "🧹 Removing cached schema: $file" -ForegroundColor Yellow
            Remove-Item $file -Force -ErrorAction SilentlyContinue
        }
    }
} else {
    Write-Host "⏭️ Skipping migration cleanup..." -ForegroundColor Yellow
}

# Step 3: Fresh Seed (if not skipped)
if (-not $SkipSeed) {
    Write-Host "`n📋 Step 3: Fresh Database Seeding..." -ForegroundColor Yellow
    
    # Check if dev server is running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/users/me" -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Dev server is running!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Dev server not detected. Starting it now..." -ForegroundColor Yellow
        Write-Host "💡 Please run 'pnpm dev' in another terminal, then press Enter to continue..." -ForegroundColor Cyan
        Read-Host
    }
    
    Write-Host "🌱 Running fresh seed..." -ForegroundColor Yellow
    
    try {
        # Run the seed via API
        $seedResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/seed" -Method POST -TimeoutSec 600
        
        if ($seedResponse.StatusCode -eq 200) {
            Write-Host "✅ Fresh seed completed successfully!" -ForegroundColor Green
            $responseContent = $seedResponse.Content | ConvertFrom-Json
            Write-Host "📋 Response: $($responseContent.message)" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Seed failed with status: $($seedResponse.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Error during seeding: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 You can manually run: pnpm seed" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️ Skipping fresh seed..." -ForegroundColor Yellow
}

Write-Host "`n🎉 Angel OS Database Reset Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "✅ Database: spaces_commerce (owner: vercel_user)" -ForegroundColor Green
Write-Host "✅ Migrations: Cleaned" -ForegroundColor Green
Write-Host "✅ Seed: Fresh data loaded" -ForegroundColor Green
Write-Host "`n🔗 Access your application:" -ForegroundColor Cyan
Write-Host "   Admin: http://localhost:3000/admin" -ForegroundColor White
Write-Host "   Login: kenneth.courtney@gmail.com / angelos" -ForegroundColor White
Write-Host "   Dashboard: http://localhost:3000/dashboard" -ForegroundColor White

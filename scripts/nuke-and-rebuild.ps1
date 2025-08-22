#!/usr/bin/env pwsh
# KenDev Spaces - Nuclear Database Reset & Rebuild
# Complete database wipe and fresh tenant provisioning

param(
    [Parameter(Mandatory=$false)]
    [string]$TenantName = "KenDev.Co",

    [Parameter(Mandatory=$false)]
    [string]$BusinessType = "service",

    [Parameter(Mandatory=$false)]
    [string]$Theme = "business",

    [Parameter(Mandatory=$false)]
    [string]$ServerUrl = "http://localhost:3000",

    [Parameter(Mandatory=$false)]
    [string]$Email,

    [Parameter(Mandatory=$false)]
    [string]$Password,

    [Parameter(Mandatory=$false)]
    [switch]$Force = $false
)

Write-Host "💥 KenDev Spaces - NUCLEAR DATABASE RESET" -ForegroundColor Red
Write-Host "=========================================" -ForegroundColor Red
Write-Host ""
Write-Host "⚠️  WARNING: This will COMPLETELY DESTROY all database content!" -ForegroundColor Yellow
Write-Host ("🌐 API: {0}" -f $ServerUrl) -ForegroundColor Cyan
Write-Host ("🏢 New Tenant: {0} ({1})" -f $TenantName, $BusinessType) -ForegroundColor Green
Write-Host ""

if (-not $Force) {
    $confirmation = Read-Host "Type 'NUKE' to proceed with complete database destruction"
    if ($confirmation -ne "NUKE") {
        Write-Host "❌ Operation cancelled" -ForegroundColor Red
        exit 1
    }
}

# Helper: Authenticate and get JWT token
function Get-AuthToken {
    param(
        [string]$BaseUrl,
        [string]$Email,
        [string]$Password
    )
    if (-not $Email -or -not $Password) {
        throw "Email and Password are required to authenticate for reseed."
    }
    $loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json
    $resp = Invoke-RestMethod -Uri "$BaseUrl/api/users/login" -Method POST -ContentType "application/json" -Body $loginBody -ErrorAction Stop
    return $resp.token
}

Write-Host "🔥 NUCLEAR RESET SEQUENCE INITIATED..." -ForegroundColor Red
Write-Host ""

# Step 1: Database destruction via API (authenticated)
Write-Host "💣 Step 1: Nuclear database reset..." -ForegroundColor Yellow
try {
    $token = Get-AuthToken -BaseUrl $ServerUrl -Email $Email -Password $Password
    $headers = @{ Authorization = "Bearer $token" }
    $resetBody = @{ mode = "reset"; tenant = "kendevco"; force = $true } | ConvertTo-Json
    $resetResponse = Invoke-RestMethod -Uri "$ServerUrl/api/reseed" -Method POST -Headers $headers -Body $resetBody -ContentType "application/json"

    if ($resetResponse.success) {
        Write-Host "✅ Database nuked successfully!" -ForegroundColor Green
    } else {
        throw "Reset failed: $($resetResponse.error)"
    }
} catch {
    Write-Host ("❌ API reset failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
    Write-Host "📋 Manual instructions:" -ForegroundColor Yellow
    Write-Host "   1. DROP SCHEMA public CASCADE;" -ForegroundColor Gray
    Write-Host "   2. CREATE SCHEMA public;" -ForegroundColor Gray
    Read-Host "Press Enter to continue after manual cleanup..."
}

# Step 2: Schema regeneration
Write-Host "🔄 Step 2: Regenerating clean schema..." -ForegroundColor Yellow
pnpm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Schema regenerated!" -ForegroundColor Green
} else {
    Write-Host "❌ Schema regeneration failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Provision first tenant
Write-Host "🚀 Step 3: Provisioning first tenant: $TenantName..." -ForegroundColor Yellow

$slug = $TenantName.ToLower() -replace '[^a-z0-9\s-]', '' -replace '\s+', '-' -replace '-+', '-'
$slug = $slug.Trim('-')

try {
    if (-not $token) { $token = Get-AuthToken -BaseUrl $ServerUrl -Email $Email -Password $Password }
    $headers = @{ Authorization = "Bearer $token" }
    $provBody = @{
        action = "provision"
        tenantData = @{
            name = $TenantName
            slug = $slug
            businessType = $BusinessType
            theme = $Theme
            features = @("basic", "spaces", "ecommerce")
        }
    } | ConvertTo-Json -Depth 4
    $tenantResponse = Invoke-RestMethod -Uri "$ServerUrl/api/tenant-control" -Method POST -Headers $headers -Body $provBody -ContentType "application/json"

    if ($tenantResponse.success) {
        Write-Host "🎉 NUCLEAR RESET COMPLETE!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌟 Fresh Tenant Details:" -ForegroundColor Blue
        Write-Host "   📛 Name: $($tenantResponse.tenant.name)" -ForegroundColor White
        Write-Host "   🌐 URL: $($tenantResponse.tenant.previewUrl)" -ForegroundColor Cyan
        Write-Host "   🆔 ID: $($tenantResponse.tenant.id)" -ForegroundColor Gray
        Write-Host "   📦 Space ID: $($tenantResponse.tenant.spaceId)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🚀 Ready for: pnpm dev" -ForegroundColor Green
    } else {
        throw "Tenant provisioning failed: $($tenantResponse.error)"
    }
} catch {
    Write-Host "❌ Tenant provisioning failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "💫 Nuclear reset successful! Database is pristine and ready." -ForegroundColor Green

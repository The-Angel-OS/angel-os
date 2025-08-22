#!/usr/bin/env pwsh

param(
    [Parameter(Mandatory=$false)]
    [string]$Action,

    [Parameter(Mandatory=$false)]
    [string]$Name,

    [Parameter(Mandatory=$false)]
    [string]$BusinessType,

    [Parameter(Mandatory=$false)]
    [string]$Theme = "default",

    [Parameter(Mandatory=$false)]
    [string]$TenantId
)

$ApiUrl = "http://localhost:3000/api/tenant-control"

function Invoke-TenantRequest {
    param(
        [hashtable]$Data
    )

    try {
        $jsonData = $Data | ConvertTo-Json -Depth 10
        $response = Invoke-RestMethod -Uri $ApiUrl -Method POST -Body $jsonData -ContentType "application/json"
        return $response
    }
    catch {
        Write-Error "Request failed: $($_.Exception.Message)"
        Write-Host "💡 Make sure the development server is running on localhost:3000" -ForegroundColor Yellow
        return $null
    }
}

function New-Tenant {
    param(
        [string]$Name,
        [string]$BusinessType,
        [string]$Theme = "default"
    )

    $slug = $Name.ToLower() -replace '[^a-z0-9\s-]', '' -replace '\s+', '-' -replace '-+', '-'
    $slug = $slug.Trim('-')

    $tenantData = @{
        name = $Name
        slug = $slug
        businessType = $BusinessType
        theme = $Theme
        features = @("basic")
    }

    Write-Host "🚀 Provisioning tenant: $Name" -ForegroundColor Green
    Write-Host "📍 Will be accessible at: $slug.spaces.kendev.co" -ForegroundColor Cyan

    $requestData = @{
        action = "provision"
        tenantData = $tenantData
    }

    $response = Invoke-TenantRequest -Data $requestData

    if ($response -and $response.success) {
        Write-Host "✅ Tenant provisioned successfully!" -ForegroundColor Green
        Write-Host "🌐 Access URL: $($response.tenant.previewUrl)" -ForegroundColor Cyan
        Write-Host "🆔 Tenant ID: $($response.tenant.id)" -ForegroundColor Yellow
        Write-Host "📦 Space ID: $($response.tenant.spaceId)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📋 Next Steps:" -ForegroundColor Blue
        if ($response.nextSteps) {
            for ($i = 0; $i -lt $response.nextSteps.Count; $i++) {
                Write-Host "   $($i + 1). $($response.nextSteps[$i])" -ForegroundColor White
            }
        }
    }
    elseif ($response) {
        Write-Host "❌ Provisioning failed: $($response.error)" -ForegroundColor Red
        if ($response.details) {
            Write-Host "Details: $($response.details)" -ForegroundColor Red
        }
    }
}

function Get-TenantList {
    Write-Host "📋 Fetching tenant list..." -ForegroundColor Yellow

    $requestData = @{
        action = "list"
    }

    $response = Invoke-TenantRequest -Data $requestData

    if ($response -and $response.success) {
        Write-Host ""
        Write-Host "📊 Found $($response.total) tenants:" -ForegroundColor Green
        Write-Host "   🟢 Active: $($response.summary.active)" -ForegroundColor Green
        Write-Host "   🟡 Provisioning: $($response.summary.provisioning)" -ForegroundColor Yellow
        Write-Host "   🔴 Errors: $($response.summary.error)" -ForegroundColor Red

        if ($response.tenants.Count -gt 0) {
            Write-Host ""
            Write-Host "🏢 Tenant Details:" -ForegroundColor Blue
            for ($i = 0; $i -lt $response.tenants.Count; $i++) {
                $tenant = $response.tenants[$i]
                Write-Host "   $($i + 1). $($tenant.name)" -ForegroundColor White
                Write-Host "      🌐 $($tenant.domain)" -ForegroundColor Cyan
                Write-Host "      📊 Status: $($tenant.status)" -ForegroundColor Yellow
                Write-Host "      🏷️  Type: $($tenant.businessType)" -ForegroundColor Magenta
                Write-Host "      📅 Created: $([DateTime]::Parse($tenant.createdAt).ToString('yyyy-MM-dd'))" -ForegroundColor Gray
                Write-Host ""
            }
        }
    }
    elseif ($response) {
        Write-Host "❌ Failed to list tenants: $($response.error)" -ForegroundColor Red
    }
}

function Remove-Tenant {
    param(
        [string]$TenantId
    )

    Write-Host "🗑️  Deprovisioning tenant: $TenantId" -ForegroundColor Yellow

    $requestData = @{
        action = "deprovision"
        tenantId = $TenantId
    }

    $response = Invoke-TenantRequest -Data $requestData

    if ($response -and $response.success) {
        Write-Host "✅ Tenant deprovisioned successfully!" -ForegroundColor Green
        Write-Host "📋 $($response.message)" -ForegroundColor White
    }
    elseif ($response) {
        Write-Host "❌ Deprovisioning failed: $($response.error)" -ForegroundColor Red
    }
}

function Show-Help {
    Write-Host "🏢 Spaces Tenant Provisioning Tool (PowerShell)" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\provision-tenant.ps1 -Action provision -Name 'Business Name' -BusinessType type [-Theme theme]"
    Write-Host "  .\provision-tenant.ps1 -Action list"
    Write-Host "  .\provision-tenant.ps1 -Action deprovision -TenantId <tenant-id>"
    Write-Host ""
    Write-Host "Business Types:" -ForegroundColor Yellow
    Write-Host "  pizza, restaurant, retail, service, content_creator, cactus_farm, general"
    Write-Host ""
    Write-Host "Themes:" -ForegroundColor Yellow
    Write-Host "  default, business, creative, minimal"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  .\provision-tenant.ps1 -Action provision -Name 'Joe`'s Pizza' -BusinessType pizza -Theme business"
    Write-Host "  .\provision-tenant.ps1 -Action provision -Name 'Hays Cactus Farm' -BusinessType cactus_farm"
    Write-Host "  .\provision-tenant.ps1 -Action list"
    Write-Host ""
    Write-Host "Quick Commands:" -ForegroundColor Cyan
    Write-Host "  # Provision a pizza shop"
    Write-Host "  .\provision-tenant.ps1 provision 'Joe`'s Pizza' pizza business"
    Write-Host ""
    Write-Host "  # List all tenants"
    Write-Host "  .\provision-tenant.ps1 list"
}

# Main execution logic
if (-not $Action) {
    Show-Help
    exit
}

switch ($Action.ToLower()) {
    "provision" {
        if (-not $Name -or -not $BusinessType) {
            Write-Host "❌ Missing required parameters: Name and BusinessType" -ForegroundColor Red
            Write-Host "Usage: .\provision-tenant.ps1 -Action provision -Name 'Business Name' -BusinessType type" -ForegroundColor Yellow
            exit 1
        }
        New-Tenant -Name $Name -BusinessType $BusinessType -Theme $Theme
    }

    "list" {
        Get-TenantList
    }

    "deprovision" {
        if (-not $TenantId) {
            Write-Host "❌ Missing required parameter: TenantId" -ForegroundColor Red
            Write-Host "Usage: .\provision-tenant.ps1 -Action deprovision -TenantId <tenant-id>" -ForegroundColor Yellow
            exit 1
        }
        Remove-Tenant -TenantId $TenantId
    }

    default {
        # Handle positional arguments for quick usage
        if ($args.Count -eq 0) {
            Write-Host "❌ Unknown action: $Action" -ForegroundColor Red
            Write-Host "Available actions: provision, list, deprovision" -ForegroundColor Yellow
            Show-Help
        } else {
            # Quick provision: provision-tenant.ps1 provision "Name" type [theme]
            $Name = $args[0]
            $BusinessType = $args[1]
            $Theme = if ($args[2]) { $args[2] } else { "default" }

            if ($Name -and $BusinessType) {
                New-Tenant -Name $Name -BusinessType $BusinessType -Theme $Theme
            } else {
                Show-Help
            }
        }
    }
}

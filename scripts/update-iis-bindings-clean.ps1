# PowerShell Script: Update IIS Site Bindings
# Purpose: Updates all IIS site bindings to use a specific IP address
# Usage: Run as Administrator in PowerShell

# Import WebAdministration module
Import-Module WebAdministration

# Set the target IP address
$targetIP = "74.208.87.243"

Write-Host "=== IIS Binding Update Script ===" -ForegroundColor Green
Write-Host "Target IP Address: $targetIP" -ForegroundColor Yellow
Write-Host "Starting binding updates..." -ForegroundColor Yellow
Write-Host ""

# Check if WebAdministration module is available
if (-not (Get-Module -Name WebAdministration -ListAvailable)) {
    Write-Error "WebAdministration module is not available. Please ensure IIS Management Tools are installed."
    exit 1
}

# Get all sites and their bindings
$sites = Get-Website
if (-not $sites) {
    Write-Warning "No IIS sites found."
    exit 0
}

foreach ($site in $sites) {
    $siteName = $site.Name
    Write-Host "Processing site: $siteName" -ForegroundColor Cyan

    # Get current bindings
    $bindings = Get-WebBinding -Name $siteName

    if (-not $bindings) {
        Write-Warning "  No bindings found for site: $siteName"
        continue
    }

    foreach ($binding in $bindings) {
        try {
            # Parse binding information
            $bindingInfo = $binding.bindingInformation.Split(':')
            $currentIP = $bindingInfo[0]
            $port = $bindingInfo[1]
            $hostHeader = $bindingInfo[2]
            $protocol = $binding.protocol

            # Skip if already using target IP
            if ($currentIP -eq $targetIP) {
                Write-Host "  ✓ Already using target IP - $protocol on $targetIP`:$port ($hostHeader)" -ForegroundColor Green
                continue
            }

            Write-Host "  Updating - $protocol on $currentIP`:$port ($hostHeader)" -ForegroundColor Yellow

            # Remove old binding
            Remove-WebBinding -Name $siteName -Protocol $protocol -Port $port -HostHeader $hostHeader -IPAddress $currentIP -ErrorAction Stop

            # Add new binding with specific IP
            New-WebBinding -Name $siteName -Protocol $protocol -Port $port -IPAddress $targetIP -HostHeader $hostHeader -ErrorAction Stop

            Write-Host "  ✓ Updated - $protocol on $targetIP`:$port ($hostHeader)" -ForegroundColor Green

        } catch {
            Write-Error "  ✗ Failed to update binding: $($_.Exception.Message)"
        }
    }

    Write-Host ""
}

Write-Host "=== Binding Update Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Summary of updated sites:" -ForegroundColor Yellow
Get-Website | ForEach-Object {
    $siteName = $_.Name
    $bindings = Get-WebBinding -Name $siteName
    Write-Host "  $siteName" -ForegroundColor Cyan
    foreach ($binding in $bindings) {
        $bindingInfo = $binding.bindingInformation
        $protocol = $binding.protocol
        Write-Host "    - $protocol - $bindingInfo" -ForegroundColor White
    }
}

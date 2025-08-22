# Angel OS Multi-Tenant Hosts File Setup
# Run as Administrator to modify the Windows hosts file

param(
    [switch]$Add,
    [switch]$Remove,
    [switch]$List,
    [string]$TenantSlug = "",
    [switch]$Help
)

$hostsFile = "C:\Windows\System32\drivers\etc\hosts"
$backupFile = "C:\Windows\System32\drivers\etc\hosts.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Angel OS domain entries
$angelOSDomains = @(
    "# Angel OS Multi-Tenant Testing Domains",
    "127.0.0.1 kendev.localhost",
    "127.0.0.1 spaces.kendev.localhost",
    "127.0.0.1 admin.kendev.localhost",
    "127.0.0.1 api.kendev.localhost",
    "",
    "# Tenant Testing Domains",
    "127.0.0.1 test1.kendev.localhost",
    "127.0.0.1 test2.kendev.localhost", 
    "127.0.0.1 demo.kendev.localhost",
    "127.0.0.1 staging.kendev.localhost",
    "127.0.0.1 dev.kendev.localhost",
    "",
    "# Business Testing Domains",
    "127.0.0.1 hayscactus.localhost",
    "127.0.0.1 example-business.localhost",
    "127.0.0.1 client-site.localhost",
    "127.0.0.1 restaurant.localhost",
    "127.0.0.1 salon.localhost",
    ""
)

function Show-Help {
    Write-Host "Angel OS Multi-Tenant Hosts File Manager" -ForegroundColor Cyan
    Write-Host "=======================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\setup-hosts-file.ps1 -Add              # Add all Angel OS domains"
    Write-Host "  .\setup-hosts-file.ps1 -Remove           # Remove Angel OS domains"
    Write-Host "  .\setup-hosts-file.ps1 -List             # List current hosts entries"
    Write-Host "  .\setup-hosts-file.ps1 -Add -TenantSlug 'myclient'  # Add specific tenant"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  # Setup for multi-tenant testing"
    Write-Host "  .\setup-hosts-file.ps1 -Add"
    Write-Host ""
    Write-Host "  # Add custom tenant domain"
    Write-Host "  .\setup-hosts-file.ps1 -Add -TenantSlug 'hayscactus'"
    Write-Host ""
    Write-Host "Note: Must run as Administrator to modify hosts file" -ForegroundColor Red
}

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Backup-HostsFile {
    if (Test-Path $hostsFile) {
        Copy-Item $hostsFile $backupFile
        Write-Host "✅ Hosts file backed up to: $backupFile" -ForegroundColor Green
    }
}

function Add-AngelOSDomains {
    param([string]$CustomTenant = "")
    
    if (!(Test-Administrator)) {
        Write-Host "❌ Error: Must run as Administrator to modify hosts file" -ForegroundColor Red
        Write-Host "Right-click PowerShell and 'Run as Administrator'" -ForegroundColor Yellow
        exit 1
    }

    Backup-HostsFile
    
    $currentContent = Get-Content $hostsFile -ErrorAction SilentlyContinue
    $newContent = @()
    
    # Remove existing Angel OS entries
    $inAngelOSSection = $false
    foreach ($line in $currentContent) {
        if ($line -eq "# Angel OS Multi-Tenant Testing Domains") {
            $inAngelOSSection = $true
            continue
        }
        if ($inAngelOSSection -and $line.StartsWith("#") -and $line -ne "# Angel OS Multi-Tenant Testing Domains" -and $line -ne "# Tenant Testing Domains" -and $line -ne "# Business Testing Domains") {
            $inAngelOSSection = $false
        }
        if (!$inAngelOSSection) {
            $newContent += $line
        }
    }
    
    # Add Angel OS domains
    $newContent += ""
    $newContent += $angelOSDomains
    
    # Add custom tenant if specified
    if ($CustomTenant) {
        $newContent += "# Custom Tenant: $CustomTenant"
        $newContent += "127.0.0.1 $CustomTenant.kendev.localhost"
        $newContent += "127.0.0.1 $CustomTenant.localhost"
        $newContent += "127.0.0.1 dev-$CustomTenant.localhost"
        $newContent += ""
    }
    
    # Write updated content
    $newContent | Out-File $hostsFile -Encoding ASCII
    
    Write-Host "✅ Angel OS domains added to hosts file" -ForegroundColor Green
    if ($CustomTenant) {
        Write-Host "✅ Custom tenant '$CustomTenant' domains added" -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "🌐 Available test domains:" -ForegroundColor Cyan
    $angelOSDomains | Where-Object { $_ -match "127.0.0.1" } | ForEach-Object {
        $domain = ($_ -split "\s+")[1]
        Write-Host "   http://$domain:3000" -ForegroundColor White
    }
}

function Remove-AngelOSDomains {
    if (!(Test-Administrator)) {
        Write-Host "❌ Error: Must run as Administrator to modify hosts file" -ForegroundColor Red
        exit 1
    }

    Backup-HostsFile
    
    $currentContent = Get-Content $hostsFile -ErrorAction SilentlyContinue
    $newContent = @()
    
    # Remove Angel OS entries
    $inAngelOSSection = $false
    foreach ($line in $currentContent) {
        if ($line -eq "# Angel OS Multi-Tenant Testing Domains") {
            $inAngelOSSection = $true
            continue
        }
        if ($inAngelOSSection -and $line.StartsWith("#") -and $line -ne "# Angel OS Multi-Tenant Testing Domains" -and $line -ne "# Tenant Testing Domains" -and $line -ne "# Business Testing Domains") {
            $inAngelOSSection = $false
        }
        if (!$inAngelOSSection) {
            $newContent += $line
        }
    }
    
    $newContent | Out-File $hostsFile -Encoding ASCII
    Write-Host "✅ Angel OS domains removed from hosts file" -ForegroundColor Green
}

function List-HostsEntries {
    Write-Host "Current hosts file entries:" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    Get-Content $hostsFile | ForEach-Object { Write-Host $_ }
}

# Main execution
if ($Help) {
    Show-Help
    exit 0
}

if ($Add) {
    Add-AngelOSDomains -CustomTenant $TenantSlug
} elseif ($Remove) {
    Remove-AngelOSDomains
} elseif ($List) {
    List-HostsEntries
} else {
    Show-Help
}


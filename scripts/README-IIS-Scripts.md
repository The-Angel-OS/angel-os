# IIS Binding Update Scripts

## Overview
This directory contains PowerShell scripts for managing IIS site bindings, specifically for updating all site bindings to use a specific IP address.

## Files
- `update-iis-bindings.ps1` - Main PowerShell script for updating IIS bindings
- `update-iis-bindings-clean.ps1` - Alternative version with improved formatting

## Prerequisites

### 1. Administrative Privileges
You must run PowerShell as Administrator to modify IIS bindings.

### 2. IIS Management Tools
Ensure IIS Management Tools are installed:
```powershell
# Check if WebAdministration module is available
Get-Module -Name WebAdministration -ListAvailable
```

### 3. Execution Policy
Set PowerShell execution policy to allow script execution:
```powershell
# Run as Administrator
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Usage

### Method 1: Direct Execution
```powershell
# Navigate to scripts directory
cd C:\Dev\spaces-commerce\scripts

# Run the script
.\update-iis-bindings-clean.ps1
```

### Method 2: Bypass Execution Policy (One-time)
```powershell
PowerShell -ExecutionPolicy Bypass -File "C:\Dev\spaces-commerce\scripts\update-iis-bindings-clean.ps1"
```

### Method 3: Copy to Temp Directory
```powershell
# Copy script to temp directory
Copy-Item ".\scripts\update-iis-bindings-clean.ps1" -Destination "C:\temp\"

# Run from temp
C:\temp\update-iis-bindings-clean.ps1
```

## Script Configuration

### Target IP Address
The script is currently configured to update bindings to IP: **74.208.87.243**

To change the target IP, edit the script and modify this line:
```powershell
$targetIP = "74.208.87.243"  # Change this to your desired IP
```

## What the Script Does

1. **Imports WebAdministration Module** - Required for IIS management
2. **Enumerates All IIS Sites** - Gets all websites configured in IIS
3. **Processes Each Site's Bindings** - Examines current binding configuration
4. **Updates Bindings** - Removes old bindings and creates new ones with target IP
5. **Provides Feedback** - Shows progress and results with color-coded output

## Script Output

The script provides detailed feedback:
- **Green** ✓ - Successful operations or already correct bindings
- **Yellow** - Operations in progress
- **Red** ✗ - Errors or failures
- **Cyan** - Site names being processed
- **White** - Detailed binding information

## Example Output
```
=== IIS Binding Update Script ===
Target IP Address: 74.208.87.243
Starting binding updates...

Processing site: Default Web Site
  Updating - http on *:80 port 80
  ✓ Updated - http on 74.208.87.243 port 80
  ✓ Already using target IP - https on 74.208.87.243 port 443

Processing site: MyApp
  Updating - http on *:8080 port 8080 (host: myapp.local)
  ✓ Updated - http on 74.208.87.243 port 8080 (host: myapp.local)

=== Binding Update Complete ===

Summary of updated sites:
  Site: Default Web Site
    http binding: 74.208.87.243:80:
    https binding: 74.208.87.243:443:
  Site: MyApp
    http binding: 74.208.87.243:8080:myapp.local
```

## Troubleshooting

### Error: "WebAdministration module is not available"
**Solution**: Install IIS Management Tools
```powershell
# Enable IIS Management Tools via Windows Features
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerManagementTools
```

### Error: "Execution policy restricts script execution"
**Solution**: Set execution policy or use bypass method shown above

### Error: "Access Denied"
**Solution**: Run PowerShell as Administrator

### Error: "Cannot remove binding"
**Solution**: Check if binding is in use or if there are dependent applications

## Safety Notes

⚠️ **Warning**: This script modifies IIS configuration. Always:
1. **Backup IIS configuration** before running
2. **Test in development environment** first
3. **Verify applications work** after binding changes
4. **Have rollback plan** ready

### Backup IIS Configuration
```powershell
# Backup IIS configuration
$backupName = "IIS-Backup-$(Get-Date -Format 'yyyy-MM-dd-HHmm')"
Backup-WebConfiguration -Name $backupName
Write-Host "IIS configuration backed up as: $backupName"
```

### Restore IIS Configuration (if needed)
```powershell
# List available backups
Get-WebConfigurationBackup

# Restore specific backup
Restore-WebConfiguration -Name "IIS-Backup-2024-01-15-1430"
```

## Related Commands

### List Current Bindings
```powershell
# Show all current bindings
Get-Website | ForEach-Object {
    $siteName = $_.Name
    Write-Host "Site: $siteName"
    Get-WebBinding -Name $siteName | ForEach-Object {
        Write-Host "  $($_.protocol): $($_.bindingInformation)"
    }
}
```

### Manually Add/Remove Bindings
```powershell
# Add new binding
New-WebBinding -Name "Default Web Site" -Protocol http -Port 8080 -IPAddress "74.208.87.243"

# Remove binding
Remove-WebBinding -Name "Default Web Site" -Protocol http -Port 8080 -IPAddress "74.208.87.243"
```

This script is designed for server migration scenarios where you need to update all IIS bindings to point to a new IP address efficiently. 
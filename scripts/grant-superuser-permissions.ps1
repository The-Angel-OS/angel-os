# PowerShell script to grant superuser permissions to vercel_user
# Run this script as an administrator or with a PostgreSQL superuser account

param(
    [string]$Host = "74.208.87.243",
    [string]$Port = "5432",
    [string]$Database = "spaces_commerce",
    [string]$SuperUser = "postgres",
    [string]$TargetUser = "vercel_user"
)

Write-Host "Granting superuser permissions to $TargetUser on $Database..." -ForegroundColor Yellow

# Check if psql is available
try {
    $psqlVersion = psql --version
    Write-Host "Found PostgreSQL client: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: psql command not found. Please install PostgreSQL client tools." -ForegroundColor Red
    exit 1
}

# Prompt for superuser password
$SuperUserPassword = Read-Host "Enter password for PostgreSQL superuser ($SuperUser)" -AsSecureString
$SuperUserPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($SuperUserPassword))

# Set environment variable for password
$env:PGPASSWORD = $SuperUserPasswordPlain

try {
    Write-Host "Connecting to database and executing permission grants..." -ForegroundColor Yellow
    
    # Execute the SQL script
    $result = psql -h $Host -p $Port -U $SuperUser -d $Database -f "grant_superuser_permissions.sql" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully granted superuser permissions to $TargetUser!" -ForegroundColor Green
        Write-Host "Output:" -ForegroundColor Cyan
        Write-Host $result
    } else {
        Write-Host "Error executing SQL script:" -ForegroundColor Red
        Write-Host $result
        exit 1
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Clear the password from environment
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "`nPermission grant completed. The vercel_user should now have superuser privileges." -ForegroundColor Green
Write-Host "You can now retry your application startup." -ForegroundColor Yellow


@echo off
REM Backup and update PostgreSQL pg_hba.conf for Vercel access
REM Run as Administrator

set PG_DATA_DIR=C:\Program Files\PostgreSQL\17\data
set PG_HBA_FILE=%PG_DATA_DIR%\pg_hba.conf
set BACKUP_FILE=%PG_DATA_DIR%\pg_hba.conf.backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%

echo Backing up pg_hba.conf...
copy "%PG_HBA_FILE%" "%BACKUP_FILE%"

echo.
echo Adding Vercel SSL connection rule...
echo # Vercel connections - SSL required >> "%PG_HBA_FILE%"
echo hostssl   all   vercel_user   0.0.0.0/0   scram-sha-256 >> "%PG_HBA_FILE%"

echo.
echo Reloading PostgreSQL configuration...
"C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" reload -D "%PG_DATA_DIR%"

echo.
echo Done! Vercel should now be able to connect via SSL.
echo Backup saved as: %BACKUP_FILE%
pause

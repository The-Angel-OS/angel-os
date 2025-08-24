-- Step 1: Terminate all connections to spaces_commerce database
-- Run this first while connected to postgres database

SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'spaces_commerce' 
  AND pid <> pg_backend_pid();

SELECT 'All connections to spaces_commerce terminated' AS status;

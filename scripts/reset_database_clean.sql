-- Angel OS Database Reset Script
-- Run this with pgadmin user to completely reset the spaces_commerce database
-- This will drop everything and start fresh

-- IMPORTANT: In pgAdmin, you need to run each command separately or disable auto-commit
-- Go to File > Preferences > SQL Editor > Auto commit? = OFF
-- Or run each command block separately

-- Step 1: Terminate all connections to the database (except current one)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'spaces_commerce' 
  AND pid <> pg_backend_pid();

-- Step 2: Drop the database if it exists (run this separately)
-- DROP DATABASE IF EXISTS spaces_commerce;

-- Step 3: Create fresh database with vercel_user as owner (run this separately)
-- CREATE DATABASE spaces_commerce
--     WITH 
--     OWNER = vercel_user
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'en_US.UTF-8'
--     LC_CTYPE = 'en_US.UTF-8'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1
--     IS_TEMPLATE = False;

-- Grant all privileges to vercel_user on the database
GRANT ALL PRIVILEGES ON DATABASE spaces_commerce TO vercel_user;

-- Display confirmation
SELECT 
    'Database spaces_commerce created successfully' AS status,
    'vercel_user is now the owner' AS ownership;

-- Show database ownership
SELECT 
    d.datname as database_name,
    r.rolname as owner
FROM pg_database d
JOIN pg_roles r ON d.datdba = r.oid
WHERE d.datname = 'spaces_commerce';

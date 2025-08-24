-- Step 3: Create fresh spaces_commerce database with vercel_user as owner
-- Run this while connected to postgres database
-- IMPORTANT: This must be run as a single statement, not in a transaction

CREATE DATABASE spaces_commerce
    WITH 
    OWNER = vercel_user
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- Grant additional privileges
GRANT ALL PRIVILEGES ON DATABASE spaces_commerce TO vercel_user;

-- Show confirmation
SELECT 
    d.datname as database_name,
    r.rolname as owner,
    'Database created successfully' as status
FROM pg_database d
JOIN pg_roles r ON d.datdba = r.oid
WHERE d.datname = 'spaces_commerce';

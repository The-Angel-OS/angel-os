-- Angel OS Database Permissions Setup
-- Run this script AFTER connecting to the spaces_commerce database in pgAdmin
-- This sets up the proper permissions for vercel_user within the database

-- Grant all privileges on schema public to vercel_user
GRANT ALL PRIVILEGES ON SCHEMA public TO vercel_user;

-- Make vercel_user owner of public schema
ALTER SCHEMA public OWNER TO vercel_user;

-- Set default privileges for future objects created by any user
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO vercel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO vercel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO vercel_user;

-- Set default privileges for objects created by vercel_user
ALTER DEFAULT PRIVILEGES FOR USER vercel_user IN SCHEMA public GRANT ALL ON TABLES TO vercel_user;
ALTER DEFAULT PRIVILEGES FOR USER vercel_user IN SCHEMA public GRANT ALL ON SEQUENCES TO vercel_user;
ALTER DEFAULT PRIVILEGES FOR USER vercel_user IN SCHEMA public GRANT ALL ON FUNCTIONS TO vercel_user;

-- Ensure vercel_user can create objects
GRANT CREATE ON SCHEMA public TO vercel_user;
GRANT USAGE ON SCHEMA public TO vercel_user;

-- Display confirmation
SELECT 
    'Schema permissions configured successfully' AS status,
    current_database() AS current_db,
    current_user AS current_user;

-- Show schema ownership
SELECT 
    nspname as schema_name,
    nspowner::regrole as owner
FROM pg_namespace 
WHERE nspname = 'public';

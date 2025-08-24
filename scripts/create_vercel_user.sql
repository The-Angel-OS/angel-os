-- Create Vercel database user with limited permissions
-- Run this in pgAdmin or psql as a superuser

-- Create the user (replace 'your_strong_password' with actual password)
CREATE USER vercel_user WITH PASSWORD 'your_strong_password';

-- Grant basic connection rights
GRANT CONNECT ON DATABASE postgres TO vercel_user;
GRANT USAGE ON SCHEMA public TO vercel_user;

-- Grant table permissions (adjust database name if different)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO vercel_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO vercel_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO vercel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO vercel_user;

-- If you have a specific database name, also grant on that:
-- GRANT CONNECT ON DATABASE your_database_name TO vercel_user;
-- \c your_database_name
-- GRANT USAGE ON SCHEMA public TO vercel_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO vercel_user;

SELECT 'Vercel user created successfully!' as result;

-- Grant superuser permissions to vercel_user on spaces_commerce database
-- This script should be run by a database superuser (like postgres user)

-- Connect to the spaces_commerce database
\c spaces_commerce;

-- Grant superuser role to vercel_user (if not already granted)
ALTER USER vercel_user WITH SUPERUSER;

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE spaces_commerce TO vercel_user;

-- Grant all privileges on all tables in public schema
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vercel_user;

-- Grant all privileges on all sequences in public schema
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vercel_user;

-- Grant all privileges on all functions in public schema
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO vercel_user;

-- Grant usage and create on schema
GRANT USAGE, CREATE ON SCHEMA public TO vercel_user;

-- Make vercel_user owner of all existing tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' OWNER TO vercel_user';
    END LOOP;
END $$;

-- Make vercel_user owner of all existing sequences
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT sequencename FROM pg_sequences WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ALTER SEQUENCE public.' || quote_ident(r.sequencename) || ' OWNER TO vercel_user';
    END LOOP;
END $$;

-- Make vercel_user owner of all existing types (including enums)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT typname FROM pg_type t 
             JOIN pg_namespace n ON t.typnamespace = n.oid 
             WHERE n.nspname = 'public' AND t.typtype = 'e'
    LOOP
        EXECUTE 'ALTER TYPE public.' || quote_ident(r.typname) || ' OWNER TO vercel_user';
    END LOOP;
END $$;

-- Grant default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO vercel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO vercel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO vercel_user;

-- Specifically handle the problematic enum type
ALTER TYPE public.enum_channels_channel_type OWNER TO vercel_user;

COMMIT;

-- Display confirmation
SELECT 'Superuser permissions granted to vercel_user on spaces_commerce database' AS status;


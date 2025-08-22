-- Create spaces_commerce_user for local development
CREATE USER spaces_commerce_user WITH PASSWORD 'SpacesCommerce2024!';

-- Grant all privileges on the database
GRANT ALL PRIVILEGES ON DATABASE spaces_commerce_dev TO spaces_commerce_user;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO spaces_commerce_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO spaces_commerce_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO spaces_commerce_user;

-- Ensure future objects are also granted
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO spaces_commerce_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO spaces_commerce_user;

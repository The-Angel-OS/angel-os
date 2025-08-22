-- Fix product status enum to match collection definition
-- Run this in pgAdmin4 or psql to fix the enum mismatch

-- First, check current enum values
-- SELECT unnest(enum_range(NULL::enum_products_status));

-- Drop and recreate the enum with correct values
BEGIN;

-- Create new enum with correct values
CREATE TYPE enum_products_status_new AS ENUM ('draft', 'active', 'archived', 'out_of_stock');

-- Update the products table to use new enum
ALTER TABLE products 
  ALTER COLUMN status TYPE enum_products_status_new 
  USING status::text::enum_products_status_new;

-- Drop old enum
DROP TYPE enum_products_status;

-- Rename new enum to original name
ALTER TYPE enum_products_status_new RENAME TO enum_products_status;

COMMIT;

-- Verify the fix
SELECT unnest(enum_range(NULL::enum_products_status)) AS valid_status_values;


-- Step 2: Drop the spaces_commerce database
-- Run this while connected to postgres database
-- IMPORTANT: This must be run as a single statement, not in a transaction

DROP DATABASE IF EXISTS spaces_commerce;

SELECT 'Database spaces_commerce dropped successfully' AS status;

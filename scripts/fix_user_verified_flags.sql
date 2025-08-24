-- Fix verified flags for existing users in Angel OS
-- Run this in pgAdmin to enable login for seeded users

-- Update Kenneth Courtney's account to be verified
UPDATE users 
SET 
    "_verified" = true,
    "updatedAt" = NOW()
WHERE email = 'kenneth.courtney@gmail.com';

-- Update demo author account to be verified (if it exists)
UPDATE users 
SET 
    "_verified" = true,
    "updatedAt" = NOW()
WHERE email = 'demo-author@example.com';

-- Verify the changes
SELECT 
    id,
    email,
    "_verified" as verified,
    "createdAt",
    "updatedAt"
FROM users 
WHERE email IN ('kenneth.courtney@gmail.com', 'demo-author@example.com');

-- Show all users and their verification status
SELECT 
    id,
    email,
    "_verified" as verified,
    tenant,
    "createdAt"
FROM users 
ORDER BY "createdAt" DESC;


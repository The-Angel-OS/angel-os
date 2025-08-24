-- Reset Database Connections Script
-- This script terminates all connections to the spaces_commerce database
-- and clears any potential locks or hanging transactions

-- Terminate all connections to the database (except current one)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'spaces_commerce'
  AND pid <> pg_backend_pid()
  AND state IN ('idle in transaction', 'idle in transaction (aborted)', 'active');

-- Check for any remaining locks
SELECT 
    l.locktype,
    l.database,
    l.relation,
    l.page,
    l.tuple,
    l.virtualxid,
    l.transactionid,
    l.classid,
    l.objid,
    l.objsubid,
    l.virtualtransaction,
    l.pid,
    l.mode,
    l.granted,
    a.usename,
    a.query,
    a.state,
    a.query_start,
    age(now(), a.query_start) AS query_age
FROM pg_locks l
LEFT JOIN pg_stat_activity a ON l.pid = a.pid
WHERE l.database = (SELECT oid FROM pg_database WHERE datname = 'spaces_commerce')
ORDER BY a.query_start;

-- Show current database connections
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    age(now(), query_start) as query_age,
    query
FROM pg_stat_activity 
WHERE datname = 'spaces_commerce'
ORDER BY query_start;


-- Fix Tasks Table Performance Issues
-- This script adds missing indexes and optimizes the tasks table

-- First, let's see what's in the tasks table
SELECT COUNT(*) as total_tasks FROM tasks;

-- Check current indexes on tasks table
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'tasks'
ORDER BY indexname;

-- Check for any long-running queries on tasks
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE query LIKE '%tasks%' AND state = 'active'
ORDER BY duration DESC;

-- Kill any long-running queries on tasks (be careful!)
-- SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
-- WHERE query LIKE '%tasks%' AND now() - pg_stat_activity.query_start > interval '30 seconds';

-- Add essential indexes for tasks table performance
-- Index on tenant for multi-tenant queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_tenant 
ON tasks(tenant) WHERE tenant IS NOT NULL;

-- Index on project for project-related queries  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_project 
ON tasks(project) WHERE project IS NOT NULL;

-- Index on assignee for user task queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_assignee 
ON tasks(assignee) WHERE assignee IS NOT NULL;

-- Index on status for filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_status 
ON tasks(status);

-- Index on priority for sorting
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_priority 
ON tasks(priority);

-- Composite index for common queries (tenant + status + assignee)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_tenant_status_assignee 
ON tasks(tenant, status, assignee) 
WHERE tenant IS NOT NULL;

-- Index on created_at for chronological queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_created_at 
ON tasks("createdAt");

-- Index on updated_at for recent changes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_updated_at 
ON tasks("updatedAt");

-- Update table statistics
ANALYZE tasks;

-- Check table size and bloat
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_stat_get_live_tuples(c.oid) as live_tuples,
    pg_stat_get_dead_tuples(c.oid) as dead_tuples
FROM pg_tables pt
JOIN pg_class c ON c.relname = pt.tablename
WHERE pt.tablename = 'tasks';

-- If there's significant bloat, consider VACUUM FULL (but this locks the table)
-- VACUUM FULL tasks;

-- For now, just do a regular VACUUM
VACUUM tasks;

-- Show final index status
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'tasks'
ORDER BY indexname;


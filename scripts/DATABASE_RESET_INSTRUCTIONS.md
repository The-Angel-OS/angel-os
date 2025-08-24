# Angel OS Database Reset Instructions

## 🎯 Goal
Completely reset the `spaces_commerce` database with clean slate and proper permissions.

## 📋 Prerequisites
- Connected to pgAdmin with superuser privileges
- Make sure no applications are connected to `spaces_commerce` database

## 🔧 Step-by-Step Process

### Step 1: Terminate Connections
1. **Connect to `postgres` database** in pgAdmin (not spaces_commerce)
2. **Run:** `01_terminate_connections.sql`
3. **Verify:** Should show "All connections terminated"

### Step 2: Drop Database
1. **Still connected to `postgres` database**
2. **Run:** `02_drop_database.sql` 
3. **Important:** Run this as a single statement (F5 or Execute button)
4. **Verify:** Should show "Database dropped successfully"

### Step 3: Create Database
1. **Still connected to `postgres` database**
2. **Run:** `03_create_database.sql`
3. **Important:** Run this as a single statement (F5 or Execute button)
4. **Verify:** Should show database created with `vercel_user` as owner

### Step 4: Setup Schema Permissions
1. **Connect to `spaces_commerce` database** in pgAdmin
2. **Run:** `setup_database_permissions.sql`
3. **Verify:** Should show schema permissions configured

## 🚀 After Database Reset

### Clean Migration Files
```powershell
# In your project directory
Remove-Item "src\migrations\*" -Force -Recurse -ErrorAction SilentlyContinue
```

### Start Fresh
```powershell
# Stop dev server (Ctrl+C if running)
pnpm dev
# Wait for server to start, then in another terminal:
pnpm seed
```

## ✅ Expected Results
- ✅ Clean `spaces_commerce` database
- ✅ `vercel_user` as database owner
- ✅ Proper permissions for Payload CMS
- ✅ No migration conflicts
- ✅ Fresh seed data

## 🔍 Troubleshooting

### If DROP DATABASE fails:
- Make sure you're connected to `postgres`, not `spaces_commerce`
- Ensure all connections are terminated first
- Try running the DROP command alone

### If CREATE DATABASE fails:
- Verify `vercel_user` role exists
- Check you have superuser privileges
- Make sure database was actually dropped

### If permissions fail:
- Verify you're connected to `spaces_commerce` database
- Check `vercel_user` is the database owner

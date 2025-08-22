#!/usr/bin/env pwsh
# KenDev Spaces - Clean Deployment Script
# Fixes schema conflicts and provisions KenDev.Co as flagship tenant

Write-Host "🚀 KenDev Spaces - Clean Deployment Script" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Step 1: Clean conflicted schema tables
Write-Host "📊 Step 1: Cleaning conflicted database tables..." -ForegroundColor Yellow

# Note: Using pgAdmin4 GUI for database operations per user preference
Write-Host "⚠️  Manual Step Required: Please use pgAdmin4 to execute the following SQL:" -ForegroundColor Red
Write-Host ""
Write-Host "-- Clean conflicted tables" -ForegroundColor Gray
Write-Host "DROP TABLE IF EXISTS web_chat_sessions CASCADE;" -ForegroundColor Gray
Write-Host "DROP TABLE IF EXISTS crm_contacts CASCADE;" -ForegroundColor Gray
Write-Host "DROP TABLE IF EXISTS crm_contacts_interactions CASCADE;" -ForegroundColor Gray
Write-Host "DROP TABLE IF EXISTS crm_contacts_custom_fields CASCADE;" -ForegroundColor Gray
Write-Host "DROP TABLE IF EXISTS crm_contacts_texts CASCADE;" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Enter after executing the SQL in pgAdmin4..."
Read-Host

# Step 2: Regenerate schema
Write-Host "🔄 Step 2: Regenerating clean schema..." -ForegroundColor Yellow
pnpm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Schema regenerated successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Schema regeneration failed. Check logs above." -ForegroundColor Red
    exit 1
}

# Step 3: Provision KenDev.Co tenant
Write-Host "🏢 Step 3: Provisioning KenDev.Co flagship tenant..." -ForegroundColor Yellow
node scripts/provision-tenant.js

# Step 4: Start development server
Write-Host "🌟 Step 4: Starting development server..." -ForegroundColor Yellow
Write-Host "🎯 KenDev.Co - Template Factory for Repeatable Site Generation" -ForegroundColor Green
Write-Host "💡 Better than Gemini CLI because it's: Repeatable, Secure, Multi-tenant" -ForegroundColor Green

pnpm run dev

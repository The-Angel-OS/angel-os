#!/usr/bin/env pwsh
# KenDev.Co - Flagship Tenant Provisioning
# Creates the flagship tenant showcasing the Template Factory capabilities

Write-Host "🎯 KenDev.Co - Flagship Tenant Provisioning" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "💡 Template Factory: Building the factory that builds the prototypes" -ForegroundColor Green
Write-Host "🚀 Better than Gemini CLI: Repeatable, Secure, Multi-tenant Architecture" -ForegroundColor Green
Write-Host ""

# Provision KenDev.Co as the flagship tenant
Write-Host "🏢 Provisioning KenDev.Co (Flagship Template Factory)..." -ForegroundColor Yellow

# Use the standard provisioning system - exactly like any other site
# This demonstrates the Template Factory concept: same process, different results
node scripts/provision-tenant.js provision "KenDev.Co" "content_creator" "business"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ KenDev.Co flagship tenant created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 What makes this special:" -ForegroundColor Cyan
    Write-Host "   • Same provisioning process as any client site" -ForegroundColor White
    Write-Host "   • Template Factory approach - repeatable & secure" -ForegroundColor White
    Write-Host "   • Multi-tenant isolation with IRONCLAD data segmentation" -ForegroundColor White
    Write-Host "   • Full business automation built-in" -ForegroundColor White
    Write-Host "   • Federation-ready architecture" -ForegroundColor White
    Write-Host ""
    Write-Host "🌟 Access your flagship tenant at: kendev-co.localhost:3000" -ForegroundColor Green
    Write-Host "🔧 Admin panel: localhost:3000/admin" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Ready to demonstrate repeatable site generation!" -ForegroundColor Magenta
} else {
    Write-Host "❌ Failed to provision KenDev.Co tenant" -ForegroundColor Red
    Write-Host "💡 Make sure the development server is running" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🏭 Template Factory Advantages over Gemini CLI:" -ForegroundColor Cyan
Write-Host "   ✅ Repeatable: Same process generates any business type" -ForegroundColor Green
Write-Host "   ✅ Secure: Multi-tenant with proper data isolation" -ForegroundColor Green
Write-Host "   ✅ Scalable: Federation-ready architecture" -ForegroundColor Green
Write-Host "   ✅ Complete: Full business automation included" -ForegroundColor Green
Write-Host "   ✅ Production-ready: Not just prototypes" -ForegroundColor Green

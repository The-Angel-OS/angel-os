# Approve Jules PRs - Automated PR approval for Jules work
# This script automatically approves and merges PRs from Jules

param(
    [string]$RepoOwner = "kendevco",
    [string]$RepoName = "spaces-angels",
    [switch]$DryRun = $false,
    [switch]$AutoMerge = $true
)

Write-Host "🤖 Jules PR Approval Automation" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if GitHub CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI (gh) is not installed. Please install it first." -ForegroundColor Red
    Write-Host "   Download from: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Check if authenticated
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not authenticated with GitHub CLI. Please run 'gh auth login' first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ GitHub CLI authenticated" -ForegroundColor Green

# Get all open PRs
Write-Host "🔍 Fetching open pull requests..." -ForegroundColor Blue
$prs = gh pr list --repo "$RepoOwner/$RepoName" --json number,title,author,headRefName,state --limit 50 | ConvertFrom-Json

if ($prs.Count -eq 0) {
    Write-Host "📝 No open pull requests found." -ForegroundColor Yellow
    exit 0
}

# Filter for Jules PRs (PRs from branches starting with 'jules/' or 'fix/leo-browser-automation')
$julesPrs = $prs | Where-Object { 
    $_.headRefName -like "jules/*" -or 
    $_.headRefName -like "fix/leo-browser-automation*" -or
    $_.author.login -eq "google-labs-jules[bot]" -or
    $_.title -like "*Jules*" -or
    $_.title -like "*TypeScript*"
}

if ($julesPrs.Count -eq 0) {
    Write-Host "📝 No Jules PRs found to approve." -ForegroundColor Yellow
    Write-Host "   Looking for PRs with:" -ForegroundColor Gray
    Write-Host "   - Branches starting with 'jules/'" -ForegroundColor Gray
    Write-Host "   - Branches starting with 'fix/leo-browser-automation'" -ForegroundColor Gray
    Write-Host "   - Author: google-labs-jules[bot]" -ForegroundColor Gray
    Write-Host "   - Title containing 'Jules' or 'TypeScript'" -ForegroundColor Gray
    exit 0
}

Write-Host "🎯 Found $($julesPrs.Count) Jules PR(s) to process:" -ForegroundColor Green

foreach ($pr in $julesPrs) {
    Write-Host ""
    Write-Host "📋 PR #$($pr.number): $($pr.title)" -ForegroundColor Cyan
    Write-Host "   Branch: $($pr.headRefName)" -ForegroundColor Gray
    Write-Host "   Author: $($pr.author.login)" -ForegroundColor Gray
    
    if ($DryRun) {
        Write-Host "   🔍 DRY RUN: Would approve and merge this PR" -ForegroundColor Yellow
        continue
    }
    
    try {
        # Check if PR is already approved
        $reviews = gh pr view $pr.number --repo "$RepoOwner/$RepoName" --json reviews | ConvertFrom-Json
        $alreadyApproved = $reviews.reviews | Where-Object { $_.state -eq "APPROVED" }
        
        if (-not $alreadyApproved) {
            Write-Host "   ✅ Approving PR..." -ForegroundColor Green
            gh pr review $pr.number --repo "$RepoOwner/$RepoName" --approve --body "🚀 Auto-approved Jules PR for TypeScript error fixes and Angel OS improvements. Excellent work!"
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ PR approved successfully!" -ForegroundColor Green
            } else {
                Write-Host "   ❌ Failed to approve PR" -ForegroundColor Red
                continue
            }
        } else {
            Write-Host "   ✅ PR already approved" -ForegroundColor Green
        }
        
        if ($AutoMerge) {
            # Check if PR is mergeable
            $prDetails = gh pr view $pr.number --repo "$RepoOwner/$RepoName" --json mergeable,mergeStateStatus
            $prData = $prDetails | ConvertFrom-Json
            
            if ($prData.mergeable -eq "MERGEABLE" -and $prData.mergeStateStatus -eq "CLEAN") {
                Write-Host "   🔄 Merging PR..." -ForegroundColor Blue
                gh pr merge $pr.number --repo "$RepoOwner/$RepoName" --squash --delete-branch
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "   ✅ PR merged successfully!" -ForegroundColor Green
                } else {
                    Write-Host "   ❌ Failed to merge PR" -ForegroundColor Red
                }
            } else {
                Write-Host "   ⚠️  PR not ready to merge (mergeable: $($prData.mergeable), status: $($prData.mergeStateStatus))" -ForegroundColor Yellow
            }
        }
        
    } catch {
        Write-Host "   ❌ Error processing PR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Jules PR approval process completed!" -ForegroundColor Green
Write-Host "   Use -DryRun to preview actions without making changes" -ForegroundColor Gray
Write-Host "   Use -AutoMerge:`$false to approve without merging" -ForegroundColor Gray 
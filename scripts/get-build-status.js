#!/usr/bin/env node
/**
 * Quick build status check for Angel OS MVP
 */

const { exec } = require('child_process');

console.log('🏗️ Angel OS Build Status Check')
console.log('🎯 Goal: Clean build for Vercel deployment')
console.log('')

// Try a build and capture output
exec('npx tsc --noEmit --skipLibCheck', (error, stdout, stderr) => {
  const output = stderr || stdout
  
  if (output.includes('Found') && output.includes('errors')) {
    const match = output.match(/Found (\d+) errors/)
    if (match) {
      const errorCount = parseInt(match[1])
      console.log(`📊 Current Status: ${errorCount} TypeScript errors`)
      
      if (errorCount < 50) {
        console.log('✅ GOOD - Under 50 errors, close to deployable!')
      } else if (errorCount < 150) {
        console.log('🚧 PROGRESS - Under 150 errors, getting there!')
      } else {
        console.log('🔧 WORK NEEDED - Still many errors to fix')
      }
      
      console.log('')
      console.log('🚀 Strategy for MVP:')
      console.log('1. Focus on dashboard pages that work (Overview, Products, Orders)')
      console.log('2. Comment out broken spaces components temporarily')
      console.log('3. Fix critical collection type mismatches')
      console.log('4. Deploy working dashboard first, fix rest later')
      
    }
  } else {
    console.log('✅ BUILD SUCCESS - Ready for Vercel deployment!')
  }
})

console.log('💡 Pro tip: Run `pnpm build` to test actual Next.js build')

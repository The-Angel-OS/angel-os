#!/usr/bin/env node

/**
 * Script to fix DataTable column accessorKey issues
 * Replaces nested dot notation accessorKeys with safe alternatives
 */

import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'

const fixes = [
  // Common patterns to fix
  { pattern: /accessorKey:\s*['"]([^'"]*\.[^'"]*)['"]/g, replacement: (match, key) => {
    const safeName = key.split('.').pop()
    return `accessorKey: '${safeName}'`
  }},
]

async function fixDataTableColumns() {
  try {
    // Find all dashboard page files
    const files = await glob('src/app/dashboard/**/page.tsx', { cwd: process.cwd() })
    
    console.log('🔧 Fixing DataTable column issues...')
    
    for (const file of files) {
      console.log(`📝 Processing: ${file}`)
      
      let content = readFileSync(file, 'utf8')
      let modified = false
      
      // Look for problematic accessorKey patterns
      const problematicPatterns = content.match(/accessorKey:\s*['"][^'"]*\.[^'"]*['"]/g)
      
      if (problematicPatterns) {
        console.log(`   ⚠️  Found ${problematicPatterns.length} problematic patterns:`)
        problematicPatterns.forEach(pattern => {
          console.log(`      - ${pattern}`)
        })
        
        // For now, just log the issues - manual fixes are safer for complex cases
        console.log(`   ℹ️  Manual fix required for: ${file}`)
      } else {
        console.log(`   ✅ No issues found`)
      }
    }
    
    console.log('\n🎯 Summary:')
    console.log('   - DataTable columns with nested accessorKey patterns need manual fixes')
    console.log('   - Replace accessorKey with simple names and use cell function to access nested data')
    console.log('   - Example: accessorKey: "crm.status" → accessorKey: "status", cell: (value, row) => row.crm?.status')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixDataTableColumns()

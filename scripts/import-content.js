#!/usr/bin/env node
/**
 * Angel OS Content Import CLI
 * Import posts from spaces.kendev.co or other Payload CMS instances
 */

const { Command } = require('commander')
const fetch = require('node-fetch')
const readline = require('readline')

const program = new Command()

program
  .name('import-content')
  .description('Import content from external Payload CMS instances')
  .version('1.0.0')

// Import from KenDev Spaces
program
  .command('kendev')
  .description('Import posts from spaces.kendev.co')
  .option('-d, --dry-run', 'Run without actually importing (preview mode)')
  .option('-t, --tenant <id>', 'Target tenant ID', '1')
  .action(async (options) => {
    console.log('🚀 Importing from spaces.kendev.co...')
    
    try {
      const response = await fetch('http://localhost:3000/api/content/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import-kendev-posts',
          tenantId: parseInt(options.tenant),
          dryRun: options.dryRun
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅', result.message)
        console.log('📊 Summary:', result.data.summary)
      } else {
        console.error('❌ Import failed:', result.error)
      }
    } catch (error) {
      console.error('💥 Error:', error.message)
    }
  })

// Import from custom source
program
  .command('custom')
  .description('Import posts from custom Payload CMS instance')
  .requiredOption('-u, --url <url>', 'Source URL (e.g., https://example.com)')
  .option('-a, --author <email>', 'Filter by author email')
  .option('-c, --category <slug>', 'Filter by category slug')
  .option('-d, --dry-run', 'Run without actually importing (preview mode)')
  .option('-t, --tenant <id>', 'Target tenant ID', '1')
  .action(async (options) => {
    console.log(`🚀 Importing from ${options.url}...`)
    
    try {
      const response = await fetch('http://localhost:3000/api/content/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import-posts',
          sourceUrl: options.url,
          authorFilter: options.author,
          categoryFilter: options.category,
          tenantId: parseInt(options.tenant),
          dryRun: options.dryRun
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅', result.message)
        console.log('📊 Summary:', result.data.summary)
      } else {
        console.error('❌ Import failed:', result.error)
      }
    } catch (error) {
      console.error('💥 Error:', error.message)
    }
  })

// Test connection
program
  .command('test')
  .description('Test connection to external source')
  .requiredOption('-u, --url <url>', 'Source URL to test')
  .action(async (options) => {
    console.log(`🔍 Testing connection to ${options.url}...`)
    
    try {
      const response = await fetch(`http://localhost:3000/api/content/import?action=test-connection&sourceUrl=${encodeURIComponent(options.url)}`)
      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Connection successful!')
        console.log(`📄 Available posts: ${result.available}`)
        if (result.samplePost) {
          console.log(`📝 Sample: "${result.samplePost}"`)
        }
      } else {
        console.error('❌ Connection failed:', result.message)
      }
    } catch (error) {
      console.error('💥 Error:', error.message)
    }
  })

// List available sources
program
  .command('sources')
  .description('List available import sources')
  .action(async () => {
    console.log('📋 Available import sources:')
    
    try {
      const response = await fetch('http://localhost:3000/api/content/import?action=sources')
      const result = await response.json()
      
      if (result.success) {
        result.sources.forEach(source => {
          console.log(`\n📍 ${source.name}`)
          console.log(`   URL: ${source.url}`)
          console.log(`   Type: ${source.type}`)
          console.log(`   Description: ${source.description}`)
          if (source.recommended) {
            console.log('   ⭐ Recommended')
          }
        })
      }
    } catch (error) {
      console.error('💥 Error:', error.message)
    }
  })

// Interactive wizard
program
  .command('wizard')
  .description('Interactive import wizard')
  .action(async () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve))

    try {
      console.log('🧙 Angel OS Content Import Wizard')
      console.log('==================================\n')

      const sourceType = await question('Import source (1: KenDev Spaces, 2: Custom URL): ')
      
      let importConfig = {}

      if (sourceType === '1') {
        importConfig = {
          action: 'import-kendev-posts',
          sourceUrl: 'https://spaces.kendev.co'
        }
        console.log('✅ Selected: KenDev Spaces (spaces.kendev.co)')
      } else {
        const customUrl = await question('Enter source URL: ')
        const authorFilter = await question('Filter by author email (optional): ')
        
        importConfig = {
          action: 'import-posts',
          sourceUrl: customUrl,
          authorFilter: authorFilter || undefined
        }
      }

      const tenantId = await question('Target tenant ID (default: 1): ')
      const dryRun = await question('Dry run? (y/N): ')

      importConfig.tenantId = parseInt(tenantId) || 1
      importConfig.dryRun = dryRun.toLowerCase() === 'y'

      console.log('\n🔍 Testing connection...')
      
      // Test connection first
      const testResponse = await fetch(`http://localhost:3000/api/content/import?action=test-connection&sourceUrl=${encodeURIComponent(importConfig.sourceUrl)}`)
      const testResult = await testResponse.json()

      if (!testResult.success) {
        console.error('❌ Connection test failed:', testResult.message)
        rl.close()
        return
      }

      console.log(`✅ Connection successful! Found ${testResult.available} posts`)
      
      const proceed = await question('\nProceed with import? (Y/n): ')
      
      if (proceed.toLowerCase() === 'n') {
        console.log('❌ Import cancelled')
        rl.close()
        return
      }

      console.log('\n🚀 Starting import...')

      // Perform import
      const response = await fetch('http://localhost:3000/api/content/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importConfig)
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('\n✅ Import completed successfully!')
        console.log(`📥 Imported: ${result.data.imported}`)
        console.log(`⏭️  Skipped: ${result.data.skipped}`)
        console.log(`❌ Errors: ${result.data.errors.length}`)
        
        if (result.data.errors.length > 0) {
          console.log('\n❌ Errors encountered:')
          result.data.errors.forEach(error => {
            console.log(`  - ${error.post}: ${error.error}`)
          })
        }
      } else {
        console.error('\n❌ Import failed:', result.error)
      }

    } catch (error) {
      console.error('💥 Wizard error:', error.message)
    } finally {
      rl.close()
    }
  })

// Parse command line arguments
program.parse()

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp()
  console.log('\n💡 Quick start examples:')
  console.log('  npm run import kendev                    # Import from spaces.kendev.co')
  console.log('  npm run import kendev --dry-run          # Preview import without changes')
  console.log('  npm run import wizard                    # Interactive wizard')
  console.log('  npm run import test -u https://site.com  # Test connection')
}



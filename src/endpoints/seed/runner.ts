#!/usr/bin/env tsx
/**
 * Angel OS Seed Runner
 * 
 * Integrates the custom Angel OS provisioning system with Payload's architecture
 * Creates Instance 0 of the multi-tenant framework with Kenneth Courtney as super admin
 */

import { getPayload } from 'payload'
import config from '../../payload.config'
import { seed } from './index'

async function runSeed() {
  console.log('🚀 Angel OS Seed Runner')
  console.log('🏭 Template Factory: Initializing Instance 0...')
  console.log('')

  try {
    // Initialize Payload
    const payload = await getPayload({ config })
    
    // Run the seed function
    await seed({
      payload,
      req: {
        payload,
        user: null,
        t: (key: string) => key,
        locale: 'en',
        fallbackLocale: false,
      } as any
    })

    console.log('')
    console.log('✅ Angel OS Instance 0 initialized successfully!')
    console.log('🎯 Kenneth Courtney is now the super admin')
    console.log('🏢 KenDev.Co tenant is provisioned and ready')
    console.log('🤖 LEO Site Angel is configured for conversational management')
    console.log('')
    console.log('🌟 You can now run: pnpm dev')
    console.log('🔗 Access dashboard at: http://localhost:3000/dashboard')
    console.log('🔑 Login: kenneth.courtney@gmail.com / angelos')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

runSeed()

#!/usr/bin/env node

import https from 'https'
import http from 'http'

function makeTenantRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data)

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/tenant-control',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = http.request(options, (res) => {
      let responseBody = ''

      res.on('data', (chunk) => {
        responseBody += chunk
      })

      res.on('end', () => {
        try {
          const response = JSON.parse(responseBody)
          resolve(response)
        } catch (error) {
          reject(new Error('Invalid JSON response'))
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

async function provisionTenant(name, businessType, options = {}) {
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  const tenantData = {
    name,
    slug,
    businessType,
    theme: options.theme || 'default',
    features: options.features || ['basic']
  }

  console.log(`🚀 Provisioning tenant: ${name}`)
  console.log(`📍 Will be accessible at: ${slug}.spaces.kendev.co`)

  try {
    const response = await makeTenantRequest({
      action: 'provision',
      tenantData
    })

    if (response.success) {
      console.log('✅ Tenant provisioned successfully!')
      console.log(`🌐 Access URL: ${response.tenant.previewUrl}`)
      console.log(`🆔 Tenant ID: ${response.tenant.id}`)
      console.log(`📦 Space ID: ${response.tenant.spaceId}`)
      console.log('\n📋 Next Steps:')
      response.nextSteps?.forEach((step, index) => {
        console.log(`   ${index + 1}. ${step}`)
      })
    } else {
      console.error('❌ Provisioning failed:', response.error)
      if (response.details) {
        console.error('Details:', response.details)
      }
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message)
    console.error('💡 Make sure the development server is running on localhost:3000')
  }
}

async function listTenants() {
  console.log('📋 Fetching tenant list...')

  try {
    const response = await makeTenantRequest({
      action: 'list'
    })

    if (response.success) {
      console.log(`\n📊 Found ${response.total} tenants:`)
      console.log(`   🟢 Active: ${response.summary.active}`)
      console.log(`   🟡 Provisioning: ${response.summary.provisioning}`)
      console.log(`   🔴 Errors: ${response.summary.error}`)

      if (response.tenants.length > 0) {
        console.log('\n🏢 Tenant Details:')
        response.tenants.forEach((tenant, index) => {
          console.log(`   ${index + 1}. ${tenant.name}`)
          console.log(`      🌐 ${tenant.domain}`)
          console.log(`      📊 Status: ${tenant.status}`)
          console.log(`      🏷️  Type: ${tenant.businessType}`)
          console.log(`      📅 Created: ${new Date(tenant.createdAt).toLocaleDateString()}`)
          console.log('')
        })
      }
    } else {
      console.error('❌ Failed to list tenants:', response.error)
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }
}

async function deprovisionTenant(tenantId) {
  console.log(`🗑️  Deprovisioning tenant: ${tenantId}`)

  try {
    const response = await makeTenantRequest({
      action: 'deprovision',
      tenantId
    })

    if (response.success) {
      console.log('✅ Tenant deprovisioned successfully!')
      console.log(`📋 ${response.message}`)
    } else {
      console.error('❌ Deprovisioning failed:', response.error)
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message)
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command) {
    console.log('🏢 Spaces Tenant Provisioning Tool')
    console.log('')
    console.log('Usage:')
    console.log('  node provision-tenant.js provision "Business Name" business-type [theme]')
    console.log('  node provision-tenant.js list')
    console.log('  node provision-tenant.js deprovision <tenant-id>')
    console.log('')
    console.log('Business Types:')
    console.log('  - pizza, restaurant, retail, service, content_creator, cactus_farm, general')
    console.log('')
    console.log('Themes:')
    console.log('  - default, business, creative, minimal')
    console.log('')
    console.log('Examples:')
    console.log('  node provision-tenant.js provision "Joe\'s Pizza" pizza business')
    console.log('  node provision-tenant.js provision "Hays Cactus Farm" cactus_farm default')
    console.log('  node provision-tenant.js list')
    return
  }

  switch (command) {
    case 'provision':
      const name = args[1]
      const businessType = args[2]
      const theme = args[3]

      if (!name || !businessType) {
        console.error('❌ Missing required arguments: name and businessType')
        console.log('Usage: node provision-tenant.js provision "Business Name" business-type [theme]')
        return
      }

      await provisionTenant(name, businessType, { theme })
      break

    case 'list':
      await listTenants()
      break

    case 'deprovision':
      const tenantId = args[1]

      if (!tenantId) {
        console.error('❌ Missing required argument: tenant-id')
        console.log('Usage: node provision-tenant.js deprovision <tenant-id>')
        return
      }

      await deprovisionTenant(tenantId)
      break

    default:
      console.error(`❌ Unknown command: ${command}`)
      console.log('Available commands: provision, list, deprovision')
  }
}

// Run the main function
main().catch(console.error)

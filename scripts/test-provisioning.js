#!/usr/bin/env node

/**
 * Test script for provisioning the three business cases:
 * - Hays Cactus Farm
 * - Oldsmar Exotic Birds  
 * - Radioactive Car Audio
 */

const SERVER_URL = 'http://localhost:3000'

const businessCases = [
  {
    name: 'Hays Cactus Farm',
    slug: 'hays-cactus-farm',
    businessType: 'agriculture',
    theme: 'nature',
    features: ['basic', 'ecommerce', 'inventory'],
    description: 'Specialty cactus and succulent nursery with rare and exotic plants',
    industry: 'agriculture',
    products: [
      'Rare Desert Cacti',
      'Succulent Collections', 
      'Plant Care Supplies',
      'Custom Planters'
    ]
  },
  {
    name: 'Oldsmar Exotic Birds',
    slug: 'oldsmar-exotic-birds',
    businessType: 'pet-services',
    theme: 'tropical',
    features: ['basic', 'appointments', 'services'],
    description: 'Exotic bird breeding, boarding, and veterinary services',
    industry: 'pet-care',
    products: [
      'Exotic Bird Sales',
      'Bird Boarding Services',
      'Veterinary Care',
      'Bird Training Classes'
    ]
  },
  {
    name: 'Radioactive Car Audio',
    slug: 'radioactive-car-audio',
    businessType: 'automotive',
    theme: 'tech',
    features: ['basic', 'ecommerce', 'appointments'],
    description: 'High-performance car audio installation and custom sound systems',
    industry: 'automotive',
    products: [
      'Premium Car Speakers',
      'Custom Installation',
      'Sound System Design',
      'Audio Equipment'
    ]
  }
]

async function provisionTenant(businessCase) {
  try {
    console.log(`\n🚀 Provisioning: ${businessCase.name}`)
    console.log(`   📍 Slug: ${businessCase.slug}`)
    console.log(`   🏢 Type: ${businessCase.businessType}`)
    console.log(`   🎨 Theme: ${businessCase.theme}`)

    const response = await globalThis.fetch(`${SERVER_URL}/api/tenant-control`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'provision',
        tenantData: {
          name: businessCase.name,
          slug: businessCase.slug,
          businessType: businessCase.businessType,
          theme: businessCase.theme,
          features: businessCase.features,
          domain: `${businessCase.slug}.spaces.kendev.co`,
          subdomain: businessCase.slug
        }
      })
    })

    const result = await response.json()

    if (response.ok && result.success) {
      console.log(`✅ ${businessCase.name} provisioned successfully!`)
      console.log(`   🌐 URL: ${result.tenant.previewUrl}`)
      console.log(`   🆔 Tenant ID: ${result.tenant.id}`)
      console.log(`   📦 Space ID: ${result.tenant.spaceId}`)
      
      return {
        success: true,
        tenant: result.tenant
      }
    } else {
      console.error(`❌ Failed to provision ${businessCase.name}:`, result.error)
      console.error(`   Details: ${result.details || 'No details provided'}`)
      
      return {
        success: false,
        error: result.error
      }
    }
  } catch (error) {
    console.error(`💥 Error provisioning ${businessCase.name}:`, error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

async function testProvisioning() {
  console.log('🎯 Angel OS Tenant Provisioning Test')
  console.log('=====================================')
  console.log(`🔗 Server: ${SERVER_URL}`)
  
  const results = []
  
  for (const businessCase of businessCases) {
    const result = await provisionTenant(businessCase)
    results.push({
      name: businessCase.name,
      ...result
    })
    
    // Wait a bit between provisions to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  console.log('\n📊 Provisioning Summary')
  console.log('========================')
  
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`)
  console.log(`❌ Failed: ${failed.length}/${results.length}`)
  
  if (successful.length > 0) {
    console.log('\n🎉 Successfully Provisioned:')
    successful.forEach(result => {
      console.log(`   • ${result.name}`)
      if (result.tenant) {
        console.log(`     🌐 ${result.tenant.previewUrl}`)
      }
    })
  }
  
  if (failed.length > 0) {
    console.log('\n💥 Failed to Provision:')
    failed.forEach(result => {
      console.log(`   • ${result.name}: ${result.error}`)
    })
  }
  
  console.log('\n🏁 Test Complete!')
}

// Run the test
testProvisioning().catch(console.error)

export { testProvisioning, businessCases }

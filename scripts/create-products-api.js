#!/usr/bin/env node
/**
 * Auto-generate Products API endpoints for rapid MVP development
 */

const fs = require('fs')
const path = require('path')

console.log('🛍️ Creating Products API endpoints...')

// Products CRUD API
const productsApi = `import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const url = new URL(request.url)
    const tenantId = url.searchParams.get('tenant')
    const search = url.searchParams.get('search')
    const category = url.searchParams.get('category')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const page = parseInt(url.searchParams.get('page') || '1')

    let where: any = {}
    
    if (tenantId) {
      where.tenant = { equals: tenantId }
    }
    
    if (search) {
      where.or = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { description: { contains: search } }
      ]
    }
    
    if (category && category !== 'all') {
      where.category = { equals: category }
    }

    const result = await payload.find({
      collection: 'products',
      where,
      limit,
      page,
      populate: ['category', 'images']
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const data = await request.json()

    const product = await payload.create({
      collection: 'products',
      data
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}`

// Create API directory if it doesn't exist
const apiDir = path.join(process.cwd(), 'src', 'app', 'api', 'products')
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true })
}

// Write the API file
fs.writeFileSync(path.join(apiDir, 'route.ts'), productsApi)

console.log('✅ Created: src/app/api/products/route.ts')
console.log('🔧 Features: GET (search, filter, paginate), POST (create)')
console.log('🎯 Ready for Products page integration!')
console.log('')
console.log('📋 Next steps:')
console.log('1. Update /dashboard/products page to use this API')
console.log('2. Replace mock data with real Payload data')
console.log('3. Test with KenDev.Co tenant')
console.log('4. Verify product creation works')
console.log('')
console.log('💡 Integration pattern established - copy for Orders, Contacts, etc!')

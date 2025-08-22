import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    console.log('🔧 Creating tenant membership for Kenneth...')
    
    // Find Kenneth
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: 'kenneth.courtney@gmail.com' } }
    })
    
    // Find KenDev.Co tenant
    const tenants = await payload.find({
      collection: 'tenants',
      where: { name: { equals: 'KenDev.Co' } }
    })
    
    if (users.docs.length === 0) {
      return NextResponse.json({ error: 'Kenneth Courtney user not found' }, { status: 404 })
    }
    
    if (tenants.docs.length === 0) {
      return NextResponse.json({ error: 'KenDev.Co tenant not found' }, { status: 404 })
    }
    
    const user = users.docs[0]
    const tenant = tenants.docs[0]
    
    if (!user || !tenant) {
      return NextResponse.json({
        error: 'User or tenant not found'
      }, { status: 404 })
    }
    
    console.log('✅ Found user:', user.id, user.email)
    console.log('✅ Found tenant:', tenant.id, tenant.name)
    
    // Check if membership already exists
    const existing = await payload.find({
      collection: 'tenant-memberships',
      where: {
        and: [
          { user: { equals: user.id } },
          { tenant: { equals: tenant.id } }
        ]
      }
    })
    
    if (existing.docs.length > 0) {
      console.log('⚠️ Tenant membership already exists')
      return NextResponse.json({ 
        message: 'Tenant membership already exists',
        membership: existing.docs[0]
      })
    }
    
    // Create tenant membership
    const membership = await payload.create({
      collection: 'tenant-memberships',
      data: {
        user: user.id,
        tenant: tenant.id,
        role: 'tenant_admin',
        status: 'active',
        joinedAt: new Date().toISOString()
      }
    })
    
    console.log('🎉 Created tenant membership:', membership.id)
    
    return NextResponse.json({
      success: true,
      message: 'Tenant membership created successfully',
      membership: {
        id: membership.id,
        user: user.email,
        tenant: tenant.name,
        role: 'admin',
        status: 'active'
      }
    })
    
  } catch (error) {
    console.error('🚨 Failed to create tenant membership:', error)
    return NextResponse.json(
      { error: 'Failed to create tenant membership', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

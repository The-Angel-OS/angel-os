import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * Debug endpoint to check tenant access and relationships
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Get current user from session
    const user = request.headers.get('user') // This might not work directly
    
    // Try to fetch tenants to see what happens
    const tenants = await payload.find({
      collection: 'tenants',
      limit: 10,
    })

    const response = {
      success: true,
      tenantsFound: tenants.docs.length,
      tenants: tenants.docs.map(t => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        status: t.status,
      })),
      totalTenants: tenants.totalDocs,
      user: user ? 'User header present' : 'No user header',
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Debug tenants error:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}

/**
 * Test tenant relationship field specifically
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()
    
    console.log('Testing tenant relationship with user role:', body.userRole)
    
    // Simulate the relationship field query
    const tenants = await payload.find({
      collection: 'tenants',
      limit: 100,
      sort: 'name',
    })

    return NextResponse.json({
      success: true,
      message: 'Tenant relationship test successful',
      tenantsAvailable: tenants.docs.length,
      tenants: tenants.docs.map(t => ({
        value: t.id,
        label: t.name,
        slug: t.slug,
        status: t.status,
      })),
    })

  } catch (error) {
    console.error('Tenant relationship test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}

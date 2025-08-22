import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * Debug endpoint to check specific user-tenant relationship issues
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId') || '1'
    
    // Get user data
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    })

    // Get tenant data if user has one
    let tenantData = null
    if (user.tenant) {
      try {
        tenantData = await payload.findByID({
          collection: 'tenants',
          id: typeof user.tenant === 'object' ? user.tenant.id : user.tenant,
        })
      } catch (tenantError) {
        console.error('Failed to fetch tenant:', tenantError)
        tenantData = { error: tenantError instanceof Error ? tenantError.message : 'Unknown error' }
      }
    }

    // Get all tenants that should be visible
    let allTenants = []
    try {
      const tenantsResult = await payload.find({
        collection: 'tenants',
        limit: 10,
      })
      allTenants = tenantsResult.docs
    } catch (tenantsError) {
      console.error('Failed to fetch all tenants:', tenantsError)
      allTenants = [{ error: tenantsError instanceof Error ? tenantsError.message : 'Unknown error' }]
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        globalRole: user.globalRole,
        tenant: user.tenant,
      },
      tenantData,
      allTenants: allTenants.map(t => {
        if ('error' in t) {
          return { error: t.error }
        }
        return {
          id: t.id,
          name: t.name,
          slug: t.slug,
          status: t.status,
        }
      }),
      debug: {
        userHasTenant: !!user.tenant,
        tenantType: typeof user.tenant,
        tenantValue: user.tenant,
      },
    })

  } catch (error) {
    console.error('Debug user-tenant error:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { tenantId } = await request.json()
    
    // TODO: Get current user from authenticated session
    // For now, we'll return success - this would typically update the user's session
    // to include the selected tenant context
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    // Verify the tenant exists and user has access
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: tenantId
    })

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // TODO: Verify user has membership in this tenant
    // const membership = await payload.find({
    //   collection: 'tenant-memberships',
    //   where: {
    //     and: [
    //       { user: { equals: currentUser.id } },
    //       { tenant: { equals: tenantId } }
    //     ]
    //   }
    // })

    // TODO: Update user session or context with selected tenant
    // This might involve updating a session store, JWT token, or user preference

    return NextResponse.json({ 
      success: true, 
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug
      }
    })

  } catch (error) {
    console.error('Error switching tenant:', error)
    return NextResponse.json(
      { error: 'Failed to switch tenant' },
      { status: 500 }
    )
  }
}



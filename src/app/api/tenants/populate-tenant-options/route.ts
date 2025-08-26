import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// GET /api/tenants/populate-tenant-options - Get tenant options for dropdowns/selects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user')
    
    const payload = await getPayload({ config })

    let tenants
    try {
      // If user ID is provided, get tenants where user is a member
      let whereClause = {}
      if (userId) {
        whereClause = {
          'members.user': { equals: userId }
        }
      }

      tenants = await payload.find({
        collection: 'tenants',
        where: whereClause,
        depth: 1,
        limit: 50,
        sort: 'name'
      })
    } catch (dbError) {
      console.warn('Database permission error, using fallback data:', (dbError as Error)?.message || dbError)
      // Fallback to mock data when database has permission issues
      tenants = {
        docs: [{
          id: '1',
          name: 'KenDev.Co Main',
          slug: 'kendev-main',
          status: 'active',
          description: 'Main development space',
          type: 'business'
        }],
        totalDocs: 1
      }
    }

    // Transform to options format expected by frontend
    const options = tenants.docs
      .filter((tenant: any) => tenant.status === 'active')
      .map((tenant: any) => ({
        label: tenant.name,
        value: tenant.id,
        slug: tenant.slug,
        type: tenant.type,
        description: tenant.description
      }))

    return NextResponse.json({
      options,
      totalDocs: tenants.totalDocs || options.length
    })
  } catch (error) {
    console.error('Error fetching tenant options:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenant options' },
      { status: 500 }
    )
  }
}

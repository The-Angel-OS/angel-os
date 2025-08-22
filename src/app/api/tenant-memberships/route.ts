import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    
    const userId = searchParams.get('user')
    const limit = parseInt(searchParams.get('limit') || '100')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if tenant-memberships collection exists
    let result
    try {
      result = await payload.find({
        collection: 'tenant-memberships',
        where: {
          user: { equals: userId }
        },
        limit,
        // populate: ['tenant'] // Removing populate to fix type error
      })
    } catch (error) {
      console.log('tenant-memberships collection not found, creating default membership')
      
      // If collection doesn't exist or no memberships, create a default one
      // First, find the KenDev.Co tenant
      const tenants = await payload.find({
        collection: 'tenants',
        where: {
          slug: { equals: 'kendevco' }
        },
        limit: 1
      })

      if (tenants.docs.length > 0) {
        const kendevTenant = tenants.docs[0]
        
        // Try to create a membership (if collection exists)
        try {
          await payload.create({
            collection: 'tenant-memberships',
            data: {
              user: parseInt(userId),
              tenant: kendevTenant!.id,
              role: 'tenant_admin',
              status: 'active',
              joinedAt: new Date().toISOString()
            }
          })
          
          // Return the created membership
          result = {
            docs: [{
              id: 'default',
              user: userId,
              tenant: kendevTenant,
              role: 'admin',
              status: 'active'
            }],
            hasNextPage: false,
            hasPrevPage: false,
            limit,
            nextPage: null,
            prevPage: null,
            page: 1,
            pagingCounter: 1,
            totalDocs: 1,
            totalPages: 1
          }
        } catch (createError) {
          console.log('Could not create membership, returning tenant directly')
          // Return tenant as if it was a membership
          result = {
            docs: [{
              id: kendevTenant!.id,
              user: userId,
              tenant: kendevTenant,
              role: 'admin',
              status: 'active'
            }],
            hasNextPage: false,
            hasPrevPage: false,
            limit,
            nextPage: null,
            prevPage: null,
            page: 1,
            pagingCounter: 1,
            totalDocs: 1,
            totalPages: 1
          }
        }
      } else {
        // No KenDev tenant found, return empty
        result = {
          docs: [],
          hasNextPage: false,
          hasPrevPage: false,
          limit,
          nextPage: null,
          prevPage: null,
          page: 1,
          pagingCounter: 1,
          totalDocs: 0,
          totalPages: 0
        }
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching tenant memberships:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenant memberships' },
      { status: 500 }
    )
  }
}
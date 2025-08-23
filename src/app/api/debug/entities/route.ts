import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    
    // Check what users exist
    const users = await payload.find({
      collection: 'users',
      limit: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        globalRole: true
      }
    })

    // Check what spaces exist
    const spaces = await payload.find({
      collection: 'spaces',
      limit: 10,
      select: {
        id: true,
        name: true,
        slug: true,
        tenant: true
      }
    })

    // Check what tenants exist
    const tenants = await payload.find({
      collection: 'tenants',
      limit: 10,
      select: {
        id: true,
        name: true,
        slug: true,
        status: true
      }
    })

    return NextResponse.json({
      success: true,
      entities: {
        users: {
          count: users.totalDocs,
          docs: users.docs
        },
        spaces: {
          count: spaces.totalDocs,
          docs: spaces.docs
        },
        tenants: {
          count: tenants.totalDocs,
          docs: tenants.docs
        }
      },
      debug: {
        timestamp: new Date().toISOString(),
        message: 'Entity diagnostic completed'
      }
    })

  } catch (error) {
    console.error('Entity diagnostic failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      debug: {
        timestamp: new Date().toISOString(),
        errorType: error instanceof Error ? error.constructor.name : typeof error
      }
    }, { status: 500 })
  }
}



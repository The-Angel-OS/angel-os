import { NextRequest, NextResponse } from 'next/server'
import { resolveTenantFromDomain } from '@/utilities/tenant-resolution'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hostname = searchParams.get('hostname') || request.nextUrl.hostname
    
    const resolution = await resolveTenantFromDomain(hostname)
    
    return NextResponse.json({
      success: true,
      hostname,
      tenant: resolution.tenant,
      matchedDomain: resolution.matchedDomain,
      matchType: resolution.matchType,
      isActive: resolution.isActive
    })

  } catch (error) {
    console.error('Tenant resolution API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      hostname: request.nextUrl.hostname
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { hostnames } = body
    
    if (!Array.isArray(hostnames)) {
      return NextResponse.json({
        error: 'hostnames must be an array'
      }, { status: 400 })
    }

    const results = []
    
    for (const hostname of hostnames) {
      try {
        const resolution = await resolveTenantFromDomain(hostname)
        results.push({
          hostname,
          success: true,
          ...resolution
        })
      } catch (error) {
        results.push({
          hostname,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error('Bulk tenant resolution error:', error)
    return NextResponse.json({
      error: 'Bulk resolution failed'
    }, { status: 500 })
  }
}



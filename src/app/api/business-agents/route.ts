import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { BusinessAgent } from '@/services/BusinessAgent'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    const payload = await getPayload({ config: configPromise })

    const whereClause = tenantId ? { tenant: { equals: tenantId } } : undefined

    const agents = await payload.find({
      collection: 'business-agents' as any,
      where: whereClause,
      limit: 50,
      depth: 2 // Include tenant relationship
    })

    return NextResponse.json({
      success: true,
      agents: agents.docs
    })
  } catch (error) {
    console.error('Failed to fetch business agents:', error)
    return NextResponse.json({
      error: 'Failed to fetch business agents',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

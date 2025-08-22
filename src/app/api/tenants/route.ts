import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    
    const ids = searchParams.get('ids')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    let where = {}
    
    if (ids) {
      const idArray = ids.split(',').filter(Boolean)
      where = {
        id: { in: idArray }
      }
    }

    const result = await payload.find({
      collection: 'tenants',
      where,
      limit,
      sort: 'name'
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching tenants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tenants' },
      { status: 500 }
    )
  }
}
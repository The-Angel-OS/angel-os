import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    
    const name = searchParams.get('name')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || '-createdAt'
    const page = parseInt(searchParams.get('page') || '1')

    const query: any = {
      collection: 'channels',
      limit,
      sort,
      page,
      depth: 2
    }

    // Handle name-based queries (for PM channels)
    if (name) {
      query.where = {
        name: { equals: name }
      }
    }

    let result
    try {
      result = await payload.find(query)
    } catch (dbError) {
      console.warn('Database permission error in channels API:', (dbError as Error)?.message || dbError)
      // Return empty result for fallback
      return NextResponse.json({
        docs: [],
        totalDocs: 0,
        limit,
        totalPages: 0,
        page,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in channels API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    )
  }
}


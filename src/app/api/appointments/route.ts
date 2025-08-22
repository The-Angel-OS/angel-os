import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    
    const limit = parseInt(searchParams.get('limit') || '50')
    const sort = searchParams.get('sort') || 'startTime'
    const populate = searchParams.get('populate')?.split(',') || []
    
    // Build where clause from search params
    const where: any = {}
    
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('where[') && key.endsWith(']')) {
        const field = key.slice(6, -1) // Remove 'where[' and ']'
        if (field.includes('[equals]')) {
          const fieldName = field.replace('[equals]', '')
          where[fieldName] = { equals: value }
        }
      }
    }

    const queryOptions: any = {
      collection: 'appointments',
      where,
      limit,
      sort
    }
    
    // Only add populate if it has valid values
    if (populate && populate.length > 0) {
      queryOptions.depth = 2 // Use depth instead of populate for better compatibility
    }

    const result = await payload.find(queryOptions)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    // Auto-set organizer if not provided
    if (!body.organizer && request.headers.get('user-id')) {
      body.organizer = request.headers.get('user-id')
    }

    const result = await payload.create({
      collection: 'appointments',
      data: body
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}
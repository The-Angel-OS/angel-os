import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// POST /api/web-chat-sessions - Create a new web chat session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitorInfo, space, tenant } = body
    
    const payload = await getPayload({ config })

    // Generate unique session ID
    const sessionId = `webchat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create web chat session
    const session = await payload.create({
      collection: 'web-chat-sessions',
      data: {
        sessionId,
        space,
        tenant,
        visitorInfo,
        status: 'active',
        analytics: {
          startTime: new Date().toISOString(),
          messageCount: 0
        }
      }
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error creating web chat session:', error)
    return NextResponse.json(
      { error: 'Failed to create web chat session' },
      { status: 500 }
    )
  }
}

// GET /api/web-chat-sessions - Get web chat sessions (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const status = searchParams.get('status')
    const space = searchParams.get('space')

    const payload = await getPayload({ config })

    const where: any = {}
    if (status) where.status = { equals: status }
    if (space) where.space = { equals: space }

    const sessions = await payload.find({
      collection: 'web-chat-sessions',
      where,
      limit,
      page,
      sort: '-createdAt',
      depth: 1
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching web chat sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch web chat sessions' },
      { status: 500 }
    )
  }
}




import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    
    const where = searchParams.get('where')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || '-createdAt'
    const populate = searchParams.get('populate')

    const query: any = {
      collection: 'messages',
      limit,
      sort
    }

    if (where) {
      try {
        query.where = JSON.parse(where)
      } catch (error) {
        console.error('Invalid where clause:', error)
      }
    }

    if (populate) {
      query.populate = populate.split(',')
    }

    const result = await payload.find(query)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    console.log('📝 Creating message with data:', JSON.stringify(body, null, 2))

    // Validate required fields before creation
    if (!body.sender) {
      console.error('❌ Missing sender field')
      return NextResponse.json({ error: 'Sender is required' }, { status: 400 })
    }

    if (!body.space) {
      console.error('❌ Missing space field')
      return NextResponse.json({ error: 'Space is required' }, { status: 400 })
    }

    // Ensure content is properly formatted
    const messageData = {
      ...body,
      content: body.content || body.text || 'Empty message',
      messageType: body.messageType || 'user',
      priority: body.priority || 'normal'
    }

    console.log('✅ Validated message data:', JSON.stringify(messageData, null, 2))

    const result = await payload.create({
      collection: 'messages',
      data: messageData
    })

    console.log('✅ Message created successfully:', result.id)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating message:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      cause: error instanceof Error ? error.cause : undefined
    })
    return NextResponse.json(
      { 
        error: 'Failed to create message',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
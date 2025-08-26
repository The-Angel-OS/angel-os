import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { searchParams } = new URL(request.url)
    
    const where = searchParams.get('where')
    const channel = searchParams.get('channel')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || '-createdAt'
    const populate = searchParams.get('populate')
    const page = parseInt(searchParams.get('page') || '1')

    const query: any = {
      collection: 'messages',
      limit,
      sort,
      page
    }

    // Handle channel-based queries
    if (channel) {
      let channelValue: string | number = channel
      
      // If channel is a string name (like "main"), resolve it to ID
      if (isNaN(parseInt(channel))) {
        console.log(`🔍 Resolving channel name "${channel}" to ID...`)
        try {
          // Handle special channel name mappings
          let searchName = channel
          if (channel === 'LEO AI' || channel === 'leo-ai') {
            searchName = 'leo-ai' // Map both variants to the actual channel name
          }
          
          // Query channels collection to find the channel by name
          const channelQuery = await payload.find({
            collection: 'channels',
            where: {
              name: { equals: searchName }
            },
            limit: 1
          })
          
          if (channelQuery.docs.length > 0 && channelQuery.docs[0]?.id) {
            channelValue = Number(channelQuery.docs[0].id)
            console.log(`✅ Resolved channel "${channel}" to ID: ${channelValue}`)
          } else {
            console.warn(`⚠️ Channel "${channel}" not found, returning empty results`)
            // Return empty results instead of trying to query with invalid channel
            return NextResponse.json({
              docs: [],
              totalDocs: 0,
              limit,
              totalPages: 0,
              page,
              pagingCounter: 1,
              hasPrevPage: false,
              hasNextPage: false,
              prevPage: null,
              nextPage: null
            })
          }
        } catch (error) {
          console.warn(`⚠️ Error resolving channel "${channel}":`, error)
          return NextResponse.json({
            docs: [],
            totalDocs: 0,
            limit,
            totalPages: 0,
            page,
            pagingCounter: 1,
            hasPrevPage: false,
            hasNextPage: false,
            prevPage: null,
            nextPage: null
          })
        }
      } else {
        // Convert numeric string to number
        channelValue = parseInt(channel)
      }
      
      console.log(`🔍 Channel query: "${channel}" -> ${channelValue} (type: ${typeof channelValue})`)
      
      // Since channel is a relationship field, we need to query it properly
      query.where = {
        channel: { equals: channelValue }
      }
      
      // Ensure essential relationships are populated (will be set below)
    } else if (where) {
      try {
        query.where = JSON.parse(where)
      } catch (error) {
        console.error('Invalid where clause:', error)
      }
    }

    // Handle populate parameter
    if (populate) {
      query.populate = populate.split(',')
    } else {
      // Default populate for essential relationships
      query.populate = ['channel', 'sender', 'space']
    }

    let result
    try {
      result = await payload.find(query)
      console.log(`✅ Database query successful. Found ${result.docs.length} messages for channel ${channel}`)
    } catch (dbError) {
      console.error('❌ Database query failed:', (dbError as Error)?.message || dbError)
      console.error('Query details:', JSON.stringify(query, null, 2))
      
      // Return empty result instead of mock data to see the real issue
      result = {
        docs: [],
        totalDocs: 0,
        limit,
        totalPages: 0,
        page,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false
      }
    }

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

    // Additional validation for relationships
    console.log('🔍 Validating relationships...')
    console.log('- Sender ID:', body.sender)
    console.log('- Space ID:', body.space)
    console.log('- Channel ID:', body.channel)
    console.log('- Content structure:', typeof body.content, body.content)

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
    console.error('❌ Error creating message:', error)
    
    // Enhanced error logging for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
      
      // Check for Payload-specific validation errors
      if ((error as any).data) {
        console.error('Payload validation errors:', (error as any).data)
      }
      
      if ((error as any).errors) {
        console.error('Payload field errors:', (error as any).errors)
      }
    }
    
    console.error('Full error object:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { 
        error: 'Failed to create message',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// GET /api/spaces/[id]/channels - Get channels for a space
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    let channels
    try {
      channels = await payload.find({
        collection: 'channels',
        where: {
          tenantId: { equals: id }
        },
        depth: 3, // Deep populate to get member user data
        sort: 'createdAt'
      })
    } catch (dbError) {
      console.error('❌ Database query failed for channels:', (dbError as Error)?.message || dbError)
      // Return empty result to see the real issue
      channels = {
        docs: [],
        totalDocs: 0,
        limit: 50,
        totalPages: 0,
        page: 1,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false
      }
    }

    // Transform channels to match expected format
    const transformedChannels = channels.docs.map(channel => ({
      id: channel.id,
      name: channel.name,
      description: channel.description,
      type: channel.channelType || 'chat',
      members: (channel.members || []).map((member: any) => {
        const userData = typeof member.user === 'object' ? member.user : { id: member.user }
        return userData.id || userData
      }),
      isPrivate: channel.isPrivate || false,
      isSystem: channel.isSystem || false,
      isVirtual: channel.isVirtual || false,
      tenantId: channel.tenantId,
      createdAt: channel.createdAt,
      updatedAt: 'updatedAt' in channel ? channel.updatedAt : new Date().toISOString(),
      status: channel.status
    }))

    return NextResponse.json({
      docs: transformedChannels,
      totalDocs: transformedChannels.length,
      limit: channels.limit,
      totalPages: channels.totalPages,
      page: channels.page,
      pagingCounter: channels.pagingCounter,
      hasPrevPage: channels.hasPrevPage,
      hasNextPage: channels.hasNextPage
    })
  } catch (error) {
    console.error('Error fetching space channels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    )
  }
}

// POST /api/spaces/[id]/channels - Create a new channel in a space
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const payload = await getPayload({ config })

    // Check if user has permission to create channels in this space
    // TODO: Implement proper permission checking based on space membership

    console.log('🔍 Channel creation request body:', JSON.stringify(body, null, 2))

    // Transform members array to proper format (using numbers like the working channel-resolution.ts)
    const members = (body.members || []).map((memberId: string) => ({
      user: parseInt(memberId), // Convert to number like in channel-resolution.ts
      role: 'member',
      joinedAt: new Date().toISOString(),
      permissions: {
        canRead: true,
        canWrite: true,
        canInvite: false,
        canManage: false
      }
    }))

    // Add creator as owner if not already in members
    const createdBy = parseInt(body.createdBy || '1') // Convert to number
    if (!members.some((m: any) => m.user === createdBy)) {
      members.unshift({
        user: createdBy,
        role: 'owner',
        joinedAt: new Date().toISOString(),
        permissions: {
          canRead: true,
          canWrite: true,
          canInvite: true,
          canManage: true
        }
      })
    }

    console.log('🔍 Processed members array:', JSON.stringify(members, null, 2))

    // Use minimal channel data similar to what worked for the "system" channel
    const channelData = {
      name: body.name,
      description: body.description || `${body.name} channel`,
      channelType: body.type || 'chat',
      reportType: 'general' as const,
      tenantId: id.toString(), // Ensure it's a string
      guardianAngelId: createdBy.toString(), // Ensure it's a string
      members,
      isPrivate: body.isPrivate || false,
      isSystem: body.isSystem || false,
      isVirtual: body.isVirtual || false,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log('🔍 Minimal channel data to be created:', JSON.stringify(channelData, null, 2))

    // Validate that all user IDs exist before creating the channel
    try {
      const userIds = members.map((m: any) => m.user)
      const existingUsers = await payload.find({
        collection: 'users',
        where: {
          id: {
            in: userIds
          }
        },
        limit: userIds.length
      })

      if (existingUsers.docs.length !== userIds.length) {
        const existingUserIds = existingUsers.docs.map(u => Number(u.id))
        const missingUserIds = userIds.filter((id: any) => !existingUserIds.includes(id))
        return NextResponse.json(
          { error: `Users not found: ${missingUserIds.join(', ')}` },
          { status: 400 }
        )
      }
    } catch (error) {
      console.error('Error validating users:', error)
      return NextResponse.json(
        { error: 'Failed to validate users' },
        { status: 500 }
      )
    }

    let channel
    try {
      console.log('🔧 Attempting to create channel...')
      channel = await payload.create({
        collection: 'channels',
        data: channelData
      })
      console.log('✅ Channel created successfully:', channel.id)
    } catch (createError) {
      console.error('❌ Channel creation failed:', createError)
      console.error('❌ Error details:', JSON.stringify(createError, null, 2))
      return NextResponse.json(
        { error: `Channel creation failed: ${createError instanceof Error ? createError.message : String(createError)}` },
        { status: 500 }
      )
    }

    // Transform response to match expected format
    const transformedChannel = {
      id: channel.id,
      name: channel.name,
      description: channel.description,
      type: channel.channelType,
      members: (channel.members || []).map((member: any) => member.user),
      isPrivate: channel.isPrivate,
      isSystem: channel.isSystem,
      isVirtual: channel.isVirtual,
      tenantId: channel.tenantId,
      createdAt: channel.createdAt,
      status: channel.status
    }

    return NextResponse.json(transformedChannel)
  } catch (error) {
    console.error('Error creating channel:', error)
    return NextResponse.json(
      { error: 'Failed to create channel' },
      { status: 500 }
    )
  }
}

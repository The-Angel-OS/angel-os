import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

// GET /api/channels/[id]/permissions - Get channel permissions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    const channel = await payload.findByID({
      collection: 'channels',
      id,
      depth: 2
    })

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      )
    }

    // Return channel permissions and member list
    return NextResponse.json({
      permissions: (channel as any).permissions || {},
      members: channel.members || [],
      isSystem: channel.isSystem,
      createdBy: (channel as any).createdBy || channel.guardianAngelId
    })
  } catch (error) {
    console.error('Error fetching channel permissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    )
  }
}

// PATCH /api/channels/[id]/permissions - Update channel permissions
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const payload = await getPayload({ config })

    // Check if user has admin permission for this channel
    const channel = await payload.findByID({
      collection: 'channels',
      id,
      depth: 1
    })

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      )
    }

    if (channel.isSystem) {
      return NextResponse.json(
        { error: 'Cannot modify system channel permissions' },
        { status: 403 }
      )
    }

    // TODO: Check if current user has admin permission
    // For now, allow all updates

    const updatedChannel = await payload.update({
      collection: 'channels',
      id,
      data: {
        ...(body.permissions && { permissions: body.permissions } as any),
        ...(body.members && { members: body.members })
      }
    })

    return NextResponse.json(updatedChannel)
  } catch (error) {
    console.error('Error updating channel permissions:', error)
    return NextResponse.json(
      { error: 'Failed to update permissions' },
      { status: 500 }
    )
  }
}


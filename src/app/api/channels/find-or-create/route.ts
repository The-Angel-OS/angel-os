import { NextRequest, NextResponse } from 'next/server'
import { findOrCreateChannel } from '@/utilities/channel-resolution'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      channelType,
      reportType,
      tenantId,
      guardianAngelId
    } = body

    // Use shared utility for consistent channel creation
    const channel = await findOrCreateChannel({
      name,
      channelType,
      reportType,
      tenantId,
      guardianAngelId
    })

    return NextResponse.json(channel)

  } catch (error) {
    console.error('Error finding or creating channel:', error)
    return NextResponse.json(
      { error: 'Failed to find or create channel' },
      { status: 500 }
    )
  }
}

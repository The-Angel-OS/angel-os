import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { findOrCreateChannel } from '@/utilities/channel-resolution'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { guestSessionId, userId, tenantId } = await request.json()

    if (!guestSessionId || !userId || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required fields: guestSessionId, userId, tenantId' },
        { status: 400 }
      )
    }

    console.log(`🔄 Promoting guest session ${guestSessionId} to user ${userId}`)

    // 1. Find the web chat session
    const webChatSessions = await payload.find({
      collection: 'web-chat-sessions',
      where: {
        'visitorInfo.sessionId': { equals: guestSessionId }
      },
      limit: 1
    })

    if (webChatSessions.docs.length === 0) {
      return NextResponse.json(
        { error: 'Guest session not found' },
        { status: 404 }
      )
    }

    const webChatSession = webChatSessions.docs[0]

    // 2. Find all messages from this web chat session
    const guestMessages = await payload.find({
      collection: 'messages',
      where: {
        webChatSessionId: { equals: guestSessionId }
      },
      sort: 'createdAt',
      limit: 1000 // Reasonable limit for guest sessions
    })

    console.log(`📝 Found ${guestMessages.docs.length} guest messages to promote`)

    // 3. Create or find PM channel between user and LEO
    const pmChannel = await findOrCreateChannel({
      name: `pm_${userId}_leo`,
      channelType: 'communication',
      reportType: 'general',
      tenantId: tenantId.toString(),
      guardianAngelId: '1', // LEO's ID
      members: [userId.toString(), 'leo'],
      isPrivate: true,
      metadata: {
        type: 'direct_message',
        participants: [userId.toString(), 'leo'],
        promotedFromGuestSession: guestSessionId
      }
    })

    console.log(`✅ Created/found PM channel: ${pmChannel?.id}`)

    // 4. Option A (simple): Create one summary message with transcript
    if (guestMessages.docs.length > 0) {
      // Create markdown transcript
      const transcript = guestMessages.docs.map(msg => {
        const content = typeof msg.content === 'object' && msg.content && !Array.isArray(msg.content) && 'text' in msg.content
          ? (msg.content as any).text 
          : JSON.stringify(msg.content)
        const sender = msg.messageType === 'leo' ? 'LEO AI' : 'Guest User'
        const timestamp = new Date(msg.createdAt).toLocaleString()
        return `**${sender}** (${timestamp}): ${content}`
      }).join('\n\n')

      const summaryMessage = await payload.create({
        collection: 'messages',
        data: {
          content: {
            type: 'text',
            text: `**Imported Guest Session Transcript**\n\n${transcript}`,
            metadata: {
              source: 'guest-promotion',
              originalGuestSessionId: guestSessionId,
              messageCount: guestMessages.docs.length
            }
          },
          messageType: 'system',
          sender: userId,
          space: pmChannel ? parseInt(pmChannel.tenantId) : 1,
          channel: pmChannel?.id || 1,
          priority: 'normal',
          conversationContext: {
            intent: 'guest_session_promotion',
            phase: 'imported',
            history: []
          }
        }
      })

      console.log(`✅ Created summary message: ${summaryMessage.id}`)
    }

    // 5. Mark web chat session as resolved (closest valid status to promoted)
    if (webChatSession) {
      await payload.update({
        collection: 'web-chat-sessions',
        id: webChatSession.id,
        data: {
          status: 'resolved', // Use valid status instead of 'promoted'
          analytics: {
            ...webChatSession.analytics,
            // Mark as promoted by setting endTime
            endTime: new Date().toISOString(),
            duration: webChatSession.analytics?.startTime 
              ? Math.round((Date.now() - new Date(webChatSession.analytics.startTime).getTime()) / 1000)
              : undefined
          }
        }
      })
    }

    console.log(`✅ Marked guest session as promoted`)

    return NextResponse.json({
      success: true,
      pmChannelId: pmChannel?.id || null,
      messagesPromoted: guestMessages.docs.length,
      guestSessionId
    })

  } catch (error) {
    console.error('Error promoting guest session:', error)
    return NextResponse.json(
      { error: 'Failed to promote guest session' },
      { status: 500 }
    )
  }
}

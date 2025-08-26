import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { BusinessAgent } from '@/services/BusinessAgent'
import { logBusiness, logInfo } from '@/services/SystemMonitorService'
import { getSystemChannel } from '@/utilities/channel-resolution'

// Generate a session ID for web chat
function generateSessionId(): string {
  return `webchat_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

// Hash IP address for privacy
function hashIP(ip: string): string {
  // Simple hash for privacy - use crypto.createHash in production
  return `hashed_${ip.length}_${ip.charCodeAt(0)}`
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Web-chat API called')
    const payload = await getPayload({ config: configPromise })
    
    let body: any = {}
    try {
      body = await request.json()
      console.log('✅ JSON parsed successfully')
    } catch (jsonError) {
      console.error('❌ JSON parsing failed:', jsonError)
      return NextResponse.json({
        error: 'Invalid JSON in request body',
        details: jsonError instanceof Error ? jsonError.message : String(jsonError)
      }, { status: 400 })
    }
    
    const { 
      message, 
      sessionId: providedSessionId, 
      spaceId = 1, // Default space
      tenantId = 1, // Default tenant - should be determined by domain/context
      context = {},
      userAgent,
      referrer,
      pageUrl
    } = body

    console.log('📝 Web-chat request:', {
      message: message?.substring(0, 50) + '...',
      sessionId: providedSessionId?.substring(0, 12) + '...' || 'new',
      spaceId,
      tenantId,
      context
    })

    logInfo('Web chat message received', 'WebChat', { 
      message: message.substring(0, 50) + '...',
      sessionId: providedSessionId?.substring(0, 12) + '...' || 'new'
    })

    // Get session ID or create new one
    let sessionId = providedSessionId
    let webChatSession = null

    if (sessionId) {
      // Try to find existing session
      try {
        const sessions = await payload.find({
          collection: 'web-chat-sessions',
          where: {
            sessionId: { equals: sessionId },
            status: { in: ['active', 'waiting', 'agent_connected'] }
          },
          limit: 1
        })
        webChatSession = sessions.docs[0] || null
      } catch (error) {
        console.error('Error finding web chat session:', error)
      }
    }

    // Create new session if none exists
    if (!webChatSession) {
      sessionId = generateSessionId()

      try {
        webChatSession = await payload.create({
          collection: 'web-chat-sessions',
          data: {
            sessionId,
            space: spaceId,
            tenant: tenantId,
            status: 'active',
            visitorInfo: {
              ipAddress: hashIP('unknown'),
              userAgent: userAgent || 'unknown',
              referrer: referrer || 'direct',
              pageUrl: pageUrl || 'unknown'
            },
            analytics: {
              startTime: new Date().toISOString(),
              messageCount: 0
            },
            metadata: {
              variant: context.variant || 'business',
              conversationPhase: 'introduction'
            }
          }
        })
      } catch (error) {
        console.error('Error creating web chat session:', error)
        return NextResponse.json({ 
          error: 'Failed to create chat session',
          fallback: "I'm having trouble starting our conversation. Please try again."
        }, { status: 500 })
      }
    }

    // Enhanced intent detection for web chat
    let detectedIntent = {
      intent: 'web_chat_inquiry',
      confidence: 0.8,
      department: 'support'
    }

    // Detect onboarding/provisioning intents
    const lowerMessage = message.toLowerCase()
    if (lowerMessage.includes('setup') || lowerMessage.includes('onboard') || 
        lowerMessage.includes('create site') || lowerMessage.includes('new business') ||
        lowerMessage.includes('get started') || lowerMessage.includes('provision')) {
      detectedIntent = {
        intent: 'site_provisioning',
        confidence: 0.9,
        department: 'onboarding'
      }
    }

    // Get consistent system channel for all LEO conversations
    let systemChannel = null
    try {
      systemChannel = await getSystemChannel(tenantId)
    } catch (error) {
      console.warn('Could not get system channel, using fallback:', error)
    }

    // Create message record with proper validation (only if not already created)
    let messageDoc = null
    const existingMessageId = context?.messageId
    
    if (existingMessageId) {
      // Message was already created by the spaces interface, just reference it
      console.log('📝 Using existing user message ID:', existingMessageId)
      messageDoc = { id: existingMessageId, content: message }
    } else {
      // Create new message record for direct web-chat calls
      try {
        messageDoc = await payload.create({
          collection: 'messages',
          data: {
            content: {
              type: 'text',
              text: message,
              metadata: {
                source: 'web-chat',
                timestamp: new Date().toISOString(),
                channel: 'system'
              }
            },
            messageType: 'user',
            space: spaceId,
            sender: 1, // Kenneth Courtney
            channel: systemChannel?.id || 3, // Use found channel or fallback to 3
            priority: 'normal'
          }
        })
        console.log('✅ User message created:', messageDoc.id)
      } catch (messageError) {
        console.error('⚠️  Message creation failed, continuing without persistence:', messageError)
        // Continue without message persistence for now
        messageDoc = { id: `temp_${Date.now()}`, content: message }
      }
    }

    // Process with BusinessAgent using Claude-4-Sonnet (existing pipeline)
    console.log('Creating BusinessAgent for tenant:', tenantId)
    const agent = new BusinessAgent(tenantId.toString(), 'friendly')
    
    console.log('Calling LEO conversational interface with message:', message.substring(0, 50) + '...')
    // Generate LEO's response using new conversational CEO interface
    const leoResponse = await agent.handleConversationalRequest(message)
    console.log('LEO conversational response received:', leoResponse.substring(0, 100) + '...')

    // Enhance response for web chat context
    const enhancedResponse = await enhanceWebChatResponse(leoResponse, 'business', detectedIntent)

    // Create LEO's response message
    let leoMessageDoc = null
    try {
      leoMessageDoc = await payload.create({
        collection: 'messages',
        data: {
          content: {
            type: 'text',
            text: enhancedResponse,
            metadata: {
              source: 'leo-ai',
              timestamp: new Date().toISOString(),
              processingTime: Date.now() - Date.parse(messageDoc.createdAt || new Date().toISOString()),
              channel: 'system'
            }
          },
          messageType: 'leo',
          space: spaceId,
          sender: 1, // Kenneth Courtney (LEO responds as system user)
          channel: systemChannel?.id || 3, // Use same channel as user message
          priority: 'normal'
        }
      })
      console.log('✅ LEO message created:', leoMessageDoc.id)
    } catch (messageError) {
      console.error('⚠️  LEO message creation failed, returning response anyway:', messageError)
      // Continue without message persistence
      leoMessageDoc = { id: `temp_leo_${Date.now()}`, content: enhancedResponse }
    }

    // Update web chat session with new messages (only if they were created successfully)
    const currentMessages = Array.isArray(webChatSession.messages) ? webChatSession.messages : []
    const newMessageIds: any[] = []
    
    if (messageDoc && messageDoc.id && !messageDoc.id.toString().startsWith('temp_')) {
      newMessageIds.push(messageDoc.id)
    }
    if (leoMessageDoc && leoMessageDoc.id && !leoMessageDoc.id.toString().startsWith('temp_')) {
      newMessageIds.push(leoMessageDoc.id)
    }
    
    if (newMessageIds.length > 0) {
      try {
        await payload.update({
          collection: 'web-chat-sessions',
          id: webChatSession.id,
          data: {
            messages: [...currentMessages, ...newMessageIds] as any
          }
        })
        console.log('✅ Session updated with message IDs:', newMessageIds)
      } catch (sessionError) {
        console.error('⚠️  Session update failed:', sessionError)
      }
    }

    logBusiness('Web chat LEO response generated', { 
      sessionId: sessionId.substring(0, 12) + '...',
      messageLength: enhancedResponse.length,
      intent: detectedIntent?.intent,
      processingTime: Date.now() - Date.parse(messageDoc?.createdAt || new Date().toISOString())
    })

    return NextResponse.json({
      success: true,
      response: enhancedResponse,
      sessionId,
      messageId: leoMessageDoc?.id || `temp_${Date.now()}`,
      metadata: {
        intent: detectedIntent?.intent,
        confidence: detectedIntent?.confidence,
        processingTime: Date.now() - Date.parse(messageDoc?.createdAt || new Date().toISOString()),
        provider: 'claude-4-sonnet',
        isWebChat: true,
        messagePersisted: !!(messageDoc?.id && !messageDoc.id.toString().startsWith('temp_'))
      }
    })

  } catch (error) {
    console.error('Web chat API error:', error)
    logInfo('Web chat error', 'WebChat', { 
      error: error instanceof Error ? error.message : String(error) 
    })
    
    return NextResponse.json({ 
      error: 'Failed to process web chat message',
      fallback: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
      isWebChat: true
    }, { status: 500 })
  }
}

/**
 * Enhance LEO response for web chat users
 */
async function enhanceWebChatResponse(
  baseResponse: string, 
  variant?: string,
  detectedIntent?: any
): Promise<string> {
  
  // Check if this is already a rich conversational response from LEO
  if (baseResponse.includes('📊') || baseResponse.includes('📦') || baseResponse.includes('✅') || 
      baseResponse.includes('⚠️') || baseResponse.includes('📋') || baseResponse.includes('👥')) {
    // This is already a rich business response from LEO's conversational interface
    return baseResponse
  }

  // Add web chat specific enhancements only for basic responses
  let enhanced = baseResponse

  // Add onboarding guidance for site provisioning intents
  if (detectedIntent?.intent === 'site_provisioning') {
    enhanced += "\n\n*I can help you get started with Angel OS! I'll guide you through our onboarding questionnaire which will automatically configure your site based on your business type and needs. Would you like me to start the setup process?*"
    enhanced += "\n\n[Start Onboarding](/onboarding) - *Complete questionnaire and get your site configured automatically*"
  } else if (!baseResponse.includes('I can help you')) {
    // Only add generic help text if LEO hasn't already provided specific help
    enhanced += "\n\n*I'm LEO, your AI assistant. I can help with questions about our services, provide information, or connect you with our team. How can I help you today?*"
  }

  return enhanced
}

/**
 * Get conversation history for web chat session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Get session
    const sessions = await payload.find({
      collection: 'web-chat-sessions',
      where: {
        sessionId: { equals: sessionId },
        status: { in: ['active', 'waiting', 'agent_connected'] }
      },
      limit: 1
    })

    if (sessions.docs.length === 0) {
      return NextResponse.json({ error: 'Session not found or inactive' }, { status: 404 })
    }

    const session = sessions.docs[0]

    // Get messages for this session
    const messages = await payload.find({
      collection: 'messages',
      where: {
        'conversationContext.sessionId': { equals: sessionId }
      },
      sort: 'createdAt',
      limit: 50
    })

    return NextResponse.json({
      success: true,
      sessionId,
      session,
      messages: messages.docs.map(msg => ({
        id: msg.id,
        content: msg.content || '',
        sender: msg.sender ? 'user' : 'leo',
        messageType: msg.messageType,
        timestamp: msg.createdAt,
        isWebChat: true,
        sessionId
      }))
    })

  } catch (error) {
    console.error('Error fetching web chat history:', error)
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { BusinessAgent } from '@/services/BusinessAgent'
import { logBusiness, logInfo } from '@/services/SystemMonitorService'
import { getSystemChannel } from '@/utilities/channel-resolution'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()
    
    const { message, context, spaceId = 1, tenantId = 1 } = body
    
    logInfo('Leo chat message received', 'LeoChat', { message: message.substring(0, 50) + '...' })
    
    // Get consistent system channel for all LEO conversations
    let systemChannel = null
    try {
      systemChannel = await getSystemChannel(tenantId)
    } catch (error) {
      console.warn('Could not get system channel, using fallback:', error)
    }
    
    // Create message record for Leo conversation
    let messageDoc = null
    try {
      messageDoc = await payload.create({
        collection: 'messages',
        data: {
          content: {
            type: 'text',
            text: message,
            metadata: {
              source: 'leo-chat',
              timestamp: new Date().toISOString()
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
      messageDoc = { id: `temp_${Date.now()}`, content: message }
    }

    // Process with BusinessAgent using Claude-4-Sonnet
    const agent = new BusinessAgent(tenantId, context?.variant === 'tactical' ? 'friendly' : 'professional')
    
    // Generate Leo's response using the existing Claude-4-Sonnet pipeline
    const leoResponse = await agent.generateIntelligentResponse(
      message,
      {
        customerName: 'User',
        previousMessages: context?.conversationHistory?.slice(-3).map((msg: any) => 
          `${msg.isShip ? 'Leo' : 'User'}: ${msg.content}`
        ) || [],
        urgency: 'normal'
      }
    )

    // Enhance response with Leo's Ship Mind personality
    const enhancedResponse = await enhanceLeoResponse(leoResponse, context?.variant, message)

    // Create Leo's response message
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
              channel: context?.channel || 'general'
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
      leoMessageDoc = { id: `temp_leo_${Date.now()}`, content: enhancedResponse }
    }

    logBusiness('Leo AI response generated', { 
      messageLength: enhancedResponse.length,
      variant: context?.variant,
      processingTime: Date.now() - Date.parse(messageDoc?.createdAt || new Date().toISOString())
    })

    return NextResponse.json({
      success: true,
      response: enhancedResponse,
      messageId: leoMessageDoc.id,
      metadata: {
        variant: context?.variant,
        processingTime: Date.now() - Date.parse(messageDoc?.createdAt || new Date().toISOString()),
        provider: 'claude-4-sonnet'
      }
    })

  } catch (error) {
    console.error('Leo chat API error:', error)
    logInfo('Leo chat error', 'LeoChat', { error: error instanceof Error ? error.message : String(error) })
    
    return NextResponse.json({ 
      error: 'Failed to process Leo chat message',
      fallback: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment."
    }, { status: 500 })
  }
}

/**
 * Enhance Claude-4-Sonnet response with Leo's Ship Mind personality
 */
async function enhanceLeoResponse(baseResponse: string, variant?: string, originalMessage?: string): Promise<string> {
  // Add Leo's Ship Mind personality traits
  const shipMindEnhancements = {
    tactical: {
      prefix: "ACKNOWLEDGED. ",
      style: "tactical and precise",
      signature: "\n\n*Leo Command Analysis Complete*"
    },
    business: {
      prefix: "",
      style: "collaborative and insightful", 
      signature: "\n\n*Your AI Guardian Angel, Leo*"
    }
  }

  const enhancement = shipMindEnhancements[variant as keyof typeof shipMindEnhancements] || shipMindEnhancements.business

  // For tactical variant, add command-style formatting
  if (variant === 'tactical') {
    return `${enhancement.prefix}${baseResponse.toUpperCase().substring(0, 50)}${baseResponse.substring(50)}${enhancement.signature}`
  }

  // For business variant, maintain professional but friendly tone
  return `${baseResponse}${enhancement.signature}`
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Leo Chat API operational',
    provider: 'claude-4-sonnet',
    capabilities: ['ship_mind_philosophy', 'business_intelligence', 'intent_analysis']
  })
}
















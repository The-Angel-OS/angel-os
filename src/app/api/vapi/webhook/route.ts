/**
 * VAPI.AI Webhook Integration
 * 
 * This endpoint handles VAPI voice AI webhooks and integrates them with
 * the Angel OS message pump and LEO business automation system.
 * 
 * Supports:
 * - Call start/end events
 * - Real-time transcription
 * - LEO conversation processing
 * - Business automation triggers
 * - Call analytics and logging
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { BusinessAgent } from '@/services/BusinessAgent'

interface VAPIWebhookEvent {
  type: 'call-start' | 'call-end' | 'transcript' | 'function-call' | 'error'
  call: {
    id: string
    assistantId: string
    phoneNumber: string
    customer: {
      number: string
    }
    startedAt?: string
    endedAt?: string
    duration?: number
    cost?: number
  }
  transcript?: {
    role: 'user' | 'assistant'
    message: string
    timestamp: string
  }
  functionCall?: {
    name: string
    parameters: any
  }
  error?: {
    message: string
    code: string
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📞 VAPI webhook called')
    const payload = await getPayload({ config: configPromise })
    
    const body: VAPIWebhookEvent = await request.json()
    const { type, call, transcript, functionCall, error } = body

    console.log('📝 VAPI webhook event:', {
      type,
      callId: call.id,
      assistantId: call.assistantId,
      customerNumber: call.customer.number
    })

    // Find the business agent associated with this VAPI assistant
    const businessAgents = await payload.find({
      collection: 'business-agents',
      where: {
        'vapiIntegration.assistantId': { equals: call.assistantId }
      },
      limit: 1
    })

    let tenantId = 1 // Default tenant
    let agent: BusinessAgent

    if (businessAgents.docs.length > 0) {
      const businessAgent = businessAgents.docs[0]
      tenantId = (typeof businessAgent?.tenant === 'number' ? businessAgent.tenant : (businessAgent?.tenant as any)?.id) || 1
      agent = new BusinessAgent(tenantId.toString(), 'friendly')
      
      console.log(`📞 Found business agent for tenant ${tenantId}`)
    } else {
      console.log('📞 No specific business agent found, using default')
      agent = new BusinessAgent('1', 'friendly')
    }

    let result: any = { success: true }

    // Handle different webhook event types
    switch (type) {
      case 'call-start':
        result = await handleCallStart(payload, call, tenantId)
        break
      case 'call-end':
        result = await handleCallEnd(payload, call, tenantId)
        break
      case 'transcript':
        result = await handleTranscript(payload, agent, call, transcript!, tenantId)
        break
      case 'function-call':
        result = await handleFunctionCall(agent, call, functionCall!, tenantId)
        break
      case 'error':
        result = await handleError(payload, call, error!, tenantId)
        break
      default:
        console.warn(`Unknown VAPI event type: ${type}`)
        result = { success: false, error: `Unknown event type: ${type}` }
    }

    // Update call statistics
    if (businessAgents.docs.length > 0) {
      if (businessAgents.docs[0]?.id) {
        await updateCallStatistics(payload, businessAgents.docs[0].id, type, call)
      }
    }

    return NextResponse.json({
      success: result.success,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ VAPI webhook error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * Handle call start event
 */
async function handleCallStart(payload: any, call: any, tenantId: number): Promise<any> {
  try {
    console.log(`📞 Call started: ${call.id}`)

    // Create a message to log the call start
    await payload.create({
      collection: 'messages',
      data: {
        content: {
          type: 'voice_ai',
          text: `Voice AI call started from ${call.customer.number}`,
          metadata: {
            source: 'vapi',
            callId: call.id,
            assistantId: call.assistantId,
            phoneNumber: call.phoneNumber,
            customerNumber: call.customer.number,
            startedAt: call.startedAt,
            eventType: 'call-start'
          }
        },
        messageType: 'system',
        space: tenantId,
        sender: 1, // System user
        priority: 'normal'
      }
    })

    return {
      success: true,
      message: 'Call start logged successfully'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Handle call end event
 */
async function handleCallEnd(payload: any, call: any, tenantId: number): Promise<any> {
  try {
    console.log(`📞 Call ended: ${call.id}, Duration: ${call.duration}s, Cost: $${call.cost}`)

    // Create a message to log the call end with analytics
    await payload.create({
      collection: 'messages',
      data: {
        content: {
          type: 'voice_ai',
          text: `Voice AI call ended. Duration: ${call.duration}s, Cost: $${call.cost}`,
          metadata: {
            source: 'vapi',
            callId: call.id,
            assistantId: call.assistantId,
            phoneNumber: call.phoneNumber,
            customerNumber: call.customer.number,
            startedAt: call.startedAt,
            endedAt: call.endedAt,
            duration: call.duration,
            cost: call.cost,
            eventType: 'call-end'
          }
        },
        messageType: 'system',
        space: tenantId,
        sender: 1, // System user
        priority: 'normal'
      }
    })

    return {
      success: true,
      message: 'Call end logged successfully',
      analytics: {
        duration: call.duration,
        cost: call.cost
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Handle transcript events (real-time conversation)
 */
async function handleTranscript(payload: any, agent: BusinessAgent, call: any, transcript: any, tenantId: number): Promise<any> {
  try {
    console.log(`📞 Transcript: ${transcript.role}: ${transcript.message.substring(0, 50)}...`)

    // Create message for the transcript
    const messageDoc = await payload.create({
      collection: 'messages',
      data: {
        content: {
          type: 'voice_ai',
          text: transcript.message,
          metadata: {
            source: 'vapi',
            callId: call.id,
            assistantId: call.assistantId,
            customerNumber: call.customer.number,
            role: transcript.role,
            timestamp: transcript.timestamp,
            eventType: 'transcript'
          }
        },
        messageType: transcript.role === 'user' ? 'user' : 'leo',
        space: tenantId,
        sender: transcript.role === 'user' ? 2 : 1, // Customer or LEO
        priority: 'normal'
      }
    })

    // If this is a user message, generate LEO response
    let leoResponse = null
    if (transcript.role === 'user') {
      try {
        leoResponse = await agent.handleConversationalRequest(transcript.message)

        // Create LEO response message
        await payload.create({
          collection: 'messages',
          data: {
            content: {
              type: 'voice_ai',
              text: leoResponse,
              metadata: {
                source: 'vapi-leo-response',
                callId: call.id,
                assistantId: call.assistantId,
                customerNumber: call.customer.number,
                originalMessage: transcript.message,
                timestamp: new Date().toISOString(),
                eventType: 'leo-response'
              }
            },
            messageType: 'leo',
            space: tenantId,
            sender: 1, // LEO
            priority: 'normal'
          }
        })

        console.log(`🤖 LEO response generated for voice call: ${leoResponse.substring(0, 50)}...`)
      } catch (leoError) {
        console.error('Failed to generate LEO response for voice call:', leoError)
      }
    }

    return {
      success: true,
      messageId: messageDoc.id,
      leoResponse,
      transcript: {
        role: transcript.role,
        message: transcript.message,
        timestamp: transcript.timestamp
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Handle function calls from VAPI (business automation)
 */
async function handleFunctionCall(agent: BusinessAgent, call: any, functionCall: any, tenantId: number): Promise<any> {
  try {
    console.log(`📞 Function call: ${functionCall.name}`, functionCall.parameters)

    let result: any = { success: false, error: 'Unknown function' }

    // Route function calls to appropriate business automation
    switch (functionCall.name) {
      case 'check_inventory':
        result = await agent.manageInventory('check', functionCall.parameters.productId)
        break
      case 'update_order_status':
        result = await agent.processOrderStatusChange(
          functionCall.parameters.orderId,
          functionCall.parameters.status,
          'Updated via voice AI call'
        )
        break
      case 'search_products':
        result = await agent.searchBusiness(functionCall.parameters.searchTerm, ['products'])
        break
      case 'generate_product_image':
        result = await agent.generateProductImages(functionCall.parameters.productId)
        break
      case 'database_query':
        result = await agent.executeDatabaseOperation(functionCall.parameters)
        break
      default:
        result = { success: false, error: `Unknown function: ${functionCall.name}` }
    }

    return {
      success: true,
      functionCall: functionCall.name,
      parameters: functionCall.parameters,
      result
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Handle error events
 */
async function handleError(payload: any, call: any, error: any, tenantId: number): Promise<any> {
  try {
    console.error(`📞 VAPI call error: ${error.message} (${error.code})`)

    // Log the error
    await payload.create({
      collection: 'messages',
      data: {
        content: {
          type: 'voice_ai',
          text: `Voice AI call error: ${error.message}`,
          metadata: {
            source: 'vapi',
            callId: call.id,
            assistantId: call.assistantId,
            customerNumber: call.customer.number,
            errorCode: error.code,
            errorMessage: error.message,
            eventType: 'error'
          }
        },
        messageType: 'system',
        space: tenantId,
        sender: 1, // System user
        priority: 'high'
      }
    })

    return {
      success: true,
      message: 'Error logged successfully',
      error: {
        code: error.code,
        message: error.message
      }
    }
  } catch (logError) {
    return {
      success: false,
      error: logError instanceof Error ? logError.message : String(logError)
    }
  }
}

/**
 * Update call statistics for business agent
 */
async function updateCallStatistics(payload: any, businessAgentId: number, eventType: string, call: any): Promise<void> {
  try {
    if (eventType === 'call-end') {
      // Get current stats
      const businessAgent = await payload.findByID({
        collection: 'business-agents',
        id: businessAgentId
      })

      const currentStats = businessAgent.vapiIntegration?.callStats || {
        totalCalls: 0,
        totalMinutes: 0,
        successRate: 100
      }

      // Update stats
      const newStats = {
        totalCalls: (currentStats.totalCalls || 0) + 1,
        totalMinutes: (currentStats.totalMinutes || 0) + Math.round((call.duration || 0) / 60),
        lastCallDate: call.endedAt || new Date().toISOString(),
        successRate: call.duration > 30 ? 100 : 90 // Simple success rate calculation
      }

      // Update business agent
      await payload.update({
        collection: 'business-agents',
        id: businessAgentId,
        data: {
          'vapiIntegration.callStats': newStats
        }
      })

      console.log(`📊 Updated call stats for business agent ${businessAgentId}:`, newStats)
    }
  } catch (error) {
    console.warn('Failed to update call statistics:', error)
  }
}

// GET endpoint for VAPI to test connectivity
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Angel OS VAPI webhook endpoint is active',
    timestamp: new Date().toISOString(),
    supportedEvents: [
      'call-start',
      'call-end', 
      'transcript',
      'function-call',
      'error'
    ],
    availableFunctions: [
      'check_inventory',
      'update_order_status',
      'search_products',
      'generate_product_image',
      'database_query'
    ]
  })
}

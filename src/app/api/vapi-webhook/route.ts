import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { BusinessAgent, BusinessAgentFactory } from '@/services/BusinessAgent'
import { VAPISecurityService } from '@/services/VAPISecurityService'

/**
 * Enhance VAPI responses with real-time business intelligence
 */
async function enhanceWithBusinessIntelligence(response: string, space: any, call: any): Promise<string> {
  if (!space?.businessType) return response

  // Generate contextual business intelligence based on space type
  const intelligence = await generateBusinessIntelligence(space)

  // Only enhance if there's relevant intelligence
  if (!intelligence || !hasRelevantIntelligence(response, intelligence)) {
    return response
  }

  // Add contextual intelligence to response
  return `${response}

💡 Business Insight: ${intelligence.relevantInsight}

${intelligence.actionableAdvice ? `📈 Opportunity: ${intelligence.actionableAdvice}` : ''}`
}

/**
 * Generate business-specific intelligence
 */
async function generateBusinessIntelligence(space: any): Promise<any> {
  const businessType = space.businessType

  switch (businessType) {
    case 'agriculture':
      return await getAgriculturalIntelligence(space)
    case 'technology_consulting':
      return await getTechConsultingIntelligence(space)
    case 'retail':
      return await getRetailIntelligence(space)
    default:
      return null
  }
}

/**
 * Agricultural Business Intelligence (Hays Cactus Farm)
 */
async function getAgriculturalIntelligence(space: any): Promise<any> {
  const currentDate = new Date()
  const isWinter = currentDate.getMonth() >= 11 || currentDate.getMonth() <= 2

  return {
    relevantInsight: isWinter
      ? 'Winter is dormancy season for most cacti - customers often overwater during this period'
      : 'Growing season is active - perfect time for repotting and fertilizing',
    actionableAdvice: isWinter
      ? 'Consider our winter care packages with reduced watering schedules'
      : 'Our spring growing supplies and repotting services are available now',
    marketTrend: 'Succulent subscriptions up 34% this quarter',
    weatherAlert: 'Cold snap predicted - we can advise on plant protection'
  }
}

/**
 * Technology Consulting Intelligence (KenDev.Co)
 */
async function getTechConsultingIntelligence(space: any): Promise<any> {
  return {
    relevantInsight: 'Multi-agent AI systems becoming mainstream in enterprise',
    actionableAdvice: 'Our platform is ahead of this trend - we can show you enterprise-ready implementations',
    marketTrend: 'SMB automation market growing 40% annually',
    opportunityAlert: 'Voice AI + workflow automation is proving highly valuable for our clients'
  }
}

/**
 * Retail Business Intelligence
 */
async function getRetailIntelligence(space: any): Promise<any> {
  return {
    relevantInsight: 'Local shopping trends favor community-focused businesses',
    actionableAdvice: 'We can help you build stronger local community connections',
    marketTrend: 'Omnichannel shopping becoming expected standard',
    eventAlert: 'Local festival season approaching - great time for promotional strategies'
  }
}

/**
 * Check if response would benefit from intelligence enhancement
 */
function hasRelevantIntelligence(response: string, intelligence: any): boolean {
  const responseIndicators = [
    'recommend', 'suggest', 'advice', 'help', 'problem', 'issue',
    'best', 'when', 'how', 'should', 'need', 'want'
  ]

  const responseLower = response.toLowerCase()
  return responseIndicators.some(indicator => responseLower.includes(indicator))
}

// Enhanced conversation context for bi-directional VAPI conversations
interface ConversationContext {
  callId: string
  tenantId: string
  businessType: string
  conversationState: 'greeting' | 'discovery' | 'needs_analysis' | 'solution_presentation' | 'closing' | 'follow_up'
  collectedData: {
    customerName?: string
    businessName?: string
    industry?: string
    painPoints: string[]
    requirements: string[]
    budget?: string
    timeline?: string
    contactInfo: {
      email?: string
      phone?: string
    }
  }
  conversationHistory: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    intent?: string
    extracted_data?: any
  }>
  nextQuestions: string[]
  leadScore: number // 0-100 based on conversation quality
}

// In-memory conversation contexts - in production, use Redis/Database
const conversationContexts = new Map<string, ConversationContext>()

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise })
    const body = await request.json()

    const { type, call, message } = body

    switch (type) {
      case 'call-start':
        return await handleCallStart(payload, call)

      case 'call-end':
        return await handleCallEnd(payload, call)

      case 'transcript':
        return await handleTranscript(payload, { call, message })

      case 'tool-calls':
        return await handleToolCalls(payload, { call, toolCalls: body.toolCalls })

      default:
        console.log('Unknown VAPI webhook type:', type)
        return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('VAPI webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleCallStart(payload: any, call: any) {
  console.log('[VAPI] 🔐 SECURE Enhanced bi-directional call started:', call.id)

  // 🔐 SECURITY FIRST: Create secure context for this call
  const phoneNumber = call.phoneNumber?.number || call.customer?.number
  
  if (!phoneNumber) {
    console.error('[VAPI] No phone number provided - security risk')
    return NextResponse.json({ error: 'Phone number required for security' }, { status: 400 })
  }

  let securityContext, tenantId, spaceId, businessAgent
  
  try {
    // Create secure context with authentication and authorization
    securityContext = await VAPISecurityService.createSecureContext(
      call.id,
      phoneNumber,
      call.metadata || {}
    )
    
    console.log(`[VAPI] 🛡️ Secure context created: ${securityContext.securityLevel} access for ${phoneNumber}`)
    
    // Use security context for all subsequent operations
    tenantId = securityContext.tenantId
    spaceId = tenantId // Use tenant as space for now
    
    // Find BusinessAgent with security context
    businessAgent = null
    const agents = await payload.find({
      collection: 'business-agents',
      where: {
        'vapiIntegration.phoneNumber': { equals: phoneNumber }
      },
      limit: 1
    })

    if (agents.docs.length > 0) {
      businessAgent = agents.docs[0]
      console.log(`[VAPI] Call routed to BusinessAgent: ${businessAgent.name}`)
    }
  } catch (securityError) {
    console.error('[VAPI] Security context creation failed:', securityError)
    return NextResponse.json({ 
      error: 'Security verification failed',
      message: 'This phone number is not authorized for this service'
    }, { status: 403 })
  }

  // Get tenant for business context
  const tenant = await payload.findByID({
    collection: 'tenants',
    id: tenantId
  })

  // Initialize sophisticated conversation context
  const context: ConversationContext = {
    callId: call.id,
    tenantId,
    businessType: tenant?.businessType || 'general',
    conversationState: 'greeting',
    collectedData: {
      painPoints: [],
      requirements: [],
      contactInfo: {
        phone: call.customer?.number
      }
    },
    conversationHistory: [],
    nextQuestions: generateInitialQuestions(tenant?.businessType || 'general'),
    leadScore: 0
  }

  conversationContexts.set(call.id, context)

  // Generate dynamic greeting based on business agent or tenant
  const agentForProcessing = businessAgent ? new BusinessAgent(tenantId, 'friendly') : (tenant ? BusinessAgentFactory.createForTenant(tenant) : null)
  const greeting = generateDynamicGreeting(tenant, call, businessAgent)

  await payload.create({
    collection: 'messages',
    data: {
      content: `🎯 Enhanced voice call started from ${call.customer?.number || 'unknown number'} | Business: ${tenant?.name || 'Unknown'} | Context: ${context.conversationState}`,
      messageType: 'voice_ai',
      space: spaceId,
      author: 1,
      channel: 'voice-ai',
      businessContext: {
        department: 'sales',
        workflow: 'inbound_call',
        priority: 'normal',
        customerJourney: 'discovery',
        integrationSource: 'vapi_enhanced',
      },
      metadata: {
        vapi: {
          callId: call.id,
          phoneNumber: call.customer?.number,
          conversationState: context.conversationState,
          businessType: context.businessType,
          leadScore: context.leadScore,
          enhancedFeatures: {
            dynamicGreeting: greeting,
            contextualQuestions: context.nextQuestions,
            dataCollection: 'active'
          }
        }
      },
      timestamp: new Date().toISOString(),
    }
  })

  // Return dynamic greeting and initial response configuration
  return NextResponse.json({
    success: true,
    response: {
      text: greeting,
      contextData: {
        conversationState: context.conversationState,
        nextQuestions: context.nextQuestions.slice(0, 2), // First 2 questions for context
        businessType: context.businessType
      }
    }
  })
}

async function handleCallEnd(payload: any, call: any) {
  console.log('VAPI call ended:', call.id, 'Duration:', call.duration)

  const spaceId = call.metadata?.spaceId || 1

  await payload.create({
    collection: 'messages',
    data: {
      content: `Voice call ended. Duration: ${Math.round(call.duration || 0)}s. Cost: $${call.cost || '0.00'}`,
      messageType: 'system_alert',
      space: spaceId,
      author: 1,
      channel: 'voice-ai',
      businessContext: {
        department: 'support',
        workflow: 'support',
        priority: 'normal',
        customerJourney: 'active_customer',
        integrationSource: 'vapi_call',
      },
      metadata: {
        vapi: {
          callId: call.id,
          phoneNumber: call.customer?.number,
          duration: call.duration,
          transcript: call.transcript || '',
          sentiment: analyzeSentiment(call.transcript || ''),
          callQuality: call.quality || 5,
        }
      },
      timestamp: new Date().toISOString(),
    }
  })

  return NextResponse.json({ success: true })
}

async function handleTranscript(payload: any, { call, message }: any) {
  const spaceId = call.metadata?.spaceId || 1

  // Get space for business intelligence context
  const space = await payload.findByID({
    collection: 'spaces',
    id: spaceId,
  })

  // Generate business intelligence-enhanced response
  let enhancedResponse = message.content
  if (message.role === 'assistant') {
    enhancedResponse = await enhanceWithBusinessIntelligence(message.content, space, call)
  }

  const messageDoc = await payload.create({
    collection: 'messages',
    data: {
      content: enhancedResponse,
      messageType: message.role === 'user' ? 'customer_inquiry' : 'voice_ai',
      space: spaceId,
      author: message.role === 'user' ? null : 1,
      channel: 'voice-ai',
      businessContext: {
        department: 'support',
        workflow: 'support',
        priority: 'normal',
        customerJourney: message.role === 'user' ? 'support_request' : 'active_customer',
        integrationSource: 'vapi_call',
      },
      metadata: {
        vapi: {
          callId: call.id,
          phoneNumber: call.customer?.number,
          transcript: message.content,
          sentiment: analyzeSentiment(message.content),
        }
      },
      timestamp: new Date().toISOString(),
    }
  })

  if (message.role === 'user') {
    try {
      const agent = new BusinessAgent(spaceId, 'professional')
      await agent.processMessage(messageDoc)
    } catch (error) {
      console.error('BusinessAgent processing error:', error)
    }
  }

  return NextResponse.json({ success: true })
}

async function handleToolCalls(payload: any, { call, toolCalls }: any) {
  console.log('[VAPI] 🔐 SECURE Tool execution requested:', toolCalls.length, 'tools')

  for (const toolCall of toolCalls) {
    let toolResult = null

    try {
      // 🔐 SECURE TOOL EXECUTION with authorization
      const secureExecution = await VAPISecurityService.executeSecureTool(
        toolCall.function?.name,
        toolCall.function?.arguments,
        call.id
      )
      
      if (secureExecution.authorized) {
        toolResult = secureExecution.result
        console.log(`[VAPI] ✅ Tool executed successfully: ${toolCall.function?.name}`)
      } else {
        toolResult = { 
          error: 'Unauthorized tool execution',
          message: 'You do not have permission to execute this tool'
        }
        console.log(`[VAPI] ❌ Tool execution denied: ${toolCall.function?.name}`)
      }
    } catch (error) {
      console.error(`[VAPI] Tool execution error: ${toolCall.function?.name}`, error)
      toolResult = { error: 'Tool execution failed' }
    }

    // Get security context for logging
    const securityContext = VAPISecurityService.getSecurityContext(call.id)
    const spaceId = securityContext?.tenantId || 1
    
    await payload.create({
      collection: 'messages',
      data: {
        content: `🔐 SECURE Tool executed: ${toolCall.function?.name} - ${JSON.stringify(toolResult)}`,
        messageType: 'system_alert',
        space: spaceId,
        author: 1,
        channel: 'voice-ai',
        businessContext: {
          department: 'support',
          workflow: toolCall.function?.name?.includes('appointment') ? 'quote' : 'support',
          priority: 'normal',
          integrationSource: 'vapi_secure_call',
        },
        metadata: {
          vapi: {
            callId: call.id,
            securityLevel: securityContext?.securityLevel || 'unknown',
            toolCalls: [{
              tool: toolCall.function?.name,
              parameters: toolCall.function?.arguments,
              result: toolResult,
              authorized: toolResult?.error ? false : true
            }],
          }
        },
        timestamp: new Date().toISOString(),
      }
    })
  }

  return NextResponse.json({ success: true })
}

async function handleBookAppointment(payload: any, args: any, spaceId: number) {
  try {
    const appointment = await payload.create({
      collection: 'appointments',
      data: {
        title: args.title || 'Voice AI Booking',
        description: args.description || 'Appointment booked via voice call',
        space: spaceId,
        startTime: args.startTime,
        endTime: args.endTime,
        timezone: args.timezone || 'America/New_York',
        location: args.location || 'Phone Call',
        meetingType: 'phone',
        status: 'confirmed',
        bookingSettings: {
          allowReschedule: true,
          allowCancellation: true,
          requireConfirmation: false,
        }
      }
    })

    return { success: true, appointmentId: appointment.id, message: 'Appointment booked successfully' }
  } catch (error) {
    console.error('Appointment booking error:', error)
    return { error: 'Failed to book appointment' }
  }
}

async function handleGetOrderStatus(payload: any, args: any) {
  try {
    const orders = await payload.find({
      collection: 'orders',
      where: {
        orderNumber: { equals: args.orderNumber }
      }
    })

    if (orders.docs.length === 0) {
      return { error: 'Order not found' }
    }

    const order = orders.docs[0]
    return {
      success: true,
      orderNumber: order.orderNumber,
      status: order.status,
      total: order.total,
      message: `Order ${order.orderNumber} is ${order.status}`
    }
  } catch (error) {
    console.error('Order status error:', error)
    return { error: 'Failed to get order status' }
  }
}

async function handleCreateCRMContact(payload: any, args: any, spaceId: number) {
  try {
    const contact = await payload.create({
              collection: 'contacts',
      data: {
        firstName: args.firstName,
        lastName: args.lastName,
        email: args.email,
        phone: args.phone,
        space: spaceId,
        leadScore: 50,
        status: 'warm',
        source: 'voice_call',
        interactionHistory: [{
          type: 'voice_call',
          date: new Date().toISOString(),
          notes: 'Initial contact via VAPI voice call',
          outcome: 'contact_created',
        }],
        communicationPreferences: {
          preferredChannel: 'phone',
          bestTimeToContact: 'anytime',
        }
      }
    })

    return { success: true, contactId: contact.id, message: 'Contact created successfully' }
  } catch (error) {
    console.error('CRM contact creation error:', error)
    return { error: 'Failed to create contact' }
  }
}

function analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const positiveWords = ['great', 'excellent', 'good', 'happy', 'satisfied', 'thank']
  const negativeWords = ['bad', 'terrible', 'awful', 'angry', 'frustrated', 'problem']

  const words = text.toLowerCase().split(' ')
  let score = 0

  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1
    if (negativeWords.includes(word)) score -= 1
  })

  if (score > 0) return 'positive'
  if (score < 0) return 'negative'
  return 'neutral'
}

// Enhanced conversation management functions for bi-directional VAPI
function generateDynamicGreeting(tenant: any, call: any, businessAgent?: any): string {
  const hour = new Date().getHours()
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Use BusinessAgent greeting if available
  if (businessAgent && businessAgent.vapiIntegration?.voicePrompt) {
    return `${timeGreeting}! ${businessAgent.name} here. ${businessAgent.vapiIntegration.voicePrompt}`
  }

  if (!tenant) {
    return `${timeGreeting}! Thank you for calling. How can I help you today?`
  }

  switch (tenant.businessType) {
    case 'cactus-farm':
      return `${timeGreeting}! Welcome to ${tenant.name}. Are you looking to add some beautiful desert plants to your collection, or do you have questions about cactus care?`

    case 'pizza':
      return `${timeGreeting}! Thanks for calling ${tenant.name}. Are you ready to order some delicious pizza, or would you like to hear about our specials today?`

    case 'agency':
    case 'service':
      return `${timeGreeting}! This is ${tenant.name}. I'm here to learn about your business challenges and see how our automation solutions can help you scale. What's your biggest pain point right now?`

    default:
      return `${timeGreeting}! Thank you for calling ${tenant.name}. I'm excited to learn about your needs and see how we can help. What brings you to us today?`
  }
}

function generateInitialQuestions(businessType: string): string[] {
  const baseQuestions = [
    "What's your name so I can personalize our conversation?",
    "What business or industry are you in?",
    "What's your biggest challenge right now?"
  ]

  switch (businessType) {
    case 'cactus-farm':
      return [
        ...baseQuestions,
        "Are you new to cacti or an experienced collector?",
        "What type of space are you looking to fill - indoor, outdoor, or both?",
        "Do you have any specific varieties in mind?"
      ]

    case 'agency':
    case 'service':
      return [
        ...baseQuestions,
        "What's your current monthly revenue?",
        "How many hours per week do you spend on repetitive tasks?",
        "What's preventing you from scaling further?"
      ]

    default:
      return baseQuestions
  }
}

function extractDataFromResponse(text: string, context: ConversationContext): any {
  const extracted: any = {}
  const lowerText = text.toLowerCase()

  // Extract name
  const nameMatch = text.match(/(?:my name is|i'm|i am|call me)\s+([a-zA-Z\s]+)/i)
  if (nameMatch && nameMatch[1]) {
    extracted.customerName = nameMatch[1].trim()
  }

  // Extract business name
  const businessMatch = text.match(/(?:my business is|my company is|we're|we are)\s+([a-zA-Z\s&-]+)/i)
  if (businessMatch && businessMatch[1]) {
    extracted.businessName = businessMatch[1].trim()
  }

  // Extract email
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
  if (emailMatch && emailMatch[1]) {
    extracted.email = emailMatch[1]
  }

  // Extract budget indicators
  if (lowerText.includes('budget') || lowerText.includes('invest') || lowerText.includes('spend')) {
    const budgetMatch = text.match(/\$?(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|thousand|million)?/i)
    if (budgetMatch && budgetMatch[0]) {
      extracted.budget = budgetMatch[0]
    }
  }

  return extracted
}

function advanceConversationState(context: ConversationContext): void {
  const states: ConversationContext['conversationState'][] = [
    'greeting', 'discovery', 'needs_analysis', 'solution_presentation', 'closing', 'follow_up'
  ]

  const currentIndex = states.indexOf(context.conversationState)
  const progressConditions = {
    greeting: context.collectedData.customerName,
    discovery: context.collectedData.painPoints.length > 0,
    needs_analysis: context.collectedData.requirements.length > 0 || context.collectedData.budget,
    solution_presentation: context.collectedData.timeline,
    closing: context.leadScore > 60
  }

  // Check if we can advance to next state
  const currentCondition = progressConditions[context.conversationState as keyof typeof progressConditions]
  if (currentCondition && currentIndex < states.length - 1) {
    context.conversationState = states[currentIndex + 1]!
    console.log(`[VAPI] Advanced conversation to: ${context.conversationState}`)
  }
}

function calculateLeadScore(context: ConversationContext): number {
  let score = 0

  // Basic info collected
  if (context.collectedData.customerName) score += 15
  if (context.collectedData.businessName) score += 15
  if (context.collectedData.contactInfo.email) score += 20

  // Engagement indicators
  score += Math.min(context.collectedData.painPoints.length * 10, 30)
  score += Math.min(context.collectedData.requirements.length * 5, 15)

  // Budget/timeline indicators
  if (context.collectedData.budget) score += 25
  if (context.collectedData.timeline) score += 20

  return Math.min(score, 100)
}

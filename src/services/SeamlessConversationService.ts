// Seamless Conversation Service - Angel OS "Her OS" Implementation
import { getPayload } from 'payload'
import config from '@payload-config'
import { VAPISecurityService } from './VAPISecurityService'

interface ConversationContext {
  sessionId: string
  tenantId: string
  customerId?: string
  currentMode: 'text' | 'voice' | 'avatar'
  productContext?: {
    productId: string
    productName: string
    category: string
    price: number
    pageUrl: string
  }
  siteContext?: {
    pageUrl: string
    referrer: string
    timeOnPage: number
    elementsViewed: string[]
  }
  conversationHistory: ConversationMessage[]
  preferences: {
    preferredMode: 'text' | 'voice' | 'avatar'
    voiceId?: string
    avatarPersonality?: string
    language: string
    timezone: string
  }
  businessContext: {
    department: string
    workflow: string
    priority: 'low' | 'normal' | 'high' | 'urgent'
    customerJourney: string
  }
  activeTools: string[]
  metadata: Record<string, any>
}

interface ConversationMessage {
  id: string
  content: string
  mode: 'text' | 'voice' | 'avatar'
  sender: 'customer' | 'angel' | 'system'
  timestamp: Date
  context?: {
    productId?: string
    toolUsed?: string
    confidence?: number
    sentiment?: string
  }
  metadata?: Record<string, any>
}

interface SeamlessModeSwitch {
  fromMode: 'text' | 'voice' | 'avatar'
  toMode: 'text' | 'voice' | 'avatar'
  reason: 'user_request' | 'context_optimization' | 'capability_requirement' | 'preference'
  contextPreserved: boolean
  transitionMessage: string
}

interface WidgetEmbedContext {
  siteUrl: string
  pageUrl: string
  productId?: string
  category?: string
  userSegment?: string
  embedConfig: {
    position: 'bottom-right' | 'bottom-left' | 'sidebar' | 'inline'
    theme: 'light' | 'dark' | 'auto'
    modes: ('text' | 'voice' | 'avatar')[]
    defaultMode: 'text' | 'voice' | 'avatar'
    contextAware: boolean
  }
}

export class SeamlessConversationService {
  private static activeConversations = new Map<string, ConversationContext>()
  
  /**
   * 🎯 INITIALIZE SEAMLESS CONVERSATION
   * Creates context-aware conversation session from widget embed
   */
  static async initializeConversation(
    embedContext: WidgetEmbedContext,
    customerInfo?: { phone?: string, email?: string, customerId?: string }
  ): Promise<ConversationContext> {
    const payload = await getPayload({ config })
    
    // Generate unique session ID
    const sessionId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Extract product context if productId provided
    let productContext = undefined
    if (embedContext.productId) {
      try {
        const product = await payload.findByID({
          collection: 'products',
          id: embedContext.productId
        })
        
        if (product) {
          productContext = {
            productId: product.id.toString(),
            productName: product.title,
            category: product.categories?.[0] ? 'product' : 'general',
            price: product.pricing.basePrice,
            pageUrl: embedContext.pageUrl
          }
        }
      } catch (error) {
        console.log('Product context not found, continuing without it')
      }
    }
    
    // Determine tenant from site URL
    const tenantId = await this.resolveTenantFromSite(embedContext.siteUrl)
    
    // Create conversation context
    const conversationContext: ConversationContext = {
      sessionId,
      tenantId,
      customerId: customerInfo?.customerId,
      currentMode: embedContext.embedConfig.defaultMode,
      productContext,
      siteContext: {
        pageUrl: embedContext.pageUrl,
        referrer: document?.referrer || 'direct',
        timeOnPage: 0,
        elementsViewed: []
      },
      conversationHistory: [],
      preferences: {
        preferredMode: embedContext.embedConfig.defaultMode,
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      businessContext: {
        department: this.inferDepartmentFromContext(productContext, embedContext),
        workflow: 'customer_inquiry',
        priority: 'normal',
        customerJourney: productContext ? 'product_interest' : 'general_inquiry'
      },
      activeTools: this.getAvailableTools(embedContext, productContext),
      metadata: {
        embedConfig: embedContext.embedConfig,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        screenResolution: typeof screen !== 'undefined' ? `${screen.width}x${screen.height}` : 'unknown'
      }
    }
    
    // Store conversation context
    this.activeConversations.set(sessionId, conversationContext)
    
    // Log conversation start
    await this.logConversationEvent(conversationContext, 'CONVERSATION_STARTED', {
      embedContext,
      customerInfo
    })
    
    return conversationContext
  }
  
  /**
   * 🔄 SEAMLESS MODE SWITCHING
   * Switch between text, voice, and avatar modes while preserving context
   */
  static async switchMode(
    sessionId: string,
    newMode: 'text' | 'voice' | 'avatar',
    reason: string = 'user_request'
  ): Promise<SeamlessModeSwitch> {
    const context = this.activeConversations.get(sessionId)
    
    if (!context) {
      throw new Error('Conversation context not found')
    }
    
    const fromMode = context.currentMode
    
    // Prepare mode switch
    const modeSwitch: SeamlessModeSwitch = {
      fromMode,
      toMode: newMode,
      reason: reason as any,
      contextPreserved: true,
      transitionMessage: this.generateTransitionMessage(fromMode, newMode, context)
    }
    
    // Handle mode-specific setup
    switch (newMode) {
      case 'voice':
        await this.setupVoiceMode(context)
        break
      case 'avatar':
        await this.setupAvatarMode(context)
        break
      case 'text':
        await this.setupTextMode(context)
        break
    }
    
    // Update context
    context.currentMode = newMode
    context.preferences.preferredMode = newMode
    
    // Add transition message to history
    context.conversationHistory.push({
      id: `transition_${Date.now()}`,
      content: modeSwitch.transitionMessage,
      mode: newMode,
      sender: 'system',
      timestamp: new Date(),
      context: {
        toolUsed: 'mode_switch'
      }
    })
    
    // Log mode switch
    await this.logConversationEvent(context, 'MODE_SWITCHED', modeSwitch)
    
    return modeSwitch
  }
  
  /**
   * 💬 PROCESS MESSAGE ACROSS MODES
   * Handle messages in any mode with full context awareness
   */
  static async processMessage(
    sessionId: string,
    content: string,
    mode: 'text' | 'voice' | 'avatar',
    metadata?: Record<string, any>
  ): Promise<ConversationMessage> {
    const context = this.activeConversations.get(sessionId)
    
    if (!context) {
      throw new Error('Conversation context not found')
    }
    
    // Create customer message
    const customerMessage: ConversationMessage = {
      id: `msg_${Date.now()}_customer`,
      content,
      mode,
      sender: 'customer',
      timestamp: new Date(),
      context: {
        productId: context.productContext?.productId,
        sentiment: this.analyzeSentiment(content)
      },
      metadata
    }
    
    // Add to conversation history
    context.conversationHistory.push(customerMessage)
    
    // Generate intelligent response with full context
    const angelResponse = await this.generateContextAwareResponse(context, customerMessage)
    
    // Add angel response to history
    context.conversationHistory.push(angelResponse)
    
    // Store in database
    await this.persistConversationMessages(context, [customerMessage, angelResponse])
    
    return angelResponse
  }
  
  /**
   * 🎭 SETUP VOICE MODE
   * Configure VAPI integration with security context
   */
  private static async setupVoiceMode(context: ConversationContext) {
    // Create VAPI security context if customer has phone
    if (context.metadata.customerPhone) {
      try {
        const securityContext = await VAPISecurityService.createSecureContext(
          `voice_${context.sessionId}`,
          context.metadata.customerPhone,
          {
            tenantId: context.tenantId,
            productContext: context.productContext,
            conversationHistory: context.conversationHistory.slice(-5)
          }
        )
        
        context.metadata.vapiSecurityContext = securityContext
      } catch (error) {
        console.log('VAPI security context creation failed, using text mode fallback')
      }
    }
    
    // Configure voice-specific tools
    context.activeTools.push('voice_commands', 'speech_to_text', 'text_to_speech')
  }
  
  /**
   * 🤖 SETUP AVATAR MODE (Future Implementation)
   * Configure lifelike avatar with gestures and expressions
   */
  private static async setupAvatarMode(context: ConversationContext) {
    // Future: Avatar personality configuration
    context.preferences.avatarPersonality = 'professional_friendly'
    
    // Future: Gesture and expression mapping
    context.activeTools.push('avatar_gestures', 'facial_expressions', 'eye_contact')
    
    // For now, use voice mode as base
    await this.setupVoiceMode(context)
  }
  
  /**
   * 📝 SETUP TEXT MODE
   * Configure text-based interaction
   */
  private static async setupTextMode(context: ConversationContext) {
    // Configure text-specific tools
    context.activeTools.push('rich_text', 'quick_replies', 'typing_indicators')
  }
  
  /**
   * 🧠 GENERATE CONTEXT-AWARE RESPONSE
   * Create intelligent responses based on full conversation context
   */
  private static async generateContextAwareResponse(
    context: ConversationContext,
    customerMessage: ConversationMessage
  ): Promise<ConversationMessage> {
    const payload = await getPayload({ config })
    
    // Build context-rich prompt
    const contextPrompt = this.buildContextPrompt(context, customerMessage)
    
    // Get tenant information for personalization
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: context.tenantId
    })
    
    // Generate response using AI (simplified for demo)
    let responseContent = await this.generateAIResponse(contextPrompt, tenant, context)
    
    // Add product-specific information if relevant
    if (context.productContext && this.isProductQuery(customerMessage.content)) {
      responseContent = this.enhanceWithProductInfo(responseContent, context.productContext)
    }
    
    // Create angel response
    const angelResponse: ConversationMessage = {
      id: `msg_${Date.now()}_angel`,
      content: responseContent,
      mode: context.currentMode,
      sender: 'angel',
      timestamp: new Date(),
      context: {
        productId: context.productContext?.productId,
        confidence: 0.9,
        toolUsed: 'context_aware_generation'
      }
    }
    
    return angelResponse
  }
  
  /**
   * 🏗️ BUILD CONTEXT PROMPT
   * Create comprehensive context for AI response generation
   */
  private static buildContextPrompt(
    context: ConversationContext,
    customerMessage: ConversationMessage
  ): string {
    const productInfo = context.productContext 
      ? `\n\nPRODUCT CONTEXT:\n- Product: ${context.productContext.productName}\n- Category: ${context.productContext.category}\n- Price: $${context.productContext.price}\n- Page: ${context.productContext.pageUrl}`
      : ''
    
    const conversationHistory = context.conversationHistory.slice(-5)
      .map(msg => `${msg.sender}: ${msg.content}`)
      .join('\n')
    
    return `You are an Angel OS AI assistant providing seamless customer support.

BUSINESS CONTEXT:
- Department: ${context.businessContext.department}
- Customer Journey: ${context.businessContext.customerJourney}
- Priority: ${context.businessContext.priority}
- Current Mode: ${context.currentMode}

SITE CONTEXT:
- Page URL: ${context.siteContext?.pageUrl}
- Time on page: ${context.siteContext?.timeOnPage}s${productInfo}

RECENT CONVERSATION:
${conversationHistory}

CUSTOMER MESSAGE: "${customerMessage.content}"

Provide a helpful, contextually relevant response. If discussing the product, be specific. If the customer needs to switch modes (voice for complex issues, text for quick questions), suggest it naturally.`
  }
  
  /**
   * 🤖 GENERATE AI RESPONSE
   * Simplified AI response generation (would use Claude/GPT in production)
   */
  private static async generateAIResponse(
    prompt: string,
    tenant: any,
    context: ConversationContext
  ): Promise<string> {
    // Simplified response generation for demo
    const businessName = tenant?.name || 'our business'
    
    if (context.productContext) {
      return `Hi! I can help you with ${context.productContext.productName}. What would you like to know about it? I can provide details, pricing, availability, or help you with an order. Would you prefer to continue chatting here or switch to a voice call for a more detailed discussion?`
    }
    
    return `Hello! Welcome to ${businessName}. I'm your AI assistant and I'm here to help. I can see you're on our website - what can I assist you with today? I can help via text chat, or if you prefer, we can switch to a voice conversation.`
  }
  
  /**
   * 🎯 UTILITY METHODS
   */
  private static async resolveTenantFromSite(siteUrl: string): Promise<string> {
    // Simplified tenant resolution - would use domain mapping in production
    return '1' // Default tenant
  }
  
  private static inferDepartmentFromContext(
    productContext?: any,
    embedContext?: WidgetEmbedContext
  ): string {
    if (productContext) return 'sales'
    if (embedContext?.pageUrl.includes('/support')) return 'support'
    return 'general'
  }
  
  private static getAvailableTools(
    embedContext: WidgetEmbedContext,
    productContext?: any
  ): string[] {
    const baseTools = ['general_inquiry', 'business_hours', 'contact_info']
    
    if (productContext) {
      baseTools.push('product_details', 'pricing', 'availability', 'add_to_cart')
    }
    
    if (embedContext.embedConfig.modes.includes('voice')) {
      baseTools.push('voice_call', 'appointment_booking')
    }
    
    return baseTools
  }
  
  private static generateTransitionMessage(
    fromMode: string,
    toMode: string,
    context: ConversationContext
  ): string {
    const transitions: Record<string, string> = {
      'text-voice': 'Switching to voice mode for a more personal conversation...',
      'voice-text': 'Continuing our conversation in text mode...',
      'text-avatar': 'Activating avatar mode for a more immersive experience...',
      'voice-avatar': 'Enhancing with visual avatar while maintaining voice...',
      'avatar-text': 'Switching to text mode for easier reference...',
      'avatar-voice': 'Continuing with voice-only mode...'
    }
    
    return transitions[`${fromMode}-${toMode}`] || `Switching from ${fromMode} to ${toMode} mode...`
  }
  
  private static analyzeSentiment(content: string): string {
    // Simplified sentiment analysis
    const positiveWords = ['great', 'excellent', 'love', 'perfect', 'amazing']
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'disappointed']
    
    const lowerContent = content.toLowerCase()
    
    if (positiveWords.some(word => lowerContent.includes(word))) return 'positive'
    if (negativeWords.some(word => lowerContent.includes(word))) return 'negative'
    return 'neutral'
  }
  
  private static isProductQuery(content: string): boolean {
    const productKeywords = ['price', 'cost', 'buy', 'purchase', 'order', 'product', 'item']
    return productKeywords.some(keyword => content.toLowerCase().includes(keyword))
  }
  
  private static enhanceWithProductInfo(response: string, productContext: any): string {
    return `${response}\n\nBy the way, I can see you're interested in ${productContext.productName} (${productContext.category}) for $${productContext.price}. Would you like me to add it to your cart or provide more details?`
  }
  
  /**
   * 💾 PERSISTENCE METHODS
   */
  private static async persistConversationMessages(
    context: ConversationContext,
    messages: ConversationMessage[]
  ) {
    const payload = await getPayload({ config })
    
    for (const message of messages) {
      await payload.create({
        collection: 'messages',
        data: {
          atProtocol: {
            type: 'app.angel.message',
            did: `did:angel:${context.sessionId}`,
            uri: `at://angel.os/${context.sessionId}/${message.id}`,
            cid: `cid:${message.id}`
          },
          content: message.content,
          messageType: message.sender === 'customer' ? 'user' : 'leo',
          space: parseInt(context.tenantId),
          channel: null, // TODO: Create/find channel relationship
          sender: 1,
          conversationContext: {
            department: context.businessContext.department,
            workflow: context.businessContext.workflow,
            customerJourney: context.businessContext.customerJourney,
              sessionId: context.sessionId,
              mode: message.mode,
              productContext: context.productContext,
              siteContext: context.siteContext
          }
        }
      })
    }
  }
  
  private static async logConversationEvent(
    context: ConversationContext,
    eventType: string,
    details: any = {}
  ) {
    // Skip activity logging for now as collection doesn't exist
    console.log(`[SeamlessConversation] ${eventType}:`, {
      sessionId: context.sessionId,
      currentMode: context.currentMode,
      productContext: context.productContext,
      ...details
    })
  }
  
  /**
   * 🧹 CLEANUP METHODS
   */
  static async endConversation(sessionId: string) {
    const context = this.activeConversations.get(sessionId)
    
    if (context) {
      // Cleanup VAPI security context if exists
      if (context.metadata.vapiSecurityContext) {
        await VAPISecurityService.destroySecurityContext(`voice_${sessionId}`)
      }
      
      // Log conversation end
      await this.logConversationEvent(context, 'CONVERSATION_ENDED')
      
      // Remove from active conversations
      this.activeConversations.delete(sessionId)
    }
  }
  
  static getActiveConversation(sessionId: string): ConversationContext | null {
    return this.activeConversations.get(sessionId) || null
  }
}

// Auto-cleanup inactive conversations every 30 minutes
setInterval(() => {
  const now = new Date()
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)
  
  for (const [sessionId, context] of SeamlessConversationService['activeConversations'].entries()) {
    const lastMessage = context.conversationHistory[context.conversationHistory.length - 1]
    if (lastMessage && lastMessage.timestamp < thirtyMinutesAgo) {
      SeamlessConversationService.endConversation(sessionId)
    }
  }
}, 30 * 60 * 1000) 
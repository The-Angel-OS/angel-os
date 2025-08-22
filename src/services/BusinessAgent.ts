/**
 * BusinessAgent - Core functionality for dynamic site creation
 * 
 * This is a clean restoration of the essential BusinessAgent functionality
 * needed for dynamic site creation, product catalog generation, and 
 * Claude-4-Sonnet integration.
 */

import { Anthropic } from '@anthropic-ai/sdk'
import { getPayload } from 'payload'
// import configPromise from '../../payload.config' // Import issue - using getPayload directly
import type { Message, Tenant } from '../payload-types'
import { RevenueService } from './RevenueService'

interface ContentManagementCapabilities {
  canCreateProducts: boolean
  canUpdateInventory: boolean
  canManageCategories: boolean
  canCreatePages: boolean
  canManagePosts: boolean
  canGenerateSchwag: boolean
}

interface MessageAnalysis {
  intent: string
  sentiment: 'positive' | 'negative' | 'neutral'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  suggestedActions: string[]
  businessContext: {
    department: string
    workflow: string
    customerJourney: string
  }
}

interface ProductGenerationRequest {
  businessType: string
  businessName?: string
  industry?: string
  targetAudience?: string
  priceRange?: { min: number; max: number }
  productCount?: number
  includeVariants?: boolean
  specialRequirements?: string
}

export class BusinessAgent {
  private tenantId: string
  private tenantIdNumber: number
  private personality: 'professional' | 'friendly' | 'casual'
  private capabilities: ContentManagementCapabilities
  private revenueService: RevenueService
  private anthropic: Anthropic | null

  constructor(tenantId: string, personality: 'professional' | 'friendly' | 'casual' = 'professional') {
    this.tenantId = tenantId
    this.tenantIdNumber = parseInt(tenantId)
    this.personality = personality
    this.revenueService = new RevenueService()
    this.capabilities = {
      canCreateProducts: true,
      canUpdateInventory: true,
      canManageCategories: true,
      canCreatePages: true,
      canManagePosts: true,
      canGenerateSchwag: true,
    }
    
    // Initialize Claude-4-Sonnet client
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
    console.log(`[BusinessAgent ${tenantId}] Initializing Anthropic client with key length:`, apiKey?.length || 0)
    
    if (!apiKey) {
      console.warn(`[BusinessAgent ${tenantId}] No Anthropic API key found - using fallback mode`)
      this.anthropic = null // Will use fallback responses
    } else {
      this.anthropic = new Anthropic({
        apiKey: apiKey,
      })
    }
  }

  /**
   * Core method for generating intelligent responses using Claude-4-Sonnet
   * This is the main method used by the message pump architecture
   */
  async generateIntelligentResponse(
    message: string, 
    context?: { 
      customerName?: string
      previousMessages?: string[]
      urgency?: string
    }
  ): Promise<string> {
    
    try {
      console.log(`[BusinessAgent ${this.tenantId}] Starting generateIntelligentResponse`)
      console.log(`[BusinessAgent ${this.tenantId}] Input message:`, message)
      console.log(`[BusinessAgent ${this.tenantId}] Anthropic client initialized:`, !!this.anthropic)
      
      // Check if Anthropic is available
      if (!this.anthropic) {
        console.warn(`[BusinessAgent ${this.tenantId}] Anthropic API not available, using fallback response`)
        return this.generateFallbackResponse(message, context)
      }
      
      const businessName = `Tenant ${this.tenantId}`
      const businessType = 'business'
      const customerName = context?.customerName || 'Customer'
      
      const conversationContext = context?.previousMessages && context.previousMessages.length > 0
        ? `\n\nPrevious conversation:\n${context.previousMessages.join('\n')}`
        : ''

      const urgencyNote = context?.urgency === 'high' ? '\n\nNote: This is a high-priority message requiring immediate attention.' : ''

      console.log(`[BusinessAgent ${this.tenantId}] Calling Anthropic API...`)
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        temperature: 0.4,
        messages: [{
          role: 'user',
          content: `You are LEO, the AI assistant for Angel OS. You're helping users with their dashboard and business operations. Generate a helpful, professional response to this user message.

Business Personality: ${this.personality}
User Name: ${customerName}
User Message: "${message}"${conversationContext}${urgencyNote}

Instructions:
- Be ${this.personality} but always helpful
- Address specific questions or concerns
- Help with dashboard navigation and features
- Suggest relevant tools or sections when appropriate
- Include next steps or guidance
- Keep response concise but comprehensive
- Use the user's name when appropriate
- If user asks about setup or configuration, guide them to the appropriate dashboard sections

Response:`
        }]
      })

      console.log(`[BusinessAgent ${this.tenantId}] Anthropic API response received`)
      const intelligentResponse = response.content[0]?.type === 'text' ? response.content[0].text : 'Thank you for your message. We will get back to you soon.'
      
      console.log(`[BusinessAgent ${this.tenantId}] Claude-4-Sonnet intelligent response generated:`, intelligentResponse.substring(0, 100) + '...')
      return intelligentResponse

    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Claude response generation failed:`, error)
      console.error(`[BusinessAgent ${this.tenantId}] API Key present:`, !!process.env.ANTHROPIC_API_KEY)
      console.error(`[BusinessAgent ${this.tenantId}] API Key length:`, process.env.ANTHROPIC_API_KEY?.length || 0)
      
      // Return more specific error for debugging
      if (error instanceof Error) {
        return `I'm experiencing technical difficulties: ${error.message}. Please try again in a moment.`
      }
      return 'Thank you for contacting us. We appreciate your message and will respond as soon as possible.'
    }
  }

  /**
   * Generate fallback response when Anthropic API is not available
   */
  private generateFallbackResponse(
    message: string, 
    context?: { customerName?: string; previousMessages?: string[]; urgency?: string }
  ): string {
    const customerName = context?.customerName || 'there'
    const lowerMessage = message.toLowerCase()
    
    // Context-aware fallback responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello ${customerName}! I'm LEO, your AI assistant. I'm currently running in local mode, but I'm still here to help you navigate Angel OS and answer questions about your workspace.`
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return `I can help you with:\n\n• Navigate your dashboard and find features\n• Explain how Angel OS works\n• Guide you through tenant management\n• Assist with product and content management\n• Answer questions about your workspace\n\nWhat would you like to know more about?`
    }
    
    if (lowerMessage.includes('tenant') || lowerMessage.includes('workspace')) {
      return `Your Angel OS workspace is set up with the KenDev.Co tenant. You can manage tenants, create new workspaces, and configure business settings through the Angel OS Control Panel. Would you like me to guide you to a specific section?`
    }
    
    if (lowerMessage.includes('product') || lowerMessage.includes('service')) {
      return `Your workspace includes 4 professional services: Spaces Platform Implementation, n8n Workflow Automation, VAPI Voice AI Integration, and AI Readiness Assessment. You can manage these through the admin panel or the dashboard. What would you like to do with your products?`
    }
    
    if (lowerMessage.includes('chat') || lowerMessage.includes('message')) {
      return `The chat system is working! You're successfully communicating with me through the Angel OS messaging infrastructure. The system supports real-time conversations, file uploads, and voice integration. How can I assist you further?`
    }
    
    // Default helpful response
    return `Thank you for your message, ${customerName}! I'm LEO, your AI assistant for Angel OS. I'm currently running in local mode but I'm fully functional. I can help you navigate your workspace, manage tenants, understand features, and answer questions about Angel OS. What would you like to explore?`
  }

  /**
   * Generate dynamic product catalog for different business types
   * Essential for dynamic site creation
   */
  async generateProductCatalog(request: ProductGenerationRequest): Promise<any[]> {
    const payload = await getPayload({ config: {} as any })

    try {
      console.log(`[Business Agent ${this.tenantId}] Generating ${request.businessType} catalog...`)

      switch (request.businessType) {
        case 'service':
          return await this.generateServiceOfferings(payload, request)
        case 'ecommerce':
          return await this.generateRetailCatalog(payload, request)
        case 'content':
          return await this.generateContentProducts(payload, request)
        default:
          return await this.generateGeneralCatalog(payload, request)
      }
    } catch (error) {
      console.error(`[Business Agent ${this.tenantId}] Catalog generation failed:`, error)
      return []
    }
  }

  /**
   * Generate service offerings for service businesses
   */
  private async generateServiceOfferings(payload: any, request: ProductGenerationRequest): Promise<any[]> {
    const services = [
      {
        title: 'Consultation',
        slug: 'consultation',
        description: `Professional consultation for your ${request.businessType} needs`,
        productType: 'service',
        pricing: { basePrice: 0, currency: 'USD' },
        tenant: this.tenantIdNumber,
        status: 'active'
      },
      {
        title: 'Installation',
        slug: 'installation',
        description: 'Expert installation services',
        productType: 'service',
        pricing: { basePrice: 150, currency: 'USD' },
        tenant: this.tenantIdNumber,
        status: 'active'
      },
      {
        title: 'Maintenance',
        slug: 'maintenance',
        description: 'Ongoing maintenance and support',
        productType: 'service',
        pricing: { basePrice: 100, currency: 'USD' },
        tenant: this.tenantIdNumber,
        status: 'active'
      }
    ]

    const createdProducts = []
    for (const service of services) {
      try {
        const product = await payload.create({
          collection: 'products',
          data: service
        })
        createdProducts.push(product)
      } catch (error) {
        console.error(`Failed to create service: ${service.title}`, error)
      }
    }

    return createdProducts
  }

  /**
   * Generate retail catalog for e-commerce businesses
   */
  private async generateRetailCatalog(payload: any, request: ProductGenerationRequest): Promise<any[]> {
    const products = [
      {
        title: 'Featured Product',
        slug: 'featured-product',
        description: 'Our most popular item',
        productType: 'physical',
        pricing: { basePrice: 29.99, currency: 'USD' },
        tenant: this.tenantIdNumber,
        status: 'active',
        featured: true
      },
      {
        title: 'Bestseller',
        slug: 'bestseller',
        description: 'Customer favorite product',
        productType: 'physical',
        pricing: { basePrice: 19.99, currency: 'USD' },
        tenant: this.tenantIdNumber,
        status: 'active'
      }
    ]

    const createdProducts = []
    for (const product of products) {
      try {
        const created = await payload.create({
          collection: 'products',
          data: product
        })
        createdProducts.push(created)
      } catch (error) {
        console.error(`Failed to create product: ${product.title}`, error)
      }
    }

    return createdProducts
  }

  /**
   * Generate content products for content creators
   */
  private async generateContentProducts(payload: any, request: ProductGenerationRequest): Promise<any[]> {
    const products = [
      {
        title: 'Premium Content',
        slug: 'premium-content',
        description: 'Exclusive content for subscribers',
        productType: 'digital',
        pricing: { basePrice: 9.99, currency: 'USD' },
        tenant: this.tenantIdNumber,
        status: 'active'
      },
      {
        title: 'Online Course',
        slug: 'online-course',
        description: 'Comprehensive learning experience',
        productType: 'digital',
        pricing: { basePrice: 49.99, currency: 'USD' },
        tenant: this.tenantIdNumber,
        status: 'active'
      }
    ]

    const createdProducts = []
    for (const product of products) {
      try {
        const created = await payload.create({
          collection: 'products',
          data: product
        })
        createdProducts.push(created)
      } catch (error) {
        console.error(`Failed to create content product: ${product.title}`, error)
      }
    }

    return createdProducts
  }

  /**
   * Generate general catalog for other business types
   */
  private async generateGeneralCatalog(payload: any, request: ProductGenerationRequest): Promise<any[]> {
    const products = [
      {
        title: 'Standard Service',
        slug: 'standard-service',
        description: `Professional ${request.businessType} service`,
        productType: 'service',
        pricing: { basePrice: 99.99, currency: 'USD' },
        tenant: this.tenantIdNumber,
        status: 'active'
      }
    ]

    const createdProducts = []
    for (const product of products) {
      try {
        const created = await payload.create({
          collection: 'products',
          data: product
        })
        createdProducts.push(created)
      } catch (error) {
        console.error(`Failed to create general product: ${product.title}`, error)
      }
    }

    return createdProducts
  }

  /**
   * Analyze message for business intelligence
   */
  async analyzeMessage(message: Pick<Message, 'id' | 'content' | 'messageType' | 'space' | 'sender' | 'createdAt' | 'updatedAt'>): Promise<MessageAnalysis> {
    try {
      // Simple analysis for now - can be enhanced with Claude later
      const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content)
      
      return {
        intent: 'general_inquiry',
        sentiment: 'neutral',
        priority: 'medium',
        suggestedActions: ['Respond to customer'],
        businessContext: {
          department: 'support',
          workflow: 'customer_service',
          customerJourney: 'engagement'
        }
      }
    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Message analysis failed:`, error)
      return {
        intent: 'unknown',
        sentiment: 'neutral',
        priority: 'low',
        suggestedActions: ['Review message manually'],
        businessContext: {
          department: 'support',
          workflow: 'manual_review',
          customerJourney: 'unknown'
        }
      }
    }
  }

  /**
   * Process message through the business agent pipeline
   */
  async processMessage(message: Pick<Message, 'id' | 'content' | 'messageType' | 'space' | 'sender' | 'createdAt' | 'updatedAt'>): Promise<MessageAnalysis> {
    return await this.analyzeMessage(message)
  }

  /**
   * Update inventory for a product
   */
  async updateInventory(productId: string, variationSku?: string, newQuantity?: number): Promise<boolean> {
    try {
      const payload = await getPayload({ config: {} as any })
      
      const updateData: any = {}
      if (newQuantity !== undefined) {
        updateData['inventory.quantity'] = newQuantity
      }

      await payload.update({
        collection: 'products',
        id: productId,
        data: updateData
      })

      console.log(`[BusinessAgent ${this.tenantId}] Updated inventory for product ${productId}`)
      return true
    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Failed to update inventory:`, error)
      return false
    }
  }

  /**
   * Create a blog post
   */
  async createBlogPost(title: string, content: string, category?: string): Promise<any> {
    try {
      const payload = await getPayload({ config: {} as any })
      
      const post = await payload.create({
        collection: 'posts',
        data: {
          title,
          content: {
            root: {
              type: 'root',
              version: 1,
              direction: 'ltr',
              format: '',
              indent: 0,
              children: [
                {
                  type: 'paragraph',
                  version: 1,
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  children: [{ 
                    type: 'text', 
                    text: content, 
                    version: 1,
                    format: 0,
                    mode: 'normal',
                    style: ''
                  }]
                }
              ]
            }
          },
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          publishedAt: new Date().toISOString(),
          _status: 'published'
        }
      })

      console.log(`[BusinessAgent ${this.tenantId}] Created blog post: ${title}`)
      return post
    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Failed to create blog post:`, error)
      return null
    }
  }

  // Revenue Analytics Methods
  async getRevenueAnalytics(): Promise<any> {
    try {
      const revenueService = new RevenueService()
      return await revenueService.getRevenueAnalytics(this.tenantId)
    } catch (error) {
      console.error('Error getting revenue analytics:', error)
      return { error: 'Failed to get revenue analytics' }
    }
  }

  async processMonthlyRevenue(): Promise<any> {
    try {
      const revenueService = new RevenueService()
      return await revenueService.processMonthlyRevenue(this.tenantId)
    } catch (error) {
      console.error('Error processing monthly revenue:', error)
      return { error: 'Failed to process monthly revenue' }
    }
  }

  async adjustPartnershipTier(newTier: string, negotiatedTerms: any): Promise<any> {
    try {
      const revenueService = new RevenueService()
      return await revenueService.adjustPartnershipTier(this.tenantId, newTier, negotiatedTerms)
    } catch (error) {
      console.error('Error adjusting partnership tier:', error)
      return { error: 'Failed to adjust partnership tier' }
    }
  }

  // Content Analysis Method
  async analyzeContent(prompt: string): Promise<any> {
    try {
      if (!this.anthropic) {
        throw new Error('Anthropic client not initialized')
      }
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `Analyze this content: ${prompt}`
          }
        ]
      })

      const content = response.content?.[0]
      const analysisText = content?.type === 'text' && 'text' in content ? content.text : 'No analysis available'
      
      return {
        analysis: analysisText,
        success: true
      }
    } catch (error) {
      console.error('Error analyzing content:', error)
      return { error: 'Failed to analyze content' }
    }
  }

  // Translation Methods
  async translateSiteContent(content: string, language: string): Promise<string> {
    try {
      if (!this.anthropic) {
        throw new Error('Anthropic client not initialized')
      }
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `Translate the following content to ${language}. Maintain formatting and structure: ${content}`
          }
        ]
      })

      const responseContent = response.content?.[0]
      return responseContent?.type === 'text' && 'text' in responseContent ? responseContent.text : content
    } catch (error) {
      console.error('Error translating content:', error)
      return content // Return original content on error
    }
  }

  async autoTranslatePage(pageData: any, language: string): Promise<any> {
    try {
      const translatedContent = await this.translateSiteContent(JSON.stringify(pageData), language)
      return JSON.parse(translatedContent)
    } catch (error) {
      console.error('Error auto-translating page:', error)
      return pageData // Return original page data on error
    }
  }

  async translateProductCatalog(products: any[], language: string): Promise<any[]> {
    try {
      const translatedProducts = await Promise.all(
        products.map(async (product) => {
          const translatedName = await this.translateSiteContent(product.name || '', language)
          const translatedDescription = await this.translateSiteContent(product.description || '', language)
          
          return {
            ...product,
            name: translatedName,
            description: translatedDescription
          }
        })
      )
      
      return translatedProducts
    } catch (error) {
      console.error('Error translating product catalog:', error)
      return products // Return original products on error
    }
  }

  async translateWithBusinessContext(text: string, language: string): Promise<string> {
    try {
      if (!this.anthropic) {
        throw new Error('Anthropic client not initialized')
      }
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `Translate this business text to ${language}, keeping business terminology accurate and professional: ${text}`
          }
        ]
      })

      const responseContent = response.content?.[0]
      return responseContent?.type === 'text' && 'text' in responseContent ? responseContent.text : text
    } catch (error) {
      console.error('Error translating with business context:', error)
      return text // Return original text on error
    }
  }
}

// Simple factory for creating tenant-specific agents
export class BusinessAgentFactory {
  static createForTenant(tenant: Tenant): BusinessAgent {
    let personality: 'professional' | 'friendly' | 'casual' = 'professional'

    // Customize personality based on business type
    if (tenant.businessType === 'cactus-farm') personality = 'friendly'
    if (tenant.businessType === 'salon') personality = 'friendly'

    return new BusinessAgent(tenant.id.toString(), personality)
  }
}

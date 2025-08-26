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
import { DatabaseTool } from './DatabaseTool'
import { ImageGenerationPipeline } from './ImageGenerationPipeline'

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
  private databaseTool: DatabaseTool
  private imageGenerator: ImageGenerationPipeline

  constructor(tenantId: string, personality: 'professional' | 'friendly' | 'casual' = 'professional') {
    this.tenantId = tenantId
    this.tenantIdNumber = parseInt(tenantId)
    this.personality = personality
    this.revenueService = new RevenueService()
    this.databaseTool = new DatabaseTool()
    this.imageGenerator = new ImageGenerationPipeline()
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
   * Query real Angel OS data to provide contextual responses
   */
  async queryAngelOSData(query: string): Promise<any> {
    try {
      const payload = await getPayload({ config: {} as any })
      const lowerQuery = query.toLowerCase()

      // Tenant information
      if (lowerQuery.includes('tenant') || lowerQuery.includes('provision')) {
        const tenants = await payload.find({
          collection: 'tenants',
          limit: 100,
        })
        return {
          type: 'tenants',
          count: tenants.totalDocs,
          data: tenants.docs.map(t => ({
            name: t.name,
            domain: t.domain,
            status: t.status,
            businessType: t.businessType,
          }))
        }
      }

      // Calendar/Events information
      if (lowerQuery.includes('calendar') || lowerQuery.includes('event') || lowerQuery.includes('appointment')) {
        const events = await payload.find({
          collection: 'events',
          where: {
            eventDate: {
              greater_than_equal: new Date().toISOString(),
            }
          },
          limit: 10,
          sort: 'eventDate',
        })
        return {
          type: 'events',
          count: events.totalDocs,
          data: events.docs.map(e => ({
            title: e.title,
            eventDate: e.eventDate,
            startTime: e.startTime,
            endTime: e.endTime,
            venue: e.venue?.name || 'TBD',
          }))
        }
      }

      // Products information
      if (lowerQuery.includes('product') || lowerQuery.includes('inventory')) {
        const products = await payload.find({
          collection: 'products',
          limit: 10,
        })
        return {
          type: 'products',
          count: products.totalDocs,
          data: products.docs.map(p => ({
            title: p.title,
            status: p.status,
            price: p.pricing?.basePrice,
            inventory: p.inventory?.quantity,
          }))
        }
      }

      // Contacts/CRM information
      if (lowerQuery.includes('contact') || lowerQuery.includes('customer') || lowerQuery.includes('crm')) {
        const contacts = await payload.find({
          collection: 'contacts',
          limit: 10,
        })
        return {
          type: 'contacts',
          count: contacts.totalDocs,
          data: contacts.docs.map(c => ({
            name: c.displayName,
            email: c.email,
            company: c.company,
            status: c.crm?.status,
          }))
        }
      }

      // Roadmap information
      if (lowerQuery.includes('roadmap') || lowerQuery.includes('feature') || lowerQuery.includes('development')) {
        const features = await payload.find({
          collection: 'roadmap-features',
          limit: 10,
        })
        return {
          type: 'roadmap',
          count: features.totalDocs,
          data: features.docs.map(f => ({
            title: f.title,
            status: f.status,
            priority: f.priority,
            progress: f.progress?.completionPercentage || 0,
            votes: f.voting?.votes || 0,
          }))
        }
      }

      return null
    } catch (error) {
      console.error('Error querying Angel OS data:', error)
      return null
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

      // Query real Angel OS data for context
      console.log(`[BusinessAgent ${this.tenantId}] Querying Angel OS data for context...`)
      const angelOSData = await this.queryAngelOSData(message)
      
      let dataContext = ''
      if (angelOSData) {
        console.log(`[BusinessAgent ${this.tenantId}] Found ${angelOSData.type} data:`, angelOSData.count, 'items')
        dataContext = `\n\nReal Angel OS Data (${angelOSData.type}): ${angelOSData.count} total items found.`
        
        if (angelOSData.data && angelOSData.data.length > 0) {
          dataContext += `\nRecent items: ${JSON.stringify(angelOSData.data.slice(0, 3), null, 2)}`
        }
      }

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
User Message: "${message}"${conversationContext}${urgencyNote}${dataContext}

Instructions:
- Be ${this.personality} but always helpful
- Address specific questions or concerns
- Use the real Angel OS data provided to give accurate, current information
- If data is available, provide specific counts and details
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

  // ========================================
  // ENHANCED BUSINESS AUTOMATION METHODS
  // ========================================

  /**
   * Execute database operations (LEO's database tool)
   */
  async executeDatabaseOperation(operation: any): Promise<any> {
    try {
      console.log(`[BusinessAgent ${this.tenantId}] Executing database operation:`, operation.operation, 'on', operation.collection)
      return await this.databaseTool.execute(operation)
    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Database operation failed:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Generate and upload images
   */
  async generateImage(request: any): Promise<any> {
    try {
      console.log(`[BusinessAgent ${this.tenantId}] Generating image:`, request.prompt?.substring(0, 50) + '...')
      return await this.imageGenerator.generateImage(request)
    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Image generation failed:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Process order status changes and trigger business automation
   */
  async processOrderStatusChange(orderId: string | number, newStatus: string, reason?: string): Promise<any> {
    try {
      console.log(`[BusinessAgent ${this.tenantId}] Processing order ${orderId} status change to: ${newStatus}`)

      // Update order status and handle inventory
      const results = await this.databaseTool.updateOrderStatus(orderId, newStatus)

      // Log the business operation
      await this.databaseTool.logBusinessOperation(
        'order_status_change',
        {
          orderId,
          newStatus,
          reason,
          results: results.map(r => ({ success: r.success, operation: r.operation, collection: r.collection }))
        },
        this.tenantIdNumber
      )

      // Generate intelligent response about what happened
      const inventoryUpdates = results.filter(r => r.operation === 'update' && r.collection === 'products')
      let responseMessage = `Order ${orderId} status updated to ${newStatus}.`
      
      if (inventoryUpdates.length > 0) {
        responseMessage += ` Inventory has been automatically updated for ${inventoryUpdates.length} product(s).`
      }

      return {
        success: true,
        message: responseMessage,
        results,
        automation: {
          orderUpdated: true,
          inventoryUpdated: inventoryUpdates.length > 0,
          productsAffected: inventoryUpdates.length
        }
      }

    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Order status change failed:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Intelligent inventory management
   */
  async manageInventory(action: 'check' | 'update' | 'reorder', productId?: string | number, quantity?: number): Promise<any> {
    try {
      console.log(`[BusinessAgent ${this.tenantId}] Managing inventory:`, action, productId ? `for product ${productId}` : 'for all products')

      switch (action) {
        case 'check':
          return await this.checkInventoryLevels(productId)
        case 'update':
          if (!productId || quantity === undefined) {
            throw new Error('Product ID and quantity required for inventory update')
          }
          return await this.databaseTool.updateInventory(productId, quantity)
        case 'reorder':
          return await this.suggestReorders(productId)
        default:
          throw new Error(`Unknown inventory action: ${action}`)
      }

    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Inventory management failed:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Check inventory levels and identify low stock
   */
  private async checkInventoryLevels(productId?: string | number): Promise<any> {
    const query = productId 
      ? { collection: 'products' as const, operation: 'findByID' as const, id: productId }
      : { collection: 'products' as const, operation: 'find' as const, limit: 100 }

    const result = await this.databaseTool.execute(query)

    if (!result.success) {
      return result
    }

    const products = productId ? [result.data] : result.data.docs
    const lowStockProducts = []
    const outOfStockProducts = []

    for (const product of products) {
      const quantity = product.inventory?.quantity || 0
      const lowStockThreshold = product.inventory?.lowStockThreshold || 10

      if (quantity === 0) {
        outOfStockProducts.push(product)
      } else if (quantity <= lowStockThreshold) {
        lowStockProducts.push(product)
      }
    }

    return {
      success: true,
      data: {
        totalProducts: products.length,
        lowStockProducts,
        outOfStockProducts,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length
      }
    }
  }

  /**
   * Suggest reorders based on inventory levels and sales data
   */
  private async suggestReorders(productId?: string | number): Promise<any> {
    const inventoryCheck = await this.checkInventoryLevels(productId)
    
    if (!inventoryCheck.success) {
      return inventoryCheck
    }

    const suggestions = []
    const { lowStockProducts, outOfStockProducts } = inventoryCheck.data

    // Combine low stock and out of stock for reorder suggestions
    const productsNeedingReorder = [...lowStockProducts, ...outOfStockProducts]

    for (const product of productsNeedingReorder) {
      const reorderQuantity = product.inventory?.reorderQuantity || 50
      const supplier = product.inventory?.supplier || 'Default Supplier'

      suggestions.push({
        productId: product.id,
        productName: product.title,
        currentQuantity: product.inventory?.quantity || 0,
        suggestedReorderQuantity: reorderQuantity,
        supplier,
        priority: product.inventory?.quantity === 0 ? 'urgent' : 'normal'
      })
    }

    return {
      success: true,
      data: {
        reorderSuggestions: suggestions,
        totalSuggestions: suggestions.length,
        urgentReorders: suggestions.filter(s => s.priority === 'urgent').length
      }
    }
  }

  /**
   * Generate product images for inventory items
   */
  async generateProductImages(productId: string | number, regenerate: boolean = false): Promise<any> {
    try {
      // Get product details
      const productResult = await this.databaseTool.execute({
        collection: 'products',
        operation: 'findByID',
        id: productId
      })

      if (!productResult.success || !productResult.data) {
        throw new Error('Product not found')
      }

      const product = productResult.data

      // Check if product already has images and we're not regenerating
      if (!regenerate && product.images && product.images.length > 0) {
        return {
          success: true,
          message: 'Product already has images. Use regenerate=true to create new ones.',
          existingImages: product.images
        }
      }

      // Generate image
      const imageResult = await this.imageGenerator.generateProductImage(
        product.title,
        product.description || '',
        productId
      )

      if (!imageResult.success) {
        return imageResult
      }

      // Update product with new image
      if (imageResult.images && imageResult.images.length > 0) {
        const imageIds = imageResult.images.map(img => img.mediaId)
        
        await this.databaseTool.execute({
          collection: 'products',
          operation: 'update',
          id: productId,
          data: {
            images: imageIds
          }
        })
      }

      return {
        success: true,
        message: `Generated ${imageResult.images?.length || 0} image(s) for product ${product.title}`,
        images: imageResult.images,
        productUpdated: true
      }

    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Product image generation failed:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Comprehensive business search across all collections
   */
  async searchBusiness(searchTerm: string, collections?: string[]): Promise<any> {
    try {
      console.log(`[BusinessAgent ${this.tenantId}] Searching business data for: "${searchTerm}"`)

      const defaultCollections = ['products', 'orders', 'contacts', 'messages', 'posts'] as const
      const searchCollections = collections || defaultCollections

      const results = await this.databaseTool.searchAcrossCollections(
        searchTerm, 
        searchCollections as any
      )

      // Count total results
      let totalResults = 0
      const summary: { [key: string]: number } = {}

      for (const [collection, result] of Object.entries(results)) {
        if (result.success && result.data?.docs) {
          const count = result.data.docs.length
          summary[collection] = count
          totalResults += count
        }
      }

      return {
        success: true,
        searchTerm,
        totalResults,
        summary,
        results
      }

    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Business search failed:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * LEO's Conversational CEO/Webmaster Interface
   * Natural language business management capabilities
   */

  /**
   * LEO's conversational business intelligence - CEO-level insights
   */
  async getBusinessInsights(query: string): Promise<string> {
    try {
      console.log(`[BusinessAgent ${this.tenantId}] LEO analyzing business data for: ${query}`)
      
      // Analyze what the user is asking for
      const lowerQuery = query.toLowerCase()
      let insights = ''
      
      if (lowerQuery.includes('sales') || lowerQuery.includes('revenue') || lowerQuery.includes('top selling')) {
        const salesData = await this.databaseTool.getBusinessAnalytics('orders', {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          end: new Date().toISOString()
        })
        
        if (salesData.success && salesData.data?.docs) {
          const orders = salesData.data.docs
          const totalRevenue = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0)
          insights = `📊 **Business Performance (Last 30 Days)**\n\n` +
                    `• **Total Orders**: ${orders.length}\n` +
                    `• **Total Revenue**: $${totalRevenue.toFixed(2)}\n` +
                    `• **Average Order Value**: $${(totalRevenue / orders.length || 0).toFixed(2)}`
        }
      }
      
      if (lowerQuery.includes('inventory') || lowerQuery.includes('stock') || lowerQuery.includes('products')) {
        const productData = await this.databaseTool.execute({
          collection: 'products',
          operation: 'find',
          limit: 100
        })
        
        if (productData.success && productData.data?.docs) {
          const products = productData.data.docs
          const lowStock = products.filter((p: any) => (p.inventory?.quantity || 0) < 10)
          const outOfStock = products.filter((p: any) => (p.inventory?.quantity || 0) === 0)
          
          insights += `\n\n📦 **Inventory Status**\n\n` +
                     `• **Total Products**: ${products.length}\n` +
                     `• **Low Stock Items**: ${lowStock.length} (< 10 units)\n` +
                     `• **Out of Stock**: ${outOfStock.length}`
          
          if (lowStock.length > 0) {
            insights += `\n\n⚠️ **Reorder Alerts**:\n`
            lowStock.slice(0, 5).forEach((product: any) => {
              insights += `• ${product.title}: ${product.inventory?.quantity || 0} units remaining\n`
            })
          }
        }
      }
      
      if (lowerQuery.includes('customers') || lowerQuery.includes('contacts')) {
        const contactData = await this.databaseTool.getBusinessAnalytics('contacts')
        if (contactData.success && contactData.data?.totalDocs) {
          insights += `\n\n👥 **Customer Base**\n\n` +
                     `• **Total Contacts**: ${contactData.data.totalDocs}\n` +
                     `• **Recent Signups**: ${contactData.data.docs?.length || 0} (latest)`
        }
      }
      
      return insights || "I can help you analyze sales, inventory, customers, and more. What specific business metrics would you like to see?"
      
    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Business insights error:`, error)
      return "I encountered an issue analyzing the business data. Let me know what specific information you need and I'll help you get it."
    }
  }

  /**
   * LEO's conversational order management
   */
  async handleOrderConversation(message: string): Promise<string> {
    try {
      const lowerMessage = message.toLowerCase()
      
      // Extract order ID if mentioned
      const orderIdMatch = message.match(/order\s*#?(\d+)/i)
      const orderId = orderIdMatch ? orderIdMatch[1] : null
      
      if (orderId) {
        if (lowerMessage.includes('ship') || lowerMessage.includes('fulfill')) {
          const results = await this.databaseTool.updateOrderStatus(orderId, 'shipped')
          const orderResult = results.find(r => r.collection === 'orders')
          const inventoryResults = results.filter(r => r.collection === 'products')
          
          if (orderResult?.success) {
            let response = `✅ **Order #${orderId} Updated**\n\n• Status changed to: **Shipped**\n`
            
            if (inventoryResults.length > 0) {
              response += `• Inventory updated for ${inventoryResults.length} products\n`
              response += `• All stock levels automatically adjusted`
            }
            
            return response
          }
        }
        
        if (lowerMessage.includes('status') || lowerMessage.includes('check')) {
          const orderResult = await this.databaseTool.execute({
            collection: 'orders',
            operation: 'findByID',
            id: orderId,
            depth: 2
          })
          
          if (orderResult.success && orderResult.data) {
            const order = orderResult.data
            return `📋 **Order #${orderId} Details**\n\n` +
                   `• **Status**: ${order.status || 'pending'}\n` +
                   `• **Total**: $${order.total || 0}\n` +
                   `• **Items**: ${order.items?.length || 0}\n` +
                   `• **Created**: ${new Date(order.createdAt).toLocaleDateString()}`
          }
        }
      }
      
      // General order queries
      if (lowerMessage.includes('recent orders') || lowerMessage.includes('latest orders')) {
        const ordersResult = await this.databaseTool.execute({
          collection: 'orders',
          operation: 'find',
          limit: 5,
          sort: '-createdAt'
        })
        
        if (ordersResult.success && ordersResult.data?.docs) {
          const orders = ordersResult.data.docs
          let response = `📋 **Recent Orders**\n\n`
          
          orders.forEach((order: any, index: number) => {
            response += `${index + 1}. **Order #${order.id}** - $${order.total || 0} (${order.status || 'pending'})\n`
          })
          
          return response
        }
      }
      
      return "I can help you manage orders! Try asking me to:\n• Ship order #123\n• Check order status\n• Show recent orders\n• Update order details"
      
    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Order conversation error:`, error)
      return "I had trouble with that order request. Can you provide the order number and what you'd like me to do?"
    }
  }

  /**
   * LEO's conversational inventory management
   */
  async handleInventoryConversation(message: string): Promise<string> {
    try {
      const lowerMessage = message.toLowerCase()
      
      // Extract product info if mentioned
      const productMatch = message.match(/product\s*#?(\d+)|"([^"]+)"/i)
      const productId = productMatch ? (productMatch[1] || productMatch[2]) : null
      
      if (productId) {
        if (lowerMessage.includes('update') || lowerMessage.includes('set') || lowerMessage.includes('change')) {
          const quantityMatch = message.match(/(\d+)\s*units?/i)
          const quantity = quantityMatch && quantityMatch[1] ? parseInt(quantityMatch[1]) : null
          
          if (quantity !== null && productId) {
            const result = await this.databaseTool.updateInventory(productId, quantity)
            if (result.success) {
              return `✅ **Inventory Updated**\n\n• Product: ${productId}\n• New quantity: ${quantity} units\n• Updated: ${new Date().toLocaleString()}`
            }
          }
        }
        
        if (lowerMessage.includes('check') || lowerMessage.includes('status')) {
          const productResult = await this.databaseTool.execute({
            collection: 'products',
            operation: 'findByID',
            id: productId!
          })
          
          if (productResult.success && productResult.data) {
            const product = productResult.data
            const quantity = product.inventory?.quantity || 0
            const status = quantity === 0 ? '🔴 Out of Stock' : quantity < 10 ? '🟡 Low Stock' : '🟢 In Stock'
            
            return `📦 **${product.title}**\n\n• **Stock**: ${quantity} units\n• **Status**: ${status}\n• **Last Updated**: ${new Date(product.inventory?.lastUpdated || product.updatedAt).toLocaleString()}`
          }
        }
      }
      
      // General inventory queries
      if (lowerMessage.includes('low stock') || lowerMessage.includes('reorder')) {
        const productsResult = await this.databaseTool.execute({
          collection: 'products',
          operation: 'find',
          limit: 50
        })
        
        if (productsResult.success && productsResult.data?.docs) {
          const lowStock = productsResult.data.docs.filter((p: any) => (p.inventory?.quantity || 0) < 10)
          
          if (lowStock.length > 0) {
            let response = `⚠️ **Low Stock Alert** (${lowStock.length} items)\n\n`
            lowStock.slice(0, 10).forEach((product: any, index: number) => {
              response += `${index + 1}. **${product.title}**: ${product.inventory?.quantity || 0} units\n`
            })
            return response
          } else {
            return `✅ **All Good!** No low stock items found.`
          }
        }
      }
      
      return "I can help you manage inventory! Try asking me to:\n• Check product #123 stock\n• Update product inventory to 50 units\n• Show low stock items\n• Set reorder alerts"
      
    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Inventory conversation error:`, error)
      return "I had trouble with that inventory request. Can you be more specific about which product and what you'd like me to do?"
    }
  }

  /**
   * LEO's master conversational interface - routes conversations to appropriate handlers
   */
  async handleConversationalRequest(message: string): Promise<string> {
    try {
      const lowerMessage = message.toLowerCase()
      
      // Route to appropriate conversation handler
      if (lowerMessage.includes('order') || lowerMessage.includes('ship') || lowerMessage.includes('fulfill')) {
        return await this.handleOrderConversation(message)
      }
      
      if (lowerMessage.includes('inventory') || lowerMessage.includes('stock') || lowerMessage.includes('product')) {
        return await this.handleInventoryConversation(message)
      }
      
      if (lowerMessage.includes('sales') || lowerMessage.includes('revenue') || lowerMessage.includes('analytics') || 
          lowerMessage.includes('performance') || lowerMessage.includes('insights') || lowerMessage.includes('customers')) {
        return await this.getBusinessInsights(message)
      }
      
      // Default: Use existing intelligent response with enhanced context
      return await this.generateIntelligentResponse(message, {
        customerName: 'Business Owner',
        previousMessages: [],
        urgency: 'normal'
      })
      
    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Conversational request failed:`, error)
      return "I'm here to help you manage your business! You can ask me about orders, inventory, sales analytics, or anything else you need assistance with."
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

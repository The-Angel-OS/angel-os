/**
 * BusinessAgent - Core functionality for dynamic site creation
 * 
 * This is a clean restoration of the essential BusinessAgent functionality
 * needed for dynamic site creation, product catalog generation, and 
 * Claude-4-Sonnet integration.
 */

import { Anthropic } from '@anthropic-ai/sdk'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Message, Tenant } from '@/payload-types'
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
  businessName: string
  targetAudience?: string
  priceRange?: { min: number; max: number }
  productCount?: number
  includeVariants?: boolean
}

export class BusinessAgent {
  private tenantId: string
  private tenantIdNumber: number
  private personality: 'professional' | 'friendly' | 'casual'
  private capabilities: ContentManagementCapabilities
  private revenueService: RevenueService
  private anthropic: Anthropic

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
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
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
      const businessName = `Tenant ${this.tenantId}`
      const businessType = 'business'
      const customerName = context?.customerName || 'Customer'
      
      const conversationContext = context?.previousMessages && context.previousMessages.length > 0
        ? `\n\nPrevious conversation:\n${context.previousMessages.join('\n')}`
        : ''

      const urgencyNote = context?.urgency === 'high' ? '\n\nNote: This is a high-priority message requiring immediate attention.' : ''

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 400,
        temperature: 0.4,
        messages: [{
          role: 'user',
          content: `You are the AI assistant for ${businessName}, a ${businessType}. Generate a helpful, professional response to this customer message.

Business Personality: ${this.personality}
Customer Name: ${customerName}
Customer Message: "${message}"${conversationContext}${urgencyNote}

Instructions:
- Be ${this.personality} but always helpful
- Address specific questions or concerns
- Suggest relevant products/services when appropriate
- Include next steps or call-to-action
- Keep response concise but comprehensive
- Use the customer's name when appropriate
- If customer asks about site setup, onboarding, or business configuration, offer to help them through the existing onboarding questionnaire
- For site provisioning requests, guide them to the existing /onboarding page where they can complete the questionnaire

Response:`
        }]
      })

      const intelligentResponse = response.content[0]?.type === 'text' ? response.content[0].text : 'Thank you for your message. We will get back to you soon.'
      
      console.log(`[BusinessAgent ${this.tenantId}] Claude-4-Sonnet intelligent response generated`)
      return intelligentResponse

    } catch (error) {
      console.error(`[BusinessAgent ${this.tenantId}] Claude response generation failed:`, error)
      return 'Thank you for contacting us. We appreciate your message and will respond as soon as possible.'
    }
  }

  /**
   * Generate dynamic product catalog for different business types
   * Essential for dynamic site creation
   */
  async generateProductCatalog(request: ProductGenerationRequest): Promise<any[]> {
    const payload = await getPayload({ config: configPromise })

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

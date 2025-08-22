/**
 * OnboardingIntegrationService
 * 
 * Connects the existing onboarding questionnaire to the existing seed script system
 * via the message pump architecture. Uses existing BusinessAgent + Claude-4-Sonnet
 * pipeline for conversational site provisioning.
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { BusinessAgent } from './BusinessAgent'
import { logBusiness } from './SystemMonitorService'

interface OnboardingQuestionnaireData {
  firstName: string
  lastName: string
  email: string
  role: string
  organization: string
  tenantName: string
  spaceName: string
  spaceType: string
  features: string[]
}

export class OnboardingIntegrationService {
  
  /**
   * Process onboarding questionnaire through existing message pump
   */
  static async processOnboardingQuestionnaire(
    questionnaireData: OnboardingQuestionnaireData,
    sessionId: string
  ): Promise<{
    success: boolean
    response: string
    provisioningPlan?: any
    nextSteps?: string[]
  }> {
    
    try {
      const payload = await getPayload({ config: configPromise })
      
      // Create a conversational message about the onboarding data
      const onboardingMessage = this.createOnboardingMessage(questionnaireData)
      
      // Send through existing BusinessAgent + Claude-4-Sonnet pipeline
      const agent = new BusinessAgent('1', 'professional') // Default tenant for onboarding
      
      const leoResponse = await agent.generateIntelligentResponse(
        onboardingMessage,
        {
          customerName: questionnaireData.firstName,
          previousMessages: [],
          urgency: 'normal'
          // isOnboarding and businessType properties not supported by BusinessAgent
        }
      )

      // Store the onboarding conversation in existing Messages collection
      await payload.create({
        collection: 'messages',
        data: {
          content: onboardingMessage,
          messageType: 'user',
          space: 1, // Default space
          sender: 1 // System user for onboarding
          // businessContext and conversationContext not supported by Messages collection
        }
      })

      // Create LEO's response message
      await payload.create({
        collection: 'messages',
        data: {
          content: leoResponse,
          messageType: 'leo',
          space: 1,
          sender: 1
          // businessContext and conversationContext not supported by Messages collection
        }
      })

      logBusiness('Onboarding questionnaire processed via message pump', {
        businessType: questionnaireData.spaceType,
        features: questionnaireData.features.length,
        sessionId: sessionId.substring(0, 12) + '...'
      })

      return {
        success: true,
        response: leoResponse,
        provisioningPlan: this.generateProvisioningPlan(questionnaireData),
        nextSteps: this.generateNextSteps(questionnaireData)
      }

    } catch (error) {
      console.error('Onboarding integration error:', error)
      return {
        success: false,
        response: "I apologize, but I'm having trouble processing your onboarding information. Please try again or contact our support team."
      }
    }
  }

  /**
   * Create a conversational message from questionnaire data
   */
  private static createOnboardingMessage(data: OnboardingQuestionnaireData): string {
    return `Hi! I just completed the onboarding questionnaire and here's my information:

Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Role: ${data.role}
Organization: ${data.organization}
Tenant Name: ${data.tenantName}
Space Name: ${data.spaceName}
Business Type: ${data.spaceType}
Requested Features: ${data.features.join(', ')}

I'd like to set up my Angel OS site with these specifications. Can you help me understand what will be created and guide me through the next steps?`
  }

  /**
   * Generate provisioning plan based on questionnaire data
   */
  private static generateProvisioningPlan(data: OnboardingQuestionnaireData) {
    return {
      tenant: {
        name: data.organization,
        slug: data.tenantName,
        businessType: data.spaceType
      },
      space: {
        name: data.spaceName,
        type: data.spaceType,
        features: data.features
      },
      defaultResources: {
        pages: this.getDefaultPages(data.spaceType),
        products: this.getDefaultProducts(data.spaceType),
        collections: this.getEnabledCollections(data.features)
      },
      seedTemplate: this.getSeedTemplate(data.spaceType)
    }
  }

  /**
   * Generate next steps based on business type
   */
  private static generateNextSteps(data: OnboardingQuestionnaireData): string[] {
    const baseSteps = [
      'Complete account setup and verify email',
      'Review your automatically generated site structure',
      'Customize your branding and content'
    ]

    switch (data.spaceType) {
      case 'service':
        return [
          ...baseSteps,
          'Set up your service offerings and pricing',
          'Configure appointment booking system',
          'Add your business location and contact info'
        ]
      case 'ecommerce':
        return [
          ...baseSteps,
          'Add your product catalog',
          'Configure payment processing',
          'Set up shipping and tax settings'
        ]
      case 'content':
        return [
          ...baseSteps,
          'Create your first blog post',
          'Set up social media integration',
          'Configure content monetization'
        ]
      default:
        return baseSteps
    }
  }

  /**
   * Get default pages for business type (connects to existing seed templates)
   */
  private static getDefaultPages(businessType: string): string[] {
    switch (businessType) {
      case 'service':
        return ['services', 'about', 'contact', 'booking']
      case 'ecommerce':
        return ['shop', 'about', 'contact', 'shipping', 'returns']
      case 'content':
        return ['blog', 'about', 'contact', 'subscribe']
      case 'community':
        return ['community', 'events', 'about', 'join']
      default:
        return ['home', 'about', 'contact']
    }
  }

  /**
   * Get default products for business type
   */
  private static getDefaultProducts(businessType: string): string[] {
    switch (businessType) {
      case 'service':
        return ['consultation', 'installation', 'maintenance']
      case 'ecommerce':
        return ['featured-product', 'bestseller']
      case 'content':
        return ['premium-content', 'course']
      default:
        return ['consultation']
    }
  }

  /**
   * Get enabled collections based on selected features
   */
  private static getEnabledCollections(features: string[]): string[] {
    const collections = ['pages', 'users', 'spaces'] // Always enabled
    
    if (features.includes('ecommerce')) {
      collections.push('products', 'orders')
    }
    if (features.includes('blog')) {
      collections.push('posts', 'categories')
    }
    if (features.includes('forms')) {
      collections.push('forms', 'form-submissions')
    }
    if (features.includes('analytics')) {
      collections.push('analytics')
    }
    if (features.includes('ai')) {
      collections.push('business-agents')
    }
    
    return collections
  }

  /**
   * Get seed template key for existing seed script system
   */
  private static getSeedTemplate(businessType: string): string {
    // Maps to existing TENANT_TEMPLATES in seed script
    switch (businessType) {
      case 'service':
        return 'service-business'
      case 'ecommerce':
        return 'ecommerce-store'
      case 'content':
        return 'content-creator'
      case 'community':
        return 'community-platform'
      default:
        return 'kendevco' // Default template
    }
  }
}

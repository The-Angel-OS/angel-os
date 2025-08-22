import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Channel } from '@/types/channels'
import type { ChannelManagement, Space } from '@/payload-types'

// Helper type to work with the actual database structure
export type DatabaseChannel = ChannelManagement & {
  slug?: string // Add slug as optional since it might not be in the actual schema
}

export class ChannelService {
  private static async getPayloadInstance() {
    return await getPayload({ config: configPromise })
  }

  /**
   * Get all channels for a specific space
   */
  static async getChannelsForSpace(spaceId: string): Promise<Channel[]> {
    try {
      const payload = await this.getPayloadInstance()
      
      const result = await payload.find({
        collection: 'channel-management',
        where: {
          and: [
            { space: { equals: spaceId } },
            { status: { equals: 'active' } }
          ]
        },
        sort: 'sortOrder',
        limit: 100
      })

      return result.docs.map((doc) => this.mapDatabaseChannelToChannel(doc as ChannelManagement))
    } catch (error) {
      console.error('Error fetching channels for space:', error)
      // Return default channels if database fails
      return this.getDefaultChannels()
    }
  }

  /**
   * Get channel by slug
   */
  static async getChannelBySlug(slug: string, spaceId?: string): Promise<Channel | null> {
    try {
      const payload = await this.getPayloadInstance()
      
      const where: any = {
        and: [
          { slug: { equals: slug } },
          { status: { equals: 'active' } }
        ]
      }

      if (spaceId) {
        where.and.push({ space: { equals: spaceId } })
      }

      const result = await payload.find({
        collection: 'channel-management',
        where,
        limit: 1
      })

      if (result.docs.length === 0) {
        return null
      }

      return this.mapDatabaseChannelToChannel(result.docs[0] as ChannelManagement)
    } catch (error) {
      console.error('Error fetching channel by slug:', error)
      // Return a default channel based on slug if database fails
      return this.getDefaultChannelBySlug(slug)
    }
  }

  /**
   * Get default channel by slug when database is unavailable
   */
  private static getDefaultChannelBySlug(slug: string): Channel | null {
    const defaultChannels = this.getDefaultChannels()
    return defaultChannels.find(channel => channel.id === slug) || null
  }

  /**
   * Create a new channel
   */
  static async createChannel(channelData: Partial<ChannelManagement>): Promise<Channel | null> {
    try {
      const payload = await this.getPayloadInstance()
      
      // Ensure space is a number if it's provided
      const spaceId = typeof channelData.space === 'object' && channelData.space 
        ? channelData.space.id 
        : channelData.space
      
      const result = await payload.create({
        collection: 'channel-management',
        data: {
          name: channelData.name || 'New Channel',
          space: spaceId as number,
          channelType: channelData.channelType || 'general',
          status: 'active' as const,
          category: channelData.category || 'business',
          sortOrder: channelData.sortOrder || 0,
          icon: channelData.icon || '💬',
          color: channelData.color || 'blue',
          autoAssignment: channelData.autoAssignment ?? true,
          webChatEnabled: channelData.webChatEnabled ?? true,
          vapiEnabled: channelData.vapiEnabled ?? false,
          metadata: channelData.metadata || {}
        }
      })

      return this.mapDatabaseChannelToChannel(result as ChannelManagement)
    } catch (error) {
      console.error('Error creating channel:', error)
      return null
    }
  }

  /**
   * Get channels organized by category
   */
  static async getChannelsByCategory(spaceId: string): Promise<Record<string, Channel[]>> {
    const channels = await this.getChannelsForSpace(spaceId)
    
    const categorized: Record<string, Channel[]> = {
      business: [],
      customer_service: [],
      collections: [],
      logs: [],
      system: [],
      custom: []
    }

    channels.forEach(channel => {
      const category = (channel as any).category || 'business'
      if (categorized[category]) {
        categorized[category].push(channel)
      } else if (categorized.custom) {
        categorized.custom.push(channel)
      }
    })

    return categorized
  }

  /**
   * Map database channel to UI channel format
   */
  private static mapDatabaseChannelToChannel(dbChannel: ChannelManagement): Channel {
    // Map channel type to component
    const componentMap = {
      'general': 'ChatContainer',
      'customer_support': 'CustomerContainer',
      'sales_inquiries': 'CustomerContainer',
      'technical_support': 'SystemContainer',
      'billing': 'OrdersManager'
    } as const

    // Map channel type to UI type
    const typeMap = {
      'general': 'chat',
      'customer_support': 'customers',
      'sales_inquiries': 'customers',
      'technical_support': 'system',
      'billing': 'orders'
    } as const

    // Generate slug from name if not provided
    const slug = (dbChannel as any).slug || dbChannel.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    
    return {
      id: slug, // Use slug as ID for routing
      name: dbChannel.name,
      icon: dbChannel.icon || '💬',
      type: typeMap[dbChannel.channelType] || 'chat',
      component: componentMap[dbChannel.channelType] || 'ChatContainer',
      description: `${dbChannel.name} - ${dbChannel.channelType.replace('_', ' ')}`,
      messageTypes: this.getMessageTypesForChannelType(dbChannel.channelType),
      aiContext: this.getAIContextForChannelType(dbChannel.channelType),
      // Add database-specific fields
      category: dbChannel.category || undefined,
      sortOrder: dbChannel.sortOrder || undefined,
      color: dbChannel.color || undefined,
      slug: slug
    } as Channel & { category?: string; sortOrder?: number; color?: string; slug: string }
  }

  /**
   * Get default channels if database is unavailable
   */
  private static getDefaultChannels(): Channel[] {
    return [
      {
        id: 'general',
        name: 'general',
        icon: '#',
        type: 'chat',
        component: 'ChatContainer',
        description: 'Team communication and Leo AI assistance',
        messageTypes: ['team_message', 'system_notification', 'ai_response'],
        aiContext: 'business_advisor'
      },
      {
        id: 'customers',
        name: 'customers',
        icon: '👥',
        type: 'customers',
        component: 'CustomerContainer',
        badge: 12,
        permissions: ['customers.read'],
        description: 'All customer interactions and support',
        messageTypes: ['web_chat', 'social_media', 'support_ticket', 'customer_inquiry'],
        aiContext: 'customer_service'
      }
    ]
  }

  private static getMessageTypesForChannelType(channelType: string): string[] {
    const messageTypeMap = {
      'general': ['team_message', 'system_notification', 'ai_response'],
      'customer_support': ['web_chat', 'social_media', 'support_ticket', 'customer_inquiry'],
      'sales_inquiries': ['sales_inquiry', 'lead_generation', 'quote_request'],
      'technical_support': ['system_log', 'error_report', 'technical_inquiry'],
      'billing': ['payment_notification', 'invoice_request', 'billing_inquiry']
    }
    return messageTypeMap[channelType as keyof typeof messageTypeMap] || ['general_message']
  }

  private static getAIContextForChannelType(channelType: string): string {
    const contextMap = {
      'general': 'business_advisor',
      'customer_support': 'customer_service',
      'sales_inquiries': 'sales_advisor',
      'technical_support': 'technical_advisor',
      'billing': 'billing_advisor'
    }
    return contextMap[channelType as keyof typeof contextMap] || 'business_advisor'
  }
}

export default ChannelService

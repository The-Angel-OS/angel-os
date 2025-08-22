import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Message, User as PayloadUser } from '@/payload-types'

interface ChannelAgent {
  id: string
  name: string
  type: 'leo-ai' | 'andrew-martin' | 'custom'
  isActive: boolean
  lastResponseTime?: Date
  expertise?: string[]
}

interface ChannelProcessingContext {
  channelId: string
  spaceId: string
  message: Message
  author: PayloadUser
  agents: ChannelAgent[]
  recentActivity: Message[]
}

interface AgentResponseCoordination {
  shouldRespond: boolean
  selectedAgent?: ChannelAgent
  reason: string
  delayMs?: number
}

export class ChannelProcessingEngine {
  private static instance: ChannelProcessingEngine
  private responseQueue: Map<string, NodeJS.Timeout> = new Map()
  private conversationStates: Map<string, {
    lastHumanMessage: Date
    lastAgentResponse: Date
    isHumanConversationActive: boolean
    messageCount: number
  }> = new Map()

  private constructor() {}

  static getInstance(): ChannelProcessingEngine {
    if (!ChannelProcessingEngine.instance) {
      ChannelProcessingEngine.instance = new ChannelProcessingEngine()
    }
    return ChannelProcessingEngine.instance
  }

  /**
   * Process a new message in a channel and determine if agents should respond
   */
  async processChannelMessage(
    channelId: string,
    spaceId: string,
    messageId: string
  ): Promise<void> {
    try {
      const payload = await getPayload({ config })

      // Get the message
      const message = await payload.findByID({
        collection: 'messages',
        id: messageId,
        depth: 2,
      }) as Message

      if (!message) {
        console.error('Message not found:', messageId)
        return
      }

      const author = typeof message.sender === 'object' ? message.sender : null
      if (!author) {
        console.error('Message author not found')
        return
      }

      // Skip processing if message is from an agent
      if (this.isAgentUser(author)) {
        this.updateConversationState(channelId, 'agent', message)
        return
      }

      // Get channel agents (simulated for now)
      const agents = await this.getChannelAgents(channelId)
      if (agents.length === 0) {
        return // No agents in this channel
      }

      // Get recent channel activity
      const recentActivity = await this.getRecentChannelActivity(channelId, 20)

      // Create processing context
      const context: ChannelProcessingContext = {
        channelId,
        spaceId,
        message,
        author,
        agents,
        recentActivity,
      }

      // Update conversation state
      this.updateConversationState(channelId, 'human', message)

      // Determine if and which agent should respond
      const coordination = await this.coordinateAgentResponse(context)

      if (coordination.shouldRespond && coordination.selectedAgent) {
        // Schedule agent response with appropriate delay
        this.scheduleAgentResponse(context, coordination)
      }
    } catch (error) {
      console.error('Error processing channel message:', error)
    }
  }

  /**
   * Coordinate which agent should respond and when
   */
  private async coordinateAgentResponse(
    context: ChannelProcessingContext
  ): Promise<AgentResponseCoordination> {
    const { channelId, message, agents, recentActivity } = context
    const conversationState = this.conversationStates.get(channelId)

    // Check if human conversation is currently active
    const isHumanConversationActive = this.isHumanConversationActive(channelId, recentActivity)
    
    if (isHumanConversationActive) {
      return {
        shouldRespond: false,
        reason: 'Human conversation is active - avoiding clutter',
      }
    }

    // Check if an agent recently responded
    const timeSinceLastAgentResponse = conversationState?.lastAgentResponse
      ? Date.now() - conversationState.lastAgentResponse.getTime()
      : Infinity

    if (timeSinceLastAgentResponse < 60000) { // 1 minute cooldown
      return {
        shouldRespond: false,
        reason: 'Agent cooldown period active',
      }
    }

    // Check if message is directed at an agent
    const messageContent = typeof message.content === 'string' ? message.content : JSON.stringify(message.content) || ''
    const mentionedAgent = this.findMentionedAgent(messageContent, agents)
    if (mentionedAgent) {
      return {
        shouldRespond: true,
        selectedAgent: mentionedAgent,
        reason: 'Agent was directly mentioned',
        delayMs: 2000, // Quick response for direct mentions
      }
    }

    // Check if message seems to be asking a question or needs help
    const needsResponse = this.messageNeedsResponse(messageContent)
    if (!needsResponse) {
      return {
        shouldRespond: false,
        reason: 'Message does not appear to need a response',
      }
    }

    // Select best agent based on expertise and availability
    const selectedAgent = this.selectBestAgent(agents, messageContent)

    return {
      shouldRespond: true,
      selectedAgent,
      reason: 'Message appears to need assistance',
      delayMs: 15000, // 15 second delay to allow for human responses
    }
  }

  /**
   * Schedule an agent response with appropriate timing
   */
  private scheduleAgentResponse(
    context: ChannelProcessingContext,
    coordination: AgentResponseCoordination
  ): void {
    const { channelId, message } = context
    const delay = coordination.delayMs || 60000 // Default 1 minute

    // Clear any existing response for this channel
    const existingTimeout = this.responseQueue.get(channelId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Schedule new response
    const timeout = setTimeout(async () => {
      // Double-check if response is still needed
      const stillNeedsResponse = await this.shouldStillRespond(channelId, String(message.id))
      
      if (stillNeedsResponse && coordination.selectedAgent) {
        await this.generateAgentResponse(context, coordination.selectedAgent)
      }

      this.responseQueue.delete(channelId)
    }, delay)

    this.responseQueue.set(channelId, timeout)
  }

  /**
   * Generate and post an agent response
   */
  private async generateAgentResponse(
    context: ChannelProcessingContext,
    agent: ChannelAgent
  ): Promise<void> {
    try {
      const { channelId, spaceId, message } = context

      // This would integrate with the streaming AI endpoint
      const response = await fetch(`/api/channels/${channelId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: typeof message.content === 'string' ? message.content : JSON.stringify(message.content),
          userId: 'system', // System user for agent responses
          agentId: agent.id,
        }),
      })

      if (response.ok) {
        console.log(`Agent ${agent.name} responded to message in channel ${channelId}`)
        
        // Update conversation state
        this.updateConversationState(channelId, 'agent', {
          ...message,
          createdAt: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('Error generating agent response:', error)
    }
  }

  /**
   * Check if human conversation is currently active
   */
  private isHumanConversationActive(channelId: string, recentActivity: Message[]): boolean {
    const now = Date.now()
    const fiveMinutesAgo = now - (5 * 60 * 1000)

    // Look for recent human messages
    const recentHumanMessages = recentActivity.filter(msg => {
      const msgTime = new Date(msg.createdAt).getTime()
      const author = typeof msg.sender === 'object' ? msg.sender : null
      return msgTime > fiveMinutesAgo && author && !this.isAgentUser(author)
    })

    // If there are multiple human messages in the last 5 minutes, conversation is active
    return recentHumanMessages.length >= 2
  }

  /**
   * Update conversation state for a channel
   */
  private updateConversationState(
    channelId: string,
    messageType: 'human' | 'agent',
    message: Message | any
  ): void {
    const state = this.conversationStates.get(channelId) || {
      lastHumanMessage: new Date(0),
      lastAgentResponse: new Date(0),
      isHumanConversationActive: false,
      messageCount: 0,
    }

    const messageTime = new Date(message.createdAt)

    if (messageType === 'human') {
      state.lastHumanMessage = messageTime
    } else {
      state.lastAgentResponse = messageTime
    }

    state.messageCount++
    state.isHumanConversationActive = this.isHumanConversationActive(channelId, [])

    this.conversationStates.set(channelId, state)
  }

  /**
   * Helper methods
   */
  private isAgentUser(user: PayloadUser): boolean {
    return user.email?.includes('agent') || user.email?.includes('leo') || user.email?.includes('ai') || false
  }

  private async getChannelAgents(channelId: string): Promise<ChannelAgent[]> {
    // This would query a proper Channels collection with agent members
    // For now, return simulated data
    return [
      {
        id: 'leo-ai',
        name: 'Leo AI',
        type: 'leo-ai',
        isActive: true,
        expertise: ['general', 'coding', 'assistance'],
      },
    ]
  }

  private async getRecentChannelActivity(channelId: string, limit: number): Promise<Message[]> {
    const payload = await getPayload({ config })
    
    const result = await payload.find({
      collection: 'messages',
      where: {
        channel: {
          equals: channelId,
        },
      },
      sort: '-createdAt',
      limit,
      depth: 2,
    })

    return result.docs as Message[]
  }

  private findMentionedAgent(content: string, agents: ChannelAgent[]): ChannelAgent | undefined {
    const lowerContent = content.toLowerCase()
    return agents.find(agent => 
      lowerContent.includes(`@${agent.name.toLowerCase()}`) ||
      lowerContent.includes(`@${agent.id}`) ||
      lowerContent.includes(agent.name.toLowerCase())
    )
  }

  private messageNeedsResponse(content: string): boolean {
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'can', 'could', 'would', 'should']
    const helpWords = ['help', 'assist', 'support', 'explain', 'show', 'tell']
    
    const lowerContent = content.toLowerCase()
    
    return (
      content.includes('?') ||
      questionWords.some(word => lowerContent.includes(word)) ||
      helpWords.some(word => lowerContent.includes(word)) ||
      lowerContent.includes('leo') ||
      lowerContent.includes('ai')
    )
  }

  private selectBestAgent(agents: ChannelAgent[], content: string): ChannelAgent {
    // For now, just return the first active agent
    // In the future, this could use more sophisticated matching based on expertise
    const activeAgent = agents.find(agent => agent.isActive)
    if (!activeAgent) {
      throw new Error('No active agents available')
    }
    return activeAgent
  }

  private async shouldStillRespond(channelId: string, originalMessageId: string): Promise<boolean> {
    // Check if there have been new human messages since the original
    const recentActivity = await this.getRecentChannelActivity(channelId, 5)
    
    const messagesAfterOriginal = recentActivity.filter(msg => {
      const author = typeof msg.sender === 'object' ? msg.sender : null
      return String(msg.id) !== originalMessageId && author && !this.isAgentUser(author)
    })

    // If there are new human messages, they might have gotten their answer
    return messagesAfterOriginal.length === 0
  }
}

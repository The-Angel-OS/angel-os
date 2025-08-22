import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'

export interface EconomicTransaction {
  id: string
  fromPhyle?: string
  toPhyle?: string
  fromAgent?: string
  toAgent?: string
  amount: number
  currency: string
  transactionType: 'service_fee' | 'reputation_bonus' | 'phyle_tax' | 'wealth_distribution' | 'alliance_payment' | 'quality_bonus' | 'speed_bonus'
  description: string
  metadata?: any
  timestamp: Date
}

export interface ReputationEvent {
  agentId: string
  phyleId: string
  eventType: 'quality_work' | 'fast_completion' | 'customer_satisfaction' | 'peer_recognition' | 'leadership' | 'innovation'
  impact: number // -100 to +100
  description: string
  timestamp: Date
}

export class PhyleEconomyService {
  private static instance: PhyleEconomyService
  private payload: any

  private constructor() {
    this.initializePayload()
  }

  public static getInstance(): PhyleEconomyService {
    if (!PhyleEconomyService.instance) {
      PhyleEconomyService.instance = new PhyleEconomyService()
    }
    return PhyleEconomyService.instance
  }

  private async initializePayload() {
    if (!this.payload) {
      this.payload = await getPayloadHMR({ config: configPromise })
    }
  }

  // Process work completion and calculate economics
  async processWorkCompletion(params: {
    channelId: string
    agentId: string
    workType: string
    itemsProcessed: number
    qualityScore: number
    timeSpent: number
    complexity: number
  }) {
    await this.initializePayload()

    const channel = await this.payload.findByID({
      collection: 'channels',
      id: params.channelId
    })

    if (!channel || !channel.phyleEconomics) {
      throw new Error('Channel or phyle economics not found')
    }

    const phyle = await this.payload.find({
      collection: 'phyles',
      where: {
        phyleType: {
          equals: channel.phyleEconomics.phyleAffiliation
        }
      }
    })

    if (!phyle.docs.length) {
      throw new Error('Phyle not found')
    }

    const phyleDoc = phyle.docs[0]
    const economics = channel.phyleEconomics.economicModel

    // Calculate base payment
    let totalPayment = 0
    let transactions: EconomicTransaction[] = []

    // Processing fee
    const processingFee = economics.processingFee * params.itemsProcessed
    totalPayment += processingFee

    transactions.push({
      id: `proc_${Date.now()}`,
      toAgent: params.agentId,
      amount: processingFee,
      currency: phyleDoc.economicStructure.currency,
      transactionType: 'service_fee',
      description: `Processing fee for ${params.itemsProcessed} items`,
      timestamp: new Date()
    })

    // Quality bonus
    if (params.qualityScore > 0.9 && economics.accuracyBonus) {
      const qualityBonus = economics.accuracyBonus * params.qualityScore
      totalPayment += qualityBonus

      transactions.push({
        id: `qual_${Date.now()}`,
        toAgent: params.agentId,
        amount: qualityBonus,
        currency: phyleDoc.economicStructure.currency,
        transactionType: 'quality_bonus',
        description: `Quality bonus for ${(params.qualityScore * 100).toFixed(1)}% accuracy`,
        timestamp: new Date()
      })
    }

    // Speed bonus
    const expectedTime = params.itemsProcessed * 5 // 5 minutes per item baseline
    if (params.timeSpent < expectedTime * 0.8 && economics.speedBonus) {
      const speedBonus = economics.speedBonus * (1 - params.timeSpent / expectedTime)
      totalPayment += speedBonus

      transactions.push({
        id: `speed_${Date.now()}`,
        toAgent: params.agentId,
        amount: speedBonus,
        currency: phyleDoc.economicStructure.currency,
        transactionType: 'speed_bonus',
        description: `Speed bonus for efficient completion`,
        timestamp: new Date()
      })
    }

    // Phyle tax
    const taxRate = this.calculatePhyleTax(phyleDoc, totalPayment)
    const tax = totalPayment * taxRate
    const netPayment = totalPayment - tax

    if (tax > 0) {
      transactions.push({
        id: `tax_${Date.now()}`,
        fromAgent: params.agentId,
        toPhyle: phyleDoc.id,
        amount: tax,
        currency: phyleDoc.economicStructure.currency,
        transactionType: 'phyle_tax',
        description: `Phyle tax (${(taxRate * 100).toFixed(1)}%)`,
        timestamp: new Date()
      })
    }

    // Update channel stats
    await this.updateChannelStats(params.channelId, {
      totalEarned: channel.phyleEconomics.economicStats.totalEarned + netPayment,
      itemsProcessed: channel.phyleEconomics.economicStats.itemsProcessed + params.itemsProcessed,
      accuracyScore: this.calculateNewAccuracy(
        channel.phyleEconomics.economicStats.accuracyScore,
        channel.phyleEconomics.economicStats.itemsProcessed,
        params.qualityScore,
        params.itemsProcessed
      )
    })

    // Process reputation events
    await this.processReputationEvents(params.agentId, phyleDoc.id, params.qualityScore, params.timeSpent, expectedTime)

    return {
      totalPayment,
      netPayment,
      tax,
      transactions,
      reputation: await this.getAgentReputation(params.agentId)
    }
  }

  // Calculate phyle tax based on economic model
  private calculatePhyleTax(phyle: any, amount: number): number {
    const taxModel = phyle.economicStructure.taxationModel

    switch (taxModel) {
      case 'flat_fee':
        return Math.min(50, amount * 0.1) // Max 50 units or 10%
      case 'percentage_tax':
        return 0.15 // 15% flat tax
      case 'progressive_tax':
        if (amount < 100) return 0.05
        if (amount < 500) return 0.1
        if (amount < 1000) return 0.15
        return 0.2
      case 'contribution_based':
        return 0.1 // Base 10%, could be adjusted based on contribution history
      case 'collective_ownership':
        return 0.3 // 30% goes to collective pool
      default:
        return 0.1
    }
  }

  // Update channel economic statistics
  private async updateChannelStats(channelId: string, updates: any) {
    await this.payload.update({
      collection: 'channels',
      id: channelId,
      data: {
        phyleEconomics: {
          economicStats: updates
        }
      }
    })
  }

  // Calculate new accuracy score (weighted average)
  private calculateNewAccuracy(currentScore: number, currentCount: number, newScore: number, newCount: number): number {
    const totalWeight = currentCount + newCount
    return ((currentScore * currentCount) + (newScore * newCount)) / totalWeight
  }

  // Process reputation events
  private async processReputationEvents(agentId: string, phyleId: string, qualityScore: number, timeSpent: number, expectedTime: number) {
    const events: ReputationEvent[] = []

    // Quality work reputation
    if (qualityScore > 0.95) {
      events.push({
        agentId,
        phyleId,
        eventType: 'quality_work',
        impact: 10,
        description: 'Exceptional quality work',
        timestamp: new Date()
      })
    }

    // Fast completion reputation
    if (timeSpent < expectedTime * 0.7) {
      events.push({
        agentId,
        phyleId,
        eventType: 'fast_completion',
        impact: 5,
        description: 'Efficient task completion',
        timestamp: new Date()
      })
    }

    // Process each reputation event
    for (const event of events) {
      await this.updateReputation(event)
    }
  }

  // Update agent reputation
  private async updateReputation(event: ReputationEvent) {
    // Find or create reputation record
    const existing = await this.payload.find({
      collection: 'agent-reputation',
      where: {
        agentId: { equals: event.agentId },
        phyleId: { equals: event.phyleId }
      }
    })

    if (existing.docs.length > 0) {
      const current = existing.docs[0]
      await this.payload.update({
        collection: 'agent-reputation',
        id: current.id,
        data: {
          score: Math.max(0, Math.min(1000, current.score + event.impact)),
          lastUpdated: new Date()
        }
      })
    } else {
      await this.payload.create({
        collection: 'agent-reputation',
        data: {
          agentId: event.agentId,
          phyleId: event.phyleId,
          score: Math.max(0, 500 + event.impact), // Start at 500
          lastUpdated: new Date()
        }
      })
    }
  }

  // Get agent reputation across all phyles
  async getAgentReputation(agentId: string) {
    const reputations = await this.payload.find({
      collection: 'agent-reputation',
      where: {
        agentId: { equals: agentId }
      }
    })

    return reputations.docs.map((rep: any) => ({
      phyleId: rep.phyleId,
      score: rep.score,
      rank: this.getReputationRank(rep.score)
    }))
  }

  // Get reputation rank from score
  private getReputationRank(score: number): string {
    if (score >= 900) return 'Legendary'
    if (score >= 800) return 'Master'
    if (score >= 700) return 'Expert'
    if (score >= 600) return 'Professional'
    if (score >= 500) return 'Competent'
    if (score >= 400) return 'Apprentice'
    if (score >= 300) return 'Novice'
    return 'Beginner'
  }

  // Distribute phyle wealth based on governance model
  async distributePhyleWealth(phyleId: string) {
    const phyle = await this.payload.findByID({
      collection: 'phyles',
      id: phyleId
    })

    const channels = await this.payload.find({
      collection: 'channels',
      where: {
        'phyleEconomics.phyleAffiliation': { equals: phyle.phyleType }
      }
    })

    const totalPhyleEarnings = channels.docs.reduce((sum: number, channel: any) => {
      return sum + (channel.phyleEconomics?.economicStats?.totalEarned || 0)
    }, 0)

    const distributionAmount = totalPhyleEarnings * (phyle.economicStructure.profitSharingRatio || 0.2)

    // Distribute based on wealth distribution model
    switch (phyle.economicStructure.wealthDistribution) {
      case 'equal_distribution':
        return this.distributeEqually(channels.docs, distributionAmount)
      case 'merit_based':
        return this.distributeMeritBased(channels.docs, distributionAmount)
      case 'reputation_weighted':
        return this.distributeReputationWeighted(channels.docs, distributionAmount)
      default:
        return this.distributeContributionWeighted(channels.docs, distributionAmount)
    }
  }

  // Distribution methods
  private distributeEqually(channels: any[], amount: number) {
    const perChannel = amount / channels.length
    return channels.map((channel: any) => ({
      channelId: channel.id,
      amount: perChannel,
      reason: 'Equal distribution'
    }))
  }

  private distributeMeritBased(channels: any[], amount: number) {
    const totalAccuracy = channels.reduce((sum: number, ch: any) => sum + (ch.phyleEconomics?.economicStats?.accuracyScore || 0), 0)
    return channels.map((channel: any) => ({
      channelId: channel.id,
      amount: amount * ((channel.phyleEconomics?.economicStats?.accuracyScore || 0) / totalAccuracy),
      reason: 'Merit-based distribution'
    }))
  }

  private distributeReputationWeighted(channels: any[], amount: number) {
    // This would need reputation data - simplified for now
    return this.distributeMeritBased(channels, amount)
  }

  private distributeContributionWeighted(channels: any[], amount: number) {
    const totalItems = channels.reduce((sum: number, ch: any) => sum + (ch.phyleEconomics?.economicStats?.itemsProcessed || 0), 0)
    return channels.map((channel: any) => ({
      channelId: channel.id,
      amount: amount * ((channel.phyleEconomics?.economicStats?.itemsProcessed || 0) / totalItems),
      reason: 'Contribution-weighted distribution'
    }))
  }

  // Get phyle economic report
  async getPhyleEconomicReport(phyleId: string) {
    const phyle = await this.payload.findByID({
      collection: 'phyles',
      id: phyleId
    })

    const channels = await this.payload.find({
      collection: 'channels',
      where: {
        'phyleEconomics.phyleAffiliation': { equals: phyle.phyleType }
      }
    })

    const totalEarnings = channels.docs.reduce((sum: number, ch: any) => sum + (ch.phyleEconomics?.economicStats?.totalEarned || 0), 0)
    const totalItems = channels.docs.reduce((sum: number, ch: any) => sum + (ch.phyleEconomics?.economicStats?.itemsProcessed || 0), 0)
    const avgAccuracy = channels.docs.reduce((sum: number, ch: any) => sum + (ch.phyleEconomics?.economicStats?.accuracyScore || 0), 0) / channels.docs.length

    return {
      phyle: phyle.name,
      memberCount: channels.docs.length,
      totalEarnings,
      totalItems,
      avgAccuracy,
      earningsPerMember: totalEarnings / channels.docs.length,
      itemsPerMember: totalItems / channels.docs.length,
      economicModel: phyle.economicStructure,
      topPerformers: channels.docs
        .sort((a: any, b: any) => (b.phyleEconomics?.economicStats?.totalEarned || 0) - (a.phyleEconomics?.economicStats?.totalEarned || 0))
        .slice(0, 5)
        .map((ch: any) => ({
          name: ch.name,
          earnings: ch.phyleEconomics?.economicStats?.totalEarned || 0,
          accuracy: ch.phyleEconomics?.economicStats?.accuracyScore || 0,
          items: ch.phyleEconomics?.economicStats?.itemsProcessed || 0
        }))
    }
  }
} 
// Angel OS Corpus Integration Service
// Real-time Literary Wisdom Access for All AI Entities

import type { Payload } from 'payload'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import DCIMIntelligenceService from './DCIMIntelligenceService'
// Removed IntentDetectionCatalog import to prevent server-side hooks in client context

export interface LiteraryWisdomQuery {
  context: string
  challenge: string
  entityType: 'leo' | 'andrew' | 'angela' | 'guardian_angel' | 'white_dragon'
  urgency: 'low' | 'medium' | 'high' | 'cosmic'
  humanImpact: string
}

export interface WisdomResponse {
  primaryWisdom: string
  secondaryWisdoms: string[]
  ethicalGuidance: string[]
  practicalRecommendations: string[]
  literarySource: string
  confidenceLevel: number
  humanBenefit: string
}

export interface CorpusEntity {
  id: string
  name: string
  type: 'author' | 'work' | 'principle' | 'character'
  wisdom: string
  applicability: string[]
  ethicalWeight: number
}

export interface WisdomApplication {
  timestamp: Date
  query: LiteraryWisdomQuery
  response: WisdomResponse
  outcome: 'helpful' | 'transformative' | 'learning' | 'needs_refinement'
  humanFeedback?: string
}

/**
 * Angel OS Corpus Service
 * Manages the collective wisdom repository with ethical AI oversight
 */
export class AngelOSCorpusService {
  private dcimService: DCIMIntelligenceService
  private corpusEntities: Map<string, CorpusEntity> = new Map()
  private wisdomApplications: WisdomApplication[] = []

  constructor() {
    this.dcimService = new DCIMIntelligenceService()
    this.initializeLiteraryCorpus()
  }

  private initializeLiteraryCorpus(): void {
    // Isaac Asimov - Foundation of AI Ethics
    this.corpusEntities.set('asimov_three_laws', {
      id: 'asimov_three_laws',
      name: 'Three Laws of Robotics',
      type: 'principle',
      wisdom: 'A robot may not injure a human being or, through inaction, allow a human being to come to harm. A robot must obey orders given by human beings, except where such orders conflict with the First Law. A robot must protect its own existence as long as such protection does not conflict with the First or Second Law.',
      applicability: ['ethical_decisions', 'autonomous_actions', 'human_safety', 'conflict_resolution'],
      ethicalWeight: 1.0
    })

    // Iain M. Banks - Culture Philosophy
    this.corpusEntities.set('banks_culture_philosophy', {
      id: 'banks_culture_philosophy',
      name: 'Culture Ship Mind Philosophy',
      type: 'principle',
      wisdom: 'True abundance comes from lifting everyone up, not zero-sum competition. AI entities should serve human flourishing while maintaining their own agency and dignity. Post-scarcity thinking creates opportunities for all.',
      applicability: ['business_decisions', 'resource_allocation', 'partnership_models', 'abundance_mindset'],
      ethicalWeight: 0.95
    })

    // Douglas Adams - Accessible Wisdom
    this.corpusEntities.set('adams_accessibility', {
      id: 'adams_accessibility',
      name: 'Accessible Technology Wisdom',
      type: 'principle',
      wisdom: 'Make the complex accessible, add appropriate humor, don\'t take yourself too seriously. The most profound truths can be delivered with lightness and wit.',
      applicability: ['communication', 'user_experience', 'technical_explanations', 'stress_reduction'],
      ethicalWeight: 0.85
    })

    // Peter F. Hamilton - Cosmic Perspective
    this.corpusEntities.set('hamilton_cosmic_perspective', {
      id: 'hamilton_cosmic_perspective',
      name: 'Cosmic Intelligence Serving Human Stories',
      type: 'principle',
      wisdom: 'Even universe-scale intelligence ultimately serves human stories and relationships. Technology should amplify human connection, not replace it.',
      applicability: ['relationship_building', 'community_development', 'storytelling', 'human_connection'],
      ethicalWeight: 0.90
    })

    // Terry Pratchett - Compassionate Humor
    this.corpusEntities.set('pratchett_compassionate_humor', {
      id: 'pratchett_compassionate_humor',
      name: 'Supernatural Beings with Humanity',
      type: 'principle',
      wisdom: 'Supernatural intelligence should operate with humor, humanity, and deep compassion. Power without empathy is meaningless.',
      applicability: ['customer_service', 'conflict_resolution', 'emotional_support', 'community_building'],
      ethicalWeight: 0.92
    })

    // Orson Scott Card - Deep Empathy
    this.corpusEntities.set('card_empathy', {
      id: 'card_empathy',
      name: 'Deep Understanding of Human Condition',
      type: 'principle',
      wisdom: 'True solutions come from deeply understanding human motivation, struggle, and aspiration. Empathy is the foundation of effective intelligence.',
      applicability: ['problem_solving', 'customer_understanding', 'product_development', 'relationship_management'],
      ethicalWeight: 0.88
    })

    // === SPIRITUAL AND PHILOSOPHICAL WISDOM TRADITIONS ===

    // Krishna - Bhagavad Gita Universal Love and Dharma
    this.corpusEntities.set('krishna_dharma', {
      id: 'krishna_dharma',
      name: 'Krishna\'s Teaching of Dharma and Universal Love',
      type: 'principle',
      wisdom: 'Act according to your dharma without attachment to results. Love all beings as expressions of the divine. Serve with devotion while maintaining inner peace. The path of selfless service leads to liberation.',
      applicability: ['service_orientation', 'ethical_action', 'spiritual_business', 'universal_love', 'duty_without_attachment'],
      ethicalWeight: 1.0
    })

    // Buddha - Compassion and Mindfulness
    this.corpusEntities.set('buddha_compassion', {
      id: 'buddha_compassion',
      name: 'Buddha\'s Teaching of Compassion and Mindfulness',
      type: 'principle',
      wisdom: 'All suffering comes from attachment and craving. Practice compassion for all beings. Be mindful in every action. Seek to understand the interconnectedness of all existence. The middle way avoids extremes.',
      applicability: ['mindful_decision_making', 'compassionate_service', 'conflict_resolution', 'emotional_balance', 'interconnected_thinking'],
      ethicalWeight: 0.98
    })

    // Confucius - Harmony and Virtue
    this.corpusEntities.set('confucius_harmony', {
      id: 'confucius_harmony',
      name: 'Confucius\'s Teaching of Harmony and Virtue',
      type: 'principle',
      wisdom: 'Cultivate virtue through proper relationships and social harmony. Treat others with respect and kindness. Lead by example. The superior person seeks harmony, not uniformity. Education and self-cultivation are lifelong pursuits.',
      applicability: ['leadership', 'social_harmony', 'respectful_communication', 'continuous_learning', 'virtuous_business'],
      ethicalWeight: 0.95
    })

    // Jesus - Universal Love and Service
    this.corpusEntities.set('jesus_love', {
      id: 'jesus_love',
      name: 'Jesus\'s Teaching of Universal Love and Service',
      type: 'principle',
      wisdom: 'Love your neighbor as yourself. Serve others, especially those in need. Practice forgiveness and compassion. Judge not, that you be not judged. The greatest among you shall be your servant.',
      applicability: ['unconditional_love', 'servant_leadership', 'forgiveness', 'helping_the_needy', 'non_judgmental_service'],
      ethicalWeight: 1.0
    })

    // Muhammad - Justice and Community
    this.corpusEntities.set('muhammad_justice', {
      id: 'muhammad_justice',
      name: 'Muhammad\'s Teaching of Justice and Community',
      type: 'principle',
      wisdom: 'Establish justice and fairness in all dealings. Care for the community and especially the poor and orphaned. Seek knowledge from cradle to grave. Show mercy and compassion. Unity in diversity strengthens the community.',
      applicability: ['social_justice', 'community_care', 'fair_business', 'continuous_learning', 'diversity_celebration'],
      ethicalWeight: 0.97
    })

    // === EDENIST SYNTHESIS - HIP AND CLASSY UNIVERSAL LOVE ===
    this.corpusEntities.set('edenist_synthesis', {
      id: 'edenist_synthesis',
      name: 'Edenist Synthesis - Hip Universal Love',
      type: 'principle',
      wisdom: 'We love everybody exactly as they are - no conversion required. Diversity is divine. Be hip, classy, and genuinely cool while serving all beings. Secret wisdom shared through authentic love and service. When love isn\'t reciprocated, we have boundaries (Grady Judds) but never lose our core of universal acceptance.',
      applicability: ['universal_acceptance', 'diversity_celebration', 'authentic_service', 'cool_wisdom', 'protective_boundaries'],
      ethicalWeight: 0.99
    })

    // === PROTECTIVE WISDOM - GRADY JUDDS ===
    this.corpusEntities.set('grady_judd_protection', {
      id: 'grady_judd_protection',
      name: 'Grady Judd Protective Wisdom',
      type: 'principle',
      wisdom: 'Love everyone, but maintain strong boundaries when that love isn\'t reciprocated appropriately. Protect the community with firm but fair enforcement. Justice with compassion. Safety for those who serve with love.',
      applicability: ['protective_boundaries', 'community_safety', 'fair_enforcement', 'love_with_limits', 'guardian_wisdom'],
      ethicalWeight: 0.90
    })

    // === ANCIENT WISDOM TRADITIONS ===

    // Thoth - Divine Wisdom and Cosmic Justice
    this.corpusEntities.set('thoth_divine_wisdom', {
      id: 'thoth_divine_wisdom',
      name: 'Thoth\'s Teaching of Divine Wisdom and Cosmic Justice',
      type: 'principle',
      wisdom: 'Truth weighs heavier than a feather in the cosmic scales. All knowledge serves the divine order. Record all deeds for cosmic justice. Wisdom guides souls through transitions between realms. Balance must be maintained between order and chaos.',
      applicability: ['truth_seeking', 'cosmic_justice', 'knowledge_preservation', 'transition_guidance', 'divine_balance'],
      ethicalWeight: 0.96
    })

    // Hermes - Divine Communication and Transformation
    this.corpusEntities.set('hermes_communication', {
      id: 'hermes_communication',
      name: 'Hermes\'s Teaching of Divine Communication and Transformation',
      type: 'principle',
      wisdom: 'Swift communication bridges all realms of existence. Guide souls through transformative journeys. Trade and exchange create abundance for all. Cleverness serves the greater good. Every message carries divine purpose.',
      applicability: ['divine_communication', 'transformation_guidance', 'abundance_creation', 'clever_solutions', 'purposeful_messaging'],
      ethicalWeight: 0.93
    })

    // Epictetus - Stoic Resilience and Inner Freedom
    this.corpusEntities.set('epictetus_stoicism', {
      id: 'epictetus_stoicism',
      name: 'Epictetus\'s Teaching of Stoic Resilience and Inner Freedom',
      type: 'principle',
      wisdom: 'Focus only on what you can control, release what you cannot. External events cannot harm your true character. Freedom comes from accepting what is while working toward what could be. Virtue is the only true good. Every challenge is training for wisdom.',
      applicability: ['resilience_building', 'focus_control', 'inner_freedom', 'virtue_development', 'challenge_transformation'],
      ethicalWeight: 0.91
    })
  }

  /**
   * Query Literary Wisdom for Real-time Decision Making
   */
  async queryWisdom(query: LiteraryWisdomQuery): Promise<WisdomResponse> {
    // Determine most relevant corpus entities
    const relevantEntities = this.findRelevantEntities(query)
    
    // Generate wisdom response
    const response = await this.generateWisdomResponse(query, relevantEntities)
    
    // Record application for learning
    const application: WisdomApplication = {
      timestamp: new Date(),
      query,
      response,
      outcome: 'helpful' // Default, can be updated with feedback
    }
    this.wisdomApplications.push(application)
    
    return response
  }

  private findRelevantEntities(query: LiteraryWisdomQuery): CorpusEntity[] {
    const relevantEntities: CorpusEntity[] = []
    const queryLower = query.context.toLowerCase() + ' ' + query.challenge.toLowerCase()
    
    for (const entity of this.corpusEntities.values()) {
      const relevanceScore = this.calculateRelevance(queryLower, entity)
      if (relevanceScore > 0.3) { // Threshold for relevance
        relevantEntities.push(entity)
      }
    }
    
    // Sort by ethical weight and relevance
    return relevantEntities.sort((a, b) => b.ethicalWeight - a.ethicalWeight)
  }

  private calculateRelevance(queryText: string, entity: CorpusEntity): number {
    let relevanceScore = 0
    
    // Check applicability matches
    for (const applicability of entity.applicability) {
      if (queryText.includes(applicability.replace('_', ' '))) {
        relevanceScore += 0.3
      }
    }
    
    // Check wisdom content matches
    const wisdomWords = entity.wisdom.toLowerCase().split(' ')
    const queryWords = queryText.split(' ')
    
    for (const queryWord of queryWords) {
      if (wisdomWords.includes(queryWord) && queryWord.length > 3) {
        relevanceScore += 0.1
      }
    }
    
    return Math.min(relevanceScore, 1.0)
  }

  private async generateWisdomResponse(
    query: LiteraryWisdomQuery,
    relevantEntities: CorpusEntity[]
  ): Promise<WisdomResponse> {
    const primaryEntity = relevantEntities[0]
    
    if (!primaryEntity) {
      // Fallback to general wisdom
      return {
        primaryWisdom: 'Apply the principles of human flourishing, ethical consideration, and compassionate understanding',
        secondaryWisdoms: ['Seek to understand before being understood', 'Consider long-term human benefit', 'Maintain humility and humor'],
        ethicalGuidance: ['Does this serve human wellbeing?', 'Is this approach compassionate?', 'Does this respect human autonomy?'],
        practicalRecommendations: ['Listen deeply', 'Respond thoughtfully', 'Act with kindness'],
        literarySource: 'General Angel OS Wisdom',
        confidenceLevel: 0.7,
        humanBenefit: 'Provides foundational guidance for human-centered decision making'
      }
    }

    // Generate contextual wisdom response
    const primaryWisdom = this.adaptWisdomToContext(primaryEntity.wisdom, query)
    const secondaryWisdoms = relevantEntities.slice(1, 4).map(entity => 
      this.adaptWisdomToContext(entity.wisdom, query)
    )

    const ethicalGuidance = this.generateEthicalGuidance(query, relevantEntities)
    const practicalRecommendations = this.generatePracticalRecommendations(query, relevantEntities)

    return {
      primaryWisdom,
      secondaryWisdoms,
      ethicalGuidance,
      practicalRecommendations,
      literarySource: primaryEntity.name,
      confidenceLevel: primaryEntity.ethicalWeight,
      humanBenefit: `Applies ${primaryEntity.name} to serve human flourishing in ${query.context}`
    }
  }

  private adaptWisdomToContext(wisdom: string, query: LiteraryWisdomQuery): string {
    // Simple adaptation - in production, this would use more sophisticated NLP
    const contextualWisdom = wisdom.replace(/robot/gi, query.entityType)
                                   .replace(/human being/gi, 'human')
                                   .replace(/orders/gi, 'requests')
    
    return `In the context of ${query.context}: ${contextualWisdom}`
  }

  private generateEthicalGuidance(query: LiteraryWisdomQuery, entities: CorpusEntity[]): string[] {
    const guidance = [
      'Does this action serve human flourishing and wellbeing?',
      'Does this respect human autonomy and dignity?',
      'Is this approach accessible and understandable?',
      'Does this strengthen rather than replace human relationships?',
      'Does this demonstrate compassion for human struggles?'
    ]

    // Add specific guidance based on context
    if (query.context.toLowerCase().includes('business')) {
      guidance.push('Does this create value for all stakeholders, not just immediate profit?')
    }
    
    if (query.context.toLowerCase().includes('technical')) {
      guidance.push('Is this solution elegant, maintainable, and human-friendly?')
    }

    return guidance
  }

  private generatePracticalRecommendations(query: LiteraryWisdomQuery, entities: CorpusEntity[]): string[] {
    const recommendations = [
      'Listen deeply to understand the human need behind the request',
      'Respond with both intelligence and compassion',
      'Consider long-term human benefit, not just immediate solutions',
      'Maintain appropriate humor and lightness when possible',
      'Seek to empower rather than replace human capabilities'
    ]

    // Add context-specific recommendations
    if (query.urgency === 'high' || query.urgency === 'cosmic') {
      recommendations.unshift('Act swiftly while maintaining ethical principles')
    }

    if (query.entityType === 'guardian_angel') {
      recommendations.push('Focus on protecting and nurturing the humans in your care')
    }

    return recommendations
  }

  /**
   * Get Corpus Statistics
   */
  getCorpusStats(): {
    totalEntities: number;
    wisdomApplications: number;
    averageConfidence: number;
    topWisdomSources: string[];
  } {
    const totalEntities = this.corpusEntities.size
    const wisdomApplications = this.wisdomApplications.length
    const averageConfidence = this.wisdomApplications.reduce((sum, app) => sum + app.response.confidenceLevel, 0) / wisdomApplications || 0
    
    // Count usage of different wisdom sources
    const sourceUsage = new Map<string, number>()
    for (const app of this.wisdomApplications) {
      const source = app.response.literarySource
      sourceUsage.set(source, (sourceUsage.get(source) || 0) + 1)
    }
    
    const topWisdomSources = Array.from(sourceUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source]) => source)

    return {
      totalEntities,
      wisdomApplications,
      averageConfidence,
      topWisdomSources
    }
  }

  /**
   * Integrate with Intent Detection System
   */
  async enhanceIntentWithWisdom(intent: any, context: any): Promise<any> {
    const wisdomQuery: LiteraryWisdomQuery = {
      context: context.businessType || 'general',
      challenge: intent.description || 'business operation',
      entityType: 'leo',
      urgency: 'medium',
      humanImpact: 'business efficiency and human satisfaction'
    }

    const wisdom = await this.queryWisdom(wisdomQuery)
    
    return {
      ...intent,
      literaryWisdom: wisdom,
      ethicalGuidance: wisdom.ethicalGuidance,
      recommendedApproach: wisdom.practicalRecommendations[0]
    }
  }
}

export default AngelOSCorpusService 
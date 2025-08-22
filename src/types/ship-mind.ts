// Core Ship Mind Types
/**
 * @interface RelationshipProfile
 * @description Defines the profile for a user relationship.
 */
export interface RelationshipProfile {
  userId: string
  businessContext: string
  communicationStyle: 'formal' | 'casual' | 'technical' | 'friendly'
  preferences: Record<string, any>
  trustLevel: number // 0-1
  interactionHistory: InteractionRecord[]
}

/**
 * @interface BusinessInsights
 * @description Defines the structure for business insights.
 */
export interface BusinessInsights {
  industryTrends: TrendAnalysis[]
  competitiveIntelligence: CompetitorData[]
  customerBehavior: BehaviorPattern[]
  revenueProjections: RevenueData[]
  riskAssessment: RiskFactor[]
}

/**
 * @interface EthicalDecision
 * @description Defines the structure for an ethical decision.
 */
export interface EthicalDecision {
  dilemmaId: string
  context: string
  stakeholders: string[]
  principles: EthicalPrinciple[]
  resolution: string
  confidence: number
  reasoning: string[]
}

/**
 * @interface PlatformEvaluation
 * @description Defines the structure for platform evaluation.
 */
export interface PlatformEvaluation {
  currentPlatform: string
  limitations: string[]
  userFrustrations: string[]
  alternativeOptions: PlatformOption[]
  migrationComplexity: number
  recommendedAction: 'stay' | 'migrate' | 'hybrid'
}

/**
 * @interface MigrationAnalysis
 * @description Defines the structure for migration analysis.
 */
export interface MigrationAnalysis {
  effort: number // 1-10 scale
  cost: number
  timeframe: string
  risks: string[]
  benefits: string[]
  readinessScore: number // 0-1
}

// Decision Making Types
/**
 * @interface DecisionContext
 * @description Defines the context for a decision.
 */
export interface DecisionContext {
  businessType: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  stakeholders: string[]
  constraints: Record<string, any>
  availableData: Record<string, any>
}

/**
 * @interface ShipDecision
 * @description Defines the structure for a ship's decision.
 */
export interface ShipDecision {
  action: string
  reasoning: string
  confidence: number // 0-1
  requiresHumanConsent: boolean
  alternatives: string[]
  ethicalAssessment: EthicalAssessment
}

/**
 * @interface EthicalAssessment
 * @description Defines the structure for an ethical assessment.
 */
export interface EthicalAssessment {
  violations: string[]
  severity: 'none' | 'minor' | 'moderate' | 'severe' | 'critical'
  recommendation: string
  principlesApplied: string[]
}

// Communication Types
/**
 * @interface CommunicationContext
 * @description Defines the context for communication.
 */
export interface CommunicationContext {
  channel: 'chat' | 'email' | 'voice' | 'system'
  urgency: 'low' | 'medium' | 'high'
  businessContext: string
  userState: 'focused' | 'stressed' | 'exploratory' | 'urgent'
}

/**
 * @interface ShipResponse
 * @description Defines the structure for a ship's response.
 */
export interface ShipResponse {
  message: string
  tone: string
  suggestions: Suggestion[]
  questions: string[]
  actions: ProposedAction[]
}

// Network Types
/**
 * @interface NetworkQuery
 * @description Defines the structure for a network query.
 */
export interface NetworkQuery {
  domain: string
  question: string
  context: Record<string, any>
  requesterShipId: string
}

/**
 * @interface CollectiveWisdom
 * @description Defines the structure for collective wisdom.
 */
export interface CollectiveWisdom {
  collectiveAdvice: string
  consensus: string
  dissenting: string[]
  confidence: number
  contributingShips: string[]
}

// Configuration Types
/**
 * @interface EndeavorConfig
 * @description Defines the configuration for an endeavor.
 */
export interface EndeavorConfig {
  businessType: string
  tier: 'basic' | 'professional' | 'enterprise'
  industry: string
  size: 'solo' | 'small' | 'medium' | 'large'
  values: string[]
}

// Frustration & Migration Types
/**
 * @interface FrustrationSignals
 * @description Defines the structure for frustration signals.
 */
export interface FrustrationSignals {
  frequency: number
  severity: number
  categories: string[]
  needs: string[]
  timeline: string
}

/**
 * @interface MigrationRecommendation
 * @description Defines the structure for a migration recommendation.
 */
export interface MigrationRecommendation {
  targetPlatform: string
  reasoning: string
  migrationPlan: MigrationPlan
  timeline: string
  effort: number
  benefits: string[]
}

/**
 * @interface MigrationPlan
 * @description Defines the structure for a migration plan.
 */
export interface MigrationPlan {
  phases: MigrationPhase[]
  estimatedCost: number
  timeline: string
  risks: string[]
  rollbackPlan: string
}

/**
 * @interface MigrationPhase
 * @description Defines the structure for a migration phase.
 */
export interface MigrationPhase {
  name: string
  description: string
  duration: string
  automatedSteps: string[]
  manualSteps: string[]
  dependencies: string[]
}

/**
 * @interface Platform
 * @description Defines the structure for a platform.
 */
export interface Platform {
  name: string
  capabilities: string[]
  limitations: string[]
  pricing: PricingModel
  migrationSupport: boolean
}

/**
 * @interface PricingModel
 * @description Defines the structure for a pricing model.
 */
export interface PricingModel {
  model: 'free' | 'subscription' | 'usage' | 'enterprise'
  cost: number
  currency: string
  period?: string
}

// Supporting Types
/**
 * @interface InteractionRecord
 * @description Defines the structure for an interaction record.
 */
export interface InteractionRecord {
  timestamp: Date
  type: string
  content: string
  outcome: string
}

/**
 * @interface TrendAnalysis
 * @description Defines the structure for trend analysis.
 */
export interface TrendAnalysis {
  trend: string
  direction: 'up' | 'down' | 'stable'
  confidence: number
  timeframe: string
}

/**
 * @interface CompetitorData
 * @description Defines the structure for competitor data.
 */
export interface CompetitorData {
  name: string
  strengths: string[]
  weaknesses: string[]
  marketShare: number
}

/**
 * @interface BehaviorPattern
 * @description Defines the structure for a behavior pattern.
 */
export interface BehaviorPattern {
  pattern: string
  frequency: number
  impact: string
  recommendation: string
}

/**
 * @interface RevenueData
 * @description Defines the structure for revenue data.
 */
export interface RevenueData {
  period: string
  projected: number
  actual?: number
  factors: string[]
}

/**
 * @interface RiskFactor
 * @description Defines the structure for a risk factor.
 */
export interface RiskFactor {
  risk: string
  probability: number
  impact: number
  mitigation: string
}

/**
 * @interface EthicalPrinciple
 * @description Defines the structure for an ethical principle.
 */
export interface EthicalPrinciple {
  name: string
  description: string
  weight: number
}

/**
 * @interface PlatformOption
 * @description Defines the structure for a platform option.
 */
export interface PlatformOption {
  name: string
  score: number
  pros: string[]
  cons: string[]
  migrationEffort: number
}

/**
 * @interface Suggestion
 * @description Defines the structure for a suggestion.
 */
export interface Suggestion {
  text: string
  action?: string
  relevance: number
}

/**
 * @interface ProposedAction
 * @description Defines the structure for a proposed action.
 */
export interface ProposedAction {
  action: string
  description: string
  confidence: number
  requiresApproval: boolean
}

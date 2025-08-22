// Andrew Martin Control Panel Type Definitions

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  avatarUrl?: string
  role: string
  lastActive: string
}

export interface NotificationCenter {
  unreadCount: number
  notifications: Notification[]
}

export interface Notification {
  id: string
  title: string
  message: string
  timestamp: string | Date
  type: 'info' | 'warning' | 'error' | 'success'
  read: boolean
}

export interface QuickAction {
  id: string
  label: string
  action: () => void
  icon?: string
}

export interface AndrewMartinControlPanel {
  header: {
    logo: string
    userProfile: UserProfile
    notifications: NotificationCenter
    quickActions: QuickAction[]
  }
  dashboard: {
    businessMetrics: BusinessMetricsWidget
    spaceOverview: SpaceOverviewWidget
    revenueAnalytics: RevenueAnalyticsWidget
    guardianAngelNetwork: NetworkStatusWidget
  }
  spaceManagement: {
    activeSpaces: SpaceCard[]
    templates: SpaceTemplate[]
    cloneWizard: CloneWizardModal
    deploymentQueue: DeploymentStatus[]
  }
  intelligenceCenter: {
    leoAI: LeoAIWidget
    businessInsights: BusinessInsightsWidget
    marketAnalysis: MarketAnalysisWidget
    competitiveIntel: CompetitiveIntelligenceWidget
  }
}

// Widget Wrapper Types (Embracing the title + data pattern)
export interface BusinessMetricsWidget {
  title: string
  data: {
    kpis: KPIMetric[]
    trends: TrendIndicator[]
    alerts: BusinessAlert[]
    recommendations: AIRecommendation[]
  }
}

export interface SpaceOverviewWidget {
  title: string
  data: SpaceOverviewData
}

export interface RevenueAnalyticsWidget {
  title: string
  data: {
    timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly'
    spaces: Array<{
      spaceId: string
      spaceName: string
      revenue: number[]
    }>
    breakdown: 'by_space' | 'by_product' | 'by_source'
  }
}

export interface NetworkStatusWidget {
  title: string
  data: {
    activeAngels: number
    totalRevenueGenerated: number
    totalRevenue: number
    successStories: SuccessStory[]
    networkHealth: NetworkHealthMetrics
  }
}

export interface LeoAIWidget {
  conversationHistory: Message[]
}

export interface BusinessInsightsWidget {
  insights: BusinessInsight[]
}

export interface MarketAnalysisWidget {
  trends: MarketTrend[]
  marketSize: MarketSize
  opportunities: Opportunity[]
}

export interface CompetitiveIntelligenceWidget {
  competitors: Competitor[]
}

// Business Metrics Types
export interface KPIMetric {
  id: string
  name: string
  value: number
  unit: string
  change: number
  changeType: 'increase' | 'decrease'
  target?: number
  trend?: 'up' | 'down' | 'stable'
}

export interface TrendIndicator {
  id: string
  metric: string
  direction: 'up' | 'down' | 'stable'
  percentage: number
  timeframe: string
  name: string
  currentValue: number
  previousValue: number
  period: string
}

export interface BusinessAlert {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: string
  resolved: boolean
  title: string
  description: string
}

export interface AIRecommendation {
  id: string
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
  category: string
  action?: () => void
  actionLabel?: string
}

// Revenue Analytics Types
export interface RevenueAnalyticsChart {
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly'
  data: RevenueDataPoint[]
  comparison: 'previous_period' | 'year_over_year'
  breakdown: 'by_space' | 'by_product' | 'by_source'
}

export interface RevenueDataPoint {
  date: string
  revenue: number
  orders: number
  averageOrderValue: number
}

// Network Status Types
export interface NetworkHealthMetrics {
  uptime: number
  responseTime: number
  errorRate: number
  satisfaction: number
}

export interface SuccessStory {
  id: string
  angelName: string
  businessName: string
  achievement: string
  revenue: number
  timestamp: string
  title: string
  summary: string
  link?: string
}

// Space Management Types
export interface SpaceCard {
  id: string
  name: string
  businessType: string
  status: 'active' | 'setup' | 'suspended' | 'deploying'
  memberCount: number
  revenue: number
  lastActivity: string
  domain: string
  thumbnailUrl?: string
}

export interface SpaceTemplate {
  id: string
  name: string
  description: string
  businessType: string
  features: string[]
  popularity: number
  thumbnail?: string
  thumbnailUrl?: string
}

export interface DeploymentStatus {
  id: string
  spaceName: string
  status: 'pending' | 'deploying' | 'completed' | 'failed' | 'in_progress' | 'queued'
  progress: number
  startedAt: string
  estimatedCompletion?: string
  startTime: Date
  endTime?: Date
}

// Clone Wizard Types
export interface SpaceCloneRequest {
  sourceSpaceId: string
  targetName: string
  targetDomain: string
  customizations: SpaceCustomization
  deploymentConfig: DeploymentConfig
  businessProfile: BusinessProfile
}

export interface SpaceCustomization {
  branding: BrandingConfig
  features: FeatureSet
  integrations: IntegrationConfig
  aiPersonality: AIPersonalityConfig
}

export interface BrandingConfig {
  primaryColor: string
  secondaryColor: string
  logo?: string
  favicon?: string
}

export interface FeatureSet {
  ecommerce: boolean
  booking: boolean
  crm: boolean
  analytics: boolean
}

export interface IntegrationConfig {
  stripe: boolean
  mailchimp: boolean
  analytics: boolean
}

export interface AIPersonalityConfig {
  tone: 'formal' | 'friendly' | 'humorous'
  expertise: string[]
  responseStyle: string
}

export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production'
  region: string
  scaling: ScalingConfig
  monitoring: MonitoringConfig
}

export interface ScalingConfig {
  minInstances: number
  maxInstances: number
  autoScale: boolean
}

export interface MonitoringConfig {
  alerts: boolean
  logging: boolean
  metrics: boolean
}

export interface BusinessProfile {
  industry: string
  size: 'small' | 'medium' | 'large'
  targetMarket: string
  goals: string[]
}

export interface CloneWizardModal {
  isOpen: boolean
  currentStep: number
  totalSteps: number
  data: SpaceCloneRequest
}

// Leo AI Interface Types
export interface LeoAIInterface {
  isConnected: boolean
  currentConversation: Conversation
  quickActions: LeoQuickAction[]
  capabilities: string[]
}

export interface Conversation {
  id: string
  messages: Message[]
  context: ConversationContext
}

export interface Message {
  id: string
  content: string
  sender: 'user' | 'leo'
  timestamp: string
  type: 'text' | 'action' | 'suggestion'
  speaker: 'user' | 'leo'
  message: string
}

export interface ConversationContext {
  spaceId: string
  businessType: string
  userIntent: string
  previousActions: string[]
}

export interface LeoQuickAction {
  id: string
  label: string
  description: string
  action: () => void
  icon?: string
}

// Intelligence Center Types
export interface InsightsPanel {
  insights: BusinessInsight[]
  trends: InsightTrend[]
  predictions: Prediction[]
}

export interface BusinessInsight {
  id: string
  title: string
  description: string
  category: string
  confidence: number
  actionable: boolean
  impact: 'low' | 'medium' | 'high'
  priority?: number
  summary?: string
  severity?: 'info' | 'warning' | 'critical'
  recommendation?: string
}

export interface InsightTrend {
  id: string
  metric: string
  direction: 'up' | 'down' | 'stable'
  strength: number
  timeframe: string
}

export interface Prediction {
  id: string
  metric: string
  predictedValue: number
  confidence: number
  timeframe: string
}

export interface MarketAnalysisWidget {
  trends: MarketTrend[]
  marketSize: MarketSize
  opportunities: Opportunity[]
}

export interface MarketTrend {
  id: string
  name: string
  growth: number
  relevance: number
  timeframe: string
  growthRate: number
  description: string
}

export interface MarketSize {
  total: number
  addressable: number
  penetration: number
  currency: string
}

export interface Opportunity {
  id: string
  title: string
  description: string
  potential: number
  effort: number
  timeline: string
}

export interface CompetitiveIntelligencePanel {
  competitors: Competitor[]
  marketPosition: MarketPosition
  threats: Threat[]
  advantages: Advantage[]
}

export interface Competitor {
  id: string
  name: string
  marketShare: number
  strengths: string[]
  weaknesses: string[]
  pricing: string
}

export interface MarketPosition {
  rank: number
  total: number
  category: string
  score: number
}

export interface Threat {
  id: string
  source: string
  severity: 'low' | 'medium' | 'high'
  description: string
  mitigation?: string
}

export interface Advantage {
  id: string
  category: string
  description: string
  strength: number
  sustainability: number
}

// Props interfaces for components
export interface BusinessMetricsProps {
  kpis: KPIMetric[]
  trends: TrendIndicator[]
  alerts: BusinessAlert[]
  recommendations: AIRecommendation[]
}

export interface BusinessInsightsPanelProps {
  insights: BusinessInsight[]
  trends: InsightTrend[]
  predictions: Prediction[]
}

export interface MarketAnalysisWidgetProps {
  trends: MarketTrend[]
  marketSize: MarketSize
  opportunities: Opportunity[]
}

export interface CompetitiveIntelligencePanelProps {
  competitors: Competitor[]
  marketPosition: MarketPosition
  threats: Threat[]
  advantages: Advantage[]
}

export interface NetworkStatusProps {
  activeAngels: number
  totalRevenue: number
  successStories: SuccessStory[]
  networkHealth: NetworkHealthMetrics
}

export interface RevenueAnalyticsProps {
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly'
  data: RevenueDataPoint[]
  comparison: 'previous_period' | 'year_over_year'
  breakdown: 'by_space' | 'by_product' | 'by_source'
}

// Additional interfaces needed
export interface SpaceOverviewData {
  activeSpaces: SpaceCard[]
  templates: SpaceTemplate[]
  deploymentQueue: DeploymentStatus[]
}

// Export alias for backward compatibility
export interface Insight extends BusinessInsight {} 
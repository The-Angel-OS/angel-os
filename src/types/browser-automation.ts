// Payment Processing Types
export interface PaymentResult {
  transactionId: string
  status: 'success' | 'failed' | 'pending' | 'cancelled'
  amount: number
  currency: string
  processor: string
  timestamp: Date
  fees: PaymentFees
  ethicalAssessment: EthicalAssessment
  auditTrail: string[]
}

export interface PaymentFees {
  processingFee: number
  platformFee: number
  networkFee: number
  total: number
  currency: string
}

// Document Signing Types
export interface DocumentRequest {
  documentId: string
  document: DocumentData
  signers: SignerInfo[]
  deadline?: Date
  workflow: SigningWorkflow
  complianceRequirements: string[]
}

export interface DocumentData {
  title: string
  content: string | Buffer
  format: 'pdf' | 'docx' | 'txt' | 'html'
  metadata: Record<string, any>
}

export interface SignerInfo {
  name: string
  email: string
  role: string
  signingOrder: number
  required: boolean
}

export interface SigningWorkflow {
  type: 'sequential' | 'parallel' | 'custom'
  steps: WorkflowStep[]
  notifications: NotificationSettings
}

export interface WorkflowStep {
  stepId: string
  assignee: string
  action: 'sign' | 'review' | 'approve' | 'acknowledge'
  deadline?: Date
  dependencies: string[]
}

export interface NotificationSettings {
  email: boolean
  sms: boolean
  webhook?: string
  reminders: ReminderSettings
}

export interface ReminderSettings {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'custom'
  maxReminders: number
}

export interface SignatureResult {
  documentId: string
  status: 'completed' | 'pending' | 'failed' | 'cancelled'
  signedBy: SignatureRecord[]
  completedAt?: Date
  downloadUrl?: string
  auditTrail: AuditRecord[]
}

export interface SignatureRecord {
  signer: string
  signedAt: Date
  ipAddress: string
  method: 'electronic' | 'digital' | 'biometric'
  valid: boolean
}

export interface AuditRecord {
  timestamp: Date
  action: string
  actor: string
  details: Record<string, any>
}

// Research Types
export interface ResearchQuery {
  domain: string
  industry: string
  keywords: string[]
  timeframe: string
  sources: ResearchSource[]
  depth: 'basic' | 'comprehensive' | 'deep'
}

export interface ResearchSource {
  name: string
  type: 'website' | 'database' | 'social' | 'news' | 'academic'
  credibility: number // 0-1
  accessMethod: 'public' | 'subscription' | 'api'
}

export interface ResearchResult {
  queryId: string
  findings: ResearchFinding[]
  sources: SourceReference[]
  confidence: number
  completedAt: Date
  recommendations: string[]
}

export interface ResearchFinding {
  topic: string
  summary: string
  evidence: Evidence[]
  relevance: number
  reliability: number
}

export interface Evidence {
  source: string
  content: string
  url?: string
  publishedAt?: Date
  credibilityScore: number
}

export interface SourceReference {
  name: string
  url: string
  accessedAt: Date
  reliability: number
}

// Migration Assessment Types
export interface MigrationAssessment {
  currentPlatform: string
  assessmentDate: Date
  limitations: PlatformLimitation[]
  alternatives: PlatformAlternative[]
  recommendation: MigrationRecommendation
  testResults: TestResult[]
  costAnalysis: CostAnalysis
}

export interface PlatformLimitation {
  category: string
  description: string
  impact: 'low' | 'medium' | 'high' | 'critical'
  workaround?: string
}

export interface PlatformAlternative {
  name: string
  score: number
  strengths: string[]
  weaknesses: string[]
  migrationEffort: number
  costEstimate: number
}

// This was not defined in the prompt, but is referenced by MigrationAssessment
// Adding a basic definition for it.
export interface MigrationRecommendation {
  platform: string;
  reasoning: string[];
  confidence: number;
}


export interface TestResult {
  platform: string
  testType: string
  success: boolean
  performance: PerformanceMetrics
  issues: string[]
  notes: string
}

export interface PerformanceMetrics {
  loadTime: number
  reliability: number
  userExperience: number
  features: FeatureSupport[]
}

export interface FeatureSupport {
  feature: string
  supported: boolean
  quality: number
  notes?: string
}

export interface CostAnalysis {
  setup: number
  monthly: number
  transaction: number
  migration: number
  training: number
  total: number
  currency: string
}

// Browser Task Types
export interface BrowserTask {
  taskId: string
  type: 'payment' | 'form' | 'research' | 'navigation' | 'extraction'
  url: string
  instructions: TaskInstruction[]
  data: Record<string, any>
  timeout: number
  retries: number
  ethicalConstraints: string[]
}

export interface TaskInstruction {
  step: number
  action: 'click' | 'type' | 'select' | 'wait' | 'extract' | 'verify'
  selector: string
  value?: string
  condition?: string
  errorHandling: 'retry' | 'skip' | 'abort'
}

export interface BrowserTaskResult {
  taskId: string
  status: 'success' | 'failed' | 'timeout' | 'blocked'
  data: Record<string, any>
  screenshots: string[]
  logs: TaskLog[]
  duration: number
  ethicalAssessment: EthicalAssessment
}

export interface TaskLog {
  timestamp: Date
  level: 'info' | 'warn' | 'error'
  message: string
  context: Record<string, any>
}

// Ethical Assessment Types (if not already defined)
// Assuming EthicalAssessment is defined elsewhere as per 001-typescript-errors-batch-1.md
// If not, it should be defined here. For now, assuming it's imported.
// For the purpose of this file, let's define it if it's directly used by types in this file.
// PaymentResult and BrowserTaskResult use EthicalAssessment.
export interface EthicalAssessment {
  violations: string[]
  severity: 'none' | 'minor' | 'moderate' | 'severe' | 'critical'
  recommendation: string
  principlesApplied: string[]
  humanReviewRequired: boolean
}

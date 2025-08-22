// Task 004: Business Intelligence Integration
// Defines interfaces for business metrics, insights, recommendations,
// and related data structures for embedding BI within messages.

export interface VisualizationConfig {
  type: 'bar_chart' | 'line_graph' | 'pie_chart' | 'data_grid' | 'kpi_card' | 'scatter_plot' | 'heatmap';
  title?: string;
  dataKey: string; // Key in contextualData or from metrics to visualize
  options?: Record<string, any>; // e.g., Chart.js options, AgGrid column definitions
  description?: string; // Brief explanation of the visualization
  dataSourceId?: string; // Identifier for the source of this visualization's data
}

export interface BusinessIntelligenceData {
  reportId?: string; // Optional ID if this BI data corresponds to a saved report
  title?: string; // Overall title for this BI data set
  metrics: BusinessMetric[];
  insights: BusinessInsight[];
  recommendations: BusinessRecommendation[];
  visualizations?: VisualizationConfig[];
  contextualData?: Record<string, any>; // Additional raw or supporting data
  dataSourceName?: string; // Name of the primary data source (e.g., 'Salesforce CRM', 'Google Analytics GA4')
  dataTimestamp?: Date; // Timestamp of the underlying data used for this BI snapshot
  generatedAt: Date; // Timestamp when this BI object was created/processed
  filtersApplied?: Record<string, any>; // Description of filters used to generate this data
}

export interface BusinessMetric {
  metricId: string; // Unique ID for this metric type, e.g., 'mrr', 'churn_rate'
  name: string; // Human-readable name, e.g., 'Monthly Recurring Revenue', 'Customer Churn Rate'
  value: number | string; // Current value
  unit: string; // e.g., 'USD', '%', 'users', 'days'
  trend?: 'up' | 'down' | 'stable' | 'n/a'; // Comparison to previous period or target
  changePercentage?: number; // Numeric change (e.g., 15 for +15%, -5 for -5%)
  timeframe: string; // e.g., 'Last 30 days', 'Q3 2023', 'Year-to-date'
  comparisonValue?: number | string; // Value from the period being compared against
  comparisonTimeframe?: string; // Timeframe for the comparisonValue
  context?: string; // e.g., 'vs. previous period', 'vs. target', 'industry benchmark'
  target?: number; // Target value for this metric
  status?: 'on_track' | 'at_risk' | 'achieved' | 'below_target' | 'exceeds_target';
  lastUpdated: Date;
}

export interface BusinessInsight {
  insightId: string; // Unique ID for this insight
  type: 'opportunity' | 'risk' | 'trend' | 'anomaly' | 'observation' | 'prediction' | 'correlation';
  title: string;
  description: string; // Detailed explanation of the insight
  confidence?: number; // Confidence level (0.0 to 1.0)
  severity?: 'low' | 'medium' | 'high' | 'critical'; // For risks or negative trends
  actionable: boolean;
  suggestedActions?: Array<{ actionId?: string; description: string; priority?: 'low' | 'medium' | 'high' }>;
  dataSource: string; // e.g., 'Automated Analysis Engine', 'Analyst Observation'
  relatedMetricIds?: string[]; // Metrics that support or are related to this insight
  tags?: string[];
  createdAt: Date;
}

export interface BusinessRecommendation {
  recommendationId: string; // Unique identifier
  title: string;
  description: string; // What to do and why
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  estimatedImpact?: {
    metricId: string; // Metric expected to be affected
    change: string; // e.g., '+5%', '-$10k'
    description?: string; // Qualitative impact
  };
  requiredResources?: string[]; // e.g., 'Marketing budget allocation', 'Engineering team (2 sprints)'
  effortLevel?: 'low' | 'medium' | 'high'; // Estimated effort to implement
  timeframeToImplement?: string; // e.g., 'Next quarter', 'Within 2 weeks'
  ethicalConsiderations?: string[];
  status: 'suggested' | 'under_review' | 'approved' | 'in_progress' | 'implemented' | 'rejected' | 'on_hold';
  relatedInsightIds?: string[]; // Insights that led to this recommendation
  dependencies?: string[]; // Other recommendations or tasks this depends on
  proposedBy?: string; // Who or what system proposed this
  createdAt: Date;
}

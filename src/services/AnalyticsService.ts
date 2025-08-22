// Analytics Service - Business Intelligence and Analytics for Angel OS
import { BusinessInsights, TrendAnalysis, RevenueData } from '../types/ship-mind'

export interface AnalyticsEvent {
  id: string
  eventType: string
  userId?: string
  sessionId: string
  timestamp: Date
  properties: Record<string, any>
  metadata: Record<string, any>
}

export interface Metric {
  name: string
  value: number
  unit: string
  timestamp: Date
  dimensions: Record<string, string>
}

export interface Dashboard {
  id: string
  name: string
  description: string
  widgets: Widget[]
  filters: Filter[]
  isPublic: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface Widget {
  id: string
  type: 'chart' | 'table' | 'metric' | 'map' | 'funnel'
  title: string
  config: WidgetConfig
  position: { x: number; y: number; width: number; height: number }
  dataSource: string
  filters: Filter[]
}

export interface WidgetConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'scatter' | 'area'
  xAxis?: string
  yAxis?: string
  groupBy?: string
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
  timeRange?: string
  limit?: number
}

export interface Filter {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
}

export interface Report {
  id: string
  name: string
  description: string
  type: 'scheduled' | 'on_demand'
  schedule?: string
  recipients: string[]
  format: 'pdf' | 'excel' | 'csv' | 'json'
  template: string
  lastRun?: Date
  nextRun?: Date
  status: 'active' | 'paused' | 'error'
}

export interface AnalyticsQuery {
  metric: string
  dimensions: string[]
  filters: Filter[]
  timeRange: {
    start: Date
    end: Date
  }
  groupBy?: string
  orderBy?: string
  limit?: number
}

export interface AnalyticsResult {
  data: Record<string, any>[]
  totalRows: number
  executionTime: number
  query: AnalyticsQuery
  metadata: {
    columns: string[]
    dataTypes: Record<string, string>
  }
}

export class AnalyticsService {
  private events: AnalyticsEvent[] = []
  private metrics: Metric[] = []
  private dashboards: Map<string, Dashboard> = new Map()
  private reports: Map<string, Report> = new Map()

  async trackEvent(eventData: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<AnalyticsEvent> {
    const event: AnalyticsEvent = {
      id: `evt_${Date.now()}`,
      ...eventData,
      timestamp: new Date()
    }

    this.events.push(event)
    return event
  }

  async recordMetric(metricData: Omit<Metric, 'timestamp'>): Promise<Metric> {
    const metric: Metric = {
      ...metricData,
      timestamp: new Date()
    }

    this.metrics.push(metric)
    return metric
  }

  async query(query: AnalyticsQuery): Promise<AnalyticsResult> {
    const startTime = Date.now()
    
    const mockData = [
      { date: '2024-01-01', value: 100, category: 'A' },
      { date: '2024-01-02', value: 150, category: 'B' },
      { date: '2024-01-03', value: 200, category: 'A' }
    ]

    const executionTime = Date.now() - startTime

    return {
      data: mockData,
      totalRows: mockData.length,
      executionTime,
      query,
      metadata: {
        columns: ['date', 'value', 'category'],
        dataTypes: {
          date: 'string',
          value: 'number',
          category: 'string'
        }
      }
    }
  }

  async getBusinessInsights(): Promise<BusinessInsights> {
    return {
      industryTrends: [
        {
          trend: 'AI Adoption in Small Business',
          direction: 'up',
          confidence: 0.85,
          timeframe: '2024 Q1'
        }
      ],
      competitiveIntelligence: [
        {
          name: 'Competitor A',
          strengths: ['Market Share', 'Brand Recognition'],
          weaknesses: ['Customer Service', 'Innovation Speed'],
          marketShare: 0.25
        }
      ],
      customerBehavior: [
        {
          pattern: 'Increased mobile usage',
          frequency: 0.75,
          impact: 'High engagement on mobile platforms',
          recommendation: 'Optimize mobile experience'
        }
      ],
      revenueProjections: [
        {
          period: '2024 Q2',
          projected: 150000,
          factors: ['Seasonal trends', 'New product launch']
        }
      ],
      riskAssessment: [
        {
          risk: 'Market volatility',
          probability: 0.3,
          impact: 0.7,
          mitigation: 'Diversify revenue streams'
        }
      ]
    }
  }

  async createDashboard(dashboardData: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard> {
    const dashboard: Dashboard = {
      id: `dash_${Date.now()}`,
      ...dashboardData,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.dashboards.set(dashboard.id, dashboard)
    return dashboard
  }

  async getDashboard(dashboardId: string): Promise<Dashboard | null> {
    return this.dashboards.get(dashboardId) || null
  }

  async updateDashboard(dashboardId: string, updates: Partial<Dashboard>): Promise<Dashboard | null> {
    const dashboard = this.dashboards.get(dashboardId)
    if (!dashboard) return null

    const updatedDashboard = {
      ...dashboard,
      ...updates,
      updatedAt: new Date()
    }

    this.dashboards.set(dashboardId, updatedDashboard)
    return updatedDashboard
  }

  async getRevenueAnalytics(timeRange: { start: Date; end: Date }): Promise<RevenueData[]> {
    return [
      {
        period: '2024-01',
        projected: 50000,
        actual: 48000,
        factors: ['New customer acquisition', 'Seasonal decline']
      },
      {
        period: '2024-02',
        projected: 55000,
        actual: 52000,
        factors: ['Marketing campaign', 'Product improvements']
      }
    ]
  }

  async getTrendAnalysis(metric: string, timeRange: { start: Date; end: Date }): Promise<TrendAnalysis[]> {
    return [
      {
        trend: `${metric} Growth`,
        direction: 'up',
        confidence: 0.8,
        timeframe: `${timeRange.start.toISOString().split('T')[0]} to ${timeRange.end.toISOString().split('T')[0]}`
      }
    ]
  }

  async getTopMetrics(limit: number = 10): Promise<Metric[]> {
    return this.metrics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  async getEventsByType(eventType: string, limit: number = 100): Promise<AnalyticsEvent[]> {
    return this.events
      .filter(event => event.eventType === eventType)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  async generateReport(reportId: string): Promise<any> {
    const report = this.reports.get(reportId)
    if (!report) throw new Error(`Report ${reportId} not found`)

    return {
      reportId,
      generatedAt: new Date(),
      data: {},
      format: report.format,
      status: 'completed'
    }
  }
}

export default AnalyticsService 
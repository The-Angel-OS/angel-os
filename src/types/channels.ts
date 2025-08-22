export interface Channel {
  id: string
  name: string
  icon: string
  type: 'chat' | 'orders' | 'analytics' | 'products' | 'customers' | 'system' | 'custom'
  component: ChannelComponent
  permissions?: string[]
  badge?: number | string
  description?: string
  messageTypes?: string[] // Types of messages this channel displays
  aiContext?: string // AI personality/context for this channel
}

export type ChannelComponent = 
  | 'ChatContainer'      // Real-time chat interface
  | 'OrdersManager'      // Order management dashboard
  | 'AnalyticsDashboard' // Real-time metrics
  | 'ProductCatalog'     // Product management
  | 'CustomerContainer'  // Customer communications hub
  | 'SystemContainer'    // System monitoring and logs
  | 'CustomComponent'    // Extensible for future

export const channels: Channel[] = [
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
  },
  {
    id: 'orders',
    name: 'orders',
    icon: '📦',
    type: 'orders',
    component: 'OrdersManager',
    badge: 3,
    permissions: ['orders.read'],
    description: 'Order management and commerce operations',
    messageTypes: ['order_notification', 'payment_alert', 'shipping_update'],
    aiContext: 'commerce_advisor'
  },
  {
    id: 'system',
    name: 'system',
    icon: '⚠️',
    type: 'system',
    component: 'SystemContainer',
    permissions: ['system.monitor'],
    description: 'System monitoring, errors, and operations',
    messageTypes: ['system_log', 'error_report', 'heartbeat', 'ai_generation_status'],
    aiContext: 'technical_advisor'
  },
  {
    id: 'analytics',
    name: 'analytics',
    icon: '📊',
    type: 'analytics',
    component: 'AnalyticsDashboard',
    permissions: ['analytics.view'],
    description: 'Business intelligence and performance metrics',
    messageTypes: ['revenue_alert', 'conversion_notification', 'trend_analysis'],
    aiContext: 'business_intelligence'
  }
]

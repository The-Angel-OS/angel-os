// Task 004: Enhanced Message Content Structure
// Defines the core interfaces for message content, dynamic widgets,
// system messages, action messages, business intelligence data, and metadata.

import { BusinessIntelligenceData as FullBusinessIntelligenceData } from "./business-intelligence";
import { DetectedIntent as FullDetectedIntent } from "./conversation";

// Basic placeholder types, can be expanded or moved later
// These are defined here to make `DynamicWidget` and `MessageMetadata` self-contained for now.

export interface EthicalAssessment { // Placeholder from Task 001
  assessmentId: string;
  decision: 'approved' | 'rejected' | 'needs_review';
  reasoning: string;
  timestamp: Date;
  // Assuming further details from ShipMindOrchestrator types
}

export enum WidgetType {
  Chart = 'chart',
  Form = 'form',
  DataTable = 'data_table',
  QuickReply = 'quick_reply',
  InfoCard = 'info_card',
  Media = 'media', // For images, videos
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'checkbox' | 'date' | 'textarea';
  options?: Array<{ label: string; value: string }>; // For select type
  required?: boolean;
  defaultValue?: any;
}

export interface WidgetContent {
  // This structure will vary significantly based on the WidgetType
  // Example for a 'chart':
  chartType?: 'bar' | 'line' | 'pie';
  data?: Record<string, any>; // Actual data points
  options?: Record<string, any>; // Chart.js or similar library options
  // Example for a 'form':
  fields?: FormField[];
  submitUrl?: string; // URL to post form data
  // Example for 'info_card':
  title?: string;
  description?: string;
  imageUrl?: string;
  links?: Array<{ text: string; url: string }>;
  // Example for 'media'
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
  altText?: string;
}

export enum InteractionCapability {
  Submit = 'submit', // e.g., for forms
  Filter = 'filter', // e.g., for data tables
  Sort = 'sort',     // e.g., for data tables
  Navigate = 'navigate', // e.g., for links or buttons
  QuickReply = 'quick_reply' // e.g., for predefined replies
}

export interface BusinessContext {
  domain: string; // e.g., 'finance', 'healthcare', 'logistics', 'customer_support'
  processId?: string; // ID of a specific business process
  taskId?: string; // ID of a specific task within a process
  currentGoal?: string; // User or system goal, e.g., 'resolve_dispute', 'onboard_new_client'
  stakeholders?: string[]; // e.g. ['sales_team', 'customer']
}

export interface SentimentAnalysis {
  score: number; // Typically -1 (very negative) to 1 (very positive)
  label: 'positive' | 'negative' | 'neutral' | 'mixed';
  magnitude?: number; // Strength of emotion, regardless of valence
  keywords?: Array<{ text: string; relevance: number }>;
}

export interface UserContext {
  userId: string; // From Payload's user object
  role: string; // e.g., 'admin', 'manager', 'agent', 'customer'
  permissions?: string[];
  preferences?: Record<string, any>; // User-specific settings
  activeSessionId?: string;
}

export interface VisualizationConfig { // As defined in BI types, but useful here too.
  type: 'bar_chart' | 'line_graph' | 'pie_chart' | 'data_grid' | 'kpi_card' | 'scatter_plot';
  title?: string;
  dataKey: string; // Key in contextualData or metrics to visualize
  options?: Record<string, any>; // Chart.js or other library options
  description?: string;
}


// Core Message Structure
export interface MessageContent {
  type: 'text' | 'widget' | 'system' | 'action' | 'intelligence';
  text?: string; // For type 'text' or as a fallback description
  widgets?: DynamicWidget[]; // For type 'widget'
  systemData?: SystemMessageData; // For type 'system'
  actionData?: ActionMessageData; // For type 'action'
  intelligenceData?: FullBusinessIntelligenceData; // For type 'intelligence'
  metadata?: MessageMetadata; // Common metadata for all types
}

export interface DynamicWidget {
  widgetId: string; // Unique ID for this instance of the widget
  type: WidgetType;
  title: string;
  content: WidgetContent; // Contains the specific data and config for this widget type
  interactionCapabilities?: InteractionCapability[];
  businessContext?: BusinessContext;
  ethicalConstraints?: string[]; // e.g., "Do not display PII", "Ensure accessibility"
}

export interface SystemMessageData {
  eventType: 'user_joined' | 'space_created' | 'payment_processed' | 'automation_completed' | 'file_uploaded' | 'task_assigned' | 'notification';
  details: Record<string, any>; // Event-specific details
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'success' | 'debug';
}

export interface ActionMessageData {
  actionId: string; // Unique ID for this action
  actionType: 'payment' | 'document_signing' | 'research' | 'space_cloning' | 'api_call' | 'database_update'; // Extensible list of action types
  status: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'pending_approval' | 'cancelled';
  results?: Record<string, any>; // Outcome of the action
  errorDetails?: Record<string, any>; // Details if the action failed
  ethicalAssessment?: EthicalAssessment; // Link to ethical review, if applicable (from Task 001)
  auditTrail?: string[]; // Log of steps taken during the action
  initiatedBy?: 'user' | 'system' | 'agent';
  timestamp: Date;
}

export interface MessageMetadata {
  conversationId: string;
  threadId?: string; // For grouping messages within a conversation (e.g., replies to a specific message)
  replyToId?: string; // Message ID this is a reply to
  intent?: FullDetectedIntent; // From conversation.ts
  sentiment?: SentimentAnalysis;
  businessContext?: BusinessContext;
  userContext?: UserContext; // Context about the sender or primary user involved
  tags?: string[]; // For categorization or filtering
  source?: string; // e.g., 'web_app', 'mobile_app', 'api', 'slack_integration'
  clientInfo?: { // Information about the client that sent/received the message
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
  };
  importance?: 'low' | 'normal' | 'high';
  attachments?: Array<{ fileId: string; fileName: string; fileType: string; url?: string }>;
}

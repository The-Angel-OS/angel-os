// src/types/space-data.ts

// Attempt to import MessageContent. If it's not suitable, we might need to define a local version.
import type { MessageContent as ImportedMessageContent } from './messages';

// Define AgentPersonality and AgentConfig here if not available from a dedicated agents type file.
interface AgentPersonality {
  name: string;
  style: string; // e.g., 'professional', 'friendly', 'witty'
  // Could include other aspects like 'voiceTone', 'languageComplexity'
}

interface AgentConfig {
  knowledgeBaseIds?: string[]; // IDs of knowledge bases the agent can access
  promptTemplate?: string; // Default prompt or template identifier
  allowedTools?: string[]; // List of tools or functions the agent can use
  responseGuidelines?: string; // Specific instructions for how the agent should respond
}

// Define a local MessageContent if the imported one is not suitable or to avoid issues.
// For now, let's assume ImportedMessageContent has at least 'type', 'text'.
// If ImportedMessageContent is very different, we'd define a specific one here.
// For this exercise, let's use a more concrete local definition aligned with SpaceData needs.
interface LocalMessageContent {
  type: 'text' | 'widget' | 'system' | 'action' | 'multimedia'; // Expanded possibilities
  text?: string;
  widgetId?: string; // If type is 'widget'
  systemEvent?: string; // If type is 'system' (e.g., 'user_joined', 'file_uploaded')
  actionName?: string; // If type is 'action' (e.g., 'payment_processed', 'task_created')
  mediaUrl?: string; // If type is 'multimedia'
  caption?: string; // If type is 'multimedia'
  // This can be expanded based on the actual variety of message contents.
}


// Assuming CustomerData and OrderItem are defined elsewhere or will be simple structures for now.
interface CustomerData {
  id: string; // User ID or Contact ID
  name?: string;
  email?: string;
  phone?: string;
}

interface OrderItem {
  productId: string;
  productTitle?: string; // Denormalized for easier display
  quantity: number;
  pricePerUnit: number; // Changed from 'price' for clarity
  variantId?: string;
  variantDescription?: string;
}

export interface SpaceData {
  messages?: {
    id: string; // Original message ID, or a new UUID if these are new entries
    content: LocalMessageContent; // Using local definition for clarity
    sender: string; // User ID
    timestamp: string; // ISO 8601 date-time string
    messageType: 'user' | 'leo' | 'system' | 'action' | 'intelligence';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    threadId?: string; // ID of the root message in a thread
    replyToId?: string; // Message ID this is a reply to
    reactions?: Record<string, string[]>; // emoji: UserID[] e.g. {"👍": ["user1", "user2"]}
    readBy?: string[]; // Array of UserIDs who have read this message
    isPinned?: boolean;
    attachments?: { name: string; url: string; type: string }[]; // Simplified attachments
  }[];

  products?: {
    id: string; // Original product ID
    title: string;
    description?: string;
    sku?: string;
    productType: 'physical' | 'digital' | 'service' | 'ai_print_demand' | 'consultation_solo' | 'group_event' | 'livekit_stream' | 'digital_download' | 'subscription' | 'course_training' | 'business_service' | 'automation';
    status: 'draft' | 'published' | 'archived' | 'active' | 'out_of_stock';
    pricing: {
      basePrice: number;
      salePrice?: number;
      currency: string; // e.g., 'USD', 'EUR'
      taxable?: boolean;
    };
    inventory?: {
      quantity: number;
      trackQuantity: boolean;
      lowStockThreshold?: number;
      allowBackorder?: boolean;
      locations?: { locationId: string; quantity: number }[]; // Multi-location inventory
    };
    categories?: string[]; // Category names or IDs
    tags?: string[];
    images?: { url: string; altText?: string; isPrimary?: boolean }[]; // Product images
    // Add other essential fields that need to be queryable or are frequently displayed with the space.
    // For example, simplified vendor info, key attributes, etc.
    averageRating?: number;
    reviewCount?: number;
  }[];

  orders?: {
    id: string; // Original order ID
    orderNumber?: string; // Human-readable order number
    customer: CustomerData;
    items: OrderItem[];
    status: 'pending' | 'payment_received' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'disputed'; // Expanded
    totalAmount: number; // Renamed from 'total'
    currency: string;
    createdAt: string; // ISO 8601
    updatedAt?: string; // ISO 8601
    paymentMethod?: string;
    shippingAddress?: any; // Simplified address object or ID
    billingAddress?: any;  // Simplified address object or ID
    discountCodes?: string[];
    notes?: string;
  }[];

  appointments?: {
    id: string; // Original appointment ID
    title: string;
    customer: CustomerData;
    scheduledAt: string; // ISO 8601
    durationMinutes: number; // Renamed from 'duration'
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show'; // Expanded
    notes?: string;
    serviceId?: string; // Link to a product/service being booked
    providerId?: string; // User ID of the service provider
    location?: string; // Physical location or 'virtual'
    meetingLink?: string; // For virtual appointments
  }[];

  inventory?: { // General inventory items not necessarily tied to a specific product's saleable stock
    itemId: string; // Could be a product ID or a standalone inventory item ID
    itemName?: string;
    quantity: number;
    unit?: string; // e.g., 'pieces', 'kg', 'liters'
    location?: string; // Storage location identifier
    lastUpdatedAt: string; // ISO 8601
    supplierInfo?: { supplierId: string; supplierName?: string };
  }[];

  agents?: { // Renamed from businessAgents
    id: string; // Original BusinessAgent ID or new UUID
    name: string;
    type?: 'customer_support' | 'sales_outreach' | 'technical_assistant' | 'onboarding_specialist';
    personality: AgentPersonality;
    isActive: boolean;
    configuration: AgentConfig;
    performanceMetrics?: { // Example metrics
      resolvedIssues?: number;
      averageResponseTime?: number; // in seconds
      customerSatisfaction?: number; // percentage
    };
  }[];

  forms?: {
    id: string; // Original Form ID or new UUID
    name: string;
    description?: string;
    fields: {
      fieldId: string;
      name: string; // Technical name/key
      label: string; // Display label
      type: 'text' | 'textarea' | 'email' | 'number' | 'select' | 'checkbox' | 'radio' | 'date';
      required?: boolean;
      options?: { label: string; value: string }[]; // For select, checkbox, radio
      placeholder?: string;
      defaultValue?: any;
    }[];
    submissionCount?: number;
    lastSubmissionAt?: string; // ISO 8601
  }[];

  subscriptions?: {
    id: string; // Original Subscription ID or new UUID
    userId: string; // User who is subscribed
    planId: string; // ID of the subscription plan (could be a product ID or a dedicated plan ID)
    planName?: string; // Denormalized for display
    status: 'active' | 'cancelled' | 'past_due' | 'trialing' | 'pending_payment' | 'paused'; // Expanded
    startDate: string; // ISO 8601
    endDate?: string; // ISO 8601 (if applicable)
    nextBillingDate?: string; // ISO 8601
    price: number;
    currency: string;
    billingCycle: 'monthly' | 'yearly' | 'weekly'; // Added
    paymentMethodId?: string; // Reference to a stored payment method
  }[];

  // Suggested additions from review
  _indexes?: { // Optional, conceptual for planning query optimization
    messagesByType?: Record<string, string[]>;  // messageType -> message IDs
    messagesBySender?: Record<string, string[]>; // senderId -> message IDs
    productsByCategory?: Record<string, string[]>; // categoryId -> product IDs
    productsByStatus?: Record<string, string[]>; // status -> product IDs
    ordersByStatus?: Record<string, string[]>; // status -> order IDs
    appointmentsByStatus?: Record<string, string[]>; // status -> appointment IDs
  };

  _metadata?: { // Optional, for data management and auditing
    lastUpdated: string; // ISO 8601 timestamp of the last update to this SpaceData object
    version: string; // Version of the SpaceData schema or migration
    migrationSource?: string; // Identifier for the migration script/process that populated/updated this
    dataQualityScore?: number; // 0-100, if automated checks are performed
  };
}

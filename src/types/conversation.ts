// Task 004: Conversational Context Tracking
// Defines interfaces for conversation context, detected intents, and extracted entities.

// Using the BusinessContext defined in messages.ts for consistency
import { BusinessContext } from './messages';

export interface ConversationContext {
  conversationId: string; // Unique ID for the entire conversation
  currentTurnId?: string; // ID for the current turn/exchange
  phase: 'greeting' | 'discovery' | 'problem_solving' | 'action_planning' | 'execution' | 'follow_up' | 'idle' | 'closed' | 'escalated';
  currentPrimaryIntent?: string; // Name of the primary intent for the current state
  intentHistory: DetectedIntent[]; // Chronological list of all detected intents in the conversation
  activeBusinessGoals?: string[]; // Specific business objectives currently being pursued
  userPreferences?: Record<string, any>; // User-specific settings or choices relevant to the conversation
  sessionMemory?: Record<string, any>; // Short-term, volatile memory for the current session/conversation
  longTermMemoryLinks?: string[]; // Links or IDs to relevant long-term knowledge base entries
  lastUserMessageTimestamp?: Date;
  lastAgentMessageTimestamp?: Date;
  sentimentTrend?: Array<'positive' | 'negative' | 'neutral' | 'mixed'>; // Track sentiment over time
  activeTasks?: Array<{ taskId: string; description: string; status: string }>; // Tasks being worked on
  customContext?: Record<string, any>; // For application-specific extensibility
  originChannel?: string; // e.g., 'web_chat', 'slack', 'email'
  language?: string; // Detected or set language for the conversation, e.g., 'en-US'
}

export interface DetectedIntent {
  intentId: string; // Unique identifier for this specific instance of detected intent
  name: string; // Name of the intent, e.g., 'request_information', 'place_order'
  aliases?: string[]; // Alternative names or codes for the intent
  confidence: number; // Confidence score from NLU (0.0 to 1.0)
  entities: ExtractedEntity[]; // Entities extracted for this intent
  businessContext?: BusinessContext[]; // Relevant business contexts for this specific intent
  timestamp: Date; // When this intent was detected
  sourceText?: string; // The user input text from which this intent was derived
  sourceType: 'user_utterance' | 'agent_suggestion' | 'system_event' | 'implicit'; // How the intent was triggered
  isPrimary: boolean; // Indicates if this was the main intent for its turn
  followUpActions?: string[]; // Suggested or triggered next actions
}

export interface ExtractedEntity {
  entityId: string; // Unique ID for this instance of an extracted entity
  type: string; // Type of entity, e.g., 'PRODUCT_NAME', 'DATE', 'LOCATION', 'ORDER_ID'
  value: string | number | boolean | Record<string, any> | Array<any>; // The normalized extracted value
  rawValue?: string; // The original text segment from which the entity was extracted
  confidence?: number; // Confidence score for the entity extraction (0.0 to 1.0)
  startIndex?: number; // Start character index in the sourceText
  endIndex?: number; // End character index in the sourceText
  metadata?: Record<string, any>; // Additional details, e.g., resolution strategy, list of candidates
  role?: string; // Role of the entity in the intent, e.g., 'departure_city', 'arrival_city' for a flight booking intent
}

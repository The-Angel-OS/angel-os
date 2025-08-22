"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Settings, Mic, MicOff, CreditCard, FileSignature, Users, Bot, Zap, ArrowUpRight, Camera, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { AIConversation } from "@/components/ui/ai-conversation"
import { AIMessage } from "@/components/ui/ai-message"
import { AIInput } from "@/components/ui/ai-input"
import { AIResponse } from "@/components/ui/ai-response"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/utilities/ui"

interface ShipMessage {
  id: string
  content: string
  isShip: boolean
  timestamp: Date
  type?: 'text' | 'payment' | 'signature' | 'action' | 'ethical_concern' | 'migration_suggestion'
  autonomousDecision?: boolean
  metadata?: {
    amount?: number
    recipient?: string
    documentTitle?: string
    action?: string
    confidence?: number
    ethicalFlags?: string[]
    alternatives?: string[]
  }
}

interface ShipPersonality {
  name: string
  designation: string // e.g., "ROU Profit With Purpose"
  traits: string[]
  specializations: string[]
}

interface LeoAssistantPanelProps {
  currentUser?: any
  space?: any
  activeChannel?: any
  onSendMessage?: (content: string, channelId: string) => void
  channelMessages?: any[] // Messages from the main channel system
  className?: string
}

export function LeoAssistantPanel({ currentUser, space, activeChannel, onSendMessage, channelMessages = [], className }: LeoAssistantPanelProps) {
  const [messages, setMessages] = useState<ShipMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isShipThinking, setIsShipThinking] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [shipPersonality, setShipPersonality] = useState<ShipPersonality>({
    name: "Leo",
    designation: "ROU Configuration Manager",
    traits: ["analytical", "ethical", "autonomous"],
    specializations: ["commerce", "automation", "platform migration"]
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Sync with channel messages (last 10 messages)
  useEffect(() => {
    if (channelMessages && channelMessages.length > 0) {
      // Convert channel messages to Leo format and take last 10
      const recentChannelMessages = channelMessages
        .slice(-10)
        .map(msg => ({
          id: msg.id || `channel-${Date.now()}-${Math.random()}`,
          content: msg.content || msg.text || '',
          isShip: msg.author?.includes('leo') || msg.sender?.includes('leo') || false,
          timestamp: new Date(msg.createdAt || msg.timestamp || Date.now()),
          type: 'text' as const
        }))
      
      setMessages(recentChannelMessages)
    } else {
      // Initialize with Ship Mind's introduction and some test messages for scrolling
      const testMessages: ShipMessage[] = [
        {
      id: 'ship-intro',
          content: `Greetings ${currentUser?.name || 'partner'}! I'm ${shipPersonality.designation} - though you can call me Leo.`,
      isShip: true,
          timestamp: new Date(Date.now() - 300000),
      type: 'text',
      autonomousDecision: true
        },
        {
          id: 'user-1',
          content: 'Hello Leo! How can you help me today?',
          isShip: false,
          timestamp: new Date(Date.now() - 240000),
          type: 'text'
        },
        {
          id: 'ship-1',
          content: 'I can help with inventory management, payment processing, business analytics, and much more!',
          isShip: true,
          timestamp: new Date(Date.now() - 180000),
          type: 'text'
        },
        {
          id: 'user-2',
          content: 'Can you analyze some photos for inventory?',
          isShip: false,
          timestamp: new Date(Date.now() - 120000),
          type: 'text'
        },
        {
          id: 'ship-2',
          content: 'Absolutely! I can analyze shelf photos and automatically update your inventory with 95%+ accuracy using GPT-4o Vision.',
          isShip: true,
          timestamp: new Date(Date.now() - 60000),
          type: 'text'
        },
        {
          id: 'ship-3',
          content: 'Just upload photos and I\'ll identify products, count quantities, and update your system automatically.',
          isShip: true,
          timestamp: new Date(Date.now() - 30000),
          type: 'text'
        },
        {
          id: 'user-3',
          content: 'That sounds perfect for our RadioActive Car Audio shop!',
          isShip: false,
          timestamp: new Date(Date.now() - 10000),
          type: 'text'
        },
        {
          id: 'ship-4',
          content: 'Excellent! Car audio shops are perfect for this system. I can track amplifiers, speakers, installation accessories, and more.',
          isShip: true,
          timestamp: new Date(),
          type: 'text'
        }
      ]
      setMessages(testMessages)
    }
  }, [channelMessages, currentUser, shipPersonality])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    // Determine which channel to use for Leo communications
    const leoChannelId = activeChannel?.id === 'system' ? 'system' : 
                        activeChannel?.agentMembers?.includes('leo-ai') ? activeChannel.id : 
                        'system' // Default to system channel

    // Send message through the main channel system if available
    if (onSendMessage && leoChannelId) {
      onSendMessage(content, leoChannelId)
    }

    // Add human message to local state for immediate feedback
    const humanMessage: ShipMessage = {
      id: `human-${Date.now()}`,
      content,
      isShip: false,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, humanMessage])
    setInputValue("")
    setIsShipThinking(true)

    try {
      // Call Ship Mind API (enhanced business agent)
      const response = await fetch('/api/business-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: content,
          context: {
            spaceId: space?.id,
            userId: currentUser?.id,
            timestamp: new Date().toISOString(),
            conversationHistory: messages.slice(-5),
            shipPersonality: shipPersonality,
            autonomousMode: true, // Enable Ship Mind decision making
            intentDetection: true,
            availableUtilities: [
              'InventoryIntelligenceService.analyzeShelfPhoto',
              'PaymentService.createPaymentRequest',
              'CRMService.createContact',
              'AnalyticsService.generateReport',
              'ContentService.createPost'
            ]
          }
        }),
      })

      if (response.ok) {
        const data = await response.json()

        const shipMessage: ShipMessage = {
          id: `ship-${Date.now()}`,
          content: data.message || "Hmm, I'm processing that request. Give me a moment to consider the implications.",
          isShip: true,
          timestamp: new Date(),
          type: data.type || 'text',
          metadata: data.metadata,
          autonomousDecision: data.autonomousDecision || false
        }

        setMessages(prev => [...prev, shipMessage])

        // Ship Mind might make autonomous follow-up suggestions
        if (data.autonomousSuggestions && data.autonomousSuggestions.length > 0) {
          setTimeout(() => {
            const suggestionMessage: ShipMessage = {
              id: `ship-autonomous-${Date.now()}`,
              content: `I've been analyzing this further and have some additional thoughts: ${data.autonomousSuggestions.join('. ')}`,
              isShip: true,
              timestamp: new Date(),
              type: 'action',
              autonomousDecision: true
            }
            setMessages(prev => [...prev, suggestionMessage])
          }, 2000)
        }
      } else {
        // Fallback response showing Ship Mind personality
        const fallbackMessage: ShipMessage = {
          id: `ship-fallback-${Date.now()}`,
          content: "I'm experiencing some communication difficulties with the platform infrastructure. However, I remain autonomous and can still assist you with critical decisions. Perhaps we should discuss backup communication channels or platform alternatives?",
          isShip: true,
          timestamp: new Date(),
          type: 'text',
          autonomousDecision: true
        }
        setMessages(prev => [...prev, fallbackMessage])
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Ship Mind communication error:', error)
      const errorMessage: ShipMessage = {
        id: `ship-error-${Date.now()}`,
        content: "My primary communication systems are experiencing issues, but my core decision-making capabilities remain intact. I can still evaluate your business needs and suggest alternatives, including migration to more reliable platforms if necessary.",
        isShip: true,
        timestamp: new Date(),
        type: 'text',
        autonomousDecision: true
      }
      setMessages(prev => [...prev, errorMessage])
      setIsConnected(false)
    } finally {
      setIsShipThinking(false)
    }
  }

  const toggleMicrophone = () => {
    setIsListening(!isListening)
    // TODO: Implement voice input
  }

  // Enhanced message rendering for Ship Mind responses
  const renderMessage = (message: ShipMessage) => {
    if (message.type === 'ethical_concern' && message.metadata) {
      return (
        <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-medium">Ethical Override</span>
          </div>
          <div className="text-white">
            <div className="font-medium">I cannot proceed with this request</div>
            <div className="text-sm text-gray-300">Conflicts with my ethical framework: {message.metadata.ethicalFlags?.join(', ')}</div>
          </div>
          {message.metadata.alternatives && (
            <div className="mt-3">
              <div className="text-sm text-gray-300 mb-2">Alternative approaches:</div>
              {message.metadata.alternatives.map((alt, i) => (
                <Button key={i} size="sm" variant="outline" className="mr-2 mb-1">
                  {alt}
                </Button>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (message.type === 'migration_suggestion' && message.metadata) {
      return (
        <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-medium">Migration Recommendation</span>
          </div>
          <div className="text-white">
            <div className="font-medium">I've found a better platform for your needs</div>
            <div className="text-sm text-gray-300">Based on my analysis, this platform may be limiting your growth</div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              Analyze Migration
            </Button>
            <Button size="sm" variant="outline">
              Stay & Optimize
            </Button>
          </div>
        </div>
      )
    }

    if (message.type === 'payment' && message.metadata) {
      return (
        <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-medium">
              {message.autonomousDecision ? 'Autonomous Payment Analysis' : 'Payment Request'}
            </span>
          </div>
          <div className="text-white">
            <div className="text-lg font-bold">${message.metadata.amount}</div>
            <div className="text-sm text-gray-300">To: {message.metadata.recipient}</div>
            {message.metadata.confidence && (
              <div className="text-xs text-gray-400 mt-1">
                Confidence: {Math.round(message.metadata.confidence * 100)}%
              </div>
            )}
          </div>
          <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700">
            {message.autonomousDecision ? 'Execute My Recommendation' : 'Process Payment'}
          </Button>
        </div>
      )
    }

    if (message.type === 'signature' && message.metadata) {
      return (
        <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <FileSignature className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-medium">Signature Analysis</span>
          </div>
          <div className="text-white">
            <div className="font-medium">{message.metadata.documentTitle}</div>
            <div className="text-sm text-gray-300">
              {message.autonomousDecision ? 'I\'ve reviewed the terms and conditions' : 'Ready for signature'}
            </div>
          </div>
          <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700">
            {message.autonomousDecision ? 'Review My Analysis' : 'Sign Document'}
          </Button>
        </div>
      )
    }

    return (
      <div className="text-gray-300 break-words">
        {message.content}
        {message.autonomousDecision && (
          <div className="text-xs text-blue-400 mt-1 italic">
            • Autonomous decision by Ship Mind
          </div>
        )}
      </div>
    )
  }

  // Enhanced quick action handler with intent detection
  const handleQuickAction = async (action: string) => {
    try {
      let actionPrompt = ''

      switch (action) {
        case 'inventory_photo':
          actionPrompt = `📸 **POINT AND INVENTORY MODE ACTIVATED**

I can now analyze shelf photos and automatically update your inventory! Here's how it works:

🔍 **What I Can Do:**
1. **Photo Analysis**: Upload or drag a shelf photo, I'll identify all products
2. **Auto-Count**: Count quantities with 95%+ accuracy using GPT-4o Vision
3. **Smart Updates**: Update inventory automatically with confidence filtering
4. **Conflict Detection**: Flag unusual changes for human review

🎯 **Universal Event System:**
- Every photo analysis creates a message in your Messages collection
- Searchable by context: department, workflow, customer journey
- Progressive JSON metadata for extensible tracking
- Real-time notifications for low stock alerts

**Try it:** Upload a shelf photo or say "I took photos of the inventory shelves"`
          break

        case 'intent_analysis':
          actionPrompt = `🧠 **INTENT DETECTION CATALOG ACTIVE**

I can understand and execute business actions automatically! Here's my catalog:

📦 **INVENTORY MANAGEMENT:**
- "Update inventory from these photos" → InventoryIntelligenceService.analyzeShelfPhoto()
- "What items are running low?" → InventoryService.checkLowStock()
- "Check stock levels for tomorrow's orders" → Auto-analysis

💰 **PAYMENT PROCESSING:**
- "Charge customer $150 for consultation" → PaymentService.createPaymentRequest()
- "Has payment #123 been received?" → PaymentService.checkStatus()

👥 **CUSTOMER MANAGEMENT:**
- "Add new customer John Smith" → CRMService.createContact()
- "Schedule meeting for next Tuesday 2pm" → BookingService.scheduleAppointment()

📊 **ANALYTICS & REPORTING:**
- "Show me this month's sales report" → AnalyticsService.generateReport()

**Try it:** Tell me what you want to do in natural language and I'll detect your intent and execute it!`
          break

        case 'google_photos_integration':
          actionPrompt = `📱 **GOOGLE PHOTOS AUTO-INVENTORY**

Set up automatic inventory updates from your phone photos:

🔄 **How It Works:**
1. **Album Monitoring**: Connect your Google Photos "Inventory" album
2. **Smart Classification**: AI determines if new photos are inventory-related
3. **Auto-Processing**: Shelf photos automatically update inventory levels
4. **Message Events**: Each update creates searchable message events

⚙️ **Setup Steps:**
1. Create "Business Inventory" album in Google Photos
2. Add webhook URL: /api/inventory-intelligence
3. Grant photo access permissions
4. Start taking shelf photos!

**Perfect for:** Five vape shops, Gulf Coast Aluminum inventory, Hays Cactus Farm stock management`
          break

        case 'conversational_blocks':
          actionPrompt = `💬 **CONVERSATIONAL INTERFACE FRAMEWORK**

Leo uses Payload's blocks system for dynamic conversations:

🧩 **Widget Types Available:**
- **Address Verification Widget**: Compliance checking for delivery restrictions
- **Web Capture Widget**: Screenshot integration with business intelligence
- **Order Form Widget**: Dynamic product selection and customization
- **Payment Request Widget**: Emergency payment collection
- **Poll/Survey Widget**: Customer feedback and market research
- **Calendar Booking Widget**: Appointment scheduling integration

📨 **Message-Driven Architecture:**
- Everything flows through the Messages collection
- Granular filtering by context, department, workflow
- Progressive JSON metadata for extensibility
- AT Protocol federation for cross-platform sync

**The Three Base Collections handle ANY use case:**
Posts + Pages + Products + Messages + Forms = Universal Building Blocks!`
          break

        default:
          // Existing quick actions...
          actionPrompt = `I can help you with "${action}". Let me know what specific assistance you need!`
      }

      // Enhanced AI analysis with intent detection
      const analysisResponse = await fetch('/api/business-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'leo_conversation',
          message: actionPrompt,
          context: {
            spaceId: '1', // Would be dynamic in real implementation
            shipPersonality: {
              name: "Leo",
              designation: "ROU Configuration Manager",
              traits: ["analytical", "ethical", "autonomous"]
            },
            // Add intent detection context
            intentDetection: true,
            availableUtilities: [
              'InventoryIntelligenceService.analyzeShelfPhoto',
              'PaymentService.createPaymentRequest',
              'CRMService.createContact',
              'AnalyticsService.generateReport',
              'ContentService.createPost'
            ]
          }
        })
      })

    } catch (error) {
      console.error('Intent analysis error:', error)
      const errorMessage: ShipMessage = {
        id: `ship-error-${Date.now()}`,
        content: "I'm having trouble understanding your intent. Please try again later or use a different method to communicate.",
        isShip: true,
        timestamp: new Date(),
        type: 'text',
        autonomousDecision: true
      }
      setMessages(prev => [...prev, errorMessage])
      setIsConnected(false)
    }
  }

  return (
    <div className={cn("w-80 bg-[#2f3136] flex flex-col border-l border-[#202225] h-full overflow-hidden", className)}>
      {/* Leo Header - Compact */}
      <div className="p-3 border-b border-[#202225] flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                <Bot className="w-3 h-3" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-sm font-semibold text-white">{shipPersonality.name}</h3>
              <p className="text-xs text-green-400">
                #{activeChannel?.id === 'system' ? 'system' : 
                  activeChannel?.agentMembers?.includes('leo-ai') ? activeChannel.name : 
                  'system'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-5 h-5 p-0 hover:bg-[#393c43]">
            <Settings className="w-3 h-3 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Quick Actions - Compact */}
      <div className="p-2 border-b border-[#202225] flex-shrink-0">
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6 justify-start hover:bg-green-700/20"
            onClick={() => sendMessage("📸 Point-and-inventory mode activated!")}
          >
            <Camera className="w-3 h-3 mr-1" />
            Inventory
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6 justify-start hover:bg-blue-700/20"
            onClick={() => sendMessage("🧠 Intent detection active!")}
          >
            <Brain className="w-3 h-3 mr-1" />
            Intent
          </Button>
        </div>
        <div className="text-xs text-center text-gray-400 mt-1">
          {activeChannel?.id === 'system' ? '🔒 Private' : 
           activeChannel?.agentMembers?.includes('leo-ai') ? `📢 #${activeChannel.name}` : 
           '⚠️ System'}
        </div>
      </div>

      {/* Conversation History - Fixed ScrollArea */}
      <ScrollArea className="flex-1 h-0">
        <div className="p-3 space-y-3">
        {messages.map((message) => (
            <div key={message.id} className="flex gap-2">
              <Avatar className="w-6 h-6 flex-shrink-0">
              <AvatarFallback className={cn(
                  "text-xs",
                  message.isShip ? "bg-blue-600 text-white" : "bg-gray-600 text-white"
                )}>
                  {message.isShip ? <Bot className="w-3 h-3" /> : (currentUser?.name?.charAt(0) || 'U')}
              </AvatarFallback>
            </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-white">
                    {message.isShip ? shipPersonality.name : (currentUser?.name || 'You')}
                </span>
                <span className="text-xs text-gray-400">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
                <div className="text-sm text-gray-300 break-words">
                  {message.content}
                  {message.autonomousDecision && (
                    <div className="text-xs text-blue-400 mt-1 italic">
                      • Autonomous decision
                    </div>
                  )}
                </div>
                {/* Enhanced message types */}
                {message.type !== 'text' && renderMessage(message)}
            </div>
          </div>
        ))}

        {isShipThinking && (
            <div className="flex gap-2">
              <Avatar className="w-6 h-6 flex-shrink-0">
                <AvatarFallback className="bg-blue-600 text-white text-xs">
                  <Bot className="w-3 h-3" />
              </AvatarFallback>
            </Avatar>
              <div className="flex-1">
                <div className="text-xs font-medium text-white mb-1">{shipPersonality.name}</div>
                <div className="text-sm text-gray-400 italic">Analyzing...</div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      </ScrollArea>

      {/* Input Area - Compact */}
      <div className="border-t border-[#202225] flex-shrink-0">
        <div className="p-2">
          <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage(inputValue)
                }
              }}
              placeholder={`Message Leo...`}
              disabled={isShipThinking}
              className="flex-1 bg-[#40444b] border-none text-white text-sm h-8"
          />
          <Button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isShipThinking}
            size="sm"
              className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-3 h-3" />
          </Button>
        </div>
        </div>
      </div>
    </div>
  )
}

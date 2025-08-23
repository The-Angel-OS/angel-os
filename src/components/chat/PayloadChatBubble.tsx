'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Minimize2, Maximize2, User, Bot, Sparkles, Loader2, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AIInput } from '@/components/ui/ai-input'
import { useChatContext } from './ChatContextProvider'

interface PayloadMessage {
  id: string
  content: {
    type: 'text' | 'system' | 'action' | 'intelligence'
    text?: string
    data?: any
    metadata?: {
      pageContext?: string
      userAgent?: string
      timestamp?: string
    }
  }
  conversationContext?: {
    intent?: string
    phase?: string
    history?: any[]
  }
  businessIntelligence?: {
    metrics?: any
    insights?: any
  }
  messageType: 'user' | 'leo' | 'system' | 'action' | 'intelligence'
  sender?: any
  space?: any
  channel?: any
  priority: 'low' | 'normal' | 'high' | 'urgent'
  createdAt: string
  updatedAt: string
}

interface PayloadChatBubbleProps {
  variant?: 'admin' | 'frontend' | 'spaces'
  pageContext?: string
  userContext?: any
  spaceId?: string
  channelSlug?: string
  className?: string
  enableVoiceInput?: boolean
  enableFileUpload?: boolean
  enableVoiceOutput?: boolean
  enablePageNavigation?: boolean
  enableAutomation?: boolean
}

export const PayloadChatBubble: React.FC<PayloadChatBubbleProps> = ({ 
  variant = 'frontend',
  pageContext: propPageContext,
  userContext: propUserContext,
  spaceId: propSpaceId,
  channelSlug = 'system',
  className = '',
  enableVoiceInput = true,
  enableFileUpload = true,
  enableVoiceOutput = true,
  enablePageNavigation = true,
  enableAutomation = false
}) => {
  // Use context if available, fallback to props
  const contextData = useChatContext?.() || {}
  const pageContext = propPageContext || contextData.pageContext || 'unknown'
  const userContext = propUserContext || contextData.userContext
  const spaceId = propSpaceId || contextData.spaceId
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<PayloadMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [systemChannel, setSystemChannel] = useState<any>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null)

  const scrollToBottom = (force = false) => {
    if (force || isAtBottom || !hasInitiallyScrolled) {
      messagesEndRef.current?.scrollIntoView({ behavior: hasInitiallyScrolled ? 'smooth' : 'auto' })
      if (!hasInitiallyScrolled) {
        setHasInitiallyScrolled(true)
      }
    }
  }

  // Handle scroll detection to know if user is at bottom
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const threshold = 50 // pixels from bottom
      const atBottom = scrollHeight - scrollTop - clientHeight < threshold
      setIsAtBottom(atBottom)
    }
  }

  // Auto-scroll on new messages only if at bottom or initial load
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Force scroll to bottom on initial open
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => scrollToBottom(true), 100)
    }
  }, [isOpen, isMinimized])

  // Initialize system channel and load chat history when opened
  useEffect(() => {
    if (isOpen && !systemChannel) {
      initializeSystemChannel()
    }
  }, [isOpen])

  const initializeSystemChannel = async () => {
    try {
      setIsLoading(true)
      
      // First, find or create system channel
      const channelResponse = await fetch(`/api/channels/find-or-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'System Chat',
          channelType: 'intelligence_gathering',
          reportType: 'general',
          tenantId: userContext?.tenant?.id || 'default',
          guardianAngelId: 'leo-ai',
          feedConfiguration: {
            feedSource: 'api_webhook',
            feedSettings: { source: 'leo_chat' }
          }
        })
      })

      if (!channelResponse.ok) {
        throw new Error('Failed to initialize system channel')
      }

      const channel = await channelResponse.json()
      setSystemChannel(channel)

      // Load recent chat history
      await loadChatHistory(channel.id)

      // Send initial greeting if no messages
      if (messages.length === 0) {
        await sendSystemGreeting(channel.id)
      }

    } catch (error) {
      console.error('Failed to initialize system channel:', error)
      // Fallback to local chat without persistence
      await sendLocalGreeting()
    } finally {
      setIsLoading(false)
    }
  }

  const loadChatHistory = async (channelId: string) => {
    try {
      const response = await fetch(`/api/messages?channel=${channelId}&limit=20&sort=-createdAt`)
      if (response.ok) {
        const { docs } = await response.json()
        setMessages(docs.reverse()) // Reverse to show oldest first
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const sendSystemGreeting = async (channelId: string) => {
    const userName = userContext?.firstName || userContext?.name || 'there'
    let greeting = ''
    
    switch (variant) {
      case 'admin':
        greeting = `Hello ${userName}! I'm Leo, your AI assistant. I can help you navigate the admin panel, understand your collections, and assist with any questions about managing your content.`
        break
      case 'spaces':
        greeting = `Hi ${userName}! I'm Leo, here to help you with spaces, channels, and collaboration. What would you like to know about this space?`
        break
      default: // frontend
        greeting = `Welcome ${userName}! I'm Leo, your AI assistant. I can help you navigate the site, explain features, or assist with any questions you might have.`
    }

    if (pageContext) {
      greeting += ` I can see you're on the ${pageContext} page. How can I help?`
    }

    await createMessage({
      content: {
        type: 'text',
        text: greeting,
        metadata: {
          pageContext,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      },
      conversationContext: {
        intent: 'greeting',
        phase: 'initialization'
      },
      messageType: 'leo',
      channelId,
      priority: 'normal'
    })
  }

  const sendLocalGreeting = async () => {
    const userName = userContext?.firstName || userContext?.name || 'there'
    const greeting = `Hello ${userName}! I'm Leo, your AI assistant. I'm currently running in local mode. How can I help you today?`
    
    const localMessage: PayloadMessage = {
      id: `local_${Date.now()}`,
      content: {
        type: 'text',
        text: greeting,
        metadata: { pageContext }
      },
      messageType: 'leo',
      priority: 'normal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setMessages([localMessage])
  }

  const createMessage = async (messageData: any) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...messageData,
          space: spaceId,
          channel: systemChannel?.id,
          sender: userContext?.id || 1 // Use user context ID or default to system user
        })
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages(prev => [...prev, newMessage])
        return newMessage
      }
    } catch (error) {
      console.error('Failed to create message:', error)
    }
  }

  const generateLeoResponse = async (userMessage: string, context: any): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Context-aware responses based on variant, page, and collections
    if (variant === 'admin') {
      if (lowerMessage.includes('collection') || lowerMessage.includes('admin')) {
        return `I can help you with your Payload CMS collections! You have Products, Orders, Users, Spaces, Messages, Channels, and many more. Which collection would you like to work with? I can guide you through creating, editing, or understanding the data structure.`
      }
      if (lowerMessage.includes('channel') || lowerMessage.includes('intelligence')) {
        return `Your Channels collection supports intelligence gathering, photo analysis, document processing, and economic analysis. Each channel can be configured with different feed sources like Google Photos, Drive, or manual uploads. What type of channel are you interested in?`
      }
      if (lowerMessage.includes('message') || lowerMessage.includes('chat')) {
        return `The Messages collection stores rich JSON content with conversation context and business intelligence. It supports threading, reactions, and AT Protocol integration. What would you like to know about the messaging system?`
      }
    } else if (variant === 'frontend') {
      if (lowerMessage.includes('product') || lowerMessage.includes('buy') || lowerMessage.includes('order')) {
        return `I can help you find products, understand pricing, or guide you through the ordering process. Our products support variants, inventory tracking, and flexible pricing. What are you looking for?`
      }
      if (lowerMessage.includes('space') || lowerMessage.includes('collaboration')) {
        return `Spaces are collaborative workspaces with messaging, file sharing, and business intelligence. Each space can have multiple channels for different types of work. Would you like to learn more about joining or creating spaces?`
      }
    }

    // Page-specific responses with collection context
    if (pageContext) {
      if (pageContext.includes('products') && lowerMessage.includes('help')) {
        return `You're browsing our products catalog. Each product supports galleries, variants, pricing tiers, and can be organized by categories. I can help you find specific items, explain features, compare options, or guide you through the purchase process. What are you looking for?`
      }
      if (pageContext.includes('settings') && lowerMessage.includes('help')) {
        return `I can help you with settings configuration, including integration management for Google Photos, Drive, social media platforms, and more. You can also configure channels for automated data ingestion and processing. What settings would you like to configure?`
      }
    }
    
    // Intelligent response based on available collections
    return `I understand you're asking about "${userMessage}". I have access to your complete system including Products, Orders, Users, Spaces, Messages, Channels, and integration data. I can help with navigation, data management, or specific questions about your collections. Could you be more specific about what you'd like to know or accomplish?`
  }

  const handleSendMessage = async (message: string, attachments?: File[]) => {
    if (!message.trim() && (!attachments || attachments.length === 0)) return

    const userMessageContent = {
      content: {
        type: 'text' as const,
        text: message,
        metadata: {
          pageContext,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          attachments: attachments || []
        }
      },
      conversationContext: {
        intent: 'user_query',
        phase: 'active_conversation',
        history: messages.slice(-5) // Include last 5 messages for context
      },
      messageType: 'user' as const,
      priority: 'normal' as const
    }

    // Create user message
    if (systemChannel) {
      await createMessage(userMessageContent)
    } else {
      // Local fallback
      const localUserMessage: PayloadMessage = {
        id: `local_user_${Date.now()}`,
        ...userMessageContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setMessages(prev => [...prev, localUserMessage])
    }

    setIsTyping(true)

    // Generate Leo response with context
    setTimeout(async () => {
      try {
        const response = await generateLeoResponse(message, {
          variant,
          pageContext,
          userContext,
          systemChannel,
          recentMessages: messages.slice(-3)
        })
        
        const leoMessageContent = {
          content: {
            type: 'text' as const,
            text: response,
            metadata: {
              pageContext,
              responseToMessage: message,
              timestamp: new Date().toISOString()
            }
          },
          conversationContext: {
            intent: 'assistant_response',
            phase: 'active_conversation'
          },
          businessIntelligence: {
            metrics: {
              responseTime: Date.now(),
              confidence: 0.85,
              sources: ['collections', 'context', 'user_profile']
            }
          },
          messageType: 'leo' as const,
          priority: 'normal' as const
        }

        if (systemChannel) {
          await createMessage(leoMessageContent)
        } else {
          // Local fallback
          const localLeoMessage: PayloadMessage = {
            id: `local_leo_${Date.now()}`,
            ...leoMessageContent,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          setMessages(prev => [...prev, localLeoMessage])
        }
      } catch (error) {
        console.error('Failed to generate response:', error)
        const errorMessage: PayloadMessage = {
          id: `error_${Date.now()}`,
          content: {
            type: 'system',
            text: "I'm having trouble connecting to the system right now. Please try again in a moment."
          },
          messageType: 'system',
          priority: 'high',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setMessages(prev => [...prev, errorMessage])
      } finally {
        setIsTyping(false)
      }
    }, 1000 + Math.random() * 1000)
  }

  const speakMessage = (text: string) => {
    if (!enableVoiceOutput || !('speechSynthesis' in window)) return

    // Stop any current speech
    window.speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    speechSynthRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'admin':
        return {
          button: 'from-blue-500 to-purple-600',
          header: 'from-blue-500 to-purple-600',
          title: 'Leo AI Assistant',
          subtitle: 'Admin Helper'
        }
      case 'spaces':
        return {
          button: 'from-green-500 to-teal-600',
          header: 'from-green-500 to-teal-600',
          title: 'Leo AI Assistant',
          subtitle: 'Space Helper'
        }
      default: // frontend
        return {
          button: 'from-orange-500 to-red-600',
          header: 'from-orange-500 to-red-600',
          title: 'Leo AI Assistant',
          subtitle: 'Site Helper'
        }
    }
  }

  const styles = getVariantStyles()

  const formatMessageContent = (message: PayloadMessage) => {
    if (message.content?.text) {
      return message.content.text
    }
    if (message.content?.type === 'system') {
      return message.content.text || 'System message'
    }
    return 'Message content unavailable'
  }

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-gradient-to-r ${styles.button} rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all ${className}`}
            style={{
              opacity: 1,
              backgroundColor: 'hsl(var(--primary))',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
            }}
            title="Chat with Leo AI"
          >
            <MessageCircle className="w-6 h-6" />
            <motion.div 
              className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-2 h-2 text-white" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed right-6 bottom-6 z-[10000] bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-2xl ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
            } ${className}`}
            style={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              opacity: 1
            }}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b border-border bg-gradient-to-r ${styles.header} text-white rounded-t-lg`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{styles.title}</h3>
                  <p className="text-xs opacity-90">
                    {systemChannel ? 'Connected • Voice • Files' : styles.subtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {enableVoiceOutput && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={isSpeaking ? stopSpeaking : () => {}}
                    className="h-8 w-8 p-0 text-white hover:bg-white/20"
                    title={isSpeaking ? "Stop speaking" : "Voice output enabled"}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div 
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto p-4 space-y-4 h-80"
                >
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${
                        message.messageType === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.messageType !== 'user' && (
                        <div className={`w-6 h-6 bg-gradient-to-r ${styles.header} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm ${
                          message.messageType === 'user'
                            ? `bg-gradient-to-r ${styles.button} text-white ml-auto`
                            : message.messageType === 'system'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700'
                            : 'bg-muted text-foreground border border-border'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{formatMessageContent(message)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className={`text-xs opacity-70`}>
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                          {message.messageType === 'leo' && enableVoiceOutput && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => speakMessage(formatMessageContent(message))}
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                              title="Read aloud"
                            >
                              <Volume2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {message.messageType === 'user' && (
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-3 h-3 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-2 justify-start">
                      <div className={`w-6 h-6 bg-gradient-to-r ${styles.header} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-muted p-3 rounded-lg border border-border">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0.1s]" />
                          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0.2s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Enhanced AI Input */}
                <div className="border-t border-border bg-muted/50">
                  <AIInput
                    placeholder="Ask Leo anything..."
                    onSubmit={handleSendMessage}
                    onFileUpload={enableFileUpload ? (files) => handleSendMessage('', Array.from(files)) : undefined}
                    disabled={isTyping || isLoading}
                    allowVoiceInput={enableVoiceInput}
                    allowFileUpload={enableFileUpload}
                    className="border-none bg-transparent"
                  />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default PayloadChatBubble

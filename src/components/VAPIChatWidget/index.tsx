'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, MicOff, MessageCircle, X, Send, Phone, PhoneOff, Settings } from 'lucide-react'
import vapi from '@vapi-ai/web'

interface VAPIChatConfig {
  spaceId?: string
  channelId?: string
  tenantId?: string
  personality?: 'professional' | 'friendly' | 'casual'
  businessName?: string
  businessType?: string
  assistantId?: string
  mode?: 'voice' | 'text' | 'both'
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
  theme?: 'light' | 'dark' | 'auto'
  embeddable?: boolean
}

interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
  type: 'text' | 'voice'
}

interface VAPIChatWidgetProps {
  config: VAPIChatConfig
  onConfigChange?: (config: VAPIChatConfig) => void
}

export function VAPIChatWidget({ config, onConfigChange }: VAPIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCallActive, setIsCallActive] = useState(false)
  const [currentMode, setCurrentMode] = useState<'voice' | 'text'>(config.mode === 'both' ? 'text' : config.mode || 'text')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [contactId, setContactId] = useState<string | null>(null)
  const [showConfig, setShowConfig] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize VAPI
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (vapi as any).setPublicKey(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || 'your-vapi-public-key')
    }
  }, [])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Start voice conversation
  const startVoiceCall = async () => {
    if (isCallActive) {
      (vapi as any).stop()
      setIsCallActive(false)
      return
    }

    setIsConnecting(true)

    try {
      // Create dynamic assistant configuration
      const assistantConfig = {
        name: `${config.businessName || 'Business'} AI Assistant`,
        model: {
          provider: 'openai',
          model: 'gpt-4',
          messages: [{
            role: 'system',
            content: `You are the AI assistant for ${config.businessName || 'this business'}, a ${config.businessType || 'business'}.

Your personality: ${config.personality || 'professional'}
Space ID: ${config.spaceId || 'default'}
Channel ID: ${config.channelId || 'general'}

Instructions:
- Be ${config.personality || 'professional'} and helpful
- Answer questions about products, services, and business information
- Help customers with orders, appointments, and inquiries
- Use the customer's previous interaction history when available
- If you need specific information, ask clarifying questions
- Always end calls with a clear next step or call-to-action

You have access to the business's website content, products, and customer history through your knowledge base.`
          }],
          temperature: 0.4,
        },
        voice: {
          provider: 'elevenlabs',
          voiceId: 'pNInz6obpgDQGcFmaJgB', // Professional female voice
        },
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en-US',
        },
        recordingEnabled: false,
        silenceTimeoutSeconds: 30,
        maxDurationSeconds: 600, // 10 minutes max
        backgroundSound: 'office',
        firstMessage: `Hello! I'm the AI assistant for ${config.businessName || 'this business'}. How can I help you today?`,
      }

      // Start VAPI call with dynamic assistant
      await (vapi as any).start(config.assistantId || assistantConfig)
      setIsCallActive(true)

      // Log voice interaction start
      await logInteraction('voice_call_started', 'Voice conversation initiated')

    } catch (error) {
      console.error('Failed to start voice call:', error)
      alert('Failed to start voice call. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  // Send text message
  const sendTextMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')

    try {
      // Send to business agent API
      const response = await fetch('/api/vapi-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'text_message',
          message: inputMessage,
          spaceId: config.spaceId,
          channelId: config.channelId,
          tenantId: config.tenantId,
          contactId: contactId,
          context: {
            businessName: config.businessName,
            businessType: config.businessType,
            personality: config.personality
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'text'
        }

        setMessages(prev => [...prev, assistantMessage])

        // Update contact ID if returned
        if (data.contactId) {
          setContactId(data.contactId)
        }
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  // Log interaction to database
  const logInteraction = async (type: string, content: string) => {
    try {
      await fetch('/api/vapi-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'log_interaction',
          interactionType: type,
          content,
          spaceId: config.spaceId,
          channelId: config.channelId,
          tenantId: config.tenantId,
          contactId: contactId
        })
      })
    } catch (error) {
      console.error('Failed to log interaction:', error)
    }
  }

  // Handle key press for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendTextMessage()
    }
  }

  // Position classes for embeddable widget
  const getPositionClasses = () => {
    if (!config.embeddable) return ''

    const baseClasses = 'fixed z-50'
    switch (config.position) {
      case 'bottom-right': return `${baseClasses} bottom-4 right-4`
      case 'bottom-left': return `${baseClasses} bottom-4 left-4`
      case 'top-right': return `${baseClasses} top-4 right-4`
      case 'top-left': return `${baseClasses} top-4 left-4`
      case 'center': return `${baseClasses} top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`
      default: return `${baseClasses} bottom-4 right-4`
    }
  }

  // Chat bubble for collapsed state
  if (config.embeddable && !isOpen) {
    return (
      <div className={getPositionClasses()}>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>

        {/* Voice call indicator */}
        {isCallActive && (
          <div className="absolute -top-2 -right-2 bg-green-500 rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
            <Phone className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
    )
  }

  // Full chat interface
  return (
    <div className={config.embeddable ? getPositionClasses() : 'w-full max-w-md mx-auto'}>
      <Card className={`${config.embeddable ? 'w-80 h-96' : 'w-full h-96'} shadow-xl`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {config.businessName || 'AI Assistant'}
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Mode Toggle */}
              {config.mode === 'both' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMode(currentMode === 'voice' ? 'text' : 'voice')}
                  className="h-8 w-8 p-0"
                >
                  {currentMode === 'voice' ? <Mic className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                </Button>
              )}

              {/* Config Button */}
              {onConfigChange && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfig(!showConfig)}
                  className="h-8 w-8 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}

              {/* Close Button (embeddable only) */}
              {config.embeddable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`h-2 w-2 rounded-full ${isCallActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {isCallActive ? 'Voice call active' : currentMode === 'voice' ? 'Voice mode' : 'Text mode'}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col h-full">
          {/* Configuration Panel */}
          {showConfig && onConfigChange && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm space-y-2">
              <div>
                <label className="block text-xs font-medium">Space ID:</label>
                <input
                  type="text"
                  value={config.spaceId || ''}
                  onChange={(e) => onConfigChange({ ...config, spaceId: e.target.value })}
                  className="w-full px-2 py-1 text-xs border rounded"
                  placeholder="space-123"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">Channel ID:</label>
                <input
                  type="text"
                  value={config.channelId || ''}
                  onChange={(e) => onConfigChange({ ...config, channelId: e.target.value })}
                  className="w-full px-2 py-1 text-xs border rounded"
                  placeholder="general"
                />
              </div>
            </div>
          )}

          {/* Messages for text mode */}
          {currentMode === 'text' && (
            <>
              <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    👋 Hello! How can I help you today?
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Text input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  onClick={sendTextMessage}
                  size="sm"
                  disabled={!inputMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}

          {/* Voice mode interface */}
          {currentMode === 'voice' && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-center mb-6">
                <div className={`mx-auto mb-4 h-20 w-20 rounded-full flex items-center justify-center ${
                  isCallActive ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {isCallActive ? (
                    <Mic className="h-8 w-8 text-green-600" />
                  ) : (
                    <MicOff className="h-8 w-8 text-gray-600" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isCallActive ? 'Listening... Speak naturally' : 'Click to start voice conversation'}
                </p>
              </div>

              <Button
                onClick={startVoiceCall}
                disabled={isConnecting}
                size="lg"
                className={`${
                  isCallActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isConnecting ? (
                  'Connecting...'
                ) : isCallActive ? (
                  <>
                    <PhoneOff className="mr-2 h-4 w-4" />
                    End Call
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Start Voice Chat
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Embeddable script integration
export function EmbeddableVAPIChat(config: VAPIChatConfig) {
  if (typeof window !== 'undefined') {
    return <VAPIChatWidget config={{ ...config, embeddable: true }} />
  }
  return null
}

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, Phone, Video, Mic, MicOff, Send, X, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SeamlessConversationService } from '@/services/SeamlessConversationService'

interface SeamlessAngelWidgetProps {
  // Embed configuration
  siteUrl: string
  pageUrl: string
  productId?: string
  category?: string
  userSegment?: string
  
  // Widget configuration
  position?: 'bottom-right' | 'bottom-left' | 'sidebar' | 'inline'
  theme?: 'light' | 'dark' | 'auto'
  modes?: ('text' | 'voice' | 'avatar')[]
  defaultMode?: 'text' | 'voice' | 'avatar'
  contextAware?: boolean
  
  // Customization
  primaryColor?: string
  businessName?: string
  angelName?: string
  
  // Callbacks
  onModeSwitch?: (fromMode: string, toMode: string) => void
  onProductInterest?: (productId: string) => void
  onConversationStart?: (sessionId: string) => void
}

interface ConversationMessage {
  id: string
  content: string
  mode: 'text' | 'voice' | 'avatar'
  sender: 'customer' | 'angel' | 'system'
  timestamp: Date
  context?: {
    productId?: string
    toolUsed?: string
    confidence?: number
    sentiment?: string
  }
}

export function SeamlessAngelWidget({
  siteUrl,
  pageUrl,
  productId,
  category,
  userSegment,
  position = 'bottom-right',
  theme = 'auto',
  modes = ['text', 'voice'],
  defaultMode = 'text',
  contextAware = true,
  primaryColor = '#3b82f6',
  businessName = 'Business',
  angelName = 'Angel',
  onModeSwitch,
  onProductInterest,
  onConversationStart
}: SeamlessAngelWidgetProps) {
  // Widget state
  const [isOpen, setIsOpen] = useState(false)
  const [currentMode, setCurrentMode] = useState<'text' | 'voice' | 'avatar'>(defaultMode)
  const [isConnected, setIsConnected] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  // Conversation state
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isAngelThinking, setIsAngelThinking] = useState(false)
  
  // Voice state
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isListening, setIsListening] = useState(false)
  
  // Product context state
  const [productContext, setProductContext] = useState<any>(null)
  const [showProductCard, setShowProductCard] = useState(false)
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Initialize conversation when widget opens
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeConversation()
    }
  }, [isOpen])
  
  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Load product context if productId provided
  useEffect(() => {
    if (productId && contextAware) {
      loadProductContext()
    }
  }, [productId])
  
  /**
   * 🚀 INITIALIZE CONVERSATION
   * Set up seamless conversation with full context
   */
  const initializeConversation = async () => {
    try {
      const embedContext = {
        siteUrl,
        pageUrl,
        productId,
        category,
        userSegment,
        embedConfig: {
          position,
          theme,
          modes,
          defaultMode,
          contextAware
        }
      }
      
      const conversationContext = await SeamlessConversationService.initializeConversation(
        embedContext,
        { /* customerInfo would come from authentication */ }
      )
      
      setSessionId(conversationContext.sessionId)
      setProductContext(conversationContext.productContext)
      setIsConnected(true)
      
      // Show product card if product context exists
      if (conversationContext.productContext) {
        setShowProductCard(true)
        onProductInterest?.(conversationContext.productContext.productId)
      }
      
      // Add welcome message
      const welcomeMessage: ConversationMessage = {
        id: 'welcome',
        content: generateWelcomeMessage(conversationContext),
        mode: currentMode,
        sender: 'angel',
        timestamp: new Date()
      }
      
      setMessages([welcomeMessage])
      onConversationStart?.(conversationContext.sessionId)
      
    } catch (error) {
      console.error('Failed to initialize conversation:', error)
      setIsConnected(false)
    }
  }
  
  /**
   * 🔄 SEAMLESS MODE SWITCHING
   * Switch between text, voice, and avatar modes
   */
  const switchMode = async (newMode: 'text' | 'voice' | 'avatar') => {
    if (!sessionId || newMode === currentMode) return
    
    try {
      setIsAngelThinking(true)
      
      const modeSwitch = await SeamlessConversationService.switchMode(
        sessionId,
        newMode,
        'user_request'
      )
      
      // Add transition message
      const transitionMessage: ConversationMessage = {
        id: `transition_${Date.now()}`,
        content: modeSwitch.transitionMessage,
        mode: newMode,
        sender: 'system',
        timestamp: new Date(),
        context: {
          toolUsed: 'mode_switch'
        }
      }
      
      setMessages(prev => [...prev, transitionMessage])
      setCurrentMode(newMode)
      
      // Handle mode-specific setup
      if (newMode === 'voice') {
        await setupVoiceMode()
      } else if (newMode === 'avatar') {
        await setupAvatarMode()
      }
      
      onModeSwitch?.(currentMode, newMode)
      
    } catch (error) {
      console.error('Mode switch failed:', error)
    } finally {
      setIsAngelThinking(false)
    }
  }
  
  /**
   * 💬 SEND MESSAGE
   * Send message in current mode with context preservation
   */
  const sendMessage = async (content: string = inputMessage) => {
    if (!content.trim() || !sessionId) return
    
    // Create customer message
    const customerMessage: ConversationMessage = {
      id: `msg_${Date.now()}_customer`,
      content,
      mode: currentMode,
      sender: 'customer',
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, customerMessage])
    setInputMessage('')
    setIsAngelThinking(true)
    
    try {
      // Process message through seamless service
      const angelResponse = await SeamlessConversationService.processMessage(
        sessionId,
        content,
        currentMode
      )
      
      setMessages(prev => [...prev, angelResponse])
      
      // Check if Angel suggests mode switch
      if (angelResponse.content.toLowerCase().includes('voice call') && currentMode === 'text') {
        // Show mode switch suggestion
        setTimeout(() => {
          const suggestion: ConversationMessage = {
            id: `suggestion_${Date.now()}`,
            content: "Would you like to switch to a voice call for a more detailed conversation?",
            mode: currentMode,
            sender: 'system',
            timestamp: new Date(),
            context: {
              toolUsed: 'mode_suggestion'
            }
          }
          setMessages(prev => [...prev, suggestion])
        }, 1000)
      }
      
    } catch (error) {
      console.error('Failed to send message:', error)
      
      const errorMessage: ConversationMessage = {
        id: `error_${Date.now()}`,
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        mode: currentMode,
        sender: 'angel',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsAngelThinking(false)
    }
  }
  
  /**
   * 🎙️ VOICE MODE SETUP
   */
  const setupVoiceMode = async () => {
    try {
      // Initialize VAPI for voice calls
      setIsCallActive(true)
      setIsListening(true)
      
      // This would integrate with VAPI.ai for actual voice
      console.log('Voice mode activated - VAPI integration would happen here')
      
    } catch (error) {
      console.error('Voice setup failed:', error)
      // Fallback to text mode
      await switchMode('text')
    }
  }
  
  /**
   * 🤖 AVATAR MODE SETUP (Future)
   */
  const setupAvatarMode = async () => {
    try {
      // Future: Initialize 3D avatar with ReadyPlayerMe or similar
      console.log('Avatar mode activated - 3D avatar integration would happen here')
      
      // For now, use voice mode as base
      await setupVoiceMode()
      
    } catch (error) {
      console.error('Avatar setup failed:', error)
      // Fallback to voice mode
      await switchMode('voice')
    }
  }
  
  /**
   * 📦 LOAD PRODUCT CONTEXT
   */
  const loadProductContext = async () => {
    if (!productId) return
    
    try {
      // In production, this would fetch from your product API
      const productData = {
        id: productId,
        name: 'Sample Product',
        category: category || 'General',
        price: 99.99,
        image: '/placeholder-product.jpg',
        description: 'A great product that customers love.'
      }
      
      setProductContext(productData)
      setShowProductCard(true)
      
    } catch (error) {
      console.error('Failed to load product context:', error)
    }
  }
  
  /**
   * 💬 GENERATE WELCOME MESSAGE
   */
  const generateWelcomeMessage = (context: any): string => {
    if (context.productContext) {
      return `Hi! I'm ${angelName}, your AI assistant. I can see you're interested in ${context.productContext.productName}. I'm here to help with any questions you have! 

You can chat with me here, or if you prefer, we can switch to a voice conversation. What would you like to know?`
    }
    
    return `Hello! I'm ${angelName}, your AI assistant for ${businessName}. I'm here to help you with anything you need. 

I can assist you via text chat${modes.includes('voice') ? ', voice call' : ''}${modes.includes('avatar') ? ', or even with a lifelike avatar' : ''}. How can I help you today?`
  }
  
  /**
   * 🎨 WIDGET POSITIONING
   */
  const getPositionClasses = () => {
    const baseClasses = 'fixed z-50 transition-all duration-300'
    
    switch (position) {
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`
      case 'sidebar':
        return `${baseClasses} top-0 right-0 h-full w-96`
      case 'inline':
        return 'w-full h-96'
      default:
        return `${baseClasses} bottom-4 right-4`
    }
  }
  
  /**
   * 🎭 RENDER MODE INDICATOR
   */
  const renderModeIndicator = () => {
    const modeIcons = {
      text: <MessageCircle className="w-4 h-4" />,
      voice: <Phone className="w-4 h-4" />,
      avatar: <Video className="w-4 h-4" />
    }
    
    const modeColors = {
      text: 'bg-blue-500',
      voice: 'bg-green-500',
      avatar: 'bg-purple-500'
    }
    
    return (
      <div className="flex items-center gap-2 mb-2">
        <Badge className={`${modeColors[currentMode]} text-white`}>
          {modeIcons[currentMode]}
          <span className="ml-1 capitalize">{currentMode}</span>
        </Badge>
        {isCallActive && (
          <Badge className="bg-red-500 text-white animate-pulse">
            <Mic className="w-3 h-3 mr-1" />
            Live
          </Badge>
        )}
      </div>
    )
  }
  
  /**
   * 📱 RENDER MOBILE-OPTIMIZED CHAT BUBBLE
   */
  if (!isOpen) {
    return (
      <div className={getPositionClasses()}>
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-16 w-16 shadow-lg hover:shadow-xl transition-all duration-300"
          style={{ backgroundColor: primaryColor }}
          aria-label={`Open ${angelName} assistant`}
        >
          {currentMode === 'voice' ? (
            <Phone className="h-6 w-6" />
          ) : currentMode === 'avatar' ? (
            <Video className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
        
        {/* Product context indicator */}
        {productContext && (
          <div className="absolute -top-2 -left-2 bg-orange-500 rounded-full h-6 w-6 flex items-center justify-center">
            <span className="text-xs text-white font-bold">!</span>
          </div>
        )}
        
        {/* Connection status */}
        {isConnected && (
          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full h-4 w-4 animate-pulse" />
        )}
      </div>
    )
  }
  
  /**
   * 🖥️ RENDER FULL CHAT INTERFACE
   */
  return (
    <div className={getPositionClasses()}>
      <Card className="w-96 h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              {angelName} Assistant
            </CardTitle>
            <div className="flex gap-1">
              {/* Mode switching buttons */}
              {modes.map(mode => (
                <Button
                  key={mode}
                  size="sm"
                  variant={currentMode === mode ? "default" : "outline"}
                  onClick={() => switchMode(mode)}
                  className="p-2"
                  title={`Switch to ${mode} mode`}
                >
                  {mode === 'text' && <MessageCircle className="w-4 h-4" />}
                  {mode === 'voice' && <Phone className="w-4 h-4" />}
                  {mode === 'avatar' && <Video className="w-4 h-4" />}
                </Button>
              ))}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {renderModeIndicator()}
        </CardHeader>
        
        {/* Product Context Card */}
        {showProductCard && productContext && (
          <div className="mx-4 mb-2">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    📦
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{productContext.name}</h4>
                    <p className="text-xs text-gray-600">${productContext.price}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowProductCard(false)}
                    variant="ghost"
                    className="p-1"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'customer'
                      ? 'bg-blue-500 text-white'
                      : message.sender === 'system'
                      ? 'bg-gray-100 text-gray-700 text-sm'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.context?.productId && (
                    <Badge className="mt-2 text-xs">Product Context</Badge>
                  )}
                </div>
              </div>
            ))}
            
            {isAngelThinking && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                    <span className="text-sm text-gray-600">{angelName} is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        
        {/* Input Area */}
        <div className="p-4 border-t">
          {currentMode === 'text' && (
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`Message ${angelName}...`}
                className="flex-1"
              />
              <Button 
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isAngelThinking}
                style={{ backgroundColor: primaryColor }}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {currentMode === 'voice' && (
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isListening ? "destructive" : "default"}
                onClick={() => setIsListening(!isListening)}
                className="rounded-full p-4"
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>
              <span className="text-sm text-gray-600">
                {isListening ? 'Listening...' : 'Tap to speak'}
              </span>
            </div>
          )}
          
          {currentMode === 'avatar' && (
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-32 rounded-lg flex items-center justify-center mb-2">
                <Video className="w-8 h-8 text-white" />
              </div>
              <p className="text-xs text-gray-600">Avatar mode coming soon!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default SeamlessAngelWidget 
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Minimize2, Maximize2, User, Bot, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Message {
  id: string
  content: string
  sender: 'user' | 'leo'
  timestamp: Date
  pageContext?: string
}

interface UniversalChatBubbleProps {
  variant?: 'admin' | 'frontend' | 'spaces'
  pageContext?: string
  userContext?: any
  className?: string
}

export const UniversalChatBubble: React.FC<UniversalChatBubbleProps> = ({ 
  variant = 'frontend',
  pageContext,
  userContext,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  // Initialize with context-aware greeting when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let greeting = ''
      const userName = userContext?.firstName || userContext?.name || 'there'
      
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
      
      setMessages([{
        id: 'greeting',
        content: greeting,
        sender: 'leo',
        timestamp: new Date(),
        pageContext
      }])
    }
  }, [isOpen, messages.length, variant, pageContext, userContext])

  const generateLeoResponse = async (userMessage: string): Promise<string> => {
    // Connect to real message pump instead of simulated responses
    try {
      const response = await fetch('/api/web-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId,
          context: {
            variant,
            pageContext,
            userContext
          },
          userAgent: navigator.userAgent,
          referrer: document.referrer,
          pageUrl: window.location.pathname
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        // Update session ID if returned (for new sessions)
        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId)
        }
        return data.response
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Failed to get Leo response:', error)
      
      // Fallback to context-aware response if API fails
      const lowerMessage = userMessage.toLowerCase()
      
      if (variant === 'admin') {
        if (lowerMessage.includes('collection') || lowerMessage.includes('admin')) {
          return `I can help you with Payload CMS collections! You have access to Products, Orders, Users, Spaces, Messages, and many more. Which collection would you like to work with?`
        }
      } else if (variant === 'frontend') {
        if (lowerMessage.includes('product') || lowerMessage.includes('buy')) {
          return `I can help you find products, understand pricing, or guide you through the ordering process. What are you looking for?`
        }
      }
      
      return `I apologize, but I'm experiencing technical difficulties. Please try again in a moment, or let me know how I can help you with this page.`
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      pageContext
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response delay
    setTimeout(async () => {
      const response = await generateLeoResponse(inputValue)
      const leoMessage: Message = {
        id: `leo_${Date.now()}`,
        content: response,
        sender: 'leo',
        timestamp: new Date(),
        pageContext
      }
      
      setMessages(prev => [...prev, leoMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
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
            className={`fixed right-6 bottom-6 z-[10000] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 rounded-lg shadow-2xl border border-border ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
            } ${className}`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r ${styles.header} text-white rounded-t-lg`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{styles.title}</h3>
                  <p className="text-xs opacity-90">{styles.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
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
                <div className="flex-1 overflow-y-auto p-4 space-y-4 h-80">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.sender === 'leo' && (
                        <div className={`w-6 h-6 bg-gradient-to-r ${styles.header} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm ${
                          message.sender === 'user'
                            ? `bg-gradient-to-r ${styles.button} text-white ml-auto`
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <p className={`text-xs mt-1 opacity-70`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {message.sender === 'user' && (
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
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask Leo anything..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isTyping}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!inputValue.trim() || isTyping}
                      className={`bg-gradient-to-r ${styles.button} hover:opacity-90`}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default UniversalChatBubble



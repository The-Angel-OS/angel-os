'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Minimize2, Maximize2, User, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@payloadcms/ui'

interface Message {
  id: string
  content: string
  sender: 'user' | 'leo'
  timestamp: Date
}

interface LeoAIPanelProps {
  className?: string
}

export const LeoAIPanel: React.FC<LeoAIPanelProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  // Initialize with greeting when first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = `Hello ${user?.firstName || user?.name || 'there'}! I'm Leo, your AI assistant. I'm here to help you navigate the admin panel, understand your data, and assist with any questions about your Payload CMS collections. What can I help you with?`
      
      setMessages([{
        id: 'greeting',
        content: greeting,
        sender: 'leo',
        timestamp: new Date()
      }])
    }
  }, [isOpen, messages.length, user])

  const generateLeoResponse = async (userMessage: string): Promise<string> => {
    // Enhanced Leo with admin context
    const lowerMessage = userMessage.toLowerCase()
    
    // Admin-specific responses
    if (lowerMessage.includes('collection') || lowerMessage.includes('admin')) {
      return `I can help you with Payload CMS collections! You have access to Products, Orders, Users, Spaces, Messages, and many more. Which collection would you like to work with? I can guide you through creating, editing, or understanding the data structure.`
    }
    
    if (lowerMessage.includes('product') || lowerMessage.includes('commerce')) {
      return `Your Products collection includes pricing, inventory, galleries, and flexible content blocks. You can manage product variants, track inventory, and set up complex pricing structures. Need help with a specific product management task?`
    }
    
    if (lowerMessage.includes('user') || lowerMessage.includes('member')) {
      return `User management includes platform users, tenant memberships, and space memberships. I can help you understand the role system, create new users, or manage permissions. What specific user management task are you working on?`
    }
    
    if (lowerMessage.includes('space') || lowerMessage.includes('collaboration')) {
      return `Spaces are your collaboration hubs with messaging, file sharing, and business tools. Each space can have multiple channels and members with different roles. Are you looking to create a new space or manage existing ones?`
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return `I'm here to help! I can assist with:
• Navigating collections and understanding data structures
• Creating and editing content
• Understanding relationships between different data types  
• Troubleshooting admin interface issues
• Explaining business logic and workflows

What specific area would you like help with?`
    }
    
    // Default helpful response
    return `I understand you're asking about "${userMessage}". As your admin assistant, I can help you with collection management, data relationships, user permissions, and general navigation. Could you be more specific about what you'd like to accomplish?`
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
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
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, leoMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
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
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-all"
            title="Chat with Leo AI"
          >
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
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
            className={`fixed right-6 bottom-6 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 ${
              isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
            } ${className}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Leo AI Assistant</h3>
                  <p className="text-xs opacity-90">Admin Helper</p>
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
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] p-3 rounded-lg text-sm ${
                          message.sender === 'user'
                            ? 'bg-blue-500 text-white ml-auto'
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
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
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
                      placeholder="Ask Leo about collections, users, or anything..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isTyping}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!inputValue.trim() || isTyping}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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

export default LeoAIPanel

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Send, Hash } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { logBusiness } from '@/services/SystemMonitorService'

interface Message {
  id: string
  content: string
  author: string
  timestamp: Date
  isSystem?: boolean
}

export default function ChatContainer({ channelId }: { channelId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Welcome to #general! This is your team communication hub.',
      author: 'System',
      timestamp: new Date(),
      isSystem: true
    },
    {
      id: '2',
      content: "Good morning team! Let's review today's priorities. I see we have several high-value customers in the pipeline.",
      author: 'Sarah Chen',
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '3',
      content: "I've identified 3 customers ready for conversion to premium plans. Total potential revenue: $15,750. Should I initiate the upgrade sequence?",
      author: 'Leo AI',
      timestamp: new Date(Date.now() - 3500000)
    },
    {
      id: '4',
      content: "Payment request for Order #ORD-2024-001 is ready for approval.",
      author: 'Mike Rodriguez',
      timestamp: new Date(Date.now() - 3000000)
    },
    {
      id: '5',
      content: "Contract signature needed for the Johnson account. Documents are prepared and ready.",
      author: 'Emma Wilson',
      timestamp: new Date(Date.now() - 2500000)
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      author: 'You',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    const messageToSend = inputValue
    setInputValue('')
    
    // Log business activity
    logBusiness('Message sent in #general channel', { 
      channel: channelId, 
      messageLength: messageToSend.length 
    })

    try {
      // Send to multi-user chat system (future implementation)
      // For now, simulate Leo response via the message pump
      const response = await fetch('/api/leo-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          context: {
            variant: 'business',
            channel: channelId,
            conversationHistory: messages.slice(-3)
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        const leoResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          author: 'Leo AI',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, leoResponse])
      }
    } catch (error) {
      console.error('Chat message error:', error)
      // Fallback response
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having trouble connecting to the message system. Your message has been logged for the team.",
        author: 'System',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, fallbackResponse])
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Channel Header */}
      <div className="flex-shrink-0 border-b border-gray-700 bg-gray-900/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <Hash className="w-6 h-6 text-gray-400" />
          <h1 className="text-xl font-bold text-white">#general</h1>
          <span className="text-sm text-gray-400">Team communication</span>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={cn(
              "flex items-start gap-3",
              message.isSystem && "justify-center"
            )}>
              {!message.isSystem && (
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className={cn(
                    "text-sm font-medium",
                    message.author === 'Leo AI' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : message.author === 'You'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'bg-gray-600 text-white'
                  )}>
                    {message.author === 'Leo AI' ? 'L' : message.author[0]}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={cn(
                "flex-1 min-w-0",
                message.isSystem && "text-center"
              )}>
                {!message.isSystem && (
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-semibold text-white text-sm">
                      {message.author}
                    </span>
                    {message.author === 'Leo AI' && (
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                        AI Guardian
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                )}
                <div className={cn(
                  "rounded-lg p-3",
                  message.isSystem 
                    ? "text-sm text-gray-400 italic bg-transparent"
                    : message.author === 'You'
                    ? "bg-blue-600 text-white ml-auto max-w-[80%]"
                    : "bg-gray-700 text-gray-100"
                )}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-gray-700 bg-gray-900/80 backdrop-blur-sm p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Message #general - AI Guardian is listening for business context..."
              className="w-full bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-3 pr-12 resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={false}
            />
          </div>
          <Button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg px-4 py-3 transition-colors"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Connected
          </span>
        </div>
      </div>
    </div>
  )
}

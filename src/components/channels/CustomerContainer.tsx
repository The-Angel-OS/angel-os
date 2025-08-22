'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, Send, Filter, Search, MessageSquare, Phone, Mail, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logBusiness, logInfo } from '@/services/SystemMonitorService'

interface CustomerMessage {
  id: string
  content: string
  author: string
  timestamp: Date
  platform: 'web_chat' | 'whatsapp' | 'discord' | 'email' | 'phone'
  status: 'new' | 'in_progress' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  customerInfo?: {
    name?: string
    email?: string
    location?: string
  }
}

const platformIcons = {
  web_chat: Globe,
  whatsapp: MessageSquare,
  discord: MessageSquare,
  email: Mail,
  phone: Phone,
}

const platformColors = {
  web_chat: 'bg-blue-500',
  whatsapp: 'bg-green-500',
  discord: 'bg-indigo-500',
  email: 'bg-gray-500',
  phone: 'bg-orange-500',
}

export default function CustomerContainer({ channelId }: { channelId: string }) {
  const [messages, setMessages] = useState<CustomerMessage[]>([
    {
      id: '1',
      content: 'Hi, I need help with my recent order. It seems to be delayed.',
      author: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 1800000),
      platform: 'web_chat',
      status: 'new',
      priority: 'medium',
      customerInfo: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        location: 'New York, NY'
      }
    },
    {
      id: '2',
      content: 'Can you help me upgrade my subscription plan?',
      author: 'Mike Chen',
      timestamp: new Date(Date.now() - 3600000),
      platform: 'whatsapp',
      status: 'in_progress',
      priority: 'high',
      customerInfo: {
        name: 'Mike Chen',
        email: 'mike@business.com',
        location: 'San Francisco, CA'
      }
    },
    {
      id: '3',
      content: 'Your service is amazing! Just wanted to say thanks.',
      author: 'Emma Wilson',
      timestamp: new Date(Date.now() - 7200000),
      platform: 'discord',
      status: 'resolved',
      priority: 'low',
      customerInfo: {
        name: 'Emma Wilson',
        email: 'emma@startup.io',
        location: 'Austin, TX'
      }
    },
  ])

  const [inputValue, setInputValue] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const filteredMessages = messages.filter(message => {
    const platformMatch = selectedPlatform === 'all' || message.platform === selectedPlatform
    const statusMatch = selectedStatus === 'all' || message.status === selectedStatus
    return platformMatch && statusMatch
  })

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const newMessage: CustomerMessage = {
      id: Date.now().toString(),
      content: inputValue,
      author: 'Support Agent',
      timestamp: new Date(),
      platform: 'web_chat',
      status: 'in_progress',
      priority: 'medium'
    }

    setMessages(prev => [...prev, newMessage])
    const messageToSend = inputValue
    setInputValue('')

    logBusiness('Support response sent in #customers channel', {
      channel: channelId,
      messageLength: messageToSend.length,
      platform: 'internal'
    })

    // Here you would integrate with your customer service system
    // For now, we'll simulate an AI response
    try {
      const response = await fetch('/api/leo-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          context: {
            variant: 'customer_service',
            channel: channelId,
            conversationHistory: messages.slice(-3),
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        const aiResponse: CustomerMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          author: 'Leo AI Assistant',
          timestamp: new Date(),
          platform: 'web_chat',
          status: 'in_progress',
          priority: 'medium'
        }
        setMessages(prev => [...prev, aiResponse])
      }
    } catch (error) {
      console.error('Customer service AI error:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500'
      case 'in_progress': return 'bg-orange-500'
      case 'resolved': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="flex flex-col h-full max-h-screen overflow-hidden">
      {/* Channel Header */}
      <div className="flex-shrink-0 border-b border-gray-700 bg-gray-900/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold text-white">#customers</h1>
            <span className="text-sm text-gray-400">All customer interactions and support</span>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2">
            <label htmlFor="customer-platform-filter" className="sr-only">Filter by platform</label>
            <select 
              id="customer-platform-filter"
              aria-label="Filter by platform"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white text-sm rounded px-2 py-1"
            >
              <option value="all">All Platforms</option>
              <option value="web_chat">Web Chat</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="discord">Discord</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
            
            <label htmlFor="customer-status-filter" className="sr-only">Filter by status</label>
            <select 
              id="customer-status-filter"
              aria-label="Filter by status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white text-sm rounded px-2 py-1"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {filteredMessages.map((message) => {
            const PlatformIcon = platformIcons[message.platform]
            return (
              <div key={message.id} className="flex items-start gap-3">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className={cn(
                    "text-sm font-medium text-white",
                    message.author === 'Support Agent' 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      : message.author === 'Leo AI Assistant'
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                      : platformColors[message.platform]
                  )}>
                    {message.author === 'Leo AI Assistant' ? 'L' : message.author[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-white text-sm">
                      {message.author}
                    </span>
                    
                    {/* Platform Badge */}
                    <Badge className={cn("text-xs px-2 py-0.5", platformColors[message.platform])}>
                      <PlatformIcon className="w-3 h-3 mr-1" />
                      {message.platform.replace('_', ' ')}
                    </Badge>
                    
                    {/* Priority Badge */}
                    <Badge className={cn("text-xs px-2 py-0.5", getPriorityColor(message.priority))}>
                      {message.priority}
                    </Badge>
                    
                    {/* Status Badge */}
                    <Badge className={cn("text-xs px-2 py-0.5", getStatusColor(message.status))}>
                      {message.status.replace('_', ' ')}
                    </Badge>
                    
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {/* Customer Info */}
                  {message.customerInfo && (
                    <div className="text-xs text-gray-400 mb-2">
                      {message.customerInfo.email} • {message.customerInfo.location}
                    </div>
                  )}
                  
                  <div className="bg-gray-700 text-gray-100 rounded-lg p-3">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
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
              placeholder="Respond to customer inquiry - Leo AI is ready to assist with customer service..."
              className="w-full bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-3 pr-12 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg px-4 py-3 transition-colors"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Customer service mode - Leo AI provides empathetic support</span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            {filteredMessages.length} conversations
          </span>
        </div>
      </div>
    </div>
  )
}







'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Send, CreditCard, FileText, Package, Zap, TrendingUp, 
  Users, Target, Camera, Brain, Bot, X 
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface LeoAssistantProps {
  variant?: 'business' | 'tactical' | 'standard'
  className?: string
}

interface ShipMessage {
  id: string
  content: string
  isShip: boolean
  timestamp: Date
  type?: 'text' | 'payment' | 'signature' | 'action' | 'ethical_concern'
  metadata?: {
    amount?: number
    recipient?: string
    action?: string
    confidence?: number
  }
}

export function LeoAssistant({ variant = 'business', className }: LeoAssistantProps) {
  const [messages, setMessages] = useState<ShipMessage[]>([
    {
      id: 'intro',
      content: variant === 'tactical' 
        ? `ANGEL COMMAND ONLINE. I'm LEO, your tactical AI commander. Ready to execute operations with divine precision.`
        : `Greetings! I'm Leo, your AI Guardian Angel. I'm here to help optimize your business and protect your interests.`,
      isShip: true,
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const quickActions = variant === 'tactical' ? [
    { icon: Target, label: 'Deploy Operation', color: 'bg-orange-600 hover:bg-orange-700' },
    { icon: Brain, label: 'Analyze Intel', color: 'bg-red-600 hover:bg-red-700' },
    { icon: Users, label: 'Mobilize Angels', color: 'bg-purple-600 hover:bg-purple-700' },
  ] : [
    { icon: CreditCard, label: 'Process Payment', color: 'bg-green-600 hover:bg-green-700' },
    { icon: FileText, label: 'Send Signature', color: 'bg-blue-600 hover:bg-blue-700' },
    { icon: Package, label: 'Check Inventory', color: 'bg-purple-600 hover:bg-purple-700' },
  ]

  const insights = variant === 'tactical' ? [
    { title: 'Operations Active', value: '23', change: '+3', icon: Target, color: 'text-orange-400' },
    { title: 'Angels Deployed', value: '847', change: '+52', icon: Users, color: 'text-red-400' },
    { title: 'Success Rate', value: '98.2%', change: '+0.5%', icon: Zap, color: 'text-purple-400' },
  ] : [
    { title: 'Revenue Today', value: '$12,450', change: '+15%', icon: TrendingUp, color: 'text-green-400' },
    { title: 'Active Customers', value: '234', change: '+8', icon: Users, color: 'text-blue-400' },
    { title: 'Conversion Rate', value: '3.2%', change: '+0.5%', icon: Target, color: 'text-purple-400' },
  ]

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: ShipMessage = {
      id: `msg-${Date.now()}`,
      content: inputValue,
      isShip: false,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    const messageToSend = inputValue
    setInputValue('')
    setIsThinking(true)

    try {
      // Send to real Claude-4-Sonnet pipeline via Leo Chat API
      const response = await fetch('/api/leo-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          context: {
            variant,
            conversationHistory: messages.slice(-5) // Last 5 messages for context
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        const aiResponse: ShipMessage = {
          id: `ship-${Date.now()}`,
          content: data.response,
          isShip: true,
          timestamp: new Date(),
          type: 'text',
          metadata: {
            // provider: data.metadata?.provider, // Property not available on ShipMessage metadata
            // processingTime: data.metadata?.processingTime // Property not available on ShipMessage metadata
            confidence: data.metadata?.confidence
          }
        }
        setMessages(prev => [...prev, aiResponse])
      } else {
        // Fallback response if API fails
        const fallbackResponse: ShipMessage = {
          id: `ship-${Date.now()}`,
          content: data.fallback || "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
          isShip: true,
          timestamp: new Date(),
          type: 'text'
        }
        setMessages(prev => [...prev, fallbackResponse])
      }
    } catch (error) {
      console.error('Leo chat error:', error)
      // Fallback response for network errors
      const errorResponse: ShipMessage = {
        id: `ship-${Date.now()}`,
        content: variant === 'tactical'
          ? "SYSTEM ERROR. Unable to establish secure connection. Attempting recovery..."
          : "I'm having trouble connecting right now. Let me try to help you anyway - what specific challenge are you facing?",
        isShip: true,
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className={cn(
      "w-full flex flex-col border-l",
      variant === 'tactical' 
        ? 'bg-neutral-900 border-neutral-700' 
        : 'bg-[#2f3136] border-[#202225]',
      className
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 border-b",
        variant === 'tactical' ? 'border-neutral-700' : 'border-[#202225]'
      )}>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback className={cn(
                "text-white",
                variant === 'tactical' 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                  : 'bg-gradient-to-r from-purple-500 to-blue-500'
              )}>
                LEO
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center",
              variant === 'tactical' ? 'bg-orange-500' : 'bg-green-500'
            )}>
              <Zap className="w-2 h-2 text-white" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white">
              {variant === 'tactical' ? 'LEO Command' : 'Leo Assistant'}
            </h3>
            <p className={cn(
              "text-xs",
              variant === 'tactical' ? 'text-orange-400' : 'text-green-400'
            )}>
              {variant === 'tactical' ? 'Tactical AI Commander' : 'AI Guardian Active'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={cn(
        "p-4 border-b",
        variant === 'tactical' ? 'border-neutral-700' : 'border-[#202225]'
      )}>
        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          {variant === 'tactical' ? 'TACTICAL ACTIONS' : 'Quick Actions'}
        </h4>
        <div className="space-y-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={cn("w-full justify-start text-white", action.color)}
              size="sm"
            >
              <action.icon className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Intelligence/Insights */}
      <div className={cn(
        "p-4 border-b",
        variant === 'tactical' ? 'border-neutral-700' : 'border-[#202225]'
      )}>
        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          {variant === 'tactical' ? 'TACTICAL INTELLIGENCE' : 'Business Intelligence'}
        </h4>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <Card key={index} className={cn(
              "border",
              variant === 'tactical' 
                ? 'bg-neutral-800 border-neutral-700' 
                : 'bg-[#36393f] border-[#202225]'
            )}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <insight.icon className={cn("w-4 h-4", insight.color)} />
                    <span className="text-xs text-gray-400">{insight.title}</span>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    insight.color.replace('text-', 'border-')
                  )}>
                    {insight.change}
                  </Badge>
                </div>
                <p className="text-lg font-bold text-white mt-1">{insight.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Guardian Personality */}
      <div className={cn(
        "p-4 border-b",
        variant === 'tactical' ? 'border-neutral-700' : 'border-[#202225]'
      )}>
        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          {variant === 'tactical' ? 'AI COMMANDER MODE' : 'Guardian Personality'}
        </h4>
        <div className="space-y-2">
          <div className={cn(
            "flex items-center justify-between p-2 rounded",
            variant === 'tactical' ? 'bg-neutral-800' : 'bg-[#36393f]'
          )}>
            <span className="text-sm text-white">
              {variant === 'tactical' ? 'Tactical Advisor' : 'Business Advisor'}
            </span>
            <Badge className={cn(
              variant === 'tactical' ? 'bg-orange-600' : 'bg-green-600'
            )}>
              Active
            </Badge>
          </div>
          <p className="text-xs text-gray-400">
            {variant === 'tactical' 
              ? 'Focused on mission success and strategic angel deployment.'
              : 'Focused on revenue optimization and customer conversion strategies.'}
          </p>
        </div>
      </div>

      {/* Enhanced Chat Interface */}
      <div className="flex-1 flex flex-col min-h-0">
        <div 
          ref={scrollContainerRef}
          className="flex-1 p-4 overflow-y-auto flex flex-col-reverse"
        >
          <div ref={messagesEndRef} />
          <div className="flex flex-col-reverse gap-3">
            {[...messages].reverse().map((message) => (
              <div key={message.id} className={cn(
                "flex space-x-2",
                !message.isShip && "flex-row-reverse space-x-reverse"
              )}>
                <Avatar className="w-6 h-6">
                  <AvatarFallback className={cn(
                    "text-white text-xs",
                    message.isShip 
                      ? variant === 'tactical'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500'
                        : 'bg-gradient-to-r from-purple-500 to-blue-500'
                      : 'bg-gray-600'
                  )}>
                    {message.isShip ? 'L' : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "rounded-lg p-2 max-w-[200px]",
                  message.isShip 
                    ? variant === 'tactical' ? 'bg-neutral-800' : 'bg-[#36393f]'
                    : 'bg-[#5865f2]'
                )}>
                  <p className="text-sm text-white">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex space-x-2">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className={cn(
                    "text-white text-xs",
                    variant === 'tactical'
                      ? 'bg-gradient-to-r from-orange-500 to-red-500'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500'
                  )}>
                    L
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "rounded-lg p-2",
                  variant === 'tactical' ? 'bg-neutral-800' : 'bg-[#36393f]'
                )}>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Input with Actions */}
        <div className={cn(
          "p-4 border-t bg-inherit",
          variant === 'tactical' ? 'border-neutral-700 bg-neutral-900' : 'border-[#202225] bg-[#2f3136]'
        )}>
          <div className="flex items-center space-x-2 mb-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={variant === 'tactical' ? 'Command LEO...' : 'Ask Leo anything...'}
              className={cn(
                "flex-1 border-none text-white placeholder-gray-400",
                variant === 'tactical' ? 'bg-neutral-800' : 'bg-[#40444b]'
              )}
            />
            <Button 
              size="sm" 
              onClick={handleSend}
              className={cn(
                variant === 'tactical' 
                  ? 'bg-orange-500 hover:bg-orange-600' 
                  : 'bg-[#5865f2] hover:bg-[#4752c4]'
              )}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Enhanced Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 hover:bg-[#393c43]"
                title="Point and Inventory"
              >
                <Camera className="w-4 h-4 text-gray-400" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 hover:bg-[#393c43]"
                title="Intent Detection"
              >
                <Brain className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
            
            <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
              {variant === 'tactical' ? 'Tactical Mode' : 'Business Mode'}
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              className={cn("text-xs", isListening ? "text-red-400" : "text-gray-400")}
              onClick={() => setIsListening(!isListening)}
            >
              🎤 {isListening ? "Listening..." : "Voice"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

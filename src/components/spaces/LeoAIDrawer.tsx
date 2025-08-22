"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChatControl, type ChatMessage } from '@/components/ui/ChatControl'
import { 
  X, 
  Bot, 
  Zap, 
  Brain, 
  Settings, 
  Minimize2,
  Maximize2 
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeoAIDrawerProps {
  isOpen: boolean
  onClose: () => void
  currentUser: any
  currentSpace?: string
  currentChannel?: string
}

export function LeoAIDrawer({ 
  isOpen, 
  onClose, 
  currentUser, 
  currentSpace, 
  currentChannel 
}: LeoAIDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      content: `Hello ${currentUser?.name || 'there'}! I'm Leo, your AI assistant for Angel OS Spaces. I'm here to help you with anything you need - from navigating channels to analyzing data and automating workflows.

How can I assist you today?`,
      role: 'assistant',
      timestamp: new Date(),
      metadata: {
        provider: 'Leo AI System'
      }
    }
  ])
  
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      metadata: {
        attachments: attachments?.map(file => ({
          id: Date.now().toString(),
          type: file.type.startsWith('image/') ? 'image' : 'file',
          name: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
          mimeType: file.type
        }))
      }
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Send to Leo AI API with context
      const response = await fetch('/api/leo-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          context: {
            variant: 'spaces',
            currentSpace,
            currentChannel,
            conversationHistory: messages.slice(-5),
            attachments: attachments?.length || 0
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: 'assistant',
          timestamp: new Date(),
          metadata: {
            provider: data.metadata?.provider || 'Leo AI',
            processingTime: data.metadata?.processingTime,
            confidence: data.metadata?.confidence
          }
        }
        setMessages(prev => [...prev, aiResponse])
      } else {
        throw new Error(data.error || 'Failed to get AI response')
      }
    } catch (error) {
      console.error('Leo AI error:', error)
      const errorResponse: ChatMessage = {
        id: (Date.now() + 2).toString(),
        content: "I'm having trouble connecting right now. Please try again in a moment, or let me know what specific task you need help with.",
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          provider: 'Leo AI (Fallback)'
        }
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceInput = async (audioBlob: Blob) => {
    // TODO: Implement voice-to-text conversion
    console.log('Voice input received:', audioBlob)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ 
            width: isMinimized ? 60 : 400, 
            opacity: 1 
          }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex-shrink-0 border-l bg-background flex flex-col relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-sm">Leo AI</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                      {currentChannel && (
                        <Badge variant="secondary" className="text-xs">
                          #{currentChannel}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
              >
                {isMinimized ? (
                  <Maximize2 className="h-3 w-3" />
                ) : (
                  <Minimize2 className="h-3 w-3" />
                )}
              </Button>
              
              {!isMinimized && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                >
                  <Settings className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Minimized State */}
          {isMinimized ? (
            <div className="flex-1 flex flex-col items-center justify-center p-2">
              <Avatar className="h-10 w-10 mb-3">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="text-xs text-center text-muted-foreground">
                Leo AI
              </div>
            </div>
          ) : (
            <>
              {/* AI Capabilities Info */}
              <div className="p-4 border-b bg-muted/30">
                <div className="text-xs text-muted-foreground mb-2">AI Capabilities</div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    Context Aware
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Voice Input
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    File Analysis
                  </Badge>
                </div>
                {currentSpace && currentChannel && (
                  <div className="text-xs text-muted-foreground mt-2">
                    Context: {currentSpace} → #{currentChannel}
                  </div>
                )}
              </div>

              {/* Chat Interface */}
              <div className="flex-1 min-h-0">
                <ChatControl
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onVoiceInput={handleVoiceInput}
                  isLoading={isLoading}
                  placeholder="Ask Leo anything..."
                  assistantName="Leo AI"
                  userAvatar={currentUser?.avatar?.url}
                  showVoiceInput={true}
                  showFileUpload={true}
                  className="h-full border-0"
                  variant="compact"
                />
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

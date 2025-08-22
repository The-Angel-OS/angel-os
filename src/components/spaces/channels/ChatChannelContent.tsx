"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  Mic, 
  MicOff,
  Users,
  Hash
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatChannelContentProps {
  spaceId: string
  channelId: string
  space: any
  currentUser: any
  liveKitEnabled: boolean
}

interface Message {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: Date
  type: 'text' | 'system'
}

export function ChatChannelContent({ 
  spaceId, 
  channelId, 
  space, 
  currentUser, 
  liveKitEnabled 
}: ChatChannelContentProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Welcome to the Angel OS Spaces! This is the beginning of our collaboration.',
      author: {
        id: 'system',
        name: 'Angel OS',
      },
      timestamp: new Date(Date.now() - 3600000),
      type: 'system'
    },
    {
      id: '2',
      content: 'Hey everyone! Excited to be working in this new collaborative environment.',
      author: {
        id: currentUser.id,
        name: currentUser.name || 'Kenneth Consort',
      },
      timestamp: new Date(Date.now() - 1800000),
      type: 'text'
    },
    {
      id: '3',
      content: 'The new dashboard looks amazing! Great work on the UI improvements.',
      author: {
        id: 'leo-ai',
        name: 'Leo AI',
      },
      timestamp: new Date(Date.now() - 900000),
      type: 'text'
    },
  ])

  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      author: {
        id: currentUser.id,
        name: currentUser.name || 'Kenneth Consort',
      },
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Simulate Leo AI response for demo
    if (channelId === 'leo-chat' || Math.random() > 0.7) {
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `Thanks for your message! I'm here to help with anything you need in the ${channelId} channel.`,
          author: {
            id: 'leo-ai',
            name: 'Leo AI',
          },
          timestamp: new Date(),
          type: 'text'
        }
        setMessages(prev => [...prev, aiResponse])
      }, 1500)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Channel Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Hash className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="font-semibold">{channelId}</h1>
            <p className="text-sm text-muted-foreground">
              {channelId === 'general' ? 'General discussion and announcements' :
               channelId === 'leo-chat' ? 'AI Assistant chat and collaboration' :
               `${channelId} channel`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {liveKitEnabled && (
            <>
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Mic className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-4 mx-2" />
            </>
          )}
          
          <Button variant="ghost" size="sm">
            <Users className="h-4 w-4" />
            <span className="ml-1 text-sm">3</span>
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex gap-3 ${message.type === 'system' ? 'justify-center' : ''}`}
              >
                {message.type !== 'system' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.author.avatar} />
                    <AvatarFallback>
                      {message.author.id === 'leo-ai' ? 'L' : 
                       message.author.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`flex-1 ${message.type === 'system' ? 'max-w-md' : ''}`}>
                  {message.type === 'system' ? (
                    <Card className="bg-muted/50">
                      <CardContent className="p-3 text-center text-sm">
                        {message.content}
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.author.name}
                        </span>
                        {message.author.id === 'leo-ai' && (
                          <Badge variant="secondary" className="text-xs">AI</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>L</AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Message #${channelId}`}
              className="min-h-[40px] max-h-[120px] resize-none pr-12"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Paperclip className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Smile className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

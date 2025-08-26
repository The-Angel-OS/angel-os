"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  ChevronLeft,
  ChevronRight,
  Hash,
  ChevronDown
} from "lucide-react"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChatEngine } from "@/components/chat/ChatEngine"
import type { ChatChannel, ChatMember, ChatMessage } from "@/components/chat/ChatEngine"
import { useTheme } from "@/providers/Theme"

interface ChatPanelProps {
  className?: string
}

export function ChatPanel({ className = "" }: ChatPanelProps) {
  console.log('🎛️ ChatPanel component mounted/rendered')
  const [isExpanded, setIsExpanded] = useState(false)
  const { theme } = useTheme() // Subscribe to theme changes
  const [members, setMembers] = useState<ChatMember[]>([])
  const [channels, setChannels] = useState<ChatChannel[]>([])
  const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentUser, setCurrentUser] = useState<ChatMember | undefined>()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize with default data when panel is expanded
  useEffect(() => {
    console.log('🎛️ ChatPanel useEffect triggered, isExpanded:', isExpanded, 'channels.length:', channels.length)
    if (isExpanded && channels.length === 0) {
      console.log('🚀 Initializing side panel chat...')
      initializeChat()
    }
  }, [isExpanded])

  // Welcome message is now added directly in initializeChat

  const initializeChat = async () => {
    console.log('🔧 initializeChat() called - Starting side panel initialization')
    try {
      // Set current user and members first
      const user: ChatMember = {
        id: "1", // Use real user ID
        name: "Kenneth Courtney",
        avatar: "/placeholder.svg?height=32&width=32",
        status: "online",
        role: "member"
      }
      setCurrentUser(user)

      // LEO assistant member
      const leo: ChatMember = {
        id: "leo",
        name: "LEO",
        avatar: "/leo-avatar.svg",
        status: "online",
        role: "admin"
      }
      setMembers([user, leo])

      // Load real channels from the spaces API
      const channelsResponse = await fetch('/api/spaces/1/channels')
      if (channelsResponse.ok) {
        const channelsData = await channelsResponse.json()
        const realChannels: ChatChannel[] = channelsData.docs.map((channel: any) => ({
          id: channel.id.toString(),
          name: `# ${channel.name}`,
          type: "chat" as const,
          members: ["1", "leo"]
        }))
        
        setChannels(realChannels)
        
        // Set system channel as default if available
        const systemChannel = realChannels.find(c => c.name.includes('system'))
        const defaultChannel = systemChannel || realChannels[0] || null
        
        console.log(`🎯 Setting default channel:`, defaultChannel)
        setActiveChannel(defaultChannel)
        
        // Load messages for the default channel
        if (defaultChannel) {
          console.log(`📂 Loading messages for default channel: ${defaultChannel.id} (${defaultChannel.name})`)
          await loadChannelMessages(defaultChannel.id)
        }
      } else {
        // Fallback to mock channels if API fails
        console.warn('Failed to load real channels, using fallback')
        await initializeFallbackChannels()
      }
    } catch (error) {
      console.error('Error initializing chat:', error)
      await initializeFallbackChannels()
    }
  }

  const initializeFallbackChannels = async () => {
    // Add welcome message immediately
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      content: "Welcome to Angel OS! I'm LEO, your AI assistant. How can I help you today?",
      sender: "ai",
      senderName: "LEO",
      timestamp: new Date().toISOString(),
      type: "text"
    }
    setMessages([welcomeMessage])

    // Create default channels as fallback
    const defaultChannels: ChatChannel[] = [
      {
        id: "system",
        name: "# system",
        type: "chat" as const,
        members: ["1", "leo"]
      }
    ]
    
    setChannels(defaultChannels)
    setActiveChannel(defaultChannels[0] || null)
  }

  const loadChannelMessages = async (channelId: string) => {
    try {
      console.log(`🔄 Loading messages for channel: ${channelId}`)
      
      // Try both channel ID and channel name resolution
      const messagesResponse = await fetch(`/api/messages?channel=${channelId}&limit=50&sort=createdAt`)
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json()
        console.log(`📨 Loaded ${messagesData.docs?.length || 0} messages for channel ${channelId}`)
        
        const realMessages: ChatMessage[] = messagesData.docs.map((msg: any) => ({
          id: msg.id.toString(),
          content: msg.content?.text || '',
          sender: msg.messageType === 'user' ? 'user' : 'ai',
          senderName: msg.messageType === 'user' ? 'Kenneth Courtney' : 'LEO',
          timestamp: msg.createdAt,
          type: 'text'
        }))
        
        // Sort by timestamp to ensure proper order
        realMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        
        setMessages(realMessages)
        console.log(`✅ Set ${realMessages.length} messages in UI`)
      } else {
        console.error('Failed to load messages:', messagesResponse.status, messagesResponse.statusText)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async (content: string, channelId: string) => {
    if (!content.trim() || isLoading) return

    setIsLoading(true)

    try {
      // Create message using the same API as spaces chat
      const messageResponse = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: {
            type: 'text',
            text: content,
            metadata: {
              source: 'side-panel-chat',
              timestamp: new Date().toISOString(),
              channel: channelId
            }
          },
          messageType: 'user',
          space: 1,
          channel: parseInt(channelId),
          priority: 'normal',
          sender: 1
        })
      })

      if (messageResponse.ok) {
        const messageData = await messageResponse.json()
        
        // Trigger LEO response using web-chat API with the created message ID
        const leoResponse = await fetch('/api/web-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            sessionId: `side-panel-${channelId}-${Date.now()}`,
            spaceId: 1,
            tenantId: 1,
            context: {
              variant: 'dashboard',
              isAuthenticated: true,
              channel: channelId,
              messageId: messageData.id
            }
          })
        })

        if (leoResponse.ok) {
          // Reload messages to show both user message and LEO response
          await loadChannelMessages(channelId)
        } else {
          console.error('Failed to get LEO response:', leoResponse.statusText)
          // Still reload to show user message
          await loadChannelMessages(channelId)
        }
      } else {
        console.error('Failed to create message:', messageResponse.statusText)
      }
     } catch (error) {
       console.error('Failed to send message:', error)
       // Add error message
       const errorMessage: ChatMessage = {
         id: (Date.now() + 1).toString(),
         content: "I'm experiencing connection issues. Please try again in a moment.",
         sender: "ai",
         senderName: "LEO",
         timestamp: new Date().toISOString(),
         type: "text"
       }
       setMessages(prev => [...prev, errorMessage])
     } finally {
       setIsLoading(false)
          }
   }

   const handleRegenerateMessage = async (messageId: string) => {
     // Find the message and regenerate it
     const messageIndex = messages.findIndex(m => m.id === messageId)
     if (messageIndex === -1) return

     const message = messages[messageIndex]
     
     // Find the user message that prompted this response
     let userMessage = ""
     for (let i = messageIndex - 1; i >= 0; i--) {
       if (messages[i]?.sender === "user") {
         userMessage = messages[i]?.content || ""
         break
       }
     }

     if (userMessage) {
       // Remove the old AI message and regenerate
       setMessages(prev => prev.filter(m => m.id !== messageId))
       setIsLoading(true)
       
       try {
         // Regenerate with the same user message
         await handleSendMessage(userMessage, activeChannel?.id || 'system')
       } catch (error) {
         console.error('Failed to regenerate message:', error)
       }
     }
   }

   return (
    <div className={`fixed right-0 top-0 h-full z-[10000] ${className}`}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-background border border-r-0 rounded-r-none rounded-l-md shadow-md hover:bg-accent z-50"
      >
        {isExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </Button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key={`chat-panel-${theme}`} // Force re-render on theme change
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="w-96 h-full bg-background border-l border-border shadow-2xl flex flex-col chat-panel-container"
            style={{
              backgroundColor: 'hsl(var(--background))',
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))'
            }}
          >
                                     <ChatEngine
              channels={channels}
              activeChannel={activeChannel}
              messages={messages}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
              onChannelChange={async (channel) => {
                setActiveChannel(channel)
                await loadChannelMessages(channel.id)
              }}
              onRegenerateMessage={handleRegenerateMessage}
              isLoading={isLoading}
              className="h-full"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChatPanel

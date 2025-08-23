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
    if (isExpanded && channels.length === 0) {
      initializeChat()
    }
  }, [isExpanded])

  // Welcome message is now added directly in initializeChat

  const initializeChat = async () => {
    // Set current user and members first
    const user: ChatMember = {
      id: "current-user",
      name: "Kenneth Courtney", // Use real user name
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

         // Create default channels (skip API call for now to avoid 500 errors)
     const defaultChannels: ChatChannel[] = [
       {
         id: "system",
         name: "# system",
         type: "chat" as const,
         members: ["current-user", "leo"]
       },
       {
         id: "general",
         name: "# general", 
         type: "chat" as const,
         members: ["current-user", "leo"]
       },
       {
         id: "support",
         name: "# support",
         type: "chat" as const, 
         members: ["current-user", "leo"]
       },
       {
         id: "business",
         name: "# business",
         type: "chat" as const,
         members: ["current-user", "leo"] 
       }
     ]
     
     setChannels(defaultChannels)
     setActiveChannel(defaultChannels[0] || null)
  }

  const handleSendMessage = async (content: string, channelId: string) => {
    if (!content.trim() || isLoading) return

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: "user",
      senderName: currentUser?.name || "You",
      timestamp: new Date().toISOString(),
      type: "text"
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

                  try {
      // Use the real LEO API
      console.log('Calling LEO API for:', content)
      
      const response = await fetch('/api/leo-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          context: {
            variant: 'friendly',
            conversationHistory: messages.slice(-5), // Last 5 messages for context
          },
          spaceId: 1,
          tenantId: 1,
        }),
      })

      if (!response.ok) {
        throw new Error(`LEO API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Add LEO's response
      const leoMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I apologize, but I'm having trouble processing your request right now.",
        sender: "ai",
        senderName: "LEO",
        timestamp: new Date().toISOString(),
        type: "text"
      }
       setMessages(prev => [...prev, leoMessage])
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
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full bg-background border border-r-0 rounded-r-none rounded-l-md shadow-md hover:bg-accent"
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
               onChannelChange={setActiveChannel}
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

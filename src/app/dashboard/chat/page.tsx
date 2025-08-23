"use client"

import { useState, useEffect } from "react"
import { ChannelChooser, type Channel, type SpaceMember } from "./_components/ChannelChooser"
import { ChannelTypeToggle } from "./_components/ChannelTypeToggle"
import { ChannelContentRenderer } from "./_components/ChannelContentRenderer"
import { ChatHeader } from "./_components/ChatHeader"
import { ChatEngine } from "@/components/chat/ChatEngine"
import type { Message } from "./_components/ChatArea"

// Mock current space data
const mockCurrentSpace = {
  id: "kendev-main",
  name: "KenDev.Co Main",
  members: [
  {
    id: "1",
      name: "Kenneth Courtney",
      email: "kenneth.courtney@gmail.com",
    avatar: "/placeholder.svg?height=40&width=40",
      status: "online" as const,
      role: "admin" as const,
  },
  {
    id: "2",
      name: "Ahmed",
      email: "ahmed@example.com",
    avatar: "/placeholder.svg?height=40&width=40",
      status: "online" as const,
      role: "member" as const,
  },
  {
    id: "3",
      name: "Fifth Element",
      email: "fifth@element.com",
    avatar: "/placeholder.svg?height=40&width=40",
      status: "away" as const,
      role: "member" as const,
  },
  {
    id: "4",
      name: "LEO AI",
      email: "leo@angelOS.com",
    avatar: "/placeholder.svg?height=40&width=40",
      status: "online" as const,
      role: "guest" as const,
    },
  ]
}

// Mock channels
const mockChannels: Channel[] = [
  {
    id: "general",
    name: "general",
    type: "chat",
    members: ["1", "2", "3", "4"],
    unreadCount: 2,
    lastActivity: "2 minutes ago",
  },
  {
    id: "angel-os-dev",
    name: "angel-os-development", 
    type: "project",
    members: ["1", "4"],
    unreadCount: 0,
    lastActivity: "1 hour ago",
  },
  {
    id: "clearwater-files",
    name: "clearwater-content",
    type: "files", 
    members: ["1", "2"],
    unreadCount: 0,
    lastActivity: "Yesterday",
  },
  {
    id: "business-notes",
    name: "business-planning",
    type: "notes",
    members: ["1", "3"],
    unreadCount: 1,
    lastActivity: "3 hours ago",
  },
]

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Hey! How are you doing today?",
    sender: "contact",
    timestamp: "05:20 PM",
  },
  {
    id: "2",
    content: "I'm doing great, thanks for asking! Just working on some new projects.",
    sender: "user",
    timestamp: "05:22 PM",
  },
  {
    id: "3",
    content: "That sounds exciting! What kind of projects are you working on?",
    sender: "contact",
    timestamp: "05:23 PM",
  },
  {
    id: "4",
    content: "important_documents.pdf",
    sender: "contact",
    timestamp: "05:23 PM",
    type: "file",
    fileName: "important_documents.pdf",
  },
]

export default function ChatPage() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [channels, setChannels] = useState<Channel[]>(mockChannels)
  const [activeView, setActiveView] = useState<"chat" | "livekit" | "files" | "notes" | "project" | "timetrack">("chat")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Set page title and initialize real channels
  useEffect(() => {
    document.title = "Angel OS: Chat"
    initializeRealChannels()
  }, [])

  const initializeRealChannels = async () => {
    try {
      setIsLoading(true)
      
      // Get the system channel (same as sidebar and bubble)
      const systemChannelResponse = await fetch('/api/channels/find-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'system',
          channelType: 'chat',
          reportType: 'general',
          tenantId: '1',
          guardianAngelId: '1'
        })
      })

      if (systemChannelResponse.ok) {
        const systemChannel = await systemChannelResponse.json()
        
        // Create a real system channel for the UI
        const realSystemChannel: Channel = {
          id: systemChannel.id.toString(),
          name: "LEO AI Assistant",
          type: "chat",
          members: ["1", "4"], // Kenneth + LEO
          unreadCount: 0,
          lastActivity: "Active now",
          isPrivate: false
        }
        
        // Replace mock channels with real system channel + mock channels
        setChannels([realSystemChannel, ...mockChannels.slice(1)])
        setSelectedChannel(realSystemChannel)
        
        // Load real conversation history (reset pagination)
        setCurrentPage(1)
        setHasMoreMessages(true)
        await loadChannelMessages(systemChannel.id.toString(), 1, false)
      }
    } catch (error) {
      console.error('Failed to initialize real channels:', error)
      // Fallback to mock data
      setSelectedChannel(mockChannels[0] || null)
      setMessages(mockMessages)
    } finally {
      setIsLoading(false)
    }
  }

  const loadChannelMessages = async (channelId: string, page: number = 1, append: boolean = false) => {
    try {
      const limit = 20 // Load 20 messages per page
      const response = await fetch(`/api/messages?channel=${channelId}&limit=${limit}&page=${page}&sort=-createdAt`)
      
      if (response.ok) {
        const { docs, totalPages, hasNextPage } = await response.json()
        
        // Convert database messages to UI format
        const uiMessages: Message[] = docs.reverse().map((msg: any) => ({
          id: msg.id.toString(),
          content: msg.content?.text || msg.content || 'No content',
          sender: msg.messageType === 'leo' ? 'leo' : 
                 msg.messageType === 'system' ? 'system' : 'user',
          timestamp: new Date(msg.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
          }),
          senderName: msg.sender?.firstName ? 
            `${msg.sender.firstName} ${msg.sender.lastName}` : 
            (msg.messageType === 'leo' ? 'LEO AI' : 'User')
        }))
        
        if (append) {
          // Prepend older messages for infinite scroll
          setMessages(prev => [...uiMessages, ...prev])
        } else {
          // Replace messages for initial load
          setMessages(uiMessages)
        }
        
        setHasMoreMessages(hasNextPage || false)
        console.log(`✅ Loaded ${uiMessages.length} messages from system channel (page ${page})`)
      }
    } catch (error) {
      console.error('Failed to load channel messages:', error)
    }
  }

  const loadMoreMessages = async () => {
    if (!selectedChannel || isLoadingMore || !hasMoreMessages) return
    
    setIsLoadingMore(true)
    const nextPage = currentPage + 1
    
    try {
      await loadChannelMessages(selectedChannel.id, nextPage, true)
      setCurrentPage(nextPage)
    } catch (error) {
      console.error('Failed to load more messages:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages(prev => [...prev, userMessage])

    try {
      // Call web-chat API (same as side panel)
      console.log('Sending message to web-chat API:', content)
      const response = await fetch('/api/web-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          spaceId: 1,
          tenantId: 1,
          context: {
            variant: 'dashboard',
            isAuthenticated: true,
            channel: selectedChannel?.name || 'general'
          },
          userAgent: navigator.userAgent,
          pageUrl: window.location.href
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ LEO response received:', data.response?.substring(0, 100) + '...')
        
        // Reload messages from database to get the latest conversation
        if (selectedChannel) {
          await loadChannelMessages(selectedChannel.id)
        }
      } else {
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to send message to LEO:', error)
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm experiencing connection issues. Please try again in a moment.",
        sender: "system",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleCreatePM = (memberId: string) => {
    const member = mockCurrentSpace.members.find(m => m.id === memberId)
    if (member) {
      // Create dynamic PM channel (Teams behavior)
      const pmChannel: Channel = {
        id: `pm-${memberId}`,
        name: member.name,
        type: "chat",
        members: ["1", memberId], // Current user + target member
        isPrivate: true,
      }
      setSelectedChannel(pmChannel)
      setActiveView("chat")
      console.log(`Created PM channel with ${member.name}`)
    }
  }

  const handleCreateGroupChat = (memberIds: string[]) => {
    const memberNames = memberIds
      .map(id => mockCurrentSpace.members.find(m => m.id === id)?.name)
      .filter(Boolean)
      .join(", ")
    
    const groupChannel: Channel = {
      id: `group-${Date.now()}`,
      name: `Group: ${memberNames}`,
      type: "chat", 
      members: ["1", ...memberIds], // Current user + selected members
      isPrivate: true,
    }
    setChannels(prev => [...prev, groupChannel])
    setSelectedChannel(groupChannel)
    setActiveView("chat")
    console.log(`Created group chat with ${memberNames}`)
  }

  const handleCreateChannel = (name: string, type: string, description?: string) => {
    const newChannel: Channel = {
      id: `channel-${Date.now()}`,
      name: `# ${name}`,
      type: type as Channel["type"],
      members: ["1"], // Add creator as first member
      isPrivate: false
    }
    
    setChannels(prev => [...prev, newChannel])
    setSelectedChannel(newChannel)
    setActiveView("chat")
    console.log(`Created channel: ${name} (${type})`)
  }

  // Convert channel to contact format for ChatHeader compatibility
  const selectedContact = selectedChannel ? {
    id: selectedChannel.id,
    name: selectedChannel.name,
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "",
    time: selectedChannel.lastActivity || "",
    online: true,
  } : null

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-120px)] flex bg-background rounded-lg border overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Connecting to LEO AI...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)] flex bg-background rounded-lg border overflow-hidden">
      <ChannelChooser
        currentSpace={mockCurrentSpace}
        channels={channels}
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
        onCreatePM={handleCreatePM}
        onCreateGroupChat={handleCreateGroupChat}
        onCreateChannel={handleCreateChannel}
      />
      
      <div className="flex-1 flex flex-col">
        {selectedChannel && (
          <>
            {selectedContact && <ChatHeader contact={selectedContact} />}
            <ChannelTypeToggle
              channel={selectedChannel}
              activeView={activeView}
              onViewChange={(view) => setActiveView(view as any)}
            />
            {activeView === "chat" ? (
              <div className="flex-1 flex flex-col">
                <ChatEngine
                  channels={[{
                    id: selectedChannel.id,
                    name: selectedChannel.name,
                    type: selectedChannel.type as "chat",
                    members: selectedChannel.members
                  }]}
                  activeChannel={{
                    id: selectedChannel.id,
                    name: selectedChannel.name,
                    type: selectedChannel.type as "chat",
                    members: selectedChannel.members
                  }}
                  messages={messages.map(msg => ({
                    id: msg.id,
                    content: msg.content,
                    sender: msg.sender === "user" ? "user" : "ai",
                    senderName: msg.sender === "user" ? "Kenneth Courtney" : "LEO",
                    timestamp: msg.timestamp,
                    type: "text"
                  }))}
                  currentUser={{
                    id: "current-user",
                    name: "Kenneth Courtney",
                    avatar: "/placeholder.svg",
                    status: "online",
                    role: "member"
                  }}
                  onSendMessage={async (content, channelId) => {
                    handleSendMessage(content)
                  }}
                  className="flex-1"
                />
              </div>
            ) : (
              <ChannelContentRenderer
                channel={selectedChannel}
                activeView={activeView}
                messages={messages}
                onSendMessage={handleSendMessage}
                onLoadMore={loadMoreMessages}
                hasMore={hasMoreMessages}
                isLoading={isLoadingMore}
              />
            )}
          </>
        )}
        
        {!selectedChannel && (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Welcome to Angel OS Spaces</h3>
              <p className="text-muted-foreground">
                Select a channel or create a PM to start collaborating
                <br />
                <span className="text-xs">Everything is a message • Channels are worlds</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
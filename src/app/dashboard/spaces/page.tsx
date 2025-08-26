"use client"

import { useState, useEffect } from "react"
import { ChannelChooser, type Channel, type SpaceMember } from "./_components/ChannelChooser"
import { ChannelTypeToggle } from "./_components/ChannelTypeToggle"
import { ChannelContentRenderer } from "./_components/ChannelContentRenderer"
import { ChatHeader } from "./_components/ChatHeader"
import { ChatEngine, type ChatMessage } from "@/components/chat/ChatEngine"
import type { Message } from "./_components/ChatArea"
import { getOrCreateGuestSession, updateGuestSessionActivity, createGuestSessionInDB } from "@/utilities/guestSession"

// This will be loaded from CMS/configuration
const getCurrentSpace = async () => {
  try {
    // TODO: Get current tenant/space from auth context
    const currentTenantId = "1" // Temporary hardcode
    
    const [spaceResponse, membersResponse] = await Promise.all([
      fetch(`/api/spaces/${currentTenantId}`),
      fetch(`/api/spaces/${currentTenantId}/members`)
    ])

    if (spaceResponse.ok && membersResponse.ok) {
      const space = await spaceResponse.json()
      const membersData = await membersResponse.json()
      
      return {
        id: space.id,
        name: space.name,
        members: membersData.docs || []
      }
    }
  } catch (error) {
    console.error('Failed to load current space:', error)
  }
  
  // Fallback to mock data if API fails
  return {
    id: "1", // Use consistent ID
    name: "Main Space",
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

    ]
  }
}

// Channels will be loaded by ChannelChooser component

// Helper function to convert Message to ChatMessage
const transformMessageToChatMessage = (message: Message): ChatMessage => {
  return {
    id: message.id,
    content: message.content,
    sender: message.sender === "contact" ? "ai" : message.sender === "leo" ? "ai" : message.sender as "user" | "system",
    senderName: message.senderName,
    timestamp: message.timestamp,
    type: message.type,
  }
}

// Helper function to convert ChatMessage back to Message for components that expect Message[]
const transformChatMessageToMessage = (chatMessage: ChatMessage): Message => {
  return {
    id: chatMessage.id,
    content: chatMessage.content,
    sender: chatMessage.sender === "ai" ? "leo" : chatMessage.sender as "user" | "system",
    senderName: chatMessage.senderName,
    timestamp: chatMessage.timestamp,
    type: chatMessage.type,
  }
}

const mockMessages: ChatMessage[] = [
  {
    id: "1",
    content: "Hey! How are you doing today?",
    sender: "ai",
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
    sender: "ai",
    timestamp: "05:23 PM",
  },
  {
    id: "4",
    content: "important_documents.pdf",
    sender: "ai",
    timestamp: "05:23 PM",
    type: "file",
  },
]

// Ensure essential channels exist for the space
const ensureEssentialChannels = async (spaceId: string) => {
  try {
    console.log('🔧 Ensuring essential channels exist for space:', spaceId)
    
    // Check if main and system channels exist
    const channelsResponse = await fetch(`/api/spaces/${spaceId}/channels`)
    if (!channelsResponse.ok) {
      console.warn('Could not fetch channels to check for essential channels')
      return
    }
    
    const channelsData = await channelsResponse.json()
    const existingChannels = channelsData.docs || []
    const channelNames = existingChannels.map((ch: any) => ch.name.toLowerCase())
    
    const essentialChannels = [
      {
        name: 'main',
        description: 'Main discussion channel - Everyone + LEO AI',
        type: 'chat',
        isSystem: true
      },
      {
        name: 'system',
        description: 'System announcements and updates',
        type: 'chat',
        isSystem: true
      }
    ]
    
    for (const channel of essentialChannels) {
      if (!channelNames.includes(channel.name.toLowerCase())) {
        console.log(`🔧 Creating missing essential channel: ${channel.name}`)
        
        try {
          const createResponse = await fetch(`/api/spaces/${spaceId}/channels`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: channel.name,
              description: channel.description,
              type: channel.type,
              isSystem: channel.isSystem,
              members: ['1'], // Add current user as member
              createdBy: '1'
            })
          })
          
          if (createResponse.ok) {
            const createdChannel = await createResponse.json()
            console.log(`✅ Created essential channel: ${channel.name} (ID: ${createdChannel.id})`)
          } else {
            console.warn(`⚠️ Failed to create essential channel ${channel.name}: ${createResponse.status}`)
          }
        } catch (error) {
          console.error(`❌ Error creating essential channel ${channel.name}:`, error)
        }
      } else {
        console.log(`✅ Essential channel already exists: ${channel.name}`)
      }
    }
  } catch (error) {
    console.error('❌ Error ensuring essential channels:', error)
  }
}

export default function ChatPage() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
  const [currentSpace, setCurrentSpace] = useState<any>(null)
  const [activeView, setActiveView] = useState<"chat" | "livekit" | "files" | "notes" | "project" | "timetrack">("chat")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [isAuthenticated, setIsAuthenticated] = useState(true) // TODO: Get from auth context
  const [webChatSession, setWebChatSession] = useState<any>(null)

  // Set page title and load current space
  useEffect(() => {
    document.title = "Angel OS: Spaces"
    loadCurrentSpace()
  }, [])

  // Load messages when selected channel changes
  useEffect(() => {
    if (selectedChannel?.id) {
      console.log(`🔄 Channel changed to: ${selectedChannel.name} (${selectedChannel.id})`)
      console.log('🔍 Selected channel object:', selectedChannel)
      setMessages([]) // Clear current messages
      loadChannelMessages(selectedChannel.id)
    }
  }, [selectedChannel?.id])

  const loadCurrentSpace = async () => {
    setIsLoading(true)
    try {
      if (isAuthenticated) {
        // Authenticated users get full space access
        const space = await getCurrentSpace()
        setCurrentSpace(space)
        
        // Ensure essential channels exist and auto-select default channel
        await ensureEssentialChannels(space.id)
        
        try {
          const channelsResponse = await fetch(`/api/spaces/${space.id}/channels`)
          if (channelsResponse.ok) {
            const channelsData = await channelsResponse.json()
            const availableChannels = channelsData.docs || []
            
            // Try to find a default channel in order of preference
            let defaultChannel = availableChannels.find((ch: any) => ch.name === 'main') ||
                                 availableChannels.find((ch: any) => ch.name === 'general') ||
                                 availableChannels.find((ch: any) => ch.name === 'welcome') ||
                                 availableChannels[0] // Fallback to first channel
            
            if (defaultChannel) {
              const selectedChannel = {
                id: defaultChannel.id,
                name: defaultChannel.name,
                type: 'chat' as const,
                members: space.members.map((m: any) => m.id),
                isSystem: defaultChannel.isSystem || false,
                description: defaultChannel.description || `${defaultChannel.name} channel`,
                tenantId: space.id
              }
              console.log(`🎯 Auto-selected channel: ${selectedChannel.name} (ID: ${selectedChannel.id})`)
              setSelectedChannel(selectedChannel)
            } else {
              console.warn('⚠️ No channels found after ensuring essential channels exist')
            }
          }
        } catch (error) {
          console.error('Failed to load channels for auto-selection:', error)
        }
      } else {
        // Unauthenticated users get WebChatSession with LEO only
        await createWebChatSession()
      }
    } catch (error) {
      console.error('Failed to load space:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createWebChatSession = async () => {
    try {
      const response = await fetch('/api/web-chat-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorInfo: {
            pageUrl: window.location.href,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            // TODO: Add IP geolocation
          },
          space: '1', // Default space for web chat
          tenant: '1' // Default tenant
        })
      })

      if (response.ok) {
        const session = await response.json()
        setWebChatSession(session)
        
        // Create LEO-only channel for unauthenticated users
        const leoChannel = {
          id: `webchat-${session.sessionId}`,
          name: 'LEO AI Assistant',
          type: 'chat' as const,
          members: ['leo'], // Only LEO for unauthenticated users
          isSystem: true,
          description: 'Chat with LEO AI Assistant',
          tenantId: '1'
        }
        setSelectedChannel(leoChannel)
      }
    } catch (error) {
      console.error('Failed to create web chat session:', error)
    }
  }

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
        
        // This will be handled by ChannelChooser now
        setSelectedChannel(realSystemChannel)
        
        // Load real conversation history (reset pagination)
        setCurrentPage(1)
        setHasMoreMessages(true)
        await loadChannelMessages(systemChannel.id.toString(), 1, false)
      }
    } catch (error) {
      console.error('Failed to initialize real channels:', error)
      // Fallback to mock data
      setMessages(mockMessages)
    } finally {
      setIsLoading(false)
    }
  }

  const loadChannelMessages = async (channelId: string, page: number = 1, append: boolean = false) => {
    try {
      const limit = 20 // Load 20 messages per page
      
      // Resolve channel name to ID if needed
      let actualChannelId = channelId
      if (isNaN(parseInt(channelId))) {
        // Check if this is a PM channel (starts with 'pm_')
        if (channelId.startsWith('pm_')) {
          console.log(`🔍 PM channel detected: ${channelId}, searching in all channels...`)
          // For PM channels, search in the channels collection directly
          try {
            const allChannelsResponse = await fetch(`/api/channels?name=${channelId}`)
            if (allChannelsResponse.ok) {
              const channelData = await allChannelsResponse.json()
              if (channelData.docs && channelData.docs.length > 0) {
                actualChannelId = channelData.docs[0].id.toString()
                console.log(`✅ Found PM channel "${channelId}" with ID: ${actualChannelId}`)
              }
            }
          } catch (error) {
            console.warn('Could not find PM channel:', error)
          }
        } else {
          // For regular channels, search in space channels
          try {
            const channelsResponse = await fetch(`/api/spaces/${currentSpace?.id || 1}/channels`)
            if (channelsResponse.ok) {
              const channelsData = await channelsResponse.json()
              const foundChannel = channelsData.docs?.find((ch: any) => 
                ch.name === channelId || ch.name.toLowerCase() === channelId.toLowerCase()
              )
              if (foundChannel) {
                actualChannelId = foundChannel.id.toString()
                console.log(`🔍 Resolved channel "${channelId}" to ID: ${actualChannelId}`)
              }
            }
          } catch (error) {
            console.warn('Could not resolve channel name to ID:', error)
          }
        }
      }
      
      console.log(`📡 Loading messages for channel: ${channelId} (ID: ${actualChannelId})`)
      const response = await fetch(`/api/messages?channel=${actualChannelId}&limit=${limit}&page=${page}&sort=createdAt`)
      
      if (response.ok) {
        const { docs, totalPages, hasNextPage } = await response.json()
        
        // Convert database messages to ChatEngine format
        const uiMessages: ChatMessage[] = docs.map((msg: any) => ({
          id: msg.id.toString(),
          content: msg.content?.text || msg.content || 'No content',
          sender: msg.messageType === 'leo' ? 'ai' : 
                 msg.messageType === 'system' ? 'system' : 'user',
          timestamp: msg.createdAt, // Keep full ISO timestamp for ChatEngine
          senderName: msg.messageType === 'leo' ? 'LEO AI' : 
                     msg.messageType === 'system' ? 'System' :
                     msg.sender?.firstName ? 
                       `${msg.sender.firstName} ${msg.sender.lastName}` : 'User',
          type: 'text'
        }))
        
        if (append) {
          // Append older messages for infinite scroll (since we're now sorting oldest first)
          setMessages(prev => [...prev, ...uiMessages])
        } else {
          // Replace messages for initial load
          setMessages(uiMessages)
        }
        
        setHasMoreMessages(hasNextPage || false)
        console.log(`✅ Loaded ${uiMessages.length} messages from channel ${channelId} (page ${page})`)
      } else {
        console.warn(`⚠️ Failed to load messages for channel ${channelId}: ${response.status}`)
        // Show a placeholder message indicating the channel is ready for new messages
        if (!append) {
          const placeholderMessage: ChatMessage = {
            id: 'placeholder-1',
            content: `Welcome to #${channelId}! This channel is ready for your messages.`,
            sender: 'system',
            timestamp: new Date().toISOString(),
            senderName: 'System',
            type: 'text'
          }
          setMessages([placeholderMessage])
        }
      }
    } catch (error) {
      console.error('Failed to load channel messages:', error)
      // Show error message in chat
      if (!append) {
        const errorMessage: ChatMessage = {
          id: 'error-1',
          content: 'Unable to load messages at this time. Please try again later.',
          sender: 'system',
          timestamp: new Date().toISOString(),
          senderName: 'System',
          type: 'text'
        }
        setMessages([errorMessage])
      }
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
    if (!content.trim() || !selectedChannel) return

    // Add user message immediately for UI responsiveness
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date().toISOString(),
      senderName: isAuthenticated ? "You" : "Guest",
      type: "text"
    }
    setMessages(prev => [...prev, userMessage])

    try {
      // Step 1: Handle guest session if not authenticated
      let webChatSessionId: string | undefined
      if (!isAuthenticated) {
        const guestSession = getOrCreateGuestSession(currentSpace?.id || '1')
        webChatSessionId = guestSession.sessionId
        
        // Create guest session in database if needed
        await createGuestSessionInDB(guestSession)
        updateGuestSessionActivity()
        
        console.log('👤 Web chat session:', webChatSessionId)
      }

      // Step 2: Create user message in database
      console.log('💾 Saving user message to database...')
      
      // Get or create channel ID for the database
      let channelId: number
      
      // Try to parse the channel ID first
      const parsedChannelId = parseInt(selectedChannel.id)
      if (!isNaN(parsedChannelId)) {
        channelId = parsedChannelId
        console.log(`✅ Using numeric channel ID: ${channelId}`)
      } else {
        // If channel ID is not a number, resolve by name
        console.log(`🔍 Resolving channel name "${selectedChannel.name}" (ID: "${selectedChannel.id}") to numeric ID...`)
        
        // Check if this is a PM channel or use actualChannelName if available
        const channelNameToSearch = selectedChannel.actualChannelName || selectedChannel.id
        
        try {
          let channelsResponse
          if (channelNameToSearch.startsWith('pm_')) {
            // For PM channels, search in all channels
            console.log(`🔍 PM channel detected for message creation: ${channelNameToSearch}`)
            channelsResponse = await fetch(`/api/channels?name=${channelNameToSearch}`)
          } else {
            // For regular channels, search in space channels
            channelsResponse = await fetch(`/api/spaces/${currentSpace?.id || 1}/channels`)
          }
          
          if (channelsResponse.ok) {
            const channelsData = await channelsResponse.json()
            let foundChannel
            
            if (channelNameToSearch.startsWith('pm_')) {
              foundChannel = channelsData.docs?.[0] // PM channel search returns direct match
            } else {
              foundChannel = channelsData.docs?.find((ch: any) => 
                ch.name === selectedChannel.name || ch.name === selectedChannel.id
              )
            }
            
            if (foundChannel) {
              channelId = parseInt(foundChannel.id) || foundChannel.id
              console.log(`✅ Resolved channel "${selectedChannel.name}" to ID: ${channelId}`)
            } else {
              console.warn(`⚠️ Could not find channel "${selectedChannel.name}", using fallback ID 1`)
              channelId = 1 // Fallback to system channel
            }
          } else {
            console.warn('Could not fetch channels, using fallback ID 1')
            channelId = 1 // Fallback to system channel
          }
        } catch (error) {
          console.warn('Could not resolve channel ID, using fallback:', error)
          channelId = 1 // Fallback to system channel
        }
      }
      
      const messageData: any = {
        content: {
          type: 'text',
          text: content,
          metadata: {
            source: 'spaces-chat',
            timestamp: new Date().toISOString(),
            channel: selectedChannel.name
          }
        },
        messageType: 'user',
        space: currentSpace?.id || 1,
        channel: channelId, // Use actual channel ID, not name
        priority: 'normal'
      }

      // Add sender for authenticated users or webChatSessionId for guests
      if (isAuthenticated) {
        messageData.sender = 1 // Current user ID - TODO: Get from auth context
      } else {
        messageData.webChatSessionId = webChatSessionId
      }
      
      const userMessageResponse = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      })

      if (!userMessageResponse.ok) {
        throw new Error(`Failed to save user message: ${userMessageResponse.status}`)
      }

      const savedUserMessage = await userMessageResponse.json()
      console.log('✅ User message saved:', savedUserMessage.id)

      // Step 2: Generate LEO response using web-chat API
      console.log('🤖 Generating LEO response...')
      const leoResponse = await fetch('/api/web-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          spaceId: currentSpace?.id || 1,
          tenantId: currentSpace?.id || 1,
          context: {
            variant: 'dashboard',
            isAuthenticated: true,
            channel: selectedChannel.name,
            messageId: savedUserMessage.id
          },
          userAgent: navigator.userAgent,
          pageUrl: window.location.href
        })
      })

      if (leoResponse.ok) {
        const data = await leoResponse.json()
        console.log('✅ LEO response received:', data.response?.substring(0, 100) + '...')
      } else {
        console.warn('LEO response failed, but user message was saved')
      }

      // Step 3: Reload messages from database to get the complete conversation
      console.log('🔄 Reloading messages from database...')
      if (selectedChannel) {
        await loadChannelMessages(selectedChannel.actualChannelName || selectedChannel.name, 1, false)
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      
      // Remove the optimistic user message and add error message
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Failed to send message. Please try again.",
        sender: "system",
        timestamp: new Date().toISOString(),
        senderName: "System",
        type: "text"
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleCreatePM = (memberId: string) => {
    if (!currentSpace) return
    const member = currentSpace.members.find((m: any) => m.id === memberId)
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
      .map(id => currentSpace?.members.find((m: any) => m.id === id)?.name)
      .filter(Boolean)
      .join(", ")
    
    const groupChannel: Channel = {
      id: `group-${Date.now()}`,
      name: `Group: ${memberNames}`,
      type: "chat", 
      members: ["1", ...memberIds], // Current user + selected members
      isPrivate: true,
    }
    // Channel will be handled by ChannelChooser
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
    
    // Channel will be handled by ChannelChooser
    setSelectedChannel(newChannel)
    setActiveView("chat")
    console.log(`Created channel: ${name} (${type})`)
  }

  const handleUpdateChannel = async (updates: Partial<any>) => {
    if (!selectedChannel) return
    
    try {
      const response = await fetch(`/api/spaces/${currentSpace?.id}/channels/${selectedChannel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        const updatedChannel = await response.json()
        setSelectedChannel(prev => prev ? { ...prev, ...updates } : null)
        console.log('Channel updated:', updatedChannel)
      }
    } catch (error) {
      console.error('Failed to update channel:', error)
    }
  }

  const handleAddChannelMember = async (memberId: string, role: string) => {
    if (!selectedChannel) return
    
    try {
      const response = await fetch(`/api/spaces/${currentSpace?.id}/channels/${selectedChannel.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role })
      })
      
      if (response.ok) {
        setSelectedChannel(prev => prev ? {
          ...prev,
          members: [...prev.members, memberId]
        } : null)
        console.log('Member added to channel')
      }
    } catch (error) {
      console.error('Failed to add member to channel:', error)
    }
  }

  const handleRemoveChannelMember = async (memberId: string) => {
    if (!selectedChannel) return
    
    try {
      const response = await fetch(`/api/spaces/${currentSpace?.id}/channels/${selectedChannel.id}/members/${memberId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setSelectedChannel(prev => prev ? {
          ...prev,
          members: prev.members.filter(id => id !== memberId)
        } : null)
        console.log('Member removed from channel')
      }
    } catch (error) {
      console.error('Failed to remove member from channel:', error)
    }
  }

  const handleUpdateChannelMemberRole = async (memberId: string, role: string) => {
    if (!selectedChannel) return
    
    try {
      const response = await fetch(`/api/spaces/${currentSpace?.id}/channels/${selectedChannel.id}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })
      
      if (response.ok) {
        console.log('Member role updated in channel')
      }
    } catch (error) {
      console.error('Failed to update member role in channel:', error)
    }
  }

  const handleDeleteChannel = async () => {
    if (!selectedChannel) return
    
    try {
      const response = await fetch(`/api/spaces/${currentSpace?.id}/channels/${selectedChannel.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setSelectedChannel(null)
        console.log('Channel deleted')
      }
    } catch (error) {
      console.error('Failed to delete channel:', error)
    }
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
            <p className="text-muted-foreground">Chat engine connecting......</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)] flex bg-background rounded-lg border overflow-hidden">
      {/* Show ChannelChooser only for authenticated users */}
      {isAuthenticated && currentSpace && (
        <ChannelChooser
          currentSpace={currentSpace}
          channels={[]} // ChannelChooser will load its own channels
          selectedChannel={selectedChannel}
          onSelectChannel={(channel) => {
            console.log(`📡 ChannelChooser selected channel:`, channel)
            setSelectedChannel(channel)
            // Load messages for the new channel - use actualChannelName for PM channels
            const channelNameForApi = channel.actualChannelName || channel.name
            loadChannelMessages(channelNameForApi, 1, false)
          }}
          onCreatePM={handleCreatePM}
          onCreateGroupChat={handleCreateGroupChat}
          onCreateChannel={handleCreateChannel}
        />
      )}
      
      {/* Unauthenticated users get a simplified LEO-only interface */}
      {!isAuthenticated && webChatSession && (
        <div className="w-80 border-r bg-background flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">LEO</span>
              </div>
              <div>
                <h2 className="font-semibold">LEO AI Assistant</h2>
                <p className="text-sm text-muted-foreground">
                  Web Chat Session
                </p>
              </div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground">
                You're chatting with LEO AI
                <br />
                <span className="text-xs">Session: {webChatSession.sessionId}</span>
              </p>
            </div>
          </div>
        </div>
      )}
      
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
                  messages={messages}
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
                messages={messages.map(transformChatMessageToMessage)}
                spaceMembers={currentSpace?.members || []}
                currentUser={{
                  id: '1', // TODO: Get from auth context
                  name: 'Kenneth Courtney',
                  role: 'admin'
                }}
                onSendMessage={handleSendMessage}
                onUpdateChannel={handleUpdateChannel}
                onAddMember={handleAddChannelMember}
                onRemoveMember={handleRemoveChannelMember}
                onUpdateMemberRole={handleUpdateChannelMemberRole}
                onDeleteChannel={handleDeleteChannel}
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
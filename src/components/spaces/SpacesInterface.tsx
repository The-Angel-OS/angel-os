"use client"

import { useState, useEffect } from "react"
// Missing layout components - using placeholder
// import { ShadcnSpacesLayout } from "./ShadcnSpacesLayout"
// import { ShadcnChannelContent } from "./ShadcnChannelContent"
import { cn } from "@/utilities/ui"
import type { Space, Message, User as PayloadUser } from "@/payload-types"

// Local Channel interface until we have a proper Channels collection
interface Channel {
  id: string
  name: string
  type: 'text' | 'voice' | 'video' | 'notes' | 'dashboard' | 'settings'
  description?: string
  agentMembers?: string[] // Array of agent IDs that are members of this channel
  widgets?: ChannelWidget[] // For dashboard channels
  noteContent?: any // For notes channels (Lexical editor state)
  settingsType?: 'space' | 'user' | 'tenant' | 'system' // For settings channels
}

interface ChannelWidget {
  id: string
  type: 'sql' | 'analytics' | 'chart' | 'kpi' | 'notes' | 'calendar'
  title: string
  position: { x: number; y: number; w: number; h: number }
  config: any
}

// Extended Space interface for missing properties
interface ExtendedSpace extends Space {
  channels?: Channel[]
}

interface SpacesInterfaceProps {
  initialSpaces?: ExtendedSpace[]
  currentUser?: PayloadUser
  initialActiveSpaceId?: string | number
  className?: string
}

export function SpacesInterface({
  initialSpaces = [],
  currentUser,
  initialActiveSpaceId,
  className
}: SpacesInterfaceProps) {
  // State management
  const [spaces, setSpaces] = useState<ExtendedSpace[]>(initialSpaces)
  const [activeSpace, setActiveSpace] = useState<ExtendedSpace | undefined>()
  const [activeChannel, setActiveChannel] = useState<Channel | undefined>()
  const [messages, setMessages] = useState<Message[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [showLeoPanel, setShowLeoPanel] = useState(true)

    // Initialize with specified space or first space if available
  useEffect(() => {
    if (spaces.length > 0 && !activeSpace) {
      let targetSpace = spaces[0]

      // If initialActiveSpaceId is provided, try to find that space
      if (initialActiveSpaceId) {
        const foundSpace = spaces.find(s => s.id === initialActiveSpaceId)
        if (foundSpace) {
          targetSpace = foundSpace
        }
      }

      if (targetSpace) {
        // Add mock channels with agent members for testing
        if (!targetSpace.channels || targetSpace.channels.length === 0) {
          targetSpace.channels = [
            // Chat Channels
            {
              id: 'general',
              name: 'general',
              type: 'text',
              description: 'General discussion channel',
              agentMembers: ['leo-ai'],
            },
            {
              id: 'system',
              name: 'system',
              type: 'text',
              description: 'System communications and Leo AI interactions',
              agentMembers: ['leo-ai'],
            },
            {
              id: 'random',
              name: 'random',
              type: 'text',
              description: 'Random conversations',
            },
            // Notes Channels
            {
              id: 'team-notes',
              name: 'team-notes',
              type: 'notes',
              description: 'Shared team documentation and notes',
              noteContent: null, // Will be populated with Lexical editor state
            },
            {
              id: 'project-docs',
              name: 'project-docs',
              type: 'notes',
              description: 'Project documentation and specifications',
              noteContent: null,
            },
            // Dashboard Channels
            {
              id: 'analytics-dashboard',
              name: 'analytics',
              type: 'dashboard',
              description: 'Business analytics and KPI dashboard',
              widgets: [
                {
                  id: 'revenue-chart',
                  type: 'chart',
                  title: 'Monthly Revenue',
                  position: { x: 0, y: 0, w: 6, h: 4 },
                  config: { chartType: 'line', dataSource: 'revenue' }
                },
                {
                  id: 'user-count',
                  type: 'kpi',
                  title: 'Active Users',
                  position: { x: 6, y: 0, w: 3, h: 2 },
                  config: { metric: 'activeUsers', format: 'number' }
                }
              ]
            },
            {
              id: 'operations-dashboard',
              name: 'operations',
              type: 'dashboard',
              description: 'Operational metrics and system health',
              widgets: [
                {
                  id: 'system-health',
                  type: 'kpi',
                  title: 'System Health',
                  position: { x: 0, y: 0, w: 3, h: 2 },
                  config: { metric: 'systemHealth', format: 'percentage' }
                }
              ]
            },
            // Settings Channels
            {
              id: 'space-settings',
              name: 'settings',
              type: 'settings',
              description: 'Space configuration and preferences',
              settingsType: 'space'
            }
          ]
        }

        setActiveSpace(targetSpace)

        // Auto-select first text channel
        const firstTextChannel = targetSpace.channels?.find(ch => ch.type === 'text')
        if (firstTextChannel) {
          setActiveChannel(firstTextChannel)
        }
      }
    }
  }, [spaces, activeSpace, initialActiveSpaceId])

  // Load messages when channel changes
  useEffect(() => {
    if (activeChannel?.id) {
      loadMessagesForChannel(activeChannel.id)
    }
  }, [activeChannel])

  const loadSpaces = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/spaces', {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setSpaces(data.docs || [])
      }
    } catch (error) {
      console.error('Failed to load spaces:', error)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessagesForChannel = async (channelId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/messages?where[channel][equals]=${channelId}&sort=-createdAt&limit=50`, {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setMessages((data.docs || []).reverse()) // Reverse to show oldest first
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSpaceSelect = (space: ExtendedSpace) => {
    setActiveSpace(space)

    // Auto-select first text channel in the space
    const firstTextChannel = space.channels?.find(ch => ch.type === 'text')
    if (firstTextChannel) {
      setActiveChannel(firstTextChannel)
    } else {
      setActiveChannel(undefined)
    }
  }

  const handleChannelSelect = (space: ExtendedSpace, channel: Channel) => {
    setActiveSpace(space)
    setActiveChannel(channel)
  }

  const handleSendMessage = async (content: string, channelId: string) => {
    if (!currentUser || !activeSpace) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: [
            {
              type: 'paragraph',
              children: [{ text: content }]
            }
          ],
          summary: content,
          channel: channelId,
          space: activeSpace.id,
          sender: currentUser.id, // Fixed: use sender instead of author
          businessMetadata: {
            department: 'general',
            priority: 'normal',
          },
          embeds: {
            media: []
          }
        }),
      })

      if (response.ok) {
        const newMessage = await response.json()
        setMessages(prev => [...prev, newMessage])
      } else {
        console.error('Failed to send message:', response.statusText)
        setIsConnected(false)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      setIsConnected(false)
    }
  }

  const handleFileUpload = async (files: FileList, channelId: string) => {
    if (!currentUser || !activeSpace) return

    // Handle file upload logic here
    // This would typically involve uploading to Payload's media endpoint
    // and then creating a message with the file attachment
    console.log('File upload not yet implemented:', files)
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Load spaces on component mount
  useEffect(() => {
    if (initialSpaces.length === 0) {
      loadSpaces()
    }
  }, [initialSpaces.length])

  return (
    <div className="h-full">
      {/* Placeholder for missing ShadcnSpacesLayout and ShadcnChannelContent */}
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Spaces Interface</h3>
          <p className="text-sm">Layout components not yet implemented</p>
          <p className="text-xs mt-2">Using existing UniversalChatControl instead</p>
        </div>
      </div>
    </div>
  )
}

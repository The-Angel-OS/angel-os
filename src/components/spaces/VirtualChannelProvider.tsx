"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface Channel {
  id: string | number
  name: string
  type: 'chat' | 'project' | 'files' | 'notes' | 'livekit' | 'pm'
  spaceId: string | number
  isVirtual: boolean
  isSystem: boolean
  memberCount?: number
  lastActivity?: string
  status?: 'online' | 'offline' | 'away' | 'busy' // For PM channels
  tabs?: string[] // Dynamic tabs enabled for this channel
  metadata?: Record<string, any>
  createdAt?: string
  updatedAt?: string
}

export interface VirtualChannel extends Omit<Channel, 'isVirtual'> {
  isVirtual: true
  onAccess: () => Promise<Channel> // Function to create the actual channel
}

interface VirtualChannelContextType {
  channels: (Channel | VirtualChannel)[]
  activeChannel: Channel | null
  isLoading: boolean
  error: string | null
  
  // Channel operations
  accessChannel: (channelId: string | number) => Promise<Channel>
  createChannel: (data: Partial<Channel>) => Promise<Channel>
  updateChannel: (channelId: string | number, data: Partial<Channel>) => Promise<Channel>
  deleteChannel: (channelId: string | number) => Promise<void>
  
  // Virtual channel operations
  addVirtualChannel: (channel: VirtualChannel) => void
  removeVirtualChannel: (channelId: string | number) => void
  
  // Space operations
  loadChannelsForSpace: (spaceId: string | number) => Promise<void>
  
  // Active channel management
  setActiveChannel: (channel: Channel | null) => void
}

const VirtualChannelContext = createContext<VirtualChannelContextType | undefined>(undefined)

interface VirtualChannelProviderProps {
  children: ReactNode
  spaceId?: string | number
}

export function VirtualChannelProvider({ children, spaceId }: VirtualChannelProviderProps) {
  const [channels, setChannels] = useState<(Channel | VirtualChannel)[]>([])
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load channels for a specific space
  const loadChannelsForSpace = useCallback(async (targetSpaceId: string | number) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/spaces/${targetSpaceId}/channels`)
      if (!response.ok) throw new Error('Failed to load channels')

      const data = await response.json()
      const actualChannels: Channel[] = data.docs || []

      // Create virtual channels for common types
      const virtualChannels: VirtualChannel[] = [
        // Virtual PM channels for space members
        ...await createVirtualPMChannels(targetSpaceId),
        
        // Virtual project channels
        {
          id: `virtual-project-${targetSpaceId}`,
          name: 'New Project',
          type: 'project',
          spaceId: targetSpaceId,
          isVirtual: true,
          isSystem: false,
          tabs: ['chat', 'project', 'tasks', 'files'],
          onAccess: () => createProjectChannel(targetSpaceId)
        },
        
        // Virtual files channel
        {
          id: `virtual-files-${targetSpaceId}`,
          name: 'File Sharing',
          type: 'files',
          spaceId: targetSpaceId,
          isVirtual: true,
          isSystem: false,
          tabs: ['chat', 'files'],
          onAccess: () => createFilesChannel(targetSpaceId)
        }
      ]

      setChannels([...actualChannels, ...virtualChannels])
      
      // Auto-select system channel or first available channel
      if (actualChannels.length > 0) {
        const systemChannel = actualChannels.find(ch => ch.isSystem || ch.type === 'chat')
        const defaultChannel = systemChannel || actualChannels[0]
        setActiveChannel(defaultChannel || null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load channels')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Access a channel (create if virtual)
  const accessChannel = useCallback(async (channelId: string | number): Promise<Channel> => {
    const channel = channels.find(c => c.id === channelId)
    
    if (!channel) {
      throw new Error('Channel not found')
    }

    // If it's a virtual channel, create the actual channel
    if ('isVirtual' in channel && channel.isVirtual) {
      try {
        setIsLoading(true)
        const actualChannel = 'onAccess' in channel ? await channel.onAccess() : channel
        
        // Replace virtual channel with actual channel
        setChannels(prev => prev.map(c => 
          c.id === channelId ? actualChannel : c
        ))
        
        setActiveChannel(actualChannel)
        return actualChannel
      } catch (err) {
        throw new Error('Failed to create channel')
      } finally {
        setIsLoading(false)
      }
    }

    // It's already an actual channel
    setActiveChannel(channel as Channel)
    return channel as Channel
  }, [channels])

  // Create a new channel
  const createChannel = useCallback(async (data: Partial<Channel>): Promise<Channel> => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          spaceId: data.spaceId || spaceId,
          isVirtual: false,
          tabs: data.tabs || ['chat']
        })
      })

      if (!response.ok) throw new Error('Failed to create channel')

      const newChannel = await response.json()
      setChannels(prev => [newChannel, ...prev])
      
      return newChannel
    } catch (err) {
      throw new Error('Failed to create channel')
    } finally {
      setIsLoading(false)
    }
  }, [spaceId])

  // Update channel
  const updateChannel = useCallback(async (channelId: string | number, data: Partial<Channel>): Promise<Channel> => {
    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to update channel')

      const updatedChannel = await response.json()
      setChannels(prev => prev.map(c => 
        c.id === channelId ? updatedChannel : c
      ))

      if (activeChannel?.id === channelId) {
        setActiveChannel(updatedChannel)
      }

      return updatedChannel
    } catch (err) {
      throw new Error('Failed to update channel')
    }
  }, [activeChannel])

  // Delete channel
  const deleteChannel = useCallback(async (channelId: string | number): Promise<void> => {
    try {
      const response = await fetch(`/api/channels/${channelId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete channel')

      setChannels(prev => prev.filter(c => c.id !== channelId))
      
      if (activeChannel?.id === channelId) {
        setActiveChannel(null)
      }
    } catch (err) {
      throw new Error('Failed to delete channel')
    }
  }, [activeChannel])

  // Add virtual channel
  const addVirtualChannel = useCallback((channel: VirtualChannel) => {
    setChannels(prev => [...prev, channel])
  }, [])

  // Remove virtual channel
  const removeVirtualChannel = useCallback((channelId: string | number) => {
    setChannels(prev => prev.filter(c => c.id !== channelId))
  }, [])

  const value: VirtualChannelContextType = {
    channels,
    activeChannel,
    isLoading,
    error,
    accessChannel,
    createChannel,
    updateChannel,
    deleteChannel,
    addVirtualChannel,
    removeVirtualChannel,
    loadChannelsForSpace,
    setActiveChannel
  }

  return (
    <VirtualChannelContext.Provider value={value}>
      {children}
    </VirtualChannelContext.Provider>
  )
}

// Hook to use the virtual channel context
export function useVirtualChannels() {
  const context = useContext(VirtualChannelContext)
  if (context === undefined) {
    throw new Error('useVirtualChannels must be used within a VirtualChannelProvider')
  }
  return context
}

// Helper functions for creating virtual channels

async function createVirtualPMChannels(spaceId: string | number): Promise<VirtualChannel[]> {
  try {
    // Get space members to create virtual PM channels
    const response = await fetch(`/api/spaces/${spaceId}/members`)
    if (!response.ok) return []
    
    const members = await response.json()
    
    return members.docs?.map((member: any) => ({
      id: `virtual-pm-${member.id}`,
      name: `${member.firstName} ${member.lastName}`,
      type: 'pm' as const,
      spaceId,
      isVirtual: true,
      isSystem: false,
      status: member.status || 'offline',
      tabs: ['chat'],
      metadata: { userId: member.id, userEmail: member.email },
      onAccess: () => createPMChannel(spaceId, member.id)
    })) || []
  } catch {
    return []
  }
}

async function createProjectChannel(spaceId: string | number): Promise<Channel> {
  const response = await fetch('/api/channels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Project Channel',
      type: 'project',
      spaceId,
      isVirtual: false,
      isSystem: false,
      tabs: ['chat', 'project', 'tasks', 'files']
    })
  })

  if (!response.ok) throw new Error('Failed to create project channel')
  return response.json()
}

async function createFilesChannel(spaceId: string | number): Promise<Channel> {
  const response = await fetch('/api/channels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'File Sharing',
      type: 'files',
      spaceId,
      isVirtual: false,
      isSystem: false,
      tabs: ['chat', 'files']
    })
  })

  if (!response.ok) throw new Error('Failed to create files channel')
  return response.json()
}

async function createPMChannel(spaceId: string | number, userId: string | number): Promise<Channel> {
  const response = await fetch('/api/channels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `PM-${userId}`,
      type: 'pm',
      spaceId,
      isVirtual: false,
      isSystem: false,
      tabs: ['chat'],
      metadata: { userId }
    })
  })

  if (!response.ok) throw new Error('Failed to create PM channel')
  return response.json()
}

export default VirtualChannelProvider

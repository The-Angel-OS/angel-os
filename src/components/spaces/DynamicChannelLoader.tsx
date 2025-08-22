"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Hash, 
  Plus, 
  Loader2, 
  AlertCircle,
  Bot,
  Sparkles
} from 'lucide-react'
import { ChatChannelContent } from './channels/ChatChannelContent'
import { NotesChannelContent } from './channels/NotesChannelContent'
import { DashboardChannelContent } from './channels/DashboardChannelContent'
import { CalendarChannelContent } from './channels/CalendarChannelContent'
import { CRMChannelContent } from './channels/CRMChannelContent'
import { FilesChannelContent } from './channels/FilesChannelContent'
import { AnalyticsChannelContent } from './channels/AnalyticsChannelContent'

interface DynamicChannelLoaderProps {
  spaceId: string
  channelId: string
  currentUser: any
}

interface ChannelConfig {
  id: string
  name: string
  type: 'chat' | 'notes' | 'calendar' | 'crm' | 'analytics' | 'files' | 'dashboard'
  displayMode: 'messages' | 'notes' | 'cards' | 'grid' | 'calendar'
  liveKitEnabled: boolean
  description?: string
  createdBy?: 'user' | 'ai'
  aiGenerated?: boolean
  exists: boolean
}

// Default channel configurations
const defaultChannels: Record<string, ChannelConfig> = {
  'general': { 
    id: 'general', 
    name: 'general', 
    type: 'chat', 
    displayMode: 'messages', 
    liveKitEnabled: true,
    description: 'General discussion and announcements',
    exists: true
  },
  'announcements': { 
    id: 'announcements', 
    name: 'announcements', 
    type: 'chat', 
    displayMode: 'messages', 
    liveKitEnabled: false,
    description: 'Official announcements and updates',
    exists: true
  },
  'project-notes': { 
    id: 'project-notes', 
    name: 'project-notes', 
    type: 'notes', 
    displayMode: 'notes', 
    liveKitEnabled: false,
    description: 'Collaborative project documentation',
    exists: true
  },
  'team-calendar': { 
    id: 'team-calendar', 
    name: 'team-calendar', 
    type: 'calendar', 
    displayMode: 'calendar', 
    liveKitEnabled: false,
    description: 'Team events and scheduling',
    exists: true
  },
  'customer-pipeline': { 
    id: 'customer-pipeline', 
    name: 'customer-pipeline', 
    type: 'crm', 
    displayMode: 'cards', 
    liveKitEnabled: false,
    description: 'Customer relationship management',
    exists: true
  },
  'business-analytics': { 
    id: 'business-analytics', 
    name: 'business-analytics', 
    type: 'analytics', 
    displayMode: 'grid', 
    liveKitEnabled: false,
    description: 'Business intelligence and reporting',
    exists: true
  },
  'shared-files': { 
    id: 'shared-files', 
    name: 'shared-files', 
    type: 'files', 
    displayMode: 'grid', 
    liveKitEnabled: false,
    description: 'Shared documents and media',
    exists: true
  },
  'dashboard': { 
    id: 'dashboard', 
    name: 'dashboard', 
    type: 'dashboard', 
    displayMode: 'cards', 
    liveKitEnabled: false,
    description: 'Business intelligence dashboard',
    exists: true
  },
  'leo-chat': { 
    id: 'leo-chat', 
    name: 'leo-chat', 
    type: 'chat', 
    displayMode: 'messages', 
    liveKitEnabled: true,
    description: 'Direct communication with Leo AI',
    createdBy: 'ai',
    aiGenerated: true,
    exists: true
  }
}

export function DynamicChannelLoader({ spaceId, channelId, currentUser }: DynamicChannelLoaderProps) {
  const [channelConfig, setChannelConfig] = useState<ChannelConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadOrCreateChannel()
  }, [spaceId, channelId])

  const loadOrCreateChannel = async () => {
    setLoading(true)
    setError(null)

    try {
      // First check if it's a default channel
      if (defaultChannels[channelId]) {
        setChannelConfig(defaultChannels[channelId])
        setLoading(false)
        return
      }

      // Try to load from Payload CMS (stub for now)
      const existingChannel = await loadChannelFromCMS(spaceId, channelId)
      if (existingChannel) {
        setChannelConfig(existingChannel)
        setLoading(false)
        return
      }

      // Channel doesn't exist - show creation prompt
      setChannelConfig({
        id: channelId,
        name: channelId,
        type: 'chat', // Default to chat
        displayMode: 'messages',
        liveKitEnabled: false,
        description: `Dynamic channel: ${channelId}`,
        exists: false
      })
      setLoading(false)

    } catch (err) {
      console.error('Error loading channel:', err)
      setError('Failed to load channel')
      setLoading(false)
    }
  }

  const loadChannelFromCMS = async (spaceId: string, channelId: string): Promise<ChannelConfig | null> => {
    // TODO: Replace with actual Payload CMS call
    // const response = await fetch(`/api/spaces/${spaceId}/channels/${channelId}`)
    // if (response.ok) {
    //   const data = await response.json()
    //   return data.channel
    // }
    return null
  }

  const createChannel = async (type: ChannelConfig['type'] = 'chat') => {
    setCreating(true)
    try {
      // TODO: Replace with actual Payload CMS call
      // const response = await fetch(`/api/spaces/${spaceId}/channels`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: channelId,
      //     type,
      //     space: spaceId,
      //     createdBy: currentUser.id
      //   })
      // })

      // For now, just create the config locally
      const newChannel: ChannelConfig = {
        id: channelId,
        name: channelId,
        type,
        displayMode: type === 'notes' ? 'notes' : 
                     type === 'calendar' ? 'calendar' :
                     type === 'files' ? 'grid' :
                     type === 'analytics' ? 'grid' :
                     type === 'crm' ? 'cards' :
                     type === 'dashboard' ? 'cards' : 'messages',
        liveKitEnabled: type === 'chat',
        description: `New ${type} channel: ${channelId}`,
        createdBy: 'user',
        exists: true
      }

      setChannelConfig(newChannel)
      setCreating(false)

    } catch (err) {
      console.error('Error creating channel:', err)
      setError('Failed to create channel')
      setCreating(false)
    }
  }

  const renderChannelContent = () => {
    if (!channelConfig) return null

    const commonProps = {
      spaceId,
      channelId,
      space: { id: spaceId, name: spaceId, description: `Space: ${spaceId}` },
      currentUser,
      liveKitEnabled: channelConfig.liveKitEnabled,
    }

    switch (channelConfig.type) {
      case 'chat':
        return <ChatChannelContent {...commonProps} />
      case 'notes':
        return <NotesChannelContent {...commonProps} />
      case 'dashboard':
        return <DashboardChannelContent {...commonProps} />
      case 'calendar':
        return <CalendarChannelContent {...commonProps} />
      case 'crm':
        return <CRMChannelContent {...commonProps} />
      case 'files':
        return <FilesChannelContent {...commonProps} />
      case 'analytics':
        return <AnalyticsChannelContent {...commonProps} />
      default:
        return <ChatChannelContent {...commonProps} />
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Channel Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadOrCreateChannel}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!channelConfig?.exists) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5" />
              Create Channel: {channelId}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This channel doesn't exist yet. Choose a type to create it:
            </p>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => createChannel('chat')} 
                disabled={creating}
                variant="outline"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Chat'}
              </Button>
              <Button 
                onClick={() => createChannel('notes')} 
                disabled={creating}
                variant="outline"
              >
                Notes
              </Button>
              <Button 
                onClick={() => createChannel('dashboard')} 
                disabled={creating}
                variant="outline"
              >
                Dashboard
              </Button>
              <Button 
                onClick={() => createChannel('files')} 
                disabled={creating}
                variant="outline"
              >
                Files
              </Button>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Leo AI can also create channels dynamically during conversations
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {channelConfig.aiGenerated && (
        <div className="bg-primary/10 border-b px-4 py-2">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>AI-Generated Channel</span>
            <Badge variant="outline" className="text-xs">
              {channelConfig.type}
            </Badge>
          </div>
        </div>
      )}
      
      {renderChannelContent()}
    </div>
  )
}

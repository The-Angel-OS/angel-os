'use client'

import React from 'react'
import type { Space, User as PayloadUser } from '@/payload-types'
// Using existing chat components instead of missing SpacesChatArea
import { ChatEngine } from '@/components/chat/ChatEngine'

interface Channel {
  id: string
  name: string
  type: string
  description?: string
  agentMembers?: string[]
}

interface ChatControlProps {
  space: Space | null
  channel: Channel
  messages: any[]
  currentUser: PayloadUser
  onSendMessage: (content: string, files?: File[]) => Promise<void>
  onFileUpload: (files: File[]) => Promise<void>
  isConnected: boolean
}

export function ChatControl({
  space,
  channel,
  messages,
  currentUser,
  onSendMessage,
  onFileUpload,
  isConnected
}: ChatControlProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Channel Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">#</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">{channel.name}</h1>
            {channel.description && (
              <p className="text-sm text-muted-foreground">{channel.description}</p>
            )}
          </div>
          {channel.agentMembers && channel.agentMembers.length > 0 && (
            <div className="flex items-center space-x-1 ml-auto">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">AI Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ChatEngine
          channels={[{
            id: channel.id,
            name: channel.name,
            type: "chat",
            members: [currentUser.id.toString()]
          }]}
          activeChannel={{
            id: channel.id,
            name: channel.name,
            type: "chat",
            members: [currentUser.id.toString()]
          }}
          messages={[]}
          currentUser={{
            id: currentUser.id.toString(),
            name: `${currentUser.firstName} ${currentUser.lastName}`,
            avatar: '',
            status: 'online',
            role: 'member'
          }}
          onSendMessage={async (content, channelId) => {
            console.log('Sending message:', content, 'to channel:', channelId)
            // TODO: Implement actual message sending
          }}
        />
      </div>
    </div>
  )
}













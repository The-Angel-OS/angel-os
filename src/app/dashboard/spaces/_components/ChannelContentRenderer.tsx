"use client"

import { ChatArea, type Message } from "./ChatArea"
import { ChannelSettings } from "./ChannelSettings"
import type { Channel, SpaceMember } from "./ChannelChooser"

interface ChannelContentRendererProps {
  channel: Channel
  activeView: "chat" | "livekit" | "files" | "notes" | "project" | "timetrack" | "settings"
  messages: Message[]
  spaceMembers?: SpaceMember[]
  currentUser?: { id: string; name: string; role: string }
  onSendMessage: (content: string) => void
  onUpdateChannel?: (updates: Partial<Channel>) => void
  onAddMember?: (memberId: string, role: string) => void
  onRemoveMember?: (memberId: string) => void
  onUpdateMemberRole?: (memberId: string, role: string) => void
  onDeleteChannel?: () => void
  onLoadMore?: () => Promise<void>
  hasMore?: boolean
  isLoading?: boolean
  className?: string
}

export function ChannelContentRenderer({
  channel,
  activeView,
  messages,
  spaceMembers = [],
  currentUser,
  onSendMessage,
  onUpdateChannel,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
  onDeleteChannel,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className = ""
}: ChannelContentRendererProps) {
  
  // Convert channel to contact format for ChatArea compatibility
  const channelAsContact = {
    id: channel.id,
    name: channel.name,
    avatar: "/placeholder.svg?height=40&width=40",
    lastMessage: "",
    time: channel.lastActivity || "",
    online: true,
  }

  const renderContent = () => {
    switch (activeView) {
      case "chat":
        return (
          <ChatArea
            selectedContact={channelAsContact}
            messages={messages}
            onSendMessage={onSendMessage}
            onLoadMore={onLoadMore}
            hasMore={hasMore}
            isLoading={isLoading}
            className="flex-1"
          />
        )
      
      case "livekit":
        return (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <span className="text-2xl">📹</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Video Call</h3>
              <p className="text-muted-foreground">Video calling feature coming soon</p>
            </div>
          </div>
        )
      
      case "files":
        return (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <span className="text-2xl">📁</span>
              </div>
              <h3 className="text-lg font-medium mb-2">File Sharing</h3>
              <p className="text-muted-foreground">File management feature coming soon</p>
            </div>
          </div>
        )
      
      case "notes":
        return (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Collaborative Notes</h3>
              <p className="text-muted-foreground">Note-taking feature coming soon</p>
            </div>
          </div>
        )
      
      case "project":
        return (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Project Management</h3>
              <p className="text-muted-foreground">Project tools coming soon</p>
            </div>
          </div>
        )
      
      case "timetrack":
        return (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Time Tracking</h3>
              <p className="text-muted-foreground">Time tracking feature coming soon</p>
            </div>
          </div>
        )
      
      case "settings":
        return currentUser ? (
          <div className="flex-1 overflow-y-auto">
            <ChannelSettings
              channel={channel}
              spaceMembers={spaceMembers}
              currentUser={currentUser}
              onUpdateChannel={onUpdateChannel || (() => {})}
              onAddMember={onAddMember || (() => {})}
              onRemoveMember={onRemoveMember || (() => {})}
              onUpdateMemberRole={onUpdateMemberRole || (() => {})}
              onDeleteChannel={onDeleteChannel || (() => {})}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Settings</h3>
              <p className="text-muted-foreground">Please log in to access channel settings</p>
            </div>
          </div>
        )
      
      default:
        return (
          <ChatArea
            selectedContact={channelAsContact}
            messages={messages}
            onSendMessage={onSendMessage}
            onLoadMore={onLoadMore}
            hasMore={hasMore}
            isLoading={isLoading}
            className="flex-1"
          />
        )
    }
  }

  return (
    <div className={`flex-1 flex flex-col ${className}`}>
      {renderContent()}
    </div>
  )
}


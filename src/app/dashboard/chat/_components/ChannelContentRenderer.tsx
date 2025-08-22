"use client"

import { MessagesList } from "./MessagesList"
import { MessageInput } from "./MessageInput"
import type { Message } from "./ChatArea"
import type { Channel } from "./ChannelChooser"

interface ChannelContentRendererProps {
  channel: Channel
  activeView: "chat" | "livekit" | "files" | "notes" | "project" | "timetrack"
  messages: Message[]
  onSendMessage: (content: string) => void
  onLoadMore?: () => Promise<void>
  hasMore?: boolean
  isLoading?: boolean
  className?: string
}

// Placeholder components for different channel types
function LiveKitView({ channel }: { channel: Channel }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted/20">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
          <span className="text-2xl">📹</span>
        </div>
        <h3 className="text-lg font-medium mb-2">LiveKit Video Channel</h3>
        <p className="text-muted-foreground">Video calls and screen sharing for {channel.name}</p>
        <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Start Video Call
        </button>
      </div>
    </div>
  )
}

function FilesView({ channel }: { channel: Channel }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted/20">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/10 rounded-full flex items-center justify-center">
          <span className="text-2xl">📁</span>
        </div>
        <h3 className="text-lg font-medium mb-2">File Manager</h3>
        <p className="text-muted-foreground">
          Sophisticated file management for {channel.name}
          <br />
          All files are messages filtered by type
        </p>
      </div>
    </div>
  )
}

function NotesView({ channel }: { channel: Channel }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted/20">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/10 rounded-full flex items-center justify-center">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-lg font-medium mb-2">Hierarchical Notes</h3>
        <p className="text-muted-foreground">
          Lexical notepads with embedded media
          <br />
          Images, videos, PDFs, ZIPs, AR.js, whatever
        </p>
      </div>
    </div>
  )
}

function ProjectView({ channel }: { channel: Channel }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted/20">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/10 rounded-full flex items-center justify-center">
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="text-lg font-medium mb-2">Project Management</h3>
        <p className="text-muted-foreground">
          Project tracking and collaboration for {channel.name}
          <br />
          Integrated with time tracking and status updates
        </p>
      </div>
    </div>
  )
}

function TimeTrackView({ channel }: { channel: Channel }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted/20">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center">
          <span className="text-2xl">⏱️</span>
        </div>
        <h3 className="text-lg font-medium mb-2">Time Tracking</h3>
        <p className="text-muted-foreground">
          AI-powered project time tracking
          <br />
          Login time tracking with status switcher
        </p>
      </div>
    </div>
  )
}

export function ChannelContentRenderer({ 
  channel, 
  activeView, 
  messages, 
  onSendMessage,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  className = "" 
}: ChannelContentRendererProps) {
  
  // Render different interfaces based on active view
  const renderContent = () => {
    switch (activeView) {
      case "livekit":
        return <LiveKitView channel={channel} />
      case "files":
        return <FilesView channel={channel} />
      case "notes":
        return <NotesView channel={channel} />
      case "project":
        return <ProjectView channel={channel} />
      case "timetrack":
        return <TimeTrackView channel={channel} />
      case "chat":
      default:
        return (
          <div className="flex-1 flex flex-col">
            <MessagesList 
              messages={messages} 
              onLoadMore={onLoadMore}
              hasMore={hasMore}
              isLoading={isLoading}
            />
            <MessageInput onSendMessage={onSendMessage} />
          </div>
        )
    }
  }

  return (
    <div className={`flex-1 flex flex-col ${className}`}>
      {renderContent()}
    </div>
  )
}


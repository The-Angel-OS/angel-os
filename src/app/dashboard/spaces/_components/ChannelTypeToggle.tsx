"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Video, 
  FileText, 
  StickyNote, 
  FolderOpen,
  Clock,
  Users,
  Settings
} from "lucide-react"
import type { Channel } from "./ChannelChooser"

interface ChannelTypeToggleProps {
  channel: Channel
  activeView: "chat" | "livekit" | "files" | "notes" | "project" | "timetrack" | "settings"
  onViewChange: (view: string) => void
  className?: string
}

export function ChannelTypeToggle({ 
  channel, 
  activeView, 
  onViewChange, 
  className = "" 
}: ChannelTypeToggleProps) {
  
  const getAvailableViews = (channelType: string) => {
    const baseViews = [
      { id: "chat", label: "Chat", icon: MessageSquare },
      { id: "livekit", label: "Video", icon: Video },
    ]

    let typeSpecificViews: { id: string; label: string; icon: any }[] = []
    switch (channelType) {
      case "files":
        typeSpecificViews = [
          { id: "files", label: "Files", icon: FileText },
        ]
        break
      case "notes":
        typeSpecificViews = [
          { id: "notes", label: "Notes", icon: StickyNote },
        ]
        break
      case "project":
        typeSpecificViews = [
          { id: "project", label: "Project", icon: FolderOpen },
          { id: "timetrack", label: "Time", icon: Clock },
        ]
        break
    }

    // Always add settings tab at the end
    return [
      ...baseViews,
      ...typeSpecificViews,
      { id: "settings", label: "Settings", icon: Settings },
    ]
  }

  const availableViews = getAvailableViews(channel.type)

  return (
    <div className={`border-b bg-background/50 ${className}`}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {channel.type} channel
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            {channel.members.length} member{channel.members.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {availableViews.map((view) => {
            const Icon = view.icon
            return (
              <Button
                key={view.id}
                variant={activeView === view.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange(view.id)}
                className="h-7 px-2"
              >
                <Icon className="w-3 h-3 mr-1" />
                <span className="text-xs">{view.label}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

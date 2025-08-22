"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Hash, User, Users, MessageSquare } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SpaceMember {
  id: string
  name: string
  email: string
  avatar: string
  status: "online" | "away" | "busy" | "offline"
  role: "admin" | "member" | "guest"
}

interface Channel {
  id: string
  name: string
  type: "chat" | "files" | "notes" | "project" | "livekit"
  members: string[] // member IDs
  unreadCount?: number
  lastActivity?: string
  isPrivate?: boolean
}

interface ChannelChooserProps {
  currentSpace: {
    id: string
    name: string
    members: SpaceMember[]
  }
  channels: Channel[]
  selectedChannel: Channel | null
  onSelectChannel: (channel: Channel) => void
  onCreatePM: (memberId: string) => void
  onCreateGroupChat: (memberIds: string[]) => void
  onCreateChannel?: (name: string, type: string, description?: string) => void
  className?: string
}

export function ChannelChooser({ 
  currentSpace, 
  channels, 
  selectedChannel, 
  onSelectChannel, 
  onCreatePM,
  onCreateGroupChat,
  onCreateChannel,
  className = "" 
}: ChannelChooserProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelType, setNewChannelType] = useState("chat")
  const [newChannelDescription, setNewChannelDescription] = useState("")

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredMembers = currentSpace.members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'chat': return <MessageSquare className="w-4 h-4" />
      case 'files': return <Hash className="w-4 h-4" />
      case 'notes': return <Hash className="w-4 h-4" />
      case 'project': return <Hash className="w-4 h-4" />
      case 'livekit': return <Hash className="w-4 h-4" />
      default: return <Hash className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const handleMemberClick = (member: SpaceMember) => {
    // Create PM channel dynamically (Teams behavior)
    onCreatePM(member.id)
  }

  const handleCreateGroupChat = () => {
    if (selectedMembers.length > 0) {
      onCreateGroupChat(selectedMembers)
      setSelectedMembers([])
    }
  }

  const handleCreateChannel = () => {
    if (newChannelName.trim() && onCreateChannel) {
      onCreateChannel(newChannelName.trim(), newChannelType, newChannelDescription.trim() || undefined)
      setIsCreateDialogOpen(false)
      setNewChannelName("")
      setNewChannelType("chat")
      setNewChannelDescription("")
    }
  }

  return (
    <div className={`w-80 border-r bg-background flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">{currentSpace.name}</h2>
            <p className="text-xs text-muted-foreground">{currentSpace.members.length} members</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Channel</DialogTitle>
                <DialogDescription>
                  Create a new channel for your space. Channels help organize conversations by topic.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="channelName">Channel Name</Label>
                  <Input
                    id="channelName"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="e.g., marketing, development, general"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="channelType">Channel Type</Label>
                  <Select value={newChannelType} onValueChange={setNewChannelType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chat">💬 Chat</SelectItem>
                      <SelectItem value="files">📁 Files</SelectItem>
                      <SelectItem value="notes">📝 Notes</SelectItem>
                      <SelectItem value="project">📋 Project</SelectItem>
                      <SelectItem value="livekit">🎥 Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="channelDescription">Description (Optional)</Label>
                  <Textarea
                    id="channelDescription"
                    value={newChannelDescription}
                    onChange={(e) => setNewChannelDescription(e.target.value)}
                    placeholder="What's this channel for?"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateChannel} disabled={!newChannelName.trim()}>
                  Create Channel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search channels & members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Channels Section */}
        <div className="p-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Channels
          </h3>
          <div className="space-y-1">
            {filteredChannels.map((channel, index) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onSelectChannel(channel)}
                className={`
                  flex items-center gap-2 p-2 rounded cursor-pointer transition-colors
                  ${selectedChannel?.id === channel.id 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted/50'
                  }
                `}
              >
                {getChannelIcon(channel.type)}
                <span className="flex-1 text-sm font-medium">{channel.name}</span>
                {channel.unreadCount && channel.unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                    {channel.unreadCount}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {channel.type}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Direct Messages Section */}
        <div className="p-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Direct Messages
          </h3>
          <div className="space-y-1">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleMemberClick(member)}
                className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 border border-background rounded-full ${getStatusColor(member.status)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Group Chat Creation */}
        {selectedMembers.length > 0 && (
          <div className="p-3 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">
                Create Group ({selectedMembers.length} selected)
              </span>
              <Button size="sm" onClick={handleCreateGroupChat}>
                <Users className="w-3 h-3 mr-1" />
                Create
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export type { SpaceMember, Channel }


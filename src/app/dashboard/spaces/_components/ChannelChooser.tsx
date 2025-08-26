"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
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
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Search, 
  Plus, 
  Hash, 
  MessageCircle, 
  FolderOpen, 
  StickyNote, 
  Video,
  User,
  Users,
  Settings,
  Lock,
  Globe,
  Circle,
  ChevronDown,
  Check,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

export interface Channel {
  id: string
  name: string
  type: "chat" | "project" | "files" | "notes" | "livekit" | "pm"
  members: string[]
  unreadCount?: number
  lastActivity?: string
  isPrivate?: boolean
  isSystem?: boolean
  isVirtual?: boolean
  description?: string
  tenantId?: string
  actualChannelName?: string // For PM channels, stores the real channel name for API calls
}

export interface SpaceMember {
  id: string
  name: string
  email: string
  avatar: string
  status: "online" | "offline" | "away" | "busy"
  role: "admin" | "member" | "guest"
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
  onCreateChannel: (name: string, type: string, description?: string) => void
  layout?: "sidebar" | "combobox"
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
  layout = "sidebar",
  className = ""
}: ChannelChooserProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isDMCollapsed, setIsDMCollapsed] = useState(false)
  const [realChannels, setRealChannels] = useState<Channel[]>([])
  const [spaceMembers, setSpaceMembers] = useState<SpaceMember[]>([])
  const [newChannel, setNewChannel] = useState({
    name: "",
    description: "",
    type: "chat" as const,
    isPrivate: false
  })

  // Load channels and space members on mount
  useEffect(() => {
    if (currentSpace?.id) {
      loadSpaceData()
    }
  }, [currentSpace?.id])

  // Debug: Log assembled channels
  useEffect(() => {
    const channels = assembleChannels()
    console.log('🔍 ChannelChooser assembled channels:', channels)
    console.log('🔍 Real channels from API:', realChannels)
  }, [realChannels, currentSpace])

  const loadSpaceData = async () => {
    setIsLoading(true)
    try {
      // Load channels and members in parallel
      const [channelsResponse, membersResponse] = await Promise.all([
        fetch(`/api/spaces/${currentSpace.id}/channels`),
        fetch(`/api/spaces/${currentSpace.id}/members`)
      ])

      if (channelsResponse.ok) {
        const channelsData = await channelsResponse.json()
        setRealChannels(channelsData.docs || [])
      } else {
        console.warn('Failed to load channels, using fallback')
        // Use fallback channels
        setRealChannels([])
      }

      if (membersResponse.ok) {
        const membersData = await membersResponse.json()
        setSpaceMembers(membersData.docs || [])
      } else {
        console.warn('Failed to load space members, using fallback')
        // Use the members from currentSpace as fallback, but filter out mock data
        const realMembers = currentSpace.members.filter(member => 
          member.id !== 'ahmed' && member.id !== 'fifth-element' // Remove mock users
        )
        setSpaceMembers(realMembers)
      }
    } catch (error) {
      console.error('Failed to load space data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to assemble complete channels list
  const assembleChannels = (): Channel[] => {
    const currentUserId = '1' // TODO: Get from auth context
    
    // Only create virtual channels if no real channels exist
    const defaultChannels: Channel[] = realChannels.length === 0 ? [
      {
        id: 'main',
        name: 'main',
        type: 'chat',
        members: currentSpace.members.map(m => m.id),
        isSystem: true,
        isVirtual: true, // Mark as virtual so we know it's not a real channel
        description: 'Main discussion channel (virtual)',
        tenantId: currentSpace.id
      }
    ] : []

    // Process real channels and transform PM channels for display
    const processedRealChannels = realChannels.map(channel => {
      if (channel.type === 'pm' && channel.members && channel.members.length === 2) {
        // For PM channels, display the other user's name
        const otherUserId = channel.members.find(id => id !== currentUserId)
        const otherUser = currentSpace.members.find(m => m.id === otherUserId)
        
        if (otherUser) {
          return {
            ...channel,
            name: otherUser.name, // Display other user's name
            description: `Private conversation with ${otherUser.name}`,
            actualChannelName: channel.name // Store original channel name for API calls
          }
        }
      }
      return channel
    })

    // Combine default channels with real channels, avoiding duplicates
    const realChannelNames = processedRealChannels.map(c => c.name.toLowerCase())
    const filteredDefaults = defaultChannels.filter(dc => 
      !realChannelNames.includes(dc.name.toLowerCase())
    )

    return [...filteredDefaults, ...processedRealChannels]
  }

  const allChannels = assembleChannels()
  
  // Separate regular channels from PM channels
  const regularChannels = allChannels.filter(channel => channel.type !== 'pm')
  const pmChannels = allChannels.filter(channel => channel.type === 'pm')
  
  const filteredRegularChannels = regularChannels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const filteredPmChannels = pmChannels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "chat": return Hash
      case "project": return FolderOpen
      case "files": return FolderOpen
      case "notes": return StickyNote
      case "livekit": return Video
      case "pm": return MessageCircle
      default: return Hash
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500"
      case "away": return "bg-yellow-500"
      case "busy": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const handleCreateChannel = async () => {
    if (!newChannel.name.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/spaces/${currentSpace.id}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newChannel.name.trim(),
          description: newChannel.description.trim(),
          type: newChannel.type,
          isPrivate: newChannel.isPrivate,
          members: currentSpace.members.map(m => m.id), // Default to all space members
          createdBy: '1' // TODO: Get from auth context
        })
      })

      if (response.ok) {
        const createdChannel = await response.json()
        setRealChannels(prev => [...prev, createdChannel])
        onCreateChannel(createdChannel.name, createdChannel.type, createdChannel.description)
        setShowCreateModal(false)
        setNewChannel({ name: "", description: "", type: "chat", isPrivate: false })
      } else {
        console.error('Failed to create channel:', await response.text())
        alert('Failed to create channel. Please try again.')
      }
    } catch (error) {
      console.error('Error creating channel:', error)
      alert('Failed to create channel. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUserChannel = async (memberId: string) => {
    const member = currentSpace.members.find(m => m.id === memberId)
    if (!member) return

    try {
      // Create or get PM channel between current user and selected member
      const currentUserId = '1' // TODO: Get from auth context
      const channelName = `pm_${[currentUserId, memberId].sort().join('_')}` // Consistent naming
      
      const response = await fetch(`/api/channels/find-or-create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: channelName,
          channelType: 'communication', // Use valid channelType
          reportType: 'general', // Use valid reportType
          tenantId: currentSpace.id,
          guardianAngelId: currentUserId,
          members: [currentUserId, memberId],
          isPrivate: true,
          metadata: {
            pmBetween: [currentUserId, memberId].sort(),
            displayName: member.name // Store the display name for the current user
          }
        })
      })

      if (response.ok) {
        const pmChannel = await response.json()
        
        // Create UI channel object with the other user's name as display name
        const uiChannel: Channel = {
          id: pmChannel.id.toString(),
          name: member.name, // Display other user's name
          type: 'pm',
          members: [currentUserId, memberId],
          isPrivate: true,
          isVirtual: false,
          tenantId: currentSpace.id,
          description: `Private conversation with ${member.name}`,
          // Store the actual channel name for API calls
          actualChannelName: channelName
        }
        
        onSelectChannel(uiChannel)
      } else {
        console.error('Failed to create PM channel:', await response.text())
      }
    } catch (error) {
      console.error('Error creating PM channel:', error)
    }
  }

  // ComboBox Layout (Horizontal)
  if (layout === "combobox") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative">
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[300px] justify-between"
            onClick={() => setOpen(!open)}
          >
            {selectedChannel ? (
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = getChannelIcon(selectedChannel.type)
                  return <Icon className="h-4 w-4" />
                })()}
                <span>{selectedChannel.name}</span>
                {selectedChannel.isPrivate && <Lock className="h-3 w-3" />}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                <span>Select channel...</span>
              </div>
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
          
          {open && (
            <div className="absolute top-full left-0 z-50 w-[300px] mt-1 bg-popover border rounded-md shadow-md">
              <Command>
                <CommandInput placeholder="Search channels..." />
                <CommandList>
                  <CommandEmpty>No channels found.</CommandEmpty>
                                  <CommandGroup heading="Channels">
                  {filteredRegularChannels.map((channel) => {
                      const Icon = getChannelIcon(channel.type)
                      return (
                        <CommandItem
                          key={channel.id}
                          value={channel.name}
                          onSelect={() => {
                            onSelectChannel(channel)
                            setOpen(false)
                          }}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          <span>{channel.name}</span>
                          {channel.isPrivate && <Lock className="ml-auto h-3 w-3" />}
                          {selectedChannel?.id === channel.id && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                                  <CommandGroup heading="Direct Messages">
                  {/* Show AI Agents first */}
                  <CommandItem
                    key="leo-ai"
                    value="LEO AI"
                    onSelect={() => {
                      const leoChannel: Channel = {
                        id: 'leo-ai',
                        name: 'LEO AI',
                        type: 'pm',
                        members: ['1', 'leo'], // Current user + LEO
                        isPrivate: true,
                        isVirtual: true,
                        description: 'Direct conversation with LEO AI Assistant',
                        tenantId: currentSpace.id
                      }
                      onSelectChannel(leoChannel)
                      setOpen(false)
                    }}
                  >
                    <div className="mr-2 h-4 w-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">L</span>
                    </div>
                    <span>LEO AI</span>
                    <Badge variant="outline" className="ml-auto text-xs bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 border-orange-200">
                      AI Agent
                    </Badge>
                    {selectedChannel?.id === 'leo-ai' && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                  
                  {/* Show existing PM channels */}
                  {filteredPmChannels.map((channel) => (
                    <CommandItem
                      key={channel.id}
                      value={channel.name}
                      onSelect={() => {
                        onSelectChannel(channel)
                        setOpen(false)
                      }}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>{channel.name}</span>
                      {selectedChannel?.id === channel.id && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                  
                  {/* Show members without PM channels */}
                  {currentSpace.members
                    .filter(member => {
                      const currentUserId = '1'
                      return member.id !== currentUserId && 
                        member.name !== 'LEO AI' && // Exclude LEO AI from regular members
                        !pmChannels.some(pm => pm.members?.includes(member.id))
                    })
                    .map((member) => (
                      <CommandItem
                        key={member.id}
                        value={member.name}
                        onSelect={() => {
                          handleCreateUserChannel(member.id)
                          setOpen(false)
                        }}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        <span>{member.name}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {member.role}
                        </Badge>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          )}
        </div>
        
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  // Sidebar Layout (Vertical) - Default
  return (
    <div className={`${isCollapsed ? 'w-12' : 'w-80'} border-r bg-background flex flex-col transition-all duration-300 relative z-20 ${className}`}>
      {/* Space Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-primary font-semibold">
                {currentSpace.name.charAt(0)}
              </span>
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-semibold">{currentSpace.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {currentSpace.members.length} members
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent p-0"
          >
            <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronLeft className="h-3 w-3" />
            </motion.div>
          </Button>
        </div>
        
        {!isCollapsed && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search channels & members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        {isCollapsed ? (
          // Collapsed view - show only icons
          <div className="p-2 space-y-2">
            {filteredRegularChannels.slice(0, 5).map((channel) => {
              const Icon = getChannelIcon(channel.type)
              return (
                <Button
                  key={channel.id}
                  variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => onSelectChannel(channel)}
                  title={channel.name}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              )
            })}
            <div className="border-t pt-2 mt-2">
              {filteredPmChannels.slice(0, 3).map((channel) => (
                <Button
                  key={channel.id}
                  variant={selectedChannel?.id === channel.id ? "secondary" : "ghost"}
                  size="sm"
                  className="w-8 h-8 p-0 mb-1"
                  onClick={() => onSelectChannel(channel)}
                  title={channel.name}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
        ) : (
          // Expanded view - show full content
          <div className="p-4">
          {/* Channels Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">CHANNELS</h3>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 w-6 p-0"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-1">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              ) : (
                filteredRegularChannels.map((channel) => {
                  const Icon = getChannelIcon(channel.type)
                  return (
                    <motion.button
                      key={channel.id}
                      onClick={() => onSelectChannel(channel)}
                      className={`
                        w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent
                        ${selectedChannel?.id === channel.id 
                          ? 'bg-accent text-accent-foreground' 
                          : 'text-muted-foreground'
                        }
                      `}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1 text-left">{channel.name}</span>
                      {channel.isSystem && <Badge variant="outline" className="text-xs">system</Badge>}
                      {channel.isPrivate && <Lock className="h-3 w-3" />}
                      {channel.unreadCount && channel.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                          {channel.unreadCount}
                        </Badge>
                      )}
                    </motion.button>
                  )
                })
              )}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => setIsDMCollapsed(!isDMCollapsed)}
                >
                  <ChevronRight className={`h-3 w-3 transition-transform ${isDMCollapsed ? '' : 'rotate-90'}`} />
                </Button>
                <h3 className="text-sm font-medium text-muted-foreground">DIRECT MESSAGES</h3>
              </div>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {!isDMCollapsed && (
              <div className="space-y-1">
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                        <Skeleton className="h-6 w-6 rounded-full" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Show AI Agents first */}
                    <motion.button
                      key="leo-ai"
                      onClick={() => {
                        const leoChannel: Channel = {
                          id: 'leo-ai',
                          name: 'LEO AI',
                          type: 'pm',
                          members: ['1', 'leo'], // Current user + LEO
                          isPrivate: true,
                          isVirtual: true,
                          description: 'Direct conversation with LEO AI Assistant',
                          tenantId: currentSpace.id
                        }
                        onSelectChannel(leoChannel)
                      }}
                      className={`
                        w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent
                        ${selectedChannel?.id === 'leo-ai' 
                          ? 'bg-accent text-accent-foreground' 
                          : 'text-muted-foreground'
                        }
                      `}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="h-4 w-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">L</span>
                      </div>
                      <span className="flex-1 text-left">LEO AI</span>
                      <Badge variant="outline" className="text-xs bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-600 border-orange-200">
                        AI
                      </Badge>
                    </motion.button>
                    
                    {/* Show existing PM channels */}
                    {filteredPmChannels.map((channel) => (
                  <motion.button
                    key={channel.id}
                    onClick={() => onSelectChannel(channel)}
                    className={`
                      w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent
                      ${selectedChannel?.id === channel.id 
                        ? 'bg-accent text-accent-foreground' 
                        : 'text-muted-foreground'
                      }
                    `}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="flex-1 text-left">{channel.name}</span>
                    {channel.unreadCount && channel.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                        {channel.unreadCount}
                      </Badge>
                    )}
                  </motion.button>
                ))}
                
                {/* Show members who don't have PM channels yet */}
                {(spaceMembers.length > 0 ? spaceMembers : currentSpace.members)
                  .filter(member => {
                    // Only show members who don't already have PM channels
                    const currentUserId = '1' // TODO: Get from auth context
                    return member.id !== currentUserId && 
                      member.name !== 'LEO AI' && // Exclude LEO AI from regular members
                      !pmChannels.some(pm => pm.members?.includes(member.id))
                  })
                  .map((member) => (
                    <motion.button
                      key={member.id}
                      onClick={() => handleCreateUserChannel(member.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-accent text-muted-foreground"
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="relative">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="text-xs">
                            {member.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div 
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
                          aria-label={`${member.name} is ${member.status}`}
                          title={`${member.name} is ${member.status}`}
                        />
                      </div>
                      <span className="flex-1 text-left">{member.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {member.role}
                      </Badge>
                    </motion.button>
                  ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        )}
      </ScrollArea>

      {/* Create Channel Modal - Calendar Style */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[425px] bg-background border-border">
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
            <DialogDescription>
              Create a new channel for your space. All space members will have access by default.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="channel-name">Channel Name</Label>
              <Input
                id="channel-name"
                value={newChannel.name}
                onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. project-alpha, marketing-team"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="channel-description">Description</Label>
              <Textarea
                id="channel-description"
                value={newChannel.description}
                onChange={(e) => setNewChannel(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What is this channel for?"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="channel-type">Channel Type</Label>
              <Select
                value={newChannel.type}
                onValueChange={(value: any) => setNewChannel(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select channel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />
                      Chat - General discussion
                    </div>
                  </SelectItem>
                  <SelectItem value="project">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      Project - Task management
                    </div>
                  </SelectItem>
                  <SelectItem value="files">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4" />
                      Files - Document sharing
                    </div>
                  </SelectItem>
                  <SelectItem value="notes">
                    <div className="flex items-center gap-2">
                      <StickyNote className="h-4 w-4" />
                      Notes - Knowledge base
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="private-channel"
                checked={newChannel.isPrivate}
                onCheckedChange={(checked) => setNewChannel(prev => ({ ...prev, isPrivate: !!checked }))}
              />
              <Label htmlFor="private-channel" className="text-sm">
                Private channel (invite only)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateChannel} disabled={!newChannel.name.trim() || isLoading}>
              {isLoading ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


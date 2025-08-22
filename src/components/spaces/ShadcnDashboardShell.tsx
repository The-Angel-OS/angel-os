'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Bell, Settings, User, LogOut, Menu, X,
  MessageSquare, Calendar, FileText, Users, BarChart3,
  FolderOpen, CreditCard, Zap, Home, Hash, ChevronDown,
  Bot, Mic, Video, Phone
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import type { Space, User as PayloadUser } from '@/payload-types'

interface Channel {
  id: string
  name: string
  type: 'chat' | 'notes' | 'calendar' | 'crm' | 'analytics' | 'files' | 'dashboard'
  displayMode: 'messages' | 'notes' | 'cards' | 'grid' | 'calendar'
  liveKitEnabled: boolean
  unreadCount?: number
  isActive?: boolean
}

interface ShadcnDashboardShellProps {
  spaces: Space[]
  activeSpace: Space | null
  activeChannel: Channel | null
  currentUser: PayloadUser
  children: React.ReactNode
  onSpaceSelect?: (space: Space) => void
  onChannelSelect?: (channel: Channel) => void
  className?: string
}

const channelIcons = {
  chat: MessageSquare,
  notes: FileText,
  calendar: Calendar,
  crm: Users,
  analytics: BarChart3,
  files: FolderOpen,
  dashboard: Home
}

const defaultChannels: Channel[] = [
  { id: 'general', name: 'general', type: 'chat', displayMode: 'messages', liveKitEnabled: true, unreadCount: 3 },
  { id: 'announcements', name: 'announcements', type: 'chat', displayMode: 'messages', liveKitEnabled: false },
  { id: 'project-notes', name: 'project-notes', type: 'notes', displayMode: 'notes', liveKitEnabled: false },
  { id: 'team-calendar', name: 'team-calendar', type: 'calendar', displayMode: 'calendar', liveKitEnabled: false },
  { id: 'customer-pipeline', name: 'customer-pipeline', type: 'crm', displayMode: 'cards', liveKitEnabled: false },
  { id: 'business-analytics', name: 'business-analytics', type: 'analytics', displayMode: 'grid', liveKitEnabled: false },
  { id: 'shared-files', name: 'shared-files', type: 'files', displayMode: 'grid', liveKitEnabled: false },
  { id: 'dashboard', name: 'dashboard', type: 'dashboard', displayMode: 'cards', liveKitEnabled: false }
]

export function ShadcnDashboardShell({
  spaces,
  activeSpace,
  activeChannel,
  currentUser,
  children,
  onSpaceSelect,
  onChannelSelect,
  className
}: ShadcnDashboardShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLeoChat, setShowLeoChat] = useState(false)

  // Filter channels based on search
  const filteredChannels = defaultChannels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleChannelClick = (channel: Channel) => {
    onChannelSelect?.(channel)
    // Update URL without page refresh
    const newUrl = `/spaces/${activeSpace?.id}/${channel.id}`
    window.history.pushState({}, '', newUrl)
  }

  const handleLogout = () => {
    window.location.href = '/api/auth/logout'
  }

  return (
    <div className={cn("h-screen bg-background flex", className)}>
      {/* Sidebar */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 border-r bg-muted/30 flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">AO</span>
                  </div>
                  <span className="font-semibold text-sm">Angel OS</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(true)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Space Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="truncate">
                      {activeSpace?.name || 'Select Space'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[240px]">
                  {spaces.map((space) => (
                    <DropdownMenuItem
                      key={space.id}
                      onClick={() => onSpaceSelect?.(space)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {space.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span>{space.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Channels */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Channels
                </h3>
                <div className="space-y-1">
                  {filteredChannels.map((channel) => {
                    const Icon = channelIcons[channel.type]
                    const isActive = activeChannel?.id === channel.id
                    
                    return (
                      <motion.button
                        key={channel.id}
                        whileHover={{ x: 2 }}
                        onClick={() => handleChannelClick(channel)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                          isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        )}
                      >
                        <Hash className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 truncate text-sm">
                          {channel.name}
                        </span>
                        {channel.liveKitEnabled && (
                          <div className="flex items-center gap-1">
                            <Mic className="h-3 w-3" />
                            <Video className="h-3 w-3" />
                          </div>
                        )}
                        {channel.unreadCount && (
                          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                            {channel.unreadCount}
                          </Badge>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={
                        currentUser.profileImage && typeof currentUser.profileImage === 'object'
                          ? currentUser.profileImage.url || undefined
                          : undefined
                      } />
                      <AvatarFallback>
                        {currentUser.firstName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-2 flex-1 text-left">
                      <p className="text-sm font-medium">
                        {currentUser.firstName && currentUser.lastName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser.email || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentUser.email}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4">
          <div className="flex items-center gap-4 flex-1">
            {sidebarCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(false)}
                className="h-8 w-8 p-0"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{activeSpace?.name}</span>
              {activeChannel && (
                <>
                  <span>/</span>
                  <span className="font-medium text-foreground">
                    #{activeChannel.name}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* LiveKit Controls (if channel supports it) */}
            {activeChannel?.liveKitEnabled && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Video className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-4 mx-2" />
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowLeoChat(!showLeoChat)}
            >
              <Bot className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bell className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex min-h-0">
          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            {children}
          </div>

          {/* Leo Chat Sidebar */}
          <AnimatePresence>
            {showLeoChat && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 border-l bg-muted/30"
              >
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            L
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-sm">Leo AI</h3>
                          <p className="text-xs text-muted-foreground">AI Assistant</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowLeoChat(false)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 p-4">
                    <p className="text-sm text-muted-foreground">
                      Leo AI chat will be implemented here with the reusable ChatControl component.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

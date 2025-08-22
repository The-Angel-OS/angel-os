"use client"

import { Search, Bell, Settings, Moon, Sun, Bot, Mic, Video, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./ThemeToggle"

interface AngelOSHeaderProps {
  onLeoToggle?: () => void
}

export function AngelOSHeader({ onLeoToggle }: AngelOSHeaderProps) {
  const pathname = usePathname()

  // Extract space and channel info from pathname
  const pathParts = pathname.split('/')
  const spaceName = pathParts[2] || 'default'
  const channelName = pathParts[3] || 'general'

  // Check if current channel supports LiveKit
  const liveKitChannels = ['general', 'leo-chat']
  const supportsLiveKit = liveKitChannels.includes(channelName)

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
      {/* Left side - Breadcrumb and search */}
      <div className="flex items-center gap-4 flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{spaceName}</span>
          <span>/</span>
          <span className="font-medium text-foreground">#{channelName}</span>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search channels and messages..." 
            className="pl-10 pr-4" 
          />
          <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-2">
        {/* LiveKit Controls (if channel supports it) */}
        {supportsLiveKit && (
          <>
            <Button variant="ghost" size="sm" title="Start Voice Call">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Start Video Call">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Toggle Microphone">
              <Mic className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-4 mx-2" />
          </>
        )}

        {/* Leo AI Toggle */}
        <Button 
          variant="ghost" 
          size="sm" 
          title="Toggle Leo AI Assistant"
          onClick={onLeoToggle}
        >
          <Bot className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative" title="Notifications">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            3
          </Badge>
        </Button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Settings */}
        <Button variant="ghost" size="sm" title="Settings">
          <Settings className="h-4 w-4" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback>KC</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Kenneth Consort</p>
                <p className="text-xs leading-none text-muted-foreground">Consort of the Fifth Element</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              Space Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = '/api/auth/logout'}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
